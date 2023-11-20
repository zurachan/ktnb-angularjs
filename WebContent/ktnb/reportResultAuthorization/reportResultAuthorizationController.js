(function () {
    'use strict';
    var controllerId = 'reportResultAuthorizationController';

    angular.module('MetronicApp').controller(controllerId, reportResultAuthorizationController);
    function reportResultAuthorizationController($scope, $http,$timeout,$rootScope, $log,Constant,Restangular,CommonService,kendoConfig,$kWindow,reportResultAuthorizationService,RestEndpoint,gettextCatalog) {
        var vm = this;
        var modalPopup;
        vm.listAuthorizationExportTemp = [];
        vm.modalBody = ".k-widget.k-window";
        vm.documentBody = $(".tab-content");

        initFormData();
        //
        function initFormData() {
            $("#ktnb_searchForm_authorizationId").click(function (e) {
                console.log(vm.searchForm);
            });
            vm.String = CommonService.translate("Quản lý ủy quyền") +" > "+ CommonService.translate("Quản lý danh sách ủy quyền");
            vm.searchForm = {
                status : 1
            };
            vm.addForm = {};
            vm.statusArray = [
                {id: 0, name: "Hết hiệu lực"},
                {id: 1, name: "Hiệu lực"}
            ];
            vm.statusWoArray = [
                {id: 0, name: "Chưa thực hiện"},
                {id: 1, name: "Đang thực hiện"},
                {id: 2, name: "Hoàn thành"}
            ];
            vm.statusClosedArray = [
                {id: 0, name: "Chờ đóng việc"},
                {id: 1, name: "Đóng việc"},
                {id: 2, name: "Từ chối"}
            ];
            vm.extensionRequestArray = [
                {id: 0, name: "Không"},
                {id: 1, name: "Có"},
                {id: 2, name: "Từ chối gia hạn"},
                {id: 3, name: "Gia hạn thành công"},
            ];
            vm.typeCreateArray = [
                {id: 1, name: "Tạo mới"},
                {id: 2, name: "Tạo thay thế"}
            ];

            vm.paperAuthTypeArray = [
                {id: 1, name: "Thường xuyên"},
                {id: 2, name: "Theo vụ việc/Phát sinh"}
            ];
            vm.dataList=[];
            // vm.identificationTypeArray = [
            //     {id: 1, name: "Thường xuyên"},
            //     {id: 2, name: "Theo vụ việc/Phát sinh"}
            // ];
            vm.signTypeArray = [
                {id: 1, name: "Ký VO"},
                {id: 2, name: "Ký cứng"}
            ];
            getIdentificationType();
            fillTable();
        }

        function getIdentificationType() {
            var obj = {"parType": "AUTHENTICATION"}
            CommonService.getAppParam(obj).then(
                function (resp) {
                    if(resp.data) vm.identificationTypeArray= resp.data;
                },
                function (error) {
                    console.log(error);
                    toastr.error("Có lỗi xảy ra!");
                }
            )
        }

        // ----- Main Grid start
        vm.showHideColumnDetail = function (column) {
            var grid = vm.authorizationGrid;
            if (angular.isUndefined(column.hidden)) {
                grid.hideColumn(column);
            } else if (column.hidden) {
                grid.showColumn(column);
            } else {
                grid.hideColumn(column);
            }
            // CommonService.showHideColumnGrid(grid, column)
        };

        vm.gridColumnShowHideFilter = function (item) {
            return item.type == null || item.type !== 1;
        };
        vm.exportFile = function () {
            kendo.ui.progress(vm.documentBody, true);

            var obj = angular.copy(vm.searchForm);
            obj.page = null;
            obj.pageSize = null;

            reportResultAuthorizationService.doSearch(obj).then(function (d) {
                kendo.ui.progress(vm.documentBody, false);
                var data = d.data;
                CommonService.exportFile(vm.authorizationGrid, data, vm.listRemove, vm.listConvert,
                    "Danh sách ủy quyền");
            });
        };
        vm.listRemove = [{
            title: "Thao tác",
        }];
        vm.listConvert = [
            {
                field: "status",
                data: {
                    0 : "Hết hiệu lực",
                    1 : "Hiệu lực"
                }
            },
            {
                field: "statusWo",
                data: {
                    0 : "Chưa thực hiện",
                    1 : "Đang thực hiện",
                    2 : "Hoàn thành",
                }
            },
            {
                field: "statusClosed",
                data: {
                    0 : "Chờ đóng việc",
                    1 : "Đóng việc",
                    2 : "Từ chối",
                }
            }
        ];
        //
        var record = 0;
        // Grid colunm config
        function fillTable (){
            vm.authorizationGridOptions = kendoConfig.getGridOptions({
                autoBind: true,
                scrollable: true,
                resizable: true,
                editable: false,
                dataBinding: function () {
                    record = (this.dataSource.page() - 1) * this.dataSource.pageSize();
                },
                reorderable: true,
                dataSource: {
                    serverPaging: true,
                    schema: {
                        total: function (response) {
                            vm.count=response.total;
                            return response.total;
                        },
                        data: function (response) {
                            return response.data;
                        }
                    },
                    transport: {
                        read: {
                            url:  Constant.BASE_SERVICE_URL + "authorizationRsService/doSearchResultRp",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, type) {
                            var obj = angular.copy(vm.searchForm);
                            obj.page = options.page;
                            obj.pageSize = options.pageSize;
                            record = 0;
                            return JSON.stringify(obj);
                        }
                    },
                    pageSize: 10
                },
                columnMenu: false,
                noRecords: true,
                messages: {
                    noRecords: CommonService.translate("Không có kết quả hiển thị")
                },
                pageable: {
                    refresh: false,
                    pageSizes: [5, 10, 15, 20, 25],
                    messages: {
                        display: "{0}-{1} của {2} kết quả",
                        itemsPerPage: "kết quả/trang",
                        empty: "Không có kết quả hiển thị"
                    }
                },
                columns: [
                    {
                        title: CommonService.translate("TT"),
                        field: "stt",
                        template: function () {
                            return ++record;
                        },
                        width: "50px",
                        headerAttributes: {
                            style: "text-align:center;",
                            translate:""
                        },
                        hidden: false,
                        attributes: {
                            style: "text-align:center;"
                        },
                    },
                    {
                        field: "code",
                        title: CommonService.translate("Mã ủy quyền"),
                        template: '<a href="javascript:void(0);" title="#=code#" ng-click=vm.showDetail(dataItem)>#=code#</a>',
                        hidden: false,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center"},
                        width: "120px",

                    },
                    {
                        field: "uqSysGroupName",
                        title: CommonService.translate("Đơn vị được ủy quyền"),
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                        hidden: false,
                        width: "120px"

                    },
                    {
                        field: "typeCreate",
                        title: CommonService.translate("Kiểu tạo"),
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                        template: function(dataItem){
                            if (dataItem.typeCreate == 1) {
                                return "Tạo mới";
                            } else if (dataItem.typeCreate == 2) {
                                return "Tạo thay thế";
                            } else {
                                return "";
                            }
                        },
                        hidden: false,
                        width: "120px"

                    },
                    {
                        field: "paperAuthType",
                        title: CommonService.translate("Loại giấy ủy quyền"),
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                        template: function(dataItem){
                            if (dataItem.paperAuthType == 1) {
                                return "Thường xuyên";
                            } else if (dataItem.paperAuthType == 2) {
                                return "Theo vụ việc/Phát sinh";
                            } else {
                                return "";
                            }
                        },
                        hidden: false,
                        width: "120px"

                    },
                    {
                        field: "createDate",
                        title: CommonService.translate("Ngày tạo"),
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                        hidden: false,
                        width: "120px"

                    },
                    {
                        field: "performerName",
                        title: CommonService.translate("Người được ủy quyền"),
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                        hidden: false,
                        width: "120px"

                    },
                    {
                        field: "createByName",
                        title: CommonService.translate("Người tạo"),
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                        hidden: false,
                        width: "120px"

                    },
                    {
                        field: "statusWo",
                        title: CommonService.translate("Trạng thái công việc"),
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                        template: function(dataItem){
                            if (dataItem.statusWo == 0) {
                                return "Chưa thực hiện";
                            } else if (dataItem.statusWo == 1) {
                                return "Đang thực hiện";
                            } else if (dataItem.statusWo == 2) {
                                return "Hoàn thành";
                            }
                            else {
                                return "";
                            }
                        },
                        hidden: false,
                        width: "120px"

                    },
                    {
                        field: "statusClosed",
                        title: CommonService.translate("Trạng thái đóng việc"),
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                        template: function(dataItem){
                            if (dataItem.statusClosed == 0) {
                                return "Chờ đóng việc";
                            } else if (dataItem.statusClosed == 1) {
                                return "Đóng việc";
                            } else if (dataItem.statusClosed == 2) {
                                return "Từ chối";
                            }
                            else {
                                return "";
                            }
                        },
                        hidden: false,
                        width: "120px"

                    },  {
                        field: "status",
                        title: CommonService.translate("Trạng thái bản ghi"),
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                        template: function(dataItem){
                            if (dataItem.status == 0) {
                                return "Hết hiệu lực";
                            } else if (dataItem.status == 1) {
                                return "Hiệu lực";
                            } else {
                                return "";
                            }
                        },
                        hidden: false,
                        width: "120px"

                    },
                    {
                        field: "extensionRequest",
                        title: CommonService.translate("Yêu cầu gia hạn"),
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                        template: function(dataItem){
                            if (dataItem.extensionRequest == 0) {
                                return "Không";
                            } else if (dataItem.extensionRequest == 1) {
                                return "Có";
                            } else if (dataItem.extensionRequest == 2) {
                                return "Từ chối gia hạn";
                            }else if (dataItem.extensionRequest == 3) {
                                return "Gia hạn thành công";
                            }
                            else {
                                return "";
                            }
                        },
                        hidden: false,
                        width: "120px"

                    },
                    {
                        field: "statusDoWork",
                        title: CommonService.translate("Tình trạng"),
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                        hidden: false,
                        width: "120px"

                    },
                    {
                        title: CommonService.translate("Thao tác"),
                        headerAttributes: {
                            style: "text-align:center;",
                            translate:""
                        },
                        hidden: false,
                        template: function (dataItem) {
                            return (
                                '<div class="text-center #=authorizationId#"">' +
                                '<button ng-if="dataItem.statusWo !=2 " style=" border: none; background-color: white;"' +
                                'class="#=authorizationId# icon_table"  uib-tooltip="Thực hiện công việc" translate ng-click="vm.openDoWork(dataItem)" >' +
                                '<i  style="color:green;" class="fa fa-plus " aria-hidden="true"></i>' +
                                '</button>' +
                                '<button  ng-if="dataItem.statusWo !=2 " style=" border: none; background-color: white;"' +
                                'class="#=authorizationId# icon_table"  uib-tooltip="Gia hạn thời gian" translate ng-click="vm.openExtensionRequest(dataItem)" >' +
                                '<i  style="color:blueviolet;" class="fa fa-repeat " aria-hidden="true"></i>' +
                                '</button>' +
                                '</div>'
                            )
                        },
                        width: "120px"
                    }
                ],
            });
        }

        vm.doSearch = doSearch;
        function doSearch() {
            if ($('.k-invalid-msg').is(':visible')) {
                return;
            }
            console.log(vm.searchForm);
            var grid = vm.authorizationGrid;
            CommonService.doSearchGrid(grid,{pageSize: grid.dataSource.pageSize()});
            // grid.refresh();
        };

        vm.showDetail = function (dataItem) {
            $("#reportResultAuthorization_add_popupId").click(function (e) {
                console.log(vm.detailForm);
            });
            reportResultAuthorizationService.getDetail(dataItem).then(function (data) {
                vm.detailForm = angular.copy(data);
                vm.typeCreate = 'detail';
                var templateUrl = 'ktnb/reportResultAuthorization/detailPopup.html';
                var title = "Đóng việc";
                modalPopup = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "80%", null, null);
                vm.listUqPeople = [];
                $timeout(function () {
                    let obj = {};
                    obj.performerId = dataItem.performerId;
                    obj.performerName = dataItem.performerName;
                    obj.uqPositionId = dataItem.uqPositionId;
                    obj.uqPositionName = dataItem.uqPositionName;
                    obj.uqSysGroupId = dataItem.uqSysGroupId;
                    obj.uqSysGroupName = dataItem.uqSysGroupName;
                    reportResultAuthorizationService.getListAttachedFile({
                        objectId: vm.detailForm.authorizationId,
                        type: "UQ",
                    }).then(
                        function (res) {
                            if (res && res.data) {
                                vm.listFileAttach = res.data;
                                vm.listAttachDocumentGrid.dataSource.read();
                                console.log(vm.listFileAttach);
                            }
                        }
                    );
                    // vm.listUqPeople.push(obj);
                    // vm.uqPeopleListGrid.dataSource.data(vm.listUqPeople);
                    // vm.uqPeopleListGrid.refresh();
                },100);
            }, function () {
                toastr.error(CommonService.translate("Có lỗi xảy ra"));
            });
        }

        vm.openDoWork = function (dataItem) {
            $("#reportResultAuthorization_add_popupId").click(function (e) {
                console.log(vm.completeForm);
            });
            // getIdentificationType();
            Restangular.all("authorizationRsService/doWork").post(dataItem).then(function(response){
                if (response && response.error){
                    toastr.error(response.error);
                }else {
                    toastr.success("Bạn đã đang thực hiện công việc!");
                    reportResultAuthorizationService.getDetail(dataItem).then(function (data) {
                        vm.completeForm = angular.copy(data);
                        vm.typeCreate = 'completeWork';
                        var templateUrl = 'ktnb/reportResultAuthorization/doWorkPopup.html';
                        var title = "Đóng việc";
                        modalPopup = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "80%", null, null);
                        vm.listUqPeople = [];
                        $timeout(function () {
                            let obj = {};
                            obj.performerId = dataItem.performerId;
                            obj.performerName = dataItem.performerName;
                            obj.uqPositionId = dataItem.uqPositionId;
                            obj.uqPositionName = dataItem.uqPositionName;
                            obj.uqSysGroupId = dataItem.uqSysGroupId;
                            obj.uqSysGroupName = dataItem.uqSysGroupName;
                            vm.listFileAttach = [];
                        },100);
                    }, function () {
                        toastr.error(CommonService.translate("Có lỗi xảy ra"));
                    });
                }
            }).catch(function (err) {
                console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
            });
        };
        vm.openExtensionRequest = function (dataItem) {
            $("#authorizationReq_extension_popupId").click(function (e) {
                console.log(vm.extensionForm);
            });
            reportResultAuthorizationService.getDetail(dataItem).then(function (data) {
                vm.extensionForm = angular.copy(data);
                vm.typeCreate = 'extensionRequest';
                var templateUrl = 'ktnb/reportResultAuthorization/extensionRequestPopup.html';
                var title = "Gia hạn";
                modalPopup = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "80%", null, null);
            }, function () {
                toastr.error(CommonService.translate("Có lỗi xảy ra"));
            });

        };
        vm.saveItem = function () {
            if (vm.typeCreate === 'completeWork'){
                let obj = vm.completeForm;
                obj.listFileAttach = vm.listAttachDocumentGrid.dataSource.data();
                if (obj.listFileAttach == null || obj.listFileAttach.length == 0){
                    toastr.error("Bắt buộc nhập file đính kèm");
                    return;
                }
                if (obj.contentReports == null || obj.contentReports == ""){
                    toastr.error("Bắt buộc nhập Nội dung báo cáo");
                    return;
                }
                Restangular.all("authorizationRsService/completeWork").post(obj).then(function(response){
                    if (response && response.error){
                        toastr.error(response.error);
                    }else {
                        toastr.success("Ghi lại thành công");
                        vm.doSearch();
                        modalPopup.close();
                    }
                }).catch(function (err) {
                    console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
                });
            } else if (vm.typeCreate === 'extensionRequest'){
                let obj = vm.extensionForm;
                if (obj.extensionDescription == null || obj.extensionDescription == ""){
                    toastr.error("Bắt buộc nhập Lý do gia hạn");
                    return;
                }
                let extenDate = kendo.parseDate(obj.extensionTime, "dd/MM/yyyy");
                if (obj.extensionTime == null || !extenDate){
                    toastr.error("Ngày gia hạn đang trống hoặc không đúng định dạng");
                    return;
                }

                Restangular.all("authorizationRsService/requestExtension").post(obj).then(function(response){
                    if (response && response.error){
                        toastr.error(response.error);
                    }else {
                        toastr.success("Ghi lại thành công");
                        vm.doSearch();
                        modalPopup.close();
                    }
                }).catch(function (err) {
                    console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
                });
            }
        };

        /*
		 * đóng Popup
		 */
        vm.cancel = function () {
            $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
            // vm.doSearch();
            // modalAddGood.cancel()
        }
        vm.remove = function (dataItem){
            kendo.ui.progress($(vm.modalBody), true);
            var obj = {};
            obj.authorizationId = dataItem.authorizationId;
            confirm(CommonService.translate('Xác nhận xóa'), function () {
                Restangular.all("authorizationRsService/remove").post(obj).then(function(response){
                    kendo.ui.progress($(vm.modalBody), false);
                    toastr.success(CommonService.translate("Xóa thành công!!"));
                    vm.doSearch();
                }).catch(function (err) {
                    kendo.ui.progress($(vm.modalBody), false);
                    console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
                });
            })
        };

        vm.openRejectCloseWork = function (dataItem){
            vm.extensionForm = angular.copy(data);
            vm.typeCreate = 'extensionRequest';
            var templateUrl = 'ktnb/reportResultAuthorization/extensionRequestPopup.html';
            var title = "Gia hạn";
            modalPopup = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "80%", null, null);
        };

        vm.rejectCloseWork = function (dataItem){
            kendo.ui.progress($(vm.modalBody), true);
            var obj = vm.closeForm;
            confirm(CommonService.translate('Xác nhận xóa'), function () {
                Restangular.all("authorizationRsService/rejectCloseWork").post(obj).then(function(response){
                    kendo.ui.progress($(vm.modalBody), false);
                    toastr.success(CommonService.translate("Xóa thành công!!"));
                    vm.doSearch();
                }).catch(function (err) {
                    kendo.ui.progress($(vm.modalBody), false);
                    console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
                });
            })
        };

        // * popup common
        vm.recordPopup = 0;

        // popup don vi thuc hien
        var sysGroupColumns = [
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
                title: CommonService.translate("Mã đơn vị"),
                field: 'code',
                width: "20%",
                headerAttributes: {
                    style: "text-align:center;", translate: "",
                },
                attributes: {
                    style: "text-align:left;"
                },
            }, {
                title: CommonService.translate("Tên đơn vị"),
                field: 'name',
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
                    '		<a  type="button" class=" icon_table" uib-tooltip="Chọn" translate>' +
                    '			<i ng-click="caller.saveSelectSysGroup(dataItem)" class="fa fa-check color-green" aria-hidden="true"></i> ' +
                    '		</a>'
                    + '</div>'
                ,
                headerAttributes: {
                    style: "text-align:center;", translate: "",
                },
                attributes: {
                    style: "text-align:center;"
                },
            }
        ];

        var modalSysGroup = null;
        vm.openPopupSysGroup = function (data) {
            if (data == 'search') {
                vm.flagSysGroup = 1;
            } else if (data == 'insert') {
                vm.flagSysGroup = 2;
            }
            var templateUrl = "ktnb/popup/popupCommonSearch.html";
            var title = CommonService.translate("Tìm kiếm đơn vị");
            var windowId = "POPUP_SELECT_SYS_GROUP";
            vm.placeHolder = CommonService.translate("Mã/tên đơn vị");
            CommonService.populatePopupCreate(templateUrl, title, null, vm, windowId, null, '60%', '50%', null);
            setTimeout(function () {
                modalSysGroup = CommonService.getModalInstance1();
            }, 100);
            vm.commonPopupSearch = {
                groupLevelLst: ['2', '3']
            };
            var api = "commonRsService/getSysGroupForAutoComplete";
            CommonService.fillDataPopupCommonSearch(api, vm.commonPopupSearch, sysGroupColumns, vm);
        }

        vm.saveSelectSysGroup = function (dataItem) {
             vm.searchForm.uqSysGroupId = dataItem.sysGroupId;
             vm.searchForm.uqSysGroupCode = dataItem.code;
             vm.searchForm.uqSysGroupName = dataItem.name;
            modalSysGroup.dismiss();
        }
        // dosearch in popup
        vm.doSearchCommonPopup = function () {
            var grid = $("#commonSearchPopupGrid").data("kendoGrid");
            if (grid) {
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        };

        vm.isSelectEmailBySearch = false;
        vm.emailUqOptions = {
            dataTextField: "fullName", placeholder: "Họ tên, mã nhân viên, email, số điện thoại",
            dataValueField: "fullName",
            open: function (e) {
                vm.isSelectEmailBySearch = false;
                if (vm.addForm.paperAuthType ==1 && vm.listUqPeople.length > 1){
                    toastr.error("Loại giấy ủy quyền Thường xuyên chỉ cho phép chọn 1 người ủy quyền!");
                    return;
                }
            },
            select: function (e) {
                vm.isSelectEmailBySearch = true;
                var dataItem = this.dataItem(e.item.index());
                vm.uqUserForm.keySearch = null;
                if (vm.listUqPeople.length > 0) {
                    for (var i = 0; i < vm.listUqPeople.length; i++) {
                        if (dataItem.sysUserId == vm.listUqPeople[i].performerId ) {
                            toastr.error("Đã tồn tại người ký trong danh sách!");
                            return;
                        }
                    }
                }
                let obj = {};
                obj.performerId = dataItem.sysUserId;
                obj.performerName = dataItem.codeName;
                obj.uqPositionId = dataItem.positionId;
                obj.uqPositionName = dataItem.positionName;
                obj.uqSysGroupId = dataItem.sysGroupIdLv2;
                obj.uqSysGroupName = dataItem.sysGroupNameLv2;
                vm.listUqPeople.push(obj);
                vm.uqPeopleListGrid.dataSource.data(vm.listUqPeople);
                vm.uqPeopleListGrid.refresh();
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectEmailBySearch) {
                        vm.uqUserForm.performerId = null;
                        vm.uqUserForm.performerName = null;
                        vm.uqUserForm.keySearch = null;
                    }
                }, 100);
            },
            close: function (e) {
                $timeout(function () {
                    if (vm.uqUserForm.performerId == null) {
                        vm.uqUserForm.performerId = null;
                        vm.uqUserForm.performerName = null;
                        vm.uqUserForm.keySearch = null;
                    }
                }, 1000);

            },
            pageSize: 10,
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        vm.isSelectEmailBySearch = false;
                        return Restangular.all("commonRsService/getSysUserSgLv2ForAutoComplete").post(
                            {
                                keySearch: vm.uqUserForm.keySearch,
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
                '<div class="row">'+
                '<p class="col-md-6 text-header-auto border-right-ccc" translate>Mã nhân viên </p>' +
                '<p class="col-md-6 text-header-auto" translate>Tên nhân viên </p>' +
                '</div>'+
                '</div>',
            template: '<div class="row" ><div class="col-md-6 col-xs-5" style="float:left">#: data.employeeCode #</div><div  style="padding-left: 5px;width:auto;overflow: hidden"> #: data.fullName #</div> </div>',
        };

        // autocomplete chuc danh
        vm.isSelectPosition = false;
        vm.positionOptions = {
            clearButton: false,
            dataTextField: "name", placeholder: CommonService.translate("Nhập mã/tên chức danh"),
            dataValueField: "name",
            open: function (e) {
                vm.isSelectPosition = false;
            },
            select: function (e) {
                vm.isSelectPosition = true;
                var dataItem = this.dataItem(e.item.index());
                vm.addForm.position = dataItem.positionId;
                vm.addForm.positionCode = dataItem.code;
                vm.addForm.positionName = dataItem.name;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectPosition) {
                        vm.addForm.position = null;
                        vm.addForm.positionCode = null;
                        vm.addForm.positionName = null;
                    }
                }, 100);
            },
            close: function (e) {
                $timeout(function () {
                    if (vm.addForm.position == null) {
                        vm.addForm.positionCode = null;
                        vm.addForm.positionName = null;
                    }
                }, 1000);

            },
            pageSize: 10,
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        vm.isSelectPosition = false;
                        return Restangular.all("commonRsService/getPositionForAutoComplete").post(
                            {
                                keySearch: vm.addForm.positionName,
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
                '<p class="col-md-6 text-header-auto border-right-ccc" translate>Mã chức danh </p>' +
                '<p class="col-md-6 text-header-auto" translate>Tên chức danh </p>' +
                '</div>' +
                '</div>',
            template: '<div class="row" ><div class="col-md-6 col-xs-5" style="float:left">#: data.code #</div><div  style="padding-left: 5px;width:auto;overflow: hidden"> #: data.name #</div> </div>',
        };
        
        vm.isSelectSysUserAdd = false;
        vm.sysUserAddOptions = {
            clearButton: false,
            dataTextField: "fullName", placeholder: CommonService.translate("Nhập tên nhân viên"),
            dataValueField: "fullName",
            open: function (e) {
                vm.isSelectSysUserAdd = false;
            },
            select: function (e) {
                vm.isSelectSysUserAdd = true;
                var dataItem = this.dataItem(e.item.index());
                vm.addForm.sysUserId = dataItem.sysUserId;
                vm.addForm.sysUserCode = dataItem.employeeCode;
                vm.addForm.sysUserName = dataItem.fullName;
                vm.addForm.positionId = dataItem.positionId;
                vm.addForm.positionName = dataItem.positionName;
                vm.addForm.sysGroupId = dataItem.sysGroupIdLv2;
                vm.addForm.sysGroupName = dataItem.sysGroupNameLv2;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSysUserAdd) {
                        vm.addForm.sysUserId = null;
                        vm.addForm.sysUserCode = null;
                        vm.addForm.sysUserName = null;
                        vm.addForm.positionId = null;
                        vm.addForm.positionName = null;
                        vm.addForm.sysGroupId = null;
                        vm.addForm.sysGroupName = null;
                    }
                }, 100);
            },
            close: function (e) {
                $timeout(function () {
                    if (vm.addForm.sysUserId == null) {
                        vm.addForm.sysUserCode = null;
                        vm.addForm.sysUserName = null;
                        vm.addForm.positionId = null;
                        vm.addForm.positionName = null;
                        vm.addForm.sysGroupId = null;
                        vm.addForm.sysGroupName = null;
                    }
                }, 1000);

            },
            pageSize: 10,
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        vm.isSelectSysUserAdd = false;
                        return Restangular.all("commonRsService/getSysUserSgLv2ForAutoComplete").post(
                            {
                                keySearch: vm.addForm.sysUserName,
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

        // đính kèm file
        vm.gridFileOptions = kendoConfig.getGridOptions({
                autoBind: true,
                scrollable: false,
                resizable: true,
                editable: false,
                dataSource: {
                    serverPaging: true,
                    schema: {
                        total: function () {
                            return 0;
                        },
                        data: function () {
                            return vm.listFileAttach;
                        }
                    },
                    // transport: {
                    //     read: {},
                    //     parameterMap: function (options, type) {
                    //         vm.detailForm.page = options.page
                    //         vm.detailForm.pageSize = options.pageSize
                    //         return JSON.stringify(vm.detailForm)
                    //     }
                    // },
                    pageSize: 10,
                },
                save: function () {
                    vm.listAttachDocumentGrid.refresh();
                },
                messages: {
                    noRecords: gettextCatalog.getString(CommonService.translate("Không có kết quả hiển thị"))
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
                        title: CommonService.translate("STT"),
                        field: "stt",
                        template: dataItem => $("#listAttachDocumentGrid").data("kendoGrid").dataSource.indexOf(dataItem) + 1,
                        width: '10%',
                        columnMenu: false,
                        headerAttributes: {style: "text-align:center;font-weight: bold;", translate: ""},
                        attributes: {
                            style: "text-align:center;"
                        },
                        type: 'text',
                        editable: false
                    },
                    {
                        title: CommonService.translate("Tên file"),
                        width: '30%',
                        field: "name",
                        headerAttributes: {style: "text-align:center;font-weight: bold;", translate: ""},
                        attributes: {
                            style: "text-align:left;"
                        },
                        type: 'text',
                        editable: false,
                        template: function (dataItem) {
                            return "<a href='' ng-click='caller.downloadFile(dataItem)'>" + dataItem.name + "</a>";
                        }
                    },
                    {
                        title: CommonService.translate("Ngày upload"),
                        field: 'createdDate',
                        width: '20%',
                        headerAttributes: {style: "text-align:center;font-weight: bold;", translate: ""},
                        attributes: {
                            style: "text-align:left;"
                        },
                        type: 'text',
                        editable: false
                    },
                    {
                        title: CommonService.translate("Người upload"),
                        field: 'createdUserName',
                        width: '20%',
                        headerAttributes: {style: "text-align:center;font-weight: bold;", translate: ""},
                        attributes: {
                            style: "text-align:left;"
                        },
                        type: 'text',
                        editable: false
                    },
                    {
                        title: CommonService.translate("Xóa"),
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold",
                            translate: ""
                        },
                        template: dataItem =>
                            '<div class="text-center #=utilAttachDocumentId#"> ' +
                            '<button style=" border: none; " ng-if="caller.typeCreate == \'completeWork\' " class="#=utilAttachDocumentId# icon_table" uib-tooltip="Xóa" ng-click="caller.removeRowFile(dataItem)"  translate>' +
                            '<i style="color: steelblue;" class="fa fa-trash" ria-hidden="true"></i>' +
                            '</button>' +
                            '</div>',
                        width: '10%',
                        field: "acctions"
                    }
                ]
            });

        // Xóa file đính kèm
        vm.removeRowFile = removeRowFile;
        function removeRowFile(dataItem) {
            confirm(CommonService.translate("Xác nhận xóa"), function () {
                $('#listAttachDocumentGrid').data('kendoGrid').dataSource.remove(dataItem);
                vm.listFileAttach = $('#listAttachDocumentGrid').data('kendoGrid').dataSource.data();
            })
        }

        vm.listFileAttach = [];
        vm.onSelect = function (e) {
            if ($("#files")[0].files[0].size > 52428800) {
                toastr.warning(CommonService.translate("Dung lượng file lớn hơn 50MB"));
                setTimeout(function () {
                    $(".k-upload-files.k-reset").find("li").remove();
                    $(".k-upload-files").remove();
                    $(".k-upload-status").remove();
                    $(".k-upload.k-header").addClass("k-upload-empty");
                    $(".k-upload-button").removeClass("k-state-focused");
                }, 10);
                return;
            }

            if ($("#files")[0].files[0].name.split('.').pop() != 'pdf' && $("#files")[0].files[0].name.split('.').pop() != 'doc' && $("#files")[0].files[0].name.split('.').pop() != 'docx') {
                toastr.warning(CommonService.translate("Sai định dạng file"));
                setTimeout(function () {
                    $(".k-upload-files.k-reset").find("li").remove();
                    $(".k-upload-files").remove();
                    $(".k-upload-status").remove();
                    $(".k-upload.k-header").addClass("k-upload-empty");
                    $(".k-upload-button").removeClass("k-state-focused");
                }, 10);
                return;
            }

            if (vm.listFileAttach != null) {
                for (var h = 0; h < vm.listFileAttach.length; h++) {
                    if (vm.listFileAttach[h].name == $("#files")[0].files[0].name) {
                        toastr.warning(CommonService.translate("Không được upload file trùng nhau"));
                        setTimeout(function () {
                            $(".k-upload-files.k-reset").find("li").remove();
                            $(".k-upload-files").remove();
                            $(".k-upload-status").remove();
                            $(".k-upload.k-header").addClass("k-upload-empty");
                            $(".k-upload-button").removeClass("k-state-focused");
                        }, 10);
                        return;
                    }
                }
            }

            var formData = new FormData();
            jQuery.each(jQuery('#files')[0].files, function (i, file) {
                formData.append('multipartFile' + i, file);
            });

            return $.ajax({
                url: Constant.BASE_SERVICE_URL + "fileservice/uploadATTT?folder=" + Constant.UPLOAD_FOLDER_TYPE_INPUT,
                type: "POST",
                data: formData,
                enctype: 'multipart/form-data',
                processData: false,
                contentType: false,
                cache: false,
                success: function (data) {
                    $(".k-upload-files.k-reset").find("li").remove();
                    $(".k-upload-files").remove();
                    $(".k-upload-status").remove();
                    $(".k-upload.k-header").addClass("k-upload-empty");
                    $(".k-upload-button").removeClass("k-state-focused");
                    $.map(e.files, function (file, index) {
                        vm.listFileAttach = $("#listAttachDocumentGrid").data().kendoGrid.dataSource.data();
                        var obj = {};
                        obj.name = file.name;
                        obj.filePath = data[index];
                        obj.createdDate = kendo.toString(new Date((new Date()).getTime()), "dd/MM/yyyy");
                        obj.createdUserId = Constant.user.VpsUserInfo.sysUserId;
                        obj.createdUserName = Constant.user.VpsUserInfo.fullName;
                        vm.listFileAttach.push(obj);
                    })

                    refreshGrid(vm.listFileAttach);
                    setTimeout(function () {
                        $(".k-upload-files.k-reset").find("li").remove();
                        $(".k-upload-files").remove();
                        $(".k-upload-status").remove();
                        $(".k-upload.k-header").addClass("k-upload-empty");
                        $(".k-upload-button").removeClass("k-state-focused");
                    }, 10);
                }
            });
        }

        function refreshGrid(d) {
            var grid = vm.listAttachDocumentGrid;
            if (grid) {
                grid.dataSource.data(d);
                grid.refresh();
            }
        }

        vm.downloadFile = downloadFile;

        function downloadFile(data) {
            window.location = Constant.BASE_SERVICE_URL + "fileservice/downloadFileATTT?" + data.filePath;
        }

        vm.exportReport = function () {
            var obj = {};
            if (vm.searchForm.type == null) {
                toastr.error("Yêu cầu nhập loại WO!");
                return;
            }
            if (vm.searchForm.type == "1") {
                obj.reportName = "BaoCaoUqThuongXuyen";
            }
            obj.sysGroupId = vm.searchForm.sysGroupId;
            obj.reportType = "EXCEL";
            var date = kendo.toString(new Date((new Date()).getTime()), "dd-MM-yyyy");
            CommonService.exportReport(obj).then(
                function (data) {
                    var binarydata = new Blob([data], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
                    kendo.saveAs({dataURI: binarydata, fileName: date + "_" + obj.reportName + '.xlsx'});
                }, function (errResponse) {
                    toastr.error(CommonService.translate("Lỗi không export EXCEL được!"));
                });
        };

        vm.selectedSysGroup = false;
        vm.sysGroupOptions = {
            clearButton: false,
            dataTextField: "name",
            select: function (e) {
                vm.selectedSysGroup = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchForm.uqSysGroupName = dataItem.name;
                vm.searchForm.uqSysGroupId = dataItem.sysGroupId;
            },
            pageSize: 10,
            open: (e) => {
                vm.selectedSysGroup = false;
            },
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: (options) => {
                        vm.selectedSysGroup = false;
                        return Restangular.all("dataDamageRsServiceRest/getSysGroup").post({
                            pageSize: 15,
                            page: 1,
                            keySearch: vm.searchForm.uqSysGroupName,
                            groupLevelLst: [2]
                        }).then((response) => {
                            options.success(response.data);
                        }).catch((err) => {
                            console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
                        });
                    }
                }
            },
            headerTemplate: '<div class="dropdown-header row text-center k-widget k-header">' +
                '<p class="col-md-6 text-header-auto">Mã đơn vị</p>' +
                '<p class="col-md-6 text-header-auto">Tên đơn vị</p>' +
                '</div>',
            template: '<div class="row" ><div class="col-xs-5" style="padding: 0px 32px 0 0;float:left">#: data.code #</div><div style="padding-left:10px;width:auto;overflow: hidden"> #: data.name #</div> </div>',
            change: (e) => {

                if (!vm.selectedSysGroup) {
                    vm.searchForm.uqSysGroupId = null;
                    vm.searchForm.uqSysGroupName = null;
                }
            },
            ignoreCase: false
        }

        vm.selectSysGroup = function () {
            var teamplateUrl = "ktnb/dataDamage/sysGroupPopupSearch.html";
            var title = CommonService.translate("Lựa chọn đơn vị");
            var windowId = "SELECT_SYS_GROUP";
            vm.objSearchGSearch = {};
            vm.objSearchGSearch.groupLevelLst = [2];
            fillDataSysGSearchTable(vm.objSearchGSearch);
            CommonService.populatePopupCreate(teamplateUrl, title, null, vm, windowId, null, '60%', '60%', 'changepopupSys');
        };

        var recordSys = 0;

        function fillDataSysGSearchTable(dataSys) {
            vm.gridSysGSearchOptions = kendoConfig.getGridOptions({
                autoBind: true,
                scrollable: false,
                resizable: true,
                editable: false,
                sortable: false,
                serverPaging: true,
                dataBinding: function () {
                    recordSys = (this.dataSource.page() - 1) * this.dataSource.pageSize();
                },
                reorderable: true,
                dataSource: {
                    serverPaging: true,
                    schema: {
                        total: (response) => response.total,
                        data: (response) => response.data
                    },
                    transport: {
                        read: {
                            // Thuc hien viec goi service
                            url: Constant.BASE_SERVICE_URL + "dataDamageRsServiceRest/getSysGroup",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: (options, type) => {
                            dataSys.page = options.page;
                            dataSys.pageSize = options.pageSize;
                            return JSON.stringify(dataSys);
                        }
                    },
                    pageSize: 10
                },

                noRecords: true,
                columnMenu: false,
                messages: {
                    noRecords: gettextCatalog.getString("<div style='margin:5px'>Không có kết quả hiển thị</div>")
                },
                pageable: {
                    refresh: false,
                    pageSizes: [10, 15, 20, 25],
                    messages: {
                        display: "{0}-{1} của {2} kết quả",
                        itemsPerPage: "kết quả/trang",
                        empty: "<div style='margin:5px'>Không có kết quả hiển thị</div>"
                    }
                },
                columns: [{
                    title: CommonService.translate("STT"),
                    field: "stt",
                    template: (dataItem) => $("#sysGGridSearch").data("kendoGrid").dataSource.indexOf(dataItem) + 1 + ($("#sysGGridSearch").data("kendoGrid").dataSource.page() - 1) * $("#sysGGridSearch").data("kendoGrid").dataSource.pageSize(),
                    width: '5%',
                    headerAttributes: {
                        style: "text-align:center; font-weight: bold",
                        translate: ""
                    },
                    attributes: {
                        style: "text-align:center; font-weight: bold"
                    },
                },
                    {
                        title: "Tên đơn vị",
                        width: '29%',
                        field: 'name',
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold"
                        },
                        attributes: {
                            style: "text-align:left;"
                        },
                    },
                    {
                        title: "Đơn vị cấp 2",
                        width: '28%',
                        field: 'groupNameLevel2',
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold"
                        },
                        attributes: {
                            style: "text-align:left;"
                        },
                    },
                    {
                        title: "Đơn vị cấp 3",
                        width: '28%',
                        field: 'groupNameLevel3',
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold"
                        },
                        attributes: {
                            style: "text-align:left;"
                        },
                    },
                    {
                        title: "Chọn",
                        width: '10%',
                        template:
                            '<div class="text-center "> ' +
                            '		<a  type="button" class=" icon_table" uib-tooltip="Chọn" translate>' +
                            '			<i id="#=code#" ng-click="caller.selectSysGroupItemSearch(dataItem)" class="fa fa-check color-green #=code#" aria-hidden="true"></i> ' +
                            '		</a>'
                            + '</div>',
                        headerAttributes: {
                            style: "text-align:center;"
                        }
                    }]
            });
        }

        vm.selectSysGroupItemSearch = function (dataItem) {
            vm.searchForm.uqSysGroupName = dataItem.name;
            vm.searchForm.uqSysGroupId = dataItem.sysGroupId;
            CommonService.dismissPopup1();
        }

        vm.doSearchSysGroupSearchPopup = function () {
            var grid = vm.sysGGridSearch;
            if (grid) {
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        }

        //------------------------ clear input
        vm.clear = function (fieldName) {
            switch (fieldName) {
                case 'sysGroup_search':
                    vm.searchForm.uqSysGroupId = null;
                    vm.searchForm.uqSysGroupName = null;
                    break;

            }
        }
    }
})();
