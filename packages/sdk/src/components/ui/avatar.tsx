import * as React from "react"
import { cn } from "../../utils/cn"

export interface AvatarProps {
    name?: string
    src?: string
    size?: "sm" | "md" | "lg"
    className?: string
}

const AVATAR_COLORS = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-cyan-500",
    "bg-rose-500",
    "bg-emerald-500",
]

/** Generate a consistent color from a string */
function stringToColor(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]!
}

const SIZES = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
}

/**
 * Avatar - Display user avatar with image or initials fallback.
 * Generates consistent background colors based on the user's name.
 */
function Avatar({ name = "", src, size = "md", className }: AvatarProps) {
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?"

    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className={cn(
                    "rounded-full object-cover shrink-0",
                    SIZES[size],
                    className
                )}
            />
        )
    }

    return (
        <div
            className={cn(
                "rounded-full flex items-center justify-center font-semibold text-white shrink-0",
                stringToColor(name),
                SIZES[size],
                className
            )}
            title={name}
        >
            {initials}
        </div>
    )
}

export { Avatar }
