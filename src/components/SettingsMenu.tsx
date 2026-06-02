import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/store';
import { getDictionary, type Locale } from '../i18n/dictionary';

export default function SettingsMenu() {
	const [isOpen, setIsOpen] = useState(false);
	const { theme, lang, setTheme, setLang } = useStore();
	const menuRef = useRef<HTMLDivElement>(null);

	// Detectar idioma actual desde la URL para el diccionario
	const currentLocale: Locale = typeof window !== 'undefined' && window.location.pathname.startsWith('/en') ? 'en' : 'es';
	const t = getDictionary(currentLocale);

	// Sync theme class with document on mount and when theme changes
	useEffect(() => {
		document.documentElement.classList.toggle('light', theme === 'light');
	}, [theme]);

	// Sync language with URL on mount (Zustand persist will handle localStorage)
	useEffect(() => {
		const path = window.location.pathname;
		const urlLang = path.startsWith('/en') ? 'en' : 'es';
		if (urlLang !== lang) {
			setLang(urlLang);
		}
	}, [lang, setLang]);

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	function handleThemeChange(newTheme: 'dark' | 'light') {
		setTheme(newTheme);
	}

	function handleLangChange(newLang: 'es' | 'en') {
		if (newLang === lang) return;
		setLang(newLang);

		const path = window.location.pathname;
		if (newLang === 'en') {
			window.location.href = `/en${path}`;
		} else {
			window.location.href = path.replace(/^\/en/, '') || '/';
		}
	}

	return (
		<div ref={menuRef} className="relative">
			{/* Gear Button */}
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="p-2 rounded-button text-text-muted hover:text-white hover:bg-surface-raised transition-all duration-normal"
				aria-label="Settings"
			>
				<svg
					className={`w-5 h-5 transition-transform duration-slow ${isOpen ? 'rotate-90' : ''}`}
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={1.5}
					role="img"
					aria-label="Settings gear"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
					/>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
					/>
				</svg>
			</button>

			{/* Dropdown */}
			{isOpen && (
				<div className="absolute right-0 top-full mt-3 w-56 rounded-card bg-surface-base/95 backdrop-blur-xl border border-border-subtle shadow-2xl shadow-black/50 overflow-hidden animate-in">
					{/* Theme Selector */}
					<div className="p-4 border-b border-border-subtle">
						<span className="text-[10px] font-bold tracking-[0.2em] uppercase text-text-muted mb-3 block">
							{t.settings.theme}
						</span>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => handleThemeChange('dark')}
								className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-button text-xs font-semibold transition-all ${
									theme === 'dark'
										? 'bg-surface-hover text-text-heading'
										: 'text-text-muted hover:text-text-secondary hover:bg-surface-raised'
								}`}
							>
								<svg
									className="w-3.5 h-3.5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={2}
									role="img"
									aria-label="Dark theme"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
									/>
								</svg>
								{t.settings.dark}
							</button>
							<button
								type="button"
								onClick={() => handleThemeChange('light')}
								className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-button text-xs font-semibold transition-all ${
									theme === 'light'
										? 'bg-surface-hover text-text-heading'
										: 'text-text-muted hover:text-text-secondary hover:bg-surface-raised'
								}`}
							>
								<svg
									className="w-3.5 h-3.5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={2}
									role="img"
									aria-label="Light theme"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
									/>
								</svg>
								{t.settings.light}
							</button>
						</div>
					</div>

					{/* Language Selector */}
					<div className="p-4">
						<span className="text-[10px] font-bold tracking-[0.2em] uppercase text-text-muted mb-3 block">
							{t.settings.language}
						</span>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => handleLangChange('es')}
								className={`flex-1 px-3 py-2 rounded-button text-xs font-semibold transition-all ${
									lang === 'es'
										? 'bg-surface-hover text-text-heading'
										: 'text-text-muted hover:text-text-secondary hover:bg-surface-raised'
								}`}
							>
								{t.settings.spanish}
							</button>
							<button
								type="button"
								onClick={() => handleLangChange('en')}
								className={`flex-1 px-3 py-2 rounded-button text-xs font-semibold transition-all ${
									lang === 'en'
										? 'bg-surface-hover text-text-heading'
										: 'text-text-muted hover:text-text-secondary hover:bg-surface-raised'
								}`}
							>
								{t.settings.english}
							</button>
						</div>
					</div>
				</div>
			)}

			<style>{`
				.animate-in {
					animation: slideDown var(--duration-fast) var(--ease-smooth);
				}
				@keyframes slideDown {
					from {
						opacity: 0;
						transform: translateY(-8px) scale(0.96);
					}
					to {
						opacity: 1;
						transform: translateY(0) scale(1);
					}
				}
			`}</style>
		</div>
	);
}
