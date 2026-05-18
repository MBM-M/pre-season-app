/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Display: Bricolage Grotesque for headlines (sporty, expressive).
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        // Sans (default): Geist for body copy.
        sans: ['Geist', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        // Mono: JetBrains Mono for stats, labels, and code-feel UI.
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
