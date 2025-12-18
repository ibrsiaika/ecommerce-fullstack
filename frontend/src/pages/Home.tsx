import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

const Home: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <div className="text-gray-900">
      {/* Hero Section */}
      <section className="container py-16 lg:py-24">
        <div className="max-w-3xl">
          <span className="pill">Welcome</span>
          <h1 className="mt-6 text-5xl md:text-6xl font-bold leading-tight">
            {isAuthenticated ? `Welcome back, ${user?.name}.` : 'Shop minimal. Shop smart.'}
          </h1>

          <p className="mt-6 text-lg text-gray-600 max-w-2xl">
            Carefully curated essentials for everyday life. We focus on quality, simplicity, and exceptional service.
          </p>

          <div className="flex flex-wrap gap-4 mt-8">
            <Link to="/products" className="btn btn-primary text-base px-6 py-3 rounded-lg">
              Explore now
            </Link>
            <Link to={isAuthenticated ? '/orders' : '/register'} className="btn btn-secondary text-base px-6 py-3 rounded-lg">
              {isAuthenticated ? 'View orders' : 'Create account'}
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-3 mt-12">
            {[
              { label: 'Delivery', value: '2-3 days' },
              { label: 'Support', value: '24/7' },
              { label: 'Quality', value: '100%' },
            ].map((stat) => (
              <div key={stat.label} className="surface p-6">
                <p className="text-sm text-gray-600 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="container py-12">
        <div className="surface p-8">
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="text-sm text-gray-600 uppercase tracking-wider">Featured</p>
              <p className="text-2xl font-bold mt-2">Clean. Simple. Essential.</p>
              <p className="text-gray-600 mt-4 leading-relaxed">
                Thoughtfully designed for modern living. Quality craftsmanship meets minimalist aesthetics.
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-black flex items-center justify-center text-white font-bold flex-shrink-0">
              ✓
            </div>
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section className="container py-12">
        <div className="mb-8">
          <p className="pill">Collections</p>
          <h2 className="text-3xl font-semibold mt-4">Shop by category</h2>
          <p className="text-gray-600 mt-2">Discover what works for you</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: 'Everyday essentials',
              copy: 'Daily staples with premium materials.',
              cta: 'Shop essentials',
            },
            {
              title: 'Work & focus',
              copy: 'Tools designed for productivity.',
              cta: 'Browse collection',
            },
            {
              title: 'Home & comfort',
              copy: 'Make your space intentional.',
              cta: 'Explore home',
            },
          ].map((card) => (
            <div key={card.title} className="surface p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
              <p className="text-gray-600 mt-2">{card.copy}</p>
              <Link to="/products" className="mt-4 inline-flex items-center gap-2 text-gray-900 font-medium hover:text-black">
                {card.cta}
                <span>→</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-12">
        <div className="surface p-8 text-center">
          <h3 className="text-2xl font-bold">Ready to get started?</h3>
          <p className="text-gray-600 mt-2">Browse our full collection of quality essentials.</p>
          <Link to="/products" className="btn btn-primary mt-6 px-8 py-3 rounded-lg">
            Start shopping
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
