import { Separator } from "@/components/ui/separator";
import React from "react";
import { ButtonEventCard } from "./ButtonEventCard";
import { PlotCard } from "./PlotCard";
import { TextInputCard } from "./TextInputCard";

export function App() {
  return (
    <div className='min-h-screen bg-background p-6'>
      <div className='max-w-4xl mx-auto space-y-6'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold tracking-tight'>
            Shiny + React + shadcn/ui
          </h1>
          <p className='text-muted-foreground mt-2'>
            Demonstrating shadcn/ui components with various shiny-react output
            types
          </p>
        </div>

        <Separator />

        <div className='grid gap-6 md:grid-cols-2'>
          <TextInputCard />
          <ButtonEventCard />
        </div>

        <div className='grid gap-6 md:grid-cols-2'>
          <PlotCard />
        </div>
      </div>
    </div>
  );
}
