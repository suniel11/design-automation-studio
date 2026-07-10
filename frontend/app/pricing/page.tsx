import Link from 'next/link';
import Nav from '@/components/Nav';

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for testing',
    features: ['5 designs per month', '1 format per design', 'PNG exports only', 'Email support'],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Starter',
    price: '$29',
    description: 'For growing teams',
    features: [
      '50 designs per month',
      '4 formats per design',
      'PNG & PDF exports',
      'Priority email support',
    ],
    cta: 'Start Free Trial',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$99',
    description: 'For agencies & teams',
    features: [
      '500 designs per month',
      'Unlimited formats',
      'All export formats (PNG, PDF, MP4, GIF)',
      'Priority chat support',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations',
    features: ['Unlimited designs', 'White-label option', 'Dedicated account manager', 'API access'],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold">Simple, transparent pricing</h1>
            <p className="mt-4 text-lg text-gray-600">
              Generate unlimited branded designs. Pay only for what you use.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl p-6 flex flex-col ${
                  plan.highlighted ? 'border-2 border-blue-600 shadow-lg' : 'border border-gray-200'
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                )}
                <h3 className="font-semibold text-lg">{plan.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-gray-500 text-sm">/month</span>}
                </div>
                <Link
                  href="/signup"
                  className={`text-center rounded-lg py-2.5 font-semibold mb-6 ${
                    plan.highlighted
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>
                <ul className="flex flex-col gap-2 text-sm text-gray-700">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
