import { useDeferredValue, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowBendRightDownIcon, MagnifyingGlassIcon, SparkleIcon } from '@phosphor-icons/react'
import { collection, type Crystal } from './content'
import { CrystalCard } from './CrystalCard'
import { Shoutout } from './Shoutout'
import { Draw } from './Draw'
import { openCrystal } from './route'
import { ease, Hand, springSnappy, springSoft, Titled, Wordmark } from './ui'

const tags = ['All', ...new Set(collection.crystals.map(c => c.tag))]
const heroStones = collection.crystals.slice(0, 3)
const heroPose = [
  { rotate: -7, x: '-38%', y: 18 },
  { rotate: 5, x: '34%', y: -6 },
  { rotate: -2, x: '0%', y: 30 },
]

export function Home() {
  const reduce = useReducedMotion()
  const [tag, setTag] = useState('All')
  const [query, setQuery] = useState('')
  const [drawing, setDrawing] = useState(false)
  // Order of the photos on the table; the last one touched stays on top, like picking it up and setting it back down
  const [stack, setStack] = useState([0, 1, 2])
  const lift = (i: number) => setStack(s => (s.at(-1) === i ? s : [...s.filter(x => x !== i), i]))
  const q = useDeferredValue(query.trim().toLowerCase())

  const shown = collection.crystals.filter(
    c => (tag === 'All' || c.tag === tag) && (!q || `${c.name} ${c.tag} ${c.intention}`.toLowerCase().includes(q)),
  )

  // Text in the hero rises in one line after another
  const rise = (i: number) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, ease, delay: 0.1 + i * 0.09 } }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-8">
      <header className="flex items-baseline justify-between pt-[max(1.25rem,env(safe-area-inset-top))] pb-5">
        <Wordmark className="text-[1.7rem]" />
        <span className="font-serif text-base text-muted italic">The Retreat Costa Rica</span>
      </header>

      <section className="grid items-center gap-10 pt-4 pb-10 md:grid-cols-[1.1fr_1fr] md:gap-12 md:pt-14 md:pb-20">
        <div className="grid gap-6">
          <motion.h1 {...rise(0)} className="pb-1 font-serif text-[3.3rem] leading-[1.04] sm:text-7xl">
            <Titled text={collection.title} />
          </motion.h1>
          <motion.p {...rise(1)} className="max-w-[32ch] text-lg leading-relaxed text-muted">
            {collection.intro}
          </motion.p>
          <motion.div {...rise(2)} className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <motion.button
              type="button"
              onClick={() => setDrawing(true)}
              whileHover={reduce ? undefined : { y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={springSnappy}
              className="inline-flex h-12 cursor-pointer items-center gap-3 bg-ink px-6 text-xs tracking-[0.2em] text-paper uppercase transition-colors hover:bg-gold hover:text-ink"
            >
              <SparkleIcon size={18} weight="light" />
              Draw a crystal
            </motion.button>
            <Hand className="-rotate-3">let one choose you</Hand>
          </motion.div>
        </div>

        {/* A few stones dropped on the table; each one opens its story */}
        <div className="relative mx-auto h-[280px] w-full max-w-[380px] sm:h-[390px]">
          {heroStones.map((c, i) => (
            <HeroStone key={c.slug} crystal={c} i={i} z={stack.indexOf(i) + 1} onLift={() => lift(i)} />
          ))}
        </div>
      </section>

      <section aria-labelledby="stones" className="grid gap-7 pb-20 md:gap-8 md:pb-24">
        <div className="grid gap-1">
          <h2 id="stones" className="pb-1 font-serif text-[2.6rem] leading-[1.1]">
            <em>The</em> stones
          </h2>
          <Hand>
            touch one, it has a story
            <ArrowBendRightDownIcon size={18} weight="light" className="ml-1.5 inline-block translate-y-1.5" />
          </Hand>
        </div>

        <div className="grid gap-4 md:flex md:items-center md:justify-between">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] max-md:[mask-image:linear-gradient(to_right,black_82%,transparent)] md:mx-0 md:flex-wrap md:px-0">
            {tags.map(t => (
              <motion.button
                key={t}
                type="button"
                aria-pressed={tag === t}
                onClick={() => setTag(t)}
                whileTap={{ scale: 0.95 }}
                transition={springSnappy}
                className="relative h-11 shrink-0 cursor-pointer border border-gold/70 px-4 text-sm transition-colors select-none aria-pressed:text-paper md:h-10"
              >
                {tag === t ? (
                  <motion.span layoutId="chip" transition={springSnappy} className="absolute -inset-px bg-ink" />
                ) : null}
                <span className="relative">{t}</span>
              </motion.button>
            ))}
          </div>
          <label className="flex h-11 items-center gap-2 border-b border-gold md:w-64">
            <MagnifyingGlassIcon size={18} weight="light" className="text-gold-text" />
            <span className="sr-only">Search crystals</span>
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name"
              className="w-full bg-transparent text-base outline-none placeholder:text-muted"
            />
          </label>
        </div>

        {shown.length ? (
          <ul className="grid grid-cols-2 gap-x-5 gap-y-10 pt-3 sm:gap-x-8 md:grid-cols-3 lg:grid-cols-4">
            <AnimatePresence mode="popLayout" initial={false}>
              {shown.map((c, i) => (
                <motion.li
                  key={c.slug}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.2 } }}
                  transition={{ opacity: { duration: 0.6, delay: (i % 4) * 0.07 }, y: { duration: 0.8, ease, delay: (i % 4) * 0.07 }, layout: springSoft }}
                  className="md:[&:nth-child(even)]:mt-8"
                >
                  <CrystalCard crystal={c} index={collection.crystals.indexOf(c)} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        ) : (
          <div className="grid justify-items-center gap-4 py-16 text-center">
            <p className="font-serif text-2xl italic">No stones match that search</p>
            <button
              type="button"
              onClick={() => {
                setTag('All')
                setQuery('')
              }}
              className="cursor-pointer border-b border-gold pb-1 text-sm"
            >
              Show all crystals
            </button>
          </div>
        )}
      </section>

      <Shoutout />

      <footer className="flex items-baseline justify-between border-t border-gold/50 py-6 text-muted">
        <Wordmark className="text-lg" />
        <span className="font-serif italic">The Retreat Costa Rica</span>
      </footer>

      <AnimatePresence>{drawing ? <Draw onClose={() => setDrawing(false)} /> : null}</AnimatePresence>
    </div>
  )
}

const shadowRest = '0 22px 40px -26px rgb(47 45 42 / 0.6)'
const shadowLifted = '0 46px 60px -28px rgb(47 45 42 / 0.5)'

// One photo on the table. Hovering picks it up: it rises, straightens and its shadow
// grows and softens, so it reads as coming off the pile before it moves on top
function HeroStone({ crystal: c, i, z, onLift }: { crystal: Crystal; i: number; z: number; onLift: () => void }) {
  const reduce = useReducedMotion()
  const pose = heroPose[i]
  // Only a photo the pointer rests on comes to the top; a quick pass just makes it stir
  const timer = useRef(0)
  const startLift = () => {
    timer.current = window.setTimeout(onLift, 140)
  }
  const cancelLift = () => clearTimeout(timer.current)

  return (
    // The outer layer only breathes; the button inside does the landing and the lifting
    <motion.div
      animate={reduce ? undefined : { y: [0, -6, 0] }}
      transition={{ duration: 5 + i * 1.3, repeat: Infinity, ease: 'easeInOut', delay: 1.6 + i * 0.5 }}
      style={{ x: pose.x, zIndex: z }}
      className="absolute inset-x-0 top-0 mx-auto w-[52%]"
    >
      <motion.button
        type="button"
        aria-label={c.name}
        onClick={() => openCrystal(c.slug)}
        onHoverStart={startLift}
        onHoverEnd={cancelLift}
        onFocus={onLift}
        variants={{
          drop: { opacity: 0, y: -90, rotate: pose.rotate * 3, scale: 1.08 },
          rest: { opacity: 1, y: pose.y, rotate: pose.rotate, scale: 1, transition: springSoft },
          lift: { opacity: 1, y: pose.y - 18, rotate: pose.rotate * 0.25, scale: 1.06, transition: liftSpring },
        }}
        initial={reduce ? false : 'drop'}
        animate="rest"
        whileHover={reduce ? undefined : 'lift'}
        whileFocus={reduce ? undefined : 'lift'}
        whileTap={{ scale: 1.02, transition: springSnappy }}
        transition={{ ...springSoft, delay: reduce ? 0 : 0.35 + i * 0.16 }}
        className="block w-full cursor-pointer outline-none"
      >
        <motion.span
          variants={{ drop: { boxShadow: shadowRest }, rest: { boxShadow: shadowRest }, lift: { boxShadow: shadowLifted } }}
          transition={liftSpring}
          className="relative block bg-white p-2 pb-10"
        >
          <span className="tape" />
          <img src={c.image} alt="" className="aspect-square w-full object-cover" />
          <Hand className="absolute inset-x-0 bottom-3 text-center text-[14px] text-ink/85">{c.name.toLowerCase()}</Hand>
        </motion.span>
      </motion.button>
    </motion.div>
  )
}

// Slower and heavier than a tap, so a quick pass of the mouse does not make the photos jump
const liftSpring = { type: 'spring', stiffness: 170, damping: 22, mass: 1.1 } as const
