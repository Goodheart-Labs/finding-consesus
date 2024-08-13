import { FiltersTable } from "./filters";
import { db } from "@/db/client";

const getData = async () => {
  const filters = await db.selectFrom("filters").selectAll().orderBy("id asc").execute();

  return {
    filters,
  };
};

export default async function AdminSettingsPage() {
  const { filters } = await getData();

  return (
    <div>
      <div className="flex">
        <div className="min-w-[200px]">
          <h3 className="font-semibold uppercase text-sm">Filters</h3>
        </div>
        <div className="w-full">
          <FiltersTable filters={filters} />
        </div>
      </div>
    </div>
  );
}
