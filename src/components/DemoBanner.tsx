/** Honest banner for the public demo — makes clear the data isn't real. */
export function DemoBanner() {
  return (
    <div className="w-full max-w-md rounded-md border border-dashed border-accent/50 bg-accent/5 px-4 py-2 text-center font-mono text-xs text-foreground/70">
      <span className="font-bold text-accent">Sample data.</span> Spotify limits
      new apps to a few allowlisted accounts, so this is a demo — real sign-in
      isn&apos;t open.
    </div>
  );
}
