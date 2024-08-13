"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Question, questionTypeSchema } from "@/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import slugify from "slugify";
import { useEffect, useTransition } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createQuestion } from "../api/questions/createQuestion";
import { updateQuestion } from "../api/questions/updateQuestion";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { questionTypeIcon } from "@/lib/questionType";

const formSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  type: questionTypeSchema,
  visibility: z.enum(["public", "private"]),
  context: z.string(),
});

export const QuestionForm = ({ onClose, question }: { onClose: () => void; question?: Question }) => {
  const [isPending, startTransition] = useTransition();
  // Whether we're updating an existing question
  const isUpdate = Boolean(question);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: question?.title ?? "",
      slug: question?.slug ?? "",
      type: question?.type ?? "percentage",
      visibility: question?.visibility ?? "public",
      context: question?.context ?? "",
    },
  });

  const title = form.watch("title");
  useEffect(() => {
    if (question) return;
    if (form.formState.dirtyFields.slug) return;
    if (!title) return;
    form.setValue("slug", slugify(title, { lower: true, strict: true }));
  }, [form, question, title]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!question) {
      await startTransition(() => createQuestion(values));
    } else {
      await startTransition(() => updateQuestion(question.id, values));
    }
    onClose();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormDescription>The title of the question.</FormDescription>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Will Labour win the next general election?"
                  autoComplete="off"
                  autoFocus
                  data-1p-ignore
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormDescription>The slug used in the URL.</FormDescription>
              <FormControl>
                <Input {...field} placeholder="is-ai-dangerous" autoComplete="off" data-1p-ignore />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          // Disable the field if we're updating an existing question
          render={({ field }) => {
            const PercentIcon = questionTypeIcon["percentage"];
            const DescriptiveIcon = questionTypeIcon["descriptive"];
            const DateIcon = questionTypeIcon["date"];
            return (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormDescription className="mb-3">The question&apos;s type.</FormDescription>
                <FormControl>
                  <RadioGroup className="grid gap-3" {...field} onValueChange={field.onChange}>
                    <div className="flex items-center gap-4">
                      <RadioGroupItem disabled={isUpdate} value="percentage" id="percentage" />
                      <Label
                        htmlFor="percentage"
                        className="flex items-center gap-2 opacity-50 peer-aria-checked:opacity-100"
                      >
                        <PercentIcon className="w-4 h-4" />
                        Percentage
                      </Label>
                    </div>
                    <div className="flex items-center gap-4">
                      <RadioGroupItem disabled={isUpdate} value="descriptive" id="descriptive" />
                      <Label
                        htmlFor="descriptive"
                        className="flex items-center gap-2 opacity-50 peer-aria-checked:opacity-100"
                      >
                        <DescriptiveIcon className="w-4 h-4" />
                        Descriptive
                      </Label>
                    </div>
                    <div className="flex items-center gap-4">
                      <RadioGroupItem disabled={isUpdate} value="date" id="date" />
                      <Label
                        htmlFor="date"
                        className="flex items-center gap-2 opacity-50 peer-aria-checked:opacity-100"
                      >
                        <DateIcon className="w-4 h-4" />
                        Date
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>

                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visibility</FormLabel>
              <FormDescription>If set to private, it won&apos;t appear on the frontend.</FormDescription>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="context"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Context</FormLabel>
              <FormDescription>Context for the question, supports markdown.</FormDescription>
              <FormControl>
                <Textarea {...field} rows={5} placeholder="Context" autoComplete="off" data-1p-ignore />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isLoading || !form.formState.isValid || isPending}>
          Submit
        </Button>
      </form>
    </Form>
  );
};
