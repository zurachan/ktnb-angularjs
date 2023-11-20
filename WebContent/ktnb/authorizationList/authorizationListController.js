(function () {
    'use strict';
    var controllerId = 'authorizationListController';

    angular.module('MetronicApp').controller(controllerId, authorizationListController);
    function authorizationListController($scope, $http,$timeout,$rootScope, $log,Constant,Restangular,CommonService,kendoConfig,$kWindow,authorizationListService,RestEndpoint,gettextCatalog) {
        var vm = this;
        var modalPopup,modalReject;
        vm.listAuthorizationExportTemp = [];
        vm.modalBody = ".k-widget.k-window";
        vm.documentBody = $(".tab-content");
        vm.checkall=false;
        vm.listData=[];
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

            vm.signTypeArray = [
                {id: 1, name: "Ký VO"},
                {id: 2, name: "Ký cứng"}
            ];
            vm.dataList=[];
            // vm.identificationTypeArray = [
            //     {id: 1, name: "Thường xuyên"},
            //     {id: 2, name: "Theo vụ việc/Phát sinh"}
            // ];
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

            authorizationListService.doSearch(obj).then(function (d) {
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
                toolbar: [
                    {
                        name: "actions",
                        template: '<div class=" pull-left ">' +
                            '<button  type="button" class="btn btn-qlk padding-search-right addQLK ng-scope" style="width: 120px" ng-click="vm.openAdd()">Tạo mới'+
                            '</button>' +
                            '<button  class="btn btn-qlk padding-search-right ng-scope" style="width: 120px" ng-click="vm.flashCloseWork()">Đóng việc' +
                            '</button>' +
                            '</div>' +
                            // right
                            '<div class="btn-group pull-right margin_top_button margin_right10">' +
                            '<i data-toggle="dropdown" class="tooltip1" aria-expanded="false">' +
                            '<span class="tooltipArrow"></span>' +
                            '<span class="tooltiptext">Cài đặt</span>' +
                            '<i class="fa fa-cog" aria-hidden="true"></i>' +
                            '</i>' +
                            '<i class="tooltip1 action-button excelQLK" ng-click="vm.exportFile()" aria-hidden="true"><span class="tooltipArrow"></span><span class="tooltiptext">Xuất Excel</span></i>' +
                            '<div class="dropdown-menu hold-on-click dropdown-checkboxes" role="menu">' +
                            '<label ng-repeat="column in vm.authorizationGrid.columns.slice(1,vm.authorizationGrid.columns.length) | filter: vm.gridColumnShowHideFilter">' +
                            '<input type="checkbox" ng-checked="!column.hidden" ng-click="vm.showHideColumnDetail(column, 1)"> {{column.title}}' +
                            '</label>' +
                            '</div>' +
                            '</div>'
                    }
                ],
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
                            url:  Constant.BASE_SERVICE_URL + "authorizationRsService/doSearch",
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
                        title: "<input id='checkall' type='checkbox' ng-click='vm.addListChoiseAll(dataItem)' ng-model='vm.checkall'/>",
                        template: "<input type='checkbox' ng-if='dataItem.statusWo == 2 && dataItem.statusClosed == 0' ng-click='vm.addListChoise(dataItem)' ng-model='dataItem.selected'/>",
                        width: "45px",
                        headerAttributes: {style: "text-align:center;", translate:""},
                        attributes: {style: "text-align:center;", translate:""}
                    },
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
                        field: "paperAuthNo",
                        title: CommonService.translate("Số ủy quyền"),
                        hidden: false,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center"},
                        width: "120px",

                    },
                    {
                        field: "uqSysGroupName",
                        title: CommonService.translate("Đơn vị nhận việc"),
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
                            style: "text-align: center;white-space:normal; font-weight: bold;"
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
                        field: "dateRelease",
                        title: CommonService.translate("Ngày ban hành"),
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

                    }, {
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
                                '<button ng-if="dataItem.statusWo == 0 && dataItem.status == 1" style=" border: none; background-color: white;"' +
                                'class="#=authorizationId# icon_table"  uib-tooltip="Sửa" translate ng-click="vm.openEdit(dataItem)" >' +
                                '<i  style="color:#f1c40f;" class="fa fa-pencil " aria-hidden="true"></i>' +
                                '</button>' +
                                '<button ng-if="dataItem.statusWo == 2 && dataItem.statusClosed == 0" style=" border: none; background-color: white;"' +
                                'class="#=authorizationId# icon_table"  uib-tooltip="Đóng việc" translate ng-click="vm.openCloseWork(dataItem)" >' +
                                '<i  style="color:green;" class="fa fa-check " aria-hidden="true"></i>' +
                                '</button>' +
                                '<button ng-if="dataItem.extensionRequest == 1 && dataItem.statusClosed != 1 " style=" border: none; background-color: white;"' +
                                'class="#=authorizationId# icon_table"  uib-tooltip="Gia hạn thời gian" translate ng-click="vm.openExtensionRequest(dataItem)" >' +
                                '<i  style="color:blueviolet;" class="fa fa-repeat " aria-hidden="true"></i>' +
                                '</button>' +
                                '<button ng-if="dataItem.statusWo == 0 && dataItem.status == 1" style=" border: none; background-color: white;" class="#=authorizationId# icon_table ng-scope" uib-tooltip="Xóa" translate="" ' +
                                'ng-click="vm.remove(dataItem)" > <i style="color:steelblue;" class="fa fa-trash ng-scope" aria-hidden="true"></i>' +
                                '</button>'+
                                '</div>'
                            )
                        },
                        width: "150px"
                    }
                ],
            });
        }

        vm.addListChoiseAll=(dataItem)=>{
            let listDataGridD = vm.authorizationGrid.dataSource._data;
            if(vm.checkall){
                vm.listDataSelected = [];
                for(let i=0;i < listDataGridD.length;i++){
                    if (listDataGridD[i].statusWo == 2 &&  listDataGridD[i].statusClosed == 0){
                        listDataGridD[i].selected=true;
                        vm.listDataSelected.push(listDataGridD[i]);
                    }
                }
                vm.listData=vm.listDataSelected;
            }else{
                for(let i=0;i < listDataGridD.length;i++){
                    listDataGridD[i].selected=false;
                }
                vm.listData=[];
            }
        };

        vm.addListChoise = (dataItem)=>{
            let listDataGridD = vm.authorizationGrid.dataSource._data;

            if(dataItem.selected){
                vm.listData.push(dataItem);
                if (listDataGridD.length == vm.listData.length){
                    vm.checkall =true;
                }
            }else{
                vm.checkall =false;
                vm.listData.splice(vm.listData.indexOf(dataItem),1);
            }
        }

        vm.doSearch = doSearch;
        function doSearch() {
            if ($('.k-invalid-msg').is(':visible')) {
                return;
            }
            vm.listData=[];
            vm.checkall=false;
            console.log(vm.searchForm);
            var grid = vm.authorizationGrid;
            CommonService.doSearchGrid(grid,{pageSize: grid.dataSource.pageSize()});
        };

        vm.openAdd = function () {
            vm.addForm = {};
            vm.listUqPeople = [];
            vm.uqUserForm = {};
            vm.typeCreate = 'add';
            var templateUrl = 'ktnb/authorizationList/addPopup.html';
            var title = "Thêm mới";
            modalPopup = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "70%", initDataAddFunction, null);
        };

        function initDataAddFunction() {
            $("#authorizationList_add_popupId").click(function (e) {
                console.log(vm.addForm);
            });
            setTimeout(function () {
                $(".k-icon .k-clear-value .k-i-close").remove();
            }, 10);
        }

        vm.openEdit = function (dataItem) {
            vm.addForm = {};
            vm.listUqPeople = [];
            authorizationListService.getDetail(dataItem).then(function (data) {
                vm.addForm = angular.copy(data);
                vm.typeCreate = 'edit';
                var templateUrl = 'ktnb/authorizationList/addPopup.html';
                var title = "Chỉnh sửa ";
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
                    vm.listUqPeople.push(obj);
                    vm.uqPeopleListGrid.dataSource.data(vm.listUqPeople);
                    vm.uqPeopleListGrid.refresh();
                },100);
            }, function () {
                toastr.error(CommonService.translate("Có lỗi xảy ra"));
            });
        };

        vm.showDetail = function (dataItem) {
            $("#authorizationList_add_popupId").click(function (e) {
                console.log(vm.detailForm);
            });
            authorizationListService.getDetail(dataItem).then(function (data) {
                vm.detailForm = angular.copy(data);
                vm.typeCreate = 'detail';
                var templateUrl = 'ktnb/authorizationList/detailPopup.html';
                var title = "Chi tiết công việc";
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
                    authorizationListService.getListAttachedFile({
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
                    vm.listUqPeople.push(obj);
                    vm.uqPeopleListGrid.dataSource.data(vm.listUqPeople);
                    vm.uqPeopleListGrid.refresh();
                },100);
            }, function () {
                toastr.error(CommonService.translate("Có lỗi xảy ra"));
            });
        }

        vm.openCloseWork = function (dataItem) {
            $("#authorizationList_add_popupId").click(function (e) {
                console.log(vm.closeForm);
            });
            // getIdentificationType();
            authorizationListService.getDetail(dataItem).then(function (data) {
                vm.closeForm = angular.copy(data);
                vm.typeCreate = 'closeWork';
                var templateUrl = 'ktnb/authorizationList/closeWorkPopup.html';
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
                    // fillFileTable([]);
                    authorizationListService.getListAttachedFile({
                        objectId: vm.closeForm.authorizationId,
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
                    vm.listUqPeople.push(obj);
                    vm.uqPeopleListGrid.dataSource.data(vm.listUqPeople);
                    vm.uqPeopleListGrid.refresh();
                },100);
            }, function () {
                toastr.error(CommonService.translate("Có lỗi xảy ra"));
            });
        };

        vm.flashCloseWork = function () {
            let obj = {};
            obj.listUqPeople = vm.listData ;
            if (vm.listData.length == 0){
                toastr.warning("Không có bản ghi nào được chon !");
                return;
            }
            kendo.ui.progress(vm.documentBody, true);
            Restangular.all("authorizationRsService/flashCloseWork").post(obj).then(function(response){
                kendo.ui.progress(vm.documentBody, false);
                if (response && response.error){
                    toastr.error(response.error);
                }else {
                    toastr.success("Đóng thành công");
                    vm.doSearch();
                }
            }).catch(function (err) {
                kendo.ui.progress(vm.documentBody, false);
                console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
            });

        };

        vm.openExtensionRequest = function (dataItem) {
            $("#authorizationList_add_popupId").click(function (e) {
                console.log(vm.extensionForm);
            });
            authorizationListService.getDetail(dataItem).then(function (data) {
                vm.extensionForm = angular.copy(data);
                vm.typeCreate = 'extensionRequest';
                var templateUrl = 'ktnb/authorizationList/extensionRequestPopup.html';
                var title = "Gia hạn";
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
                    vm.listUqPeople.push(obj);
                    vm.uqPeopleListGrid.dataSource.data(vm.listUqPeople);
                    vm.uqPeopleListGrid.refresh();
                },100);
            }, function () {
                toastr.error(CommonService.translate("Có lỗi xảy ra"));
            });
        };
        vm.saveItem = function () {
            if (vm.typeCreate === 'add' || vm.typeCreate === 'edit'){
                let obj = vm.addForm;
                if (obj.typeCreate == null || obj.typeCreate == "" ){
                    toastr.error(CommonService.translate("Chưa chọn Kiểu tạo "));
                    return;
                }
                if (obj.startDate == null) {
                    toastr.error(CommonService.translate("Ngày hiệu lực bắt đầu không được để trống"));
                    $("#authorization_startDate_addForm").focus();
                    return;
                }
                if (obj.closeDate == null) {
                    toastr.error(CommonService.translate("Ngày hiệu lực kết thúc không được để trống"));
                    $("#authorization_closeDate_addForm").focus();
                    return;
                }
                var d1 = kendo.parseDate(obj.startDate, "dd/MM/yyyy");
                var d2 = kendo.parseDate(obj.closeDate, "dd/MM/yyyy");
                var curdate = new Date();
                curdate.setHours(0, 0, 0, 0);
                var sysDate = kendo.parseDate(curdate, "dd/MM/yyyy");
                // if (d1 < sysDate) {
                //     toastr.error("Ngày hiệu lực bắt đầu  phải lớn hơn ngày hiện tại");
                //     $("#authorization_startDate_addForm").focus();
                //     return;
                // }
                // if (d2 < sysDate) {
                //     toastr.error("Ngày hiệu lực kết thúc phải lớn hơn ngày hiện tại");
                //     $("#authorization_closeDate_addForm").focus();
                //     return;
                // }
                obj.listUqPeople = vm.listUqPeople;
                if (vm.typeCreate === 'add'){
                    kendo.ui.progress($(vm.modalBody), true);
                    Restangular.all("authorizationRsService/save").post(obj).then(function(response){
                        kendo.ui.progress($(vm.modalBody), false);
                        if (response && response.error){
                            toastr.error(response.error);
                        }else {
                            toastr.success("Ghi lại thành công");
                            vm.doSearch();
                            modalPopup.close();
                        }
                    }).catch(function (err) {
                        kendo.ui.progress($(vm.modalBody), false);
                        console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
                    });

                }else if(vm.typeCreate === 'edit'){
                    if (obj.listUqPeople.length != 1){
                        toastr.error("Bắt buộc nhập 1 cá nhân được ủy quyền");
                        return;
                    }
                    obj.performerId = obj.listUqPeople[0].performerId;
                    obj.performerName =  obj.listUqPeople[0].performerName;
                    obj.uqPositionId =   obj.listUqPeople[0].uqPositionId;
                    obj.uqPositionName = obj.listUqPeople[0].uqPositionName;
                    obj.uqSysGroupId =   obj.listUqPeople[0].uqSysGroupId;
                    obj.uqSysGroupName = obj.listUqPeople[0].uqSysGroupName;
                    kendo.ui.progress($(vm.modalBody), true);
                    Restangular.all("authorizationRsService/edit").post(obj).then(function(response){
                        kendo.ui.progress($(vm.modalBody), false);
                        if (response && response.error){
                            toastr.error(response.error);
                        }else {
                            toastr.success("Ghi lại thành công");
                            vm.doSearch();
                            modalPopup.close();
                        }
                    }).catch(function (err) {
                        kendo.ui.progress(vm.documentBody, false);
                        console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
                    });
                }
            }else if (vm.typeCreate === 'closeWork'){
                let obj = vm.closeForm;
                kendo.ui.progress($(vm.modalBody), true);
                Restangular.all("authorizationRsService/closeWork").post(obj).then(function(response){
                    kendo.ui.progress($(vm.modalBody), false);
                    if (response && response.error){
                        toastr.error(response.error);
                    }else {
                        toastr.success("Ghi lại thành công");
                        vm.doSearch();
                        modalPopup.close();
                    }
                }).catch(function (err) {
                    kendo.ui.progress($(vm.modalBody), false);
                    console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
                });
            }  else if (vm.typeCreate === 'rejectCloseWork'){
                if (vm.rejectForm.rejectDescription == null || vm.rejectForm.rejectDescription == "" ){
                    toastr.warning("Bắt buộc nhập lý do từ chối!");
                }
                let obj = vm.closeForm;
                obj.rejectDescription = vm.rejectForm.rejectDescription;
                kendo.ui.progress($(vm.modalBody), true);
                Restangular.all("authorizationRsService/rejectCloseWork").post(obj).then(function(response){
                    kendo.ui.progress($(vm.modalBody), false);
                    if (response && response.error){
                        toastr.error(response.error);
                    }else {
                        toastr.success("Từ chối thành công");
                        vm.doSearch();
                        modalReject.close();
                        modalPopup.close();
                    }
                }).catch(function (err) {
                    kendo.ui.progress($(vm.modalBody), false);
                    console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
                });
            } else if (vm.typeCreate === 'extensionRequest'){
                let obj = vm.extensionForm;
                kendo.ui.progress($(vm.modalBody), true);
                Restangular.all("authorizationRsService/closeExtension").post(obj).then(function(response){
                    kendo.ui.progress($(vm.modalBody), false);
                    if (response && response.error){
                        toastr.error(response.error);
                    }else {
                        toastr.success("Ghi lại thành công");
                        vm.doSearch();
                        modalPopup.close();
                    }
                }).catch(function (err) {
                    kendo.ui.progress($(vm.modalBody), false);
                    console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
                });
            }
        };

        vm.rejectExtensionRequest = function() {
            let obj = vm.extensionForm;
            Restangular.all("authorizationRsService/rejectExtensionRequest").post(obj).then(function(response){
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

        /*
		 * đóng Popup
		 */
        vm.cancel = function () {
            $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
            // vm.doSearch();
            // modalPopupGood.cancel()
        }
        vm.cancelRejectPopup = function () {
            modalReject.close()
        }
        vm.remove = function (dataItem){
            var obj = {};
            obj.authorizationId = dataItem.authorizationId;
            kendo.ui.progress(vm.documentBody, true);
            confirm(CommonService.translate('Xác nhận xóa'), function () {
                Restangular.all("authorizationRsService/remove").post(obj).then(function(response){
                    kendo.ui.progress(vm.documentBody, false);
                    toastr.success(CommonService.translate("Xóa thành công!!"));
                    vm.doSearch();
                }).catch(function (err) {
                    kendo.ui.progress(vm.documentBody, false);
                    console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
                });
            })
        };

        vm.openRejectCloseWork = function (dataItem){
            // vm.extensionForm = angular.copy(dataItem);
            vm.rejectForm = {};
            vm.typeCreate = 'rejectCloseWork';
            var templateUrl = 'ktnb/authorizationList/rejectPopup.html';
            var title = "Từ chối đóng việc";
            modalReject = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "30%", null, null);
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
                groupLevelLst: ['2']
            };
            var api = "commonRsService/getSysGroupForAutoComplete";
            CommonService.fillDataPopupCommonSearch(api, vm.commonPopupSearch, sysGroupColumns, vm);
        }

        vm.saveSelectSysGroup = function (dataItem) {
            if (vm.flagSysGroup == 1) {
                vm.searchForm.uqSysGroupLv2Id = dataItem.sysGroupId;
                vm.searchForm.uqSysGroupLv2Code = dataItem.code;
                vm.searchForm.uqSysGroupLv2Name = dataItem.name;
            } else if (vm.flagSysGroup == 2) {
                vm.addForm.uqSysGroupLv2Id = dataItem.sysGroupId;
                vm.addForm.uqSysGroupLv2Code = dataItem.code;
                vm.addForm.uqSysGroupLv2Name = dataItem.name;
            }
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
        // * end popup common
        vm.uqPeopleListGridOptions = kendoConfig.getGridOptions({
            autoBind: false,
            scrollable: false,
            resizable: true,
            dataSource: {
                serverPaging: false,
                transport: {
                    create: function (options) {
                        options.success(options.data);
                    },
                    read: function (options) {
                        options.success(vm.listUqPeople);
                    },
                },
                pageSize: 10,
                schema: {
                    model: {
                        id: "fullName",
                        fields: {
                            sysRoleName: { type: "string" },
                        }
                    }
                }
            },
            editable: false,
            dataBinding: function () {
                record = (this.dataSource.page() - 1) * this.dataSource.pageSize();
            },
            reorderable: true,
            noRecords: true,
            columnMenu: false,
            messages: {
                noRecords: "<div style='margin:5px'>Không có kết quả hiển thị</div>"
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
            // columns: columns,
            toolbar: [
                {
                    name: "actions",
                    template: '<div ng-if="caller.typeCreate == \'add\' || caller.typeCreate == \'edit\' " class="col-md-4" style="text-align: right"><label>Chọn cá nhân được ủy quyền</label></div>'+
                        '<div ng-if="caller.typeCreate == \'add\' || caller.typeCreate == \'edit\' " class="col-md-5"><input class="form-control width100" type="text" k-options="caller.emailUqOptions" '+
                        'kendo-auto-complete   ng-model="caller.uqUserForm.keySearch" id="autoCompleteEmail"/></div>'
                }
            ],
            columns: [
                {
                    title: "TT",
                    field: "stt",
                    width: "5%",
                    headerAttributes: {style: "text-align:center;"},
                    attributes: {style: "text-align:center;"},
                    template: function (dataItem) {
                        return ++record;
                    },
                    editable: false
                },
                {
                    title: "Mã NV - Tên NV",
                    field: "performerName",
                    width: "20%",
                    headerAttributes: {style: "text-align:center;"},
                    attributes: {style: "text-align:left;white-space:normal;"},
                    editable: false,
                },
                {
                    title: "Đơn vị",
                    field: "uqSysGroupName",
                    width: "25%",
                    headerAttributes: {style: "text-align:center;"},
                    attributes: {style: "text-align:left;"},
                    type :"text",
                    editable: true
                },
                {
                    title: "Chức danh",
                    field: "uqPositionName",
                    width: "20%",
                    headerAttributes: {style: "text-align:center;"},
                    attributes: {style: "text-align:left;white-space:normal;"},
                    editable: false,
                },
                {
                    title: "Thao tác",
                    width: '15%',
                    field: "action",
                    editable: false,
                    template: function (dataItem) {
                        return '<div class="text-center">'
                            +
                            '<button ng-if="caller.typeCreate == \'add\' || caller.typeCreate == \'edit\' " style=" border: none; background-color: white;" class="#=appParamId# icon_table" ' +
                            'ng-click="caller.removeUqPeople(dataItem)" uib-tooltip="Xóa" translate>' +
                            '<i class="fa fa-trash" style="color: #337ab7;" aria-hidden="true"></i>' +
                            '</button>'
                            +
                            '</div>'
                    }
                }
            ]
        });

        vm.removeUqPeople = function(dataItem){
            if (vm.listUqPeople.length > 0) {
                for (var i = 0; i < vm.listUqPeople.length; i++) {
                    if (dataItem.employeeCode == vm.listUqPeople[i].employeeCode ) {
                        vm.listUqPeople.splice(i, 1);
                        refreshUqPeopleGrid(vm.listUqPeople);
                    }
                }
            }
        };

        function refreshUqPeopleGrid(d) {
            var grid = vm.uqPeopleListGrid;
            if (grid) {
                grid.dataSource.data(d);
                grid.refresh();
            }
        }

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

        vm.isSelectCodeReplaceAdd = false;
        vm.codeAuthReplaceOptions = {
            clearButton: false,
            dataTextField: "code", placeholder: CommonService.translate("Nhập mã"),
            dataValueField: "code",
            open: function (e) {
                vm.isSelectCodeReplaceAdd = false;
            },
            select: function (e) {
                vm.isSelectCodeReplaceAdd = true;
                var dataItem = this.dataItem(e.item.index());
                vm.addForm.authorizationOldId  = dataItem.authorizationId;
                vm.addForm.oldCode = dataItem.code;

            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectCodeReplaceAdd) {
                        vm.addForm.authorizationOldId = null;
                        vm.addForm.oldCode = null;
                    }
                }, 100);
            },
            close: function (e) {
                $timeout(function () {
                    if (vm.addForm.authorizationOldId == null) {
                        vm.addForm.authorizationOldId = null;
                        vm.addForm.oldCode = null;
                    }
                }, 1000);

            },
            pageSize: 10,
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        vm.isSelectCodeReplaceAdd = false;
                        return Restangular.all("authorizationRsService/getAuthorizationForAutoComplete").post(
                            {
                                keySearch: vm.addForm.oldCode,
                                listStatusWo: [0,1],
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
            template: '<div class="row" > #: data.code #</div> ',
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
                    // {
                    //     title: CommonService.translate("Xóa"),
                    //     headerAttributes: {
                    //         style: "text-align:center; font-weight: bold",
                    //         translate: ""
                    //     },
                    //     template: dataItem =>
                    //         '<div class="text-center #=utilAttachDocumentId#"> ' +
                    //         '<button ng-if="caller.typeCreate == \'closeWork\'" style=" border: none; "  class="#=utilAttachDocumentId# icon_table" uib-tooltip="Xóa" ng-click="caller.removeRowFile(dataItem)"  translate>' +
                    //         '<i style="color: steelblue;" class="fa fa-trash" ria-hidden="true"></i>' +
                    //         '</button>' +
                    //         '</div>',
                    //     width: '10%',
                    //     field: "acctions"
                    // }
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

        vm.checkErr = function () {
            let dateFrom = kendo.parseDate(vm.searchForm.dateFrom, "dd/MM/yyyy");
            let dateTo = kendo.parseDate(vm.searchForm.dateTo, "dd/MM/yyyy");
            let curDate = new Date();
            if (dateFrom > curDate) {
                vm.errMessage = CommonService.translate("Từ ngày không được lớn hơn ngày hiện tại");
                $("#authorization_dateFrom").focus();
                return vm.errMessage;
            } else if (dateTo != null && dateFrom > dateTo) {
                vm.errMessage = CommonService.translate("Từ ngày không được lớn hơn ngày đến");
                $("#authorization_dateFrom").focus();
                return vm.errMessage;
            } else {
                vm.errMessage = '';
                vm.errMessage1 = '';
                return vm.errMessage;
            }
        };
        vm.checkErr1 = function () {
            let dateFrom = kendo.parseDate(vm.searchForm.dateFrom, "dd/MM/yyyy");
            let dateTo = kendo.parseDate(vm.searchForm.dateTo, "dd/MM/yyyy");
            let curDate = new Date();
            if (dateTo > curDate) {
                vm.errMessage1 = CommonService.translate("Từ ngày không được lớn hơn ngày hiện tại");
                $("#authorization_dateTo").focus();
                return vm.errMessage1;
            } else if (dateFrom > dateTo) {
                vm.errMessage1 = CommonService.translate("Ngày đến không được nhỏ hơn Từ ngày");
                $("#authorization_dateTo").focus();
                return vm.errMessage1;
            } else if (dateFrom <= dateTo) {
                vm.errMessage = '';
                vm.errMessage1 = '';
                return vm.errMessage1;
            }
        };
        vm.checkErrDateRelease = function () {
            let dateReleaseFrom = kendo.parseDate(vm.searchForm.dateReleaseFrom, "dd/MM/yyyy");
            let dateReleaseTo = kendo.parseDate(vm.searchForm.dateReleaseTo, "dd/MM/yyyy");
            let curDate = new Date();
            if (dateReleaseFrom > curReleaseDate) {
                vm.errReleaseMessage = CommonService.translate("Từ ngày không được lớn hơn ngày hiện tại");
                $("#authorization_dateReleaseFrom").focus();
                return vm.errReleaseMessage;
            } else if (dateReleaseTo != null && dateReleaseFrom > dateReleaseTo) {
                vm.errReleaseMessage = CommonService.translate("Từ ngày không được lớn hơn ngày đến");
                $("#authorization_dateReleaseFrom").focus();
                return vm.errReleaseMessage;
            } else {
                vm.errReleaseMessage = '';
                vm.errReleaseMessage1 = '';
                return vm.errReleaseMessage;
            }
        };
        vm.checkErrDateRelease1 = function () {
            let dateReleaseFrom = kendo.parseDate(vm.searchForm.dateReleaseFrom, "dd/MM/yyyy");
            let dateReleaseTo = kendo.parseDate(vm.searchForm.dateReleaseTo, "dd/MM/yyyy");
            let curDate = new Date();
            if (dateReleaseTo > curDate) {
                vm.errReleaseMessage1 = CommonService.translate("Từ ngày không được lớn hơn ngày hiện tại");
                $("#authorization_dateReleaseTo").focus();
                return vm.errReleaseMessage1;
            } else if (dateReleaseFrom > dateReleaseTo) {
                vm.errReleaseMessage1 = CommonService.translate("Ngày đến không được nhỏ hơn Từ ngày");
                $("#authorization_dateReleaseTo").focus();
                return vm.errMessage1;
            } else if (dateReleaseFrom <= dateReleaseTo) {
                vm.errReleaseMessage = '';
                vm.errReleaseMessage1 = '';
                return vm.errReleaseMessage1;
            }
        };

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

        //------------------------ clear input
        vm.clear = function (fieldName) {
            switch (fieldName) {
                case 'sysGroup_search':
                    vm.searchForm.uqSysGroupId = null;
                    vm.searchForm.uqSysGroupName = null;
                    break;
                case 'code':
                    vm.searchForm.code = null;
                    break;
                case 'createDate':
                    vm.searchForm.dateFrom = null;
                    vm.searchForm.dateTo = null;
                    break;
                case 'dateRelease':
                    vm.searchForm.dateReleaseFrom = null;
                    vm.searchForm.dateReleaseTo = null;
                    break;
            }
        }
    }
})();
