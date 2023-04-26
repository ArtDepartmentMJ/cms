!function(){"use strict";function t(t){const e=new Uint8Array(t);let r="";for(const t of e)r+=String.fromCharCode(t);return btoa(r).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"")}function e(t){const e=t.replace(/-/g,"+").replace(/_/g,"/"),r=(4-e.length%4)%4,n=e.padEnd(e.length+r,"="),a=atob(n),i=new ArrayBuffer(a.length),o=new Uint8Array(i);for(let t=0;t<a.length;t++)o[t]=a.charCodeAt(t);return i}function r(){return void 0!==(null===window||void 0===window?void 0:window.PublicKeyCredential)&&"function"==typeof window.PublicKeyCredential}function n(t){const{id:r}=t;return{...t,id:e(r),transports:t.transports}}function a(t){return"localhost"===t||/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(t)}class i extends Error{constructor(t,e="WebAuthnError"){super(t),this.name=e}}const o=new class{createNewAbortSignal(){this.controller&&this.controller.abort("Cancelling existing WebAuthn API call for new one");const t=new AbortController;return this.controller=t,t.signal}},s=["cross-platform","platform"];function u(t){if(t&&!(s.indexOf(t)<0))return t}async function l(s,l=!1){var c,d;if(!r())throw new Error("WebAuthn is not supported in this browser");let f;0!==(null===(c=s.allowCredentials)||void 0===c?void 0:c.length)&&(f=null===(d=s.allowCredentials)||void 0===d?void 0:d.map(n));const h={...s,challenge:e(s.challenge),allowCredentials:f},p={};if(l){if(!await async function(){const t=window.PublicKeyCredential;return void 0!==t.isConditionalMediationAvailable&&t.isConditionalMediationAvailable()}())throw Error("Browser does not support WebAuthn autofill");if(document.querySelectorAll("input[autocomplete*='webauthn']").length<1)throw Error('No <input> with `"webauthn"` in its `autocomplete` attribute was detected');p.mediation="conditional",h.allowCredentials=[]}let v;p.publicKey=h,p.signal=o.createNewAbortSignal();try{v=await navigator.credentials.get(p)}catch(t){throw function({error:t,options:e}){const{publicKey:r}=e;if(!r)throw Error("options was missing required publicKey property");if("AbortError"===t.name){if(e.signal===(new AbortController).signal)return new i("Authentication ceremony was sent an abort signal","AbortError")}else if("NotAllowedError"===t.name);else if("SecurityError"===t.name){const t=window.location.hostname;if(!a(t))return new i(`${window.location.hostname} is an invalid domain`,"SecurityError");if(r.rpId!==t)return new i(`The RP ID "${r.rpId}" is invalid for this domain`,"SecurityError")}else if("UnknownError"===t.name)return new i("The authenticator was unable to process the specified options, or could not create a new assertion signature","UnknownError");return t}({error:t,options:p})}if(!v)throw new Error("Authentication was not completed");const{id:y,rawId:m,response:g,type:w}=v;let C;var S;return g.userHandle&&(S=g.userHandle,C=new TextDecoder("utf-8").decode(S)),{id:y,rawId:t(m),response:{authenticatorData:t(g.authenticatorData),clientDataJSON:t(g.clientDataJSON),signature:t(g.signature),userHandle:C},type:w,clientExtensionResults:v.getClientExtensionResults(),authenticatorAttachment:u(v.authenticatorAttachment)}}function c(t,e){(null==e||e>t.length)&&(e=t.length);for(var r=0,n=new Array(e);r<e;r++)n[r]=t[r];return n}var d;d=jQuery,Craft.Auth2fa=Garnish.Base.extend({$mfaLoginFormContainer:null,$mfaSetupFormContainer:null,$alternativeMfaLink:null,$alternativeMfaTypesContainer:null,$viewSetupBtns:null,$errors:null,$slideout:null,$removeSetupButton:null,$closeButton:null,$verifyButton:null,init:function(t){this.$mfaLoginFormContainer=d("#mfa-form"),this.$mfaSetupFormContainer=d("#mfa-setup"),this.$alternativeMfaLink=d("#alternative-mfa"),this.$alternativeMfaTypesContainer=d("#alternative-mfa-types"),this.$viewSetupBtns=this.$mfaSetupFormContainer.find("button.mfa-view-setup"),this.setSettings(t,Craft.Auth2fa.defaults),this.addListener(this.$alternativeMfaLink,"click","onAlternativeMfaTypeClick"),this.addListener(this.$viewSetupBtns,"click","onViewSetupBtnClick")},showMfaForm:function(t,e){this.$mfaLoginFormContainer.html("").append(t),e.addClass("mfa"),d("#login-form-buttons").hide();var r=this.$mfaLoginFormContainer.find(".submit");this.$errors=d("#login-errors"),this.onSubmitResponse(r)},getCurrentMfaType:function(t){var e=t.attr("data-2fa-type");return void 0===e&&(e=null),e},onViewSetupBtnClick:function(t){var e=this,n=d(t.currentTarget);n.disable(),t.preventDefault();var a={selectedMethod:this.getCurrentMfaType(n)};Craft.sendActionRequest("POST",this.settings.setupSlideoutHtml,{data:a}).then((function(t){e.slideout=new Craft.Slideout(t.data.html),e.$errors=e.slideout.$container.find(".so-notice"),e.$closeButton=e.slideout.$container.find("button.close"),"craft\\mfa\\type\\WebAuthn"===a.selectedMethod&&r()&&new Craft.WebAuthnSetup(e.slideout),e.$verifyButton=e.slideout.$container.find("#mfa-verify"),e.$removeSetupButton=e.slideout.$container.find("#mfa-remove-setup"),e.addListener(e.$removeSetupButton,"click","onRemoveSetup"),e.addListener(e.$closeButton,"click","onClickClose"),e.addListener(e.$verifyButton,"click","onVerify"),e.addListener(e.slideout.$container,"keypress",(function(t){t.keyCode===Garnish.RETURN_KEY&&e.$verifyButton.trigger("click")})),e.slideout.on("close",(function(t){e.$removeSetupButton=null,e.slideout=null,n.enable()}))})).catch((function(t){var e=t.response;Craft.cp.displayError(e.data.message),n.enable()}))},onClickClose:function(t){this.slideout.close()},onRemoveSetup:function(t){var e=this;t.preventDefault();var r=this.getCurrentMfaType(this.slideout.$container.find("#setup-form-2fa"));void 0===r&&(r=null);var n={currentMethod:r};confirm(Craft.t("app","Are you sure you want to delete this setup?"))&&Craft.sendActionRequest("POST",this.settings.removeSetup,{data:n}).then((function(e){d(t.currentTarget).remove(),Craft.cp.displayNotice(Craft.t("app","MFA setup removed."))})).catch((function(t){Craft.cp.displayError(t.response.data.message)})).finally((function(){e.slideout.close()}))},onVerify:function(t){var e=this;t.preventDefault();var r=this.slideout.$container.find("#mfa-verify");r.addClass("loading");var n={auth2faFields:{},currentMethod:null};n.auth2faFields=this._getMfaFields(this.slideout.$container),n.currentMethod=this._getCurrentMethodInput(this.slideout.$container),Craft.sendActionRequest("POST",this.settings.saveSetup,{data:n}).then((function(t){e.onSubmitResponse(r),Craft.cp.displayNotice(Craft.t("app","MFA settings saved.")),e.slideout.close()})).catch((function(t){var n=t.response;e.onSubmitResponse(r),e.showError(n.data.message),Craft.cp.displayError(n.data.message)}))},onSubmitResponse:function(t){t.removeClass("loading")},showError:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;this.clearErrors(),d('<p class="error" style="display: none;">'+t+"</p>").appendTo(null!==e?e:this.$errors).velocity("fadeIn")},clearErrors:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;null!==t?t.empty():this.$errors.empty()},onAlternativeMfaTypeClick:function(t){var e=this.getCurrentMfaType(this.$mfaLoginFormContainer.find("#verifyContainer"));null===e&&(this.$alternativeMfaLink.hide(),this.showError(Craft.t("app","No alternative MFA methods available.")));var r={currentMethod:e};this.getAlternativeMfaTypes(r)},getAlternativeMfaTypes:function(t){var e=this;Craft.sendActionRequest("POST",this.settings.fetchAlternativeMfaTypes,{data:t}).then((function(t){void 0!==t.data.alternativeTypes&&e.showAlternativeMfaTypes(t.data.alternativeTypes)})).catch((function(t){var r=t.response;e.showError(r.data.message)}))},showAlternativeMfaTypes:function(t){var e=this,r=Object.entries(t).map((function(t){var e,r,n=(r=2,function(t){if(Array.isArray(t))return t}(e=t)||function(t,e){var r=null==t?null:"undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(null!=r){var n,a,i=[],o=!0,s=!1;try{for(r=r.call(t);!(o=(n=r.next()).done)&&(i.push(n.value),!e||i.length!==e);o=!0);}catch(t){s=!0,a=t}finally{try{o||null==r.return||r.return()}finally{if(s)throw a}}return i}}(e,r)||function(t,e){if(t){if("string"==typeof t)return c(t,e);var r=Object.prototype.toString.call(t).slice(8,-1);return"Object"===r&&t.constructor&&(r=t.constructor.name),"Map"===r||"Set"===r?Array.from(t):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?c(t,e):void 0}}(e,r)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}());return{key:n[0],value:n[1]}}));r.length>0&&r.forEach((function(t){e.$alternativeMfaTypesContainer.append('<li><button class="alternative-mfa-type" type="button" value="'+t.key+'">'+t.value.name+"</button></li>")})),this.$alternativeMfaLink.hide().after(this.$alternativeMfaTypesContainer),this.addListener(d(".alternative-mfa-type"),"click","onSelectAlternativeMfaType")},onSelectAlternativeMfaType:function(t){var e=this,r={selectedMethod:d(t.currentTarget).attr("value")};Craft.sendActionRequest("POST",this.settings.loadAlternativeMfaType,{data:r}).then((function(t){void 0!==t.data.mfaForm&&(e.$mfaLoginFormContainer.html("").append(t.data.mfaForm),e.$alternativeMfaTypesContainer.html(""),e.$alternativeMfaLink.show(),e.onSubmitResponse())})).catch((function(t){t.response}))},_getMfaFields:function(t){var e={};return t.find('input[name^="auth2faFields[').each((function(t,r){var n=d(r).attr("id");e[n]=d(r).val()})),e},_getCurrentMethodInput:function(t){return t.find('input[name="currentMethod"').val()}},{defaults:{fetchAlternativeMfaTypes:"auth/fetch-alternative-2fa-types",loadAlternativeMfaType:"auth/load-alternative-2fa-type",setupSlideoutHtml:"auth/setup-slideout-html",saveSetup:"auth/save-setup",removeSetup:"auth/remove-setup"}}),Craft.Auth2faLogin={loginWithPassword:!1,loginWithSecurityKey:!1,startWebauthnLogin:function(t){var e=arguments.length>1&&void 0!==arguments[1]&&arguments[1];return Craft.sendActionRequest("POST","users/start-webauthn-login",{data:t}).then((function(t){var r=t.data.authenticationOptions,n=t.data.userId,a=t.data.duration;try{return l(r).then((function(t){return Promise.resolve(Craft.Auth2faLogin.verifyWebAuthnLogin(r,t,n,a,e))})).catch((function(t){return Promise.reject({success:!1,error:t})}))}catch(t){return Promise.reject({success:!1,error:t})}})).catch((function(t){var e=t.response;return Promise.reject({success:!1,error:e.data.message})}))},verifyWebAuthnLogin:function(t,e,r,n,a){var i={userId:r,authenticationOptions:JSON.stringify(t),authResponse:JSON.stringify(e),duration:n};return Craft.sendActionRequest("POST","users/webauthn-login",{data:i}).then((function(t){return a?Promise.resolve({success:!0}):Promise.resolve({success:!0,returnUrl:t.data.returnUrl})})).catch((function(t){var e=t.response;return Promise.reject({success:!1,error:e.data.message})}))},submitMfaCode:function(t){var e=arguments.length>1&&void 0!==arguments[1]&&arguments[1],r={auth2faFields:{},currentMethod:null},n=new Craft.Auth2fa;return r.auth2faFields=n._getMfaFields(t),r.currentMethod=n._getCurrentMethodInput(t),Craft.sendActionRequest("POST","users/verify-mfa",{data:r}).then((function(t){return e?Promise.resolve({success:!0}):Promise.resolve({success:!0,returnUrl:t.data.returnUrl})})).catch((function(t){var e=t.response;return Promise.reject({success:!1,error:e.data.message})}))}},function(s){Craft.WebAuthnSetup=Garnish.Base.extend({$addSecurityKeyBtn:null,$noticeContainer:null,$keysTable:null,slideout:null,init:function(t,e){this.slideout=t,this.setSettings(e,Craft.WebAuthnSetup.defaults),this.$addSecurityKeyBtn=s("#add-security-key"),this.$noticeContainer=this.slideout.$container.find(".so-notice"),this.$keysTable=this.slideout.$container.find("#webauthn-security-keys"),r()||(Craft.cp.displayError(Craft.t("app","This browser does not support WebAuth.")),this.$addSecurityKeyBtn.disable()),this.addListener(this.$addSecurityKeyBtn,"click","onAddSecurityKeyBtn"),null!==this.$keysTable&&this.addListener(this.$keysTable.find(".delete"),"click","onDeleteSecurityKey")},onAddSecurityKeyBtn:function(t){s(t.currentTarget).hasClass("disabled")||(this.showStatus(Craft.t("app","Waiting for elevated session")),Craft.elevatedSessionManager.requireElevatedSession(this.startWebAuthRegistration.bind(this),this.failedElevation.bind(this)))},failedElevation:function(){this.clearStatus()},startWebAuthRegistration:function(){var s=this;this.clearStatus(),Craft.sendActionRequest("POST",this.settings.generateRegistrationOptions).then((function(l){var c=l.data.registrationOptions;try{s.showStatus(Craft.t("app","Starting registration"));var d=Craft.escapeHtml(prompt(Craft.t("app","Please enter a name for the security key")));(async function(s){var l,c;if(!r())throw new Error("WebAuthn is not supported in this browser");const d={publicKey:{...s,challenge:e(s.challenge),user:{...s.user,id:(c=s.user.id,(new TextEncoder).encode(c))},excludeCredentials:null===(l=s.excludeCredentials)||void 0===l?void 0:l.map(n)}};let f;d.signal=o.createNewAbortSignal();try{f=await navigator.credentials.create(d)}catch(t){throw function({error:t,options:e}){var r,n;const{publicKey:o}=e;if(!o)throw Error("options was missing required publicKey property");if("AbortError"===t.name){if(e.signal===(new AbortController).signal)return new i("Registration ceremony was sent an abort signal","AbortError")}else if("ConstraintError"===t.name){if(!0===(null===(r=o.authenticatorSelection)||void 0===r?void 0:r.requireResidentKey))return new i("Discoverable credentials were required but no available authenticator supported it","ConstraintError");if("required"===(null===(n=o.authenticatorSelection)||void 0===n?void 0:n.userVerification))return new i("User verification was required but no available authenticator supported it","ConstraintError")}else{if("InvalidStateError"===t.name)return new i("The authenticator was previously registered","InvalidStateError");if("NotAllowedError"===t.name);else{if("NotSupportedError"===t.name)return 0===o.pubKeyCredParams.filter((t=>"public-key"===t.type)).length?new i('No entry in pubKeyCredParams was of type "public-key"',"NotSupportedError"):new i("No available authenticator supported any of the specified pubKeyCredParams algorithms","NotSupportedError");if("SecurityError"===t.name){const t=window.location.hostname;if(!a(t))return new i(`${window.location.hostname} is an invalid domain`,"SecurityError");if(o.rp.id!==t)return new i(`The RP ID "${o.rp.id}" is invalid for this domain`,"SecurityError")}else if("TypeError"===t.name){if(o.user.id.byteLength<1||o.user.id.byteLength>64)return new i("User ID was not between 1 and 64 characters","TypeError")}else if("UnknownError"===t.name)return new i("The authenticator was unable to process the specified options, or could not create a new credential","UnknownError")}}return t}({error:t,options:d})}if(!f)throw new Error("Registration was not completed");const{id:h,rawId:p,response:v,type:y}=f;let m;return"function"==typeof v.getTransports&&(m=v.getTransports()),{id:h,rawId:t(p),response:{attestationObject:t(v.attestationObject),clientDataJSON:t(v.clientDataJSON),transports:m},type:y,clientExtensionResults:f.getClientExtensionResults(),authenticatorAttachment:u(f.authenticatorAttachment)}})(c).then((function(t){s.verifyWebAuthnRegistration(t,d)})).catch((function(t){s.showStatus(Craft.t("app","Registration failed:")+" "+t.message,"error")}))}catch(t){s.showStatus(t,"error")}})).catch((function(t){var e=t.response;s.showStatus(e.data.message,"error")}))},verifyWebAuthnRegistration:function(t,e){var r=this;this.showStatus(Craft.t("app","Starting verification"));var n={credentials:JSON.stringify(t),credentialName:e};Craft.sendActionRequest("POST",this.settings.verifyRegistration,{data:n}).then((function(t){r.clearStatus(),t.data.verified?(Craft.cp.displaySuccess(Craft.t("app","Security key registered.")),t.data.html&&(r.slideout.$container.html(t.data.html),r.init(r.slideout))):r.showStatus("Something went wrong!","error")})).catch((function(t){var e=t.response;r.showStatus(e.data.message,"error")}))},onDeleteSecurityKey:function(t){var e=this;t.preventDefault();var r=s(t.currentTarget).attr("data-uid"),n=s(t.currentTarget).parents("tr").find('[data-name="credentialName"]').text(),a={uid:r},i=confirm(Craft.t("app","Are you sure you want to delete ‘{credentialName}‘ security key?",{credentialName:n}));void 0!==r&&i&&Craft.sendActionRequest("POST",this.settings.deleteSecurityKey,{data:a}).then((function(t){Craft.cp.displaySuccess(t.data.message),t.data.html&&(e.slideout.$container.html(t.data.html),e.init(e.slideout))})).catch((function(t){var r=t.response;e.showStatus(r.data.message,"error")}))},showStatus:function(t,e){"error"==e?this.$noticeContainer.addClass("error"):this.$noticeContainer.removeClass("error"),this.$noticeContainer.text(t)},clearStatus:function(){this.$noticeContainer.text("")}},{defaults:{generateRegistrationOptions:"auth/generate-registration-options",verifyRegistration:"auth/verify-registration",deleteSecurityKey:"auth/delete-security-key"}})}(jQuery)}();
//# sourceMappingURL=auth.js.map