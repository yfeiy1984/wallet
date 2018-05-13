import {Injectable, isDevMode} from '@angular/core';

@Injectable()
export class AppConfig
{
    public readonly appName: string = 'MTS';

    public readonly appVersion: string = '0.0.1';

    public readonly etherscanApiKey = 'DSH5B24BQYKD1AD8KUCDY3SAQSS6ZAU175';

    constructor()
    {

    }
}
