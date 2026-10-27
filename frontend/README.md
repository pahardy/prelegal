# Prelegal frontend

Next.js app that creates a Mutual NDA from a short form (KAN-8). It runs entirely in the browser and reads the NDA templates from `../templates` at build time.

```
npm install
npm run dev     # http://localhost:3000
npm test        # unit tests for the fill logic
npm run build
```

`lib/fillNda.ts` holds the template-filling logic; `components/NdaCreator.tsx` is the form, live preview and download.
