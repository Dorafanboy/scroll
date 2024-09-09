import { printError, printInfo } from '../../data/logger/logPrinter';
import { IBridgeFunction } from '../../data/utils/interfaces';
import { owlToBridge } from './owlTo/owlTo';
import { BridgeConfig, Config, NitroBridge, OwlToBridge } from '../../config';
import { nitroBridge } from './nitro/nitro';
import { createPublicClient, http, parseUnits, PrivateKeyAccount } from 'viem';
import { getBridgeBalance } from '../../data/utils/utils';
import { scroll } from 'viem/chains';

const bridgeFunction: { [key: string]: IBridgeFunction } = {
    'OwlTo Bridge': {
        func: owlToBridge,
        isUse: OwlToBridge.isUse,
    },
    'Nitro Bridge': {
        func: nitroBridge,
        isUse: NitroBridge.isUse,
    },
};

const bridgeFilteredFunctions = Object.keys(bridgeFunction)
    .filter((key) => bridgeFunction[key].isUse)
    .map((key) => bridgeFunction[key].func);

export async function prepareBridge(account: PrivateKeyAccount) {
    if (bridgeFilteredFunctions.length == 0) {
        printError(`Не включен ни один бридж для использования.`);
        return true;
    }

    printInfo(`Включен режим бриджа.`);

    const client = createPublicClient({
        chain: scroll,
        transport: Config.rpc == null ? http() : http(Config.rpc),
    });

    const balance = await getBridgeBalance(client, account.address);

    if (balance < parseUnits(BridgeConfig.minBridge.toString(), 18)) {
        printInfo(`Баланс меньше, указанного в конфиге, буду выбирать мост.`);
        const randomBridge = bridgeFilteredFunctions[Math.floor(Math.random() * bridgeFilteredFunctions.length)];

        await randomBridge(account);
        return true;
    } else {
        printInfo(`Баланса достаточно, не буду выполнять бридж`);
        return false;
    }
}
