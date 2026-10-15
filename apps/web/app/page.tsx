
"use client";

import { useState, type FormEvent } from "react";

export default function Home() {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(
      "L'interface est prête. Nous connecterons le formulaire à l'API à la prochaine étape.",
    );
  }

  return (
    <main className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden bg-[#F47721] px-4 py-8 text-white sm:px-8 lg:py-12">
      {/* Décor orange, sans image externe */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-[#FF9C43]/45 blur-2xl" />
        <div className="absolute -right-24 -top-40 h-[32rem] w-[32rem] rounded-full bg-[#FFB36B]/35" />
        <div className="absolute -bottom-56 -left-28 h-[28rem] w-[28rem] rounded-full bg-[#D96115]/50" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#FF9C43]/35 blur-2xl" />
      </div>

      <div className="relative z-10 w-full max-w-[1080px]">
        <div className="grid overflow-hidden rounded-[28px] bg-[#F47721] shadow-[0_24px_80px_rgba(122,45,4,0.24)] lg:grid-cols-[1.05fr_0.95fr]">
          {/* Panneau de connexion */}
          <section className="relative overflow-hidden bg-gradient-to-br from-[#E86513] via-[#F47721] to-[#FF8A2A] px-5 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-32 -top-40 h-80 w-80 rounded-full bg-[#FFB36B]/30"
            />

            <div className="relative mx-auto w-full max-w-[440px]">
              <header className="mb-10 text-center sm:mb-12">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[26px] bg-[#FFB36B] shadow-lg shadow-[#A8430D]/15">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 64 64"
                    fill="none"
                    className="h-12 w-12 text-[#A8430D]"
                  >
                    <path
                      d="M32 9C18.2 9 7 18.4 7 30c0 5.2 2.3 10 6.2 13.7L10 55l13.3-5.3c2.7.9 5.6 1.3 8.7 1.3 13.8 0 25-9.4 25-21S45.8 9 32 9Z"
                      fill="currentColor"
                    />
                    <circle cx="22" cy="30" r="3" fill="#FFB36B" />
                    <circle cx="32" cy="30" r="3" fill="#FFB36B" />
                    <circle cx="42" cy="30" r="3" fill="#FFB36B" />
                  </svg>
                </div>

                <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
                  Zeko
                </h1>

                <p className="mt-5 text-2xl font-bold tracking-tight sm:text-[28px]">
                  Tes messages. Tes proches.
                </p>

                <p className="mt-2 text-base text-white/90 sm:text-lg">
                  Tout le monde à portée de conversation.
                </p>
              </header>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-semibold">
                    Adresse e-mail
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-1 text-[#A8430D] shadow-sm transition focus-within:outline focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-[#74320F]">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5 shrink-0"
                    >
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m4 7 8 6 8-6" />
                    </svg>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="ton@email.fr"
                      className="min-h-12 w-full min-w-0 bg-transparent py-2 text-base text-[#74320F] outline-none placeholder:text-[#806B5F]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-semibold">
                    Mot de passe
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-1 text-[#A8430D] shadow-sm transition focus-within:outline focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-[#74320F]">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5 shrink-0"
                    >
                      <rect x="5" y="10" width="14" height="11" rx="2" />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </svg>

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      placeholder="Ton mot de passe"
                      className="min-h-12 w-full min-w-0 bg-transparent py-2 text-base text-[#74320F] outline-none placeholder:text-[#806B5F]"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={
                        showPassword
                          ? "Masquer le mot de passe"
                          : "Afficher le mot de passe"
                      }
                      aria-pressed={showPassword}
                      className="shrink-0 rounded-lg p-2 text-[#A8430D] transition hover:bg-orange-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#74320F]"
                    >
                      {showPassword ? (
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-5 w-5"
                        >
                          <path d="M3 3 21 21" />
                          <path d="M10.6 5.2A10.9 10.9 0 0 1 12 5c5 0 9 4.5 10 7-.4 1-1.4 2.6-2.9 4" />
                          <path d="M6.1 6.1C3.9 7.6 2.5 10 2 12c1 2.5 5 7 10 7 1.7 0 3.3-.5 4.7-1.3" />
                        </svg>
                      ) : (
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-5 w-5"
                        >
                          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      name="remember"
                      className="h-5 w-5 accent-[#A8430D]"
                    />
                    <span>Se souvenir de moi</span>
                  </label>

                  <span className="text-white/90">
                    Mot de passe oublié ?
                  </span>
                </div>

                <button
                  type="submit"
                  className="flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#A8430D] px-5 py-3 text-lg font-bold text-white shadow-lg shadow-[#8C3509]/20 transition hover:bg-[#8F370A] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-white active:scale-[0.99]"
                >
                  Se connecter
                  <span aria-hidden="true">→</span>
                </button>

                {message && (
                  <p
                    role="status"
                    className="rounded-xl bg-[#74320F] px-4 py-3 text-sm text-white"
                  >
                    {message}
                  </p>
                )}
              </form>

              <p className="mt-9 text-center text-sm text-white">
                Pas encore de compte ?{" "}
                <span className="font-bold underline underline-offset-4">
                  Inscription à venir
                </span>
              </p>
            </div>
          </section>

          {/* Présentation de Zeko : visible sur ordinateur */}
          <aside className="hidden flex-col justify-center bg-[#FFF8F3] px-10 py-12 text-[#74320F] lg:flex lg:px-14">
            <div className="mb-10">
              <span className="inline-flex rounded-full bg-[#FFE1C9] px-4 py-2 text-sm font-bold text-[#74320F]">
                Bienvenue sur Zeko
              </span>

              <h2 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight">
                Les conversations qui comptent.
              </h2>

              <p className="mt-4 text-lg leading-relaxed text-[#794C36]">
                Une messagerie simple, chaleureuse et pensée pour rester
                proche de ceux qui comptent.
              </p>
            </div>

            <div className="space-y-4 rounded-[28px] bg-white p-6 shadow-[0_18px_55px_rgba(168,67,13,0.10)]">
              <div className="flex items-center gap-3 border-b border-[#F6E5DA] pb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFB36B] font-bold text-[#74320F]">
                  Z
                </div>
                <div>
                  <p className="font-bold">Une conversation Zeko</p>
                  <p className="text-sm text-[#794C36]">Aperçu de l’interface</p>
                </div>
              </div>

              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-[#FFF0E5] px-4 py-3 text-sm text-[#74320F]">
                  Salut ! On se retrouve bientôt ? 👋
                </div>
              </div>

              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-[#D96115] px-4 py-3 text-sm font-medium text-white">
                  Avec plaisir ! 😊
                </div>
              </div>

              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-[#FFF0E5] px-4 py-3 text-sm text-[#74320F]">
                  Parfait, à très vite !
                </div>
              </div>
            </div>

            <p className="mt-8 text-center text-sm font-medium text-[#A8430D]">
              Zeko · Une autre façon de rester proches
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
