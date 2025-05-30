import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { AngryIcon, CircleCheck, Ruler, Smile, SwatchBook } from "lucide-react";
import { useEffect, useId, useState } from "react";
import ImageComponent from "../components/shiny/Image";
import Slider from "../components/shiny/Slider";
import { useShinyInput, useShinyOutput } from "../hooks/use-shiny";
import { Label } from "@/components/ui/label";

function ExampleComponent() {
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <UncontrolledSliderCard className="w-140 mx-auto" />
      <ControlledSliderCard className="w-140 mx-auto" />
      <TwoSlidersCard className="w-140 mx-auto" />
      <MultiInputCard className="w-140 mx-auto" />
      <RoundTripCard className="w-140 mx-auto" />
      <RoundTripCard2 className="w-140 mx-auto" />
      <UpdateOnButtonClick className="w-140 mx-auto" />
      <SaveRestoreStateCard className="w-140 mx-auto" />

      {/* <Card className="w-140 mx-auto">
        <CardContent>
          <ImageComponent id="plot1" />
          <ImageComponent id="plot1" />
        </CardContent>
      </Card> */}
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
        <CardDescription>Try moving the slider to 100%</CardDescription>
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
        <CardDescription>Try slowly moving the slider to 100%</CardDescription>
      </CardHeader>
      <CardContent>
        {validState === "fatal" ? (
          <>
            <div className="flex flex-col items-center">
              <p className="text-red-500 text-center">You went too far!</p>
              <Button
                variant="outline"
                size="icon"
                className="size-14 rounded-full mt-2 hover:bg-red-50 active:bg-red-300 active:border-red-400 border-accent"
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

function UpdateOnButtonClick({ className }: { className?: string }) {
  const [val, setVal] = useShinyInput<{
    name: string;
    favoriteThings: string[];
    favoriteNumber: number;
  } | null>("value7", null);
  const [outputText, _] = useShinyOutput<string>("out7", undefined);

  const [name, setName] = useState<string>("");
  const [favoriteThings, setFavoriteThings] = useState<string[]>([]);
  const [favoriteNumber, setFavoriteNumber] = useState<number>(0);

  useEffect(() => {
    setName(val?.name || "");
    setFavoriteThings(val?.favoriteThings || []);
    setFavoriteNumber(val?.favoriteNumber || 0);
  }, [val]);

  const nameInputID = useId();
  const favoriteThingsInputID = useId();
  const favoriteNumberInputID = useId();

  const favoriteThingsOptions = [
    {
      label: "Colors",
      value: "colors",
      icon: SwatchBook,
    },
    {
      label: "Emojis",
      value: "emojis",
      icon: Smile,
    },
    {
      label: "Spacing",
      value: "spacing",
      icon: Ruler,
      defaultChecked: true,
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>
          Text input values are combined into an object in JS, and Shiny input
          updates when button is clicked
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={nameInputID}>Name:</Label>
            <Input
              id={nameInputID}
              className="mt-1"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={favoriteThingsInputID}>Things I like:</Label>
            <div
              className="w-full max-w-sm grid grid-cols-3 gap-3 mt-1"
              id={favoriteThingsInputID}
            >
              {favoriteThingsOptions.map((option) => (
                <CheckboxPrimitive.Root
                  key={option.value}
                  defaultChecked={option.defaultChecked}
                  checked={favoriteThings.includes(option.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFavoriteThings([...favoriteThings, option.value]);
                    } else {
                      setFavoriteThings(
                        favoriteThings.filter((v) => v !== option.value)
                      );
                    }
                  }}
                  className="relative ring-[1px] ring-border rounded-lg px-4 py-3 text-start text-muted-foreground data-[state=checked]:ring-2 data-[state=checked]:ring-primary data-[state=checked]:text-primary"
                >
                  <option.icon className="mb-3" />
                  <span className="font-medium tracking-tight">
                    {option.label}
                  </span>

                  <CheckboxPrimitive.Indicator className="absolute top-2 right-2">
                    <CircleCheck className="fill-orange-400 text-primary-foreground" />
                  </CheckboxPrimitive.Indicator>
                </CheckboxPrimitive.Root>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={favoriteNumberInputID}>My favorite number:</Label>

            <Input
              id={favoriteNumberInputID}
              type="number"
              value={favoriteNumber}
              onChange={(e) => setFavoriteNumber(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Button
              onClick={() => {
                setVal({
                  name,
                  favoriteThings,
                  favoriteNumber,
                });
              }}
            >
              Send combined values as input
            </Button>
          </div>

          <div className="space-y-2">
            <p>Value:</p>
            <pre className="font-semibold">{outputText || "\u00A0"}</pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SaveRestoreStateCard({ className }: { className?: string }) {
  const [savedStateText, _] = useShinyOutput<string>(
    "saved_state_text",
    undefined
  );

  // The buttons in this component are event-y -- they just send a message to
  // the server, but they do not have any state of their own in the UI.
  // TODO: Extract event-y logic into a custom hook.

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>
          Save state of all inputs on server and restore inputs from server
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          className="m-2"
          onClick={() => {
            window.Shiny.setInputValue!(
              "save_state",
              // Sending an empty object/dict will trigger the reactive effect
              // because the identity comparison in reactive.Value uses `x is y`,
              // and `{} is {}` is false.
              {},
              {
                priority: "event",
              }
            );
          }}
        >
          Save state
        </Button>

        <Button
          className="m-2"
          onClick={() => {
            window.Shiny.setInputValue!(
              "restore_state",
              {},
              { priority: "event" }
            );
          }}
        >
          Restore state
        </Button>

        <p>Value:</p>
        <pre className="font-semibold">{savedStateText || "\u00A0"}</pre>
      </CardContent>
    </Card>
  );
}

export default ExampleComponent;
