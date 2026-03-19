"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Film,
  BarChart2,
  UploadCloud,
  LogOut,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Movies", href: "/movies", icon: Film },
  { name: "Compare", href: "/compare", icon: BarChart2 },
  { name: "Upload Data", href: "/upload", icon: UploadCloud },
  { name: "AI Analyzer", href: "/ai", icon: Bot },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen border-r border-border bg-card flex-col hidden md:flex">
      <div className="h-20 flex items-center px-5 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-primary to-primary/80 shadow-sm flex items-center justify-center">
            <Film className="w-5 h-5 text-white stroke-[1.8]" />
          </div>
          <span className="font-semibold text-base text-foreground tracking-tight">
            CineLytics
          </span>
        </div>
      </div>

      <div className="flex-1 py-6 px-4 flex flex-col gap-2">
        <div className="px-3 mb-1 text-xs font-medium text-muted-foreground/80">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {isActive && (
                <span className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" />
              )}
              <Icon
                className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:scale-110 group-hover:text-foreground",
                )}
              />
              <span className={cn(isActive && "font-medium")}>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* <div className="p-5 border-t border-border/40">
        <button className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-black/5 hover:text-foreground w-full transition-all duration-200 group">
          <LogOut className="w-5 h-5 text-muted-foreground/70 group-hover:text-foreground transition-transform duration-200 group-hover:scale-110" />
          <span>Log out</span>
        </button>
      </div> */}
    </div>
  );
}
