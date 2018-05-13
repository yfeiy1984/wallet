/// <reference path="../../qrcode-generator.d.ts"/>
import {Component} from '@angular/core';
import {NavController, ToastController, NavParams, AlertController, InfiniteScroll, Refresher} from 'ionic-angular';
import {AppConfig} from '../../services/app-config';
import {WalletService} from '../../services/wallet';
import {WalletDataInterface} from "../../interfaces/wallet-data";
import {CoinInterface} from "../../interfaces/coin";
import {TxinfoInterface} from "../../interfaces/txinfo";
import {BackupPage} from "../backup/backup";
import {CoinTransferPage} from "../coin_transfer/coin_transfer";
import {TxPage} from "../tx/tx";
import {Clipboard} from '@ionic-native/clipboard';
import * as qrcode from "qrcode-generator";

@Component({
    selector: 'page-coin',
    templateUrl: 'coin.html'
})
export class CoinPage
{
    coin: CoinInterface;

    walletData: WalletDataInterface;

    isBackup = false;

    addressQrcode = '';

    txlist: TxinfoInterface[] = [];

    public loadError: boolean = false;

    public isLoading: boolean = true;

    page = 1;

    pagesize = 20;

    constructor(
        public navCtrl: NavController,
        public appConfig: AppConfig,
        public walletService: WalletService,
        public toastCtrl: ToastController,
        public navParams: NavParams,
        public alertController: AlertController,
        public clipboard: Clipboard
    ) {
        this.coin = navParams.get('coin');
        this.walletData = navParams.get('walletData');
        this.isBackup = this.walletData.isBackup;
        this.doRefresh(null, true);
    }

    ionViewDidEnter()
    {
        this.walletService.getWalletData()
            .then((walletData: WalletDataInterface) => {
                if (!walletData.isBackup) {
                    this.gotoBackupPage();
                }
                this.isBackup = walletData.isBackup;
            });
    }

    gotoBackupPage()
    {
        this.walletService.gotoBackupPage()
            .then(() => {
                this.navCtrl.push(BackupPage);
            })
            .catch(() => {
                this.navCtrl.pop();
            });
    }

    gotoCoinTransferPage()
    {
        this.navCtrl.push(CoinTransferPage, {coin: this.coin});
    }

    copyAddress()
    {
        this.clipboard.copy(this.coin.address)
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

    showAddressQrcode()
    {
        if (this.addressQrcode == '') {
            let qr = qrcode(8, 'M');
            qr.addData(this.coin.address);
            qr.make();
            this.addressQrcode = qr.createImgTag(4, 0);
        }

        this.alertController.create({
            subTitle: this.addressQrcode
        }).present();
    }

    gotoTxPage(txinfo)
    {
        this.navCtrl.push(TxPage, {coin: this.coin, txinfo: txinfo});
    }

    doRefresh(refresher?: Refresher, showLoading: boolean = false)
    {
        if (showLoading) {
            this.loadError = false;
            this.isLoading = true;
        }

        this.page = 1;
        this.walletService
            .getTxlist(this.coin, this.page, this.pagesize)
            .then(response => {
                if (showLoading) {
                    this.isLoading = false;
                }
                this.txlist = response;
                if (refresher) {
                    refresher.complete();
                }
            })
            .catch(error => {
                if (showLoading) {
                    this.isLoading = false;
                    this.loadError = true;
                }
                if (refresher) {
                    refresher.complete();
                }
            });
    }

    doInfinite(infiniteScroll: InfiniteScroll)
    {
        this.page++;
        this.walletService
            .getTxlist(this.coin, this.page, this.pagesize)
            .then(response => {
                this.txlist = this.txlist.concat(response);
                infiniteScroll.complete();
                infiniteScroll.enable(response.length == this.pagesize);
            })
            .catch(error => {
                infiniteScroll.complete();
            });
    }
}
