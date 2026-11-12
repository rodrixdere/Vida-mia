import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { SparkleIcon, XIcon } from '@phosphor-icons/react'
import { collection, type Crystal } from './content'
import { openCrystal } from './route'
import { backdropBleed, ease, Hand, pickRandom, springSnappy, springSoft, Wordmark } from './ui'

const fan = [-9, 0, 9]
const flipSpring = { type: 'spring', stiffness: 70, damping: 13, mass: 1 } as const

// Oracle style: three face-down cards dealt from a deck; the guest picks one and it turns over
export function Draw({ onClose }: { onClose: () => void }) {
  const reduce = useReducedMotion()
  const [hand, setHand] = useState(() => pickRandom(collection.crystals, 3))
  const [round, setRound] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)

  // Cards shrink and fan out less on narrow phones so all three stay on screen
  const cardW = Math.min(186, Math.round(innerWidth * 0.4))
  const cardH = Math.round(cardW * 1.5)
  const spread = Math.round(cardW * 0.5)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const read = (c: Crystal) => {
    onClose()
    openCrystal(c.slug)
  }

  const again = () => {
    setPicked(null)
    setHand(pickRandom(collection.crystals, 3))
    setRound(r => r + 1)
  }

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Draw a crystal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      className="fixed inset-0 z-30 grid grid-rows-[auto_1fr_auto] px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] text-paper"
    >
      <div aria-hidden className={`${backdropBleed} -z-10 bg-ink`} />
      <div className="flex justify-end">
        <button type="button" onClick={onClose} aria-label="Close" className="grid size-11 cursor-pointer place-items-center">
          <XIcon size={22} weight="light" />
        </button>
      </div>

      <div className="grid content-center justify-items-center gap-6 sm:gap-10">
        <div className="grid h-24 place-items-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={picked === null ? 'choose' : 'chosen'}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ duration: 0.5, ease, delay: picked === null ? 0 : 0.5 }}
              className="grid justify-items-center gap-2 text-center"
            >
              <span className="font-serif text-[1.9rem] leading-tight sm:text-[2.2rem]">
                {picked === null ? (
                  <>
                    Close your eyes, <em>pick one</em>
                  </>
                ) : (
                  <>
                    This one <em>chose you</em>
                  </>
                )}
              </span>
              {picked === null ? <Hand className="text-gold">no peeking</Hand> : null}
            </motion.p>
          </AnimatePresence>
        </div>

        <div style={{ height: cardH * 1.25 }} className="relative flex w-full max-w-[440px] items-center justify-center [perspective:1400px]">
          {hand.map((c, i) => {
            const isPicked = picked === i
            const away = picked !== null && !isPicked
            return (
              <motion.button
                key={`${round}-${c.slug}`}
                type="button"
                aria-label={picked === null ? `Card ${i + 1}` : c.name}
                disabled={away}
                onClick={() => (picked === null ? setPicked(i) : read(c))}
                initial={reduce ? false : { x: 0, y: 120, rotate: 0, opacity: 0, scale: 0.9 }}
                animate={{
                  x: isPicked ? 0 : (i - 1) * spread,
                  y: away ? 140 : isPicked ? -8 : 0,
                  rotate: isPicked ? 0 : away ? fan[i] * 2.4 : fan[i],
                  scale: isPicked ? 1.14 : 1,
                  opacity: away ? 0 : 1,
                  zIndex: isPicked ? 2 : 1,
                }}
                whileHover={picked === null && !reduce ? { y: -16, transition: springSnappy } : undefined}
                whileTap={picked === null ? { scale: 0.96 } : undefined}
                transition={
                  picked === null
                    ? { ...springSoft, delay: reduce ? 0 : 0.15 + i * 0.12 }
                    : { ...springSoft, opacity: { duration: 0.35 } }
                }
                style={{ width: cardW, height: cardH }}
                className={`absolute cursor-pointer select-none ${away ? 'pointer-events-none' : ''}`}
              >
                {/* While waiting, each card breathes on its own rhythm */}
                <motion.span
                  animate={picked === null && !reduce ? { y: [0, -6, 0] } : { y: 0 }}
                  transition={picked === null ? { duration: 3.2 + i * 0.6, repeat: Infinity, ease: 'easeInOut', delay: 1 + i * 0.3 } : springSoft}
                  className="block size-full"
                >
                  <motion.span
                    animate={{ rotateY: isPicked ? 180 : 0 }}
                    transition={reduce ? { duration: 0 } : { ...flipSpring, delay: 0.15 }}
                    className="relative block size-full transform-3d"
                  >
                    <CardBack />
                    <CardFront crystal={c} revealed={isPicked} />
                  </motion.span>
                </motion.span>
              </motion.button>
            )
          })}
        </div>
      </div>

      <div className="h-12">
        <AnimatePresence>
          {picked !== null ? (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease, delay: reduce ? 0 : 0.9 } }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              className="flex flex-wrap justify-center gap-3"
            >
              <motion.button
                type="button"
                onClick={() => read(hand[picked])}
                whileTap={{ scale: 0.97 }}
                className="h-12 cursor-pointer bg-gold px-6 text-xs tracking-[0.2em] text-ink uppercase"
              >
                Read its story
              </motion.button>
              <motion.button
                type="button"
                onClick={again}
                whileTap={{ scale: 0.97 }}
                className="h-12 cursor-pointer border border-paper/40 px-6 text-xs tracking-[0.2em] uppercase"
              >
                Draw again
              </motion.button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function CardBack() {
  return (
    <span className="absolute inset-0 grid place-items-center bg-paper text-gold-text shadow-[0_28px_50px_-20px_rgb(0_0_0/0.65)] backface-hidden">
      <span className="absolute inset-3 border border-gold" />
      <span className="absolute inset-[18px] border border-gold/40" />
      <span className="grid justify-items-center gap-3">
        <SparkleIcon size={22} weight="light" />
        <Wordmark className="text-2xl" />
      </span>
    </span>
  )
}

function CardFront({ crystal: c, revealed }: { crystal: Crystal; revealed: boolean }) {
  return (
    <span className="absolute inset-0 grid grid-rows-[auto_1fr] overflow-hidden bg-white p-2.5 text-ink shadow-[0_28px_50px_-20px_rgb(0_0_0/0.65)] backface-hidden rotate-y-180">
      <img src={c.image} alt="" className="aspect-square w-full object-cover" />
      <span className="grid content-center justify-items-center gap-0.5 text-center">
        <Hand className="text-[15px] text-ink/85">{c.name.toLowerCase()}</Hand>
        <span className="font-serif text-[13px] text-muted italic">{c.tag}</span>
      </span>
      {/* One gold glint crosses the card as it lands face up */}
      {revealed ? (
        <motion.span
          initial={{ x: '-130%' }}
          animate={{ x: '130%' }}
          transition={{ duration: 1.1, ease: 'easeInOut', delay: 0.75 }}
          className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-gold/45 to-transparent mix-blend-soft-light"
        />
      ) : null}
    </span>
  )
}
