import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useShinyInput, useShinyOutput } from "@posit/shiny-react";
import React from "react";

export function App() {
  const [txtin, setTxtin] = useShinyInput<string>("txtin", "Hello, world!");
  const txtout = useShinyOutput<string>("txtout", undefined);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTxtin(event.target.value);
  };

  return (
    <div className='min-h-screen bg-background p-6'>
      <div className='max-w-2xl mx-auto'>
        <Card>
          <CardContent className='p-6 space-y-4'>
            <div className='space-y-2'>
              <label htmlFor='text-input' className='text-sm font-medium'>
                Type something to send to Shiny server:
              </label>
              <Input
                id='text-input'
                type='text'
                value={txtin}
                onChange={handleInputChange}
                placeholder='Enter your message here...'
              />
            </div>
            
            <Separator />
            
            <div className='space-y-2'>
              <label className='text-sm font-medium'>
                Response from Shiny server:
              </label>
              <div className='bg-muted p-3 rounded-md min-h-[2.5rem] flex items-center'>
                <span className='text-sm'>{txtout}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
