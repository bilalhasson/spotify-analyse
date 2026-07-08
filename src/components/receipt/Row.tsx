/** A plain left/right receipt row (genres, recently played, etc.). */
export function Row({ left, right }: { left: string; right?: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="min-w-0 truncate">{left}</span>
      {right != null && (
        <span className="shrink-0 truncate text-paper-muted">{right}</span>
      )}
    </div>
  );
}
