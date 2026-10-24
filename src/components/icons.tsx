/** 线性图标：统一 1.8 描边、24 视框，避免用 emoji 当结构图标。 */
import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function base({ size = 20, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
    ...rest,
  }
}

export function PenIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 20h4l10.5-10.5a2.5 2.5 0 0 0-3.5-3.5L4.5 16.5V20Z" />
      <path d="M13.5 6.5 17.5 10.5" />
    </svg>
  )
}

export function ChartIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M7 15v-4" />
      <path d="M12 15V8" />
      <path d="M17 15v-6" />
    </svg>
  )
}

export function BookIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H18v18H6.5A1.5 1.5 0 0 1 5 19.5v-15Z" />
      <path d="M9 3v18" />
    </svg>
  )
}

export function SoundOnIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 9v6h3l4 4V5L8 9H5Z" />
      <path d="M16 9.5a3.5 3.5 0 0 1 0 5" />
      <path d="M18.5 7a7 7 0 0 1 0 10" />
    </svg>
  )
}

export function SoundOffIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 9v6h3l4 4V5L8 9H5Z" />
      <path d="m16 10 4 4" />
      <path d="m20 10-4 4" />
    </svg>
  )
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )
}

export function TrashIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h16" />
      <path d="M9 7V5h6v2" />
      <path d="M6 7l1 13h10l1-13" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  )
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  )
}

export function SparkIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3v5M12 16v5M3 12h5M16 12h5" />
      <path d="m6.5 6.5 3 3M14.5 14.5l3 3M17.5 6.5l-3 3M9.5 14.5l-3 3" />
    </svg>
  )
}
