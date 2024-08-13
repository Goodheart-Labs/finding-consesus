"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import { Filter } from "@/db/schema";
import { DeleteFilterSheet, EditFilterSheet } from "./filtersSheets";

export const FiltersTableRow = ({ filter }: { filter: Filter }) => {
  return (
    <TableRow>
      <TableCell>{filter.name}</TableCell>
      <TableCell>
        <EditFilterSheet filter={filter} />
      </TableCell>
      <TableCell>
        <DeleteFilterSheet filter={filter} />
      </TableCell>
    </TableRow>
  );
};
