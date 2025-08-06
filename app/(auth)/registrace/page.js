'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { unauthorizedFetch } from "../../../lib/api";
import { signIn } from "next-auth/react";
import Link from 'next/link';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

      const router = useRouter();      

      const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
          // 1️⃣ registrace
          const registerRes = await unauthorizedFetch("/register", {
            method: "POST",
            body: JSON.stringify({ email, password })
          });

          if (!registerRes.ok) {
            const errorData = await registerRes.json().catch(() => ({}));
            alert(errorData.message || "Registrace selhala");
            return;
          }

          // 2️⃣ login po registraci
          const loginRes = await signIn("credentials", {
            email,
            password,
            redirect: false
          });

          if (loginRes.ok) {
            router.push("/widgets/logo-carousel");
          } else {
            alert("Přihlášení po registraci selhalo");
          }
        } finally {
          setIsSubmitting(false);
        }
      };

    return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600" alt="Your Company" className="mx-auto h-10 w-auto" />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Pojďte tvořit Widgety</h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} method="POST" className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">E-mail</label>
            <div className="mt-2">
              <input value={email} onChange={(e) => setEmail(e.target.value)} id="email" type="email" name="email" required autoComplete="email" className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">Heslo</label>              
            </div>
            <div className="mt-2">
              <input value={password} onChange={(e) => setPassword(e.target.value)} id="password" type="password" name="password" required autoComplete="current-password" className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
            </div>
          </div>

          <div>
            <button disabled={isSubmitting} type="submit" className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting && (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}
              {isSubmitting ? "Odesílám…" : "Zaregistrovat se"}              
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm/6 text-gray-500">
          Již jste zaregistrováni ?
          <Link href="/prihlaseni" className="font-semibold text-indigo-600 hover:text-indigo-500"> Přihlásit se</Link>
        </p>
      </div>
    </div>
    );
}