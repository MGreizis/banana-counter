import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";

const SCORES_KEY = "banana-count";

/**
 * Returns the current count of bananas.
 * If the count doesn't exist yet, returns 0.
 * @returns {NextResponse} A JSON response containing the count.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  // Get the value of a specific field (userId) from a hash (SCORES_KEY).
  const score = await redis.hget(SCORES_KEY, userId);

  return NextResponse.json({ score: Number(score) || 0 });
}

/**
 * Increments the count of bananas.
 * @returns {NextResponse} A JSON response containing the new count.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const { userId } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  // Atomically increment the value of a field (userId) in a hash.
  // (key, field, increment_amount)
  const newScore = await redis.hincrby(SCORES_KEY, userId, 1);

  return NextResponse.json({ score: newScore });
}
