import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
//import {TabsPage} from '../tabs/tabs';
import {HomePage} from '../home/home';

@Component({
    selector: 'page-create-success',
    templateUrl: 'create_success.html'
})
export class CreateSuccessPage
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
