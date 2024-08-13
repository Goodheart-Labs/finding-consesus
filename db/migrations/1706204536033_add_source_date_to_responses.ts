import type { Kysely } from "kysely";
import type { Database } from "../schema";

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema.alterTable("responses").addColumn("source_date", "timestamp").execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.alterTable("responses").dropColumn("source_date").execute();
}
