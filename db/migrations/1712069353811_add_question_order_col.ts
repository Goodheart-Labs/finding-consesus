import { sql, type Kysely } from "kysely";
import type { Database } from "../schema";

export async function up(db: Kysely<Database>): Promise<void> {
  // Add the 'order' column without NOT NULL constraint
  await db.schema.alterTable("questions").addColumn("order", "integer").execute();

  // Initialize the 'order' column for existing rows
  const questions = await db.selectFrom("questions").select("id").execute();
  for (const [index, question] of questions.entries()) {
    await db
      .updateTable("questions")
      .set({ order: index + 1 })
      .where("id", "=", question.id)
      .execute();
  }

  // Create a sequence for the 'order' column
  await sql`
    CREATE SEQUENCE questions_order_seq
  `.execute(db);

  // Set the next value of the sequence to the max 'order' + 1
  await sql`
    SELECT setval('questions_order_seq', (SELECT MAX("order") FROM questions), false)
  `.execute(db);

  // Set the 'order' column to NOT NULL
  await db.schema
    .alterTable("questions")
    .alterColumn("order", (col) => col.setNotNull())
    .execute();

  // Set the default value for the 'order' column using the sequence
  await sql`
    ALTER TABLE questions ALTER COLUMN "order" SET DEFAULT nextval('questions_order_seq')
  `.execute(db);
}

export async function down(db: Kysely<Database>): Promise<void> {
  // Remove the default value from the 'order' column
  await sql`
    ALTER TABLE questions ALTER COLUMN "order" DROP DEFAULT
  `.execute(db);

  // Drop the 'order' column
  await db.schema.alterTable("questions").dropColumn("order").execute();

  // Drop the sequence for order numbers
  await sql`
    DROP SEQUENCE IF EXISTS questions_order_seq
  `.execute(db);
}
