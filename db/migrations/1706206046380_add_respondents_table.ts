import { sql, type Kysely } from "kysely";
import type { Database } from "../schema";

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("respondents")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("name", "varchar", (col) => col.notNull())
    .addColumn("company", "varchar", (col) => col.notNull())
    .addColumn("job_title", "varchar", (col) => col.notNull())
    .addColumn("avatar_url", "varchar")
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("updated_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await sql`
    CREATE TRIGGER respondents_updated_at
    BEFORE UPDATE ON respondents
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
  `.execute(db);

  await db.schema
    .alterTable("responses")
    .addColumn("respondent_id", "integer", (col) => col.references("respondents.id").onDelete("cascade"))
    .execute();

  await sql`
    INSERT INTO respondents (name, company, job_title)
    SELECT DISTINCT respondent_name, respondent_company, respondent_job_title
    FROM responses
  `.execute(db);

  await sql`
    UPDATE responses
    SET respondent_id = respondents.id
    FROM respondents
    WHERE responses.respondent_name = respondents.name
    AND responses.respondent_company = respondents.company
    AND responses.respondent_job_title = respondents.job_title
  `.execute(db);

  await db.schema
    .alterTable("responses")
    .alterColumn("respondent_id", (col) => col.setNotNull())
    .execute();

  await db.schema.alterTable("responses").dropColumn("respondent_name").execute();
  await db.schema.alterTable("responses").dropColumn("respondent_company").execute();
  await db.schema.alterTable("responses").dropColumn("respondent_job_title").execute();
  await db.schema.alterTable("responses").dropColumn("respondent_avatar_url").execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.alterTable("responses").addColumn("respondent_name", "varchar").execute();
  await db.schema.alterTable("responses").addColumn("respondent_company", "varchar").execute();
  await db.schema.alterTable("responses").addColumn("respondent_job_title", "varchar").execute();
  await db.schema.alterTable("responses").addColumn("respondent_avatar_url", "varchar").execute();

  await sql`
    UPDATE responses
    SET respondent_name = respondents.name,
        respondent_company = respondents.company,
        respondent_job_title = respondents.job_title,
        respondent_avatar_url = respondents.avatar_url
    FROM respondents
    WHERE responses.respondent_id = respondents.id
  `.execute(db);

  await db.schema.alterTable("responses").dropColumn("respondent_id").execute();
  await db.schema.dropTable("respondents").execute();
}
