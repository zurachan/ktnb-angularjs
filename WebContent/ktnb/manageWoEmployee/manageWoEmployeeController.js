(function () {
    'use strict';
    var controllerId = 'manageWoEmployeeController';

    angular.module('MetronicApp').controller(controllerId, manageWoEmployeeController);

    function manageWoEmployeeController($scope, $http, $timeout, $rootScope, $log, Constant, Restangular, CommonService, kendoConfig, $kWindow, manageWoEmployeeService, RestEndpoint, gettextCatalog) {
        var vm = this;
        var modalComplete, modalReject, modalDetail;
        vm.listWorkAssignDetailExportTemp = [];
        vm.modalBody = ".k-widget.k-window";
        vm.documentBody = $(".tab-content");
        vm.listFileAttach = [];
        vm.listFileGv = [];
        vm.indexFileAttach = 0;
        vm.indexItem = 0;
        vm.unitDatasource = [];
        initFormData();

        //chặn submit form khi ấn enter
        $(document).keypress(
            function (event) {
                if (event.which == '13') {
                    event.preventDefault();
                }
            });

        //
        function initFormData() {
            vm.String = CommonService.translate("Kiểm toán nội bộ") + " > " + CommonService.translate("Quản lý công việc của nhân viên");
            vm.searchForm = {};
            if (manageWoEmployeeService.data !== undefined) {
                vm.searchForm.keySearch = manageWoEmployeeService.data;
            }
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

            vm.typeWoArray = [
                {id: 1, name: CommonService.translate("Giao việc ngành dọc PC&KTNB")},
                {id: 2, name: CommonService.translate("Thực hiện kết luận sau thanh kiểm tra")},
                {id: 3, name: CommonService.translate("Cơ quan/ Đơn vị TCT giám sát ngành dọc")},
                {id: 4, name: CommonService.translate("Thông tin công tác kiểm tra các đơn vị")}
            ];

            vm.typeLevelOneProblem = [
                {id: 1, name: CommonService.translate("Không có vấn đề")},
                {id: 2, name: CommonService.translate("Quy trình")},
                {id: 3, name: CommonService.translate("Quản trị")},
                {id: 4, name: CommonService.translate("Con người")},
                {id: 5, name: CommonService.translate("Công cụ")}
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

            vm.statusCompleteArray = [
                {id: 0, name: "Chưa thực hiện"},
                {id: 1, name: "Đang thực hiện"},
                {id: 2, name: "Hoàn Thành"}
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
            vm.dataList = [];

            getUnitDatasource();
        }

        // ----- Main Grid start
        vm.showHideColumnDetail = function (column) {
            var grid = vm.manageWoEmployeeGrid;
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

            manageWoEmployeeService.doSearch(obj).then(function (d) {
                kendo.ui.progress(vm.documentBody, false);
                var data = d.data;
                CommonService.exportFile(vm.manageWoEmployeeGrid, data, vm.listRemove, vm.listConvert,
                    "Danh sách chỉ tiêu");
            });
        };
        vm.listRemove = [{
            title: "Thao tác",
        }];
        vm.listConvert = [];
        //
        var record = 0;
        // Grid colunm config
        vm.manageWoEmployeeGridOptions = kendoConfig.getGridOptions({
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
                        vm.count = response.total;
                        return response.total;
                    },
                    data: function (response) {
                        return response.data;
                    }
                },
                transport: {
                    read: {
                        url: Constant.BASE_SERVICE_URL + "workAssignDetailRsService/doSearchManageWoEmployee",
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
            columns: getColumn(),
        });

        function getColumn() {
            if (vm.searchForm.typeWo == 4) {
                return [
                    {
                        title: CommonService.translate("TT"),
                        field: "stt",
                        template: function () {
                            return ++record;
                        },
                        width: "50px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                        hidden: false,
                    },
                    {
                        title: CommonService.translate("Tên công việc"),
                        field: 'workName',
                        width: "140px",
                        template: '<a href="javascript:void(0);" title="#=workName#" ng-click=vm.showDetail(dataItem)>#=workName#</a>',
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Mã WO"),
                        field: 'code',
                        width: "140px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        field: "typeWo",
                        title: CommonService.translate("Loại WO"),
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                        template: function (dataItem) {
                            vm.typeWoArray.forEach(function (data) {
                                if (data.id == dataItem.typeWo) {
                                    dataItem.typeWoName = data.name;
                                }
                            });
                            return dataItem.typeWoName ? dataItem.typeWoName : '';
                        },
                        hidden: false,
                        width: "140px"

                    },
                    {
                        title: CommonService.translate("Đơn vị nhận việc"),
                        field: 'sysGroupLv2Name',
                        width: "120px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        field: "statusNvApprove",
                        title: CommonService.translate("Trạng thái NV nhận việc"),
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                        template: function (dataItem) {
                            vm.statusNvApproveArray.forEach(function (data) {
                                if (data.id == dataItem.statusNvApprove) {
                                    dataItem.statusNvApproveName = data.name;
                                }
                            });
                            return dataItem.statusNvApproveName ? dataItem.statusNvApproveName : '';
                        },
                        hidden: false,
                        width: "120px"

                    },
                    {
                        title: CommonService.translate("Đơn vị kiểm tra"),
                        field: 'unitTestName',
                        width: "120px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Kế hoạch kiểm tra"),
                        field: 'testPlanNumber',
                        width: "120px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Đơn vị được kiểm tra"),
                        field: 'groupNames',
                        width: "120px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Văn bản được kiểm tra"),
                        field: 'inspectionDocument',
                        width: "120px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Nội dung kiểm tra"),
                        field: 'inspectionContent',
                        width: "120px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Thời gian bắt đầu kiểm tra"),
                        field: 'startInspectionDate',
                        width: "120px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Thời gian kết thúc kiểm tra"),
                        field: 'endInspectionDate',
                        width: "120px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Giai đoạn bắt đầu kiểm tra"),
                        field: 'startInspectionPhase',
                        width: "120px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Giai đoạn kết thúc kiểm tra"),
                        field: 'endInspectionPhase',
                        width: "120px",
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
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Người giao việc"),
                        field: 'assignDvByName',
                        width: "120px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Trạng thái phê duyệt của P.PC&KSNB"),
                        field: 'statusKtnbVerify',
                        width: "100px",
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
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Ngày duyệt đóng WO"),
                        field: 'verifyKtnbDate',
                        width: "120px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        title: CommonService.translate("Thao tác"),
                        headerAttributes: {
                            style: "text-align:center;",
                            translate: ""
                        },
                        hidden: false,
                        template: function (dataItem) {
                            return (
                                '<div class="text-center #=manageWoEmployeeId#"">' +

                                '<button ng-if="dataItem.statusNvApprove == 0" style=" border: none; background-color: white;" class="#=manageWoEmployeeId# icon_table ng-scope" uib-tooltip="Nhận việc" translate="" ' +
                                'ng-click="vm.acceptWork(dataItem)" > <i style="color:green;" class="fa fa-check ng-scope" aria-hidden="true"></i>' +
                                '</button>' +
                                '<button ng-if="dataItem.statusDvVerify!=1&&dataItem.statusNvApprove == 1 && (dataItem.statusKtnbVerify == null || dataItem.statusKtnbVerify == 0 || dataItem.statusKtnbVerify == 2)" style=" border: none; background-color: white;" class="#=manageWoEmployeeId# icon_table ng-scope" uib-tooltip="Hoàn thành việc" translate="" ' +
                                'ng-click="vm.openDoWork(dataItem)" > <i style="color:#0b94ea;" class="fa fa-plus ng-scope" aria-hidden="true"></i>' +
                                '</button>' +

                                '<button ng-if="dataItem.statusNvApprove == 0" style=" border: none; background-color: white;" class="#=manageWoEmployeeId# icon_table ng-scope" uib-tooltip="Từ chối" translate="" ' +
                                'ng-click="vm.openRejectView(dataItem)" > <i style="color:red;" class="fa fa-times ng-scope" aria-hidden="true"></i>' +
                                '</button>' +

                                '</div>'
                            )
                        },
                        width: "120px"
                    }
                ]
            } else {
                return [
                    {
                        title: CommonService.translate("TT"),
                        field: "stt",
                        template: function () {
                            return ++record;
                        },
                        width: "50px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                        hidden: false,
                    },
                    {
                        title: CommonService.translate("Mã WO"),
                        field: 'code',
                        width: "140px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Tên công việc"),
                        field: 'workName',
                        width: "140px",
                        template: '<a href="javascript:void(0);" title="#=workName#" ng-click=vm.showDetail(dataItem)>#=workName#</a>',
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        field: "typeWo",
                        title: CommonService.translate("Loại WO"),
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                        template: function (dataItem) {
                            vm.typeWoArray.forEach(function (data) {
                                if (data.id == dataItem.typeWo) {
                                    dataItem.typeWoName = data.name;
                                }
                            });
                            return dataItem.typeWoName ? dataItem.typeWoName : '';
                        },
                        hidden: false,
                        width: "140px"

                    },
                    {
                        field: "nameDocument",
                        title: CommonService.translate("Số văn bản"),
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                        hidden: false,
                        width: "120px"

                    },
                    {
                        field: "deadline",
                        title: CommonService.translate("Hạn hoàn thành"),
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                        hidden: false,
                        width: "120px"

                    },
                    {
                        field: "startDate",
                        title: CommonService.translate("Thời gian bắt đầu WO"),
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                        hidden: false,
                        width: "120px"

                    },
                    {
                        field: "closeDate",
                        title: CommonService.translate("Thời gian kết thúc WO"),
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                        hidden: false,
                        width: "120px"

                    },
                    {
                        field: "coordinateNvDate",
                        title: CommonService.translate("Thời gian đơn vị giao WO"),
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                        hidden: false,
                        width: "120px"

                    },
                    {
                        field: "statusNvApprove",
                        title: CommonService.translate("Trạng thái NV nhận việc"),
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                        template: function (dataItem) {
                            vm.statusNvApproveArray.forEach(function (data) {
                                if (data.id == dataItem.statusNvApprove) {
                                    dataItem.statusNvApproveName = data.name;
                                }
                            });
                            return dataItem.statusNvApproveName ? dataItem.statusNvApproveName : '';
                        },
                        hidden: false,
                        width: "120px"

                    },
                    {
                        field: "statusComplete",
                        title: CommonService.translate("Trạng thái CV"),
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                        template: function (dataItem) {
                            vm.statusCompleteArray.forEach(function (data) {
                                if (data.id == dataItem.statusComplete) {
                                    dataItem.statusCompleteName = data.name;
                                }
                            });
                            return dataItem.statusCompleteName ? dataItem.statusCompleteName : '';
                        },
                        hidden: false,
                        width: "120px"

                    },
                    {
                        field: "assignDvByName",
                        title: CommonService.translate("Người giao việc"),
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                        hidden: false,
                        width: "120px"

                    },
                    {
                        field: "statusDvVerify",
                        title: CommonService.translate("Trạng thái DV xác nhận"),
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                        template: function (dataItem) {
                            vm.statusDvVerifyArray.forEach(function (data) {
                                if (data.id == dataItem.statusDvVerify) {
                                    dataItem.statusDvVerifyName = data.name;
                                }
                            });
                            return dataItem.statusDvVerifyName ? dataItem.statusDvVerifyName : '';
                        },
                        hidden: false,
                        width: "120px"

                    },
                    {
                        title: CommonService.translate("Trạng thái KTNB xác nhận"),
                        field: 'statusKtnbVerify',
                        width: "100px",
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
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Thao tác"),
                        headerAttributes: {
                            style: "text-align:center;",
                            translate: ""
                        },
                        hidden: false,
                        template: function (dataItem) {
                            return (
                                '<div class="text-center #=manageWoEmployeeId#"">' +

                                '<button ng-if="dataItem.statusNvApprove == 0" style=" border: none; background-color: white;" class="#=manageWoEmployeeId# icon_table ng-scope" uib-tooltip="Nhận việc" translate="" ' +
                                'ng-click="vm.acceptWork(dataItem)" > <i style="color:green;" class="fa fa-check ng-scope" aria-hidden="true"></i>' +
                                '</button>' +
                                '<button ng-if="dataItem.statusDvVerify!=1&&dataItem.statusNvApprove == 1 && (dataItem.statusKtnbVerify == null || dataItem.statusKtnbVerify == 0 || dataItem.statusKtnbVerify == 2)" style=" border: none; background-color: white;" class="#=manageWoEmployeeId# icon_table ng-scope" uib-tooltip="Hoàn thành việc" translate="" ' +
                                'ng-click="vm.openDoWork(dataItem)" > <i style="color:#0b94ea;" class="fa fa-plus ng-scope" aria-hidden="true"></i>' +
                                '</button>' +

                                '<button ng-if="dataItem.statusNvApprove == 0" style=" border: none; background-color: white;" class="#=manageWoEmployeeId# icon_table ng-scope" uib-tooltip="Từ chối" translate="" ' +
                                'ng-click="vm.openRejectView(dataItem)" > <i style="color:red;" class="fa fa-times ng-scope" aria-hidden="true"></i>' +
                                '</button>' +

                                '</div>'
                            )
                        },
                        width: "120px"
                    }
                ]
            }
        }

        vm.doSearch = doSearch;

        function doSearch() {
            if (vm.searchForm.startDate) {
                var d1 = kendo.parseDate(vm.searchForm.startDate, "dd/MM/yyyy");
                if (d1 == null) {
                    toastr.error("Bạn vui lòng nhập đúng định dạng ngày dd/mm/yyyy");
                    $("#startDate").focus();
                    return;
                }
            }
            if (vm.searchForm.closeDate) {
                var d1 = kendo.parseDate(vm.searchForm.closeDate, "dd/MM/yyyy");
                if (d1 == null) {
                    toastr.error("Bạn vui lòng nhập đúng định dạng ngày dd/mm/yyyy");
                    $("#closeDate").focus();
                    return;
                }
            }
            if (vm.searchForm.startDate && vm.searchForm.closeDate) {
                var d1 = kendo.parseDate(vm.searchForm.startDate, "dd/MM/yyyy");
                var d2 = kendo.parseDate(vm.searchForm.closeDate, "dd/MM/yyyy");
                if (d1 > d2) {
                    toastr.error("Ngày bắt đầu tìm kiếm phải nhỏ hơn ngày kết thúc tìm kiếm");
                    $("#closeDate").focus();
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
            if ($('.k-invalid-msg').is(':visible')) {
                return;
            }
            var grid = vm.manageWoEmployeeGrid;
            grid.setOptions({columns: getColumn()})
            CommonService.doSearchGrid(grid, {pageSize: grid.dataSource.pageSize()});
        };

        vm.openRejectView = function (dataItem) {
            vm.rejectForm = {};
            vm.rejectForm = angular.copy(dataItem);
            vm.typeCreate = 'rejectWork';
            var templateUrl = 'ktnb/manageWoEmployee/rejectPopup.html';
            var title = "Từ chối nhận việc";
            modalReject = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "30%", null, null);
        };

        vm.openDoWork = function (dataItem) {
            vm.completeForm = {};
            vm.typeCreate = 'completeWork';

            vm.completeForm.workAssignDetailId = dataItem.workAssignDetailId;
            vm.completeForm.workAssignId = dataItem.workAssignId;
            vm.completeForm.code = dataItem.code;
            vm.completeForm.workName = dataItem.workName;
            vm.completeForm.typeWo = dataItem.typeWo;
            vm.completeForm.nameDocument = dataItem.nameDocument;
            vm.completeForm.startDate = dataItem.startDate;
            vm.completeForm.closeDate = dataItem.closeDate;
            vm.completeForm.assignDvBy = dataItem.assignDvBy;
            vm.completeForm.assignDvByName = dataItem.assignDvByName;
            vm.completeForm.signedByName = dataItem.signedByName;
            vm.completeForm.positionName = dataItem.positionName;
            vm.completeForm.progressWork = dataItem.progressWork;
            vm.completeForm.sysGroupLv2Id = dataItem.sysGroupLv2Id;

            vm.completeForm.dateIssued = dataItem.dateIssued;
            vm.completeForm.textContent = dataItem.textContent;
            vm.completeForm.signedBy = dataItem.signedBy;
            vm.completeForm.position = dataItem.position;
            vm.completeForm.errorGroup = dataItem.errorGroup;
            vm.completeForm.performerId = dataItem.performerId;
            vm.completeForm.performerName = dataItem.performerName;
            vm.completeForm.description = dataItem.description;
            vm.completeForm.rejectDvDescription = dataItem.rejectDvDescription;
            vm.completeForm.rejectKtnbDescription = dataItem.rejectKtnbDescription;

            vm.completeForm.sysGroupLv2Name = dataItem.sysGroupLv2Name;
            vm.completeForm.workAssignDetailId = dataItem.workAssignDetailId;
            vm.completeForm.needOvercome = dataItem.needOvercome;
            vm.completeForm.statusOvercome = dataItem.statusOvercome;
            vm.completeForm.statusKtnbVerify = dataItem.statusKtnbVerify;

            vm.completeForm.commentDv = dataItem.commentDv;
            vm.completeForm.commentKtnb = dataItem.commentKtnb

            if (dataItem.typeWo == 4) {
                let param = {
                    workAssignId: vm.completeForm.workAssignId,
                    workAssignDetailId: vm.completeForm.workAssignDetailId
                }
                manageWoEmployeeService.getDetail(param).then(function (data) {
                    let result = angular.copy(data);
                    vm.completeForm.typeInspectionInformation = result.typeInspectionInformation;
                    vm.completeForm.inspectionInformationDTOs = result.inspectionInformationDTOs;

                    if (vm.completeForm.inspectionInformationDTOs) {
                        vm.completeForm.inspectionInformationDTOs.map(x => {
                            x.index = vm.completeForm.inspectionInformationDTOs.indexOf(x);
                            x.inspectionUnits = x.problemDiscoveredDTOList.map(y => y.groupId);
                            return x;
                        })
                        vm.indexItem = vm.completeForm.inspectionInformationDTOs.length;
                    }

                    var templateUrl = 'ktnb/manageWoEmployee/completeWorkPopup.html';
                    var title = "Thực hiện công việc";
                    modalComplete = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "70%", null, null);

                    vm.listRemoveFile = [];
                    manageWoEmployeeService.getListAttachedFile({
                        objectId: vm.completeForm.workAssignId,
                        type: "WOKTNB",
                    }).then(
                        function (res) {
                            if (res && res.data) {
                                vm.listFileGv = res.data;
                                $timeout(function () {
                                    $("#listFileGvGrid").data("kendoGrid").dataSource.data(vm.listFileGv);
                                }, 100);
                            }
                        }
                    );

                    manageWoEmployeeService.getListAttachedFile({
                        objectId: vm.completeForm.workAssignDetailId,
                        type: "WONV",
                    }).then(
                        function (res) {
                            if (res && res.data) {
                                vm.listFileAttach = res.data;
                                $timeout(function () {
                                    let gridFile = $("#listAttachDocumentGrid").data("kendoGrid");
                                    gridFile.setOptions({columns: getGridFileColumn()})
                                    gridFile.dataSource.data(vm.listFileAttach);
                                }, 100);
                            }
                        }
                    );
                }, function () {
                    toastr.error(CommonService.translate("Có lỗi xảy ra"));
                })
            } else {
                var templateUrl = 'ktnb/manageWoEmployee/completeWorkPopup.html';
                var title = "Thực hiện công việc";
                modalComplete = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "70%", null, null);

                vm.listRemoveFile = [];
                manageWoEmployeeService.getListAttachedFile({
                    objectId: vm.completeForm.workAssignId,
                    type: "WOKTNB",
                })
                    .then(function (res) {
                        if (res && res.data) {
                            vm.listFileGv = res.data;
                            $timeout(function () {
                                $("#listFileGvGrid").data("kendoGrid").dataSource.data(vm.listFileGv);
                            }, 100);
                        }
                    });

                manageWoEmployeeService.getListAttachedFile({
                    objectId: vm.completeForm.workAssignDetailId,
                    type: "WONV",
                })
                    .then(function (res) {
                        if (res && res.data) {
                            vm.listFileAttach = res.data;
                            $timeout(function () {
                                let gridFile = $("#listAttachDocumentGrid").data("kendoGrid");
                                gridFile.setOptions({columns: getGridFileColumn()})
                                gridFile.dataSource.data(vm.listFileAttach);
                            }, 100);
                        }
                    })
            }
        }

        vm.showDetail = function (dataItem) {
            vm.typeCreate = 'detail';
            vm.completeForm = {};

            vm.completeForm.workAssignDetailId = dataItem.workAssignDetailId;
            vm.completeForm.workAssignId = dataItem.workAssignId;
            vm.completeForm.code = dataItem.code;
            vm.completeForm.workName = dataItem.workName;
            vm.completeForm.typeWo = dataItem.typeWo;
            vm.completeForm.nameDocument = dataItem.nameDocument;
            vm.completeForm.startDate = dataItem.startDate;
            vm.completeForm.closeDate = dataItem.closeDate;
            vm.completeForm.assignDvBy = dataItem.assignDvBy;
            vm.completeForm.assignDvByName = dataItem.assignDvByName;
            vm.completeForm.signedByName = dataItem.signedByName;
            vm.completeForm.positionName = dataItem.positionName;
            vm.completeForm.progressWork = dataItem.progressWork;
            vm.completeForm.sysGroupLv2Id = dataItem.sysGroupLv2Id;

            vm.completeForm.dateIssued = dataItem.dateIssued;
            vm.completeForm.textContent = dataItem.textContent;
            vm.completeForm.signedBy = dataItem.signedBy;
            vm.completeForm.position = dataItem.position;
            vm.completeForm.errorGroup = dataItem.errorGroup;
            vm.completeForm.performerId = dataItem.performerId;
            vm.completeForm.performerName = dataItem.performerName;
            vm.completeForm.description = dataItem.description;
            vm.completeForm.rejectDvDescription = dataItem.rejectDvDescription;
            vm.completeForm.rejectKtnbDescription = dataItem.rejectKtnbDescription;

            vm.completeForm.sysGroupLv2Name = dataItem.sysGroupLv2Name;
            vm.completeForm.workAssignDetailId = dataItem.workAssignDetailId;
            vm.completeForm.needOvercome = dataItem.needOvercome
            vm.completeForm.statusOvercome = dataItem.statusOvercome
            vm.completeForm.statusKtnbVerify = dataItem.statusKtnbVerify

            vm.completeForm.commentDv = dataItem.commentDv;
            vm.completeForm.commentKtnb = dataItem.commentKtnb

            if (dataItem.typeWo == 4) {
                let param = {
                    workAssignId: vm.completeForm.workAssignId,
                    workAssignDetailId: vm.completeForm.workAssignDetailId
                }

                manageWoEmployeeService.getDetail(param).then(function (data) {
                    let result = angular.copy(data);
                    vm.completeForm.approveKtnbDate = result.approveKtnbDate
                    vm.completeForm.approveKtnbByName = result.approveKtnbByName
                    vm.completeForm.listWorkAssignDetail = result.listWorkAssignDetail

                    vm.completeForm.rejectKtnbByName = result.rejectKtnbByName
                    vm.completeForm.rejectKtnbDate = result.rejectKtnbDate
                    vm.completeForm.verifyKtnbByName = result.verifyKtnbByName
                    vm.completeForm.verifyKtnbDate = result.verifyKtnbDate
                    vm.completeForm.rejectKtnbDescription = result.rejectKtnbDescription

                    vm.completeForm.typeInspectionInformation = result.typeInspectionInformation;
                    vm.completeForm.inspectionInformationDTOs = result.inspectionInformationDTOs;
                    if (vm.completeForm.inspectionInformationDTOs) {
                        vm.completeForm.inspectionInformationDTOs.map(x => {
                            x.index = vm.completeForm.inspectionInformationDTOs.indexOf(x);
                            x.inspectionUnits = x.problemDiscoveredDTOList.map(y => y.groupName).toString().replace(",", ';,');
                            return x;
                        })
                        vm.indexItem = vm.completeForm.inspectionInformationDTOs.length;
                    }
                    var templateUrl = 'ktnb/manageWoEmployee/completeWorkPopup.html';
                    var title = CommonService.translate("Màn hình thông tin chi tiết");
                    modalDetail = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "70%", null, null);

                    manageWoEmployeeService.getListAttachedFile({
                        objectId: vm.completeForm.workAssignId,
                        type: "WOKTNB",
                    }).then(
                        function (res) {
                            if (res && res.data) {
                                vm.listFileGv = res.data;
                                $timeout(function () {
                                    $("#listFileGvGrid").data("kendoGrid").dataSource.data(vm.listFileGv);
                                }, 100);
                            }
                        }
                    );

                    manageWoEmployeeService.getListAttachedFile({
                        objectId: vm.completeForm.workAssignDetailId,
                        type: "WONV",
                    }).then(
                        function (res) {
                            if (res && res.data) {
                                vm.listFileAttach = res.data;
                                $timeout(function () {
                                    let gridFile = $("#listAttachDocumentGrid").data("kendoGrid");
                                    gridFile.setOptions({columns: getGridFileColumn()})
                                    gridFile.dataSource.data(vm.listFileAttach);
                                }, 100);
                            }
                        }
                    );
                }, function () {
                    toastr.error(CommonService.translate("Có lỗi xảy ra"));
                });
            } else {
                var templateUrl = 'ktnb/manageWoEmployee/completeWorkPopup.html';
                var title = CommonService.translate("Màn hình thông tin chi tiết");
                modalDetail = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "70%", null, null);

                manageWoEmployeeService.getListAttachedFile({
                    objectId: vm.completeForm.workAssignId,
                    type: "WOKTNB",
                })
                    .then(function (res) {
                        if (res && res.data) {
                            vm.listFileGv = res.data;
                            $timeout(function () {
                                $("#listFileGvGrid").data("kendoGrid").dataSource.data(vm.listFileGv);
                            }, 100);
                        }
                    });

                manageWoEmployeeService.getListAttachedFile({
                    objectId: vm.completeForm.workAssignDetailId,
                    type: "WONV",
                })
                    .then(function (res) {
                        if (res && res.data) {
                            vm.listFileAttach = res.data;
                            $timeout(function () {
                                let gridFile = $("#listAttachDocumentGrid").data("kendoGrid");
                                gridFile.setOptions({columns: getGridFileColumn()})
                                gridFile.dataSource.data(vm.listFileAttach);
                            }, 100);
                        }
                    });
            }
        }

        vm.saveItem = function () {
            if (vm.typeCreate === 'completeWork') {
                if (!ValidateForm()) return;
                let obj = vm.completeForm;
                obj.listFileAttach = vm.listFileAttach;
                obj.listRemoveFile = vm.listRemoveFile;
                Restangular.all("workAssignDetailRsService/saveNvCompleteWork").post(obj).then(function (response) {
                    if (response && response.error) {
                        toastr.error(response.error);
                    } else {
                        toastr.success("Ghi lại thành công");
                        vm.doSearch();
                        modalComplete.close();
                    }
                }).catch(function (err) {
                    console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
                });
            } else if (vm.typeCreate === 'rejectWork') {
                var obj = vm.rejectForm;
                Restangular.all("workAssignDetailRsService/saveNvRejectWork").post(obj).then(function (response) {
                    if (response && response.error) {
                        toastr.error(response.error);
                    } else {
                        toastr.success("Từ chối thành công");
                        vm.doSearch();
                        modalReject.close();
                    }
                }).catch(function (err) {
                    console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
                });
            }
        };

        vm.saveDraftItem = function () {
            if (vm.typeCreate === 'completeWork') {
                let obj = vm.completeForm;
                obj.listFileAttach = vm.listFileAttach;
                obj.listRemoveFile = vm.listRemoveFile;
                Restangular.all("workAssignDetailRsService/recordNvCompleteWork").post(obj).then(function (response) {
                    if (response && response.error) {
                        toastr.error(response.error);
                    } else {
                        toastr.success("Ghi lại thành công");
                        vm.doSearch();
                        modalComplete.close();
                    }
                }).catch(function (err) {
                    console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
                });
            }
        }

        /*
		 * đóng Popup
		 */
        vm.cancel = function () {
            $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
        }
        vm.acceptWork = function (dataItem) {
            kendo.ui.progress($(vm.modalBody), true);
            var obj = {};
            obj.workAssignDetailId = dataItem.workAssignDetailId;
            confirm(CommonService.translate('Bạn đã sẵn sàng nhận WO này?'), function () {
                Restangular.all("workAssignDetailRsService/acceptWork").post(obj).then(function (response) {
                    kendo.ui.progress($(vm.modalBody), false);
                    toastr.success(CommonService.translate("Nhận thành công!!"));
                    vm.doSearch();
                }).catch(function (err) {
                    kendo.ui.progress($(vm.modalBody), false);
                    console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
                });
            })
        };

        //------------------------ start don vi
        vm.selectedSysGroup = false;
        vm.sysGroupOptions = {
            clearButton: false,
            dataTextField: "name",
            select: function (e) {
                vm.selectedSysGroup = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchForm.sysGroupName = dataItem.name;
                vm.searchForm.sysGroupId = dataItem.sysGroupId;
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
                            keySearch: $("#sysGroupId").val().trim(),
                            groupLevelLst: [2, 3]
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
                    vm.searchForm.sysGroupId = null;
                    vm.searchForm.sysGroupName = null;
                }
            },
            ignoreCase: false
        }
        vm.selectSysGroup = function () {
            var teamplateUrl = "ktnb/dataDamage/sysGroupPopupSearch.html";
            var title = CommonService.translate("Lựa chọn đơn vị");
            var windowId = "SELECT_SYS_GROUP";
            vm.objSearchGSearch = {};
            vm.objSearchGSearch.groupLevelLst = [3];
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
            vm.searchForm.sysGroupName = dataItem.name;
            vm.searchForm.sysGroupId = dataItem.sysGroupId;
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
        //------------------------ end don vi

        vm.gridFileGvOptions = kendoConfig.getGridOptions({
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
                        return vm.listFileGv;
                    }
                },
                pageSize: 10,
            },
            save: function () {
                vm.listFileGvGrid.refresh();
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
                    template: dataItem => $("#listFileGvGrid").data("kendoGrid").dataSource.indexOf(dataItem) + 1,
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
            ]
        });
        // đính kèm file
        vm.gridFileOptions = kendoConfig.getGridOptions({
            autoBind: true,
            scrollable: false,
            resizable: true,
            editable: false,
            dataSource: {
                serverPaging: false,
                schema: {
                    total: function () {
                        return 0;
                    },
                    data: function () {
                        return vm.listFileAttach;
                    }
                },
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
            columns: getGridFileColumn()
        });

        function getGridFileColumn() {
            if (vm.typeCreate == 'completeWork') {
                return [
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
                        field: "name",
                        width: '30%',
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
                        field: "actions",
                        width: '10%',
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold",
                            translate: ""
                        },
                        template: dataItem =>
                            '<div class="text-center #=utilAttachDocumentId#" ' +
                            '<button style=" border: none; "  class="#=utilAttachDocumentId# icon_table" uib-tooltip="Xóa" ng-click="caller.removeRowFile(dataItem)"  translate>  ' +
                            '<i style="color: steelblue;" class="fa fa-trash" aria-hidden="true"></i>' +
                            '</button>' +
                            '</div>',
                    }
                ]
            } else if (vm.typeCreate == 'detail') {
                return [
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
                        field: "name",
                        width: '30%',
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
                ]
            }
        }

        // Xóa file đính kèm
        vm.removeRowFile = removeRowFile;

        function removeRowFile(dataItem) {
            confirm(CommonService.translate("Xác nhận xóa"), function () {
                $('#listAttachDocumentGrid').data('kendoGrid').dataSource.remove(dataItem);
                vm.listFileAttach = $('#listAttachDocumentGrid').data('kendoGrid').dataSource.data();
                if (dataItem.utilAttachDocumentId != null) {
                    vm.listRemoveFile.push(dataItem);
                }
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

            if ($("#files")[0].files[0].name.split('.').pop() != 'pdf'
                && $("#files")[0].files[0].name.split('.').pop() != 'doc'
                && $("#files")[0].files[0].name.split('.').pop() != 'docx'
                && $("#files")[0].files[0].name.split('.').pop() != 'jpg'
                && $("#files")[0].files[0].name.split('.').pop() != 'jpeg'
                && $("#files")[0].files[0].name.split('.').pop() != 'png'
                && $("#files")[0].files[0].name.split('.').pop() != 'xlsx'
                && $("#files")[0].files[0].name.split('.').pop() != 'xls'
            ) {
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
                        obj.objectId = vm.completeForm.workAssignDetailId;
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

        // end file
        vm.checkErr = function () {
            if (vm.searchForm.startDate == null) {
                vm.errMessage = CommonService.translate("Ngày đến không được để trống");
                $("#manageWoEmployee_startDate").focus();
                return vm.errMessage;
            }
            let startDate = kendo.parseDate(vm.searchForm.startDate, "dd/MM/yyyy");
            let closeDate = kendo.parseDate(vm.searchForm.closeDate, "dd/MM/yyyy");
            let curDate = new Date();
            if (startDate > curDate) {
                vm.errMessage = CommonService.translate("Ngày bắt đầu không được lớn hơn ngày hiện tại");
                $("#manageWoEmployee_startDate").focus();
                return vm.errMessage;
            } else if (closeDate != null && startDate > closeDate) {
                vm.errMessage = CommonService.translate("Ngày bắt đầu không được lớn hơn ngày đến");
                $("#manageWoEmployee_startDate").focus();
                return vm.errMessage;
            } else {
                vm.errMessage = '';
                vm.errMessage1 = '';
                return vm.errMessage;
            }
        };

        vm.checkErr1 = function () {
            if (vm.searchForm.closeDate == null) {
                vm.errMessage1 = CommonService.translate("Ngày đến không được để trống");
                $("#manageWoEmployee_closeDate").focus();
                return vm.errMessage1;
            }
            let startDate = kendo.parseDate(vm.searchForm.startDate, "dd/MM/yyyy");
            let closeDate = kendo.parseDate(vm.searchForm.closeDate, "dd/MM/yyyy");
            let curDate = new Date();
            if (closeDate > curDate) {
                vm.errMessage1 = CommonService.translate("Ngày bắt đầu không được lớn hơn ngày hiện tại");
                $("#manageWoEmployee_closeDate").focus();
                return vm.errMessage1;
            } else if (startDate > closeDate) {
                vm.errMessage1 = CommonService.translate("Ngày đến không được nhỏ hơn ngày bắt đầu");
                $("#manageWoEmployee_closeDate").focus();
                return vm.errMessage1;
            } else if (startDate <= closeDate) {
                vm.errMessage = '';
                vm.errMessage1 = '';
                return vm.errMessage1;
            }
        };
        //------------------------ clear input
        vm.clear = function (fieldName) {
            switch (fieldName) {
                case 'keySearch':
                    vm.searchForm.keySearch = null;
                    break;
                case 'statusNvApprove':
                    vm.searchForm.statusNvApprove = null;
                    break;
                case 'date':
                    vm.errMessage = '';
                    vm.errMessage1 = '';
                    vm.searchForm.startDate = null;
                    vm.searchForm.closeDate = null;
                    break;
                case 'statusComplete':
                    vm.searchForm.statusComplete = null;
                    break;
                case 'statusDvVerify':
                    vm.searchForm.statusDvVerify = null;
                    break;
                case 'typeWo':
                    vm.searchForm.typeWo = null;
                    break;
                case 'sysGroupId':
                    vm.searchForm.sysGroupId = null;
                    vm.searchForm.sysGroupName = null;
                    vm.searchForm.sysGroupCode = null;
                    break;
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
                    vm.searchForm.groupId = null;
                    vm.searchForm.groupName = null;
                    break;
                }
            }
        }


        //WO: Thông tin công tác kiểm tra các đơn vị
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

        vm.onChangType = function () {
            if (vm.completeForm.typeInspectionInformation == 1) {
                vm.completeForm.inspectionInformationDTOs = [];
                vm.completeForm.inspectionInformationDTOs.push({index: vm.indexItem, problemDiscoveredDTOList: []})
                vm.indexItem++;
            } else if (vm.completeForm.typeInspectionInformation == 2) {
                vm.completeForm.inspectionInformationDTOs = [];
                vm.indexItem = 0;
                vm.completeForm.inspectionInformationDTOs.push({
                    index: vm.indexItem,
                    content: '',
                })
            }
        }

        vm.onAdd = function () {
            vm.completeForm.inspectionInformationDTOs.push({
                index: vm.indexItem,
                problemDiscoveredDTOList: []
            })
            vm.indexItem++;
        }

        vm.onDelete = function (e) {
            confirm(CommonService.translate("Bạn có chắc chắn muốn xoá thông tin kiểm tra này?"), function () {
                if (vm.completeForm.inspectionInformationDTOs.length == 1) {
                    vm.indexItem = 0;
                    vm.completeForm.inspectionInformationDTOs = [];
                    vm.completeForm.inspectionInformationDTOs.push({
                        index: vm.indexItem,
                        problemDiscoveredDTOList: []
                    })
                } else {
                    vm.completeForm.inspectionInformationDTOs = vm.completeForm.inspectionInformationDTOs.filter(x => x.index !== e.index);
                }
                $scope.$apply();
            })
        }

        vm.onSelectPlanFile = function () {
            let uploadFile = $(this)[0].element[0].files[0];
            let index = $(this)[0].element[0].id.split('_')[1];
            if (uploadFile.size > 52428800) {
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

            if (uploadFile.name.split('.').pop() != 'pdf') {
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

            let fileForm = new FormData();
            fileForm.append('file', uploadFile)
            fileForm.append('file_id', 2)
            let formData = new FormData();
            formData.append('multipartFile' + 0, uploadFile);
            return $.ajax({
                url: Constant.BASE_SERVICE_URL + "fileservice/uploadATTT?folder=" + Constant.UPLOAD_FOLDER_TYPE_INPUT,
                type: "POST",
                data: formData,
                enctype: 'multipart/form-data',
                processData: false,
                contentType: false,
                cache: false,
                success: function (data) {
                    $("#TextPlanFile_" + index).val(uploadFile.name)
                    let fileUpload = {
                        name: uploadFile.name,
                        filePath: data[0]
                    }
                    vm.completeForm.inspectionInformationDTOs[index].attachFileInspectionPlan = fileUpload;
                    setTimeout(function () {
                        $(".k-upload-files.k-reset").find("li").remove();
                        $(".k-upload-files").remove();
                        $(".k-upload-status").remove();
                        $(".k-upload.k-header").addClass("k-upload-empty");
                        $(".k-upload-button").removeClass("k-state-focused");
                    }, 10);

                    // Đọc file lấy thông tin
                    $.ajax({
                        url: "http://10.207.112.55:2000/ksnb_chan_ky",
                        type: "POST",
                        data: fileForm,
                        processData: false,
                        contentType: false,
                        cache: false,
                        success: function (res) {
                            if (res.code == 200) {
                                $("#testPlanNumber_" + index).val(res.data['So va ky hieu'])
                                $("#dateIssued_" + index).val(res.data['Ngay ban hanh'])
                                $("#planSignerId_" + index).val(res.data['Nguoi ky'][0])
                                $("#positionName_" + index).val(res.data['Don vi'][0].split('-')[0])
                            }
                        }
                    })
                }
            });
        }

        vm.onSelectReportFile = function () {
            let uploadFile = $(this)[0].element[0].files[0];
            let index = $(this)[0].element[0].id.split('_')[1];

            if (uploadFile.size > 52428800) {
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

            if (uploadFile.name.split('.').pop() != 'pdf') {
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

            let fileForm = new FormData();
            fileForm.append('file', uploadFile)
            fileForm.append('file_id', 2)
            var formData = new FormData();
            formData.append('multipartFile' + 0, uploadFile);

            return $.ajax({
                url: Constant.BASE_SERVICE_URL + "fileservice/uploadATTT?folder=" + Constant.UPLOAD_FOLDER_TYPE_INPUT,
                type: "POST",
                data: formData,
                enctype: 'multipart/form-data',
                processData: false,
                contentType: false,
                cache: false,
                success: function (data) {
                    $("#TextReportFile_" + index).val(uploadFile.name)
                    let fileUpload = {
                        name: uploadFile.name,
                        filePath: data[0]
                    }
                    vm.completeForm.inspectionInformationDTOs[index].attachFileCompleteInspection = fileUpload;
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

        vm.onSelectInspectionUnit = function (item) {
            if (item.inspectionUnits == null || item.inspectionUnits.length < 1) {
                item.problemDiscoveredDTOList = [];
                return;
            }

            item.inspectionUnits.forEach(x => {
                let existed = item.problemDiscoveredDTOList.some(t => t['groupId'] == x)
                if (!existed) {
                    let unit = vm.unitDatasource.find(i => i.sysGroupId == x)
                    item.problemDiscoveredDTOList.push({
                        index: vm.completeForm.inspectionInformationDTOs.length,
                        groupId: x,
                        groupName: unit ? unit.name : null,
                        problemDiscoveredDetailDTOList: [{index: 0}]
                    })
                }
            });
            item.problemDiscoveredDTOList = item.problemDiscoveredDTOList.filter(x => item.inspectionUnits.includes(x.groupId))
        }

        vm.onAddGrandChild = function (child) {
            child.problemDiscoveredDetailDTOList.push({index: child.problemDiscoveredDetailDTOList.length})
        }

        vm.onDeleteGrandChild = function (grandChild, child) {
            if (child.problemDiscoveredDetailDTOList.length == 1) {
                child.problemDiscoveredDetailDTOList = [];
                child.problemDiscoveredDetailDTOList.push({index: 0})
            } else {
                child.problemDiscoveredDetailDTOList = child.problemDiscoveredDetailDTOList.filter(x => x != grandChild)
            }
        }

        vm.UserSignOptions = {
            clearButton: false,
            dataTextField: "name",
            dataValueField: "name",
            placeholder: CommonService.translate("Nhập tên/mã người ký"),
            select: function (e) {
                let element = $(this)[0].element[0];
                let nameArr = element.name.split('_');
                let idArr = element.id.split('_');
                let dataItem = this.dataItem(e.item.index());
                element.value = dataItem.fullName;
                vm.completeForm.inspectionInformationDTOs[nameArr[1]][nameArr[0]] = dataItem.fullName
                vm.completeForm.inspectionInformationDTOs[idArr[1]][idArr[0]] = dataItem.sysUserId
            },
            pageSize: 10,
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        vm.isSelectSearchCreateBy = false;
                        return Restangular.all("commonRsService/getSysUserForAutoComplete").post(
                            {
                                keySearch: options.data.filter ? options.data.filter.filters.length > 0 ? options.data.filter.filters[0].value : '' : '',
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
        }

        function ValidateForm() {
            let valid = true;
            if (vm.completeForm.typeWo == 4) {
                switch (vm.completeForm.typeInspectionInformation) {
                    case 1:
                        vm.completeForm.inspectionInformationDTOs.every((x, xindex) => {
                            if (!x.attachFileInspectionPlan || !x.attachFileInspectionPlan.name || !x.attachFileInspectionPlan.filePath) {
                                toastr.error("Tài liệu kế hoạch đính kèm không được bỏ trống");
                                valid = false;
                                return valid
                            }
                            if (!x.testPlanNumber) {
                                toastr.error("Số hiệu kế hoạch kiểm tra không được bỏ trống");
                                valid = false;
                                return valid;
                            }
                            if (!x.dateIssued) {
                                toastr.error("Ngày ban hành kế hoạch kiểm tra không được bỏ trống");
                                valid = false;
                                return valid;
                            }
                            if (!x.planSignerName || !x.planSignerId) {
                                toastr.error("Người ký kế hoạch không được bỏ trống");
                                valid = false;
                                return valid;
                            }
                            if (!x.positionName) {
                                toastr.error("Chức danh người ký kế hoạch không được bỏ trống");
                                valid = false;
                                return valid;
                            }
                            if (!x.unitTestId) {
                                toastr.error("Đơn vị kiểm tra không được bỏ trống");
                                valid = false;
                                return valid;
                            }
                            if (!x.inspectionUnits || x.inspectionUnits.length < 1) {
                                toastr.error("Đơn vị được kiểm tra không được bỏ trống");
                                valid = false;
                                return valid;
                            }
                            if (!x.inspectionDocument) {
                                toastr.error("Văn bản kiểm tra không được bỏ trống");
                                valid = false;
                                return valid;
                            }
                            if (!x.inspectionContent) {
                                toastr.error("Nội dung kiểm tra không được bỏ trống");
                                valid = false;
                                return valid;
                            }
                            if (!x.startInspectionDate || !x.endInspectionDate) {
                                toastr.error("Thời gian kiểm tra không được bỏ trống");
                                valid = false;
                                return valid;
                            }
                            if (!x.startInspectionPhase || !x.endInspectionPhase) {
                                toastr.error("Giai đoạn kiểm tra không được bỏ trống");
                                valid = false;
                                return valid;
                            }
                            if (!x.attachFileCompleteInspection || !x.attachFileCompleteInspection.name || !x.attachFileCompleteInspection.filePath) {
                                toastr.error("Tài liệu hoàn thành kiểm tra đính kèm không được bỏ trống");
                                valid = false;
                                return valid
                            }
                            if (!x.reportNumber) {
                                toastr.error("Số hiệu báo cáo không được bỏ trống");
                                valid = false;
                                return valid;
                            }
                            if (!x.completedIssuanceDate) {
                                toastr.error("Ngày ban hành báo cáo không được bỏ trống");
                                valid = false;
                                return valid;
                            }
                            if (!x.reportSignerName || !x.reportSignerId) {
                                toastr.error("Người ký báo cáo không được bỏ trống");
                                valid = false;
                                return valid;
                            }
                            if (!x.reportSignerPositionName) {
                                toastr.error("Chức danh người ký báo cáo không được bỏ trống");
                                valid = false;
                                return valid;
                            }
                            x.problemDiscoveredDTOList.every(y => {
                                y.problemDiscoveredDetailDTOList.every(z => {
                                    if (!z.levelOneProblem) {
                                        toastr.error("Vấn đề cấp 1 không được bỏ trống");
                                        valid = false;
                                        return valid;
                                    } else {
                                        if (z.levelOneProblem != 1 && !z.issueOfDetails) {
                                            toastr.error("Vấn đề chi tiết không được bỏ trống");
                                            valid = false;
                                            return valid;
                                        }
                                    }
                                })
                            })
                            return valid;
                        })
                        break
                    case 2:
                        if (vm.completeForm.inspectionInformationDTOs[0].content == undefined || vm.completeForm.inspectionInformationDTOs[0].content == '') {
                            toastr.error("Nội dung công tác không được bỏ trống");
                            valid = false
                        }
                        break
                }
            }
            return valid
        }

        vm.onChangeUnitTest = function (item) {
            let unit = vm.unitDatasource.find(x => x.sysGroupId == item.unitTestId);
            item.unitTestName = unit ? unit.name : null;
        }

        vm.checkDateIssued = function (item) {
            let date = kendo.parseDate(item.dateIssued, "dd/MM/yyyy");
            if (date == null) {
                toastr.error("Ngày ban hành kế hoạch không đúng định dạng̣");
                $("#dateIssued_" + item.index).focus();
                return;
            }
        }

        vm.checkCompletedIssuanceDate = function (item) {
            let date = kendo.parseDate(item.completedIssuanceDate, "dd/MM/yyyy");
            if (date == null) {
                toastr.error("Ngày ban hành báo cáo không đúng định dạng̣");
                $("#completedIssuanceDate_" + item.index).focus();
                return;
            }
        }

        vm.checkErrStartInspectionDate = function (item) {
            var d1 = kendo.parseDate(item.startInspectionDate, "dd/MM/yyyy");
            var d2 = kendo.parseDate(item.endInspectionDate, "dd/MM/yyyy");
            var curdate = new Date();
            curdate.setHours(0, 0, 0, 0);
            var sysDate = kendo.parseDate(curdate, "dd/MM/yyyy");
            if (d1 == null) {
                toastr.error("Thời gian bắt đầu kiểm tra không đúng định dạng̣");
                $("#startInspectionDate_" + item.index).focus();
                return;
            }
            if (d2 != null && d1 > d2) {
                toastr.error("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc");
                $("#startInspectionDate_" + item.index).focus();
                return;
            }
        }

        vm.checkErrEndInspectionDate = function (item) {
            var d1 = kendo.parseDate(item.startInspectionDate, "dd/MM/yyyy");
            var d2 = kendo.parseDate(item.endInspectionDate, "dd/MM/yyyy");
            var curdate = new Date();
            curdate.setHours(0, 0, 0, 0);
            var sysDate = kendo.parseDate(curdate, "dd/MM/yyyy");
            if (d2 == null) {
                toastr.error("Thời gian kết thúc kiểm tra không đúng định dạng");
                $("#endInspectionDate_" + item.index).focus();
                return;
            }
            if (d1 != null && d1 > d2) {
                toastr.error("Thời gian kết thúc phải lớn hơn thời gian bắt đầu");
                $("#endInspectionDate_" + item.index).focus();
                return;
            }
        }

        vm.checkErrStartInspectionPhase = function (item) {
            var d1 = kendo.parseDate(item.startInspectionPhase, "dd/MM/yyyy");
            var d2 = kendo.parseDate(item.endInspectionPhase, "dd/MM/yyyy");
            var curdate = new Date();
            curdate.setHours(0, 0, 0, 0);
            var sysDate = kendo.parseDate(curdate, "dd/MM/yyyy");
            if (d1 == null) {
                toastr.error("Giai đoạn bắt đầu kiểm tra không đúng định dạng̣");
                $("#startInspectionPhase" + item.index).focus();
                return;
            }
            if (d2 != null && d1 > d2) {
                toastr.error("Giai đoạn bắt đầu phải nhỏ hơn Giai đoạn kết thúc");
                $("#startInspectionPhase" + item.index).focus();
                return;
            }
        }

        vm.checkErrEndInspectionPhase = function (item) {
            var d1 = kendo.parseDate(item.startInspectionPhase, "dd/MM/yyyy");
            var d2 = kendo.parseDate(item.endInspectionPhase, "dd/MM/yyyy");
            var curdate = new Date();
            curdate.setHours(0, 0, 0, 0);
            var sysDate = kendo.parseDate(curdate, "dd/MM/yyyy");
            if (d2 == null) {
                toastr.error("Giai đoạn kết thúc kiểm tra không đúng định dạng");
                $("#endInspectionPhase" + item.index).focus();
                return;
            }
            if (d1 != null && d1 > d2) {
                toastr.error("Giai đoạn kết thúc phải lớn hơn Giai đoạn bắt đầu");
                $("#endInspectionPhase" + item.index).focus();
                return;
            }
        }

        vm.onPrint = function (id) {
            let ele = "detail_" + id;
            var mywindow = window.open('', 'PRINT', 'height=1080,width=1920');
            mywindow.document.write('<html><head>');
            mywindow.document.write('<link href="./assets/global/plugins/bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css" media="all" />');
            mywindow.document.write('<link href="./assets/layouts/layout/css/custom.min.css" rel="stylesheet" type="text/css" media="all" />');
            mywindow.document.write('</head><body style="padding: 20px; font-size: 12px" onload="window.print();window.close()"><div class="form-horizontal"> ');
            mywindow.document.write(document.getElementById(ele).innerHTML);
            // mywindow.document.write('<script type="text/javascript">$(window).load(function() { window.print(); window.close(); });</script>');
            mywindow.document.write('</div></body></html>');

            mywindow.document.close();
            mywindow.focus();
            // setTimeout(function(){mywindow.print();},1000);
            // mywindow.close();
        }
    }
})();
