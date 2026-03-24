/**
 * Helpers to parse JSON API responses and surface HTTP errors for services.
 */

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

function extractMessageFromBody(body: unknown, fallback: string): string {
  if (body === null || body === undefined) return fallback;
  if (typeof body === 'string' && body.trim().length > 0) return body;
  if (typeof body === 'object' && body !== null) {
    const record = body as Record<string, unknown>;
    const msg = record.message;
    if (typeof msg === 'string' && msg.length > 0) return msg;
    if (Array.isArray(msg) && msg.every((m) => typeof m === 'string')) {
      return msg.join(', ');
    }
  }
  return fallback;
}

/**
 * Reads JSON from a fetch Response. Throws ApiRequestError when status is not ok.
 */
export async function readJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let parsed: unknown;
  if (text.length === 0) {
    parsed = undefined;
  } else {
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      parsed = text;
    }
  }

  if (!response.ok) {
    const fallback = response.statusText || `Request failed (${response.status})`;
    throw new ApiRequestError(
      extractMessageFromBody(parsed, fallback),
      response.status,
      parsed
    );
  }

  return parsed as T;
}
