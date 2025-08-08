import { getSession } from "next-auth/react";
import {signOut} from 'next-auth/react';

export async function authorizedFetch(url, options = {}) {
  const session = await getSession();

  if (!session?.accessToken) {
    // není token → odhlásit a přesměrovat
    signOut({ callbackUrl: "/prihlaseni" });
    return null;
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.accessToken || ""}`,
      ...(options.headers || {})
    }
  });

  // Pokud dostaneme 401 (neautorizováno)
  if (res.status === 401) {
    // uživatel byl odhlášen / token je neplatný
    signOut({ callbackUrl: "/prihlaseni" });
    return null;
  }


  return res;
}

export async function unauthorizedFetch(url, options = {}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  return res;
}

export async function authorizedUpload(url, formData) {
  const session = await getSession();

  return fetch(process.env.NEXT_PUBLIC_API_URL + url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session?.accessToken || ""}`,
      // ⚠️ NENASTAVUJ Content-Type, fetch to udělá sám při FormData
    },
    body: formData
  });
}
