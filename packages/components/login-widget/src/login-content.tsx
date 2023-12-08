import { loginWidget, popover } from '@mochi-ui/theme'
import { Button } from '@mochi-ui/button'
import { ArrowLeftLine } from '@mochi-ui/icons'
import { AnimatePresence, m, Transition, Variants } from 'framer-motion'
import {
  ChainProvider,
  ConnectWalletWidget,
} from '@mochi-ui/connect-wallet-widget'
import { useCallback, useState } from 'react'
import ConnectSocial from './connect-social'
import { useLoginWidget } from './store'
import fetchers from './fetchers'

const { loginContentClsx, loginWalletListWrapperClsx } = loginWidget

const variants: Variants = {
  enter: (direction: number) => {
    return {
      position: 'relative',
      x: direction > 0 ? '110%' : '-110%',
      opacity: 0.2,
      scale: 0.95,
    }
  },
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => {
    return {
      position: 'absolute',
      x: direction < 0 ? '110%' : '-110%',
      opacity: 0.2,
      scale: 0.95,
    }
  },
}

const transition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
}

const commonProps = {
  transition,
  variants,
  initial: 'enter',
  animate: 'center',
  exit: 'exit',
}

// borrow popover's style
const { popoverContentClsx } = popover

export default function LoginContent({
  raw = false,
  chain,
}: {
  raw?: boolean
  chain?: string
}) {
  const { isLoggedIn, dispatch } = useLoginWidget()
  const [state, setState] = useState({ step: chain ? 2 : 1, direction: 0 })

  const handleAfterConnect = useCallback(
    async (
      wallet: ChainProvider,
      data: {
        addresses: string[]
        signature: string
        platform: string
      },
    ) => {
      if (isLoggedIn) {
        dispatch({
          type: 'update_wallets',
          payload: {
            addresses: data.addresses,
            chain: data.platform,
            provider: wallet,
          },
        })
        /* setInternal({ step: LoginStep.Authenticated }) */
        return
      }
      /* setInternal({ step: LoginStep.Authenticating }) */
      const token = await fetchers.getAccessToken(data)
      if (!token) return

      const profile = await fetchers.getOwnProfile(token)
      if (!profile) return

      dispatch({
        type: 'login',
        payload: {
          profile,
          addresses: data.addresses,
          chain: data.platform,
          provider: wallet,
          token,
        },
      })

      /* setInternal({ step: LoginStep.Authenticated }) */
    },
    [dispatch, isLoggedIn],
  )

  return (
    <div className={!raw ? popoverContentClsx({}) : ''}>
      <div className={loginContentClsx({ className: raw ? 'p-0' : 'p-4' })}>
        <AnimatePresence initial={false} custom={state.direction}>
          {state.step === 1 ? (
            <m.div key={state.step} custom={state.direction} {...commonProps}>
              <ConnectSocial setState={setState} />
            </m.div>
          ) : (
            <m.div
              key={state.step}
              custom={state.direction}
              {...commonProps}
              className={loginWalletListWrapperClsx()}
            >
              <ConnectWalletWidget
                chain={chain}
                dispatch={dispatch}
                onConnectSuccess={handleAfterConnect}
              />
              {!chain && (
                <Button
                  type="button"
                  onClick={() => setState({ step: 1, direction: -1 })}
                  size="lg"
                  color="neutral"
                  variant="outline"
                >
                  <ArrowLeftLine />
                  Back
                </Button>
              )}
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}