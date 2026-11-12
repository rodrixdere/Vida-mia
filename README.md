# Vida Mía · The Crystal Collection

Catálogo interactivo de los cristales del spa Vida Mía, en The Retreat Costa Rica. Pensado para abrirse desde el teléfono: cada cristal tiene su historia contada en tarjetas, y se puede "sacar" uno al azar como una carta.

Hecho con Vite, React, TypeScript, Tailwind CSS y Motion.

## Correrlo

```bash
npm install
npm run dev      # abre en http://localhost:5173 y en la red local (para verlo en el teléfono)
npm run build    # revisa tipos y genera dist/
npm run preview  # sirve la build
```

## Editar el contenido

Todo el texto y las fotos están en `src/content/crystals.json`:

- `title`, `subtitle`, `intro`: la portada.
- `shoutout`: la sección de Santosha al final.
- `crystals`: un objeto por cristal, con `slug` (el link: `/#/crystal/<slug>`), `name`, `tag` (el filtro), `intention`, `image`, los capítulos de `story` y los datos opcionales `origin`, `care` y `price`.

Para sumar un cristal se copia uno existente y se cambian sus datos. Más adelante este archivo se reemplaza por Contentful.

## Fotos de muestra

Las fotos actuales son de Wikimedia Commons, con licencias CC BY-SA y CC0, y están solo para el demo. Hay que cambiarlas por fotos propias antes de publicarlo.
