"use server";

import { db } from "@/db/client";
import { Question, QuestionUpdate } from "@/db/schema";
import { revalidatePath } from "next/cache";

export const updateQuestion = async (id: Question["id"], question: QuestionUpdate) => {
  await db.updateTable("questions").set(question).where("id", "=", id).execute();
  revalidatePath("/admin");
  revalidatePath("/");
};
