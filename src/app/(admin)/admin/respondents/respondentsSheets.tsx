"use client";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Filter, Respondent, RespondentFiltersMap } from "@/db/schema";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteRespondent } from "@/app/(admin)/api/respondents/deleteRespondent";
import { RespondentForm } from "./respondentForm";

export const NewRespondentSheet = ({
  children,
  filters,
  respondentFiltersMap,
}: {
  children: React.ReactNode;
  filters: Filter[];
  respondentFiltersMap: RespondentFiltersMap;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>New Respondent</SheetTitle>
          <div>
            <RespondentForm
              onClose={() => setOpen(false)}
              filters={filters}
              respondentFiltersMap={respondentFiltersMap}
            />
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export const EditRespondentSheet = ({
  respondent,
  filters,
  respondentFiltersMap,
}: {
  respondent: Respondent;
  filters: Filter[];
  respondentFiltersMap: RespondentFiltersMap;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="text-blue-500 hover:text-blue-700" onClick={(e) => e.stopPropagation()}>
        (edit)
      </SheetTrigger>
      <SheetContent onClick={(e) => e.stopPropagation()}>
        <SheetHeader>
          <SheetTitle>Edit Respondent</SheetTitle>
          <div>
            <RespondentForm
              respondent={respondent}
              onClose={() => setOpen(false)}
              filters={filters}
              respondentFiltersMap={respondentFiltersMap}
            />
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export const DeleteRespondentSheet = ({ respondent }: { respondent: Respondent }) => {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const onClickDelete = async () => {
    startTransition(() => deleteRespondent(respondent.id));
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="text-red-500 hover:text-red-700" onClick={(e) => e.stopPropagation()}>
        (delete)
      </SheetTrigger>
      <SheetContent onClick={(e) => e.stopPropagation()}>
        <SheetHeader>
          <SheetTitle>Delete Respondent</SheetTitle>
          <SheetDescription>Are you sure you want to delete this respondent?</SheetDescription>
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
