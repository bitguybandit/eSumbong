import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link to="/" className="text-sm font-semibold text-blue-700 hover:underline">
          ← Back to eSumbong
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">Terms of Service</h1>
        <p className="mt-2 text-sm text-slate-500">
          Barangay San Isidro, Iloilo City · e-Sumbong Citizen Portal
        </p>

        <div className="mt-8 space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">1. Acceptance of Terms</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              By accessing and using the e-Sumbong Citizen Portal, you agree to comply with these Terms
              of Service. This platform is operated in coordination with the local government of
              Barangay San Isidro, Iloilo City.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">2. Acceptable Use &amp; Conduct</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              This platform relies on the honesty and integrity of our community. You agree to submit
              only genuine, accurate, and truthful reports. You strictly shall not:
            </p>
            <ul className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                <span>Submit false, fabricated, or duplicate reports to overwhelm the system.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                <span>Use the platform to harass, defame, or target specific individuals.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                <span>Upload inappropriate, offensive, or explicit media.</span>
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">3. Account Suspension &amp; Legal Action</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Abuse of the e-Sumbong platform wastes valuable civic resources. The administrators
              reserve the right to suspend or permanently ban accounts found violating the acceptable
              use policy. Submitting fraudulent reports may subject you to penalties under applicable
              Philippine laws.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">4. Limitation of Liability</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              e-Sumbong is provided as a civic tool. While we strive for high availability, the platform
              developers and the local government of Barangay San Isidro are not legally liable for
              network outages, delayed officer responses, or any damages arising from the use or
              inability to use the service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
