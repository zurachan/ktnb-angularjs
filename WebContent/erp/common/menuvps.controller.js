(function () {

    'use strict';

    var controllerId = 'MenuController';

    angular.module('MetronicApp').controller(controllerId, MenuController);

    /* @ngInject */
    function MenuController($scope, $rootScope, Constant, $http, Restangular,
                            CommonService) {
        var vm = this;
        vm.listMenuKey = {};
        $scope.Constant = Constant;

        $scope.$watch(function () {
            return $rootScope.casUser;
        }, function (casUser) {
            if (casUser == null) {
                return;
            }
            // for (var i = 0; i < casUser.parentMenu.length; i++) {
            //     switch (casUser.parentMenu[i].code) {
            //         //menu KTNB
            //         case "KTNB": {
            //             casUser.parentMenu[i].classIcon = "ktnb";
            //             var menu = getChildMenu(casUser.parentMenu[i].childMenu);
            //             vm.listMenuKey.listAIOMenu = menu;
            //             break;
            //         }
            //
            //     }
            // }
            for(var i=0;i<casUser.parentMenu.length; i++){
                if(casUser.parentMenu[i].code == 'KTNB_SYS'){
                    casUser.parentMenu[i].classIcon = "ktnb";
                    vm.menuObjects = [casUser.parentMenu[i]];
                    var menu = getChildMenu(casUser.parentMenu[i].childMenu);
                    vm.listMenuKey.listKTNBMenu = menu;
                }
            }
            //vm.menuObjects = [casUser.parentMenu[5]];// nhantv menu AIO only

            
        });

        vm.goTo = goTo;
        vm.goToDefault = goToDefault;

        /*
         * get menu text - neu vsa tra ve null thi
         */
        vm.getMenuText = function (menuObject) {
            try {
                if (menuObject.url == null || menuObject.url == undefined) {
                    return CommonService.translate(menuObject.name);
                    /* return menuObject.name; */
                }

                var template = Constant.getTemplateUrl(menuObject.code);
                if (template == null) {
                    if (menuObject.name != '') {
                        return CommonService.translate(menuObject.name);

                    }
                    return "N/A";
                }
                return template.title;
            } catch (err) {
                console.debug(err);
                return "N/A";
            }
        };

        /* Handle action client on a menu item */
        function goTo(menuKey) {
            var template = Constant.getTemplateUrl(menuKey);
            var listKTNBMenu = vm.listMenuKey.listKTNBMenu;
            if (listKTNBMenu.indexOf(menuKey) !== -1) {
                postal.publish({
                    channel: "Tab",
                    topic: "open",
                    data: template
                });
            }
        }

        vm.goToDash = goToDash;
        function goToDash(menuKey) {
            var hasPerm = true;
            if (hasPerm) {
                var template = Constant
                    .getTemplateUrl(menuKey);

                postal.publish({
                    channel: "Tab",
                    topic: "open",
                    data: template
                });
            } else {
                // toastr.error(gettextCatalog.getString("Tài
                // khoản đăng nhập
                // hiện tại không được phép truy cập vào
                // chức năng này!"));
            }

        }

        function callUrlFromMenu(menuOpenToUrl, urlCallMenu, urlCallService, menuKey) {
            if ($("#wait").length == 0) {
                var loading = '<div id="wait" style="position:fixed;top:50%;left:50%;z-index:20003;width:100%;height:100%">' +
                    '<img src="assets/global/kendoui/styles/Bootstrap/loading-image.gif"> ' +
                    '</div>';
                $("body").append(loading);
            }

            var isOpen = false;
            var countOpen = 0;
            $('iframe#comsFrameLoadMenu').attr('src', menuOpenToUrl);
            $('iframe#comsFrameLoadMenu').on('load', function () {
                var obj = {
                    menuCode: menuKey,
                    urlCallMenu: urlCallMenu,
                    urlCallService: urlCallService
                }
                if (!isOpen) {
                    CommonService.requestMenuCode(obj).then(function (result) {
                        isOpen = true;
                        var win = window.open(menuOpenToUrl, '_blank');
                        if (win != null && typeof (win) != 'undefined') {
                            win.focus();
                            $("#wait").remove();
                        }
                        setTimeout(function () {
                            $('iframe#comsFrameLoadMenu').attr('src', '');
                            $('iframe#comsFrameLoadMenu').empty();
                        }, 30000);
                    })
                        .catch(function (data) {
                            if (countOpen < 2) {
                                $('iframe#comsFrameLoadMenu').attr('src', menuOpenToUrl);
                                countOpen++;
                            } else {
                                var win = window.open(menuOpenToUrl, '_blank');
                                if (win != null && typeof (win) != 'undefined') {
                                    win.focus();
                                    $("#wait").remove();
                                }
                            }
                        })
                    ;
                }
            });
        }


        function goToDefault(menuKey) {
            if (menuKey == 'GOODS') {
                var template = Constant.getTemplateUrl(menuKey);
                postal.publish({
                    channel: "Tab",
                    topic: "open",
                    data: template
                });
            }
        }

        vm.activeHomePage = activeHomePage;
        function activeHomePage() {
            postal.publish({
                channel: "Tab",
                topic: "active"

            });
        }

        function getChildMenu(menu, listReturn) {
            listReturn = !!listReturn ? listReturn : [];
            menu.forEach(function (element) {
                if (!!element.childMenu && element.childMenu.length > 0) {
                    getChildMenu(element.childMenu, listReturn);
                } else {
                    listReturn.push(element.code);
                }
            });
            return listReturn;
        }
    }
})();
