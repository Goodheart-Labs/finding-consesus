"use client";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Question, Respondent, Response } from "@/db/schema";
import { PropsWithChildren, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ResponseForm } from "./responsesForm";
import { deleteResponse } from "@/app/(admin)/api/responses/deleteResponse";

export const NewResponseSheet = ({
  question,
  respondents,
  children,
}: PropsWithChildren<{
  question: Question;
  respondents: Respondent[];
}>) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>New Response</SheetTitle>
        </SheetHeader>
        <ResponseForm question={question} respondents={respondents} onClose={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
};

export const EditResponseSheet = ({
  response,
  question,
  respondents,
}: {
  response: Response;
  question: Question;
  respondents: Respondent[];
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="text-blue-500 hover:text-blue-700" onClick={(e) => e.stopPropagation()}>
        (edit)
      </SheetTrigger>
      <SheetContent onClick={(e) => e.stopPropagation()}>
        <SheetHeader>
          <SheetTitle>Edit Response</SheetTitle>
          <div>
            <ResponseForm
              question={question}
              response={response}
              respondents={respondents}
              onClose={() => setOpen(false)}
            />
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export const DeleteResponseSheet = ({ response }: { response: Response }) => {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const onClickDelete = async () => {
    await startTransition(() => deleteResponse(response.id));
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="text-red-500 hover:text-red-700" onClick={(e) => e.stopPropagation()}>
        (delete)
      </SheetTrigger>
      <SheetContent onClick={(e) => e.stopPropagation()}>
        <SheetHeader>
          <SheetTitle>Delete Response</SheetTitle>
          <SheetDescription>Are you sure you want to delete this response?</SheetDescription>
          <div>
            <div className="flex justify-end mt-8 space-x-2">
              <Button variant="destructive" onClick={onClickDelete} disabled={isPending}>
                Delete
              </Button>

              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};
