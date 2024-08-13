import { MetadataRoute } from "next";
import { getQuestions } from "./(frontend)/questions/[slug]/helpers";
import { getBaseUrl } from "@/utils/constants";

export default async function Sitemap(): Promise<MetadataRoute.Sitemap> {
  const questions = await getQuestions();
  return questions.map((question) => ({
    url: `${getBaseUrl()}/questions/${question.slug}`,
    priority: 0.5,
    lastModified: new Date(question.updated_at!),
  }));
}
