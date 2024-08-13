import { db } from "@/db/client";
import { Response } from "@/db/schema";
import { revalidatePath } from "next/cache";

export const refreshResponse = async (responseId: Response["id"]) => {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/questions");

  const question = await db
    .selectFrom("responses")
    .innerJoin("questions", "responses.question_id", "questions.id")
    .select("questions.slug")
    .where("responses.id", "=", responseId)
    .executeTakeFirst();

  if (!question) {
    return;
  }

  revalidatePath(`/admin/questions/${question.slug}/responses`);
};
