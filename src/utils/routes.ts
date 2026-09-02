export const KNOWN_ROUTES = [
  '/',
  '/hakkimda',
  '/projeler',
  '/dusunceler',
  '/studyom',
  '/iletisim',
  '/miras',
  '/atam',
  '/portfolio',
  '/portfolyo',
  '/about',
  '/projects',
  '/contact',
] as const;

export function isKnownRoute(pathname: string): boolean {
  return (KNOWN_ROUTES as readonly string[]).includes(pathname);
}
