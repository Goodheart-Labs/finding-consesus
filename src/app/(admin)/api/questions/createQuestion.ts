"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { NewQuestion } from "@/db/schema";
import { redirect } from "next/navigation";

export async function createQuestion(question: NewQuestion) {
  const { slug } = await db.insertInto("questions").values(question).returning(["slug"]).executeTakeFirstOrThrow();
  revalidatePath("/admin");
  revalidatePath("/");
  redirect(`/admin/questions/${slug}/responses`);
}
