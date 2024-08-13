"use server";

import { db } from "@/db/client";
import { NewResponse } from "@/db/schema";
import { refreshResponse } from "./refresh";

export const createResponse = async (response: NewResponse) => {
  const newId = await db.transaction().execute(async (tx) => {
    const res = await tx.insertInto("responses").values(response).returning("id").executeTakeFirst();

    return res?.id;
  });

  if (!newId) {
    return;
  }

  await refreshResponse(newId);
};
