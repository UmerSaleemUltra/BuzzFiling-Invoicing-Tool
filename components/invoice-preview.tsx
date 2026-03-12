"use client";

import { forwardRef } from "react";
import { InvoiceData, COMPANY_INFO } from "@/lib/invoice-types";

interface InvoicePreviewProps {
  data: InvoiceData;
}

const STATUS_STYLES: Record<string, string> = {
  Paid: "background:#16a34a;color:#fff",
  "Partial Paid": "background:#d97706;color:#fff",
  Unpaid: "background:#cc1f1f;color:#fff",
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

    return (
      <div
        ref={ref}
        id="invoice-preview"
        style={{
          fontFamily: "'Unbounded', 'Arial', sans-serif",
          background: "#fff",
          color: "#111",
          width: "100%",
          maxWidth: "780px",
          margin: "0 auto",
          fontSize: "12px",
          lineHeight: "1.5",
          boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
        }}
      >
        {/* Header stripe */}
        <div style={{ background: "#cc1f1f", height: "6px", width: "100%" }} />

        {/* Top header */}
        <div
          style={{
            background: "#111",
            padding: "20px 28px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "16px",
          }}
        >
          {/* Brand */}
          <div>
            <div
              style={{
                color: "#cc1f1f",
                fontSize: "26px",
                fontWeight: "900",
                letterSpacing: "2px",
              fontFamily: "'Unbounded', 'Arial Black', sans-serif",
            }}
          >
            BUZZ FILING
            </div>
            <div style={{ color: "#ccc", fontSize: "10px", marginTop: "4px" }}>
              {COMPANY_INFO.address}
            </div>
          </div>

          {/* Contact block */}
          <div style={{ textAlign: "right", color: "#ccc", fontSize: "10px" }}>
            {COMPANY_INFO.phones.map((p) => (
              <div key={p}>{p}</div>
            ))}
            <div style={{ color: "#cc1f1f", marginTop: "4px" }}>
              {COMPANY_INFO.website}
            </div>
            <div style={{ color: "#cc1f1f" }}>{COMPANY_INFO.email}</div>
            <div style={{ color: "#cc1f1f" }}>{COMPANY_INFO.ordersEmail}</div>
          </div>
        </div>

        {/* "Hi! This is Your Invoice." banner */}
        <div
          style={{
            background: "#f7f7f7",
            padding: "12px 28px",
            borderBottom: "2px solid #cc1f1f",
          }}
        >
          <span
            style={{
              color: "#cc1f1f",
              fontWeight: "900",
              fontSize: "18px",
              fontFamily: "'Unbounded', 'Arial Black', sans-serif",
              letterSpacing: "0.5px",
            }}
          >
            Hi!{" "}
          </span>
          <span
            style={{
              color: "#111",
              fontWeight: "700",
              fontSize: "16px",
            }}
          >
            This is Your Invoice.
          </span>
        </div>

        {/* Meta grid */}
        <div style={{ padding: "20px 28px 0" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "0",
              border: "1px solid #ddd",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            {[
              ["BILL TO", data.billTo || "—"],
              ["INVOICE NUMBER", String(data.invoiceNumber)],
              ["INVOICE DATE", formattedDate || "—"],
              ["SERVICES TYPE", data.serviceType],
              ["INVOICE BY", data.invoiceBy || "—"],
              [
                "PAYMENT STATUS",
                data.paymentStatus,
                STATUS_STYLES[data.paymentStatus],
              ],
            ].map(([label, value, badgeStyle], idx) => (
              <div
                key={idx}
                style={{
                  padding: "10px 14px",
                  borderRight: idx % 3 !== 2 ? "1px solid #ddd" : "none",
                  borderBottom: idx < 3 ? "1px solid #ddd" : "none",
                  background: idx % 2 === 0 ? "#fff" : "#fafafa",
                }}
              >
                <div
                  style={{
                    fontSize: "9px",
                    fontWeight: "700",
                    color: "#cc1f1f",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    marginBottom: "3px",
                  }}
                >
                  {label}
                </div>
                {badgeStyle ? (
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 10px",
                      borderRadius: "12px",
                      fontSize: "10px",
                      fontWeight: "700",
                      ...(Object.fromEntries(
                        badgeStyle
                          .split(";")
                          .filter(Boolean)
                          .map((s) => {
                            const [k, v] = s.split(":");
                            const key = k
                              .trim()
                              .replace(/-([a-z])/g, (_, c) => c.toUpperCase());
                            return [key, v.trim()];
                          })
                      ) as React.CSSProperties),
                    }}
                  >
                    {value}
                  </span>
                ) : (
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#111",
                    }}
                  >
                    {value}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Line Items Table */}
        <div style={{ padding: "20px 28px 0" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "12px",
            }}
          >
            <thead>
              <tr style={{ background: "#111", color: "#fff" }}>
                {["DESCRIPTION", "QTY", "RATE", "AMOUNT"].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: "8px 12px",
                      fontWeight: "700",
                      fontSize: "10px",
                      letterSpacing: "0.8px",
                      textAlign: i === 0 ? "left" : "right",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.lineItems.map((item, idx) => (
                <tr
                  key={item.id}
                  style={{ background: idx % 2 === 0 ? "#fff" : "#f9f9f9" }}
                >
                  <td
                    style={{
                      padding: "8px 12px",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {item.description || "—"}
                  </td>
                  <td
                    style={{
                      padding: "8px 12px",
                      textAlign: "right",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {item.qty}
                  </td>
                  <td
                    style={{
                      padding: "8px 12px",
                      textAlign: "right",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    ${item.rate.toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: "8px 12px",
                      textAlign: "right",
                      fontWeight: "700",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    ${(item.qty * item.rate).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals + Payment Terms */}
        <div
          style={{
            padding: "16px 28px 0",
            display: "grid",
            gridTemplateColumns: "1fr 220px",
            gap: "20px",
            alignItems: "start",
          }}
        >
          {/* Payment Terms */}
          <div>
            {data.paymentTerms && (
              <div
                style={{
                  background: "#fff8f0",
                  border: "1px solid #f0c080",
                  borderRadius: "4px",
                  padding: "10px 12px",
                  fontSize: "11px",
                  color: "#555",
                  lineHeight: "1.6",
                }}
              >
                <div
                  style={{
                    fontWeight: "700",
                    color: "#111",
                    marginBottom: "4px",
                    fontSize: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.6px",
                  }}
                >
                  PAYMENT TERMS
                </div>
                {data.paymentTerms}
              </div>
            )}
          </div>

          {/* Totals */}
          <div>
            {[
              ["Sub Total", `$${subTotal.toFixed(2)}`, false],
              ["Discount", `$${data.discount.toFixed(2)}`, false],
              ["Payment", `$${data.paymentReceived.toFixed(2)}`, false],
              ["Balance", `$${balance.toFixed(2)}`, true],
            ].map(([label, value, highlight]) => (
              <div
                key={label as string}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "6px 10px",
                  marginBottom: "2px",
                  background: highlight ? "#cc1f1f" : "#f7f7f7",
                  borderRadius: "3px",
                }}
              >
                <span
                  style={{
                    fontWeight: "700",
                    fontSize: "11px",
                    color: highlight ? "#fff" : "#444",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {label as string}
                </span>
                <span
                  style={{
                    fontWeight: "900",
                    fontSize: "13px",
                    color: highlight ? "#fff" : "#111",
                  }}
                >
                  {value as string}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* PKR Bank Details */}
        <div style={{ padding: "16px 28px 0" }}>
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "#111",
                color: "#fff",
                padding: "6px 12px",
                fontSize: "10px",
                fontWeight: "700",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              PKR BANK DETAILS
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                padding: "10px 12px",
                gap: "8px",
              }}
            >
              {[
                ["Account Title", COMPANY_INFO.bankAccountTitle],
                ["Account Number", COMPANY_INFO.bankAccountNumber],
                ["IBAN", COMPANY_INFO.iban],
                ["Bank Name", COMPANY_INFO.bankName],
              ].map(([label, value]) => (
                <div key={label}>
                  <div
                    style={{
                      fontSize: "9px",
                      color: "#cc1f1f",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: "2px",
                    }}
                  >
                    {label}
                  </div>
                  <div style={{ fontSize: "10px", fontWeight: "700", color: "#111" }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 28px 20px" }}>
          <div
            style={{
              background: "#cc1f1f",
              borderRadius: "4px",
              padding: "10px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                color: "#fff",
                fontWeight: "900",
                fontSize: "13px",
              fontFamily: "'Unbounded', 'Arial Black', sans-serif",
              letterSpacing: "0.5px",
              }}
            >
              Thank you for your business!
            </span>
            <span style={{ color: "#ffcccc", fontSize: "10px", fontStyle: "italic" }}>
              NOTE: Please email us the payment receipt.
            </span>
          </div>

          <div
            style={{
              marginTop: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "9px",
              color: "#999",
            }}
          >
            <span>{COMPANY_INFO.website} • {COMPANY_INFO.email} • {COMPANY_INFO.ordersEmail}</span>
            <span style={{ color: "#cc1f1f", fontWeight: "700" }}>E. &amp; O. E</span>
          </div>
        </div>

        {/* Bottom stripe */}
        <div style={{ background: "#cc1f1f", height: "6px", width: "100%" }} />
      </div>
    );
  }
);

InvoicePreview.displayName = "InvoicePreview";
export default InvoicePreview;
