import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { XIcon } from '@phosphor-icons/react'
import type { BarcodeDetector as Detector } from 'barcode-detector/ponyfill'
import { findByScan } from './content'
import { openCrystal } from './route'
import { backdropBleed, ease, Hand } from './ui'

// Camera only works on https (or localhost), so the button hides elsewhere
export const canScan = () => !!navigator.mediaDevices?.getUserMedia

type Status = 'starting' | 'looking' | 'unknown' | 'denied'

const hints: Record<Status, string> = {
  starting: 'waking the camera',
  looking: 'point at the label on the stone',
  unknown: "we don't know that one yet",
  denied: 'allow the camera to scan',
}

// Chrome on Android reads barcodes natively; Safari gets the WebAssembly reader, loaded only now
async function makeDetector(): Promise<Detector> {
  const Native = (globalThis as { BarcodeDetector?: typeof Detector }).BarcodeDetector
  if (Native) return new Native()
  const { BarcodeDetector } = await import('barcode-detector/ponyfill')
  return new BarcodeDetector()
}

export function Scan({ onClose }: { onClose: () => void }) {
  const video = useRef<HTMLVideoElement>(null)
  const [status, setStatus] = useState<Status>('starting')
  // Kept in a ref so a re-render of the page does not restart the camera
  const close = useRef(onClose)
  close.current = onClose

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    let stream: MediaStream | undefined
    let timer = 0
    let busy = false
    let cancelled = false

    ;(async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
        const detector = await makeDetector()
        // Closed while the permission prompt was open: let go of the camera now
        if (cancelled || !video.current) return stream.getTracks().forEach(t => t.stop())
        video.current.srcObject = stream
        await video.current.play()
        setStatus('looking')

        timer = window.setInterval(async () => {
          const v = video.current
          if (busy || !v || v.readyState < 2) return
          busy = true
          try {
            for (const { rawValue } of await detector.detect(v)) {
              const crystal = findByScan(rawValue)
              if (!crystal) {
                setStatus('unknown')
                continue
              }
              clearInterval(timer)
              close.current()
              openCrystal(crystal.slug)
              return
            }
          } finally {
            busy = false
          }
        }, 250)
      } catch {
        if (!cancelled) setStatus('denied')
      }
    })()

    return () => {
      cancelled = true
      clearInterval(timer)
      stream?.getTracks().forEach(t => t.stop())
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Scan a crystal"
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

      <div className="grid content-center justify-items-center gap-8">
        <p className="text-center font-serif text-[1.9rem] leading-tight sm:text-[2.2rem]">
          Find its <em>label</em>
        </p>

        {/* The camera sits in a polaroid, like the photos on the table */}
        <div className="w-full max-w-[340px] -rotate-1 bg-white p-2.5 pb-12 shadow-[0_28px_50px_-20px_rgb(0_0_0/0.65)]">
          <div className="relative aspect-square overflow-hidden bg-ink">
            <video ref={video} muted playsInline className="size-full object-cover" />
            <span aria-hidden className="absolute inset-[18%] border border-gold/80" />
          </div>
          <div className="grid h-10 place-items-center" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.span
                key={status}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.35, ease }}
              >
                <Hand className="text-ink/85">{hints[status]}</Hand>
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="h-12" />
    </motion.div>
  )
}
