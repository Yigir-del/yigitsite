export const OYUK_PATH = '/oyuk';

export const KNOWN_ROUTES = [
  '/',
  '/hakkimda',
  '/projeler',
  '/dusunceler',
  '/studyom',
  '/iletisim',
  '/miras',
  '/atam',
  OYUK_PATH,
  '/portfolio',
  '/portfolyo',
  '/about',
  '/projects',
  '/contact',
] as const;

export function isKnownRoute(pathname: string): boolean {
  return (KNOWN_ROUTES as readonly string[]).includes(pathname);
}

export function isOyukRoute(pathname: string): boolean {
  return pathname === OYUK_PATH;
}
