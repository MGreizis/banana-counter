"use client";

import { useState, useEffect, useCallback } from "react";

type LeaderboardEntry = {
  user: string;
  score: number;
};

/**
 * HomePage component
 *
 * This component displays a personal counter and a public leaderboard.
 * It fetches the leaderboard on page load and fetches the user's score
 * when the userId changes. It also handles incrementing the user's score.
 */
export default function HomePage() {
  const [userId, setUserId] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await fetch("/api/banana");
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    }
  }, []);

  // Fetch initial leaderboard on page load
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Fetch individual user's score when userId changes
  useEffect(() => {
    if (!userId) {
      setScore(null);
      return;
    }
    /**
     * Fetches the user's score from the API and updates the score state.
     *
     * @throws {Error} If the API request fails
     */
    const fetchUserScore = async () => {
      try {
        const response = await fetch(`/api/banana?userId=${userId}`);
        const data = await response.json();
        setScore(data.score);
      } catch (error) {
        console.error("Failed to fetch score:", error);
      }
    };
    fetchUserScore();
  }, [userId]);

  /**
   * Increments the user's score by 1 and refreshes the leaderboard.
   *
   * @throws {Error} If the API request fails
   */
  const handleIncrement = async () => {
    if (!userId || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/banana", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId }),
      });
      const data = await response.json();
      setScore(data.score); // Update personal score
      await fetchLeaderboard(); // Refresh the leaderboard after incrementing
    } catch (error) {
      console.error("Failed to increment score:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-900 text-white p-4 pt-12 sm:pt-16">
      <div className="w-full max-w-sm text-center">
        {/* === Personal Counter Section === */}
        <h1 className="text-4xl font-bold text-yellow-300 sm:text-5xl">
          Banana Counter
        </h1>
        <p className="mt-2 text-lg text-gray-400">
          Enter your name to start counting!
        </p>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value.toLowerCase().trim())}
          placeholder="Enter your name..."
          className="mt-8 w-full rounded-md bg-gray-800 px-4 py-2 text-center text-lg text-white ring-1 ring-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        {userId && (
          <>
            <div className="my-10">
              {score === null ? (
                <p className="text-6xl font-bold animate-pulse">...</p>
              ) : (
                <p className="text-8xl font-bold text-yellow-400 transition-all sm:text-9xl">
                  {score}
                </p>
              )}
            </div>
            <button
              onClick={handleIncrement}
              disabled={isLoading}
              className="rounded-full bg-yellow-400 px-12 py-5 text-2xl font-bold text-gray-900 shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-600"
            >
              {isLoading ? "Counting..." : "🍌 A Banana!"}
            </button>
          </>
        )}
      </div>
      {/* === Public Leaderboard Section === */}
      <div className="mt-16 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center text-yellow-300">
          Top 10 Leaderboard
        </h2>
        {leaderboard.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {leaderboard.map((entry, index) => (
              <li
                key={entry.user}
                className="flex items-center justify-between rounded-lg bg-gray-800 p-3"
              >
                <div className="flex items-center">
                  <span className="mr-3 w-6 text-right text-lg font-bold text-gray-400">
                    {index + 1}.
                  </span>
                  <span className="font-medium capitalize">{entry.user}</span>
                </div>
                <span className="font-bold text-yellow-400">{entry.score}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-center text-gray-500">
            No scores yet. Be the first!
          </p>
        )}
      </div>
    </main>
  );
}
