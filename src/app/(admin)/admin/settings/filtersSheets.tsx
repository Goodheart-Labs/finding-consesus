"use client";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Filter } from "@/db/schema";
import { FilterForm } from "./filtersForm";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteFilter } from "../../api/filters/deleteFilter";

export const NewFilterSheet = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>New Filter</SheetTitle>
          <div>
            <FilterForm onClose={() => setOpen(false)} />
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export const EditFilterSheet = ({ filter }: { filter: Filter }) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="text-blue-500 hover:text-blue-700">(edit)</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Filter</SheetTitle>
          <div>
            <FilterForm onClose={() => setOpen(false)} filter={filter} />
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export const DeleteFilterSheet = ({ filter }: { filter: Filter }) => {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const onClickDelete = async () => {
    startTransition(() => deleteFilter(filter.id));
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="text-red-500 hover:text-red-700">(delete)</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Delete Filter</SheetTitle>
          <SheetDescription>
            Are you sure you want to delete this filter? Deleting a filter will remove it from all responses that use
            it.
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
