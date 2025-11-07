"use client";

import { useEffect, useState } from "react";
import {
  addFavorite,
  listFavorites,
  removeFavorite,
} from "@/services/favorites.service";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [favBusy, setFavBusy] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const set = await listFavorites();
        if (!cancelled) setFavorites(set);
      } catch {
        // segue sem favoritos
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggleFav(id: string) {
    if (favBusy.has(id)) return;
    const wasFav = favorites.has(id);

    setFavBusy((s) => new Set(s).add(id));
    setFavorites((prev) => {
      const next = new Set(prev);
      if (wasFav) next.delete(id);
      else next.add(id);
      return next;
    });

    try {
      if (wasFav) await removeFavorite(id);
      else await addFavorite(id);
    } catch {
      // reverte
      setFavorites((prev) => {
        const next = new Set(prev);
        if (wasFav) next.add(id);
        else next.delete(id);
        return next;
      });
    } finally {
      setFavBusy((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    }
  }

  return { favorites, favBusy, toggleFav };
}
