//  DISPLAY PROPS
export type TranslationDisplayItem = {
  type: 'translation';
  value: string;
};

export type StringDisplayItem = {
  type: 'string';
  value: string;
};

export type NumberDisplayItem = {
  type: 'number';
  value: number;
};

export type DollarDisplayItem = {
  type: 'dollar';
  value: number;
};

export type PercentageDisplayItem = {
  type: 'pct';
  value: number;
};

export type StatsItem = {
  label: string | TranslationDisplayItem;
  value:
    | string // @TODO Remove
    | number // @TODO Remove
    | StringDisplayItem
    | NumberDisplayItem
    | TranslationDisplayItem
    | DollarDisplayItem
    | PercentageDisplayItem;
};

export enum BalanceDisplayMode {
  DEFAULT = 'default',
  UNDERLYING = 'underlying',
}

export interface DisplayProps {
  label: string;
  secondaryLabel?: string | number | DollarDisplayItem | PercentageDisplayItem;
  tertiaryLabel?: string | number | DollarDisplayItem | PercentageDisplayItem;
  images: string[];
  appName?: string;
  statsItems?: StatsItem[];
  balanceDisplayMode?: BalanceDisplayMode;
}

//  DATA PROPS
export type DefaultDataProps = Record<string, unknown>;

//  METATYPES
export enum MetaType {
  WALLET = 'wallet',
  SUPPLIED = 'supplied',
  BORROWED = 'borrowed',
  CLAIMABLE = 'claimable',
  VESTING = 'vesting',
  LOCKED = 'locked',
  NFT = 'nft',
}

export type WithMetaType<T> = T & {
  metaType?: MetaType;
};