"use client";

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Question } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "lucide-react";
import { QuestionsTableRow } from "./questionsRow";
import { NewQuestionSheet } from "./questionsSheets";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useCallback, useState } from "react";
import { updateQuestion } from "@/app/(admin)/api/questions/updateQuestion";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

function replaceOrder(items: Question[]): Question[] {
  return items.map((item, index) => ({ ...item, order: index + 1 }));
}

export const QuestionsTable = ({ questions = [] }: { questions: Question[] }) => {
  const [questionsCopy, setQuestionsCopy] = useState([...questions].sort((a, b) => a.order - b.order));
  const questionsWithOptimisticOrder = replaceOrder(questionsCopy);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active && over && active.id !== over?.id) {
      setQuestionsCopy((copies) => {
        const oldIndex = copies.findIndex((i) => i.id === active.id);
        const newIndex = copies.findIndex((i) => i.id === over.id);

        const newQuestionsOrder = arrayMove(copies, oldIndex, newIndex);
        // Update questions in DB
        Promise.all(
          replaceOrder(newQuestionsOrder).map(async (q, index) => {
            return updateQuestion(q.id, { ...q, order: index + 1 });
          }),
        );
        return arrayMove(copies, oldIndex, newIndex);
      });
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <DndContext
      modifiers={[restrictToVerticalAxis]}
      sensors={sensors}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}
    >
      <Table className="isolate">
        <TableCaption>
          <NewQuestionSheet>
            <Button>
              <PlusCircleIcon className="w-4 mr-2" /> Add New
            </Button>
          </NewQuestionSheet>
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="text-center">Type</TableHead>
            <TableHead className="text-center">Visibility</TableHead>
            <TableHead className="text-center">Order</TableHead>
            <TableHead className="w-min"></TableHead>
            <TableHead className="w-min"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <SortableContext items={questionsCopy} strategy={verticalListSortingStrategy}>
            {questions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>No questions found</TableCell>
              </TableRow>
            ) : (
              questionsWithOptimisticOrder.map((question) => (
                <QuestionsTableRow key={`question-${question.id}`} question={question} />
              ))
            )}
          </SortableContext>
        </TableBody>
      </Table>
    </DndContext>
  );
};
