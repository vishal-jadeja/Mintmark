/** SVG coin stamp mark — M inside a circular dashed ring */
export function LogoMark({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className="text-gold"
      aria-hidden="true"
    >
      {/* Outer coin stamp edge */}
      <circle
        cx="24"
        cy="24"
        r="22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 2.5"
      />
      {/* Inner ring */}
      <circle
        cx="24"
        cy="24"
        r="18"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity={0.4}
      />
      {/* M letterform */}
      <path
        d="M12 33V15L24 26.5L36 15V33"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
