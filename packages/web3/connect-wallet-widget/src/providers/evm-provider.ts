// @ts-ignore
import hexer from 'browser-string-hexer'
import { createStore } from 'mipd'
import { utils } from 'ethers'
import isMobile from 'is-mobile'
import {
  msg,
  ChainProvider,
  TransferInput,
  WriteInput,
  ReadInput,
} from './provider'

const eip6963Store = typeof window !== 'undefined' ? createStore() : null

const TRANSFER_FRAGMENT = 'function transfer(address to, uint amount)'

export class ProviderEVM extends ChainProvider {
  public platform = 'evm-chain'

  sync(dispatch: any) {
    const provider = eip6963Store?.findProvider({ rdns: this.id })?.provider
    if (provider && !this.provider) {
      this.provider = provider

      provider.request({ method: 'eth_chainId' }).then((chainId) => {
        this.chainId = chainId
      })

      // register event handler
      provider.on('accountsChanged', (accounts) => {
        dispatch?.({
          type: 'update_wallets',
          payload: {
            addresses: accounts,
            chain: this.platform,
            provider,
          },
        })
      })

      provider.on('chainChanged', (chainId) => {
        this.chainId = chainId
        dispatch?.({
          type: 'refresh',
        })
      })
    }
    return Object.assign(this)
  }

  async read(i: ReadInput) {
    try {
      const { abi, to, from, args = [], method } = i
      const iface = new utils.Interface(abi)
      const data = iface.encodeFunctionData(method, args)

      if (isMobile() && this.session.topic && this.signClient) {
        const resultData: string = await this.signClient.request({
          topic: this.session.topic,
          chainId: `eip155:${(+this.chainId).toString(10)}`,
          request: {
            method: 'eth_call',
            params: [{ from, to, data }, 'latest'],
          },
        })
        return iface.decodeFunctionResult(method, resultData)
      }

      const resultData: string = await this.provider.request({
        method: 'eth_call',
        params: [
          {
            from,
            to,
            data,
          },
          'latest',
        ],
      })

      return iface.decodeFunctionResult(method, resultData)
    } catch (e) {
      console.error('evm-provider:read', e)
      return null
    }
  }

  async write(i: WriteInput) {
    try {
      const { abi, to, from, args = [], method } = i
      const iface = new utils.Interface(abi)
      const data = iface.encodeFunctionData(method, args)

      if (isMobile() && this.session.topic && this.signClient) {
        return await this.signClient.request({
          topic: this.session.topic,
          chainId: `eip155:${(+this.chainId).toString(10)}`,
          request: {
            method: 'eth_sendTransaction',
            params: [{ from, to, data }],
          },
        })
      }

      return this.provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from,
            to,
            data,
          },
        ],
      })
    } catch (e) {
      console.error('evm-provider:write', e)
      return null
    }
  }

  async transfer(input: TransferInput) {
    if (isMobile() && (!this.session || !this.signClient)) return null

    try {
      const { from, to, chainId, amount, tokenAddress } = input

      // case native token
      if (!tokenAddress) {
        const params = {
          from,
          to,
          value: (+amount).toString(16),
        }
        if (isMobile() && this.session.topic && this.signClient) {
          return await this.signClient.request({
            topic: this.session.topic,
            chainId: `eip155:${(+chainId).toString(10)}`,
            request: {
              method: 'eth_sendTransaction',
              params: [params],
            },
          })
        }
        return this.provider.request({
          method: 'eth_sendTransaction',
          params: [params],
        })
      }

      const iface = new utils.Interface(TRANSFER_FRAGMENT)
      // case custom coin
      const params = {
        from,
        to: tokenAddress,
        data: iface.encodeFunctionData('transfer', [to, amount]),
      }

      if (isMobile() && this.session.topic && this.signClient) {
        return await this.signClient.request({
          topic: this.session.topic,
          chainId: `eip155:${(+chainId).toString(10)}`,
          request: {
            method: 'eth_sendTransaction',
            params: [params],
          },
        })
      }

      return this.provider.request({
        method: 'eth_sendTransaction',
        params: [params],
      })
    } catch (e) {
      console.error('evm-provider:transfer', e)
      return null
    }
  }

  async connect() {
    try {
      const hexedMsg = hexer(msg)

      if (isMobile()) {
        return await this.connectMobile()
      }

      if (['app.phantom'].every((id) => id !== this.id)) {
        await this.provider.request({
          method: 'wallet_requestPermissions',
          params: [
            {
              eth_accounts: {},
            },
          ],
        })
      }

      const accounts = await this.provider.request({
        method: 'eth_requestAccounts',
      })

      const sig = await this.provider.request({
        method: 'personal_sign',
        params: [hexedMsg, accounts[0]],
      })

      return {
        addresses: accounts,
        signature: sig,
        platform: this.platform,
      }
    } catch (e) {
      console.error('evm-provider:connect', e)
      return null
    }
  }

  async connectMobile() {
    try {
      await this.initSignClient()
      const hexedMsg = hexer(msg)

      if (!this.signClient) throw new Error('Cannot init/find signClient')

      const chainIds = [
        '1',
        // , '56', '42161', '137', '10', '8453'
      ]

      const { uri, approval } = await this.signClient.connect({
        requiredNamespaces: {
          eip155: {
            methods: ['eth_sendTransaction', 'personal_sign'],
            chains: chainIds.map((cid) => `eip155:${(+cid).toString(10)}`),
            events: ['chainChanged', 'accountsChanged'],
          },
        },
      })

      if (!uri || !this.mobileProtocol)
        throw new Error(`uri/mobile protocol not found - ${this.name}`)

      const href = `${this.mobileProtocol}wc?uri=${encodeURIComponent(uri)}`
      window.open(href, '_self', 'noreferrer noopener')

      const session = await approval()
      this.session = session
      const accounts = session.namespaces.eip155.accounts
        .map((a) => a.split(':').pop() ?? '')
        .filter(Boolean)

      const sig = (await this.signClient.request({
        topic: this.session.topic,
        chainId: 'eip155:1',
        request: {
          method: 'personal_sign',
          params: [hexedMsg, accounts[0]],
        },
      })) as string

      return {
        addresses: accounts,
        signature: sig,
        platform: this.platform,
      }
    } catch (e) {
      console.error('evm-provider:connectMobile', e)
      return null
    }
  }

  async isInstalled() {
    const provider = eip6963Store?.findProvider({ rdns: this.id })?.provider
    return !!provider && provider === this.provider
  }
}
