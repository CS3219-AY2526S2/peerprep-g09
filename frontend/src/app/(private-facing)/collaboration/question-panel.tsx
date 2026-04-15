"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QuestionPanel() {
  return (
    <Card className="bg-tile h-full border">
      <CardHeader className="border-b">
        <CardTitle className="text-lg">Problem Description</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* Problem Title */}
        <div>
          <h2 className="text-xl font-bold">Two Sum</h2>
          <p className="text-sm text-gray-600">Difficulty: Medium</p>
          <p className="text-sm text-gray-600">Category: Arrays & Hashing</p>
        </div>

        {/* Problem Description */}
        <div className="space-y-2">
          <h3 className="font-semibold">Description</h3>
          <p className="text-sm leading-relaxed text-gray-700">
            Given an array of integers nums and an integer target, return the
            indices of the two numbers such that they add up to target. You may
            assume that each input would have exactly one solution, and you may
            not use the same element twice.
          </p>
        </div>

        {/* Examples */}
        <div className="space-y-2">
          <h3 className="font-semibold">Example 1</h3>
          <div className="bg-bg-main-beige-light rounded border border-gray-300 p-3 font-mono text-sm">
            <p>Input: nums = [2,7,11,15], target = 9</p>
            <p>Output: [0,1]</p>
            <p className="text-gray-600">Explanation: nums[0] + nums[1] == 9</p>
          </div>
        </div>

        {/* Constraints */}
        <div className="space-y-2">
          <h3 className="font-semibold">Constraints</h3>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>• 2 &lt;= nums.length &lt;= 10^4</li>
            <li>• -10^9 &lt;= nums[i] &lt;= 10^9</li>
            <li>• -10^9 &lt;= target &lt;= 10^9</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
