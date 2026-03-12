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

const FONT = "'Unbounded', Arial, sans-serif";

const PAGE_W  = 794;   // A4 @ 96 dpi
const PAGE_H  = 1123;
const PAD     = 40;

const statusColorMap: Record<string, string> = {
  Paid:           "#16a34a",
  "Partial Paid": C.red,
  Unpaid:         "#dc2626",
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

  const statusBg = statusColorMap[data.paymentStatus] ?? C.red;

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

        {/* Logo — large, centered */}
        <div style={{ marginBottom: "16px" }}>
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/images-SdNz6vfYoJoMVJMUFtXCjHac5xozpZ.png"
            alt="Buzz Filing"
            crossOrigin="anonymous"
            style={{ height: "84px", width: "auto", objectFit: "contain", display: "inline-block" }}
          />
        </div>

        {/* Address block */}
        <p style={{ fontSize: "8.5px", color: "#555555", margin: "0 0 3px", letterSpacing: "0.1px" }}>
          {COMPANY_INFO.address}
        </p>
        <p style={{ fontSize: "8.5px", color: "#555555", margin: "0 0 3px" }}>
          {COMPANY_INFO.website}
          <span style={{ margin: "0 5px", color: "#aaaaaa" }}>•</span>
          {COMPANY_INFO.email}
          <span style={{ margin: "0 5px", color: "#aaaaaa" }}>•</span>
          {COMPANY_INFO.ordersEmail}
        </p>
        <p style={{ fontSize: "8.5px", color: "#555555", margin: "0 0 20px" }}>
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
        <span style={{ fontSize: "28px", fontWeight: "900", fontStyle: "italic", color: C.red,   lineHeight: 1 }}>Hi!</span>
        <span style={{ fontSize: "28px", fontWeight: "900",                       color: C.black, lineHeight: 1 }}>{" "}This is Your Invoice.</span>
      </div>

      {/* ── META ROW ──────────────────────────────────────────────────────── */}
      <div style={{
        padding: `0 ${PAD}px`,
        display: "grid",
        gridTemplateColumns: "1fr 1fr 190px",
        gap: "0",
        alignItems: "stretch",
        borderTop: `2px solid ${C.border}`,
        borderBottom: `2px solid ${C.border}`,
        marginTop: "0",
      }}>

        {/* ── Bill To ── */}
        <div style={{
          padding: "16px 18px 16px 0",
          borderRight: `1px solid ${C.border}`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "6px",
        }}>
          <div style={{
            fontSize: "7px",
            fontWeight: "800",
            textTransform: "uppercase",
            letterSpacing: "1.2px",
            color: C.muted,
          }}>
            Bill To
          </div>
          <div style={{
            fontSize: "11.5px",
            fontWeight: "700",
            color: C.black,
            lineHeight: 1.35,
          }}>
            {data.billTo || "—"}
          </div>
        </div>

        {/* ── Invoice fields ── */}
        <div style={{
          padding: "16px 18px",
          borderRight: `1px solid ${C.border}`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "7px",
        }}>
          {metaRows.map(([label, value, bold]) => (
            <div key={label} style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
              <span style={{
                fontSize: "6.8px",
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: "0.9px",
                color: C.muted,
                minWidth: "90px",
                flexShrink: 0,
              }}>
                {label}
              </span>
              <span style={{
                fontSize: "9.5px",
                fontWeight: bold ? "700" : "500",
                color: C.black,
                lineHeight: 1.3,
              }}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* ── Payment Status ── */}
        <div style={{
          display: "flex",
          flexDirection: "column",
        }}>
          {/* Status header strip */}
          <div style={{
            background: statusBg,
            color: C.white,
            textAlign: "center",
            padding: "10px 12px",
            fontWeight: "800",
            fontSize: "8.5px",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            flex: "0 0 auto",
          }}>
            Payment Status
          </div>
          {/* Status value */}
          <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderLeft: `2px solid ${statusBg}`,
            background: `${statusBg}0d`,
            padding: "10px 12px",
          }}>
            <span style={{
              fontSize: "11px",
              fontWeight: "700",
              color: statusBg,
              letterSpacing: "0.2px",
            }}>
              {data.paymentStatus}
            </span>
          </div>
        </div>

      </div>

      {/* ── LINE ITEMS TABLE ──────────────────────────────────────────────── */}
      <div style={{ padding: `18px ${PAD}px 0` }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9.5px" }}>
          <thead>
            <tr style={{ background: C.headerBg }}>
              <th style={thStyle({ textAlign: "left" })}>DESCRIPTION</th>
              <th style={thStyle({ width: "110px" })} />
              <th style={thStyle({ width: "60px",  textAlign: "center" })}>QTY</th>
              <th style={thStyle({ width: "80px",  textAlign: "right"  })}>RATE</th>
              <th style={thStyle({ width: "90px",  textAlign: "right"  })}>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {data.lineItems.map((item, idx) => {
              const amount = item.qty * item.rate;
              return (
                <tr key={item.id} style={{ background: idx % 2 === 0 ? C.white : C.rowAlt }}>
                  <td style={cell({ fontWeight: "500" })}>
                    {item.description || "—"}
                  </td>
                  <td style={cell({ color: C.grayText, fontSize: "8.5px" })}>
                    {item.rate === 0 ? "INCLUDED" : ""}
                  </td>
                  <td style={cell({ textAlign: "center" })}>{item.qty}</td>
                  <td style={cell({ textAlign: "right"  })}>${item.rate.toFixed(2)}</td>
                  <td style={cell({ textAlign: "right",  fontWeight: "700" })}>${amount.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── TOTALS ────────────────────────────────────────────────────────── */}
      <div style={{ padding: `0 ${PAD}px`, display: "flex", justifyContent: "flex-end" }}>
        <table style={{ borderCollapse: "collapse", width: "240px", background: C.darkBg }}>
          <tbody>
            {totalsRows.map(([label, value]) => (
              <tr key={label}>
                <td style={{ padding: "6px 14px", fontSize: "9px", color: "#cccccc", borderBottom: `1px solid ${C.darkBorder}`, fontWeight: "400" }}>
                  {label}
                </td>
                <td style={{ padding: "6px 14px", fontSize: "9.5px", color: C.white, borderBottom: `1px solid ${C.darkBorder}`, fontWeight: "700", textAlign: "right" }}>
                  {value}
                </td>
              </tr>
            ))}
            <tr>
              <td style={{ padding: "10px 14px", fontSize: "15px", fontWeight: "900", color: C.white }}>Balance</td>
              <td style={{ padding: "10px 14px", fontSize: "15px", fontWeight: "900", color: C.white, textAlign: "right" }}>${balance.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── THANK YOU ─────────────────────────────────────────────────────── */}
      <div style={{ padding: `26px ${PAD}px 6px`, textAlign: "center" }}>
        <span style={{ fontSize: "16px", fontWeight: "900", color: C.black }}>Thank you for your </span>
        <span style={{ fontSize: "16px", fontWeight: "900", color: C.red   }}>business!</span>
      </div>
      <div style={{ padding: `2px ${PAD}px 16px`, textAlign: "center" }}>
        <span style={{ fontSize: "8px", color: "#777777" }}>NOTE : Please email us the payment receipt.</span>
      </div>

      {/* ── PAYMENT TERMS ─────────────────────────────────────────────────── */}
      <div style={{ margin: `0 ${PAD}px`, borderTop: `1px solid ${C.border}` }} />
      <div style={{ padding: `14px ${PAD}px 8px` }}>
        <div style={labelStyle}>PAYMENT TERMS</div>
        <div style={{ fontSize: "9px", color: C.dimText, lineHeight: "1.7" }}>
          {data.paymentTerms || "—"}
        </div>
      </div>

      {/* ── FLEX SPACER ───────────────────────────────────────────────────── */}
      <div style={{ flex: 1, minHeight: "20px" }} />

      {/* ── PKR BANK ──────────────────────────────────────────────────────── */}
      <div style={{ padding: `0 ${PAD}px 18px` }}>
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "12px" }}>
          <div style={labelStyle}>PKR BANK</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {bankRows.map(([label, value]) => (
              <div key={label} style={{ fontSize: "9px", color: C.dimText }}>
                {label}: {value}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PRE-FOOTER ROW ────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: `8px ${PAD}px`, borderTop: `1px solid ${C.border}`,
      }}>
        <span style={{ fontSize: "7.5px", color: C.muted, letterSpacing: "0.3px" }}>E. &amp; O. G</span>
        <span style={{ fontSize: "7.5px", color: C.subtle }}>NOTE : Please email us the payment receipt.</span>
      </div>

      {/* ── RED FOOTER BAR ────────────────────────────────────────────────── */}
      <footer style={{ background: C.red, padding: `10px ${PAD}px`, textAlign: "center" }}>
        <p style={{ fontSize: "8px", color: C.white, margin: "0 0 2px" }}>
          {COMPANY_INFO.website}&nbsp;&nbsp;•&nbsp;&nbsp;
          {COMPANY_INFO.email}&nbsp;&nbsp;•&nbsp;&nbsp;
          {COMPANY_INFO.ordersEmail}
        </p>
        <p style={{ fontSize: "8px", color: C.white, margin: 0 }}>
          {COMPANY_INFO.phones.join("  •  ")}
        </p>
      </footer>

    </div>
  );
});

InvoicePreview.displayName = "InvoicePreview";
export default InvoicePreview;
