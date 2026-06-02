export type Locale = 'es' | 'en';

export const dictionary = {
	es: {
		settings: {
			theme: 'Tema',
			dark: 'Oscuro',
			light: 'Claro',
			language: 'Idioma',
			spanish: '🇲🇽 Español',
			english: '🇺🇸 English',
		},
		footer: {
			navigation: 'Navegación',
			home: 'Inicio',
			about: 'About',
			legal: 'Legal',
			terms: 'Términos y Condiciones',
			privacy: 'Política de Privacidad',
			subscribe: 'Suscríbete',
			emailPlaceholder: 'Tu email',
			subscribeButton: 'Suscribirse',
			developedBy: 'Desarrollado por',
			allRightsReserved: 'Todos los derechos reservados.',
		},
		home: {
			title: 'Desarrollo de software, crecimiento personal, tutoriales y <span class="text-brand">un poco de mí.</span>',
			description: '¡Bienvenido a mi blog! Estaré compartiendo artículos sobre desarrollo de software, tecnología y productividad. Mi objetivo es ayudarte a crecer tanto profesional como personalmente con base en mis estudios, experiencia y aprendizajes.',
			popularTopics: 'Temas populares',
			noTags: 'Sin tags aún',
			readMore: 'Leer completo',
			noDescription: 'Sin descripción disponible.',
		},
		post: {
			back: 'Regresar',
			readingTime: 'min de lectura',
			defaultAuthor: 'Ivan G.',
		},
	},
	en: {
		settings: {
			theme: 'Theme',
			dark: 'Dark',
			light: 'Light',
			language: 'Language',
			spanish: '🇲🇽 Español',
			english: '🇺🇸 English',
		},
		footer: {
			navigation: 'Navigation',
			home: 'Home',
			about: 'About',
			legal: 'Legal',
			terms: 'Terms and Conditions',
			privacy: 'Privacy Policy',
			subscribe: 'Subscribe',
			emailPlaceholder: 'Your email',
			subscribeButton: 'Subscribe',
			developedBy: 'Developed by',
			allRightsReserved: 'All rights reserved.',
		},
		home: {
			title: 'Software development, personal growth, tutorials, and <span class="text-brand">a bit about me.</span>',
			description: 'Welcome to my blog! I\'ll be sharing articles about software development, tech and productivity. My goal is to help you grow professionally and personally based on my studies, experience, and learnings.',
			popularTopics: 'Popular topics',
			noTags: 'No tags yet',
			readMore: 'Read more',
			noDescription: 'No description available.',
		},
		post: {
			back: 'Go back',
			readingTime: 'min read',
			defaultAuthor: 'Ivan G.',
		},
	},
} as const;

export function getDictionary(locale: Locale) {
	return dictionary[locale];
}
