import {Component} from '@angular/core';
import {AlertController, NavController, ToastController, App} from 'ionic-angular';
import {BackupPage} from "../backup/backup";
import {StartPage} from "../start/start";
import {WalletService} from "../../services/wallet";
import {WalletDataInterface} from "../../interfaces/wallet-data";
import {AddressPage} from "../address/address";
import {AddressRefreshPage} from "../address_refresh/address_refresh";
import {FqaPage} from "../fqa/fqa";

@Component({
    selector: 'page-setting',
    templateUrl: 'setting.html'
})
export class SettingPage
{
    constructor(
        public navCtrl: NavController,
        public walletService: WalletService,
        public alertController: AlertController,
        public toastCtrl: ToastController,
        public app: App
    ) {

    }

    gotoBackupPage()
    {
        this.walletService.directGotoBackupPage()
            .then(() => {
                this.navCtrl.push(BackupPage);
            })
            .catch(err => {

            });
    }

    gotoImportPage()
    {
        this.walletService.showPasswordAlert()
            .then(password => {
                if (password !== '') {
                    this.walletService.getWalletData()
                        .then((walletData: WalletDataInterface) => {
                            if (!walletData.isBackup) {
                                this.toastCtrl.create({
                                    message: '请先备份钱包',
                                    duration: 1500
                                }).present();
                            } else {
                                this.alertController.create({
                                    title: '覆盖当前钱包？',
                                    subTitle: "确定后您的原有助记词将被覆盖，请您先做好原助记词的备份。",
                                    buttons: ['取消', {
                                        text: '确定',
                                        handler: () => {
                                            this.walletService.flush()
                                                .then(() => {
                                                    this.app.getRootNav().push(StartPage);
                                                })
                                                .catch(err => {
                                                    this.toastCtrl.create({
                                                        message: err,
                                                        duration: 1500
                                                    }).present();
                                                });
                                        }
                                    }]
                                }).present();
                            }
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

    gotoAddressPage()
    {
        this.walletService.getWalletData()
            .then((walletData: WalletDataInterface) => {
                if (!walletData.isBackup) {
                    this.walletService.gotoBackupPage()
                        .then(is_go => {
                            if (is_go) {
                                this.navCtrl.push(BackupPage);
                            }
                        })
                        .catch(err => {

                        });
                } else {
                    this.navCtrl.push(AddressPage);
                }
            })
            .catch(err => {

            });
    }

    gotoAddressRefreshPage()
    {
        this.walletService.getWalletData()
            .then((walletData: WalletDataInterface) => {
                if (!walletData.isBackup) {
                    this.walletService.gotoBackupPage()
                        .then(is_go => {
                            if (is_go) {
                                this.navCtrl.push(BackupPage);
                            }
                        })
                        .catch(err => {

                        });
                } else {
                    this.navCtrl.push(AddressRefreshPage);
                }
            })
            .catch(err => {

            });
    }
    
    gotoFqaPage()
    {
    	this.navCtrl.push(FqaPage);
    }
}
