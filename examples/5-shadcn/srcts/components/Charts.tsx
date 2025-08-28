import React from "react";
import { useShinyOutput } from "shiny-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { TrendingUp, BarChart3 } from "lucide-react";

interface ChartDataPoint {
  date: string;
  revenue: number;
  orders: number;
  users: number;
}

interface ChartData {
  revenue_trend: ChartDataPoint[];
  category_performance: Array<{
    category: string;
    sales: number;
    revenue: number;
  }>;
}

export function Charts() {
  const [chartData, isLoading] = useShinyOutput<ChartData | undefined>(
    "chart_data",
    undefined
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (!chartData || isLoading) {
    return (
      <div className="space-y-6">
        {/* Revenue Trend Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>

        {/* Category Performance Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Revenue Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.revenue_trend}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                fontSize={12}
                className="text-muted-foreground"
              />
              <YAxis
                yAxisId="left"
                tickFormatter={formatCurrency}
                fontSize={12}
                className="text-muted-foreground"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                fontSize={12}
                className="text-muted-foreground"
              />
              <Tooltip
                labelFormatter={(label) => formatDate(label)}
                formatter={(value: number, name: string) => {
                  if (name === "revenue") {
                    return [formatCurrency(Number(value)), "Revenue"];
                  } else if (name === "orders") {
                    return [`${value} orders`, "Orders"];
                  } else if (name === "users") {
                    return [`${value} users`, "New Users"];
                  }
                  return [value, name];
                }}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                activeDot={{
                  r: 6,
                  stroke: "hsl(var(--primary))",
                  strokeWidth: 2,
                }}
                yAxisId="left"
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--destructive))", strokeWidth: 2 }}
                yAxisId="right"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Category Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData.category_performance}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="category"
                fontSize={12}
                className="text-muted-foreground"
              />
              <YAxis
                tickFormatter={formatCurrency}
                fontSize={12}
                className="text-muted-foreground"
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === "revenue") {
                    return [formatCurrency(Number(value)), "Revenue"];
                  } else if (name === "sales") {
                    return [`${value} sales`, "Sales"];
                  }
                  return [value, name];
                }}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Bar
                dataKey="revenue"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="sales"
                fill="hsl(var(--secondary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
