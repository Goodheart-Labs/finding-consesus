/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { getData, getQuestions } from "@/app/(frontend)/questions/[slug]/helpers";
import { Logo } from "@/assets/Logo";
import { headers } from "next/headers";

type Params = {
  slug: string;
};

export async function GET(req: Request, context: { params: Params }) {
  const responseId = new URL(req.url).searchParams.get("responseId");
  const slug = context.params.slug;
  const questions = await getQuestions();
  const currentQuestion = questions.find((question) => question.slug === slug);

  const { respondentsMap, responsesByQuestionId } = await getData();
  const responses = responsesByQuestionId[currentQuestion?.id ?? 0] ?? [];

  const activeResponse = responseId ? responses.find((r) => r.id === +responseId) ?? responses[0] : responses[0];
  const respondent = respondentsMap[activeResponse?.respondent_id ?? 0];

  const imageContent = (
    <div
      style={{
        display: "flex",
        position: "relative",
        width: "200px",
        height: "200px",
        borderRadius: "2rem",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#dfdfdf",
          width: "100%",
          height: "100%",
          color: "black",
        }}
      >
        {respondent?.name}
      </div>
      <img
        src={respondent?.avatar_url ?? undefined}
        alt=""
        width={200}
        height={200}
        style={{ objectFit: "cover", borderRadius: "2rem" }}
      />
    </div>
  );

  return new ImageResponse(
    (
      <div
        style={{
          fontFamily: "Inter",
          background: "white",
          height: "100%",
          width: "100%",
          display: "flex",
          flexWrap: "nowrap",
          color: "black",
          padding: "3rem",
          borderLeft: "8px solid #FFA800",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            flexDirection: "column",
            gap: "0px",
            justifyContent: "space-between",
          }}
        >
          <Logo />
          <h1 style={{ fontSize: "48px", fontWeight: "700", textWrap: "balance", margin: 0 }}>
            {currentQuestion?.title}
          </h1>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <p style={{ fontSize: "28px", lineHeight: "1", margin: 0 }}>{respondent.name}</p>
            <p style={{ fontSize: "28px", lineHeight: "1", margin: 0, opacity: 0.5 }}>
              {respondent.job_title}, {respondent.company}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", gap: "3rem", justifyContent: "center", alignItems: "center" }}>
              {imageContent}
              <p
                style={{
                  flex: "1 1",
                  fontSize: activeResponse.quote!.length > 320 ? "24px" : "28px",
                  lineHeight: "1.1",
                  fontFamily: "Kaisei Haruno Umi",
                }}
              >
                {activeResponse.quote?.slice(0, 320)}
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter",
          data: await getFont("Inter-Regular.ttf"),
          style: "normal",
          weight: 400,
        },
        {
          name: "Inter",
          data: await getFont("Inter-Bold.ttf"),
          style: "normal",
          weight: 700,
        },
        {
          name: "Kaisei Haruno Umi",
          data: await getFont("KaiseiHarunoUmi-Regular.ttf"),
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}

async function getFont(name: string) {
  const host = headers().get("host");
  const protocal = process?.env.NODE_ENV === "development" ? "http" : "https";
  const url = `${protocal}://${host}/fonts/${name}`;
  const font = await fetch(url, {
    cache: "no-store",
  });
  if (!font.ok) {
    throw new Error("Failed to load font");
  }
  const fontData = await font.arrayBuffer();
  return fontData;
}
