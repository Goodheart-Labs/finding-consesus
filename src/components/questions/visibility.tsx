import { Question } from "@/db/schema";

export const QuestionVisibility = ({ visibility }: { visibility: Question["visibility"] }) => {
  switch (visibility) {
    case "private":
      return "Private";
    default:
      return "Public";
  }
};
