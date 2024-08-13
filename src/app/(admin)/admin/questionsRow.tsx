"use client";

import { QuestionVisibility } from "@/components/questions/visibility";
import { TableRow, TableCell } from "@/components/ui/table";
import { Question } from "@/db/schema";
import { DeleteQuestionSheet, EditQuestionSheet } from "./questionsSheets";
import Link from "next/link";
import { GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { questionTypeIcon } from "@/lib/questionType";

export const QuestionsTableRow = ({ question }: { question: Question }) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = questionTypeIcon[question.type];

  return (
    <TableRow
      className={cn("!bg-white relative z-0", {
        "!shadow-lg z-10": isDragging,
      })}
      ref={setNodeRef}
      style={style}
    >
      <TableCell className="!p-0" onClick={(e) => e.stopPropagation()}>
        <button
          className="p-4 aspect-square rounded text-gray-400 hover:text-gray-500 active:text-gray-500"
          ref={setActivatorNodeRef}
          {...listeners}
          {...attributes}
        >
          <GripVertical size={14} />
        </button>
      </TableCell>
      <TableCell className="p-0">
        <Link href={`/admin/questions/${question.slug}/responses`} className="grid gap-0.5 hover:text-blue-600 py-4">
          {question.title}
          <span className="text-gray-400 text-xs">/{question.slug}</span>
        </Link>
      </TableCell>
      <TableCell className="text-center">
        <Icon className="inline-block" size={18} />
      </TableCell>
      <TableCell className="text-center">
        <QuestionVisibility visibility={question.visibility} />
      </TableCell>
      <TableCell className="text-center">{question.order}</TableCell>
      <TableCell className="w-min">
        <EditQuestionSheet question={question} />
      </TableCell>
      <TableCell className="w-min">
        <DeleteQuestionSheet question={question} />
      </TableCell>
    </TableRow>
  );
};
