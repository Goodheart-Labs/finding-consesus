import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Filter } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "lucide-react";
import { FiltersTableRow } from "./filtersRow";
import { NewFilterSheet } from "./filtersSheets";

export const FiltersTable = ({ filters = [] }: { filters: Filter[] }) => (
  <Table>
    <TableCaption>
      <NewFilterSheet>
        <Button>
          <PlusCircleIcon className="w-4 mr-2" /> Add New
        </Button>
      </NewFilterSheet>
    </TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead>Filter</TableHead>
        <TableHead className="w-[100px]"></TableHead>
        <TableHead className="w-[100px]"></TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {filters.length === 0 ? (
        <TableRow>
          <TableCell colSpan={4}>No filters found</TableCell>
        </TableRow>
      ) : (
        filters.map((filter) => <FiltersTableRow key={`filter-${filter.id}`} filter={filter} />)
      )}
    </TableBody>
  </Table>
);
