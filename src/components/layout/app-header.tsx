"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={[
        "rounded-md px-3 py-2 text-sm transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/" className="text-sm font-semibold tracking-wide sm:text-base">
            D-Learning VOD
          </Link>
          <nav className="flex items-center">
            <NavLink href="/browse" label="Browse" active={pathname.startsWith("/browse")} />
            <NavLink href="/mypage" label="My Page" active={pathname.startsWith("/mypage")} />
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {email ? <span className="hidden text-xs text-muted-foreground sm:inline">{email}</span> : null}
          {email ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                const supabase = getSupabaseBrowserClient();
                if (!supabase) {
                  return;
                }
                await supabase.auth.signOut();
                router.push("/login");
                router.refresh();
              }}
            >
              Logout
            </Button>
          ) : (
            <>
              <Button size="sm" variant="secondary" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
