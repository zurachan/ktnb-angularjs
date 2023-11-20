(function () {
    'use strict';
    var controllerId = 'dataDamageController';

    angular.module('MetronicApp').controller(controllerId, dataDamageController);
    function dataDamageController($scope, $http,$timeout,$rootScope, $log, $filter,Constant,Restangular,CommonService,kendoConfig,$kWindow,dataDamageService,RestEndpoint,gettextCatalog) {
        var vm = this;
        var modalAdd,modalEdit,modalInstanceImport;
        vm.addForm = {};
        vm.listdataDamageExportTemp = [];
        vm.modalBody = ".k-widget.k-window";
        vm.documentBody = $("#ktnb_searchForm_dataDamageId");
        const _ACTIVE = 'Hoạt động';
        const _UNACTIVE = 'Không hoạt động';
        vm.searchForm = {
            createdBy: Constant.user.vpsUserToken.sysUserId,
            createdByName: Constant.user.vpsUserToken.fullName
        };
        vm.searchForm.status = 1;
        vm.approvePermission = false;
        vm.approvedKtnbQtrrPermission = false;
        vm.confirmKtnbQtrrPermission = false;

        vm.businessAreaOptions = [];
        Restangular.all("commonRsService/getByParType").post({parType: 'BUSINESS_AREA_QTRR'}).then(function(res){
            for (var i = 0; i < res.length; i++) {
                var obj = {
                    code: res[i].code,
                    name: res[i].name
                }
                vm.businessAreaOptions.push(obj);
            }
        });
        vm.reasonTypeOptions = [];
        Restangular.all("commonRsService/getByParType").post({parType: 'REASON_TYPE', optionNumber: vm.addForm.riskType}).then(function(res){
            for (var i = 0; i < res.length; i++) {
                var obj = {
                    code: res[i].code,
                    name: res[i].name
                }
                vm.reasonTypeOptions.push(obj);
            }
        });

        vm.riskTypeOptions = [
            {code : '1', name: CommonService.translate("Rủi ro hoạt động")},
            {code : '2', name: CommonService.translate("Rủi ro tuân thủ")},
            {code : '3', name: CommonService.translate("Rủi ro tài chính")},
            {code : '4', name: CommonService.translate("Rủi ro chiến lược")}
        ];

        vm.consequenceOptions = [
            {code : '1', name: CommonService.translate("Tổn thất tài chính")},
            {code : '2', name: CommonService.translate("Tổn thất phi tài chính")},
            {code : '3', name: CommonService.translate("Tổn thất tài chính và phi tài chính")}
        ];
        vm.damageTypeOptions = [
            {code : '1', name: CommonService.translate("Tổn thất thực tế")},
            {code : '2', name: CommonService.translate("Tổn thất tiềm tàng")},
            {code : '3', name: CommonService.translate("Cận tổn thất")}
        ];

        Restangular.all("dataDamageRsServiceRest/checkPermission").post({sysUserId: Constant.user.vpsUserToken.sysUserId, adResourceCode:"DATA", operationCode:"APPROVED"}).then(function(d){
            if(d.length > 0) {
                vm.approvePermission = true;
            } else {
                vm.approvePermission = false;
            }
        }, function(){
            console.log('Có lỗi xảy ra khi check quyền tạo yêu cầu từ nhà cung cấp đến CNKT');
        });
        Restangular.all("commonRsService/checkPermission").post({sysUserId: Constant.user.vpsUserToken.sysUserId, adResourceCode:"KTNB_QTRR", operationCode:"APPROVED"}).then(function(d){
            vm.approvedKtnbQtrrPermission = d;
        }, function(){
            console.log('Có lỗi xảy ra khi check quyền');
        });
        Restangular.all("commonRsService/checkPermission").post({sysUserId: Constant.user.vpsUserToken.sysUserId, adResourceCode:"KTNB_QTRR", operationCode:"CONFIRM"}).then(function(d){
            vm.confirmKtnbQtrrPermission = d;
        }, function(){
            console.log('Có lỗi xảy ra khi check quyền');
        });

        vm.rootSysGroupCreate = {};
        getRootSysGroup();
        async function getRootSysGroup() {
            await Restangular.all("dataDamageRsServiceRest/getSysGroup").post({sysGroupId: Constant.user.VpsUserInfo.sysGroupId}).then(function (res) {
                if (res.data) {
                    var obj = res.data[0];
                    vm.rootSysGroupCreate.areaCode = obj.areaCode;
                    if (Number(obj.groupLevel) <= 2) {
                        vm.rootSysGroupCreate.sysGroupId = obj.sysGroupId;
                        vm.rootSysGroupCreate.sysGroupName = obj.name;
                    } else {
                        if (obj.parentId == 166572) {
                            vm.rootSysGroupCreate.sysGroupId = Number(obj.path.split("/")[3]);
                            vm.rootSysGroupCreate.sysGroupName = obj.groupNameLevel3;
                        } else {
                            vm.rootSysGroupCreate.sysGroupId = Number(obj.path.split("/")[2]);
                            vm.rootSysGroupCreate.sysGroupName = obj.groupNameLevel2;
                        }
                    }
                }
            });
            initFormData();
        }
        //
        function initFormData() {
            $("#ktnb_searchForm_dataDamageId").click(function (e) {
            });
            // fillDataTable([]);
            vm.String = CommonService.translate("Quản lý dữ liệu tổn thất")
            vm.addForm = {};
            vm.activeArray = [
                {id: "Y", nameActive: _ACTIVE},
                {id: "N", nameActive: _UNACTIVE}
            ];
            vm.dataList=[];

        }

        // ----- Main Grid start
        vm.showHideColumnDetail = function (column) {
            var grid = vm.dataDamageGrid;
            if (angular.isUndefined(column.hidden)) {
                grid.hideColumn(column);
            } else if (column.hidden) {
                grid.showColumn(column);
            } else {
                grid.hideColumn(column);
            }
        };

        vm.gridColumnShowHideFilter = function (item) {
            return item.type == null || item.type !== 1;
        };
        vm.exportFile = function () {
            kendo.ui.progress(vm.documentBody, true);
            var obj = angular.copy(vm.searchForm);
            obj.page = null;
            obj.pageSize = null;
            Restangular.all("dataDamageRsServiceRest/doSearch").post(obj).then(function(d){
                kendo.ui.progress(vm.documentBody, false);
                var data = d.data;
                data.forEach(function (i) {
                    i.totalValue = i.valueDamage - i.valuePass;
                })

                CommonService.exportFile(vm.dataDamageGrid, data, vm.listRemove, vm.listConvert,"Danh sách sự kiện tổn thất dữ liệu");
            }).catch(function (err) {
                kendo.ui.progress($(vm.modalBody), false);
                console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
            });
        };
        vm.listRemove = [{
            title: "Thao tác",
        }];
        vm.listConvert = [
            {
                field: "status",
                data: {
                    1: 'Hiệu lực',
                    0: 'Hết hiệu lực',
                    2: 'Đóng'
                }
            }
        ];
        //
        var record = 0;
        // Grid colunm config
        // function fillDataTable(data) {
            vm.dataDamageGridOptions = kendoConfig.getGridOptions({
                autoBind: true,
                scrollable: true,
                resizable: true,
                editable: false,
                dataBinding: function () {
                    record = (this.dataSource.page() - 1) * this.dataSource.pageSize();
                },
                reorderable: true,
                toolbar: [
                    {
                        name: "actions",
                        template: '<div class=" pull-left ">' +
                            '<button  type="button" class="btn btn-qlk padding-search-right addQLK ng-scope" style="width: 120px" ng-click="vm.create()">Tạo mới</button>' +
                            // '<button  type="button" class="btn btn-qlk padding-search-right ng-scope" ng-if="vm.approvePermission" style="width: 120px" ng-click="vm.updateApprovedMulti()">Đóng việc</button>' +
                            '</div>'
                    }
                ],
                dataSource: {
                    serverPaging: true,
                    schema: {
                        total: function (response) {
                            vm.count = response.total;
                            return response.total;
                        },
                        data: function (response) {
                            return response.data;
                        }
                    },
                    transport: {
                        read: {
                            url: Constant.BASE_SERVICE_URL + "dataDamageRsServiceRest/doSearch",
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
                        title: CommonService.translate(""),
                        template: "<input type='checkbox' ng-if='dataItem.status == 1' ng-click='vm.addListChoise(dataItem)' ng-model='dataItem.selected'/>",
                        width: "50px",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold;",
                            translate: ""
                        },
                        hidden: false,
                        attributes: {
                            style: "text-align:center;"
                        },
                    },
                    {
                        title: CommonService.translate("TT"),
                        field: "stt",
                        template: function () {
                            return ++record;
                        },
                        width: "50px",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold;",
                            translate: ""
                        },
                        hidden: false,
                        attributes: {
                            style: "text-align:center;"
                        },
                    },
                    {   title: CommonService.translate("Mã sự kiện"),
                        field: "code",
                        template: function (dataItem) {
                            return '<a href="javascript:void(0);" ng-click="vm.showDataDetail(dataItem)"  title="' + dataItem.code + '">' + dataItem.code + '</a>';
                        },
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                        hidden: false,
                        width: "100px"

                    },
                    {
                        title: CommonService.translate("Tên sự kiện"),
                        field: "name",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                        hidden: false,
                        width: "120px"

                    },
                    {
                        title: CommonService.translate("Đơn vị phát sinh"),
                        field: "sysGroupNamePs",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                        hidden: false,
                        width: "150px"

                    },
                    {    title: CommonService.translate("Thời gian phát hiện"),
                        field: "timeDetect",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                        hidden: false,
                        width: "100px"

                    },
                    {    title: CommonService.translate("Thời gian khắc phục"),
                        field: "remediesDate",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                        hidden: false,
                        width: "100px"

                    },
                    {    title: CommonService.translate("Người tạo"),
                        field: "createByName",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                        hidden: false,
                        width: "100px"

                    },
                    {    title: CommonService.translate("Ngày tạo"),
                        field: "createDate",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                        hidden: false,
                        width: "100px"

                    },
                    // {   title: CommonService.translate("Trạng thái chỉ huy duyệt GĐ1"),
                    //     field: "statusDv",
                    //     template : function(dataItem){
                    //         if (dataItem.statusDv == 2) {
                    //             return CommonService.translate("Dự thảo");
                    //         } else if (dataItem.statusDv == 1) {
                    //             return CommonService.translate("Hiệu lực");
                    //         } else if (dataItem.statusDv == 0) {
                    //             return CommonService.translate("Hết hiệu lực");
                    //         } else {
                    //             return "";
                    //         }
                    //     },
                    //     headerAttributes: {
                    //         "class": "table-header-cell",
                    //         style: "text-align: center; font-weight: bold;white-space:normal;"
                    //     },
                    //     attributes: {
                    //         "class": "table-cell",
                    //         style: "text-align: right; "
                    //     },
                    //     hidden: false,
                    //     width: "100px"
                    // },
                    // {   title: CommonService.translate("Trạng thái QTRR duyệt GĐ1"),
                    //     field: "statusKtnb",
                    //     template : function(dataItem){
                    //         if (dataItem.statusKtnb == 2) {
                    //             return CommonService.translate("Từ chối");
                    //         } else if (dataItem.statusKtnb == 1) {
                    //             return CommonService.translate("Đã duyệt");
                    //         } else if (dataItem.statusKtnb == 0) {
                    //             return CommonService.translate("Chờ duyệt");
                    //         } else {
                    //             return "";
                    //         }
                    //     },
                    //     headerAttributes: {
                    //         "class": "table-header-cell",
                    //         style: "text-align: center; font-weight: bold;white-space:normal;"
                    //     },
                    //     attributes: {
                    //         "class": "table-cell",
                    //         style: "text-align: right; "
                    //     },
                    //     hidden: false,
                    //     width: "100px"
                    // },
                    {   title: CommonService.translate("Trạng thái chỉ huy xác nhận GĐ2"),
                        field: "statusApprovedDv",
                        template : function(dataItem){
                            if (dataItem.statusApprovedDv == 2) {
                                return CommonService.translate("Từ chối");
                            } else if (dataItem.statusApprovedDv == 1) {
                                return CommonService.translate("Đã xác nhận");
                            } else if (dataItem.statusApprovedDv == 0) {
                                return CommonService.translate("Chờ xác nhận");
                            } else {
                                return "";
                            }
                        },
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "# if(data.statusApprovedDv == 2) { # yellow table-cell # } else { if(data.statusApprovedDv == 1) { # green table-cell # } else { if(data.statusApprovedDv == 0) { # orange table-cell # } else { # table-cell # }}} #",
                            style: "text-align: right; "
                        },
                        hidden: false,
                        width: "100px"
                    },
                    {   title: CommonService.translate("Trạng thái QTRR xác nhận GĐ3"),
                        field: "statusApprovedKtnb",
                        template : function(dataItem){
                            if (dataItem.statusApprovedKtnb == 2) {
                                return CommonService.translate("Từ chối");
                            } else if (dataItem.statusApprovedKtnb == 1) {
                                return CommonService.translate("Đã xác nhận");
                            } else if (dataItem.statusApprovedKtnb == 0) {
                                return CommonService.translate("Chờ xác nhận");
                            } else {
                                return "";
                            }
                        },
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "# if(data.statusApprovedKtnb == 2) { # yellow table-cell # } else { if(data.statusApprovedKtnb == 1) { # green table-cell # } else { if(data.statusApprovedKtnb == 0) { # orange table-cell # } else { # table-cell # }}} #",
                            style: "text-align: right; "
                        },
                        hidden: false,
                        width: "100px"
                    },
                    {   title: CommonService.translate("Tình trạng"),
                        field: "statusDamage",
                        template : function(dataItem){
                            if (dataItem.statusDamage == 1) {
                                return CommonService.translate("Trong hạn");
                            } else if (dataItem.statusDamage == 2) {
                                return CommonService.translate("Quá hạn");
                            } else {
                                return "";
                            }
                        },
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "# if(data.statusDamage == 2) { # red table-cell # } else { # table-cell # } #",
                            style: "text-align: right; "
                        },
                        hidden: false,
                        width: "100px"
                    },
                    {
                        title: CommonService.translate("Thao tác"),
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold;",
                            translate: ""
                        },
                        hidden: false,
                        template: function (dataItem) {
                                return (
                                    '<div class="text-center #=dataDamageId#"">' +
                                    '<button  style=" border: none; background-color: white;"' +
                                    'class="#=dataDamageId# icon_table"  uib-tooltip="Sửa" translate ng-click="vm.edit(dataItem)" ng-if="(dataItem.statusApprovedDv == 2 || dataItem.statusApprovedDv == null || dataItem.statusApprovedKtnb == 2) && vm.isCreateByUser(dataItem)" >' +
                                    '<i  style="color:#f1c40f;" class="fa fa-pencil " aria-hidden="true"></i>' +
                                    '</button>' +

                                    '<button  style=" border: none; background-color: white;" class="#=dataDamageId# icon_table ng-scope" uib-tooltip="Xóa" translate="" ' +
                                    'ng-if="dataItem.statusApprovedDv == null && vm.isCreateByUser(dataItem)" ' +
                                    'ng-click="vm.remove(dataItem)" > <i style="color:steelblue;" class="fa fa-trash ng-scope" aria-hidden="true"></i>' +
                                    '</button>' +

                                    '<button  style=" border: none; background-color: white;" class="#=dataDamageId# icon_table ng-scope" uib-tooltip="Chỉ huy đơn vị duyệt GĐ1" translate="" ' +
                                    'ng-click="vm.openApprovePopup(dataItem, 1)" ng-if="dataItem.statusDv == 2 && dataItem.isApprovedDvQtrr == 1"> ' +
                                    '<i style="color:#6495ED;" class="glyphicon glyphicon-ok-circle" aria-hidden="true"></i>' +
                                    '</button>' +
                                    '<button  style=" border: none; background-color: white;" class="#=dataDamageId# icon_table ng-scope" uib-tooltip="QTRR duyệt GĐ2" translate="" ' +
                                    'ng-click="vm.openApprovePopup(dataItem, 2)" ng-if="dataItem.statusDv == 1 && dataItem.statusKtnb == 0 && vm.approvedKtnbQtrrPermission">' +
                                    ' <i style="color:#53b453;" class="fa fa-check ng-scope" aria-hidden="true"></i>' +
                                    '</button>' +
                                    '<button  style=" border: none; background-color: white;" class="#=dataDamageId# icon_table ng-scope" uib-tooltip="Nhập nguyên nhân và giải pháp" translate="" ' +
                                    'ng-click="vm.createGD2(dataItem)" ng-if="(dataItem.statusDv == 1 && dataItem.statusKtnb == 1) && (dataItem.statusApprovedDv == null || dataItem.statusApprovedDv == 2 || (dataItem.statusApprovedKtnb == 2 && dataItem.statusApprovedDv != 1))"> ' +
                                    '<i style="color:#2367b4;" class="fa fa-plus-square ng-scope" aria-hidden="true"></i>' +
                                    '</button>' +
                                    '<button  style=" border: none; background-color: white;" class="#=dataDamageId# icon_table ng-scope" uib-tooltip="Chỉ huy xác nhận GĐ2" translate="" ' +
                                    'ng-click="vm.openApprovePopup(dataItem,3)" ng-if="dataItem.statusKtnb == 1 && dataItem.statusApprovedDv == 0 && dataItem.isApprovedDvQtrr == 1"> ' +
                                    '<i style="color:darkgreen" class="fa fa-check-square ng-scope" aria-hidden="true"></i>' +
                                    '</button>' +
                                    '<button  style=" border: none; background-color: white;" class="#=dataDamageId# icon_table ng-scope" uib-tooltip="Hoàn thành việc" translate="" ' +
                                    'ng-click="vm.openApprovePopup(dataItem,4)" ng-if="(dataItem.statusApprovedDv == 1 && (dataItem.statusApprovedKtnb == null || dataItem.statusApprovedKtnb == 2) && vm.isCreateByUser(dataItem))"> ' +
                                    '<i style="color:black;" class="fa fa-arrow-circle-right ng-scope" aria-hidden="true"></i>' +
                                    '</button>' +

                                    '<button  style=" border: none; background-color: white;"' +
                                    'class=" icon_table"  uib-tooltip="QTRR xác nhận GĐ3" translate' +
                                    '  ng-click=vm.openApprovePopup(dataItem,5) ng-if="dataItem.statusApprovedDv == 1 && dataItem.statusApprovedKtnb == 0 && vm.confirmKtnbQtrrPermission">' +
                                    '<i  style="color:#edb945;" class="fa fa-gavel ng-scope" aria-hidden="true"></i>' +
                                    '</button>' +
                                    '<button  style=" border: none; background-color: white;"' +
                                    'class=" icon_table"  uib-tooltip="QTRR sửa thông tin" translate' +
                                    '  ng-click=vm.editQTRR(dataItem) ng-if="dataItem.statusApprovedDv == 1 && vm.confirmKtnbQtrrPermission">' +
                                    '<i  style="color:#edb945;" class="fa fa-pencil ng-scope" aria-hidden="true"></i>' +
                                    '</button>' +
                                    '</div>'
                                )
                        },
                        width: "300px"
                    }
                ],
            });
        // }

        vm.isCreateByUser = function(dataItem) {
            if (dataItem.createBy == Constant.user.vpsUserToken.sysUserId) {
                return true;
            }
            return false;
        }

        //tim kiem
        vm.doSearch = doSearch;
        function doSearch() {
            var grid = vm.dataDamageGrid;
            if(grid){
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
                vm.listDataChoise = [];
            }
        };

        //clear
        vm.clear = function(a){
            if( a == 'sysGroupPsSearch'){
                vm.searchForm.sysGroupIdPs = null;
                vm.searchForm.sysGroupNamePs = null;
            } else if( a == 'statusDvSearch'){
                vm.searchForm.statusDv = null;
            } else if( a == 'riskTypeSearch'){
                vm.searchForm.riskType = null;
            } else if( a == 'statusApprovedDvSearch'){
                vm.searchForm.statusApprovedDv = null;
            } else if( a == 'timeDetectSearch'){
                vm.searchForm.timeDetectFrom = null;
                vm.searchForm.timeDetectTo = null;
            } else if( a == 'remediesDateSearch'){
                vm.searchForm.remediesDateFrom = null;
                vm.searchForm.remediesDateTo = null;
            } else if( a == 'statusKtnbSearch'){
                vm.searchForm.statusKtnb = null;
            } else if( a == 'statusApprovedKtnbSearch'){
                vm.searchForm.statusApprovedKtnb = null;
            } else if( a == 'nameInsert'){
                vm.addForm.name = null;
                vm.addForm.dataDamageConfigId = null;
            } else if( a == 'sysGroupPsInsert'){
                vm.addForm.sysGroupNamePs = null;
                vm.addForm.sysGroupIdPs = null;
            } else if( a == 'sysGroupPhInsert'){
                vm.addForm.sysGroupNamePh = null;
                vm.addForm.sysGroupIdPh = null;
            } else if( a == 'stationInsert'){
                vm.addForm.station = null;
            } else if( a == 'businessArea'){
                vm.addForm.businessArea = null;
            } else if( a == 'timeDetectInsert'){
                vm.addForm.timeDetect = null;
            } else if( a == 'timeHappenedInsert'){
                vm.addForm.timeHappened = null;
            } else if( a == 'nameDescription'){
                vm.addForm.nameDescription = null;
            } else if( a == 'riskTypeInsert'){
                vm.addForm.riskType = null;
            } else if( a == 'valueDamageInsert'){
                vm.addForm.valueDamage = 0;
                vm.addForm.valueDamageOrigin = 0;
            } else if( a == 'reasonTypeInsert'){
                vm.addForm.reasonType = null;
            } else if( a == 'valueDamageNonInsert'){
                vm.addForm.valueDamageNon = null;
            } else if( a == 'reasonDescription'){
                vm.addForm.reasonDescription = null;
            } else if( a == 'remedies'){
                vm.addForm.remedies = null;
            } else if( a == 'consequenceInsert'){
                vm.addForm.consequence = null;
            } else if( a == 'unitInsert'){
                vm.addForm.unit = null;
            } else if( a == 'damageTypeInsert'){
                vm.addForm.damageType = null;
            } else if( a == 'sysGroupResponsibleInsert'){
                vm.addForm.sysGroupResponsibleId = null;
                vm.addForm.sysGroupResponsibleName = null;
            } else if( a == 'sysGroupTogetherInsert'){
                vm.addForm.sysGroupTogetherId = null;
                vm.addForm.sysGroupTogetherName = null;
            } else if( a == 'remediesDateInsert'){
                vm.addForm.remediesDate = null;
            } else if( a == 'descriptionInsert'){
                vm.addForm.description = null;
            } else if (a == 'valueRemediesInsert') {
                vm.addForm.valueRemedies = 0;
                vm.addForm.valueDamageOrigin = vm.addForm.valueDamage;
            } else if (a == 'searchStatus') {
                vm.searchForm.statusDamage = null;
            }
        }


        /*
		 * đóng Popup
		 */
        vm.cancel = function () {
            $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
        }
        vm.cancelPopupReject = function () {
            modalCancelApproveGd1.dismiss();
        }

        vm.listDataChoise = [];
        vm.addListChoise = function (dataItem) {
            if (dataItem.selected) {
                vm.listDataChoise.push(dataItem);
            } else {
                vm.listDataChoise.slice(dataItem, 1);
            }
        }

        vm.remove = function (dataItem){
            confirm(CommonService.translate("Bạn có chắc chắn muốn xóa bản ghi này?"), function () {
                vm.addForm = angular.copy(dataItem);
                kendo.ui.progress(vm.documentBody, true);
                dataDamageService.remove(vm.addForm).then(function () {
                    toastr.success(CommonService.translate("Xóa bản ghi thành công"));
                    vm.doSearch();
                    kendo.ui.progress(vm.documentBody, false);
                }, function (err) {
                    toastr.error(CommonService.translate("Có lỗi xảy ra"));
                    kendo.ui.progress(vm.documentBody, false);
                });
            });
        };

        vm.showButtonSaveUpdate = false;
        vm.isEditQTRR = false;
        vm.create=function(){
            vm.showButtonSaveUpdate = true;
            vm.viewInfo = false;
            vm.showButtonApproveGD1 = false;
            vm.showButtonApproveGD2 = false;
            vm.showButtonConfirmGD2 = false;
            vm.showButtonConfirmGD3 = false;
            vm.showInfoGD2 = false;
            vm.isEditQTRR = false;
            console.log(vm.showButtonConfirmGD3);
            vm.typeCreate = 'add';
            vm.addForm = {};
            vm.addForm.sysGroupIdPs = vm.rootSysGroupCreate.sysGroupId;
            vm.addForm.sysGroupNamePs = vm.rootSysGroupCreate.sysGroupName;
            vm.addForm.areaCode = vm.rootSysGroupCreate.areaCode;
            vm.addForm.sysGroupIdPh = vm.rootSysGroupCreate.sysGroupId;
            vm.addForm.sysGroupNamePh = vm.rootSysGroupCreate.sysGroupName;
            var templateUrl="ktnb/dataDamage/dataDamageAddPopupExcel.html";
            var title="Thêm mới";
            var windowId="WORK_LIST_ADD";
            // CommonService.populatePopupCreate(teamplateUrl,title,null,vm,windowId,true,'80%','60%',null);
            CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "60%", null, null);
        }

        vm.edit=function(dataItem){
            vm.showButtonSaveUpdate = true;
            vm.viewInfo = false;
            vm.showButtonApproveGD1 = false;
            vm.showButtonApproveGD2 = false;
            vm.showButtonConfirmGD2 = false;
            vm.showButtonConfirmGD3 = false;
            vm.showInfoGD2 = false;
            vm.isEditQTRR = false;
            vm.typeCreate = 'edit';
            vm.addForm = angular.copy(dataItem);
            var templateUrl="ktnb/dataDamage/dataDamageAddPopupExcel.html";
            var title="Cập nhật";
            var windowId="WORK_LIST_ADD";
            // CommonService.populatePopupCreate(teamplateUrl,title,null ,vm,windowId,true,'80%','60%',null);
            CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "60%", null, null);
        }

        vm.editQTRR=function(dataItem){
            vm.showButtonSaveUpdate = true;
            vm.viewInfo = false;
            vm.showButtonApproveGD1 = false;
            vm.showButtonApproveGD2 = false;
            vm.showButtonConfirmGD2 = false;
            vm.showButtonConfirmGD3 = false;
            vm.showInfoGD2 = false;
            vm.isEditQTRR = true;
            vm.typeCreate = 'edit';
            vm.addForm = angular.copy(dataItem);
            console.log(vm.isEditQTRR);
            var templateUrl="ktnb/dataDamage/dataDamageAddPopupExcel.html";
            var title="Cập nhật";
            var windowId="WORK_LIST_ADD";
            // CommonService.populatePopupCreate(teamplateUrl,title,null ,vm,windowId,true,'80%','60%',null);
            CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "60%", null, null);
        }

        vm.showDataDetail = function (dataItem) {
            vm.showButtonSaveUpdate = false;
            vm.viewInfo = true;
            vm.showButtonApproveGD1 = false;
            vm.showButtonApproveGD2 = false;
            vm.showButtonConfirmGD2 = false;
            vm.showButtonConfirmGD3 = false;
            vm.showInfoGD2 = false;
            vm.isEditQTRR = false;
            vm.addForm = angular.copy(dataItem);
            vm.addForm.riskType = !!vm.addForm.riskType ? vm.addForm.riskType.toString() : vm.addForm.riskType;
            vm.addForm.reasonType = !!vm.addForm.reasonType ? vm.addForm.reasonType.toString() : vm.addForm.reasonType;
            vm.addForm.consequence = !!vm.addForm.consequence ? vm.addForm.consequence.toString() : vm.addForm.consequence;
            vm.addForm.damageType = !!vm.addForm.damageType ? vm.addForm.damageType.toString() : vm.addForm.damageType;
            var templateUrl="ktnb/dataDamage/dataDamageAddPopupExcel.html";
            var title="Xem chi tiết";
            var windowId="VIEW";
            dataDamageService.getAttachFile(vm.addForm).then(function (data) {
                vm.dataFile = data.listAttach;
                fillFileTable(vm.dataFile);
                CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "60%", null, null);
            });
        }

        vm.flagApprovePopup = null;
        vm.showButtonApproveGD1 = false;
        vm.showButtonApproveGD2 = false;
        vm.showButtonConfirmGD2 = false;
        vm.disableInfoGd2 = false;
        vm.showButtonComplete = false;
        vm.showButtonConfirmGD3 = false;
        vm.openApprovePopup = function (dataItem, type) {
            vm.flagApprovePopup = type;
            vm.showButtonSaveUpdate = false;
            vm.viewInfo = false;
            vm.showButtonApproveGD1 = false;
            vm.showButtonApproveGD2 = false;
            vm.showButtonConfirmGD2 = false;
            vm.showInfoGD2 = false;
            vm.isEditQTRR = false;
            vm.showButtonComplete = false;
            vm.showButtonConfirmGD3 = false;
            vm.addForm = angular.copy(dataItem);
            vm.addForm.riskType = !!vm.addForm.riskType ? vm.addForm.riskType.toString() : vm.addForm.riskType;
            vm.addForm.reasonType = !!vm.addForm.reasonType ? vm.addForm.reasonType.toString() : vm.addForm.reasonType;
            vm.addForm.consequence = !!vm.addForm.consequence ? vm.addForm.consequence.toString() : vm.addForm.consequence;
            vm.addForm.damageType = !!vm.addForm.damageType ? vm.addForm.damageType.toString() : vm.addForm.damageType;
            var title="";
            if (type == 1) {
                vm.showButtonApproveGD1 = true;
                title="Chỉ huy đơn vị duyệt Giai Đoạn 1";
                openPopupHtml(title, vm);
            } else if (type == 2) {
                vm.showButtonApproveGD2 = true;
                title="Quản trị rủi ro duyệt Giai Đoạn 2";
                openPopupHtml(title, vm);
            } else if (type == 3) {
                vm.disableInfoGd2 = true;
                vm.showButtonConfirmGD2 = true;
                title="Chỉ huy xác nhận Giai Đoạn 2";
                openPopupHtml(title, vm);
            } else if (type == 4) {
                vm.disableInfoGd2 = true;
                vm.showButtonComplete = true;
                title="Màn hình hoàn thành việc";
                dataDamageService.getAttachFile(vm.addForm).then(function (data) {
                    vm.dataFile = data.listAttach;
                    vm.addForm.listAttachOld = data.listAttachOld;
                    fillFileTable(vm.dataFile);
                    openPopupHtml(title, vm);
                });
            } else if (type == 5) {
                vm.disableInfoGd2 = true;
                vm.showButtonConfirmGD3 = true;
                title="QTRR xác nhận Giai đoạn 3";
                dataDamageService.getAttachFile(vm.addForm).then(function (data) {
                    vm.dataFile = data.listAttach;
                    fillFileTable(vm.dataFile);
                    openPopupHtml(title, vm);
                });
            }
        }

        function openPopupHtml(title, vm) {
            var templateUrl="ktnb/dataDamage/dataDamageAddPopupExcel.html";
            var windowId="APPROVE_GD1";
            CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "80%", null, null);
        }

        vm.saveApproveGD1 = function() {
            kendo.ui.progress($("#dataDamage_import_popupId"), true);
            dataDamageService.saveApproveGD1(vm.addForm).then(function (res) {
                if (res && res.error) {
                    toastr.error(CommonService.translate(res.error));
                    kendo.ui.progress($("#dataDamage_import_popupId"), false);
                    return;
                }
                toastr.success(CommonService.translate("Duyệt bản ghi thành công"));
                vm.doSearch();
                kendo.ui.progress($("#dataDamage_import_popupId"), false);
                $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
            });
        }

        vm.saveQtrrApproveGD2 = function() {
            kendo.ui.progress($("#dataDamage_import_popupId"), true);
            dataDamageService.saveQtrrApproveGD2(vm.addForm).then(function (res) {
                if (res && res.error) {
                    toastr.error(CommonService.translate(res.error));
                    kendo.ui.progress($("#dataDamage_import_popupId"), false);
                    return;
                }
                toastr.success(CommonService.translate("Duyệt bản ghi thành công"));
                vm.doSearch();
                kendo.ui.progress($("#dataDamage_import_popupId"), false);
                $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
            });
        }

        vm.saveConfirmGd3 = function() {
            kendo.ui.progress($("#dataDamage_import_popupId"), true);
            dataDamageService.saveConfirmGd3(vm.addForm).then(function (res) {
                if (res && res.error) {
                    toastr.error(CommonService.translate(res.error));
                    kendo.ui.progress($("#dataDamage_import_popupId"), false);
                    return;
                }
                toastr.success(CommonService.translate("Xác nhận bản ghi thành công"));
                vm.doSearch();
                kendo.ui.progress($("#dataDamage_import_popupId"), false);
                $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
            });
        }


        vm.reasonReject = null;
        var modalCancelApproveGd1 = null;
        vm.cancelApproveGd1 = function () {
            var templateUrl = 'ktnb/dataDamage/popupCancel.html';
            var title = CommonService.translate("Từ chối");
            vm.reasonReject = null;
            modalCancelApproveGd1 = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "30%", "20%", null, null);
        }

        vm.saveCancelStatus = function() {
            if (vm.flagApprovePopup == 1) {
                vm.addForm.cancelDvDescription = vm.reasonReject;
                if (vm.addForm.cancelDvDescription == null || vm.addForm.cancelDvDescription.trim() == "") {
                    toastr.error(CommonService.translate("Lý do không được để trống"));
                    $("#reasonReject").focus();
                    return;
                }
                kendo.ui.progress($("#ktnb_popup_Cancel_Id"), true);
                dataDamageService.cancelApproveGD1(vm.addForm).then(function (res) {
                    if (res && res.error) {
                        toastr.error(CommonService.translate(res.error));
                        kendo.ui.progress($("#ktnb_popup_Cancel_Id"), true);
                        return;
                    }
                    toastr.success(CommonService.translate("Từ chối bản ghi thành công"));
                    vm.doSearch();
                    kendo.ui.progress($("#ktnb_popup_Cancel_Id"), true);
                    $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
                });
            } else if (vm.flagApprovePopup == 2) {
                vm.addForm.cancelKtnbDescription = vm.reasonReject;
                if (vm.addForm.cancelKtnbDescription == null || vm.addForm.cancelKtnbDescription.trim() == "") {
                    toastr.error(CommonService.translate("Lý do không được để trống"));
                    $("#reasonReject").focus();
                    return;
                }
                kendo.ui.progress($("#ktnb_popup_Cancel_Id"), true);
                dataDamageService.cancelQtrrApproveGD2(vm.addForm).then(function (res) {
                    if (res && res.error) {
                        toastr.error(CommonService.translate(res.error));
                        kendo.ui.progress($("#ktnb_popup_Cancel_Id"), true);
                        return;
                    }
                    toastr.success(CommonService.translate("Từ chối thành công"));
                    vm.doSearch();
                    kendo.ui.progress($("#ktnb_popup_Cancel_Id"), true);
                    $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
                });
            } else if (vm.flagApprovePopup == 3) {
                vm.addForm.rejectDvDescription = vm.reasonReject;
                if (vm.addForm.rejectDvDescription == null || vm.addForm.rejectDvDescription.trim() == "") {
                    toastr.error(CommonService.translate("Lý do không được để trống"));
                    $("#reasonReject").focus();
                    return;
                }
                kendo.ui.progress($("#ktnb_popup_Cancel_Id"), true);
                dataDamageService.cancelConfirmGD2(vm.addForm).then(function (res) {
                    if (res && res.error) {
                        toastr.error(CommonService.translate(res.error));
                        kendo.ui.progress($("#ktnb_popup_Cancel_Id"), true);
                        return;
                    }
                    toastr.success(CommonService.translate("Từ chối thành công"));
                    vm.doSearch();
                    kendo.ui.progress($("#ktnb_popup_Cancel_Id"), true);
                    $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
                });
            } else if (vm.flagApprovePopup == 5) {
                vm.addForm.rejectKtnbDescription = vm.reasonReject;
                if (vm.addForm.rejectKtnbDescription == null || vm.addForm.rejectKtnbDescription.trim() == "") {
                    toastr.error(CommonService.translate("Lý do không được để trống"));
                    $("#reasonReject").focus();
                    return;
                }
                kendo.ui.progress($("#ktnb_popup_Cancel_Id"), true);
                dataDamageService.cancelConfirmGd3(vm.addForm).then(function (res) {
                    if (res && res.error) {
                        toastr.error(CommonService.translate(res.error));
                        kendo.ui.progress($("#ktnb_popup_Cancel_Id"), true);
                        return;
                    }
                    toastr.success(CommonService.translate("Từ chối thành công"));
                    vm.doSearch();
                    kendo.ui.progress($("#ktnb_popup_Cancel_Id"), true);
                    $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
                });
            }
        }

        // nguyen nhan va giai phap
        vm.showInfoGD2 = false;
        vm.createGD2 = function(dataItem){
            vm.showButtonSaveUpdate = false;
            vm.viewInfo = false;
            vm.showButtonApproveGD1 = false;
            vm.showButtonApproveGD2 = false;
            vm.showButtonConfirmGD2 = false;
            vm.showInfoGD2 = true;
            vm.isEditQTRR = false;
            vm.disableInfoGd2 = false;
            vm.showButtonConfirmGD3 = false;
            vm.addForm = angular.copy(dataItem);
            vm.addForm.riskType = !!vm.addForm.riskType ? vm.addForm.riskType.toString() : vm.addForm.riskType;
            vm.addForm.reasonType = !!vm.addForm.reasonType ? vm.addForm.reasonType.toString() : vm.addForm.reasonType;
            vm.addForm.consequence = !!vm.addForm.consequence ? vm.addForm.consequence.toString() : vm.addForm.consequence;
            vm.addForm.damageType = !!vm.addForm.damageType ? vm.addForm.damageType.toString() : vm.addForm.damageType;
            vm.addForm.sysGroupResponsibleId = vm.addForm.sysGroupIdPs;
            vm.addForm.sysGroupResponsibleName = vm.addForm.sysGroupNamePs;
            vm.addForm.valueDamage = !!vm.addForm.valueDamage ? vm.addForm.valueDamage : 0;
            vm.addForm.valueDamageOrigin = !!vm.addForm.valueDamageOrigin ? vm.addForm.valueDamageOrigin : 0;
            vm.addForm.valueRemedies = !!vm.addForm.valueRemedies ? vm.addForm.valueRemedies : 0;
            vm.addForm.valueDamageOrigin = vm.addForm.valueDamage - vm.addForm.valueRemedies;
            var templateUrl="ktnb/dataDamage/dataDamageAddPopupExcel.html";
            var title="Nhập nguyên nhân và giải pháp";
            var windowId="WORK_LIST_ADD";
            CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "60%", null, null);
        }

        vm.saveGD2 = function() {
            if (vm.addForm.riskType == null) {
                toastr.error(CommonService.translate("Nhóm rủi ro bắt buộc nhập!"));
                return;
            }
            if (vm.addForm.reasonType == null) {
                toastr.error(CommonService.translate("Loại nguyên nhân bắt buộc nhập!"));
                return;
            }
            if (vm.addForm.reasonDescription == null || vm.addForm.reasonDescription.trim() == '') {
                toastr.error(CommonService.translate("Mô tả nguyên nhân bắt buộc nhập!"));
                $("#insertDataDamageReasonDescription").focus();
                return;
            }
            if (vm.addForm.consequence == null) {
                toastr.error(CommonService.translate("Hậu quả tổn thất bắt buộc nhập!"));
                return;
            }
            if (vm.addForm.damageType == null) {
                toastr.error(CommonService.translate("Loại tổn thất bắt buộc nhập!"));
                return;
            }
            if ((vm.addForm.valueDamage == null || vm.addForm.valueDamage <= 0) && (vm.addForm.consequence == 1 || vm.addForm.consequence == 3)) {
                toastr.error(CommonService.translate("Giá trị tổn thất thực tế (tài chính) bắt buộc nhập!"));
                $("#insertDataDamageValueDamage").focus();
                return;
            }
            if ((vm.addForm.valueDamageNon == null || vm.addForm.valueDamageNon <= 0) && (vm.addForm.consequence == 2 || vm.addForm.consequence == 3)) {
                toastr.error(CommonService.translate("Giá trị tổn thất thực tế (phi tài chính) bắt buộc nhập!"));
                $("#insertDataDamageValueDamageNon").focus();
                return;
            }
            if (vm.addForm.remedies == null || vm.addForm.remedies.trim() == '') {
                toastr.error(CommonService.translate("Biện pháp khắc phục bắt buộc nhập!"));
                $("#insertDataDamageRemedies").focus();
                return;
            }
            if (vm.addForm.sysGroupResponsibleId == null || vm.addForm.sysGroupResponsibleName == null) {
                toastr.error(CommonService.translate("Đơn vị chịu trách nhiệm khắc phục bắt buộc nhập!"));
                $("#insertDataDamageSysGroupResponsible").focus();
                return;
            }
            if (vm.addForm.remediesDate == null) {
                toastr.error(CommonService.translate("Thời gian khắc phục bắt buộc nhập!"));
                $("#insertDataDamageRemediesDate").focus();
                return;
            }
            // if (vm.addForm.description == null || vm.addForm.description.trim() == '') {
            //     toastr.error(CommonService.translate("Ghi chú bắt buộc nhập!"));
            //     $("#insertDataDamageDescription").focus();
            //     return;
            // }
            kendo.ui.progress($("#dataDamage_import_popupId"), true);
            dataDamageService.saveGd2(vm.addForm).then(function (res) {
                if (res && res.error) {
                    toastr.error(CommonService.translate(res.error));
                    kendo.ui.progress($("#dataDamage_import_popupId"), false);
                    return;
                }
                toastr.success(CommonService.translate("Nhập nguyên nhân và giải pháp thành công"));
                vm.doSearch();
                kendo.ui.progress($("#dataDamage_import_popupId"), false);
                $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
            });

        }

        // lưu nhap
        vm.saveGD2Temp = function() {
            kendo.ui.progress($("#dataDamage_import_popupId"), true);
            dataDamageService.saveGd2Temp(vm.addForm).then(function (res) {
                if (res && res.error) {
                    toastr.error(CommonService.translate(res.error));
                    kendo.ui.progress($("#dataDamage_import_popupId"), false);
                    return;
                }
                toastr.success(CommonService.translate("Lưu nháp thành công"));
                vm.doSearch();
                kendo.ui.progress($("#dataDamage_import_popupId"), false);
                $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
            });

        }

        // chi huy xac nhan gd2
        vm.saveConfirmGD2 = function() {
            kendo.ui.progress($("#dataDamage_import_popupId"), true);
            dataDamageService.saveConfirmGD2(vm.addForm).then(function (res) {
                if (res && res.error) {
                    toastr.error(CommonService.translate(res.error));
                    kendo.ui.progress($("#dataDamage_import_popupId"), false);
                    return;
                }
                toastr.success(CommonService.translate("Duyệt bản ghi thành công"));
                vm.doSearch();
                kendo.ui.progress($("#dataDamage_import_popupId"), false);
                $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
            });
        }

        // hoan thanh viec
        vm.saveComplete = function() {
            // if (vm.dataFile.length == 0) {
            //     toastr.error(CommonService.translate("Bắt buộc nhập file đính kèm hoàn thành công việc"));
            //     return;
            // }
            vm.addForm.listAttach = vm.dataFile;
            kendo.ui.progress($("#dataDamage_import_popupId"), true);
            dataDamageService.saveComplete(vm.addForm).then(function (res) {
                if (res && res.error) {
                    toastr.error(CommonService.translate(res.error));
                    kendo.ui.progress($("#dataDamage_import_popupId"), false);
                    return;
                }
                toastr.success(CommonService.translate("Đã hoàn thành việc"));
                vm.doSearch();
                kendo.ui.progress($("#dataDamage_import_popupId"), false);
                $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
            });
        }

        vm.disableExportExcel = false;
        vm.getExcelTemplate = function () {
            var fileName = "Import_CongViec";
            function displayLoading(target) {
                var element = $(target);
                kendo.ui.progress(element, true);
                setTimeout(function(){
                    if (vm.disableExportExcel)
                        return;
                    vm.disableExportExcel = true;
                    return Restangular.all("dataDamageRsService/downloadFile").post().then(function (d) {
                        var data = d.plain();
                        window.location = Constant.BASE_SERVICE_URL + "fileservice/downloadFileATTT?" + data.fileName;
                        kendo.ui.progress(element, false);
                        vm.disableExportExcel = false;
                    }).catch(function (e) {
                        kendo.ui.progress(element, false);
                        toastr.error(gettextCatalog.getString("Lỗi khi tải biểu mẫu!"));
                        vm.disableExportExcel = false;
                        return;
                    });
                });

            }
            displayLoading("#capNhatId");

        };


        // đóng poup lỗi
        vm.closeErrImportPopUp = function closeErrImportPopUp() {
            modalInstanceImport.dismiss();
        }
        //------------------------
        vm.readOnlyReceiver = false;

        vm.deleteData=function(dataItem){
            vm.listdataDamageExportTemp.slice(dataItem);
            $('#listdataDamageExportTempGrid').data('kendoGrid').dataSource.remove(dataItem);
        }
        vm.push=function (){
            var data = [];
            // vm.listdataDamageExportTemp.push(data);
            $('#listdataDamageExportTempGrid').data('kendoGrid').dataSource.insert(data);
        }

        vm.save = function () {
            if(vm.addForm.name == null || vm.addForm.name.trim() == ''){
                toastr.warning("Tên sự kiện bắt buộc nhập!");
                $("#insertDataDamageName").focus();
                return ;
            }
            if(vm.addForm.sysGroupIdPs == null){
                toastr.warning("Đơn vị phát sinh bắt buộc nhập!");
                $("#insertDataDamageSysGroupPs").focus();
                return ;
            }
            if(vm.addForm.sysGroupIdPh == null){
                toastr.warning("Đơn vị phát hiện bắt buộc nhập!");
                $("#insertDataDamageSysGroupPh").focus();
                return ;
            }
            // if(vm.addForm.station == null || vm.addForm.station.trim() == ''){
            //     toastr.warning("Đơn vị phát sinh trạm tuyến bắt buộc nhập!");
            //     $("#insertDataDamageStation").focus();
            //     return ;
            // }
            if (vm.addForm.businessArea == null) {
                toastr.warning("Trụ kinh doanh bắt buộc nhập!");
                return ;
            }
            if(vm.addForm.timeDetect == null){
                toastr.warning("Thời gian phát hiện bắt buộc nhập!");
                $("#insertDataDamageTimeDetect").focus();
                return ;
            }
            if(vm.addForm.timeHappened == null){
                toastr.warning("Thời gian xảy ra bắt buộc nhập!");
                $("#insertDataDamageTimeHappened").focus();
                return ;
            }
            if(vm.addForm.nameDescription == null || vm.addForm.nameDescription.trim() == ''){
                toastr.warning("Mô tả chi tiết bắt buộc nhập!");
                $("#insertDataDamageNameDescription").focus();
                return ;
            }
            var a1 = vm.addForm.timeDetect.split("/");
            var d1 = new Date(a1[1] + "/" + a1[0] + "/" + a1[2]);
            var a2 = vm.addForm.timeHappened.split("/");
            var d2 = new Date(a2[1] + "/" + a2[0] + "/" + a2[2]);
            if (d1 < d2) {
                toastr.warning("Thời gian phát hiện không được nhỏ hơn thời gian xảy ra");
                return ;
            }
            kendo.ui.progress($("#dataDamage_import_popupId"), true);

            if(vm.typeCreate == 'add'){
                dataDamageService.save(vm.addForm).then(function (res) {
                    if (res && res.error) {
                        toastr.error(CommonService.translate(res.error));
                        kendo.ui.progress($("#dataDamage_import_popupId"), false);
                        return;
                    }
                    toastr.success(CommonService.translate("Thêm mới bản ghi thành công"));
                    vm.doSearch();
                    kendo.ui.progress($("#dataDamage_import_popupId"), false);
                    $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
                });
            } else if(vm.typeCreate == 'edit'){
                dataDamageService.update(vm.addForm).then(function (res) {
                    if (res && res.error) {
                        toastr.error(CommonService.translate(res.error));
                        kendo.ui.progress($("#dataDamage_import_popupId"), false);
                        return;
                    }
                    toastr.success(CommonService.translate("Cập nhật bản ghi thành công"));
                    vm.doSearch();
                    kendo.ui.progress($("#dataDamage_import_popupId"), false);
                    $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
                });
            }
        };

        vm.selectedSysGroupLv2 = false;
        vm.sysGroupLv2Options = {
            dataTextField: "name",
            select: function(e) {
                vm.selectedSysGroupLv2 = true;
                var dataItem = this.dataItem(e.item.index());
                vm.addForm.sysGroupNameLv2 = dataItem.name;
                vm.addForm.sysGroupIdLv2 = dataItem.sysGroupId;
            },
            pageSize: 10,
            open: (e)=>{
                vm.selectedSysGroupLv2 = false;
            },
            dataSource: {
                serverFiltering: true,
                    transport: {
                    read: (options)=> {
                        vm.selectedSysGroupLv2 = false;
                        return Restangular.all("dataDamageRsServiceRest/getSysGroup").post({
                            pageSize: 15,
                            page: 1,
                            keySearch: $("#sysGroupIdLv2").val().trim(),
                            groupLevelLst: [2]
                        }).then((response)=> {
                            options.success(response.data);
                    }).catch((err)=> {
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
            change: (e)=> {

                if (!vm.selectedSysGroupLv2) {
                    vm.addForm.sysGroupIdLv2 = null;
                    vm.addForm.sysGroupNameLv2 = null;
                    vm.addForm.sysGroupIdLv3 = null;
                    vm.addForm.sysGroupNameLv3 = null;
                }
            },
            ignoreCase: false
        }

        vm.selectSysGroupLv2 = function(){
            var teamplateUrl = "ktnb/dataDamage/sysGroupPopup.html";
            var title = CommonService.translate("Lựa chọn đơn vị");
            var windowId = "SELECT_SYS_GROUP_LV2";
            vm.objSearchG = {};
            vm.objSearchG.groupLevelLst = [2];
            fillDataSysGTable(vm.objSearchG);
            CommonService.populatePopupCreate(teamplateUrl, title, null, vm, windowId, null, '60%', '60%', 'changepopupSys');
        }

        var recordSys = 0;
        function fillDataSysGTable(dataSys) {
            vm.gridSysGOptions = kendoConfig.getGridOptions({
                autoBind: true,
                scrollable: false,
                resizable: true,
                editable: false,
                sortable: false,
                serverPaging: true,
                dataBinding: function() {
                    recordSys = (this.dataSource.page() -1) * this.dataSource.pageSize();
                },
                reorderable: true,
                dataSource:{
                    serverPaging: true,
                    schema: {
                        total: (response)=>response.total,
                    data: (response)=> response.data
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
                noRecords : gettextCatalog.getString("<div style='margin:5px'>Không có kết quả hiển thị</div>")
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
                template: (dataItem)=> $("#sysGGrid").data("kendoGrid").dataSource.indexOf(dataItem)+ 1+($("#sysGGrid").data("kendoGrid").dataSource.page()-1)*$("#sysGGrid").data("kendoGrid").dataSource.pageSize(),
                width: '5%',
                headerAttributes: {
                style: "text-align:center; font-weight: bold",
                    translate:""
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
                    '			<i id="#=code#" ng-click="caller.selectSysGroupItemLv2(dataItem)" class="fa fa-check color-green #=code#" aria-hidden="true"></i> ' +
                    '		</a>'
                    + '</div>',
                headerAttributes: {
                    style: "text-align:center;"
                }
            }]
        });
        }

        vm.selectSysGroupItemLv2 = function(dataItem){
            vm.addForm.sysGroupNameLv2 = dataItem.name;
            vm.addForm.sysGroupIdLv2 = dataItem.sysGroupId;
            CommonService.dismissPopup1() ;
        }

        vm.doSearchSysGroupPopup = function(){
            var grid = vm.sysGGrid;
            if(grid){
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        }

        vm.selectedSysGroupLv3 = false;
        vm.sysGroupLv3Options = {
            dataTextField: "name",
            select: function(e) {
                vm.selectedSysGroupLv3 = true;
                var dataItem = this.dataItem(e.item.index());
                vm.addForm.sysGroupNameLv3 = dataItem.name;
                vm.addForm.sysGroupIdLv3 = dataItem.sysGroupId;
            },
            pageSize: 10,
            open: (e)=>{
            vm.selectedSysGroupLv3 = false;
            },
                dataSource: {
                    serverFiltering: true,
                        transport: {
                        read: (options)=> {
                            vm.selectedSysGroupLv3 = false;
                            return Restangular.all("dataDamageRsServiceRest/getSysGroup").post({
                                pageSize: 15,
                                page: 1,
                                keySearch: $("#sysGroupIdLv3").val().trim(),
                                groupLevelLst: [3],
                                sysGroupId2: vm.addForm.sysGroupIdLv2
                            }).then((response)=> {
                                options.success(response.data);
                        }).catch((err)=> {
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
                    change: (e)=> {

                    if (!vm.selectedSysGroupLv3) {
                        vm.addForm.sysGroupIdLv3 = null;
                        vm.addForm.sysGroupNameLv3 = null;
                    }
                },
                ignoreCase: false
            }

        vm.selectSysGroupLv3 = function(){
            var teamplateUrl = "ktnb/dataDamage/sysGroupPopupLv3.html";
            var title = CommonService.translate("Lựa chọn đơn vị");
            var windowId = "SELECT_SYS_GROUP_LV3";
            vm.objSearchGLv3 = {};
            vm.objSearchGLv3.groupLevelLst = [3];
            vm.objSearchGLv3.sysGroupId2 = vm.addForm.sysGroupIdLv2;
            fillDataSysGLv3Table(vm.objSearchGLv3);
            CommonService.populatePopupCreate(teamplateUrl, title, null, vm, windowId, null, '60%', '60%', 'changepopupSys');
        }

        var recordSys = 0;
        function fillDataSysGLv3Table(dataSys) {
            vm.gridSysGLv3Options = kendoConfig.getGridOptions({
                    autoBind: true,
                    scrollable: false,
                    resizable: true,
                    editable: false,
                    sortable: false,
                    serverPaging: true,
                    dataBinding: function() {
                        recordSys = (this.dataSource.page() -1) * this.dataSource.pageSize();
                    },
                    reorderable: true,
                    dataSource:{
                        serverPaging: true,
                        schema: {
                            total: (response)=>response.total,
                        data: (response)=> response.data
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
                noRecords : gettextCatalog.getString("<div style='margin:5px'>Không có kết quả hiển thị</div>")
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
                template: (dataItem)=> $("#sysGGridLv3").data("kendoGrid").dataSource.indexOf(dataItem)+ 1+($("#sysGGridLv3").data("kendoGrid").dataSource.page()-1)*$("#sysGGridLv3").data("kendoGrid").dataSource.pageSize(),
                width: '5%',
                headerAttributes: {
                style: "text-align:center; font-weight: bold",
                    translate:""
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
                '			<i id="#=code#" ng-click="caller.selectSysGroupItemLv3(dataItem)" class="fa fa-check color-green #=code#" aria-hidden="true"></i> ' +
                '		</a>'
                + '</div>',
                    headerAttributes: {
                style: "text-align:center;"
            }
            }]
        });
        }

        vm.selectSysGroupItemLv3 = function(dataItem){
            vm.addForm.sysGroupNameLv3 = dataItem.name;
            vm.addForm.sysGroupIdLv3 = dataItem.sysGroupId;
            CommonService.dismissPopup1();
        }

        vm.doSearchSysGroupPopupLv3 = function(){
            var grid = vm.sysGGridLv3;
            if(grid){
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        }

        // ps Search
        vm.selectedSysGroup = false;
        vm.sysGroupPsSearchOptions = {
            clearButton: false,
            dataTextField: "name",
            select: function(e) {
                vm.selectedSysGroup = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchForm.sysGroupNamePs = dataItem.name;
                vm.searchForm.sysGroupIdPs = dataItem.sysGroupId;
            },
            pageSize: 10,
            open: (e)=>{
            vm.selectedSysGroup = false;
    },
        dataSource: {
            serverFiltering: true,
                transport: {
                read: (options)=> {
                    vm.selectedSysGroup = false;
                    return Restangular.all("dataDamageRsServiceRest/getSysGroup").post({
                        pageSize: 15,
                        page: 1,
                        keySearch: $("#searchDataDamageSysGroupPs").val().trim(),
                        groupLevelLst: [2, 3]
                    }).then((response)=> {
                        options.success(response.data);
                }).catch((err)=> {
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
            change: (e)=> {

            if (!vm.selectedSysGroup) {
                vm.searchForm.sysGroupIdPs = null;
                vm.searchForm.sysGroupNamePs = null;
            }
        },
        ignoreCase: false
    }

        // ps Insert
        vm.selectedSysGroupPsInsert = false;
        vm.sysGroupPsInsertOptions = {
            clearButton: false,
            dataTextField: "name",
            select: function(e) {
                vm.selectedSysGroupPsInsert = true;
                var dataItem = this.dataItem(e.item.index());
                vm.addForm.sysGroupNamePs = dataItem.name;
                vm.addForm.sysGroupIdPs = dataItem.sysGroupId;
                vm.addForm.areaCode = dataItem.areaCode;
            },
            pageSize: 10,
            open: function(e) {
                vm.selectedSysGroupPsInsert = false;
            },
            dataSource: {
                serverFiltering: true,
                    transport: {
                    read: function(options) {
                        vm.selectedSysGroupPsInsert = false;
                        return Restangular.all("dataDamageRsServiceRest/getSysGroup").post({
                            pageSize: 15,
                            page: 1,
                            keySearch: $("#insertDataDamageSysGroupPs").val().trim(),
                            groupLevelLst: [2, 3]
                        }).then(function(response) {
                            options.success(response.data);
                    }).catch(function(err) {
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
            change: function(e) {
                if (!vm.selectedSysGroupPsInsert) {
                    vm.addForm.sysGroupIdPs = null;
                    vm.addForm.sysGroupNamePs = null;
                    vm.addForm.areaCode = null;
                }
            },
            ignoreCase: false
        }

        // ph Insert
        vm.selectedSysGroupPhInsert = false;
        vm.sysGroupPhInsertOptions = {
            clearButton: false,
            dataTextField: "name",
            select: function(e) {
                vm.selectedSysGroupPhInsert = true;
                var dataItem = this.dataItem(e.item.index());
                vm.addForm.sysGroupNamePh = dataItem.name;
                vm.addForm.sysGroupIdPh = dataItem.sysGroupId;
            },
            pageSize: 10,
            open: function(e) {
                vm.selectedSysGroupPhInsert = false;
            },
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function(options) {
                        vm.selectedSysGroupPhInsert = false;
                        return Restangular.all("dataDamageRsServiceRest/getSysGroup").post({
                            pageSize: 15,
                            page: 1,
                            keySearch: $("#insertDataDamageSysGroupPh").val().trim(),
                            groupLevelLst: [2, 3]
                        }).then(function(response) {
                            options.success(response.data);
                        }).catch(function(err) {
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
            change: function(e) {
                if (!vm.selectedSysGroupPhInsert) {
                    vm.addForm.sysGroupIdPh = null;
                    vm.addForm.sysGroupNamePh = null;
                }
            },
            ignoreCase: false
        }

        // responible sysGroup Insert
        vm.selectedSysGroupResponseInsert = false;
        vm.sysGroupResponsibleInsertOptions = {
            clearButton: false,
            dataTextField: "name",
            select: function(e) {
                vm.selectedSysGroupResponseInsert = true;
                var dataItem = this.dataItem(e.item.index());
                vm.addForm.sysGroupResponsibleName = dataItem.name;
                vm.addForm.sysGroupResponsibleId = dataItem.sysGroupId;
            },
            pageSize: 10,
            open: function(e) {
                vm.selectedSysGroupResponseInsert = false;
            },
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function(options) {
                        vm.selectedSysGroupResponseInsert = false;
                        return Restangular.all("dataDamageRsServiceRest/getSysGroup").post({
                            pageSize: 15,
                            page: 1,
                            keySearch: $("#insertDataDamageSysGroupResponsible").val().trim(),
                            groupLevelLst: [2, 3]
                        }).then(function(response) {
                            options.success(response.data);
                        }).catch(function(err) {
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
            change: function(e) {
                if (!vm.selectedSysGroupResponseInsert) {
                    vm.addForm.sysGroupResponsibleId = null;
                    vm.addForm.sysGroupResponsibleName = null;
                }
            },
            ignoreCase: false
        }

        // together sysGroup Insert
        vm.selectedSysGroupTogetherInsert = false;
        vm.sysGroupTogetherInsertOptions = {
            clearButton: false,
            dataTextField: "name",
            select: function(e) {
                vm.selectedSysGroupTogetherInsert = true;
                var dataItem = this.dataItem(e.item.index());
                vm.addForm.sysGroupTogetherName = dataItem.name;
                vm.addForm.sysGroupTogetherId = dataItem.sysGroupId;
            },
            pageSize: 10,
            open: function(e) {
                vm.selectedSysGroupTogetherInsert = false;
            },
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function(options) {
                        vm.selectedSysGroupTogetherInsert = false;
                        return Restangular.all("dataDamageRsServiceRest/getSysGroup").post({
                            pageSize: 15,
                            page: 1,
                            keySearch: $("#insertDataDamageSysGroupTogether").val().trim(),
                            groupLevelLst: [2, 3]
                        }).then(function(response) {
                            options.success(response.data);
                        }).catch(function(err) {
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
            change: function(e) {
                if (!vm.selectedSysGroupTogetherInsert) {
                    vm.addForm.sysGroupTogetherId = null;
                    vm.addForm.sysGroupTogetherName = null;
                }
            },
            ignoreCase: false
        }

        vm.flagSysGroup = null;
        vm.selectSysGroup = function(data){
            vm.flagSysGroup = data;
            var teamplateUrl = "ktnb/dataDamage/sysGroupPopupSearch.html";
            var title = CommonService.translate("Lựa chọn đơn vị");
            var windowId = "SELECT_SYS_GROUP";
            vm.objSearchGSearch = {};
            vm.objSearchGSearch.groupLevelLst = [2,3];
            fillDataSysGSearchTable(vm.objSearchGSearch);
            CommonService.populatePopupCreate(teamplateUrl, title, null, vm, windowId, null, '60%', '60%', 'changepopupSys');
        }

        var recordSys = 0;
        function fillDataSysGSearchTable(dataSys) {
            vm.gridSysGSearchOptions = kendoConfig.getGridOptions({
                    autoBind: true,
                    scrollable: false,
                    resizable: true,
                    editable: false,
                    sortable: false,
                    serverPaging: true,
                    dataBinding: function() {
                        recordSys = (this.dataSource.page() -1) * this.dataSource.pageSize();
                    },
                    reorderable: true,
                    dataSource:{
                        serverPaging: true,
                        schema: {
                            total: (response)=>response.total,
                        data: (response)=> response.data
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
                noRecords : gettextCatalog.getString("<div style='margin:5px'>Không có kết quả hiển thị</div>")
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
                template: (dataItem)=> $("#sysGGridSearch").data("kendoGrid").dataSource.indexOf(dataItem)+ 1+($("#sysGGridSearch").data("kendoGrid").dataSource.page()-1)*$("#sysGGridSearch").data("kendoGrid").dataSource.pageSize(),
                width: '5%',
                headerAttributes: {
                style: "text-align:center; font-weight: bold",
                    translate:""
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

        vm.selectSysGroupItemSearch = function(dataItem){
            if (vm.flagSysGroup == 'psSearch') {
                vm.searchForm.sysGroupNamePs = dataItem.name;
                vm.searchForm.sysGroupIdPs = dataItem.sysGroupId;
            } else if (vm.flagSysGroup == 'psInsert') {
                vm.addForm.sysGroupNamePs = dataItem.name;
                vm.addForm.sysGroupIdPs = dataItem.sysGroupId;
                vm.addForm.areaCode = dataItem.areaCode;
            } else if (vm.flagSysGroup == 'phInsert') {
                vm.addForm.sysGroupNamePh = dataItem.name;
                vm.addForm.sysGroupIdPh = dataItem.sysGroupId;
            } else if (vm.flagSysGroup == 'responeSysGroupInsert') {
                vm.addForm.sysGroupResponsibleName = dataItem.name;
                vm.addForm.sysGroupResponsibleId = dataItem.sysGroupId;
            } else if (vm.flagSysGroup == 'togetherSysGroupInsert') {
                vm.addForm.sysGroupTogetherName = dataItem.name;
                vm.addForm.sysGroupTogetherId = dataItem.sysGroupId;
            }

            CommonService.dismissPopup1();
        }

        vm.doSearchSysGroupSearchPopup = function(){
            var grid = vm.sysGGridSearch;
            if(grid){
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        }

        vm.exportFileDownload = function (name) {
            Restangular.all("dataDamageRsServiceRest/exportExcel").post({fileName: name}).then(function (d) {
                data = d.plain();
                window.location = Constant.BASE_SERVICE_URL + "fileservice/downloadFileATTT?" + data.fileName;
            }).catch(function () {
                toastr.error(CommonService.translate("Lỗi khi export!"));
                return;
            });
        }

        vm.exportexcel= function(){
            Restangular.all("dataDamageRsServiceRest/getListDD").post({}).then(function (d) {
                var obj = {};
                obj.listId = d.listId;
                obj.sysUserId = d.createBy;
                obj.sysGroupId = vm.searchForm.sysGroupIdPs;
                obj.statusDv = vm.searchForm.statusDv;
                obj.riskType = vm.searchForm.riskType;
                obj.statusApprovedDv = vm.searchForm.statusApprovedDv;
                obj.timeDetectFrom = vm.searchForm.timeDetectFrom;
                obj.timeDetectTo = vm.searchForm.timeDetectTo;
                obj.statusKtnb = vm.searchForm.statusKtnb;
                obj.remediesDateFrom = vm.searchForm.remediesDateFrom;
                obj.remediesDateTo = vm.searchForm.remediesDateTo;
                obj.statusApprovedKtnb = vm.searchForm.statusApprovedKtnb;
                obj.statusDamage = vm.searchForm.statusDamage;
                obj.reportType="EXCEL";
                obj.reportName="BaoCaoThuThapDuLieuTonThat";
                var date = kendo.toString(new Date((new Date()).getTime()),"dd-MM-yyyy");
                CommonService.exportReport(obj).then(
                    function(data) {
                        var binarydata= new Blob([data],{ type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
                        kendo.saveAs({dataURI: binarydata, fileName: date + "_BaoCaoThuThapDuLieuTonThat" + '.xlsx'});
                    }, function(errResponse) {
                        toastr.error(CommonService.translate("Lỗi không export EXCEL được!"));
                    });
            }).catch(function () {
                toastr.error(CommonService.translate("Lỗi khi export!"));
                return;
            });

        }

        // check date
        vm.checkValidateTimeDetect = function(){
            var d = kendo.parseDate(vm.addForm.timeDetect, "dd/MM/yyyy");
            if (d == null){
                vm.addForm.timeDetect = '';
                toastr.error("Thời gian phát hiện không hợp lệ");
                $("#insertDataDamageTimeDetect").focus();
                return ;
            }
        }
        vm.checkValidateTimeHappened = function(){
            var d = kendo.parseDate(vm.addForm.timeHappened, "dd/MM/yyyy");
            if (d == null){
                vm.addForm.timeHappened = '';
                toastr.error("Thời gian xảy ra không hợp lệ");
                $("#insertDataDamageTimeHappened").focus();
                return ;
            }
        }
        vm.checkValidateTimeDetectFrom = function(){
            var d = kendo.parseDate(vm.searchForm.timeDetectFrom, "dd/MM/yyyy");
            if (d == null){
                vm.searchForm.timeDetectFrom = '';
                toastr.error("Thời gian phát hiện không hợp lệ");
                $("#searchDataDamageTimeDetectFrom").focus();
                return ;
            }
        }
        vm.checkValidateTimeDetectTo = function(){
            var d = kendo.parseDate(vm.searchForm.timeDetectTo, "dd/MM/yyyy");
            if (d == null){
                vm.searchForm.timeDetectTo = '';
                toastr.error("Thời gian phát hiện không hợp lệ");
                $("#searchDataDamageTimeDetectTo").focus();
                return ;
            }
        }
        vm.checkValidateRemediesDateFrom = function(){
            var d = kendo.parseDate(vm.searchForm.remediesDateFrom, "dd/MM/yyyy");
            if (d == null){
                vm.searchForm.remediesDateFrom = '';
                toastr.error("Thời gian khắc phục không hợp lệ");
                $("#searchDataDamageRemediesDateFrom").focus();
                return ;
            }
        }
        vm.checkValidateRemediesDateTo = function(){
            var d = kendo.parseDate(vm.searchForm.remediesDateTo, "dd/MM/yyyy");
            if (d == null){
                vm.searchForm.remediesDateTo = '';
                toastr.error("Thời gian khắc phục không hợp lệ");
                $("#searchDataDamageRemediesDateTo").focus();
                return ;
            }
        }
        vm.checkValidateRemediesDateInsert = function(){
            var d = kendo.parseDate(vm.addForm.remediesDate, "dd/MM/yyyy");
            if (d == null){
                vm.addForm.remediesDate = '';
                toastr.error("Thời gian khắc phục không hợp lệ");
                $("#insertDataDamageRemediesDate").focus();
                return ;
            }
        }

        vm.changeRiskTypeInsert = function () {
            vm.reasonTypeOptions = [];
            Restangular.all("commonRsService/getByParType").post({parType: 'REASON_TYPE', optionNumber: vm.addForm.riskType}).then(function(res){
                for (var i = 0; i < res.length; i++) {
                    var obj = {
                        code: res[i].code,
                        name: res[i].name
                    }
                    vm.reasonTypeOptions.push(obj);
                }
            });
            vm.addForm.reasonType = null;
        }
        
        // file dinh kem
        vm.fillFileTable =fillFileTable;
        function fillFileTable(data) {
            var dataSource = new kendo.data.DataSource({
                data: data,
                pageSize : 5
            });
            vm.gridFileOptions = kendoConfig.getGridOptions({
                autoBind: true,
                scrollable: false,
                resizable: true,
                editable: false,
                dataSource : dataSource,
                messages: {
                    noRecords: gettextCatalog.getString(CommonService.translate("Không có kết quả hiển thị"))
                },
                pageable: {
                    refresh: false,
                    pageSizes: [10, 15, 20, 25],
                    messages: {
                        display: CommonService.translate("{0}-{1} của {2} kết quả"),
                        itemsPerPage: CommonService.translate("kết quả/trang") ,
                        empty: CommonService.translate("Không có kết quả hiển thị")
                    }
                },
                columns: [
                    {
                        title: CommonService.translate("STT"),
                        field: "stt",
                        template: dataItem => $("#dataDamageFileGrid").data("kendoGrid").dataSource.indexOf(dataItem) + 1,
                    width: '10%',
                    columnMenu: false,
                    headerAttributes: {style: "text-align:center;font-weight: bold;" ,translate:""},
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
                    headerAttributes: {style: "text-align:center;font-weight: bold;" ,translate:""},
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
                headerAttributes: {style: "text-align:center;font-weight: bold;" ,translate:""},
                attributes: {
                    style: "text-align:left;"
                },
                type: 'text',
                    editable: false,
            },
            {
                title: CommonService.translate("Người upload"),
                    field: 'createdUserName',
                width: '20%',
                headerAttributes: {style: "text-align:center;font-weight: bold;" ,translate:""},
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
                    translate:""
            },
                hidden: vm.showButtonConfirmGD3 || vm.viewInfo,
                template: dataItem =>
                '<div class="text-center #=utilAttachDocumentId#""> ' +
                '<button style=" border: none; "  class="#=utilAttachDocumentId# icon_table" uib-tooltip="Xóa" ng-click="caller.removeRowFile(dataItem)"  translate>  ' +
                '<i style="color: steelblue;" class="fa fa-trash" ria-hidden="true"></i>' +
                '</button>' +
                '</div>',
                    width: '10%',
                field: "acctions"
            }

        ]
        });
        }

        vm.dataFile = [];
        // Xóa file đính kèm
        vm.removeRowFile = removeRowFile;
        function removeRowFile(dataItem) {
            confirm(CommonService.translate("Xác nhận xóa"), function () {
                $('#dataDamageFileGrid').data('kendoGrid').dataSource.remove(dataItem);
                vm.dataFile.splice(dataItem, 0);
            })
        }

        vm.downloadFile = downloadFile;
        function downloadFile(obj) {
            window.location = Constant.BASE_SERVICE_URL + "fileservice/downloadFileATTT?" + obj.filePath;
        }

        vm.onSelect = function (e) {
            if ($("#dataDamageFiles")[0].files[0].size > 52428800) {
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
            if ($("#dataDamageFiles")[0].files[0].name.split('.').pop() != 'pdf' && $("#dataDamageFiles")[0].files[0].name.split('.').pop() != 'doc'
                && $("#dataDamageFiles")[0].files[0].name.split('.').pop() != 'docx' && $("#dataDamageFiles")[0].files[0].name.split('.').pop() != 'png'
                && $("#dataDamageFiles")[0].files[0].name.split('.').pop() != 'jpg') {
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
            if(vm.dataFile != null){
                for(var h=0; h < vm.dataFile.length; h++){
                    if(vm.dataFile[h].name == $("#dataDamageFiles")[0].files[0].name){
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
            jQuery.each(jQuery('#dataDamageFiles')[0].files, function (i, file) {
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
                        vm.dataFile = $("#dataDamageFileGrid").data().kendoGrid.dataSource.data();
                        var obj = {};
                        obj.name = file.name;
                        obj.filePath = data[index];
                        obj.createdDate = kendo.toString(new Date((new Date()).getTime()),"dd/MM/yyyy");
                        obj.createdUserId = Constant.user.VpsUserInfo.sysUserId;
                        obj.createdUserName = Constant.user.VpsUserInfo.fullName;
                        vm.dataFile.push(obj);
                    })

                    refreshGrid(vm.dataFile);
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
            var grid = vm.dataDamageFileGrid;
            if (grid) {
                grid.dataSource.data(d);
                grid.refresh();
            }
        }

        vm.changeValueDamage = function () {
            vm.addForm.valueDamageOrigin = vm.addForm.valueDamage - vm.addForm.valueRemedies;
        }


        var modal = null;
        vm.openPopupConfig = function () {
            var templateUrl = "ktnb/popup/popupCommonSearch.html";
            var title = CommonService.translate("Tìm kiếm cấu hình dữ liệu tổn thất");
            var windowId = "POPUP_SELECT_DATA_DAMAGE_CONFIG";
            vm.placeHolder = CommonService.translate("Tên/Nội dung");
            CommonService.populatePopupCreate(templateUrl, title, null, vm, windowId, null, '60%', '50%', null);
            setTimeout(function () {
                modal = CommonService.getModalInstance1();
            }, 100);
            vm.commonPopupSearch = {status: 1};
            var api = "dataDamageConfigRsService/doSearch";
            CommonService.fillDataPopupCommonSearch(api, vm.commonPopupSearch, configColumns, vm);
        }

        var configColumns = [
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
                title: CommonService.translate("Tên dữ liệu tổn thất"),
                field: 'name',
                width: "20%",
                headerAttributes: {
                    style: "text-align:center;", translate: "",
                },
                attributes: {
                    style: "text-align:left; white-space: normal"
                },
            }, {
                title: CommonService.translate("Nội dung"),
                field: 'description',
                width: "40%",
                headerAttributes: {
                    style: "text-align:center;", translate: "",
                },
                attributes: {
                    style: "text-align:left; white-space: normal"
                },
            }, {
                title: CommonService.translate("Chọn"),
                field: 'choose',
                width: "10%",
                template:
                    '<div class="text-center "> ' +
                    '	<a  type="button" class=" icon_table" uib-tooltip="Chọn" translate>' +
                    '	   <i ng-click="caller.saveConfig(dataItem)" class="fa fa-check color-green" aria-hidden="true"></i> ' +
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

        vm.saveConfig = function (dataItem) {
            vm.addForm.name = dataItem.name;
            vm.addForm.dataDamageConfigId = dataItem.dataDamageConfigId;
            modal.dismiss();
        }

        vm.doSearchCommonPopup = function () {
            var grid = $("#commonSearchPopupGrid").data("kendoGrid");
            if (grid) {
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        }
        // end controller
    }
})();
