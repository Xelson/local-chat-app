import { useEffect, useState } from 'react';

interface UseWindowScrollArgs {
	threshold?: number;
	defaultValue?: boolean;
}

export function useWindowScroll({ threshold = 60, defaultValue }: UseWindowScrollArgs = {}) {
	const [scrolled, setScrolled] = useState<boolean | undefined>(defaultValue);

	useEffect(() => {
		const listener = () => {
			setScrolled(window.scrollY > threshold);
		};

		window.addEventListener('scroll', listener);
		return () => {
			window.removeEventListener('scroll', listener);
		};
	}, [threshold]);

	useEffect(() => {
		setScrolled(window.scrollY > threshold);
	}, [threshold]);

	return scrolled;
}
