import {Component, OnInit} from '@angular/core';
import {NavParams} from 'ionic-angular';
import {WalletService} from "../../services/wallet";

@Component({
    selector: 'page-protocol',
    templateUrl: 'protocol.html'
})
export class ProtocolPage implements OnInit
{
    public content: string;

    public loadError: boolean = false;

    public isLoading: boolean = false;

    constructor(private params: NavParams, public walletService: WalletService)
    {

    }

    ngOnInit(): void
    {
        this.loadError = false;
        this.isLoading = true;

        this.walletService
            .getProtocol()
            .then(response => {
                this.isLoading = false;
                if (response.code == 200) {
                    this.content = response.data.agreement;
                }
            })
            .catch((error: any) => {
                this.isLoading = false;
                this.loadError = true;
            });
    }
}
