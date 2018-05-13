import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Platform, ToastController} from 'ionic-angular';
import {HTTP as NativeHTTP} from '@ionic-native/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ApiService
{
    constructor(
        private httpClient: HttpClient,
        private nativeHTTP: NativeHTTP,
        private toastCtrl: ToastController,
        private platform: Platform,
    ) {

    }

    public request(method: string, requestUrl: string, searchOrBody?: any): Promise<any>
    {
        if (!this.platform.is('cordova')) {
            let requestUrlOptions = {};
            let httpParams = new HttpParams({
                fromObject: searchOrBody
            });
            if (method == 'POST') {
                requestUrlOptions['body'] = httpParams;
            } else {
                requestUrlOptions['params'] = httpParams;
            }
            return this.httpClient.request(method, requestUrl, requestUrlOptions)
                .toPromise();
        } else {
            let nativeHTTPMethod = method == 'GET' ? 'get' : 'post';
            return this.nativeHTTP[nativeHTTPMethod](requestUrl, searchOrBody, {})
                .then(response => {
                    return JSON.parse(response.data);
                });
        }
    }

    public get(requestUrl: string, searchParams?: any): Promise<any>
    {
        return this.request('GET', requestUrl, searchParams);
    }

    public post(requestUrl: string, body?: any): Promise<any>
    {
        return this.request('POST', requestUrl, body);
    }
    
	public jsonp(requestUrl: string, searchParams?: any): Promise<any>
	{
		return new Promise ((fulfill,reject) => {
			let callBackRadom:string = "callback_" + String(new Date().getTime()) + String(parseInt(String(Math.random()*100)))
		    let query:Array<string> = new Array();
		    for (let i in searchParams){
		    	query.push(encodeURIComponent(i) + '=' + encodeURIComponent(searchParams[i]));
		    }
		    let param = query.length ? '?' + query.join('&') : '';
		    let script = document.createElement('script');
		    script.type = 'text/javascript';
		    if(param != null && param.length > 0) {
		    	script.src = requestUrl + param + '&callback=' + callBackRadom;
		    }else{
		    	script.src = requestUrl + '?callback=' + callBackRadom;
		    }
		    script.id = callBackRadom;
		    
		    document.querySelector('head').appendChild(script);
		    
		    window[callBackRadom] = res => {
		    	try{
			      fulfill(res);
			      document.querySelector('head').removeChild(document.getElementById(callBackRadom))
			    }catch(error){
			      reject('error');
			    }
		    };
	  	});
	}
    
}
