"use server";

import { db } from "@/db/client";
import { Filter, FilterUpdate } from "@/db/schema";
import { refreshFilter } from "./refresh";

export const updateFilter = async (id: Filter["id"], filter: FilterUpdate) => {
  await db.updateTable("filters").set(filter).where("id", "=", id).execute();
  refreshFilter();
};
