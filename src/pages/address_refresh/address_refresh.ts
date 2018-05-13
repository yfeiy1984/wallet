import {Component} from '@angular/core';
import {LoadingController, NavController, ToastController, App} from 'ionic-angular';
import {WalletService} from "../../services/wallet";
import {CoinInterface} from "../../interfaces/coin";
import {Clipboard} from '@ionic-native/clipboard';
import {WalletDataInterface} from "../../interfaces/wallet-data";

@Component({
    selector: 'page-address-refresh',
    templateUrl: 'address_refresh.html'
})
export class AddressRefreshPage
{
    coinType = '';

    coinTypes = [];

    coin: CoinInterface;

    constructor(
        public navCtrl: NavController,
        public walletService: WalletService,
        public loadingController: LoadingController,
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

    refresh()
    {
        let loading = this.loadingController.create();
        loading.present();

        this.walletService.refreshAddress(this.coinType)
            .then((coin: CoinInterface) => {
                loading.dismissAll();
                this.toastCtrl.create({
                    message: '地址已更新！',
                    duration: 1500
                }).present();
                this.coin = coin;
            })
            .catch(err => {
                console.log(err);
                loading.dismissAll();
                this.toastCtrl.create({
                    message: err,
                    duration: 1500
                }).present();
            });
    }
}
