/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { Kysely } from "kysely";
import type { Database } from "../schema";

export async function up(db: Kysely<Database>): Promise<void> {
  // Create the new respondent_filters table
  await db.schema
    .createTable("respondent_filters")
    .addColumn("respondent_id", "integer", (col) => col.references("respondents.id").onDelete("cascade").notNull())
    .addColumn("filter_id", "integer", (col) => col.references("filters.id").onDelete("cascade").notNull())
    .execute();

  // Loop over the respondents
  const respondents = await db.selectFrom("respondents").select("id").execute();
  for (const respondent of respondents) {
    // Find the first response row for this respondent that has a filter associated with it
    const responseFilter = await db
      .selectFrom("responses")
      // @ts-ignore
      .innerJoin("responses_filters", "responses.id", "responses_filters.response_id")
      // @ts-ignore
      .select("responses_filters.filter_id")
      .where("responses.respondent_id", "=", respondent.id)
      .limit(1)
      .execute();

    // If a filter is found, insert it into the new respondent_filters table
    if (responseFilter.length > 0) {
      await db
        // @ts-ignore
        .insertInto("respondent_filters")
        .values({
          respondent_id: respondent.id,
          filter_id: responseFilter[0].filter_id,
        })
        .execute();
    }
  }

  // Remove the responses_filters table
  await db.schema.dropTable("responses_filters").execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
  // Recreate the responses_filters table for rollback
  // Note: You'll need to fill in the column definitions
  await db.schema
    .createTable("responses_filters")
    // Add your column definitions here
    .execute();

  // You would also need to populate the responses_filters table based on respondent_filters
  // This is a non-trivial operation and would depend on how you want to handle the rollback

  // Drop the respondent_filters table
  await db.schema.dropTable("respondent_filters").execute();
}
