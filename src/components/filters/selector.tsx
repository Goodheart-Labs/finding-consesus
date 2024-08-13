"use client";

import { useFilter } from "@/app/(frontend)/questions/[slug]/filters";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "../ui/select";
import { useCallback } from "react";
import { Filter } from "@/db/schema";
import { cn } from "@/lib/utils";

export const FilterSelector = ({ filters, className }: { filters: Filter[]; className?: string }) => {
  const { setFilter } = useFilter();

  const onValueChange = useCallback(
    (val: string) => {
      if (val === "0") {
        return setFilter([]);
      }

      setFilter([Number(val)]);
    },
    [setFilter],
  );

  return (
    <Select onValueChange={onValueChange} defaultValue="0">
      <SelectTrigger
        className={cn(
          "w-full rounded-none m-0 border-none py-8 dark:bg-white dark:focus:ring-0 dark:ring-0 ring-offset-0 dark:ring-offset-0 dark:focus:ring-offset-0 sm:w-auto sm:min-w-72 sm:rounded-lg sm:dark:bg-[#E5E9ED]",
          className,
        )}
      >
        <div className="flex flex-col items-start w-full px-1">
          <div className="text-xs text-slate-600 sm:text-slate-400">Filter</div>
          <SelectValue placeholder="Filter by" className="focus:ring-0 dark:focus:ring-0 dark:ring-0" />
        </div>
      </SelectTrigger>
      <SelectContent className={cn("w-full rounded-none m-0 border-none dark:bg-white dark:text-slate-800")}>
        <SelectItem value="0" className="dark:focus:bg-slate-50 dark:focus:text-slate-900">
          <span className="text-text-lighter">All responses</span>
        </SelectItem>

        <SelectSeparator className="dark:bg-slate-100" />

        {filters.map((filter) => (
          <SelectItem
            key={filter.id}
            value={String(filter.id)}
            className="dark:focus:bg-slate-50 dark:focus:text-slate-900"
          >
            {filter.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
