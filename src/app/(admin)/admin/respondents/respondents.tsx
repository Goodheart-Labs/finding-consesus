import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Filter, Respondent, RespondentFiltersMap } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "lucide-react";
import { RespondentsTableRow } from "./respondentsRow";
import { NewRespondentSheet } from "./respondentsSheets";

export function RespondentsTable({
  respondents,
  respondentResponsesCounts,
  filters,
  respondentFiltersMap,
}: {
  respondents: Respondent[];
  respondentResponsesCounts: Record<number, number>;
  filters: Filter[];
  respondentFiltersMap: RespondentFiltersMap;
}) {
  return (
    <Table>
      <TableCaption>
        <NewRespondentSheet filters={filters} respondentFiltersMap={respondentFiltersMap}>
          <Button>
            <PlusCircleIcon className="w-4 mr-2" /> Add New
          </Button>
        </NewRespondentSheet>
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead></TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Job Title</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Filters</TableHead>
          <TableHead className="w-[min-content]"></TableHead>
          <TableHead className="w-[min-content]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {respondents.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6}>No respondents found</TableCell>
          </TableRow>
        ) : (
          respondents.map((respondent) => (
            <RespondentsTableRow
              key={`respondent-${respondent.id}`}
              respondent={respondent}
              respondentResponsesCounts={respondentResponsesCounts}
              filters={filters}
              respondentFiltersMap={respondentFiltersMap}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
}
