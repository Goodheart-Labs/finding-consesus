"use server";

import { db } from "@/db/client";
import { Filter } from "@/db/schema";
import { refreshFilter } from "./refresh";

export const deleteFilter = async (id: Filter["id"]) => {
  await db.deleteFrom("filters").where("id", "=", id).execute();
  refreshFilter();
};
