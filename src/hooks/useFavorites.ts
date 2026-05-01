import { useFavoritesContext } from "../contexts/FavoritesContext";

// Thin compatibility wrapper around the centralized FavoritesContext.
// This preserves the old `useFavorites` named export for any remaining
// consumers while delegating to the single source of truth.
export const useFavorites = () => {
  return useFavoritesContext();
};

export default useFavorites;
