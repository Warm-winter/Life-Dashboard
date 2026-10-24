import { useEffect, useState } from 'react'

/**
 * 换页时的星星划入转场。
 * 只在 ≥¥3.50 且用户没有要求减少动效时出现，且 620ms 后自动卸载（不挡操作）。
 */
export function StarWipe({ trigger, enabled }: { trigger: number; enabled: boolean }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!enabled || trigger === 0) return
    setVisible(true)
    const timer = window.setTimeout(() => setVisible(false), 640)
    return () => window.clearTimeout(timer)
  }, [trigger, enabled])

  if (!visible) return null

  return (
    <div className="wipe" key={trigger} aria-hidden="true">
      <div className="wipe-core" />
    </div>
  )
}
