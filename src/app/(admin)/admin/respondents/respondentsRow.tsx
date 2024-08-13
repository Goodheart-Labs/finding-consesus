import { TableRow, TableCell } from "@/components/ui/table";
import { Filter, Respondent, RespondentFiltersMap } from "@/db/schema";
import { cn } from "@/lib/utils";
import { DeleteRespondentSheet, EditRespondentSheet } from "./respondentsSheets";
import { Badge } from "@/components/ui/badge";

export const RespondentsTableRow = ({
  respondent,
  respondentResponsesCounts,
  filters,
  respondentFiltersMap,
}: {
  respondent: Respondent;
  respondentResponsesCounts: Record<number, number>;
  filters: Filter[];
  respondentFiltersMap: RespondentFiltersMap;
}) => {
  const respondentFilters = (respondentFiltersMap[respondent.id] ?? [])
    .map((filter_id) => filters.find((filter) => filter.id === filter_id))
    .filter((f: Filter | undefined): f is Filter => Boolean(f));

  return (
    <TableRow>
      <TableCell className="w-[12px] pr-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={cn("w-[30px] h-[30px] max-h-[30px] max-w-[30px] rounded-full object-cover")}
          src={respondent.avatar_url ?? "https://pbs.twimg.com/profile_images/804990434455887872/BG0Xh7Oa_400x400.jpg"}
          alt={respondent.name}
        />
      </TableCell>
      <TableCell>{respondent.name}</TableCell>
      <TableCell>{respondent.job_title}</TableCell>
      <TableCell>{respondent.company}</TableCell>
      <TableCell className="flex gap-1 flex-wrap">
        {respondentFilters.map((filter) => (
          <Badge variant="secondary" key={`filter-${filter.id}`} className="mb-2 overflow-ellipsis whitespace-nowrap">
            {filter.name}
          </Badge>
        ))}
      </TableCell>
      <TableCell>
        <EditRespondentSheet respondent={respondent} filters={filters} respondentFiltersMap={respondentFiltersMap} />
      </TableCell>
      <TableCell>
        {(respondentResponsesCounts[respondent.id] ?? 0) === 0 ? (
          <DeleteRespondentSheet respondent={respondent} />
        ) : (
          <span className="text-xs">
            {respondentResponsesCounts[respondent.id] ?? 0} response
            {(respondentResponsesCounts[respondent.id] ?? 0) > 1 ? "s" : ""}
          </span>
        )}
      </TableCell>
    </TableRow>
  );
};
