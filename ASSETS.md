# Visual direction and assets — edition 03

Four original showcase images and ten new service-specific images generated using the built-in GPT Image tool. Generated concepts are labelled on the website; none is presented as client work, a real customer or a finished video. Smit's portrait is the supplied authentic photograph, encoded for web delivery without generative edits. Original uploads and generation outputs are retained outside the public repository; public WebP files contain the site's final assets.

## Placement

| File | Use |
|---|---|
| `public/images/hero-sculpture.webp` | Full-screen opening and social preview |
| `public/images/ugc-creator.webp` | UGC creative world |
| `public/images/cinematic-product.webp` | Cinematic creative world |
| `public/images/avatar-studio.webp` | Avatar creative world |
| `public/images/smit-kapadiya.webp` | Authentic founder portrait |

## Service collection

Ten independently generated landscape images, composed for complete 3:2 display. Each has a 1536×1024 detail asset and a 600×400 responsive preview, in WebP. The full images are approximately 125–262 KB each. Cards load lazily; the dialog requests only the selected service image. CSS preserves the entire composition with natural height and `object-fit: contain`.

| File under `public/images/services/` | Concept |
|---|---|
| `avatar.webp` | Expert presenter and digital glass reflection |
| `ugc.webp` | Creator presenting a skincare product, full face visible |
| `film.webp` | Emerald fragrance, ocean and sculptural chrome |
| `reels.webp` | Three editorial frames and a glass play symbol |
| `images.webp` | Sneaker campaign with glass, satin and amber |
| `automation.webp` | Glass machine connecting inputs to an output |
| `whatsapp.webp` | Messaging, appointment and phone composition |
| `websites.webp` | Glass browser and mobile editorial layouts |
| `apps.webp` | Exploded glass software layers above a phone |
| `crm.webp` | Customer hub, profile network and pipeline |

The corresponding `-600.webp` files are previews of the same artwork. Exact prompts and placement metadata are preserved in [service-art-prompts.json](service-art-prompts.json).

## Generation prompts

### Hero sculpture

Use case: stylized-concept. Create one ultra-premium cinematic website HERO background, wide landscape 1536x1024. Brand is KAPADIYA & SONS, a creative AI content and automation studio. No text, no logos. A monumental liquid chrome sculptural ribbon forming a loose impossible knot with an open center, floating above dark volcanic black reflective terrain. One electric chartreuse luminous ribbon interwoven subtly through metallic loops. Editorial art direction like a luxury future design studio campaign, physically convincing polished metal, extreme beautiful lighting, soft atmospheric smoke, near-black charcoal environment, exquisite specular highlights. Composition: sculpture occupies right 65%, left 35% predominantly dark negative space for large white web typography. Crisp silhouette and close up large sculpture, not distant tiny object. Deliberate asymmetric composition. No purple or blue gradient, no interface, no stock tech icons. This image is for a truly premium creative agency website opening.

### UGC creator

Use case: ads-marketing. Create a portrait 1024x1536 photorealistic premium UGC campaign concept for a creative studio website. A stylish young adult Indian woman creator with natural skin texture, wearing an oversized pale cream tee, in a tasteful sunlit contemporary apartment, holds a small unlabeled frosted sage-green cosmetic serum bottle close to camera, relaxed convincing candid expression, medium-close composition, thoughtful warm window light, subtle film grain, olive and butter palette. Product and hands anatomically accurate. Human editorial photography, premium creator content, not stiff stock photo. Subject and bottle in upper two thirds, lower third relatively calm for website overlay. No text, no watermark, no brand names, no UI. This is a fictional AI concept image, not a testimonial.

### Cinematic product

Use case: product-mockup. Create a portrait 1024x1536 luxury cinematic campaign photograph for a creative agency showcase. A single sculptural dark emerald glass perfume bottle with brushed silver cap and a small elegant blank cream label, floating above shallow dark water amid dramatically lit natural limestone cliffs. Electric lime thin ribbon of light reflected across the water, hard late afternoon sunlight from top left with deep charcoal shadows, highly art-directed composition, hyperreal physically convincing glass and caustics, beautifully restrained editorial fragrance campaign. Center bottle large in upper-middle, moody dark bottom third for text overlay. No text, no logos, no watermark, no interface.

### Avatar studio

Use case: photorealistic-natural. Portrait 1024x1536 editorial photo for an AI avatar service showcase on a luxury creative technology studio site. An adult Indian male educator in a charcoal casual overshirt speaking naturally to camera in a beautifully designed recording studio, visible professional microphone at frame side, warm practical light and subtly lit olive acoustic wall, intentional natural confident expression, realistic skin detail and hands, shallow depth of field, amber and muted green film palette. Medium portrait framed in upper two-thirds, darker lower third for website text. No text, no UI, no brand logos. Fictional demonstration character, not any real founder or customer.

## Motion design

GSAP orchestrates the opening typography, scroll-linked hero artwork, desktop pinned horizontal creative worlds, manifesto, workflow steps and founder portrait. Mobile uses vertically stacked worlds and restrained parallax. Native browser scrolling is retained. Reduced-motion preferences and the visible pause control replace the pinned sequence with readable stacked content.

Implementation references: [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) and [responsive motion contexts](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/).
