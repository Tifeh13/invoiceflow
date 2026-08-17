export default function EmptyState({ icon: Icon, title, desc, action }) {
  return (
    <div className="empty-state illustrated">
      <div className="empty-art">
        <svg width="120" height="96" viewBox="0 0 120 96" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="eg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#4F46E5" />
              <stop offset="1" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          {/* sheet */}
          <rect x="28" y="14" width="54" height="68" rx="7" fill="#fff" stroke="#E3D5C6" strokeWidth="2" />
          <rect x="36" y="24" width="30" height="6" rx="3" fill="#C7BFAF" />
          <rect x="36" y="36" width="38" height="5" rx="2.5" fill="#EFE7DD" />
          <rect x="36" y="46" width="26" height="5" rx="2.5" fill="#EFE7DD" />
          <rect x="36" y="56" width="32" height="5" rx="2.5" fill="#EFE7DD" />
          {/* floating coin */}
          <circle cx="92" cy="30" r="13" fill="url(#eg)" />
          <circle cx="92" cy="30" r="8.5" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="2" />
          <path d="M92 25v10M88 28h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          {/* sparkles */}
          <path d="M18 26l1.8 4.2L24 32l-4.2 1.8L18 38l-1.8-4.2L12 32l4.2-1.8L18 26z" fill="#F2643D" />
          <path d="M102 62l1.4 3.1 3.1 1.4-3.1 1.4-1.4 3.1-1.4-3.1-3.1-1.4 3.1-1.4 1.4-3.1z" fill="#F59E0B" />
          {/* blob */}
          <ellipse cx="104" cy="78" rx="22" ry="8" fill="#4F46E5" fillOpacity="0.1" />
        </svg>
      </div>
      {Icon && <Icon size={20} className="empty-icon" />}
      <h3>{title}</h3>
      <p>{desc}</p>
      {action}
    </div>
  );
}
