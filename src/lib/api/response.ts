export interface ApiResponseBase {
  success: boolean;
  error?: string;
}

export async function parseApiResponse<T extends ApiResponseBase>(
  response: Response,
  label = "API RESPONSE",
): Promise<T> {
  const text = await response.text();

  if (!text) {
    return {
      success: false,
      error: `Server returned an empty response (${response.status})`,
    } as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    console.error(`[${label}] Invalid response`, {
      status: response.status,
      contentType: response.headers.get("content-type"),
      body: text.slice(0, 500),
    });

    return {
      success: false,
      error: `Server returned an invalid response (${response.status})`,
    } as T;
  }
}
