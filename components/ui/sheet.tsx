"use client";

/* iOS sheet with detents and drag-to-dismiss.
   Portals to the body but constrains itself to the same centred
   430px column as the phone frame, so it reads as part of the device
   rather than spanning a desktop viewport. */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useMounted } from "@/lib/use-mounted";
import { Button } from "./button";

const DISMISS_DRAG = 0.4; // fraction of sheet height dragged before it closes
const DISMISS_VELOCITY = 0.5; // px per ms

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Heights as fractions of the viewport, smallest first. */
  detents?: number[];
  title?: string;
  trailingAction?: { label: string; onPress: () => void };
  children: ReactNode;
};

export function Sheet({
  open,
  onOpenChange,
  detents = [0.6],
  title,
  trailingAction,
  children,
}: SheetProps) {
  const mounted = useMounted();
  const [detent, setDetent] = useState(0);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);

  const panel = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const gesture = useRef<{ y: number; t: number } | null>(null);

  // Reset position each time the sheet opens. Adjusting state during
  // render is the sanctioned way to react to a prop change — doing it
  // in an effect would cascade an extra render.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    setDetent(0);
    setDrag(0);
  }

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  // Focus management + Esc + scroll lock
  useEffect(() => {
    if (!open) return;
    restoreFocus.current = document.activeElement as HTMLElement | null;

    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const focusables = panel.current.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])',
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey, true);
    const raf = requestAnimationFrame(() => panel.current?.focus());

    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = overflow;
      cancelAnimationFrame(raf);
      restoreFocus.current?.focus?.();
    };
  }, [open, close]);

  const height = detents[detent] ?? detents[0];

  const onPointerDown = (e: React.PointerEvent) => {
    gesture.current = { y: e.clientY, t: performance.now() };
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!gesture.current) return;
    // Negative drag (upward) is resisted, not free — matches iOS.
    const delta = e.clientY - gesture.current.y;
    setDrag(delta > 0 ? delta : delta * 0.25);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const g = gesture.current;
    gesture.current = null;
    setDragging(false);
    if (!g) return;

    const dy = e.clientY - g.y;
    const velocity = dy / Math.max(1, performance.now() - g.t);
    const sheetPx = window.innerHeight * height;

    if (velocity > DISMISS_VELOCITY || dy > sheetPx * DISMISS_DRAG) {
      // Drop to a smaller detent first if one exists, else dismiss.
      if (detent > 0) {
        setDetent(detent - 1);
        setDrag(0);
      } else {
        close();
      }
      return;
    }
    if (dy < -60 && detent < detents.length - 1) setDetent(detent + 1);
    setDrag(0);
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="absolute inset-0 cursor-default bg-ink/35 backdrop-blur-[2px] animate-[fade-in_.3s_ease-out]"
      />

      <div className="pointer-events-none absolute inset-0 mx-auto max-w-[430px]">
        <div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          tabIndex={-1}
          className="pointer-events-auto absolute inset-x-0 bottom-0 flex flex-col rounded-t-sheet bg-app-surface shadow-sheet outline-none animate-[sheet-in_var(--duration-sheet)_var(--ease-ios)_both]"
          style={{
            height: `${height * 100}%`,
            transform: `translateY(${Math.max(0, drag)}px)`,
            transition: dragging
              ? "none"
              : "transform var(--duration-control) var(--ease-ios)",
          }}
        >
          {/* Grabber — also the drag handle */}
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="shrink-0 cursor-grab touch-none pt-[5px] pb-1 active:cursor-grabbing"
          >
            <span className="mx-auto block h-[5px] w-9 rounded-pill bg-label-3" />
          </div>

          {(title || trailingAction) && (
            <header className="flex shrink-0 items-center justify-between gap-3 px-4 pt-1 pb-2">
              <h2 className="text-title-3 truncate">{title}</h2>
              {trailingAction && (
                <Button
                  variant="plain"
                  size="small"
                  onPress={trailingAction.onPress}
                >
                  {trailingAction.label}
                </Button>
              )}
            </header>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[calc(env(safe-area-inset-bottom)+20px)]">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
