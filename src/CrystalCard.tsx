import type { CSSProperties, PointerEvent } from 'react'
import type { Crystal } from './content'
import { openCrystal } from './route'
import { Hand, tilts } from './ui'

// The card tilts toward the finger and a light sheen follows it, like turning a stone in the hand
function onMove(e: PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect()
  const x = (e.clientX - r.left) / r.width
  const y = (e.clientY - r.top) / r.height
  const s = e.currentTarget.style
  s.setProperty('--x', `${x * 100}%`)
  s.setProperty('--y', `${y * 100}%`)
  s.setProperty('--rx', `${(0.5 - y) * 9}deg`)
  s.setProperty('--ry', `${(x - 0.5) * 9}deg`)
}

function onLeave(e: PointerEvent<HTMLElement>) {
  e.currentTarget.style.setProperty('--rx', '0deg')
  e.currentTarget.style.setProperty('--ry', '0deg')
}

// A polaroid: square photo, wide white bottom with the name written on it by hand
export function CrystalCard({ crystal: c, index }: { crystal: Crystal; index: number }) {
  return (
    <button
      type="button"
      aria-label={`${c.name}, ${c.tag}`}
      onClick={() => openCrystal(c.slug)}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ '--tilt': `${tilts[index % tilts.length]}deg` } as CSSProperties}
      className="holo group block w-full cursor-pointer text-left outline-none"
    >
      <span className="print relative block bg-white p-2.5 pb-0 shadow-[0_16px_34px_-22px_rgb(47_45_42/0.5)] sm:p-3 sm:pb-0">
        <span className="tape" />
        <span className="relative block aspect-square overflow-hidden bg-sand">
          <img
            src={c.image}
            alt=""
            loading="lazy"
            className="size-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
          />
          <span className="shine pointer-events-none absolute inset-0" />
        </span>
        <span className="grid min-h-[68px] content-center justify-items-center gap-0.5 px-1 py-2 text-center sm:min-h-[84px]">
          <Hand className="text-[15px] text-ink/85 sm:text-[18px]">{c.name.toLowerCase()}</Hand>
          <span className="font-serif text-[13px] text-muted italic sm:text-sm">{c.tag}</span>
        </span>
      </span>
    </button>
  )
}
