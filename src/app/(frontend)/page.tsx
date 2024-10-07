import { db } from "@/db/client";
import { redirect } from "next/navigation";

const getData = async () => {
  const topQuestion = await db
    .selectFrom("questions")
    .select("slug")
    .where("visibility", "=", "public")
    .orderBy("order asc")
    .executeTakeFirst();

  return { topQuestion };
};

export default async function Home() {
  const { topQuestion } = await getData();
  if (!topQuestion) {
    return (
      <div className="grid h-screen place-items-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Oops!</h1>
          <p className="text-gray-600">No questions found</p>
        </div>
      </div>
    );
  }
  redirect(`/questions/${topQuestion.slug}`);
}
