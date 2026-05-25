import { headers } from "next/headers";

import { getAccessToken } from "./token-storage";

const getBody = <T>(c: Response | Request): Promise<T> => {
  return c.json() as Promise<T>;
};

const getUrl = (contextUrl: string): string => {
  const apiUrl = process.env.SERVER_API_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("SERVER_API_URL or NEXT_PUBLIC_API_URL is required");
  }

  const newUrl = new URL(`${apiUrl}${contextUrl}`);
  const requestUrl = new URL(`${newUrl}`);
  return requestUrl.toString();
};

const getHeaders = async (headersInit?: HeadersInit): Promise<HeadersInit> => {
  const token = await getAccessToken({
    headers: await headers(),
  });

  return {
    ...headersInit,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const customFetch = async <T>(
  url: string,
  options: RequestInit,
): Promise<T> => {
  const requestUrl = getUrl(url);
  const requestHeaders = await getHeaders(options.headers);

  const requestInit: RequestInit = {
    ...options,
    headers: requestHeaders,
    cache: options.cache ?? "no-store",
  };

  const response = await fetch(requestUrl, requestInit);
  const data = await getBody<T>(response);

  return { status: response.status, data, headers: response.headers } as T;
};
