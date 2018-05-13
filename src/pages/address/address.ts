import {Component} from '@angular/core';
import {AlertController, NavController, ToastController, App} from 'ionic-angular';
import {WalletService} from "../../services/wallet";
import {CoinInterface} from "../../interfaces/coin";
import {Clipboard} from '@ionic-native/clipboard';

@Component({
    selector: 'page-address',
    templateUrl: 'address.html'
})
export class AddressPage
{
    coinType = '';

    coinTypes = [];

    coin: CoinInterface;

    constructor(
        public navCtrl: NavController,
        public walletService: WalletService,
        public alertController: AlertController,
        public toastCtrl: ToastController,
        public app: App,
        public clipboard: Clipboard
    ) {
        this.coinTypes = walletService.getCoinTypes();
        this.coinType = this.coinTypes[0].code;
        walletService.getCoin(this.coinType)
            .then(coin => {
                this.coin = coin;
            });
    }

    selectCoin()
    {
        this.walletService.getCoin(this.coinType)
            .then(coin => {
                this.coin = coin;
            });
    }

    exportPrivateKey(address_index)
    {
        this.walletService.showPasswordAlert()
            .then(password => {
                if (password !== '') {
                    this.walletService.getWalletData()
                        .then(walletData => {
                            let privateKey = this.walletService.getPrivateKey(
                                walletData.mnemonic,
                                password,
                                this.coin.code,
                                address_index
                            );

                            this.alertController.create({
                                cssClass: 'export-private-key-alert',
                                title: '导出私钥',
                                subTitle: '<div class="notice">警告：私钥未加密，导出后存在安全风险，千万不要丢失、泄露或发送给其他人！</div>' +
                                '<div class="private-key">' + privateKey + '</div>',
                                buttons: [
                                    '关闭',
                                    {
                                        text: '复制私钥',
                                        handler: data => {
                                            this.clipboard.copy(privateKey)
                                                .then(() => {
                                                    this.toastCtrl.create({
                                                        message: '复制成功',
                                                        duration: 1500
                                                    }).present();
                                                })
                                                .catch(() => {
                                                    this.toastCtrl.create({
                                                        message: '复制失败',
                                                        duration: 1500
                                                    }).present();
                                                });
                                        }
                                    }
                                ]
                            }).present();
                        });
                }
            })
            .catch(error => {
                this.toastCtrl.create({
                    message: error,
                    duration: 1500
                }).present();
            });
    }
}
