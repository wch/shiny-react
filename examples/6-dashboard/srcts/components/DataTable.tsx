import React from "react";
import { useShinyOutput } from "shiny-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, Package } from "lucide-react";

interface TableRowData {
  id: string;
  product: string;
  category: string;
  sales: number;
  revenue: number;
  growth: number;
  status: "active" | "inactive" | "low_stock";
}

interface TableColumns {
  id: string[];
  product: string[];
  category: string[];
  sales: number[];
  revenue: number[];
  growth: number[];
  status: string[];
}

interface TableData {
  columns: TableColumns;
  total_rows: number;
}

export function DataTable() {
  const [tableData, isLoading] = useShinyOutput<TableData | undefined>("table_data", undefined);

  // Get column names and number of rows from the column-major data
  const columnNames = tableData?.columns ? Object.keys(tableData.columns) : [];
  const numRows = tableData?.columns && columnNames.length > 0 ? tableData.columns[columnNames[0] as keyof TableColumns].length : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      case "low_stock":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "inactive":
        return "Inactive";
      case "low_stock":
        return "Low Stock";
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Package className="mr-2 h-5 w-5" />
          Top Products
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!tableData || isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer hover:bg-muted/50">
                    <div className="flex items-center space-x-2">
                      <span>Product</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Growth</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: numRows }, (_, rowIndex) => {
                  const rowId = tableData?.columns.id[rowIndex] || `row-${rowIndex}`;
                  return (
                    <TableRow key={rowId}>
                      <TableCell className="font-medium">
                        {tableData?.columns.product[rowIndex]}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {tableData?.columns.category[rowIndex]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {tableData?.columns.sales[rowIndex]?.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(tableData?.columns.revenue[rowIndex] || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`${
                            (tableData?.columns.growth[rowIndex] || 0) >= 0 ? "text-green-600" : "text-red-600"
                          } font-medium`}
                        >
                          {formatPercentage(tableData?.columns.growth[rowIndex] || 0)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(tableData?.columns.status[rowIndex] || "")}>
                          {getStatusLabel(tableData?.columns.status[rowIndex] || "")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            {tableData.total_rows > numRows && (
              <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                Showing {numRows} of {tableData.total_rows} products
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}