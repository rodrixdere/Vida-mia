import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowLeftIcon, ArrowRightIcon, XIcon } from '@phosphor-icons/react'
import { collection, type Chapter, type Crystal } from './content'
import { closeCrystal, openCrystal } from './route'
import { backdropBleed, ease, Hand, kicker, springSnappy, springSoft } from './ui'

type Slide = { kind: 'intro' } | { kind: 'chapter'; chapter: Chapter } | { kind: 'details' }

// The crystal's story told like phone stories: tap the right side to go on, the left to go back
export function Story({ crystal: c }: { crystal: Crystal }) {
  const reduce = useReducedMotion()
  const slides: Slide[] = [{ kind: 'intro' }, ...c.story.map(chapter => ({ kind: 'chapter' as const, chapter })), { kind: 'details' }]
  const [[index, dir], setState] = useState<[number, number]>([0, 1])
  const panned = useRef(false)

  const go = (step: number) => setState(([i]) => [Math.min(slides.length - 1, Math.max(0, i + step)), step])

  // A new crystal starts from its first slide
  useEffect(() => setState([0, 1]), [c.slug])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'Escape') closeCrystal()
    }
    addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      removeEventListener('keydown', onKey)
    }
  })

  const onTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (panned.current) return void (panned.current = false)
    if ((e.target as HTMLElement).closest('button')) return
    const r = e.currentTarget.getBoundingClientRect()
    go(e.clientX - r.left < r.width * 0.3 ? -1 : 1)
  }

  const slide = slides[index]
  const next = collection.crystals[(collection.crystals.indexOf(c) + 1) % collection.crystals.length]

  return (
    // The page stays visible, blurred, around a polaroid: the story is held in the hand, not a new screen.
    // Sizes use svh so the card fits the same whether or not the phone's address bar is showing.
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${c.name}, its story`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35, ease } }}
      onClick={e => e.target === e.currentTarget && closeCrystal()}
      className="fixed inset-0 z-20 grid place-content-center justify-items-center gap-3 px-3 py-3"
    >
      <div aria-hidden onClick={closeCrystal} className={`${backdropBleed} -z-10 bg-ink/55 backdrop-blur-md`} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.25 } }}
        exit={{ opacity: 0 }}
        className="flex w-[min(92vw,440px)] justify-end"
      >
        <PageButton label="Back to the collection" onClick={closeCrystal}>
          <XIcon size={20} />
        </PageButton>
      </motion.div>

      <motion.article
        initial={reduce ? false : { opacity: 0, scale: 0.9, y: 40, rotate: -3 }}
        animate={{ opacity: 1, scale: 1, y: 0, rotate: -0.6 }}
        exit={reduce ? undefined : { opacity: 0, scale: 0.94, y: 30, rotate: -2, transition: { duration: 0.3, ease } }}
        transition={springSoft}
        onPanStart={() => (panned.current = true)}
        onPanEnd={(_, info) => {
          if (info.offset.x < -50) go(1)
          else if (info.offset.x > 50) go(-1)
          else if (info.offset.y > 90) closeCrystal()
        }}
        className="flex h-[min(calc(100svh-150px),740px)] w-[min(92vw,440px)] touch-pan-y flex-col bg-white p-2.5 pb-0 shadow-[0_40px_70px_-30px_rgb(0_0_0/0.55)] select-none"
      >
        {/* The photo window of the polaroid, where the slides change */}
        <div onClick={onTap} className="relative min-h-0 flex-1 cursor-pointer overflow-hidden bg-paper">
          <AnimatePresence initial={false} custom={dir}>
            <motion.div
              key={index}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir * 60 }}
              animate={{ opacity: 1, x: 0, transition: { duration: 0.6, ease } }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -30, transition: { duration: 0.3, ease } }}
              className="absolute inset-0"
            >
              {slide.kind === 'intro' ? <Intro crystal={c} /> : null}
              {slide.kind === 'chapter' ? <ChapterSlide crystal={c} chapter={slide.chapter} /> : null}
              {slide.kind === 'details' ? <Details crystal={c} next={next} /> : null}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* The polaroid's white strip: the name by hand and how far along the story is */}
        <div className="flex h-16 shrink-0 items-center justify-between gap-4 px-2">
          <Hand className="truncate text-[17px] text-ink/85">{c.name.toLowerCase()}</Hand>
          <div className="flex shrink-0 gap-1.5" aria-label={`Page ${index + 1} of ${slides.length}`}>
            {slides.map((_, i) => (
              <motion.span
                key={i}
                initial={false}
                animate={{ width: i === index ? 18 : 6, opacity: i <= index ? 1 : 0.35 }}
                transition={springSnappy}
                className="h-1.5 bg-gold-text"
              />
            ))}
          </div>
        </div>
      </motion.article>

      {/* The space under the card holds the turning controls, within thumb reach */}
      <motion.nav
        aria-label="Story pages"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease, delay: 0.3 } }}
        exit={{ opacity: 0 }}
        className="flex w-[min(92vw,440px)] items-center justify-between"
      >
        <PageButton label="Previous" disabled={index === 0} onClick={() => go(-1)}>
          <ArrowLeftIcon size={20} weight="light" />
        </PageButton>
        <Hand className="text-[16px] text-paper drop-shadow-sm">{`${index + 1} of ${slides.length}`}</Hand>
        <PageButton label="Next" disabled={index === slides.length - 1} onClick={() => go(1)}>
          <ArrowRightIcon size={20} weight="light" />
        </PageButton>
      </motion.nav>
    </motion.div>
  )
}

function PageButton({ label, disabled = false, onClick, children }: { label: string; disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      transition={springSnappy}
      className="grid size-11 cursor-pointer place-items-center bg-paper text-ink shadow-sm transition-opacity disabled:opacity-30"
    >
      {children}
    </motion.button>
  )
}

// Children rise one after another once the slide is on screen
function Rise({ i, children, className = '' }: { i: number; children: ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease, delay: 0.18 + i * 0.08 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Slow zoom on the photo while it is on screen
function Photo({ src, className = '' }: { src: string; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <div className={`overflow-hidden bg-sand ${className}`}>
      <motion.img
        src={src}
        alt=""
        initial={reduce ? false : { scale: 1.14 }}
        animate={{ scale: 1 }}
        transition={{ duration: 7, ease: [0.22, 1, 0.36, 1] }}
        className="size-full object-cover"
      />
    </div>
  )
}

function Intro({ crystal: c }: { crystal: Crystal }) {
  const reduce = useReducedMotion()
  return (
    <div className="relative size-full bg-ink">
      <Photo src={c.image} className="size-full" />
      <div className="absolute inset-0 bg-linear-to-t from-ink/90 via-ink/20 to-transparent" />
      <div className="absolute inset-x-6 bottom-8 grid gap-2.5 text-paper">
        <Rise i={0}>
          <Hand className="text-paper/85">{c.tag.toLowerCase()}</Hand>
        </Rise>
        <Rise i={1}>
          <h2 className="pb-2 font-serif text-[clamp(2.6rem,12vw,3.6rem)] leading-[1.05] italic">{c.name}</h2>
        </Rise>
        <Rise i={2}>
          <p className="font-serif text-xl text-paper/90">{c.intention}</p>
        </Rise>
        <Rise i={3} className="mt-5">
          <span className={`${kicker} flex items-center gap-2 text-paper/75`}>
            Tap to hear its story
            <motion.span
              animate={reduce ? undefined : { x: [0, 5, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
            >
              <ArrowRightIcon size={14} />
            </motion.span>
          </span>
        </Rise>
      </div>
    </div>
  )
}

function ChapterSlide({ crystal: c, chapter }: { crystal: Crystal; chapter: Chapter }) {
  return (
    <div className="flex size-full flex-col">
      <Photo src={chapter.image ?? c.image} className="h-[46%] shrink-0" />
      <div className="grid min-h-0 flex-1 content-start gap-3 overflow-y-auto px-6 pt-6 pb-10 [scrollbar-width:none] [mask-image:linear-gradient(to_bottom,black_80%,transparent)]">
        <Rise i={0}>
          <Hand>{c.name.toLowerCase()}</Hand>
        </Rise>
        <Rise i={1}>
          <h3 className="pb-1 font-serif text-[clamp(1.8rem,8vw,2.25rem)] leading-[1.1]">{chapter.title}</h3>
        </Rise>
        <Rise i={2}>
          <p className="text-[17px] leading-[1.7] text-muted">{chapter.text}</p>
        </Rise>
      </div>
    </div>
  )
}

function Details({ crystal: c, next }: { crystal: Crystal; next: Crystal }) {
  const rows = [
    ['Origin', c.origin],
    ['Care', c.care],
    ['Price', c.price],
  ].filter(([, v]) => v)

  return (
    <div className="flex size-full flex-col overflow-y-auto px-6 pt-8 pb-6 [scrollbar-width:none]">
      <Rise i={0}>
        <h3 className="pb-1 font-serif text-[2.4rem] leading-[1.1]">
          <em>Keep</em> in mind
        </h3>
      </Rise>
      {rows.length ? (
        <dl className="mt-8 grid gap-6 border-t border-gold/60 pt-6">
          {rows.map(([k, v], i) => (
            <Rise key={k} i={i + 1} className="grid gap-1">
              <dt className={`${kicker} text-gold-text`}>{k}</dt>
              <dd className="font-serif text-xl leading-snug">{v}</dd>
            </Rise>
          ))}
        </dl>
      ) : null}

      <Rise i={rows.length + 2} className="mt-auto">
        <motion.button
          type="button"
          onClick={() => openCrystal(next.slug)}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          transition={springSnappy}
          className="flex w-full cursor-pointer items-center gap-4 bg-sand p-3 text-left"
        >
          <img src={next.image} alt="" className="size-20 object-cover" />
          <span className="grid flex-1 gap-0.5">
            <Hand className="text-[12px]">next stone</Hand>
            <span className="font-serif text-2xl italic">{next.name}</span>
          </span>
          <ArrowRightIcon size={20} weight="light" className="mr-2" />
        </motion.button>
      </Rise>
      <button type="button" onClick={closeCrystal} className="mt-6 cursor-pointer self-center border-b border-gold pb-1 text-sm">
        All crystals
      </button>
    </div>
  )
}
