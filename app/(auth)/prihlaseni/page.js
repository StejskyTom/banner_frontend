'use client';

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import {useToast} from "@/app/components/ToastProvider";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const showNotification = useToast();

    const handleSubmit = async (e) => {
      e.preventDefault();
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false
      });

      if (res.ok) {
        router.push("/widgets/logo-carousel");
      } else {
        showNotification('Uživatele se nepodařilo přihlásit', 'danger');
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
              <div className="text-sm">
                <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">Zapomenuté heslo?</a>
              </div>
            </div>
            <div className="mt-2">
              <input value={password} onChange={(e) => setPassword(e.target.value)} id="password" type="password" name="password" required autoComplete="current-password" className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
            </div>
          </div>

          <div>
            <button type="submit" className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Přihlásit se</button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm/6 text-gray-500">
          Nemáte členství ?
          <Link href="/registrace" className="font-semibold text-indigo-600 hover:text-indigo-500"> Vyzkoušejte na 14 dní zdarma</Link>
        </p>
      </div>
    </div>
    );
}