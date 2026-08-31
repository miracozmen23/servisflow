interface ApiErrorBody {
  statusCode: number;
  code: string;
  message: string;
}

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor({ statusCode, code, message }: ApiErrorBody) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toApiError(response: Response, body: unknown): ApiError {
  if (
    isRecord(body) &&
    typeof body.statusCode === "number" &&
    typeof body.code === "string" &&
    typeof body.message === "string"
  ) {
    return new ApiError({
      statusCode: body.statusCode,
      code: body.code,
      message: body.message,
    });
  }

  return new ApiError({
    statusCode: response.status,
    code: "HTTP_ERROR",
    message: "İstek işlenirken beklenmeyen bir hata oluştu.",
  });
}

async function readResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json") !== true) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  path: `/api/${string}`,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  if (init.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });
  const body = await readResponseBody(response);

  if (!response.ok) {
    throw toApiError(response, body);
  }

  return body as T;
}
