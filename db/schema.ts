import { Insertable, Selectable, Updateable } from "kysely";
import { z } from "zod";

import type { Responses, Respondents, Questions, RespondentFilters, Filters, QuestionType } from "kysely-codegen";
export type { Responses, Respondents, Questions, RespondentFilters, Filters, DB as Database } from "kysely-codegen";

export type Filter = Selectable<Filters>;
export type NewFilter = Insertable<Filters>;
export type FilterUpdate = Updateable<Filters>;

export type Response = Selectable<Responses>;
export type NewResponse = Insertable<Responses>;
export type ResponseUpdate = Updateable<Responses>;

export type Respondent = Selectable<Respondents>;
export type NewRespondent = Insertable<Respondents>;
export type RespondentUpdate = Updateable<Respondents>;

export type Question = Selectable<Questions>;
export type NewQuestion = Insertable<Questions>;
export type QuestionUpdate = Updateable<Questions>;

export type RespondentFilter = Selectable<RespondentFilters>;
export type NewRespondentFilter = Insertable<RespondentFilters>;
export type RespondentFilterUpdate = Updateable<RespondentFilters>;

/** Store a map from respondent to the filters applied to them */
export type RespondentFiltersMap = Record<number, number[]>;

/** Create a zod enum for our QuestionType */
export const questionTypeSchema = z.enum(["date", "descriptive", "percentage"]).transform((val) => val as QuestionType);
