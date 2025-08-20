import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useShinyInput, useShinyOutput } from "../hooks/use-shiny";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function ExampleComponent() {
  const [txtin, setTxtin] = useShinyInput<string>("txtin", "");

  const txtout = useShinyOutput<string>("txtout", null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTxtin(event.target.value);
  };

  return (
    <div>
      <Card className="max-w-100 m-8">
        <CardContent>
          <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
            <Label htmlFor="txtin">Input txtin</Label>
            <Input
              value={txtin}
              placeholder="Type something..."
              onChange={handleInputChange}
            />
          </div>
          <p>Reversed string:</p>
          <p className="text-lg font-semibold min-h-[1.5rem]">
            {txtout || "\u00A0"}
          </p>
          <div className="grid w-full max-w-sm items-center gap-1.5 my-4">
            <p>
              I can use the output value in another place. I can also set the
              input value from a different place. Clicking on this button will
              set txtin to "Hello, world!"
            </p>
            <Button onClick={() => setTxtin("Hello, world!")}>
              {txtout ? txtout : "Type something above..."}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ExampleComponent;
