import { createPublicClient, createWalletClient, formatUnits, Hex, http, parseUnits, PrivateKeyAccount } from 'viem';
import { getBridgeBalance, getBridgeData } from '../../../data/utils/utils';
import { printError, printInfo, printSuccess } from '../../../data/logger/logPrinter';
import { Config, OwlToBridge } from '../../../config';
import { addTextMessage } from '../../../data/telegram/telegramBot';
import { owlToContractAddress, owlToModuleName } from './owlToData';
import { getMsgFee } from './owlToRequester';
import { IOwlToDataDto } from '../../../data/utils/interfaces';
import { SendRawTransactionParameters, SignTransactionParameters } from 'viem/actions';

export async function owlToBridge(account: PrivateKeyAccount) {
    const result = await getValueResult(account.address);

    if (result == null) {
        return false;
    }

    const value = parseUnits(String(Number(formatUnits(result.value, 18)) + Number(formatUnits(BigInt(6), 18))), 18);

    printInfo(`Буду производить бридж ${formatUnits(value, 18)} ETH ${result.data.chain.name} -> Scroll`);

    const walletClient = createWalletClient({
        chain: result.data.chain,
        transport: result.data.rpc == null ? http() : http(result.data.rpc),
    });

    const request = await walletClient
        .prepareTransactionRequest({
            account,
            to: owlToContractAddress,
            value: value,
        })
        .catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля Bridge ${owlToModuleName} - ${e}`);
            return { request: undefined };
        });

    if (request !== undefined) {
        const signature = await walletClient.signTransaction(request as SignTransactionParameters);
        const params: SendRawTransactionParameters = {
            serializedTransaction: signature,
        };

        const hash = await walletClient.sendRawTransaction(params);
        const url = `${result.data.chain.blockExplorers?.default.url + '/tx/' + hash}`;

        printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);

        await addTextMessage(
            `✅${owlToModuleName}: bridge ${formatUnits(value, 18)} ETH ${result.data.chain.name} -> Scroll <a href='${url}'>link</a>`,
        );

        return true;
    }

    return false;
}

async function getValueResult(address: Hex): Promise<IOwlToDataDto | null> {
    let currentTry: number = 0;

    while (currentTry <= Config.retryCount) {
        if (currentTry >= Config.retryCount) {
            printError(
                `Не удалось найти баланса для бриджа + msgFee. Превышено количество попыток - [${currentTry}/${Config.retryCount}]\n`,
            );
        }

        const bridgeData = await getBridgeData(address, owlToModuleName);

        if (bridgeData?.value == BigInt(-1)) {
            printError(`Не удалось произвести bridge ${owlToModuleName}`);
            return null;
        }

        const fromChainName = OwlToBridge.data.find((chainData) => chainData.chainName == bridgeData.chain.name);

        const msgFee = await getMsgFee({
            from: fromChainName?.owlToDataChainName,
            to: 'ScrollMainnet',
            amount: formatUnits(BigInt(bridgeData.value), 18).toString(),
            token: 'ETH',
        });

        const client = createPublicClient({
            chain: bridgeData.chain,
            transport: bridgeData.rpc == null ? http() : http(bridgeData.rpc),
        });

        const balance = await getBridgeBalance(client, address);

        if (balance > bridgeData.value + parseUnits(msgFee, 18)) {
            return {
                client: client,
                data: bridgeData,
                value: bridgeData.value + parseUnits(msgFee, 18),
            };
        } else {
            printError(`Баланса с комиссий не хватит для бриджа.\n`);
            currentTry++;
        }
    }

    return null;
}
