export type DataTableQueryValue = string | number | null | undefined;

export type DataTableQueryRecord = Record<string, DataTableQueryValue>;

export function createDataTableHref(
  pathname: string,
  currentQuery: DataTableQueryRecord = {},
  updates: DataTableQueryRecord = {},
): string {
  const params = new URLSearchParams();

  /* =========================================================
     CURRENT QUERY
     ========================================================= */

  for (const [key, value] of Object.entries(currentQuery)) {
    if (value === null || value === undefined || value === "") {
      continue;
    }

    params.set(key, String(value));
  }

  /* =========================================================
     UPDATES
     ========================================================= */

  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === undefined || value === "") {
      params.delete(key);

      continue;
    }

    params.set(key, String(value));
  }

  /* =========================================================
     RESULT
     ========================================================= */

  const query = params.toString();

  return query ? `${pathname}?${query}` : pathname;
}
