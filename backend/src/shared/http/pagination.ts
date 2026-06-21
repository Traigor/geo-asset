export type PaginationInput = {
  page: number;
  pageSize: number;
};

export function toOffset(input: PaginationInput): number {
  return (input.page - 1) * input.pageSize;
}
