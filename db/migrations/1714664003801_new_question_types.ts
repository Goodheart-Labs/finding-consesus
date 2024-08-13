import { sql, type Kysely } from "kysely";
import type { Database } from "../schema";

export async function up(db: Kysely<Database>): Promise<void> {
  // Create the 'question_type' enum type
  await db.schema.createType("question_type").asEnum(["percentage", "descriptive", "date"]).execute();

  // Add the 'type' column to the 'questions' table using the 'question_type' enum
  await db.schema
    .alterTable("questions")
    .addColumn("type", sql`question_type`, (col) => col.notNull().defaultTo("percentage"))
    .execute();

  // Add the new nullable date column to the 'responses' table
  await db.schema
    .alterTable("responses")
    .addColumn("response_date", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
  // Remove the 'type' column from the 'questions' table
  await db.schema.alterTable("questions").dropColumn("type").execute();

  // Drop the 'question_type' enum type
  await db.schema.dropType("question_type").execute();

  // Remove the 'response_date' column from the 'responses' table
  await db.schema.alterTable("responses").dropColumn("response_date").execute();
}
