// import { PrivateKeyAccount, PublicClient } from 'viem';
// import { printError, printInfo } from '../../../data/logger/logPrinter';
// import { l2passModuleName, l2passRefuelContractAddress } from './l2passData';
// import { Config } from '../../../config';
// import { getBridgeData } from '../../../data/utils/utils';
// import { l2passRefuelABI } from '../../../abis/l2pass/l2passRefuel';
// import { delay } from '../../../data/helpers/delayer';
//
// export async function gasRefuel(account: PrivateKeyAccount) {
//     printInfo(`Выполняю модуль ${l2passModuleName}`);
//
//     let currentTry: number = 0,
//         value,
//         network,
//         id;
//
//     let estimateFee: readonly [bigint, bigint];
//     let bridgeData: IOneToOneBridgeData;
//     let client!: PublicClient;
//
//     const bridgeData = await getBridgeData(account.address, l2passModuleName);
//
//     if (bridgeData?.value == BigInt(-1)) {
//         printError(`Не удалось произвести bridge ${l2passModuleName}`);
//         return false;
//     }
//
//     while (currentTry <= Config.retryCount) {
//         if (currentTry == Config.retryCount) {
//             printError(
//                 `Не нашел баланс для бриджа в L2Pass. Превышено количество попыток - [${currentTry}/${Config.retryCount}]\n`,
//             );
//             return false;
//         }
//
//         bridgeData = await getBridgeData(false, firstChain ? firstChain : '', secondChain ? secondChain : '');
//
//         network = Config.rpcs.find((chain) => chain.chain === bridgeData.firstChainData.chain.network);
//
//         client = createPublicClient({
//             chain: bridgeData.firstChainData.chain,
//             transport: network?.rpcUrl == null ? http() : http(network.rpcUrl),
//         });
//
//         printInfo(
//             `Пытаюсь произвести бридж из сети ${bridgeData.firstChainData.chain.name} в сеть ${bridgeData.secondChainData.chain.name}`,
//         );
//
//         value = await getValue(client, account.address, bridgeData.value?.range, bridgeData?.value.fixed, true);
//
//         currentTry++;
//
//         if (value != null && value != BigInt(-1)) {
//             id = Config.rpcs.find((chain) => chain.chain === bridgeData.secondChainData.chain.network)!.id!;
//
//             estimateFee = await client.readContract({
//                 address: l2passRefuelContractAddress,
//                 abi: l2passRefuelABI,
//                 functionName: 'estimateGasRefuelFee',
//                 args: [id, value, <`0x${string}`>account.address, false],
//             });
//
//             const balance = await client.getBalance({
//                 address: account.address,
//             });
//
//             console.log(balance, BigInt(value) + BigInt(parseFloat(estimateFee[0].toString())));
//             if (balance > BigInt(value) + BigInt(parseFloat(estimateFee[0].toString()))) {
//                 currentTry = Config.retryCount + 1;
//             }
//         } else {
//             await delay(Config.delayBetweenAction.minRange, Config.delayBetweenAction.maxRange, false);
//         }
//     }
//
//     printInfo(
//         `Произвожу бридж из сети ${bridgeData!.firstChainData.chain.name} в сеть ${
//             bridgeData!.secondChainData.chain.name
//         } на сумму ${formatUnits(value!, 18)} ${bridgeData!.secondChainData.chain.nativeCurrency.symbol} `,
//     );
//
//     const walletClient = createWalletClient({
//         chain: bridgeData!.firstChainData.chain,
//         transport: network?.rpcUrl == null ? http() : http(network.rpcUrl),
//     });
//
//     const adapterParams = encodeFunctionData({
//         abi: l2passGasRefuelAbi,
//         functionName: 'gasRefuel',
//         args: [id!, zroPaymentAddress, value!, account.address],
//     });
//
//     const test = await walletClient.prepareTransactionRequest({
//         account,
//         to: bridgeGasContractAddress,
//         data: adapterParams,
//         value: estimateFee![0],
//     });
//
//     const signature = await walletClient.signTransaction(test).catch((e) => {
//         printError(`Произошла ошибка во время выполнения модуля L2Pass Gas Refuel - ${e}`);
//         return undefined;
//     });
//
//     if (signature !== undefined) {
//         const hash = await walletClient.sendRawTransaction({ serializedTransaction: signature }).catch((e) => {
//             printError(`Произошла ошибка во время выполнения модуля L2Pass Gas Refuel - ${e}`);
//             return false;
//         });
//
//         if (hash == false) {
//             return false;
//         }
//
//         const url = `${bridgeData!.firstChainData.chain.blockExplorers?.default.url + '/tx/' + hash}`;
//
//         printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);
//
//         await addTextMessage(
//             `✅L2Pass gas refuel: bridge ${bridgeData!.firstChainData.chain.name}=>${
//                 bridgeData!.secondChainData.chain.name
//             } ${formatUnits(value!, 18)} ${
//                 bridgeData!.secondChainData.chain.nativeCurrency.symbol
//             } <a href='${url}'>link</a>`,
//         );
//
//         return true;
//     }
//
//     return false;
// }
