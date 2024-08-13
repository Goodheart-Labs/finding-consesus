import { db } from "@/db/client";
import { notFound } from "next/navigation";
import { ResponsesTable } from "./responses";
import { Respondent } from "@/db/schema";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

const getData = async (slug: string) => {
  const question = await db.selectFrom("questions").selectAll().where("slug", "=", slug).executeTakeFirst();

  if (!question) {
    notFound();
  }

  const filters = await db.selectFrom("filters").selectAll().orderBy("id asc").execute();

  const allRespondents = await db.selectFrom("respondents").selectAll().execute();

  const responses = await db
    .selectFrom("responses")
    .selectAll()
    .where("question_id", "=", question.id)
    .orderBy("id asc")
    .execute();

  const responseIds = responses.map((response) => response.id);

  if (responseIds.length === 0) {
    return {
      question,
      responses,
      filters,
      responseFiltersMap: {},
      respondents: allRespondents,
      respondentsMap: {},
    };
  }

  const respondents = await db
    .selectFrom("respondents")
    .selectAll()
    .where(
      "id",
      "in",
      responses.map((r) => r.respondent_id),
    )
    .execute();

  const respondentsMap = respondents.reduce(
    (acc, respondent) => {
      acc[respondent.id] = respondent;
      return acc;
    },
    {} as Record<number, Respondent>,
  );

  return {
    question,
    responses,
    respondents: allRespondents,
    respondentsMap,
  };
};

export default async function AdminQuestionResponsesPage({
  params: { slug },
}: {
  params: {
    slug: string;
  };
}) {
  const { question, responses, respondents, respondentsMap } = await getData(slug);

  return (
    <div>
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold leading-7 text-gray-900">{question.title}</h2>
          <Button asChild variant="ghost">
            <Link href={`/questions/${slug}`}>
              View Question
              <ArrowUpRight className="w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>

      <ResponsesTable
        question={question}
        responses={responses}
        respondents={respondents}
        respondentsMap={respondentsMap}
      />
    </div>
  );
}
