import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let browser: import("playwright-core").Browser | null = null;

  try {
    const { html, fileName } = await req.json();

    if (!html) {
      return NextResponse.json({ error: "Missing html" }, { status: 400 });
    }

    const { chromium } = await import("playwright-core");

    let executablePath: string;
    let launchArgs: string[];

    try {
      // Serverless (Vercel) — use @sparticuz/chromium-min binary
      const chromiumPkg = await import("@sparticuz/chromium-min");
      executablePath = await chromiumPkg.default.executablePath(
        "https://github.com/Sparticuz/chromium/releases/download/v123.0.0/chromium-v123.0.0-pack.tar"
      );
      launchArgs = chromiumPkg.default.args;
    } catch {
      // Local dev — use system Chrome
      executablePath =
        process.platform === "win32"
          ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
          : process.platform === "darwin"
          ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
          : "/usr/bin/google-chrome-stable";
      launchArgs = ["--no-sandbox", "--disable-setuid-sandbox"];
    }

    browser = await chromium.launch({
      executablePath,
      args: launchArgs,
      headless: true,
    });

    const context = await browser.newContext({
      viewport: { width: 794, height: 1123 },
      deviceScaleFactor: 2,
    });

    const page = await context.newPage();

    // Load full HTML with embedded fonts and styles
    await page.setContent(html, { waitUntil: "networkidle" });

    // Ensure all fonts are fully loaded before rendering
    await page.evaluate(() => document.fonts.ready);

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    await browser.close();
    browser = null;

    const name = fileName
      ? `${fileName.replace(/\.pdf$/i, "")}.pdf`
      : "invoice.pdf";

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${name}"`,
      },
    });
  } catch (error) {
    if (browser) await browser.close().catch(() => {});
    console.error("[generate-pdf] error:", error);
    return NextResponse.json(
      { error: "PDF generation failed", detail: String(error) },
      { status: 500 }
    );
  }
}
