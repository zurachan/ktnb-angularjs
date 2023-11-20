angular.module('MetronicApp').service('searchType', function () {
});
angular
    .module('MetronicApp')
    .factory(
        'CommonService',
        [
            'RestEndpoint',
            'Restangular',
            '$kWindow',
            'Constant',
            '$rootScope',
            '$translate',
            'searchType',
            '$filter',
            '$q',
            '$http',
            function (RestEndpoint, Restangular, $kWindow, Constant,
                      $rootScope, $translate, searchType, $filter, $q, $http) {

                var FUNCTION_CODE_CONST = {
                    LOGIN: "LOGIN",
                    UPDATE_CVDV: "UPDATE_CVDV",
                    UPDATE_CAMERA: "UPDATE_CAMERA",
                    REGISTER_CTV: "REGISTER_CTV",
                    DASHBOARD_SYSGROUPID: "DASHBOARD_SYSGROUPID",
                    RP_SALARY_LIST: "RP_SALARY_LIST",
                    RP_SALARY_DETAIL: "RP_SALARY_DETAIL"
                };

                var factory = {
                    populateDataToGrid: populateDataToGrid,
                    populateDataToTree: populateDataToTree,
                    populateDataToGridplus: populateDataToGridplus,
                    populatePopup: populatePopup,
                    openCustomPopup: openCustomPopup,
                    closePopup: closePopup,
                    dismissPopup: dismissPopup,
                    closePopup1: closePopup1,
                    dismissPopup1: dismissPopup1,
                    setItem: setItem,
                    getItem: getItem,
                    goToMenu: goToMenu,
                    goTo: goTo,
                    getUserInfo: getUserInfo,
                    translate: translate,
                    populatePopupCreate: populatePopupCreate,
                    getDepartment: getDepartment,
                    validateImport: validateImport,
                    exportFile: exportFile,
                    exportFile2: exportFile2,
                    exportFileNoGrid: exportFileNoGrid,
                    exportReport: exportReport,
                    buildDataExport: buildDataExport,
                    genCode: genCode,
                    signVoffice: signVoffice,
                    previewVoffice: previewVoffice,
                    downloadAttachFile: downloadAttachFile,
                    getDataSign: getDataSign,
                    getDetailSign: getDetailSign,
                    closeTab: closeTab,
                    downloadTemplate: downloadTemplate,
                    getallData: getallData,
                    resetData: resetData,
                    populatePopupYearDetail: populatePopupYearDetail,
                    viewSignedDoc: viewSignedDoc,
                    requestMenuCode: requestMenuCode,
                    downloadTemplate2: downloadTemplate2,
                    //VietNT_20190114_start
                    getModalInstance1: getModalInstance1,
                    populatePopupGroup: populatePopupGroup,
                    getSysGroup: getSysGroup,
                    getPopupClose: getPopupClose,
                    previewDocSign: previewDocSign,
                    createCustomPopupWithEvent: createCustomPopupWithEvent,
                    createCustomPopupWithEventPos: createCustomPopupWithEventPos,
                    formatNumberLength: formatNumberLength,
                    stringFormat: stringFormat,
                    forceNumber: forceNumber,
                    numberWithCommas: numberWithCommas,
                    updateKeySearchForLikeQuery: updateKeySearchForLikeQuery,
                    showHideColumnGrid: showHideColumnGrid,
                    doSearchGrid: doSearchGrid,
                    createDropDownList: createDropDownList,
                    populatePopupDept: populatePopupDept,
                    FUNCTION_CODE_CONST: FUNCTION_CODE_CONST,
                    // previewImage:previewImage
                    fillDataPopupCommonSearch: fillDataPopupCommonSearch,
                    checkPermission: checkPermission,
                    getAppParam: getAppParam,
                    getCnktOfUser: getCnktOfUser,
                };

                //VietNT_02/07/2019_start
                function createDropDownList(elementId, dataSource, text = "name", value = "id", filterType) {
                    var element = $(elementId.charAt(0) == "#" ? elementId : "#" + elementId);
                    var config = {
                        dataSource: dataSource,
                        dataTextField: text,
                        dataValueField: value
                    };
                    if (filterType) {
                        config.filter = filterType;
                    }
                    element.kendoDropDownList(config);
                    element.data("kendoDropDownList").value(null);
                    return element.data("kendoDropDownList");
                }

                //VietNT_20190528_start
                function showHideColumnGrid(grid, column) {
                    if (angular.isUndefined(column.hidden)) {
                        grid.hideColumn(column);
                        grid.autoFitColumn(column);
                        grid.element.find('table[role="grid"]').removeAttr('style');
                    } else if (column.hidden) {
                        grid.showColumn(column);
                        grid.autoFitColumn(column);
                        grid.element.find('table[role="grid"]').removeAttr('style');
                    } else {
                        grid.hideColumn(column);
                        grid.autoFitColumn(column);
                        grid.element.find('table[role="grid"]').removeAttr('style');
                    }
                }

                function doSearchGrid(grid, optsAdd) {
                    var opts = {page: 1};
                    if (grid) {
                        opts.pageSize = grid.dataSource.pageSize();
                        if (optsAdd) {
                            Object.entries(optsAdd).forEach(function (obj) {
                                opts[obj[0]] = obj[1];
                            });
                        }

                        grid.dataSource.query(opts);
                    } else {
                        console.log("Grid not found!")
                    }
                }

                //VietNT_end

                //VietNT_20190308_start
                function updateKeySearchForLikeQuery(keySearch) {
                    return keySearch ? keySearch.replace(/\%|\_/gi, "&$&") : keySearch;
                }

                // key press
                function forceNumber(e) {
                    var keyCode = e.keyCode ? e.keyCode : e.which;
                    if ((keyCode < 48 || keyCode > 58) && keyCode != 188) {
                        return false;
                    }
                    return true;
                }

                // keyup
                function numberWithCommas(n) {
                    if (!n) return;
                    n = n + '';
                    n = n.replace(/,/g, "");
                    var s = n.split('.')[1];
                    (s) ? s = "." + s : s = "";
                    n = n.split('.')[0];
                    while (n.length > 3) {
                        s = "," + n.substr(n.length - 3, 3) + s;
                        n = n.substr(0, n.length - 3)
                    }
                    return n + s;
                }

                function stringFormat(format) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    return format.replace(/{(\d+)}/g, function (match, number) {
                        return typeof args[number] != 'undefined'
                            ? args[number]
                            : match;
                    });
                }

                function formatNumberLength(num, length) {
                    var r = "" + num;
                    while (r.length < length) {
                        r = "0" + r;
                    }
                    return r;
                }

                function createCustomPopupWithEvent(templateUrl, popupTitle, caller, controllerName
                    , width, height, doWhenOpen, doWhenClose, data) {
                    if (!controllerName) {
                        controllerName = 'PopupCreateNewCtrl';
                    }
                    // var pos = {top: "5%", left: "10%"};
                    // if (typeof height == "string") {
                    //     if (height == "100%" ||
                    //         (height.includes("px") && Number(height.substring(0, height.length - 2)) > screen.height)) {
                    //         pos.top = "1%";
                    //     }
                    // } else if (typeof height == "number" && height > screen.height) {
                    //     pos.top = "1%";
                    // }
                    var modal = $kWindow.open({
                        options: {
                            modal: true,
                            title: popupTitle,
                            visible: false,
                            width: width,
                            height: height,
                            // position: pos,
                            actions: ["Minimize", "Maximize", "Close"],
                            open: function () {
                                if (doWhenOpen instanceof Function) {
                                    doWhenOpen(data);
                                } else {
                                    $rootScope.$broadcast(doWhenOpen);
                                }
                            },
                            // activate : function() {
                            //     if (doWhenOpen instanceof Function) {
                            //         doWhenOpen(data);
                            //     } else {
                            //         $rootScope.$broadcast(doWhenOpen);
                            //     }
                            // },
                            close: function () {
                                if (doWhenClose instanceof Function) {
                                    doWhenClose(data);
                                } else {
                                    $rootScope.$broadcast(doWhenClose);
                                }
                            }
                        },
                        templateUrl: templateUrl,
                        controller: controllerName,
                        resolve: {
                            caller: function () {
                                return caller;
                            },
                            modalInstance: function () {
                                return this;
                            },
                            modalInstance1: function () {
                                return this;
                            },
                            popup: function () {
                                return popupTitle;
                            },
                            data: function () {
                                return data;
                            },
                            isMultiSelect: function () {
                                return null;
                            },
                            windowId: function () {
                                return null;
                            },
                            isCreateNew: function () {
                                return null;
                            }
                        }
                    });

                    modal.result.then(function (result) {
                        console.log(result);
                    });
                    return modal;
                }

                //VietNT_end

                /**Hoangnh start 12042019**/
                function createCustomPopupWithEventPos(templateUrl, popupTitle, caller, controllerName
                    , width, height, doWhenOpen, doWhenClose, data) {
                    if (!controllerName) {
                        controllerName = 'PopupCreateNewCtrl';
                    }
                    var modal = $kWindow.open({
                        options: {
                            modal: true,
                            title: popupTitle,
                            visible: false,
                            width: width,
                            height: height,
                            actions: ["Minimize", "Maximize", "Close"],
                            open: function () {
                                if (doWhenOpen instanceof Function) {
                                    doWhenOpen(data);
                                } else {
                                    $rootScope.$broadcast(doWhenOpen);
                                }
                            },
                            close: function () {
                                if (doWhenClose instanceof Function) {
                                    doWhenClose(data);
                                } else {
                                    $rootScope.$broadcast(doWhenClose);
                                }
                            }
                        },
                        templateUrl: templateUrl,
                        controller: controllerName,
                        resolve: {
                            caller: function () {
                                return caller;
                            },
                            modalInstance: function () {
                                return this;
                            },
                            modalInstance1: function () {
                                return this;
                            },
                            popup: function () {
                                return popupTitle;
                            },
                            data: function () {
                                return data;
                            },
                            isMultiSelect: function () {
                                return null;
                            },
                            windowId: function () {
                                return null;
                            },
                            isCreateNew: function () {
                                return null;
                            }
                        }
                    });

                    modal.result.then(function (result) {
                        console.log(result);
                    });
                    return modal;
                }

                /**Hoangnh start 12042019**/
                var modalInstance;
                var modalInstance1;
                var item;
                var checkOnePopup = false;
                var checkTowPopup = false;
                return factory;

                //VietNT_20190114_start
                function getModalInstance1() {
                    return modalInstance1;
                }

                //VietNT_end
                function translate(text) {

                    try {
                        return $translate.instant(text);

                    } catch (err) {
                        return text;
                    }

                }

                function getUserInfo() {

                    if (Constant.user != null
                        && Constant.user.srvUser != null) {
                        srvuser = Constant.user.srvUser;
                        return {
                            groupId: srvuser.groupId,
                            groupName: srvuser.groupName,
                            groupCode: srvuser.groupCode,
                            userId: srvuser.userId
                        };
                    }
                    return {};
                }

                /**hoangnh 17012019 start**/
                function previewDocSign(obj) {
                    $http({
                        url: RestEndpoint.BASE_SERVICE_URL + "reportServiceRest" + "/previewSignedDoc",
                        dataType: 'json',
                        method: 'POST',
                        data: obj,
                        headers: {
                            "Content-Type": "application/json"
                        },
                        responseType: 'arraybuffer'//THIS IS IMPORTANT
                    }).success(function (data, status, headers, config) {
                        if (data.error) {
                            toastr.error(data.error);
                        } else {
                            var file = new Blob([data], {type: 'application/pdf'});
                            var fileURL = URL.createObjectURL(file);
                            window.open(fileURL);
                        }
                    }).error(function (data) {
                        toastr.error("Có lỗi xảy ra khi lấy dữ liệu từ VOffice!");
                    });
                }

                /**hoangnh 17012019 end**/

                function setItem(item) {
                    this.item = item;
                }

                function getItem() {
                    return this.item;
                }

                function goToMenu(menuKey, option) {
                    var template = Constant.getTemplateUrl(menuKey);
                    postal.publish({
                        channel: "Tab",
                        topic: "open",
                        data: template
                    });
                    $rootScope.$broadcast(option.event, {
                        data: option.data
                    });
                    /*
                     * $rootScope.isCreatAsset = false;
                     * $rootScope.$broadcast("cat.detail.reload");
                     */
                }

                function openOtherForm(recordId) {
                    var template = Constant
                        .getTemplateUrl('Asset_CatAssetDetail');
                    $rootScope.activateResultTab = true;

                    postal.publish({
                        channel: "Tab",
                        topic: "open",
                        data: template
                    });
                }

                // CommonService.populateDataToGrid(templateUrl,
                // title, vm.gridOptions, vm, popupId,searchtype);
                function populateDataToGrid(templateUrl, gridTitle,
                                            gridOptions, caller, popupId, searchType,
                                            isMultiSelect) {
                    modalInstance = $kWindow.open({
                        options: {
                            modal: true,
                            title: gridTitle,
                            visible: false,
                            width: '800',
                            height: '550',
                            actions: ["Minimize", "Maximize",
                                "Close"],
                            open: function () {
                                this.wrapper.children(
                                    '.k-window-content')
                                    .addClass("fix-footer");
                            }
                        },
                        templateUrl: templateUrl,
                        controller: 'ModalInstanceCtrl',
                        resolve: {
                            data: function () {
                                return gridOptions;
                            },
                            caller: function () {
                                return caller;
                            },
                            modalInstance: function () {
                                return this;
                            },
                            popupId: function () {
                                return popupId;
                            },
                            searchType: function () {
                                return searchType;
                            },
                            isMultiSelect: function () {
                                return isMultiSelect;
                            }
                        }
                    });

                    modalInstance.result.then(function (result) {
                        dismissPopup();
                    });
                }

                // minhpvn -import bien ban phat sinh cong trinh
                function populateDataToGridCT(templateUrl,
                                              gridTitle, gridOptions, caller, popupId,
                                              searchType, isMultiSelect) {
                    modalInstance = $kWindow.open({
                        options: {
                            modal: true,
                            title: gridTitle,
                            visible: false,
                            width: '550',
                            height: '350',
                            actions: ["Minimize", "Maximize",
                                "Close"],
                            open: function () {
                                this.wrapper.children(
                                    '.k-window-content')
                                    .addClass("fix-footer");
                            }
                        },
                        templateUrl: templateUrl,
                        controller: 'ModalInstanceCtrl',
                        resolve: {
                            data: function () {
                                return gridOptions;
                            },
                            caller: function () {
                                return caller;
                            },
                            modalInstance: function () {
                                return this;
                            },
                            popupId: function () {
                                return popupId;
                            },
                            searchType: function () {
                                return searchType;
                            },
                            isMultiSelect: function () {
                                return isMultiSelect;
                            }
                        }
                    });

                    modalInstance.result.then(function (result) {
                        dismissPopup();
                    });
                }

                // minhpvn
                function populateDataToGridBMaterial(templateUrl,
                                                     gridTitle, gridOptions, caller, popupId,
                                                     searchType, isMultiSelect) {
                    modalInstance = $kWindow.open({
                        options: {
                            modal: true,
                            title: gridTitle,
                            visible: false,
                            width: '1250',
                            height: '550',
                            actions: ["Minimize", "Maximize",
                                "Close"],
                            open: function () {
                                this.wrapper.children(
                                    '.k-window-content')
                                    .addClass("fix-footer");
                            }
                        },
                        templateUrl: templateUrl,
                        controller: 'ModalInstanceCtrl',
                        resolve: {
                            data: function () {
                                return gridOptions;
                            },
                            caller: function () {
                                return caller;
                            },
                            modalInstance: function () {
                                return this;
                            },
                            popupId: function () {
                                return popupId;
                            },
                            searchType: function () {
                                return searchType;
                            },
                            isMultiSelect: function () {
                                return isMultiSelect;
                            }
                        }
                    });

                    modalInstance.result.then(function (result) {
                        dismissPopup();
                    });
                }

                function populateDataToGridplus(templateUrl,
                                                gridTitle, gridOptions, caller, popupId,
                                                searchType, isMultiSelect, idFocus) {
                    checkTowPopup = true;
                    modalInstance = $kWindow.open({
                        options: {
                            modal: true,
                            title: gridTitle,
                            visible: false,
                            width: '1000',
                            height: '550',
                            actions: ["Minimize", "Maximize",
                                "Close"],
                            open: function () {
                                this.wrapper.children(
                                    '.k-window-content')
                                    .addClass("fix-footer");
                            },
                            activate: function () {
                                document.getElementById(idFocus).focus();
                            },
                        },
                        templateUrl: templateUrl,
                        controller: 'ModalInstanceCtrl',
                        resolve: {
                            data: function () {
                                return gridOptions;
                            },
                            caller: function () {
                                return caller;
                            },
                            modalInstance: function () {
                                return this;
                            },
                            popupId: function () {
                                return popupId;
                            },
                            searchType: function () {
                                return searchType;
                            },
                            isMultiSelect: function () {
                                return isMultiSelect;
                            }
                        }
                    });

                    modalInstance.result.then(function (result) {
                        dismissPopup();
                    });
                }

                function populateDataToTree(templateUrl,
                                            tableTitle, treeData, caller, popupId,
                                            isMultiSelect) {
                    modalInstance = $kWindow.open({
                        options: {
                            modal: true,
                            title: tableTitle,
                            visible: false,
                            width: '650',
                            height: '550',
                            actions: ["Minimize", "Maximize",
                                "Close"],
                            open: function () {
                                this.wrapper.children(
                                    '.k-window-content')
                                    .addClass("fix-footer");
                            }
                        },
                        templateUrl: templateUrl,
                        controller: 'ModalInstanceCtrl',
                        resolve: {
                            data: function () {
                                return treeData;
                            },
                            caller: function () {
                                return caller;
                            },
                            modalInstance: function () {
                                return this;
                            },
                            popupId: function () {
                                return popupId;
                            },
                            isMultiSelect: function () {
                                return isMultiSelect;
                            }
                        }
                    });

                    modalInstance.result.then(function (result) {
                        dismissPopup();
                    });
                }

                function populatePopup(templateUrl,
                                       gridOptions, gridTitle, data, caller, windowId,
                                       isCreateNew, sizeWith, sizeHeight) {
                    modalInstance = $kWindow
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
                                    this.wrapper
                                        .children(
                                            '.k-window-content')
                                        .addClass(
                                            "fix-footer");
                                },
                                close: function () {
                                    // modalInstance = null;
                                    $rootScope
                                        .$broadcast('Popup.CloseClick');
                                    isOpening = false;
                                }
                            },
                            templateUrl: templateUrl,
                            controller: 'PopupCreateNewCtrl',
                            resolve: {
                                gridOptions: function () {
                                    return gridOptions;
                                },
                                data: function () {
                                    return data;
                                },
                                caller: function () {
                                    return caller;
                                },
                                modalInstance: function () {
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

                    modalInstance.result.then(function (result) {
                        dismissPopup();
                    });
                }

                function openCustomPopup(templateUrl, gridTitle,
                                         gridOptions, caller, popupId,
                                         controllerName, adOrgId, isMultiSelect) {
                    modalInstance = $kWindow.open({
                        options: {
                            modal: true,
                            title: gridTitle,
                            visible: false,
                            width: '550',
                            height: '200',
                            actions: ["Minimize", "Maximize",
                                "Close"],
                            open: function () {
                                this.wrapper.children(
                                    '.k-window-content')
                                    .addClass("fix-footer");
                            }
                        },
                        templateUrl: templateUrl,
                        controller: controllerName,
                        resolve: {
                            data: function () {
                                return gridOptions;
                            },
                            caller: function () {
                                return caller;
                            },
                            modalInstance: function () {
                                return this;
                            },
                            popupId: function () {
                                return popupId;
                            },
                            adOrgId: function () {
                                return adOrgId;
                            },
                            isMultiSelect: function () {
                                return isMultiSelect;
                            }
                        }
                    });

                    modalInstance.result.then(function (result) {
                        dismissPopup();
                    });
                }

                function openSplitMoney(templateUrl, gridTitle,
                                        gridOptions, caller, popupId,
                                        controllerName, ccashInBankId) {
                    modalInstance = $kWindow.open({
                        options: {
                            modal: true,
                            title: gridTitle,
                            visible: false,
                            width: '350',
                            height: '180',
                            actions: ["Minimize", "Maximize",
                                "Close"],
                            open: function () {
                                this.wrapper.children(
                                    '.k-window-content')
                                    .addClass("fix-footer");
                            }
                        },
                        templateUrl: templateUrl,
                        controller: controllerName,
                        resolve: {
                            data: function () {
                                return gridOptions;
                            },
                            caller: function () {
                                return caller;
                            },
                            modalInstance: function () {
                                return this;
                            },
                            popupId: function () {
                                return popupId;
                            },
                            ccashInBankId: function () {
                                return ccashInBankId;
                            }
                        }
                    });

                    modalInstance.result.then(function (result) {
                        dismissPopup();
                    });
                }

                function openStockTransfer(templateUrl, gridTitle,
                                           gridOptions, caller, popupId,
                                           controllerName, depositbrowser) {
                    modalInstance = $kWindow.open({
                        options: {
                            modal: true,
                            title: gridTitle,
                            visible: false,
                            width: '350',
                            height: '150',
                            actions: ["Minimize", "Maximize",
                                "Close"],
                            open: function () {
                                this.wrapper.children(
                                    '.k-window-content')
                                    .addClass("fix-footer");
                            }
                        },
                        templateUrl: templateUrl,
                        controller: controllerName,
                        resolve: {
                            data: function () {
                                return gridOptions;
                            },
                            caller: function () {
                                return caller;
                            },
                            modalInstance: function () {
                                return this;
                            },
                            popupId: function () {
                                return popupId;
                            },
                            depositbrowser: function () {
                                return depositbrowser;
                            }
                        }
                    });

                    modalInstance.result.then(function (result) {
                        dismissPopup();
                    });
                }

                function closePopup() {
                    if (checkTowPopup) {
                        modalInstance.close();
                        checkTowPopup = false;
                    }
                }

                function closePopup1() {
                    if (checkOnePopup && !checkTowPopup) {
                        modalInstance1.close();
                        checkOnePopup = false;
                    }
                }

                function dismissPopup() {
                    modalInstance.dismiss('cancel');
                    checkTowPopup = false;
                }

                function dismissPopup1() {
                    if (checkOnePopup && !checkTowPopup) {
                        modalInstance1.dismiss('cancel');
                        checkTowPopup = false;
                    }
                }

                function fetchFromURL(url) {
                    return Restangular.all(url).getList();
                }

                function postToUrl(url, data) {
                    return Restangular.all(url).post(data);
                }

                function fetchSingleFromURL(url) {
                    return Restangular.one(url).get();
                }

                function initCurrencyData() {
                    /*
                     * return
                     * Restangular.all(RestEndpoint.C_CURRENCY_SERVICE_URL).getList().then(function(d){
                     * $rootScope.currencyData = d.plain(); });
                     */
                }

                function getRoundingOrginalCurrency(currencyId,
                                                    amount) {
                    var roundingConvertedScale = 0;
                    var roundingOriginalCurrencyScale = 2;

                    if ($rootScope.currencyData != undefined) {
                        for (var item in $rootScope.currencyData) {
                            if (item.ccurrencyId == currencyId) {
                                roundingConvertedScale = item.roundingConverted;
                                roundingOriginalCurrencyScale = item.roundingOriginalCurrency;

                                break;
                            }
                        }

                        return amount
                            .format(roundingOriginalCurrencyScale);
                    } else {
                        return amount;
                    }
                }

                function getRoundingConvertedCurrency(currencyId,
                                                      amount) {
                    var roundingConvertedScale = 0;
                    var roundingOriginalCurrencyScale = 2;

                    if ($rootScope.currencyData != undefined) {
                        for (var item in $rootScope.currencyData) {
                            if (item.ccurrencyId == currencyId) {
                                roundingConvertedScale = item.roundingConverted;
                                roundingOriginalCurrencyScale = item.roundingOriginalCurrency;

                                break;
                            }
                        }
                        console.log("roundingConvertedScale: "
                            + roundingConvertedScale);
                        return amount
                            .format(roundingConvertedScale);
                    } else {
                        return amount;
                    }
                }

                function getAdOrgDefault() {
                    return Restangular.one(
                        RestEndpoint.AD_ORG_SERVICE_URL
                        + "/getDefault").get();
                }

                function getDepartmentDefault() {
                    return Restangular.one(
                        RestEndpoint.C_DEPARTMENT_SERVICE_URL
                        + "/getDefault").get();
                }

                function getValueOrg(adOrgId) {
                    return Restangular.all(
                        RestEndpoint.AD_ORG_SERVICE_URL
                        + "/getValue/").post(adOrgId);
                }

                function getNotify(userId) {
                    return Restangular.all(
                        RestEndpoint.GET_NOTIFY_SERVICE_URL)
                        .post(userId);
                }

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
                                    this.wrapper
                                        .children(
                                            '.k-window-content')
                                        .addClass(
                                            "fix-footer");
                                    $rootScope.$broadcast('Popup.open');

                                },
                                close: function () {
                                    // modalInstance = null;
                                    $rootScope
                                        .$broadcast('Popup.CloseClick');
                                    isOpening = false;
                                },
                                activate: function () {
                                    if (document.getElementById(idFocus))
                                        document.getElementById(idFocus).focus();
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

                function getPopupClose() {
                    return modalInstance1;
                }

                function populatePopupHSHC(templateUrl,
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
                                    this.wrapper
                                        .children(
                                            '.k-window-content')
                                        .addClass(
                                            "fix-footer");
                                    $rootScope.$broadcast('PopupHSHC.open');

                                },
                                close: function () {
                                    // modalInstance = null;
                                    $rootScope
                                        .$broadcast('PopupHSHC.CloseClick');
                                    isOpening = false;
                                },
                                activate: function () {
                                    if (document.getElementById(idFocus))
                                        document.getElementById(idFocus).focus();
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

                function populatePopupPartner(templateUrl,
                                              gridTitle, data, caller, windowId,
                                              isCreateNew, sizeWith, sizeHeight, idFocus) {
                    checkOnePopup = true;
                    modalInstance = $kWindow
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
                                    this.wrapper
                                        .children(
                                            '.k-window-content')
                                        .addClass(
                                            "fix-footer");
                                    $rootScope.$broadcast('Popup.open');

                                },
                                close: function () {
                                    // modalInstance = null;
                                    $rootScope
                                        .$broadcast('Popup.CloseClick');
                                    isOpening = false;
                                },
                                activate: function () {
                                    if (document.getElementById(idFocus))
                                        document.getElementById(idFocus).focus();
                                }
                            },
                            templateUrl: templateUrl,
                            controller: 'PopupCommonControllerCtrl',
                            resolve: {
                                data: function () {
                                    return data;
                                },
                                caller: function () {
                                    return caller;
                                },
                                modalInstance: function () {
                                    return this;
                                },
                                windowId: function () {
                                    return windowId;
                                },
                                isCreateNew: function () {
                                    return isCreateNew;
                                }
                            }
                        });

                    modalInstance.result.then(function (result) {
                        dismissPopup();
                    });
                }

                function populatePopupOnPopup(templateUrl,
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
                                    this.wrapper
                                        .children(
                                            '.k-window-content')
                                        .addClass(
                                            "fix-footer");
                                    $rootScope.$broadcast('PopupOnPopup.open');

                                },
                                close: function () {
                                    // modalInstance = null;
                                    $rootScope
                                        .$broadcast('PopupOnPopup.CloseClick');
                                    isOpening = false;
                                },
                                activate: function () {
                                    if (document.getElementById(idFocus))
                                        document.getElementById(idFocus).focus();
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

                function populatePopupYearDetail(templateUrl,
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
                                    this.wrapper
                                        .children(
                                            '.k-window-content')
                                        .addClass(
                                            "fix-footer");
                                    $rootScope.$broadcast('PopupYearPlan.open');

                                },
                                close: function () {
                                    // modalInstance = null;
                                    $rootScope
                                        .$broadcast('Popup.CloseClick1');
                                    isOpening = false;
                                },
                                activate: function () {
                                    if (document.getElementById(idFocus))
                                        document.getElementById(idFocus).focus();
                                },
                            },
                            templateUrl: templateUrl,
                            controller: 'PopupYearPlanCtrl',
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
                                }
                            }
                        });

                    modalInstance1.result.then(function (result) {
                        dismissPopup1();
                    });
                }

                function populatePopupDept(templateUrl, gridTitle,
                                           gridOptions, data, caller, popupId,
                                           searchType, isMultiSelect, sizeWith,
                                           sizeHeight) {
                    checkOnePopup = true;
                    modalInstance1 = $kWindow.open({
                        options: {
                            modal: true,
                            title: gridTitle,
                            visible: false,
                            width: sizeWith,
                            height: sizeHeight,
                            actions: ["Minimize", "Maximize",
                                "Close"],
                            open: function () {
                                this.wrapper.children(
                                    '.k-window-content')
                                    .addClass("fix-footer");
                            }
                        },
                        templateUrl: templateUrl,
                        controller: 'popupDepartmentController',
                        resolve: {
                            gridOptions: function () {
                                return gridOptions;
                            },
                            dataTree: function () {
                                return data;
                            },
                            caller: function () {
                                return caller;
                            },
                            modalInstance1: function () {
                                return this;
                            },
                            popupId: function () {
                                return popupId;
                            },
                            searchType: function () {
                                return searchType;
                            },
                            isMultiSelect: function () {
                                return isMultiSelect;
                            }
                        }
                    });

                    modalInstance1.result.then(function (result) {
                        dismissPopup1();
                    });
                }

//							hungtd_20192201_start
                function populatePopupcoupon(templateUrl, gridTitle,
                                             gridOptions, data, caller, popupId,
                                             searchType, isMultiSelect, sizeWith,
                                             sizeHeight) {
                    checkOnePopup = true;
                    modalInstance1 = $kWindow.open({
                        options: {
                            modal: true,
                            title: gridTitle,
                            visible: false,
                            width: sizeWith,
                            height: sizeHeight,
                            actions: ["Minimize", "Maximize",
                                "Close"],
                            open: function () {
                                this.wrapper.children(
                                    '.k-window-content')
                                    .addClass("fix-footer");
                            }
                        },
                        templateUrl: templateUrl,
                        controller: 'populatePopupcouponController',
                        resolve: {
                            gridOptions: function () {
                                return gridOptions;
                            },
                            dataTree: function () {
                                return data;
                            },
                            caller: function () {
                                return caller;
                            },
                            modalInstance1: function () {
                                return this;
                            },
                            popupId: function () {
                                return popupId;
                            },
                            searchType: function () {
                                return searchType;
                            },
                            isMultiSelect: function () {
                                return isMultiSelect;
                            }
                        }
                    });

                    modalInstance1.result.then(function (result) {
                        dismissPopup1();
                    });
                }

//							hungt_20192201_end

                function deliveryUnitPopupDept(templateUrl, gridTitle,
                                               deliveryUnitOptions, data, caller, popupId,
                                               searchType, isMultiSelect, sizeWith,
                                               sizeHeight) {
                    checkOnePopup = true;
                    modalInstance1 = $kWindow.open({
                        options: {
                            modal: true,
                            title: gridTitle,
                            visible: false,
                            width: sizeWith,
                            height: sizeHeight,
                            actions: ["Minimize", "Maximize",
                                "Close"],
                            open: function () {
                                this.wrapper.children(
                                    '.k-window-content')
                                    .addClass("fix-footer");
                            }
                        },
                        templateUrl: templateUrl,
                        controller: 'deliveryUnitPopupController',
                        resolve: {
                            deliveryUnitOptions: function () {
                                return deliveryUnitOptions;
                            },
                            dataTree: function () {
                                return data;
                            },
                            caller: function () {
                                return caller;
                            },
                            modalInstance1: function () {
                                return this;
                            },
                            popupId: function () {
                                return popupId;
                            },
                            searchType: function () {
                                return searchType;
                            },
                            isMultiSelect: function () {
                                return isMultiSelect;
                            }
                        }
                    });

                    modalInstance1.result.then(function (result) {
                        dismissPopup1();
                    });
                }

                function populatePopupVofice(templateUrl, gridTitle, businessType,
                                             data, caller, popupId,
                                             searchType, isMultiSelect, sizeWith,
                                             sizeHeight) {
                    modalInstance = $kWindow.open({
                        options: {
                            modal: true,
                            title: gridTitle,
                            visible: false,
                            width: sizeWith,
                            height: sizeHeight,
                            actions: ["Minimize", "Maximize",
                                "Close"],
                            open: function () {
                                this.wrapper.children(
                                    '.k-window-content')
                                    .addClass("fix-footer");
                            }
                        },
                        templateUrl: templateUrl,
                        controller: 'signVofficeController',
                        resolve: {
                            data: function () {
                                return data;
                            },
                            businessType: function () {
                                return businessType;
                            },
                            caller: function () {
                                return caller;
                            },
                            modalInstance: function () {
                                return this;
                            },
                            popupId: function () {
                                return popupId;
                            },
                            searchType: function () {
                                return searchType;
                            },
                            isMultiSelect: function () {
                                return isMultiSelect;
                            }
                        }
                    });

                    modalInstance.result.then(function (result) {
                        dismissPopup();
                    });
                }

                function getDepartment(obj) {
                    return Restangular
                        .all(
                            "sysGroupServiceRest/sysGroup/getall")
                        .post(obj);
                }

                function getCatPartner(obj) {
                    return Restangular
                        .all(
                            "contructionLandHandoverPlan/doSearchPartner")
                        .post(obj);
                }


                function goTo(menuKey) {

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

                function closeTab(menuKey) {


                    var template = Constant
                        .getTemplateUrl(menuKey);

                    postal.publish({
                        channel: "Tab",
                        topic: "closeTab",
                        data: template
                    });
                }

                // validate template import

                function validateImport(dataList, validateColums) {
                    var objReturn = {}
                    objReturn.listData = [];
                    if (dataList.hederList.length < validateColums.length) {
                        objReturn.msg = "Không đúng biểu mẫu import"
                        return objReturn
                    } else {
                        var str1 = "";
                        var str2 = "";
                        for (var i = 0; i < validateColums.length; i++) {
                            str1 = str1 + validateColums[i].colum;
                        }

                        for (var i = 0; i < dataList.hederList.length; i++) {
                            str2 = str2 + dataList.hederList[i];
                        }
                        if (str1 !== str2) {
                            objReturn.msg = "Không đúng biểu mẫu import"
                            return objReturn
                        }

                    }
                    return objReturn;

                }

                // Export common
                function exportFile(kendoGrid, data, listRemove,
                                    listConvert, FileName) {
                    var selectedRow = [];
                    kendoGrid.table.find("tr").each(
                        function (idx, item) {
                            var row = $(item);
                            var checkbox = $(
                                '[name="gridcheckbox"]',
                                row);

                            if (checkbox.is(':checked')) {
                                // Push id into selectedRow
                                var tr = kendoGrid.select()
                                    .closest("tr");
                                var dataItem = kendoGrid
                                    .dataItem(item);
                                selectedRow.push(dataItem);
                            }
                        });
//								var data = [];
//								if (obj != null) {
//									data.push(obj);
//								} else if (selectedRow.length > 0
//										&& obj == null) {
//									data = selectedRow
//								} else {
//									data = kendoGrid.dataSource.data();
//								}
                    var title = [];
                    var field = [];
                    for (var i = 0; i < kendoGrid.columns.length; i++) {
                        var check = true;
                        for (var j = 0; j < listRemove.length; j++) {
                            if (kendoGrid.columns[i].title == listRemove[j].title) {
                                check = false;
                            }
                        }
                        if (check) {

                            title.push(kendoGrid.columns[i].title);


                            field.push(kendoGrid.columns[i])
                        }
                    }

                    exportExcel(title, buildDataExport(data, field,
                        listConvert), FileName);
                }

                // Export excel grid tuỳ chỉnh số lượng cột ẩn hiện từ menu cài đặt
                function exportFile2(kendoGrid, data, listRemove,
                                    listConvert, FileName) {
                    var selectedRow = [];
                    kendoGrid.table.find("tr").each(
                        function (idx, item) {
                            var row = $(item);
                            var checkbox = $(
                                '[name="gridcheckbox"]',
                                row);

                            if (checkbox.is(':checked')) {
                                // Push id into selectedRow
                                var tr = kendoGrid.select()
                                    .closest("tr");
                                var dataItem = kendoGrid
                                    .dataItem(item);
                                selectedRow.push(dataItem);
                            }
                        });
                    var title = [];
                    var field = [];

                    kendoGrid.columns.forEach(x => {
                        let check = true;
                        listRemove.every(i => {
                            if (x.title == i.title) {
                                check = false;
                            }
                            return check;
                        })

                        if (x.hidden)
                            check = false;

                        if (check) {
                            title.push({title: x.title, width: x.width});
                            field.push(x)
                        }
                    })

                    exportExcel2(title, buildDataExport(data, field,
                        listConvert), FileName);
                }

                function exportFileNoGrid(rowDataList, fieldList, fileName) {
                    var convertList = [];
                    var titleList = fieldList.map(item => item.title);
                    var dataList = buildDataExport(rowDataList, fieldList, convertList);

                    exportExcel(titleList, dataList, fileName);
                }

                function buildDataExport(data, filed, listConvert) {
                    // Row content
                    var rData = [];
                    $
                        .each(
                            data,
                            function (index, value) {
                                var objJson = JSON
                                    .parse(JSON
                                        .stringify(value));
                                var item = {
                                    cells: []
                                };
                                for (var i = 0; i < filed.length; i++) {
                                    var objadd = {};
                                    var check = false;
                                    var textAlign = (filed[i].attributes.style.split(":")[1]).replace(";", "");
                                    for (var j = 0; j < listConvert.length; j++) {

                                        if (filed[i].field == listConvert[j].field) {
                                            objadd.value = listConvert[j].data[objJson[filed[i].field]];
                                            objadd.borderBottom = {color: "#000000", size: 1};
                                            objadd.borderTop = {color: "#000000", size: 1};
                                            objadd.borderRight = {color: "#000000", size: 1};
                                            objadd.borderLeft = {color: "#000000", size: 1};
                                            objadd.textAlign = textAlign;
                                            objadd.fontFamily = "Times New Roman";
                                            check = true;
                                        }
                                    }
                                    if (check) {

                                    } else if (filed[i].field == "stt") {
                                        objadd.value = index + 1;
                                        objadd.borderBottom = {color: "#000000", size: 1};
                                        objadd.borderTop = {color: "#000000", size: 1};
                                        objadd.borderRight = {color: "#000000", size: 1};
                                        objadd.borderLeft = {color: "#000000", size: 1};
                                        objadd.textAlign = textAlign;
                                        objadd.fontFamily = "Times New Roman";
                                    } else {
                                        objadd.value = objJson[filed[i].field];
                                        objadd.borderBottom = {color: "#000000", size: 1};
                                        objadd.borderTop = {color: "#000000", size: 1};
                                        objadd.borderRight = {color: "#000000", size: 1};
                                        objadd.borderLeft = {color: "#000000", size: 1};
                                        objadd.textAlign = textAlign;
                                        objadd.fontFamily = "Times New Roman";

                                        //VietNT_22/07/2019_start
                                        //format type number field
                                        if (filed[i].excelFormat) {
                                            objadd.format = filed[i].excelFormat;
                                        }
                                        //VietNT_end
                                    }
                                    item.cells.push(objadd);
                                }

                                rData.push(item);
                            });
                    return rData;
                }

                function exportReport(obj) {
                    var deferred = $q.defer();
                    $http({
                        url: RestEndpoint.BASE_SERVICE_URL + "reportServiceRest" + "/exportPdf",
                        dataType: 'json',
                        method: 'POST',
                        data: obj,
                        headers: {
                            "Content-Type": "application/json"
                        },
                        responseType: 'arraybuffer',//THIS IS IMPORTANT
                    }).success(function (data, status, headers, config) {
                        if (headers('error')) {
                            var obj1 = {};
                            obj1.error = headers('error');
                            deferred.resolve(obj1);
                        } else {
                            deferred.resolve(data);
                        }

                    })
                        .error(function (data) {
                            deferred.reject(data);
                        });
                    return deferred.promise;
                }


                function genCode(obj) {
                    return Restangular.all("commonServiceRest/genCode").post(obj);
                }

                function getCharFour(obj) {
                    return Restangular.all("commonServiceRest/getCharFour").post(obj);
                }

                function getCharThree(obj) {
                    return Restangular.all("commonServiceRest/getCharThree").post(obj);
                }

                function getCharOneTimes(obj) {
                    return Restangular.all("commonServiceRest/getCharOneTimes").post(obj);
                }

                function getCharOneAmount(obj) {
                    return Restangular.all("commonServiceRest/getCharOneAmount").post(obj);
                }

                function getCharTwoWeek(obj) {
                    return Restangular.all("commonServiceRest/getCharTwoWeek").post(obj);
                }

                function getCharTwoMonth(obj) {
                    return Restangular.all("commonServiceRest/getCharTwoMonth").post(obj);
                }

                function signVoffice(List) {
                    return Restangular.all("reportServiceRest/signVoffice").post(List);
                }

                function previewVoffice(obj) {
                    $http({
                        url: RestEndpoint.BASE_SERVICE_URL + "reportServiceRest" + "/previewVoffice",
                        dataType: 'json',
                        method: 'POST',
                        data: obj,
                        headers: {
                            "Content-Type": "application/json"
                        },
                        responseType: 'arraybuffer'//THIS IS IMPORTANT
                    }).success(function (data, status, headers, config) {
                        if (data.error) {
                            toastr.error(data.error);
                        } else {
                            var file = new Blob([data], {type: 'application/pdf'});
                            var fileURL = URL.createObjectURL(file);
                            window.open(fileURL);

                            //var url= window.URL.createObjectURL(blob);
                            //window.open(url);
                            //
                            //var pdfAsDataUri = "data:application/pdf;base64,"+data;
                            //window.open(pdfAsDataUri);
                        }

                    })
                        .error(function (data) {
                            toastr.error("Có lỗi xảy ra!");
                        });
                }

                function downloadAttachFile(obj) {
                    $http({
                        url: RestEndpoint.BASE_SERVICE_URL + "reportServiceRest" + "/downloadAttachFile",
                        dataType: 'json',
                        method: 'POST',
                        data: obj,
                        headers: {
                            "Content-Type": "application/json"
                        },
                        responseType: 'arraybuffer'//THIS IS IMPORTANT
                    }).success(function (data, status, headers, config) {
                        if (data.error) {
                            toastr.error(data.error);
                        } else {
                            var binarydata = new Blob([data], {type: 'application/*'});
                            kendo.saveAs({dataURI: binarydata, fileName: "PhuLucThangChiTiet.zip"});

                            //var url= window.URL.createObjectURL(blob);
                            //window.open(url);
                            //
                            //var pdfAsDataUri = "data:application/pdf;base64,"+data;
                            //window.open(pdfAsDataUri);
                        }

                    })
                        .error(function (data) {
                            toastr.error("Có lỗi xảy ra!");
                        });
                }

                function viewSignedDoc(obj) {
                    $http({
                        url: RestEndpoint.BASE_SERVICE_URL + "reportServiceRest" + "/viewSignedDoc",
                        dataType: 'json',
                        method: 'POST',
                        data: obj,
                        headers: {
                            "Content-Type": "application/json"
                        },
                        responseType: 'arraybuffer'//THIS IS IMPORTANT
                    }).success(function (data, status, headers, config) {
                        if (data.error) {
                            toastr.error(data.error);
                        } else {
                            var file = new Blob([data], {type: 'application/pdf'});
                            var fileURL = URL.createObjectURL(file);
                            window.open(fileURL);
                        }

                    })
                        .error(function (data) {
                            toastr.error("Có lỗi xảy ra khi lấy dữ liệu từ VOffice!");
                        });
                }

                function getDataSign(obj) {
                    return Restangular.all("signVofficeRsServiceRest/signVoffice/getDataSign").post(obj);
                }

                function getDetailSign(obj) {
                    return Restangular.all("signVofficeRsServiceRest/signVoffice/getDetail").post(obj);
                }

                function downloadTemplate(fileName) {
                    return Restangular
                        .all("commonServiceRest/exportExcelTemplate").post(fileName);
                }

                function getallData(linkApi, obj) {
                    return Restangular.all(linkApi).post(obj);
                }

                function resetData(caller, comboId) {
                    caller.onClear(comboId);
                }

                //phuc vu chuyen menu khi chuyen sang tomcat khac
                function requestMenuCode(obj) {
                    var urlPost = {
                        menuCode: obj.menuCode,
                        urlCallMenu: obj.urlCallMenu
                    }
                    return $http.post(obj.urlCallService + 'commonServiceRest/requestMenuCode', urlPost)
                }


                function downloadTemplate2(fileName) {
                    return Restangular
                        .all("commonServiceRest/exportExcelTemplate2").post(fileName);
                }

//							hungtd_20192201_start
                function getCoupon(obj) {
                    return Restangular
                        .all(
                            "rpQuantityService/doSearchPopup")
                        .post(obj);
                }

//							hungtd_20192201_end
//HuyPQ-start
                function getSysGroup(obj) {
                    return Restangular
                        .all(
                            "departmentRsService/department/getSysGroupCheck")
                        .post(obj);
                }


                function populatePopupGroup(templateUrl, gridTitle,
                                            gridOptions, data, caller, popupId,
                                            searchType, isMultiSelect, sizeWith,
                                            sizeHeight) {
                    checkOnePopup = true;
                    modalInstance1 = $kWindow.open({
                        options: {
                            modal: true,
                            title: gridTitle,
                            visible: false,
                            width: sizeWith,
                            height: sizeHeight,
                            actions: ["Minimize", "Maximize",
                                "Close"],
                            open: function () {
                                this.wrapper.children(
                                    '.k-window-content')
                                    .addClass("fix-footer");
                            }
                        },
                        templateUrl: templateUrl,
                        controller: 'popupSysGroupController',
                        resolve: {
                            gridOptions: function () {
                                return gridOptions;
                            },
                            dataTree: function () {
                                return data;
                            },
                            caller: function () {
                                return caller;
                            },
                            modalInstance1: function () {
                                return this;
                            },
                            popupId: function () {
                                return popupId;
                            },
                            searchType: function () {
                                return searchType;
                            },
                            isMultiSelect: function () {
                                return isMultiSelect;
                            }
                        }
                    });

                    modalInstance1.result.then(function (result) {
                        dismissPopup1();
                    });
                }

                //HuyPQ-end

                //TrungPT add 19/11/2019
                function getMoneyType(obj) {
                    return Restangular
                        .all(RestEndpoint.APP_PARAM_SERVICE_URL + "/doSearch").post(obj);
                }

                function logAccess(logObj) {
                    var obj;
                    if (typeof logObj === 'string') {
                        obj = {functionCode: logObj};
                    } else if (typeof logObj === 'object') {
                        obj = angular.copy(logObj);
                    }
                    if (!!obj) {
                        return Restangular.all(RestEndpoint.REPORT_AIO_URL + "/logAccess").post(obj);
                    } else {
                        console.log("loi input: " + logObj);
                    }
                }

                /*Outsource-25062020-start*/
                function getSysGroupByRole(obj) {
                    return Restangular
                        .all(
                            "aioDesignRequirementsRsService/getAutoCompleteSysGroup")
                        .post(obj);
                }

                function getSysUserByRole(obj) {
                    return Restangular
                        .all(
                            "aioDesignRequirementsRsService/getAutoCompleteSysUser")
                        .post(obj);
                }

                function getAllService(obj) {
                    return Restangular
                        .all(
                            "aioDesignRequirementsRsService/getAllService")
                        .post(obj);
                }

                function populatePopupUser(templateUrl, gridTitle,
                                           gridOptions, data, caller, popupId,
                                           searchType, isMultiSelect, sizeWith,
                                           sizeHeight) {
                    checkOnePopup = true;
                    modalInstance1 = $kWindow.open({
                        options: {
                            modal: true,
                            title: gridTitle,
                            visible: false,
                            width: sizeWith,
                            height: sizeHeight,
                            actions: ["Minimize", "Maximize",
                                "Close"],
                            open: function () {
                                this.wrapper.children(
                                    '.k-window-content')
                                    .addClass("fix-footer");
                            }
                        },
                        templateUrl: templateUrl,
                        controller: 'popupSysUserController',
                        resolve: {
                            gridOptions: function () {
                                return gridOptions;
                            },
                            dataTree: function () {
                                return data;
                            },
                            caller: function () {
                                return caller;
                            },
                            modalInstance1: function () {
                                return this;
                            },
                            popupId: function () {
                                return popupId;
                            },
                            searchType: function () {
                                return searchType;
                            },
                            isMultiSelect: function () {
                                return isMultiSelect;
                            }
                        }
                    });

                    modalInstance1.result.then(function (result) {
                        dismissPopup1();
                    });
                }

                function populatePopupService(templateUrl, gridTitle,
                                              gridOptions, data, caller, popupId,
                                              searchType, isMultiSelect, sizeWith,
                                              sizeHeight) {
                    checkOnePopup = true;
                    modalInstance1 = $kWindow.open({
                        options: {
                            modal: true,
                            title: gridTitle,
                            visible: false,
                            width: sizeWith,
                            height: sizeHeight,
                            actions: ["Minimize", "Maximize",
                                "Close"],
                            open: function () {
                                this.wrapper.children(
                                    '.k-window-content')
                                    .addClass("fix-footer");
                            }
                        },
                        templateUrl: templateUrl,
                        controller: 'popupServiceController',
                        resolve: {
                            gridOptions: function () {
                                return gridOptions;
                            },
                            dataTree: function () {
                                return data;
                            },
                            caller: function () {
                                return caller;
                            },
                            modalInstance1: function () {
                                return this;
                            },
                            popupId: function () {
                                return popupId;
                            },
                            searchType: function () {
                                return searchType;
                            },
                            isMultiSelect: function () {
                                return isMultiSelect;
                            }
                        }
                    });

                    modalInstance1.result.then(function (result) {
                        dismissPopup1();
                    });
                }

                function fillDataPopupCommonSearch(api, searchForm, listColumns, caller) {
                    caller.commonSearchPopupGridOptions = kendoConfig.getGridOptions({
                        autoBind: true,
                        resizable: true,
                        dataBinding: function () {
                            caller.recordPopup = (this.dataSource.page() - 1) * this.dataSource.pageSize();
                        },
                        dataSource: {
                            serverPaging: true,
                            schema: {
                                errors: function (response) {
                                    if (response.error) {
                                        toastr.error(response.error);
                                    }
                                    return response.error;
                                },
                                total: function (response) {
                                    caller.countCommonPopup = response.total;
                                    return response.total;
                                },
                                data: function (response) {
                                    var list = response.data;
                                    return list;
                                },
                            },
                            transport: {
                                read: {
                                    // Thuc hien viec goi service
                                    url: Constant.BASE_SERVICE_URL + api,
                                    contentType: "application/json; charset=utf-8",
                                    type: "POST"
                                },
                                parameterMap: function (options, type) {
                                    searchForm.page = options.page;
                                    searchForm.pageSize = options.pageSize;
                                    return JSON.stringify(searchForm);
                                }
                            },
                            pageSize: 10
                        },
                        noRecords: true,
                        columnMenu: false,
                        scrollable: true,
                        messages: {
                            noRecords: this.translate("Không có kết quả hiển thị")
                        },
                        pageable: {
                            refresh: false,
                            pageSizes: [10, 15, 20, 25],
                            messages: {
                                display: this.translate("{0}-{1} của {2} kết quả"),
                                itemsPerPage: this.translate("kết quả/trang"),
                                empty: this.translate("Không có kết quả hiển thị")
                            }
                        },
                        columns: listColumns
                    });
                }

                function checkPermission(id) {
                    return Restangular.all(RestEndpoint.COMMON_RS_SERVICE_URL + "/checkPermission").post(id);
                }

                function getAppParam(obj) {
                    return Restangular.all(RestEndpoint.COMMON_RS_SERVICE_URL + "/getAppParam").post(obj);
                }

                function getCnktOfUser(obj) {
                    return Restangular.all(RestEndpoint.COMMON_RS_SERVICE_URL + "/sysGroup/getCnktOfUser").post(obj);
                }

                /*Outsource end*/


            }]);
