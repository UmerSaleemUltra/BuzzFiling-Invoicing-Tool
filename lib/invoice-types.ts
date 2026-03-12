export type PaymentStatus = "Paid" | "Partial Paid" | "Unpaid";

export type ServiceType =
  | "LLC Formation"
  | "ITIN"
  | "Registered Agent"
  | "NM LLC Formation + ITIN"
  | "Other";

export interface LineItem {
  id: string;
  description: string;
  qty: number;
  rate: number;
}

export interface InvoiceData {
  billTo: string;
  invoiceNumber: number;
  invoiceDate: string;
  serviceType: ServiceType;
  invoiceBy: string;
  paymentStatus: PaymentStatus;
  lineItems: LineItem[];
  discount: number;
  paymentReceived: number;
  paymentTerms: string;
}

export const COMPANY_INFO = {
  name: "BUZZ FILING",
  website: "www.buzzfiling.com",
  email: "hello@buzzfiling.com",
  ordersEmail: "orders.buzzfiling@gmail.com",
  phones: ["+92 3394882800", "+44 (774) 058-3294", "+1 (983) 983-3227"],
  address:
    "Office No. 503, Plot 67/3, Zulekha Trade Centre, Alamgir Rd, CP & Berar Society CP & Berar CHS, Karachi, 75300",
  bankAccountTitle: "BUZZ FILING",
  bankAccountNumber: "1176314943776",
  iban: "PK22UNIL0109000314943776",
  bankName: "United Bank Limited (UBL)",
};

export const DEFAULT_INVOICE: Omit<InvoiceData, "invoiceNumber"> = {
  billTo: "",
  invoiceDate: new Date().toISOString().split("T")[0],
  serviceType: "LLC Formation",
  invoiceBy: "",
  paymentStatus: "Unpaid",
  lineItems: [
    {
      id: crypto.randomUUID(),
      description: "",
      qty: 1,
      rate: 0,
    },
  ],
  discount: 0,
  paymentReceived: 0,
  paymentTerms: "",
};
