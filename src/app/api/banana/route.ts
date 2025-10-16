import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";

const LEADERBOARD_KEY = "banana-leaderboard";

/**
 * GET /api/banana
 *
 * If a userId is provided, returns the user's current score.
 * If no userId is provided, returns the top 10 leaderboard entries.
 *
 * @param {Request} request - The incoming request object.
 * @returns {NextResponse} - The response to send back to the client.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (userId) {
    const score = await redis.zscore(LEADERBOARD_KEY, userId);
    return NextResponse.json({ score: Number(score) || 0 });
  }

  const topTen = await redis.zrange(LEADERBOARD_KEY, 0, 9, {
    rev: true,
    withScores: true,
  });

  const leaderboard = [];
  for (let i = 0; i < topTen.length; i += 2) {
    leaderboard.push({ user: topTen[i], score: Number(topTen[i + 1]) });
  }

  return NextResponse.json({ leaderboard });
}

/**
 * POST /api/banana
 *
 * Increments the user's score by 1 and returns the new score.
 *
 * @param {Request} request - The incoming request object.
 * @returns {NextResponse} - The response to send back to the client.
 */

export async function POST(request: Request): Promise<NextResponse> {
  const { userId } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const newScore = await redis.zincrby(LEADERBOARD_KEY, 1, userId);

  return NextResponse.json({ score: newScore });
}
