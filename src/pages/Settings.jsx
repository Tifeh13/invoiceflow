import { useState } from 'react';
import { Download, Upload, Moon, Sun, Trash2, Palette } from 'lucide-react';
import { getSettings, setSettings, exportAll, importAll, resetAll } from '../lib/store';
import { CURRENCIES } from '../lib/format';
import { LANGUAGES } from '../lib/i18n';

export default function Settings({ onToast, onThemeChange }) {
  const [s, setS] = useState(getSettings());
  const apply = (patch) => {
    const next = setSettings(patch);
    setS(next);
    if (patch.theme) onThemeChange(next.theme);
    onToast('Settings saved');
  };

  const doExport = () => {
    const blob = new Blob([exportAll()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `invoiceflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    onToast('Backup downloaded');
  };

  const doImport = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importAll(String(reader.result));
        setS(getSettings());
        onToast('Backup restored — reloading…');
        setTimeout(() => location.reload(), 700);
      } catch {
        onToast('That file is not a valid InvoiceFlow backup');
      }
    };
    reader.readAsText(file);
  };

  const doReset = () => {
    if (window.confirm('Delete ALL invoices, clients, expenses and settings? This cannot be undone. Export a backup first!')) {
      resetAll();
      location.hash = '#/app/dashboard';
      setTimeout(() => location.reload(), 200);
    }
  };

  return (
    <div className="page page-narrow">
      <div className="page-head">
        <div>
          <h1>Settings</h1>
          <p>Defaults, appearance and your data.</p>
        </div>
      </div>

      <Section title="Appearance" icon={<Palette size={15} />}>
        <div className="settings-row">
          <div>
            <strong>Theme</strong>
            <span className="field-hint">Warm light or cozy dark — applies to the whole app.</span>
          </div>
          <div className="segmented">
            <button className={s.theme !== 'dark' ? 'active' : ''} onClick={() => apply({ theme: 'light' })}><Sun size={14} /> Light</button>
            <button className={s.theme === 'dark' ? 'active' : ''} onClick={() => apply({ theme: 'dark' })}><Moon size={14} /> Dark</button>
          </div>
        </div>
        <div className="settings-row">
          <div>
            <strong>Accent color</strong>
            <span className="field-hint">Used by the Minimal & Modern templates on your invoices.</span>
          </div>
          <div className="accent-picker">
            <input type="color" value={s.accent} onChange={(e) => apply({ accent: e.target.value })} />
            <span>{s.accent}</span>
          </div>
        </div>
      </Section>

      <Section title="Defaults" icon={<Download size={15} />}>
        <div className="field-row">
          <div className="field"><span className="field-label">Default currency</span>
            <select className="input" value={s.currency} onChange={(e) => apply({ currency: e.target.value })}>
              {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.label.split('—')[1]}</option>)}
            </select>
          </div>
          <div className="field"><span className="field-label">Show converted to</span>
            <select className="input" value={s.secondaryCurrency} onChange={(e) => apply({ secondaryCurrency: e.target.value })}>
              {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
            </select>
          </div>
        </div>
        <div className="field-row">
          <div className="field"><span className="field-label">Invoice language</span>
            <select className="input" value={s.language} onChange={(e) => apply({ language: e.target.value })}>
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </div>
          <div className="field"><span className="field-label">Paper size</span>
            <select className="input" value={s.paper} onChange={(e) => apply({ paper: e.target.value })}>
              <option value="A4">A4</option>
              <option value="Letter">Letter (US)</option>
            </select>
          </div>
        </div>
        <div className="field-row">
          <div className="field"><span className="field-label">Invoice prefix</span><input className="input" value={s.prefix} onChange={(e) => apply({ prefix: e.target.value })} /></div>
          <div className="field"><span className="field-label">Estimate prefix</span><input className="input" value={s.estimatePrefix} onChange={(e) => apply({ estimatePrefix: e.target.value })} /></div>
        </div>
        <div className="field"><span className="field-label">Your business name (for new invoices)</span><input className="input" value={s.businessName} onChange={(e) => apply({ businessName: e.target.value })} placeholder="Adeola Creative Studio" /></div>
        <div className="field"><span className="field-label">Default payment terms</span><input className="input" value={s.footer} onChange={(e) => apply({ footer: e.target.value })} /></div>
      </Section>

      <Section title="Your data" icon={<Upload size={15} />}>
        <div className="settings-row">
          <div>
            <strong>Export backup</strong>
            <span className="field-hint">Everything — invoices, clients, expenses, settings — as JSON.</span>
          </div>
          <button className="btn btn-soft btn-sm" onClick={doExport}><Download size={14} /> Export</button>
        </div>
        <div className="settings-row">
          <div>
            <strong>Import backup</strong>
            <span className="field-hint">Restore from a previously exported file.</span>
          </div>
          <label className="btn btn-soft btn-sm">
            <Upload size={14} /> Import
            <input type="file" accept="application/json" className="sr-only" onChange={(e) => e.target.files?.[0] && doImport(e.target.files[0])} />
          </label>
        </div>
        <div className="settings-row danger-row">
          <div>
            <strong>Reset everything</strong>
            <span className="field-hint">Deletes all local data. Consider exporting first.</span>
          </div>
          <button className="btn btn-ghost btn-sm danger" onClick={doReset}><Trash2 size={14} /> Reset</button>
        </div>
        <p className="field-hint">Cloud sync, webhooks/Zapier, team roles and an API need a hosted backend — the local-first version keeps everything on this device.</p>
      </Section>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="card settings-section">
      <h3>{icon} {title}</h3>
      <div className="settings-body">{children}</div>
    </div>
  );
}
