import { db } from "@/db/client";
import { Respondent } from "@/db/schema";
import { revalidatePath } from "next/cache";

export const refreshRespondent = async (respondentId: Respondent["id"]) => {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/respondents");

  const questions = await db
    .selectFrom("responses")
    .innerJoin("questions", "responses.question_id", "questions.id")
    .select("questions.slug")
    .where("responses.respondent_id", "=", respondentId)
    .execute();

  if (!questions.length) {
    return;
  }

  questions.forEach((question) => revalidatePath(`/admin/questions/${question.slug}/responses`));
};
