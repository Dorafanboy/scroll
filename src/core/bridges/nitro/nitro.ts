import { createWalletClient, formatUnits, http, PrivateKeyAccount } from 'viem';
import { nitroGetQuote, nitroGetTransactionData } from './nitroRequester';
import { nativeContractAddress, nitroModuleName } from './nitroData';
import { getBridgeData } from '../../../data/utils/utils';
import { printError, printSuccess } from '../../../data/logger/logPrinter';
import { addTextMessage } from '../../../data/telegram/telegramBot';

export async function nitroBridge(account: PrivateKeyAccount) {
    const bridgeData = await getBridgeData(account.address, nitroModuleName);

    if (bridgeData?.value == BigInt(-1)) {
        printError(`Не удалось произвести bridge ${nitroModuleName}`);
        return false;
    }

    const quote = await nitroGetQuote({
        fromTokenAddress: nativeContractAddress,
        toTokenAddress: nativeContractAddress,
        amount: bridgeData?.value.toString(),
        fromTokenChainId: bridgeData.chain.id.toString(),
        toTokenChainId: '534352',
        partnerId: '1',
        slippageTolerance: '2',
        destFuel: '0',
    });

    const txData = await nitroGetTransactionData({
        ...quote,
        senderAddress: account.address,
        receiverAddress: account.address,
    });

    const walletClient = createWalletClient({
        chain: bridgeData.chain,
        transport: bridgeData.rpc == null ? http() : http(bridgeData.rpc),
    });

    const preparedTransaction = await walletClient!.prepareTransactionRequest({
        account,
        to: txData.to,
        data: txData.data,
        value: BigInt(txData.value),
    });

    const signature = await walletClient.signTransaction(preparedTransaction).catch((e) => {
        printError(`Произошла ошибка во время выполнения модуля Bridge ${nitroModuleName} - ${e}`);
        return undefined;
    });

    if (signature !== undefined) {
        const hash = await walletClient.sendRawTransaction({ serializedTransaction: signature }).catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля Bridge ${nitroModuleName} - ${e}`);
            return false;
        });

        if (hash == false) {
            return false;
        }

        const url = `${bridgeData.chain.blockExplorers?.default.url + '/tx/' + hash}`;

        printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);

        await addTextMessage(
            `✅${nitroModuleName}: bridge ${formatUnits(bridgeData?.value, 18)} ETH ${bridgeData.chain.name} -> Scroll <a href='${url}'>link</a>`,
        );

        return true;
    }

    return false;
}
