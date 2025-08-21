import { useShinyInput } from "../../hooks/use-shiny";
import { Slider } from "@/components/ui/slider";
import { cn } from "../../lib/utils";
import { useCallback, useState } from "react";

function SliderComponent({
  id,
  className,
  min,
  max,
  step = 1,
  value: externalValue,
  setValue: externalSetValue,
  defaultValue = 120,
  formatValue,
}: {
  id?: string;
  className?: string;
  value?: number;
  setValue?: (value: number) => void;
  min: number;
  max: number;
  step: number;
  defaultValue?: number;
  formatValue?: (value: number) => string;
}) {
  // Determine if we're in controlled or uncontrolled mode
  const isControlled =
    externalValue !== undefined && externalSetValue !== undefined;

  // Only use the Shiny hook if we're in uncontrolled mode AND have an id
  const [internalValue, internalSetValue] =
    !isControlled && id
      ? useShinyInput<number>(id, defaultValue)
      : useState<number>(defaultValue);

  // Use external values if provided (controlled mode), otherwise use internal state
  const currentValue = isControlled ? externalValue! : internalValue;

  // Create a memoized setValue function to prevent recreation on each render
  const handleValueChange = useCallback(
    (newValue: number) => {
      if (isControlled && externalSetValue) {
        externalSetValue(newValue);
      } else if (!isControlled) {
        internalSetValue(newValue);
      }
    },
    [isControlled, externalSetValue, internalSetValue]
  );

  // Default formatter just adds % sign
  const defaultFormatter = (val: number) => `${val}%`;
  const formatter = formatValue || defaultFormatter;

  return (
    <div className={cn("w-full max-w-sm flex items-center gap-2", className)}>
      <Slider
        value={[currentValue]}
        onValueChange={(values) => handleValueChange(values[0])}
        min={min}
        max={max}
        step={step}
      />
      <span className="w-[5ch]">{formatter(currentValue)}</span>
    </div>
  );
}

export default SliderComponent;
