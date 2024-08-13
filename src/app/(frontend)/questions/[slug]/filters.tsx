"use client";

import { createContext, useContext, useState } from "react";

type Filter = number[];

export const FiltersContext = createContext<{
  filter: Filter;
  setFilter: (_filter: Filter) => void;
}>({
  filter: [],
  setFilter: () => {},
});

export const FiltersProvider = ({ children }: { children: React.ReactNode }) => {
  const [filter, setFilter] = useState<Filter>([]);

  return <FiltersContext.Provider value={{ filter, setFilter }}>{children}</FiltersContext.Provider>;
};

export const useFilter = () => useContext(FiltersContext);
