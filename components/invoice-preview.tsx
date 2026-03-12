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

    const statusColors: Record<string, string> = {
      Paid: "#16a34a",
      "Partial Paid": RED,
      Unpaid: "#dc2626",
    };
    const statusBg = statusColors[data.paymentStatus] ?? RED;

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
          fontSize: "10px",
          lineHeight: "1.5",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* ── TOP E. & O. E ── */}
        <div style={{ padding: "14px 40px 0", textAlign: "right" }}>
          <span style={{ fontSize: "7.5px", color: "#aaa", letterSpacing: "0.4px" }}>
            E. &amp; O. E
          </span>
        </div>

        {/* ── LOGO ── */}
        <div style={{ padding: "6px 40px 6px", textAlign: "center" }}>
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/images-SdNz6vfYoJoMVJMUFtXCjHac5xozpZ.png"
            alt="Buzz Filing"
            crossOrigin="anonymous"
            style={{ height: "68px", width: "auto", objectFit: "contain" }}
          />
        </div>

        {/* ── ADDRESS ── */}
        <div style={{ padding: "0 40px 4px", textAlign: "center" }}>
          <div style={{ fontSize: "8px", color: "#555", marginBottom: "2px" }}>
            {COMPANY_INFO.address}
          </div>
          <div style={{ fontSize: "8px", color: "#555", marginBottom: "2px" }}>
            {COMPANY_INFO.website}&nbsp;&nbsp;•&nbsp;&nbsp;
            {COMPANY_INFO.email}&nbsp;&nbsp;•&nbsp;&nbsp;
            {COMPANY_INFO.ordersEmail}
          </div>
          <div style={{ fontSize: "8px", color: "#555" }}>
            {COMPANY_INFO.phones[0]}&nbsp;&nbsp;•&nbsp;&nbsp;
            {COMPANY_INFO.phones[1]}&nbsp;&nbsp;•&nbsp;&nbsp;
            {COMPANY_INFO.phones[2]}
          </div>
        </div>

        {/* ── SPACER ── */}
        <div style={{ height: "22px" }} />

        {/* ── HI HEADING ── */}
        <div style={{ padding: "0 40px 14px" }}>
          <span style={{
            fontSize: "28px",
            fontWeight: "900",
            fontStyle: "italic",
            color: RED,
            lineHeight: 1,
          }}>
            Hi!
          </span>
          <span style={{
            fontSize: "28px",
            fontWeight: "900",
            color: BLACK,
            lineHeight: 1,
          }}>
            {" "}This is Your Invoice.
          </span>
        </div>

        {/* ── META ROW ── */}
        <div style={{
          padding: "0 40px",
          display: "grid",
          gridTemplateColumns: "200px 1fr 180px",
          gap: "12px",
          alignItems: "start",
        }}>
          {/* Bill To */}
          <div>
            <div style={{
              fontSize: "7.5px",
              fontWeight: "700",
              color: BLACK,
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              paddingBottom: "4px",
              marginBottom: "4px",
              borderBottom: "1px solid #ddd",
            }}>
              BILL TO
            </div>
            <div style={{ fontSize: "10px", fontWeight: "600", color: BLACK, lineHeight: 1.4 }}>
              {data.billTo || "—"}
            </div>
          </div>

          {/* Invoice fields */}
          <div>
            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "9px" }}>
              <tbody>
                {[
                  ["INVOICE NUMBER", String(data.invoiceNumber), false],
                  ["INVOICE DATE", formattedDate || "—", false],
                  ["SERVICES TYPE", data.serviceType || "—", false],
                  ["INVOICE BY", data.invoiceBy || "—", true],
                ].map(([label, value, bold]) => (
                  <tr key={label as string}>
                    <td style={{
                      fontSize: "7.5px",
                      fontWeight: "700",
                      color: BLACK,
                      textTransform: "uppercase",
                      letterSpacing: "0.6px",
                      padding: "3px 14px 3px 0",
                      whiteSpace: "nowrap",
                      verticalAlign: "top",
                    }}>
                      {label}
                    </td>
                    <td style={{
                      fontSize: "9.5px",
                      fontWeight: bold ? "700" : "400",
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

          {/* Payment Status */}
          <div>
            <div style={{
              background: statusBg,
              color: "#fff",
              textAlign: "center",
              padding: "8px 10px",
              fontWeight: "700",
              fontSize: "9px",
              letterSpacing: "0.3px",
            }}>
              Payment Status
            </div>
            <div style={{
              border: "1px solid #ddd",
              borderTop: "none",
              textAlign: "center",
              padding: "7px 10px",
              fontWeight: "600",
              fontSize: "10px",
              color: BLACK,
              background: "#fafafa",
            }}>
              {data.paymentStatus}
            </div>
          </div>
        </div>

        {/* ── SPACER ── */}
        <div style={{ height: "18px" }} />

        {/* ── LINE ITEMS TABLE ── */}
        <div style={{ padding: "0 40px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9.5px" }}>
            <thead>
              <tr style={{ background: "#e8e8e8" }}>
                <th style={{
                  padding: "8px 12px",
                  fontWeight: "700",
                  fontSize: "8px",
                  letterSpacing: "0.6px",
                  textAlign: "left",
                  textTransform: "uppercase",
                  color: BLACK,
                }}>
                  DESCRIPTION
                </th>
                <th style={{
                  padding: "8px 12px",
                  fontWeight: "700",
                  fontSize: "8px",
                  letterSpacing: "0.6px",
                  textAlign: "left",
                  textTransform: "uppercase",
                  color: BLACK,
                  width: "110px",
                }}>
                  {/* blank — for "INCLUDED" note column */}
                </th>
                <th style={{
                  padding: "8px 12px",
                  fontWeight: "700",
                  fontSize: "8px",
                  letterSpacing: "0.6px",
                  textAlign: "center",
                  textTransform: "uppercase",
                  color: BLACK,
                  width: "60px",
                }}>
                  QTY
                </th>
                <th style={{
                  padding: "8px 12px",
                  fontWeight: "700",
                  fontSize: "8px",
                  letterSpacing: "0.6px",
                  textAlign: "right",
                  textTransform: "uppercase",
                  color: BLACK,
                  width: "80px",
                }}>
                  RATE
                </th>
                <th style={{
                  padding: "8px 12px",
                  fontWeight: "700",
                  fontSize: "8px",
                  letterSpacing: "0.6px",
                  textAlign: "right",
                  textTransform: "uppercase",
                  color: BLACK,
                  width: "90px",
                }}>
                  AMOUNT
                </th>
              </tr>
            </thead>
            <tbody>
              {data.lineItems.map((item, idx) => {
                const amount = item.qty * item.rate;
                const rowBg = idx % 2 === 0 ? "#fff" : "#fcfcfc";
                return (
                  <tr key={item.id} style={{ background: rowBg }}>
                    <td style={{
                      padding: "8px 12px",
                      borderBottom: "1px solid #ececec",
                      color: BLACK,
                      fontWeight: "500",
                    }}>
                      {item.description || "—"}
                    </td>
                    <td style={{
                      padding: "8px 12px",
                      borderBottom: "1px solid #ececec",
                      color: "#666",
                      fontSize: "8.5px",
                      fontStyle: "normal",
                    }}>
                      {/* INCLUDED note — shown when rate is 0 or item has no separate charge */}
                      {item.rate === 0 ? "INCLUDED" : ""}
                    </td>
                    <td style={{
                      padding: "8px 12px",
                      textAlign: "center",
                      borderBottom: "1px solid #ececec",
                      color: BLACK,
                    }}>
                      {item.qty}
                    </td>
                    <td style={{
                      padding: "8px 12px",
                      textAlign: "right",
                      borderBottom: "1px solid #ececec",
                      color: BLACK,
                    }}>
                      ${item.rate.toFixed(2)}
                    </td>
                    <td style={{
                      padding: "8px 12px",
                      textAlign: "right",
                      fontWeight: "700",
                      borderBottom: "1px solid #ececec",
                      color: BLACK,
                    }}>
                      ${amount.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── TOTALS ── */}
        <div style={{ padding: "0 40px", display: "flex", justifyContent: "flex-end" }}>
          <table style={{ borderCollapse: "collapse", width: "240px", background: DARK_BG }}>
            <tbody>
              {[
                ["Sub Total", `$${subTotal.toFixed(2)}`],
                ["Discount", `$${data.discount.toFixed(2)}`],
                ["Payment", `$${data.paymentReceived.toFixed(2)}`],
              ].map(([label, value]) => (
                <tr key={label}>
                  <td style={{
                    padding: "6px 14px",
                    fontSize: "9px",
                    color: "#cccccc",
                    borderBottom: "1px solid #2e2e2e",
                    fontWeight: "400",
                  }}>
                    {label}
                  </td>
                  <td style={{
                    padding: "6px 14px",
                    fontSize: "9.5px",
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
                  padding: "10px 14px",
                  fontSize: "15px",
                  fontWeight: "900",
                  color: "#ffffff",
                }}>
                  Balance
                </td>
                <td style={{
                  padding: "10px 14px",
                  fontSize: "15px",
                  fontWeight: "900",
                  color: "#ffffff",
                  textAlign: "right",
                }}>
                  ${balance.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── THANK YOU ── */}
        <div style={{ padding: "26px 40px 6px", textAlign: "center" }}>
          <span style={{ fontSize: "16px", fontWeight: "900", color: BLACK }}>
            Thank you for your{" "}
          </span>
          <span style={{ fontSize: "16px", fontWeight: "900", color: RED }}>
            business!
          </span>
        </div>

        {/* ── NOTE ── */}
        <div style={{ padding: "2px 40px 16px", textAlign: "center" }}>
          <span style={{ fontSize: "8px", color: "#777" }}>
            NOTE : Please email us the payment receipt.
          </span>
        </div>

        {/* ── DIVIDER ── */}
        <div style={{ margin: "0 40px", borderTop: "1px solid #e8e8e8" }} />

        {/* ── PAYMENT TERMS ── */}
        <div style={{ padding: "14px 40px 8px" }}>
          <div style={{
            fontSize: "7.5px",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
            color: BLACK,
            marginBottom: "5px",
          }}>
            PAYMENT TERMS
          </div>
          <div style={{ fontSize: "9px", color: "#444", lineHeight: "1.7" }}>
            {data.paymentTerms || "—"}
          </div>
        </div>

        {/* ── FLEX SPACER ── */}
        <div style={{ flex: 1, minHeight: "20px" }} />

        {/* ── PKR BANK ── */}
        <div style={{ padding: "0 40px 18px" }}>
          <div style={{ borderTop: "1px solid #e8e8e8", paddingTop: "12px" }}>
            <div style={{
              fontSize: "7.5px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              color: BLACK,
              marginBottom: "6px",
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
                <div key={label} style={{ fontSize: "9px", color: "#444" }}>
                  {label}: {value}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FOOTER BAR ── */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 40px",
          borderTop: "1px solid #e8e8e8",
        }}>
          <span style={{ fontSize: "7.5px", color: "#aaa", letterSpacing: "0.3px" }}>
            E. &amp; O. G
          </span>
          <span style={{ fontSize: "7.5px", color: "#555" }}>
            NOTE : Please email us the payment receipt.
          </span>
        </div>

        {/* ── RED FOOTER ── */}
        <div style={{
          background: RED,
          padding: "10px 40px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "8px", color: "#fff", marginBottom: "2px" }}>
            {COMPANY_INFO.website}&nbsp;&nbsp;•&nbsp;&nbsp;
            {COMPANY_INFO.email}&nbsp;&nbsp;•&nbsp;&nbsp;
            {COMPANY_INFO.ordersEmail}
          </div>
          <div style={{ fontSize: "8px", color: "#fff" }}>
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
