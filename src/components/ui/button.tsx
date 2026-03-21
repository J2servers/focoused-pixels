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
          "bg-primary text-primary-foreground shadow-[4px_4px_8px_hsl(var(--neu-dark)/var(--neu-intensity)),-4px_-4px_8px_hsl(var(--neu-light)/var(--neu-intensity)),inset_0_1px_0_hsl(0_0%_100%/0.2)] border border-[hsl(var(--neon-primary)/var(--neon-opacity))] hover:border-[hsl(var(--neon-primary)/var(--neon-opacity-hover))] hover:brightness-110 hover:-translate-y-0.5 active:shadow-[inset_3px_3px_6px_hsl(var(--neu-dark)/0.5),inset_-3px_-3px_6px_hsl(var(--neu-light)/0.2)] active:translate-y-0",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[4px_4px_8px_hsl(var(--neu-dark)/var(--neu-intensity)),-4px_-4px_8px_hsl(var(--neu-light)/var(--neu-intensity))] border border-[hsl(0_70%_50%/0.5)] hover:border-[hsl(0_70%_50%/1)] hover:brightness-110 hover:-translate-y-0.5",
        outline:
          "neu-btn bg-background text-foreground dark:text-foreground [color-scheme:light] dark:[color-scheme:dark] !text-[hsl(var(--foreground))] hover:text-primary",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[4px_4px_8px_hsl(var(--neu-dark)/var(--neu-intensity)),-4px_-4px_8px_hsl(var(--neu-light)/var(--neu-intensity)),inset_0_1px_0_hsl(var(--neu-light)/0.4)] border border-[hsl(var(--neon-cyan)/var(--neon-opacity))] hover:border-[hsl(var(--neon-cyan)/var(--neon-opacity-hover))] hover:brightness-105 hover:-translate-y-0.5",
        ghost:
          "hover:bg-muted/60 hover:text-foreground border border-transparent hover:border-[hsl(var(--neon-primary)/0.3)]",
        link: "text-primary underline-offset-4 hover:underline",
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
