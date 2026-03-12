import type { Variants, Transition } from 'framer-motion'

// Shared spring transition
export const spring: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
}

// Page enter
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
}

export const pageTransition: Transition = {
  duration: 0.25,
  ease: [0.25, 0.1, 0.25, 1],
}

// Stagger container
export const staggerContainer: Variants = {
  animate: {
    transition: { staggerChildren: 0.04 },
  },
}

// Stagger item (for cards, list items)
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
  },
}

// Fade in
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
}

// Scale on tap (for interactive cards)
export const cardHover = {
  whileHover: { scale: 1.01, transition: { duration: 0.15 } },
  whileTap: { scale: 0.985 },
}
