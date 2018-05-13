import {Component} from '@angular/core';
import {NavController, AlertController, LoadingController, ToastController} from 'ionic-angular';
import {AppConfig} from '../../services/app-config';
import {WalletService} from '../../services/wallet';
import {ImportSuccessPage} from '../import_success/import_success';

@Component({
    selector: 'page-import',
    templateUrl: 'import.html'
})
export class ImportPage
{
    mnemonic = '';

    password = '';

    repassword = '';

    is_agree = false;

    constructor(
        public navCtrl: NavController,
        public appConfig: AppConfig,
        public alertController: AlertController,
        public walletService: WalletService,
        public loadingCtrl: LoadingController,
        private toastCtrl: ToastController
    ) {

    }

    import()
    {
        if (!this.is_agree) {
            this.toastCtrl.create({
                message: '请先阅读并同意《' + this.appConfig.appName + '用户协议》！',
                duration: 1500
            }).present();
            return false;
        }
        if (this.mnemonic == '') {
            this.toastCtrl.create({
                message: '请输入助记词',
                duration: 1500
            }).present();
            return false;
        }
        if (this.password == '') {
            this.toastCtrl.create({
                message: '请输入钱包密码',
                duration: 1500
            }).present();
            return false;
        }
        if (this.password.length < 6) {
            this.toastCtrl.create({
                message: '钱包密码不能少于6位',
                duration: 1500
            }).present();
            return false;
        }
        if (this.password != this.repassword) {
            this.toastCtrl.create({
                message: '两次密码输入不一致',
                duration: 1500
            }).present();
            return false;
        }
        if (this.mnemonic.split(' ').length != 12) {
            this.toastCtrl.create({
                message: '输入单词数量不正确',
                duration: 1500
            }).present();
            return false;
        }

        let loading = this.loadingCtrl.create();
        loading.present();
        this.walletService.init(this.password, this.mnemonic)
            .then((a) => {
                loading.dismissAll();
                this.navCtrl.pop({animate: false}, () => {
                    this.navCtrl.push(ImportSuccessPage);
                    this.navCtrl.remove(0);
                });
            })
            .catch(error => {
                this.toastCtrl.create({
                    message: '未知错误，请重试',
                    duration: 1500
                }).present();
                loading.dismissAll();
            });
    }
}
