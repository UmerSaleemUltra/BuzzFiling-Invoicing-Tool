"use client";

import { forwardRef } from "react";
import { InvoiceData, COMPANY_INFO } from "@/lib/invoice-types";

interface InvoicePreviewProps {
  data: InvoiceData;
}

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

    const font = "'Unbounded', Arial, sans-serif";
    const RED = "#e8000d";
    const BLACK = "#111111";
    const DARK_BG = "#1a1a1a";

    return (
      <div
        ref={ref}
        id="invoice-preview"
        style={{
          fontFamily: font,
          background: "#ffffff",
          color: BLACK,
          width: "794px",
          minHeight: "1123px",
          margin: "0 auto",
          fontSize: "11px",
          lineHeight: "1.5",
          boxShadow: "0 4px 32px rgba(0,0,0,0.12)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* ── TOP: E. & O. E ── */}
        <div style={{ padding: "12px 48px 0", textAlign: "right" }}>
          <span style={{ fontSize: "8px", color: "#999", letterSpacing: "0.5px" }}>E. &amp; O. E</span>
        </div>

        {/* ── LOGO ── */}
        <div style={{ padding: "10px 48px 8px", textAlign: "center" }}>
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/images-SdNz6vfYoJoMVJMUFtXCjHac5xozpZ.png"
            alt="Buzz Filing"
            style={{ height: "72px", width: "auto", objectFit: "contain" }}
          />
        </div>

        {/* ── ADDRESS BLOCK ── */}
        <div style={{ padding: "0 48px 6px", textAlign: "center" }}>
          <div style={{ fontSize: "8.5px", color: "#444", marginBottom: "3px" }}>
            {COMPANY_INFO.address}
          </div>
          <div style={{ fontSize: "8.5px", color: "#444", marginBottom: "3px" }}>
            {COMPANY_INFO.website}&nbsp;&nbsp;•&nbsp;&nbsp;
            {COMPANY_INFO.email}&nbsp;&nbsp;•&nbsp;&nbsp;
            {COMPANY_INFO.ordersEmail}
          </div>
          <div style={{ fontSize: "8.5px", color: "#444" }}>
            {COMPANY_INFO.phones[0]}&nbsp;&nbsp;•&nbsp;&nbsp;
            {COMPANY_INFO.phones[1]}&nbsp;&nbsp;•&nbsp;&nbsp;
            {COMPANY_INFO.phones[2]}
          </div>
        </div>

        {/* ── SPACER ── */}
        <div style={{ height: "24px" }} />

        {/* ── HI HEADING ── */}
        <div style={{ padding: "0 48px 16px" }}>
          <div style={{ fontSize: "30px", fontWeight: "900", lineHeight: "1.1", letterSpacing: "-0.5px" }}>
            <span style={{ color: RED, fontStyle: "italic" }}>Hi!</span>
            <span style={{ color: BLACK }}> This is Your Invoice.</span>
          </div>
        </div>

        {/* ── META ROW ── */}
        <div
          style={{
            padding: "0 48px 0",
            display: "grid",
            gridTemplateColumns: "180px 1fr 190px",
            gap: "16px",
            alignItems: "start",
          }}
        >
          {/* BILL TO */}
          <div>
            <div style={{
              fontSize: "8px",
              fontWeight: "700",
              color: BLACK,
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              marginBottom: "5px",
              borderBottom: "1px solid #e0e0e0",
              paddingBottom: "3px",
            }}>
              BILL TO
            </div>
            <div style={{ fontSize: "11px", fontWeight: "600", color: BLACK }}>
              {data.billTo || "—"}
            </div>
          </div>

          {/* Invoice meta fields */}
          <div>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <tbody>
                {[
                  ["INVOICE NUMBER", String(data.invoiceNumber)],
                  ["INVOICE DATE", formattedDate || "—"],
                  ["SERVICES TYPE", data.serviceType || "—"],
                  ["INVOICE BY", data.invoiceBy || "—"],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td style={{
                      fontSize: "8px",
                      fontWeight: "700",
                      color: BLACK,
                      textTransform: "uppercase",
                      letterSpacing: "0.6px",
                      padding: "3px 12px 3px 0",
                      whiteSpace: "nowrap",
                      verticalAlign: "top",
                    }}>
                      {label}
                    </td>
                    <td style={{
                      fontSize: "10.5px",
                      fontWeight: label === "INVOICE BY" ? "700" : "400",
                      color: BLACK,
                      padding: "3px 0",
                      verticalAlign: "top",
                    }}>
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payment Status box */}
          <div>
            <div
              style={{
                background: RED,
                color: "#fff",
                textAlign: "center",
                padding: "9px 12px",
                fontWeight: "700",
                fontSize: "9.5px",
                letterSpacing: "0.4px",
              }}
            >
              Payment Status
            </div>
            <div
              style={{
                border: "1px solid #ddd",
                borderTop: "none",
                textAlign: "center",
                padding: "8px 12px",
                fontWeight: "600",
                fontSize: "11px",
                color: BLACK,
                background: "#fafafa",
              }}
            >
              {data.paymentStatus}
            </div>
          </div>
        </div>

        {/* ── SPACER ── */}
        <div style={{ height: "20px" }} />

        {/* ── LINE ITEMS TABLE ── */}
        <div style={{ padding: "0 48px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
            <thead>
              <tr style={{ background: "#e8e8e8" }}>
                <th style={{
                  padding: "9px 12px",
                  fontWeight: "700",
                  fontSize: "9px",
                  letterSpacing: "0.7px",
                  textAlign: "left",
                  textTransform: "uppercase",
                  color: BLACK,
                }}>
                  DESCRIPTION
                </th>
                <th style={{
                  padding: "9px 12px",
                  fontWeight: "700",
                  fontSize: "9px",
                  letterSpacing: "0.7px",
                  textAlign: "center",
                  textTransform: "uppercase",
                  color: BLACK,
                  width: "80px",
                }}>
                  QTY
                </th>
                <th style={{
                  padding: "9px 12px",
                  fontWeight: "700",
                  fontSize: "9px",
                  letterSpacing: "0.7px",
                  textAlign: "right",
                  textTransform: "uppercase",
                  color: BLACK,
                  width: "90px",
                }}>
                  RATE
                </th>
                <th style={{
                  padding: "9px 12px",
                  fontWeight: "700",
                  fontSize: "9px",
                  letterSpacing: "0.7px",
                  textAlign: "right",
                  textTransform: "uppercase",
                  color: BLACK,
                  width: "100px",
                }}>
                  AMOUNT
                </th>
              </tr>
            </thead>
            <tbody>
              {data.lineItems.map((item) => {
                const amount = item.qty * item.rate;
                return (
                  <tr key={item.id} style={{ background: "#fff" }}>
                    <td style={{ padding: "9px 12px", borderBottom: "1px solid #ececec", color: BLACK }}>
                      {item.description || "—"}
                    </td>
                    <td style={{ padding: "9px 12px", textAlign: "center", borderBottom: "1px solid #ececec", color: BLACK }}>
                      {item.qty}
                    </td>
                    <td style={{ padding: "9px 12px", textAlign: "right", borderBottom: "1px solid #ececec", color: BLACK }}>
                      ${item.rate.toFixed(2)}
                    </td>
                    <td style={{ padding: "9px 12px", textAlign: "right", fontWeight: "700", borderBottom: "1px solid #ececec", color: BLACK }}>
                      ${amount.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── TOTALS BLOCK ── */}
        <div style={{ padding: "0 48px", display: "flex", justifyContent: "flex-end" }}>
          <table style={{ borderCollapse: "collapse", width: "260px", background: DARK_BG }}>
            <tbody>
              {[
                ["Sub Total", `$${subTotal.toFixed(2)}`],
                ["Discount", `$${data.discount.toFixed(2)}`],
                ["Payment", `$${data.paymentReceived.toFixed(2)}`],
              ].map(([label, value]) => (
                <tr key={label}>
                  <td style={{
                    padding: "7px 14px",
                    fontSize: "10px",
                    color: "#cccccc",
                    borderBottom: "1px solid #2e2e2e",
                    fontWeight: "400",
                  }}>
                    {label}
                  </td>
                  <td style={{
                    padding: "7px 14px",
                    fontSize: "11px",
                    color: "#ffffff",
                    borderBottom: "1px solid #2e2e2e",
                    fontWeight: "700",
                    textAlign: "right",
                  }}>
                    {value}
                  </td>
                </tr>
              ))}
              <tr>
                <td style={{
                  padding: "11px 14px",
                  fontSize: "17px",
                  color: "#ffffff",
                  fontWeight: "900",
                }}>
                  Balance
                </td>
                <td style={{
                  padding: "11px 14px",
                  fontSize: "17px",
                  color: "#ffffff",
                  fontWeight: "900",
                  textAlign: "right",
                }}>
                  ${balance.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── THANK YOU ── */}
        <div style={{ padding: "28px 48px 8px", textAlign: "center" }}>
          <span style={{ fontSize: "17px", fontWeight: "900", color: BLACK }}>
            Thank you for your{" "}
          </span>
          <span style={{ fontSize: "17px", fontWeight: "900", color: RED }}>
            business!
          </span>
        </div>

        {/* ── NOTE ── */}
        <div style={{ padding: "4px 48px 16px", textAlign: "center" }}>
          <span style={{ fontSize: "8.5px", color: "#666" }}>
            NOTE : Please email us the payment receipt.
          </span>
        </div>

        {/* ── DIVIDER ── */}
        <div style={{ margin: "0 48px", borderTop: "1px solid #e8e8e8" }} />

        {/* ── PAYMENT TERMS ── */}
        <div style={{ padding: "16px 48px 0" }}>
          <div style={{
            fontSize: "8px",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
            color: BLACK,
            marginBottom: "6px",
          }}>
            PAYMENT TERMS
          </div>
          <div style={{ fontSize: "9.5px", color: "#444", lineHeight: "1.7" }}>
            {data.paymentTerms || "—"}
          </div>
        </div>

        {/* ── SPACER ── */}
        <div style={{ flex: 1, minHeight: "20px" }} />

        {/* ── PKR BANK ── */}
        <div style={{ padding: "0 48px 20px" }}>
          <div style={{ borderTop: "1px solid #e8e8e8", paddingTop: "14px" }}>
            <div style={{
              fontSize: "8px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              color: BLACK,
              marginBottom: "7px",
            }}>
              PKR BANK
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {[
                ["Account Title", COMPANY_INFO.bankAccountTitle],
                ["Account Number", COMPANY_INFO.bankAccountNumber],
                ["IBAN", COMPANY_INFO.iban],
                ["Bank Name", COMPANY_INFO.bankName],
              ].map(([label, value]) => (
                <div key={label} style={{ fontSize: "9.5px", color: "#444" }}>
                  {label}: {value}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div
          style={{
            background: RED,
            padding: "12px 48px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "8.5px", color: "#fff", marginBottom: "2px" }}>
            {COMPANY_INFO.website}&nbsp;&nbsp;•&nbsp;&nbsp;
            {COMPANY_INFO.email}&nbsp;&nbsp;•&nbsp;&nbsp;
            {COMPANY_INFO.ordersEmail}
          </div>
          <div style={{ fontSize: "8.5px", color: "#fff" }}>
            {COMPANY_INFO.phones[0]}&nbsp;&nbsp;•&nbsp;&nbsp;
            {COMPANY_INFO.phones[1]}&nbsp;&nbsp;•&nbsp;&nbsp;
            {COMPANY_INFO.phones[2]}
          </div>
        </div>

      </div>
    );
  }
);

InvoicePreview.displayName = "InvoicePreview";
export default InvoicePreview;
