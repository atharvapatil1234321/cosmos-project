import { useState } from 'react';
import { Menu, Shuffle, X } from 'lucide-react';
import type { AppTab } from '../types/cosmos';

interface NavbarProps {
  activeTab: AppTab;
  hasSelectedObject: boolean;
  onSelectTab: (tab: AppTab) => void;
  onRandomDiscovery: () => void;
  onGoHome: () => void;
}

const NAV_ITEMS: Array<{ id: AppTab; label: string }> = [
  { id: 'explore', label: 'Explore' },
  { id: 'categories', label: 'Categories' },
  { id: 'apod', label: 'APOD' },
  { id: 'favourites', label: 'Favourites' },
  { id: 'daily-facts', label: 'Daily Facts' },
];

export default function Navbar({
  activeTab,
  hasSelectedObject,
  onSelectTab,
  onRandomDiscovery,
  onGoHome,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: AppTab) => {
    setMobileMenuOpen(false);
    onSelectTab(tab);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#06080E]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single-element brand wordmark */}
        <button
          type="button"
          onClick={() => {
            setMobileMenuOpen(false);
            onGoHome();
          }}
          className="shrink-0 whitespace-nowrap text-left text-lg font-bold tracking-[0.18em] text-white transition-colors hover:text-sky-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-400"
        >
          COSMOS
        </button>

        {/* Zone 2: Clean single-line text tab links */}
        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = !hasSelectedObject && activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => handleTabClick(item.id)}
                className={`relative shrink-0 whitespace-nowrap py-5 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-400 ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute right-0 bottom-0 left-0 h-0.5 bg-sky-400"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action + mobile menu button */}
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onRandomDiscovery();
            }}
            className="inline-flex min-h-[40px] shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 transition-all duration-150 hover:bg-sky-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
          >
            <Shuffle className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Random Discovery</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-slate-200 transition-colors hover:bg-white/5 md:hidden"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <nav
          className="border-t border-white/10 bg-[#080C17]/95 px-4 py-3 backdrop-blur-xl md:hidden"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = !hasSelectedObject && activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => handleTabClick(item.id)}
                  className={`min-h-[44px] w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-300'
                      : 'text-slate-200 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
