"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Question, Respondent, Response } from "@/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useMemo, useTransition } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import dayjs from "dayjs";
import { createResponse } from "@/app/(admin)/api/responses/createResponse";
import { updateResponse } from "@/app/(admin)/api/responses/updateResponse";
import { InputWithRenderer } from "@/components/ui/inputWithRenderer";
import { QuestionType } from "kysely-codegen";

export const ResponseForm = ({
  onClose,
  question,
  response,
  respondents = [],
}: {
  onClose: () => void;
  question: Question;
  response?: Response;
  respondents: Respondent[];
}) => {
  const [isPending, startTransition] = useTransition();
  const schema = useMemo(() => getSchema(question.type), [question.type]);

  const form = useForm<z.infer<typeof schema>>({
    mode: "onChange",
    resolver: zodResolver(schema),
    defaultValues: {
      respondent_id: response?.respondent_id,
      type: response?.type ?? "clearly_stated",
      value: response?.value ?? 0,
      response_date: response?.response_date ?? undefined,
      quote: response?.quote ?? undefined,
      source_url: response?.source_url ?? undefined,
      source_title: response?.source_title ?? undefined,
      source_date: response?.source_date ?? undefined,
      visibility: response?.visibility ?? "public",
    },
  });

  async function onSubmit({ source_date, ...values }: z.infer<typeof schema>) {
    if (!response) {
      startTransition(() =>
        createResponse({
          question_id: question.id,
          source_date: dayjs(source_date).toDate(),
          ...values,
        }),
      );
    } else {
      startTransition(() => updateResponse(response.id, { ...values, source_date: dayjs(source_date).toDate() }));
    }
    onClose();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <fieldset className="space-y-4">
          <h4 className="mt-8 font-semibold text-gray-900">Person</h4>

          <FormField
            control={form.control}
            name="respondent_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Respondent</FormLabel>
                <FormDescription>Select the respondent</FormDescription>
                <FormControl>
                  <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Respondent" />
                    </SelectTrigger>
                    <SelectContent>
                      {respondents.map((respondent) => (
                        <SelectItem key={respondent.id} value={String(respondent.id)}>
                          {respondent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>

        <fieldset className="space-y-4">
          <h4 className="mt-8 font-semibold text-gray-900">Opinion</h4>

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confidence of Quote</FormLabel>
                <FormDescription>What sort of opinion is it?</FormDescription>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Confidence of Quote" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clearly_stated">Clearly Stated</SelectItem>
                      <SelectItem value="related">Related</SelectItem>
                      <SelectItem value="editors_estimate">Editor&apos;s Estimate</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {question.type === "date" ? (
            <FormField
              control={form.control}
              name="response_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prediction Date</FormLabel>
                  <FormDescription>
                    What is the date expressed in the quote? Enter the date in the format YYYY-MM-DD.
                  </FormDescription>
                  <FormControl>
                    <Input
                      onChange={(e) => field.onChange(dayjs(e.target.value).toDate())}
                      defaultValue={field.value ? dayjs(field.value).format("YYYY-MM-DD") : ""}
                      placeholder="YYYY-MM-DD"
                      pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
                      autoComplete="off"
                      data-1p-ignore
                    />
                  </FormControl>
                  {field.value && (
                    <FormDescription className="mt-2 italic">
                      Parsed date: {dayjs(field.value).format("YYYY-MM-DD")}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormDescription>The % value of the estimate.</FormDescription>
                  <FormControl>
                    <div className="flex items-center">
                      <div className="w-full">
                        <Slider
                          min={0}
                          max={100}
                          step={1}
                          value={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                        />
                      </div>
                      <div className="w-[76px] ml-2">
                        <InputWithRenderer
                          value={field.value}
                          renderValue={(v, isFocussed) => (isFocussed ? `${v}` : `${v}%`)}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="quote"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quote</FormLabel>
                <FormDescription>A supporting quote (optional)</FormDescription>
                <FormControl>
                  <Textarea {...field} rows={5} placeholder="Quote" autoComplete="off" data-1p-ignore />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>

        <fieldset className="space-y-4">
          <h4 className="font-semibold text-gray-900">Source</h4>

          <FormField
            control={form.control}
            name="source_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL</FormLabel>
                <FormDescription>A URL to the quote source (optional)</FormDescription>
                <FormControl>
                  <Input
                    onChange={field.onChange}
                    defaultValue={field.value ?? undefined}
                    placeholder="https://www.example.com"
                    autoComplete="off"
                    data-1p-ignore
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="source_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormDescription>How should the source appear? (optional)</FormDescription>
                <FormControl>
                  <Input
                    onChange={field.onChange}
                    defaultValue={field.value ?? undefined}
                    placeholder="Example"
                    autoComplete="off"
                    data-1p-ignore
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="source_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormDescription>When was the quote made? (optional)</FormDescription>
                <FormControl>
                  <Input
                    onChange={(e) => field.onChange(dayjs(e.target.value).toDate())}
                    defaultValue={field.value ? dayjs(field.value).format("YYYY-MM-DD") : ""}
                    placeholder="YYYY-MM-DD"
                    pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
                    autoComplete="off"
                    data-1p-ignore
                  />
                </FormControl>
                {field.value && (
                  <FormDescription className="mt-2 italic">
                    Parsed date: {dayjs(field.value).format("YYYY-MM-DD")}
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>

        <fieldset className="space-y-4">
          <h4 className="mt-8 font-semibold text-gray-900">Settings</h4>

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
        </fieldset>

        <Button type="submit" disabled={form.formState.isLoading || !form.formState.isValid || isPending}>
          Submit
        </Button>
      </form>
    </Form>
  );
};

// Get a different form schema based on the question type
function getSchema(questionType: QuestionType) {
  const baseSchema = z.object({
    respondent_id: z.number().int(),
    type: z.enum(["clearly_stated", "related", "editors_estimate"]),
    quote: z.union([z.string().optional(), z.literal("")]),
    source_url: z.union([z.string().url("Please enter a full URL (including https://)").optional(), z.literal("")]),
    source_title: z.union([z.string().optional(), z.literal("")]),
    source_date: z.union([z.date().optional(), z.literal("")]),
    visibility: z.enum(["public", "private"]),
  });

  if (questionType === "date") {
    return baseSchema.merge(z.object({ response_date: z.date() }));
  }

  return baseSchema.merge(z.object({ value: z.number().min(0).max(100) }));
}
