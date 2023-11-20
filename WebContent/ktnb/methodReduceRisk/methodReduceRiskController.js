(function () {
    'use strict';
    var controllerId = 'methodReduceRiskController';

    angular.module('MetronicApp').controller(controllerId, methodReduceRiskController);

    function methodReduceRiskController($scope,$http, $templateCache, $rootScope, $timeout, gettextCatalog,
                                  kendoConfig, $kWindow, $q, methodReduceRiskRsService,
                                  CommonService, htmlCommonService, PopupConst, Restangular, RestEndpoint, Constant) {
        var vm = this;

        vm.documentBody = $(".tab-content");
        vm.modalBody = ".k-window";
        vm.searchForm = {};
        vm.insertForm = {};
        vm.modalAdd = null;
        vm.modalAdd1 = null;
        vm.type = '';
        vm.color = '#fff';
        vm.sysUserId = null;
        // vm.sysGroupLv2Id = parseInt($rootScope.$root.authenticatedUser.VpsUserInfo.path.substring(1,$rootScope.$root.authenticatedUser.VpsUserInfo.path.length-1).split("/")[1]);
        initForm();
        function initForm() {
            vm.string = CommonService.translate("Quản trị rủi ro") + " > "+ CommonService.translate("Phương pháp giảm thiểu rủi ro");
            vm.sysUserId = $rootScope.$root.authenticatedUser.VpsUserInfo.sysUserId;
        }
        var record = 0;
        vm.methodReduceRiskGridOptions = kendoConfig.getGridOptions({
            autoBind: true,
            resizable: true,
            scrollable: true,
            dataBinding: function () {
                record = (this.dataSource.page() - 1) * this.dataSource.pageSize();
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
                        vm.count = response.total;
                        return response.total;
                    },
                    data: function (response) {
                        return response.data;
                    },
                },
                transport: {
                    read: {
                        url: Constant.BASE_SERVICE_URL + "methodReduceRiskRsService/doSearch",
                        contentType: "application/json; charset=utf-8",
                        type: "POST"
                    },
                    parameterMap: function (options, type) {
                        vm.searchForm.page = options.page;
                        vm.searchForm.pageSize = options.pageSize;
                        return JSON.stringify(vm.searchForm);
                    }
                },
                pageSize: 10
            },
            noRecords: true,
            columnMenu: true,
            messages: {
                noRecords: CommonService.translate("Không có kết quả hiển thị")
            },
            pageable: {
                refresh: false,
                pageSizes: [10, 15, 20, 25],
                messages: {
                    display: CommonService.translate("{0}-{1} của {2} kết quả"),
                    itemsPerPage: CommonService.translate("kết quả/trang"),
                    empty: CommonService.translate("Không có kết quả hiển thị")
                }
            },
            columns: [
                {
                    title: CommonService.translate("TT"),
                    field: "stt",
                    template: function () {
                        return ++record;
                    },
                    width: "40px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Mã WO"),
                    field: 'woRiskCode',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                    template: dataItem => '<a ng-click="vm.viewDetail(dataItem)" ng-bind="dataItem.woRiskCode"></a>'
                },
                {
                    title: CommonService.translate("Mã KRI"),
                    field: 'kriCode',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Mã rủi ro"),
                    field: 'riskCode',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Giải pháp ứng phó hiện tại"),
                    field: 'solutionHt',
                    width: "200px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Giải pháp ứng phó bổ sung"),
                    field: 'solutionBs',
                    width: "150px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Thời hạn đóng WO"),
                    field: 'closeDuration',
                    width: "150px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Nhân viên ĐPV"),
                    field: 'text',
                    width: "150px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                    template: function (dataItem){
                        if(dataItem.sysUserName == null) return '';
                        else return dataItem.text;
                    }
                },
                {
                    title: CommonService.translate("Tình trạng WO"),
                    field: 'status',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                    template: function(dataItem){
                        var date = new Date();
                        var d = date.getDate();
                        var m = date.getMonth() + 1;
                        var y = date.getFullYear();
                        var newDate = new Date(''+y+'/'+m+'/'+d+'');
                        if (newDate > kendo.parseDate(dataItem.closeDuration, "dd/MM/yyyy")){
                            return "Quá hạn";
                        }else {return "Trong hạn"}
                    }
                },
                {
                    title: CommonService.translate("Trạng thái WO"),
                    field: 'state',
                    width: "100px",
                    template: function (dataItem) {
                        if (dataItem.state == 1) {
                            return CommonService.translate("Đã đóng WO");
                        }else if (dataItem.state == 0) {
                            return CommonService.translate("Chưa nhận việc");
                        }
                        else if (dataItem.state == 2) {
                            return CommonService.translate("Đang thực hiện");
                        }else if (dataItem.state == 3) {
                            return CommonService.translate("ĐPV hoàn thành");
                        }
                        else {
                            return "";
                        }
                    },
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Thao tác"),
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                    template: dataItem =>
                        '<div class="text-center" ng-if="dataItem.state != 1">' +
                        '<button ng-if="dataItem.isNvQTRR == 1&&dataItem.state==null"' +
                        'style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Điều phối nhân viên" translate ' +
                        'ng-click="vm.coordinateNV(dataItem)" ><i class="fa fa-share ng-scope" aria-hidden="true" translate></i></button>'
                        +
                        '<button ng-if="dataItem.state == 3 && dataItem.isNvQTRR == 1"' +
                        'style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Từ chối/chấp thuận đóng việc" translate ' +
                        'ng-click="vm.beforeApproved(dataItem)" ><i class="fa fa-check-square ng-scope" style="color: green;" aria-hidden="true" translate></i></button>'
                        +
                        '<button ng-if="dataItem.state == 0 && vm.sysUserId == dataItem.sysUserId"' + //ng-if="{{dataItem.state == 0}} && dataItem.isNvQTRR == 0"
                        'style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Nhận việc" translate ' +
                        'ng-click="vm.acceptWork(dataItem)" ><i class="fa fa-check ng-scope" style="color: green;" aria-hidden="true" translate></i></button>' +
                        '<button ng-if="dataItem.state == 2 && vm.sysUserId == dataItem.sysUserId"' +
                        'style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Thêm tiến trình thực hiện công việc" translate ' +
                        'ng-click="vm.process(dataItem)" ><i class="fa fa-plus ng-scope" style="color: blue;" aria-hidden="true" translate></i></button>' +
                        '</div>',

                    width: "200px",
                    field: "ThaoTac"
                }
            ]
        });
        vm.beforeApproved = function (dataItem) {
            vm.type = 'approved';
            vm.color = 'aliceblue';
            vm.insertForm = angular.copy(dataItem);
            var templateUrl = 'ktnb/methodReduceRisk/methodReduceRiskPopup.html';
            var title = CommonService.translate("Thêm tiến trình khắc phục công việc");
            vm.modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "70%", null, null);

        }
        vm.viewDetail = function (dataItem) {
            vm.type = 'detail';
            vm.color = 'aliceblue';
            vm.insertForm = angular.copy(dataItem);
            var templateUrl = 'ktnb/methodReduceRisk/methodReduceRiskPopup.html';
            var title = CommonService.translate("Thêm tiến trình khắc phục công việc");
            vm.modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "70%", null, null);
        }
        vm.process = function (dataItem) {
            vm.insertForm = angular.copy(dataItem);
            // if(dataItem.startDateDpv == null){
            //     methodReduceRiskRsService.acceptWork(vm.insertForm).then(function (response){
            //     },function (error) {
            //         console.error(error);
            //         toastr.error(CommonService.translate("Có lỗi xảy ra khi nhận việc"));
            //     })
            // }
            vm.type = 'process';
            vm.color = '#f6fff0'
            var templateUrl = 'ktnb/methodReduceRisk/methodReduceRiskPopup.html';
            var title = CommonService.translate("Thêm tiến trình khắc phục công việc");
            vm.modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "70%", null, null);


        }
        vm.coordinateNV = function (dataItem) {
            vm.color = '#fff'
            vm.type = 'coordinateNV';
            vm.insertForm = angular.copy(dataItem);
            var templateUrl = 'ktnb/methodReduceRisk/methodReduceRiskPopup.html';
            var title = CommonService.translate("Điều phối cho nhân viên");
            vm.modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "60%", null, null);
        };

        vm.sysUserOptions = {
            clearButton: false,
            dataTextField: "fullName", placeholder: CommonService.translate("Nhập tên nhân viên"),
            dataValueField: "fullName",
            open: function (e) {
                vm.isSelectUser = false;
            },
            select: function (e) {
                vm.isSelectUser = true;
                var dataItem = this.dataItem(e.item.index());
                vm.insertForm.sysUserId = dataItem.sysUserId;
                vm.insertForm.sysUserName = dataItem.fullName;
                vm.insertForm.sysGroupName = dataItem.sysGroupNameLv2;
                vm.insertForm.sysGroupId = dataItem.sysGroupId;
                vm.insertForm.email = dataItem.email;

                vm.searchForm.sysUserName = dataItem.fullName;
                vm.searchForm.sysUserId = dataItem.sysUserId;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectUser) {
                        vm.insertForm.sysUserId = null;
                        vm.insertForm.sysUserName = null;
                        vm.insertForm.sysGroupName = null;
                        vm.insertForm.sysGroupId = null;
                        vm.insertForm.email = null;

                        vm.searchForm.sysUserName = null;
                        vm.searchForm.sysUserId = null;
                    }
                }, 100);
            },
            close: function (e) {
                $timeout(function () {
                    if (vm.insertForm.signedBy == null) {
                        vm.insertForm.signedByCode = null;
                        vm.insertForm.signedByName = null;
                    }
                }, 1000);

            },
            pageSize: 10,
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        vm.isSelectUser = false;
                        return Restangular.all("commonRsService/getSysUserForAutoComplete").post(
                            {
                                keySearch: getSysUserName(),
                                page: 1,
                                pageSize: 10
                            }
                        ).then(function (response) {
                            options.success(response.data);
                        }).catch(function (err) {
                            console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
                        });
                    }
                }
            },

            headerTemplate: '<div class="dropdown-header text-center k-widget k-header">' +
                '<div class="row">' +
                '<p class="col-md-6 text-header-auto border-right-ccc" translate>Mã nhân viên </p>' +
                '<p class="col-md-6 text-header-auto" translate>Tên nhân viên </p>' +
                '</div>' +
                '</div>',
            template: '<div class="row" ><div class="col-md-6 col-xs-5" style="float:left">#: data.employeeCode #</div><div  style="padding-left: 5px;width:auto;overflow: hidden"> #: data.fullName #</div> </div>',
        };

        function getSysUserName() {
            if (vm.insertForm.sysUserName != null){return vm.insertForm.sysUserName}
            else if (vm.searchForm.sysUserName != null){return vm.searchForm.sysUserName}
            else return null;
        }
        vm.clear = function(type) {
            if (type == 'PDV'){
                vm.insertForm.sysUserId = null;
                vm.insertForm.sysUserName = null;
                vm.insertForm.sysGroupName = null;
                vm.insertForm.sysGroupId = null;
                vm.insertForm.email = null;
            }
            if (type == 'result'){vm.insertForm.result = null;}
            if (type == 'methodPlan'){vm.insertForm.methodPlan = null;}
            if (type == 'woRiskCode'){vm.searchForm.woRiskCode = null;}
            if (type == 'PDVSearch'){vm.searchForm.sysUserName = null;vm.searchForm.sysUserId = null;}
            if (type == 'statusWo'){vm.searchForm.status = null;}
        }
        vm.acceptWork  = function (dataItem) {
            vm.insertForm = angular.copy(dataItem);
            confirm(CommonService.translate("Xác nhận nhận việc!"),function () {
                kendo.ui.progress(vm.documentBody,true);
                methodReduceRiskRsService.acceptWork(vm.insertForm).then(function (response){
                    kendo.ui.progress(vm.documentBody,false);
                    vm.doSearch();
                    vm.cancel();
                },function (error) {
                    kendo.ui.progress(vm.documentBody,false);
                    toastr.error(CommonService.translate("Có lỗi xảy ra"));
                    console.log(error);
                })
            })
        }
        vm.dontCloseWork = function () {
            var templateUrl = 'ktnb/methodReduceRisk/rejectPopup.html';
            var title = CommonService.translate("Lý do từ chối");
            vm.modalAdd1 = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "40%", "30%", null, null);
        }
        vm.doRejectWork = function () {
            if (vm.insertForm.cancelReason == null){toastr.error(CommonService.translate("Bắt buộc nhập lý do từ chối"));return;}
            kendo.ui.progress($(vm.modalBody),true);
            methodReduceRiskRsService.doRejectWork(vm.insertForm).then(function (response){
                toastr.success(CommonService.translate("Từ chối thành công."));
                vm.doSearch();
                vm.cancel();
                vm.cancel();
                kendo.ui.progress($(vm.modalBody),false);
            },function (error) {
                console.log(error);
                toastr.error(CommonService.translate("Có lỗi xảy ra khi từ chối Work!!"));
                kendo.ui.progress($(vm.modalBody),false);
            })
        }
        vm.doCloseWork = function () {
            confirm(CommonService.translate("Xác nhận đóng việc!"),function () {
                kendo.ui.progress($(vm.modalBody),true);
                methodReduceRiskRsService.doCloseWork(vm.insertForm).then(function (response){
                    kendo.ui.progress($(vm.modalBody),false);
                    vm.doSearch();
                    vm.cancel();
                    toastr.success(CommonService.translate("Đóng việc thành công!!"));
                },function (error) {
                    kendo.ui.progress($(vm.modalBody),false);
                    console.log(error);
                    toastr.error(CommonService.translate("Có lỗi xảy ra khi đóng việc"));
                })
            })
        }
        vm.doProcess = function () {
            if (vm.insertForm.result == null){toastr.error(CommonService.translate("Kết quả thực hiện không được để trống!"));return;};
            if (vm.insertForm.methodPlan == null){toastr.error(CommonService.translate("Kế hoạch thực hiện không được để trống!"));return;};
            kendo.ui.progress($(vm.modalBody),true);
            methodReduceRiskRsService.doProcess(vm.insertForm).then(function (response){
                vm.doSearch();
                vm.cancel();
                toastr.success(CommonService.translate("Thêm tiến trình vụ việc thành công!!"));
                kendo.ui.progress($(vm.modalBody),false);
            },function (error) {
                toastr.error(CommonService.translate("Có lỗi xảy ra!"));
                console.log(error);
                kendo.ui.progress($(vm.modalBody),false);
            })
        }
        vm.doCoordinate = function(){
            if (vm.insertForm.sysUserName == null){toastr.error(CommonService.translate("Điều phối viên không được để trống!!"));return;};
            kendo.ui.progress($(vm.modalBody),true);
            methodReduceRiskRsService.doCoordinate(vm.insertForm).then(function (response){
                kendo.ui.progress($(vm.modalBody),false);
                vm.doSearch();
                vm.cancel();
                toastr.success(CommonService.translate("Điều phối thành công!!"));
            },function (error) {
                console.log(error);
                toastr.error(CommonService.translate("Có lỗi khi điều phối"));
                kendo.ui.progress($(vm.modalBody),false);
            })
        }
        vm.doSearch = function(){
            var grid = $("#methodReduceRiskGrid").data("kendoGrid");
            if(grid){
                grid.dataSource.query({
                    page: 1,
                    pageSize:10
                });
            }
        };
        vm.cancel = function () {
            setTimeout(function () {
                if (vm.modalAdd1 != null) {vm.modalAdd1.dismiss();vm.modalAdd1 = null}
                else if (vm.modalAdd != null){vm.modalAdd.dismiss();vm.modalAdd = null;}
            },200)

        };

        var modalCreateBy = null;

        vm.doSearchCommonPopup = function () {
            var grid = $("#commonSearchPopupGrid").data("kendoGrid");
            if (grid) {
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        }

        vm.openPopupSysUserId = function(){
            var templateUrl = "ktnb/popup/popupCommonSearch.html";
            var title = CommonService.translate("Tìm kiếm nhân viên");
            var windowId = "POPUP_SELECT_SYS_USER";
            vm.placeHolder = CommonService.translate("Mã/tên nhân viên");
            CommonService.populatePopupCreate(templateUrl, title, null, vm, windowId, null, '60%', '50%', null);
            setTimeout(function () {
                modalCreateBy = CommonService.getModalInstance1();
            }, 100);
            vm.commonPopupSearch = {};
            var api = "commonRsService/getSysUserForAutoComplete";
            CommonService.fillDataPopupCommonSearch(api, vm.commonPopupSearch, sysUserColumns, vm);
        }

        var sysUserColumns = [
            {
                title: "TT",
                field: "stt",
                template: function () {
                    return ++vm.recordPopup;
                },
                width: "5%",
                headerAttributes: {
                    style: "text-align:center;", translate: "",
                },
                attributes: {
                    style: "text-align:center;"
                },
            }, {
                title: CommonService.translate("Mã nhân viên"),
                field: 'employeeCode',
                width: "20%",
                headerAttributes: {
                    style: "text-align:center;", translate: "",
                },
                attributes: {
                    style: "text-align:left;"
                },
            }, {
                title: CommonService.translate("Tên nhân viên"),
                field: 'fullName',
                width: "20%",
                headerAttributes: {
                    style: "text-align:center;", translate: "",
                },
                attributes: {
                    style: "text-align:left;"
                },
            }, {
                title: CommonService.translate("Chọn"),
                field: 'choose',
                width: "10%",
                template:
                    '<div class="text-center "> ' +
                    '	<a  type="button" class=" icon_table" uib-tooltip="Chọn" translate>' +
                    '	   <i ng-click="caller.saveSelectSysUser(dataItem)" class="fa fa-check color-green" aria-hidden="true"></i> ' +
                    '	</a>' +
                    '</div>'
                ,
                headerAttributes: {
                    style: "text-align:center;", translate: "",
                },
                attributes: {
                    style: "text-align:center;"
                },
            }
        ];

        vm.saveSelectSysUser = function (dataItem) {
            vm.insertForm.sysUserId = dataItem.sysUserId;
            vm.insertForm.sysUserName = dataItem.fullName;
            vm.insertForm.sysGroupName = dataItem.sysGroupNameLv2;
            vm.insertForm.sysGroupId = dataItem.sysGroupId;
            vm.insertForm.email = dataItem.email;

            vm.searchForm.sysUserName = dataItem.fullName;
            vm.searchForm.sysUserId = dataItem.sysUserId;
            modalCreateBy.dismiss();
        }

    }
})();

