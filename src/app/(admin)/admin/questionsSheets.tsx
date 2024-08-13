"use client";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Question } from "@/db/schema";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { QuestionForm } from "./questionsForm";
import { deleteQuestion } from "../api/questions/deleteQuestion";

export const NewQuestionSheet = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>New Question</SheetTitle>
          <div>
            <QuestionForm onClose={() => setOpen(false)} />
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export const EditQuestionSheet = ({ question }: { question: Question }) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="text-blue-500 hover:text-blue-700" onClick={(e) => e.stopPropagation()}>
        (edit)
      </SheetTrigger>
      <SheetContent onClick={(e) => e.stopPropagation()}>
        <SheetHeader>
          <SheetTitle>Edit Question</SheetTitle>
          <div>
            <QuestionForm onClose={() => setOpen(false)} question={question} />
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export const DeleteQuestionSheet = ({ question }: { question: Question }) => {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const onClickDelete = async () => {
    await startTransition(() => deleteQuestion(question.id));
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="text-red-500 hover:text-red-700" onClick={(e) => e.stopPropagation()}>
        (delete)
      </SheetTrigger>
      <SheetContent onClick={(e) => e.stopPropagation()}>
        <SheetHeader>
          <SheetTitle>Delete Question</SheetTitle>
          <SheetDescription>
            Are you sure you want to delete this question? Deleting a question is irreversible and will delete all
            associated responses too!
          </SheetDescription>
          <div>
            <div className="flex justify-end space-x-2 mt-8">
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
