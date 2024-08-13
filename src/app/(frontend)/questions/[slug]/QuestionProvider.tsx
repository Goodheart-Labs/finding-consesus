"use client";

import { type ReactNode, createContext, useState } from "react";
import { getQuestions } from "./helpers";
import { usePathname } from "next/navigation";

type TQuestionContext = {
  /** The slug of the active question */
  activeQuestion: string;
  setActiveQuestion: (_slug: string) => void;
};

export const QuestionContext = createContext<TQuestionContext>({
  activeQuestion: "",
  setActiveQuestion: () => {},
});

/**
 * This provider is used to track the active question on the client side
 */
export const QuestionProvider = ({
  children,
  questions,
}: {
  children: ReactNode;
  questions: Awaited<ReturnType<typeof getQuestions>>;
}) => {
  const pathname = usePathname();
  const [activeQuestion, setActiveQuestion] = useState(() => {
    const question = questions.find((q) => pathname.includes(q.slug));
    if (!question) return questions[0].slug;
    return question.slug;
  });
  return <QuestionContext.Provider value={{ activeQuestion, setActiveQuestion }}>{children}</QuestionContext.Provider>;
};
