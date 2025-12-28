'use client';

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { useToast } from "../../components/ToastProvider";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const showNotification = useToast();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/widgets/logo-carousel');
    }
  }, [status, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false
      });

      if (res.ok) {
        router.push("/widgets/logo-carousel");
      } else {
        showNotification('Uživatele se nepodařilo přihlásit', 'error');
        setLoading(false);
      }
    } catch (error) {
      showNotification('Chyba při přihlášení', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[100dvh] w-full flex-col justify-center px-6 lg:px-8 bg-visualy-dark overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          src="/visualy_logo.png"
          alt="Visualy"
          className="mx-auto h-32 w-auto object-contain"
        />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white">
          Pojďte tvořit Widgety
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} method="POST" className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-300">
              E-mail
            </label>
            <div className="mt-2">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                type="email"
                name="email"
                required
                autoComplete="email"
                className="block w-full rounded-md bg-white/5 border border-white/10 px-3 py-1.5 text-base text-white outline-none placeholder:text-gray-500 focus:border-visualy-accent-4 focus:ring-1 focus:ring-visualy-accent-4 sm:text-sm/6 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm/6 font-medium text-gray-300">
                Heslo
              </label>
              <div className="text-sm">
                <Link href="/zapomenute-heslo" className="font-semibold text-visualy-accent-3 hover:text-visualy-accent-2 transition-colors">
                  Zapomenuté heslo?
                </Link>
              </div>
            </div>
            <div className="mt-2">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                type="password"
                name="password"
                required
                autoComplete="current-password"
                className="block w-full rounded-md bg-white/5 border border-white/10 px-3 py-1.5 text-base text-white outline-none placeholder:text-gray-500 focus:border-visualy-accent-4 focus:ring-1 focus:ring-visualy-accent-4 sm:text-sm/6 transition-colors"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-visualy-accent-4 px-3 py-1.5 text-sm/6 font-bold text-white shadow-xs hover:bg-visualy-accent-1 hover:text-visualy-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-visualy-accent-4 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Přihlašuji...</span>
                </div>
              ) : (
                'Přihlásit se'
              )}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm/6 text-gray-400">
          Nemáte členství?{' '}
          <Link href="/registrace" className="font-semibold text-visualy-accent-3 hover:text-visualy-accent-2 transition-colors">
            Vyzkoušejte na 14 dní zdarma
          </Link>
        </p>
      </div>
    </div>
  );
}