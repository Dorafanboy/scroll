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
import { Config, Nfts2Me } from '../../config';
import { addTextMessage } from '../../data/telegram/telegramBot';
import { nfts2meModuleName } from './nfts2meData';
import { nfts2meABI } from '../../abis/nfts2me';

export async function nfts2meMint(account: PrivateKeyAccount) {
    printInfo(`Выполняю модуль ${nfts2meModuleName}`);

    const client = createPublicClient({
        chain: scroll,
        transport: Config.rpc == null ? http() : http(Config.rpc),
    });

    const contract = Nfts2Me.contracts[Math.floor(Math.random() * Nfts2Me.contracts.length)];
    const count = Math.floor(
        Math.random() * (Nfts2Me.nftCount.maxRange - Nfts2Me.nftCount.minRange) + Nfts2Me.nftCount.minRange,
    );

    printInfo(`Пытаюсь выполнить минт - ${contract} на Nfts2Me`);

    printInfo(`Произвожу минт - ${contract} на Nft2Me\n`);

    const walletClient: WalletClient = createWalletClient({
        chain: scroll,
        transport: Config.rpc == null ? http() : http(Config.rpc),
    });

    const { request } = await client
        .simulateContract({
            address: <`0x${string}`>contract,
            abi: nfts2meABI,
            functionName: 'mint',
            account: account,
            args: [count],
        })
        .then((result) => result as SimulateContractReturnType)
        .catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля ${nfts2meModuleName} - ${e}`);
            return { request: undefined };
        });

    if (request !== undefined) {
        const hash = await walletClient.writeContract(request).catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля ${nfts2meModuleName} - ${e}`);
            return false;
        });

        if (hash == false) {
            return false;
        }

        const url = `${scroll.blockExplorers?.default.url + '/tx/' + hash}`;

        printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);

        await addTextMessage(`✅${nfts2meModuleName}: mint ${contract} and ${count} count <a href='${url}'>link</a>`);

        return true;
    }

    return false;
}
