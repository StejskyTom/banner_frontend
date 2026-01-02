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
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const showNotification = useToast();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/widgets/dashboard');
    }
  }, [status, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        rememberMe,
        redirect: false
      });

      if (res.ok) {
        router.push("/widgets/dashboard");
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

          <div className="flex items-center group">
            <div className="relative flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="peer sr-only"
              />
              <div
                onClick={() => setRememberMe(!rememberMe)}
                className={`
                  h-5 w-5 rounded border flex items-center justify-center transition-all duration-200 cursor-pointer
                  ${rememberMe
                    ? 'bg-visualy-accent-4 border-visualy-accent-4 text-white shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                    : 'bg-white/5 border-white/10 group-hover:border-white/30'
                  }
                `}
              >
                <svg
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${rememberMe ? 'scale-100' : 'scale-0'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9.135-9.135" />
                </svg>
              </div>
            </div>
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-300 cursor-pointer select-none group-hover:text-white transition-colors"
            >
              Zapamatovat si mě
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer flex w-full justify-center rounded-md bg-visualy-accent-4 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-visualy-accent-4/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-visualy-accent-4 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Přihlašování...' : 'Přihlásit se'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-visualy-dark px-2 text-gray-400">Nebo pokračujte přes</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => signIn('google', { callbackUrl: '/widgets/dashboard' })}
              className="cursor-pointer flex w-full items-center justify-center gap-3 rounded-md bg-visualy-dark border border-visualy-accent-4 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-visualy-accent-4/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-visualy-accent-4 transition-all"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="text-white">Google</span>
            </button>
          </div>
        </div>

        <p className="mt-10 text-center text-sm/6 text-gray-400">
          Nemáte členství?{' '}
          <Link href="/registrace" className="font-semibold text-visualy-accent-3 hover:text-visualy-accent-2 transition-colors">
            Vyzkoušejte na 14 dní zdarma
          </Link>
        </p>
      </div >
    </div >
  );
}