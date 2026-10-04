import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link to="/" className="text-sm font-semibold text-blue-700 hover:underline">
          ← Back to eSumbong
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">
          Barangay San Isidro, Iloilo City · e-Sumbong Citizen Portal
        </p>

        <div className="mt-8 space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">1. Commitment to Privacy</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              We are committed to protecting your personal data in strict compliance with the{' '}
              <strong className="font-semibold text-slate-900">
                Data Privacy Act of 2012 (Republic Act No. 10173)
              </strong>
              . This policy explains how we collect, use, and protect your information within the
              e-Sumbong platform.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">2. Information We Collect</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              To facilitate verified civic reporting, we collect the following:
            </p>
            <ul className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                <span>
                  <strong className="font-semibold text-slate-900">Personal Identification:</strong>{' '}
                  Your name, email address, and mobile number.
                </span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                <span>
                  <strong className="font-semibold text-slate-900">Location Data:</strong> If
                  authorized via your device settings, we collect precise GPS coordinates to tag the
                  location of your incident reports.
                </span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                <span>
                  <strong className="font-semibold text-slate-900">Device &amp; Usage Data:</strong>{' '}
                  Standard connection logs, IP addresses, and application usage analytics to ensure
                  system stability.
                </span>
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">3. How We Use Your Data</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Your data is strictly used to:
            </p>
            <ul className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                <span>Verify your identity as a resident of the municipality.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                <span>Route your reports to the correct Barangay Officer for resolution.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                <span>Send automated status updates via push notifications, email, and SMS.</span>
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">4. Data Sharing &amp; Security</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Your personal information is stored securely and is only accessible by verified Barangay
              Officers and authorized system administrators. We do not sell, rent, or share your
              personal data with third-party marketers or unauthorized entities.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">5. Your Rights</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Under RA 10173, you have the right to access, correct, or request the deletion of your
              personal data. If you wish to permanently delete your e-Sumbong account and associated
              records, please contact the system administrator or submit a request through the Barangay
              Hall.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
