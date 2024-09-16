/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Question, Respondent, Response } from "@/db/schema";
import { cn } from "@/lib/utils";
import { MessageCircleWarning, Share2Icon, Info, MessageCirclePlus, CopyIcon } from "lucide-react";

import Link from "next/link";
import { memo, useContext, useEffect, useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { replaceEllipses, stripQuotes } from "@/lib/stringutils";
import dayjs from "dayjs";
import { QuestionContext } from "@/app/(frontend)/questions/[slug]/QuestionProvider";
import { ReportQuoteDialog } from "../ReportQuoteDialog";
import { kaiseiHarunoUmi } from "@/utils/constants";
import { findNearestProbability } from "@/lib/namedProbabilities";
import { ResponsesType } from "kysely-codegen";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { usePathname } from "next/navigation";
import { SuggestQuoteDialog } from "@/components/SuggestQuoteDialog";
import { toast } from "sonner";

const LONG_TXT_LENGTH = 120;
const Quote = memo(function Quote({ text }: { text: string }) {
  return (
    <h2
      className={cn(kaiseiHarunoUmi.className, "text-wrap-pretty", {
        "text-2xl sm:text-3xl !leading-[1.25] quote-lg": text.length < LONG_TXT_LENGTH,
        "text-xl sm:text-2xl !leading-[1.35] quote-sm": text.length >= LONG_TXT_LENGTH,
      })}
    >
      “{replaceEllipses(stripQuotes(text))}”
    </h2>
  );
});

export const ResponsesCarousel = ({
  question,
  responses,
  selectedResponse,
  onSelectResponse,
  respondentsMap,
}: {
  question: Question;
  responses: Response[];
  selectedResponse: Response["id"];
  onSelectResponse: (responseId: Response["id"]) => void;
  respondentsMap: Record<number, Respondent>;
}) => {
  const [api, setApi] = useState<CarouselApi>();
  const pathname = usePathname();

  const [description] = useState(() => getDescription(responses));

  useEffect(() => {
    if (!api) {
      return;
    }

    const resp = responses[api.selectedScrollSnap() as number] || responses[0];
    if (!resp) {
      return;
    }

    onSelectResponse(resp.id);

    const handleSelection = () => {
      const matchingResponseId = responses[api.selectedScrollSnap() as number].id;
      onSelectResponse(matchingResponseId);
    };
    api.on("select", handleSelection);

    return () => api.off("select", handleSelection);
  }, [api, onSelectResponse, pathname, responses]);

  useEffect(() => {
    if (!api) {
      return;
    }

    api.scrollTo(responses.findIndex((r) => r.id === selectedResponse));
  }, [api, responses, selectedResponse]);

  const onShare = () => {
    const url = encodeURIComponent(
      window.location.protocol + "//" + window.location.host + "/questions/" + question.slug,
    );
    const title = encodeURIComponent(question.title);
    const shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}&hashtags=uk,politics`;

    const config: { [key: string]: string | number } = {
      height: 400,
      width: 550,
      location: "no",
      toolbar: "no",
      status: "no",
      directories: "no",
      menubar: "no",
      scrollbars: "yes",
      resizable: "no",
      centerscreen: "yes",
      chrome: "yes",
      ...getBoxPositionOnScreenCenter(550, 400),
    };

    window.open(
      shareUrl,
      "_blank",
      Object.keys(config)
        .map((key) => `${key}=${config[key]}`)
        .join(", "),
    );
  };

  const { activeQuestion } = useContext(QuestionContext);
  const isActive = useMemo(() => activeQuestion === question?.slug, [activeQuestion, question?.slug]);

  useHotkeys(
    "left",
    () => {
      if (!isActive) return;
      if (!api) return;
      if (api.selectedScrollSnap() === 0) return;
      api.scrollTo(api.selectedScrollSnap() - 1);
    },
    [api, isActive],
  );

  useHotkeys(
    "right",
    () => {
      if (!isActive) return;
      if (!api) return;
      if (api.selectedScrollSnap() === responses.length - 1) return;
      api.scrollTo(api.selectedScrollSnap() + 1);
    },
    [api, isActive],
  );

  if (responses.length === 0) {
    return null;
  }

  return (
    <Carousel
      setApi={setApi}
      opts={{ startIndex: responses.findIndex((r) => r.id === selectedResponse) }}
      className="@container"
    >
      <div className="absolute top-0 right-0 z-[15] mt-4 mr-4 flex gap-4">
        {description && (
          <Popover>
            <PopoverTrigger asChild>
              <button className="text-text-light hover:text-text-lighter">
                <Info className="w-5 h-5" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="text-sm">
              {description}
            </PopoverContent>
          </Popover>
        )}
        <div className="flex gap-1">
          <CarouselPrevious className="static top-auto w-6 h-6 translate-x-0 translate-y-0" />
          <CarouselNext className="static top-auto w-6 h-6 translate-x-0 translate-y-0" />
        </div>
      </div>

      <CarouselContent>
        {responses.map((response) => {
          const respondent = respondentsMap[response.respondent_id];
          if (!respondent) return null;

          let estimate = `${response.value}%`;
          if (question.type === "date") {
            estimate = dayjs(response.response_date).format("YYYY MMM");
          } else if (question.type === "descriptive") {
            estimate = findNearestProbability(response.value);
          }

          const typeText = getTypeText(response.type);

          return (
            <CarouselItem key={response.id} className="select-none">
              <div
                id={`response-${response.id}`}
                className="grid gap-4 @lg:gap-10 px-8 py-4 h-full content-start @lg:flex"
              >
                <div className="@lg:w-[160px] @lg:min-w-[160px] flex justify-end @lg:justify-start flex-row-reverse w-full items-center @lg:grid gap-4 content-start">
                  <header className="grid gap-0 content-start">
                    <h5 className="text-lg @lg:text-xl font-bold leading-tight whitespace-nowrap">{respondent.name}</h5>
                    <p className="text-text-light leading-tight text-sm">
                      {respondent.job_title}, {respondent.company}
                    </p>
                  </header>
                  {respondent.avatar_url && (
                    <img
                      src={respondent.avatar_url}
                      alt={respondent.name}
                      className="@lg:w-[160px] w-16 object-cover rounded-lg aspect-square @lg:mb-4"
                      width={160}
                      height={160}
                    />
                  )}
                </div>
                <div className="grow grid gap-10 @lg:self-center @lg:py-4">
                  <div className="grid gap-2">
                    <div className="flex gap-6 items-center">
                      <span className="text-xs text-slate-500/90 font-bold @lg:ml-[2px]">
                        Editor&apos;s estimate of expert view: {estimate}
                      </span>
                      <div className="flex gap-1 items-center">
                        <span className="text-xs text-slate-500/90 font-bold @lg:ml-[2px]">Quote quality:</span>
                        <span
                          className={cn("w-3 h-3 rounded-full", {
                            "bg-green": response.type === "clearly_stated",
                            "bg-orange": response.type === "related",
                            "bg-red": response.type === "editors_estimate",
                          })}
                        />
                        <span
                          className={cn("text-xs font-bold text-text-light", {
                            "text-green": response.type === "clearly_stated",
                            "text-orange": response.type === "related",
                            "text-red": response.type === "editors_estimate",
                          })}
                        >
                          {typeText}
                        </span>
                      </div>
                    </div>
                    <Quote text={response.quote ?? ""} />
                    {response.source_url && (
                      <p className="text-sm leading-6">
                        <Link
                          target="_blank"
                          href={response.source_url}
                          className="text-blue-600 underline underline-offset-2"
                        >
                          {response.source_title ?? response.source_url}
                        </Link>
                        {response.source_date ? ` – ${dayjs(response.source_date).format("MMM D, YYYY")}` : ""}
                      </p>
                    )}
                  </div>
                  <footer className="flex flex-wrap gap-2 gap-x-4">
                    <Button
                      variant="secondaryRounded"
                      size="sm"
                      className="mb-2 text-xs text-text-lighter dark:bg-slate-100 dark:text-text-lighter hover:bg-slate-100/80"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onShare();
                      }}
                    >
                      <Share2Icon className="w-4 h-4 mr-2" /> Share on X
                    </Button>
                    <Button
                      variant="secondaryRounded"
                      size="sm"
                      className="mb-2 text-xs text-text-lighter dark:bg-slate-100 dark:text-text-lighter hover:bg-slate-100/80"
                      onClick={() => {
                        navigator.clipboard.writeText(response.quote ?? "");
                        toast("Quote copied to clipboard");
                      }}
                    >
                      <CopyIcon className="w-4 h-4 mr-2" /> Copy Quote
                    </Button>
                    <ReportQuoteDialog>
                      <Button
                        variant="secondaryRounded"
                        size="sm"
                        className="mb-2 text-xs text-text-lighter dark:bg-slate-100 dark:text-text-lighter hover:bg-slate-100/80"
                      >
                        <MessageCircleWarning className="w-4 h-4 mr-2" />
                        Report
                      </Button>
                    </ReportQuoteDialog>
                    <SuggestQuoteDialog>
                      <Button
                        variant="secondaryRounded"
                        size="sm"
                        className="mb-2 text-xs text-text-lighter dark:bg-slate-100 dark:text-text-lighter hover:bg-slate-100/80"
                      >
                        <MessageCirclePlus className="w-4 h-4 mr-2" />
                        Suggest
                      </Button>
                    </SuggestQuoteDialog>
                  </footer>
                </div>
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
    </Carousel>
  );
};

const getBoxPositionOnScreenCenter = (width: number, height: number) => ({
  top: (window.screen.height - height) / 2,
  left: (window.screen.width - width) / 2,
});

function getTypeText(responsesType: ResponsesType) {
  switch (responsesType) {
    case "editors_estimate":
      return "Rough";
    case "related":
      return "Tentantive";
    default:
      return "Confident";
  }
}

function getDescription(responses: Response[]) {
  // Get an ordered, unique set of response types
  const uniqueResponseTypes = Array.from(new Set(responses.map((r) => r.type))).sort((a, b) => {
    if (a === "clearly_stated") return -1;
    if (b === "clearly_stated") return 1;
    if (a === "related") return -1;
    if (b === "related") return 1;
    if (a === "editors_estimate") return -1;
    if (b === "editors_estimate") return 1;
    return 0;
  });

  if (uniqueResponseTypes.length === 0) return "";

  const description =
    "This chart is made up of estimates of expert views. Quotes are given to illustrate these where possible. Any corrections, please email nathanpmyoung@goodheartlabs.com";

  return description;
}
