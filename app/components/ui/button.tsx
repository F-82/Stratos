import { cn } from "@/lib/utils";
import * as React from "react";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        let variantClass = "";
        switch (variant) {
            case "default": variantClass = "bg-primary text-primary-foreground hover:bg-primary/90"; break;
            case "destructive": variantClass = "bg-destructive text-destructive-foreground hover:bg-destructive/90"; break;
            case "outline": variantClass = "border border-input bg-background hover:bg-accent hover:text-accent-foreground"; break;
            case "secondary": variantClass = "bg-secondary text-secondary-foreground hover:bg-secondary/80"; break;
            case "ghost": variantClass = "hover:bg-accent hover:text-accent-foreground"; break;
            case "link": variantClass = "text-primary underline-offset-4 hover:underline"; break;
        }

        let sizeClass = "";
        switch (size) {
            case "default": sizeClass = "h-10 px-4 py-2"; break;
            case "sm": sizeClass = "h-9 rounded-md px-3"; break;
            case "lg": sizeClass = "h-11 rounded-md px-8"; break;
            case "icon": sizeClass = "h-10 w-10"; break;
        }

        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    variantClass,
                    sizeClass,
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
