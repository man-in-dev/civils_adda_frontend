"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function SubscribePage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async () => {
    if (!isAuthenticated || !token) {
      setError("Please login first to subscribe");
      setTimeout(() => router.push("/login?redirect=/subscribe"), 2000);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const r = await fetch(`${api}/api/subscriptions/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId: "basic-monthly" }),
      });
      const j = await r.json();
      if (r.ok && j.url) {
        window.location.href = j.url;
      } else {
        setError(j.error || "Failed to create checkout session");
      }
    } catch (e: any) {
      setError(e.message || "Failed to create checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: 'calc(100vh - 80px)', padding: '40px 24px', background: 'var(--gray-50)' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '12px' }}>
            Choose Your Plan
          </h1>
          <p style={{ color: 'var(--gray-600)', fontSize: '18px' }}>
            Unlock premium features and access to all mock tests
          </p>
        </div>

        <div className="card" style={{ padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '40px',
            }}>
              ⭐
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px', color: 'var(--gray-900)' }}>
              Basic Monthly
            </h2>
            <div style={{ fontSize: '48px', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px' }}>
              ₹299
              <span style={{ fontSize: '20px', color: 'var(--gray-500)', fontWeight: 400 }}>/month</span>
            </div>
            <p style={{ color: 'var(--gray-600)', fontSize: '14px' }}>Billed monthly</p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: 'var(--gray-900)' }}>
              What{`'`}s included:
            </h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {[
                "Access to all premium mock tests",
                "Detailed solutions and explanations",
                "Performance analytics and insights",
                "Unlimited test attempts",
                "Priority support",
              ].map((item, idx) => (
                <li key={idx} style={{
                  padding: '12px 0',
                  borderBottom: idx < 4 ? '1px solid var(--gray-200)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--gray-700)',
                }}>
                  <span style={{ color: 'var(--success)', marginRight: '12px', fontSize: '20px' }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {!isAuthenticated && (
            <div className="card" style={{
              padding: '16px',
              background: '#fef3c7',
              border: '1px solid #fbbf24',
              marginBottom: '24px',
              borderRadius: '8px',
            }}>
              <p style={{ fontSize: '14px', marginBottom: '12px', color: '#92400e' }}>
                ⚠️ You need to login to subscribe
              </p>
              <a href="/login?redirect=/subscribe" className="btn btn-primary" style={{ width: '100%', display: 'block', textAlign: 'center' }}>
                Login to Continue
              </a>
            </div>
          )}

          {error && (
            <div style={{
              padding: '12px',
              background: '#fee2e2',
              color: '#991b1b',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '14px',
            }}>
              {error}
            </div>
          )}

          <button
            onClick={startCheckout}
            className="btn btn-primary"
            disabled={loading || !isAuthenticated}
            style={{
              width: '100%',
              fontSize: '16px',
              padding: '14px',
              opacity: loading || !isAuthenticated ? 0.6 : 1,
              cursor: loading || !isAuthenticated ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? "Processing..." : "Subscribe Now"}
          </button>

          <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--gray-500)', marginTop: '16px' }}>
            Cancel anytime. No hidden charges.
          </p>
        </div>
      </div>
    </main>
  );
}
