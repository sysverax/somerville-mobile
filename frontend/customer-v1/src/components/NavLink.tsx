"use client";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, type ReactNode } from "react";
import type { LinkProps } from "next/link";
import { cn } from "@/src/lib/utils";

interface NavLinkCompatProps extends Omit<LinkProps, "href"> {
  to: string;
  className?: string;
  activeClassName?: string;
  children?: ReactNode;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, to, children, ...props }, ref) => {
    const pathname = usePathname();
    const isActive = pathname === to;

    return (
      <NextLink
        ref={ref}
        href={to}
        className={cn(className, isActive && activeClassName)}
        {...props}
      >
        {children}
      </NextLink>
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };