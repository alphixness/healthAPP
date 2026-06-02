import { create } from 'zustand'

interface AppState {
  isOnboardingComplete: boolean
  setOnboardingComplete: (complete: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  isOnboardingComplete: false,
  setOnboardingComplete: (complete) => set({ isOnboardingComplete: complete }),
}))
