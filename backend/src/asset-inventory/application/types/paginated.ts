export type Paginated<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
};
