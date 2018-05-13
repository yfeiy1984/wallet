import {Injectable} from '@angular/core';
import {Storage} from '@ionic/storage';
import {ToastController, AlertController, LoadingController, Platform} from "ionic-angular";
import {CoinInterface} from '../interfaces/coin';
import {WalletDataInterface} from '../interfaces/wallet-data';
import {TxinfoInterface} from '../interfaces/txinfo';
import {Decimal} from 'decimal.js';
import {ApiService} from './api';
import {AppConfig} from './app-config';
import * as bip39 from 'bip39';
import * as bitcore from 'bitcore-lib';
import * as bitcoreExplorers from 'bitcore-explorers';
import * as EthereumBip44 from 'ethereum-bip44';
import * as Tx from 'ethereumjs-tx';
import * as SafeBuffer from 'safe-buffer';

@Injectable()
export class WalletService
{
    private readonly walletDataKey = "mtsWalletData";

    private readonly mtsBaseUri = 'http://mts.mtqukuai.com/api/v2/';

    /**
     * 币种信息
     * @type {{code: string; name: string; category: string; type: number}[]}
     */
    private readonly coinTypes = [
        {
            code: 'BTC',
            name: 'Bitcoin',
            category: 'master',
            type: 0,
            decimals: 8,
            isSelected: true
        },
        {
            code: 'ETH',
            name: 'Ethereum',
            category: 'master',
            type: 60,
            decimals: 18,
            isSelected: true
        },
        {
            code: 'EOS',
            name: 'EOS',
            category: 'erc20',
            type: 60,
            decimals: 18,
            isSelected: true
        },
        {
            code: 'MTS',
            name: 'MTS',
            category: 'erc20',
            type: 60,
            decimals: 18,
            isSelected: true
        }
    ];

    /**
     * 以太坊系统燃油数量
     * @type {{ETH: number; EOS: number}}
     */
    public readonly  gasLimit = {
        'ETH': 21000,
        'EOS': 200000,
        'MTS': 200000
    };

    /**
     * 以太坊Erc20 Token合约地址
     * @type {{EOS: string}}
     */
    private readonly  erc20TokenContract = {
        'EOS': '0x86fa049857e0209aa7d9e616f7eb3b3b78ecfdb0',
        'MTS': '0x84702d1eaf36ff91feba0e69fbfe254bf7c9c9f5'
    };

    constructor(
        public storage: Storage,
        public toastCtrl: ToastController,
        public alertController: AlertController,
        public loadingCtrl: LoadingController,
        public apiService: ApiService,
        public appConfig: AppConfig,
        public platform: Platform
    ) {

    }

    /**
     * 初始化钱包
     * @param password
     * @param {any} mnemonic
     * @returns {Promise<WalletDataInterface>}
     */
    init(password, mnemonic = null): Promise<WalletDataInterface>
    {
        if (mnemonic === null) {
            mnemonic = bip39.generateMnemonic();
        }
        let seedHex = bip39.mnemonicToSeedHex(mnemonic, '');
        let hdPrivateKey = bitcore.HDPrivateKey.fromSeed(seedHex);
        let passwordBuffer = new bitcore.deps.Buffer(password);
        let coins: CoinInterface[] = [];

        // generate address
        this.coinTypes.forEach((n) => {
            let address = '';
            let hdPublicKey = '';
            if (n.code == 'BTC') {
                let deriveHdPrivateKey = hdPrivateKey.derive("m/44'/0'/0'/0");
                address = deriveHdPrivateKey.derive("m/0").publicKey.toAddress().toString();
                hdPublicKey = deriveHdPrivateKey.hdPublicKey.toString();
            } else {
                let deriveHdPrivateKey = hdPrivateKey.derive("m/44'/" + n.type + "'/0'/0");
                let wallet = new EthereumBip44(deriveHdPrivateKey);
                address = wallet.getAddress(0);
                hdPublicKey = deriveHdPrivateKey.hdPublicKey.toString();
            }
            coins.push({
                code: n.code,
                name: n.name,
                category: n.category,
                type: n.type,
                balance: ['0'],
                rmb: ['0'],
                hdPublicKey: hdPublicKey,
                address: address,
                address_index: 0,
                address_list: [address],
                isSelected: n.isSelected
            });
        });

        return this.storage.set(this.walletDataKey, {
            password: bitcore.crypto.Hash.sha256(passwordBuffer).toString('hex'),
            mnemonic: mnemonic,
            isInit: true,
            isBackup: false,
            coins: coins
        });
    }

    /**
     * 更新地址
     * @param code
     * @returns {Promise<boolean>}
     */
    refreshAddress(code): Promise<CoinInterface>
    {
        return this.storage.get(this.walletDataKey)
            .then((walletData: WalletDataInterface) => {
                let coin: CoinInterface;
                walletData.coins.forEach((n) => {
                    if (n.code == code) {
                        coin = n;
                        n.address_index++;
                        if (n.code == 'BTC') {
                            let hdPublicKey = new bitcore.HDPublicKey(n.hdPublicKey);
                            n.address = hdPublicKey.derive("m/" + n.address_index).publicKey.toAddress().toString();
                        } else {
                            let wallet = EthereumBip44.fromPublicSeed(n.hdPublicKey);
                            n.address = wallet.getAddress(n.address_index);
                        }
                        n.address_list.push(n.address);
                        n.balance.push('0');
                        n.rmb.push('0');
                    }
                });

                return this.setWalletData(walletData)
                    .then((walletData: WalletDataInterface) => {
                        return coin;
                    });
            });
    }

    /**
     * 获取地址私钥
     * @param mnemonic
     * @param password
     * @param code
     * @param address_index
     * @returns {string}
     */
    getPrivateKey(mnemonic, password, code, address_index): string
    {
        let seedHex = bip39.mnemonicToSeedHex(mnemonic, '');
        let hdPrivateKey = bitcore.HDPrivateKey.fromSeed(seedHex);
        let privateKey = '';

        if (code == 'BTC') {
            let derive = hdPrivateKey.derive("m/44'/0'/0'/0/" + address_index);
            privateKey = derive.privateKey.toString();
        } else  {
            this.coinTypes.forEach((n) => {
                if (n.code == code) {
                    let derive = hdPrivateKey.derive("m/44'/" + n.type + "'/0'/0");
                    let wallet = new EthereumBip44(derive);
                    privateKey = wallet.getPrivateKey(address_index).toString('hex');
                }
            });
        }


        return privateKey;
    }

    /**
     * 输入密码弹窗
     * @returns {Promise<string>}
     */
    showPasswordAlert(): Promise<string>
    {
        return new Promise<string>((resolve, reject) => {
            this.alertController.create({
                enableBackdropDismiss: false,
                title: '请输入钱包密码',
                inputs: [
                    {
                        name: 'password',
                        type: 'password'
                    }
                ],
                buttons: [
                    {
                        text: '取消',
                        handler: () => {
                            resolve('');
                        }
                    },
                    {
                        text: '确定',
                        handler: data => {
                            this.passwordVerify(data.password)
                                .then((isMatch: boolean) => {
                                    if (isMatch) {
                                        resolve(data.password);
                                    } else {
                                        reject('密码错误，请重新输入');
                                    }
                                })
                                .catch(err => {
                                    reject(err);
                                });
                        }
                    }
                ]
            }).present();
        });
    }

    /**
     * 验证密码
     * @param {string} password
     * @returns {Promise<boolean>}
     */
    passwordVerify(password: string): Promise<boolean>
    {
        return this.storage.get(this.walletDataKey)
            .then((walletData: WalletDataInterface) => {
                if (!walletData || walletData.password == '') {
                    return false;
                }

                let passwordBuffer = new bitcore.deps.Buffer(password);

                return walletData.password === bitcore.crypto.Hash.sha256(passwordBuffer).toString('hex');
            });
    }

    /**
     * 获取钱包数据
     * @returns {Promise<WalletDataInterface>}
     */
    getWalletData(): Promise<WalletDataInterface>
    {
        return this.storage.get(this.walletDataKey);
    }

    /**
     * 设置钱包数据
     * @param {WalletDataInterface} walletData
     * @returns {Promise<WalletDataInterface>}
     */
    setWalletData(walletData: WalletDataInterface): Promise<WalletDataInterface>
    {
        return this.storage.set(this.walletDataKey, walletData);
    }

    /**
     * 获取单个币种信息
     * @param code
     * @returns {Promise<CoinInterface>}
     */
    getCoin(code): Promise<CoinInterface>
    {
        return this.storage.get(this.walletDataKey)
            .then((walletData: WalletDataInterface) => {
                let coin: CoinInterface;
                walletData.coins.forEach((n) => {
                    if (n.code == code) {
                        coin = n;
                    }
                });

                return coin;
            });
    }

    /**
     * 获取币种信息
     * @returns {Promise<CoinInterface[]>}
     */
    getCoins(): Promise<CoinInterface[]>
    {
        return this.storage.get(this.walletDataKey)
            .then((walletData: WalletDataInterface) => {
                return walletData.coins;
            });
    }

    /**
     * 获取钱包类型
     * @returns {{code: string; name: string; type: number; desc: string; logo: string}[]}
     */
    getCoinTypes()
    {
        return this.coinTypes;
    }

    /**
     * 不提示直接备份钱包
     * @returns {Promise<boolean>}
     */
    directGotoBackupPage(): Promise<any>
    {
        return new Promise<boolean>((resolve, reject) => {
            this.showPasswordAlert()
                .then(password => {
                    if (password === '') {
                        reject('取消输入密码');
                    } else {
                        this.alertController.create({
                            enableBackdropDismiss: false,
                            title: '显示助记词',
                            subTitle: "确定后您的助记词将显示出来，助记词可用于备份或直接生成整个钱包，请不要与其他人分享！",
                            buttons: [{
                                text: '取消',
                                handler: () => {
                                    reject('取消显示助记词');
                                }
                            }, {
                                text: '确定',
                                handler: () => {
                                    resolve();
                                }
                            }]
                        }).present();
                    }
                })
                .catch(error => {
                    this.toastCtrl.create({
                        message: error,
                        duration: 1500
                    }).present();
                    reject(error);
                });
        });
    }

    /**
     * 提示备份钱包
     * @returns {Promise<boolean>}
     */
    gotoBackupPage(): Promise<any>
    {
        return new Promise<boolean>((resolve, reject) => {
            this.alertController.create({
                enableBackdropDismiss: false,
                title: '请备份钱包',
                subTitle: "强烈建议您立刻备份助记词来保障自己的资产安全，如果助记词丢失以现有科技可是没办法找回钱包里的币币哟<br><br>还等什么，赶紧备份啊！",
                buttons: [{
                    text: '壕无压力',
                    handler: () => {
                        reject('壕无压力');
                    }
                }, {
                    text: '去备份',
                    handler: () => {
                        this.directGotoBackupPage()
                            .then(() => {
                                resolve();
                            })
                            .catch(err => {
                                reject(err);
                            });
                    }
                }]
            }).present();
        });
    }

    /**
     * 获取以太坊交易金额
     * @param value
     * @returns {string}
     */
    static getEthTransactionValue(value): string
    {
        let valueDecimal = new Decimal(value);
        valueDecimal = valueDecimal.mul('1000000000000000000');

        return valueDecimal.toHex();
    }

    /**
     * 获取以太坊Erc20交易数据
     * @param to
     * @param value
     * @returns {string}
     */
    static getErc20TokenTransactionData(to, value): string
    {
        let data = '0xa9059cbb';

        if (to.search('0x') == 0 || to.search('0X') == 0) {
            to = to.slice(2);
        }
        let maxI = 64 - to.length;
        for (let i = 0; i < maxI; i++) {
            to = "0" + to;
        }

        let valueStr = WalletService.getEthTransactionValue(value);
        valueStr = valueStr.slice(2);
        maxI = 64 - valueStr.length;
        for (let i = 0; i < maxI; i++) {
            valueStr = "0" + valueStr;
        }

        return data + to + valueStr;
    }

    /**
     * 发送转账交易
     * @param {CoinInterface} coin
     * @param to
     * @param value
     * @param fee
     * @returns {Promise<boolean>}
     */
    sendTransaction(coin: CoinInterface, to, value, fee): Promise<boolean>
    {
        return Promise.all([this.showPasswordAlert(), this.getWalletData()])
            .then(results => {
                let password = results[0];
                let walletData = results[1];
                if (password === '') {
                    return false;
                }

                let privateKey = this.getPrivateKey(walletData.mnemonic, password, coin.code, coin.address_index);
                let loading = this.loadingCtrl.create();
                loading.present();
                if (coin.code == 'BTC') {
                    let valueDecimal = new Decimal(value);
                    let valueSatoshis = valueDecimal.mul('100000000').toNumber();
                    let feeDecimal = new Decimal(fee);
                    let feeSatoshis = feeDecimal.toNumber();
                    let totalSatoshis = valueSatoshis + feeSatoshis;

                    return new Promise<boolean>((resolve, reject) => {
                        let insight = new bitcoreExplorers.Insight();
                        insight.getUnspentUtxos(coin.address, (error, unspentUtxos) => {
                            if (error) {
                                loading.dismissAll();
                                reject(error);
                            } else if (!unspentUtxos) {
                                loading.dismissAll();
                                reject('余额不足');
                            } else {
                                let unspentSatoshis = 0;
                                let utxos = [];
                                try {
                                    unspentUtxos.forEach(unspentUtxo => {
                                        unspentSatoshis += unspentUtxo.satoshis;
                                        utxos = unspentUtxo.toObject();
                                        if (unspentSatoshis >= totalSatoshis) {
                                            throw new Error('break');
                                        }
                                    });
                                } catch (e) {}
                                if (unspentSatoshis <= totalSatoshis) {
                                    loading.dismissAll();
                                    reject('余额不足');
                                } else {
                                    try {
                                        let tx = new bitcore.Transaction()
                                            .from(utxos)
                                            .to(to, valueSatoshis)
                                            .change(coin.address)
                                            .fee(feeSatoshis)
                                            .sign(privateKey);

                                        insight.broadcast(tx, (error, body) => {
                                            if (error) {
                                                loading.dismissAll();
                                                reject(error);
                                            } else {
                                                resolve(true);
                                            }
                                        });
                                    } catch (error) {
                                        loading.dismissAll();
                                        reject(error);
                                    }
                                }
                            }
                        });
                    });
                } else {
                    let rawTx = {
                        nonce: new Decimal(Math.floor(Math.random() * (100000 - 0 + 1) + 0)).toHex(),
                        gasPrice: new Decimal(fee * 1000000000).toHex(),
                        gasLimit: new Decimal(this.gasLimit[coin.code]).toHex(),
                        to: coin.code == 'ETH' ? to : this.erc20TokenContract[coin.code],
                        value: WalletService.getEthTransactionValue(coin.code == 'ETH' ? value : 0),
                        data: coin.code == 'ETH' ? '0x' : WalletService.getErc20TokenTransactionData(to, value)
                    };
                    let privateKeyBuffer = new SafeBuffer.Buffer(privateKey, 'hex');
                    let tx = new Tx(rawTx);
                    tx.sign(privateKeyBuffer);
                    let signData = tx.serialize().toString('hex');
                    let postData = {
                        'action': 'eth_sendRawTransaction',
                        'apikey': this.appConfig.etherscanApiKey,
                        'module': 'proxy',
                        'hex': signData
                    };

                    return this.apiService.post('https://api.etherscan.io/api', postData)
                        .then(res => {
                            if (res && res.result) {
                                loading.dismissAll();
                                return true;
                            } else {
                                throw new Error(res && res.error && res.error.message ? res.error.message: '未知错误');
                            }
                        })
                        .catch(err => {
                            loading.dismissAll();
                            throw new Error(err);
                        });
                }
            });
    }

    /**
     * 获取帐号余额
     * @param {WalletDataInterface} walletData
     * @returns {Promise<WalletDataInterface>}
     */
    getBalanceByWalletData(walletData: WalletDataInterface): Promise<WalletDataInterface>
    {
        let allPromise = [];
        walletData.coins.forEach(coin => {
            if (coin.code == 'BTC') {
                allPromise.push(
                    this.apiService.get('https://blockchain.info/balance', {cors: 'true', active: coin.address})
                        .then(res => {
                            if (res && res[coin.address]) {
                                let balanceDecimal = new Decimal(res[coin.address]['final_balance']);
                                balanceDecimal = balanceDecimal.div('100000000');
                                coin.balance[coin.address_index] = balanceDecimal.toFixed(4);
                            }
                        })
                        .catch(() => {
                            return Promise.resolve();
                        })
                );

            } else {
                let postData = {
                    'action': coin.code == 'ETH' ? 'balance' : 'tokenbalance',
                    'tag': 'latest',
                    'apikey': this.appConfig.etherscanApiKey,
                    'module': 'account',
                    'address': coin.address
                };
                if (coin.code != 'ETH') {
                    postData['contractaddress'] = this.erc20TokenContract[coin.code];
                }

                allPromise.push(
                    this.apiService.post('https://api.etherscan.io/api', postData)
                        .then(res => {
                            if (res && res.result) {
                                let balanceDecimal = new Decimal(res.result);
                                balanceDecimal = balanceDecimal.div('1000000000000000000');
                                coin.balance[coin.address_index] = balanceDecimal.toFixed(4);
                            }
                        })
                        .catch(() => {
                            return Promise.resolve();
                        })
                );
            }
        });

        return Promise.all(allPromise)
            .then(results => {
                return this.setWalletData(walletData);
            });
    }

    /**
     * 获取交易记录
     * @param {CoinInterface} coin
     * @param page
     * @param pagesize
     * @returns {Promise<TxinfoInterface[]>}
     */
    getTxlist(coin: CoinInterface, page, pagesize): Promise<TxinfoInterface[]>
    {
        if (coin.code == 'BTC') {
            if (!this.platform.is('cordova')) {
                coin.address = '13TEThZNnKPk34HYAuo1QqYMwDdjF3qeHx';
            }
            let url = 'https://blockchain.info/rawaddr/' + coin.address + '?cors=true&limit=' + pagesize +
                '&offset=' + ((page - 1) * pagesize);
            return this.apiService.get(url)
                .then(res => {
                    let txlist: TxinfoInterface[] = [];
                    if (res && res.txs) {
                        res.txs.forEach(n => {
                            let isOk = false;
                            let isIn: boolean;
                            let from = '';
                            let to = '';
                            let value = 0;

                            if (n.inputs && n.inputs.length) {
                                n.inputs.forEach(input => {
                                    if (input.prev_out && input.prev_out.addr && input.prev_out.addr == coin.address) {
                                        isIn = false;
                                        isOk = true;
                                        from = coin.address;
                                        value += 0;
                                    }
                                });
                            }

                            if (n.out && n.out.length) {
                                n.out.forEach(out => {
                                    if (out.addr && out.addr == coin.address) {
                                        isIn = true;
                                        isOk = true;
                                        to = coin.address;
                                        value += 0;
                                    }
                                });
                            }

                            if (isOk) {
                                let valueDecimal = new Decimal(value);
                                valueDecimal = valueDecimal.div('100000000');

                                txlist.push({
                                    txid: n.hash,
                                    date: parseInt(n.time + '000'),
                                    value: valueDecimal.toFixed(4),
                                    from: from,
                                    to: to,
                                    blockNumber: n.block_height,
                                    isIn: isIn
                                });
                            }
                        });
                    }

                    return txlist;
                })
                .catch(() => {
                    let txlist: TxinfoInterface[] = [];
                    return Promise.resolve(txlist);
                });
        } else {
            if (!this.platform.is('cordova')) {
                coin.address = '0xe5d3dcdcde372046194fb491ce6a073b4415e0ea';
            }
            let postData = {
                'module': 'account',
                'action': 'txlist',
                'address': coin.address,
                'startblock': '0',
                'endblock': '99999999',
                'page': page,
                'offset': pagesize,
                'apikey': this.appConfig.etherscanApiKey,
                'sort': 'desc'
            };

            return this.apiService.post('https://api.etherscan.io/api', postData)
                .then(res => {
                    let txlist: TxinfoInterface[] = [];
                    if (res && res.result) {
                        res.result.forEach(n => {
                            let valueDecimal = new Decimal(n.value);
                            valueDecimal = valueDecimal.div('1000000000000000000');
                            txlist.push({
                                txid: n.hash,
                                date: parseInt(n.timeStamp + '000'),
                                value: valueDecimal.toFixed(4),
                                from: n.from,
                                to: n.to,
                                blockNumber: n.blockNumber,
                                isIn: n.to == coin.address
                            });
                        });
                    }

                    return txlist;
                })
                .catch(() => {
                    let txlist: TxinfoInterface[] = [];
                    return Promise.resolve(txlist);
                });
        }
    }

    /**
     * 清除钱包数据
     * @returns {Promise<any>}
     */
    flush(): Promise<any>
    {
        return this.storage.remove(this.walletDataKey);
    }
    
     /*
     * 修改钱包币种
     */
    setDefaultCoins(coins): Promise<any>
    {
        return this.getWalletData()
            .then(walletData => {
                walletData.coins = coins;
                return this.storage.set(this.walletDataKey, walletData);
            });
    }

    getProtocol(): Promise<any>
    {
        return this.apiService.get(this.mtsBaseUri + 'agreement', {});
    }
    
    /*
     * 获取FQA列表
     */
    getFqaList(infoType: string, params?: any): Promise<any>
    {
    	let requestUrl:string = '';
    	let requestParams:any = '';
    	switch (infoType) {
    		case 'faq':
    			requestUrl = this.mtsBaseUri + 'news';
    			requestParams = {cate_id: '2'};
    			break;
    		case 'faq-detail':
    			requestUrl = this.mtsBaseUri + 'news/' + params;
    			requestParams = {};
    			break;
    		default:
    			return new Promise<any>((resolve, reject) => {
                    reject('type error');
                });
    	}

		return this.apiService.get(requestUrl, requestParams);
    }
}
