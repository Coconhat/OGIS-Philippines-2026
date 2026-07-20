"use client";

/* iOS alert, plus a `critical` variant for the breakthrough moment.
   The old breakthrough overlay had role="alertdialog" but no focus
   trap, no Esc, and no initial focus — the role alone doesn't do
   anything for a keyboard or screen-reader user. */

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useMounted } from "@/lib/use-mounted";

export type AlertAction = {
  label: string;
  style?: "default" | "cancel" | "destructive";
  onPress: () => void;
};

type AlertProps = {
  open: boolean;
  title: ReactNode;
  message?: ReactNode;
  media?: ReactNode;
  variant?: "standard" | "critical";
  actions: AlertAction[];
  onDismiss?: () => void;
};

export function Alert({
  open,
  title,
  message,
  media,
  variant = "standard",
  actions,
  onDismiss,
}: AlertProps) {
  const mounted = useMounted();
  const panel = useRef<HTMLDivElement>(null);
  const primary = useRef<HTMLButtonElement>(null);
  const restore = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restore.current = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onDismiss) {
        e.stopPropagation();
        onDismiss();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const f = panel.current.querySelectorAll<HTMLElement>("button");
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey, true);
    const raf = requestAnimationFrame(() => primary.current?.focus());
    return () => {
      document.removeEventListener("keydown", onKey, true);
      cancelAnimationFrame(raf);
      restore.current?.focus?.();
    };
  }, [open, onDismiss]);

  if (!mounted || !open) return null;

  const critical = variant === "critical";

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-6"
      role="alertdialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[3px] animate-[fade-in_.25s_ease-out]" />

      <div
        ref={panel}
        className={`relative w-full animate-[alert-in_.32s_var(--ease-spring)_both] ${
          critical
            ? "max-w-[360px] rounded-tile bg-card-alert p-6 text-center text-label shadow-float"
            : "max-w-[280px] overflow-hidden rounded-[14px] bg-app-surface text-center shadow-float"
        }`}
      >
        {critical ? (
          <>
            {media && <div className="mb-3 flex justify-center">{media}</div>}
            <p className="text-caption font-bold tracking-widest text-coral-text uppercase">
              Breakthrough
            </p>
            <h2 className="text-title-3 mt-2 text-balance">{title}</h2>
            {message && (
              <p className="text-subhead mt-2 text-label/70 text-balance">
                {message}
              </p>
            )}
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              {actions.map((a, i) => (
                <button
                  key={a.label}
                  ref={i === 0 ? primary : undefined}
                  type="button"
                  onClick={a.onPress}
                  className={`text-headline min-h-[50px] cursor-pointer rounded-pill px-4 transition-transform duration-150 ease-spring active:scale-95 ${
                    i === 0
                      ? "bg-white text-coral-text"
                      : "bg-black/12 text-label"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="px-4 pt-5 pb-4">
              <h2 className="text-headline">{title}</h2>
              {message && (
                <p className="text-footnote mt-1 text-label-2 text-balance">
                  {message}
                </p>
              )}
            </div>
            <div
              className={`grid border-t border-separator ${
                actions.length === 2 ? "grid-cols-2" : "grid-cols-1"
              }`}
            >
              {actions.map((a, i) => (
                <button
                  key={a.label}
                  ref={i === 0 ? primary : undefined}
                  type="button"
                  onClick={a.onPress}
                  className={`min-h-[44px] cursor-pointer px-3 transition-colors active:bg-fill-3 ${
                    i > 0 && actions.length === 2
                      ? "border-l border-separator"
                      : i > 0
                        ? "border-t border-separator"
                        : ""
                  } ${
                    a.style === "destructive"
                      ? "text-headline text-coral-text"
                      : a.style === "cancel"
                        ? "text-body text-accent-text"
                        : "text-headline text-accent-text"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
