import {Component} from '@angular/core';
import {NavController, LoadingController, ToastController} from 'ionic-angular';
import {WalletService} from '../../services/wallet';
import {CreateSuccessPage} from '../create_success/create_success';
import {ProtocolPage} from '../protocol/protocol';

@Component({
    selector: 'page-create',
    templateUrl: 'create.html'
})
export class CreatePage
{
    password = '';

    repassword = '';

    is_agree = false;

    constructor(
        public navCtrl: NavController,
        public walletService: WalletService,
        public loadingCtrl: LoadingController,
        private toastCtrl: ToastController
    ) {

    }

    create()
    {
        if (!this.is_agree) {
            this.toastCtrl.create({
                message: '请先阅读并同意《MTS钱包用户协议》！',
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

        let loading = this.loadingCtrl.create();
        loading.present();
        this.walletService.init(this.password)
            .then((a) => {
                loading.dismissAll();
                this.navCtrl.pop({animate: false}, () => {
                    this.navCtrl.push(CreateSuccessPage);
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

    gotoProtocolPage(event: Event)
    {
        this.navCtrl.push(ProtocolPage);
        event.stopPropagation();
    }
}
