import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 transition-[color,box-shadow]",
  {
    variants: {
      status: {
        active: "bg-green-600 text-white border-transparent",
        inactive: "bg-gray-400 text-white border-transparent",
        pending: "bg-yellow-500 text-white border-transparent",
        approved: "bg-blue-600 text-white border-transparent",
        rejected: "bg-red-600 text-white border-transparent",
        suspended: "bg-orange-500 text-white border-transparent",
        outline: "border-transparent bg-background shadow-sm hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        default: "bg-primary text-white border-transparent",
        secondary:"bg-secondary text-white border-transparent",
      },
    },
    defaultVariants: {
      status: "active",
    },
  }
)


function Badge({
  className,
  status,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      
      data-slot="badge"
      className={cn(badgeVariants({ status }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
