import {
    createWalletClient,
    encodeAbiParameters,
    encodePacked,
    formatUnits,
    http,
    parseAbiParameters,
    PrivateKeyAccount,
    SimulateContractReturnType,
    zeroAddress,
} from 'viem';
import { prepareStage } from '../../../data/utils/utils';
import { printError, printSuccess } from '../../../data/logger/logPrinter';
import { scroll } from 'viem/chains';
import { Config } from '../../../config';
import { addTextMessage } from '../../../data/telegram/telegramBot';
import {
    syncSwapModuleName,
    syncSwapPoolContractAddress,
    syncSwapRouterContractAddress,
    syncSwapSlippage,
} from './syncswapData';
import { syncSwapPoolABI } from '../../../abis/syncswap/syncswapPool';
import { syncSwapRouterABI } from '../../../abis/syncswap/syncswapRouter';

export async function syncSwap(account: PrivateKeyAccount, isEth: boolean) {
    const prepareStageData = await prepareStage(syncSwapModuleName, isEth, account);

    if (prepareStageData.swapData?.value == BigInt(-1)) {
        printError(`Не удалось произвести swap ${syncSwapModuleName}`);
        return false;
    }

    const walletClient = createWalletClient({
        chain: scroll,
        transport: Config.rpc == null ? http() : http(Config.rpc),
    });

    const poolContractAddress = await prepareStageData.client.readContract({
        address: syncSwapPoolContractAddress,
        abi: syncSwapPoolABI,
        functionName: 'getPool',
        args: [
            prepareStageData.swapData?.srcToken?.contractAddress,
            prepareStageData.swapData?.dstToken?.contractAddress,
        ],
    });

    const minAmountOut = (await prepareStageData.client.readContract({
        address: <`0x${string}`>poolContractAddress,
        abi: syncSwapPoolABI,
        functionName: 'getAmountOut',
        args: [
            prepareStageData.swapData?.srcToken?.contractAddress,
            prepareStageData.swapData?.value.toString(),
            account.address,
        ],
    })) as bigint;

    const amountOut = minAmountOut - minAmountOut / BigInt(100 * syncSwapSlippage);

    const steps = [
        {
            pool: poolContractAddress,
            data: encodeAbiParameters(parseAbiParameters('address x, address y, uint8 z'), [
                prepareStageData!.swapData?.srcToken?.contractAddress!,
                account.address,
                1,
            ]),
            callback: zeroAddress,
            callbackData: '0x',
        },
    ];

    const paths = [
        {
            steps: steps,
            tokenIn:
                prepareStageData.swapData?.srcToken?.name == 'wETH'
                    ? zeroAddress
                    : prepareStageData.swapData?.srcToken?.contractAddress,
            amountIn: prepareStageData.swapData?.value,
        },
    ];

    const block = await prepareStageData.client.getBlock();
    const deadline = block.timestamp + BigInt(12000);

    const { request } = await prepareStageData.client
        .simulateContract({
            address: syncSwapRouterContractAddress,
            abi: syncSwapRouterABI,
            functionName: 'swap',
            args: [paths, amountOut, deadline],
            account: account,
            value:
                prepareStageData.swapData!.srcToken!.name == 'wETH'
                    ? BigInt(prepareStageData.swapData!.value)
                    : BigInt(0),
        })
        .then((result) => result as SimulateContractReturnType)
        .catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля ${syncSwapModuleName} ${e}`);
            return { request: undefined };
        });

    if (request !== undefined) {
        const hash = await walletClient.writeContract(request).catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля ${syncSwapModuleName} ${e}`);
            return false;
        });

        if (hash == false) {
            return false;
        }

        const url = `${scroll.blockExplorers?.default.url + '/tx/' + hash}`;

        printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);

        await addTextMessage(
            `✅${syncSwapModuleName}: swap ${formatUnits(prepareStageData.swapData!.value!, prepareStageData.swapData!.srcToken?.decimals!)} ${prepareStageData.swapData!.srcToken!.name} -> ${prepareStageData.swapData!.dstToken!.name} <a href='${url}'>link</a>`,
        );

        return true;
    }

    return false;
}
