import { Chain, Hex, PrivateKeyAccount, PublicClient } from 'viem';

export interface IBridgeRange {
    readonly minRange: number;
    readonly maxRange: number;
}

export interface IFixedRange extends IBridgeRange {}

export interface IDelayRange extends IBridgeRange {}

export interface IBridgeFunction {
    readonly func: (account: PrivateKeyAccount) => Promise<boolean>;
    readonly isUse: boolean;
}

export interface IModuleFunction extends Pick<IBridgeFunction, 'isUse'> {
    readonly func: (account: PrivateKeyAccount, isEth: boolean) => Promise<boolean>;
    readonly words?: string[];
}

export interface IDmailData {
    readonly to: string;
    readonly amount: string;
}

export type TokenName = 'USDT' | 'USDC' | 'USDC.e' | 'USDbC' | 'wETH' | 'DAI';

export interface IToken {
    readonly name: TokenName;
    readonly contractAddress: Hex;
    readonly decimals: number;
}

export interface ISwapData {
    readonly value: bigint;
    readonly srcToken: IToken | null;
    readonly dstToken: IToken | null;
}

export interface IStageData {
    readonly moduleName: string;
    readonly spenderContractAddress: Hex;
    readonly ethValue: { range: IBridgeRange; fixed: IFixedRange };
    readonly stableValue: { range: IBridgeRange; fixed: IFixedRange };
}

export interface IPreparedStageData {
    readonly client: PublicClient;
    readonly swapData: ISwapData | null;
}

export interface ISushiDataDto {
    readonly amountOutMin: bigint;
    readonly route: Hex;
}

export interface IInchData {
    readonly chainId: number;
    readonly srcToken: Hex;
    readonly dstToken: Hex;
    readonly amount: bigint;
    readonly fromAddress: Hex;
}

export interface IBridgeConfigData {
    readonly chain: Chain;
    readonly rpc: string | null;
}

export interface IBridgeValueData extends IBridgeConfigData {
    readonly value: bigint;
}

export interface IOwlToBridgeData {
    readonly from: string | undefined;
    readonly to: string;
    readonly amount: string;
    readonly token: string;
}

export interface IOwlToConfigData {
    readonly chainName: string;
    readonly owlToDataChainName: string;
}

export interface IOwlToDataDto {
    readonly client: PublicClient;
    readonly data: IBridgeValueData;
    readonly value: bigint;
}

export interface INitroQuoteRequestData {
    readonly fromTokenAddress: string;
    readonly toTokenAddress: string;
    readonly amount: string;
    readonly fromTokenChainId: string;
    readonly toTokenChainId: string;
    readonly partnerId: string;
    readonly slippageTolerance: string;
    readonly destFuel: string;
}

export interface INitroQuoteResponseData {}

export interface INitroAsset {
    readonly decimals: number;
    readonly symbol: string;
    readonly name: string;
    readonly chainId: string;
    readonly address: string;
    readonly resourceID: string;
    readonly isMintable: boolean;
    readonly isWrappedAsset: boolean;
}

export interface INitroSourceOrDestination {
    readonly chainId: string;
    readonly chainType: string;
    readonly asset: INitroAsset;
    readonly stableReserveAsset: INitroAsset;
    readonly tokenAmount: string;
    readonly stableReserveAmount: string;
    readonly path: [];
    readonly flags: [];
    readonly priceImpact: string;
    readonly tokenPath: string;
    readonly dataTx: [];
}

export interface INitroBridgeFee {
    readonly amount: string;
    readonly decimals: number;
    readonly symbol: string;
}

export interface INitroQuoteResponseData {
    readonly flowType: string;
    readonly isTransfer: boolean;
    readonly isWrappedToken: boolean;
    readonly allowanceTo: string;
    readonly bridgeFee: INitroBridgeFee;
    readonly fromTokenAddress: string;
    readonly toTokenAddress: string;
    readonly source: INitroSourceOrDestination;
    readonly destination: INitroSourceOrDestination;
    readonly partnerId: number;
    readonly fuelTransfer: null;
    readonly slippageTolerance: string;
    readonly estimatedTime: number;
}

export interface INitroTransactionRequestData extends INitroQuoteResponseData {
    readonly senderAddress: string;
    readonly receiverAddress: string;
}

export interface INitroTransactionResponseData {
    readonly data: Hex;
    readonly to: Hex;
    readonly value: string;
}

export interface IOkx {
    readonly okxFee: string;
    readonly chainName: string;
    readonly networkName: string;
    readonly tokenName: string;
    readonly withdraw: IBridgeRange;
    readonly randomFixed: IFixedRange;
    readonly withdrawStart: string;
}
