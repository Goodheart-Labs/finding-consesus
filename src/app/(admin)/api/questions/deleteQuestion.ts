"use server";

import { db } from "@/db/client";
import { Question } from "@/db/schema";

import { revalidatePath } from "next/cache";

export const deleteQuestion = async (id: Question["id"]) => {
  return db
    .deleteFrom("questions")
    .where("id", "=", id)
    .execute()
    .then(() => {
      revalidatePath("/admin");
    });
};
