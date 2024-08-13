import { db } from "@/db/client";
import { QuestionsTable } from "./questions";

export const dynamic = "force-dynamic";

// To make revalidation work after creating/deleting question we
// need to force the Table to rerender, we can use a key for this
let increment = 0;

export default async function AdminQuestionsPage() {
  const questions = await db.selectFrom("questions").selectAll().orderBy("id asc").orderBy("title asc").execute();

  increment++;

  return (
    <div>
      <QuestionsTable questions={questions} key={increment} />
    </div>
  );
}
