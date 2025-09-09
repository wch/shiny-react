import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useShinyOutput } from "@posit/shiny-react";
import {
  Activity,
  DollarSign,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import React from "react";

interface Metric {
  title: string;
  value: string;
  change: number;
  trend: "up" | "down";
  icon: React.ComponentType<{ className?: string }>;
}

interface MetricsData {
  revenue: Metric;
  users: Metric;
  orders: Metric;
  conversion: Metric;
}

export function MetricsCards() {
  const [metricsData, metricsDataRecalculating] = useShinyOutput<
    MetricsData | undefined
  >("metrics_data", undefined);

  if (!metricsData) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-4' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-8 w-16 mb-2' />
              <Skeleton className='h-4 w-20' />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      ...metricsData.revenue,
      icon: DollarSign,
      key: "revenue",
    },
    {
      ...metricsData.users,
      icon: Users,
      key: "users",
    },
    {
      ...metricsData.orders,
      icon: ShoppingCart,
      key: "orders",
    },
    {
      ...metricsData.conversion,
      icon: Activity,
      key: "conversion",
    },
  ];

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {metrics.map((metric) => {
        const IconComponent = metric.icon;
        return (
          <Card key={metric.key}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {metric.title}
              </CardTitle>
              <IconComponent className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{metric.value}</div>
              <div className='flex items-center space-x-2 text-xs text-muted-foreground'>
                <Badge
                  variant={metric.trend === "up" ? "default" : "destructive"}
                  className={`flex items-center space-x-1 ${metric.trend === "down" ? "text-white" : ""}`}
                >
                  {metric.trend === "up" ? (
                    <TrendingUp className='h-3 w-3' />
                  ) : (
                    <TrendingDown className='h-3 w-3' />
                  )}
                  <span>{Math.abs(metric.change)}%</span>
                </Badge>
                <span>from last month</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
