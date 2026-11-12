import { useSyncExternalStore } from 'react'

// Hash routes (#/crystal/amethyst) so each stone has its own link, e.g. for a QR next to it in the shop
const subscribe = (cb: () => void) => {
  addEventListener('hashchange', cb)
  return () => removeEventListener('hashchange', cb)
}

export const useCrystalSlug = () =>
  useSyncExternalStore(subscribe, () => location.hash.match(/^#\/crystal\/([\w-]+)/)?.[1] ?? null)

export const openCrystal = (slug: string) => {
  location.hash = `/crystal/${slug}`
}

export const closeCrystal = () => {
  history.pushState(null, '', location.pathname)
  dispatchEvent(new HashChangeEvent('hashchange'))
}
