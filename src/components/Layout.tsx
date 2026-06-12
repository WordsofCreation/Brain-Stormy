import { AnimatePresence, motion } from "framer-motion";
import { Brain, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { ViewId } from "../types";
import { navigationItems } from "../navigation";

type LayoutProps = {
  activeView: ViewId;
  children: ReactNode;
  onNavigate: (view: ViewId) => void;
};

const logoPath = `${import.meta.env.BASE_URL}logo/brain-stormy-logo.svg`;

export function Layout({ activeView, children, onNavigate }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const navigate = (view: ViewId) => {
    onNavigate(view);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-navy bg-storm-radial text-white">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-35" />
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-navy/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          <button
            className="storm-interactive flex min-h-12 min-w-0 items-center gap-3 rounded-3xl px-1"
            onClick={() => navigate("home")}
            type="button"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-2xl bg-mint text-navy shadow-glow sm:h-11 sm:w-11">
              {logoFailed ? (
                <Brain size={23} />
              ) : (
                <img
                  alt="Brain Stormy logo"
                  className="h-full w-full object-cover"
                  onError={() => setLogoFailed(true)}
                  src={logoPath}
                />
              )}
            </span>
            <span className="min-w-0 text-left">
              <span className="block truncate text-base font-bold tracking-tight sm:text-lg">
                Brain Stormy
              </span>
              <span className="hidden text-xs uppercase tracking-[0.28em] text-silver/65 sm:block">
                Think · Shape · Schedule
              </span>
            </span>
          </button>

          <nav className="storm-nav-shell hidden items-center gap-1 rounded-full border border-mint/15 bg-mint/[0.055] p-1 md:flex">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = item.id === activeView;
              return (
                <button
                  className={`storm-interactive relative flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${active ? "text-navy" : "text-silver hover:text-white"}`}
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  type="button"
                >
                  {active ? (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-mint shadow-glow"
                    />
                  ) : null}
                  <Icon className="relative" size={16} />
                  <span className="relative">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <button
            className="storm-interactive min-h-12 min-w-12 rounded-2xl border border-white/10 bg-white/10 p-3 text-white md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            type="button"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen ? (
            <motion.nav
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="storm-card mx-4 mb-4 grid gap-2 rounded-3xl border border-white/10 bg-navy/95 p-3 shadow-glass md:hidden"
            >
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    className={`storm-interactive flex min-h-12 items-center gap-3 rounded-2xl px-4 py-3 text-left text-base font-medium transition ${
                      item.id === activeView
                        ? "bg-mint text-navy"
                        : "text-silver hover:bg-white/10 hover:text-white"
                    }`}
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    type="button"
                  >
                    <Icon size={17} />
                    {item.label}
                  </button>
                );
              })}
            </motion.nav>
          ) : null}
        </AnimatePresence>
      </header>

      <main className="relative z-10 mx-auto min-h-screen max-w-7xl px-4 pb-32 pt-24 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8">
        {children}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-navy/90 px-2 pb-[calc(env(safe-area-inset-bottom)+0.45rem)] pt-2 shadow-[0_-18px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl md:hidden"
        aria-label="Primary mobile navigation"
      >
        <div className="mx-auto grid max-w-2xl grid-cols-4 sm:grid-cols-8 gap-1 rounded-[1.35rem] border border-mint/15 bg-mint/[0.055] p-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = item.id === activeView;
            return (
              <button
                className={`storm-interactive relative flex min-h-[3.7rem] flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[0.68rem] font-semibold transition ${active ? "text-navy" : "text-silver/75 hover:text-white"}`}
                key={item.id}
                onClick={() => navigate(item.id)}
                type="button"
                aria-current={active ? "page" : undefined}
              >
                {active ? (
                  <motion.span
                    layoutId="bottom-nav-pill"
                    className="absolute inset-0 rounded-2xl bg-mint shadow-glow"
                    transition={{ duration: 0.24, ease: "easeOut" }}
                  />
                ) : null}
                <Icon
                  className="relative"
                  size={19}
                  strokeWidth={active ? 2.4 : 2}
                />
                <span className="relative max-w-full truncate">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
