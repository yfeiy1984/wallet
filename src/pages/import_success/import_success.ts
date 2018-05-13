import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
//import {TabsPage} from '../tabs/tabs';
import {HomePage} from '../home/home';

@Component({
    selector: 'page-import-success',
    templateUrl: 'import_success.html'
})
export class ImportSuccessPage
{
    constructor(public navCtrl: NavController)
    {

    }

    start()
    {
//      this.navCtrl.setRoot(TabsPage);
		this.navCtrl.setRoot(HomePage);
    }
}
