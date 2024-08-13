import { db } from "@/db/client";
import { redirect } from "next/navigation";

const getData = async () => {
  const topQuestion = await db
    .selectFrom("questions")
    .select("slug")
    .where("visibility", "=", "public")
    .orderBy("order asc")
    .executeTakeFirstOrThrow();

  return { topQuestion };
};

export default async function Home() {
  const { topQuestion } = await getData();
  redirect(`/questions/${topQuestion.slug}`);
}
