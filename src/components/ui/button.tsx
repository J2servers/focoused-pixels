import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[_-4px_-4px_8px_hsl(var(--neu-light)/0.92),5px_5px_10px_hsl(var(--neu-dark)/0.42),0_0_0_1px_hsl(var(--neon-primary)/0.22)] hover:shadow-[_-3px_-3px_6px_hsl(var(--neu-light)/0.92),4px_4px_8px_hsl(var(--neu-dark)/0.42),0_0_0_1px_hsl(var(--neon-primary)/0.45),0_0_10px_hsl(var(--neon-primary)/0.1)] hover:brightness-110 hover:-translate-y-0.5 active:shadow-[inset_-3px_-3px_6px_hsl(var(--neu-light)/0.3),inset_3px_3px_8px_hsl(var(--neu-dark)/0.4)] active:translate-y-0 border-none",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[_-4px_-4px_8px_hsl(var(--neu-light)/0.92),5px_5px_10px_hsl(var(--neu-dark)/0.42)] hover:brightness-110 hover:-translate-y-0.5 border-none",
        outline:
          "neu-btn bg-surface-elevated text-foreground hover:text-primary",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[_-4px_-4px_8px_hsl(var(--neu-light)/0.92),5px_5px_10px_hsl(var(--neu-dark)/0.42),0_0_0_1px_hsl(var(--neon-primary)/0.12)] hover:shadow-[_-3px_-3px_6px_hsl(var(--neu-light)/0.92),4px_4px_8px_hsl(var(--neu-dark)/0.42),0_0_0_1px_hsl(var(--neon-primary)/0.35)] hover:brightness-105 hover:-translate-y-0.5 border-none",
        ghost:
          "hover:bg-muted/60 hover:text-foreground border-none",
        link: "text-primary underline-offset-4 hover:underline border-none",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-xl px-3",
        lg: "h-12 rounded-2xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
