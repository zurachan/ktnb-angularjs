(function () {
    'use strict';
    var controllerId = 'workAssignController';

    angular.module('MetronicApp').controller(controllerId, workAssignController);

    function workAssignController($scope, $http, $templateCache, $rootScope, $timeout, gettextCatalog,
                                  kendoConfig, $kWindow, $q, workAssignService,
                                  CommonService, htmlCommonService, PopupConst, Restangular, RestEndpoint, Constant) {
        // start controller
        var vm = this;

        vm.documentBody = $("#workAssign");
        vm.searchForm = {};
        vm.insertForm = {};
        vm.rootSysGroup = {};
        vm.currentPage = 1;
        vm.isCheckbox = false;
        vm.showPrint = false;
        vm.insertForm.listDepartmentReceive = [];

        vm.listRemove = [
            {
                title: CommonService.translate("Thao tác"),
            },
            {
                title: CommonService.translate("Lựa chọn"),
            }
        ];
        vm.listConvert = [
            {
                field: "status",
                data: {
                    '0': CommonService.translate("Hết hiệu lực"),
                    '1': CommonService.translate("Hiệu lực"),
                    '2': CommonService.translate("Dự thảo")
                }
            },
            {
                field: "statusDvApprove",
                data: {
                    '0': CommonService.translate("Chưa nhận việc"),
                    '1': CommonService.translate("Đã nhận việc"),
                    '2': CommonService.translate("Từ chối nhận việc")
                }
            },
            {
                field: "statusKtnbVerify",
                data: {
                    '0': CommonService.translate("Chờ duyệt"),
                    '1': CommonService.translate("Đã duyệt"),
                    '2': CommonService.translate("Từ chối")
                }
            },
            {
                field: "typeWo",
                data: {
                    '1': CommonService.translate("Giao việc ngành dọc PC&KTNB"),
                    '2': CommonService.translate("Thực hiện kết luận sau thanh kiểm tra"),
                    '3': CommonService.translate("Cơ quan/ Đơn vị TCT giám sát ngành dọc"),
                    '4': CommonService.translate("Thông tin công tác kiểm tra các đơn vị")
                }
            },
            {
                field: "levelOneProblem",
                data: {
                    '1': CommonService.translate("Không có vấn đề"),
                    '2': CommonService.translate("Quy trình"),
                    '3': CommonService.translate("Quản trị"),
                    '4': CommonService.translate("Con người"),
                    '5': CommonService.translate("Công cụ")
                }
            }
        ];

        vm.listOverCome = [
            {code: 0, name: CommonService.translate("Không cần khắc phục")},
            {code: 1, name: CommonService.translate("Chưa tạo")},
        ]

        vm.listTypeWo = [
            {code: 1, name: CommonService.translate("Giao việc ngành dọc PC&KTNB")},
            {code: 2, name: CommonService.translate("Thực hiện kết luận sau thanh kiểm tra")},
            {code: 3, name: CommonService.translate("Cơ quan/ Đơn vị TCT giám sát ngành dọc")},
            {code: 4, name: CommonService.translate("Thông tin công tác kiểm tra các đơn vị")}
        ];

        vm.listType = [
            {code: 1, name: CommonService.translate("Đi công tác kiểm tra")},
            {code: 2, name: CommonService.translate("Không đi công tác kiểm tra")}
        ];
        vm.departmentCodeArray = [
            {code: 'KTNB', name: CommonService.translate("Kiểm toán nội bộ")},
            {code: 'KSNB', name: CommonService.translate("Kiểm soát nội bộ")},
            {code: 'QTRR', name: CommonService.translate("Quản trị rủi ro")},
            {code: 'PCHE', name: CommonService.translate("Pháp chế")}
        ];

        vm.listErrorGroup = [
            {code: 1, name: CommonService.translate("Lỗi nghiệp vụ")},
            {code: 2, name: CommonService.translate("Lỗi pháp lý")},
            {code: 3, name: CommonService.translate("Theo dõi quy trình")},
            {code: 4, name: CommonService.translate("Theo dõi,đánh giá theo KPI")},
            {code: 5, name: CommonService.translate("Kiểm toán quy trình")},
            {code: 6, name: CommonService.translate("Kiểm toán tuân thủ")},
            {code: 7, name: CommonService.translate("Kiểm toán hoạt động")}
        ];
        vm.statusNvApproveArray = [
            {id: 0, name: "Chưa nhận việc"},
            {id: 1, name: "Đã nhận việc"},
            {id: 2, name: "Từ chối việc"}
        ];
        vm.statusDvVerifyArray = [
            {id: 0, name: "Chưa xác nhận"},
            {id: 1, name: "Đã xác nhận"},
            {id: 2, name: "Từ chối"}
        ];

        vm.typeLevelOneProblem = [
            {id: 1, name: CommonService.translate("Không có vấn đề")},
            {id: 2, name: CommonService.translate("Quy trình")},
            {id: 3, name: CommonService.translate("Quản trị")},
            {id: 4, name: CommonService.translate("Con người")},
            {id: 5, name: CommonService.translate("Công cụ")}
        ];

        vm.unitDatasource = [];
        initForm();

        function initForm() {
            if ($rootScope.stringtile) {
                vm.String = CommonService.translate("Quản lý giao việc phòng PC&KTNB") + " > " +
                    CommonService.translate("Quản lý giao việc");
            }
            fillDataWorkAssign([]);
            fillFileTable([]);
            checkPermissionKtnbApprove();
            checkPermissionKtnbComplete();
            checkPermissionExtendApprove();
            getUnitDatasource();
        }

        function checkPermissionKtnbApprove() {
            vm.isRoleApprove = false;
            let obj = {};
            obj.adResourceCode = "WO_PC";
            obj.operationCode = "APPROVED";
            CommonService.checkPermission(obj).then(
                function (resp) {
                    if (resp) {
                        vm.isRoleApprove = resp;
                    }
                },
                function (error) {
                    console.log(error);
                    toastr.error("Có lỗi xảy ra!");
                }
            )
        }

        function checkPermissionExtendApprove() {
            vm.isRoleExtend = false;
            let obj = {};
            obj.adResourceCode = "EXTEND";
            obj.operationCode = "APPROVED";
            CommonService.checkPermission(obj).then(
                function (resp) {
                    if (resp) {
                        vm.isRoleExtend = resp;
                    }
                },
                function (error) {
                    console.log(error);
                    toastr.error("Có lỗi xảy ra!");
                }
            )
        }

        function checkPermissionKtnbComplete() {
            vm.isRoleComplete = false;
            let obj = {};
            obj.adResourceCode = "WO_PC";
            obj.operationCode = "VERIFY";
            CommonService.checkPermission(obj).then(
                function (resp) {
                    if (resp) {
                        vm.isRoleComplete = resp;
                    }
                },
                function (error) {
                    console.log(error);
                    toastr.error("Có lỗi xảy ra!");
                }
            )
        }

        vm.doSearch = function (currentPage) {
            if (vm.searchForm.startDate) {
                var d1 = kendo.parseDate(vm.searchForm.startDate, "dd/MM/yyyy");
                if (d1 == null) {
                    toastr.error("Bạn vui lòng nhập đúng định dạng ngày dd/mm/yyyy");
                    $("#searchWorkAssignStartDate").focus();
                    return;
                }
            }
            if (vm.searchForm.closeDate) {
                var d1 = kendo.parseDate(vm.searchForm.closeDate, "dd/MM/yyyy");
                if (d1 == null) {
                    toastr.error("Bạn vui lòng nhập đúng định dạng ngày dd/mm/yyyy");
                    $("#searchWorkAssignEndDate").focus();
                    return;
                }
            }
            if (vm.searchForm.startDate && vm.searchForm.closeDate) {
                var d1 = kendo.parseDate(vm.searchForm.startDate, "dd/MM/yyyy");
                var d2 = kendo.parseDate(vm.searchForm.closeDate, "dd/MM/yyyy");
                if (d1 > d2) {
                    toastr.error("Ngày bắt đầu tìm kiếm phải nhỏ hơn ngày kết thúc tìm kiếm");
                    $("#searchWorkAssignEndDate").focus();
                    return;
                }
            }
            if (vm.searchForm.startInspectionDate) {
                var d1 = kendo.parseDate(vm.searchForm.startInspectionDate, "dd/MM/yyyy");
                if (d1 == null) {
                    toastr.error("Bạn vui lòng nhập đúng định dạng ngày dd/mm/yyyy");
                    $("#startInspectionDate").focus();
                    return;
                }
            }
            if (vm.searchForm.endInspectionDate) {
                var d1 = kendo.parseDate(vm.searchForm.endInspectionDate, "dd/MM/yyyy");
                if (d1 == null) {
                    toastr.error("Bạn vui lòng nhập đúng định dạng ngày dd/mm/yyyy");
                    $("#endInspectionDate").focus();
                    return;
                }
            }
            if (vm.searchForm.startInspectionDate && vm.searchForm.endInspectionDate) {
                var d1 = kendo.parseDate(vm.searchForm.startInspectionDate, "dd/MM/yyyy");
                var d2 = kendo.parseDate(vm.searchForm.endInspectionDate, "dd/MM/yyyy");
                if (d1 > d2) {
                    toastr.error("Thời gian kiểm tra: Từ ngày không được lớn hơn Thời gian kiểm tra: Đến ngày");
                    $("#endInspectionDate").focus();
                    return;
                }
            }
            if (vm.searchForm.startInspectionPhase) {
                var d1 = kendo.parseDate(vm.searchForm.startInspectionPhase, "dd/MM/yyyy");
                if (d1 == null) {
                    toastr.error("Bạn vui lòng nhập đúng định dạng ngày dd/mm/yyyy");
                    $("#startInspectionPhase").focus();
                    return;
                }
            }
            if (vm.searchForm.endInspectionPhase) {
                var d1 = kendo.parseDate(vm.searchForm.endInspectionPhase, "dd/MM/yyyy");
                if (d1 == null) {
                    toastr.error("Bạn vui lòng nhập đúng định dạng ngày dd/mm/yyyy");
                    $("#endInspectionPhase").focus();
                    return;
                }
            }
            if (vm.searchForm.startInspectionPhase && vm.searchForm.endInspectionPhase) {
                var d1 = kendo.parseDate(vm.searchForm.startInspectionPhase, "dd/MM/yyyy");
                var d2 = kendo.parseDate(vm.searchForm.endInspectionPhase, "dd/MM/yyyy");
                if (d1 > d2) {
                    toastr.error("Giai đoạn kiểm tra: Từ ngày không được lớn hơn Giai đoạn kiểm tra: Đến ngày");
                    $("#endInspectionPhase").focus();
                    return;
                }
            }
            var grid = $("#workAssignGrid").data("kendoGrid");
            grid.setOptions({columns: getColumn()})
            if (grid) {
                if (currentPage != 1) {
                    grid.dataSource.query({
                        page: currentPage,
                        pageSize: 10
                    });
                } else {
                    grid.dataSource.query({
                        page: 1,
                        pageSize: 10
                    });
                }
            }
        }

        var recordWorkAssign = 0;
        vm.countWorkAssign = 0;

        function fillDataWorkAssign(data) {
            vm.workAssignGridOptions = kendoConfig.getGridOptions({
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
                            '<button  type="button" ng-if="vm.isRoleApprove" class="btn btn-qlk padding-search-right TkQLK ng-scope" style="width: 150px" ng-click="vm.quickApprove()" translate>Xác nhận duyệt' +
                            '</button>' +
                            '</div>' +
                            '<div class="btn-group pull-right margin_top_button margin_right10">' +
                            '<i data-toggle="dropdown" class="tooltip1" aria-expanded="false"><span class="tooltipArrow"></span><span class="tooltiptext" translate>Cài đặt</span><i class="fa fa-cog" aria-hidden="true"></i></i>' +
                            '<i class="tooltip1 action-button excelQLK" ng-click="vm.exportExcelGrid()"  aria-expanded="false"><span class="tooltipArrow"></span><span class="tooltiptext" translate>Xuất Excel</span></i>' +
                            '<div class="dropdown-menu hold-on-click dropdown-checkboxes" role="menu" style="overflow-y: scroll; height: 600px">' +
                            '<label ng-repeat="column in vm.workAssignGrid.columns.slice(1,vm.workAssignGrid.columns.length)| filter: vm.gridColumnShowHideFilter">' +
                            '<input type="checkbox" ng-if="column.hidden" ng-click="vm.showHideColumn(column)">' +
                            '<input type="checkbox" checked ng-if="!column.hidden" ng-click="vm.showHideColumn(column)"> {{column.title}}' +
                            '</label>' +
                            '</div></div>'
                    }
                ],
                dataBinding: function () {
                    recordWorkAssign = (this.dataSource.page() - 1) * this.dataSource.pageSize();
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
                            vm.countWorkAssign = response.total;
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
                            url: Constant.BASE_SERVICE_URL + "workAssignRsService/doSearchViewKtnb",
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
                columns: getColumn()
            });
        }

        function getColumn() {
            if (vm.searchForm.typeWo == 4) {
                return [
                    {
                        headerTemplate: '<input id="coreCheckbox" type="checkbox" class="checkbox" ng-click="vm.changeState()"/>',
                        field: "",
                        width: "40px",
                        selectable: true,
                        template: dataItem => '<input type="checkbox" name="checkboxWorkAssign" class="checkbox" ng-click="vm.onChange(dataItem)"/>',
                        headerAttributes: {style: "text-align:center; font-weight: bold;"},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("TT"),
                        field: "stt",
                        template: function () {
                            return ++recordWorkAssign;
                        },
                        width: "40px",
                        hidden: false,
                        headerAttributes: {style: "text-align:center", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Mã WO"),
                        field: 'code',
                        width: "150px",
                        hidden: false,
                        template: '<a href="javascript:void(0);" title="#=code#" ng-click=vm.showDetail(dataItem)>#=code#</a>',
                        headerAttributes: {style: "text-align:center", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Loại WO"),
                        field: 'typeWo',
                        width: "160px",
                        hidden: false,
                        template: function (dataItem) {
                            return CommonService.translate("Thông tin công tác kiểm tra các đơn vị");
                        },
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Đơn vị nhận việc"),
                        field: 'sysGroupLv2Name',
                        width: "120px",
                        hidden: false,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Trạng thái đơn vị xác nhận"),
                        field: 'statusDvApprove',
                        width: "100px",
                        hidden: false,
                        template: function (dataItem) {
                            if (dataItem.statusDvApprove == 0) {
                                return CommonService.translate("Chưa nhận việc");
                            } else if (dataItem.statusDvApprove == 1) {
                                return CommonService.translate("Đã nhận việc");
                            } else if (dataItem.statusDvApprove == 2) {
                                return CommonService.translate("Từ chối nhận việc");
                            } else {
                                return "";
                            }
                        },
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Đơn vị kiểm tra"),
                        field: 'unitTestName',
                        width: "120px",
                        hidden: false,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Kế hoạch kiểm tra"),
                        field: 'testPlanNumber',
                        width: "120px",
                        hidden: false,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Đơn vị được kiểm tra"),
                        field: 'groupNames',
                        width: "120px",
                        hidden: false,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Văn bản được kiểm tra"),
                        field: 'inspectionDocument',
                        width: "120px",
                        hidden: false,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Nội dung kiểm tra"),
                        field: 'inspectionContent',
                        width: "120px",
                        hidden: false,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Thời gian bắt đầu kiểm tra"),
                        field: 'startInspectionDate',
                        width: "120px",
                        hidden: false,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Thời gian kết thúc kiểm tra"),
                        field: 'endInspectionDate',
                        width: "120px",
                        hidden: false,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Giai đoạn bắt đầu kiểm tra"),
                        field: 'startInspectionPhase',
                        width: "120px",
                        hidden: false,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Giai đoạn kết thúc kiểm tra"),
                        field: 'endInspectionPhase',
                        width: "120px",
                        hidden: false,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Vấn đề cấp 1"),
                        field: 'levelOneProblem',
                        width: "120px",
                        hidden: true,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Vấn đề chi tiết"),
                        field: 'issueOfDetail',
                        width: "120px",
                        hidden: true,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Số hiệu báo cáo"),
                        field: 'reportNumber',
                        width: "120px",
                        hidden: false,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Trạng thái duyệt của P.PC&KSNB"),
                        field: 'statusKtnbVerify',
                        width: "100px",
                        hidden: false,
                        template: function (dataItem) {
                            if (dataItem.statusKtnbVerify == 0) {
                                return CommonService.translate("Chờ duyệt");
                            } else if (dataItem.statusKtnbVerify == 1) {
                                return CommonService.translate("Đã duyệt");
                            } else if (dataItem.statusKtnbVerify == 2) {
                                return CommonService.translate("Từ chối");
                            } else {
                                return "";
                            }
                        },
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Ngày duyệt đóng WO"),
                        field: 'verifyKtnbDate',
                        width: "120px",
                        hidden: false,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Thao tác"),
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"},
                        template: dataItem =>
                            '<div class="text-center">' +
                            '<button style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Copy" translate ' +
                            'ng-click="vm.copy(dataItem)" ><i class="fa fa-copy ng-scope" aria-hidden="true" translate></i></button>'
                            +
                            '<button style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Giao việc" translate ' +
                            'ng-click="vm.update(dataItem)" ng-if="dataItem.status == 0 || dataItem.status == 2"><i class="fa fa-pencil ng-scope" aria-hidden="true" translate></i></button>'
                            +
                            '<button style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Xóa" translate ' +
                            'ng-click="vm.remove(dataItem)" ng-if="dataItem.status == 2"> <i style="color:steelblue;" class="fa fa-trash ng-scope" aria-hidden="true"></i></button>'
                            +
                            '<button ng-if="vm.isRoleApprove && dataItem.status == 2" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Duyệt giao việc" translate ' +
                            'ng-click="vm.approveStatus(dataItem)" > <i style="color:blueviolet;" class="fa fa-share ng-scope" aria-hidden="true"></i></button>'
                            +
                            '<button ng-if="vm.isRoleApprove && dataItem.status == 2" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Hủy duyệt giao việc" translate ' +
                            'ng-click="vm.cancelApproveStatus(dataItem)" > <i style="color:#2f3b49;" class="fa fa-undo ng-scope" aria-hidden="true"></i></button>'
                            +
                            '<button ng-if="vm.isRoleComplete && dataItem.statusKtnbVerify == 0 && dataItem.statusCompleteAllNv == 0 && dataItem.status != 0" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Xác nhận đóng việc" translate ' +
                            'ng-click="vm.openAcceptKtnbVerify(dataItem)" > <i style="color:green;" class="fa fa-check ng-scope" aria-hidden="true"></i></button>'
                            +
                            '<button ng-if="vm.isRoleComplete && dataItem.statusKtnbVerify == 0 && dataItem.statusCompleteAllNv == 0 && dataItem.status != 0" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Từ chối đóng việc" translate ' +
                            'ng-click="vm.openRejectKtnbVerify(dataItem)"> <i style="color:firebrick;" class="fa fa-times ng-scope" aria-hidden="true"></i></button>'
                            +
                            '<button ng-if="vm.isRoleExtend && dataItem.status!=0 && dataItem.statusKtnbVerify != 0 && dataItem.statusKtnbVerify != 1 && dataItem.statusDvApprove!==2" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Gia hạn công việc" translate ' +
                            'ng-click="vm.openTimeExtendPopup(dataItem)"> <i style="color:goldenrod;" class="fa fa-reply ng-scope" aria-hidden="true"></i></button>'
                            +
                            '</div>',

                        width: "240px",
                        field: "stt"
                    }
                ]
            } else {
                return [
                    {
                        headerTemplate: '<input id="coreCheckbox" type="checkbox" class="checkbox" ng-click="vm.changeState()"/>',
                        field: "",
                        width: "40px",
                        selectable: true,
                        hidden: false,
                        template: dataItem => '<input type="checkbox" name="checkboxWorkAssign" class="checkbox" ng-click="vm.onChange(dataItem)"/>',
                        headerAttributes: {style: "text-align:center; font-weight: bold;"},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("TT"),
                        field: "stt",
                        template: function () {
                            return ++recordWorkAssign;
                        },
                        width: "40px",
                        hidden: false,
                        headerAttributes: {style: "text-align:center", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Mã WO"),
                        field: 'code',
                        width: "150px",
                        hidden: false,
                        template: '<a href="javascript:void(0);" title="#=code#" ng-click=vm.showDetail(dataItem)>#=code#</a>',
                        headerAttributes: {style: "text-align:center", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Bộ phận giao WO"),
                        field: 'departmentCode',
                        width: "110px",
                        hidden: false,
                        template: function (dataItem) {
                            if (dataItem.departmentCode == 'KTNB') {
                                return CommonService.translate("Kiểm toán nội bộ");
                            } else if (dataItem.departmentCode == 'KSNB') {
                                return CommonService.translate("Kiêm soát nội bộ");
                            } else if (dataItem.departmentCode == 'QTRR') {
                                return CommonService.translate("Quản trị rủi ro");
                            } else if (dataItem.departmentCode == 'PCHE') {
                                return CommonService.translate("Pháp chế");
                            } else {
                                return "";
                            }
                        },
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Loại WO"),
                        field: 'typeWo',
                        width: "160px",
                        hidden: false,
                        template: function (dataItem) {
                            if (dataItem.typeWo == 1) {
                                return CommonService.translate("Giao việc ngành dọc PC&KTNB");
                            } else if (dataItem.typeWo == 2) {
                                return CommonService.translate("Thực hiện kết luận sau thanh kiểm tra");
                            } else if (dataItem.typeWo == 3) {
                                return CommonService.translate("Cơ quan/ Đơn vị TCT giám sát ngành dọc");
                            } else if (dataItem.typeWo == 4) {
                                return CommonService.translate("Thông tin công tác kiểm tra các đơn vị");
                            } else {
                                return "";
                            }
                        },
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Đơn vị nhận việc"),
                        field: 'sysGroupLv2Name',
                        width: "120px",
                        hidden: false,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Số văn bản"),
                        field: 'nameDocument',
                        width: "100px",
                        hidden: false,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Thời gian bắt đầu"),
                        field: 'startDate',
                        width: "100px",
                        hidden: false,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Thời gian kết thúc"),
                        field: 'closeDate',
                        width: "100px",
                        hidden: false,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Trạng thái đơn vị xác nhận"),
                        field: 'statusDvApprove',
                        width: "100px",
                        hidden: false,
                        template: function (dataItem) {
                            if (dataItem.statusDvApprove == 0) {
                                return CommonService.translate("Chưa nhận việc");
                            } else if (dataItem.statusDvApprove == 1) {
                                return CommonService.translate("Đã nhận việc");
                            } else if (dataItem.statusDvApprove == 2) {
                                return CommonService.translate("Từ chối nhận việc");
                            } else {
                                return "";
                            }
                        },
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Ngày nhân viên xác nhận hoàn thành"),
                        field: 'completedAt',
                        width: "100px",
                        hidden: false,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Người tạo"),
                        field: 'createByName',
                        width: "120px",
                        hidden: false,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Ngày tạo"),
                        field: 'createDate',
                        width: "100px",
                        hidden: false,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Ngày KTNB xác nhận hoàn thành"),
                        field: 'verifyKtnbDate',
                        width: "100px",
                        hidden: false,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Tình trạng"),
                        field: 'statusDoWork',
                        width: "80px",
                        hidden: false,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Tình trạng NV thực hiện"),
                        field: 'stateNvTh',
                        width: "80px",
                        hidden: false,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Trạng thái duyệt của P.PC&KSNB"),
                        field: 'statusKtnbVerify',
                        width: "100px",
                        hidden: false,
                        template: function (dataItem) {
                            if (dataItem.statusKtnbVerify == 0) {
                                return CommonService.translate("Chờ duyệt");
                            } else if (dataItem.statusKtnbVerify == 1) {
                                return CommonService.translate("Đã duyệt");
                            } else if (dataItem.statusKtnbVerify == 2) {
                                return CommonService.translate("Từ chối");
                            } else {
                                return "";
                            }
                        },
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Tình trạng phê duyệt của P.PC&KSNB"),
                        field: 'stateApproveKtnb',
                        width: "80px",
                        hidden: false,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Trạng thái WO"),
                        field: 'status',
                        width: "100px",
                        hidden: false,
                        template: function (dataItem) {
                            if (dataItem.status == 0) {
                                return CommonService.translate("Hết hiệu lực");
                            } else if (dataItem.status == 1) {
                                return CommonService.translate("Hiệu lực");
                            } else if (dataItem.status == 2) {
                                return CommonService.translate("Dự thảo");
                            } else {
                                return "";
                            }
                        },
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Trạng thái thực hiện WO khắc phục"),
                        field: 'statusOvercome',
                        width: "100px",
                        hidden: false,
                        template: function (dataItem) {
                            if (dataItem.statusKtnbVerify == null || dataItem.typeWo != 1) {
                                return "";
                            }
                            if (dataItem.statusOvercome == 0) {
                                return CommonService.translate("Không cần khắc phục");
                            } else if (dataItem.statusOvercome > 0) {
                                return CommonService.translate("Chưa tạo");
                            } else {
                                return "";
                            }
                        },
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Năm"),
                        field: 'year',
                        width: "60px",
                        hidden: true,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Tháng"),
                        field: 'month',
                        width: "60px",
                        hidden: true,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },

                    {
                        title: CommonService.translate("Đơn vị kiểm tra"),
                        field: 'unitTestName',
                        width: "120px",
                        hidden: true,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Kế hoạch kiểm tra"),
                        field: 'testPlanNumber',
                        width: "120px",
                        hidden: true,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Đơn vị được kiểm tra"),
                        field: 'groupNames',
                        width: "120px",
                        hidden: true,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Văn bản được kiểm tra"),
                        field: 'inspectionDocument',
                        width: "120px",
                        hidden: true,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Nội dung kiểm tra"),
                        field: 'inspectionContent',
                        width: "120px",
                        hidden: true,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Thời gian bắt đầu kiểm tra"),
                        field: 'startInspectionDate',
                        width: "120px",
                        hidden: true,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Thời gian kết thúc kiểm tra"),
                        field: 'endInspectionDate',
                        width: "120px",
                        hidden: true,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Giai đoạn bắt đầu kiểm tra"),
                        field: 'startInspectionPhase',
                        width: "120px",
                        hidden: true,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Giai đoạn kết thúc kiểm tra"),
                        field: 'endInspectionPhase',
                        width: "120px",
                        hidden: true,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Số hiệu báo cáo"),
                        field: 'reportNumber',
                        width: "120px",
                        hidden: true,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },

                    {
                        title: CommonService.translate("Thao tác"),
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"},
                        template: dataItem =>
                            '<div class="text-center">' +
                            '<button style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Copy" translate ' +
                            'ng-click="vm.copy(dataItem)" ><i class="fa fa-copy ng-scope" aria-hidden="true" translate></i></button>'
                            +
                            '<button style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Giao việc" translate ' +
                            'ng-click="vm.update(dataItem)" ng-if="dataItem.status == 0 || dataItem.status == 2"><i class="fa fa-pencil ng-scope" aria-hidden="true" translate></i></button>'
                            +
                            '<button style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Xóa" translate ' +
                            'ng-click="vm.remove(dataItem)" ng-if="dataItem.status == 2"> <i style="color:steelblue;" class="fa fa-trash ng-scope" aria-hidden="true"></i></button>'
                            +
                            '<button ng-if="vm.isRoleApprove && dataItem.status == 2" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Duyệt giao việc" translate ' +
                            'ng-click="vm.approveStatus(dataItem)" > <i style="color:blueviolet;" class="fa fa-share ng-scope" aria-hidden="true"></i></button>'
                            +
                            '<button ng-if="vm.isRoleApprove && dataItem.status == 2" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Hủy duyệt giao việc" translate ' +
                            'ng-click="vm.cancelApproveStatus(dataItem)" > <i style="color:#2f3b49;" class="fa fa-undo ng-scope" aria-hidden="true"></i></button>'
                            +
                            '<button ng-if="vm.isRoleComplete && dataItem.statusKtnbVerify == 0 && dataItem.statusCompleteAllNv == 0 && dataItem.status != 0" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Xác nhận đóng việc" translate ' +
                            'ng-click="vm.openAcceptKtnbVerify(dataItem)" > <i style="color:green;" class="fa fa-check ng-scope" aria-hidden="true"></i></button>'
                            +
                            '<button ng-if="vm.isRoleComplete && dataItem.statusKtnbVerify == 0 && dataItem.statusCompleteAllNv == 0 && dataItem.status != 0" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Từ chối đóng việc" translate ' +
                            'ng-click="vm.openRejectKtnbVerify(dataItem)"> <i style="color:firebrick;" class="fa fa-times ng-scope" aria-hidden="true"></i></button>'
                            +
                            '<button ng-if="vm.isRoleExtend && dataItem.status!=0 && dataItem.statusKtnbVerify != 0 && dataItem.statusKtnbVerify != 1 && dataItem.statusDvApprove!==2" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Gia hạn công việc" translate ' +
                            'ng-click="vm.openTimeExtendPopup(dataItem)"> <i style="color:goldenrod;" class="fa fa-reply ng-scope" aria-hidden="true"></i></button>'
                            +
                            '</div>',

                        width: "240px",
                        field: "stt"
                    }
                ]
            }
        }

        vm.onChangeTypeWo = function () {
            if (vm.searchForm.typeWo != 4) {
                if (vm.searchForm.hasOwnProperty('inspectionContent')) delete vm.searchForm.inspectionContent;
                if (vm.searchForm.hasOwnProperty('inspectionDocument')) delete vm.searchForm.inspectionDocument;
                if (vm.searchForm.hasOwnProperty('endInspectionDate')) delete vm.searchForm.endInspectionDate;
                if (vm.searchForm.hasOwnProperty('endInspectionPhase')) delete vm.searchForm.endInspectionPhase;
                if (vm.searchForm.hasOwnProperty('startInspectionPhase')) delete vm.searchForm.startInspectionPhase;
                if (vm.searchForm.hasOwnProperty('reportNumber')) delete vm.searchForm.reportNumber;
                if (vm.searchForm.hasOwnProperty('startInspectionDate')) delete vm.searchForm.startInspectionDate;
                if (vm.searchForm.hasOwnProperty('unitTestId')) delete vm.searchForm.unitTestId;
                if (vm.searchForm.hasOwnProperty('unitTestName')) delete vm.searchForm.unitTestName;
                if (vm.searchForm.hasOwnProperty('checkedUnitCode')) delete vm.searchForm.checkedUnitCode;
                if (vm.searchForm.hasOwnProperty('groupId')) delete vm.searchForm.groupId;
                if (vm.searchForm.hasOwnProperty('groupName')) delete vm.searchForm.groupName;
            }
        }

        vm.showHideColumn = function (column) {
            if (angular.isUndefined(column.hidden)) {
                vm.workAssignGrid.hideColumn(column);
            } else if (column.hidden) {
                vm.workAssignGrid.showColumn(column);
            } else {
                vm.workAssignGrid.hideColumn(column);
            }
        };

        vm.isCreateForm = true;
        vm.checkViewDetail = false;
        vm.checkViewComplete = false;
        vm.newTypeWo = false;

        var modalAdd;
        vm.openAdd = function () {
            vm.typeCreate = "create";
            vm.isEdit = true;
            vm.isCreateForm = true;
            vm.checkViewDetail = false;
            vm.checkViewComplete = false;
            vm.newTypeWo = false;
            vm.insertForm = {};
            var templateUrl = 'ktnb/workAssign/workAssignPopup.html';
            var title = CommonService.translate("Thêm mới công việc");
            modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "70%", null, null);
            vm.dataFile = [];
            vm.listWADetail = [];
            fillFileTable([]);
            fillDataWorkAssignDetail([]);
            vm.listDepartmentReceiveExportTemp = [];
            vm.dataList = [];
        }

        vm.update = function (dataItem) {
            vm.isEdit = true;
            vm.typeCreate = "update";
            vm.currentPage = $("#workAssignGrid").data("kendoGrid").dataSource.page();
            vm.isCreateForm = false;
            vm.isUpdateForm = true;
            vm.checkViewDetail = false;
            vm.checkViewComplete = false;
            dataItem.typeFile = "WOKTNB";
            workAssignService.getDetail(dataItem).then(function (data) {
                vm.insertForm = angular.copy(data);
                var templateUrl = 'ktnb/workAssign/workAssignPopup.html';
                var title = CommonService.translate("Cập nhật công việc");
                modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "50%", null, null);
                vm.dataFile = vm.insertForm.listAttachDocument;
                vm.listWADetail = vm.insertForm.listWorkAssignDetail;
                fillFileTable(vm.dataFile);
                fillDataWorkAssignDetail(vm.listWADetail);
            }, function () {
                toastr.error(CommonService.translate("Có lỗi xảy ra"));
            });
        }

        vm.copy = function (dataItem) {
            vm.typeCreate = 'copy';
            vm.isCreateForm = true;
            vm.checkViewDetail = false;
            dataItem.typeFile = "WOKTNB";
            workAssignService.getDetailForCopy(dataItem).then(function (data) {
                // vm.insertForm = angular.copy(data);
                vm.insertForm.startDate = data.startDate;
                vm.insertForm.closeDate = data.closeDate;
                vm.insertForm.createBy = data.createBy;
                vm.insertForm.description = data.description;
                vm.insertForm.nameDocument = data.nameDocument;
                vm.insertForm.dateIssued = data.dateIssued;
                vm.insertForm.signedBy = data.signedBy;
                vm.insertForm.signedByName = data.signedByName;
                vm.insertForm.position = data.position;
                vm.insertForm.positionName = data.positionName;
                vm.insertForm.textContent = data.textContent;
                vm.insertForm.errorGroup = data.errorGroup;
                vm.insertForm.typeWo = data.typeWo;
                vm.insertForm.sysGroupLv2Id = data.sysGroupLv2Id;
                vm.insertForm.sysGroupLv2Name = data.sysGroupLv2Name;
                vm.insertForm.departmentCode = data.departmentCode;
                var templateUrl = 'ktnb/workAssign/workAssignPopup.html';
                var title = CommonService.translate("Tạo mới công việc");
                modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "50%", null, null);
                vm.dataFile = data.listAttachDocument;
                vm.listWADetail = data.listWorkAssignDetail;
                fillFileTable(vm.dataFile);
                fillDataWorkAssignDetail(vm.listWADetail);
                vm.listDepartmentReceiveExportTemp = [];
            }, function () {
                toastr.error(CommonService.translate("Có lỗi xảy ra"));
            });
        }

        vm.remove = function (dataItem) {
            confirm(CommonService.translate("Bạn có chắc chắn muốn xóa bản ghi này?"), function () {
                vm.insertForm = angular.copy(dataItem);
                kendo.ui.progress(vm.documentBody, true);
                workAssignService.remove(vm.insertForm).then(function () {
                    toastr.success(CommonService.translate("Xóa bản ghi thành công"));
                    // vm.cancel();
                    vm.doSearch(vm.currentPage);
                    kendo.ui.progress(vm.documentBody, false);
                }, function (err) {
                    toastr.error(CommonService.translate("Có lỗi xảy ra"));
                    kendo.ui.progress(vm.documentBody, false);
                });
            });
        }

        vm.showDetail = function (dataItem) {
            vm.isEdit = false;
            vm.isCreateForm = false;
            vm.checkViewDetail = true;
            vm.checkViewComplete = false;
            vm.typeCreate = 'detail';
            vm.showPrint = dataItem.statusKtnbVerify == 1 ? true : false;
            vm.newTypeWo = dataItem.typeWo == 4 ? true : false;
            dataItem.typeFile = "WOKTNB";

            workAssignService.getDetail(dataItem).then(function (data) {
                vm.insertForm = angular.copy(data);
                if (vm.insertForm.inspectionInformationDTOs) {
                    vm.insertForm.inspectionInformationDTOs.map(x => {
                        x.inspectionUnits = x.problemDiscoveredDTOList.map(y => y.groupName).toString().replace(",", ';,');
                        return x;
                    })
                }

                var templateUrl = 'ktnb/workAssign/workAssignPopup.html';
                var title = CommonService.translate("Màn hình thông tin chi tiết");
                modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "70%", null, null);
                vm.dataFile = vm.insertForm.listAttachDocument;
                vm.listWADetail = vm.insertForm.listWorkAssignDetail;
                fillFileTable(vm.dataFile);
                fillDataWorkAssignDetail(vm.listWADetail);
            }, function () {
                toastr.error(CommonService.translate("Có lỗi xảy ra"));
            });
        }

        vm.clear = function (data) {
            switch (data) {
                case 'search_keySearch': {
                    vm.searchForm.keySearch = null;
                }
                case 'search_date': {
                    vm.searchForm.startDate = null;
                    vm.searchForm.closeDate = null;
                }
                case 'sysGroup': {
                    vm.insertForm.sysGroupId = null;
                    vm.insertForm.sysGroupCode = null;
                    vm.insertForm.sysGroupName = null;
                    break;
                }
                case 'sysGroupId_search': {
                    vm.searchForm.sysGroupLv2Id = null;
                    vm.searchForm.sysGroupLv2Code = null;
                    vm.searchForm.sysGroupLv2Name = null;
                    break;
                }
                case 'sysGroupSearch': {
                    vm.searchForm.sysGroupId = null;
                    vm.searchForm.sysGroupCode = null;
                    vm.searchForm.sysGroupName = null;
                    break;
                }
                case 'ownerBy': {
                    vm.insertForm.ownerBy = null;
                    vm.insertForm.ownerByCode = null;
                    vm.insertForm.ownerByName = null;
                    break;
                }
                case 'codeSearch': {
                    vm.searchForm.code = null;
                    break;
                }
                case 'ownerBySearch': {
                    vm.searchForm.ownerBy = null;
                    vm.searchForm.ownerByName = null;
                    break;
                }
                case 'createdDateSearch': {
                    vm.searchForm.createdDateFrom = null;
                    vm.searchForm.createdDateTo = null;
                    break;
                }
                case 'detection': {
                    vm.insertForm.detection = null;
                    break;
                }
                case 'nameDocument': {
                    vm.searchForm.nameDocument = null;
                    break;
                }
                case 'check_date': {
                    vm.searchForm.startInspectionDate = null;
                    vm.searchForm.endInspectionDate = null;
                    break;
                }
                case 'inspectionDocument': {
                    vm.searchForm.inspectionDocument = null;
                    break;
                }
                case 'check_period_date': {
                    vm.searchForm.startInspectionPhase = null;
                    vm.searchForm.endInspectionPhase = null;
                    break;
                }
                case 'inspectionContent': {
                    vm.searchForm.inspectionContent = null;
                    break;
                }
                case 'checkUnit': {
                    vm.searchForm.unitTestId = null;
                    vm.searchForm.unitTestName = null;
                    break;
                }
                case 'reportNumber': {
                    vm.searchForm.reportNumber = null;
                    break;
                }
                case 'checkedUnit': {
                    vm.searchForm.groupIds = null;
                    vm.searchForm.groupNames = null;
                    break;
                }
            }
        }

        vm.save = function () {
            if (vm.insertForm.typeWo == null || vm.insertForm.typeWo == "") {
                toastr.error(CommonService.translate("Loại WO không được để trống"));
                return;
            }

            if (vm.insertForm.departmentCode == null || vm.insertForm.departmentCode == "") {
                toastr.error(CommonService.translate("Chưa chọn Bộ phận giao WO!"));
                return;
            }
            if (vm.insertForm.startDate == null) {
                toastr.error(CommonService.translate("Ngày bắt đầu không được để trống"));
                $("#insertWorkAssignStartDate").focus();
                return;
            }
            if (vm.insertForm.closeDate == null) {
                toastr.error(CommonService.translate("Ngày kết thúc không được để trống"));
                $("#insertWorkAssignEndDate").focus();
                return;
            }

            if (vm.insertForm.description == null || vm.insertForm.description.trim() == '') {
                toastr.error(CommonService.translate("Nội dung không được để trống"));
                $("#insertWorkAssignDescription").focus();
                return;
            }

            var d1 = kendo.parseDate(vm.insertForm.startDate, "dd/MM/yyyy");
            var d2 = kendo.parseDate(vm.insertForm.closeDate, "dd/MM/yyyy");
            var curdate = new Date();
            curdate.setHours(0, 0, 0, 0);
            var sysDate = kendo.parseDate(curdate, "dd/MM/yyyy");
            if (d1 < sysDate) {
                toastr.error("Ngày bắt đầu phải lớn hơn ngày hiện tại");
                $("#insertWorkAssignStartDate").focus();
                return;
            }
            if (d2 < sysDate) {
                toastr.error("Ngày kết thúc phải lớn hơn ngày hiện tại");
                $("#insertWorkAssignEndDate").focus();
                return;
            }
            if (vm.insertForm.typeWo == 2) {
                // if (vm.insertForm.sysGroupLv2Id == null || vm.insertForm.sysGroupLv2Name == null || vm.insertForm.sysGroupLv2Name == '') {
                //     toastr.error(CommonService.translate("Đơn vị thực hiện không được để trống"));
                //     $("#insertWorkAssignSysGroup").focus();
                //     return;
                // }
                if (vm.insertForm.nameDocument == null || vm.insertForm.nameDocument.trim() == '') {
                    toastr.error(CommonService.translate("Số văn bản không được để trống"));
                    $("#insertWorkAssignNameDocument").focus();
                    return;
                }
                if (vm.insertForm.signedBy == null || vm.insertForm.signedByName == null) {
                    toastr.error(CommonService.translate("Người ký không được để trống"));
                    $("#insertWorkAssignSignedBy").focus();
                    return;
                }
                if (vm.insertForm.dateIssued == null) {
                    toastr.error(CommonService.translate("Ngày ban hành không được để trống"));
                    $("#insertWorkAssignDateIssued").focus();
                    return;
                }
                if (vm.insertForm.position == null || vm.insertForm.positionName == null) {
                    toastr.error(CommonService.translate("Chức vụ không được để trống"));
                    $("#insertWorkAssignPosition").focus();
                    return;
                }
                if (vm.insertForm.textContent == null || vm.insertForm.textContent.trim() == '') {
                    toastr.error(CommonService.translate("Nội dung văn bản không được để trống"));
                    $("#insertWorkAssignTextContent").focus();
                    return;
                }
                if (vm.insertForm.errorGroup == null) {
                    toastr.error(CommonService.translate("Nhóm lỗi không được để trống"));
                    $("#insertWorkAssignErrorGroup").focus();
                    return;
                }
            }
            vm.listWADetail = $("#listWorkAssignDetailGrid").data("kendoGrid").dataSource._data;
            for (var i = 0; i < vm.listWADetail.length; i++) {
                var deadline = kendo.parseDate(vm.listWADetail[i].deadline, "dd/MM/yyyy");
                if (d1 > deadline || deadline > d2) {
                    toastr.error(CommonService.translate("Hạn hoàn thành công việc " + vm.listWADetail[i].workName + " phải nằm trong khoảng thời gian giao việc!"));
                    return;
                }
            }
            if (vm.listWADetail.length == 0) {
                toastr.error(CommonService.translate("Danh sách công việc không được để trống"));
                return;
            }
            vm.insertForm.listAttachDocument = vm.dataFile;
            vm.insertForm.listWorkAssignDetail = vm.listWADetail;
            kendo.ui.progress(vm.documentBody, true);
            if (vm.isCreateForm) {
                // if (vm.insertForm.typeWo == 1){
                let dataDepartment = $("#listDepartmentReceiveGrid").data("kendoGrid").dataSource._data;
                if (dataDepartment == null) {
                    toastr.error("Chưa nhập đơn vị nhận WO!");
                    return;
                }
                vm.insertForm.listDepartmentReceive = dataDepartment;
                // }
                workAssignService.save(vm.insertForm).then(function () {
                    toastr.success(CommonService.translate("Thêm mới bản ghi thành công"));
                    vm.cancel();
                    vm.doSearch(vm.currentPage);
                    kendo.ui.progress(vm.documentBody, false);
                }, function (err) {
                    toastr.error(CommonService.translate("Có lỗi xảy ra"));
                    kendo.ui.progress(vm.documentBody, false);
                });
            } else {
                vm.insertForm.status = 2;
                workAssignService.update(vm.insertForm).then(function () {
                    toastr.success(CommonService.translate("Cập nhật bản ghi thành công"));
                    vm.cancel();
                    vm.doSearch(vm.currentPage);
                    vm.currentPage = 1;
                    kendo.ui.progress(vm.documentBody, false);
                }, function (err) {
                    toastr.error(CommonService.translate("Có lỗi xảy ra"));
                    kendo.ui.progress(vm.documentBody, false);
                });
            }
        }

        vm.cancel = function () {
            modalAdd.dismiss();
        }

        vm.exportExcelGrid = function () {
            kendo.ui.progress(vm.documentBody, true);
            var obj = angular.copy(vm.searchForm);
            obj.page = null;
            obj.pageSize = null;
            obj.isExport = true;
            workAssignService.doSearch(obj).then(function (d) {
                kendo.ui.progress(vm.documentBody, false);
                var data = d.data;
                CommonService.exportFile2(vm.workAssignGrid, data, vm.listRemove, vm.listConvert, CommonService.translate("Danh sách WO"));
            });
        }

        vm.manageWorkAssignDetail = function (dataItem) {
            var obj = angular.copy(dataItem);
            workAssignDetailService.setData(obj);
            CommonService.closeTab('TITLE_PERIOD_DETAIL_TCT');
            CommonService.goTo('TITLE_PERIOD_DETAIL_TCT');
        }

        vm.isShowRemoveFile = function (dataItem) {
            if (!vm.isViewDetail && dataItem.createdby == Constant.user.VpsUserInfo.sysUserId) {
                return true;
            }
            return false;
        }

        // doSearch khi cập nhật bên màn chi tiết
        $rootScope.$on("callDoSearchWorkAssign", function () {
            vm.doSearch(vm.currentPage);
        });

        // autocomplete don vi thuc hien
        vm.isSelectSysGroup = false;
        vm.sysGroupOptions = {
            clearButton: false,
            dataTextField: "name", placeholder: CommonService.translate("Nhập tên đơn vị"),
            dataValueField: "name",
            open: function (e) {
                vm.isSelectSysGroup = false;
            },
            select: function (e) {
                vm.isSelectSysGroup = true;
                var dataItem = this.dataItem(e.item.index());
                vm.insertForm.sysGroupLv2Id = dataItem.sysGroupId;
                vm.insertForm.sysGroupLv2Code = dataItem.code;
                vm.insertForm.sysGroupLv2Name = dataItem.name;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSysGroup) {
                        vm.insertForm.sysGroupLv2Id = null;
                        vm.insertForm.sysGroupLv2Code = null;
                        vm.insertForm.sysGroupLv2Name = null;
                    }
                }, 100);
            },
            close: function (e) {
                $timeout(function () {
                    if (vm.insertForm.sysGroupLv2Id == null) {
                        vm.insertForm.sysGroupLv2Code = null;
                        vm.insertForm.sysGroupLv2Name = null;
                    }
                }, 1000);

            },
            pageSize: 10,
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        vm.isSelectSysGroup = false;
                        return Restangular.all("commonRsService/getSysGroupForAutoComplete").post(
                            {
                                keySearch: vm.insertForm.sysGroupLv2Name,
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
                '<div class="row">' +
                '<p class="col-md-6 text-header-auto border-right-ccc" translate>Mã đơn vị</p>' +
                '<p class="col-md-6 text-header-auto" translate>Tên đơn vị</p>' +
                '</div>' +
                '</div>',
            template: '<div class="row" ><div class="col-md-6 col-xs-5" style="float:left">#: data.code #</div><div  style="padding-left: 5px;width:auto;overflow: hidden"> #: data.name #</div> </div>',
        };

        vm.isSelectSearchSysGroup = false;
        vm.sysGroupSearchOptions = {
            clearButton: false,
            dataTextField: "name", placeholder: CommonService.translate("Nhập tên đơn vị"),
            dataValueField: "name",
            open: function (e) {
                vm.isSelectSearchSysGroup = false;
            },
            select: function (e) {
                vm.isSelectSearchSysGroup = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchForm.sysGroupLv2Id = dataItem.sysGroupId;
                vm.searchForm.sysGroupLv2Code = dataItem.code;
                vm.searchForm.sysGroupLv2Name = dataItem.name;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSearchSysGroup) {
                        vm.searchForm.sysGroupLv2Id = null;
                        vm.searchForm.sysGroupLv2Code = null;
                        vm.searchForm.sysGroupLv2Name = null;
                    }
                }, 100);
            },
            close: function (e) {
                $timeout(function () {
                    if (vm.searchForm.sysGroupLv2Id == null) {
                        vm.searchForm.sysGroupLv2Code = null;
                        vm.searchForm.sysGroupLv2Name = null;
                    }
                }, 1000);

            },
            pageSize: 10,
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        vm.isSelectSearchSysGroup = false;
                        return Restangular.all("commonRsService/getSysGroupForAutoComplete").post(
                            {
                                keySearch: vm.searchForm.sysGroupLv2Name,
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
                '<div class="row">' +
                '<p class="col-md-6 text-header-auto border-right-ccc" translate>Mã đơn vị</p>' +
                '<p class="col-md-6 text-header-auto" translate>Tên đơn vị</p>' +
                '</div>' +
                '</div>',
            template: '<div class="row" ><div class="col-md-6 col-xs-5" style="float:left">#: data.code #</div><div  style="padding-left: 5px;width:auto;overflow: hidden"> #: data.name #</div> </div>',
        };

        vm.isSelectSearchUnitTest = false;
        vm.unitTestSearchOptions = {
            clearButton: false,
            dataTextField: "name",
            placeholder: CommonService.translate("Nhập tên đơn vị"),
            dataValueField: "name",
            open: function (e) {
                vm.isSelectSearchUnitTest = false;
            },
            select: function (e) {
                vm.isSelectSearchUnitTest = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchForm.unitTestId = dataItem.sysGroupId;
                vm.searchForm.unitTestName = dataItem.name;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSearchUnitTest) {
                        vm.searchForm.unitTestId = null;
                        vm.searchForm.unitTestName = null;
                    }
                }, 100);
            },
            close: function (e) {
                $timeout(function () {
                    if (vm.searchForm.unitTestId == null) {
                        vm.searchForm.unitTestName = null;
                    }
                }, 1000);

            },
            pageSize: 10,
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        vm.isSelectSearchUnitTest = false;
                        return Restangular.all("commonRsService/getSysGroupForAutoComplete").post(
                            {
                                keySearch: vm.searchForm.unitTestName,
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
                '<div class="row">' +
                '<p class="col-md-6 text-header-auto border-right-ccc" translate>Mã đơn vị</p>' +
                '<p class="col-md-6 text-header-auto" translate>Tên đơn vị</p>' +
                '</div>' +
                '</div>',
            template: '<div class="row" ><div class="col-md-6 col-xs-5" style="float:left">#: data.code #</div><div  style="padding-left: 5px;width:auto;overflow: hidden"> #: data.name #</div> </div>',
        };

        vm.isSelectSearchCheckedUnitTest = false;
        vm.checkedUnitSearchOptions = {
            clearButton: false,
            dataTextField: "name", placeholder: CommonService.translate("Nhập tên đơn vị"),
            dataValueField: "name",
            open: function (e) {
                vm.isSelectSearchCheckedUnitTest = false;
            },
            select: function (e) {
                vm.isSelectSearchCheckedUnitTest = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchForm.groupId = dataItem.sysGroupId;
                vm.searchForm.checkedUnitCode = dataItem.code;
                vm.searchForm.groupName = dataItem.name;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSearchCheckedUnitTest) {
                        vm.searchForm.groupId = null;
                        vm.searchForm.checkedUnitCode = null;
                        vm.searchForm.groupName = null;
                    }
                }, 100);
            },
            close: function (e) {
                $timeout(function () {
                    if (vm.searchForm.groupId == null) {
                        vm.searchForm.checkedUnitCode = null;
                        vm.searchForm.groupName = null;
                    }
                }, 1000);

            },
            pageSize: 10,
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        vm.isSelectSearchCheckedUnitTest = false;
                        return Restangular.all("commonRsService/getSysGroupForAutoComplete").post(
                            {
                                keySearch: vm.searchForm.groupName,
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
                '<div class="row">' +
                '<p class="col-md-6 text-header-auto border-right-ccc" translate>Mã đơn vị</p>' +
                '<p class="col-md-6 text-header-auto" translate>Tên đơn vị</p>' +
                '</div>' +
                '</div>',
            template: '<div class="row" ><div class="col-md-6 col-xs-5" style="float:left">#: data.code #</div><div  style="padding-left: 5px;width:auto;overflow: hidden"> #: data.name #</div> </div>',
        };

        // autocomplete nguoi ky
        vm.isSelectSignedBy = false;
        vm.signedByOptions = {
            clearButton: false,
            dataTextField: "fullName", placeholder: CommonService.translate("Nhập tên nhân viên"),
            dataValueField: "fullName",
            open: function (e) {
                vm.isSelectSignedBy = false;
            },
            select: function (e) {
                vm.isSelectSignedBy = true;
                var dataItem = this.dataItem(e.item.index());
                vm.insertForm.signedBy = dataItem.sysUserId;
                vm.insertForm.signedByCode = dataItem.employeeCode;
                vm.insertForm.signedByName = dataItem.fullName;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSignedBy) {
                        vm.insertForm.signedBy = null;
                        vm.insertForm.signedByCode = null;
                        vm.insertForm.signedByName = null;
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
                        vm.isSelectSignedBy = false;
                        return Restangular.all("commonRsService/getSysUserForAutoComplete").post(
                            {
                                keySearch: vm.insertForm.signedByName,
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
                vm.insertForm.position = dataItem.positionId;
                vm.insertForm.positionCode = dataItem.code;
                vm.insertForm.positionName = dataItem.name;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectPosition) {
                        vm.insertForm.position = null;
                        vm.insertForm.positionCode = null;
                        vm.insertForm.positionName = null;
                    }
                }, 100);
            },
            close: function (e) {
                $timeout(function () {
                    if (vm.insertForm.position == null) {
                        vm.insertForm.positionCode = null;
                        vm.insertForm.positionName = null;
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
                                keySearch: vm.insertForm.positionName,
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
            if (vm.flagSysGroup == 1) {
                vm.searchForm.sysGroupLv2Id = dataItem.sysGroupId;
                vm.searchForm.sysGroupLv2Code = dataItem.code;
                vm.searchForm.sysGroupLv2Name = dataItem.name;
            } else if (vm.flagSysGroup == 2) {
                vm.insertForm.sysGroupLv2Id = dataItem.sysGroupId;
                vm.insertForm.sysGroupLv2Code = dataItem.code;
                vm.insertForm.sysGroupLv2Name = dataItem.name;
            }
            modalSysGroup.dismiss();
        }

        // popup nguoi ky
        var signedByColumns = [
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
                    '		<a  type="button" class=" icon_table" uib-tooltip="Chọn" translate>' +
                    '			<i ng-click="caller.saveSelectSignedBy(dataItem)" class="fa fa-check color-green" aria-hidden="true"></i> ' +
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

        var modalSignedBy = null;
        vm.openPopupSignedBy = function (data) {
            var templateUrl = "ktnb/popup/popupCommonSearch.html";
            var title = CommonService.translate("Tìm kiếm nhân viên");
            var windowId = "POPUP_SELECT_SIGNED_BY";
            vm.placeHolder = CommonService.translate("Mã/tên nhân viên");
            CommonService.populatePopupCreate(templateUrl, title, null, vm, windowId, null, '60%', '50%', null);
            setTimeout(function () {
                modalSignedBy = CommonService.getModalInstance1();
            }, 100);
            vm.commonPopupSearch = {};
            var api = "commonRsService/getSysUserForAutoComplete";
            CommonService.fillDataPopupCommonSearch(api, vm.commonPopupSearch, signedByColumns, vm);
        }

        vm.saveSelectSignedBy = function (dataItem) {
            vm.insertForm.signedBy = dataItem.sysUserId;
            vm.insertForm.signedByCode = dataItem.employeeCode;
            vm.insertForm.signedByName = dataItem.fullName;
            modalSignedBy.dismiss();
        }

        // popup chuc vu
        var positionColumns = [
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
                title: CommonService.translate("Mã chức danh"),
                field: 'code',
                width: "20%",
                headerAttributes: {
                    style: "text-align:center;", translate: "",
                },
                attributes: {
                    style: "text-align:left;"
                },
            }, {
                title: CommonService.translate("Tên chức danh"),
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
                    '			<i ng-click="caller.saveSelectPosition(dataItem)" class="fa fa-check color-green" aria-hidden="true"></i> ' +
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

        var modalPosition = null;
        vm.openPopupPosition = function () {
            var templateUrl = "ktnb/popup/popupCommonSearch.html";
            var title = CommonService.translate("Tìm kiếm chức danh");
            var windowId = "POPUP_SELECT_POSITION";
            vm.placeHolder = CommonService.translate("Mã/tên chức danh");
            CommonService.populatePopupCreate(templateUrl, title, null, vm, windowId, null, '60%', '50%', null);
            setTimeout(function () {
                modalPosition = CommonService.getModalInstance1();
            }, 100);
            vm.commonPopupSearch = {};
            var api = "commonRsService/getPositionForAutoComplete";
            CommonService.fillDataPopupCommonSearch(api, vm.commonPopupSearch, positionColumns, vm);
        }

        vm.saveSelectPosition = function (dataItem) {
            vm.insertForm.position = dataItem.positionId;
            vm.insertForm.positionCode = dataItem.code;
            vm.insertForm.positionName = dataItem.name;
            modalPosition.dismiss();
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
        }
        // * end popup common

        vm.checkValidateStartDate = function () {
            var d1 = kendo.parseDate(vm.insertForm.startDate, "dd/MM/yyyy");
            var d2 = kendo.parseDate(vm.insertForm.closeDate, "dd/MM/yyyy");
            var curdate = new Date();
            curdate.setHours(0, 0, 0, 0);
            var sysDate = kendo.parseDate(curdate, "dd/MM/yyyy");
            if (d1 == null) {
                vm.insertForm.startDate = '';
                toastr.error("Ngày bắt đầu không hợp lệ");
                $("#insertWorkAssignStartDate").focus();
                return;
            }
            if (d2 != null && d1 > d2) {
                vm.insertForm.startDate = '';
                toastr.error("Ngày bắt đầu phải nhỏ hơn ngày kết thúc");
                $("#insertWorkAssignStartDate").focus();
                return;
            }
            if (d1 < sysDate + 1) {
                vm.insertForm.startDate = '';
                toastr.error("Ngày bắt đầu phải lớn hơn ngày hiện tại");
                $("#insertWorkAssignStartDate").focus();
                return;
            }
        }

        vm.checkValidateEndDate = function () {
            var d1 = kendo.parseDate(vm.insertForm.startDate, "dd/MM/yyyy");
            var d2 = kendo.parseDate(vm.insertForm.closeDate, "dd/MM/yyyy");
            var sysDate = kendo.parseDate(new Date(), "dd/MM/yyyy");
            if (d2 == null) {
                vm.insertForm.closeDate = '';
                toastr.error("Ngày kết thúc không hợp lệ");
                $("#insertWorkAssignEndDate").focus();
                return;
            }
            if (d1 != null && d1 > d2) {
                vm.insertForm.closeDate = '';
                toastr.error("Ngày bắt đầu phải nhỏ hơn ngày kết thúc");
                $("#insertWorkAssignEndDate").focus();
                return;
            }
            if (d2 < sysDate + 1) {
                vm.insertForm.closeDate = '';
                toastr.error("Ngày kết thúc phải lớn hơn ngày hiện tại");
                $("#insertWorkAssignEndDate").focus();
                return;
            }
        }

        // đính kèm file
        function fillFileTable(data) {
            var dataSource = new kendo.data.DataSource({
                data: vm.dataFile,
                pageSize: 5
            });
            vm.gridFileOptions = kendoConfig.getGridOptions({
                autoBind: true,
                scrollable: true,
                resizable: true,
                editable: false,
                dataSource: dataSource,
                save: function () {
                    vm.workItemGrid.refresh();
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
                        hidden: vm.checkViewDetail || vm.typeCreate === 'extend',
                        template: dataItem =>
                            '<div class="text-center #=utilAttachDocumentId#" ng-if="!caller.checkViewDetail"> ' +
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

        // Xóa file đính kèm
        vm.removeRowFile = removeRowFile;

        function removeRowFile(dataItem) {
            confirm(CommonService.translate("Xác nhận xóa"), function () {
                $('#listAttachDocumentGrid').data('kendoGrid').dataSource.remove(dataItem);
                vm.dataFile = $('#listAttachDocumentGrid').data('kendoGrid').dataSource.data();
            })
        }

        vm.dataFile = [];
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

            if ($("#files")[0].files[0].name.split('.').pop() != 'pdf' && $("#files")[0].files[0].name.split('.').pop() != 'doc'
                && $("#files")[0].files[0].name.split('.').pop() != 'docx' && $("#files")[0].files[0].name.split('.').pop() != 'xlsx' && $("#files")[0].files[0].name.split('.').pop() != 'xls') {
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

            if (vm.dataFile != null) {
                for (var h = 0; h < vm.dataFile.length; h++) {
                    if (vm.dataFile[h].name == $("#files")[0].files[0].name) {
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
                        vm.dataFile = $("#listAttachDocumentGrid").data().kendoGrid.dataSource.data();
                        var obj = {};
                        obj.name = file.name;
                        obj.filePath = data[index];
                        obj.createdDate = kendo.toString(new Date((new Date()).getTime()), "dd/MM/yyyy");
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

        vm.downloadFileByPath = function (filePath) {
            window.location = Constant.BASE_SERVICE_URL + "fileservice/downloadFileATTT?" + filePath;
        }

        // Danh sach cong viec
        var recordWAD = 0;
        vm.isEdit = true;

        function fillDataWorkAssignDetail(data) {
            var dataItem = {
                data: data,
                page: 1,
                pageSize: 5
            };
            vm.listWorkAssignDetailGridOptions = kendoConfig.getGridOptions({
                autoBind: true,
                scrollable: true,
                resizable: true,
                sortable: false,
                columnMenu: false,
                serverPaging: true,
                editable: {
                    createAt: "bottom"
                },
                dataBinding: function () {
                    recordWAD = (this.dataSource.page() - 1) * this.dataSource.pageSize();
                },
                toolbar: [
                    {
                        name: "actions",
                        template: '<div class=" pull-left " ng-if="!caller.checkViewDetail" ng-hide="caller.typeCreate === \'extend\' || caller.insertForm.typeWo == 4" >' +
                            '<button class="btn btn-qlk padding-search-right addQLK ng-scope"' +
                            'ng-click="caller.listWorkAssignDetailGrid.addRow()" uib-tooltip="Thêm công việc" style="width: 200px" translate>Thêm công việc</button>' +
                            '</div>'
                    }
                ],
                dataSource: {
                    data: data,
                    page: 1,
                    pageSize: 5,
                    schema: {
                        model: {
                            fields: {
                                stt: {editable: false},
                                workName: {editable: vm.isEdit},
                                description: {editable: vm.isEdit},
                                performerName: {editable: vm.isEdit},
                                statusDvVerify: {editable: vm.isEdit},
                                statusNvApprove: {editable: vm.isEdit},
                                deadline: {editable: false},
                                approveNvDate: {editable: vm.isEdit},
                                completeDate: {editable: vm.isEdit},
                                cancelNvDescription: {editable: vm.isEdit},
                                progressWork: {editable: vm.isEdit},
                                needOvercome: {editable: false},
                                statusOvercome: {editable: false},
                            }
                        }
                    }
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
                columns: getColumnWorkAssignDetailGrid(dataItem)
            });
        }

        function getColumnWorkAssignDetailGrid(dataItem) {
            if (vm.insertForm.typeWo == 4) {
                return [
                    {
                        title: CommonService.translate("STT"),
                        field: "stt",
                        template: function () {
                            ++recordWAD;
                            dataItem.stt = recordWAD;
                            return recordWAD;
                        },
                        editable: false,
                        width: "50px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;"},
                        type: 'text'
                    },
                    {
                        title: CommonService.translate("Tên công việc"),
                        field: 'workName',
                        width: "80px",
                        editable: function (dataItem) {
                            return vm.isCreateForm || vm.isUpdateForm;
                        },
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal;"
                        },
                        type: 'text'
                    },
                    {
                        title: CommonService.translate("Nội dung chi tiết"),
                        field: "description",
                        width: "80px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:left;white-space:normal;"},
                        editable: function (dataItem) {
                            return vm.isCreateForm || vm.isUpdateForm;
                        },
                        type: 'text'
                    },
                    {
                        title: CommonService.translate("Nhân viên thực hiện"),
                        field: "performerName",
                        width: "80px",
                        hidden: !vm.checkViewDetail,
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        attributes: {
                            style: "text-align:center;"
                        },
                        editable: false,
                        type: 'text'
                    },
                    {
                        title: CommonService.translate("Trạng thái đơn vị xác nhận"),
                        field: 'statusDvVerify',
                        width: "100px",
                        template: function (dataItem) {
                            vm.statusDvVerifyArray.forEach(function (data) {
                                if (data.id == dataItem.statusDvVerify) {
                                    dataItem.statusDvVerifyName = data.name;
                                }
                            });
                            return dataItem.statusDvVerifyName ? dataItem.statusDvVerifyName : '';
                        },
                        hidden: !vm.checkViewDetail,
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        attributes: {
                            style: "text-align:center;"
                        },
                        editable: false,
                        type: 'text'
                    },
                    {
                        title: CommonService.translate("Thời gian đơn vị giao WO"),
                        field: 'coordinateNvDate',
                        width: "100px",
                        hidden: !vm.checkViewDetail,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                        editable: false,
                        type: 'text'
                    },
                    {
                        field: "statusNvApprove",
                        title: CommonService.translate("Trạng thái NV nhận việc"),
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                        hidden: !vm.checkViewDetail,
                        template: function (dataItem) {
                            vm.statusNvApproveArray.forEach(function (data) {
                                if (data.id == dataItem.statusNvApprove) {
                                    dataItem.statusNvApproveName = data.name;
                                }
                            });
                            return dataItem.statusNvApproveName ? dataItem.statusNvApproveName : '';
                        },
                        width: "80px",
                        editable: false,
                        type: 'text'

                    },
                    {
                        title: CommonService.translate("Hạn hoàn thành"),
                        field: 'deadline',
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                        width: "80px",
                        template: dataItem => ' <input kendo-date-picker k-format="\'dd/MM/yyyy\'" ng-change="caller.onDataBound(dataItem)"\n' +
                            '                                        name="deadline" id="deadline"\n' +
                            '                                        ng-model="dataItem.deadline" ng-disabled="!caller.isEdit"\n' +
                            '                                        style="width: 100%;" min-year="1000" date-time />">'

                    },
                    {
                        title: CommonService.translate("Tiến độ công việc"),
                        field: "progressWork",
                        width: "150px",
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal;"
                        },
                        editable: false,
                    },
                    {
                        title: CommonService.translate("Trạng thái khắc phục"),
                        field: "statusOvercome",
                        width: "80px",
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal;"
                        },
                        editable: false,
                        template: dataItem => {
                            if (dataItem.statusOvercome == 0) {
                                return 'Không cần khắc phục';
                            } else if (dataItem.statusOvercome == 1) {
                                return 'Chưa tạo';
                            } else return '';
                        }
                    },
                    {
                        title: CommonService.translate("Thời gian hoàn thành"),
                        field: "completeDate",
                        width: "80px",
                        hidden: !vm.checkViewDetail,
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        attributes: {
                            style: "text-align:center;"
                        },
                        editable: false,
                        type: 'text'
                    },
                    {
                        title: CommonService.translate("Lý do từ chối"),
                        field: "cancelNvDescription",
                        width: "80px",
                        hidden: !vm.checkViewDetail,
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        attributes: {
                            style: "text-align:center;"
                        },
                        editable: false,
                        type: 'text'
                    },
                    {
                        title: CommonService.translate("File hoàn thành"),
                        // field: "performerName",
                        width: "120px",
                        hidden: !vm.checkViewDetail,
                        template: function (dataItem) {
                            var result = '';
                            //
                            // workAssignService.getListAttachedFile({
                            // 	objectId: dataItem.workAssignDetailId,
                            // 	type: "WONV",
                            // }).then(
                            // 	function (res) {
                            if (dataItem.listFileAttach && dataItem.listFileAttach.length > 0) {
                                for (let i = 0; i < dataItem.listFileAttach.length; i++) {
                                    result += '<a ng-click="caller.downloadFileByPath(\'' + dataItem.listFileAttach[i].filePath + '\')"' + '>' + dataItem.listFileAttach[i].name + '</a><br>';
                                }
                            }
                            return result;
                            // 	}
                            // );

                        },
                        editable: false,
                        type: 'text'
                    }
                ]
            } else {
                return [
                    {
                        title: CommonService.translate("STT"),
                        field: "stt",
                        template: function () {
                            ++recordWAD;
                            dataItem.stt = recordWAD;
                            return recordWAD;
                        },
                        editable: false,
                        width: "50px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;"},
                        type: 'text'
                    },
                    {
                        title: CommonService.translate("Tên công việc"),
                        field: 'workName',
                        width: "80px",
                        editable: function (dataItem) {
                            return vm.isCreateForm || vm.isUpdateForm;
                        },
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal;"
                        },
                        type: 'text'
                    },
                    {
                        title: CommonService.translate("Nội dung chi tiết"),
                        field: "description",
                        width: "80px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:left;white-space:normal;"},
                        editable: function (dataItem) {
                            return vm.isCreateForm || vm.isUpdateForm;
                        },
                        type: 'text'
                    },
                    {
                        title: CommonService.translate("Nhân viên thực hiện"),
                        field: "performerName",
                        width: "80px",
                        hidden: !vm.checkViewDetail,
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        attributes: {
                            style: "text-align:center;"
                        },
                        editable: false,
                        type: 'text'
                    },
                    {
                        title: CommonService.translate("Trạng thái đơn vị xác nhận"),
                        field: 'statusDvVerify',
                        width: "100px",
                        template: function (dataItem) {
                            vm.statusDvVerifyArray.forEach(function (data) {
                                if (data.id == dataItem.statusDvVerify) {
                                    dataItem.statusDvVerifyName = data.name;
                                }
                            });
                            return dataItem.statusDvVerifyName ? dataItem.statusDvVerifyName : '';
                        },
                        hidden: !vm.checkViewDetail,
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        attributes: {
                            style: "text-align:center;"
                        },
                        editable: false,
                        type: 'text'
                    },
                    {
                        title: CommonService.translate("Thời gian đơn vị giao WO"),
                        field: 'coordinateNvDate',
                        width: "100px",
                        hidden: !vm.checkViewDetail,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                        editable: false,
                        type: 'text'
                    },
                    {
                        field: "statusNvApprove",
                        title: CommonService.translate("Trạng thái NV nhận việc"),
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                        hidden: !vm.checkViewDetail,
                        template: function (dataItem) {
                            vm.statusNvApproveArray.forEach(function (data) {
                                if (data.id == dataItem.statusNvApprove) {
                                    dataItem.statusNvApproveName = data.name;
                                }
                            });
                            return dataItem.statusNvApproveName ? dataItem.statusNvApproveName : '';
                        },
                        width: "80px",
                        editable: false,
                        type: 'text'

                    },
                    {
                        title: CommonService.translate("Hạn hoàn thành"),
                        field: 'deadline',
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                        width: "80px",
                        template: dataItem => ' <input kendo-date-picker k-format="\'dd/MM/yyyy\'" ng-change="caller.onDataBound(dataItem)"\n' +
                            '                                        name="deadline" id="deadline"\n' +
                            '                                        ng-model="dataItem.deadline" ng-disabled="!caller.isEdit"\n' +
                            '                                        style="width: 100%;" min-year="1000" date-time />">'

                    },
                    {
                        title: CommonService.translate("Tiến độ công việc"),
                        field: "progressWork",
                        width: "150px",
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal;"
                        },
                        editable: false,
                    },
                    // {
                    //     title: CommonService.translate("Cần thực hiện WO khắc phục"),
                    //     field: "needOvercome",
                    //     width: "150px",
                    //     headerAttributes: {
                    //         style: "text-align:center;"
                    //     },
                    //     attributes: {
                    //         style: "text-align:center; white-space:normal;"
                    //     },
                    //     editable: false,
                    // },
                    {
                        title: CommonService.translate("Trạng thái khắc phục"),
                        field: "statusOvercome",
                        width: "80px",
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal;"
                        },
                        editable: false,
                        template: dataItem => {
                            if (dataItem.statusOvercome == 0) {
                                return 'Không cần khắc phục';
                            } else if (dataItem.statusOvercome == 1) {
                                return 'Chưa tạo';
                            } else return '';
                        }
                    },
                    {
                        title: CommonService.translate("Thời gian hoàn thành"),
                        field: "completeDate",
                        width: "80px",
                        hidden: !vm.checkViewDetail,
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        attributes: {
                            style: "text-align:center;"
                        },
                        editable: false,
                        type: 'text'
                    },
                    {
                        title: CommonService.translate("Lý do từ chối"),
                        field: "cancelNvDescription",
                        width: "80px",
                        hidden: !vm.checkViewDetail,
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        attributes: {
                            style: "text-align:center;"
                        },
                        editable: false,
                        type: 'text'
                    },
                    {
                        title: CommonService.translate("File hoàn thành"),
                        // field: "performerName",
                        width: "120px",
                        hidden: !vm.checkViewDetail,
                        template: function (dataItem) {
                            var result = '';
                            //
                            // workAssignService.getListAttachedFile({
                            // 	objectId: dataItem.workAssignDetailId,
                            // 	type: "WONV",
                            // }).then(
                            // 	function (res) {
                            if (dataItem.listFileAttach && dataItem.listFileAttach.length > 0) {
                                for (let i = 0; i < dataItem.listFileAttach.length; i++) {
                                    result += '<a ng-click="caller.downloadFileByPath(\'' + dataItem.listFileAttach[i].filePath + '\')"' + '>' + dataItem.listFileAttach[i].name + '</a><br>';
                                }
                            }
                            return result;
                            // 	}
                            // );

                        },
                        editable: false,
                        type: 'text'
                    },
                    {
                        title: CommonService.translate("Xóa"),
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold",
                            translate: ""
                        },
                        hidden: vm.checkViewDetail || vm.typeCreate === 'extend',
                        template: dataItem =>
                            '<div class="text-center " ng-if="!caller.checkViewDetail"> ' +
                            '<button style=" border: none;" class="icon_table" uib-tooltip="Xóa" ng-click="caller.removeRowDetail(dataItem)"  translate>  ' +
                            '<i style="color: steelblue;" class="fa fa-trash" ria-hidden="true"></i>' +
                            '</button>' +
                            '</div>',
                        width: '30px',
                        field: "acctions",
                        editable: false,
                        type: 'text'
                    }
                ]
            }
        }

        var recordDR = 0;
        // function fillDataDepartmentReceive(data) {
        //     vm.departmentReceiveDataSource ={};
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
            toolbar: [
                {
                    name: "actions",
                    template: '<div ng-if="caller.isCreateForm || caller.isUpdateForm " class="col-md-4" style="text-align: right"><label>Chọn đơn vị thực hiện</label></div>' +
                        '<div ng-if="caller.isCreateForm || caller.isUpdateForm " class="col-md-5"><input class="form-control width100" type="text" k-options="caller.sgAutoCOptions" ' +
                        'kendo-auto-complete   ng-model="caller.sgForm.keySearch" id="autoCompleteSgAutoC"/></div>'
                }
            ],
            dataSource: {
                serverPaging: false,
                transport: {
                    create: function (options) {
                        options.success(options.data);
                    },
                    read: function (options) {
                        options.success(vm.listDepartmentReceiveExportTemp);
                    },
                },
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
                    title: CommonService.translate("Đơn vị"),
                    field: 'name',
                    width: "250px",
                    headerAttributes: {
                        style: "text-align:center;"
                    },
                    attributes: {
                        style: "text-align:left;"
                    },
                },
                {
                    title: CommonService.translate("Xóa"),
                    headerAttributes: {
                        style: "text-align:center; font-weight: bold",
                        translate: ""
                    },
                    template: dataItem =>
                        '<div class="text-center " > ' +
                        '<button style=" border: none;" class="icon_table" uib-tooltip="Xóa" ng-click="caller.removeRowDepartmentReceive(dataItem)"  translate>  ' +
                        '<i style="color: steelblue;" class="fa fa-trash" aria-hidden="true"></i>' +
                        '</button>' +
                        '</div>',
                    width: '30px',
                    field: "actions"
                }
            ]
        });
        // }

        vm.isSelectSgAutoC = false;
        vm.sgAutoCOptions = {
            dataTextField: "name", placeholder: "Tên, Mã đơn vị",
            dataValueField: "sysGroupId",
            open: function (e) {
                vm.isSelectSgAutoC = false;
                // if (vm.insertForm.typeWo ==2 && vm.listDepartmentReceiveExportTemp.length >= 1){
                //     toastr.error("Loại WO 'Thực hiện kết luận sau thanh kiểm tra' chỉ cho phép chọn 1 người ủy quyền!");
                //     return;
                // }
            },
            select: function (e) {
                vm.isSelectSgAutoC = true;
                var dataItem = this.dataItem(e.item.index());
                vm.sgForm.keySearch = null;
                if (vm.listDepartmentReceiveExportTemp.length > 0) {
                    for (var i = 0; i < vm.listDepartmentReceiveExportTemp.length; i++) {
                        if (dataItem.sysGroupId == vm.listDepartmentReceiveExportTemp[i].sysGroupId) {
                            toastr.error("Đã tồn tại đơn vị trong danh sách!");
                            return;
                        }
                    }
                }
                let obj = {};
                obj.sysGroupId = dataItem.sysGroupId;
                obj.name = dataItem.name;
                // if (vm.insertForm.typeWo ==2 && vm.listDepartmentReceiveExportTemp.length > 0) {
                //     vm.listDepartmentReceiveExportTemp.clear();
                // }
                vm.listDepartmentReceiveExportTemp.push(obj);
                vm.listDepartmentReceiveGrid.dataSource.data(vm.listDepartmentReceiveExportTemp);
                vm.listDepartmentReceiveGrid.refresh();
                // if (vm.insertForm.typeWo ==2 && dataItem) {
                //     vm.insertForm.sysGroupLv2Id = dataItem.sysGroupId;
                //     vm.insertForm.sysGroupLv2Code = dataItem.code;
                //     vm.insertForm.sysGroupLv2Name = dataItem.name;
                // }
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
                '<div class="row">' +
                '<p class="col-md-6 text-header-auto border-right-ccc" translate>Mã đơn vị</p>' +
                '<p class="col-md-6 text-header-auto" translate>Tên đơn vị </p>' +
                '</div>' +
                '</div>',
            template: '<div class="row" ><div class="col-md-6 col-xs-5" style="float:left">#: data.code #</div><div  style="padding-left: 5px;width:auto;overflow: hidden"> #: data.name #</div> </div>',
        };

        vm.disableExportExcel = false;
        vm.getExcelTemplate = function () {
            $http({
                url: Constant.BASE_SERVICE_URL + RestEndpoint.WORK_ASSIGN_SERVICE_URL + "/exportFileBM",
                method: "POST",
                data: {},
                headers: {
                    'Content-type': 'application/json'
                },
                responseType: 'arraybuffer'
            }).success(function (data, status, headers, config) {
                saveFile(data, "BM_danhsachdonvinhanWO.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
            }).error(function (data, status, headers, config) {
                toastr.error("Có lỗi xảy ra! Vui lòng thử lại sau.");
            });

        };

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
                setTimeout(function () {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 0);
            }
        }

        // function isExcelFile(fileName) {
        //     var validExts = new Array(".xlsx", ".xls");
        //     var fileExt = fileName.substring(fileName.lastIndexOf('.'));
        //     if (validExts.indexOf(fileExt) < 0) return false;
        //     else return true;
        // }
        var modalInstanceImport;
        vm.submitImportNewTargets = function submitImportNewTargets() {
            vm.listDepartmentReceiveExportTemp = [];
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
                url: Constant.BASE_SERVICE_URL + RestEndpoint.WORK_ASSIGN_SERVICE_URL + "/importExcel?folder=temp",
                type: "POST",
                data: formData,
                enctype: 'multipart/form-data',
                processData: false,
                contentType: false,
                cache: false,
                success: function (kq) {
                    var data = kq.data;
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
                        // modalInstanceImport = CommonService.createCustomPopupWithEvent(templateUrl, title, vm.lstErrImport, null, "80%", "420px", initDataErrImportFunction, null);

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

                        $("#listDepartmentReceiveGrid").data("kendoGrid").dataSource.read();
                        $("#listDepartmentReceiveGrid").data("kendoGrid").refresh();
                    }
                    $scope.$apply();
                }
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

        vm.addDetailForm = {};
        vm.listWADetail = [];
        var modalAddWorkAssignDetail = null;
        vm.addWorkAssignDetail = function () {
            vm.addDetailForm = {};
            var templateUrl = 'ktnb/workAssign/addWorkAssignDetailPopup.html';
            var title = CommonService.translate("Thêm mới công việc");
            modalAddWorkAssignDetail = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "40%", "30%", null, null);
        }

        vm.saveAddDetail = function () {
            if (vm.addDetailForm.workName == null || vm.addDetailForm.workName.trim() == '') {
                toastr.error(CommonService.translate("Tên công việc không được để trống"));
                $("#addDetailWorkName").focus();
                return;
            }
            if (vm.addDetailForm.description == null || vm.addDetailForm.description.trim() == '') {
                toastr.error(CommonService.translate("Nội dung chi tiết không được để trống"));
                $("#addDetailDescription").focus();
                return;
            }
            modalAddWorkAssignDetail.dismiss();
            vm.listWADetail.push(vm.addDetailForm);
            refreshDetailGrid(vm.listWADetail);
        }

        function refreshDetailGrid(d) {
            var grid = vm.listWorkAssignDetailGrid;
            if (grid) {
                grid.dataSource.data(d);
                grid.refresh();
            }
        }

        // Xóa row detail
        vm.removeRowDetail = removeRowDetail;

        function removeRowDetail(dataItem) {
            confirm(CommonService.translate("Xác nhận xóa"), function () {
                $('#listWorkAssignDetailGrid').data('kendoGrid').dataSource.remove(dataItem);
                vm.listWADetail = $('#listWorkAssignDetailGrid').data('kendoGrid').dataSource._data;
            });
        }

        vm.removeRowDepartmentReceive = function (dataItem) {
            confirm(CommonService.translate("Xác nhận xóa"), function () {
                $('#listDepartmentReceiveGrid').data('kendoGrid').dataSource.remove(dataItem);
                vm.listDepartmentReceiveExportTemp = $('#listDepartmentReceiveGrid').data('kendoGrid').dataSource._data;
            });
        }

        // Xác nhận giao việc
        vm.approveStatus = function (dataItem) {
            confirm(CommonService.translate("Bạn có chắc chắn DUYỆT GIAO VIỆC mã WO") + " " + dataItem.code + " " + CommonService.translate("không?"), function () {
                vm.insertForm = angular.copy(dataItem);
                vm.insertForm.status = 1;
                vm.insertForm.statusDvApprove = 0;
                workAssignService.approveStatus(vm.insertForm).then(function (data) {
                    toastr.success(CommonService.translate("Duyệt giao việc thành công"));
                    vm.currentPage = $("#workAssignGrid").data("kendoGrid").dataSource.page();
                    vm.doSearch(vm.currentPage);
                    vm.currentPage = 1;
                }, function () {
                    toastr.error(CommonService.translate("Có lỗi xảy ra"));
                });
            });
        }

        vm.openRejectKtnbVerify = function (dataItem) {
            vm.insertForm = angular.copy(dataItem);
            vm.typeCreate = 'rejectKtnbVerify';
            var templateUrl = 'ktnb/workAssign/rejectPopup.html';
            var title = "Từ chối đóng việc";
            modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "30%", null, null);
        };

        vm.openAcceptKtnbVerify = function (dataItem) {
            vm.isCreateForm = false;
            vm.checkViewDetail = true;
            vm.checkViewComplete = true;
            vm.typeCreate = 'acceptKtnbVerify';
            vm.newTypeWo = dataItem.typeWo == 4 ? true : false;
            dataItem.typeFile = "WOKTNB";
            workAssignService.getDetail(dataItem).then(function (data) {
                vm.insertForm = angular.copy(data);
                if (vm.insertForm.inspectionInformationDTOs) {
                    vm.insertForm.inspectionInformationDTOs.map(x => {
                        x.inspectionUnits = x.problemDiscoveredDTOList.map(y => y.groupName).toString().replace(",", ';\n ');
                        return x;
                    })
                }
                var templateUrl = 'ktnb/workAssign/workAssignPopup.html';
                var title = CommonService.translate("Hoàn thành công việc");
                modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "70%", null, null);
                vm.dataFile = vm.insertForm.listAttachDocument;
                vm.listWADetail = vm.insertForm.listWorkAssignDetail;
                fillFileTable(vm.dataFile);
                // file đính kèm start
                // file đính kèm end
                fillDataWorkAssignDetail(vm.listWADetail);
            }, function () {
                toastr.error(CommonService.translate("Có lỗi xảy ra"));
            });
        };

        // Từ chối giao việc
        vm.cancelApproveStatus = function (dataItem) {
            vm.typeCreate = 'cancelApproveStatus';
            vm.insertForm = angular.copy(dataItem);
            var templateUrl = 'ktnb/workAssign/rejectPopup.html';
            var title = CommonService.translate("Từ chối giao việc");
            modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "30%", "20%", null, null);
        }

        vm.saveReject = function () {
            if (vm.insertForm.rejectDescription == null) {
                toastr.error("Chưa nhập Lý do từ chối");
                return;
            }
            if (vm.typeCreate === 'cancelApproveStatus') {
                vm.insertForm.status = 0;
                vm.insertForm.cancelKtnbDescription = vm.insertForm.rejectDescription;
                workAssignService.approveStatus(vm.insertForm).then(function (data) {
                    toastr.success(CommonService.translate("Từ chối giao việc thành công"));
                    vm.currentPage = $("#workAssignGrid").data("kendoGrid").dataSource.page();
                    vm.doSearch(vm.currentPage);
                    vm.currentPage = 1;
                    modalAdd.dismiss();
                }, function () {
                    toastr.error(CommonService.translate("Có lỗi xảy ra"));
                });
            }
            if (vm.typeCreate === 'rejectKtnbVerify') {
                vm.insertForm.statusKtnbVerify = 2;
                vm.insertForm.statusDvApprove = 1;
                vm.insertForm.rejectKtnbDescription = vm.insertForm.rejectDescription;
                Restangular.all("workAssignRsService/verifyWorkByKtnb").post(vm.insertForm).then(function (response) {
                    toastr.success(CommonService.translate("Từ chối đóng việc thành công"));
                    vm.doSearch(vm.currentPage);
                    modalAdd.dismiss();
                }).catch(function (err) {
                    console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
                });
            }
        }

        vm.saveKtnbVerifyWork = function () {
            let obj = vm.insertForm;
            obj.statusKtnbVerify = 1;
            Restangular.all("workAssignRsService/verifyWorkByKtnb").post(obj).then(function (response) {
                if (response && response.error) {
                    toastr.error(response.error);
                } else {
                    toastr.success("Ghi lại thành công");
                    vm.currentPage = $("#workAssignGrid").data("kendoGrid").dataSource.page();
                    vm.doSearch(vm.currentPage);
                    vm.currentPage = 1;
                    modalAdd.close();
                }
            }).catch(function (err) {
                console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
            });

        };

        vm.openTimeExtendPopup = function (dataItem) {
            vm.isEdit = false;
            vm.isCreateForm = false;
            vm.checkViewDetail = false;
            vm.typeCreate = 'extend';
            dataItem.typeFile = "WOKTNB";
            workAssignService.getDetail(dataItem).then(function (data) {
                vm.insertForm = angular.copy(data);
                var templateUrl = 'ktnb/workAssign/workAssignPopup.html';
                var title = CommonService.translate("Màn hình gia hạn công việc");
                modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "90%", "50%", null, null);
                vm.dataFile = vm.insertForm.listAttachDocument;
                vm.listWADetail = vm.insertForm.listWorkAssignDetail;
                fillFileTable(vm.dataFile);
                fillDataWorkAssignDetail(vm.listWADetail);
            }, function () {
                toastr.error(CommonService.translate("Có lỗi xảy ra"));
            });
        }

        var modalAdd1 = null;
        vm.openExtendTimeHistory = function () {
            var templateUrl = 'ktnb/workAssign/ExtendTimeHistory.html';
            var title = CommonService.translate("Lịch sử gia hạn WO");
            modalAdd1 = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "50%", null, null);
            fillExtendTimeTable([]);
        }

        var countExtendTime = 0;

        function fillExtendTimeTable(data) {
            vm.extendTimeGridOptions = kendoConfig.getGridOptions({
                autoBind: true,
                resizable: true,
                scrollable: true,
                dataBinding: function () {
                    countExtendTime = (this.dataSource.page() - 1) * this.dataSource.pageSize();
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
                            vm.countExtendTime = response.total;
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
                            url: Constant.BASE_SERVICE_URL + "workAssignRsService/getExtendTimeHistoryByWorkAssignId",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, type) {
                            vm.insertForm.page = options.page;
                            vm.insertForm.pageSize = options.pageSize;
                            return JSON.stringify(vm.insertForm);
                        }
                    },
                    pageSize: 10,
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
                            return ++countExtendTime;
                        },
                        width: "3%",
                        headerAttributes: {style: "text-align:center", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    }, {
                        title: CommonService.translate("Người gia hạn"),
                        field: 'extendByName',
                        width: "15%",
                        headerAttributes: {style: "text-align:center", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    }, {
                        title: CommonService.translate("Ngày gia hạn"),
                        field: 'extendDate',
                        width: "15%",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    }, {
                        title: CommonService.translate("Gia hạn từ ngày"),
                        field: 'extendDateFrom',
                        width: "15%",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    }, {
                        title: CommonService.translate("Gia hạn đến ngày"),
                        field: 'extendDateTo',
                        width: "15%",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    }, {
                        title: CommonService.translate("Lý do gia hạn"),
                        field: 'extendReason',
                        width: "30%",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:left;white-space:normal;"},
                    },
                ]
            });
        }

        vm.saveExtend = function () {
            if (vm.insertForm.extendDateTo == null) {
                toastr.error(CommonService.translate("Ngày gia hạn không được để trống"));
                return;
            }

            // var date = new Date();
            // date.setHours(0,0,0,0);
            // if(kendo.parseDate(date,"dd/MM/yyyy")<kendo.parseDate(vm.insertForm.closeDate,"dd/MM/yyyy")) {
            //     toastr.error(CommonService.translate("Gia hạn trước chưa hết hiệu lực"));
            //     return;
            // }

            if (kendo.parseDate(vm.insertForm.extendDateTo, "dd/MM/yyyy") < kendo.parseDate(vm.insertForm.startDate, "dd/MM/yyyy")) {
                toastr.error(CommonService.translate("Ngày gia hạn phải lớn hơn ngày bắt đầu"));
                return;
            }

            if (vm.insertForm.extendReason == null || vm.insertForm.extendReason == "") {
                toastr.error(CommonService.translate("Lý do gia hạn không được để trống"));
                return;
            }
            $("#extendButton").disabled = true;
            vm.insertForm.extendDateFrom = kendo.parseDate(vm.insertForm.closeDate, "dd/MM/yyyy");
            workAssignService.saveExtend(vm.insertForm).then(function () {
                toastr.success(CommonService.translate("Gia hạn thành công"));
                vm.cancel();
                vm.doSearch(vm.currentPage);
                $("#extendButton").disabled = false;
            }, function (err) {
                toastr.error(CommonService.translate("Có lỗi xảy ra"));
                $("#extendButton").disabled = false;
            });
        }

        vm.isSelectSearchCreateBy = false;
        vm.createBySearchOptions = {
            clearButton: false,
            dataTextField: "name", placeholder: CommonService.translate("Nhập tên/mã người giao"),
            dataValueField: "name",
            open: function (e) {
                vm.isSelectSearchCreateBy = false;
            },
            select: function (e) {
                vm.isSelectSearchCreateBy = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchForm.createBy = dataItem.sysUserId;
                vm.searchForm.createByName = dataItem.fullName;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSearchCreateBy) {
                        vm.searchForm.createBy = null;
                        vm.searchForm.createByName = null;
                    }
                }, 100);
            },
            close: function (e) {
                $timeout(function () {
                    if (vm.searchForm.createBy == null) {
                        vm.searchForm.createByName = null;
                    }
                }, 1000);

            },
            pageSize: 10,
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        vm.isSelectSearchCreateBy = false;
                        return Restangular.all("commonRsService/getSysUserForAutoComplete").post(
                            {
                                keySearch: vm.searchForm.createByName,
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
                '<div class="row">' +
                '<p class="col-md-6 text-header-auto border-right-ccc" translate>Mã nhân viên</p>' +
                '<p class="col-md-6 text-header-auto" translate>Tên nhân viên</p>' +
                '</div>' +
                '</div>',
            template: '<div class="row" ><div class="col-md-6 col-xs-5" style="float:left">#: data.employeeCode #</div><div  style="padding-left: 5px;width:auto;overflow: hidden"> #: data.fullName #</div> </div>',
        };

        vm.checkedWorkAssignStatus = false;
        vm.listChecked = [];
        vm.openCheckbox = function () {
            vm.listChecked = [];
            for (let i = 0; i < document.getElementsByName('checkboxWorkAssign').length; i++) {
                if ($("#workAssignGrid").data("kendoGrid").dataSource.data()[i].status == 2) {
                    document.getElementsByName('checkboxWorkAssign').item(i).checked = true;
                    vm.onChange($("#workAssignGrid").data("kendoGrid").dataSource.data()[i]);
                }
            }
            vm.checkedWorkAssignStatus = true;
        }

        vm.cancelCheckbox = function () {
            for (let i = 0; i < document.getElementsByName('checkboxWorkAssign').length; i++) {
                document.getElementsByName('checkboxWorkAssign').item(i).checked = false;
                vm.onChange($("#workAssignGrid").data("kendoGrid").dataSource.data()[i]);
            }
            vm.checkedWorkAssignStatus = false;
            vm.listChecked = [];
        }

        vm.changeState = function () {
            if (!vm.checkedWorkAssignStatus) {
                vm.openCheckbox();
            } else {
                vm.cancelCheckbox();
            }
        }

        //chua check quyen approve
        vm.onChange = function (dataItem) {
            if (dataItem.status == 2) {
                var flag = false;
                if (vm.listChecked.length == 0) {
                    vm.listChecked.push(dataItem);
                } else {
                    for (var i = 0; i < vm.listChecked.length; i++) {
                        if (dataItem.workAssignId == vm.listChecked[i].workAssignId) {
                            vm.listChecked.splice(i, 1);
                            flag = true;
                        }
                    }
                    if (flag == false) {
                        vm.listChecked.push(dataItem);
                    }
                }
            }
        };

        vm.quickApprove = function () {
            if (vm.listChecked.length === 0) {
                toastr.error(CommonService.translate("Bắt buộc chọn ít nhất 1 bản ghi."));
                return;
            }
            for (let i = 0; i < vm.listChecked.length; i++) {
                vm.listChecked[i].status = 1;
                vm.listChecked[i].statusDvApprove = 0;
            }
            confirm(CommonService.translate("Bạn có chắc chắn muốn duyệt " + vm.listChecked.length + " bản ghi này?"), function () {
                kendo.ui.progress(vm.documentBody, true);
                var x = angular.copy(vm.searchForm);
                x.listQuickApprove = vm.listChecked;
                Restangular.all('workAssignRsService/quickApproveStatus').post(x).then(function (data) {
                    toastr.success(CommonService.translate("Duyệt nhanh thành công."));
                    vm.currentPage = $("#workAssignGrid").data("kendoGrid").dataSource.page();
                    vm.doSearch(vm.currentPage);
                    vm.currentPage = 1;
                    kendo.ui.progress(vm.documentBody, false);
                }, function (err) {
                    toastr.error(CommonService.translate("Có lỗi xảy ra!"));
                    vm.currentPage = $("#workAssignGrid").data("kendoGrid").dataSource.page();
                    vm.doSearch(vm.currentPage);
                    vm.currentPage = 1;
                    kendo.ui.progress(vm.documentBody, false);
                });
            });
        }
        // end controller

        vm.onChangeTypeWoDetail = function () {
            var dataItem = {
                data: [],
                page: 1,
                pageSize: 5
            };
            var grid = $("#listWorkAssignDetailGrid").data("kendoGrid");
            grid.setOptions({
                columns: getColumnWorkAssignDetailGrid(dataItem),
                autoBind: true
            });
            grid.dataSource.data([])
            if (vm.insertForm.typeWo == 4) {
                grid.addRow();
            }
        }

        function getUnitDatasource(unitName) {
            return Restangular.all("commonRsService/getSysGroupForAutoComplete").post(
                {
                    keySearch: unitName,
                    groupLevelLst: ['2', '3'],
                    page: 1,
                    pageSize: 10000
                }
            ).then(function (response) {
                vm.unitDatasource = response.data.map(x => {
                    x.codeName = x.code + " - " + x.name;
                    return x;
                });
            }).catch(function (err) {
                console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
            });
        }

        vm.onPrint = function (id) {
            let ele = "detail_" + id;
            var mywindow = window.open('', 'PRINT', 'height=768,width=1366');
            mywindow.document.write('<html><head>');
            mywindow.document.write('<link href="./assets/global/plugins/bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css" media="all" />');
            mywindow.document.write('</head><body style="padding: 20px; font-size: 12px" onload="window.print();window.close()">');
            mywindow.document.write(document.getElementById(ele).innerHTML);
            // mywindow.document.write('<script type="text/javascript">$(window).load(function() { window.print(); window.close(); });</script>');
            mywindow.document.write('</body></html>');

            mywindow.document.close();
            mywindow.focus();
            // setTimeout(function(){mywindow.print();},1000);
            // mywindow.close();
        }
    }

})();
