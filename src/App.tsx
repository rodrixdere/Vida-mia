import { AnimatePresence } from 'motion/react'
import { findCrystal } from './content'
import { Home } from './Home'
import { useCrystalSlug } from './route'
import { Story } from './Story'

export function App() {
  const slug = useCrystalSlug()
  const crystal = slug ? findCrystal(slug) : undefined

  return (
    <>
      <Home />
      <AnimatePresence>{crystal ? <Story key="story" crystal={crystal} /> : null}</AnimatePresence>
    </>
  )
}
