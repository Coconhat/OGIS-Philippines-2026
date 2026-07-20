/* Empty states finally use the illustrations that were sitting unused
   in components/illustrations.tsx — they were landing-page-only. */

import type { ReactNode } from "react";

type EmptyStateProps = {
  illustration?: ReactNode;
  title: string;
  message?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  illustration,
  title,
  message,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`px-6 py-10 text-center ${className}`}>
      {illustration && (
        <div className="mx-auto mb-4 w-[172px]">{illustration}</div>
      )}
      <h2 className="text-title-3">{title}</h2>
      {message && (
        <p className="text-subhead mx-auto mt-1.5 max-w-[32ch] text-label-2 text-balance">
          {message}
        </p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
