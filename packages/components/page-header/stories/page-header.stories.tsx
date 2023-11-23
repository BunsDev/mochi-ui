import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@consolelabs/select'
import { Tooltip } from '@consolelabs/tooltip'
import { useState } from 'react'
import { IconCheck, IconThreeDots } from '@consolelabs/icons'
import { IconButton } from '@consolelabs/icon-button'
import { Button } from '@consolelabs/button'
import clsx from 'clsx'
import { PageHeader } from '../src'

const meta = {
  title: 'components/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  args: {
    modal: true,
  },
}

export default meta

export function Default() {
  const [selectedApp, setSelectedApp] = useState('all')

  const actions = [
    <Button variant="outline" color="neutral" className="!bg-neutral-0">
      See docs
    </Button>,
    <Select value={selectedApp} onChange={setSelectedApp}>
      <SelectTrigger className="rounded bg-neutral-150">
        <Tooltip content="Selected app" arrow="top-center" className="z-20">
          <SelectValue placeholder="All apps" />
        </Tooltip>
      </SelectTrigger>
      <SelectContent>
        {[
          { key: 'all', name: 'All apps' },
          { key: '1', name: 'App name 1' },
          { key: '2', name: 'App name 2' },
        ].map((app) => (
          <SelectItem
            key={app.key}
            value={app.key}
            rightIcon={
              <IconCheck
                className={clsx(
                  'w-4 h-4 ml-4',
                  app.key === selectedApp ? 'text-primary-700' : 'invisible',
                )}
              />
            }
          >
            {app.name}
          </SelectItem>
        ))}
        <SelectSeparator />
        <button className="px-2 text-sm font-medium tracking-tight text-primary-700">
          Create an app
        </button>
      </SelectContent>
    </Select>,
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <PageHeader
        title="Page Title"
        titleExtra="(2,951 members)"
        description="Lorem ipsum dolor sit amet consectetur. Sed turpis eget sed nullam volutpat integer posuere."
      />

      <PageHeader
        title="Page Title"
        description="Lorem ipsum dolor sit amet consectetur. Sed turpis eget sed nullam volutpat integer posuere."
        actions={actions}
      />

      <PageHeader
        backHref="#"
        title="Page Title"
        titleExtra="(2,951 members)"
        description="Lorem ipsum dolor sit amet consectetur. Sed turpis eget sed nullam volutpat integer posuere."
        actions={actions}
      />

      <PageHeader
        onBack={() => alert('onBack')}
        title="Page Title"
        titleExtra="(2,951 members)"
        description="Lorem ipsum dolor sit amet consectetur. Sed turpis eget sed nullam volutpat integer posuere."
        actions={[
          <IconButton variant="link" color="info">
            <IconThreeDots className="text-2xl" />
          </IconButton>,
        ]}
      />
    </div>
  )
}