"use client";

import { forwardRef } from "react";
import { InvoiceData, COMPANY_INFO } from "@/lib/invoice-types";

interface InvoicePreviewProps {
  data: InvoiceData;
}

const STATUS_COLOR: Record<string, string> = {
  Paid: "#16a34a",
  "Partial Paid": "#cc1f1f",
  Unpaid: "#cc1f1f",
};

const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
  ({ data }, ref) => {
    const subTotal = data.lineItems.reduce(
      (sum, item) => sum + item.qty * item.rate,
      0
    );
    const balance = subTotal - data.discount - data.paymentReceived;

    const formattedDate = data.invoiceDate
      ? new Date(data.invoiceDate + "T00:00:00").toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "";

    const font = "'Unbounded', 'Arial', sans-serif";

    return (
      <div
        ref={ref}
        id="invoice-preview"
        style={{
          fontFamily: font,
          background: "#ffffff",
          color: "#111111",
          // A4 at 96dpi: 794px wide, ~1123px tall — we use width + auto height
          width: "794px",
          minHeight: "1123px",
          margin: "0 auto",
          fontSize: "11px",
          lineHeight: "1.5",
          boxShadow: "0 4px 32px rgba(0,0,0,0.12)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── LOGO + ADDRESS ── */}
        <div style={{ padding: "36px 56px 12px", textAlign: "center" }}>
          {/* Logo */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/images-SdNz6vfYoJoMVJMUFtXCjHac5xozpZ.png"
              alt="Buzz Filing"
              style={{ height: "64px", width: "auto", objectFit: "contain" }}
            />
          </div>

          {/* Address line */}
          <div style={{ fontSize: "9.5px", color: "#444", marginBottom: "3px" }}>
            {COMPANY_INFO.address}
          </div>
          <div style={{ fontSize: "9.5px", color: "#444", marginBottom: "3px" }}>
            {COMPANY_INFO.website}&nbsp;&nbsp;•&nbsp;&nbsp;{COMPANY_INFO.email}&nbsp;&nbsp;•&nbsp;&nbsp;{COMPANY_INFO.ordersEmail}
          </div>
          <div style={{ fontSize: "9.5px", color: "#444" }}>
            {COMPANY_INFO.phones.join("  •  ")}
          </div>
        </div>

        {/* ── SPACER ── */}
        <div style={{ height: "28px" }} />

        {/* ── HI HEADING ── */}
        <div style={{ padding: "0 56px 16px" }}>
          <div style={{ fontSize: "28px", fontWeight: "900", lineHeight: "1.2" }}>
            <span style={{ color: "#cc1f1f" }}>Hi! </span>
            <span style={{ color: "#111" }}>This is Your Invoice.</span>
          </div>
        </div>

        {/* ── META ROW ── */}
        <div
          style={{
            padding: "0 56px 20px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 180px",
            gap: "0",
            alignItems: "start",
          }}
        >
          {/* BILL TO */}
          <div>
            <div style={{ fontSize: "8.5px", fontWeight: "700", color: "#111", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "4px" }}>
              BILL TO
            </div>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#111" }}>
              {data.billTo || "—"}
            </div>
          </div>

          {/* Invoice details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {[
              ["INVOICE NUMBER", String(data.invoiceNumber)],
              ["INVOICE DATE", formattedDate || "—"],
              ["SERVICES TYPE", data.serviceType || "—"],
              ["INVOICE BY", data.invoiceBy || "—"],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", gap: "10px", alignItems: "baseline" }}>
                <span style={{ fontSize: "8.5px", fontWeight: "700", color: "#555", textTransform: "uppercase", letterSpacing: "0.5px", minWidth: "110px" }}>
                  {label}
                </span>
                <span style={{ fontSize: "11px", fontWeight: label === "INVOICE BY" ? "700" : "400", color: "#111" }}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Payment Status */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div
              style={{
                background: STATUS_COLOR[data.paymentStatus] ?? "#cc1f1f",
                color: "#fff",
                textAlign: "center",
                padding: "8px 10px",
                fontWeight: "700",
                fontSize: "10px",
                letterSpacing: "0.5px",
              }}
            >
              Payment Status
            </div>
            <div
              style={{
                border: "1px solid #ddd",
                textAlign: "center",
                padding: "7px 10px",
                fontWeight: "600",
                fontSize: "11px",
                color: "#111",
                background: "#fafafa",
              }}
            >
              {data.paymentStatus}
            </div>
          </div>
        </div>

        {/* ── LINE ITEMS TABLE ── */}
        <div style={{ padding: "0 56px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
            <thead>
              <tr style={{ background: "#e8e8e8", color: "#111" }}>
                {[
                  { label: "DESCRIPTION", align: "left", width: "auto" },
                  { label: "QTY", align: "right", width: "60px" },
                  { label: "RATE", align: "right", width: "80px" },
                  { label: "AMOUNT", align: "right", width: "90px" },
                ].map(({ label, align, width }) => (
                  <th
                    key={label}
                    style={{
                      padding: "8px 12px",
                      fontWeight: "700",
                      fontSize: "9.5px",
                      letterSpacing: "0.8px",
                      textAlign: align as "left" | "right",
                      width,
                      borderBottom: "2px solid #ccc",
                    }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.lineItems.map((item, idx) => (
                <tr key={item.id} style={{ background: idx % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee" }}>
                    {item.description || "—"}
                  </td>
                  <td style={{ padding: "8px 12px", textAlign: "right", borderBottom: "1px solid #eee" }}>
                    {item.qty}
                  </td>
                  <td style={{ padding: "8px 12px", textAlign: "right", borderBottom: "1px solid #eee" }}>
                    ${item.rate.toFixed(2)}
                  </td>
                  <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: "700", borderBottom: "1px solid #eee" }}>
                    ${(item.qty * item.rate).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── TOTALS BLOCK (right aligned) ── */}
        <div style={{ padding: "0 56px", display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: "240px", background: "#1a1a1a" }}>
            {[
              { label: "Sub Total", value: `$${subTotal.toFixed(2)}`, bold: false },
              { label: "Discount", value: `$${data.discount.toFixed(2)}`, bold: false },
              { label: "Payment", value: `$${data.paymentReceived.toFixed(2)}`, bold: false },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "7px 14px",
                  borderBottom: "1px solid #2e2e2e",
                }}
              >
                <span style={{ fontSize: "10px", color: "#ccc" }}>{label}</span>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#fff" }}>{value}</span>
              </div>
            ))}
            {/* Balance row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 14px",
                background: "#1a1a1a",
              }}
            >
              <span style={{ fontSize: "16px", fontWeight: "900", color: "#fff" }}>Balance</span>
              <span style={{ fontSize: "16px", fontWeight: "900", color: "#fff" }}>${balance.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ── THANK YOU ── */}
        <div style={{ padding: "32px 56px 20px", textAlign: "center" }}>
          <span style={{ fontSize: "18px", fontWeight: "900", color: "#111" }}>
            Thank you for your{" "}
          </span>
          <span style={{ fontSize: "18px", fontWeight: "900", color: "#cc1f1f" }}>
            business!
          </span>
        </div>

        {/* ── PAYMENT TERMS ── */}
        {data.paymentTerms && (
          <div style={{ padding: "0 56px 20px" }}>
            <div style={{ borderTop: "1px solid #eee", paddingTop: "14px" }}>
              <div
                style={{
                  fontSize: "8.5px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  color: "#111",
                  marginBottom: "5px",
                }}
              >
                PAYMENT TERMS
              </div>
              <div style={{ fontSize: "10px", color: "#444", lineHeight: "1.6" }}>
                {data.paymentTerms}
              </div>
            </div>
          </div>
        )}

        {/* ── PKR BANK ── */}
        <div style={{ padding: "0 56px 36px" }}>
          <div style={{ borderTop: "1px solid #eee", paddingTop: "14px" }}>
            <div
              style={{
                fontSize: "8.5px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                color: "#111",
                marginBottom: "8px",
              }}
            >
              PKR BANK
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <div style={{ fontSize: "10px", color: "#444" }}>Account Title: {COMPANY_INFO.bankAccountTitle}</div>
              <div style={{ fontSize: "10px", color: "#444" }}>Account Number: {COMPANY_INFO.bankAccountNumber}</div>
              <div style={{ fontSize: "10px", color: "#444" }}>IBAN: {COMPANY_INFO.iban}</div>
              <div style={{ fontSize: "10px", color: "#444" }}>Bank Name: {COMPANY_INFO.bankName}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

InvoicePreview.displayName = "InvoicePreview";
export default InvoicePreview;
