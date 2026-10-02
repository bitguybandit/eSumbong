import { useAuth } from '../../context/AuthContext';
import { BARANGAY_NAME, initials } from '../../lib/constants';

export default function Settings() {
  const { profile } = useAuth();

  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-[-0.5px] text-ink">Settings</h1>
        <p className="mt-1 text-[13px] text-ink-500">Account and system information.</p>
      </div>
      
    </div>
  );
}
