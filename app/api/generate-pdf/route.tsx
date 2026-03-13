import { NextRequest, NextResponse } from "next/server";
import {
  renderToBuffer,
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { COMPANY_INFO } from "@/lib/invoice-types";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LineItem {
  id: string;
  description: string;
  qty: number;
  rate: number;
}

interface InvoiceData {
  billTo: string;
  invoiceNumber: number;
  invoiceDate: string;
  serviceType: string;
  invoiceBy: string;
  paymentStatus: string;
  lineItems: LineItem[];
  discount: number;
  paymentReceived: number;
  paymentTerms: string;
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const BRAND  = "#ff0d13";
const BLACK  = "#111111";
const WHITE  = "#ffffff";
const BORDER = "#e8e8e8";
const GRAY   = "#666666";
const DIM    = "#444444";
const ALTROW = "#fcfcfc";

const statusColorMap: Record<string, string> = {
  Paid:           "#16a34a",
  "Partial Paid": BRAND,
  Unpaid:         BRAND,
};

// ─── Register font (Unbounded via Google Fonts CDN) ───────────────────────────
Font.register({
  family: "Unbounded",
  fonts: [
    { src: "https://fonts.gstatic.com/s/unbounded/v10/kmK6ZqmzsAaQA6Ms6IHD.woff2", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/unbounded/v10/kmK6ZqmzsAaQA6Ms6IHD.woff2", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/unbounded/v10/kmK6ZqmzsAaQA6Ms6IHD.woff2", fontWeight: 700 },
    { src: "https://fonts.gstatic.com/s/unbounded/v10/kmK6ZqmzsAaQA6Ms6IHD.woff2", fontWeight: 900 },
  ],
});

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily: "Unbounded",
    backgroundColor: WHITE,
    paddingHorizontal: 0,
    paddingVertical: 0,
    fontSize: 8,
    color: BLACK,
  },
  pad: { paddingHorizontal: 40 },

  // Header
  header: { paddingHorizontal: 40, paddingTop: 28, alignItems: "center" },
  logo: { height: 45, width: "auto", objectFit: "contain", marginBottom: 4 },
  addressLine: { fontSize: 7.5, color: "#555555", marginBottom: 2, textAlign: "center" },
  divider: { borderBottomWidth: 1, borderBottomColor: BORDER, marginTop: 10 },

  // Title
  titleRow: { paddingHorizontal: 40, paddingTop: 16, paddingBottom: 10, flexDirection: "row" },
  titleHi: { fontSize: 22, fontWeight: 900, color: BRAND },
  titleRest: { fontSize: 22, fontWeight: 900, color: BLACK },

  // Meta row
  metaRow: { paddingHorizontal: 40, paddingBottom: 14, flexDirection: "row" },
  billToCol: { width: 180 },
  billToLabel: { fontSize: 6.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: BLACK, marginBottom: 4 },
  billToValue: { fontSize: 8.5, fontWeight: 600, color: BLACK },
  invoiceFieldsCol: { flex: 1 },
  fieldRow: { flexDirection: "row", marginBottom: 3 },
  fieldLabel: { width: 100, fontSize: 6.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: BLACK },
  fieldValue: { flex: 1, fontSize: 8, color: BLACK },
  statusCol: { width: 150 },
  statusHeader: { paddingVertical: 10, paddingHorizontal: 8, alignItems: "center", justifyContent: "center" },
  statusHeaderText: { fontSize: 11, fontWeight: 700, color: WHITE, textAlign: "center", letterSpacing: 0.3 },
  statusValue: { borderWidth: 1, borderColor: BORDER, backgroundColor: "#f5f5f5", paddingVertical: 10, paddingHorizontal: 8, alignItems: "center", justifyContent: "center" },
  statusValueText: { fontSize: 11, fontWeight: 700, color: BLACK, textAlign: "center" },

  // Table
  tableWrap: { paddingHorizontal: 40, paddingTop: 14 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: BORDER },
  th: { fontSize: 7, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, paddingVertical: 7, paddingHorizontal: 10 },
  tr: { flexDirection: "row" },
  td: { fontSize: 8, paddingVertical: 7, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: BORDER, color: BLACK },

  // Totals
  totalsRow: { flexDirection: "row" },
  totalsCell: { paddingVertical: 4, paddingHorizontal: 10, color: WHITE, fontSize: 7.5 },
  balanceCell: { paddingVertical: 8, paddingHorizontal: 10, color: WHITE },

  // Footer sections
  sectionWrap: { paddingHorizontal: 40, paddingBottom: 16 },
  sectionLabel: { fontSize: 6.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: BLACK, marginBottom: 5 },
  sectionText: { fontSize: 7.5, color: DIM, lineHeight: 1.8 },

  // Pre-footer
  preFooter: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 40, paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: BORDER, borderTopStyle: "dashed",
    marginTop: "auto",
  },
  preFooterLeft: { fontSize: 6.5, color: GRAY },
  preFooterRight: { fontSize: 6.5, fontWeight: 500, color: BRAND },
});

// ─── Document ─────────────────────────────────────────────────────────────────
function InvoicePDF({ data }: { data: InvoiceData }) {
  const subTotal = data.lineItems.reduce((s, i) => s + i.qty * i.rate, 0);
  const balance  = subTotal - data.discount - data.paymentReceived;

  const formattedDate = data.invoiceDate
    ? new Date(data.invoiceDate + "T00:00:00").toLocaleDateString("en-GB", {
        day: "2-digit", month: "2-digit", year: "numeric",
      })
    : "—";

  const statusBg = statusColorMap[data.paymentStatus] ?? BRAND;

  const metaRows: [string, string, boolean][] = [
    ["Invoice Number", String(data.invoiceNumber), false],
    ["Invoice Date",   formattedDate,              false],
    ["Services Type",  data.serviceType || "—",    false],
    ["Invoice By",     data.invoiceBy   || "—",    true],
  ];

  const totalsRows: [string, string][] = [
    ["Sub Total", `$${subTotal.toFixed(2)}`],
    ["Discount",  `$${data.discount.toFixed(2)}`],
    ["Payment",   `$${data.paymentReceived.toFixed(2)}`],
  ];

  const bankRows: [string, string][] = [
    ["Account Title",  COMPANY_INFO.bankAccountTitle],
    ["Account Number", COMPANY_INFO.bankAccountNumber],
    ["IBAN",           COMPANY_INFO.iban],
    ["Bank Name",      COMPANY_INFO.bankName],
  ];

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── HEADER ── */}
        <View style={s.header}>
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/images-G1AmblSQK7dZoDxTk5QwyOw4Ylv3hh.png"
            style={s.logo}
          />
          <Text style={s.addressLine}>{COMPANY_INFO.address}</Text>
          <Text style={s.addressLine}>
            {COMPANY_INFO.website}  •  {COMPANY_INFO.email}  •  {COMPANY_INFO.ordersEmail}
          </Text>
          <Text style={s.addressLine}>
            {COMPANY_INFO.phones.join("  •  ")}
          </Text>
          <View style={s.divider} />
        </View>

        {/* ── TITLE ── */}
        <View style={s.titleRow}>
          <Text style={s.titleHi}>Hi!</Text>
          <Text style={s.titleRest}> This is Your Invoice.</Text>
        </View>

        {/* ── META ROW ── */}
        <View style={s.metaRow}>
          {/* Bill To */}
          <View style={s.billToCol}>
            <Text style={s.billToLabel}>BILL TO</Text>
            <Text style={s.billToValue}>{data.billTo || "—"}</Text>
          </View>

          {/* Invoice fields */}
          <View style={s.invoiceFieldsCol}>
            {metaRows.map(([label, value, bold]) => (
              <View key={label} style={s.fieldRow}>
                <Text style={s.fieldLabel}>{label.toUpperCase()}</Text>
                <Text style={[s.fieldValue, bold ? { fontWeight: 700 } : {}]}>{value}</Text>
              </View>
            ))}
          </View>

          {/* Payment Status */}
          <View style={s.statusCol}>
            <View style={[s.statusHeader, { backgroundColor: statusBg }]}>
              <Text style={s.statusHeaderText}>Payment Status</Text>
            </View>
            <View style={s.statusValue}>
              <Text style={s.statusValueText}>{data.paymentStatus}</Text>
            </View>
          </View>
        </View>

        {/* ── LINE ITEMS TABLE ── */}
        <View style={s.tableWrap}>
          {/* Header */}
          <View style={s.tableHeader}>
            <Text style={[s.th, { flex: 1, textAlign: "left" }]}>DESCRIPTION</Text>
            <Text style={[s.th, { width: 90, textAlign: "left" }]} />
            <Text style={[s.th, { width: 50, textAlign: "center" }]}>QTY</Text>
            <Text style={[s.th, { width: 70, textAlign: "right" }]}>RATE</Text>
            <Text style={[s.th, { width: 80, textAlign: "right" }]}>AMOUNT</Text>
          </View>

          {/* Rows */}
          {data.lineItems.map((item, idx) => {
            const amount = item.qty * item.rate;
            return (
              <View key={item.id} style={[s.tr, { backgroundColor: idx % 2 === 0 ? WHITE : ALTROW }]}>
                <Text style={[s.td, { flex: 1, fontWeight: 500 }]}>{item.description || "—"}</Text>
                <Text style={[s.td, { width: 90, fontSize: 7, color: GRAY }]}>
                  {item.rate === 0 ? "INCLUDED" : ""}
                </Text>
                <Text style={[s.td, { width: 50, textAlign: "center" }]}>{item.qty}</Text>
                <Text style={[s.td, { width: 70, textAlign: "right" }]}>
                  {item.rate === 0 ? "—" : `$${item.rate.toFixed(0)}`}
                </Text>
                <Text style={[s.td, { width: 80, textAlign: "right", fontWeight: 700 }]}>
                  {item.rate === 0 ? "—" : `$${amount.toFixed(0)}`}
                </Text>
              </View>
            );
          })}

          {/* Totals */}
          {totalsRows.map(([label, value]) => (
            <View key={label} style={[s.totalsRow, { backgroundColor: BRAND }]}>
              <View style={{ flex: 1 }} />
              <Text style={[s.totalsCell, { width: 90, textAlign: "left" }]}>{label}</Text>
              <Text style={[s.totalsCell, { width: 80, textAlign: "right", fontWeight: 700 }]}>{value}</Text>
            </View>
          ))}

          {/* Balance */}
          <View style={[s.totalsRow, { backgroundColor: BRAND }]}>
            <View style={{ flex: 1 }} />
            <Text style={[s.balanceCell, { width: 90, fontSize: 13, fontWeight: 900, textAlign: "left" }]}>Balance</Text>
            <Text style={[s.balanceCell, { width: 80, fontSize: 12, fontWeight: 900, textAlign: "right" }]}>${balance.toFixed(2)}</Text>
          </View>
        </View>

        {/* ── THANK YOU ── */}
        <View style={{ paddingHorizontal: 40, paddingTop: 24, paddingBottom: 20, flexDirection: "row" }}>
          <Text style={{ fontSize: 15, fontWeight: 900, color: BLACK }}>Thank you for your </Text>
          <Text style={{ fontSize: 15, fontWeight: 900, color: BRAND }}>business!</Text>
        </View>

        {/* ── PAYMENT TERMS ── */}
        <View style={s.sectionWrap}>
          <Text style={s.sectionLabel}>PAYMENT TERMS</Text>
          <Text style={s.sectionText}>{data.paymentTerms || "—"}</Text>
        </View>

        {/* ── PKR BANK ── */}
        <View style={s.sectionWrap}>
          <Text style={s.sectionLabel}>PKR BANK</Text>
          {bankRows.map(([label, value]) => (
            <Text key={label} style={s.sectionText}>{label}: {value}</Text>
          ))}
        </View>

        {/* ── PRE-FOOTER ── */}
        <View style={s.preFooter}>
          <Text style={s.preFooterLeft}>E. &amp; O. E</Text>
          <Text style={s.preFooterRight}>NOTE : Please email us the payment receipt.</Text>
        </View>

      </Page>
    </Document>
  );
}

// ─── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, fileName } = body as { data: InvoiceData; fileName: string };

    const pdfBuffer = await renderToBuffer(<InvoicePDF data={data} />);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName || "invoice"}.pdf"`,
      },
    });
  } catch (err) {
    console.error("[generate-pdf]", err);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}
