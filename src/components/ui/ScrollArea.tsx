import type { ComponentPropsWithRef } from 'react'

type ScrollAreaProps = ComponentPropsWithRef<'div'>

export default function ScrollArea({
  className,
  children,
  ref,
  ...props
}: ScrollAreaProps) {
  return (
    <div
      ref={ref}
      className={['app-scrollbar overflow-y-auto', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
