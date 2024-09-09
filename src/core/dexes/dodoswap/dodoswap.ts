import { createWalletClient, formatUnits, http, PrivateKeyAccount } from 'viem';
import { prepareStage } from '../../../data/utils/utils';
import { printError, printSuccess } from '../../../data/logger/logPrinter';
import { scroll } from 'viem/chains';
import { Config } from '../../../config';
import { addTextMessage } from '../../../data/telegram/telegramBot';
import { dodoswapModuleName } from './dodoswapData';
import { getDodoSwapData } from './dodoswapRequester';

export async function dodoSwap(account: PrivateKeyAccount, isEth: boolean) {
    const prepareStageData = await prepareStage(dodoswapModuleName, isEth, account);

    if (prepareStageData.swapData?.value == BigInt(-1)) {
        printError(`Не удалось произвести swap ${dodoswapModuleName}`);
        return false;
    }

    const walletClient = createWalletClient({
        chain: scroll,
        transport: Config.rpc == null ? http() : http(Config.rpc),
    });

    //await

    // const newFromContractAddress =
    //     prepareStageData.swapData?.srcToken?.name == 'wETH'
    //         ? '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    //         : prepareStageData.swapData?.srcToken?.contractAddress;
    //
    // const data = await getDodoSwapData(); //534352-ETH/534352-USDC
    //
    // const preparedTransaction = await walletClient.prepareTransactionRequest({
    //     account,
    //     to: transactionData.to,
    //     data: transactionData.data,
    //     value: BigInt(transactionData.value),
    // });
    //
    // const signature = await walletClient.signTransaction(preparedTransaction).catch((e) => {
    //     printError(`Произошла ошибка во время выполнения модуля ${dodoswapModuleName} ${e}`);
    //     return undefined;
    // });
    //
    // if (signature !== undefined) {
    //     const hash = await walletClient.sendRawTransaction({ serializedTransaction: signature }).catch((e) => {
    //         printError(`Произошла ошибка во время выполнения модуля ${dodoswapModuleName} ${e}`);
    //         return false;
    //     });
    //
    //     if (hash == false) {
    //         return false;
    //     }
    //
    //     const url = `${scroll.blockExplorers?.default.url + '/tx/' + hash}`;
    //
    //     printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);
    //
    //     await addTextMessage(
    //         `✅${dodoswapModuleName}: swap ${formatUnits(prepareStageData.swapData!.value!, prepareStageData.swapData!.srcToken?.decimals!)} ${prepareStageData.swapData!.srcToken!.name} -> ${prepareStageData.swapData!.dstToken!.name} <a href='${url}'>link</a>`,
    //     );
    //
    //     return true;
    // }

    return false;
}
