import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { MetricsCards } from "@/components/MetricsCards";
import { DataTable } from "@/components/DataTable";
import { Charts } from "@/components/Charts";
import { Separator } from "@/components/ui/separator";

export function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar className="hidden lg:block border-r" />
        <main className="flex-1 p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome to your analytics dashboard. Monitor your key metrics and performance.
            </p>
          </div>
          
          <Separator />
          
          <MetricsCards />
          
          <div className="grid gap-6 lg:grid-cols-2">
            <Charts />
            <DataTable />
          </div>
        </main>
      </div>
    </div>
  );
}