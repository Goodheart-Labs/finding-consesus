import { db } from "@/db/client";
import { Respondent, RespondentFiltersMap, Response } from "@/db/schema";

export function getQuestions() {
  return db.selectFrom("questions").selectAll().where("visibility", "=", "public").orderBy("order asc").execute();
}

export const getData = async () => {
  const questions = await getQuestions();

  const responses = await db.selectFrom("responses").selectAll().execute();

  const responsesByQuestionId = responses.reduce(
    (acc, response) => {
      if (!acc[response.question_id]) {
        acc[response.question_id] = [];
      }

      acc[response.question_id].push(response);
      return acc;
    },
    {} as Record<number, Response[]>,
  );

  const filters = await db.selectFrom("filters").selectAll().orderBy("id asc").execute();

  const respondents = ((await db
    .selectFrom("respondents")
    .selectAll()
    .where(
      "id",
      "in",
      responses.map((r) => r.respondent_id),
    )
    .execute()
    .catch((e) => {
      console.error(e);
    })) ?? []) as Respondent[];

  const respondentsMap = respondents.reduce(
    (acc, respondent) => {
      acc[respondent.id] = respondent;
      return acc;
    },
    {} as Record<number, Respondent>,
  );

  const respondentFiltersMap: RespondentFiltersMap = (
    await db.selectFrom("respondent_filters").selectAll().execute()
  ).reduce(
    (acc, { respondent_id, filter_id }) => {
      if (!acc[respondent_id]) {
        acc[respondent_id] = [];
      }
      acc[respondent_id].push(filter_id);
      return acc;
    },
    {} as Record<number, number[]>,
  );

  return {
    questions,
    filters,
    responsesByQuestionId,
    respondentsMap,
    respondentFiltersMap,
  };
};
