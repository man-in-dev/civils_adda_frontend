"use client";
import { useState } from "react";

const sample = {
  testId: "sample-1",
  title: "Sample Test",
  description: "Description",
  durationMinutes: 15,
  price: 0,
  questions: [
    { text: "Q1?", options: ["A", "B", "C", "D"], answer: 0 },
  ],
};

const dummyTests = [
  {
    testId: 'polity-basics-1',
    title: 'Polity Basics - Set 1',
    description: 'Fundamental questions on Indian Polity and Constitution',
    durationMinutes: 20,
    price: 0,
    questions: [
      { text: 'Which article defines India as a Union of States?', options: ['Art 1', 'Art 2', 'Art 3', 'Art 5'], answer: 0 },
      { text: 'Who is the head of the Union Executive?', options: ['Prime Minister', 'President', 'Cabinet', 'Parliament'], answer: 1 },
      { text: 'How many fundamental rights are guaranteed by the Indian Constitution?', options: ['5', '6', '7', '8'], answer: 1 },
      { text: 'Who appoints the Chief Justice of India?', options: ['Prime Minister', 'President', 'Vice President', 'Speaker'], answer: 1 },
      { text: 'What is the maximum strength of Lok Sabha?', options: ['540', '545', '550', '552'], answer: 3 },
    ],
  },
  {
    testId: 'polity-advanced-1',
    title: 'Polity Advanced - Constitutional Provisions',
    description: 'Advanced level questions on constitutional articles and amendments',
    durationMinutes: 25,
    price: 299,
    questions: [
      { text: 'Which amendment added fundamental duties to the Constitution?', options: ['42nd', '44th', '73rd', '86th'], answer: 0 },
      { text: 'Article 370 is related to which state?', options: ['Punjab', 'Jammu & Kashmir', 'Assam', 'Nagaland'], answer: 1 },
      { text: 'Who has the power to dissolve Lok Sabha?', options: ['President', 'Prime Minister', 'Speaker', 'Election Commission'], answer: 0 },
      { text: 'How many schedules are there in Indian Constitution?', options: ['10', '11', '12', '13'], answer: 2 },
    ],
  },
  {
    testId: 'history-moderate-1',
    title: 'Modern History - Set 1',
    description: 'Moderate level questions from Modern India (1857-1947)',
    durationMinutes: 20,
    price: 199,
    questions: [
      { text: 'Who started the Home Rule League?', options: ['Tilak and Besant', 'Gandhi', 'Nehru', 'Lajpat Rai'], answer: 0 },
      { text: 'When was the Quit India Movement launched?', options: ['1940', '1942', '1945', '1947'], answer: 1 },
      { text: 'Who was known as the "Lion of Punjab"?', options: ['Lala Lajpat Rai', 'Bhagat Singh', 'Chandra Shekhar Azad', 'Subhash Chandra Bose'], answer: 0 },
      { text: 'The Jallianwala Bagh massacre took place in which year?', options: ['1917', '1919', '1921', '1923'], answer: 1 },
    ],
  },
  {
    testId: 'history-ancient-1',
    title: 'Ancient History - Indus Valley Civilization',
    description: 'Questions on ancient Indian history and civilizations',
    durationMinutes: 15,
    price: 149,
    questions: [
      { text: 'Which river was the mainstay of Harappan civilization?', options: ['Ganga', 'Indus', 'Saraswati', 'Yamuna'], answer: 1 },
      { text: 'The Great Bath is found in which Harappan site?', options: ['Mohenjo-daro', 'Harappa', 'Lothal', 'Kalibangan'], answer: 0 },
      { text: 'Who was the author of Arthashastra?', options: ['Kautilya', 'Panini', 'Kalidas', 'Banabhatta'], answer: 0 },
    ],
  },
  {
    testId: 'economy-basics-1',
    title: 'Indian Economy - Basics',
    description: 'Fundamental concepts of Indian economy and planning',
    durationMinutes: 20,
    price: 199,
    questions: [
      { text: 'What does GDP stand for?', options: ['Gross Domestic Product', 'General Domestic Product', 'Gross Development Plan', 'General Development Plan'], answer: 0 },
      { text: 'Which Five Year Plan focused on Green Revolution?', options: ['Second', 'Third', 'Fourth', 'Fifth'], answer: 1 },
      { text: 'What is the base year for GDP calculation in India (as of 2020)?', options: ['2010-11', '2011-12', '2012-13', '2013-14'], answer: 1 },
      { text: 'Which organization publishes the Economic Survey?', options: ['RBI', 'Ministry of Finance', 'NITI Aayog', 'Planning Commission'], answer: 1 },
    ],
  },
  {
    testId: 'geography-india-1',
    title: 'Geography of India - Physical Features',
    description: 'Questions on physical geography, rivers, mountains of India',
    durationMinutes: 18,
    price: 179,
    questions: [
      { text: 'Which is the highest peak in India?', options: ['Mount Everest', 'Kanchenjunga', 'Nanda Devi', 'Godwin Austen'], answer: 1 },
      { text: 'Which river is also known as Dakshin Ganga?', options: ['Krishna', 'Godavari', 'Cauvery', 'Mahanadi'], answer: 1 },
      { text: 'The Tropic of Cancer passes through how many Indian states?', options: ['6', '7', '8', '9'], answer: 2 },
      { text: 'Which is the largest state of India by area?', options: ['Rajasthan', 'Madhya Pradesh', 'Maharashtra', 'Uttar Pradesh'], answer: 0 },
    ],
  },
  {
    testId: 'science-physics-1',
    title: 'Science - Physics Basics',
    description: 'Fundamental questions on physics concepts',
    durationMinutes: 15,
    price: 149,
    questions: [
      { text: 'What is the SI unit of force?', options: ['Joule', 'Newton', 'Watt', 'Pascal'], answer: 1 },
      { text: 'Which law states that energy cannot be created or destroyed?', options: ['First Law of Thermodynamics', 'Second Law', 'Law of Conservation', 'Ohms Law'], answer: 2 },
      { text: 'What is the speed of light in vacuum?', options: ['3 × 10^8 m/s', '3 × 10^6 m/s', '3 × 10^10 m/s', '3 × 10^5 m/s'], answer: 0 },
    ],
  },
  {
    testId: 'science-chemistry-1',
    title: 'Science - Chemistry Basics',
    description: 'Basic chemistry concepts and periodic table',
    durationMinutes: 15,
    price: 149,
    questions: [
      { text: 'What is the chemical symbol for Gold?', options: ['Go', 'Gd', 'Au', 'Ag'], answer: 2 },
      { text: 'What is the pH of pure water?', options: ['5', '6', '7', '8'], answer: 2 },
      { text: 'How many elements are there in the modern periodic table?', options: ['110', '118', '120', '125'], answer: 1 },
    ],
  },
  {
    testId: 'reasoning-logical-1',
    title: 'Logical Reasoning - Set 1',
    description: 'Logical reasoning and analytical questions',
    durationMinutes: 20,
    price: 199,
    questions: [
      { text: 'If all roses are flowers and some flowers are red, then:', options: ['All roses are red', 'Some roses are red', 'No conclusion', 'All flowers are roses'], answer: 1 },
      { text: 'What comes next: 2, 6, 12, 20, ?', options: ['28', '30', '32', '34'], answer: 1 },
      { text: 'A is taller than B, B is taller than C. Who is tallest?', options: ['A', 'B', 'C', 'Cannot determine'], answer: 0 },
    ],
  },
  {
    testId: 'current-affairs-2024-1',
    title: 'Current Affairs - 2024',
    description: 'Important current affairs and general knowledge',
    durationMinutes: 15,
    price: 179,
    questions: [
      { text: 'Which country hosted the G20 Summit in 2023?', options: ['India', 'Brazil', 'Indonesia', 'Japan'], answer: 0 },
      { text: 'Who won the Nobel Peace Prize in 2023?', options: ['Narges Mohammadi', 'Maria Ressa', 'Malala Yousafzai', 'Greta Thunberg'], answer: 0 },
    ],
  },
];

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [payload, setPayload] = useState(JSON.stringify(sample, null, 2));
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const createTest = async () => {
    setResult("");
    setLoading(true);
    try {
      const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const r = await fetch(`${api}/api/admin/tests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: payload,
      });
      const j = await r.json().catch(() => ({}));
      setResult(`${r.status} ${r.ok ? "OK" : "ERROR"}: ${JSON.stringify(j, null, 2)}`);
    } catch (e: any) {
      setResult(`ERROR: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const seedDummyTests = async () => {
    if (!adminKey) {
      setResult("ERROR: Admin API key is required");
      return;
    }
    setResult("");
    setLoading(true);
    const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    try {
      const results = [];
      for (const test of dummyTests) {
        const r = await fetch(`${api}/api/admin/tests`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": adminKey,
          },
          body: JSON.stringify(test),
        });
        const j = await r.json().catch(() => ({}));
        results.push({ testId: test.testId, status: r.status, ok: r.ok, response: j });
      }
      const successCount = results.filter(r => r.ok).length;
      setResult(`Created ${successCount}/${dummyTests.length} tests successfully!\n\n${JSON.stringify(results, null, 2)}`);
    } catch (e: any) {
      setResult(`ERROR: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: 'calc(100vh - 80px)', padding: '40px 24px', background: 'var(--gray-50)' }}>
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '8px' }}>
          Admin Dashboard
        </h1>
        <p style={{ color: 'var(--gray-600)', fontSize: '16px', marginBottom: '32px' }}>
          Manage tests and platform settings using your admin API key
        </p>

        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--gray-900)' }}>
            Admin API Key
          </label>
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            className="input"
            placeholder="Enter your admin API key (x-admin-key)"
            style={{ marginBottom: '16px' }}
          />
          <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '16px' }}>
            Set this in your backend environment as <code style={{ background: 'var(--gray-100)', padding: '2px 6px', borderRadius: '4px' }}>ADMIN_API_KEY</code>
          </p>
          <button
            onClick={seedDummyTests}
            className="btn btn-primary"
            disabled={loading || !adminKey}
            style={{ width: '100%', opacity: loading || !adminKey ? 0.6 : 1, cursor: loading || !adminKey ? 'not-allowed' : 'pointer', marginBottom: '12px' }}
          >
            {loading ? "Creating Tests..." : "🚀 Seed 10 Dummy Tests"}
          </button>
          <p style={{ fontSize: '12px', color: 'var(--gray-500)', textAlign: 'center' }}>
            This will create 10 dummy tests covering Polity, History, Economy, Geography, Science, Reasoning, and Current Affairs
          </p>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontSize: '16px', fontWeight: 600, color: 'var(--gray-900)' }}>
            Create Test - JSON Payload
          </label>
          <textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            className="textarea"
            rows={20}
            style={{ fontFamily: 'monospace', fontSize: '13px', marginBottom: '16px' }}
          />
          <button
            onClick={createTest}
            className="btn btn-primary"
            disabled={loading || !adminKey}
            style={{ width: '100%', opacity: loading || !adminKey ? 0.6 : 1, cursor: loading || !adminKey ? 'not-allowed' : 'pointer' }}
          >
            {loading ? "Creating..." : "Create Test"}
          </button>
        </div>

        {result && (
          <div className="card" style={{ marginTop: '24px', padding: '20px', background: result.includes('OK') ? '#d1fae5' : '#fee2e2', border: 'none' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: 'var(--gray-900)' }}>
              Response
            </h3>
            <pre style={{
              background: 'var(--white)',
              padding: '16px',
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '13px',
              lineHeight: 1.6,
              border: '1px solid var(--gray-200)',
            }}>
              {result}
            </pre>
          </div>
        )}

        <div className="card" style={{ marginTop: '24px', padding: '20px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--gray-900)' }}>
            Dummy Tests Preview ({dummyTests.length} tests)
          </h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            {dummyTests.map((test, index) => (
              <div
                key={test.testId}
                style={{
                  padding: '16px',
                  background: 'var(--gray-50)',
                  borderRadius: '8px',
                  border: '1px solid var(--gray-200)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '4px' }}>
                      {test.title}
                    </h4>
                    <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '8px' }}>
                      {test.description}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gray-900)' }}>
                      ₹{test.price}
                    </div>
                    {test.price === 0 && (
                      <span style={{ fontSize: '12px', color: 'var(--green-600)', fontWeight: 600 }}>FREE</span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--gray-600)' }}>
                  <span>⏱️ {test.durationMinutes} min</span>
                  <span>📝 {test.questions.length} questions</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--gray-500)' }}>ID: {test.testId}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginTop: '24px', padding: '20px', background: 'var(--gray-50)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: 'var(--gray-900)' }}>
            Example Payload Structure
          </h3>
          <pre style={{
            background: 'var(--white)',
            padding: '16px',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '12px',
            lineHeight: 1.6,
          }}>
{JSON.stringify(sample, null, 2)}
          </pre>
        </div>
      </div>
    </main>
  );
}
