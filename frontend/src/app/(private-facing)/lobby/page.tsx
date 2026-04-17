"use client";

import { TileStat } from "@/app/(private-facing)/lobby/tile-stat";
import { TabPages } from "./tab-pages";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Lobby() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalAttempted: 0,
    byDifficulty: { Easy: 0, Medium: 0, Hard: 0 },
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [difficulties, setDifficulties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }
    setIsAuthenticated(true);
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        // Fetch stats
        const statsResponse = await fetch("http://localhost:5001/api/users/get-stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!statsResponse.ok) {
          throw new Error("Failed to fetch stats");
        }

        const statsData = await statsResponse.json();
        setStats({
          totalAttempted: statsData.totalAttempted || 0,
          byDifficulty: {
            Easy: statsData.byDifficulty?.easy || 0,
            Medium: statsData.byDifficulty?.medium || 0,
            Hard: statsData.byDifficulty?.hard || 0,
          },
        });

        // Fetch categories
        const categoriesResponse = await fetch(
          "http://localhost:5001/api/matching/categories"
        );
        if (!categoriesResponse.ok) {
          throw new Error("Failed to fetch categories");
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories || []);

        // Fetch difficulties
        const difficultiesResponse = await fetch(
          "http://localhost:5001/api/matching/difficulties"
        );
        if (!difficultiesResponse.ok) {
          throw new Error("Failed to fetch difficulties");
        }
        const difficultiesData = await difficultiesResponse.json();
        setDifficulties(difficultiesData.difficulties || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  return (
    <div className="flex flex-1 flex-col gap-y-10">
      <div className="flex justify-start gap-x-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 flex h-24 w-56 items-center justify-center rounded-lg border border-blue-200 dark:border-blue-700 p-3 shadow-sm">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Questions</p>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.totalAttempted}</p>
          </div>
        </div>
        <TileStat stat={stats.byDifficulty.Easy} category="Easy" />
        <TileStat stat={stats.byDifficulty.Medium} category="Medium" />
        <TileStat stat={stats.byDifficulty.Hard} category="Hard" />
      </div>
      <TabPages categories={categories} difficulties={difficulties} />
    </div>
  );
}
