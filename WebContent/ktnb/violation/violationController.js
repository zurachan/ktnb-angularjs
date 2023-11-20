(function () {
    'use strict';
    var controllerId = 'violationController';

    angular.module('MetronicApp').controller(controllerId, violationController);

    function violationController($scope, $http, $templateCache, $rootScope, $timeout, gettextCatalog,
                                 kendoConfig, $kWindow, $q, violationService,
                                 CommonService, htmlCommonService, PopupConst, Restangular, RestEndpoint, Constant) {
        var vm = this;
        vm.documentBody = $("#violation");
        vm.modalBody = $("#indicator_add_popupId");
        vm.searchForm = {};
        vm.searchForm.status = 1;
        vm.insertForm = {};
        vm.listDelete = [];
        vm.listRemove = [{
            title: CommonService.translate("Thao tác"),
        }];
        const SERIOUSNESS_1 = 100000;
        const SERIOUSNESS_2 = 200000;
        const SERIOUSNESS_3 = 500000;
        vm.listConvert = [
            {
                field: "status",
                data: {
                    0: 'Hết hiệu lực',
                    1: 'Hiệu lực'
                }
            },
            {
                field: "type",
                data: {
                    1: 'Thông thường',
                    2: 'Ít nghiêm trọng',
                    3: 'Nghiêm trọng',
                    4: 'Rất nghiêm trọng',
                }
            },
        ];

        vm.listType = [];
        Restangular.all("commonRsService/getAppParam").post({parType:"PMTP_SERIOUS"}).then(function (res) {
            if (res && res.error){
                toastr.error(CommonService.translate("Có lỗi xảy ra khi get Param"));
            }
            if (res && res.data){
                for (var i = 0; i < res.data.length; i++){
                    var obj = {};
                    obj.name = res.data[i].name;
                    obj.code = res.data[i].code;
                    obj.description = res.data[i].description;
                    if (res.data[i].code == 'NORMAL'){ obj.value = 1; }
                    if (res.data[i].code == 'LESSSERIOUS'){ obj.value = 2; }
                    if (res.data[i].code == 'SERIOUS'){ obj.value = 3; }
                    if (res.data[i].code == 'MOSTSERIOUS'){ obj.value = 4; }
                    vm.listType.push(obj);
                }
            }
        },function (err) {
            console.log(err);
            toastr.error(CommonService.translate("Có lỗi xảy ra!"))
        });

        vm.listGroupName = [];
        Restangular.all("commonRsService/getAppParam").post({parType:"VIOLATION_GROUP"}).then(function (res) {
            if (res && res.error){
                toastr.error(CommonService.translate("Có lỗi xảy ra khi get Param"));
            }
            if (res && res.data){
                for (var i = 0; i < res.data.length; i++){
                    var obj = {};
                    obj.name = res.data[i].name;
                    obj.code = res.data[i].code;
                    vm.listGroupName.push(obj);
                }
            }
        },function (err) {
            console.log(err);
            toastr.error(CommonService.translate("Có lỗi xảy ra!"))
        })

        function getTypeName(value){
            switch (value){
                case 1: return 'Thông thường'; break;
                case 2: return 'Ít nghiêm trọng'; break;
                case 3: return 'Nghiêm trọng'; break;
                case 4: return 'Rất nghiêm trọng'; break;
                default: return ''; break;
            }
        }

        function getStatusName(value){
            switch (value){
                case 0: return 'Hết hiệu lực'; break;
                case 1: return 'Hiệu lực'; break;
                default: return ''; break;
            }
        }

        initForm();
        function initForm() {
            if ($rootScope.stringtile) {
                vm.String = CommonService.translate("Quản lý thưởng phạt ") + " > "+ CommonService.translate(" Danh mục lỗi vi phạm");
            }
            fillDataViolation([]);
        }

        vm.doSearch = function () {
            var grid = $("#violationGrid").data("kendoGrid");
            if (grid) {
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        }

        var recordViolation = 0;
        vm.countViolation = 0;
        function fillDataViolation(data) {
            vm.violationGridOptions = kendoConfig.getGridOptions({
                autoBind: true,
                resizable: true,
                toolbar: [
                    {
                        name: "actions",
                        template:
                            '<div class=" pull-left con-md-2 ">' +
                            '<button  type="button" class="btn btn-qlk padding-search-right addQLK ng-scope" style="width: 120px; margin-top: 12px" ng-click="vm.create()">Thêm mới'+
                            '</button>' +
                            '<button  type="button" class="btn btn-qlk padding-search-right closeQLK ng-scope" style="width: 120px; margin-top: 12px" ng-click="vm.deleteList()">Xóa'+
                            '</button>' +
                            '</div>' + '<div class="form-group col-md-10">\n' +
                            '                    <div>\n' +
                            '                        <file-input list-file-type="xls,xlsx" model="caller.dataList"\n' +
                            '                                    size="104857600" caller="caller" input-id="fileChange"\n' +
                            '                                    model-label="File import"\n' +
                            '                                    msg="Không được để trống file"></file-input>\n' +
                            '\n' +
                            '                    </div>\n' +
                            '                    <button class="col-md-2" ng-click="vm.submitImportNewTargets()"\n' +
                            '                            id="upfile">Tải lên\n' +
                            '                    </button>\n' +
                            '                    <div class="col-md-1" id="modalLoading"\n' +
                            '                         style="display: none; margin-left: 30px; height: 20px;"></div>\n' +
                            '\n' +
                            '                    <div class="form-group col-md-4" align="right" id="hiden11">\n' +
                            '                        <a id="templateLink" href="" ng-click="vm.getExcelTemplate()">Tải\n' +
                            '                            biểu mẫu</a>\n' +
                            '                    </div>\n' +
                            '                </div>\n' +
                            '                <div class="form-group col-md-5" align="right" id="hiden12">\n' +
                            '                    <i style="color: gray; margin-right:  50px;">Dung lượng <= 100MB, định dạng xls,xlsx</i>\n' +
                            '                </div>'
                    }
                ],
                dataBinding: function () {
                    recordViolation = (this.dataSource.page() - 1) * this.dataSource.pageSize();
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
                            $("#countAssetReduce").text("" + response.total);
                            vm.countViolation = response.total;
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
                            url: Constant.BASE_SERVICE_URL + "violationRsService/doSearch",
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
                columnMenu: false,
                scrollable: true,
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
                        title : "<input type='checkbox' id='checkalllistEx' name='gridchkselectall' ng-click='vm.chkSelectAllForExq();' ng-model='vm.chkAllForExReq' />",
                        template: "<input type='checkbox'  id='childcheckInExReq' name='gridcheckbox' ng-click='vm.handleCheckForExq(dataItem)' ng-model='dataItem.selected' ng-if='dataItem.status==1'/>",
                        width: "3%",
                        headerAttributes: {style:"text-align:center;"},
                        attributes:{style:"text-align:center;"}
                    },
                    {
                        title: CommonService.translate("TT"),
                        field: "stt",
                        template: function () {
                            return ++recordViolation;
                        },
                        width: "3%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center;white-space:normal;"
                        },
                    }, {
                        title: CommonService.translate("Tên lỗi vi phạm"),
                        field: 'name',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                    }, {
                        title: CommonService.translate("Đơn vị tính lỗi"),
                        field: 'unitType',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Mức độ vi phạm"),
                        field: 'seriousness',
                        width: "5%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },
                    // {
                    //     title: CommonService.translate("Phân loại"),
                    //     field: 'type',
                    //     width: "10%",
                    //     headerAttributes: {
                    //         style: "text-align:center;font-weight: bold;white-space:normal;",
                    //         translate: ""
                    //     },
                    //     attributes: {
                    //         style: "text-align:center; white-space:normal"
                    //     },
                    //     template: dataItem => getTypeName(dataItem.type),
                    // },
                    {
                        title: CommonService.translate("Đơn vị xây dựng hành vi vi phạm"),
                        field: 'groupName',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Mức chế tài"),
                        field: 'sanction',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem => formatToCurrency(dataItem.sanction),
                    },
                    {
                        title: CommonService.translate("Lĩnh vực"),
                        field: 'field',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Mô tả hành vi vi phạm"),
                        field: 'description',
                        width: "15%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Người tạo"),
                        field: 'text',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Trạng thái"),
                        field: 'text',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem => dataItem.status==0?'Hết hiệu lực':dataItem.status==1?'Hiệu lực':''
                    },
                    {
                        title: CommonService.translate("Thao tác"),
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal;",
                            translate:""
                        },
                        template: dataItem =>
                            '<div class="text-center #=assetLiquidateReqId#"">' +
                            '<button ng-if="dataItem.status==1" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Cập nhật" translate ' +
                            'ng-click="vm.update(dataItem)" ><i class="fa fa-pencil ng-scope" aria-hidden="true" translate></i></button>'
                            +
                            '<button ng-if="dataItem.status==1" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Hết hiệu lực" translate ' +
                            'ng-click="vm.remove(dataItem)" > <i style="color:steelblue;" class="fa fa-trash ng-scope" aria-hidden="true"></i></button>'
                            +
                            '</div>',

                        width: "10%",
                        field: "stt"
                    }
                ]
            });
        }

        var modalAdd;
        vm.create = function () {
            vm.type = 'create';
            vm.insertForm = {};
            var templateUrl = 'ktnb/violation/violationPopup.html';
            var title = CommonService.translate("Thêm mới lỗi vi phạm");
            modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "50%", null, null);
        }

        vm.update = function(dataItem){
            vm.insertForm = {};
            vm.type = 'update';
            vm.insertForm = angular.copy(dataItem);
            for (let i = 0; i < vm.listGroupName.length; i++) {
                if(vm.listGroupName[i].name === vm.insertForm.groupName){
                    Restangular.all("commonRsService/getAppParam").post({parType:"VIOLATION_GROUP_DETAIL", code: vm.listGroupName[i].code}).then(function (res) {
                        if (res && res.error){
                            toastr.error(CommonService.translate("Có lỗi xảy ra khi get Param"));
                        }
                        if (res && res.data){
                            for (var i = 0; i < res.data.length; i++){
                                var obj = {};
                                obj.name = res.data[i].name;
                                vm.listField.push(obj);
                            }
                        }
                        console.log(vm.listField);
                    },function (err) {
                        console.log(err);
                        toastr.error(CommonService.translate("Có lỗi xảy ra!"))
                    });
                    break;
                }
            }
            var templateUrl = 'ktnb/violation/violationPopup.html';
            var title = CommonService.translate("Cập nhật lỗi vi phạm");
            modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "50%", null, null);
        }

        vm.remove = function(dataItem) {
            confirm(CommonService.translate("Bạn có chắc chắn muốn hết hiệu lực bản ghi này?"), function () {
                vm.insertForm = angular.copy(dataItem);
                kendo.ui.progress(vm.modalBody, true);
                $('#sav').disabled = true;
                violationService.remove(vm.insertForm).then(function () {
                    toastr.success(CommonService.translate("Hết hiệu lực bản ghi thành công."));
                    vm.doSearch();
                    kendo.ui.progress(vm.modalBody, false);
                    $('#sav').disabled = false;
                }, function (err) {
                    toastr.error(CommonService.translate("Có lỗi xảy ra."));
                    kendo.ui.progress(vm.modalBody, false);
                    $('#sav').disabled = false;
                });
            });
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

        vm.isSelectSysGroupSearchDvg = false;
        vm.sysGroupSearchOptions = {

            clearButton: false,
            dataTextField: "name",
            placeholder: CommonService.translate("Nhập mã hoặc tên đơn vị"),
            dataValueField: "name",
            open: function (e) {
                vm.isSelectSysGroupSearchDvg = false;
            },
            select: function (e) {
                vm.isSelectSysGroupSearchDvg = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchForm.sysGroupName = dataItem.sysGroupNameLv2;
                vm.searchForm.sysGroupId = dataItem.sysGroupId;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSysGroupSearchDvg) {
                        vm.searchForm.sysGroupName = null;
                        vm.searchForm.sysGroupId = null;
                    }
                }, 100);
            },
            close: function (e) {
                $timeout(function () {

                }, 1000);

            },
            pageSize: 10,
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        vm.isSelectSysGroupSearchDvg = false;
                        return Restangular.all("commonRsService/getSysGroupForAutoComplete").post(
                            {
                                keySearch: vm.searchForm.sysGroupName,
                                page: 1,
                                pageSize: 10,
                                groupLevelLst: [2]
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
                '<p class="col-md-6 text-header-auto border-right-ccc bold" translate>Mã đơn vị</p>' +
                '<p class="col-md-6 text-header-auto bold" translate>Tên đơn vị</p>' +
                '</div>' +
                '</div>',
            template: '<div class="row" ><div class="col-md-6 col-xs-5" style="float:left">#: data.code #</div><div  style="padding-left: 5px;width:auto;overflow: hidden"> #: data.name #</div> </div>',
        }

        var modal = null;
        vm.openPopupSysGroup = function(){
            var templateUrl = "ktnb/popup/popupCommonSearch.html";
            var title = CommonService.translate("Tìm kiếm đơn vị xây dựng chế tài");
            var windowId = "POPUP_SELECT_SYS_GROUP_KRI";
            vm.placeHolder = CommonService.translate("Mã/tên đơn vị");
            CommonService.populatePopupCreate(templateUrl, title, null, vm, windowId, null, '60%', '50%', null);
            setTimeout(function () {
                modal = CommonService.getModalInstance1();
            }, 100);
            vm.commonPopupSearch = {};
            var api = "commonRsService/getSysGroupForAutoComplete";
            CommonService.fillDataPopupCommonSearch(api, vm.commonPopupSearch, sysGroupSearchColumns, vm);
        }

        var sysGroupSearchColumns = [
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
                    '	<a  type="button" class=" icon_table" uib-tooltip="Chọn" translate>' +
                    '	   <i ng-click="caller.saveSelectSysGroupSearch(dataItem)" class="fa fa-check color-green" aria-hidden="true"></i> ' +
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

        vm.saveSelectSysGroupSearch = function (dataItem) {
            vm.searchForm.sysGroupId = dataItem.sysGroupId;
            vm.searchForm.sysGroupName = dataItem.sysGroupNameLv2;
            modal.dismiss();
        }

        vm.isSelectSysGroupInsertDvg = false;
        vm.sysGroupInsertOptions = {

            clearButton: false,
            dataTextField: "name",
            placeholder: CommonService.translate("Nhập mã hoặc tên đơn vị"),
            dataValueField: "name",
            open: function (e) {
                vm.isSelectSysGroupInsertDvg = false;
            },
            select: function (e) {
                vm.isSelectSysGroupInsertDvg = true;
                var dataItem = this.dataItem(e.item.index());
                vm.insertForm.sysGroupName = dataItem.sysGroupNameLv2;
                vm.insertForm.sysGroupId = dataItem.sysGroupId;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSysGroupInsertDvg) {
                        vm.insertForm.sysGroupName = null;
                        vm.insertForm.sysGroupId = null;
                    }
                }, 100);
            },
            close: function (e) {
                $timeout(function () {

                }, 1000);

            },
            pageSize: 10,
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        vm.isSelectSysGroupInsertDvg = false;
                        return Restangular.all("commonRsService/getSysGroupForAutoComplete").post(
                            {
                                keySearch: vm.insertForm.sysGroupName,
                                page: 1,
                                pageSize: 10,
                                groupLevelLst: [2,3]
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
                '<p class="col-md-6 text-header-auto border-right-ccc bold" translate>Mã đơn vị</p>' +
                '<p class="col-md-6 text-header-auto bold" translate>Tên đơn vị</p>' +
                '</div>' +
                '</div>',
            template: '<div class="row" ><div class="col-md-6 col-xs-5" style="float:left">#: data.code #</div><div  style="padding-left: 5px;width:auto;overflow: hidden"> #: data.name #</div> </div>',
        }

        var modal = null;
        vm.openPopupSysGroupInsert = function(){
            var templateUrl = "ktnb/popup/popupCommonSearch.html";
            var title = CommonService.translate("Tìm kiếm đơn vị xây dựng lỗi vi phạm");
            var windowId = "POPUP_SELECT_SYS_GROUP";
            vm.placeHolder = CommonService.translate("Mã/tên đơn vị");
            CommonService.populatePopupCreate(templateUrl, title, null, vm, windowId, null, '60%', '50%', null);
            setTimeout(function () {
                modal = CommonService.getModalInstance1();
            }, 100);
            vm.commonPopupSearch = {};
            var api = "commonRsService/getSysGroupForAutoComplete";
            CommonService.fillDataPopupCommonSearch(api, vm.commonPopupSearch, sysGroupInsertColumns, vm);
        }

        var sysGroupInsertColumns = [
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
                    '	<a  type="button" class=" icon_table" uib-tooltip="Chọn" translate>' +
                    '	   <i ng-click="caller.saveSelectSysGroupInsert(dataItem)" class="fa fa-check color-green" aria-hidden="true"></i> ' +
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

        vm.saveSelectSysGroupInsert = function (dataItem) {
            vm.insertForm.sysGroupId = dataItem.sysGroupId;
            vm.insertForm.sysGroupName = dataItem.sysGroupNameLv2;
            modal.dismiss();
        }

        vm.cancel = function () {
            $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
        }

        vm.clear = function(data) {
            switch (data){
                case 'nameSearch': vm.searchForm.name = null; break;
                case 'sysGroupSearch': vm.searchForm.sysGroupId = null; vm.searchForm.sysGroupName = null; break;
                case 'insertName': vm.insertForm.name = null; break;
                case 'insertSysGroup': vm.insertForm.sysGroupId = null; vm.insertForm.sysGroupName = null; break;
                case 'insertSanction': vm.insertForm.sanction = null;
            }
        }

        vm.save = function(){
            if(vm.insertForm.name == null || vm.insertForm.name == ''){
                toastr.error(CommonService.translate('Tên lỗi vi phạm không được để trống.'));
                return;
            }
            if(vm.insertForm.unitType == null || vm.insertForm.unitType == ''){
                toastr.error(CommonService.translate('Đơn vị tính lỗi không được để trống.'));
                return;
            }
            // if(vm.insertForm.type == null){
            //     toastr.error(CommonService.translate('Phân loại lỗi vi phạm không được để trống.'));
            //     return;
            // }
            if(vm.insertForm.seriousness == null){
                toastr.error(CommonService.translate('Mức độ vi phạm không được để trống.'));
                return;
            }
            if(vm.insertForm.description == null || vm.insertForm.description == ''){
                toastr.error(CommonService.translate('Mô tả hành vi vi phạm không được để trống.'));
                return;
            }
            if(vm.insertForm.groupName == null){
                toastr.error(CommonService.translate('Đơn vị xây dựng hành vi vi phạm không được để trống.'));
                return;
            }
            if(vm.insertForm.field == null || vm.insertForm.description == ''){
                toastr.error(CommonService.translate('Lĩnh vực không được để trống.'));
                return;
            }
            kendo.ui.progress(vm.modalBody, true);
            $('#sav').disabled = true;
            if(vm.type === 'create'){
                vm.insertForm.status = 1;
                Restangular.all("violationRsService/save").post(vm.insertForm).then(function(res){
                    toastr.success(CommonService.translate("Thêm mới bản ghi thành công!"));
                    vm.doSearch();
                    vm.cancel();
                    kendo.ui.progress(vm.modalBody, false);
                    $('#sav').disabled = false;
                },function (error) {
                    console.log(error);
                    toastr.error(CommonService.translate("Có lỗi xảy ra!"));
                    kendo.ui.progress(vm.modalBody, false);
                    $('#sav').disabled = false;
                });
            } else if(vm.type === 'update'){
                Restangular.all("violationRsService/update").post(vm.insertForm).then(function(res){
                    toastr.success(CommonService.translate("Cập nhật bản ghi thành công!"));
                    vm.doSearch();
                    vm.cancel();
                    kendo.ui.progress(vm.modalBody, false);
                    $('#sav').disabled = false;
                },function (error) {
                    console.log(error);
                    toastr.error(CommonService.translate("Có lỗi xảy ra!"));
                    kendo.ui.progress(vm.modalBody, false);
                    $('#sav').disabled = false;
                });
            }
        }

        vm.getExcelTemplate = function() {
            $http({
                url: Constant.BASE_SERVICE_URL + RestEndpoint.VIOLATION_SERVICE_URL +"/exportFileBM",
                method: "POST",
                data: {},
                headers: {
                    'Content-type': 'application/json'
                },
                responseType: 'arraybuffer'
            }).success(function (data, status, headers, config) {
                saveFile(data,"Bieu_mau_import_danh_muc_loi_vi_pham.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
            }).error(function (data, status, headers, config) {
                toastr.error("Có lỗi xảy ra! Vui lòng thử lại sau.");
            });
        }

        function saveFile(data, filename, type) {
            var file = new Blob([data], {type: type});
            if (window.navigator.msSaveOrOpenBlob) // IE10+
                window.navigator.msSaveOrOpenBlob(file, filename);
            else { // Others
                var a = document.createElement("a"),
                    url = URL.createObjectURL(file);
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                setTimeout(function() {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 0);
            }
        }

        var modalInstanceImport;
        vm.submitImportNewTargets = function submitImportNewTargets() {
            vm.dataImport = [];
            var element = $("#capNhatId");
            kendo.ui.progress(element, true);
            if ($("#fileChange")[0].files[0] == null) {
                kendo.ui.progress(element, false);
                toastr.warning(CommonService.translate("Bạn chưa chọn file để import"));
                return;
            }
            if ($("#fileChange")[0].files[0].name.split('.').pop() != 'xls' && $("#fileChange")[0].files[0].name.split('.').pop() != 'xlsx') {
                kendo.ui.progress(element, false);
                toastr.warning(CommonService.translate("Sai định dạng file"));
                return;
            }
            var formData = new FormData();

            // ?folder=temp
            formData.append('multipartFile', $("#fileChange")[0].files[0]);
            return $.ajax({
                url: Constant.BASE_SERVICE_URL + RestEndpoint.VIOLATION_SERVICE_URL + "/importExcel?folder=temp",
                type: "POST",
                data: formData,
                enctype: 'multipart/form-data',
                processData: false,
                contentType: false,
                cache: false,
                success: function (data) {
                    if (data == 'NO_CONTENT') {
                        vm.disableSubmit = false;
                        toastr.warning("File import không có nội dung");
                        kendo.ui.progress(element, false);
                    } else if (data.length == 1 && !!data[data.length - 1].errorList && data[data.length - 1].errorList.length > 0) {
                        kendo.ui.progress(element, false);
                        vm.lstErrImport = data[data.length - 1].errorList;
                        vm.objectErr = data[data.length - 1];
                        var templateUrl = "ktnb/popup/importResultPopUp.html";
                        var title = "Kết quả Import";
                        var windowId = "ERR_IMPORT";
                        vm.disableSubmit = false;
                        CommonService.populatePopupCreate(templateUrl, title, vm.lstErrImport, vm, windowId, false, '80%', '420px');
                        // modalInstanceImport = CommonService.createCustomPopupWithEvent(templateUrl, title, vm.lstErrImport, null, "80%", "420px", initDataErrImportFunction, null);

                        setTimeout(function () {
                            modalInstanceImport = CommonService.getModalInstance1();
                        }, 100);
                        fillDataImportErrTable(vm.lstErrImport);
                    } else {
                        kendo.ui.progress(element, false);
                        vm.disableSubmit = false;
                        vm.dataImport = data;
                        for (let i = 0; i < data.length; i++) {
                            switch(data[i].seriousness){
                                case 1: data[i].sanction = SERIOUSNESS_1; break;
                                case 2: data[i].sanction = SERIOUSNESS_2; break;
                                case 3: data[i].sanction = SERIOUSNESS_3; break;
                            }
                        }
                        var templateUrl = 'ktnb/violation/violationImportPopup.html';
                        var title = CommonService.translate("Xác nhận thêm dữ liệu");
                        modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "50%", null, null);
                        fillDataImportResTable(vm.dataImport);
                    }
                    $("#fileChange").val("");
                    $scope.$apply();
                },
            });
        }

        function fillDataImportResTable(data) {
            vm.importResGridOptions = kendoConfig.getGridOptions({
                autoBind: true,
                resizable: true,
                dataSource: data,
                noRecords: true,
                columnMenu: false,
                messages: {
                    noRecords: CommonService.translate("Không có kết quả hiển thị")
                },
                pageSize: 10,
                pageable: {
                    pageSize: 10,
                    refresh: false,
                    pageSizes: [10, 15, 20, 25],
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
                            return ++recordViolation;
                        },
                        width: "3%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center;"
                        },
                    }, {
                        title: CommonService.translate("Tên lỗi vi phạm"),
                        field: 'name',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                    }, {
                        title: CommonService.translate("Đơn vị tính lỗi"),
                        field: 'unitType',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Mức độ vi phạm"),
                        field: 'seriousness',
                        width: "5%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },
                    // {
                    //     title: CommonService.translate("Phân loại"),
                    //     field: 'type',
                    //     width: "10%",
                    //     headerAttributes: {
                    //         style: "text-align:center;font-weight: bold;white-space:normal;",
                    //         translate: ""
                    //     },
                    //     attributes: {
                    //         style: "text-align:center; white-space:normal"
                    //     },
                    //     template: dataItem => getTypeName(dataItem.type),
                    // },
                    {
                        title: CommonService.translate("Đơn vị xây dựng hành vi vi phạm"),
                        field: 'groupName',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Mức chế tài"),
                        field: 'sanction',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem => formatToCurrency(dataItem.sanction),
                    },
                    {
                        title: CommonService.translate("Lĩnh vực"),
                        field: 'field',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Mo tả hành vi vi phạm"),
                        field: 'description',
                        width: "15%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Thao tác"),
                        field: 'choose',
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate:""
                        },
                        template: dataItem =>
                            '<div class="text-center #=assetLiquidateReqId#"">' +
                            '<button style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Hết hiệu lực" translate ' +
                            'ng-click="caller.removeItem(dataItem)" > <i style="color:steelblue;" class="fa fa-trash ng-scope" aria-hidden="true"></i></button>'
                            +
                            '</div>',

                        width: "10%",
                    }],
            });
        }

        function fillDataImportErrTable(data) {
            vm.importResultGridOptions = kendoConfig.getGridOptions({
                autoBind: true,
                resizable: true,
                dataSource: data,
                noRecords: true,
                columnMenu: false,
                messages: {
                    noRecords: CommonService.translate("Không có kết quả hiển thị")
                },
                pageSize: 10,
                pageable: {
                    pageSize: 10,
                    refresh: false,
                    pageSizes: [10, 15, 20, 25],
                    messages: {
                        display: "{0}-{1} của {2} kết quả",
                        itemsPerPage: "kết quả/trang",
                        empty: "Không có kết quả hiển thị"
                    }
                },
                columns: [
                    {
                        title: "TT",
                        field: "stt",
                        template: function (dataItem) {
                            return $("#importResultGrid").data("kendoGrid").dataSource.indexOf(dataItem) + 1;
                        },
                        width: 70,
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        attributes: {
                            style: "text-align:center;"
                        },
                    }, {
                        title: "Dòng lỗi",
                        field: 'lineError',
                        width: 100,
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        attributes: {
                            style: "text-align:center;"
                        }
                    }, {
                        title: "Cột lỗi",
                        field: 'columnError',
                        width: 100,
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        attributes: {
                            style: "text-align:center;"
                        }
                    }, {
                        title: "Nội dung lỗi",
                        field: 'detailError',
                        width: 250,
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        attributes: {
                            style: "text-align:left;"
                        }
                    }
                ]
            });
        }

        vm.exportExcelErr = function () {
            Restangular.all("fileservice/exportExcelError").post(vm.objectErr).then(function (d) {
                var data = d.plain();
                window.location = Constant.BASE_SERVICE_URL + "fileservice/downloadFileATTT?" + data.fileName;
            }).catch(function () {
                toastr.error(gettextCatalog.getString("Lỗi khi export!"));
                return;
            });
        };
        // đóng poup lỗi
        vm.closeErrImportPopUp = function closeErrImportPopUp() {
            modalInstanceImport.dismiss();
        }

        vm.submit = function(){
            vm.dataImport = $("#importResultGrid").data("kendoGrid").dataSource._data;
            kendo.ui.progress(vm.modalBody, true);
            $('#sub').disabled = true;
            Restangular.all("violationRsService/submit").post({listAdd:vm.dataImport}).then(function (d) {
                toastr.success(CommonService.translate("Thêm mới bản ghi thành công!"));
                vm.doSearch();
                vm.cancel();
                kendo.ui.progress(vm.modalBody, false);
                $('#sub').disabled = false;
            }).catch(function () {
                toastr.error(gettextCatalog.getString("Lỗi khi thêm mới!"));
                vm.doSearch();
                vm.cancel();
                kendo.ui.progress(vm.modalBody, false);
                $('#sub').disabled = false;
            });
            vm.doSearch();
        }

        vm.removeItem = function(dataItem){
            $("#importResultGrid").data("kendoGrid").dataSource.remove(dataItem);
            vm.dataImport = $("#importResultGrid").data("kendoGrid").dataSource._data;
            $("#importResultGrid").data("kendoGrid").refresh();
        }

        vm.submitByImport = function (){
            var list = [];
            list = $("#violationGrid2").data("kendoGrid").dataSource._data;
            Restangular.all('violationRsService/submitByImport').post(list).then(function(){
                toastr.success(CommonService.translate("Thêm mới bản ghi thành công!"));
                vm.doSearch();
                vm.cancel();
                kendo.ui.progress(vm.modalBody, false);
                vm.doSearch();
            }).catch(function () {
                toastr.error(gettextCatalog.getString("Lỗi khi thêm mới!"));
                vm.doSearch();
                vm.cancel();
                kendo.ui.progress(vm.modalBody, false);
            });
        }

        function formatToCurrency(amount){
            return amount.toLocaleString('it-IT', {style : 'currency', currency : 'VND'});
        }

        vm.changeType = function(){
            switch (vm.insertForm.seriousness) {
                case "1": vm.insertForm.sanction = SERIOUSNESS_1; break;
                case "2": vm.insertForm.sanction = SERIOUSNESS_2; break;
                case "3": vm.insertForm.sanction = SERIOUSNESS_3; break;
                default: vm.insertForm.sanction = null; break;
            }
        }

        vm.listField = [];
        vm.changeGroup = function(type){
            if(type==='insert'){
                if(vm.insertForm.groupName==null){
                    vm.listField = [];
                } else {
                    vm.listField = [];
                    for (let i = 0; i < vm.listGroupName.length; i++) {
                        if(vm.listGroupName[i].name === vm.insertForm.groupName){
                            Restangular.all("commonRsService/getAppParam").post({parType:"VIOLATION_GROUP_DETAIL", code: vm.listGroupName[i].code}).then(function (res) {
                                if (res && res.error){
                                    toastr.error(CommonService.translate("Có lỗi xảy ra khi get Param"));
                                }
                                if (res && res.data){
                                    for (var i = 0; i < res.data.length; i++){
                                        var obj = {};
                                        obj.name = res.data[i].name;
                                        vm.listField.push(obj);
                                    }
                                }
                                console.log(vm.listField);
                            },function (err) {
                                console.log(err);
                                toastr.error(CommonService.translate("Có lỗi xảy ra!"))
                            });
                            break;
                        }
                    }
                }
            } else if(type==='search'){
                if(vm.searchForm.groupName==null){
                    vm.listField = [];
                } else {
                    vm.listField = [];
                    for (let i = 0; i < vm.listGroupName.length; i++) {
                        if(vm.listGroupName[i].name === vm.searchForm.groupName){
                            Restangular.all("commonRsService/getAppParam").post({parType:"VIOLATION_GROUP_DETAIL", code: vm.listGroupName[i].code}).then(function (res) {
                                if (res && res.error){
                                    toastr.error(CommonService.translate("Có lỗi xảy ra khi get Param"));
                                }
                                if (res && res.data){
                                    for (var i = 0; i < res.data.length; i++){
                                        var obj = {};
                                        obj.name = res.data[i].name;
                                        vm.listField.push(obj);
                                    }
                                }
                                console.log(vm.listField);
                            },function (err) {
                                console.log(err);
                                toastr.error(CommonService.translate("Có lỗi xảy ra!"))
                            });
                            break;
                        }
                    }
                }
            }
        }

        vm.listCheck = [];
        vm.chkAllForExReq = false;
        vm.chkSelectAllForExq = function(){
            console.log(vm.chkAllForExReq);
            if(vm.chkAllForExReq){
                vm.listCheck = [];
                var lst = vm.violationGrid.dataSource._data;
                for (let i = 0; i < lst.length; i++) {
                    if(lst[i].status==1){
                        vm.listCheck.push(lst[i]);
                        lst[i].selected = true;
                    }
                }
            } else {
                vm.listCheck = [];
                var lst = vm.violationGrid.dataSource._data;
                for (let i = 0; i < lst.length; i++) {
                    lst[i].selected = false;
                }
            }
        }
        vm.handleCheckForExq = function(dataItem){
            if(dataItem.selected){
                vm.listCheck.push(dataItem);
            } else {
                for (let i = 0; i < vm.listCheck.length; i++) {
                    if(vm.listCheck[i].violationId===dataItem.violationId){
                        vm.listCheck.splice(i,1);
                        break;
                    }
                }
            }
        }

        vm.deleteList = function(){
            for (let i = 0; i < vm.listCheck.length; i++) {
                if(vm.listCheck[i].status==0){
                    toastr.error(CommonService.translate('Lỗi vi phạm '+vm.listCheck[i].name+' đã hết hiệu lực, hệ thóng sẽ tự động loại trừ khỏi danh sách.'));
                    vm.listCheck.splice(i,1);
                }
            }
            if(vm.listCheck.length==0){
                toastr.error(CommonService.translate('Yêu cầu chọn ít nhất 1 bản ghi trong trạng thái có hiệu lực!'));
                return;
            }
            confirm(CommonService.translate("Xác nhận xóa!"), function () {
                kendo.ui.progress(vm.documentBody, true);
                Restangular.all('violationRsService/deleteList').post(vm.listCheck).then(function (res) {
                    kendo.ui.progress(vm.documentBody, false);
                    toastr.success(CommonService.translate("Xác nhận xóa thành công !!!"));
                    vm.doSearch();
                    // $("#checkalllistEx").click();
                    vm.chkAllForExReq = false;
                }, function (error) {
                    console.log(error);
                    toastr.error(CommonService.translate("Có lỗi xảy ra!"));
                    // $("#checkalllistEx").click();
                    vm.chkAllForExReq = false;
                })
            });
        }
    }
})();