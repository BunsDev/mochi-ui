import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import { useDisclosure } from '@dwarvesf/react-hooks'
import { createContext } from '@dwarvesf/react-utils'
import { m } from 'framer-motion'
import { Button } from '@consolelabs/core'

interface State {
  onClose: () => void
  onOpen: () => void
  isOpen: boolean
  elem: HTMLDivElement | null
}

const [BottomSheetContextProvider, useInternal] = createContext<State>({
  name: 'BottomSheetContext',
})

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  className?: string
}

function BottomSheet({
  isOpen,
  children,
  onClose,
  title,
  className = '',
}: BottomSheetProps) {
  const {
    elem,
    isOpen: _isOpen,
    onOpen: _onOpen,
    onClose: _onClose,
  } = useInternal()

  useEffect(() => {
    if (isOpen) {
      _onOpen()
    } else {
      _onClose()
    }
  }, [isOpen, _onOpen, _onClose])

  useEffect(() => {
    if (!_isOpen) {
      _onClose()
      onClose()
    }
  }, [_isOpen, _onClose, onClose])

  if (!elem || !isOpen) return null

  return createPortal(
    <div className={clsx(className)}>
      <div className="flex justify-between items-center mb-2">
        <div className="flex-1">
          <Button
            color="neutral"
            variant="link"
            size="sm"
            type="button"
            onClick={_onClose}
          >
            Close
          </Button>
        </div>
        {title ? (
          <span className="flex-1 text-sm font-semibold text-center">
            {title}
          </span>
        ) : (
          <>&#8203;</>
        )}
        <div className="flex-1" />
      </div>
      {children}
    </div>,
    elem,
  )
}

export { BottomSheet }

export default function BottomSheetProvider({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: delayIsOpen,
    onOpen: delayOpen,
    onClose: delayClose,
  } = useDisclosure()
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function listenForEsc(e: KeyboardEvent) {
      if (isOpen && e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', listenForEsc)

    return () => {
      window.removeEventListener('keydown', listenForEsc)
    }
  }, [isOpen, onClose])

  useEffect(() => {
    setTimeout(isOpen ? delayOpen : delayClose, 500)
  }, [delayClose, delayOpen, isOpen])

  return (
    <BottomSheetContextProvider
      value={{
        onOpen,
        onClose,
        isOpen: delayIsOpen,
        elem: ref.current,
      }}
    >
      <div
        // capture to prevent it from going down children
        onClickCapture={(e) => {
          if (!isOpen) return
          if (ref.current?.contains(e.target as HTMLElement)) return
          onClose()
          e.stopPropagation()
        }}
        className={clsx('relative transition', className, {
          'bg-gray-700': isOpen,
          'bg-transparent': !isOpen,
        })}
      >
        <m.div
          initial={false}
          animate={{
            opacity: isOpen ? '50%' : '100%',
            scale: isOpen ? '100%' : '100%',
          }}
          transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
          className={clsx({
            'pointer-events-none overflow-hidden': isOpen,
            'pointer-events-auto': !isOpen,
          })}
        >
          {children}
        </m.div>
        <m.div
          initial={false}
          animate={{
            x: '-50%',
            y: isOpen ? '0%' : '100%',
          }}
          transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
          ref={ref}
          className="absolute left-1/2 w-full h-[75%] bottom-0 origin-bottom flex flex-col p-3 bg-white-pure rounded-t-lg"
        />
      </div>
    </BottomSheetContextProvider>
  )
}