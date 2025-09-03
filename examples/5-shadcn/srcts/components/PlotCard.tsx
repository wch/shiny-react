import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageOutput } from "@posit/shiny-react";
import React from "react";

export function PlotCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Plot Output</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex justify-center'>
          <ImageOutput id='plot1' className='max-w-full h-auto' />
        </div>
      </CardContent>
    </Card>
  );
}
