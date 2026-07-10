'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, authHeader } from '@/lib/api';

interface DesignConcept {
  format: string;
  headline: string;
  subheadline: string;
  bodyCopy: string;
}

interface Design {
  _id: string;
  title: string;
  formats: string[];
  status: 'generating' | 'ready' | 'exported' | 'error';
  createdAt: string;
  concepts: DesignConcept[];
  canvaDesigns: Array<{ format: string; viewUrl: string }>;
}

interface UserProfile {
  name: string;
  email: string;
  plan: string;
  monthlyUsage: number;
  monthlyLimit: number;
}

const ALL_FORMATS = ['Instagram', 'LinkedIn', 'Email Header', 'Web Banner'];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [formData, setFormData] = useState({
    brandName: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    brandTone: 'professional',
    campaignType: 'social-media',
    headline: '',
    subheadline: '',
    cta: 'Learn More',
    formats: [] as string[],
  });

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/login');
      return;
    }
    fetchUserProfile();
    fetchDesigns();
    handleCheckoutRedirect();
  }, []);

  const handleCheckoutRedirect = async () => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get('checkout');
    if (!checkout) return;

    // Clear the query params so refreshing doesn't re-trigger this.
    window.history.replaceState({}, '', '/dashboard');

    if (checkout === 'cancelled') {
      setCheckoutMessage({ type: 'error', text: 'Checkout was cancelled.' });
      return;
    }

    const sessionId = params.get('session_id');
    if (checkout === 'success' && sessionId) {
      try {
        await api.get(`/api/billing/confirm?session_id=${encodeURIComponent(sessionId)}`, {
          headers: authHeader(),
        });
        setCheckoutMessage({ type: 'success', text: 'Your plan has been upgraded!' });
        fetchUserProfile();
      } catch (error: any) {
        setCheckoutMessage({
          type: 'error',
          text: error.response?.data?.error || 'Could not confirm your payment.',
        });
      }
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/api/users/profile', { headers: authHeader() });
      setUser(response.data);
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchDesigns = async () => {
    try {
      const response = await api.get('/api/designs', { headers: authHeader() });
      setDesigns(response.data);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleFormatToggle = (format: string) => {
    setFormData((prev) => ({
      ...prev,
      formats: prev.formats.includes(format)
        ? prev.formats.filter((f) => f !== format)
        : [...prev.formats, format],
    }));
  };

  const handleGenerateDesigns = async () => {
    if (!formData.brandName || !formData.headline || formData.formats.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setGenerating(true);
      const response = await api.post('/api/designs', formData, { headers: authHeader() });
      setDesigns([response.data, ...designs]);
      setShowGeneratorModal(false);
      setFormData({
        brandName: '',
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        brandTone: 'professional',
        campaignType: 'social-media',
        headline: '',
        subheadline: '',
        cta: 'Learn More',
        formats: [],
      });
      // Poll once after a few seconds since generation runs async on the backend.
      setTimeout(fetchDesigns, 4000);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to generate designs');
    } finally {
      setGenerating(false);
    }
  };

  const handleExportDesign = async (designId: string) => {
    try {
      const response = await api.post(
        `/api/designs/${designId}/export`,
        { format: 'png' },
        { headers: authHeader() }
      );
      window.open(response.data.downloadUrl, '_blank');
    } catch (error) {
      alert('Failed to export design');
    }
  };

  return (
    <div className="flex-1 p-8 max-w-6xl mx-auto w-full">
      {checkoutMessage && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg text-sm ${
            checkoutMessage.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {checkoutMessage.text}
        </div>
      )}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Design Automation Studio</h1>
          {user && (
            <p className="text-gray-600 mt-1 text-sm">
              {user.name} • {user.plan.toUpperCase()} Plan • {user.monthlyUsage}/{user.monthlyLimit}{' '}
              designs this month
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGeneratorModal(true)}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
          >
            + Generate New Designs
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Log out
          </button>
        </div>
      </div>

      {showGeneratorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-6">Generate New Designs</h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Brand Name *</label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  placeholder="Your brand name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Primary Color</label>
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-full h-11 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Secondary Color</label>
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="w-full h-11 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Headline *</label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="Main message"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Design Formats *</label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_FORMATS.map((format) => (
                    <button
                      key={format}
                      onClick={() => handleFormatToggle(format)}
                      className={`px-3 py-2.5 rounded-lg text-sm font-medium border ${
                        formData.formats.includes(format)
                          ? 'bg-blue-50 border-blue-600 text-blue-600'
                          : 'bg-gray-50 border-gray-300 text-gray-700'
                      }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowGeneratorModal(false)}
                className="flex-1 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateDesigns}
                disabled={generating}
                className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
              >
                {generating ? 'Generating...' : 'Generate Designs'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Designs</h2>
        {loading ? (
          <p className="text-gray-500">Loading designs...</p>
        ) : designs.length === 0 ? (
          <p className="text-gray-500">No designs yet. Create your first design to get started!</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {designs.map((design) => (
              <div key={design._id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <h3 className="font-semibold text-sm mb-1">{design.title}</h3>
                <p className="text-xs text-gray-500 mb-1">Formats: {design.formats.join(', ')}</p>
                <p className="text-xs text-gray-400 mb-3">
                  Created: {new Date(design.createdAt).toLocaleDateString()}
                </p>

                {design.concepts?.length > 0 && (
                  <div className="mb-3 flex flex-col gap-2">
                    {design.concepts.map((concept) => (
                      <div key={concept.format} className="bg-white border border-gray-200 rounded-lg p-2">
                        <p className="text-[11px] font-semibold text-gray-500">{concept.format}</p>
                        <p className="text-sm font-medium">{concept.headline}</p>
                        <p className="text-xs text-gray-600">{concept.subheadline}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleExportDesign(design._id)}
                    disabled={design.status !== 'ready'}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Export
                  </button>
                  <a
                    href={design.canvaDesigns?.[0]?.viewUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 bg-gray-100 border border-gray-300 rounded-lg text-xs text-center"
                  >
                    View
                  </a>
                </div>
                <p className="text-xs text-gray-400 mt-3 text-center">
                  Status: <strong>{design.status}</strong>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
