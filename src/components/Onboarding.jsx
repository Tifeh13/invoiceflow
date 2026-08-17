import { X, Building2, ListPlus, Printer } from 'lucide-react';

const STEPS = [
  { icon: Building2, title: 'Add your business', desc: 'Name, email and address appear at the top of every invoice.' },
  { icon: ListPlus, title: 'Add line items', desc: 'Hourly, fixed or quantity-based — totals calculate themselves.' },
  { icon: Printer, title: 'Export & send', desc: 'Download a perfect PDF or share a private link with your client.' },
];

export default function Onboarding({ onDismiss }) {
  return (
    <div className="onboarding">
      <button className="icon-btn onboarding-close" onClick={onDismiss} aria-label="Dismiss">
        <X size={16} />
      </button>
      <div className="onboarding-head">
        <span className="eyebrow">Welcome 👋</span>
        <h3>Your first invoice in 3 steps</h3>
      </div>
      <div className="onboarding-steps">
        {STEPS.map((s, i) => (
          <div className="onboarding-step" key={s.title}>
            <span className="onboarding-num">{i + 1}</span>
            <div className="onboarding-icon"><s.icon size={17} /></div>
            <div>
              <strong>{s.title}</strong>
              <p>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="btn btn-primary btn-sm" onClick={onDismiss}>Got it — let’s go</button>
    </div>
  );
}
