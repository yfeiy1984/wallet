import {Component, ViewChild} from '@angular/core';
import {NavController, Platform, Navbar} from 'ionic-angular';
import {CreatePage} from '../create/create';
import {ImportPage} from '../import/import';
import {AppConfig} from '../../services/app-config';
declare var cordova: any;

@Component({
    selector: 'page-start',
    templateUrl: 'start.html'
})
export class StartPage
{
    @ViewChild(Navbar) navBar: Navbar;

    constructor(public navCtrl: NavController, public appConfig: AppConfig, public platform: Platform)
    {

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

    gotoCreatePage()
    {
        this.navCtrl.push(CreatePage);
    }

    gotoImportPage()
    {
        this.navCtrl.push(ImportPage);
    }
}
