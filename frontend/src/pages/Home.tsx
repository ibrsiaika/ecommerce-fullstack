import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

const Home: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <div className="text-white">
      <section className="container py-14 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr,1fr]">
          <div className="space-y-6">
            <span className="pill bg-white/10 text-amber-100 border-amber-200/20">
              Concierge onboarding
            </span>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
              {isAuthenticated ? `Welcome back, ${user?.name}.` : 'A more personal way to shop.'}
              <span className="block text-amber-200 font-normal mt-3 text-xl">
                Curated assortments, human support, and calm, premium interfaces.
              </span>
            </h1>

            <p className="text-lg text-white/70 max-w-2xl">
              We blend luxury-grade service with thoughtful technology. Browse curated capsules, 
              save private wishlists, and have a concierge guide every checkout, return, and gift.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="btn btn-primary text-base px-6 py-3 rounded-full">
                Explore collections
              </Link>
              <Link to={isAuthenticated ? '/orders' : '/register'} className="btn btn-secondary text-base px-6 py-3 rounded-full">
                {isAuthenticated ? 'View your journey' : 'Start with a concierge'}
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Delivery promise', value: '< 3 days', tone: 'text-emerald-200' },
                { label: 'Support wait time', value: '5 mins', tone: 'text-amber-200' },
                { label: 'Repeat customers', value: '92%', tone: 'text-indigo-100' },
              ].map((stat) => (
                <div key={stat.label} className="surface p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">{stat.label}</p>
                  <p className={`text-2xl font-semibold ${stat.tone}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-white/60">Today&apos;s experience</p>
                <p className="text-2xl font-semibold mt-2">Private showroom</p>
                <p className="text-white/60">Smooth, minimal, and ready when you are.</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-900 font-bold shadow-lg shadow-amber-900/40">
                {isAuthenticated ? 'Hi' : 'New'}
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {[
                'Hand-picked essentials, never overwhelming',
                'White-glove packing with climate-aware routes',
                'One inbox for orders, returns, and gifting',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-white/80">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-400" />
                  <p>{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">Concierge status</p>
                  <p className="text-lg font-semibold text-emerald-200">Online · ready in 5 minutes</p>
                </div>
                <Link to="/products" className="btn btn-outline rounded-full px-4 py-2 text-sm">
                  Browse quietly
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="pill bg-white/5 text-white border-white/10">Capsule collections</p>
            <h2 className="text-3xl font-semibold mt-3">Curated for calm, built for speed.</h2>
            <p className="text-white/60 mt-2">Move between categories without reloading. No clutter, just essentials.</p>
          </div>
          <Link to="/products" className="hidden sm:inline-flex btn btn-outline rounded-full">
            View full catalog
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'Everyday elevated',
              copy: 'Hard-working pieces with premium materials.',
              cta: 'Shop essentials',
            },
            {
              title: 'Gifts without friction',
              copy: 'Curated sets, gift notes, and timed delivery.',
              cta: 'Send something special',
            },
            {
              title: 'Limited drops',
              copy: 'Small-batch items with transparent inventory.',
              cta: 'See what is left',
            },
          ].map((card) => (
            <div key={card.title} className="surface p-6 hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{card.title}</h3>
                <span className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-amber-200">
                  •
                </span>
              </div>
              <p className="text-white/70 mt-2">{card.copy}</p>
              <Link to="/products" className="mt-4 inline-flex items-center gap-2 text-amber-200 font-semibold">
                {card.cta}
                <span aria-hidden>→</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-12">
        <div className="surface p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="pill bg-white/5 text-white border-white/10">Smooth experience</p>
              <h3 className="text-2xl font-semibold mt-3">Thoughtful states for every step.</h3>
              <p className="text-white/70">
                Loading feels deliberate, errors explain what to do, and success feedback is calm—never loud.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Onboarding', detail: 'Concierge or self-guided' },
                { label: 'Empty states', detail: 'Handcrafted suggestions' },
                { label: 'Recovery', detail: 'Inline fixes and retries' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">{item.label}</p>
                  <p className="text-white font-semibold">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
