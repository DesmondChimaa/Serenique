import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/src/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg';
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-600 disabled:pointer-events-none disabled:opacity-50",
          {
            'bg-primary-600 text-white shadow-lg shadow-primary-600/10 hover:bg-primary-700': variant === 'default',
            'border border-stone-200 bg-transparent shadow-sm hover:bg-stone-100': variant === 'outline',
            'hover:bg-stone-100': variant === 'ghost',
            'text-primary-600 underline-offset-4 hover:underline': variant === 'link',
            'h-10 px-6 py-2.5': size === 'default',
            'h-8 px-3 text-xs': size === 'sm',
            'h-14 px-8 text-base font-bold tracking-wide': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
