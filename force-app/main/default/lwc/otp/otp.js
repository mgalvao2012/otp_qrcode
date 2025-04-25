import { api, wire, LightningElement } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import totp_generator from '@salesforce/resourceUrl/totp_generator';
import Id from '@salesforce/user/Id';
import qrcode from './qrcode.js';

export default class Otp extends LightningElement {
    //@api recordId
    recordId = Id;

    @api title
    @api iconName
    @api totpFieldName

    secret
    code
    refreshCounter

    get ringCounter() {
        return (100 / 30) * this.refreshCounter
    }

    get ringVariant() {
        if (this.refreshCounter < 3) {
            return 'expired'
        }
        if (this.refreshCounter < 10) {
            return 'warning'
        }
        return 'base'
    }

    stringToHex(str) {
        let hex = '';
        for (let i = 0; i < str.length; i++) {
          const charCode = str.charCodeAt(i);
          const hexValue = charCode.toString(16);
      
          // Pad with zeros to ensure two-digit representation
          hex += hexValue.padStart(2, '0');
        }
        return hex;
    };

    connectedCallback() {
        loadScript(this, totp_generator).then(() => {            
            this.secret = this.stringToHex(this.recordId.substring(0, 16));
            console.log(this.secret);
            this.code = new jsOTP.totp().getOtp(this.secret);
            setInterval(function() {
                this.code = new jsOTP.totp().getOtp(this.secret);
                this.refreshCounter = 30 - Math.round((new Date().getTime() / 1000) % 30);
                this.renderQRCode(this.recordId+this.code);
            }.bind(this), 1000);                                
        });        
    }

    renderQRCode(strForGenearationOfQRCode) {
        const qrCodeGenerated = new qrcode(0, 'H');
        qrCodeGenerated.addData(strForGenearationOfQRCode);
        qrCodeGenerated.make();
        let element = this.template.querySelector(".qrcode2");
        element.innerHTML = qrCodeGenerated.createSvgTag({});
    }    
}