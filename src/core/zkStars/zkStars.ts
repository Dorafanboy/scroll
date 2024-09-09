import {
    createPublicClient,
    createWalletClient,
    formatUnits,
    http,
    PrivateKeyAccount,
    SimulateContractReturnType,
    WalletClient,
} from 'viem';
import { printError, printInfo, printSuccess } from '../../data/logger/logPrinter';
import { scroll } from 'viem/chains';
import { Config, ZkStars } from '../../config';
import { addTextMessage } from '../../data/telegram/telegramBot';
import { zkStarsContractAddress, zkStarsMintNftPrice, zkStarsModuleName } from './zkStarsData';
import { zkStarsABI } from '../../abis/zkStars';

export async function zkStarsMint(account: PrivateKeyAccount) {
    printInfo(`Выполняю модуль ${zkStarsModuleName}`);

    const client = createPublicClient({
        chain: scroll,
        transport: Config.rpc == null ? http() : http(Config.rpc),
    });

    const contract = ZkStars.contracts[Math.floor(Math.random() * ZkStars.contracts.length)];

    printInfo(`Пытаюсь выполнить минт - ${contract} на ZkStars за ${formatUnits(zkStarsMintNftPrice, 18)} ETH`);

    printInfo(`Произвожу минт - ${contract} на ZkStars ${formatUnits(zkStarsMintNftPrice, 18)} ETH\n`);

    const walletClient: WalletClient = createWalletClient({
        chain: scroll,
        transport: Config.rpc == null ? http() : http(Config.rpc),
    });

    const { request } = await client
        .simulateContract({
            address: zkStarsContractAddress,
            abi: zkStarsABI,
            functionName: 'safeMint',
            account: account,
            args: [contract],
            value: zkStarsMintNftPrice,
        })
        .then((result) => result as SimulateContractReturnType)
        .catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля ${zkStarsModuleName} - ${e}`);
            return { request: undefined };
        });

    if (request !== undefined) {
        const hash = await walletClient.writeContract(request).catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля ${zkStarsModuleName} - ${e}`);
            return false;
        });

        if (hash == false) {
            return false;
        }

        const url = `${scroll.blockExplorers?.default.url + '/tx/' + hash}`;

        printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);

        await addTextMessage(`✅${zkStarsModuleName}: mint ${contract} <a href='${url}'>link</a>`);

        return true;
    }

    return false;
}
