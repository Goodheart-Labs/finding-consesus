"use client";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback } from "react";

export const AdminPageNavigation = () => {
  const pathname = usePathname();
  const isActive = useCallback(
    (path: string) => (path !== "/admin" ? pathname.startsWith(path) : path === pathname),
    [pathname],
  );

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/admin" legacyBehavior passHref>
            <NavigationMenuLink
              className={navigationMenuTriggerStyle()}
              active={isActive("/admin") || isActive("/admin/questions")}
            >
              Questions
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/admin/respondents" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} active={isActive("/admin/respondents")}>
              Respondents
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/admin/settings" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} active={isActive("/admin/settings")}>
              Settings
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export const AdminUserNavigation = () => (
  <NavigationMenu>
    <NavigationMenuList>
      <NavigationMenuItem>
        <Link href="/admin/settings" legacyBehavior passHref>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>Logout</NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
);
