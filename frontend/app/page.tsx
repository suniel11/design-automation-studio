import Link from 'next/link';
import Nav from '@/components/Nav';

const formats = ['Instagram', 'LinkedIn', 'Email Header', 'Web Banner'];

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Generate branded designs in minutes, not hours.
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            Enter your brand and message once. AI drafts on-brand design concepts across every
            format you need — no design skills required.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Start free
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50"
            >
              See pricing
            </Link>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {formats.map((format) => (
              <div
                key={format}
                className="border border-gray-200 rounded-xl p-6 text-center bg-gray-50"
              >
                <div className="font-semibold">{format}</div>
                <p className="text-sm text-gray-500 mt-1">Ready in one click</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-gray-200 bg-gray-50">
          <div className="max-w-5xl mx-auto px-6 py-20 grid sm:grid-cols-3 gap-10 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">1</div>
              <p className="mt-2 text-gray-600">Enter your brand colors, tone, and headline</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">2</div>
              <p className="mt-2 text-gray-600">AI drafts design concepts across every format</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">3</div>
              <p className="mt-2 text-gray-600">Review, export, and ship</p>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        Design Automation Studio
      </footer>
    </>
  );
}
