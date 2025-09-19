import { FilterPanel } from "@/components/FilterPanel";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  HelpCircle,
  Home,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import React from "react";

interface SidebarProps {
  className?: string;
}

const navigationItems = [
  {
    title: "Dashboard",
    icon: Home,
    href: "#",
    active: true,
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "#",
    active: false,
  },
  {
    title: "Customers",
    icon: Users,
    href: "#",
    active: false,
  },
  {
    title: "Orders",
    icon: ShoppingCart,
    href: "#",
    active: false,
  },
  {
    title: "Performance",
    icon: TrendingUp,
    href: "#",
    active: false,
  },
];

const secondaryItems = [
  {
    title: "Settings",
    icon: Settings,
    href: "#",
  },
  {
    title: "Help",
    icon: HelpCircle,
    href: "#",
  },
];

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn("pb-12 w-80 overflow-y-auto", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Analytics Dashboard
          </h2>
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Button
                  key={item.title}
                  variant={item.active ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <IconComponent className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              );
            })}
          </div>
        </div>
        <Separator />
        <div className="px-3 py-2">
          <div className="space-y-1">
            {secondaryItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Button
                  key={item.title}
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <IconComponent className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              );
            })}
          </div>
        </div>
        <Separator />
        <div className="px-3 py-2">
          <FilterPanel />
        </div>
      </div>
    </div>
  );
}
