import {Component} from '@angular/core';
import {NavController, ToastController, NavParams} from 'ionic-angular';
import {WalletService} from '../../services/wallet';
import {CoinInterface} from "../../interfaces/coin";
import * as bitcore from 'bitcore-lib';

@Component({
    selector: 'page-coin-transfer',
    templateUrl: 'coin_transfer.html'
})
export class CoinTransferPage
{
    coin: CoinInterface;

    transferData = {
        to: '',
        value: '',
        fee: 0,
        remark: ''
    };

    minFee = 0;

    maxFee = 0;

    constructor(
        public navCtrl: NavController,
        public walletService: WalletService,
        public toastCtrl: ToastController,
        public navParams: NavParams
    ) {
        this.coin = this.navParams.get('coin');
        this.initFee();
    }

    initFee()
    {
        if (this.coin.code == 'BTC') {
            this.minFee = 10000;
            this.maxFee = 500000;
            this.transferData.fee = 50000;
        } else {
            this.minFee = 1;
            this.maxFee = 99;
            this.transferData.fee = 21;
        }
    }

    formatFee()
    {
        let fee = '';
        if (this.coin.code == 'BTC') {
            fee = (this.transferData.fee / 100000000).toFixed(8);
        } else {
            fee = (this.transferData.fee * this.walletService.gasLimit[this.coin.code] / 1000000000).toFixed(8);
        }

        return fee + ' ' + (this.coin.code == 'BTC' ? 'BTC' : 'ETH')
    }

    transfer()
    {
        if (this.transferData.to == '') {
            this.toastCtrl.create({
                message: '请输入收款人钱包地址',
                duration: 1500
            }).present();
            return false;
        }
        if ((this.coin.code == 'BTC' && !bitcore.Address.isValid(this.transferData.to)) ||
            (this.coin.code != 'BTC' && !/^0[xX]{1}[0-9a-zA-Z]{40}$/.test(this.transferData.to))
        ) {
            if (!bitcore.Address.isValid(this.transferData.to)) {
                this.toastCtrl.create({
                    message: '收款人钱包地址不正确',
                    duration: 1500
                }).present();
                return false;
            }
        }
        if (this.transferData.value == '') {
            this.toastCtrl.create({
                message: '请输入转账金额',
                duration: 1500
            }).present();
            return false;
        }
        if (!/^\d+(\.\d+)?$/i.test(this.transferData.value)) {
            this.toastCtrl.create({
                message: '转账金额格式不正确',
                duration: 1500
            }).present();
            return false;
        }

        this.walletService.sendTransaction(
            this.coin,
            this.transferData.to,
            this.transferData.value,
            this.transferData.fee
        ).then((is_success) => {
            if (is_success) {
                this.toastCtrl.create({
                    message: is_success ? '发送成功' : '转账失败',
                    duration: 1500
                }).present();
                this.navCtrl.pop();
            }
        }).catch(error => {
            console.log(error);
            this.toastCtrl.create({
                message: error,
                duration: 1500
            }).present();
        });
    }
}
