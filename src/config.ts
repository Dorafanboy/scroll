import {
    IBridgeConfigData,
    IBridgeRange,
    IDelayRange,
    IFixedRange,
    IOkx,
    IOwlToConfigData,
    IToken,
} from './data/utils/interfaces';
import { arbitrum, base, linea, optimism, zkSync } from 'viem/chains';

export class TelegramData {
    public static readonly telegramBotId: string = ''; // айди телеграм бота, которому будут отправляться логи
    public static readonly telegramId: string = ''; // телеграм айди @my_id_bot у него можно получить id
}

export class Config {
    public static readonly isShuffleWallets: boolean = true; // перемешивать ли строки в текстовом файле для приватных ключей
    public static readonly modulesCount: IBridgeRange = { minRange: 3, maxRange: 8 }; // сколько будет модулей выполнено на аккаунте
    public static readonly retryCount: number = 15; // сколько попыток будет, чтобы получить новую сеть, значение для бриджа
    public static readonly delayBetweenAction: IDelayRange = { minRange: 2.2, maxRange: 4 }; // задержка между действиями (в секундах) в случае ошибки
    public static readonly delayBetweenAccounts: IDelayRange = { minRange: 37, maxRange: 45 }; // задержка между аккаунтами (в минутах)
    public static readonly delayBetweenModules: IDelayRange = { minRange: 1.4, maxRange: 2.5 }; // задержка между модулями (в минутах)
    public static readonly rpc = 'https://rpc.ankr.com/scroll';
}

export class OkxData {
    public static readonly isUse: boolean = true; // использовать ли Okx в софте
    public static readonly bridgeData: IOkx[] = [
        {
            okxFee: '0.00004',
            chainName: 'ETH-Base',
            networkName: 'Base',
            tokenName: 'ETH',
            withdraw: { minRange: 0.006, maxRange: 0.009 },
            randomFixed: { minRange: 3, maxRange: 5 },
            withdrawStart: '0.5',
        },
        {
            okxFee: '0.0001',
            chainName: 'ETH-Arbitrum One',
            networkName: 'Arbitrum One',
            tokenName: 'ETH',
            withdraw: { minRange: 0.006, maxRange: 0.009 },
            randomFixed: { minRange: 3, maxRange: 5 },
            withdrawStart: '0.5',
        },
        {
            okxFee: '0.00004',
            chainName: 'ETH-Optimism',
            networkName: 'Optimism',
            tokenName: 'ETH',
            withdraw: { minRange: 0.006, maxRange: 0.009 },
            randomFixed: { minRange: 3, maxRange: 5 },
            withdrawStart: '0.5',
        },
        {
            okxFee: '0.000041',
            chainName: 'ETH-zkSync Era',
            networkName: 'zkSync Era',
            tokenName: 'ETH',
            withdraw: { minRange: 0.006, maxRange: 0.009 },
            randomFixed: { minRange: 3, maxRange: 5 },
            withdrawStart: '0.5',
        },
    ];

    public static readonly isRandomWithdraw: boolean = true;
    public static readonly delayAfterWithdraw: IBridgeRange = { minRange: 4, maxRange: 8 }; // сколько ожидать времени (в минутах) после вывода с окекса
}

export class OkxAuth {
    public static readonly okxApiKey: string = ''; // ясно что это
    public static readonly okxApiSecret: string = ''; // ясно что это
    public static readonly okxApiPassword: string = ''; // ясно что это из env подтягивтаь потом
}

export const tokensPool: IToken[] = [
    {
        name: 'wETH',
        contractAddress: '0x5300000000000000000000000000000000000004',
        decimals: 18,
    },
    {
        name: 'USDT',
        contractAddress: '0xf55bec9cafdbe8730f096aa55dad6d22d44099df',
        decimals: 6,
    },
    {
        name: 'USDC',
        contractAddress: '0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4',
        decimals: 6,
    },
    {
        name: 'DAI',
        contractAddress: '0xca77eb3fefe3725dc33bccb54edefc3d9f764f97',
        decimals: 18,
    },
];

export class BridgeConfig {
    public static readonly isUse: boolean = true; // нужно ли бриджить вообще в scroll
    public static readonly minBridge: number = 0.0004; // если баланс меньше этой суммы, то будет бридж
    public static readonly ethBridgeAmount: { range: IBridgeRange; fixed: IFixedRange } = {
        range: { minRange: 0.006, maxRange: 0.009 },
        fixed: { minRange: 4, maxRange: 6 },
    }; // сколько ETH будет отправлено через бридж, fixed - количество символов после запятой, т.е если выпадет рандомное количество range = 0.00001552254241 fixed будет 7
    // то будет отправлено 0.0000155
    public static readonly data: IBridgeConfigData[] = [
        {
            chain: arbitrum,
            rpc: null,
        },
        {
            chain: optimism,
            rpc: 'https://optimism.meowrpc.com',
        },
        {
            chain: base,
            rpc: null,
        },
        {
            chain: linea,
            rpc: null,
        },
        {
            chain: zkSync,
            rpc: 'https://rpc.ankr.com/zksync_era',
        },
    ];
}

export class OwlToBridge {
    public static readonly isUse: boolean = true; // нужно ли использовать owlToBridge
    public static readonly data: IOwlToConfigData[] = [
        {
            chainName: 'Arbitrum One',
            owlToDataChainName: 'ArbitrumOneMainnet',
        },
        {
            chainName: 'OP Mainnet',
            owlToDataChainName: 'OptimismMainnet',
        },
        {
            chainName: 'Base',
            owlToDataChainName: 'BaseMainnet',
        },
        {
            chainName: 'Linea Mainnet',
            owlToDataChainName: 'LineaMainnet',
        },
        {
            chainName: 'zkSync Era',
            owlToDataChainName: 'ZksyncMainnet',
        },
    ];
}

export class NitroBridge {
    public static readonly isUse: boolean = true; // нужно ли использовать nitro bridge
}

export class SushiConfig {
    public static readonly isUse: boolean = true; // использовать ли sushi swap
    public static readonly ethSwapRange: { range: IBridgeRange; fixed: IFixedRange } = {
        range: { minRange: 0.002, maxRange: 0.005 },
        fixed: { minRange: 3, maxRange: 5 },
    }; // сколько usdc/usdt будет забриджено(будет поиск баланса в usdt и usdc
    public static readonly stableSwapRange: { range: IBridgeRange; fixed: IFixedRange } = {
        range: { minRange: 0.6, maxRange: 1.2 },
        fixed: { minRange: 2, maxRange: 5 },
    }; // сколько usdc/usdt будет забриджено(будет поиск баланса в usdt и usdc
}

export class SyncSwapConfig {
    public static readonly isUse: boolean = true; // использовать ли sync swap
    public static readonly ethSwapRange: { range: IBridgeRange; fixed: IFixedRange } = {
        range: { minRange: 0.002, maxRange: 0.005 },
        fixed: { minRange: 3, maxRange: 5 },
    }; // сколько usdc/usdt будет забриджено(будет поиск баланса в usdt и usdc
    public static readonly stableSwapRange: { range: IBridgeRange; fixed: IFixedRange } = {
        range: { minRange: 0.6, maxRange: 1.2 },
        fixed: { minRange: 2, maxRange: 5 },
    }; // сколько usdc/usdt будет забриджено(будет поиск баланса в usdt и usdc
}

export class Dmail {
    public static readonly isUse: boolean = true;
    public static readonly wordsCount: number[] = [2, 5]; // количество слов в сообщении
}

export class ZkStars {
    public static readonly isUse: boolean = true;
    public static readonly contracts: string[] = [
        '0x000000a679c2fb345ddefbae3c42bee92c0fb7a5',
        '0xEd8b6576AC0d3EAb09f2C2fed3f4A5D4c7b6D868',
        '0x739815d56A5FFc21950271199D2cf9E23B944F1c',
        '0xb1b1ac053248a2C88e32140e4691d2A8Be6Ab9c9',
    ]; // контракты для минта
}

export class Nfts2Me {
    public static readonly isUse: boolean = true;
    public static readonly contracts: string[] = ['0x3ea1C01BAB9a047d0aDC3f2eB2F426AEd7Eee5Fc']; // контракты для минта
    public static readonly nftCount: IDelayRange = { minRange: 1, maxRange: 2 }; // количество минтоф;
}

export class LayerBank {
    public static readonly isUse: boolean = false;
    public static readonly circlesCount: IDelayRange = { minRange: 1, maxRange: 2 }; // кругов supply/borrow, добавить рандомные функции еще вызовы
}

export class L2Pass {
    public static readonly isUse: boolean = true;
}

export class RubyScore {
    public static readonly isUse: boolean = true;
}
