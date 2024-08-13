"use server";

import { db } from "@/db/client";
import { RespondentUpdate, Response } from "@/db/schema";
import { refreshRespondent } from "./refresh";

export const updateRespondent = async (
  id: Response["id"],
  {
    filters,
    ...respondent
  }: RespondentUpdate & {
    filters: number[];
  },
) => {
  await db.updateTable("respondents").where("id", "=", id).set(respondent).execute();

  // erase existing and re-add all of them to the respondent_filters table
  await db.deleteFrom("respondent_filters").where("respondent_id", "=", id).execute();
  await db
    .insertInto("respondent_filters")
    .values(filters.map((filter_id) => ({ respondent_id: id, filter_id })))
    .execute();

  await refreshRespondent(id);
};
