import {
  LayoutDashboard, FileText, Users, ReceiptText, Settings, Moon, Sun, Plus, ArrowLeft,
} from 'lucide-react';

export default function AppNav({ route, navigate, theme, onToggleTheme, onHome }) {
  const items = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '#/app/dashboard' },
    { key: 'invoices', label: 'Invoices', icon: FileText, href: '#/app/invoices' },
    { key: 'clients', label: 'Clients', icon: Users, href: '#/app/clients' },
    { key: 'expenses', label: 'Expenses', icon: ReceiptText, href: '#/app/expenses' },
    { key: 'settings', label: 'Settings', icon: Settings, href: '#/app/settings' },
  ];

  const active = route.split('/')[2] || 'dashboard';

  return (
    <aside className="appnav">
      <button className="appnav-logo" onClick={onHome} aria-label="InvoiceFlow home">
        <img src="/logo.svg" alt="" width="28" height="28" />
        <span>InvoiceFlow</span>
      </button>

      <button className="btn btn-primary btn-sm btn-block appnav-new" onClick={() => navigate('#/app/invoices/new')}>
        <Plus size={15} /> New invoice
      </button>

      <nav className="appnav-links">
        {items.map((it) => (
          <a
            key={it.key}
            href={it.href}
            className={active === it.key ? 'active' : ''}
            onClick={(e) => { e.preventDefault(); navigate(it.href); }}
          >
            <it.icon size={17} /> {it.label}
          </a>
        ))}
      </nav>

      <div className="appnav-foot">
        <button className="appnav-tool" onClick={onToggleTheme}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <button className="appnav-tool" onClick={onHome}>
          <ArrowLeft size={16} /> Back to site
        </button>
      </div>
    </aside>
  );
}
