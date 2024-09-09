import axios from 'axios';
import { printError, printSuccess } from '../../../data/logger/logPrinter';
import { nitroModuleName, nitroUrls } from './nitroData';
import {
    INitroQuoteRequestData,
    INitroQuoteResponseData,
    INitroTransactionRequestData,
    INitroTransactionResponseData,
} from '../../../data/utils/interfaces';
import * as console from 'node:console';

export async function login(address: string) {
    const response = await axios
        .post(nitroUrls.loginUrl, {
            wallet_address: address,
            type: 'EVM',
        })
        .then(async (res) => {
            printSuccess(`Успешно получил токен авторизации(${nitroModuleName})`);
            return res;
        })
        .catch((err) => {
            printError(`Произошла ошибка во время получения токена авторизации${nitroModuleName}) ${err}`);
            return null;
        });

    return response!.data.accessToken;
}

export async function nitroGetQuote(data: INitroQuoteRequestData): Promise<INitroQuoteResponseData> {
    const response = await axios
        .get(nitroUrls.quoteUrl, {
            params: {
                ...data,
            },
        })
        .then(async (res) => {
            printSuccess(`Успешно получил quote транзакции(${nitroModuleName})`);
            return res;
        })
        .catch((err) => {
            printError(`Произошла ошибка во время получения quote транзакции(${nitroModuleName}) ${err}`);
            console.log(err.response.data);
            return null;
        });

    return response!.data as INitroQuoteResponseData;
}

export async function nitroGetTransactionData(
    data: INitroTransactionRequestData,
): Promise<INitroTransactionResponseData> {
    const response = await axios
        .post(nitroUrls.transactionUrl, {
            ...data,
        })
        .then(async (res) => {
            printSuccess(`Успешно получил quote транзакции(${nitroModuleName})`);
            return res;
        })
        .catch((err) => {
            printError(`Произошла ошибка во время получения quote транзакции(${nitroModuleName}) ${err}`);
            console.log(err.response.data);
            return null;
        });

    return {
        data: response!.data.txn.data,
        to: response!.data.txn.to,
        value: response!.data.txn.value,
    };
}
