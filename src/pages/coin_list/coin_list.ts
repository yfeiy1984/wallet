import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {WalletService} from '../../services/wallet';
import {WalletDataInterface} from "../../interfaces/wallet-data";
import {CoinInterface} from "../../interfaces/coin";
import {HomePage} from '../home/home';
@Component ({
	selector: 'page-coin-list',
	templateUrl: 'coin_list.html'
})
export class CoinListPage
{
	
	coins: CoinInterface[];
	
	constructor(
		public navCtrl: NavController,
		public walletService: WalletService
	){
		this.walletService.getWalletData()
			.then((walletData: WalletDataInterface) => {
			this.coins = walletData.coins;
		});
	}
	
	gotoHome()
	{
		this.walletService.setDefaultCoins(this.coins)
			.then(() => {
				this.navCtrl.push(HomePage)
			});
	}
}























