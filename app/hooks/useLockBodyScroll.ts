import { useEffect } from "react"

export function useLockBodyScroll(active: boolean) {
  useEffect(() => {
    if (!active) return

    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth

    const originalOverflow = document.body.style.overflow
    const originalPaddingRight = document.body.style.paddingRight

    document.body.style.overflow = "hidden"
    document.body.style.paddingRight = `${scrollBarWidth}px`

    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPaddingRight
    }
  }, [active])
}
