import React, { useCallback, useEffect, useId } from 'react'
import {
  ActionBar,
  ActionBarActionGroup,
  ActionBarBody,
  ActionBarCancelButton,
  ActionBarConfirmButton,
  ActionBarContent,
  ActionBarIcon,
  ActionBarTitle,
  Checkbox,
  CheckboxProps,
  SectionHeader,
  Skeleton,
  Switch,
  Typography,
} from '@mochi-ui/core'
import { useForm, FormProvider, Controller } from 'react-hook-form'
import { useFetchNotificationSettings } from '~hooks/settings/useFetchNotificationSettings'
import clsx from 'clsx'

interface NotificationFormValue {
  enableNotification: boolean
  receiveTip: boolean
  receiveAirdrops: boolean
  depositCompleted: boolean
  withdrawalCompleted: boolean
  walletTransactions: boolean
  paymentRequestExpired: boolean
  paymentRequestCompleted: boolean
  paylinkExpired: boolean
  paylinkClaimedByAnother: boolean
  paylinkClaimed: boolean
  newConfiguration: boolean
  newVaultTransactions: boolean
  informationChanged: boolean
  newApiCall: boolean
  newMember: boolean
  discord: boolean
  telegram: boolean
  website: boolean
}

const LabelCheckboxGroup = (
  props: Omit<CheckboxProps, 'name'> & {
    label: string
    name: keyof NotificationFormValue
  },
) => {
  const { label, name, size = 'lg', ...restProps } = props
  const id = useId()

  return (
    <Controller<NotificationFormValue>
      name={name}
      render={({ field: { value, ...restFields } }) => (
        <label
          htmlFor={id}
          className="flex justify-between py-4 w-full sm:max-w-[240px]"
        >
          <Typography level="p5" color="textPrimary">
            {label}
          </Typography>
          <Checkbox
            size={size}
            {...restProps}
            {...restFields}
            checked={value}
            id={id}
          />
        </label>
      )}
    />
  )
}

export function NotificationPage() {
  const form = useForm<NotificationFormValue>({ mode: 'all' })
  const { handleSubmit, formState, reset, watch } = form
  const { isDirty } = formState
  const { notiSettings, isLoading, mutate } = useFetchNotificationSettings()

  const enableNotification = watch('enableNotification')
  const checkboxTabIndex = enableNotification ? undefined : -1

  const onSubmit = (data: any) => {
    alert(JSON.stringify(data))
    mutate()
  }

  const resetSetting = useCallback(() => {
    reset(notiSettings)
  }, [notiSettings, reset])

  useEffect(() => {
    if (isLoading) return
    resetSetting()
  }, [isLoading, notiSettings, resetSetting])

  if (isLoading) return <Skeleton />

  return (
    <FormProvider {...form}>
      <div className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Typography level="h6">Notify Event</Typography>

        <div className="sm:max-w-[300px]">
          <SectionHeader
            title="Notification"
            description=""
            actions={[
              <Controller<NotificationFormValue>
                key="switch"
                name="enableNotification"
                render={({ field: { value, onChange, ...restFields } }) => (
                  <Switch
                    {...restFields}
                    checked={value}
                    onCheckedChange={onChange}
                  />
                )}
              />,
            ]}
          />
        </div>

        <div
          className={clsx('space-y-4', {
            'opacity-25 pointer-events-none': !enableNotification,
          })}
        >
          <Typography level="p5" color="textSecondary">
            Select the event you want to receive notifications for
          </Typography>
          <SectionHeader title="Wallet Activity" className="border-b" />
          <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-32  max-w-3xl">
            <div className="flex flex-col">
              <LabelCheckboxGroup
                tabIndex={checkboxTabIndex}
                label="Receive a tip"
                name="receiveTip"
              />
              <LabelCheckboxGroup
                tabIndex={checkboxTabIndex}
                label="Receive airdrops"
                name="receiveAirdrops"
              />
              <LabelCheckboxGroup
                tabIndex={checkboxTabIndex}
                label="Deposit completed"
                name="depositCompleted"
              />
              <LabelCheckboxGroup
                tabIndex={checkboxTabIndex}
                label="Withdrawal completed"
                name="withdrawalCompleted"
              />
              <LabelCheckboxGroup
                tabIndex={checkboxTabIndex}
                label="Wallet transactions"
                name="walletTransactions"
              />
            </div>
            <div className="flex flex-col">
              <LabelCheckboxGroup
                tabIndex={checkboxTabIndex}
                label="Payment request completed"
                name="paymentRequestCompleted"
              />
              <LabelCheckboxGroup
                tabIndex={checkboxTabIndex}
                label="Payment request expired"
                name="paymentRequestExpired"
              />
              <LabelCheckboxGroup
                tabIndex={checkboxTabIndex}
                label="Pay link has expired"
                name="paylinkExpired"
              />
              <LabelCheckboxGroup
                tabIndex={checkboxTabIndex}
                label="Pay link claimed by another"
                name="paylinkClaimedByAnother"
              />
              <LabelCheckboxGroup
                tabIndex={checkboxTabIndex}
                label="Claim a pay link"
                name="paylinkClaimed"
              />
            </div>
          </div>

          <div className="space-y-4">
            <SectionHeader
              title="Communities Activities"
              className="border-b"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-32  max-w-3xl">
              <LabelCheckboxGroup
                tabIndex={checkboxTabIndex}
                label="New Configuration"
                name="newConfiguration"
              />
            </div>
          </div>

          <div className="space-y-4">
            <SectionHeader title="Apps Activity" className="border-b" />
            <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-32  max-w-3xl">
              <div className="flex flex-col">
                <LabelCheckboxGroup
                  tabIndex={checkboxTabIndex}
                  label="New Vault Transactions"
                  name="newVaultTransactions"
                />
                <LabelCheckboxGroup
                  tabIndex={checkboxTabIndex}
                  label="Information Changed"
                  name="informationChanged"
                />
              </div>
              <div className="flex flex-col">
                <LabelCheckboxGroup
                  tabIndex={checkboxTabIndex}
                  label="New API call"
                  name="newApiCall"
                />
                <LabelCheckboxGroup
                  tabIndex={checkboxTabIndex}
                  label="New Member"
                  name="newMember"
                />
              </div>
            </div>
          </div>
          <div className="space-y-0">
            <SectionHeader
              title="Platform Notification"
              description="Select the platform you want to receive the notification"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3">
              <LabelCheckboxGroup
                tabIndex={checkboxTabIndex}
                label="Discord"
                name="discord"
              />
              <LabelCheckboxGroup
                tabIndex={checkboxTabIndex}
                label="Telegram"
                name="telegram"
              />
              <LabelCheckboxGroup
                tabIndex={checkboxTabIndex}
                label="Website"
                name="website"
              />
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 z-50">
          <ActionBar open={isDirty}>
            <ActionBarContent
              scheme="success"
              anchorClassName="left-0 right-0 -mb-8"
              shadow
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <ActionBarIcon />
              <ActionBarBody>
                <ActionBarTitle>
                  Do you want to save these changes?
                </ActionBarTitle>
              </ActionBarBody>
              <ActionBarActionGroup>
                <ActionBarCancelButton onClick={resetSetting}>
                  Reset
                </ActionBarCancelButton>
                <ActionBarConfirmButton onClick={handleSubmit(onSubmit)}>
                  Save changes
                </ActionBarConfirmButton>
              </ActionBarActionGroup>
            </ActionBarContent>
          </ActionBar>
        </div>
      </div>
    </FormProvider>
  )
}