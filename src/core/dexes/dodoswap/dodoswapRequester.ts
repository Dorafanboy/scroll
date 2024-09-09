import { printError, printSuccess } from '../../../data/logger/logPrinter';
import axios from 'axios';
import { dodoswapModuleName, dodoSwapUrl } from './dodoswapData';
import * as console from 'node:console';
import crypto from 'crypto';

export async function getDodoSwapData(url: string) {
    const response = await axios
        .get(`${dodoSwapUrl}${url}`)
        .then(async (res) => {
            printSuccess(`Успешно получил данные транзакции(${dodoswapModuleName})`);
            return res;
        })
        .catch((err) => {
            printError(`Произошла ошибка во время получения данных транзакции(${dodoswapModuleName}) ${err}`);
            return null;
        });
}

export async function generateRandomString() {
    const chars = '0123456789abcdef';
    let prefix = '2c949db5e8427a89084946cff18fc081';
    const length = 192 - prefix.length; // Длина оставшейся части строки
    for (let i = 0; i < length; i++) {
        prefix += chars[Math.floor(Math.random() * chars.length)];
    }

    const hash = crypto.createHash('sha256');
    hash.update('1714233877');
    const res = hash.digest('hex');

    console.log(res);
    console.log(prefix);

    const response = await axios
        .post('https://gateway.dodoex.io/auth', {
            method: 'applyToken',
            data: '2c949db5e8427a89084946cff18fc08160f68512850434fbd4e0d367200f0ec409c024b9b58d86d0120a33318b1a03ed63f9f6564004b38869838ef8333f6e161701fb2fe46e52a983c92c95905e6b0315c57ae96ef5a082585c7f6eea88deb6',
        })
        .then(async (res) => {
            printSuccess(`Успешно получил данные транзакции(${dodoswapModuleName})`);
            return res;
        })
        .catch((err) => {
            console.log(err.response.data);
            printError(`Произошла ошибка во время получения данных транзакции(${dodoswapModuleName}) ${err}`);
            return null;
        });

    console.log(response!.data);
}
