import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useShinyInput, useShinyOutput } from "@posit/shiny-react";
import React from "react";

export function ButtonEventCard() {
  const [buttonTrigger, setButtonTrigger] = useShinyInput<{}>(
    "button_trigger",
    {},
    { priority: "event" }
  );
  const [buttonResponse] = useShinyOutput<string>("button_response", "");

  const handleClick = () => {
    setButtonTrigger({});
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Button Events</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <p className='text-sm text-muted-foreground mb-2'>
            Click to trigger server event:
          </p>
          <Button onClick={handleClick} variant='default' className='w-full'>
            Send Event
          </Button>
        </div>
        <div>
          <p className='text-sm text-muted-foreground mb-2'>Server response:</p>
          <div className='bg-muted p-3 rounded-md'>
            <pre className='text-sm'>
              {buttonResponse || "Click button to see response"}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
