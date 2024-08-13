"use server";

import { db } from "@/db/client";
import { Response } from "@/db/schema";
import { refreshResponse } from "./refresh";

export const deleteResponse = async (id: Response["id"]) => {
  await db.deleteFrom("responses").where("id", "=", id).execute();
  await refreshResponse(id);
};
