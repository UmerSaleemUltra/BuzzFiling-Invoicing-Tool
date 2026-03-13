import { NextRequest, NextResponse } from "next/server";
import { COMPANY_INFO } from "@/lib/invoice-types";
import React from "react";

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

// ─── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, fileName } = body as { data: InvoiceData; fileName: string };

    // Dynamic import so Next.js doesn't try to statically analyse JSX in a .ts file
    const ReactPDF = await import("@react-pdf/renderer");
    const {
      renderToBuffer,
      Document,
      Page,
      View,
      Text,
      Image,
      StyleSheet,
      Font,
    } = ReactPDF;

    // Register font once
    Font.register({
      family: "Unbounded",
      fonts: [
        { src: "https://fonts.gstatic.com/s/unbounded/v10/kmK6ZqmzsAaQA6Ms6IHD.ttf", fontWeight: 400 },
        { src: "https://fonts.gstatic.com/s/unbounded/v10/kmK6ZqmzsAaQA6Ms6IHD.ttf", fontWeight: 600 },
        { src: "https://fonts.gstatic.com/s/unbounded/v10/kmK6ZqmzsAaQA6Ms6IHD.ttf", fontWeight: 700 },
        { src: "https://fonts.gstatic.com/s/unbounded/v10/kmK6ZqmzsAaQA6Ms6IHD.ttf", fontWeight: 900 },
      ],
    });

    const s = StyleSheet.create({
      page: { fontFamily: "Unbounded", backgroundColor: WHITE, fontSize: 8, color: BLACK },

      // Header
      header: { paddingHorizontal: 40, paddingTop: 28, alignItems: "center" },
      logo: { height: 45, objectFit: "contain", marginBottom: 4 },
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
        borderTopWidth: 1, borderTopColor: BORDER,
        marginTop: "auto",
      },
      preFooterLeft: { fontSize: 6.5, color: GRAY },
      preFooterRight: { fontSize: 6.5, fontWeight: 500, color: BRAND },
    });

    // ── Derived values ──
    const subTotal     = data.lineItems.reduce((acc, i) => acc + i.qty * i.rate, 0);
    const balance      = subTotal - data.discount - data.paymentReceived;
    const statusBg     = statusColorMap[data.paymentStatus] ?? BRAND;
    const formattedDate = data.invoiceDate
      ? new Date(data.invoiceDate + "T00:00:00").toLocaleDateString("en-GB", {
          day: "2-digit", month: "2-digit", year: "numeric",
        })
      : "—";

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

    // ── Build JSX document ──
    const doc = React.createElement(
      Document,
      null,
      React.createElement(
        Page,
        { size: "A4", style: s.page },

        // HEADER
        React.createElement(
          View, { style: s.header },
          React.createElement(Image, {
            src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo%20in%20white%20bg%20Png-zmjaho0wEkJAFnEvlbvwIEmIFSMfrW.png",
            style: s.logo,
          }),
          React.createElement(Text, { style: s.addressLine }, COMPANY_INFO.address),
          React.createElement(Text, { style: s.addressLine },
            `${COMPANY_INFO.website}  •  ${COMPANY_INFO.email}  •  ${COMPANY_INFO.ordersEmail}`
          ),
          React.createElement(Text, { style: s.addressLine }, COMPANY_INFO.phones.join("  •  ")),
          React.createElement(View, { style: s.divider }),
        ),

        // TITLE
        React.createElement(
          View, { style: s.titleRow },
          React.createElement(Text, { style: s.titleHi }, "Hi!"),
          React.createElement(Text, { style: s.titleRest }, " This is Your Invoice."),
        ),

        // META ROW
        React.createElement(
          View, { style: s.metaRow },
          // Bill To
          React.createElement(
            View, { style: s.billToCol },
            React.createElement(Text, { style: s.billToLabel }, "BILL TO"),
            React.createElement(Text, { style: s.billToValue }, data.billTo || "—"),
          ),
          // Invoice fields
          React.createElement(
            View, { style: s.invoiceFieldsCol },
            ...metaRows.map(([label, value, bold]) =>
              React.createElement(
                View, { key: label, style: s.fieldRow },
                React.createElement(Text, { style: s.fieldLabel }, label.toUpperCase()),
                React.createElement(Text, { style: [s.fieldValue, bold ? { fontWeight: 700 } : {}] }, value),
              )
            ),
          ),
          // Payment Status
          React.createElement(
            View, { style: s.statusCol },
            React.createElement(
              View, { style: [s.statusHeader, { backgroundColor: statusBg }] },
              React.createElement(Text, { style: s.statusHeaderText }, "Payment Status"),
            ),
            React.createElement(
              View, { style: s.statusValue },
              React.createElement(Text, { style: s.statusValueText }, data.paymentStatus),
            ),
          ),
        ),

        // LINE ITEMS TABLE
        React.createElement(
          View, { style: s.tableWrap },
          // Table header
          React.createElement(
            View, { style: s.tableHeader },
            React.createElement(Text, { style: [s.th, { flex: 1, textAlign: "left" }] }, "DESCRIPTION"),
            React.createElement(Text, { style: [s.th, { width: 90, textAlign: "left" }] }, ""),
            React.createElement(Text, { style: [s.th, { width: 50, textAlign: "center" }] }, "QTY"),
            React.createElement(Text, { style: [s.th, { width: 70, textAlign: "right" }] }, "RATE"),
            React.createElement(Text, { style: [s.th, { width: 80, textAlign: "right" }] }, "AMOUNT"),
          ),
          // Line item rows
          ...data.lineItems.map((item, idx) => {
            const amount = item.qty * item.rate;
            return React.createElement(
              View, { key: item.id, style: [s.tr, { backgroundColor: idx % 2 === 0 ? WHITE : ALTROW }] },
              React.createElement(Text, { style: [s.td, { flex: 1, fontWeight: 500 }] }, item.description || "—"),
              React.createElement(Text, { style: [s.td, { width: 90, fontSize: 7, color: GRAY }] },
                item.rate === 0 ? "INCLUDED" : ""
              ),
              React.createElement(Text, { style: [s.td, { width: 50, textAlign: "center" }] }, String(item.qty)),
              React.createElement(Text, { style: [s.td, { width: 70, textAlign: "right" }] },
                item.rate === 0 ? "—" : `$${item.rate.toFixed(0)}`
              ),
              React.createElement(Text, { style: [s.td, { width: 80, textAlign: "right", fontWeight: 700 }] },
                item.rate === 0 ? "—" : `$${amount.toFixed(0)}`
              ),
            );
          }),
          // Totals rows
          ...totalsRows.map(([label, value]) =>
            React.createElement(
              View, { key: label, style: [s.totalsRow, { backgroundColor: BRAND }] },
              React.createElement(View, { style: { flex: 1 } }),
              React.createElement(Text, { style: [s.totalsCell, { width: 90, textAlign: "left" }] }, label),
              React.createElement(Text, { style: [s.totalsCell, { width: 80, textAlign: "right", fontWeight: 700 }] }, value),
            )
          ),
          // Balance row
          React.createElement(
            View, { style: [s.totalsRow, { backgroundColor: BRAND }] },
            React.createElement(View, { style: { flex: 1 } }),
            React.createElement(Text, { style: [s.balanceCell, { width: 90, fontSize: 13, fontWeight: 900, textAlign: "left" }] }, "Balance"),
            React.createElement(Text, { style: [s.balanceCell, { width: 80, fontSize: 12, fontWeight: 900, textAlign: "right" }] }, `$${balance.toFixed(2)}`),
          ),
        ),

        // THANK YOU
        React.createElement(
          View, { style: { paddingHorizontal: 40, paddingTop: 24, paddingBottom: 20, flexDirection: "row" } },
          React.createElement(Text, { style: { fontSize: 15, fontWeight: 900, color: BLACK } }, "Thank you for your "),
          React.createElement(Text, { style: { fontSize: 15, fontWeight: 900, color: BRAND } }, "business!"),
        ),

        // PAYMENT TERMS
        React.createElement(
          View, { style: s.sectionWrap },
          React.createElement(Text, { style: s.sectionLabel }, "PAYMENT TERMS"),
          React.createElement(Text, { style: s.sectionText }, data.paymentTerms || "—"),
        ),

        // PKR BANK
        React.createElement(
          View, { style: s.sectionWrap },
          React.createElement(Text, { style: s.sectionLabel }, "PKR BANK"),
          ...bankRows.map(([label, value]) =>
            React.createElement(Text, { key: label, style: s.sectionText }, `${label}: ${value}`)
          ),
        ),

        // PRE-FOOTER
        React.createElement(
          View, { style: s.preFooter },
          React.createElement(Text, { style: s.preFooterLeft }, "E. & O. E"),
          React.createElement(Text, { style: s.preFooterRight }, "NOTE : Please email us the payment receipt."),
        ),
      ),
    );

    const pdfBuffer = await renderToBuffer(doc);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName || "invoice"}.pdf"`,
      },
    });
  } catch (err) {
    console.error("[generate-pdf]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
