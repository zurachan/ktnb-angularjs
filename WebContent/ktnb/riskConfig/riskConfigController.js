(function () {
    'use strict';
    var controllerId = 'riskConfigController';

    angular.module('MetronicApp').controller(controllerId, riskConfigController);

    function riskConfigController($scope, $http, $templateCache, $rootScope, $timeout, gettextCatalog,
                                 kendoConfig, $kWindow, $q, riskConfigService,
                                 CommonService, htmlCommonService, PopupConst, Restangular, RestEndpoint, Constant) {
        var vm = this;
        vm.documentBody = $(".tab-content");
        vm.searchForm = {};
        vm.searchForm.status = 1;
        vm.insertForm = {};
        vm.listDelete = [];
        vm.listRemove = [{
            title: CommonService.translate("Thao tác"),
        }];

        // vm.listConvert = [
        //     {
        //         field: "status",
        //         data: {
        //             0: 'Hết hiệu lực',
        //             1: 'Hiệu lực',
        //         }
        //     },
        //     {
        //         field: "groupType",
        //         data: {
        //             1: 'Con người',
        //             2: 'Quy trình/Quy định/Cơ chế',
        //             3: 'Tính liên tục của hoạt động kinh doanh',
        //             4: 'Hệ thống thông tin và mạng',
        //             5: 'Tranh chấp & Kiện cáo',
        //             6: 'Báo cáo và Kiểm soát tài chính',
        //             7: 'Bên ngoài',
        //             8: 'Tín dụng',
        //             9: 'Thanh khoản',
        //             10: 'Vi phạm pháp luật',
        //             11: 'Môi trường vĩ mô',
        //             12: 'Định hướng chiến lược',
        //         }
        //     },
        //     {
        //         field: "riskType",
        //         data: {
        //             1: 'Hoạt động',
        //             2: 'Tuân thủ',
        //             3: 'Tài chính',
        //             4: 'Chiến lược',
        //         }
        //     },
        // ];

        vm.listType = [];

        vm.listRiskType = [
            {code: 1, name: '1. Hoạt động'},
            {code: 2, name: '2. Tuân thủ'},
            {code: 3, name: '3. Tài chính'},
            {code: 4, name: '4. Chiến lược'}
        ];

        vm.listGroupType = [];

        $scope.$watch("vm.insertForm.riskType",function () {
            if (vm.insertForm.riskType == 1) {
                vm.listGroupType = [
                    {code: 1, name: '1. Con người'},
                    {code: 2, name: '2. Quy trình/Quy định/Cơ chế'},
                    {code: 3, name: '3. Tính liên tục của hoạt động kinh doanh'},
                    {code: 4, name: '4. Hệ thống thông tin và mạng'},
                    {code: 5, name: '5. Tranh chấp & Kiện cáo'},
                    {code: 6, name: '6. Báo cáo và Kiểm soát tài chính'},
                    {code: 7, name: '7. Bên ngoài'},
                ];
            } else if (vm.insertForm.riskType == 2) {
                vm.listGroupType = [
                    {code: 1, name: '1. Vi phạm pháp luật'},
                ];
            } else if (vm.insertForm.riskType == 3) {
                vm.listGroupType = [
                    {code: 1, name: '1. Tín dụng'},
                    {code: 2, name: '2. Thanh khoản'},
                    {code: 3, name: '3. Thị trường'},
                ];
            } else if (vm.insertForm.riskType == 4) {
                vm.listGroupType = [
                    {code: 1, name: '1. Môi trường vĩ mô'},
                    {code: 2, name: '2. Định hướng chiến lược'},
                ];
            }
        });

        vm.listGroupTypeSearch = [];

        $scope.$watch("vm.searchForm.riskType",function () {
            if (vm.searchForm.riskType == 1) {
                vm.listGroupTypeSearch = [
                    {code: 1, name: '1. Con người'},
                    {code: 2, name: '2. Quy trình/Quy định/Cơ chế'},
                    {code: 3, name: '3. Tính liên tục của hoạt động kinh doanh'},
                    {code: 4, name: '4. Hệ thống thông tin và mạng'},
                    {code: 5, name: '5. Tranh chấp & Kiện cáo'},
                    {code: 6, name: '6. Báo cáo và Kiểm soát tài chính'},
                    {code: 7, name: '7. Bên ngoài'},
                ];
            } else if (vm.searchForm.riskType == 2) {
                vm.listGroupTypeSearch = [
                    {code: 1, name: '1. Vi phạm pháp luật'},
                ];
            } else if (vm.searchForm.riskType == 3) {
                vm.listGroupTypeSearch = [
                    {code: 1, name: '1. Tín dụng'},
                    {code: 2, name: '2. Thanh khoản'},
                    {code: 3, name: '3. Thị trường'},
                ];
            } else if (vm.searchForm.riskType == 4) {
                vm.listGroupTypeSearch = [
                    {code: 1, name: '1. Môi trường vĩ mô'},
                    {code: 2, name: '2. Định hướng chiến lược'},
                ];
            }
        });

        vm.listRiskLevel = [
            {code: 0, name: '1. TCT'},
            {code: 2, name: '2. TTKD'},
            {code: 3, name: '3. CNCT'},
            {code: 1, name: '4. KCQ'},
        ]

        function getStatusName(value){
            switch (value){
                case 0: return 'Hết hiệu lực'; break;
                case 1: return 'Hiệu lực'; break;
                default: return ''; break;
            }
        }

        function getGroupType(value, value2){
            if(value==1) {
                switch (value2) {
                    case 1:
                        return 'Con người';
                        break;
                    case 2:
                        return 'Quy trình/Quy định/Cơ chế';
                        break;
                    case 3:
                        return 'Tính liên tục của hoạt động kinh doanh';
                        break;
                    case 4:
                        return 'Hệ thống thông tin và mạng';
                        break;
                    case 5:
                        return 'Tranh chấp & Kiện cáo';
                        break;
                    case 6:
                        return 'Báo cáo và Kiểm soát tài chính';
                        break;
                    case 7:
                        return 'Bên ngoài';
                        break;
                    default:
                        return '';
                }
            } else if(value==2) {
                switch (value2) {
                    case 1:
                        return 'Vi phạm pháp luật';
                        break;
                    default:
                        return '';
                }
            } else if(value==3) {
                switch (value2) {
                    case 1:
                        return 'Tín dụng';
                        break;
                    case 2:
                        return 'Thanh khoản';
                        break;
                    case 3:
                        return 'Thị trường';
                        break;
                    default:
                        return '';
                }
            } else if(value==4) {
                switch (value2) {
                    case 1:
                        return 'Môi trường vĩ mô';
                        break;
                    case 2:
                        return 'Định hướng chiến lược';
                        break;
                    default:
                        return '';
                }
            }
        }

        function getRiskType(value){
            switch (value){
                case 1: return 'Hoạt động'; break;
                case 2: return 'Tuân thủ'; break;
                case 3: return 'Tài chính'; break;
                case 4: return 'Chiến lược'; break;
                default: return ''; break;
            }
        }

        function getRiskLevel(value){
            switch (value){
                case 1: return 'KCQ'; break;
                case 2: return 'TTKD'; break;
                case 3: return 'CNCT'; break;
                case 0: return 'TCT'; break;
                default: return ''; break;
            }
        }

        vm.showButtonEdit = function(dataItem){
            return dataItem.createBy===Constant.user.VpsUserInfo.sysUserId;
        }

        initForm();
        function initForm() {
            if ($rootScope.stringtile) {
                vm.String = CommonService.translate(" Danh mục rủi ro") ;
            }
            fillDataRiskConfig([]);
        }

        vm.doSearch = function () {
            var grid = $("#riskConfigGrid").data("kendoGrid");
            if (grid) {
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        }

        var recordRiskConfig = 0;
        vm.countRiskConfig = 0;
        function fillDataRiskConfig(data) {
            vm.riskConfigGridOptions = kendoConfig.getGridOptions({
                autoBind: true,
                resizable: true,
                toolbar: [
                    {
                        name: "actions",
                        template:
                            '<div class=" pull-left con-md-2 ">' +
                            '<button  type="button" class="btn btn-qlk padding-search-right addQLK ng-scope" style="width: 120px; margin-top: 12px" ng-click="vm.create()">Thêm mới'+
                            '</button>' +
                            '</div>' + '<div class="form-group col-md-8">\n' +
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
                                '<div class="pull-right col-md-2">' +
                            '<div class="btn-group pull-right margin_top_button margin_right10">' +
                            '    <i data-toggle="dropdown" class="tooltip1" aria-expanded="false"><span class="tooltipArrow"></span><span class="tooltiptext" translate>Cài đặt</span><i class="fa fa-cog" aria-hidden="true"></i></i>' +
                            // '    <i class="tooltip1 action-button excelQLK" ng-click="vm.exportExcelGrid()"  aria-expanded="false"><span class="tooltipArrow"></span><span class="tooltiptext" translate>Xuất Excel</span></i>' +
                            '    <div class="dropdown-menu hold-on-click dropdown-checkboxes" role="menu">' +
                            '    <label ng-repeat="column in vm.riskConfigGrid.columns.slice(1,vm.riskConfigGrid.columns.length)| filter: vm.gridColumnShowHideFilter">' +
                            '    <input type="checkbox" checked="column.hidden" ng-click="vm.showHideColumn(column)"> {{column.title}}' +
                            '    </label>' +
                            '    </div></div>' +
                            '</div>' +
                            '                <div class="form-group col-md-5" align="right" id="hiden12">\n' +
                            '                    <i style="color: gray; margin-right:  50px;">Dung lượng <= 100MB, định dạng xls,xlsx</i>\n' +
                            '                </div>'
                    }
                ],
                dataBinding: function () {
                    recordRiskConfig = (this.dataSource.page() - 1) * this.dataSource.pageSize();
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
                            vm.countRiskConfig = response.total;
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
                            url: Constant.BASE_SERVICE_URL + "riskConfigRsService/doSearch",
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
                            return ++recordRiskConfig;
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
                        title: CommonService.translate("Mã rủi ro"),
                        field: 'code',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                        template: (dataItem)=>'<a ng-click="vm.detail(dataItem)">'+dataItem.code+'</a>',
                    },{
                        title: CommonService.translate("Tên rủi ro"),
                        field: 'name',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Loại rủi ro"),
                        field: 'riskType',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem => getRiskType(dataItem.riskType),
                    },
                    {
                        title: CommonService.translate("Nhóm rủi ro"),
                        field: 'groupType',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem => getGroupType(dataItem.riskType, dataItem.groupType),
                    },
                    // {
                    //     title: CommonService.translate("Cấp đơn vị"),
                    //     field: 'riskLevel',
                    //     width: "10%",
                    //     headerAttributes: {
                    //         style: "text-align:center;font-weight: bold;",
                    //         translate: ""
                    //     },
                    //     attributes: {
                    //         style: "text-align:center; white-space:normal"
                    //     },
                    //     template: dataItem => getRiskLevel(dataItem.riskLevel),
                    // },
                    // {
                    //     title: CommonService.translate("Mô tả rủi ro"),
                    //     field: 'descriptionRisk',
                    //     width: "30%",
                    //     headerAttributes: {
                    //         style: "text-align:center;font-weight: bold;",
                    //         translate: ""
                    //     },
                    //     attributes: {
                    //         style: "text-align:left; white-space:normal"
                    //     },
                    // },
                    {
                        title: CommonService.translate("Người tạo"),
                        field: 'createByName',
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
                        template: dataItem => getStatusName(dataItem.status)
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
            var templateUrl = 'ktnb/riskConfig/riskConfigPopup.html';
            var title = CommonService.translate("Chi tiết rủi ro");
            modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "50%", null, null);
            Restangular.all("riskConfigRsService/doSearchDetail").post(dataItem).then(function(data){
                vm.listDepartmentReceiveExportTemp = data.data;
                fillDataDepartmentReceive();
            }, function (err){
                toastr.error("Có lỗi xảy ra.");
            });
        }

        vm.create = function () {
            vm.type = 'create';
            vm.insertForm = {};
            vm.listDepartmentReceiveExportTemp = [];
            var templateUrl = 'ktnb/riskConfig/riskConfigPopup.html';
            var title = CommonService.translate("Thêm mới rủi ro");
            modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "50%", null, null);
            fillDataDepartmentReceive();
        }

        vm.update = function(dataItem){
            vm.type = 'update';
            vm.insertForm = angular.copy(dataItem);
            var templateUrl = 'ktnb/riskConfig/riskConfigPopup.html';
            var title = CommonService.translate("Cập nhật rủi ro");
            modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "50%", null, null);
            Restangular.all("riskConfigRsService/doSearchDetail").post(dataItem).then(function(data){
                vm.listDepartmentReceiveExportTemp = data.data;
                fillDataDepartmentReceive();
            }, function (err){
                toastr.error("Có lỗi xảy ra.");
            });
        }

        vm.remove = function(dataItem) {
            confirm(CommonService.translate("Bạn có chắc chắn muốn hết hiệu lực bản ghi này?"), function () {
                vm.insertForm = angular.copy(dataItem);
                kendo.ui.progress($(".tab-content"), true);
                riskConfigService.remove(vm.insertForm).then(function () {
                    toastr.success(CommonService.translate("Hết hiệu lực bản ghi thành công."));
                    vm.doSearch();
                    kendo.ui.progress($(".tab-content"), false);
                }, function (err) {
                    toastr.error(CommonService.translate("Có lỗi xảy ra."));
                    kendo.ui.progress($(".tab-content"), false);
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

        function fillDataDepartmentReceive(){
            $("#listDepartmentReceiveGrid").data("kendoGrid").dataSource.read();
            $("#listDepartmentReceiveGrid").data("kendoGrid").refresh();
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
        vm.openPopupSysGroup = function(){
            var templateUrl = "ktnb/popup/popupCommonSearch.html";
            var title = CommonService.translate("Tìm kiếm đơn vị");
            var windowId = "POPUP_SELECT_SYS_GROUP";
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
                vm.searchForm.createByName = dataItem.fullName;
                vm.searchForm.createBy = dataItem.sysUserId;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSysUserSearchDvg) {
                        vm.searchForm.createBy = null;
                        vm.searchForm.createByName = null;
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
                                keySearch: vm.searchForm.createByName,
                                page: 1,
                                pageSize: 10,
                                // groupLevelLst: [2]
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
            vm.searchForm.sysGroupId = dataItem.sysGroupId;
            vm.searchForm.sysGroupName = dataItem.sysGroupNameLv2;
            modal.dismiss();
        }

        vm.cancel = function () {
            $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
        }

        vm.clear = function(data) {
            switch (data){
                case 'keySearch': vm.searchForm.keySearch = null; break;
                case 'sysGroupSearch': vm.searchForm.sysGroupId = null; vm.searchForm.sysGroupName = null; break;
                case 'sysUserSearch': vm.searchForm.createBy = null; vm.searchForm.createByName = null; break;
                case 'insertDes': vm.insertForm.descriptionRisk = null; break;
                case 'insertName': vm.insertForm.name = null; break;
            }
        }

        vm.save = function(){
            if(vm.insertForm.code == null || vm.insertForm.code == ''){
                toastr.error(CommonService.translate('Mã rủi ro không được để trống.'));
                return;
            }
            if(vm.insertForm.name == null || vm.insertForm.name == ''){
                toastr.error(CommonService.translate('Tên rủi ro không được để trống.'));
                return;
            }
            if(vm.insertForm.riskType == null){
                toastr.error(CommonService.translate('Loại rủi ro không được để trống.'));
                return;
            }
            if(vm.insertForm.groupType == null){
                toastr.error(CommonService.translate('Nhóm rủi ro không được để trống.'));
                return;
            }
            // if(vm.insertForm.riskLevel == null){
            //     toastr.error(CommonService.translate('Cấp đơn vị không được để trống.'));
            //     return;
            // }
            // if(vm.insertForm.descriptionRisk == null || vm.insertForm.descriptionRisk == ''){
            //     toastr.error(CommonService.translate('Mô tả rủi ro không được để trống.'));
            //     return;
            // }
            // vm.insertForm.listAdd = $('#listDepartmentReceiveGrid').data('kendoGrid').dataSource._data;
            // for (let i = 0; i < vm.insertForm.listAdd.length-1; i++) {
            //     for (let j = i+1; j < vm.insertForm.listAdd.length; j++) {
            //         if(vm.insertForm.listAdd[i].sysGroupId == vm.insertForm.listAdd[j].sysGroupId){
            //             toastr.error("Đơn vị dòng "+(i+1)+' trùng với đơn vị dòng '+(j+1));
            //             return;
            //         }
            //     }
            // }
            kendo.ui.progress($('.k-window'), true);
            if(vm.type === 'create'){
                vm.insertForm.status = 1;
                // vm.insertForm.listAdd = $('#listDepartmentReceiveGrid').data('kendoGrid').dataSource._data;
                Restangular.all("riskConfigRsService/save").post(vm.insertForm).then(function(res){
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
                // vm.insertForm.listAdd = $('#listDepartmentReceiveGrid').data('kendoGrid').dataSource._data;
                Restangular.all("riskConfigRsService/update").post(vm.insertForm).then(function(res){
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

        vm.getExcelTemplate = function() {
            $http({
                url: Constant.BASE_SERVICE_URL + RestEndpoint.RISK_CONFIG_SERVICE_URL +"/exportFileBM",
                method: "POST",
                data: {},
                headers: {
                    'Content-type': 'application/json'
                },
                responseType: 'arraybuffer'
            }).success(function (data, status, headers, config) {
                saveFile(data,"Bieu_mau_import_danh_muc_rui_ro.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
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
                url: Constant.BASE_SERVICE_URL + RestEndpoint.RISK_CONFIG_SERVICE_URL + "/importExcel?folder=temp",
                type: "POST",
                data: formData,
                enctype: 'multipart/form-data',
                processData: false,
                contentType: false,
                cache: false,
                success: function (data) {
                    if (data.length == 0) {
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
                        var templateUrl = 'ktnb/riskConfig/riskConfigImportPopup.html';
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
                            return ++recordRiskConfig;
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
                        title: CommonService.translate("Tên rủi ro"),
                        field: 'name',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Mã rủi ro"),
                        field: 'code',
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
                        title: CommonService.translate("Loại rủi ro"),
                        field: 'riskType',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem => getRiskType(dataItem.riskType),
                    },
                    {
                        title: CommonService.translate("Nhóm rủi ro"),
                        field: 'groupType',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem => getGroupType(dataItem.riskType, dataItem.groupType),
                    },
                    // {
                    //     title: CommonService.translate("Mô tả rủi ro"),
                    //     field: 'descriptionRisk',
                    //     width: "30%",
                    //     headerAttributes: {
                    //         style: "text-align:center;font-weight: bold;",
                    //         translate: ""
                    //     },
                    //     attributes: {
                    //         style: "text-align:left; white-space:normal"
                    //     },
                    // },
                    {
                        title: CommonService.translate("Thao tác"),
                        field: 'choose',
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate:""
                        },
                        template: dataItem =>
                            '<div class="text-center #=assetLiquidateReqId#"">' +
                            '<button style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Xóa" translate ' +
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
            kendo.ui.progress($(".k-window"), true);
            Restangular.all("riskConfigRsService/submit").post({listAdd:vm.dataImport}).then(function (d) {
                toastr.success(CommonService.translate("Thêm mới bản ghi thành công!"));
                vm.doSearch();
                vm.cancel();
                kendo.ui.progress($(".k-window"), false);
            }).catch(function () {
                toastr.error(gettextCatalog.getString("Lỗi khi thêm mới!"));
                vm.doSearch();
                vm.cancel();
                kendo.ui.progress($(".k-window"), false);
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
            list = $("#riskConfigGrid2").data("kendoGrid").dataSource._data;
            kendo.ui.progress($(".k-window"), true);
            Restangular.all('riskConfigRsService/submitByImport').post(list).then(function(){
                toastr.success(CommonService.translate("Thêm mới bản ghi thành công!"));
                vm.doSearch();
                vm.cancel();
                kendo.ui.progress($(".k-window"), false);
                vm.doSearch();
            }).catch(function () {
                toastr.error(gettextCatalog.getString("Lỗi khi thêm mới!"));
                vm.doSearch();
                vm.cancel();
                kendo.ui.progress($(".k-window"), false);
            });
        }

        var recordDR = 0;
        function fillDataDepartmentReceive() {
            vm.listDepartmentReceiveGridOptions = kendoConfig.getGridOptions({
                autoBind: true,
                scrollable: true,
                resizable: true,
                sortable: false,
                columnMenu: false,
                serverPaging: true,
                editable: false,
                dataBinding: function () {
                    recordDR = (this.dataSource.page() - 1) * this.dataSource.pageSize();
                },
                // toolbar: [
                //     {
                //         name: "actions",
                //         template: '<div ng-hide="caller.type==\'detail\'" class="col-md-4" style="text-align: right"><label>Chọn đơn vị thực hiện</label></div>' +
                //             '<div ng-hide="caller.type==\'detail\'" class="col-md-5"><input class="form-control width100" type="text" k-options="caller.sgAutoCOptions" ' +
                //             'kendo-auto-complete ng-model="caller.sgForm.keySearch" id="autoCompleteSgAutoC"/></div>'
                //     }
                // ],
                dataSource: {
                    data: vm.listDepartmentReceiveExportTemp,
                    pageSize: 10
                },
                noRecords: true,
                messages: {
                    noRecords: CommonService.translate("Không có kết quả hiển thị")
                },
                pageable: {
                    refresh: false,
                    pageSizes: [5, 10, 15],
                    messages: {
                        display: CommonService.translate("{0}-{1} của {2} kết quả"),
                        itemsPerPage: CommonService.translate("kết quả/trang"),
                        empty: CommonService.translate("Không có kết quả hiển thị")
                    }
                },
                pageSize: 5,
                columns: [
                    {
                        title: CommonService.translate("STT"),
                        field: "stt",
                        template: function () {
                            return ++recordDR;
                        },
                        width: "50px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    }, {
                        title: CommonService.translate("Mã đơn vị"),
                        field: 'code',
                        width: "250px",
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        attributes: {
                            style: "text-align:left;"
                        },
                    },{
                        title: CommonService.translate("Tên đơn vị"),
                        field: 'name',
                        width: "250px",
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        attributes: {
                            style: "text-align:left;"
                        },
                    },
                    // {
                    //     title: CommonService.translate("Xóa"),
                    //     headerAttributes: {
                    //         style: "text-align:center; font-weight: bold",
                    //         translate: ""
                    //     },
                    //     template: dataItem =>
                    //         '<div class="text-center " > ' +
                    //         '<button ng-hide="caller.type==\'detail\'" style=" border: none;" class="icon_table" uib-tooltip="Xóa" ng-click="caller.removeRowDepartmentReceive(dataItem)"  translate>  ' +
                    //         '<i style="color: steelblue;" class="fa fa-trash" aria-hidden="true"></i>' +
                    //         '</button>' +
                    //         '</div>',
                    //     width: '30px',
                    //     field: "actions"
                    // }
                ]
            });
            try {
                $('#listDepartmentReceiveGrid').data('kendoGrid').dataSource.data(vm.listDepartmentReceiveExportTemp);
            } catch(exception){}
        }
        vm.isSelectSgAutoC = false;
        vm.sgAutoCOptions = {
            dataTextField: "name", placeholder: "Tên, Mã đơn vị",
            dataValueField: "sysGroupId",
            open: function (e) {
                vm.isSelectSgAutoC = false;
            },
            select: function (e) {
                vm.isSelectSgAutoC = true;
                var dataItem = this.dataItem(e.item.index());
                vm.sgForm.keySearch = null;
                if (vm.listDepartmentReceiveExportTemp.length > 0) {
                    for (var i = 0; i < vm.listDepartmentReceiveExportTemp.length; i++) {
                        if (dataItem.sysGroupId == vm.listDepartmentReceiveExportTemp[i].sysGroupId ) {
                            toastr.error("Đã tồn tại đơn vị trong danh sách!");
                            return;
                        }
                    }
                }
                let obj = {};
                obj.sysGroupId = dataItem.sysGroupId;
                obj.name = dataItem.name;
                obj.code = dataItem.code;
                vm.listDepartmentReceiveExportTemp.push(obj);
                vm.listDepartmentReceiveGrid.dataSource.data(vm.listDepartmentReceiveExportTemp);
                vm.listDepartmentReceiveGrid.refresh();
                console.log(vm.listDepartmentReceiveExportTemp);
                console.log(vm.insertForm.typeWo);
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSgAutoC) {
                        vm.sgForm.sysGroupId = null;
                        vm.sgForm.name = null;
                        vm.sgForm.keySearch = null;
                    }
                }, 100);
            },
            close: function (e) {
                $timeout(function () {
                    if (vm.sgForm.sysGroupId == null) {
                        vm.sgForm.sysGroupId = null;
                        vm.sgForm.name = null;
                        vm.sgForm.keySearch = null;
                    }
                }, 1000);

            },
            pageSize: 10,
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        vm.isSelectSgAutoC = false;
                        return Restangular.all("commonRsService/getSysGroupForAutoComplete").post(
                            {
                                keySearch: vm.sgForm.keySearch,
                                groupLevelLst: ['2', '3'],
                                page: 1,
                                pageSize: 30
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
                '<p class="col-md-6 text-header-auto border-right-ccc" translate>Mã đơn vị</p>' +
                '<p class="col-md-6 text-header-auto" translate>Tên đơn vị </p>' +
                '</div>'+
                '</div>',
            template: '<div class="row" ><div class="col-md-6 col-xs-5" style="float:left">#: data.code #</div><div  style="padding-left: 5px;width:auto;overflow: hidden"> #: data.name #</div> </div>',
        };

        vm.removeRowDepartmentReceive = function (dataItem) {
            confirm(CommonService.translate("Xác nhận xóa"), function () {
                $('#listDepartmentReceiveGrid').data('kendoGrid').dataSource.remove(dataItem);
                vm.listDepartmentReceiveExportTemp = $('#listDepartmentReceiveGrid').data('kendoGrid').dataSource._data;
            });
        }

        vm.getExcelTemplateSg = function () {
            $http({
                url: Constant.BASE_SERVICE_URL + RestEndpoint.WORK_ASSIGN_SERVICE_URL +"/exportFileBM",
                method: "POST",
                data: {},
                headers: {
                    'Content-type': 'application/json'
                },
                responseType: 'arraybuffer'
            }).success(function (data, status, headers, config) {
                saveFile(data,"BM_danhsachdonvinhanWO.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
            }).error(function (data, status, headers, config) {
                toastr.error("Có lỗi xảy ra! Vui lòng thử lại sau.");
            });

        };
        // function saveFile(data, filename, type) {
        //     var file = new Blob([data], {type: type});
        //     if (window.navigator.msSaveOrOpenBlob) // IE10+
        //         window.navigator.msSaveOrOpenBlob(file, filename);
        //     else { // Others
        //         var a = document.createElement("a"),
        //             url = URL.createObjectURL(file);
        //         a.href = url;
        //         a.download = filename;
        //         document.body.appendChild(a);
        //         a.click();
        //         setTimeout(function() {
        //             document.body.removeChild(a);
        //             window.URL.revokeObjectURL(url);
        //         }, 0);
        //     }
        // }

        // var modalInstanceImport;
        vm.submitImportNewTargetsSg = function () {
            vm.listDepartmentReceiveExportTemp = [];
            var element = $("#capNhatId");
            kendo.ui.progress(element, true);
            if ($("#fileChangeSg")[0].files[0] == null) {
                kendo.ui.progress(element, false);
                toastr.warning(CommonService.translate("Bạn chưa chọn file để import"));
                return;
            }
            if ($("#fileChangeSg")[0].files[0].name.split('.').pop() != 'xls' && $("#fileChangeSg")[0].files[0].name.split('.').pop() != 'xlsx') {
                kendo.ui.progress(element, false);
                toastr.warning(CommonService.translate("Sai định dạng file"));
                return;
            }
            var formData = new FormData();
            formData.append('multipartFile', $("#fileChangeSg")[0].files[0]);
            return $.ajax({
                url: Constant.BASE_SERVICE_URL + RestEndpoint.WORK_ASSIGN_SERVICE_URL + "/importExcel?folder=temp",
                type: "POST",
                data: formData,
                enctype: 'multipart/form-data',
                processData: false,
                contentType: false,
                cache: false,
                success: function (kq) {
                    var data=  kq.data ;
                    if (data == 'NO_CONTENT') {
                        vm.disableSubmit = false;
                        toastr.warning("File import không có nội dung");
                        kendo.ui.progress(element, false);
                    } else if (!!data.error) {
                        vm.disableSubmit = false;
                        toastr.error(data.error);
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
                        setTimeout(function () {
                            modalInstanceImport = CommonService.getModalInstance1();
                        }, 100);
                        fillDataImportErrTable(vm.lstErrImport);
                    } else {
                        kendo.ui.progress(element, false);
                        vm.disableSubmit = false;
                        vm.dataImport = kq;
                        for (let i = 0; i < data.length; i++) {
                            vm.listDepartmentReceiveExportTemp.push(data[i]);
                        }

                        fillDataDepartmentReceive();
                    }
                    $scope.$apply();
                }
            });
        }

        vm.exportExcelGrid =function () {
            kendo.ui.progress(vm.documentBody, true);
            var obj = angular.copy(vm.searchForm);
            obj.page = null;
            obj.pageSize = null;
            riskConfigService.doSearch(obj).then(function (d) {
                kendo.ui.progress(vm.documentBody, false);
                var data = d.data;
                CommonService.exportFile(vm.riskConfigGrid, data, vm.listRemove, vm.listConvert, CommonService.translate("Danh mục rủi ro"));
            });
        }

        vm.showHideColumn = function (column) {
            if (angular.isUndefined(column.hidden)) {
                vm.riskConfigGrid.hideColumn(column);
            } else if (column.hidden) {
                vm.riskConfigGrid.showColumn(column);
            } else {
                vm.riskConfigGrid.hideColumn(column);
            }
        };

        vm.changeType = function() {
            vm.insertForm.groupType = null;
            vm.insertForm.code = null;
        }

        vm.changeTypeSearch = function() {
            vm.searchForm.groupType = null;
        }

        vm.genCode = function() {
            if(vm.insertForm.riskType!=null && vm.insertForm.groupType!=null) {
                riskConfigService.genCode(vm.insertForm).then(function (d) {
                    vm.insertForm.code = d.code;
                });
            }
        }

        vm.genRiskConfigGroup = function() {
            if(vm.insertForm.riskLevel!=null) {
                riskConfigService.genRiskConfigGroup(vm.insertForm).then(function (d) {
                    vm.listDepartmentReceiveExportTemp = d.data;
                    fillDataDepartmentReceive();
                });
            }
        }
    }
})();