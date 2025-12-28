'use client';

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { unauthorizedFetch } from "../../../../lib/api";
import { useToast } from "../../../components/ToastProvider";

export default function ResetPasswordPage({ params }) {
    const { token } = use(params);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const showNotification = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            showNotification("Hesla se neshodují", "error");
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await unauthorizedFetch("/reset-password", {
                method: "POST",
                body: JSON.stringify({ token, password })
            });

            if (res.ok) {
                showNotification("Heslo bylo úspěšně změněno", "success");
                setTimeout(() => {
                    router.push('/prihlaseni');
                }, 2000);
            } else {
                const data = await res.json().catch(() => ({}));
                showNotification(data.message || "Token je neplatný nebo expiroval", "error");
            }
        } catch (error) {
            showNotification("Došlo k chybě při komunikaci se serverem", "error");
        } finally {
            setIsSubmitting(false);
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
                <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white">Nastavení nového hesla</h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form onSubmit={handleSubmit} method="POST" className="space-y-6">
                    <div>
                        <label htmlFor="password" className="block text-sm/6 font-medium text-gray-300">Nové heslo</label>
                        <div className="mt-2">
                            <input
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                id="password"
                                type="password"
                                name="password"
                                required
                                className="block w-full rounded-md bg-white/5 border border-white/10 px-3 py-1.5 text-base text-white outline-none placeholder:text-gray-500 focus:border-visualy-accent-4 focus:ring-1 focus:ring-visualy-accent-4 sm:text-sm/6 transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm/6 font-medium text-gray-300">Potvrzení hesla</label>
                        <div className="mt-2">
                            <input
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                required
                                className="block w-full rounded-md bg-white/5 border border-white/10 px-3 py-1.5 text-base text-white outline-none placeholder:text-gray-500 focus:border-visualy-accent-4 focus:ring-1 focus:ring-visualy-accent-4 sm:text-sm/6 transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            disabled={isSubmitting}
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-visualy-accent-4 px-3 py-1.5 text-sm/6 font-bold text-white shadow-xs hover:bg-visualy-accent-1 hover:text-visualy-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-visualy-accent-4 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Ukládám...</span>
                                </div>
                            ) : (
                                "Změnit heslo"
                            )}
                        </button>
                    </div>
                </form>

                <p className="mt-10 text-center text-sm/6 text-gray-400">
                    Zpět na{' '}
                    <Link href="/prihlaseni" className="font-semibold text-visualy-accent-3 hover:text-visualy-accent-2 transition-colors">Přihlášení</Link>
                </p>
            </div>
        </div>
    );
}
