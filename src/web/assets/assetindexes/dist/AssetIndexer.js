!function(){var s={d:function(e,n){for(var t in n)s.o(n,t)&&!s.o(e,t)&&Object.defineProperty(e,t,{enumerable:!0,get:n[t]})},o:function(s,e){return Object.prototype.hasOwnProperty.call(s,e)},r:function(s){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(s,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(s,"__esModule",{value:!0})}},e={};!function(){"use strict";var n,t;s.r(e),s.d(e,{AssetIndexer:function(){return i}}),function(s){s[s.ACTIONREQUIRED=0]="ACTIONREQUIRED",s[s.ACTIVE=1]="ACTIVE",s[s.WAITING=2]="WAITING"}(n||(n={})),function(s){s.START="asset-indexes/start-indexing",s.STOP="asset-indexes/stop-indexing-session",s.PROCESS="asset-indexes/process-indexing-session",s.OVERVIEW="asset-indexes/indexing-session-overview",s.FINISH="asset-indexes/finish-indexing-session"}(t||(t={}));class i{constructor(s,e,t=3){this._currentIndexingSession=null,this._currentConnectionCount=0,this._tasksWaiting=[],this._priorityTasks=[],this._prunedSessionIds=[],this._currentlyReviewing=!1,this.indexingSessions={},this._maxConcurrentConnections=t,this.$indexingSessionTable=s,this.indexingSessions={};let i=0;for(const s of e){let e=this.createSessionFromModel(s);e.getSessionStatus()!==n.ACTIONREQUIRED||i||(i=e.getSessionId()),i||null!=this._currentIndexingSession||e.getSessionStatus()===n.ACTIONREQUIRED||(this._currentIndexingSession=e.getSessionId()),this.updateIndexingSessionData(e)}this._currentIndexingSession&&this.performIndexingStep()}get currentIndexingSession(){return this._currentIndexingSession}updateIndexingSessionData(s){this.indexingSessions[s.getSessionId()]=s,this.renderIndexingSessionRow(s)}renderIndexingSessionRow(s){let e;if(void 0===s)return;if(!this.indexingSessions[s.getSessionId()]||this._prunedSessionIds.includes(s.getSessionId()))return this.$indexingSessionTable.find('tr[data-session-id="'+s.getSessionId()+'"]').remove(),void(0==this.$indexingSessionTable.find("tbody tr").length&&this.$indexingSessionTable.addClass("hidden"));e=s.getIndexingSessionRowHtml();const n=this.$indexingSessionTable.find('tr[data-session-id="'+s.getSessionId()+'"]');n.length>0?n.replaceWith(e):this.$indexingSessionTable.find("tbody").append(e),this.$indexingSessionTable.removeClass("hidden")}discardIndexingSession(s){const e=this.indexingSessions[s];delete this.indexingSessions[s],this._currentIndexingSession===s&&(this._currentIndexingSession=null),this.renderIndexingSessionRow(e),this.runTasks()}processFailureResponse(s){const e=s.data;this._currentConnectionCount--,this._updateCurrentIndexingSession(),alert(e.message),e.stop&&this.discardIndexingSession(e.stop),this.runTasks()}processSuccessResponse(s){const e=s.data;if(this._currentConnectionCount--,e.session){const s=this.createSessionFromModel(e.session);this.indexingSessions[s.getSessionId()]=s,this.renderIndexingSessionRow(s),this._updateCurrentIndexingSession(),s.getSessionStatus()!==n.ACTIONREQUIRED||e.skipDialog?this._prunedSessionIds.includes(this._currentIndexingSession)?this.runTasks():this.performIndexingStep():this._prunedSessionIds.includes(this._currentIndexingSession)?this.runTasks():this.reviewSession(s)}this._updateCurrentIndexingSession(),e.stop&&this.discardIndexingSession(e.stop)}getReviewData(s){const e={sessionId:s.getSessionId(),action:t.OVERVIEW,params:{sessionId:s.getSessionId()},callback:()=>{this.renderIndexingSessionRow(s)}};this.enqueueTask(e)}reviewSession(s){if(this._currentlyReviewing)return;this._currentlyReviewing=!0,this.pruneWaitingTasks(s.getSessionId());let e=$("<div></div>");const n=s.getMissingEntries(),i=n.files?Object.entries(n.files):[],o=n.folders?Object.entries(n.folders):[],r=s.getSkippedEntries();if(r.length){let s="";for(const e of r)s+=`<li>${e}</li>`;e.append(`\n                <h2>${Craft.t("app","Skipped files")}</h2>\n                <p>${Craft.t("app","The following items were not indexed.")}</p>\n                <ul>\n                    ${s}\n                </ul>\n            `)}const a=i.length||o.length;if(a){if(o.length){let n="";for(const[s,e]of o)n+=`<li><label><input type="checkbox" checked="checked" name="deleteFolder[]" value="${s}"> ${e}</label></li>`;const t={items:"folders"};let i=this._getMissingItemsHeading("folders",t,s),r=this._getMissingItemsCopy("folders",t,s);e.append($(`\n                <h2>${i}</h2>\n                <p>${r}</p>\n                <ul>\n                    ${n}\n                </ul>\n            `))}if(i.length){let n="";for(const[s,e]of i)n+=`<li><label><input type="checkbox" checked="checked" name="deleteAsset[]" value="${s}"> ${e}</label></li>`;const t={items:"files"};let o=this._getMissingItemsHeading("files",t,s),r=this._getMissingItemsCopy("files",t,s);e.append($(`\n                <h2>${o}</h2>\n                <p>${r}</p>\n                <ul>\n                    ${n}\n                </ul>\n            `))}}const d=$('<form class="modal fitted confirmmodal"/>').appendTo(Garnish.$bod),g=$('<div class="body"/>').appendTo(d).html(e.html()),c=$('<footer class="footer"/>').appendTo(d),h=$('<div class="buttons right"/>').appendTo(c),u=new Garnish.Modal(d,{hideOnEsc:!1,hideOnShadeClick:!1,onHide:()=>{this._currentlyReviewing=!1}});a?($("<button/>",{type:"button",class:"btn",text:Craft.t("app","Keep them")}).on("click",(e=>{e.preventDefault(),this.stopIndexingSession(s),u.hide()})).appendTo(h),$("<button/>",{type:"submit",class:"btn submit",text:Craft.t("app","Delete them")}).appendTo(h)):$("<button/>",{type:"submit",class:"btn submit",text:Craft.t("app","OK")}).appendTo(h),Craft.initUiElements(g),u.updateSizeAndPosition(),d.on("submit",(e=>{e.preventDefault(),u.hide();const n=Garnish.getPostData(g),i=Craft.expandPostArray(n);i.sessionId=s.getSessionId();const o={sessionId:s.getSessionId(),action:t.FINISH,params:i};this.enqueueTask(o,!0)}))}_getMissingItemsHeading(s,e,n){let t=Craft.t("app","Missing {items}",e);return"folders"==s&&n.getListEmptyFolders()&&(t=Craft.t("app","Missing or empty {items}",e)),t}_getMissingItemsCopy(s,e,n){let t=Craft.t("app","The following {items} could not be found. Should they be deleted from the index?",e);return"folders"==s&&n.getListEmptyFolders()&&(t=Craft.t("app","The following {items} could not be found or are empty. Should they be deleted from the index?",e)),t}startIndexing(s,e){Craft.sendActionRequest("POST",t.START,{data:s}).then((s=>this.processSuccessResponse(s))).catch((({response:s})=>this.processFailureResponse(s))).finally((()=>e()))}performIndexingStep(){if(this._currentIndexingSession||this._updateCurrentIndexingSession(),!this._currentIndexingSession)return;const s=this.indexingSessions[this._currentIndexingSession],e=this._maxConcurrentConnections-this._currentConnectionCount;for(let n=0;n<Math.min(e,s.getEntriesRemaining());n++){const e={sessionId:s.getSessionId(),action:t.PROCESS,params:{sessionId:this._currentIndexingSession}};this.enqueueTask(e)}if(s.getProcessIfRootEmpty()){const e={sessionId:s.getSessionId(),action:t.PROCESS,params:{sessionId:this._currentIndexingSession}};this.enqueueTask(e)}}stopIndexingSession(s){this.pruneWaitingTasks(s.getSessionId());const e={sessionId:s.getSessionId(),action:t.STOP,params:{sessionId:s.getSessionId()}};this.enqueueTask(e,!0)}pruneWaitingTasks(s){const e=[];let n=!1;this._prunedSessionIds.push(s);for(const t of this._tasksWaiting)t.sessionId!==s?e.push(t):n=!0;n&&(this._tasksWaiting=e)}enqueueTask(s,e=!1){e?this._priorityTasks.push(s):this._tasksWaiting.push(s),this.runTasks()}runTasks(){if(!(this._tasksWaiting.length+this._priorityTasks.length===0||this._currentConnectionCount>=this._maxConcurrentConnections))for(;this._tasksWaiting.length+this._priorityTasks.length!==0&&this._currentConnectionCount<this._maxConcurrentConnections;){this._currentConnectionCount++;const s=this._priorityTasks.length>0?this._priorityTasks.shift():this._tasksWaiting.shift();Craft.sendActionRequest("POST",s.action,{data:s.params}).then((s=>this.processSuccessResponse(s))).catch((({response:s})=>this.processFailureResponse(s))).finally((()=>{s.callback&&s.callback()}))}}_updateCurrentIndexingSession(){for(const s of Object.values(this.indexingSessions))if(s.getSessionStatus()!==n.ACTIONREQUIRED)return void(this._currentIndexingSession=s.getSessionId())}createSessionFromModel(s){return new o(s,this)}}class o{constructor(s,e){this.indexingSessionData=s,this.indexer=e}getSessionId(){return this.indexingSessionData.id}getProcessIfRootEmpty(){return this.indexingSessionData.processIfRootEmpty}getListEmptyFolders(){return this.indexingSessionData.listEmptyFolders}getEntriesRemaining(){return this.indexingSessionData.totalEntries-this.indexingSessionData.processedEntries}getSessionStatus(){return this.indexingSessionData.actionRequired?n.ACTIONREQUIRED:this.indexer.currentIndexingSession===this.indexingSessionData.id?n.ACTIVE:n.WAITING}getIndexingSessionRowHtml(){const s=$('<tr class="indexingSession" data-session-id="'+this.getSessionId()+'">');s.append("<td><ul><li>"+Object.values(this.indexingSessionData.indexedVolumes).join("</li><li>")+"</li></ul></td>"),s.append("<td>"+this.indexingSessionData.dateCreated+"</td>");const e=$('<td class="progress"><div class="progressContainer"></div></td>').css("position","relative"),n=new Craft.ProgressBar(e.find(".progressContainer"),!1);n.setItemCount(this.indexingSessionData.totalEntries),n.setProcessedItemCount(this.indexingSessionData.processedEntries),n.updateProgressBar(),n.showProgressBar(),e.data("progressBar",n),e.find(".progressContainer").append(`<div class="progressInfo">${this.indexingSessionData.processedEntries} / ${this.indexingSessionData.totalEntries}</div>`),s.append(e),s.append("<td>"+this.getSessionStatusMessage()+"</td>");const t=this.getActionButtons();return $("<td></td>").append(t).appendTo(s),s}getActionButtons(){const s=$('<div class="buttons"></div>');if(this.getSessionStatus()==n.ACTIONREQUIRED){const e=Craft.t("app","Review");s.append($("<button />",{type:"button",class:"btn submit",title:e,"aria-label":e}).text(e).on("click",(s=>{const e=$(s.target).parent();e.hasClass("disabled")||(e.addClass("disabled"),this.indexer.getReviewData(this))})))}const e=Craft.t("app","Discard");return s.append($("<button />",{type:"button",class:"btn submit",title:e,"aria-label":e}).text(e).on("click",(e=>{s.hasClass("disabled")||(s.addClass("disabled"),this.indexer.stopIndexingSession(this))}))),s}getSessionStatusMessage(){switch(this.getSessionStatus()){case n.ACTIONREQUIRED:return Craft.t("app","Waiting for review");case n.ACTIVE:return Craft.t("app","Active");case n.WAITING:return Craft.t("app","Waiting")}}getMissingEntries(){return this.indexingSessionData.missingEntries}getSkippedEntries(){return this.indexingSessionData.skippedEntries}}}();var n=Craft="undefined"==typeof Craft?{}:Craft;for(var t in e)n[t]=e[t];e.__esModule&&Object.defineProperty(n,"__esModule",{value:!0})}();
//# sourceMappingURL=AssetIndexer.js.map