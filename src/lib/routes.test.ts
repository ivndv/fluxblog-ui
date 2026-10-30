import { describe, expect, it } from 'vitest';
import { paths, translatePath } from './routes';

describe('routes', () => {
	it('builds localized paths', () => {
		expect(paths.home('es')).toBe('/');
		expect(paths.home('en')).toBe('/en/');
		expect(paths.blog('es')).toBe('/articulos');
		expect(paths.blog('en')).toBe('/en/blog');
		expect(paths.blogPage('en', 2)).toBe('/en/blog/page/2');
		expect(paths.post('es', 'hola')).toBe('/articulos/hola');
		expect(paths.post('en', 'hello')).toBe('/en/blog/hello');
		expect(paths.tag('es', 'react')).toBe('/etiquetas/react');
		expect(paths.tag('en', 'react')).toBe('/en/tags/react');
		expect(paths.about('es')).toBe('/acerca');
		expect(paths.about('en')).toBe('/en/about');
		expect(paths.legal('es', 'terms')).toBe('/legal/terminos');
		expect(paths.legal('en', 'privacy')).toBe('/en/legal/privacy');
		expect(paths.search('es')).toBe('/buscar');
		expect(paths.search('en')).toBe('/en/search');
	});

	it('translates static paths between locales', () => {
		expect(translatePath('/', 'en')).toBe('/en/');
		expect(translatePath('/articulos', 'en')).toBe('/en/blog');
		expect(translatePath('/en/blog', 'es')).toBe('/articulos');
		expect(translatePath('/articulos/page/2', 'en')).toBe('/en/blog/page/2');
		expect(translatePath('/etiquetas/react', 'en')).toBe('/en/tags/react');
		expect(translatePath('/en/tags/react', 'es')).toBe('/etiquetas/react');
		expect(translatePath('/acerca', 'en')).toBe('/en/about');
		expect(translatePath('/en/about', 'es')).toBe('/acerca');
		expect(translatePath('/legal/terminos', 'en')).toBe('/en/legal/terms');
		expect(translatePath('/en/legal/privacy', 'es')).toBe('/legal/privacidad');
		expect(translatePath('/buscar', 'en')).toBe('/en/search');
	});

	it('translates post paths using the alternate slug when available', () => {
		expect(translatePath('/articulos/hola', 'en')).toBe('/en/blog/hola');
		expect(translatePath('/en/blog/hello', 'es', 'hola')).toBe('/articulos/hola');
		expect(translatePath('/en/blog/hello', 'es')).toBe('/articulos/hello');
	});
});
