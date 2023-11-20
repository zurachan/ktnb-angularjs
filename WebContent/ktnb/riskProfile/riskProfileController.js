(function () {
    'use strict';
    var controllerId = 'riskProfileController';

    angular.module('MetronicApp').controller(controllerId, riskProfileController);

    function riskProfileController($scope,$http, $templateCache, $rootScope, $timeout, gettextCatalog,
                                   kendoConfig, $kWindow, $q, riskProfileService,
                                   CommonService, htmlCommonService, PopupConst, Restangular, RestEndpoint, Constant) {
        var vm = this;

        vm.documentBody = $("#riskProfile");
        vm.modalBody = ".k-window";
        vm.searchForm = {};
        vm.searchForm.status = 1;
        vm.insertForm = {};
        vm.insertForm.influenceLevelTa = null;
        vm.insertForm.influenceLevelTt = null;
        vm.insertForm.influenceLevelCn = null;
        vm.insertForm.possibilityTa = null;
        vm.insertForm.possibilityTt = null;
        vm.insertForm.possibilityCn = null;
        vm.modalAdd = null;
        vm.modalAdd1 = null;

        vm.listRemove = [{
            title: CommonService.translate("Thao tác"),
        }];

        vm.listConvert = [
            {
                field: "riskType",
                data: {
                    1: 'Rủi ro hoạt động',
                    2: 'Rủi ro tuân thủ',
                    3: 'Rủi ro tài chính',
                }
            },
            {
                field: "status",
                data: {
                    0: 'Hủy bỏ',
                    1: 'Lưu hành',
                }
            },
            {
                field: "statusApprovedDv",
                data: {
                    0: 'Chờ xác nhận',
                    1: 'Đã xác nhận',
                    2: 'Từ chối',
                }
            },
            {
                field: "statusApprovedKtnb",
                data: {
                    null: '',
                    0: 'Chờ xác nhận',
                    1: 'Đã xác nhận',
                    2: 'Từ chối',
                }
            },
        ];

        vm.listRiskLevel = [
            {code: 0, name: '1. TCT'},
            {code: 2, name: '2. TTKD'},
            {code: 3, name: '3. CNCT'},
            {code: 1, name: '4. KCQ'},
        ]

        vm.getRiskLevel = function(riskLevel) {
            if(riskLevel==0) return 'TCT';
            if(riskLevel==2) return 'TTKD';
            if(riskLevel==3) return 'CNCT';
            if(riskLevel==1) return 'KCQ';
            return '';
        }

        initForm();
        function initForm() {
            if ($rootScope.stringtile) {
                vm.string =  CommonService.translate("Quản trị rủi ro") + " > "+ CommonService.translate("Quản lý hồ sơ rủi ro");
            };
            fillDataRiskProfile([])
        }
        Restangular.all("commonRsService/checkPermission").post({sysUserId: Constant.user.vpsUserToken.sysUserId, adResourceCode:"RP_DV", operationCode:"APPROVED"}).then(function(d){
            vm.approveDvPermission = d;
            // vm.approveDvPermission = true;
            console.log(vm.approveDvPermission)
        }, function(){
            console.log('Có lỗi xảy ra khi check quyền');
        });
        Restangular.all("commonRsService/checkPermission").post({sysUserId: Constant.user.vpsUserToken.sysUserId, adResourceCode:"RP_KTNB", operationCode:"APPROVED"}).then(function(d){
            vm.approveKtnbPermission = d;
            // vm.approveKtnbPermission = true;
        }, function(){
            console.log('Có lỗi xảy ra khi check quyền');
        });

        vm.doSearch = function () {
            if(vm.searchForm.startDate!=null && vm.searchForm.endDate!=null) {
                var d1 = kendo.parseDate(vm.searchForm.startDate, "dd/MM/yyyy");
                var d2 = kendo.parseDate(vm.searchForm.endDate, "dd/MM/yyyy");
                if(d1>d2) {
                    toastr.error("Ngày bắt đầu tìm kiếm phải nhỏ hơn ngày kết thúc tìm kiếm");
                    return;
                }
            }
            var grid = $("#riskProfileGrid").data("kendoGrid");
            if (grid) {
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        }

        var record = 0;
        function fillDataRiskProfile(data) {
            vm.riskProfileGridOptions = kendoConfig.getGridOptions({
                autoBind: true,
                resizable: true,
                scrollable: true,
                toolbar: [
                    {
                        name: "actions",
                        template:
                            '<div class=" pull-left ">' +
                            '<button  type="button" class="btn btn-qlk padding-search-right addQLK ng-scope" style="width: 120px" ng-click="vm.openAdd()" translate>Thêm mới' +
                            '</button>' +
                            '</div>' +
                            // '<button  class="btn btn-qlk padding-search-right excelQLK ng-scope" style="width: 120px" ng-click="vm.openImportPopup()">Import File' +
                            // '</button>' +
                            '</div>'+
                            '<div class="form-group col-md-10">\n' +
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
                            '                </div>' +
                            '<div class="btn-group pull-right margin_top_button margin_right10">' +
                            '<i data-toggle="dropdown" class="tooltip1" aria-expanded="false"><span class="tooltipArrow"></span><span class="tooltiptext" translate>Cài đặt</span><i class="fa fa-cog" aria-hidden="true"></i></i>' +
                            '<i class="tooltip1 action-button excelQLK" ng-click="vm.exportExcelGrid()"  aria-expanded="false"><span class="tooltipArrow"></span><span class="tooltiptext" translate>Xuất Excel</span></i>' +
                            '<div class="dropdown-menu hold-on-click dropdown-checkboxes" role="menu">' +
                            '<label ng-repeat="column in vm.riskProfileGrid.columns.slice(1,vm.riskProfileGrid.columns.length)| filter: vm.gridColumnShowHideFilter">' +
                            '<input type="checkbox" checked="column.hidden" ng-click="vm.showHideColumn(column)"> {{column.title}}' +
                            '</label>' +
                            '</div></div>'
                    }
                ],
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
                            vm.countRiskProfile = response.total;
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
                            url: Constant.BASE_SERVICE_URL + "riskProfile/doSearch",
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
                messages: {
                    noRecords: CommonService.translate("Không có kết quả hiển thị")
                },
                pageable: {
                    refresh: false,
                    pageSizes: [5, 10, 15, 20, 25],
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
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; "
                        },
                    }, {
                        title: CommonService.translate("Mã rủi ro"),
                        field: 'code',
                        width: "80px",
                        template: '<a href="javascript:void(0);" title="#=code#" ng-click=vm.showDetail(dataItem)>#=code#</a>',
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                    }, {
                        title: CommonService.translate("Cấp đơn vị"),
                        field: 'riskLevel',
                        width: "80px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                        template: dataItem => vm.getRiskLevel(dataItem.riskLevel)
                    }, {
                        title: CommonService.translate("Tên rủi ro"),
                        field: 'name',
                        width: "200px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; white-space:normal; "
                        },
                    }, {
                        title: CommonService.translate("Loại rủi ro"),
                        field: 'riskType',
                        width: "150px",
                        template: function (dataItem) {
                            if (dataItem.riskType == 1) {
                                return CommonService.translate("Rủi ro hoạt động");
                            } else if (dataItem.riskType == 2) {
                                return CommonService.translate("Rủi ro tuân thủ");
                            } else if (dataItem.riskType == 3) {
                                return CommonService.translate("Rủi ro tài chính");
                            } else if (dataItem.riskType == 4) {
                                return CommonService.translate("Rủi ro chiến lược");
                            } else {
                                return "";
                            }
                        },
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                    },
                    {
                        title: CommonService.translate("Ngày tạo"),
                        field: 'createDate',
                        width: "120px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; "
                        },
                    },
                    {
                        title: CommonService.translate("Người tạo"),
                        field: 'createByName',
                        width: "120px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; white-space: normal;"
                        },
                    },
                    {
                        title: CommonService.translate("Ngày bắt đầu"),
                        field: 'startDate',
                        width: "120px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; "
                        },
                    },
                    {
                        title: CommonService.translate("Ngày kết thúc"),
                        field: 'endDate',
                        width: "120px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; "
                        },
                    },
                    {
                        title: CommonService.translate("Trạng thái"),
                        field: 'status',
                        width: "100px",
                        template: function (dataItem) {
                            if (dataItem.status == 0) {
                                return CommonService.translate("Hủy bỏ");
                            } else if (dataItem.status == 1) {
                                return CommonService.translate("Lưu hành");
                            } else {
                                return "";
                            }
                        },
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; "
                        },
                    },
                    {
                        title: CommonService.translate("Trạng thái đơn vị duyệt"),
                        field: 'statusApprovedDv',
                        width: "100px",
                        template: function (dataItem) {
                            if (dataItem.statusApprovedDv == 0) {
                                return CommonService.translate("Chờ xác nhận");
                            } else if (dataItem.statusApprovedDv == 1) {
                                return CommonService.translate("Đã xác nhận");
                            } else if (dataItem.statusApprovedDv == 2) {
                                return CommonService.translate("Từ chối");
                            } else {
                                return "";
                            }
                        },
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; "
                        },
                    },
                    {
                        title: CommonService.translate("Trạng thái KTNB duyệt"),
                        field: 'statusApprovedKtnb',
                        width: "100px",
                        template: function (dataItem) {
                            if (dataItem.statusApprovedKtnb == 0) {
                                return CommonService.translate("Chờ xác nhận");
                            } else if (dataItem.statusApprovedKtnb == 1) {
                                return CommonService.translate("Đã xác nhận");
                            } else if (dataItem.statusApprovedKtnb == 2) {
                                return CommonService.translate("Từ chối");
                            } else {
                                return "";
                            }
                        },
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; "
                        },
                    },
                    {
                        title: CommonService.translate("Thao tác"),
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; "
                        },
                        template: dataItem =>
                            '<div class="text-center">' +
                            '<button style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Sửa" translate ' +
                            'ng-click="vm.update(dataItem)" ng-if="dataItem.status == 1 && (dataItem.statusApprovedDv==2 || (dataItem.statusApprovedDv==1&&dataItem.statusApprovedKtnb==2)||dataItem.statusApprovedDv==0)"><i class="fa fa-pencil ng-scope" aria-hidden="true" translate></i></button>'
                            +
                            '<button style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Xóa" translate ' +
                            'ng-click="vm.remove(dataItem)" ng-if="dataItem.status == 1 && (dataItem.statusApprovedDv==2 || (dataItem.statusApprovedDv==1&&dataItem.statusApprovedKtnb==2)||dataItem.statusApprovedDv==0)"> <i style="color:steelblue;" class="fa fa-trash ng-scope" aria-hidden="true"></i></button>'
                            +
                            '<button  style=" border: none; background-color: white;" class="#=riskProfileId# icon_table ng-scope" uib-tooltip="DV duyệt" translate="" ' +
                            'ng-click="vm.openApprovePopup(dataItem, 1)" ng-if="dataItem.status == 1 && dataItem.statusApprovedDv == 0 && vm.approveDvPermission">' +
                            ' <i style="color:#53b453;" class="fa fa-check ng-scope" aria-hidden="true"></i>' +
                            '</button>'
                            +
                            '<button  style=" border: none; background-color: white;" class="#=riskProfileId# icon_table ng-scope" uib-tooltip="KTNB duyệt" translate="" ' +
                            'ng-click="vm.openApprovePopup(dataItem, 2)" ng-if="dataItem.status == 1 && dataItem.statusApprovedDv == 1 && dataItem.statusApprovedKtnb == 0 && vm.approveKtnbPermission">' +
                            ' <i style="color:#53b453;" class="fa fa-check ng-scope" aria-hidden="true"></i>' +
                            '</button>'
                            +
                            '</div>',

                        width: "200px",
                        field: "stt"
                    }
                ]
            });
        }

        vm.clear = function (data) {
            switch (data) {
                case 'search_keySearch': {
                    vm.searchForm.keySearch = null;
                    break;
                }
                case 'sysGroupSearch': {
                    vm.searchForm.sysGroupId = null;
                    vm.searchForm.sysGroupName = null;
                    break;
                }
                case 'sysGroupPsInsert': {
                    vm.insertForm.sysGroupId = null;
                    vm.insertForm.sysGroupName = null;
                    break;
                }
                case 'dateSearch': {
                    vm.searchForm.startDate = null;
                    vm.searchForm.endDate = null;
                    break;
                }
            }
        }

        vm.save = function () {
            if (vm.insertForm.groupType == null || vm.insertForm.groupType == "") {
                toastr.error(CommonService.translate("Nhóm rủi ro không được để trống"));
                return;
            }

            if (vm.insertForm.name == null || vm.insertForm.name == "") {
                toastr.error(CommonService.translate("Tên rủi ro không được để trống"));
                return;
            }
            if (vm.insertForm.riskType == null || vm.insertForm.riskType == "") {
                toastr.error(CommonService.translate("Loại rủi ro không được để trống"));
                return;
            }
            if (vm.insertForm.descriptionRisk == null || vm.insertForm.descriptionRisk == "") {
                toastr.error(CommonService.translate("Mô tả rủi ro không được để trống"));
                return;
            }
            if (vm.insertForm.sysGroupId == null || vm.insertForm.sysGroupId == "") {
                toastr.error(CommonService.translate("Đơn vị sở hữu rủi ro không được để trống"));
                return;
            }
            if (vm.insertForm.startDate == null) {
                toastr.error(CommonService.translate("Từ ngày không được để trống"));
                return;
            }
            if (vm.insertForm.endDate == null) {
                toastr.error(CommonService.translate("Đến ngày không được để trống"));
                return;
            }
            var d1 = kendo.parseDate(vm.insertForm.startDate, "dd/MM/yyyy");
            var d2 = kendo.parseDate(vm.insertForm.endDate, "dd/MM/yyyy");
            var curdate = new Date();
            curdate.setHours(0, 0, 0, 0);
            var sysDate = kendo.parseDate(curdate, "dd/MM/yyyy");
            if (d2 != null && d1 > d2) {
                toastr.error("Ngày bắt đầu phải nhỏ hơn ngày kết thúc");
                return;
            }
            if (d1 < sysDate + 1) {
                toastr.error("Ngày bắt đầu phải lớn hơn ngày hiện tại");
                return;
            }
            if (vm.insertForm.influenceLevelTa == null || vm.insertForm.influenceLevelTa == "") {
                toastr.error(CommonService.translate("Mức độ ảnh hưởng tiềm ẩn không được để trống"));
                return;
            }
            if (vm.insertForm.possibilityTa == null || vm.insertForm.possibilityTa == "") {
                toastr.error(CommonService.translate("Khả năng xảy ra tiềm ẩn không được để trống"));
                return;
            }
            if (vm.insertForm.statusTa == null || vm.insertForm.statusTa == "") {
                toastr.error(CommonService.translate("Trạng thái rủi ro tiềm ẩn không được để trống"));
                return;
            }
            if (vm.insertForm.influenceLevelTt == null || vm.insertForm.influenceLevelTt == "") {
                toastr.error(CommonService.translate("Mức độ ảnh hưởng thực tế không được để trống"));
                return;
            }
            if (vm.insertForm.possibilityTt == null || vm.insertForm.possibilityTt == "") {
                toastr.error(CommonService.translate("Khả năng xảy ra thực tế không được để trống"));
                return;
            }
            if (vm.insertForm.statusTt == null || vm.insertForm.statusTt == "") {
                toastr.error(CommonService.translate("Trạng thái rủi ro thực tế không được để trống"));
                return;
            }
            if (vm.insertForm.influenceLevelCn == null || vm.insertForm.influenceLevelCn == "") {
                toastr.error(CommonService.translate("Mức độ ảnh hưởng chấp nhận không được để trống"));
                return;
            }
            if (vm.insertForm.possibilityCn == null || vm.insertForm.possibilityCn == "") {
                toastr.error(CommonService.translate("Khả năng xảy ra chấp nhận không được để trống"));
                return;
            }
            if (vm.insertForm.statusTtCn == null || vm.insertForm.statusTtCn == "") {
                toastr.error(CommonService.translate("Trạng thái rủi ro chấp nhận không được để trống"));
                return;
            }
            if (vm.insertForm.reasonDescription == null || vm.insertForm.reasonDescription == "") {
                toastr.error(CommonService.translate("Nguyên nhân rủi ro không được để trống"));
                return;
            }
            $("#sav")[0].disabled = true;
            if (vm.isCreateForm) {
                riskProfileService.save(vm.insertForm).then(function () {
                    toastr.success(CommonService.translate("Thêm mới bản ghi thành công"));
                    vm.cancel();
                    vm.doSearch();
                }, function (err) {
                    toastr.error(CommonService.translate("Có lỗi xảy ra"));
                    $("#sav")[0].disabled = false;
                });
            } else {
                if(vm.insertForm.statusApprovedDv==2){
                    vm.insertForm.statusApprovedDv = 0;
                }
                // else if(vm.insertForm.statusApprovedKtnb==2){
                //     vm.insertForm.statusApprovedKtnb = 0;
                // }
                riskProfileService.update(vm.insertForm).then(function () {
                    toastr.success(CommonService.translate("Cập nhật bản ghi thành công"));
                    vm.cancel();
                    vm.doSearch();
                }, function (err) {
                    toastr.error(CommonService.translate("Có lỗi xảy ra"));
                    $("#sav")[0].disabled = false;
                });
            }
        }


        vm.cancel = function () {
            setTimeout(function () {
                if (vm.modalAdd1 != null) {vm.modalAdd1.dismiss();vm.modalAdd1 = null}
                else if (vm.modalAdd != null){vm.modalAdd.dismiss();vm.modalAdd = null;}
                else if (modalAdd != null){modalAdd.dismiss();modalAdd = null;}
            },200)
        };

        vm.isCreateForm = true;
        vm.checkViewDetail = false;
        vm.openAdd = function () {
            vm.showButtonSaveUpdate = true;
            vm.isView = false;
            vm.isEdit = false;
            vm.isCreateForm = true;
            vm.isUpdateForm = false;
            vm.showButtonApproveDv = false;
            vm.showButtonApproveKtnb = false;
            vm.insertForm = {};
            var templateUrl = 'ktnb/riskProfile/riskProfilePopup.html';
            var title = CommonService.translate("Thêm mới hồ sơ rủi ro");
            vm.modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "80%", null, null);
        }
        vm.update = function (dataItem) {
            vm.showButtonSaveUpdate = true;
            vm.isView = false;
            vm.isEdit = true;
            vm.showButtonApproveDv = false;
            vm.showButtonApproveKtnb = false;
            vm.isCreateForm = false;
            vm.isUpdateForm = true;
            dataItem.typeFile = "WOKTNB";
            vm.insertForm = angular.copy(dataItem);
            var templateUrl = 'ktnb/riskProfile/riskProfilePopup.html';
            var title = CommonService.translate("Cập nhật hồ sơ rủi ro");
            vm.modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "80%", null, null);
        }

        vm.showDetail = function (dataItem) {
            vm.showButtonSaveUpdate = false;
            vm.isView = true;
            vm.isEdit = false;
            vm.showButtonApproveDv = false;
            vm.showButtonApproveKtnb = false;
            vm.isCreateForm = false;
            vm.isUpdateForm = false;
            dataItem.typeFile = "WOKTNB";
            vm.insertForm = angular.copy(dataItem);
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
            riskProfileService.genRiskConfigGroup(vm.insertForm).then(function (d){
                vm.listSysGroup = d.data;
            });
            vm.riskProfile("ta");
            vm.riskProfile("tt");
            vm.riskProfile("cn");
            var templateUrl = 'ktnb/riskProfile/riskProfilePopup.html';
            var title = CommonService.translate("Chi tiết hồ sơ rủi ro");
            vm.modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "80%", null, null);
        }

        vm.sysGroupPsInsertOptions = {
            clearButton: false,
            dataTextField: "name",
            select: function(e) {
                vm.selectedSysGroupPsInsert = true;
                var dataItem = this.dataItem(e.item.index());
                vm.insertForm.sysGroupName = dataItem.name;
                vm.insertForm.sysGroupId = dataItem.sysGroupId;
                var obj = {};
                obj.sysGroupId = dataItem.sysGroupId;
                riskProfileService.getCode(obj).then(function (d) {
                    vm.insertForm.code = d;
                })
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
                            keySearch: $("#insertRiskProfileSysGroupPs").val().trim(),
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
                    vm.insertForm.sysGroupName = null;
                    vm.insertForm.sysGroupId = null;
                }
            },
            ignoreCase: false
        }
        vm.sysGroupSearchOptions = {
            clearButton: false,
            dataTextField: "name",
            select: function(e) {
                vm.selectedSysGroupSearch = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchForm.sysGroupName = dataItem.name;
                vm.searchForm.sysGroupId = dataItem.sysGroupId;
            },
            pageSize: 10,
            open: function(e) {
                vm.selectedSysGroupSearch = false;
            },
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function(options) {
                        vm.selectedSysGroupSearch = false;
                        return Restangular.all("dataDamageRsServiceRest/getSysGroup").post({
                            pageSize: 15,
                            page: 1,
                            keySearch: $("#searchSysGroup").val().trim(),
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
                if (!vm.selectedSysGroupSearch) {
                    vm.searchForm.sysGroupName = null;
                    vm.searchForm.sysGroupId = null;
                }
            },
            ignoreCase: false
        }

        vm.riskProfile = function (data) {
            console.log(data)
            switch (data) {
                case 'ta': {
                    if (vm.insertForm.influenceLevelTa != null && vm.insertForm.possibilityTa != null) {
                        var temp = parseInt(vm.insertForm.influenceLevelTa) + parseInt(vm.insertForm.possibilityTa);
                        if (vm.insertForm.influenceLevelTa === '5' && vm.insertForm.possibilityTa === '1') {
                            vm.insertForm.statusTa = 5;
                        } else if (temp > 1 && temp <= 3) {
                            vm.insertForm.statusTa = 1;
                        } else if (temp > 3 && temp <= 6) {
                            vm.insertForm.statusTa = 2;
                        } else if (temp > 6 && temp <= 8) {
                            vm.insertForm.statusTa = 3;
                        } else if (temp > 8 && temp <= 10) {
                            vm.insertForm.statusTa = 4;
                        }
                    }
                    console.log("ta: " + vm.insertForm.statusTa)
                    break;
                }
                case 'tt': {
                    if (vm.insertForm.influenceLevelTt != null && vm.insertForm.possibilityTt != null) {
                        var temp = parseInt(vm.insertForm.influenceLevelTt) + parseInt(vm.insertForm.possibilityTt);
                        if (vm.insertForm.influenceLevelTt === '5' && vm.insertForm.possibilityTt === '1') {
                            vm.insertForm.statusTt = 5;
                        } else if (temp > 1 && temp <= 3) {
                            vm.insertForm.statusTt = 1;
                        } else if (temp > 3 && temp <= 6) {
                            vm.insertForm.statusTt = 2;
                        } else if (temp > 6 && temp <= 8) {
                            vm.insertForm.statusTt = 3;
                        } else if (temp > 8 && temp <= 10) {
                            vm.insertForm.statusTt = 4;
                        }
                    }
                    console.log("tt: " + vm.insertForm.statusTt + "," + temp)
                    break;
                }
                case 'cn': {
                    if (vm.insertForm.influenceLevelCn != null && vm.insertForm.possibilityCn != null) {
                        var temp = parseInt(vm.insertForm.influenceLevelCn) + parseInt(vm.insertForm.possibilityCn);
                        if (vm.insertForm.influenceLevelCn === '5' && vm.insertForm.possibilityCn === '1') {
                            vm.insertForm.statusTtCn = 5;
                        } else if (temp > 1 && temp <= 3) {
                            vm.insertForm.statusTtCn = 1;
                        } else if (temp > 3 && temp <= 6) {
                            vm.insertForm.statusTtCn = 2;
                        } else if (temp > 6 && temp <= 8) {
                            vm.insertForm.statusTtCn = 3;
                        } else if (temp > 8 && temp <= 10) {
                            vm.insertForm.statusTtCn = 4;
                        }
                    }
                    console.log("cn: " + vm.insertForm.statusTtCn)
                    break;
                }
            }
        }

        vm.remove = function (dataItem){
            confirm(CommonService.translate("Bạn có chắc chắn muốn xóa bản ghi này?"), function () {
                vm.insertForm = angular.copy(dataItem);
                kendo.ui.progress(vm.documentBody, true);
                riskProfileService.remove(vm.insertForm).then(function () {
                    toastr.success(CommonService.translate("Xóa bản ghi thành công"));
                    vm.doSearch();
                    kendo.ui.progress(vm.documentBody, false);
                }, function (err) {
                    toastr.error(CommonService.translate("Có lỗi xảy ra"));
                    kendo.ui.progress(vm.documentBody, false);
                });
            });
        };
        vm.doSearchSysGroupSearchPopup = function(){
            var grid = vm.sysGGridSearch;
            if(grid){
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        }

        vm.openApprovePopup = function (dataItem, type) {
            vm.flagApprovePopup = type;
            vm.isView = true;
            vm.isCreateForm = false;
            vm.isEdit = false;
            vm.showButtonSaveUpdate = false;
            vm.showButtonApproveDv = false;
            vm.showButtonApproveKtnb = false;
            vm.insertForm = angular.copy(dataItem);
            var title="";
            if (type == 1) {
                vm.showButtonApproveDv = true;
                title="Xác nhận duyệt đơn vị";
                openPopupHtml(title, vm);
            } else if (type == 2) {
                vm.showButtonApproveKtnb = true;
                title="Quản trị rủi ro duyệt Giai Đoạn 2";
                openPopupHtml(title, vm);
            }
        }

        function openPopupHtml(title, vm) {
            var templateUrl="ktnb/riskProfile/riskProfilePopup.html";
            var windowId="APPROVE_DV";
            CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "80%", null, null);
        }

        var modalCancelApproveDv = null;
        vm.cancelApproveDv = function () {
            var templateUrl = 'ktnb/riskProfile/popupCancel.html';
            var title = CommonService.translate("Từ chối");
            vm.reasonReject = null;
            modalCancelApproveDv = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "30%", "20%", null, null);
        }

        vm.cancelApproveKtnb = function () {
            var templateUrl = 'ktnb/riskProfile/popupCancel.html';
            var title = CommonService.translate("Từ chối");
            vm.reasonReject = null;
            modalCancelApproveDv = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "30%", "20%", null, null);
        }

        vm.cancelPopupReject = function () {
            modalCancelApproveDv.dismiss();
        }

        vm.saveCancelStatus = function() {
            if (vm.flagApprovePopup === 1) {
                vm.insertForm.cancelDvDescription = vm.reasonReject;
                if (vm.insertForm.cancelDvDescription == null || vm.insertForm.cancelDvDescription.trim() == "") {
                    toastr.error(CommonService.translate("Lý do không được để trống"));
                    $("#reasonReject").focus();
                    return;
                }
                kendo.ui.progress($("#ktnb_popup_Cancel"), true);
                riskProfileService.cancelApproveDv(vm.insertForm).then(function (res) {
                    if (res && res.error) {
                        toastr.error(CommonService.translate(res.error));
                        kendo.ui.progress($("#ktnb_popup_Cancel"), true);
                        return;
                    }
                    toastr.success(CommonService.translate("Từ chối bản ghi thành công"));
                    vm.doSearch();
                    kendo.ui.progress($("#ktnb_popup_Cancel"), true);
                    $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
                });
            } else if (vm.flagApprovePopup === 2) {
                vm.insertForm.cancelKtnbDescription = vm.reasonReject;
                if (vm.insertForm.cancelKtnbDescription == null || vm.insertForm.cancelKtnbDescription.trim() === "") {
                    toastr.error(CommonService.translate("Lý do không được để trống"));
                    $("#reasonReject").focus();
                    return;
                }
                kendo.ui.progress($("#ktnb_popup_Cancel"), true);
                riskProfileService.cancelApproveKtnb(vm.insertForm).then(function (res) {
                    if (res && res.error) {
                        toastr.error(CommonService.translate(res.error));
                        kendo.ui.progress($("#ktnb_popup_Cancel"), true);
                        return;
                    }
                    toastr.success(CommonService.translate("Từ chối thành công"));
                    vm.doSearch();
                    kendo.ui.progress($("#ktnb_popup_Cancel"), true);
                    $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
                });
            }
        }
        vm.saveApproveDv = function() {
            kendo.ui.progress($("#riskProfile_import_popupId"), true);
            riskProfileService.saveApproveDv(vm.insertForm).then(function (res) {
                if (res && res.error) {
                    toastr.error(CommonService.translate(res.error));
                    kendo.ui.progress($("#riskProfile_import_popupId"), false);
                    return;
                }
                toastr.success(CommonService.translate("Duyệt bản ghi thành công"));
                vm.doSearch();
                kendo.ui.progress($("#riskProfile_import_popupId"), false);
                $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
            });
        }

        vm.saveApproveKtnb = function() {
            kendo.ui.progress($("#riskProfile_import_popupId"), true);
            riskProfileService.saveApproveKtnb(vm.insertForm).then(function (res) {
                if (res && res.error) {
                    toastr.error(CommonService.translate(res.error));
                    kendo.ui.progress($("#riskProfile_import_popupId"), false);
                    return;
                }
                toastr.success(CommonService.translate("Duyệt bản ghi thành công"));
                vm.doSearch();
                kendo.ui.progress($("#riskProfile_import_popupId"), false);
                $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
            });
        }

        vm.exportExcelGrid =function () {
            kendo.ui.progress(vm.documentBody, true);
            var obj = angular.copy(vm.searchForm);
            obj.page = null;
            obj.pageSize = null;
            riskProfileService.doSearch(obj).then(function (d) {
                kendo.ui.progress(vm.documentBody, false);
                var data = d.data;
                CommonService.exportFile(vm.riskProfileGrid, data, vm.listRemove, vm.listConvert, CommonService.translate("Hồ sơ rủi ro."));
            });
        }

        vm.showHideColumn = function (column) {
            if (angular.isUndefined(column.hidden)) {
                vm.riskProfileGrid.hideColumn(column);
            } else if (column.hidden) {
                vm.riskProfileGrid.showColumn(column);
            } else {
                vm.riskProfileGrid.hideColumn(column);
            }
        };

        vm.openPopupSysGroup = function (data) {
            vm.flagRp = data
            var templateUrl = "ktnb/popup/popupCommonSearch.html";
            var title = CommonService.translate("Tìm kiếm đơn vị");
            var windowId = "POPUP_SELECT_SYS_GROUP";
            vm.placeHolder = CommonService.translate("Mã/tên đơn vị");
            CommonService.populatePopupCreate(templateUrl, title, null, vm, windowId, null, '60%', '50%', null);
            setTimeout(function () {
                vm.modalAdd = CommonService.getModalInstance1();
            }, 100);
            vm.commonPopupSearch = {};
            var api = "commonRsService/getSysGroupForAutoComplete";
            CommonService.fillDataPopupCommonSearch(api, vm.commonPopupSearch, sysGroupColumns, vm);
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
                width: "50px",
                headerAttributes: {
                    style: "text-align:center;", translate: "",
                },
                attributes: {
                    style: "text-align:center;"
                },
            }, {
                title: CommonService.translate("Mã đơn vị"),
                field: 'code',
                width: "200px",
                headerAttributes: {
                    style: "text-align:center;", translate: "",
                },
                attributes: {
                    style: "text-align:left;"
                },
            }, {
                title: CommonService.translate("Tên đơn vị"),
                field: 'name',
                width: "350px",
                headerAttributes: {
                    style: "text-align:center;", translate: "",
                },
                attributes: {
                    style: "text-align:left;"
                },
            }, {
                title: CommonService.translate("Chọn"),
                field: 'choose',
                width: "100px",
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

        vm.saveSelectSysGroup = function (dataItem) {
            if (vm.flagRp == 'psInsert') {
                vm.insertForm.sysGroupName = dataItem.name;
                vm.insertForm.sysGroupId = dataItem.sysGroupId;
                var obj = {};
                obj.sysGroupId = dataItem.sysGroupId;
                riskProfileService.getCode(obj).then(function (d) {
                    vm.insertForm.code = d;
                })
            } else if (vm.flagRp == 'sgSearch') {
                vm.searchForm.sysGroupName = dataItem.name;
                vm.searchForm.sysGroupId = dataItem.sysGroupId;
            }
            vm.cancel();
        };
        vm.doSearchCommonPopup = function () {
            var grid = $("#commonSearchPopupGrid").data("kendoGrid");
            if (grid) {
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        }

        vm.listSysGroup = [];
        vm.listGroupType = [];

        vm.changeLevel = function() {
            if (vm.insertForm.riskType == null) {
                vm.insertForm.sysGroupId = null;
                // vm.listGroupType = [];
                vm.insertForm.code = null;
            }
            // else if (vm.insertForm.riskType == 1) {
            //     vm.listGroupType = [
            //         {code: 1, name: '1. Con người'},
            //         {code: 2, name: '2. Quy trình/Quy định/Cơ chế'},
            //         {code: 3, name: '3. Tính liên tục của hoạt động kinh doanh'},
            //         {code: 4, name: '4. Hệ thống thông tin và mạng'},
            //         {code: 5, name: '5. Tranh chấp & Kiện cáo'},
            //         {code: 6, name: '6. Báo cáo và Kiểm soát tài chính'},
            //     ];
            // } else if (vm.insertForm.riskType == 2) {
            //     vm.listGroupType = [
            //         {code: 1, name: '1. Vi phạm pháp luật'},
            //     ];
            // } else if (vm.insertForm.riskType == 3) {
            //     vm.listGroupType = [
            //         {code: 1, name: '1. Tín dụng'},
            //         {code: 2, name: '2. Thanh khoản'},
            //     ];
            // } else if (vm.insertForm.riskType == 4) {
            //     vm.listGroupType = [
            //         {code: 1, name: '1. Môi trường vĩ mô'},
            //         {code: 2, name: '2. Định hướng chiến lược'},
            //     ];
            // }
            if (vm.insertForm.riskType != null) {
                riskProfileService.genRiskConfigGroup(vm.insertForm).then(function (d){
                    vm.listSysGroup = d.data;
                });
            }
        }

        vm.isSelectRiskSearchDvg = false;
        vm.riskSearchOptions = {
            clearButton: false,
            dataTextField: "name",
            placeholder: CommonService.translate("Nhập mã hoặc tên rủi ro"),
            dataValueField: "name",
            open: function (e) {
                vm.isSelectRiskSearchDvg = false;
            },
            select: function (e) {
                vm.isSelectRiskSearchDvg = true;
                var dataItem = this.dataItem(e.item.index());
                vm.insertForm.name = dataItem.name;
                vm.insertForm.configCode = dataItem.code;
                vm.insertForm.riskType = dataItem.riskType;
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
                        {code: 2, name: '3. Thị trường'},
                    ];
                } else if (vm.insertForm.riskType == 4) {
                    vm.listGroupType = [
                        {code: 1, name: '1. Môi trường vĩ mô'},
                        {code: 2, name: '2. Định hướng chiến lược'},
                    ];
                }
                riskProfileService.genRiskConfigGroup(vm.insertForm).then(function (d){
                    vm.listSysGroup = d.data;
                });
                vm.insertForm.groupType = dataItem.groupType;
                // vm.insertForm.descriptionRisk = dataItem.descriptionRisk;
                vm.insertForm.riskConfigId = dataItem.riskConfigId;
                // vm.insertForm.riskLevel = dataItem.riskLevel;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectRiskSearchDvg) {
                        vm.insertForm.name = null;
                        vm.insertForm.configCode = null;
                        vm.insertForm.groupType = null;
                        vm.insertForm.riskType = null;
                        // vm.insertForm.descriptionRisk = null;
                        vm.insertForm.riskConfigId = null;
                        // vm.insertForm.riskLevel = null;
                        vm.insertForm.code = null;
                        vm.insertForm.sysGroupId = null;
                        vm.listGroupType = [];
                        vm.listSysGroup = [];
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
                        vm.isSelectRiskSearchDvg = false;
                        return Restangular.all("riskConfigRsService/doSearch").post(
                            {
                                keySearch: vm.insertForm.name,
                                page: 1,
                                pageSize: 10,
                                // sysGroupId: Constant.user.VpsUserInfo.sysGroupId,
                                status: 1,
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
                '<p class="col-md-6 text-header-auto border-right-ccc bold" translate>Mã rủi ro</p>' +
                '<p class="col-md-6 text-header-auto bold" translate>Tên rủi ro</p>' +
                '</div>' +
                '</div>',
            template: '<div class="row" ><div class="col-md-6 col-xs-5" style="float:left">#: data.code #</div><div  style="padding-left: 5px;width:auto;overflow: hidden"> #: data.name #</div> </div>',
        }

        var modal = null;
        vm.openPopupRisk = function(){
            var templateUrl = "ktnb/popup/popupCommonSearch.html";
            var title = CommonService.translate("Tìm kiếm rủi ro");
            var windowId = "POPUP_SELECT_RISK";
            vm.placeHolder = CommonService.translate("Mã/tên rủi ro");
            CommonService.populatePopupCreate(templateUrl, title, null, vm, windowId, null, '60%', '50%', null);
            setTimeout(function () {
                modal = CommonService.getModalInstance1();
            }, 100);
            vm.commonPopupSearch = {status: 1,};
            var api = "riskConfigRsService/doSearch";
            CommonService.fillDataPopupCommonSearch(api, vm.commonPopupSearch, riskSearchColumns, vm);
        }

        // function getGroupType(value){
        //     switch (value){
        //         case 1: return 'Con người'; break;
        //         case 2: return 'Quy trình/Quy định/Cơ chế'; break;
        //         case 3: return 'Tính liên tục của hoạt động kinh doanh'; break;
        //         case 4: return 'Hệ thống thông tin và mạng'; break;
        //         case 5: return 'Tranh chấp & Kiện cáo'; break;
        //         case 6: return 'Báo cáo và Kiểm soát tài chính'; break;
        //         case 7: return 'Bên ngoài'; break;
        //         case 8: return 'Tín dụng'; break;
        //         case 9: return 'Thanh khoản'; break;
        //         case 10: return 'Vi phạm pháp luật'; break;
        //         case 11: return 'Môi trường vĩ mô'; break;
        //         case 12: return 'Định hướng chiến lược'; break;
        //         default: return ''; break;
        //     }
        // }
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

        var riskSearchColumns = [
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
                title: CommonService.translate("Chọn"),
                field: 'choose',
                width: "10%",
                template:
                    '<div class="text-center "> ' +
                    '	<a  type="button" class=" icon_table" uib-tooltip="Chọn" translate>' +
                    '	   <i ng-click="caller.saveSelectRiskSearch(dataItem)" class="fa fa-check color-green" aria-hidden="true"></i> ' +
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

        vm.saveSelectRiskSearch = function (dataItem) {
            vm.insertForm.name = dataItem.name;
            vm.insertForm.configCode = dataItem.code;
            vm.insertForm.groupType = dataItem.groupType;
            vm.insertForm.riskType = dataItem.riskType;
            // vm.insertForm.descriptionRisk = dataItem.descriptionRisk;
            vm.insertForm.riskConfigId = dataItem.riskConfigId;
            // vm.insertForm.riskLevel = dataItem.riskLevel;
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
            riskProfileService.genRiskConfigGroup(vm.insertForm).then(function (d){
                vm.listSysGroup = d.data;
            });
            modal.dismiss();
        }

        vm.getExcelTemplate = function() {
            $http({
                url: Constant.BASE_SERVICE_URL + "riskProfile" +"/exportFileBM",
                method: "POST",
                data: {},
                headers: {
                    'Content-type': 'application/json'
                },
                responseType: 'arraybuffer'
            }).success(function (data, status, headers, config) {
                saveFile(data,"BM_Import_HSRR.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
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
        var modalAdd;
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
                url: Constant.BASE_SERVICE_URL + "riskProfile" + "/importExcel?folder=temp",
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

                        setTimeout(function () {
                            modalInstanceImport = CommonService.getModalInstance1();
                        }, 100);
                        fillDataImportErrTable(vm.lstErrImport);
                    } else {
                        kendo.ui.progress(element, false);
                        vm.disableSubmit = false;
                        vm.dataImport = data;
                        var templateUrl = 'ktnb/riskProfile/riskProfileImportPopup.html';
                        var title = CommonService.translate("Xác nhận thêm dữ liệu");
                        modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "50%", null, null);
                        fillDataImportResTable(vm.dataImport);
                    }
                    $("#fileChange").val("");
                    $scope.$apply();
                },
            });
        }

        var recordRiskIndex = 0;
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
                            return ++recordRiskIndex;
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
                        title: CommonService.translate("Mã rủi ro"),
                        field: 'code',
                        width: "80px",
                        template: '<a href="javascript:void(0);" title="#=code#" ng-click=caller.showDetail(dataItem)>#=code#</a>',
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                    }, {
                        title: CommonService.translate("Tên rủi ro"),
                        field: 'name',
                        width: "200px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; white-space:normal; "
                        },
                    }, {
                        title: CommonService.translate("Loại rủi ro"),
                        field: 'riskType',
                        width: "150px",
                        template: function (dataItem) {
                            if (dataItem.riskType == 1) {
                                return CommonService.translate("Rủi ro hoạt động");
                            } else if (dataItem.riskType == 2) {
                                return CommonService.translate("Rủi ro tuân thủ");
                            } else if (dataItem.riskType == 3) {
                                return CommonService.translate("Rủi ro tài chính");
                            } else if (dataItem.riskType == 4) {
                                return CommonService.translate("Rủi ro chiến lược");
                            } else {
                                return "";
                            }
                        },
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
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
                            '<div class="text-center #=assetLiquidateReqId#">' +
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

        vm.removeItem = function(dataItem){
            $("#riskIndexGrid2").data("kendoGrid").dataSource.remove(dataItem);
            vm.dataImport = $("#riskIndexGrid2").data("kendoGrid").dataSource._data;
            $("#riskIndexGrid2").data("kendoGrid").refresh();
        }

        vm.submitByImport = function (){
            var list = [];
            list = $("#riskIndexGrid2").data("kendoGrid").dataSource._data;
            kendo.ui.progress($(".k-window"), true);
            Restangular.all('riskProfile/submitByImport').post(list).then(function(){
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

        vm.genCode = function() {
            if(vm.insertForm.sysGroupId!=null && vm.insertForm.riskConfigId!=null) {
                riskProfileService.genCode(vm.insertForm).then(function(d) {
                    vm.insertForm.code = d.code;
                });
            }
        }
    }
})();
