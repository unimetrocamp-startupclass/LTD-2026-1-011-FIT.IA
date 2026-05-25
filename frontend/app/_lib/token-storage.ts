import { authClient } from "./auth-client";

type TokenFetchOptions = NonNullable<
  Parameters<typeof authClient.token>[0]
>["fetchOptions"];

let accessToken: { token: string; expiresAt: number } | null = null;

const decodeBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  if (typeof window === "undefined") {
    return Buffer.from(padded, "base64").toString("utf8");
  }

  return window.atob(padded);
};

const getTokenExpiresAt = (token: string) => {
  try {
    const [, payload] = token.split(".");
    if (!payload) return 0;

    const parsed = JSON.parse(decodeBase64Url(payload)) as { exp?: number };

    return parsed.exp ? parsed.exp * 1000 : 0;
  } catch {
    return 0;
  }
};

export const setAccessToken = (token: string | null) => {
  accessToken = token
    ? {
        token,
        expiresAt: getTokenExpiresAt(token),
      }
    : null;
};

export const getAccessToken = async (fetchOptions?: TokenFetchOptions) => {
  const canUseMemoryCache = typeof window !== "undefined" && !fetchOptions;

  if (
    canUseMemoryCache &&
    accessToken &&
    accessToken.expiresAt > Date.now() + 30_000
  ) {
    return accessToken.token;
  }

  const { data, error } = await authClient.token({ fetchOptions });

  if (error || !data?.token) {
    if (canUseMemoryCache) setAccessToken(null);
    return null;
  }

  if (canUseMemoryCache) setAccessToken(data.token);
  return data.token;
};
