export const colors = {
  primary: "slate-950",
  accent: "indigo-500",
  accentHover: "indigo-600",
  surface: "slate-50",
  muted: "slate-600",
  border: "slate-200",
  white: "white",
  dark: "slate-900",
} as const;

export const spacing = {
  section: "py-12 sm:py-18 md:py-24 lg:py-28",
  container: "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8",
} as const;

export const typography = {
  display: "text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl break-words",
  h1: "text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl break-words",
  h2: "text-xl font-bold tracking-tight sm:text-2xl md:text-3xl break-words",
  h3: "text-lg font-semibold tracking-tight sm:text-xl md:text-2xl break-words",
  h4: "text-base font-semibold tracking-tight sm:text-lg break-words",
  bodyLg: "text-base sm:text-lg text-slate-600 leading-relaxed",
  body: "text-sm sm:text-base text-slate-600 leading-relaxed",
  caption: "text-xs sm:text-sm text-slate-500",
} as const;
