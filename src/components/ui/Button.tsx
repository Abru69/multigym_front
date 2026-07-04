import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-accent to-detail text-white shadow-[0_0_20px_rgba(66,204,99,0.3)] hover:shadow-[0_0_30px_rgba(66,204,99,0.4)] hover:brightness-110',
        destructive:
          'bg-gradient-to-r from-error to-error/80 text-white shadow-[0_0_16px_rgba(248,113,113,0.3)] hover:shadow-[0_0_24px_rgba(248,113,113,0.4)]',
        outline:
          'border border-white/[0.1] bg-transparent backdrop-blur-md text-text-primary hover:bg-white/[0.06] hover:border-white/[0.15]',
        secondary:
          'border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl text-text-primary hover:bg-white/[0.08] hover:border-white/[0.12]',
        ghost: 'text-text-secondary hover:bg-white/[0.06] hover:text-text-primary',
        link: 'text-accent underline-offset-4 hover:underline',
        glass:
          'border border-white/[0.1] bg-white/[0.04] backdrop-blur-xl text-text-primary hover:bg-white/[0.08] hover:border-white/[0.15] shadow-[0_4px_16px_rgba(0,0,0,0.2)]',
        'glass-accent':
          'border border-accent/20 bg-accent/10 backdrop-blur-xl text-accent hover:bg-accent/15 hover:border-accent/30 shadow-[0_0_16px_rgba(66,204,99,0.15)]',
      },
      size: {
        default: 'h-11 px-4 py-2',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
