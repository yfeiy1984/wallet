import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {TxinfoInterface} from "../../interfaces/txinfo";
import {CoinInterface} from "../../interfaces/coin";

@Component({
    selector: 'page-tx',
    templateUrl: 'tx.html'
})
export class TxPage
{
    txinfo: TxinfoInterface;

    coins: CoinInterface;

    constructor(public navCtrl: NavController, navParams: NavParams)
    {
        this.coins = navParams.get('coin');
        this.txinfo = navParams.get('txinfo');
    }
}
