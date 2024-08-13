import { QuestionVisibility } from "@/components/questions/visibility";
import { TableRow, TableCell } from "@/components/ui/table";
import { Question, Respondent, Response } from "@/db/schema";
import { DeleteResponseSheet, EditResponseSheet } from "./responsesSheets";
import { responseTypeColorMap } from "@/components/responses/colors";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { stripQuotes } from "@/lib/stringutils";
import dayjs from "dayjs";
import { kaiseiHarunoUmi } from "@/utils/constants";

export const ResponsesTableRow = ({
  response,
  question,
  respondents = [],
  respondentsMap,
}: {
  response: Response;
  question: Question;
  respondents: Respondent[];
  respondentsMap: Record<number, Respondent>;
}) => (
  <TableRow>
    <TableCell className="w-[12px] pr-0">
      <ResponseTypeIcon withTooltip type={response.type} />
    </TableCell>
    <TableCell>{respondentsMap[response.respondent_id]?.name}</TableCell>
    <TableCell>
      {question.type === "date" ? dayjs(response.response_date).format("YYYY MMM") : `${response.value}%`}
    </TableCell>
    <TableCell className="flex flex-col max-w-72">
      <p className={cn("line-clamp-3 overflow-hidden", kaiseiHarunoUmi.className)}>{stripQuotes(response.quote)}</p>
      <div className="flex gap-2 items-center">
        {(response.source_title || response.source_url) && (
          <div className="text-xs mt-2">
            {response.source_url ? (
              <a href={response.source_url} className="underline text-blue-500 hover:text-blue-700" target="_blank">
                {response.source_title ?? response.source_url}
              </a>
            ) : (
              response.source_title
            )}
          </div>
        )}
        {response.source_date && (
          <div className="text-xs mt-2 text-gray-400 whitespace-nowrap">
            {dayjs(response.source_date).format("MMM D, YYYY")}
          </div>
        )}
      </div>
    </TableCell>
    <TableCell>
      <QuestionVisibility visibility={response.visibility} />
    </TableCell>
    <TableCell>
      <EditResponseSheet response={response} question={question} respondents={respondents} />
    </TableCell>
    <TableCell>
      <DeleteResponseSheet response={response} />
    </TableCell>
  </TableRow>
);

const ResponseTypeIcon = ({ type, withTooltip = false }: { type: Response["type"]; withTooltip?: boolean }) =>
  withTooltip ? (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <div className={cn("w-3 h-3 rounded-full mr-2", responseTypeColorMap[type])} />
        </TooltipTrigger>
        <TooltipContent>
          <div className="px-2 py-1 text-sm text-text-lighter">
            {type === "related" ? "Related" : type === "editors_estimate" ? "Editor's Estimate" : "Clearly stated"}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    <div className={cn("w-3 h-3 rounded-full mr-2", responseTypeColorMap[type])} />
  );
