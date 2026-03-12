"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import InvoiceForm from "@/components/invoice-form";
import InvoicePreview from "@/components/invoice-preview";
import { InvoiceData, DEFAULT_INVOICE } from "@/lib/invoice-types";

const INVOICE_NUMBER_KEY = "buzz_filing_invoice_number";

function getNextInvoiceNumber(): number {
  if (typeof window === "undefined") return 2869;
  const stored = localStorage.getItem(INVOICE_NUMBER_KEY);
  return stored ? parseInt(stored, 10) : 2869;
}

function saveInvoiceNumber(n: number) {
  if (typeof window !== "undefined") {
    localStorage.setItem(INVOICE_NUMBER_KEY, String(n));
  }
}

export default function Home() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(() => ({
    ...DEFAULT_INVOICE,
    invoiceNumber: 2869,
  }));

  const [mounted, setMounted] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const num = getNextInvoiceNumber();
    setInvoiceData((prev) => ({ ...prev, invoiceNumber: num }));
    setMounted(true);
  }, []);

  const handleDownload = useCallback(async () => {
    if (!invoiceData.billTo.trim()) {
      alert("Please enter a client name (Bill To) before downloading.");
      return;
    }
    if (invoiceData.lineItems.every((i) => !i.description.trim())) {
      alert("Please add at least one service description before downloading.");
      return;
    }

    const el = document.getElementById("invoice-preview");
    if (!el) return;

    // Dynamically import to avoid SSR issues
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width / 2, canvas.height / 2],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);

    const fileName = `Invoice-${invoiceData.invoiceNumber}-${invoiceData.billTo.replace(/\s+/g, "-")}.pdf`;
    pdf.save(fileName);

    // Save next invoice number AFTER successful download, without resetting the form
    saveInvoiceNumber(invoiceData.invoiceNumber + 1);
  }, [invoiceData]);

  const handleReset = useCallback(() => {
    const nextNum = getNextInvoiceNumber();
    setInvoiceData({
      ...DEFAULT_INVOICE,
      invoiceNumber: nextNum,
      lineItems: [
        {
          id: crypto.randomUUID(),
          description: "",
          qty: 1,
          rate: 0,
        },
      ],
    });
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* App Bar */}
      <header
        className="flex items-center gap-3 px-6 py-3 border-b border-border"
        style={{ background: "#111" }}
      >
        <span
          style={{
            color: "#cc1f1f",
            fontWeight: "900",
            fontSize: "20px",
            letterSpacing: "2px",
            fontFamily: "Arial Black, Arial, sans-serif",
          }}
        >
          BUZZ FILING
        </span>
        <span
          className="text-sm font-medium"
          style={{ color: "#888", borderLeft: "1px solid #333", paddingLeft: "12px" }}
        >
          Invoice Generator
        </span>
      </header>

      {/* Main two-panel layout */}
      <main className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        {/* Left: Form Panel */}
        <aside className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 border-b lg:border-b-0 lg:border-r border-border bg-card overflow-y-auto max-h-[50vh] lg:max-h-none">
          <InvoiceForm
            data={invoiceData}
            setData={setInvoiceData}
            onDownload={handleDownload}
            onReset={handleReset}
          />
        </aside>

        {/* Right: Preview Panel */}
        <section className="flex-1 overflow-y-auto p-6 lg:p-8 bg-muted/30">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                Live Preview
              </h2>
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                Invoice #{invoiceData.invoiceNumber}
              </span>
            </div>
            <InvoicePreview ref={previewRef} data={invoiceData} />
          </div>
        </section>
      </main>
    </div>
  );
}
