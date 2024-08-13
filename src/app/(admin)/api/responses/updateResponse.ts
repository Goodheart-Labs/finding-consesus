"use server";

import { db } from "@/db/client";
import { Response, ResponseUpdate } from "@/db/schema";
import { refreshResponse } from "./refresh";

export const updateResponse = async (id: Response["id"], { question_id: _, ...response }: ResponseUpdate) => {
  await db.transaction().execute(async (tx) => {
    await tx.updateTable("responses").where("id", "=", id).set(response).execute();
  });

  await refreshResponse(id);
};
