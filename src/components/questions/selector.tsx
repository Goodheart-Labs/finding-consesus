"use client";

import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { CSSProperties, type MouseEventHandler, useContext, useLayoutEffect, useRef, useState } from "react";
import { Question } from "@/db/schema";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { QuestionContext } from "@/app/(frontend)/questions/[slug]/QuestionProvider";

export const QuestionSelector = ({ questions }: { questions: Question[] }) => {
  const sidebarListRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const { activeQuestion, setActiveQuestion } = useContext(QuestionContext);

  const title = questions.find((q) => pathname.includes(q.slug))?.title;
  const questionIndex = questions.findIndex((q) => activeQuestion === q.slug);

  useLayoutEffect(() => {
    if (!activeQuestion) return;
    const active = document.querySelector<HTMLButtonElement>('[data-active-question="true"]');
    if (!active) return;
    const sidebar = document.getElementById("question-sidebar");
    if (!sidebar) return;

    // get top relative to sidebar
    const button = active.getBoundingClientRect();
    const sidebarRect = sidebar.getBoundingClientRect();
    const top = button.top - sidebarRect.top;

    sidebar.style.setProperty("--bullet-top", `${top}px`);

    // scroll active question into view
    if (!sidebarListRef.current) return;
    sidebarListRef.current.scrollTo({ top: active.offsetTop, behavior: "smooth" });
  }, [activeQuestion]);

  return (
    <>
      <Collapsible open={open} onOpenChange={setOpen} className="sm:hidden">
        <CollapsibleTrigger className="w-full px-4 py-5 bg-brand">
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col items-start w-full mr-3">
              <h5 className="text-sm font-medium text-[#071A2B] opacity-40">Questions</h5>
              <h3 className="w-full py-2 font-medium leading-tight text-left text-white bg-transparent">{title}</h3>
            </div>
            <div>
              {open ? (
                <ChevronUpIcon className="w-6 h-6 text-text-dark opacity-40" />
              ) : (
                <ChevronDownIcon className="w-6 h-6 text-text-dark opacity-40" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent asChild>
          <div className="absolute z-40 flex flex-col w-full px-4 py-5 bg-white divide-y shadow-md rounded-b-xl">
            {questions.map((question) => {
              const isActive = question.slug === activeQuestion;
              return (
                <a
                  href={`/questions/${question.slug}`}
                  key={question.id}
                  className="text-left"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(false);

                    setActiveQuestion(question.slug);
                    // find the active question
                    const active = document.querySelector(`[data-slug="${question.slug}"]`) as HTMLDivElement;
                    if (!active) return;

                    // get the offset of the active question
                    const offset = active.getBoundingClientRect().top;

                    // scroll the page to the offset
                    window.scrollBy({ top: offset - 155, behavior: "smooth" });
                  }}
                >
                  <div
                    className={cn("cursor-pointer py-2", {
                      "text-brand": isActive,
                      "text-text-lighter": !isActive,
                    })}
                  >
                    <h4>{question.title}</h4>
                  </div>
                </a>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
      <div className="flex-col hidden px-4 sm:inline-flex justify-self-start overflow-y-auto" ref={sidebarListRef}>
        <h5 className="py-3 my-2 font-semibold text-text-dark sticky -top-3 z-40">Questions</h5>
        <div
          className="relative grid gap-3 text-wrap-pretty"
          id="question-sidebar"
          style={
            {
              "--bullet-top": `${questionIndex * 36}px`,
            } as CSSProperties
          }
          onMouseLeave={(e) => {
            // find the active question
            const active = document.querySelector('[data-active-question="true"]') as HTMLButtonElement;
            if (!active) return;

            // get the top of the active question relative to this element
            const top = active.getBoundingClientRect().top - e.currentTarget.getBoundingClientRect().top;

            // set the bullet top
            e.currentTarget.style.setProperty("--bullet-top", `${top}px`);
          }}
        >
          {questions.map((question) => {
            const isActive = question.slug === activeQuestion;
            return (
              <a
                href={`/questions/${question.slug}`}
                key={question.id}
                onMouseEnter={handleMouseEnter}
                onClick={(e) => {
                  e.preventDefault();
                  // history.pushState replacing shallow, imperative routing
                  // https://github.com/vercel/next.js/pull/58335
                  window.history.pushState({}, "", `/questions/${question.slug}`);
                  setActiveQuestion(question.slug);

                  // scroll the question to (113px) from the top
                  const questionElement = document.querySelector(`[data-slug="${question.slug}"]`);
                  if (!questionElement) return;

                  window.__userClickedQuestion = true;

                  // get offset of the question element
                  const offset = questionElement.getBoundingClientRect().top;
                  // scroll the page to the offset
                  window.scrollBy({ top: offset - 113, behavior: "smooth" });

                  setTimeout(() => {
                    window.__userClickedQuestion = false;
                  }, 1000);
                }}
                className={cn(
                  "cursor-pointer transition-opacity hover:opacity-100 flex items-center text-lg sm:text-left leading-[1.4]",
                  {
                    "font-medium": isActive,
                    "opacity-40": !isActive,
                  },
                )}
                data-active-question={isActive}
                data-title-slug={question.slug}
              >
                {question.title}
              </a>
            );
          })}
          <div className="absolute left-1 w-2 h-2 mt-[8px] mr-2 -ml-5 rounded-full bg-brand top-[var(--bullet-top)] transition-all"></div>
        </div>
      </div>
    </>
  );
};

const handleMouseEnter: MouseEventHandler<HTMLAnchorElement> = (e) => {
  const sidebar = document.getElementById("question-sidebar");
  if (!sidebar) return;

  // get top relative to sidebar
  const button = e.currentTarget.getBoundingClientRect();
  const sidebarRect = sidebar.getBoundingClientRect();
  const top = button.top - sidebarRect.top;

  sidebar.style.setProperty("--bullet-top", `${top}px`);
};
