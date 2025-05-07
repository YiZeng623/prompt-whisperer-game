# Jailbreak.Me

## Project Summary

Jailbreak.Me is an interactive web app that teaches users about prompt injection vulnerabilities and AI safety through hands-on gameplay. Users alternate between attacking (extracting a secret password from an AI) and defending (writing system prompts to prevent leaks), gaining practical experience with both offensive and defensive prompt engineering. Unlike typical static tutorials, this project uniquely combines real-time LLM evaluation, guided tours, and gamified feedback to create an engaging, educational, and visually polished learning environment.

## Libraries and Frameworks

- **React** (UI framework)
- **Vite** (build tool)
- **TypeScript** (type safety)
- **Tailwind CSS** (utility-first CSS framework)
- **shadcn/ui** (modern, accessible React UI components)
- **Lucide React** (icon library)
- **Sonner** (toast notifications)
- **uuid** (unique ID generation)
- **Radix UI** (accessible UI primitives, via shadcn/ui)
- **Together API** (for LLM evaluation)
- **Embla Carousel** (carousel/slider, if used in UI)
- **class-variance-authority** (for managing Tailwind class variants)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open your browser at `https://prompt-whisperer-game.vercel.app/` (or the local port shown in your terminal).

---

For more details, see the code and comments in the repository.
