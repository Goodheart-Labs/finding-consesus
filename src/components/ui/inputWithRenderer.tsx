import { forwardRef, useState } from "react";
import { Input, InputProps } from "./input";

export interface InputWithRendererProps extends InputProps {
  renderValue: (value: InputProps["value"], isFocussed?: boolean) => string;
}

const InputWithRenderer = forwardRef<HTMLInputElement, InputWithRendererProps>(({ renderValue, ...props }, ref) => {
  const [isFocussed, setIsFocussed] = useState(false);

  return (
    <Input
      {...props}
      ref={ref}
      value={renderValue(props.value, isFocussed)}
      onBlur={(e) => {
        props.onBlur && props.onBlur(e);
        setIsFocussed(false);
      }}
      onFocus={(e) => {
        props.onFocus && props.onFocus(e);
        setIsFocussed(true);
      }}
    />
  );
});
InputWithRenderer.displayName = "InputWithRenderer";

export { InputWithRenderer };
