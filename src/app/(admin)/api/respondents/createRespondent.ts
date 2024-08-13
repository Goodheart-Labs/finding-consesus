"use server";

import { db } from "@/db/client";
import { NewRespondent } from "@/db/schema";
import { refreshRespondent } from "./refresh";

export const createRespondent = async ({
  filters,
  ...respondent
}: NewRespondent & {
  filters: number[];
}) => {
  const newRespondent = await db.insertInto("respondents").values(respondent).returning("id").executeTakeFirst();

  if (!newRespondent) {
    return;
  }

  // add filters to respondent_filters table
  await db
    .insertInto("respondent_filters")
    .values(filters.map((filter_id) => ({ respondent_id: newRespondent.id, filter_id })))
    .execute();

  await refreshRespondent(newRespondent.id);
};
