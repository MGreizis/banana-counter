"use client";

import { useState, useEffect } from "react";

export default function HomePage() {
  const [userId, setUserId] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setScore(null); // Clear score if there's no user
      return;
    }

    /**
     * Fetches the user's score from the server.
     * Sets the score state and handles errors.
     * Also sets the isLoading state to true while the fetch is in progress.
     */
    const fetchUserScore = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/banana?userId=${userId}`);
        const data = await response.json();
        setScore(data.score);
      } catch (error) {
        console.error("Failed to fetch score:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserScore();
  }, [userId]);

  /**
   * Increments the user's score by posting to the server.
   * Handles errors and sets the isLoading state to true while the fetch is in progress.
   * @returns {Promise<void>} A promise that resolves when the fetch is complete.
   */
  const handleIncrement = async (): Promise<void> => {
    if (!userId || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/banana", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId }),
      });
      const data = await response.json();
      setScore(data.score);
    } catch (error) {
      console.error("Failed to increment score:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-4xl font-bold text-yellow-300 sm:text-5xl">
          Banana Counter
        </h1>
        <p className="mt-2 text-lg text-gray-400">
          Enter your name to start counting!
        </p>

        {/* Input for Username */}
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value.toLowerCase())}
          placeholder="Enter your name..."
          className="mt-8 w-full rounded-md bg-gray-800 px-4 py-2 text-center text-lg text-white ring-1 ring-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        {/* Display score only if a user is entered */}
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
    </main>
  );
}
