"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Filter, Respondent, RespondentFiltersMap } from "@/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useTransition } from "react";
import { createRespondent } from "../../api/respondents/createRespondent";
import { updateRespondent } from "../../api/respondents/updateRespondent";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  name: z.string().min(1),
  job_title: z.string().min(1),
  company: z.string().min(1),
  avatar_url: z.string().url(),
  filters: z.array(z.number()),
});

export function RespondentForm({
  onClose,
  respondent,
  filters,
  respondentFiltersMap,
}: {
  onClose: () => void;
  respondent?: Respondent;
  filters: Filter[];
  respondentFiltersMap: RespondentFiltersMap;
}) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: respondent?.name ?? "",
      job_title: respondent?.job_title ?? "",
      company: respondent?.company ?? "",
      avatar_url: respondent?.avatar_url ?? "",
      filters: respondent?.id ? respondentFiltersMap[respondent.id] ?? [] : [],
    },
  });

  async function onSubmit({ ...values }: z.infer<typeof formSchema>) {
    if (!respondent) {
      startTransition(() => createRespondent({ ...values }));
    } else {
      startTransition(() => updateRespondent(respondent.id, { ...values }));
    }
    onClose();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Elon Musk" autoComplete="off" autoFocus data-1p-ignore />
              </FormControl>
              <FormDescription>The respondent&apos;s name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="job_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="CEO" autoComplete="off" data-1p-ignore />
              </FormControl>
              <FormDescription>The respondent&apos;s job title.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Tesla" autoComplete="off" data-1p-ignore />
              </FormControl>
              <FormDescription>The respondent&apos;s company.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="avatar_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar URL</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://www.example.com/avatar.png" autoComplete="off" data-1p-ignore />
              </FormControl>
              <FormDescription>The respondent&apos;s avatar URL.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="filters"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Filters</FormLabel>
              <FormControl>
                <div>
                  {filters.map((filter) => (
                    <FormItem key={`filter-${filter.id}`}>
                      <FormControl className="mr-2">
                        <Checkbox
                          id={`filter-${filter.id}`}
                          value={String(filter.id)}
                          defaultChecked={field.value.includes(filter.id)}
                          onClick={() => {
                            if (field.value.includes(filter.id)) {
                              field.onChange(field.value.filter((value) => value !== filter.id));
                              return;
                            }

                            field.onChange([...field.value, filter.id]);
                          }}
                        />
                      </FormControl>
                      <FormLabel htmlFor={`filter-${filter.id}`}>{filter.name}</FormLabel>
                    </FormItem>
                  ))}
                </div>
              </FormControl>
              <FormDescription>Filters to associate with the respondent.</FormDescription>
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
}
