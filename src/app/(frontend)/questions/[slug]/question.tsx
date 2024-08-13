"use client";

import { Filter, Question, Respondent, RespondentFiltersMap, Response } from "@/db/schema";
import { GraphWrapper } from "@/components/responses/graph";
import { Marked } from "@ts-stack/markdown";
import { useContext, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { QuestionContext } from "./QuestionProvider";

// declare a bit of state on the window so we don't overwrite url when
// user scrolls via sidebar click
declare global {
  interface Window {
    __userClickedQuestion: boolean;
  }
}

export function QuestionList({
  questions,
  responsesByQuestionId,
  respondentsMap,
  respondentFiltersMap,
}: {
  questions: Question[];
  filters: Filter[];
  responsesByQuestionId: Record<number, Response[]>;
  respondentsMap: Record<number, Respondent>;
  respondentFiltersMap: RespondentFiltersMap;
}) {
  const questionListRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { setActiveQuestion } = useContext(QuestionContext);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (window.__userClickedQuestion) continue;

          const questionSlug = entry.target.getAttribute("data-slug");
          if (!questionSlug) continue;

          window.history.pushState(null, "", `/questions/${questionSlug}`);
          setActiveQuestion(questionSlug);

          return;
        }
      },
      {
        root: null,
        threshold: 1,
      },
    );

    const questionElements = document.querySelectorAll("[data-slug]");
    questionElements.forEach((q) => {
      observerRef.current!.observe(q);
    });

    return () => {
      if (!observerRef.current) return;
      questionElements.forEach((q) => {
        observerRef.current!.unobserve(q);
      });
      observerRef.current = null;
    };
  }, [questions, setActiveQuestion]);

  useLayoutEffect(() => {
    const currentQuestionElement = document.querySelector<HTMLDivElement>(
      `[data-slug="${window.location.pathname.split("/")[2]}"]`,
    );

    if (!currentQuestionElement) return;

    const offset = window.innerWidth >= 640 ? 112 : 148;
    const top = currentQuestionElement.offsetTop - offset;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  return (
    <div className="grid gap-4 grid-cols-[100%]" ref={questionListRef}>
      {questions.map((question) => (
        <QuestionView
          key={question.id}
          question={question}
          responses={responsesByQuestionId[question.id] ?? []}
          respondentsMap={respondentsMap}
          respondentFiltersMap={respondentFiltersMap}
        />
      ))}
    </div>
  );
}

export const QuestionView = ({
  question,
  responses,
  respondentsMap,
  respondentFiltersMap,
}: {
  question: Question;
  responses: Response[];
  respondentsMap: Record<number, Respondent>;
  respondentFiltersMap: RespondentFiltersMap;
}) => {
  const __html = useMemo(() => Marked.parse(question.context ?? ""), [question.context]);

  return (
    <div className="sm:last-of-type:min-h-[calc(100dvh-113px)]">
      <div className="question bg-white rounded-xl sm:mx-0" data-slug={question.slug}>
        <div className="p-6">
          <h2 className="text-xl leading-tight md:text-2xl font-bold text-wrap-pretty">{question.title}</h2>
          {question.context ? <div className="text-stone-800" dangerouslySetInnerHTML={{ __html }} /> : null}
        </div>
        <GraphWrapper
          question={question}
          responses={responses}
          respondentsMap={respondentsMap}
          respondentFiltersMap={respondentFiltersMap}
        />
      </div>
    </div>
  );
};
