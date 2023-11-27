import { textfield, TextFieldStylesProps } from '@consolelabs/theme'
import React, { InputHTMLAttributes, HTMLAttributes, useMemo } from 'react'
import { FormControlContext, useFromControl } from '@consolelabs/form-context'
import type * as Polymorphic from '@consolelabs/polymorphic'

// root
type TextFieldContextValue = {
  size?: 'md' | 'lg'
  disabled?: boolean
  error?: boolean
  required?: boolean
  id?: string
}

const TextFieldContext = React.createContext<TextFieldContextValue | undefined>(
  undefined,
)

type TextFieldRootProps = TextFieldContextValue

type PolymorphicTextFieldRoot = Polymorphic.ForwardRefComponent<
  'div',
  TextFieldRootProps
>

const TextFieldRoot = React.forwardRef((props, ref) => {
  const {
    as: Component = 'div',
    children,
    size,
    disabled: disabledProp,
    error: errorProp,
    required: requiredProp,
    className,
    ...rest
  } = props

  const { disabled, required, error, htmlFor } = useFromControl()

  const contextValue = useMemo(
    () => ({
      size,
      disabled: disabledProp ?? disabled,
      error: errorProp ?? error,
      required: requiredProp ?? required,
      id: htmlFor,
    }),
    [
      disabledProp,
      errorProp,
      requiredProp,
      disabled,
      error,
      htmlFor,
      required,
      size,
    ],
  )

  return (
    <Component
      className={textfield.root({ className, error })}
      ref={ref}
      onPointerDown={(event) => {
        const target = event.target as HTMLElement
        if (target.closest('input, button, a')) return

        const input = (event?.currentTarget as HTMLElement)?.querySelector(
          'input',
        ) as HTMLInputElement | null
        if (!input) return

        const position = input.compareDocumentPosition(target)
        const targetIsBeforeInput =
          (position & Node.DOCUMENT_POSITION_PRECEDING) !== 0
        const cursorPosition = targetIsBeforeInput ? 0 : input.value.length

        requestAnimationFrame(() => {
          input.setSelectionRange(cursorPosition, cursorPosition)
          input.focus()
        })
      }}
      {...rest}
    >
      <TextFieldContext.Provider value={contextValue}>
        {children}
      </TextFieldContext.Provider>
    </Component>
  )
}) as PolymorphicTextFieldRoot

// TextField field
type TextFieldInputProps = Omit<
  TextFieldStylesProps,
  'size' | 'disabled' | 'error'
> &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
    className?: string
    size?: 'md' | 'lg'
    disabled?: boolean
    error?: boolean
  }

const TextFieldInput = React.forwardRef<HTMLInputElement, TextFieldInputProps>(
  (
    {
      className,
      size = 'md',
      error: errorProp,
      disabled: disabledProp,
      id: idProp,
      required: requiredProp,
      ...rest
    },
    ref,
  ) => {
    const context = React.useContext(TextFieldContext)
    const hasRoot = context !== undefined

    const formControlContext = React.useContext(FormControlContext)

    const disabled =
      context?.disabled ?? disabledProp ?? formControlContext.disabled
    const error = context?.error ?? errorProp ?? formControlContext.error
    const id = idProp ?? formControlContext.htmlFor
    const required = requiredProp ?? formControlContext.required

    const inputElement = (
      <>
        <input
          className={textfield.textFieldVariants({
            className,
            size: context?.size ?? size,
            error,
            disabled,
          })}
          disabled={disabled}
          required={required}
          ref={ref}
          id={id}
          {...rest}
        />
        <div
          className={textfield.mask({
            error,
            disabled,
          })}
        />
      </>
    )

    return hasRoot ? (
      inputElement
    ) : (
      <TextFieldRoot size={size} disabled={disabled} error={error}>
        {inputElement}
      </TextFieldRoot>
    )
  },
)

// slot

type TextFieldDecoratorElement = React.ElementRef<'div'>
type TextFieldDecoratorProps = HTMLAttributes<HTMLDivElement>

const TextFieldDecorator = React.forwardRef<
  TextFieldDecoratorElement,
  TextFieldDecoratorProps
>((props, forwardedRef) => {
  const { className, ...rest } = props
  return (
    <div
      {...rest}
      ref={forwardedRef}
      className={textfield.slot({ className })}
    />
  )
})

export { TextFieldRoot, TextFieldInput, TextFieldDecorator }

export type { TextFieldRootProps, TextFieldInputProps, TextFieldDecoratorProps }