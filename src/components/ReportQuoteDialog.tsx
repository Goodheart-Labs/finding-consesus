"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircleWarning } from "lucide-react";

export function ReportQuoteDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MessageCircleWarning className="w-6 h-6 mr-2" />
            Report this Quote
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">
          If you believe this quote requires moderation, please report it via email to <u>nathan@frostwork.io</u>
        </p>
      </DialogContent>
    </Dialog>
  );
}
