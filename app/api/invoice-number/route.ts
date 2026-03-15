import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

const COUNTER_ID = "invoice_number";
const START_VALUE = 2100;

// GET — returns the current invoice number without incrementing
export async function GET() {
  try {
    const db = await getDb();
    const doc = await db
      .collection("counters")
      .findOne({ _id: COUNTER_ID as unknown as import("mongodb").ObjectId });

    const current = doc ? (doc.value as number) : START_VALUE;
    return NextResponse.json({ invoiceNumber: current });
  } catch (err) {
    console.error("[invoice-number GET]", err);
    return NextResponse.json({ error: "Failed to fetch invoice number" }, { status: 500 });
  }
}

// POST — increments the counter and returns the new number
export async function POST() {
  try {
    const db = await getDb();
    const result = await db.collection("counters").findOneAndUpdate(
      { _id: COUNTER_ID as unknown as import("mongodb").ObjectId },
      { $inc: { value: 1 } },
      { upsert: true, returnDocument: "before" }
    );

    // If it was just upserted (first time), value starts at START_VALUE
    const previous = result ? (result.value as number) : START_VALUE;
    const next = previous + 1;

    return NextResponse.json({ invoiceNumber: next });
  } catch (err) {
    console.error("[invoice-number POST]", err);
    return NextResponse.json({ error: "Failed to increment invoice number" }, { status: 500 });
  }
}
