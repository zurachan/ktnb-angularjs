/***
Metronic AngularJS App Main Script
***/

// BUILD LOCAL
var API_URL="/ktnb-service/";
var STATIC_URL= "/static/";

// BUILD TEST OLD
// var API_URL="http://10.58.71.134:9752/coms-service/";

//BUILD TEST NEW
//var API_URL="http://10.61.19.230:9752/coms-service/";
//var API_URL="http://10.61.19.230:8887/aio-service/";

$.ajaxPrefilter(function(options, originalOptions, jqXHR){
    if (options.type.toLowerCase() === "post"||options.type.toLowerCase()==="put"||
    		options.type.toLowerCase()==="delete"||options.type.toLowerCase()==="options") {
        // add _token entry
        jqXHR.setRequestHeader("X-CSRF-TOKEN",readCookie('XSRF-TOKEN'))
		options.xhrFields = {
			withCredentials: true
		  };
    }
});

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
/* Metronic App */
var MetronicApp = angular.module("MetronicApp", [
    "ui.router", 
    "ui.bootstrap", 
    "oc.lazyLoad",
    "ngCookies",
    "ngSanitize",
    'ngResource',
    'ngStorage',
    'pascalprecht.translate',
    'kendo.directives',
    'kendo.window',
    'gettext',
    'ui.tab.scroll',
    'restangular',
    'ngIdle',
    'disableAll',
    'vt.directive.isNumber',
    'vt.directive.maskInput',
    'ngMessages'
]);

MetronicApp.config(['$translateProvider', 'Constant', function ($translateProvider, Constant) {
    $translateProvider
            .useStaticFilesLoader({
                prefix: Constant.prefixLanguage,
                suffix: '.json'
            })
            .preferredLanguage('vi_VN');
}]);

/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
MetronicApp.config(['$ocLazyLoadProvider', 'scrollableTabsetConfigProvider','RestangularProvider','$uibTooltipProvider', function($ocLazyLoadProvider, 
		scrollableTabsetConfigProvider, RestangularProvider,$uibTooltipProvider) {
    $ocLazyLoadProvider.config({
        // global configs go here
    });
    
    scrollableTabsetConfigProvider.setShowTooltips(true);
    scrollableTabsetConfigProvider.setAutoRecalculate(true);
	scrollableTabsetConfigProvider.setTooltipLeftPlacement('bottom');
	scrollableTabsetConfigProvider.setTooltipRightPlacement('left');
	$uibTooltipProvider.options({
		  appendToBody: true
		});
	
	//RestangularProvider.setBaseUrl('/ktts-service/');
    RestangularProvider.setBaseUrl(API_URL);
    //RestangularProvider.setBaseUrl('http://localhost:8084/ktts-service/');
    //RestangularProvider.setBaseUrl('http://10.58.71.138:8386/ktts-service/');
/*	RestangularProvider.setDefaultHeaders({
		'Content-Type': 'application/json',
		'Authorization': 'Basic YWRtaW46YWRtaW4='
	});*/
    RestangularProvider.setDefaultHttpFields({withCredentials: true});
  //  RestangularProvider.setDefaultHeaders({'X-XSRF-TOKEN': CSRF_TOKEN});


}]);
/* Init global settings and run the app */
MetronicApp.run(["$rootScope", "settings", "$state",  "Idle","Restangular","Constant", function($rootScope, settings, $state, Idle,Restangular,Constant) {
	// start watching when the app runs. also starts the Keepalive service by default.
   // Idle.watch();
   // $rootScope.$state = $state; // state to be accessed from view
   // $rootScope.$settings = settings; // state to be accessed from view

   Restangular.setErrorInterceptor(function(response, deferred, responseHandler) {
        if(response.status === 489) {      
        	if(response.config&&response.config.url.indexOf(Constant.authen.LOGIN_URL)){
        		window.location =response.data.data;
        	}
            return false; // error handled
        }
        else if (response.status === 499) {
        	$rootScope.authenticatedUser =null;
            window.location =response.data.data;
            return false; // error handled
        }else if (response.status === 492) {
        	$rootScope.authenticatedUser =null;
        	$('body').addClass('page-on-load')
            alert("Bạn chưa được phân quyền vào ứng dụng");
        	$rootScope.isAuthenticated=false;
	        Restangular.one(Constant.authen.LOGOUT_URL).get().then(function(response){
	        }).catch(function (err) {
	            console.log('Không kết nối dữ liệu ' + err.message);
	        });
            return false; // error handled
        }
        return true; // error not handled
    });
    
    //phuc vu chuyen tab menu khi chuyen sang tomcat khac
    if($rootScope.authenticatedUser == 'undefined' ||$rootScope.authenticatedUser==null){
    	 Restangular.one(Constant.authen.LOGIN_URL).get().then(function(user){
    		 $rootScope.casUser=user.userToken;
    		 if($rootScope.casUser!=null){
    			 Restangular.one(Constant.authen.GET_USER_INFO).get().then(function(user){    	    	
 	     	    	$rootScope.authenticatedUser=user;
 	     	    	$rootScope.menuCode = user.menuCode;
 	     	    	$rootScope.urlCallMenuCode = user.urlCallMenuCode;  	
 	     	    	Constant.setUser(user); 
 	     	    	
 	     	    	setTimeout(function(){
 	     	    		var urlUpload = window.location.protocol
 	     				+ '//'
 	     				+ window.location.hostname
 	     				+ ':'
 	     				+ window.location.port + window.location.pathname;
 	     	    		if($rootScope.menuCode !=undefined && $rootScope.urlCallMenuCode !=undefined)
 	     	    			{
 	     	    		if(urlUpload != $rootScope.urlCallMenuCode)
 	     	    			{
 	     	    				$("a#" + $rootScope.menuCode).parents('ul').show();
 	     	            		postal.publish({
 	     	    					channel : "Tab",
 	     	    					topic : "open",
 	     	    					data : Constant.getTemplateUrl($rootScope.menuCode)
 	     	    				});
 	     	    			}
 	     	    		}
 	     	        }, 0);
 	     	    });
    		 }
    	 });
    	
    }
	//end
//    hungnx 20180615 start
    addXMLRequestCallback(function(param, url){
    	var display = false;
    	param.onreadystatechange = function () {
    	  if(param.readyState === 4 && display) {
    		  $("#wait").remove();
              kendo.ui.progress($("#progessbardiv"), false);
    	  }
    	};
//    	url common add and update for DetailMonthPlanRsService/add, DetailMonthPlanRsService/update, totalMonthPlanRsService, yearPlanRsService
    	var ListKeyUrl=['doSearch','exportPdf','save','update','signVoffice',"?folder=",
            // "dtttAssignRsService/assignWork","dtttAssignRsService/editAssignWork",
            // "dtttAssignRsService/approveDvnStatus"
        ];
    	for(var i = 0 ; i < ListKeyUrl.length; i++){
    		if(url.toUpperCase().includes(ListKeyUrl[i].toUpperCase())){
    			var loading = '<div id="wait" style="position:fixed;top:50%;left:50%;z-index:20003;text-align:center;font-weight:bold"><img src="assets/global/img/loading-circle.gif"><div>Bạn vui lòng chờ đợi trong giây lát !</div></div>';
    	    	if($("#wait").length == 0){
    	    		$("body").append(loading);
                    kendo.ui.progress($("#progessbardiv"), true);
    	    		display=true;
    	    		break;
    	    	}
    		}
    	}
    });
//  hungnx 20180615 end

}]);

angular.module('MetronicApp').filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});




//AngularJS v1.3.x workaround for old style controller declarition in HTML
MetronicApp.config(['$controllerProvider', function($controllerProvider) {
  // this option might be handy for migrating old apps, but please don't use it
  // in new ones!
  $controllerProvider.allowGlobals();
}]);

MetronicApp.config(['IdleProvider', function(IdleProvider) {
	// configure Idle settings
    IdleProvider.idle(1800); // in seconds
    IdleProvider.timeout(60000); // in seconds
}]);

/********************************************
 END: BREAKING CHANGE in AngularJS v1.3.x:
*********************************************/

/* Setup global settings */
MetronicApp.factory('settings', ['$rootScope', function($rootScope) {
    // supported languages
    var settings = {
        layout: {
            pageSidebarClosed: false, // sidebar menu state
            pageContentWhite: true, // set page content layout
            pageBodySolid: false, // solid body color state
            pageAutoScrollOnLoad: 1000 // auto scroll to top on page load
        },
        assetsPath: 'assets',
        globalPath: 'assets/global',
        layoutPath: 'assets/layouts/layout',
        kttsLayoutPath:'style/layouts'
    };

    $rootScope.settings = settings;

    return settings;
}]);
	
/* Setup App Main Controller */
MetronicApp.controller('AppController', ['$scope', '$rootScope', 'gettextCatalog', '$window','$translate','Restangular','$kWindow','Constant', function($scope, $rootScope, gettextCatalog, $window,$translate,Restangular,$kWindow,Constant) {
    $scope.$on('$viewContentLoaded', function() {    	
        //App.initComponents(); // init core components
        //Layout.init(); //  Init entire layout(header, footer, sidebar, etc) on page load if the partials included in server side instead of loading with ng-include directive
    });


    
    
    $scope.changeLanguage = changeLanguage;
    $scope.activeLangCode = 'VN';
    $scope.activeFlagIcon = 'vn';
    
    function changeLanguage(langCode) {
    	$scope.activeLangCode = langCode;
    
    	if ('EN' == langCode) {
    		$scope.activeFlagIcon = 'us';    		
    		$translate.use('en_US');
    		
    	} else if ('VI' == langCode) {
    		$scope.activeFlagIcon = 'vn';    		
    		$translate.use('vi_VN');
    	}
    }
    
    /**hoangnh start 17012019**/
    var modalInstance;
	$scope.enterPass = enterPass;
	function enterPass(){
		debugger;
		$rootScope.modalInstance = $kWindow
		.open({
			options: {
				modal: true,
				title: "Nhập mật khẩu Voffice",
				visible: false,
				width: 400,
				height: 130,
				actions: ["Minimize",
					"Maximize", "Close"],
				open: function () {	
				},
				close: function () {
				},
				resolve: {
					modalInstance: function () {
						return this;
					}
				}
			},
			template: "<div class='col-md-12 form-group'>" +
						"<br><label class = 'col-md-12'>Nhập mật khẩu:</label>" +
						"<div class='col-md-12 form-group'>" +
						"<form><input type = 'password' class='form-control' name='vofficePass' id='vofficePass' ng-model='pass'/></form>"+
						"<br><button ng-click='submit()' class='btn btn-primary'>Lưu</button>"+
					"</div></div>",
			controller: 'AppController',
			resolve: {
			}
		});
		
	}
	
	$scope.pass;
	$scope.submit = submit;
	function submit(){
		if(!$scope.pass){
			toastr.error("Mật khẩu không được để trống");
			return;
		}
		var obj = {vofficePass:$scope.pass};
		debugger;
		obj.sysUserId = Constant.user.vpsUserToken.sysUserId;
		obj.vofficeUser = Constant.user.vpsUserToken.userName;
		Restangular.all("goodsPlanService/saveVofficepass").post(obj).then(function(d) {
			if(!!d.error){
				toastr.error("Lưu mật khẩu không thành công");
			} else{
				toastr.success("Cập nhật nhật thành công!");
			}
//			$("div.k-window-actions > a.k-window-action > span.k-i-close").click();
			$rootScope.modalInstance.close();
		}).catch( function(e){
			toastr.error("Lưu mật khẩu không thành công");
			return;
		});
	}
	/**hoangnh start 17012019**/
	
    $scope.$on('IdleStart', function() {
        // the user appears to have gone idle
    });

    $scope.$on('IdleWarn', function(e, countdown) {
        // follows after the IdleStart event, but includes a countdown until the user is considered timed out
        // the countdown arg is the number of seconds remaining until then.
        // you can change the title or display a warning dialog from here.
        // you can let them resume their session by calling Idle.watch()
    });

    $scope.$on('IdleTimeout', function() {
        // the user has timed out (meaning idleDuration + timeout has passed without any activity)
        // this is where you'd log them
    	$window.location.href = 'logout';
    });

    $scope.$on('IdleEnd', function() {
        // the user has come back from AFK and is doing stuff. if you are warning them, you can use this to hide the dialog
    });

}]);

/***
Layout Partials.
By default the partials are loaded through AngularJS ng-include directive. In case they loaded in server side(e.g: PHP include function) then below partial 
initialization can be disabled and Layout.init() should be called on page load complete as explained above.
***/

/* Setup Layout Part - Header */
MetronicApp.controller('HeaderController', ['$scope','$rootScope', 'Constant','Restangular', function($scope,$rootScope, Constant,Restangular) {	
	$scope.$watch(function() {
         return $rootScope.casUser;
    }, function(casUser) {
    	if (casUser==null) {
				return;
    		}
    			$scope.fullName = casUser.fullName;
    		
    	
    }, true)
	
    $scope.$on('$includeContentLoaded', function() {
    	Layout.initHeader(); // init header
    });

    $scope.logout=function(){
        $rootScope.isAuthenticated=false;
        Restangular.one(Constant.authen.LOGOUT_URL).get().then(function(response){

        }).catch(function (err) {
            console.log('Không kết nối dữ liệu ' + err.message);
        });

    };
}]);

/* Setup Layout Part - Sidebar */
MetronicApp.controller('SidebarController', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initSidebar(); // init sidebar
    });
}]);

/* Setup Layout Part - Quick Sidebar */
MetronicApp.controller('QuickSidebarController', ['$scope', function($scope) {    
    $scope.$on('$includeContentLoaded', function() {
       setTimeout(function(){
            QuickSidebar.init(); // init quick sidebar        
        }, 2000)
    });
}]);

/* Setup Layout Part - Theme Panel */
MetronicApp.controller('ThemePanelController', ['$scope', function($scope) {    
    $scope.$on('$includeContentLoaded', function() {
        Demo.init(); // init theme panel
    });
}]);

/* Setup Layout Part - Footer */
MetronicApp.controller('FooterController', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initFooter(); // init footer
    });
}]);
MetronicApp.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.withCredentials = true;

    $httpProvider.defaults.xsrfCookieName = 'XSRF-TOKEN';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRF-TOKEN';
   
}]);

/* Setup Rounting For All Pages */
MetronicApp.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    // Redirect any unmatched url
    $urlRouterProvider.otherwise("/dashboard.html");  

    $stateProvider
        .state('erp', {
            url: "",
            templateUrl: "tpl/mainTab.view.html",
            controller: "DashboardController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/jquery.sparkline.min.js',
                            'assets/pages/scripts/dashboard.js',
                            'erp/common/DashboardController.js?t=20230628',
                            'ktnb/manageWoEmployee/manageWoEmployeeService.js',
                        ] 
                    });
                }]
            }
        })	
}]);



//add authenticate cho cookie
MetronicApp.factory('myHttpResponseInterceptor', ['$q', '$cookies','Constant', function ($q, $cookies,Constant) {
    return {
        // optional method
        'request': function (config) {
            // do something on success
            config.withCredentials = true;
           
            return config;
        },

        // optional method
        'requestError': function (rejection) {
            // do something on error
            return $q.reject(rejection);
        },

        // optional method
        'response': function (response) {
            // do something on success
            return response;
        }
        //,
    };
}]);
MetronicApp.config(function ($httpProvider) {
    $httpProvider.interceptors.push('myHttpResponseInterceptor');
});
//hungnx 20180615 start
function addXMLRequestCallback(callback){
    var oldSend, i;
    if( XMLHttpRequest.callbacks ) {
        // we've already overridden send() so just add the callback
        XMLHttpRequest.callbacks.push( callback );
    } else {
        // create a callback queue
        XMLHttpRequest.callbacks = [callback];
        // store the native open()
        oldFunction = XMLHttpRequest.prototype.open;
        
        oldAbort = XMLHttpRequest.prototype.abort;
        // override the native open()
        XMLHttpRequest.prototype.open = function(method, url){
            // process the callback queue
            // the xhr instance is passed into each callback but seems pretty useless
            // you can't tell what its destination is or call abort() without an error
            // so only really good for logging that a request has happened
            // I could be wrong, I hope so...
            // EDIT: I suppose you could override the onreadystatechange handler though
            for( i = 0; i < XMLHttpRequest.callbacks.length; i++ ) {
                XMLHttpRequest.callbacks[i]( this , url);
            }
            // call the native send()
            oldFunction.apply(this, arguments);
        }
        
        XMLHttpRequest.prototype.abort = function(){
        	 $("#wait").remove();
            // call the native send()
        	 oldAbort.apply(this, arguments);
        }
    }
    XMLHttpRequest.onreadystatechange = function () {
    	  if(xhr.readyState === 4 ) {
    		  $("#wait").remove();
    	  }
    	};
}
//hungnx 20180615 end
