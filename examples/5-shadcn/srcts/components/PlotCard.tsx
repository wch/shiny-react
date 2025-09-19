import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageOutput } from "@posit/shiny-react";

export function PlotCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Plot Output</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col justify-center">
          <ImageOutput
            id="plot1"
            className="flex-1 w-full h-full min-h-[300px]"
          />
        </div>
      </CardContent>
    </Card>
  );
}
