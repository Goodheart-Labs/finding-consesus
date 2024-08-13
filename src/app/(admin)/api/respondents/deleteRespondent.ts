"use server";

import { db } from "@/db/client";
import { Response } from "@/db/schema";
import { refreshRespondent } from "./refresh";

export const deleteRespondent = async (id: Response["id"]) => {
  await db.deleteFrom("respondents").where("id", "=", id).execute();
  await refreshRespondent(id);
};
