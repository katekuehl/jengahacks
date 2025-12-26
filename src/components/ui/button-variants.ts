import { cva } from "class-variance-authority";

export const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-300 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/90 glow-sm hover:glow hover:scale-105",
                destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-105",
                outline: "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground hover:scale-105 hover:shadow-lg",
                secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-105",
                ghost: "hover:bg-muted hover:text-foreground hover:scale-105",
                link: "text-primary underline-offset-4 hover:underline",
                hero: "bg-primary text-primary-foreground font-bold tracking-wide uppercase hover:bg-primary/90 glow hover:scale-110 hover:shadow-xl",
                nav: "bg-transparent text-foreground hover:text-primary transition-colors",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-12 px-8 text-base",
                xl: "h-14 px-10 text-lg",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);
