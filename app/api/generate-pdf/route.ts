import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { html, fileName } = await req.json();

    if (!html) {
      return NextResponse.json({ error: "Missing html" }, { status: 400 });
    }

    let browser;

    try {
      // Try local puppeteer first (dev), fall back to serverless chromium (prod)
      const puppeteer = await import("puppeteer-core");

      let executablePath: string;
      let launchArgs: string[];

      try {
        const chromium = await import("@sparticuz/chromium-min");
        executablePath = await chromium.default.executablePath(
          "https://github.com/Sparticuz/chromium/releases/download/v123.0.0/chromium-v123.0.0-pack.tar"
        );
        launchArgs = chromium.default.args;
      } catch {
        // Local dev fallback — use system Chrome
        executablePath =
          process.platform === "win32"
            ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
            : process.platform === "darwin"
            ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
            : "/usr/bin/google-chrome-stable";
        launchArgs = ["--no-sandbox", "--disable-setuid-sandbox"];
      }

      browser = await puppeteer.default.launch({
        executablePath,
        args: launchArgs,
        headless: true,
      });

      const page = await browser.newPage();

      // Set A4 viewport
      await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });

      // Load the full HTML with all fonts embedded
      await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });

      // Wait for Unbounded font to render
      await page.evaluateHandle("document.fonts.ready");

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "0", right: "0", bottom: "0", left: "0" },
      });

      await browser.close();

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
    } catch (err) {
      if (browser) await browser.close().catch(() => {});
      throw err;
    }
  } catch (error) {
    console.error("[generate-pdf] error:", error);
    return NextResponse.json(
      { error: "PDF generation failed", detail: String(error) },
      { status: 500 }
    );
  }
}
