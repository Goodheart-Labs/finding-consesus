"use server";

import { db } from "@/db/client";
import { NewFilter } from "@/db/schema";
import { refreshFilter } from "./refresh";

export const createFilter = async (filter: NewFilter) => {
  await db.insertInto("filters").values(filter).execute();
  refreshFilter();
};
