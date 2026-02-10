import * as React from "react"
import { cn } from "../../utils/cn"

/**
 * Skeleton - Animated placeholder for loading states.
 * Uses pulse animation and muted background color.
 */
function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-muted", className)}
            {...props}
        />
    )
}

export { Skeleton }
