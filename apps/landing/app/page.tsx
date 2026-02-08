import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen grid-bg">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent" />

        <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold gradient-text">IFS</span>
          </div>
          <Link
            href="https://ifs.kenf.dev"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            Open App →
          </Link>
        </nav>

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-sm rounded-full bg-white/5 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-zinc-400">Free & Open Source</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Share files
            <br />
            <span className="gradient-text">instantly</span>
          </h1>

          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Upload a file, get a 4-character code, share it. No sign-up
            required. Files auto-delete after 24 hours.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="https://ifs.kenf.dev"
              className="px-8 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 transition-all transform hover:scale-105"
            >
              Start Sharing →
            </Link>
            <Link
              href="https://github.com/duckyfuz/insecure-file-sharing"
              className="px-8 py-4 text-lg font-semibold rounded-xl border border-white/20 hover:bg-white/5 transition-colors"
            >
              View on GitHub
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">
            Simple by design
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="📤"
              title="Drag & Drop"
              description="Just drag your file onto the page. Supports files up to 500MB."
            />
            <FeatureCard
              icon="🔗"
              title="Short Codes"
              description="Get a memorable 4-character code to share with anyone."
            />
            <FeatureCard
              icon="⏱️"
              title="Auto-Delete"
              description="Files are automatically deleted after 24 hours. No cleanup needed."
            />
            <FeatureCard
              icon="🔒"
              title="CAPTCHA Protected"
              description="Cloudflare Turnstile prevents abuse and bot uploads."
            />
            <FeatureCard
              icon="🌐"
              title="Global CDN"
              description="Powered by AWS CloudFront for fast downloads worldwide."
            />
            <FeatureCard
              icon="💸"
              title="100% Free"
              description="No accounts, no payments, no tracking. Just file sharing."
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-16">How it works</h2>

          <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
            <Step number="1" text="Upload your file" />
            <Arrow />
            <Step number="2" text="Get a 4-char code" />
            <Arrow />
            <Step number="3" text="Share the code" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center gradient-border p-12 glow">
          <h2 className="text-3xl font-bold mb-4">Ready to share?</h2>
          <p className="text-zinc-400 mb-8">
            No sign-up required. Start sharing files in seconds.
          </p>
          <Link
            href="https://ifs.kenf.dev"
            className="inline-block px-8 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 transition-all transform hover:scale-105"
          >
            Open IFS →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
          <p>
            Made by{" "}
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
              GitHub
            </Link>
            <Link href="https://ifs.kenf.dev" className="hover:text-white">
              App
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
