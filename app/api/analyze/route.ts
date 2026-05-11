import { NextRequest, NextResponse } from "next/server";
import { analyzeScript } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();

    const title = data.get("title") as string;
    const writerName = data.get("writerName") as string;
    const genre = data.get("genre") as string;
    const format = data.get("format") as "Feature" | "Short" | "TV Pilot";
    const file = data.get("file") as File | null;

    if (!title || !writerName || !genre || !format || !file) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const scriptText = await extractText(file);

    if (!scriptText.trim()) {
      return NextResponse.json(
        { error: "Could not extract any text from this file. Make sure the file isn't empty or corrupted." },
        { status: 400 }
      );
    }

    const report = await analyzeScript({ title, writerName, genre, format, scriptText });
    return NextResponse.json({ ...report, title, writerName });
  } catch (err) {
    console.error("[analyze]", err);
    return NextResponse.json(
      { error: "Analysis failed. Check your API key and try again." },
      { status: 500 }
    );
  }
}

async function extractText(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "pdf") {
    const buffer = Buffer.from(await file.arrayBuffer());

    // Try text extraction first
    try {
      const pdfParse = (await import("pdf-parse")).default;
      const result = await pdfParse(buffer);
      if (result.text.trim().length >= 200) {
        return result.text;
      }
    } catch {
      // fall through to OCR
    }

    // PDF has no readable text; render pages and OCR
    console.log("[analyze] Scanned PDF detected, running OCR...");
    return ocrPDF(buffer);
  }

  if (["jpg", "jpeg", "png", "webp", "tiff", "tif", "bmp"].includes(ext ?? "")) {
    return ocrImage(file);
  }

  // txt, fountain, fdx
  return file.text();
}

async function ocrPDF(buffer: Buffer): Promise<string> {
  const { pdfToPng } = await import("pdf-to-png-converter");
  const pages = await pdfToPng(buffer, {
    disableFontFace: true,
    useSystemFonts: true,
  });

  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");

  const texts: string[] = [];
  for (const page of pages) {
    if (!page.content) continue;
    const { data } = await worker.recognize(page.content);
    texts.push(data.text);
  }

  await worker.terminate();
  return texts.join("\n\n");
}

async function ocrImage(file: File): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const buffer = Buffer.from(await file.arrayBuffer());
  const worker = await createWorker("eng");
  const { data } = await worker.recognize(buffer);
  await worker.terminate();
  return data.text;
}
