<p align="center">
  <img src="./public/favicon.webp" />
</p>

# Local Chat

A [T3 Chat Cloneathon](https://cloneathon.t3.chat/) submission

Based on a local-first approach, Local Chat provides access to hundreds of different LLMs through [OpenRouter](https://openrouter.ai/) without unnecessary intermediate servers

Built with React, [Jazz](https://jazz.tools/), [Reatom](https://v1000.reatom.dev/), [Panda CSS](https://panda-css.com/) and [Park UI](https://park-ui.com/)

## Installation
```
pnpm install && pnpm build
```

You can also use a local jazz sync server to persist your data:
```
pnpm preview
```

Or use any other external sync server by specifying its address in .env `VITE_JAZZ_SYNC_URL`

## Features

* Access to all LLMs from OpenRouter and offline data storage, or syncing through sync server
* Creating chat branches, including nested ones
* Markdown formatting and code snippets via [Shiki](https://shiki.style/)
* Attachment support
* Authentication via mnemonic phrases like in crypto wallets
* Real-time draft message preview

## Customizing

You can minimally customize the application's styling by replacing the primary and secondary colors, as well as the degrees of rounding.

```ts
import neutral from '~/shared/ui/kit/colors/neutral';
import purple from '~/shared/ui/kit/colors/purple';

export default defineConfig({
	// ...
	presets: [createPreset({ accentColor: purple, grayColor: neutral, radius: 'xl' })],
	// ...
});
```

Refeer to the [ParkUI documentation](https://park-ui.com/docs/theme/customize) for more info
