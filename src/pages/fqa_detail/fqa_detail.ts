import {Component, OnInit} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {WalletService} from '../../services/wallet';

@Component({
	selector: 'page-fqa-detail',
	templateUrl: 'fqa_detail.html'
})
export class FqaDetailPage implements OnInit
{
    title = '';

    content = '';

    public loadError: boolean = false;

    public isLoading: boolean = false;


    constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public walletService: WalletService
	) {
		this.walletService.getFqaList('faq-detail', navParams.get('articleId'))
			.then(response => {
			    this.title = response.title;
				this.content = response.content;
			});
	}

    ngOnInit(): void
    {
        this.loadError = false;
        this.isLoading = true;

        this.walletService.getFqaList('faq-detail', this.navParams.get('articleId'))
            .then(response => {
                this.isLoading = false;
                this.title = response.title;
                this.content = response.content;
            })
            .catch(() => {
                this.isLoading = false;
                this.loadError = true;
            });
    }
}
