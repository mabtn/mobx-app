import type { ButtonHTMLAttributes } from "react";

const variantClasses = {
    secondary: "rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300 disabled:opacity-40",
    primary:
        "rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-40",
    danger: "rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200 disabled:opacity-40",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: keyof typeof variantClasses;
}

export function Button({ variant = "secondary", className, ...props }: ButtonProps) {
    const classes = className ? `${variantClasses[variant]} ${className}` : variantClasses[variant];
    return <button className={classes} {...props} />;
}
