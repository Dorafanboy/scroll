import { privateKeyToAccount } from 'viem/accounts';
import fs from 'fs';
import readline from 'readline';
import { printError, printInfo, printSuccess } from './data/logger/logPrinter';
import { delay } from './data/helpers/delayer';
import {
    BridgeConfig,
    Config,
    Dmail,
    L2Pass,
    LayerBank,
    Nfts2Me,
    OkxData,
    RubyScore,
    SushiConfig,
    SyncSwapConfig,
    TelegramData,
    ZkStars,
} from './config';
import path from 'path';
import { IModuleFunction } from './data/utils/interfaces';
import { prepareBridge } from './core/bridges/bridge';
import { withdrawAmount } from './data/okx/okx';
import { sushiSwap } from './core/dexes/sushi/sushi';
import { syncSwap } from './core/dexes/syncswap/syncswap';
import { sendDmail } from './core/dmail/dmail';
import { l2passMint } from './core/l2pass/l2pass';
import { layerBankSupply } from './core/lendings/layerBank/layerBank';
import { nfts2meMint } from './core/nfts2me/nfts2me';
import { rubyScoreVote } from './core/rubyScore/rubyScore';
import { zkStarsMint } from './core/zkStars/zkStars';
import {
    addTextMessage,
    initializeTelegramBot,
    resetTextMessage,
    sendMessage,
    stopTelegramBot,
} from './data/telegram/telegramBot';

let account;

const privateKeysFilePath = path.join(__dirname, 'assets', 'private_keys');

const wordsFilePath = path.join(__dirname, 'assets', 'random_words.txt');
const words = fs.readFileSync(wordsFilePath).toString().split('\n');

const privateKeysPath = fs.createReadStream(privateKeysFilePath);

const functions: { [key: string]: IModuleFunction } = {
    SushiSwap: {
        func: sushiSwap,
        isUse: SushiConfig.isUse,
    },
    SyncSwap: {
        func: syncSwap,
        isUse: SyncSwapConfig.isUse,
    },
    Dmail: {
        func: (account) => sendDmail(account, words),
        isUse: Dmail.isUse,
        words,
    },
    L2Pass: {
        func: l2passMint,
        isUse: L2Pass.isUse,
    },
    LayerBank: {
        func: layerBankSupply,
        isUse: LayerBank.isUse,
    },
    Nfts2Me: {
        func: nfts2meMint,
        isUse: Nfts2Me.isUse,
    },
    RubyScore: {
        func: rubyScoreVote,
        isUse: RubyScore.isUse,
    },
    ZkStars: {
        func: zkStarsMint,
        isUse: ZkStars.isUse,
    },
};

const filteredFunctions = Object.keys(functions)
    .filter((key) => functions[key].isUse)
    .map((key) => functions[key].func);

if (filteredFunctions.length == 0) {
    printError(`Нету модулей для запуска`);
    throw `No modules`;
}

async function main() {
    const rl = readline.createInterface({
        input: privateKeysPath,
        crlfDelay: Infinity,
    });

    let index = 0;

    await initializeTelegramBot(TelegramData.telegramBotId, TelegramData.telegramId);

    const data = fs.readFileSync(privateKeysFilePath, 'utf8');

    const count = data.split('\n').length;

    for await (const line of rl) {
        try {
            if (line == '') {
                printError(`Ошибка, пустая строка в файле private_keys.txt`);
                return;
            }

            if (Config.isShuffleWallets) {
                printInfo(`Произвожу перемешивание только кошельков.`);
                await shuffleData();

                printSuccess(`Кошельки успешно перемешаны.\n`);
            }

            account = privateKeyToAccount(<`0x${string}`>line);
            printInfo(`Start [${index + 1}/${count} - ${account.address}]\n`);

            await addTextMessage(`${index + 1}/${count} - ${account.address}\n`);

            await withdrawAmount(account.address, OkxData.bridgeData, OkxData.isUse);

            if (BridgeConfig.isUse) {
                const result = await prepareBridge(account);

                if (result == true) {
                    await delay(Config.delayBetweenModules.minRange, Config.delayBetweenModules.maxRange, true);
                } else {
                    await delay(Config.delayBetweenAction.minRange, Config.delayBetweenAction.maxRange, false);
                }
            }

            const modulesCount = Math.floor(
                Math.random() * (Config.modulesCount.maxRange - Config.modulesCount.minRange) +
                    Config.modulesCount.minRange,
            );

            printInfo(`Буду выполнять ${modulesCount} модулей на аккаунте\n`);

            for (let i = 0; i < modulesCount; i++) {
                const randomFunction = filteredFunctions[Math.floor(Math.random() * filteredFunctions.length)];

                const result = await randomFunction(account, Math.random() < 0.5);

                if (i != modulesCount - 1) {
                    printInfo(`Осталось выполнить ${modulesCount - i - 1} модулей на аккаунте\n`);

                    if (result == true) {
                        await delay(Config.delayBetweenModules.minRange, Config.delayBetweenModules.maxRange, true);
                    } else {
                        await delay(Config.delayBetweenAction.minRange, Config.delayBetweenAction.maxRange, false);
                    }
                }
            }

            printSuccess(`Ended [${index + 1}/${count} - ${account.address}]\n`);

            await sendMessage();
            await resetTextMessage();

            fs.appendFile('src/assets/completed_accounts.txt', `${line}\n`, 'utf8', (err) => {
                if (err) {
                    printError(`Произошла ошибка при записи в файл: ${err}`);
                }
            });

            index++;

            if (index == count) {
                printSuccess(`Все аккаунты отработаны`);
                rl.close();
                await stopTelegramBot();
                return;
            }

            printInfo(`Ожидаю получение нового аккаунта`);
            await delay(Config.delayBetweenAccounts.minRange, Config.delayBetweenAccounts.maxRange, true);
        } catch (e) {
            printError(`Произошла ошибка при обработке строки: ${e}\n`);

            await addTextMessage(`❌Аккаунт отработал с ошибкой`);
            await sendMessage();
            await resetTextMessage();

            printInfo(`Ожидаю получение нового аккаунта`);
            await delay(Config.delayBetweenAccounts.minRange, Config.delayBetweenAccounts.maxRange, true);
            fs.appendFile('src/assets/uncompleted_accounts.txt', `${line}\n`, 'utf8', (err) => {
                if (err) {
                    printError(`Произошла ошибка при записи в файл: ${err}`);
                }
            });

            index++;
        }
    }
}

async function shuffleData() {
    try {
        const data1 = fs.readFileSync(privateKeysFilePath, 'utf8');
        const lines1 = data1.split('\n');

        for (let i = lines1.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [lines1[i], lines1[j]] = [lines1[j], lines1[i]];
        }

        await fs.writeFileSync(privateKeysFilePath, lines1.join('\n'), 'utf8');
    } catch (error) {
        printError(`Произошла ошибка во время перемешивания данных: ${error}`);
    }
}

main();
