import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Footer from './components/Footer';
import AppNav from './components/AppNav';
import Builder from './components/Builder';
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import Clients from './pages/Clients';
import Expenses from './pages/Expenses';
import Settings from './pages/Settings';
import PublicInvoice from './pages/PublicInvoice';
import { getSettings, setSettings, runRecurring, migrateLegacy } from './lib/store';

function parseHash() {
  const h = location.hash || '#/';
  const path = h.slice(1) || '/';
  const [route, query = ''] = path.split('?');
  const params = Object.fromEntries(new URLSearchParams(query));
  return { route: route.replace(/\/+$/, '') || '/', params };
}

/* Landing-page section ids that plain `#anchor` links point to. Without this, the
   hash router would read `#features` as the route `features` and fall through to the
   dashboard instead of scrolling to the section. */
const LANDING_SECTIONS = ['features', 'templates', 'faq', 'top', 'free'];

function ScrollToAnchor({ id }) {
  useEffect(() => {
    if (id === 'top') window.scrollTo({ top: 0 });
    else document.getElementById(id)?.scrollIntoView();
  }, [id]);
  return null;
}

export default function App() {
  const [toast, setToast] = useState(null);
  const [, force] = useState(0);

  const navigate = (href) => {
    location.hash = href;
    force((n) => n + 1);
    window.scrollTo({ top: 0 });
  };

  const notify = (msg) => setToast(msg);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  /* one-time: migrate legacy data + run due recurring invoices */
  useEffect(() => {
    migrateLegacy();
    const generated = runRecurring();
    if (generated > 0) notify(`Recurring schedule generated ${generated} new invoice${generated > 1 ? 's' : ''}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* theme */
  const [theme, setTheme] = useState(() => getSettings().theme);
  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#171310' : '#FDFBF8');
  }, [theme]);

  const onHashChange = () => force((n) => n + 1);
  useEffect(() => {
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const { route, params } = parseHash();

  const openBuilder = () => navigate('#/app/invoices/new');

  /* ---------- public invoice (standalone) ---------- */
  if (route.startsWith('/i/')) {
    return <PublicInvoice id={route.slice(3)} navigate={navigate} />;
  }

  /* ---------- marketing landing ---------- */
  const section = route !== '/' && route !== '' ? route.replace(/^\/+/, '') : null;
  const isLanding = route === '/' || route === '' || LANDING_SECTIONS.includes(section);
  if (isLanding) {
    return (
      <div className="app">
        <Navbar page="home" onOpenBuilder={openBuilder} />
        <Home onOpenBuilder={openBuilder} />
        <Footer onOpenBuilder={openBuilder} />
        {toast && <div className="toast">{toast}</div>}
        {section && LANDING_SECTIONS.includes(section) && <ScrollToAnchor id={section} />}
      </div>
    );
  }

  /* ---------- app shell ---------- */
  const settings = getSettings();
  const appNav = (
    <AppNav
      route={route}
      navigate={navigate}
      theme={theme}
      onToggleTheme={() => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        setSettings({ theme: next });
      }}
      onHome={() => navigate('#/')}
    />
  );

  let content;
  if (route === '/app' || route === '/app/dashboard') {
    content = <Dashboard navigate={navigate} currency={settings.currency} />;
  } else if (route === '/app/invoices') {
    content = <Invoices navigate={navigate} onToast={notify} />;
  } else if (route === '/app/invoices/new') {
    content = <Builder mode="new" clientId={params.client} onBack={() => navigate('#/app/invoices')} onToast={notify} navigate={navigate} />;
  } else if (route.startsWith('/app/invoices/')) {
    content = <Builder mode="edit" invoiceId={route.split('/')[3]} onBack={() => navigate('#/app/invoices')} onToast={notify} navigate={navigate} />;
  } else if (route === '/app/clients') {
    content = <Clients navigate={navigate} onToast={notify} currency={settings.currency} />;
  } else if (route === '/app/expenses') {
    content = <Expenses onToast={notify} currency={settings.currency} />;
  } else if (route === '/app/settings') {
    content = <Settings onToast={notify} onThemeChange={(t) => setTheme(t)} />;
  } else {
    content = <Dashboard navigate={navigate} currency={settings.currency} />;
  }

  return (
    <div className="app-shell">
      {appNav}
      <main className="app-content">{content}</main>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
