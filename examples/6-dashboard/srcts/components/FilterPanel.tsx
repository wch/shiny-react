import React from "react";
import { useShinyInput } from "shiny-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function FilterPanel() {
  const [dateRange, setDateRange] = useShinyInput<string>("date_range", "last_30_days");
  const [searchTerm, setSearchTerm] = useShinyInput<string>("search_term", "");
  const [selectedCategories, setSelectedCategories] = useShinyInput<string[]>("selected_categories", []);

  const dateRangeOptions = [
    { value: "last_7_days", label: "Last 7 days" },
    { value: "last_30_days", label: "Last 30 days" },
    { value: "last_90_days", label: "Last 90 days" },
    { value: "this_year", label: "This year" }
  ];

  const categoryOptions = [
    { value: "electronics", label: "Electronics" },
    { value: "clothing", label: "Clothing" },
    { value: "books", label: "Books" },
    { value: "home", label: "Home & Garden" },
    { value: "sports", label: "Sports" }
  ];

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c: string) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium flex items-center mb-4">
          <Search className="mr-2 h-5 w-5" />
          Filters
        </h3>
      </div>
      
      {/* Search */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products, customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Date Range */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center">
          <CalendarIcon className="mr-2 h-4 w-4" />
          Time Period
        </label>
        <div className="grid grid-cols-1 gap-2">
          {dateRangeOptions.map((option) => (
            <Button
              key={option.value}
              variant={dateRange === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange(option.value)}
              className="justify-start"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Categories</label>
        <div className="flex flex-wrap gap-2">
          {categoryOptions.map((category) => (
            <Badge
              key={category.value}
              variant={selectedCategories.includes(category.value) ? "default" : "outline"}
              className={cn(
                "cursor-pointer hover:bg-primary/90",
                selectedCategories.includes(category.value) 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={() => toggleCategory(category.value)}
            >
              {category.label}
              {selectedCategories.includes(category.value) && (
                <X className="ml-1 h-3 w-3" />
              )}
            </Badge>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {(searchTerm || selectedCategories.length > 0) && (
        <div className="space-y-2 pt-4 border-t">
          <label className="text-sm font-medium">Active Filters</label>
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <Badge variant="secondary">
                Search: {searchTerm}
              </Badge>
            )}
            {selectedCategories.map((category: string) => {
              const categoryLabel = categoryOptions.find(c => c.value === category)?.label;
              return (
                <Badge key={category} variant="secondary">
                  {categoryLabel}
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}