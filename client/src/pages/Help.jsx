import { Link } from 'react-router-dom';

export default function Help() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link to="/" className="text-sm font-semibold text-blue-700 hover:underline">
          ← Back to eSumbong
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">Help Center</h1>
        <p className="mt-2 text-sm text-slate-500">
          A quick guide to reporting, tracking, and managing your concerns on e-Sumbong.
        </p>

        <div className="mt-8 space-y-5">
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
            <h2 className="text-lg font-bold text-rose-800">1. Emergency Assistance</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              e-Sumbong is designed for standard civic reporting and non-emergency community issues.
              If you are experiencing a life-threatening emergency, a fire, or an active crime, do not
              use this app. Please immediately contact the Tandoc Hotline at{' '}
              <strong className="font-semibold text-rose-800">(033) 337-0812</strong> or dial your
              local emergency services.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">2. Submitting a Report</h2>
            <ul className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                <span>
                  <strong className="font-semibold text-slate-900">What to report:</strong> You can
                  report community concerns such as damaged infrastructure, waste management issues,
                  noise complaints, and public hazards.
                </span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                <span>
                  <strong className="font-semibold text-slate-900">Location accuracy:</strong> For the
                  fastest response, ensure your{' '}
                  <strong className="font-semibold text-slate-900">Location access</strong> is toggled
                  on in your settings so your report is automatically tagged with accurate GPS
                  coordinates.
                </span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                <span>
                  <strong className="font-semibold text-slate-900">Evidence:</strong> Provide clear
                  photos and concise descriptions to help Barangay Officers assess the situation
                  accurately.
                </span>
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">3. Tracking Your Report</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Once submitted, you can monitor your report&apos;s progress in the{' '}
              <strong className="font-semibold text-slate-900">Track</strong> or{' '}
              <strong className="font-semibold text-slate-900">My Complaints</strong> tabs. Reports
              will move through statuses such as <em>Pending</em>, <em>Acknowledged</em>, and{' '}
              <em>Resolved</em>.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">4. Account &amp; Notifications</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              To stay updated on your submissions, navigate to{' '}
              <strong className="font-semibold text-slate-900">Settings</strong> to enable or disable{' '}
              <strong className="font-semibold text-slate-900">Push notifications</strong>,{' '}
              <strong className="font-semibold text-slate-900">Email alerts</strong>, and{' '}
              <strong className="font-semibold text-slate-900">SMS updates</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
