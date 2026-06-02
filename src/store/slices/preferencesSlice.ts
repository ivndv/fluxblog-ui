type PreferencesState = {
	theme: 'dark' | 'light';
	lang: 'es' | 'en';
};

type PreferencesActions = {
	setTheme: (theme: 'dark' | 'light') => void;
	toggleTheme: () => void;
	setLang: (lang: 'es' | 'en') => void;
};

export type PreferencesSlice = PreferencesState & PreferencesActions;

export const createPreferencesSlice = (
	set: (partial: Partial<PreferencesSlice>) => void,
): PreferencesSlice => ({
	theme: 'dark',
	lang: 'es',
	setTheme: (theme) => set({ theme }),
	toggleTheme: () =>
		set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
	setLang: (lang) => set({ lang }),
});
