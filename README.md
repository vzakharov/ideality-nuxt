First of all, 

# I have no idea what I’m doing.

With that out of the way, this is the source code for [Ideality 🔺](https://ideality.app), the AI-driven ideation platform.

Although I did my best to review & clean the code before publishing it, it’s still (more than) a bit all over the place. The most hilarious part is that I was learning Vue/Nuxt ([an amazing framework!](https://nuxtjs.org/)) along the way, so earlier code is a complete 🤦‍♂️, while later one might be (less than) a bit less so.

Before you can call me a GPT Open-Source Pioneer (you were going to, right?), here is a couple of

## Caveats

1. The backend (DB + auth) is **NOT** open-sourced. It is built on [Bubble](https://bubble.io/), and I don’t currently see a way to open-source it. Still, you can use many of the features by deploying the app locally and using other DB/auth providers, or adapting the code to load records from local storage.*
2. Most of the prompts used in the various widgets and tools within Ideality are stored in the database, so you can’t directly access them from the code. However, if you use Ideality with your own OpenAI API key (you can do this by simply adding `?apiKey=sk-...` to the URL — the keys are not stored and just used to access the API from *your own browser*), then you can see all the prompts used in the browser’s developer console.

## Installation

Frankly? I have no idea. I mean, that’s the whole source code, but, especially given the caveats above, I don’t see how you can easily deploy and start using it locally. Hopefully, someone else will have a clue!

## Structure

Below is some info on some of the folders/files in the codebase:

- `api/`: API for requests to Ideality server (not to be confused with the Bubble API, which is also used, including by this very API).
- `components/`: Vue components, most notably:
  - `Block/`: various blocks (Hero, Story, Triad, Punchline) used in [Ideality Builder](https://ideality.app/i/) (working title).
  - `Build/`: a build is basically a sequence of block, which together makeup an entire content piece (e.g. a landing page).
  - `Studio/` (10% ready): components for working with Ideality Studio.
  - `Toolbox/` (90% ready): components for working with Ideality Toolbox.
  - `Widget/`: components for working with Ideality Widget (mvp completion: 100%).
- `pages/`: Pages you can access from the web, most notable:
  - `builder/` (30% ready): a central UI  for creating and editing Idea Builder projects.
  - `dashboard/`: main dashboard for registered users. Currently only contains the list of widgets. (Note that Ideality is currently early-access, so the only way to sign up is by submitting an [early-access request](https://ideality.app/request-access).)
- `i/` (shorthand for “Ideas”): interface for creating, editing, and accessing Idea Builder projects. Currently supports creating [landing/lead generation pages from ideas](https://ideality.app/i/new) — no sign-up required.
- `s/` (10% ready, shorthand for “Studio”): a tool to edit prompts in a tree-like fashion, while being able to use various AI providers (e.g. OpenAI, Cohere, AI21, etc.).
- `toolbox/` (90% ready): think of it as an “open-source CopyAI,” a collection of simple tools which might or might not lead to more complex tools after generation. Currently there are very few tools, mainly because I was focused on building the app and not individual tools/widgets.
- `widget/`: perhaps the most important part, a “widget” defines which inputs the app accepts and which output it gives (i.e. “generate a tweet based on Twitter bio”) and includes an arbitrary number of examples (a.k.a. shots in a few-shot prompt).
  - `go/`: a special kind of a widget that reads all its information (input & output specification + exampels) right from the URL, so you can [build your own widgets](https://ideality.app/widget/go) on the fly, without signing up or storing anything anywhere.

Okay, with that said, I’m pressing the imaginary “Share with the world” button, and, with my fingers shaking, look forward to y’all’s feedback.

Oh, and remember,

# I have no idea what I’m doing!

Yours, [Vova](https://twitter.com/vovahimself).
