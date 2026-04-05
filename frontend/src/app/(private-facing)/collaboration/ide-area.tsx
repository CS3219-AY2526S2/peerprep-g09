"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function IDEArea() {
  return (
    <Card className="bg-tile h-full border-1">
      <CardHeader className="flex flex-row items-center justify-between border-b">
        <CardTitle className="text-lg">Code Editor</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Run Code
          </Button>
          <Button
            size="sm"
            className="bg-main-beige hover:bg-main-beige hover:opacity-90"
          >
            Submit
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {/* IDE Placeholder */}
        {/* <div className="h-full space-y-2 rounded border-2 border-dashed border-gray-400 bg-gray-50 p-4">
          <p className="font-mono text-sm text-gray-500">IDE Placeholder</p>
          <p className="font-mono text-sm text-gray-500">
            In-browser code editor would go here
          </p>
          <p className="font-mono text-sm text-gray-500">
            Supports syntax highlighting and autocompletion
          </p>
          <div className="pt-4">
            <pre className="font-mono text-sm text-gray-600">
              {`function twoSum(nums, target) {
                // Your solution here
                return [];
              }`}
            </pre>
          </div>
        </div> */}
      </CardContent>
    </Card>
  );
}
