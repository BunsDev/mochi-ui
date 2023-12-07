import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Modal,
  ModalContent,
  TextFieldInput,
  TextFieldRoot,
  Typography,
} from '@mochi-ui/core'
import { AlertCircleLine } from '@mochi-ui/icons'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { shallow } from 'zustand/shallow'
import { API, GET_PATHS } from '~constants/api'
import { useProfileStore } from '~store'
import { ViewApplication } from '~types/mochi-pay-schema'

interface Props {
  app?: ViewApplication
  open?: boolean
  onOpenChange: (open: boolean) => void
  onSucess?: () => void
  onError?: () => void
}

const schema = z
  .object({
    matchingAppName: z.string(),
    appName: z.string(),
  })
  .refine((data) => data.appName === data.matchingAppName, {
    path: ['appName'],
  })

export const DeleteAppModal = ({
  app,
  open,
  onOpenChange,
  onSucess,
  onError,
}: Props) => {
  const { id: profileId } = useProfileStore(
    (s) => ({
      id: s.me?.id,
    }),
    shallow,
  )
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<{
    matchingAppName: string
    appName: string
  }>({
    defaultValues: { matchingAppName: '', appName: '' },
    resolver: zodResolver(schema),
    mode: 'onChange',
  })
  const { id, name } = app || {}

  useEffect(() => {
    if (name) {
      reset({
        appName: '',
        matchingAppName: name,
      })
    }
  }, [name, reset])

  const onDeleteApp = () => {
    if (!profileId || !id) return
    return API.MOCHI_PAY.put(
      undefined,
      GET_PATHS.DEACTIVE_APPLICATION(profileId, String(id)),
    )
      .json(() => {
        onSucess?.()
        onOpenChange(false)
      })
      .catch((e) => {
        const err = JSON.parse(e.message)
        alert(err.msg)
        onError?.()
      })
  }

  return (
    <Modal {...{ open, onOpenChange }}>
      <ModalContent className="w-full max-w-sm">
        <form onSubmit={handleSubmit(onDeleteApp)}>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center p-3 border-8 rounded-full w-fit bg-danger-outline-border border-danger-outline">
              <AlertCircleLine className="w-6 h-6 text-danger-solid" />
            </div>
            <Typography level="h6" className="mt-5">
              Delete {name}
            </Typography>
            <Alert scheme="warning" size="sm" layout="stack" className="mt-2">
              <AlertIcon />
              <AlertDescription>
                {`If you delete this app, your remaining balance will be transferred to the owner's Mochi wallet.`}
              </AlertDescription>
            </Alert>
          </div>
          <Controller
            name="appName"
            control={control}
            render={({ field, fieldState }) => (
              <FormControl error={!!fieldState.error} className="mt-5">
                <FormLabel>App name</FormLabel>
                <TextFieldRoot>
                  <TextFieldInput {...field} placeholder="<App name>" />
                </TextFieldRoot>
                <FormHelperText>
                  To delete this app, please confirm the name.
                </FormHelperText>
              </FormControl>
            )}
          />
          <div className="grid grid-cols-2 gap-3 mt-8">
            <Button
              size="lg"
              color="white"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              size="lg"
              type="submit"
              disabled={isSubmitting || !!Object.keys(errors).length}
              loading={isSubmitting}
            >
              Delete
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  )
}
