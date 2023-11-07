import type { SVGProps } from 'react'
import clsx from 'clsx'

export interface WalletProps {
  icon: string | ((props: SVGProps<SVGSVGElement>) => JSX.Element)
  transparent?: boolean
  name: string
  active?: boolean
  isInstalled: boolean
  connect: (...params: any) => Promise<any>
}

export default function Wallet(props: WalletProps) {
  return (
    <button
      className={clsx(
        'flex gap-x-3 items-center py-3 px-6 rounded-xl transition hover:bg-neutral-100',
        {
          'opacity-50': !props.isInstalled,
          'text-neutral-600': !props.active,
          'text-neutral-800': Boolean(props.active),
        },
      )}
      disabled={!props.isInstalled}
      onClick={() => void props.connect()}
      type="button"
    >
      <props.icon className="w-6 h-6 rounded" />
      <span className="text-sm text-left">{props.name}</span>
    </button>
  )
}