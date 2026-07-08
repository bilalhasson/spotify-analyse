export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center p-6 font-mono">
      <div className="w-full max-w-sm border border-dashed border-current/40 bg-white/5 p-6 text-sm">
        <p className="text-center tracking-widest">*** SPOTIFY RECEIPT ***</p>
        <hr className="my-4 border-dashed border-current/30" />
        <dl className="space-y-1">
          <div className="flex justify-between">
            <dt>STATUS</dt>
            <dd>WALKING SKELETON</dd>
          </div>
          <div className="flex justify-between">
            <dt>PHASE</dt>
            <dd>0 — DEPLOY</dd>
          </div>
          <div className="flex justify-between">
            <dt>AUTH</dt>
            <dd>NOT WIRED YET</dd>
          </div>
        </dl>
        <hr className="my-4 border-dashed border-current/30" />
        <p className="text-center text-xs opacity-70">
          deployed &amp; live — login arrives next
        </p>
      </div>
    </main>
  );
}
