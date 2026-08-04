import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Receta } from '../types';

interface RecipeStore {
  generatedRecipes: Receta[];
  addGeneratedRecipe: (recipe: Receta) => void;
  removeGeneratedRecipe: (id: string) => void;
  clearGeneratedRecipes: () => void;
}

export const useRecipeStore = create<RecipeStore>()(
  persist(
    (set) => ({
      generatedRecipes: [],
      addGeneratedRecipe: (recipe) =>
        set((state) => ({
          generatedRecipes: [
            recipe,
            ...state.generatedRecipes.filter((r) => r.id !== recipe.id),
          ],
        })),
      removeGeneratedRecipe: (id) =>
        set((state) => ({
          generatedRecipes: state.generatedRecipes.filter((r) => r.id !== id),
        })),
      clearGeneratedRecipes: () => set({ generatedRecipes: [] }),
    }),
    {
      name: 'generated-recipes-storage',
    }
  )
);
