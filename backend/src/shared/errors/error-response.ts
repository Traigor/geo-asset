export type ErrorDetail = {
  path: string;
  message: string;
};

export type ErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: ErrorDetail[];
  };
};
