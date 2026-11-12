// Small pieces shared by every screen

export const kicker = 'text-[11px] tracking-[0.24em] uppercase'

// One set of motion presets so every movement feels like the same hand
export const ease = [0.16, 1, 0.3, 1] as const
export const springSoft = { type: 'spring', stiffness: 110, damping: 18, mass: 0.9 } as const
export const springSnappy = { type: 'spring', stiffness: 320, damping: 26 } as const

// Each printed photo sits a little crooked, like it was taped in by hand
export const tilts = [-2.4, 1.6, -1.1, 2.2, -1.7, 1.2, -0.8, 2.6]

// First word in italic, like the hotel's headings ("Rooms & Residences")
export function Titled({ text }: { text: string }) {
  const [first, ...rest] = text.split(' ')
  return (
    <>
      <em>{first}</em> {rest.join(' ')}
    </>
  )
}

export function Wordmark({ className = '' }: { className?: string }) {
  return <span className={`font-serif tracking-[0.02em] ${className}`}>Vida Mía</span>
}

// A note written by hand, used sparingly
export function Hand({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={`font-hand text-[15px] leading-relaxed text-gold-text ${className}`}>{children}</span>
}

// iOS Safari leaves its status bar and floating toolbar outside a fixed inset-0 box,
// so overlay backdrops overshoot the screen by a quarter of its height on each side
export const backdropBleed = 'fixed inset-x-0 -top-[25vh] -bottom-[25vh]'

export const pickRandom = <T,>(list: T[], n: number) => list.toSorted(() => Math.random() - 0.5).slice(0, n)
