import { QuestionType } from "kysely-codegen";
import { Percent, MessageSquareQuote, CalendarDays } from "lucide-react";

export const questionTypeIcon: Record<QuestionType, typeof Percent> = {
  percentage: Percent,
  descriptive: MessageSquareQuote,
  date: CalendarDays,
};
