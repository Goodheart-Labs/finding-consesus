import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Question, Respondent, Response } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "lucide-react";
import { ResponsesTableRow } from "./responsesRow";
import { NewResponseSheet } from "./responsesSheets";

export const ResponsesTable = ({
  question,
  responses = [],
  respondents = [],
  respondentsMap = {},
}: {
  question: Question;
  responses: Response[];
  respondents: Respondent[];
  respondentsMap: Record<number, Respondent>;
}) => (
  <Table>
    <TableCaption>
      <NewResponseSheet question={question} respondents={respondents}>
        <Button>
          <PlusCircleIcon className="w-4 mr-2" /> Add New
        </Button>
      </NewResponseSheet>
    </TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[12px] px-0"></TableHead>
        <TableHead>Respondent</TableHead>
        <TableHead>Value</TableHead>
        <TableHead>Quote</TableHead>
        <TableHead>Visibility</TableHead>
        <TableHead className="w-[min-content]"></TableHead>
        <TableHead className="w-[min-content]"></TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {responses.length === 0 ? (
        <TableRow>
          <TableCell colSpan={8}>No responses found</TableCell>
        </TableRow>
      ) : (
        responses.map((response) => (
          <ResponsesTableRow
            key={`response-${response.id}`}
            question={question}
            response={response}
            respondentsMap={respondentsMap}
            respondents={respondents}
          />
        ))
      )}
    </TableBody>
  </Table>
);
