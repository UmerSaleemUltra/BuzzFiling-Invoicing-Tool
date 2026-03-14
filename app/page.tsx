"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import InvoiceForm from "@/components/invoice-form";
import InvoicePreview from "@/components/invoice-preview";
import { InvoiceData, DEFAULT_INVOICE } from "@/lib/invoice-types";

const INVOICE_NUMBER_KEY = "buzz_filing_invoice_number";
const FORM_DATA_KEY = "buzz_filing_form_data";

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

function loadFormData(): InvoiceData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(FORM_DATA_KEY);
    return raw ? (JSON.parse(raw) as InvoiceData) : null;
  } catch {
    return null;
  }
}

function saveFormData(data: InvoiceData) {
  if (typeof window !== "undefined") {
    localStorage.setItem(FORM_DATA_KEY, JSON.stringify(data));
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
    const saved = loadFormData();
    const num = getNextInvoiceNumber();
    if (saved) {
      setInvoiceData({ ...saved, invoiceNumber: num });
    } else {
      setInvoiceData((prev) => ({ ...prev, invoiceNumber: num }));
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      saveFormData(invoiceData);
    }
  }, [invoiceData, mounted]);

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

    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    const canvas = await html2canvas(el, {
      scale: 5.67,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      imageTimeout: 0,
      removeContainer: true,
      onclone: (clonedDoc) => {
        // Lock Payment Status box to fixed compact height in PDF only
        const psHeader = clonedDoc.querySelector<HTMLElement>(".ps-header");
        const psValue  = clonedDoc.querySelector<HTMLElement>(".ps-value");
        if (psHeader) {
          psHeader.style.padding    = "0";
          psHeader.style.height     = "44px";
          psHeader.style.lineHeight = "44px";
          psHeader.style.overflow   = "hidden";
        }
        if (psValue) {
          psValue.style.padding    = "0";
          psValue.style.height     = "44px";
          psValue.style.lineHeight = "44px";
          psValue.style.overflow   = "hidden";
        }

        const root = clonedDoc.documentElement;
        const hexOverrides: Record<string, string> = {
          "--background": "#f9f9fb",
          "--foreground": "#0d0f1a",
          "--card": "#ffffff",
          "--card-foreground": "#0d0f1a",
          "--popover": "#ffffff",
          "--popover-foreground": "#0d0f1a",
          "--primary": "#ff0d13",
          "--primary-dark": "#cc0a0f",
          "--primary-foreground": "#ffffff",
          "--secondary": "#f3f4f6",
          "--secondary-foreground": "#0d0f1a",
          "--muted": "#f3f4f6",
          "--muted-foreground": "#6b7280",
          "--accent": "#ff0d13",
          "--accent-foreground": "#ffffff",
          "--destructive": "#ff0d13",
          "--destructive-foreground": "#ffffff",
          "--border": "#e5e7eb",
          "--input": "#e5e7eb",
          "--ring": "#ff0d13",
        };
        Object.entries(hexOverrides).forEach(([prop, value]) => {
          root.style.setProperty(prop, value);
        });
      },
    });

    const A4_W = 210;
    const A4_H = 297;

    // Use a second canvas to compress: draw at 96% quality into an offscreen canvas
    // then export as JPEG at high quality — sharp text, smaller file than PNG
    const offscreen = document.createElement("canvas");
    offscreen.width  = canvas.width;
    offscreen.height = canvas.height;
    const ctx = offscreen.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, offscreen.width, offscreen.height);
    ctx.drawImage(canvas, 0, 0);
    const imgData = offscreen.toDataURL("image/jpeg", 0.78);

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Always fill the full A4 page — one page only
    pdf.addImage(imgData, "JPEG", 0, 0, A4_W, A4_H, undefined, "FAST");

    const defaultName = `Invoice-${invoiceData.invoiceNumber}-${invoiceData.billTo.replace(/\s+/g, "-")}`;
    const resolvedName = fileName.trim() ? fileName.trim().replace(/\.pdf$/i, "") : defaultName;
    pdf.save(`${resolvedName}.pdf`);

    saveInvoiceNumber(invoiceData.invoiceNumber + 1);
  }, [invoiceData, fileName]);

  const handleReset = useCallback(() => {
    const nextNum = getNextInvoiceNumber();
    const fresh: InvoiceData = {
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
    };
    setInvoiceData(fresh);
    if (typeof window !== "undefined") {
      localStorage.removeItem(FORM_DATA_KEY);
    }
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/images-SdNz6vfYoJoMVJMUFtXCjHac5xozpZ.png"
            alt="Buzz Filing"
            className="h-8 w-auto object-contain flex-shrink-0"
          />
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground hidden sm:block">
            Invoice Generator
          </span>
          <span
            className="text-[10px] font-bold text-white px-3 py-1 rounded-full tabular-nums flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #ff0d13 0%, #ff6b00 100%)" }}
          >
            #{invoiceData.invoiceNumber}
          </span>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* Left: Form */}
        <aside className="w-full lg:w-[400px] xl:w-[420px] flex-shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-border">
          <InvoiceForm
            data={invoiceData}
            setData={setInvoiceData}
            onDownload={handleDownload}
            onReset={handleReset}
            fileName={fileName}
            setFileName={setFileName}
          />
        </aside>

        {/* Right: Preview */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10" style={{ background: "#f3f4f6" }}>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="w-1 h-4 rounded-full inline-block" style={{ background: "linear-gradient(135deg, #ff0d13 0%, #ff6b00 100%)" }} />
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: "#0d0f1a" }}>
                  Live Preview
                </p>
              </div>
              <span className="text-[10px] text-muted-foreground bg-white border border-border px-2.5 py-1 rounded-full">
                Updates automatically
              </span>
            </div>
            {/* Horizontally scrollable on small screens */}
            <div className="overflow-x-auto">
              <InvoicePreview ref={previewRef} data={invoiceData} />
            </div>
          </div>
        </main>

      </div>
    </div>
  );
}
