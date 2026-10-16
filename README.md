# NativeTalk — Practice App

English conversation practice for Brazilian learners: pick a scenario and a level, chat with an AI character, get gentle corrections ([COACH] tips), and hear replies read aloud.

## Stack

- Vite + React + TypeScript + Tailwind / shadcn-ui
- Student data (profile, word book, progress) is saved in the browser (`localStorage`)
- Server functions: AI chat (Claude) and text-to-speech (ElevenLabs)

## Run locally

```sh
npm install
npm run dev      # http://localhost:8080
npm run build    # production build in dist/
```
