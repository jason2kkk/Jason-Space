import React from "react";
import { cn } from "../../lib/utils";

const AnimatedShinyText = ({ children, className }) => {
  return (
    <span
      className={cn(
        "inline-block",
        "bg-clip-text text-transparent",
        "bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600",
        "bg-[200%_auto]",
        "animate-[shine_8s_linear_infinite]",
        className
      )}
    >
      {children}
    </span>
  );
};

export default AnimatedShinyText; 