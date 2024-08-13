"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCirclePlus } from "lucide-react";

export function SuggestQuoteDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MessageCirclePlus className="w-6 h-6 mr-2" />
            Suggest a Quote
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">
          If there is a quote you would like to see on this site, please email it to <u>nathan@frostwork.io</u>
        </p>
      </DialogContent>
    </Dialog>
  );
}
