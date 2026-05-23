export const ACCESS_TOKEN_COOKIE = 'accessToken';

export function setAccessTokenCookie(token: string, maxAge = 60 * 60 * 24 * 7) {
  const encoded = encodeURIComponent(token);
  document.cookie = `${ACCESS_TOKEN_COOKIE}=${encoded}; path=/; max-age=${maxAge}; sameSite=lax`;
}

export function clearAccessTokenCookie() {
  document.cookie = `${ACCESS_TOKEN_COOKIE}=; path=/; max-age=0; sameSite=lax`;
}
