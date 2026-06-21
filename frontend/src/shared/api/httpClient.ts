import { env } from '../../config/env';

type RequestBody =
  | Record<string, string | number | boolean | null>
  | Record<string, string | number | boolean | null | undefined>;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: RequestBody;
};

type BackendErrorBody = {
  error?: {
    message?: string;
    code?: string;
    details?: unknown;
  };
  message?: string;
  details?: unknown;
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function httpClient<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const requestInit: RequestInit = {
    method: options.method ?? 'GET',
  };

  if (options.body !== undefined) {
    requestInit.headers = { 'Content-Type': 'application/json' };
    requestInit.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${env.apiBaseUrl}${path}`, requestInit);

  if (!response.ok) {
    throw await parseApiError(response);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const details = formatDetails(error.details);
    return details === null ? error.message : `${error.message}\n${details}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong.';
}

async function parseApiError(response: Response): Promise<ApiError> {
  let body: BackendErrorBody | undefined;

  try {
    body = (await response.json()) as BackendErrorBody;
  } catch {
    body = undefined;
  }

  const message =
    body?.error?.message ??
    body?.message ??
    `Request failed with status ${response.status}`;

  const details = body?.error?.details ?? body?.details;
  const code = body?.error?.code;

  return new ApiError(response.status, message, details, code);
}

function formatDetails(details: unknown): string | null {
  if (details === undefined || details === null) {
    return null;
  }

  if (typeof details === 'string') {
    return details;
  }

  if (Array.isArray(details)) {
    const messages = details
      .map((detail) => {
        if (
          typeof detail === 'object' &&
          detail !== null &&
          'message' in detail &&
          typeof detail.message === 'string'
        ) {
          return detail.message;
        }

        return null;
      })
      .filter((message): message is string => message !== null);

    return messages.length === 0 ? null : messages.join('\n');
  }

  return null;
}