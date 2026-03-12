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
  const [fileName, setFileName] = useState("");
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
      onclone: (clonedDoc) => {
        // html2canvas cannot parse oklch/lab CSS color functions.
        // Override all CSS custom properties used in the invoice with plain hex values.
        const root = clonedDoc.documentElement;
        const hexOverrides: Record<string, string> = {
          "--background": "#f7f7f7",
          "--foreground": "#111111",
          "--card": "#ffffff",
          "--card-foreground": "#111111",
          "--popover": "#ffffff",
          "--popover-foreground": "#111111",
          "--primary": "#cc1f1f",
          "--primary-foreground": "#ffffff",
          "--secondary": "#f2f2f2",
          "--secondary-foreground": "#111111",
          "--muted": "#ededed",
          "--muted-foreground": "#777777",
          "--accent": "#cc1f1f",
          "--accent-foreground": "#ffffff",
          "--destructive": "#cc1f1f",
          "--destructive-foreground": "#ffffff",
          "--border": "#dddddd",
          "--input": "#dddddd",
          "--ring": "#cc1f1f",
        };
        Object.entries(hexOverrides).forEach(([prop, value]) => {
          root.style.setProperty(prop, value);
        });
      },
    });

    // A4 in mm: 210 x 297
    const A4_W = 210;
    const A4_H = 297;

    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Scale image to fit A4 width, preserving aspect ratio
    const canvasRatio = canvas.height / canvas.width;
    const imgH = A4_W * canvasRatio;

    // If content is taller than one A4 page, split across pages
    let yOffset = 0;
    while (yOffset < imgH) {
      if (yOffset > 0) pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, -yOffset, A4_W, imgH);
      yOffset += A4_H;
    }

    const defaultName = `Invoice-${invoiceData.invoiceNumber}-${invoiceData.billTo.replace(/\s+/g, "-")}`;
    const resolvedName = fileName.trim() ? fileName.trim().replace(/\.pdf$/i, "") : defaultName;
    pdf.save(`${resolvedName}.pdf`);

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
      <header className="flex items-center justify-between px-6 py-3 bg-card border-b border-border">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/images-SdNz6vfYoJoMVJMUFtXCjHac5xozpZ.png"
          alt="Buzz Filing"
          className="h-9 w-auto object-contain"
        />
        <span
          className="text-xs font-semibold tracking-widest uppercase text-muted-foreground"
          style={{ fontFamily: "var(--font-heading, sans-serif)" }}
        >
          Invoice Generator
        </span>
      </header>

      {/* Main two-panel layout */}
      <main className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        {/* Left: Form Panel */}
        <aside className="w-full lg:w-[400px] xl:w-[440px] flex-shrink-0 border-b lg:border-b-0 lg:border-r border-border bg-card overflow-y-auto max-h-[50vh] lg:max-h-none shadow-sm">
          <InvoiceForm
            data={invoiceData}
            setData={setInvoiceData}
            onDownload={handleDownload}
            onReset={handleReset}
            fileName={fileName}
            setFileName={setFileName}
          />
        </aside>

        {/* Right: Preview Panel */}
        <section className="flex-1 overflow-y-auto p-6 lg:p-8 bg-muted/30">
          <div className="max-w-4xl mx-auto">
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
