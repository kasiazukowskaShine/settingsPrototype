export default function Icon({ d, className = '', children }) {
  return (
    <svg className={'i ' + className} viewBox="0 0 24 24">
      {d ? <path d={d} /> : children}
    </svg>
  )
}

export const ICONS = {
  search: (cls) => (
    <Icon className={cls}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </Icon>
  ),
  receipt: (cls) => <Icon className={cls} d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6" />,
  chevDown: (cls) => <Icon className={cls} d="M6 9l6 6 6-6" />,
  chevUp: (cls) => <Icon className={cls} d="M6 15l6-6 6 6" />,
  close: (cls) => <Icon className={cls} d="M6 6l12 12M18 6L6 18" />,
  plus: (cls) => <Icon className={cls} d="M12 5v14M5 12h14" />,
  back: (cls) => <Icon className={cls} d="M19 12H5M11 6l-6 6 6 6" />,
}
