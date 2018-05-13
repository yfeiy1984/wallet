import {CoinInterface} from "./coin";

export interface WalletDataInterface
{
    password: string;
    mnemonic: string;
    isInit: boolean;
    isBackup: boolean;
    coins: CoinInterface[];
}