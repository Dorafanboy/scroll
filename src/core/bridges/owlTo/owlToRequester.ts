import axios from 'axios';
import { IOwlToBridgeData } from '../../../data/utils/interfaces';
import { owlToDataUrl, owlToModuleName } from './owlToData';
import { printError, printSuccess } from '../../../data/logger/logPrinter';

export async function getMsgFee(data: IOwlToBridgeData): Promise<string> {
    const response = await axios
        .get(owlToDataUrl, {
            params: {
                from: data.from,
                to: data.to,
                amount: data.amount,
                token: data.token,
            },
        })
        .then(async (res) => {
            printSuccess(`Успешно получил данные транзакции(${owlToModuleName})`);
            return res;
        })
        .catch((err) => {
            printError(`Произошла ошибка во время получения данных транзакции(${owlToModuleName}) ${err}`);
            return null;
        });

    return response!.data.msg;
}
