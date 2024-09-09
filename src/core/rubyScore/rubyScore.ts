import {
    createPublicClient,
    createWalletClient,
    http,
    PrivateKeyAccount,
    SimulateContractReturnType,
    WalletClient,
} from 'viem';
import { printError, printInfo, printSuccess } from '../../data/logger/logPrinter';
import { scroll } from 'viem/chains';
import { Config } from '../../config';
import { addTextMessage } from '../../data/telegram/telegramBot';
import { rubyScoreContractAddress, rubyScoreModuleName } from './rubyScoreData';
import { rubyScoreABI } from '../../abis/rubyScore';

export async function rubyScoreVote(account: PrivateKeyAccount) {
    printInfo(`Выполняю модуль ${rubyScoreModuleName}`);

    const client = createPublicClient({
        chain: scroll,
        transport: Config.rpc == null ? http() : http(Config.rpc),
    });

    printInfo(`Пытаюсь выполнить голосование на RubyScore`);

    printInfo(`Произвожу голосование на RubyScore\n`);

    const walletClient: WalletClient = createWalletClient({
        chain: scroll,
        transport: Config.rpc == null ? http() : http(Config.rpc),
    });

    const { request } = await client
        .simulateContract({
            address: rubyScoreContractAddress,
            abi: rubyScoreABI,
            functionName: 'vote',
            account: account,
        })
        .then((result) => result as SimulateContractReturnType)
        .catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля ${rubyScoreModuleName} - ${e}`);
            return { request: undefined };
        });

    if (request !== undefined) {
        const hash = await walletClient.writeContract(request).catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля ${rubyScoreModuleName} - ${e}`);
            return false;
        });

        if (hash == false) {
            return false;
        }

        const url = `${scroll.blockExplorers?.default.url + '/tx/' + hash}`;

        printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);

        await addTextMessage(`✅${rubyScoreModuleName}: vote <a href='${url}'>link</a>`);

        return true;
    }

    return false;
}
