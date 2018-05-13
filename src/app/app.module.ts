import {NgModule, ErrorHandler} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {IonicApp, IonicModule, IonicErrorHandler} from 'ionic-angular';
import {MyApp} from './app.component';
import {QrcodeComponent} from './qrcode.component';

import {ApiService} from '../services/api';
import {AppConfig} from '../services/app-config';
import {WalletService} from '../services/wallet';

import {SettingPage} from '../pages/setting/setting';
import {HomePage} from '../pages/home/home';
import {StartPage} from '../pages/start/start';
import {CreatePage} from '../pages/create/create';
import {CreateSuccessPage} from '../pages/create_success/create_success';
import {ImportPage} from '../pages/import/import';
import {ImportSuccessPage} from '../pages/import_success/import_success';
import {BackupPage} from '../pages/backup/backup';
import {AddressPage} from '../pages/address/address';
import {AddressRefreshPage} from '../pages/address_refresh/address_refresh';
import {CoinPage} from '../pages/coin/coin';
import {CoinListPage} from '../pages/coin_list/coin_list';
import {CoinTransferPage} from '../pages/coin_transfer/coin_transfer';
import {TxPage} from '../pages/tx/tx';
import {TabsPage} from '../pages/tabs/tabs';
import {FqaPage} from '../pages/fqa/fqa';
import {FqaDetailPage} from '../pages/fqa_detail/fqa_detail'
import {ProtocolPage} from '../pages/protocol/protocol'

import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {IonicStorageModule} from '@ionic/storage';
import {Clipboard} from '@ionic-native/clipboard';
import {HTTP} from '@ionic-native/http';
import {HttpClientModule} from "@angular/common/http";


@NgModule({
    declarations: [
        MyApp,
        SettingPage,
        HomePage,
        StartPage,
        CreatePage,
        CreateSuccessPage,
        ImportPage,
        ImportSuccessPage,
        BackupPage,
        AddressPage,
        AddressRefreshPage,
        CoinPage,
        CoinListPage,
        CoinTransferPage,
        TxPage,
        TabsPage,
        QrcodeComponent,
        FqaPage,
        FqaDetailPage,
        ProtocolPage
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        IonicModule.forRoot(MyApp, {
            backButtonText: '',
            iconMode: 'ios',
            modalEnter: 'modal-slide-in',
            modalLeave: 'modal-slide-out',
            tabsPlacement: 'bottom',
            pageTransition: 'ios-transition',
            swipeBackEnabled: true,
            mode: 'ios',
            tabsHideOnSubPages: true
        }),
        IonicStorageModule.forRoot()
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        SettingPage,
        HomePage,
        StartPage,
        CreatePage,
        CreateSuccessPage,
        ImportPage,
        ImportSuccessPage,
        BackupPage,
        AddressPage,
        AddressRefreshPage,
        CoinPage,
        CoinListPage,
        CoinTransferPage,
        TxPage,
        TabsPage,
        FqaPage,
        FqaDetailPage,
        ProtocolPage
    ],
    providers: [
        StatusBar,
        SplashScreen,
        Clipboard,
        ApiService,
        AppConfig,
        WalletService,
        HTTP,
        {provide: ErrorHandler, useClass: IonicErrorHandler}
    ]
})
export class AppModule {
}
