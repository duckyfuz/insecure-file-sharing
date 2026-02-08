import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen grid-bg">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent" />

        <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold gradient-text">ifs</span>
          </div>
          <Link
            href="https://ifs.kenf.dev"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            open app →
          </Link>
        </nav>

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-sm rounded-full bg-white/5 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-zinc-400">free & open source</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            share files <span className="gradient-text">instantly</span>
          </h1>

          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            upload a file, get a 4-character code, share it.
            <br />
            no sign-up required. files auto-delete after 24 hours.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="https://ifs.kenf.dev"
              className="px-8 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 transition-all transform hover:scale-105"
            >
              start sharing →
            </Link>
            <Link
              href="https://github.com/duckyfuz/insecure-file-sharing"
              className="px-8 py-4 text-lg font-semibold rounded-xl border border-white/20 hover:bg-white/5 transition-colors"
            >
              view on github
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">
            simple by design
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="📤"
              title="drag & drop"
              description="just drag your file onto the page. supports files up to 500mb."
            />
            <FeatureCard
              icon="🔗"
              title="short codes"
              description="get a memorable 4-character code to share with anyone."
            />
            <FeatureCard
              icon="⏱️"
              title="auto-delete"
              description="files are automatically deleted after 24 hours. no cleanup needed."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-12 md:p-16 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-2 gradient-text">
                ready to share?
              </h2>
              <p className="text-zinc-400 text-lg">
                no sign-up • no tracking • no limits
              </p>
            </div>
            <Link
              href="https://ifs.kenf.dev"
              className="shrink-0 inline-flex items-center gap-2 px-10 py-5 text-xl font-semibold rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/25"
            >
              open ifs
              <span className="text-2xl">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
          <p>
            made by{" "}
            <Link
              href="https://kenf.dev"
              className="text-zinc-300 hover:text-white"
            >
              kenf.dev
            </Link>
          </p>
          <div className="flex gap-6">
            <Link
              href="https://github.com/duckyfuz/insecure-file-sharing"
              className="hover:text-white"
            >
              github
            </Link>
            <Link href="https://ifs.kenf.dev" className="hover:text-white">
              app
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-zinc-400 text-sm">{description}</p>
    </div>
  );
}

function Step({ number, text }: { number: string; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 flex items-center justify-center text-xl font-bold">
        {number}
      </div>
      <span className="text-zinc-300">{text}</span>
    </div>
  );
}

function Arrow() {
  return <div className="hidden md:block text-zinc-600 text-2xl">→</div>;
}
