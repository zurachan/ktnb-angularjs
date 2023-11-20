
angular.module('MetronicApp').factory('htmlCommonService',
		['$http', '$q','$templateCache','$rootScope', 'RestEndpoint', 'Restangular', '$kWindow',
		 function($http, $q, $templateCache,$rootScope, RestEndpoint, Restangular, $kWindow){
//	 	var serviceUrl = RestEndpoint.BIDDING_PACKAGE_SERVICE_URL;
	    var factory = {
	    		getTemplateHtml:getTemplateHtml,
	    		populatePopup:populatePopup,
	    		dismissPopup1:dismissPopup1,
	    		checkFileExtension:checkFileExtension,
	    		getFullDate:getFullDate,
	    		dismissPopup: dismissPopup,
	    		validDate: validDate,
//	        	hungnx 20180618 start
	    		showLoading: showLoading,
	    		hideLoading: hideLoading,
	    		validateIntKeydown: validateIntKeydown,
	    		addThousandComma: addThousandComma,
	    		formatDate: formatDate,
//	        	hungnx 20180618 start
				//Trung 21/11/2019
				validateIntKeydownWithoutDot:validateIntKeydownWithoutDot,
				addDays:addDays,
				//Trung end
				populatePopupCreate:populatePopupCreate
	    };
	    function getTemplateHtml(url){
	    	return $templateCache.get(url);
	    }
	    
	    function populatePopup(templateUrl, gridTitle,
				gridOptions, data, caller, popupId,
				searchType, isMultiSelect, sizeWith,
				sizeHeight, controller) {
			checkOnePopup = true;
			modalInstance1 = $kWindow.open({
				options : {
					modal : true,
					title : gridTitle,
					visible : false,
					width : sizeWith,
					height : sizeHeight,
					actions : [ "Minimize", "Maximize",
							"Close" ],
					open : function() {
						this.wrapper.children(
								'.k-window-content')
								.addClass("fix-footer");
					}
				},
				templateUrl : templateUrl,
				controller : controller,
				resolve : {
					gridOptions : function() {
						return gridOptions;
					},
					dataTree : function() {
						return data;
					},
					caller : function() {
						return caller;
					},
					modalInstance1 : function() {
						return this;
					},
					popupId : function() {
						return popupId;
					},
					searchType : function() {
						return searchType;
					},
					isMultiSelect : function() {
						return isMultiSelect;
					}
				}
			});

			modalInstance1.result.then(function(result) {
				dismissPopup1();
			});
		}
	    function dismissPopup1() {
			if (checkOnePopup && !checkTowPopup) {
				modalInstance1.dismiss('cancel');
				checkTowPopup = false;
			}

		}
//	    hungnx 070618 start
	    function checkFileExtension(inputId){
	    	var isValid = true
	    	var listExt = $("#"+inputId).attr("list-file-type").split(',');
	    	var fileExt = $("#"+inputId)[0].files[0].name.split('.').pop();
	    	
	    	for(var i = 0; i < $("#"+inputId)[0].files.length; i++){
	    		 var fileExt = $("#"+inputId)[0].files[i].name.split('.').pop();
	    		 if (listExt.indexOf(fileExt.toLowerCase()) == -1)
	    			 isValid = false;
	    	 }
	    	return isValid;
	    }
	    function getFullDate(){
	    	var date = new Date();
        	var day = date.getDate(); date.getDate()<10 ? "0" + date.getDate() : ""+date.getDate();
        	var month = (date.getMonth()+1)<10 ? (date.getMonth()+1) : date.getMonth()+1;
        	var year = date.getFullYear();
        	var result = day+"/"+month+"/"+year;
        	return result;
	    }
	    function formatDate(date) {
	    	var day = date.getDate(); date.getDate()<10 ? "0" + date.getDate() : ""+date.getDate();
        	var month = (date.getMonth()+1)<10 ? "0" + (date.getMonth()+1) : ""+ (date.getMonth()+1);
        	var year = date.getFullYear();
        	var result = day+"/"+month+"/"+year;
        	return result;
		}
	    function dismissPopup() {
			modalInstance1.dismiss('cancel');
//			checkTowPopup = false;
	    }
	    function validDate(date) {
	    	if (kendo.parseDate(date,"dd/MM/yyyy") == null)
	    		return false;
	    	return true;
		}
	    function showLoading(ctrl) {
			$(ctrl).addClass("loadersmall");
		}
	    function hideLoading(ctrl) {
			$(ctrl).removeClass("loadersmall");
		}
	    function validateIntKeydown(event, inputVal){
	    	var x = event.which || event.keyCode;
	    	var ctrlDown = event.ctrlKey||event.metaKey // Mac support
	    	var isValid = (event.which != 46 || inputVal.indexOf('.') != -1) &&
	           ((event.which < 48 || event.which > 57) &&
			           (event.which != 0 && event.which != 8 && x != 9))
	    	&& !(ctrlDown && x==99)// c
	        && !(ctrlDown && x==118)// v
	        && !(ctrlDown && x==120)// x
	    	&& !(ctrlDown && x==97);// a
//	    	console.log('key press: '+x);
	    	return !isValid;

	    }
	    function addThousandComma(String){
	    	var result = !!String ? String.replace(/,/g, "") : '';
	    	return result.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
	    }
//	    hungnx 070618 end

		// Trung start 21/11/2019
		 function validateIntKeydownWithoutDot(event, inputVal){
			 var x = event.which || event.keyCode;
			 var isValid = ((event.which < 48 || event.which > 57) &&
				 (event.which != 0 && event.which != 8 && x != 9));
			 return !isValid;
		 }

		 function addDays(date, days) {
			 var result = new Date(date);
			 result.setDate(result.getDate() + days);
			 return result;
		 }
		 // Trung end
	     return factory;

		function populatePopupCreate(templateUrl,
									  gridTitle, data, caller, windowId,
									  isCreateNew, sizeWith, sizeHeight, idFocus) {
			 checkOnePopup = true;
			 modalInstance1 = $kWindow
				 .open({
					 options: {
						 modal: true,
						 title: gridTitle,
						 visible: false,
						 width: sizeWith,
						 height: sizeHeight,
						 actions: ["Minimize",
							 "Maximize", "Close"],
						 open: function () {
							 if (!!caller.openForm)
								 caller.openForm(windowId);
							 this.wrapper
								 .children(
									 '.k-window-content')
								 .addClass(
									 "fix-footer");
							 $rootScope
								 .$broadcast('Popup.open');
							 $("#attachfiles").kendoUpload();
						 },
						 close: function () {
							 // modalInstance = null;
							 caller.closeForm();
							 $rootScope
								 .$broadcast('Popup.CloseClick');
							 isOpening = false;
						 },
						 activate: function () {
							 if (document
								 .getElementById(idFocus))
								 document
									 .getElementById(
										 idFocus)
									 .focus();
						 },
					 },
					 templateUrl: templateUrl,
					 controller: 'PopupCreateNewCtrl',
					 resolve: {
						 data: function () {
							 return data;
						 },
						 caller: function () {
							 return caller;
						 },
						 modalInstance1: function () {
							 return this;
						 },
						 windowId: function () {
							 return windowId;
						 },
						 isCreateNew: function () {
							 return isCreateNew;
						 },
					 }
				 });

			 modalInstance1.result.then(function (result) {
				 dismissPopup1();
			 });
		 }

	}]);
