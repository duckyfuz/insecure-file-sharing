import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      {/* Centered Content */}
      <main className="max-w-xl text-center space-y-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">ifs</h1>

        <p className="text-lg text-zinc-400 leading-relaxed">
          upload a file. get a 4-char code. share it.
          <br />
          files auto-delete in 24 hours.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="https://ifs-app.kenf.dev"
            className="px-6 py-3 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors"
          >
            open app →
          </Link>
          <Link
            href="https://github.com/duckyfuz/insecure-file-sharing"
            className="px-6 py-3 text-sm font-medium rounded-lg border border-zinc-700 hover:border-zinc-500 transition-colors"
          >
            source code
          </Link>
        </div>

        <div className="pt-8 text-sm text-zinc-600">
          no sign-up • no tracking • 500mb limit
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="absolute bottom-6 text-xs text-zinc-600">
        <Link href="https://kenf.dev" className="hover:text-zinc-400">
          kenf.dev
        </Link>
      </footer>
    </div>
  );
}
