"use client";

import { forwardRef, CSSProperties } from "react";
import { InvoiceData, COMPANY_INFO } from "@/lib/invoice-types";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  red:      "#e8000d",
  black:    "#111111",
  darkBg:   "#1a1a1a",
  darkBorder:"#2e2e2e",
  border:   "#e8e8e8",
  rowAlt:   "#fcfcfc",
  muted:    "#aaaaaa",
  subtle:   "#555555",
  dimText:  "#444444",
  grayText: "#666666",
  lightGray:"#e8e8e8",
  headerBg: "#e8e8e8",
  white:    "#ffffff",
} as const;

const BRAND = "#ff0d13";

const FONT = "'Unbounded', Arial, sans-serif";

const PAGE_W  = 794;   // A4 @ 96 dpi
const PAGE_H  = 1123;
const PAD     = 40;

const statusColorMap: Record<string, string> = {
  Paid:           "#16a34a",
  "Partial Paid": BRAND,
  Unpaid:         BRAND,
};

// ─── Shared style helpers ─────────────────────────────────────────────────────
const cell = (overrides: CSSProperties = {}): CSSProperties => ({
  padding: "8px 12px",
  borderBottom: `1px solid ${C.border}`,
  color: C.black,
  ...overrides,
});

const thStyle = (overrides: CSSProperties = {}): CSSProperties => ({
  padding: "8px 12px",
  fontWeight: "700",
  fontSize: "8px",
  letterSpacing: "0.6px",
  textTransform: "uppercase",
  color: C.black,
  ...overrides,
});

const labelStyle: CSSProperties = {
  fontSize: "7.5px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.8px",
  color: C.black,
  marginBottom: "6px",
};

// ─── Component ────────────────────────────────────────────────────────────────
interface InvoicePreviewProps {
  data: InvoiceData;
}

const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(({ data }, ref) => {
  // ── Derived values
  const subTotal = data.lineItems.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const balance  = subTotal - data.discount - data.paymentReceived;

  const formattedDate = data.invoiceDate
    ? new Date(data.invoiceDate + "T00:00:00").toLocaleDateString("en-GB", {
        day: "2-digit", month: "2-digit", year: "numeric",
      })
    : "";

  const statusBg = statusColorMap[data.paymentStatus] ?? BRAND;

  const metaRows: [string, string, boolean][] = [
    ["INVOICE NUMBER", String(data.invoiceNumber), false],
    ["INVOICE DATE",   formattedDate || "—",        false],
    ["SERVICES TYPE",  data.serviceType || "—",      false],
    ["INVOICE BY",     data.invoiceBy   || "—",      true],
  ];

  const totalsRows: [string, string][] = [
    ["Sub Total", `$${subTotal.toFixed(2)}`],
    ["Discount",  `$${data.discount.toFixed(2)}`],
    ["Payment",   `$${data.paymentReceived.toFixed(2)}`],
  ];

  const bankRows: [string, string][] = [
    ["Account Title",   COMPANY_INFO.bankAccountTitle],
    ["Account Number",  COMPANY_INFO.bankAccountNumber],
    ["IBAN",            COMPANY_INFO.iban],
    ["Bank Name",       COMPANY_INFO.bankName],
  ];

  // ── Root page
  return (
    <div
      ref={ref}
      id="invoice-preview"
      style={{
        fontFamily: FONT,
        background: C.white,
        color: C.black,
        width:     `${PAGE_W}px`,
        minHeight: `${PAGE_H}px`,
        margin: "0 auto",
        fontSize: "10px",
        lineHeight: "1.5",
        display: "flex",
        flexDirection: "column",
      }}
    >

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <header style={{ padding: `32px ${PAD}px 0`, textAlign: "center" }}>

        {/* Logo — 150px, no bottom gap */}
        <div style={{ marginBottom: "0px" }}>
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo%20in%20white%20bg%20Png-zmjaho0wEkJAFnEvlbvwIEmIFSMfrW.png"
            alt="Buzz Filing"
            crossOrigin="anonymous"
            style={{ height: "120px", width: "auto", objectFit: "contain", display: "inline-block" }}
          />
        </div>

        {/* Address block */}
        <p style={{ fontSize: "9.5px", color: "#555555", margin: "0 0 3px", letterSpacing: "0.1px" }}>
          {COMPANY_INFO.address}
        </p>
        <p style={{ fontSize: "9.5px", color: "#555555", margin: "0 0 3px" }}>
          {COMPANY_INFO.website}
          <span style={{ margin: "0 5px", color: "#aaaaaa" }}>•</span>
          {COMPANY_INFO.email}
          <span style={{ margin: "0 5px", color: "#aaaaaa" }}>•</span>
          {COMPANY_INFO.ordersEmail}
        </p>
        <p style={{ fontSize: "9.5px", color: "#555555", margin: "0 0 20px" }}>
          {COMPANY_INFO.phones.map((p, i) => (
            <span key={p}>
              {i > 0 && <span style={{ margin: "0 5px", color: "#aaaaaa" }}>•</span>}
              {p}
            </span>
          ))}
        </p>

        {/* Divider */}
        <hr style={{ border: "none", borderTop: `1px solid ${C.border}`, margin: 0 }} />
      </header>

      {/* ── TITLE ─────────────────────────────────────────────────────────── */}
      <div style={{ padding: `22px ${PAD}px 14px` }}>
        <span style={{ fontSize: "28px", fontWeight: "900", lineHeight: 1, color: BRAND }}>Hi!</span>
        <span style={{ fontSize: "28px", fontWeight: "900",                       color: C.black, lineHeight: 1 }}>{" "}This is Your Invoice.</span>
      </div>

      {/* ── META ROW ──────────────────────────────────────────────────────── */}
      <div style={{
        padding: `14px ${PAD}px 14px`,
        display: "grid",
        gridTemplateColumns: "220px 1fr 180px",
        gap: "0",
        alignItems: "stretch",
      }}>

        {/* ── Bill To ── */}
        <div>
          <div style={{
            fontSize: "7.5px",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
            color: C.black,
            marginBottom: "4px",
          }}>
            BILL TO
          </div>
          <div style={{
            fontSize: "9.5px",
            fontWeight: "600",
            color: C.black,
            lineHeight: 1.5,
          }}>
            {data.billTo || "—"}
          </div>
        </div>

        {/* ── Invoice fields ── */}
        <table style={{ borderCollapse: "collapse", fontSize: "9px" }}>
          <tbody>
            {metaRows.map(([label, value, bold]) => (
              <tr key={label}>
                <td style={{
                  fontSize: "7.5px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.6px",
                  color: C.black,
                  padding: "2.5px 16px 2.5px 0",
                  whiteSpace: "nowrap",
                  verticalAlign: "top",
                }}>
                  {label}
                </td>
                <td style={{
                  fontSize: "9.5px",
                  fontWeight: bold ? "700" : "400",
                  color: C.black,
                  padding: "2.5px 0",
                  verticalAlign: "top",
                }}>
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── Payment Status ── */}
        <div style={{ display: "block" }}>
          <div style={{
            background: statusBg,
            color: C.white,
            fontWeight: "700",
            fontSize: "13px",
            letterSpacing: "0.3px",
            height: "44px",
            lineHeight: "44px",
            textAlign: "center",
            overflow: "hidden",
          }}>
            Payment Status
          </div>
          <div style={{
            border: `1px solid ${C.border}`,
            borderTop: "none",
            fontWeight: "700",
            fontSize: "14px",
            color: C.black,
            background: "#f5f5f5",
            height: "44px",
            lineHeight: "44px",
            textAlign: "center",
            overflow: "hidden",
          }}>
            {data.paymentStatus}
          </div>
        </div>

      </div>

      {/* ── LINE ITEMS + TOTALS (unified table) ──────────────────────────── */}
      <div style={{ padding: `18px ${PAD}px 0` }}>
        <table style={{ width: "100%", borderCollapse: "collapse", borderSpacing: 0, fontSize: "9.5px" }}>

          {/* Column widths */}
          <colgroup>
            <col style={{ width: "auto" }} />
            <col style={{ width: "110px" }} />
            <col style={{ width: "60px"  }} />
            <col style={{ width: "90px"  }} />
            <col style={{ width: "100px" }} />
          </colgroup>

          {/* Header */}
          <thead>
            <tr style={{ background: "transparent" }}>
              <th style={thStyle({ textAlign: "left",   padding: "9px 12px" })}>DESCRIPTION</th>
              <th style={thStyle({ padding: "9px 12px" })} />
              <th style={thStyle({ textAlign: "center", padding: "9px 12px" })}>QTY</th>
              <th style={thStyle({ textAlign: "right",  padding: "9px 12px" })}>RATE</th>
              <th style={thStyle({ textAlign: "right",  padding: "9px 12px" })}>AMOUNT</th>
            </tr>
          </thead>

          <tbody>
            {/* Line item rows */}
            {data.lineItems.map((item, idx) => {
              const amount = item.qty * item.rate;
              return (
                <tr key={item.id} style={{ background: idx % 2 === 0 ? C.white : C.rowAlt }}>
                  <td style={cell({ fontWeight: "500", padding: "9px 12px" })}>
                    {item.description || "—"}
                  </td>
                  <td style={cell({ color: C.grayText, fontSize: "8.5px", padding: "9px 12px" })}>
                    {item.rate === 0 ? "INCLUDED" : ""}
                  </td>
                  <td style={cell({ textAlign: "center", padding: "9px 12px" })}>{item.qty}</td>
                  <td style={cell({ textAlign: "right",  padding: "9px 12px" })}>
                    {item.rate === 0 ? "—" : `$${item.rate.toFixed(0)}`}
                  </td>
                  <td style={cell({ textAlign: "right", fontWeight: "700", padding: "9px 12px" })}>
                    {item.rate === 0 ? "—" : `$${amount.toFixed(0)}`}
                  </td>
                </tr>
              );
            })}

          </tbody>
        </table>

        {/* Totals block — single gradient wrapper, rows transparent */}
        <div style={{ background: BRAND, display: "flex", flexDirection: "column" }}>
          {totalsRows.map(([label, value]) => (
            <div key={label} style={{
              background: "transparent",
              display: "grid",
              gridTemplateColumns: "auto 90px 100px",
              alignItems: "center",
            }}>
              <div style={{ padding: "5px 12px" }} />
              <div style={{
                padding: "5px 12px",
                fontSize: "9px",
                color: C.white,
                fontWeight: "400",
                textAlign: "left",
              }}>{label}</div>
              <div style={{
                padding: "5px 12px",
                fontSize: "9.5px",
                color: C.white,
                fontWeight: "700",
                textAlign: "right",
              }}>{value}</div>
            </div>
          ))}
          {/* Balance row */}
          <div style={{
            background: "transparent",
            display: "grid",
            gridTemplateColumns: "auto 90px 100px",
            alignItems: "center",
          }}>
            <div style={{ padding: "10px 12px" }} />
            <div style={{
              padding: "10px 12px",
              fontSize: "15px",
              fontWeight: "900",
              color: C.white,
              textAlign: "left",
            }}>Balance</div>
            <div style={{
              padding: "10px 12px",
              fontSize: "14px",
              fontWeight: "900",
              color: C.white,
              textAlign: "right",
            }}>${balance.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* ── THANK YOU ─────────────────────────────────────────────────────── */}
      <div style={{ padding: `32px ${PAD}px 28px`, textAlign: "center" }}>
        <span style={{ fontSize: "18px", fontWeight: "900", color: C.black }}>Thank you for your </span>
        <span style={{ fontSize: "18px", fontWeight: "900", color: BRAND }}>business!</span>
      </div>

      {/* ── PAYMENT TERMS ─────────────────────────────────────────────────── */}
      <div style={{ padding: `0 ${PAD}px 20px` }}>
        <div style={labelStyle}>PAYMENT TERMS</div>
        <div style={{ fontSize: "9px", color: C.dimText, lineHeight: "1.8" }}>
          {data.paymentTerms || "—"}
        </div>
      </div>

      {/* ── PKR BANK ──────────────────────────────────────────────────────── */}
      <div style={{ padding: `0 ${PAD}px 24px` }}>
        <div style={labelStyle}>PKR BANK</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          {bankRows.map(([label, value]) => (
            <div key={label} style={{ fontSize: "9px", color: C.dimText, lineHeight: "1.6" }}>
              {label}: {value}
            </div>
          ))}
        </div>
      </div>

      {/* ── FLEX SPACER ───────────────────────────────────────────────────── */}
      <div style={{ flex: 1 }} />

      {/* ── PRE-FOOTER ROW ────────────────────────────────────────────────── */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: `10px ${PAD}px`,
        borderTop: `1px dashed ${C.border}`,
        marginTop: "8px",
      }}>
        <span style={{ fontSize: "8px", color: C.grayText, letterSpacing: "0.2px" }}>E. &amp; O. E</span>
        <span style={{ fontSize: "8px", fontWeight: "500", color: BRAND }}>NOTE : Please email us the payment receipt.</span>
      </div>

    </div>
  );
});

InvoicePreview.displayName = "InvoicePreview";
export default InvoicePreview;
