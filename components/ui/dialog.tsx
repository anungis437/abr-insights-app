import * as React from "react";
import { Dialog as RadixDialog, DialogContent as RadixDialogContent, DialogDescription as RadixDialogDescription, DialogTitle as RadixDialogTitle, DialogTrigger as RadixDialogTrigger } from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

export const Dialog = RadixDialog;
export const DialogTrigger = RadixDialogTrigger;
export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mb-4", className)} {...props} />
);
export const DialogTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={cn("text-lg font-semibold", className)} {...props} />
);
export const DialogDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-gray-500", className)} {...props} />
);
export const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("bg-white rounded-xl p-6 shadow-lg max-w-lg w-full", className)} {...props} />
  )
);
DialogContent.displayName = "DialogContent";
