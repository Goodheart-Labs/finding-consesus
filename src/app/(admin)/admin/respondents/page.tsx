import { db } from "@/db/client";
import { RespondentsTable } from "./respondents";
import { sql } from "kysely";
import { RespondentFiltersMap } from "@/db/schema";

const getData = async () => {
  const respondents = await db
    .selectFrom("respondents")
    .selectAll()
    // sort by created at followed by alphabetical order
    .orderBy("created_at", "asc")
    .orderBy("name", "asc")
    .execute();

  const counts = await db
    .selectFrom("responses")
    .select(["respondent_id", sql`count(*)`.as("count")])
    .groupBy("respondent_id")
    .execute();

  const respondentResponsesCounts = counts.reduce(
    (acc, { respondent_id, count }) => {
      acc[respondent_id] = count as number;
      return acc;
    },
    {} as Record<number, number>,
  );

  const filters = await db.selectFrom("filters").selectAll().orderBy("id asc").execute();

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

  return { respondents, respondentResponsesCounts, filters, respondentFiltersMap };
};

export default async function AdminQuestionResponsesPage() {
  const { respondents, respondentResponsesCounts, filters, respondentFiltersMap } = await getData();

  return (
    <div>
      <RespondentsTable
        respondents={respondents}
        respondentResponsesCounts={respondentResponsesCounts}
        filters={filters}
        respondentFiltersMap={respondentFiltersMap}
      />
    </div>
  );
}
