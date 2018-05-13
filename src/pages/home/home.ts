import {Component, ViewChild} from '@angular/core';
import {Navbar, NavController, Platform, ToastController} from 'ionic-angular';
import {WalletService} from '../../services/wallet';
import {WalletDataInterface} from "../../interfaces/wallet-data";
import {BackupPage} from '../backup/backup';
import {CoinPage} from '../coin/coin';
import {CoinListPage} from '../coin_list/coin_list';
import {SettingPage} from '../setting/setting';
import {CoinInterface} from "../../interfaces/coin";
declare var cordova: any;

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage
{
    @ViewChild(Navbar) navBar: Navbar;

    coinCategory = 'master';

    isBackup = true;

    coins: CoinInterface[];

    walletData: WalletDataInterface;

    totalRmb = '0.00';

    constructor(
        public navCtrl: NavController,
        public walletService: WalletService,
        public toastCtrl: ToastController,
        public platform: Platform
    ) {
        this.walletService.getWalletData()
            .then((walletData: WalletDataInterface) => {
//              console.log(walletData)	//coins从localstroage读出
                this.isBackup = walletData.isBackup;
                this.coins = walletData.coins;
                this.walletData = walletData;
                if (!walletData.isBackup) {
                    this.gotoBackupPage();
                }
                this.walletService.getBalanceByWalletData(walletData)
                    .then((walletData: WalletDataInterface) => {
                        this.walletData = walletData;
                    });
            });
    }

    ionViewDidLoad()
    {
        this.navBar.backButtonClick = () => {
            if (this.platform.is('ios')) {
                this.platform.ready().then(() => {
                    cordova.plugins.mts.goback();
                });
            } else {
                this.platform.exitApp();
            }
        };
    }

    ionViewWillEnter()
    {
        if (!this.isBackup) {
            this.walletService.getWalletData()
                .then((walletData: WalletDataInterface) => {
                    this.isBackup = walletData.isBackup;
                });
        }
    }

    gotoBackupPage()
    {
        this.walletService.gotoBackupPage()
            .then((is_go: boolean) => {
                this.navCtrl.push(BackupPage);
            })
            .catch(err => {

            });
    }

    directGotoBackupPage()
    {
        this.walletService.directGotoBackupPage()
            .then(() => {
                this.navCtrl.push(BackupPage);
            })
            .catch(err => {

            });
    }

    gotoCoinPage(coin: CoinInterface)
    {
        this.navCtrl.push(CoinPage, {coin: coin, walletData: this.walletData});
    }
    
    gotoCoinList()
    {
    	this.navCtrl.push(CoinListPage)
    }
    
    gotoSetting(){
    	this.navCtrl.push(SettingPage);
    }
}
