import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface FadeInProps {
	children: ReactNode;
	delay?: number;
	direction?: 'up' | 'down' | 'left' | 'right' | 'none';
	duration?: number;
	className?: string;
}

export default function FadeIn({
	children,
	delay = 0,
	direction = 'up',
	duration = 0.4,
	className = '',
}: FadeInProps) {
	const directions = {
		up: { y: 20, x: 0 },
		down: { y: -20, x: 0 },
		left: { x: 20, y: 0 },
		right: { x: -20, y: 0 },
		none: { x: 0, y: 0 },
	};

	return (
		<motion.div
			className={className}
			initial={{
				opacity: 0,
				...directions[direction],
			}}
			animate={{
				opacity: 1,
				x: 0,
				y: 0,
			}}
			transition={{
				duration: duration,
				delay: delay,
				ease: [0.21, 0.47, 0.32, 0.98],
			}}
		>
			{children}
		</motion.div>
	);
}
