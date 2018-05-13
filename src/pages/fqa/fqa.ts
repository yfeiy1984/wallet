import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {WalletService} from '../../services/wallet';
import {FqaDetailPage} from '../fqa_detail/fqa_detail';

@Component({
	selector: 'page-fqa',
	templateUrl: 'fqa.html'
})
export class FqaPage
{
	fqalist = [];
	
	constructor(
		public navCtrl: NavController,
		public walletService: WalletService
	) {
		this.walletService.getFqaList('faq')
			.then(response => {
				this.fqalist = response;
			});
	}
	
	gotoFqaDetail(articleId)
    {
		this.navCtrl.push(FqaDetailPage, {articleId: articleId});
	}
}
