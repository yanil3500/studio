import { Inject } from '@nestjs/common';

import { drillBalance } from '~app-toolkit';
import { IAppToolkit, APP_TOOLKIT } from '~app-toolkit/app-toolkit.interface';
import { Register } from '~app-toolkit/decorators';
import { presentBalanceFetcherResponse } from '~app-toolkit/helpers/presentation/balance-fetcher-response.present';
import { BalanceFetcher } from '~balance/balance-fetcher.interface';
import { ContractPosition } from '~position/position.interface';
import { isSupplied } from '~position/position.utils';
import { Network } from '~types/network.interface';

import { LyraAvalonContractFactory, OptionToken } from '../contracts';
import { LYRA_AVALON_DEFINITION } from '../lyra-avalon.definition';

import { OPTION_TYPES } from './helpers/consts';
import { LyraAvalonOptionContractPositionDataProps } from './lyra-avalon.options.contract-position-fetcher';

const appId = LYRA_AVALON_DEFINITION.id;
const network = Network.OPTIMISM_MAINNET;

@Register.BalanceFetcher(LYRA_AVALON_DEFINITION.id, network)
export class OptimismLyraAvalonBalanceFetcher implements BalanceFetcher {
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(LyraAvalonContractFactory) private readonly contractFactory: LyraAvalonContractFactory,
  ) {}

  async getPoolBalances(address: string) {
    return await this.appToolkit.helpers.tokenBalanceHelper.getTokenBalances({
      address,
      appId,
      groupId: LYRA_AVALON_DEFINITION.groups.pool.id,
      network,
    });
  }

  async getOptionsBalances(address: string) {
    const markets: Record<string, OptionToken.OptionPositionStructOutput[]> = {};
    const multicall = this.appToolkit.getMulticall(network);

    return this.appToolkit.helpers.contractPositionBalanceHelper.getContractPositionBalances({
      address,
      appId,
      groupId: LYRA_AVALON_DEFINITION.groups.options.id,
      network,
      resolveBalances: async ({
        contractPosition,
      }: {
        contractPosition: ContractPosition<LyraAvalonOptionContractPositionDataProps>;
      }) => {
        // Extract information from contract position
        const { strikeId, optionType, marketAddress, quoteAddress, tokenAddress, callPrice, putPrice } =
          contractPosition.dataProps;
        const collateralToken = contractPosition.tokens.find(isSupplied)!;
        const quoteToken = contractPosition.tokens.find(token => token.address === quoteAddress)!;

        // Pull user positions for the relevant market
        if (!markets[marketAddress]) {
          const contract = this.contractFactory.optionToken({ address: tokenAddress, network });
          markets[marketAddress] = await multicall.wrap(contract).getOwnerPositions(address);
        }

        // Find matching user position for contract position
        const userPosition = markets[marketAddress].find(
          position => Number(position.strikeId) === strikeId && position.optionType === optionType,
        );
        if (!userPosition) return [];

        // Determine price of the contract position strike.
        // Note: may not be totally accurate
        const price = OPTION_TYPES[optionType].includes('Call') ? callPrice : putPrice;
        const balance = ((Number(price) * Number(userPosition.amount)) / 10 ** quoteToken.decimals).toString();

        if (Number(optionType) >= 2) {
          // Short Option
          const debt = drillBalance(quoteToken, balance, { isDebt: true });
          const collateral = drillBalance(collateralToken, userPosition.collateral.toString());
          return [debt, collateral];
        }
        // Long Option
        return [drillBalance(quoteToken, balance)];
      },
    });
  }

  async getBalances(address: string) {
    const [tokenBalances, optionsBalances] = await Promise.all([
      this.getPoolBalances(address),
      this.getOptionsBalances(address),
    ]);

    return presentBalanceFetcherResponse([
      {
        label: 'Pools',
        assets: tokenBalances,
      },
      {
        label: 'Options',
        assets: optionsBalances,
      },
    ]);
  }
}
