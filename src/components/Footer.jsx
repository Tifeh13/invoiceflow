import { Heart } from 'lucide-react';

export default function Footer({ onOpenBuilder }) {
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img src="/logo.svg" alt="InvoiceFlow" width="36" height="36" />
          <p className="footer-tag">Invoices that get you paid — built for freelancers and small businesses. Free forever.</p>
          <span className="footer-free"><Heart size={13} /> 100% free, no catch</span>
        </div>
        <div className="footer-cols">
          <div className="footer-col">
            <h4>Product</h4>
            <button onClick={onOpenBuilder}>Invoice builder</button>
            <a href="#templates">Templates</a>
            <a href="#features">Features</a>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <a href="#faq">FAQ</a>
            <a href="#top">Back to top</a>
          </div>
          <div className="footer-col">
            <h4>Get started</h4>
            <button onClick={onOpenBuilder}>Create an invoice</button>
            <span className="footer-note">No account needed</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} InvoiceFlow. Free to use, forever.</span>
        <span className="footer-demo">Made with love for freelancers everywhere.</span>
      </div>
    </footer>
  );
}
