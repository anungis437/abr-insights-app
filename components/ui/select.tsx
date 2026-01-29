import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { cn } from '@/lib/utils'

export const Select = SelectPrimitive.Root
export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-between rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50',
      className
    )}
    {...props}
  />
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

export const SelectValue = SelectPrimitive.Value
export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Content
    ref={ref}
    className={cn(
      'z-50 min-w-[8rem] rounded border border-gray-200 bg-white p-1 shadow-lg',
      className
    )}
    {...props}
  />
))
SelectContent.displayName = SelectPrimitive.Content.displayName

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center rounded px-3 py-2 text-sm outline-none focus:bg-purple-50 data-[state=checked]:bg-purple-100',
      className
    )}
    {...props}
  />
))
SelectItem.displayName = SelectPrimitive.Item.displayName
