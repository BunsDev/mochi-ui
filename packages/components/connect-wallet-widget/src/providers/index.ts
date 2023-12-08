/* istanbul ignore file */
import {
  ArgentWallet,
  BackpackWallet,
  Coin98Wallet,
  CoinbaseWallet,
  LedgerWallet,
  MartianWallet,
  MetamaskWallet,
  OkxWallet,
  PhantomWallet,
  RabbyWallet,
  RainbowWallet,
  RoninWallet,
  SafepalWallet,
  SuietWallet,
  Ton,
  TonKeeperWallet,
  TrustWallet,
  UniswapWallet,
} from '@mochi-ui/icons'
import { ProviderEVM } from './evm-provider'
import { ChainProvider, msg } from './provider'
import { ProviderSOL } from './sol-provider'
import { ProviderDisabled } from './disabled-provider'

export type ConnectorName = 'EVM' | 'RON' | 'SOL' | 'SUI' | 'TON'
export type Connectors = Record<ConnectorName, ChainProvider[]>
export { ChainProvider, msg }

export default function getProviders(dispatch: any) {
  const connectors: Connectors = {
    EVM: [
      new ProviderEVM()
        .setId('io.metamask')
        .setName('MetaMask')
        .setIcon(MetamaskWallet)
        .sync(dispatch),
      new ProviderEVM()
        .setId('io.rabby')
        .setName('Rabby')
        .setIcon(RabbyWallet)
        .sync(dispatch),
      new ProviderEVM()
        .setId('me.rainbow')
        .setName('Rainbow')
        .setIcon(RainbowWallet)
        .sync(dispatch),
      new ProviderEVM()
        .setName('Uniswap')
        .setIcon(UniswapWallet)
        .sync(dispatch),
      new ProviderEVM()
        .setId('com.coinbase.wallet')
        .setName('Coinbase')
        .setIcon(CoinbaseWallet)
        .sync(dispatch),
      new ProviderEVM()
        .setId('com.okex.wallet')
        .setName('Okx')
        .setIcon(OkxWallet)
        .sync(dispatch),
      new ProviderEVM().setName('Coin98').setIcon(Coin98Wallet).sync(dispatch),
      new ProviderEVM()
        .setName('Trustwallet')
        .setIcon(TrustWallet)
        .sync(dispatch),
      new ProviderEVM().setName('Argent').setIcon(ArgentWallet).sync(dispatch),
      new ProviderEVM()
        .setName('Safepal')
        .setIcon(SafepalWallet)
        .sync(dispatch),
      new ProviderEVM()
        .setId('app.phantom')
        .setName('Phantom')
        .setIcon(PhantomWallet)
        .sync(dispatch),
      new ProviderEVM().setName('Ledger').setIcon(LedgerWallet).sync(dispatch),
    ],
    RON: [
      // ronin chain operates in the same manner as evm
      new ProviderEVM()
        .setId('com.roninchain.wallet')
        .setName('Ronin')
        .setIcon(RoninWallet)
        .sync(dispatch),
    ],
    SOL: [
      new ProviderSOL()
        .setId('phantom.solana')
        .setName('Phantom')
        .setIcon(PhantomWallet)
        .sync(),
      new ProviderSOL()
        .setId('backpack')
        .setName('Backpack')
        .setIcon(BackpackWallet)
        .sync(),
      new ProviderSOL().setName('Okx').setIcon(OkxWallet).sync(),
      new ProviderSOL().setName('Coin98').setIcon(Coin98Wallet).sync(),
      new ProviderSOL().setName('Trustwallet').setIcon(TrustWallet).sync(),
    ],
    SUI: [
      new ProviderDisabled().setName('Suiet').setIcon(SuietWallet).sync(),
      new ProviderDisabled().setName('Okx').setIcon(OkxWallet).sync(),
      new ProviderDisabled().setName('Coin98').setIcon(Coin98Wallet).sync(),
      new ProviderDisabled()
        .setId('martian.sui')
        .setName('Martian')
        .setIcon(MartianWallet)
        .sync(),
    ],
    TON: [
      new ProviderDisabled().setName('TON').setIcon(Ton).sync(),
      new ProviderDisabled()
        .setName('Tonkeeper')
        .setIcon(TonKeeperWallet)
        .sync(),
      new ProviderDisabled().setName('Trustwallet').setIcon(TrustWallet).sync(),
      new ProviderDisabled().setName('Safepal').setIcon(SafepalWallet).sync(),
    ],
  }

  return connectors
}