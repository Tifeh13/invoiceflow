export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' },
  { code: 'de', name: 'Deutsch' },
  { code: 'pt', name: 'Português' },
  { code: 'sw', name: 'Kiswahili' },
];

const EN = {
  invoice: 'INVOICE',
  estimate: 'ESTIMATE',
  billedTo: 'Billed to',
  invoiceNo: 'Invoice #',
  estimateNo: 'Estimate #',
  issueDate: 'Issue date',
  dueDate: 'Due date',
  poNumber: 'PO number',
  description: 'Description',
  qty: 'Qty',
  hours: 'Hours',
  rate: 'Rate',
  amount: 'Amount',
  subtotal: 'Subtotal',
  discount: 'Discount',
  tax: 'Tax',
  totalDue: 'Total due',
  notes: 'Notes',
  terms: 'Terms',
  paid: 'Paid',
  amountPaid: 'Amount paid',
  balanceDue: 'Balance due',
};

const T = {
  en: EN,
  fr: {
    invoice: 'FACTURE', estimate: 'DEVIS', billedTo: 'Facturé à', invoiceNo: 'N° facture', estimateNo: 'N° devis',
    issueDate: "Date d'émission", dueDate: 'Échéance', poNumber: 'N° bon de commande', description: 'Description',
    qty: 'Qté', hours: 'Heures', rate: 'Taux', amount: 'Montant', subtotal: 'Sous-total', discount: 'Remise',
    tax: 'Taxe', totalDue: 'Total dû', notes: 'Notes', terms: 'Conditions', paid: 'Payée', amountPaid: 'Montant payé', balanceDue: 'Solde dû',
  },
  es: {
    invoice: 'FACTURA', estimate: 'PRESUPUESTO', billedTo: 'Facturado a', invoiceNo: 'N.º factura', estimateNo: 'N.º presupuesto',
    issueDate: 'Fecha de emisión', dueDate: 'Vencimiento', poNumber: 'N.º pedido', description: 'Descripción',
    qty: 'Cant.', hours: 'Horas', rate: 'Tarifa', amount: 'Importe', subtotal: 'Subtotal', discount: 'Descuento',
    tax: 'Impuesto', totalDue: 'Total a pagar', notes: 'Notas', terms: 'Términos', paid: 'Pagada', amountPaid: 'Importe pagado', balanceDue: 'Saldo pendiente',
  },
  de: {
    invoice: 'RECHNUNG', estimate: 'ANGEBOT', billedTo: 'Rechnung an', invoiceNo: 'Rechnungs-Nr.', estimateNo: 'Angebots-Nr.',
    issueDate: 'Ausgestellt am', dueDate: 'Fällig am', poNumber: 'Bestell-Nr.', description: 'Beschreibung',
    qty: 'Menge', hours: 'Stunden', rate: 'Satz', amount: 'Betrag', subtotal: 'Zwischensumme', discount: 'Rabatt',
    tax: 'Steuer', totalDue: 'Gesamtbetrag', notes: 'Notizen', terms: 'Zahlungsbedingungen', paid: 'Bezahlt', amountPaid: 'Bezahlter Betrag', balanceDue: 'Offener Betrag',
  },
  pt: {
    invoice: 'FATURA', estimate: 'ORÇAMENTO', billedTo: 'Faturado a', invoiceNo: 'N.º fatura', estimateNo: 'N.º orçamento',
    issueDate: 'Data de emissão', dueDate: 'Vencimento', poNumber: 'N.º pedido', description: 'Descrição',
    qty: 'Qtd.', hours: 'Horas', rate: 'Tarifa', amount: 'Valor', subtotal: 'Subtotal', discount: 'Desconto',
    tax: 'Imposto', totalDue: 'Total a pagar', notes: 'Notas', terms: 'Termos', paid: 'Paga', amountPaid: 'Valor pago', balanceDue: 'Saldo em aberto',
  },
  sw: {
    invoice: 'BILI', estimate: 'MAKADIRIO', billedTo: 'Mteja', invoiceNo: 'Nambari ya bili', estimateNo: 'Nambari ya makadirio',
    issueDate: 'Tarehe ya toleo', dueDate: 'Tarehe ya malipo', poNumber: 'Nambari ya agizo', description: 'Maelezo',
    qty: 'Kiasi', hours: 'Saa', rate: 'Kiwango', amount: 'Jumla', subtotal: 'Jumla ndogo', discount: 'Punguzo',
    tax: 'Kodi', totalDue: 'Jumla ya kulipwa', notes: 'Maelezo ya ziada', terms: 'Masharti', paid: 'Imelipwa', amountPaid: 'Kiasi kilicholipwa', balanceDue: 'Salio',
  },
};

export const t = (lang, key) => (T[lang] && T[lang][key]) || EN[key] || key;
