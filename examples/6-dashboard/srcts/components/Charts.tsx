import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, TrendingUp } from "lucide-react";
import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useShinyOutput } from "shiny-react";

interface ChartDataPoint {
  date: string;
  revenue: number;
  orders: number;
  users: number;
}

interface CategoryPerformancePoint {
  category: string;
  sales: number;
  revenue: number;
}

// Column-major format from backend
interface ChartColumns {
  revenue_trend: {
    date: string[];
    revenue: number[];
    orders: number[];
    users: number[];
  };
  category_performance: {
    category: string[];
    sales: number[];
    revenue: number[];
  };
}

// Row-major format for Recharts
interface ChartData {
  revenue_trend: ChartDataPoint[];
  category_performance: CategoryPerformancePoint[];
}

export function Charts() {
  const [chartColumnsData, isLoading] = useShinyOutput<
    ChartColumns | undefined
  >("chart_data", undefined);

  // Convert column-major format to row-major format for Recharts
  const chartData: ChartData | undefined = chartColumnsData
    ? {
        revenue_trend: Array.isArray(chartColumnsData.revenue_trend?.date)
          ? chartColumnsData.revenue_trend.date.map(
              (date: string, index: number) => ({
                date,
                revenue: chartColumnsData.revenue_trend.revenue?.[index] || 0,
                orders: chartColumnsData.revenue_trend.orders?.[index] || 0,
                users: chartColumnsData.revenue_trend.users?.[index] || 0,
              })
            )
          : [],
        category_performance: Array.isArray(chartColumnsData.category_performance?.category)
          ? chartColumnsData.category_performance.category.map(
              (category: string, index: number) => ({
                category,
                sales: chartColumnsData.category_performance.sales?.[index] || 0,
                revenue: chartColumnsData.category_performance.revenue?.[index] || 0,
              })
            )
          : [],
      }
    : undefined;

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
      <div className='space-y-6'>
        {/* Revenue Trend Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-32' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-64 w-full' />
          </CardContent>
        </Card>

        {/* Category Performance Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-40' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-64 w-full' />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg flex items-center'>
            <TrendingUp className='mr-2 h-5 w-5' />
            Revenue Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width='100%' height={300}>
            <LineChart data={chartData.revenue_trend}>
              <CartesianGrid strokeDasharray='3 3' className='opacity-30' />
              <XAxis
                dataKey='date'
                tickFormatter={formatDate}
                fontSize={12}
                className='text-muted-foreground'
              />
              <YAxis
                yAxisId='left'
                tickFormatter={formatCurrency}
                fontSize={12}
                className='text-muted-foreground'
              />
              <YAxis
                yAxisId='right'
                orientation='right'
                fontSize={12}
                className='text-muted-foreground'
              />
              <Tooltip
                labelFormatter={(label) => formatDate(label)}
                formatter={(value: number, name: string) => {
                  if (name === "revenue") {
                    return [formatCurrency(Number(value)), "Revenue"];
                  } else if (name === "orders") {
                    return [
                      Math.round(Number(value)).toLocaleString(),
                      "Orders",
                    ];
                  } else if (name === "users") {
                    return [
                      Math.round(Number(value)).toLocaleString(),
                      "New Users",
                    ];
                  }
                  return [value, name];
                }}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  padding: "8px 12px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Line
                type='monotone'
                dataKey='revenue'
                stroke='var(--chart-1)'
                strokeWidth={2}
                dot={{ fill: "var(--chart-1)", strokeWidth: 2 }}
                activeDot={{
                  r: 6,
                  stroke: "var(--chart-1)",
                  strokeWidth: 2,
                }}
                yAxisId='left'
              />
              <Line
                type='monotone'
                dataKey='orders'
                stroke='var(--chart-2)'
                strokeWidth={2}
                dot={{ fill: "var(--chart-2)", strokeWidth: 2 }}
                yAxisId='right'
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg flex items-center'>
            <BarChart3 className='mr-2 h-5 w-5' />
            Category Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart
              data={chartData.category_performance}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' className='opacity-30' />
              <XAxis
                dataKey='category'
                fontSize={12}
                className='text-muted-foreground'
              />
              <YAxis
                tickFormatter={formatCurrency}
                fontSize={12}
                className='text-muted-foreground'
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === "revenue") {
                    return [formatCurrency(Number(value)), "Revenue"];
                  } else if (name === "sales") {
                    return [
                      Math.round(Number(value)).toLocaleString(),
                      "Sales",
                    ];
                  }
                  return [value, name];
                }}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  padding: "8px 12px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Bar
                dataKey='revenue'
                fill='var(--chart-1)'
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
