"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Filter } from "@/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { updateFilter } from "../../api/filters/updateFilter";
import { useTransition } from "react";
import { createFilter } from "../../api/filters/createFilter";

const formSchema = z.object({
  name: z.string().min(1),
});

export const FilterForm = ({ onClose, filter }: { onClose: () => void; filter?: Filter }) => {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: filter?.name ?? "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!filter) {
      await startTransition(() => createFilter(values));
    } else {
      await startTransition(() => updateFilter(filter.id, values));
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
                <Input {...field} placeholder="Name" autoComplete="off" autoFocus data-1p-ignore />
              </FormControl>
              <FormDescription>The filter&apos;s public name.</FormDescription>
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
