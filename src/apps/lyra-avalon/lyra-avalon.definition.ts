import { Register } from '~app-toolkit/decorators';
import { appDefinition, AppDefinition } from '~app/app.definition';
import { AppAction, AppTag, GroupType } from '~app/app.interface';
import { Network } from '~types/network.interface';

export const LYRA_AVALON_DEFINITION = appDefinition({
  id: 'lyra-avalon',
  name: 'Lyra Avalon',
  description:
    'Lyra is an options trading protocol accessing the scalability of Layer 2 Ethereum to provide a robust, lightning-fast and reliable trading experience.',
  url: 'https://avalon.app.lyra.finance/',

  groups: {
    options: {
      id: 'options',
      type: GroupType.POSITION,
      label: 'Options',
    },
    pool: {
      id: 'pool',
      type: GroupType.TOKEN,
      label: 'Liquidity Pool',
    },
  },

  tags: [AppTag.OPTIONS],
  keywords: [],
  links: {},

  supportedNetworks: {
    [Network.OPTIMISM_MAINNET]: [AppAction.VIEW],
  },

  primaryColor: '#fff',
});

@Register.AppDefinition(LYRA_AVALON_DEFINITION.id)
export class LyraAvalonAppDefinition extends AppDefinition {
  constructor() {
    super(LYRA_AVALON_DEFINITION);
  }
}

export default LYRA_AVALON_DEFINITION;
