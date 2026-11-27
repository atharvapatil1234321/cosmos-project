/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import ApodSection from './components/ApodSection';
import CategoriesShowcase from './components/CategoriesShowcase';
import CategoryExplorer from './components/CategoryExplorer';
import DailyFactsView from './components/DailyFactsView';
import FavouritesView from './components/FavouritesView';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import Navbar from './components/Navbar';
import ObjectDetailsPage from './components/ObjectDetailsPage';
import StarfieldCanvas from './components/StarfieldCanvas';
import { CELESTIAL_OBJECTS } from './data/celestialCatalog';
import type { AppTab, CategoryId, CelestialObject } from './types/cosmos';

const FAVOURITES_STORAGE_KEY = 'cosmos_favourites_v1';
const RECENT_STORAGE_KEY = 'cosmos_recent_v1';

const VALID_TABS: AppTab[] = ['explore', 'categories', 'apod', 'favourites', 'daily-facts'];

function loadStoredObjects(key: string): CelestialObject[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CelestialObject[]) : [];
  } catch {
    return [];
  }
}

function getInitialTabFromHash(): AppTab {
  const hash = window.location.hash.replace(/^#/, '');
  if (VALID_TABS.includes(hash as AppTab)) {
    return hash as AppTab;
  }
  return 'explore';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>(getInitialTabFromHash);
  const [selectedObject, setSelectedObject] = useState<CelestialObject | null>(() => {
    const hash = window.location.hash;
    if (!hash.startsWith('#object=')) return null;
    const id = decodeURIComponent(hash.slice('#object='.length));
    return CELESTIAL_OBJECTS.find((item) => item.id === id) || null;
  });

  const [activeCategory, setActiveCategory] = useState<CategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favourites, setFavourites] = useState<CelestialObject[]>(() =>
    loadStoredObjects(FAVOURITES_STORAGE_KEY)
  );
  const [recentlyViewed, setRecentlyViewed] = useState<CelestialObject[]>(() =>
    loadStoredObjects(RECENT_STORAGE_KEY)
  );

  // Sync browser back/forward navigation with object and tab hashes
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#object=')) {
        const id = decodeURIComponent(hash.slice('#object='.length));
        const found = CELESTIAL_OBJECTS.find((o) => o.id === id);
        if (found) {
          setSelectedObject(found);
          return;
        }
      }
      setSelectedObject(null);
      const cleanTab = hash.replace(/^#/, '');
      if (VALID_TABS.includes(cleanTab as AppTab)) {
        setActiveTab(cleanTab as AppTab);
      } else {
        setActiveTab('explore');
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(FAVOURITES_STORAGE_KEY, JSON.stringify(favourites));
    } catch {
      // Ignore storage quota errors
    }
  }, [favourites]);

  useEffect(() => {
    try {
      window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recentlyViewed));
    } catch {
      // Ignore storage quota errors
    }
  }, [recentlyViewed]);

  const openObjectDetails = useCallback((obj: CelestialObject) => {
    setSelectedObject(obj);
    if (!obj.isLiveNasaResult) {
      window.history.pushState(null, '', `#object=${encodeURIComponent(obj.id)}`);
    }
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((item) => item.id !== obj.id);
      return [obj, ...filtered].slice(0, 10);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSelectTab = useCallback((tab: AppTab) => {
    setSelectedObject(null);
    setActiveTab(tab);
    window.history.pushState(null, '', `#${tab}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleBackToExplorer = useCallback(() => {
    setSelectedObject(null);
    window.history.pushState(null, '', `#${activeTab}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const handleGoHome = useCallback(() => {
    setSelectedObject(null);
    setActiveTab('explore');
    setSearchQuery('');
    setActiveCategory('all');
    window.history.pushState(null, '', '#explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSelectCategory = useCallback((categoryId: CategoryId) => {
    setSelectedObject(null);
    setActiveCategory(categoryId);
    setActiveTab('explore');
    window.history.pushState(null, '', '#explore');
    window.requestAnimationFrame(() => {
      const el = document.getElementById('explorer');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }, []);

  const handleSearchSubmit = useCallback((query: string) => {
    setSearchQuery(query);
    setSelectedObject(null);
    setActiveTab('explore');
    window.requestAnimationFrame(() => {
      const el = document.getElementById('explorer');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }, []);

  const handleExploreCatalog = useCallback(() => {
    setSelectedObject(null);
    setActiveTab('explore');
    window.requestAnimationFrame(() => {
      const el = document.getElementById('explorer');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }, []);

  const handleRandomDiscovery = useCallback(() => {
    const pool = selectedObject
      ? CELESTIAL_OBJECTS.filter((o) => o.id !== selectedObject.id)
      : CELESTIAL_OBJECTS;
    const randomIndex = Math.floor(Math.random() * pool.length);
    const chosen = pool[randomIndex] || CELESTIAL_OBJECTS[0];
    openObjectDetails(chosen);
  }, [selectedObject, openObjectDetails]);

  const handleToggleFavourite = useCallback((obj: CelestialObject) => {
    setFavourites((prev) => {
      const exists = prev.some((item) => item.id === obj.id);
      if (exists) {
        return prev.filter((item) => item.id !== obj.id);
      }
      return [obj, ...prev];
    });
  }, []);

  const handleRemoveFavourite = useCallback((id: string) => {
    setFavourites((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleClearRecent = useCallback(() => {
    setRecentlyViewed([]);
  }, []);

  const favouriteIds = favourites.map((f) => f.id);

  return (
    <div id="top" className="relative flex min-h-screen flex-col bg-[#06080E] text-slate-100">
      <StarfieldCanvas />

      <Navbar
        activeTab={activeTab}
        hasSelectedObject={Boolean(selectedObject)}
        onSelectTab={handleSelectTab}
        onRandomDiscovery={handleRandomDiscovery}
        onGoHome={handleGoHome}
      />

      <div className="flex-1">
        {selectedObject ? (
          <ObjectDetailsPage
            object={selectedObject}
            isFavourite={favouriteIds.includes(selectedObject.id)}
            onBack={handleBackToExplorer}
            onToggleFavourite={handleToggleFavourite}
            onRandomDiscovery={handleRandomDiscovery}
          />
        ) : (
          <main>
            {activeTab === 'explore' && (
              <>
                <HeroSection
                  catalog={CELESTIAL_OBJECTS}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onSearchSubmit={handleSearchSubmit}
                  onExploreClick={handleExploreCatalog}
                  onRandomDiscovery={handleRandomDiscovery}
                  onSelectObject={openObjectDetails}
                />

                <CategoryExplorer
                  catalog={CELESTIAL_OBJECTS}
                  activeCategory={activeCategory}
                  searchQuery={searchQuery}
                  favouriteIds={favouriteIds}
                  onCategoryChange={setActiveCategory}
                  onSearchChange={setSearchQuery}
                  onSelectObject={openObjectDetails}
                  onToggleFavourite={handleToggleFavourite}
                />
              </>
            )}

            {activeTab === 'categories' && (
              <CategoriesShowcase
                activeCategory={activeCategory}
                onSelectCategory={handleSelectCategory}
              />
            )}

            {activeTab === 'apod' && <ApodSection />}

            {activeTab === 'favourites' && (
              <FavouritesView
                favourites={favourites}
                recentlyViewed={recentlyViewed}
                onSelectObject={openObjectDetails}
                onRemoveFavourite={handleRemoveFavourite}
                onClearRecent={handleClearRecent}
                onExploreClick={() => handleSelectTab('explore')}
              />
            )}

            {activeTab === 'daily-facts' && (
              <DailyFactsView onRandomDiscovery={handleRandomDiscovery} />
            )}
          </main>
        )}
      </div>

      <Footer onSelectCategory={handleSelectCategory} onGoHome={handleGoHome} />
    </div>
  );
}
