"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TerminalArea() {
  return (
    <Card className="bg-tile h-full border-1">
      <CardHeader className="border-b">
        <CardTitle className="text-sm">Terminal Output</CardTitle>
      </CardHeader>
      <CardContent className="p-3"></CardContent>
    </Card>
  );
}
