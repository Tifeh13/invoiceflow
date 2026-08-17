import { Menu, Sparkles, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar({ page, onOpenBuilder }) {
  const [open, setOpen] = useState(false);

  const links = [
    ['Features', '#features'],
    ['Templates', '#templates'],
    ['FAQ', '#faq'],
  ];

  if (page === 'builder') {
    return (
      <nav className="nav nav-compact">
        <div className="nav-inner">
          <button className="nav-logo" onClick={onOpenBuilder} aria-label="InvoiceFlow home">
            <img src="/logo.svg" alt="InvoiceFlow logo" width="30" height="30" />
            <span className="nav-word">InvoiceFlow</span>
          </button>
          <span className="chip-free"><Sparkles size={11} /> Free forever</span>
        </div>
      </nav>
    );
  }

  return (
    <nav className="nav">
      <div className="nav-inner">
        <a
          className="nav-logo"
          href="#top"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        >
          <img src="/logo.svg" alt="InvoiceFlow logo" width="30" height="30" />
          <span className="nav-word">InvoiceFlow</span>
        </a>

        <div className={`nav-links ${open ? 'open' : ''}`}>
          {links.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>
          ))}
          <button className="btn btn-primary btn-sm nav-cta" onClick={onOpenBuilder}>
            Open invoice builder
          </button>
        </div>

        <button className="icon-btn nav-burger" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </nav>
  );
}
