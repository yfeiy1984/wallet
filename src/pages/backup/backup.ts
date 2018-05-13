/// <reference path="../../qrcode-generator.d.ts"/>
import {Component} from '@angular/core';
import {AlertController, NavController, ToastController} from 'ionic-angular';
import {WalletService} from '../../services/wallet';
import {WalletDataInterface} from "../../interfaces/wallet-data";
import {remove} from 'lodash';
import * as qrcode from "qrcode-generator";

@Component({
    selector: 'page-backup',
    templateUrl: 'backup.html'
})
export class BackupPage
{
    step = 1;

    mnemonic: string;

    mnemonics = [];

    defaultSelectedMnemonicsStr = '请按顺序选择您刚才写在纸上的助记词';

    selectedMnemonicsStr = this.defaultSelectedMnemonicsStr;

    selectedMnemonicsArr = [];

    mnemonicQrcode = '';

    constructor(
        public navCtrl: NavController,
        public walletService: WalletService,
        public toastCtrl: ToastController,
        public alertController: AlertController
    ) {
        this.walletService.getWalletData()
            .then((walletData: WalletDataInterface) => {
                console.log(walletData);
                if (walletData) {
                    this.mnemonic = walletData.mnemonic;
                    let sortMnemonics = this.mnemonic.split(' ');
                    sortMnemonics.sort(() => {
                        return (0.5 - Math.random());
                    });
                    sortMnemonics.forEach((n, i) => {
                        this.mnemonics.push({
                            mnemonic: n,
                            is_selected: false
                        });
                    });
                }
            });
    }

    startBackup()
    {
        this.step = 2;
    }

    toggleIsSelected(item)
    {
        if (item.is_selected) {
            item.is_selected = false;
            remove(this.selectedMnemonicsArr, (n) => {
                return n == item.mnemonic;
            });
            this.selectedMnemonicsStr = this.selectedMnemonicsArr.join(' ');
            if (this.selectedMnemonicsStr == '') {
                this.selectedMnemonicsStr = this.defaultSelectedMnemonicsStr;
            }
        } else {
            item.is_selected = true;
            this.selectedMnemonicsArr.push(item.mnemonic);
            this.selectedMnemonicsStr = this.selectedMnemonicsArr.join(' ');
        }
    }

    backup()
    {
        if (this.selectedMnemonicsArr.length != 12 || this.selectedMnemonicsStr != this.mnemonic) {
            this.toastCtrl.create({
                message: '请按正确的助记词顺序，依次点选后再确定',
                duration: 1500
            }).present();
            this.selectedMnemonicsArr = [];
            this.selectedMnemonicsStr = this.defaultSelectedMnemonicsStr;
            this.mnemonics.forEach(n => {
                 n.is_selected = false;
            });
            return false;
        }

        this.walletService.getWalletData()
            .then((walletData: WalletDataInterface) => {
                walletData.isBackup = true;
                return this.walletService.setWalletData(walletData);
            })
            .then((walletData: WalletDataInterface) => {
                this.alertController.create({
                    title: '备份完成',
                    subTitle: "使用助记词可以恢复您的钱包，请妥善保存，不要与他人分享助记词",
                    buttons: [{
                        text: '确定',
                        handler: () => {
                            this.navCtrl.pop();
                        }
                    }]
                }).present();
            })
            .catch(err => {
                this.toastCtrl.create({
                    message: err,
                    duration: 1500
                }).present();
            });
    }

    showQrcode()
    {
        if (this.mnemonicQrcode == '') {
            let qr = qrcode(8, 'M');
            qr.addData(this.mnemonic);
            qr.make();
            this.mnemonicQrcode = qr.createImgTag(4, 0);
        }

        this.alertController.create({
            subTitle: this.mnemonicQrcode
        }).present();
    }
}
