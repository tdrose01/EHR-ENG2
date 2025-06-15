import { ref, watchEffect } from 'vue'

const THEME_KEY = 'theme'

export function useTheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const stored = localStorage.getItem(THEME_KEY)
  const theme = ref(stored || (prefersDark ? 'dark' : 'light'))

  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  watchEffect(() => {
    const html = document.documentElement
    if (theme.value === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
    localStorage.setItem(THEME_KEY, theme.value)
  })

  return { theme, toggleTheme }
}
