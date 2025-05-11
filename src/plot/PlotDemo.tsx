import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useShinyInput, useShinyOutput } from "../hooks/use-shiny";
import ImageComponent from "../components/shiny/Image";
import Slider from "../components/shiny/Slider";
import { Input } from "@/components/ui/input";
import { AngryIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function ExampleComponent() {
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <UncontrolledSliderCard className="w-140 mx-auto" />
      <ControlledSliderCard className="w-140 mx-auto" />
      <TwoSlidersCard className="w-140 mx-auto" />
      <MultiInputCard className="w-140 mx-auto" />
      <RoundTripCard className="w-140 mx-auto" />
      <RoundTripCard2 className="w-140 mx-auto" />

      <Card className="w-140 mx-auto">
        <CardContent>
          <ImageComponent id="plot1" />
          <ImageComponent id="plot1" />
        </CardContent>
      </Card>
    </div>
  );
}

function UncontrolledSliderCard({ className }: { className?: string }) {
  const [outputText, _] = useShinyOutput<string>("out1", undefined);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Uncontrolled slider</CardTitle>
      </CardHeader>
      <CardContent>
        <Slider id="value1" defaultValue={200} min={0} max={400} step={10} />
        <p>Value:</p>
        <pre className="font-semibold">{outputText || "\u00A0"}</pre>
      </CardContent>
    </Card>
  );
}

function ControlledSliderCard({ className }: { className?: string }) {
  const [val, setVal] = useShinyInput<number>("value2", 200);
  const [outputText, _] = useShinyOutput<string>("out2", undefined);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Controlled slider</CardTitle>
      </CardHeader>
      <CardContent>
        <Slider value={val} setValue={setVal} min={0} max={400} step={10} />
        <p>Value:</p>
        <pre className="font-semibold">{outputText || "\u00A0"}</pre>
      </CardContent>
    </Card>
  );
}

function TwoSlidersCard({ className }: { className?: string }) {
  const [val, setVal] = useShinyInput<number>("value3", 200);
  const [outputText, _] = useShinyOutput<string>("out3", undefined);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Two sliders connected to same state value</CardTitle>
      </CardHeader>
      <CardContent>
        <Slider value={val} setValue={setVal} min={0} max={400} step={10} />
        <Slider value={val} setValue={setVal} min={0} max={400} step={10} />
        <p>Value:</p>
        <pre className="font-semibold">{outputText || "\u00A0"}</pre>
      </CardContent>
    </Card>
  );
}

function MultiInputCard({ className }: { className?: string }) {
  const [val, setVal] = useShinyInput<number>("value4", 200);
  const [outputText, _] = useShinyOutput<string>("out4", undefined);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Multiple inputs linked to same state variable</CardTitle>
      </CardHeader>
      <CardContent>
        <Slider value={val} setValue={setVal} min={0} max={400} step={10} />
        <Slider
          value={400 - val}
          setValue={(v) => setVal(400 - v)}
          min={0}
          max={400}
          step={10}
        />
        <Input
          type="number"
          value={val}
          onChange={(e) => setVal(Number(e.target.value))}
        />
        <p>Value:</p>
        <pre className="font-semibold">{outputText || "\u00A0"}</pre>
      </CardContent>
    </Card>
  );
}

function RoundTripCard({ className }: { className?: string }) {
  const [val, setVal] = useShinyInput<number>("value5", 100);
  const [validState, _] = useShinyOutput<string>("out5", undefined);

  return (
    <Card
      className={cn(
        className,
        validState === "error" ? "bg-red-50 border-red-500" : ""
      )}
    >
      <CardHeader>
        <CardTitle>State takes round trip</CardTitle>
      </CardHeader>
      <CardContent>
        <>
          <div></div>
          <Slider value={val} setValue={setVal} min={0} max={400} step={10} />
        </>
        <p>Value:</p>
        <pre className="font-semibold">{validState || "\u00A0"}</pre>
      </CardContent>
    </Card>
  );
}

function RoundTripCard2({ className }: { className?: string }) {
  const [val, setVal] = useShinyInput<number>("value6", 100);
  const [validState, _] = useShinyOutput<string>("out6", undefined);

  return (
    <Card
      className={cn(
        className,
        validState === "error"
          ? " bg-red-50 border-red-500"
          : validState === "warning"
            ? " bg-yellow-50 border-yellow-500"
            : ""
      )}
    >
      <CardHeader>
        <CardTitle>State takes round trip 2</CardTitle>
      </CardHeader>
      <CardContent>
        {validState === "fatal" ? (
          <>
            <div className="flex flex-col items-center">
              <p className="text-red-500 text-center">You went too far!</p>
              <Button
                variant="ghost"
                size="icon"
                className="size-14 rounded-full mt-2 hover:bg-red-50 active:bg-red-300 active:border-red-400"
                onClick={() => setVal(100)}
              >
                <AngryIcon className="!size-10 text-red-600" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <Slider value={val} setValue={setVal} min={0} max={400} step={10} />
            <Input
              type="number"
              value={val}
              onChange={(e) => setVal(Number(e.target.value))}
            />
          </>
        )}
        <p>Value:</p>
        <pre className="font-semibold">{validState || "\u00A0"}</pre>
      </CardContent>
    </Card>
  );
}
export default ExampleComponent;
