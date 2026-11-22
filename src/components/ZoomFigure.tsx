"use client";

import { useRef } from "react";

/**
 * An exercise drawing that opens full screen when tapped (phones can then pinch-zoom it).
 * `svg` is our own drawing, validated by checkSvg when the content is loaded.
 */
export function ZoomFigure({ svg, alt, className = "" }: { svg: string; alt: string; className?: string }) {
  const dlg = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => dlg.current?.showModal()}
        className={`group relative block w-full cursor-zoom-in rounded-xl text-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${className}`}
        aria-label={`הגדלת הציור: ${alt}`}
      >
        <div role="img" aria-label={alt} className="fig ltr" dangerouslySetInnerHTML={{ __html: svg }} />
        {/* Below the drawing, not on it: a label in the corner of a drawing could hide a label of the drawing. */}
        <span aria-hidden className="mt-1 flex justify-end">
          <span className="rounded-md px-1.5 py-0.5 text-xs font-semibold text-muted opacity-80 group-hover:text-accent group-hover:opacity-100">הגדלה ⤢</span>
        </span>
      </button>
      <dialog
        ref={dlg}
        onClick={(e) => e.target === dlg.current && dlg.current?.close()}
        className="m-auto h-[100dvh] max-h-none w-screen max-w-none bg-surface p-0 backdrop:bg-ink/60 md:h-[92dvh] md:w-[92vw] md:rounded-2xl"
        aria-label={alt}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2">
            <span className="text-sm text-muted">אפשר להגדיל עם שתי אצבעות</span>
            <button type="button" onClick={() => dlg.current?.close()} className="min-h-11 rounded-xl bg-cta px-5 font-bold text-on-cta" autoFocus>
              סגירה
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center overflow-auto p-3">
            <div role="img" aria-label={alt} className="fig ltr w-full max-w-5xl" dangerouslySetInnerHTML={{ __html: svg }} />
          </div>
        </div>
      </dialog>
    </>
  );
}
