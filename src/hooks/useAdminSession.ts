import { useEffect, useState } from 'react';

/** Server cookie is the source of truth. localStorage is UI cache only. */
export function useAdminSession() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();

    fetch('/api/admin/session', { credentials: 'include', signal: ctrl.signal })
      .then((res) => (res.ok ? res.json() : { admin: false }))
      .then((json: { admin?: boolean }) => {
        if (cancelled) return;
        const admin = json.admin === true;
        setIsAdmin(admin);
        try {
          if (admin) localStorage.setItem('yigit_admin', 'true');
          else localStorage.removeItem('yigit_admin');
        } catch {
          /* private mode */
        }
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      });

    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, []);

  return isAdmin;
}
