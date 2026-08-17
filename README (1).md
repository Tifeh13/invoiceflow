# InvoiceFlow

A simple, free invoice tool for freelancers and small businesses. Create clean, professional invoices in minutes — no clutter, no unnecessary fields.

## Features

- 📄 Create invoices & estimates with a live preview
- 🧾 Flexible line items — flat rate, per item, or time-based billing
- 💰 Optional discounts and tax/VAT
- 🎨 Multiple templates with customizable accent color
- 👥 Client management
- 💸 Expense tracking
- 🌍 Multi-currency support (USD, EUR, GBP, NGN, GHS, KES, ZAR, CAD, AUD)
- 🌐 Multi-language invoices (English, French, Spanish, German, Portuguese, Swahili)
- 📑 PDF export (A4 / Letter)
- 🌓 Light & dark mode
- 💾 Local-first — your data stays on your device (export/import backup as JSON anytime)

## Tech Stack

- React
- Vite
- (add any other libraries you're using — e.g. react-pdf, Tailwind CSS, etc.)

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Tifeh13/invoiceflow.git
cd invoiceflow

# Install dependencies
npm install

# Run the development server
npm run dev
```

The app will be available at `http://localhost:5174` (or the port shown in your terminal).

## Usage

1. Go to **Settings** to set your defaults — currency, invoice prefix, business name, payment terms
2. Create a new client under **Clients**
3. Click **New Invoice**, fill in line items, and preview it live
4. Export as PDF or share directly

## Data & Privacy

InvoiceFlow is currently **local-first** — all your invoices, clients, expenses, and settings are stored on your own device. Nothing is sent to a server. You can export a full backup (JSON) anytime under Settings → Export, and restore it later via Import.

## Roadmap

- [ ] Cloud sync across devices
- [ ] Payment tracking (partial/full payments)
- [ ] Recurring invoices
- [ ] Webhooks / Zapier integration
- [ ] Team accounts with roles
- [ ] Public API access
- [ ] Premium template packs

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to open an issue or submit a pull request.

## License

MIT
