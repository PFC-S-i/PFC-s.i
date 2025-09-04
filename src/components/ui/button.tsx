import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center cursor-pointer justify-center whitespace-nowrap rounded duration-200  font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-gray-100 duration-200 hover:brightness-75 rounded focus:outline-none focus:ring-2 focus:ring-main focus:ring-opacity-50",
        icon: "bg-transparent hover:text-primary",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-red-500/90",
        outline:
          "border border-primary text-primary bg-transparent shadow-sm hover:bg-primary hover:text-zinc-50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary-opacity",
        ghost: "hover:bg-muted",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10  px-4 transition",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-8 ",
        icon: "h-10 px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button as ShadcnButton, buttonVariants };
