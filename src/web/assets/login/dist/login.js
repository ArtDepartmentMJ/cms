!function(){var t={881:function(){},84:function(t,e,i){var r=i(881);r.__esModule&&(r=r.default),"string"==typeof r&&(r=[[t.id,r,""]]),r.locals&&(t.exports=r.locals),(0,i(673).Z)("81d37080",r,!0,{})},673:function(t,e,i){"use strict";function r(t,e){for(var i=[],r={},n=0;n<e.length;n++){var s=e[n],a=s[0],o={id:t+":"+n,css:s[1],media:s[2],sourceMap:s[3]};r[a]?r[a].parts.push(o):i.push(r[a]={id:a,parts:[o]})}return i}i.d(e,{Z:function(){return m}});var n="undefined"!=typeof document;if("undefined"!=typeof DEBUG&&DEBUG&&!n)throw new Error("vue-style-loader cannot be used in a non-browser environment. Use { target: 'node' } in your Webpack config to indicate a server-rendering environment.");var s={},a=n&&(document.head||document.getElementsByTagName("head")[0]),o=null,h=0,l=!1,c=function(){},u=null,d="data-vue-ssr-id",p="undefined"!=typeof navigator&&/msie [6-9]\b/.test(navigator.userAgent.toLowerCase());function m(t,e,i,n){l=i,u=n||{};var a=r(t,e);return g(a),function(e){for(var i=[],n=0;n<a.length;n++){var o=a[n];(h=s[o.id]).refs--,i.push(h)}for(e?g(a=r(t,e)):a=[],n=0;n<i.length;n++){var h;if(0===(h=i[n]).refs){for(var l=0;l<h.parts.length;l++)h.parts[l]();delete s[h.id]}}}}function g(t){for(var e=0;e<t.length;e++){var i=t[e],r=s[i.id];if(r){r.refs++;for(var n=0;n<r.parts.length;n++)r.parts[n](i.parts[n]);for(;n<i.parts.length;n++)r.parts.push(v(i.parts[n]));r.parts.length>i.parts.length&&(r.parts.length=i.parts.length)}else{var a=[];for(n=0;n<i.parts.length;n++)a.push(v(i.parts[n]));s[i.id]={id:i.id,refs:1,parts:a}}}}function f(){var t=document.createElement("style");return t.type="text/css",a.appendChild(t),t}function v(t){var e,i,r=document.querySelector("style["+d+'~="'+t.id+'"]');if(r){if(l)return c;r.parentNode.removeChild(r)}if(p){var n=h++;r=o||(o=f()),e=b.bind(null,r,n,!1),i=b.bind(null,r,n,!0)}else r=f(),e=y.bind(null,r),i=function(){r.parentNode.removeChild(r)};return e(t),function(r){if(r){if(r.css===t.css&&r.media===t.media&&r.sourceMap===t.sourceMap)return;e(t=r)}else i()}}var C,$=(C=[],function(t,e){return C[t]=e,C.filter(Boolean).join("\n")});function b(t,e,i,r){var n=i?"":r.css;if(t.styleSheet)t.styleSheet.cssText=$(e,n);else{var s=document.createTextNode(n),a=t.childNodes;a[e]&&t.removeChild(a[e]),a.length?t.insertBefore(s,a[e]):t.appendChild(s)}}function y(t,e){var i=e.css,r=e.media,n=e.sourceMap;if(r&&t.setAttribute("media",r),u.ssrId&&t.setAttribute(d,e.id),n&&(i+="\n/*# sourceURL="+n.sources[0]+" */",i+="\n/*# sourceMappingURL=data:application/json;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(n))))+" */"),t.styleSheet)t.styleSheet.cssText=i;else{for(;t.firstChild;)t.removeChild(t.firstChild);t.appendChild(document.createTextNode(i))}}}},e={};function i(r){var n=e[r];if(void 0!==n)return n.exports;var s=e[r]={id:r,exports:{}};return t[r](s,s.exports,i),s.exports}i.d=function(t,e){for(var r in e)i.o(e,r)&&!i.o(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:e[r]})},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})};var r={};!function(){"use strict";i.r(r),i.d(r,{AuthenticationChainHandler:function(){return e},AuthenticationStep:function(){return n},AuthenticatorCodeStep:function(){return h},EmailCodeStep:function(){return a},LoginForm:function(){return t},PasswordStep:function(){return o},VerificationCode:function(){return s},WebAuthnStep:function(){return l}}),i(84);class t{constructor(){this.disabled=!1,Craft.AuthenticationChainHandler=new e(this,(()=>({rememberMe:this.$rememberMe.find("input").prop("checked")}))),this.prepareForm(),this.$pendingSpinner.length&&this.$loginForm.trigger("submit")}get $loginForm(){return $("#login-form")}get $errors(){return $("#login-errors")}get $messages(){return $("#login-messages")}get $pendingSpinner(){return $("#spinner-pending")}get $submit(){return $("#submit")}get $rememberMe(){return $("#remember-me-container")}get $username(){return $("#username-field input")}get $cancelRecover(){return $("#cancel-recover")}get $recoverAccount(){return $("#recover-account")}get $alternatives(){return $("#alternative-types")}get $restartAuthentication(){return $("#restart-authentication")}get $usernameField(){return $("#username-field")}get $recoveryButtons(){return $("#recover-account, #cancel-recover")}get $authenticationGreeting(){return $("#authentication-greeting")}get $recoveryMessage(){return $("#recovery-message")}get canRememberUser(){return this.$loginForm.data("can-remember")}prepareForm(){this.$alternatives.on("click","li",(t=>{Craft.AuthenticationChainHandler.switchStep($(t.target).attr("rel"))})),this.canRememberUser&&(Craft.AuthenticationChainHandler.isExistingChain()?this.hideRememberMe():this.showRememberMe()),this.$restartAuthentication.on("click",Craft.AuthenticationChainHandler.restartAuthentication.bind(Craft.AuthenticationChainHandler)),this.$recoveryButtons.on("click",(()=>{Craft.AuthenticationChainHandler.toggleRecoverAccount(),this.toggleRecoverAccountForm()}))}resetLoginForm(){this.$authenticationGreeting.remove(),this.$usernameField.removeClass("hidden"),this.$recoveryMessage.addClass("hidden"),this.showSubmitButton(),this.showRememberMe(),this.hideAlternatives(),this.clearErrors(),Craft.AuthenticationChainHandler.isRecoveringAccount()&&this.$recoveryButtons.toggleClass("hidden")}hideAlternatives(){this.$alternatives.addClass("hidden"),this.$alternatives.find("ul").empty()}showAlternatives(t){this.$alternatives.removeClass("hidden").find("ul").empty().append($(t))}toggleRecoverAccountForm(){const t=Craft.AuthenticationChainHandler.isRecoveringAccount();this.$recoveryButtons.toggleClass("hidden"),t?this.$recoveryMessage.removeClass("hidden"):this.$recoveryMessage.addClass("hidden"),Craft.AuthenticationChainHandler.isExistingChain()&&(t?(this.$usernameField.removeClass("hidden"),this.$alternatives.addClass("hidden")):(this.$usernameField.addClass("hidden"),this.$alternatives.removeClass("hidden")))}showError(t){this.clearErrors(),$('<p style="display: none;">'+t+"</p>").appendTo(this.$errors).velocity("fadeIn")}showMessage(t){this.clearMessages(),$('<p style="display: none;">'+t+"</p>").appendTo(this.$messages).velocity("fadeIn")}clearErrors(){this.$errors.empty()}clearMessages(){this.$messages.empty()}enableForm(){this.$submit.addClass("active"),this.$submit.removeClass("loading"),this.$loginForm.fadeTo(100,1),this.disabled=!1}disableForm(){this.$submit.removeClass("active"),this.$loginForm.fadeTo(100,.2,(()=>this.$submit.addClass("loading"))),this.disabled=!0}isDisabled(){return this.disabled}showRememberMe(){this.canRememberUser&&(this.$loginForm.addClass("remember-me"),this.$rememberMe.removeClass("hidden"))}hideRememberMe(){this.$loginForm.removeClass("remember-me"),this.$rememberMe.addClass("hidden")}showSubmitButton(){this.$submit.removeClass("hidden")}hideSubmitButton(){this.$submit.addClass("hidden")}}class e{constructor(t,e){this.performAuthenticationEndpoint="authentication/perform-authentication",this.startAuthenticationEndpoint="authentication/start-authentication",this.recoverAccountEndpoint="users/send-password-reset-email",this.recoverAccount=!1,this.authenticationSteps={},this.loginForm=t,this.loginForm.$loginForm.on("submit",(i=>{let r=e?e():{};this.isExistingChain()||(r.loginName=t.$username.val()),this.clearErrors(),this.handleFormSubmit(i,r),i.preventDefault()}))}get $authenticationStep(){return $("#authentication-step")}isRecoveringAccount(){return this.recoverAccount}resetAuthenticationControls(){this.$authenticationStep.empty().attr("rel",""),this.recoverAccount=!1}registerAuthenticationStep(t,e){this.authenticationSteps[t]=e}restartAuthentication(t){this.resetAuthenticationControls(),this.loginForm.resetLoginForm(),Craft.sendActionRequest("POST",this.startAuthenticationEndpoint),t&&t.preventDefault()}toggleRecoverAccount(){if(this.recoverAccount=!this.recoverAccount,!this.isExistingChain())return;let t;this.$authenticationStep.attr("rel").length>0&&(t=this.authenticationSteps[this.$authenticationStep.attr("rel")]),this.recoverAccount?(this.$authenticationStep.addClass("hidden"),null==t||t.cleanup()):(this.$authenticationStep.removeClass("hidden"),this.$authenticationStep.attr("rel"),null==t||t.init())}performStep(t,e){Craft.sendActionRequest("POST",t,{data:e}).then((t=>{this.processResponse(t.data)})).catch((({response:t})=>{this.processResponse(t.data)}))}switchStep(t){if(this.loginForm.isDisabled())return;this.loginForm.disableForm(),this.clearErrors(),this.updateCurrentStepType();const e={alternateStep:t};Craft.sendActionRequest("POST",this.performAuthenticationEndpoint,{data:e}).then((t=>{this.processResponse(t.data)})).catch((({response:t})=>{this.processResponse(t.data)}))}updateCurrentStepType(){this.currentStep=this.authenticationSteps[this.$authenticationStep.attr("rel")]}processResponse(t){var e,i,r;if(t.success&&(null===(e=t.returnUrl)||void 0===e?void 0:e.length))window.location.href=t.returnUrl;else{{t.error&&(this.loginForm.showError(t.error),Garnish.shake(this.loginForm.$loginForm)),t.message&&this.loginForm.showMessage(t.message),t.passwordReset&&(t.error||(this.loginForm.toggleRecoverAccountForm(),this.restartAuthentication())),t.alternatives&&Object.keys(t.alternatives).length>0?this.showAlternatives(t.alternatives):this.loginForm.hideAlternatives(),t.stepType&&this.$authenticationStep.attr("rel",t.stepType),t.footHtml&&function(t){const e=t.match(/([^"']+\.js)/gm),i=Array.from(document.scripts).map((t=>t.getAttribute("src"))).filter((t=>t&&t.length>0));if(e){for(const t of e)if(!i.includes(t)){let e=document.createElement("script");e.setAttribute("src",t),document.body.appendChild(e)}}else Craft.appendBodyHtml(t)}(t.footHtml);const e=t=>{this.authenticationSteps[t]&&this.authenticationSteps[t].init()};t.html&&(null===(i=this.currentStep)||void 0===i||i.cleanup(),this.$authenticationStep.html(t.html),e(t.stepType)),t.loginFormHtml&&(null===(r=this.currentStep)||void 0===r||r.cleanup(),this.loginForm.$loginForm.html(t.loginFormHtml),this.loginForm.prepareForm(),e(t.stepType)),t.stepComplete&&this.loginForm.hideRememberMe()}this.loginForm.enableForm()}}showAlternatives(t){let e="";for(const[i,r]of Object.entries(t))e+=`<li rel="${i}">${r}</li>`;this.loginForm.showAlternatives(e)}handleFormSubmit(t,e){this.invokeStepHandler(t,e)}triggerLoginFormSubmit(){this.loginForm.$loginForm.trigger("submit")}hideSubmitButton(){this.loginForm.$submit.removeClass("hidden")}showSubmitButton(){this.loginForm.$submit.addClass("hidden")}async invokeStepHandler(t,e){try{let t;if(this.isExistingChain()?(this.updateCurrentStepType(),t=Object.assign(Object.assign({},await this.currentStep.prepareData()),e)):t=e,this.loginForm.isDisabled())return;this.loginForm.disableForm();const i=this.recoverAccount?this.recoverAccountEndpoint:this.isExistingChain()?this.performAuthenticationEndpoint:this.startAuthenticationEndpoint;this.performStep(i,t)}catch(t){this.loginForm.showError(t),this.loginForm.enableForm()}}isExistingChain(){return this.$authenticationStep.attr("rel").length>0}clearErrors(){this.loginForm.clearErrors()}}class n{constructor(t){this.validateOnInput=!1,this.stepType=t,Craft.AuthenticationChainHandler.registerAuthenticationStep(t,this),this.doInit()}doInit(){this.cleanup(),this.init()}onInput(t){this.validateOnInput&&!0===this.validate()&&Craft.AuthenticationChainHandler.clearErrors()}async prepareData(){const t=this.validate();if(!0!==t)throw this.validateOnInput=!0,t;this.validateOnInput=!1;let e=await this.returnFormData();return e.stepType=this.stepType,e}}class s extends n{constructor(t){super(t)}get $verificationCode(){return $("#verificationCode")}init(){this.$verificationCode.on("input",this.onInput.bind(this))}cleanup(){this.$verificationCode.off("input",this.onInput.bind(this))}validate(){return 0!==this.$verificationCode.val().length||Craft.t("app","Please enter a verification code")}returnFormData(){return{"verification-code":this.$verificationCode.val()}}}class a extends s{constructor(){super("craft\\authentication\\type\\EmailCode")}}class o extends n{constructor(){super("craft\\authentication\\type\\Password"),this.passwordSelector="#password"}get $passwordField(){return $(this.passwordSelector)}init(){this.passwordInput=new Craft.PasswordInput(this.passwordSelector,{onToggleInput:t=>{this.$passwordField.off("input"),this.$passwordField.replaceWith(t),this.$passwordField.on("input",this.onInput.bind(this))}}),this.$passwordField.on("input",this.onInput.bind(this))}cleanup(){delete this.passwordInput,delete this.passwordInput,this.$passwordField.off("input",this.onInput.bind(this))}validate(){const t=this.$passwordField.val().length;return t<window.minPasswordLength?Craft.t("yii","{attribute} should contain at least {min, number} {min, plural, one{character} other{characters}}.",{attribute:Craft.t("app","Password"),min:window.minPasswordLength}):!(t>window.maxPasswordLength)||Craft.t("yii","{attribute} should contain at most {max, number} {max, plural, one{character} other{characters}}.",{attribute:Craft.t("app","Password"),max:window.maxPasswordLength})}returnFormData(){return{password:this.$passwordField.val()}}}class h extends s{constructor(){super("craft\\authentication\\type\\AuthenticatorCode")}}class l extends n{constructor(){super("craft\\authentication\\type\\WebAuthn")}get $button(){return $("#verify-webauthn")}validate(){return this.$button.addClass("hidden"),!0}init(){this.$button.on("click",this.onButtonClick.bind(this)),Craft.AuthenticationChainHandler.hideSubmitButton()}cleanup(){this.$button.off("click",this.onButtonClick.bind(this)),Craft.AuthenticationChainHandler.showSubmitButton()}onButtonClick(){Craft.AuthenticationChainHandler.triggerLoginFormSubmit()}async returnFormData(){const t=this.$button.data("request-options"),e=Object.assign({},t);if(!t)return{};t.allowCredentials&&(e.allowCredentials=[...t.allowCredentials]),e.challenge=atob(e.challenge.replace(/-/g,"+").replace(/_/g,"/")),e.challenge=Uint8Array.from(e.challenge,(t=>t.charCodeAt(0)));for(const t in e.allowCredentials){let i=e.allowCredentials[t];e.allowCredentials[t]={id:Uint8Array.from(atob(i.id.replace(/-/g,"+").replace(/_/g,"/")),(t=>t.charCodeAt(0))),type:i.type}}let i;try{i=await navigator.credentials.get({publicKey:e})}catch(t){throw this.$button.removeClass("hidden"),Craft.t("app","Failed to authenticate")}const r=i.response;return{credentialResponse:{id:i.id,rawId:i.id,response:{authenticatorData:btoa(String.fromCharCode(...new Uint8Array(r.authenticatorData))),clientDataJSON:btoa(String.fromCharCode(...new Uint8Array(r.clientDataJSON))),signature:btoa(String.fromCharCode(...new Uint8Array(r.signature))),userHandle:r.userHandle?btoa(String.fromCharCode(...new Uint8Array(r.userHandle))):null},type:i.type}}}}}();var n=Craft="undefined"==typeof Craft?{}:Craft;for(var s in r)n[s]=r[s];r.__esModule&&Object.defineProperty(n,"__esModule",{value:!0})}();
//# sourceMappingURL=Login.js.map