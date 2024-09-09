import {
    createPublicClient,
    createWalletClient,
    formatUnits,
    http,
    PrivateKeyAccount,
    SimulateContractReturnType,
} from 'viem';
import { getSwapBalance, prepareStage } from '../../../data/utils/utils';
import { layerBankContractAddress, layerBankModuleName, layerBankTokens } from './layerBankData';
import { printError, printInfo, printSuccess } from '../../../data/logger/logPrinter';
import { scroll } from 'viem/chains';
import { Config, LayerBank } from '../../../config';
import { addTextMessage } from '../../../data/telegram/telegramBot';
import { layerBankABI } from '../../../abis/layerBank';
import { delay } from '../../../data/helpers/delayer';

export async function layerBankSupply(account: PrivateKeyAccount, isEth: boolean) {
    const circlesCount = Math.floor(
        Math.random() * (LayerBank.circlesCount.maxRange - LayerBank.circlesCount.minRange) +
            LayerBank.circlesCount.minRange,
    );

    printInfo(`Буду выполнять ${circlesCount} кругов supply/borrow`);

    for (let i = circlesCount; i > 0; ) {
        const prepareStageData = await prepareStage(layerBankModuleName, isEth, account);

        if (prepareStageData.swapData?.value == BigInt(-1)) {
            printError(`Не удалось произвести supply ${layerBankModuleName}`);
            return false;
        }

        const contractAddress = layerBankTokens.get(prepareStageData!.swapData!.srcToken!.name.toString()); // тут ток usdc работают, надо ограничение сделать

        const walletClient = createWalletClient({
            chain: scroll,
            transport: Config.rpc == null ? http() : http(Config.rpc),
        });

        const { request } = await prepareStageData.client
            .simulateContract({
                address: layerBankContractAddress,
                abi: layerBankABI,
                functionName: 'supply',
                args: [contractAddress, prepareStageData.swapData?.value.toString()],
                account: account,
                value: BigInt(prepareStageData.swapData!.value),
            })
            .then((result) => result as SimulateContractReturnType)
            .catch((e) => {
                printError(`Произошла ошибка во время выполнения модуля ${layerBankModuleName} ${e}`);
                return { request: undefined };
            });

        if (request !== undefined) {
            const hash = await walletClient.writeContract(request).catch((e) => {
                printError(`Произошла ошибка во время выполнения модуля ${layerBankModuleName} ${e}`);
                return false;
            });

            if (hash == false) {
                return false;
            }

            const url = `${scroll.blockExplorers?.default.url + '/tx/' + hash}`;

            printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);

            await addTextMessage(
                `✅${layerBankModuleName}: supply ${formatUnits(prepareStageData.swapData!.value!, prepareStageData!.swapData!.srcToken?.decimals!)} ${prepareStageData.swapData!.srcToken!.name} <a href='${url}'>link</a>`,
            );
        }

        i--;

        await delay(Config.delayBetweenModules.minRange, Config.delayBetweenModules.maxRange, true);
        const result = await layerBankBorrow(account);

        if (i != 0) {
            printInfo(`Осталось выполнить ${i} кругов на LayerBank\n`);

            if (result == true) {
                await delay(Config.delayBetweenModules.minRange, Config.delayBetweenModules.maxRange, true);
            } else {
                await delay(Config.delayBetweenAction.minRange, Config.delayBetweenAction.maxRange, false);
            }
        }
    }

    return true;
}

export async function layerBankBorrow(account: PrivateKeyAccount) {
    // тут ток usdc работают, надо ограничение сделать

    const client = createPublicClient({
        chain: scroll,
        transport: Config.rpc == null ? http() : http(Config.rpc),
    });

    const walletClient = createWalletClient({
        chain: scroll,
        transport: Config.rpc == null ? http() : http(Config.rpc),
    });

    const contractAddress = layerBankTokens.get('ETH'); // тут ток usdc работают, надо ограничение сделать

    const balance = await getSwapBalance(client, account.address, <`0x${string}`>contractAddress, 'ETH');

    const { request } = await client
        .simulateContract({
            address: layerBankContractAddress,
            abi: layerBankABI,
            functionName: 'borrow',
            args: [contractAddress, balance],
            account: account,
        })
        .then((result) => result as SimulateContractReturnType)
        .catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля ${layerBankModuleName} ${e}`);
            return { request: undefined };
        });

    if (request !== undefined) {
        const hash = await walletClient.writeContract(request).catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля ${layerBankModuleName} ${e}`);
            return false;
        });

        if (hash == false) {
            return false;
        }

        const url = `${scroll.blockExplorers?.default.url + '/tx/' + hash}`;

        printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);

        await addTextMessage(
            `✅${layerBankModuleName}: borrow ${formatUnits(balance, 18)} ETH <a href='${url}'>link</a>`,
        );

        return true;
    }

    return false;
}
