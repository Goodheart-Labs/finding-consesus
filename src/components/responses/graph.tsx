/* eslint-disable @next/next/no-img-element */

"use client";

import { Question, Respondent, RespondentFiltersMap, Response } from "@/db/schema";
import { useState } from "react";
import { ResponsesCarousel } from "./carousel";
import { Plot } from "./Plot";
import { useFilter } from "@/app/(frontend)/questions/[slug]/filters";
import { useParams, useSearchParams } from "next/navigation";

export const GraphWrapper = ({
  question,
  responses: _responses,
  respondentsMap,
  respondentFiltersMap,
}: {
  question: Question;
  responses: Response[];
  respondentsMap: Record<number, Respondent>;
  respondentFiltersMap: RespondentFiltersMap;
}) => {
  const params = useParams();

  const isCurrentQuestion = question.slug === params.slug;

  const searchParams = useSearchParams();
  const [responses] = useState(() => {
    return _responses.sort((a, b) => {
      if (question.type === "date") {
        return a.response_date.getTime() - b.response_date.getTime();
      }
      return a.value - b.value;
    });
  });
  const [currentResponse, setCurrentResponse] = useState(getInitialResponse());
  const { filter } = useFilter();

  const filteredResponses = !filter.length
    ? responses
    : responses.filter((response) => {
        const respondentId = response.respondent_id;
        const respondentFilters = respondentFiltersMap[respondentId] ?? [];
        return respondentFilters.some((f) => filter.includes(f));
      });

  // hidden stores the id's of the responses that aren't visible
  const hidden = responses.filter((r) => !filteredResponses.includes(r)).map((r) => r.id);

  function getInitialResponse() {
    let selectedId = selectRandomResponseFrom(responses)?.id ?? 0;
    const initialResponseId = searchParams.get("responseId");
    const matchingResponse = initialResponseId && responses.find((r) => r.id === +initialResponseId);
    if (matchingResponse && isCurrentQuestion) selectedId = matchingResponse.id;
    return selectedId;
  }

  return (
    <div>
      <div className="p-4 sm:px-8 sm:pt-0 sm:pb-2 grid gap-4">
        <Plot
          responses={responses}
          activeId={currentResponse}
          respondentsMap={respondentsMap}
          setCurrentResponse={setCurrentResponse}
          hidden={hidden}
          questionType={question.type}
        />
      </div>
      <ResponsesCarousel
        question={question}
        responses={responses}
        selectedResponse={currentResponse}
        onSelectResponse={setCurrentResponse}
        respondentsMap={respondentsMap}
      />
    </div>
  );
};

function selectRandomResponseFrom(arr: Response[]) {
  if (arr.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}
