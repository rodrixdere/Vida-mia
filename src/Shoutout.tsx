import { motion, useReducedMotion } from 'motion/react'
import { collection } from './content'
import { ease, Hand, springSoft, Titled } from './ui'

// A word for Santosha, the boutique of The Retreat (jewellery and clothing, not crystals)
export function Shoutout() {
  const reduce = useReducedMotion()
  const s = collection.shoutout

  return (
    <section
      aria-labelledby="shoutout"
      className="-mx-4 mb-16 grid items-center gap-12 bg-sand px-6 py-16 sm:-mx-8 sm:px-12 md:grid-cols-[0.9fr_1.1fr] md:py-20"
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 40, rotate: -9 }}
        whileInView={{ opacity: 1, y: 0, rotate: -4 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={springSoft}
        className="relative mx-auto w-[68%] max-w-[300px] bg-white p-3 pb-14 shadow-[0_30px_50px_-28px_rgb(47_45_42/0.6)]"
      >
        <span className="tape" />
        <img src={s.image} alt="" loading="lazy" className="aspect-square w-full object-cover" />
        <Hand className="absolute inset-x-0 bottom-4 text-center text-[18px] text-ink/85">{s.name.toLowerCase()}</Hand>
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9, ease, delay: 0.15 }}
        className="grid justify-items-center gap-5 text-center md:justify-items-start md:text-left"
      >
        <h2 id="shoutout" className="pb-1 font-serif text-[2.6rem] leading-[1.1] sm:text-5xl">
          <Titled text={s.title} />
        </h2>
        <p className="max-w-[40ch] text-lg leading-relaxed text-muted">{s.text}</p>
        <Hand className="-rotate-2 text-[17px]">{s.note}</Hand>
      </motion.div>
    </section>
  )
}
