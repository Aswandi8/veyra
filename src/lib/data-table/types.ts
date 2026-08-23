import type { ReactNode } from "react";

export type DataTableSortOrder = "asc" | "desc";

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DataTableQuery {
  q?: string;
  page: number;
  limit: number;
  sort?: string;
  order?: DataTableSortOrder;
}

export interface DataTableColumn<T> {
  id: string;
  header: ReactNode;
  cell: (item: T) => ReactNode;
  sortable?: boolean;
  sortKey?: string;
  headerClassName?: string;
  cellClassName?: string;
}

export interface DataTableFilterOption {
  label: string;
  value: string;
}

export interface DataTableFilter {
  key: string;
  label: string;
  placeholder?: string;
  options: readonly DataTableFilterOption[];
}

export interface DataTableSelectedRow {
  id: string;
}
