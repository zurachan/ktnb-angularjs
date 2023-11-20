(function () {
    'use strict';
    var controllerId = 'dataDamageConfigController';

    angular.module('MetronicApp').controller(controllerId, dataDamageConfigController);

    function dataDamageConfigController($scope, $http, $templateCache, $rootScope, $timeout, gettextCatalog,
                                  kendoConfig, $kWindow, $q, dataDamageConfigService,
                                  CommonService, htmlCommonService, PopupConst, Restangular, RestEndpoint, Constant) {
        var vm = this;
        vm.documentBody = $(".tab-content");
        vm.searchForm = {};
        vm.searchForm.status = 1;
        vm.insertForm = {};
        vm.listRemove = [{
            title: CommonService.translate("Thao tác"),
        }];

        vm.showButtonEdit = function(dataItem){
            return dataItem.createdBy===Constant.user.VpsUserInfo.sysUserId;
        }

        initForm();
        function initForm() {
            if ($rootScope.stringtile) {
                vm.String = CommonService.translate(" Danh mục cấu hình dữ liệu tổn thất") ;
            }
            fillDataDataDamageConfig([]);
        }

        vm.doSearch = function () {
            var grid = $("#dataDamageConfigGrid").data("kendoGrid");
            if (grid) {
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        }

        var recordDataDamageConfig = 0;
        vm.countDataDamageConfig = 0;
        function fillDataDataDamageConfig(data) {
            vm.dataDamageConfigGridOptions = kendoConfig.getGridOptions({
                autoBind: true,
                resizable: true,
                toolbar: [
                    {
                        name: "actions",
                        template:
                            '<div class=" pull-left con-md-2 ">' +
                            '<button  type="button" class="btn btn-qlk padding-search-right addQLK ng-scope" style="width: 120px; margin-top: 12px" ng-click="vm.create()">Thêm mới'+
                            '</button>' +
                            '</div>' +
                            // + '<div class="form-group col-md-8">\n' +
                            // '                    <div>\n' +
                            // '                        <file-input list-file-type="xls,xlsx" model="caller.dataList"\n' +
                            // '                                    size="104857600" caller="caller" input-id="fileChange"\n' +
                            // '                                    model-label="File import"\n' +
                            // '                                    msg="Không được để trống file"></file-input>\n' +
                            // '\n' +
                            // '                    </div>\n' +
                            // '                    <button class="col-md-2" ng-click="vm.submitImportNewTargets()"\n' +
                            // '                            id="upfile">Tải lên\n' +
                            // '                    </button>\n' +
                            // '                    <div class="col-md-1" id="modalLoading"\n' +
                            // '                         style="display: none; margin-left: 30px; height: 20px;"></div>\n' +
                            // '\n' +
                            // '                    <div class="form-group col-md-4" align="right" id="hiden11">\n' +
                            // '                        <a id="templateLink" href="" ng-click="vm.getExcelTemplate()">Tải\n' +
                            // '                            biểu mẫu</a>\n' +
                            // '                    </div>\n' +
                            // '                </div>\n' +
                            '<div class="pull-right col-md-2">' +
                            '<div class="btn-group pull-right margin_top_button margin_right10">' +
                            '    <i data-toggle="dropdown" class="tooltip1" aria-expanded="false"><span class="tooltipArrow"></span><span class="tooltiptext" translate>Cài đặt</span><i class="fa fa-cog" aria-hidden="true"></i></i>' +
                            // '    <i class="tooltip1 action-button excelQLK" ng-click="vm.exportExcelGrid()"  aria-expanded="false"><span class="tooltipArrow"></span><span class="tooltiptext" translate>Xuất Excel</span></i>' +
                            '    <div class="dropdown-menu hold-on-click dropdown-checkboxes" role="menu">' +
                            '    <label ng-repeat="column in vm.dataDamageConfigGrid.columns.slice(1,vm.dataDamageConfigGrid.columns.length)| filter: vm.gridColumnShowHideFilter">' +
                            '    <input type="checkbox" checked="column.hidden" ng-click="vm.showHideColumn(column)"> {{column.title}}' +
                            '    </label>' +
                            '    </div></div>' +
                            '</div>'
                            // '                <div class="form-group col-md-5" align="right" id="hiden12">\n' +
                            // '                    <i style="color: gray; margin-right:  50px;">Dung lượng <= 100MB, định dạng xls,xlsx</i>\n' +
                            // '                </div>'
                    }
                ],
                dataBinding: function () {
                    recordDataDamageConfig = (this.dataSource.page() - 1) * this.dataSource.pageSize();
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
                            vm.countDataDamageConfig = response.total;
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
                            url: Constant.BASE_SERVICE_URL + "dataDamageConfigRsService/doSearch",
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
                        title: CommonService.translate("TT"),
                        field: "stt",
                        template: function () {
                            return ++recordDataDamageConfig;
                        },
                        width: "3%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center;"
                        },
                    },
                    {
                        title: CommonService.translate("Tên dữ liệu tổn thất"),
                        field: 'name',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                        template: (dataItem)=>'<a ng-click="vm.detail(dataItem)">'+dataItem.name+'</a>',
                    },{
                        title: CommonService.translate("Mô tả"),
                        field: 'description',
                        width: "30%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Người tạo"),
                        field: 'createdByName',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Trạng thái"),
                        field: 'status',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem => dataItem.status==1?'Hiệu lực':'Hết hiệu lực',
                    },
                    {
                        title: CommonService.translate("Thao tác"),
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate:""
                        },
                        template: dataItem =>
                            '<div class="text-center #=assetLiquidateReqId#"">' +
                            '<button ng-if="dataItem.status!==1||!vm.showButtonEdit" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Khóa" translate ' +
                            '><i class="fa fa-pencil ng-scope" style="color: grey" aria-hidden="true" translate></i></button>'
                            +
                            '<button ng-if="dataItem.status==1&&vm.showButtonEdit" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Cập nhật" translate ' +
                            'ng-click="vm.update(dataItem)" ><i class="fa fa-pencil ng-scope" aria-hidden="true" translate></i></button>'
                            +
                            '<button ng-if="dataItem.status!==1||!vm.showButtonEdit" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Khóa" translate ' +
                            '><i class="fa fa-trash ng-scope" style="color: grey" aria-hidden="true" translate></i></button>'
                            +
                            '<button ng-if="dataItem.status==1&&vm.showButtonEdit" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Hết hiệu lực" translate ' +
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
        vm.detail = function(dataItem){
            vm.type = 'detail';
            vm.insertForm = angular.copy(dataItem);
            var templateUrl = 'ktnb/dataDamageConfig/dataDamageConfigPopup.html';
            var title = CommonService.translate("Chi tiết cấu hình dữ liệu tổn thất");
            modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "50%", null, null);
        }

        vm.create = function () {
            vm.type = 'create';
            vm.insertForm = {};
            var templateUrl = 'ktnb/dataDamageConfig/dataDamageConfigPopup.html';
            var title = CommonService.translate("Thêm mới cấu hình dữ liệu tổn thất");
            modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "50%", null, null);
        }

        vm.update = function(dataItem){
            vm.type = 'update';
            vm.insertForm = angular.copy(dataItem);
            var templateUrl = 'ktnb/dataDamageConfig/dataDamageConfigPopup.html';
            var title = CommonService.translate("Cập nhật cấu hình dữ liệu tổn thất");
            modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "50%", null, null);
        }

        vm.remove = function(dataItem) {
            confirm(CommonService.translate("Bạn có chắc chắn muốn hết hiệu lực bản ghi này?"), function () {
                vm.insertForm = angular.copy(dataItem);
                kendo.ui.progress($(".tab-content"), true);
                dataDamageConfigService.remove(vm.insertForm).then(function () {
                    toastr.success(CommonService.translate("Hết hiệu lực bản ghi thành công."));
                    vm.doSearch();
                    kendo.ui.progress($(".tab-content"), false);
                }, function (err) {
                    toastr.error(CommonService.translate("Có lỗi xảy ra."));
                    kendo.ui.progress($(".tab-content"), false);
                });
            });
        }

        vm.isSelectSysUserSearchDvg = false;
        vm.sysUserSearchOptions = {
            clearButton: false,
            dataTextField: "name",
            placeholder: CommonService.translate("Nhập mã hoặc tên nhân viên"),
            dataValueField: "name",
            open: function (e) {
                vm.isSelectSysUserSearchDvg = false;
            },
            select: function (e) {
                vm.isSelectSysUserSearchDvg = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchForm.createdByName = dataItem.fullName;
                vm.searchForm.createdBy = dataItem.sysUserId;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSysUserSearchDvg) {
                        vm.searchForm.createdBy = null;
                        vm.searchForm.createdByName = null;
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
                        vm.isSelectSysUserSearchDvg = false;
                        return Restangular.all("commonRsService/getSysUserForAutoComplete").post(
                            {
                                keySearch: vm.searchForm.createdByName,
                                page: 1,
                                pageSize: 10,
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
                '<p class="col-md-6 text-header-auto border-right-ccc bold" translate>Mã nhân viên</p>' +
                '<p class="col-md-6 text-header-auto bold" translate>Tên nhân viên</p>' +
                '</div>' +
                '</div>',
            template: '<div class="row" ><div class="col-md-6 col-xs-5" style="float:left">#: data.employeeCode #</div><div  style="padding-left: 5px;width:auto;overflow: hidden"> #: data.fullName #</div> </div>',
        }

        var modal = null;
        vm.openPopupSysUser = function(){
            var templateUrl = "ktnb/popup/popupCommonSearch.html";
            var title = CommonService.translate("Tìm kiếm nhân viên");
            var windowId = "POPUP_SELECT_SYS_USER";
            vm.placeHolder = CommonService.translate("Mã/tên nhân viên");
            CommonService.populatePopupCreate(templateUrl, title, null, vm, windowId, null, '60%', '50%', null);
            setTimeout(function () {
                modal = CommonService.getModalInstance1();
            }, 100);
            vm.commonPopupSearch = {};
            var api = "commonRsService/getSysUserForAutoComplete";
            CommonService.fillDataPopupCommonSearch(api, vm.commonPopupSearch, sysUserSearchColumns, vm);
        }

        var sysUserSearchColumns = [
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
                    '	   <i ng-click="caller.saveSelectSysUserSearch(dataItem)" class="fa fa-check color-green" aria-hidden="true"></i> ' +
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

        vm.saveSelectSysUserSearch = function (dataItem) {
            vm.searchForm.createdByName = dataItem.fullName;
            vm.searchForm.createdBy = dataItem.sysUserId;
            modal.dismiss();
        }

        vm.cancel = function () {
            $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
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

        vm.save = function(){
            if(vm.insertForm.name == null || vm.insertForm.name == ''){
                toastr.error(CommonService.translate('Tên dữ liệu tổn thất không được để trống.'));
                return;
            }
            if(vm.insertForm.description == null || vm.insertForm.description == ''){
                toastr.error(CommonService.translate('Mô tả không được để trống.'));
                return;
            }
            kendo.ui.progress($('.k-window'), true);
            if(vm.type === 'create'){
                Restangular.all("dataDamageConfigRsService/save").post(vm.insertForm).then(function(res){
                    toastr.success(CommonService.translate("Thêm mới bản ghi thành công!"));
                    vm.doSearch();
                    vm.cancel();
                    kendo.ui.progress($('.k-window'), false);
                },function (error) {
                    console.log(error);
                    toastr.error(CommonService.translate("Có lỗi xảy ra!"));
                    kendo.ui.progress($('.k-window'), false);
                });
            } else if(vm.type === 'update'){
                Restangular.all("dataDamageConfigRsService/update").post(vm.insertForm).then(function(res){
                    toastr.success(CommonService.translate("Cập nhật bản ghi thành công!"));
                    vm.doSearch();
                    vm.cancel();
                    kendo.ui.progress($('.k-window'), false);
                },function (error) {
                    console.log(error);
                    toastr.error(CommonService.translate("Có lỗi xảy ra!"));
                    kendo.ui.progress($('.k-window'), false);
                });
            }
        }
    }
})();