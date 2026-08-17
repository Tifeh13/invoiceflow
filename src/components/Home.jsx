import { useState } from 'react';
import {
  ArrowRight, Calculator, Check, ChevronDown, Clock, FileText, Globe, Heart,
  LayoutTemplate, Palette, Printer, Rocket, Sparkles, Wallet, Zap,
} from 'lucide-react';
import { TEMPLATES } from '../lib/templates';

/* ---------- hero mock invoice (pure CSS, always renders) ---------- */
function HeroVisual() {
  return (
    <div className="hero-visual" aria-hidden="true">
      <div className="glow-blob" />
      <div className="mock-card">
        <div className="mock-head">
          <span className="mock-logo" />
          <div className="mock-titles">
            <span className="mock-line mock-title" />
            <span className="mock-line mock-sub" />
          </div>
          <span className="mock-chip">INVOICE</span>
        </div>
        <div className="mock-rows">
          {[82, 66, 58].map((w, i) => (
            <div className="mock-row" key={i}>
              <span className="mock-line" style={{ width: `${w}%` }} />
              <span className="mock-line mock-amt" style={{ width: '22%' }} />
            </div>
          ))}
        </div>
        <div className="mock-total">
          <span className="mock-line" style={{ width: '30%' }} />
          <span className="mock-total-amt">$2,500.00</span>
        </div>
      </div>
      <div className="float-badge paid">
        <span className="float-check"><Check size={12} /></span>
        Payment received <strong>$1,250.00</strong>
      </div>
      <div className="float-badge pdf">
        <FileText size={14} /> PDF ready
      </div>
      <div className="float-badge tpl">
        <Sparkles size={14} /> Bold template
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }) {
  return (
    <div className="feature-card">
      <div className="icon-tile"><Icon size={20} /></div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

function TemplateThumb({ id }) {
  return (
    <div className={`thumb tmpl-${id}`}>
      <div className="thumb-band" />
      <div className="thumb-line thumb-line-title" />
      <div className="thumb-line" />
      <div className="thumb-line short" />
      <div className="thumb-row">
        <div className="thumb-line thin" />
        <div className="thumb-pill" />
      </div>
    </div>
  );
}

export default function Home({ onOpenBuilder }) {
  const [faqOpen, setFaqOpen] = useState(null);

  const features = [
    { icon: LayoutTemplate, title: '6 professional templates', desc: 'From clean minimal to bold statement designs — pick a look that matches your brand.' },
    { icon: Printer, title: 'PDF in one click', desc: 'Print-perfect A4 output. Download, email or send a link in seconds.' },
    { icon: Calculator, title: 'Auto calculations', desc: 'Subtotals, discounts and taxes computed live as you type. Zero spreadsheet math.' },
    { icon: Wallet, title: 'Multi-currency support', desc: 'Bill in USD, EUR, GBP, NGN, GHS, KES, ZAR and more with accurate formatting.' },
    { icon: Clock, title: 'Auto-saved drafts', desc: 'Your work is saved locally as you type. Close the tab, come back anytime.' },
    { icon: Globe, title: 'Works everywhere', desc: 'A fast web app that runs in any browser — desktop, tablet or phone.' },
  ];

  const perks = [
    { icon: Heart, title: '100% free forever', desc: 'Every template, every feature — no paywall, no trial countdown, no locked buttons.' },
    { icon: Sparkles, title: 'No watermark, no upsells', desc: 'Your invoices are yours, in full. Clean, professional output — always.' },
    { icon: Check, title: 'Private by design', desc: 'No account, no server uploads. Your data never leaves your device.' },
  ];

  const faqs = [
    ['Is InvoiceFlow really free?', 'Yes — 100%, forever. All six templates, PDF export and the invoice library are free with no watermark, no premium tiers and no upsells.'],
    ['Do I need an account?', 'Nope. Open the builder, type, done. Everything is saved automatically in your browser — nothing is uploaded anywhere.'],
    ['Can I use my own logo and colors?', 'Absolutely. Upload your logo in the builder and it appears right on the invoice. Pick the template that best fits your brand.'],
    ['How do I send the invoice to a client?', 'Hit “Download PDF” and choose Save as PDF in the print dialog, then email the file — or just print it. It comes out crisp on A4.'],
    ['Is my data safe?', 'Your invoices live only on your device (localStorage). You can delete or replace any saved invoice from your library at any time.'],
    ['What currencies are supported?', 'USD, EUR, GBP, NGN, GHS, KES, ZAR, CAD and AUD — with correct symbols and formatting for each.'],
  ];

  return (
    <div id="top">
      {/* HERO */}
      <header className="hero">
        <div className="hero-bg" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow"><Sparkles size={13} /> 6 templates · PDF export · free forever</span>
            <h1>Invoices that <span className="grad">get you paid.</span></h1>
            <p className="hero-sub">
              Create beautiful, professional invoices in minutes — no accounts, no paywalls,
              no watermark. Just a lovely tool that makes you look good.
            </p>
            <div className="hero-ctas">
              <button className="btn btn-primary btn-lg" onClick={onOpenBuilder}>
                Create your first invoice <ArrowRight size={18} />
              </button>
              <a className="btn btn-soft btn-lg" href="#templates">
                Browse templates
              </a>
            </div>
            <div className="hero-trust">
              {['100% free forever', 'No account required', 'Your data stays on your device'].map((t) => (
                <span key={t}><Check size={13} /> {t}</span>
              ))}
            </div>
          </div>
          <HeroVisual />
        </div>
      </header>

      {/* FEATURES */}
      <section className="section" id="features">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Why InvoiceFlow</span>
            <h2>Everything you need to look professional</h2>
            <p>No bloated accounting suites. Just fast, beautiful invoicing that makes you look good and get paid faster.</p>
          </div>
          <div className="grid-3">
            {features.map((f) => <Feature key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* TEMPLATES */}
      <section className="section section-alt" id="templates">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Templates</span>
            <h2>Pick a template, make it yours</h2>
            <p>All six designs are free. Switch between them live in the builder until it feels right.</p>
          </div>
          <div className="template-grid">
            {TEMPLATES.map((t) => (
              <div className="template-card" key={t.id}>
                <div className={`thumb-wrap tint-${t.id}`}>
                  <TemplateThumb id={t.id} />
                </div>
                <div className="template-body">
                  <h3>{t.name}</h3>
                  <p>{t.desc}</p>
                  <button className="btn btn-soft btn-sm" onClick={onOpenBuilder}>
                    Use this template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">How it works</span>
            <h2>Three steps to paid</h2>
          </div>
          <div className="grid-3 steps">
            <div className="step">
              <div className="step-num"><Rocket size={18} /></div>
              <h3>1. Fill in your details</h3>
              <p>Business info, client, line items, tax — everything updates live in the preview.</p>
            </div>
            <div className="step">
              <div className="step-num"><Palette size={18} /></div>
              <h3>2. Pick your template</h3>
              <p>Switch between six designs and see the result instantly, before you send anything.</p>
            </div>
            <div className="step">
              <div className="step-num"><Zap size={18} /></div>
              <h3>3. Download & send</h3>
              <p>Export a print-perfect PDF, save it to your library, and send it to your client.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FREE FOREVER */}
      <section className="section section-alt" id="free">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">The deal</span>
            <h2>Free, lovely, and yours</h2>
          </div>
          <div className="grid-3 perks">
            {perks.map((p) => (
              <div className="perk" key={p.title}>
                <div className="perk-icon"><p.icon size={18} /></div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq">
        <div className="container container-narrow">
          <div className="section-head">
            <span className="eyebrow">FAQ</span>
            <h2>Questions, answered</h2>
          </div>
          <div className="faq">
            {faqs.map(([q, a], i) => (
              <details key={q} open={faqOpen === i} onToggle={(e) => setFaqOpen(e.target.open ? i : null)}>
                <summary>{q} <ChevronDown size={16} /></summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container cta-box">
          <h2>Ready to get paid faster?</h2>
          <p>Join thousands of freelancers sending beautiful invoices every day. It’s free, and it takes two minutes.</p>
          <button className="btn btn-light btn-lg" onClick={onOpenBuilder}>
            Create your free invoice <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </div>
  );
}
