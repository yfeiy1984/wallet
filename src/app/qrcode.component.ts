/// <reference path="../qrcode-generator.d.ts"/>
import {Component, Input, ElementRef, OnChanges, SimpleChanges} from '@angular/core';
import * as qrcode from "qrcode-generator";

@Component({
    selector: 'qrcode',
    template: ''
})
export class QrcodeComponent implements OnChanges
{
    @Input() data: string = '';
    @Input() size: number = 256;
    @Input() type: number = 8;
    @Input() level: string = 'M';

    constructor(private elementRef: ElementRef)
    {

    }

    ngOnChanges(changes: SimpleChanges): void
    {
        if ('data' in changes) {
            this.generate();
        }
    }

    generate()
    {
        try {
            let qr = qrcode(this.type, this.level);
            qr.addData(this.data);
            qr.make();

            let imgTagString = qr.createImgTag(this.type, 0);
            let el: HTMLElement = this.elementRef.nativeElement;
            el.innerHTML = imgTagString;
            let imgTagObject: HTMLImageElement = <HTMLImageElement> el.firstElementChild;
            imgTagObject.width = this.size;
            imgTagObject.height = this.size;
        } catch (e) {
            console.error(`Could not generate QR Code: ${e.message}`);
        }
    }
}