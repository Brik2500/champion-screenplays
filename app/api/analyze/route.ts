import { NextRequest, NextResponse } from "next/server";
import { analyzeScript } from "@/lib/ai";

export const maxDuration = 60;

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

    try {
      const pdfParse = (await import("pdf-parse")).default;
      const result = await pdfParse(buffer);
      if (result.text.trim().length >= 200) {
        return result.text;
      }
    } catch {
      // fall through
    }

    // Scanned PDF — OCR not supported in this environment
    throw new Error(
      "This appears to be a scanned PDF with no text layer. Please export your screenplay as a text-based PDF from Final Draft, WriterDuet, or a similar app and try again."
    );
  }

  // txt, fountain, fdx
  return file.text();
}
