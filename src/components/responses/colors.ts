import { Response } from "@/db/schema";

export const responseTypeColorMap: Record<Response["type"], string> = {
  clearly_stated: "border-green bg-green",
  related: "border-orange bg-orange",
  editors_estimate: "border-red bg-red",
};
