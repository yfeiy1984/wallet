import {Component} from '@angular/core';
import {Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {StartPage} from '../pages/start/start';
import {HomePage} from '../pages/home/home';
import {WalletService} from '../services/wallet';
import {WalletDataInterface} from "../interfaces/wallet-data";

@Component({
    templateUrl: 'app.html'
})
export class MyApp
{
    rootPage: any;

    constructor(
        platform: Platform,
        statusBar: StatusBar,
        splashScreen: SplashScreen,
        walletService: WalletService
    ) {
        platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            statusBar.styleDefault();
            splashScreen.hide();
        });

        walletService.getWalletData()
            .then((walletData: WalletDataInterface) => {
                if (walletData && walletData.isInit) {
					this.rootPage = HomePage;
                } else {
                    this.rootPage = StartPage;
                }
            });
    }
}
