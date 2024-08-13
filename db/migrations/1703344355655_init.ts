import { sql, type Kysely } from "kysely";
import type { Database } from "../schema";

export async function up(db: Kysely<Database>): Promise<void> {
  await sql`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `.execute(db);

  // Questions

  await db.schema.createType("questions_visibility").asEnum(["public", "private"]).execute();

  await db.schema
    .createTable("questions")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("slug", "varchar", (col) => col.notNull().unique())
    .addColumn("title", "varchar", (col) => col.notNull())
    .addColumn("visibility", sql`questions_visibility`, (col) => col.defaultTo("public").notNull())
    .addColumn("context", "text")
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("updated_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await sql`
    CREATE TRIGGER questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
  `.execute(db);

  // Filters

  await db.schema
    .createTable("filters")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("name", "varchar", (col) => col.notNull())
    .execute();

  await sql`
    INSERT INTO filters (name)
    VALUES ('AI Lab'), ('Politician'), ('AI Safety Researcher')
  `.execute(db);

  // Responses

  await db.schema.createType("responses_visibility").asEnum(["public", "private"]).execute();

  await db.schema.createType("responses_type").asEnum(["clearly_stated", "related", "editors_estimate"]).execute();

  await db.schema
    .createTable("responses")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("question_id", "integer", (col) => col.references("questions.id").onDelete("cascade").notNull())
    .addColumn("visibility", sql`responses_visibility`, (col) => col.defaultTo("public").notNull())
    .addColumn("type", sql`responses_type`, (col) => col.notNull())
    .addColumn("respondent_name", "varchar", (col) => col.notNull())
    .addColumn("respondent_company", "varchar", (col) => col.notNull())
    .addColumn("respondent_job_title", "varchar", (col) => col.notNull())
    .addColumn("respondent_avatar_url", "varchar")
    .addColumn("value", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("quote", "text")
    .addColumn("source_url", "varchar")
    .addColumn("source_title", "varchar")
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("updated_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await sql`
    CREATE TRIGGER responses_updated_at
    BEFORE UPDATE ON responses
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
  `.execute(db);

  // Many-to-many relationship between responses and filters

  await db.schema
    .createTable("responses_filters")
    .addColumn("response_id", "integer", (col) => col.references("responses.id").onDelete("cascade").notNull())
    .addColumn("filter_id", "integer", (col) => col.references("filters.id").onDelete("cascade").notNull())
    .execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("responses_filters").execute();
  await db.schema.dropTable("responses").execute();
  await db.schema.dropTable("filters").execute();
  await db.schema.dropTable("questions").execute();
  await db.schema.dropType("responses_type").execute();
  await db.schema.dropType("responses_visibility").execute();
  await db.schema.dropType("questions_visibility").execute();
  await sql`DROP FUNCTION update_updated_at_column`.execute(db);
}
