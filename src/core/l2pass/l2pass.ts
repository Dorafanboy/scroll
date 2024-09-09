import {
    createPublicClient,
    createWalletClient,
    formatUnits,
    http,
    PrivateKeyAccount,
    SimulateContractReturnType,
    WalletClient,
} from 'viem';
import { Config } from '../../config';
import { printError, printInfo, printSuccess } from '../../data/logger/logPrinter';
import { l2passABI } from '../../abis/l2pass/l2pass';
import { l2PassModuleName, mintData, scrollContractAddress } from './l2passConfig';
import { getBridgeBalance } from '../../data/utils/utils';
import { addTextMessage } from '../../data/telegram/telegramBot';
import { scroll } from 'viem/chains';

export async function l2passMint(account: PrivateKeyAccount) {
    printInfo(`Выполняю модуль ${l2PassModuleName}`);

    const client = createPublicClient({
        chain: scroll,
        transport: Config.rpc == null ? http() : http(Config.rpc),
    });

    printInfo(`Пытаюсь заминтить нфт в сети Scroll`);

    const balance = await getBridgeBalance(client, account.address);

    const mintFee = await client.readContract({
        address: scrollContractAddress,
        abi: l2passABI,
        functionName: 'mintPrice',
    });

    if (balance < mintFee) {
        printInfo(`Баланс - ${formatUnits(balance, 18)} ETH, необходимо - ${formatUnits(mintFee, 18)} ETH`);
        return false;
    }

    if (mintFee !== undefined) {
        printInfo(
            `Произвожу минт нфт в сети ${scroll.name} по стоимости ${formatUnits(mintFee, 18)} ${
                scroll.nativeCurrency.symbol
            }\n`,
        );
    }

    const walletClient: WalletClient = createWalletClient({
        chain: scroll,
        transport: Config.rpc == null ? http() : http(Config.rpc),
    });

    const { request } = await client
        .simulateContract({
            address: scrollContractAddress,
            abi: l2passABI,
            functionName: 'mint',
            args: [mintData],
            account: account,
            value: mintFee,
        })
        .then((result) => result as SimulateContractReturnType)
        .catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля ${l2PassModuleName} - ${e}`);
            return { request: undefined };
        });

    if (request !== undefined) {
        const hash = await walletClient.writeContract(request).catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля ${l2PassModuleName} - ${e}`);
            return false;
        });

        if (hash == false) {
            return false;
        }

        const url = `${scroll.blockExplorers?.default.url + '/tx/' + hash}`;

        printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);

        await addTextMessage(
            `✅L2Pass: mint NFT Scroll for ${formatUnits(mintFee, 18)} ${
                scroll.nativeCurrency.symbol
            } <a href='${url}'>link</a>`,
        );

        return true;
    }

    return false;
}
