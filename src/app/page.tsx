"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";

type LeaderboardEntry = {
  user: string;
  score: number;
};

type BananaState = {
  id: number;
  x: number; // Initial horizontal position
  rotate: number; // Initial rotation
};

/**
 * HomePage is the main entry point for the application.
 * It displays a form to input a user ID, a button to increment the user's score,
 * and a public leaderboard displaying the top 10 scores.
 * The component uses the `useState` and `useCallback` hooks to manage its state and side effects.
 * It also uses the `motion` library to animate the flying bananas.
 */
export default function HomePage() {
  const [userId, setUserId] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bananas, setBananas] = useState<BananaState[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const bananaIdCounter = useRef(0);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await fetch("/api/banana");
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  useEffect(() => {
    if (!userId) {
      setScore(null);
      return;
    }
    /**
     * Fetches the user's current score from the API and updates the component's state.
     * If the API call fails, it logs an error to the console.
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
   * Removes a banana from the state based on its ID.
   * @param {number} id - The ID of the banana to remove.
   */
  const removeBanana = (id: number) => {
    setBananas((prev) => prev.filter((b) => b.id !== id));
  };

  /**
   * Handles the increment button click event.
   * When called, it creates a banana explosion animation by adding new bananas to the state,
   * increments the user's score by calling the API, and refreshes the leaderboard.
   * If the API call fails, it logs an error to the console.
   * If the user ID is empty or the component is currently loading, it does nothing.
   */
  const handleIncrement = async () => {
    if (!userId || isLoading) return;

    // --- Banana Explosion Logic ---
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const newBananas: BananaState[] = Array.from({ length: 15 }).map(() => {
        return {
          id: bananaIdCounter.current++,
          // Start near the horizontal center of the button
          x: rect.left + rect.width / 2,
          rotate: Math.random() * 360, // Give it a random starting rotation
        };
      });
      setBananas((prev) => [...prev, ...newBananas]);
    }

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
    <main className="flex min-h-screen flex-col items-center bg-gray-900 text-white p-4 pt-12 sm:pt-16 overflow-hidden">
      {/* === Flying Bananas Container === */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50">
        {bananas.map((banana) => {
          const startY = buttonRef.current?.getBoundingClientRect().top || 300;

          return (
            <motion.div
              key={banana.id}
              className="absolute text-3xl"
              initial={{ x: banana.x, y: startY, rotate: banana.rotate }}
              // Animate through a sequence of values
              animate={{
                y: [
                  startY, // 1. Start at the button
                  startY - (160 + Math.random() * 50), // 2. Go up
                  window.innerHeight + 100, // 3. Fall down off-screen
                ],
                x: [
                  banana.x, // 1. Start at the button's center
                  banana.x + (Math.random() - 0.5) * 400, // 2. Spread out
                  banana.x + (Math.random() - 0.5) * 550, // 3. Drift further while falling
                ],
                rotate: [
                  banana.rotate,
                  banana.rotate + (Math.random() - 0.5) * 270,
                  banana.rotate + (Math.random() - 0.5) * 540,
                ],
                opacity: [1, 1, 0], // Stay visible, then fade out at the end
              }}
              transition={{
                duration: 2 + Math.random() * 1.5,
                ease: "easeInOut",
                // This maps the timing to the keyframes above
                times: [0, 0.2, 1], // Start at 0s, peak at 20% of duration, end at 100%
              }}
              onAnimationComplete={() => removeBanana(banana.id)}
            >
              🍌
            </motion.div>
          );
        })}
      </div>

      <div className="w-full max-w-sm text-center">
        {/* === Personal Counter Section === */}
        <h1 className="text-4xl font-bold text-yellow-300 sm:text-5xl">
          Banana Counter
        </h1>
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
              ref={buttonRef} // Attach the ref to the button
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
