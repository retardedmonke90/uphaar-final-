import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-[#e97a7a]/35 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-[#e97a7a] text-white shadow-[0_12px_30px_rgba(233,122,122,0.22)] hover:bg-[#d96c6c] hover:shadow-[0_16px_45px_rgba(233,122,122,0.28)]",
        destructive:
          "bg-[#d4183d] text-white hover:bg-[#c51131] focus-visible:ring-[#d4183d]/30",
        outline:
          "border border-[#e97a7a]/15 bg-white/85 text-[#7d262e] hover:bg-white hover:text-[#7d262e]",
        secondary:
          "bg-[#fff2d7] text-[#7d262e] hover:bg-[#ffe9c2]",
        ghost:
          "text-[#7d262e] hover:bg-[#e97a7a]/8 hover:text-[#7d262e]",
        link: "text-[#e97a7a] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-3 has-[>svg]:px-4",
        sm: "h-9 rounded-full gap-1.5 px-4 has-[>svg]:px-3.5",
        lg: "h-12 rounded-full px-7 has-[>svg]:px-5",
        icon: "size-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
