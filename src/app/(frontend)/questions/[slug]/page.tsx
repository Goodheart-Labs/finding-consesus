import { QuestionSelector } from "@/components/questions/selector";
import { FilterSelector } from "@/components/filters/selector";
import { QuestionList } from "./question";
import { notFound } from "next/navigation";
import { getData, getQuestions } from "./helpers";
import { QuestionProvider } from "./QuestionProvider";
import { getBaseUrl } from "@/utils/constants";

export default async function QuestionPage({
  params: { slug },
}: {
  params: {
    slug: string;
  };
}) {
  const { questions, filters, responsesByQuestionId, respondentsMap, respondentFiltersMap } = await getData();

  const currentQuestion = questions.find((question) => question.slug === slug);
  if (!currentQuestion) {
    notFound();
  }

  return (
    <QuestionProvider questions={questions}>
      <div className="sm:flex sm:items-start sm:container sm:mx-auto">
        <div className="sm:w-1/3 flex flex-col sm:sticky sm:top-[113px] sm:h-[calc(100dvh_-_113px)]">
          <QuestionSelector questions={questions} />
        </div>
        <div className="sm:w-2/3 px-4 sm:px-0">
          <FilterSelector filters={filters} className="sm:hidden flex mb-8 mt-4 sticky top-[76px] z-20 shadow" />
          <QuestionList
            questions={questions}
            filters={filters}
            responsesByQuestionId={responsesByQuestionId}
            respondentsMap={respondentsMap}
            respondentFiltersMap={respondentFiltersMap}
          />
        </div>
      </div>
    </QuestionProvider>
  );
}

export async function generateMetadata(options: { params: { slug: string }; searchParams: { responseId: string } }) {
  const { params, searchParams } = options;
  const slug = params.slug;
  const questions = await getQuestions();
  const currentQuestion = questions.find((question) => question.slug === slug);

  const ogSearchParams = new URLSearchParams();
  if (searchParams.responseId) ogSearchParams.set("responseId", searchParams.responseId);

  return {
    title: `SB 1047 Opinions | ${currentQuestion?.title}`,
    openGraph: {
      images: [`${getBaseUrl()}/api/og/${currentQuestion?.slug}?${ogSearchParams.toString()}`],
    },
  };
}
