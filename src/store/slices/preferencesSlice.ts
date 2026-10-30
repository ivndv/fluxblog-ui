type PreferencesState = {
	theme: 'dark' | 'light';
};

type PreferencesActions = {
	setTheme: (theme: 'dark' | 'light') => void;
	toggleTheme: () => void;
};

export type PreferencesSlice = PreferencesState & PreferencesActions;

export const createPreferencesSlice = (
	set: (partial: Partial<PreferencesSlice>) => void,
): PreferencesSlice => ({
	theme: 'dark',
	setTheme: (theme) => set({ theme }),
	toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
});
