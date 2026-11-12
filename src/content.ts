import data from './content/crystals.json'

export interface Chapter {
  title: string
  text: string
  image?: string
}

export interface Crystal {
  slug: string
  name: string
  tag: string // one word used by the filters: Calm, Love...
  intention: string
  image: string
  story: Chapter[]
  origin?: string
  care?: string
  price?: string
}

export interface Shoutout {
  name: string
  title: string
  text: string
  note: string
  image: string
}

export interface Collection {
  title: string
  subtitle: string
  intro: string
  shoutout: Shoutout
  crystals: Crystal[]
}

// Demo content from a local file; Contentful replaces this source later
export const collection: Collection = data

export const findCrystal = (slug: string) => collection.crystals.find(c => c.slug === slug)
