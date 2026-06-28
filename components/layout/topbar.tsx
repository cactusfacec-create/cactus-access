import { signOut } from "@/actions/auth.actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignOutButton } from "@/components/cactus/sign-out-button";
import { MobileNavAdmin } from "@/components/layout/mobile-nav-admin";

export function Topbar({ userEmail }: { userEmail: string }) {
  return (
    <header className="flex h-14 items-center gap-2 border-b border-border bg-card px-4 sm:px-6">
      <MobileNavAdmin />
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-secondary">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-accent">
                  {userEmail.slice(0, 2).toUpperCase()}
                </span>
                <span className="max-w-[120px] truncate sm:max-w-[160px]">{userEmail}</span>
              </button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              render={
                <form action={signOut} className="w-full">
                  <SignOutButton />
                </form>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
