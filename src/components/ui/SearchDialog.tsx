import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as m from '@/paraglide/messages';
import { type Locale, paths } from '../../lib/routes';

declare global {
	interface Window {
		PagefindUI?: new (options: Record<string, unknown>) => unknown;
	}
}

interface Props {
	locale: Locale;
}

export default function SearchDialog({ locale }: Props) {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [unavailable, setUnavailable] = useState(false);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);
	const opt = { locale };

	const bundlePath = locale === 'es' ? '/pagefind-es/' : '/pagefind-en/';

	const translations = useMemo(
		() => ({
			placeholder: m.search_placeholder({}, { locale }),
			clear_search: m.search_clear({}, { locale }),
			load_more: m.search_load_more({}, { locale }),
			zero_results: m.search_zero_results({}, { locale }),
			one_result: m.search_one_result({}, { locale }),
			many_results: m.search_many_results({}, { locale }),
			searching: m.search_searching({}, { locale }),
			search_label: m.search_label({}, { locale }),
		}),
		[locale],
	);

	// Cmd/Ctrl+K toggles, Esc closes.
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
				event.preventDefault();
				setOpen((value) => !value);
			}

			if (event.key === 'Escape') setOpen(false);
		};

		document.addEventListener('keydown', onKeyDown);
		return () => document.removeEventListener('keydown', onKeyDown);
	}, []);

	// Body scroll lock, focus restore and focus trap while open.
	useEffect(() => {
		if (!open) return;

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		const panel = panelRef.current;
		panel?.querySelector<HTMLElement>('button')?.focus();

		const onTab = (event: KeyboardEvent) => {
			if (event.key !== 'Tab' || !panel) return;

			const focusables = Array.from(
				panel.querySelectorAll<HTMLElement>(
					'a[href], button:not([disabled]):not([tabindex="-1"]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
				),
			).filter((element) => element.offsetParent !== null);

			if (focusables.length === 0) return;

			const first = focusables[0];
			const last = focusables[focusables.length - 1];

			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		};

		document.addEventListener('keydown', onTab);

		return () => {
			document.body.style.overflow = previousOverflow;
			document.removeEventListener('keydown', onTab);
			triggerRef.current?.focus();
		};
	}, [open]);

	// Load Pagefind on first open (and on locale change).
	useEffect(() => {
		if (!open) return;

		let cancelled = false;
		setUnavailable(false);
		setLoading(true);

		const ensureStyles = () => {
			const href = `${bundlePath}pagefind-ui.css`;
			if (document.querySelector('link[data-pagefind-css]')) return;

			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = href;
			link.dataset.pagefindCss = 'true';
			document.head.appendChild(link);
		};

		const loadScript = () =>
			new Promise<void>((resolve, reject) => {
				if (window.PagefindUI) {
					resolve();
					return;
				}

				const src = `${bundlePath}pagefind-ui.js`;
				const existing = document.querySelector<HTMLScriptElement>(
					`script[data-pagefind-src="${src}"]`,
				);

				if (existing) {
					existing.addEventListener('load', () => resolve(), { once: true });
					existing.addEventListener('error', () => reject(new Error('Pagefind failed')), {
						once: true,
					});
					return;
				}

				const script = document.createElement('script');
				script.src = src;
				script.dataset.pagefindSrc = src;
				script.addEventListener('load', () => resolve(), { once: true });
				script.addEventListener('error', () => reject(new Error('Pagefind failed')), {
					once: true,
				});
				document.head.appendChild(script);
			});

		(async () => {
			try {
				ensureStyles();
				await loadScript();
				if (cancelled) return;

				if (!window.PagefindUI) throw new Error('Pagefind unavailable');

				const container = document.getElementById('search-modal');
				if (!container) return;

				container.innerHTML = '';
				new window.PagefindUI({
					element: '#search-modal',
					bundlePath,
					showSubResults: true,
					translations,
				});

				requestAnimationFrame(() => {
					container.querySelector<HTMLInputElement>('input.pagefind-ui__search-input')?.focus();
				});
			} catch {
				if (!cancelled) setUnavailable(true);
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [open, bundlePath, translations]);

	const close = () => setOpen(false);

	return (
		<>
			<button
				ref={triggerRef}
				type="button"
				onClick={() => setOpen(true)}
				aria-label={m.search_title({}, opt)}
				aria-haspopup="dialog"
				aria-expanded={open}
				title={m.search_title({}, opt)}
				className="flex h-11 w-11 items-center justify-center rounded-button text-text-muted hover:text-white hover:bg-surface-raised transition-all duration-normal"
			>
				<svg
					className="w-5 h-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={1.8}
					role="img"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="m21 21-4.35-4.35m1.6-5.15a6.75 6.75 0 1 1-13.5 0 6.75 6.75 0 0 1 13.5 0Z"
					/>
				</svg>
			</button>

			{open &&
				createPortal(
					<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-[2px] sm:p-4">
						<button
							type="button"
							tabIndex={-1}
							aria-label={m.search_close({}, opt)}
							onClick={close}
							className="absolute inset-0 h-full w-full cursor-default"
						/>

						<div
							ref={panelRef}
							role="dialog"
							aria-modal="true"
							aria-labelledby="search-dialog-title"
							className="relative z-10 flex h-full w-full flex-col overflow-hidden bg-surface-base sm:h-auto sm:max-h-[80vh] sm:max-w-2xl sm:rounded-2xl sm:border sm:border-border-subtle sm:shadow-2xl"
						>
							<div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
								<h2 id="search-dialog-title" className="text-sm font-semibold text-white">
									{m.search_dialog_title({}, opt)}
								</h2>

								<button
									type="button"
									onClick={close}
									aria-label={m.search_close({}, opt)}
									className="flex h-11 w-11 items-center justify-center rounded-button text-text-muted transition-colors hover:bg-surface-raised hover:text-white"
								>
									<svg
										className="h-4 w-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth={2}
										aria-hidden="true"
									>
										<path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
									</svg>
								</button>
							</div>

							<div className="flex-1 overflow-y-auto px-5 py-4">
								<div id="search-modal" />

								{loading && (
									<p className="mt-4 text-sm text-text-muted">{m.search_loading({}, opt)}</p>
								)}

								{unavailable && (
									<p className="mt-4 rounded-xl border border-border-subtle bg-surface-raised p-4 text-sm text-text-muted">
										{m.search_unavailable({}, opt)}
									</p>
								)}
							</div>

							<div className="flex items-center justify-between gap-4 border-t border-border-subtle px-5 py-3">
								<span className="text-xs text-text-faint">
									<kbd className="hidden rounded border border-border-subtle px-1.5 py-0.5 text-[10px] sm:inline-block">
										Esc
									</kbd>{' '}
									{m.search_close({}, opt)}
								</span>

								<a
									href={paths.search(locale)}
									className="text-xs font-bold text-brand transition-colors hover:text-brand-hover"
								>
									{m.search_open_page({}, opt)}
								</a>
							</div>
						</div>
					</div>,
					document.body,
				)}
		</>
	);
}
