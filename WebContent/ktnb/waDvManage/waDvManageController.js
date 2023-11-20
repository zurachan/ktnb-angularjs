(function () {
    'use strict';
    var controllerId = 'waDvManageController';

    angular.module('MetronicApp').controller(controllerId, waDvManageController);

    function waDvManageController($scope, $http, $timeout, $rootScope, $log, Constant, Restangular, CommonService, kendoConfig, $kWindow, waDvManageService, RestEndpoint, gettextCatalog) {
        var vm = this;
        var modalReject, modalAssign, modalDetail;
        vm.listWorkAssignDetailExportTemp = [];
        vm.modalBody = ".k-widget.k-window";
        vm.documentBody = $(".tab-content");
        vm.listFileAttach = [];
        vm.indexFileAttach = 0;
        vm.listRemove = [
            {
                title: CommonService.translate("Thao tác"),
            },
            {
                title: "",
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
            }
        ];
        vm.unitDatasource = [];
        initFormData();
        vm.newTypeWo = false;

        //
        function initFormData() {
            $("#ktnb_searchForm_waDvManageId").click(function (e) {
                console.log(vm.searchForm);
            });
            vm.String = CommonService.translate("Kiểm toán nội bộ") + " > " + CommonService.translate("Quản lý giao việc của đơn vị");
            vm.searchForm = {};

            vm.statusDvApproveArray = [
                {id: 0, name: "Chưa nhận việc"},
                {id: 1, name: "Đã nhận việc"},
                {id: 2, name: "Từ chối việc"}
            ];

            vm.typeWoArray = [
                {id: 1, name: CommonService.translate("Giao việc ngành dọc PC&KTNB")},
                {id: 2, name: CommonService.translate("Thực hiện kết luận sau thanh kiểm tra")},
                {id: 3, name: CommonService.translate("Cơ quan/ Đơn vị TCT giám sát ngành dọc")},
                {id: 4, name: CommonService.translate("Thông tin công tác kiểm tra các đơn vị")}
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

            vm.statusCompleteArray = [
                {id: 0, name: "Chưa thực hiện"},
                {id: 1, name: "Đang thực hiện"},
                {id: 2, name: "Hoàn Thành"}
            ];

            vm.sourceArray = [
                {id: 0, name: "P.PC&KSNB"},
                {id: 1, name: "Đơn vị"},
            ];

            vm.typeStatusArray = [
                {id: 0, name: "Tất cả"},
                {id: 1, name: "WO dự thảo"},
                {id: 2, name: "Đơn vị chưa nhận"},
                {id: 3, name: "Đơn vị chưa giao"},
                {id: 4, name: "Nhân viên chưa nhận"},
                {id: 5, name: "Nhân viên từ chối nhận"},
                {id: 6, name: "Nhân viên đang thực hiện"},
                {id: 7, name: "Từ chối duyệt hoàn thành"},
                {id: 8, name: "Hoàn thành chờ duyệt"},
                {id: 9, name: "Đã duyệt hoàn thành"},
                {id: 10, name: "Đơn vị từ chối nhận"},
                {id: 11, name: "Từ chối duyệt giao"},
            ];

            vm.statusOvercomeArray = [
                {id: -1, name: "Tất cả"},
                {id: 0, name: "Không cần khắc phục"},
                {id: 1, name: "Chưa tạo WO khắc phục"},
                {id: 2, name: "Đang khắc phục"},
                {id: 3, name: "Đã khắc phục"},
            ];

            vm.listTypeWo = [
                {code: 1, name: CommonService.translate("Giao việc ngành dọc PC&KTNB")},
                {code: 2, name: CommonService.translate("Thực hiện kết luận sau thanh kiểm tra")},
                {code: 3, name: CommonService.translate("Cơ quan/ Đơn vị TCT giám sát ngành dọc")},
                {code: 4, name: CommonService.translate("Thông tin công tác kiểm tra các đơn vị")}
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

            vm.dataList = [];
            checkPermissionDvApprove();
            getUnitDatasource();
        }

        // ----- Main Grid start
        vm.showHideColumnDetail = function (column) {
            var grid = vm.waDvManageGrid;
            if (angular.isUndefined(column.hidden)) {
                grid.hideColumn(column);
            } else if (column.hidden) {
                grid.showColumn(column);
            } else {
                grid.hideColumn(column);
            }
        };

        var record = 0;
        // Grid colunm config
        vm.waDvManageGridOptions = kendoConfig.getGridOptions({
            autoBind: true,
            scrollable: true,
            resizable: true,
            editable: false,
            dataBinding: function () {
                record = (this.dataSource.page() - 1) * this.dataSource.pageSize();
            },
            toolbar: [
                {
                    name: "actions",
                    template:
                        '<div class=" pull-left ">' +
                        '<button type="button" class="btn btn-qlk padding-search-right addQLK ng-scope" style="width: 120px" ng-click="vm.openAdd()" translate>Thêm mới' +
                        '</button>' +
                        '</div>' +

                        '<div class="btn-group pull-right margin_top_button margin_right10">' +
                        '<i data-toggle="dropdown" class="tooltip1" aria-expanded="false"><span class="tooltipArrow"></span><span class="tooltiptext" translate>Cài đặt</span><i class="fa fa-cog" aria-hidden="true"></i></i>' +
                        '<i class="tooltip1 action-button excelQLK" ng-click="vm.exportExcelGrid()"  aria-expanded="false"><span class="tooltipArrow"></span><span class="tooltiptext" translate>Xuất Excel</span></i>' +
                        '<div class="dropdown-menu hold-on-click dropdown-checkboxes" role="menu" style="overflow-y: scroll; height: 600px">' +
                        '<label ng-repeat="column in vm.waDvManageGrid.columns.slice(1,vm.waDvManageGrid.columns.length)| filter: vm.gridColumnShowHideFilter">' +
                        '<input type="checkbox" ng-if="column.hidden" ng-click="vm.showHideColumnDetail(column)">' +
                        '<input type="checkbox" ng-if="!column.hidden" checked ng-click="vm.showHideColumnDetail(column)"> {{column.title}}' +
                        '</label>' +
                        '</div></div>'
                }
            ],
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
                        url: Constant.BASE_SERVICE_URL + "workAssignRsService/doSearchViewDonVi",
                        contentType: "application/json; charset=utf-8",
                        type: "POST"
                    },
                    parameterMap: function (options, type) {
                        var obj = angular.copy(vm.searchForm);
                        obj.page = options.page;
                        obj.pageSize = options.pageSize;
                        // obj.listStatus = [1];
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
            console.log(vm.searchForm.typeWo);
            if (vm.searchForm.typeWo == 4) {
                return [
                    {
                        title: CommonService.translate("TT"),
                        field: "stt",
                        template: function () {
                            return ++record;
                        },
                        width: "40px",
                        headerAttributes: {style: "text-align:center", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"}
                    },
                    {
                        field: "code",
                        title: CommonService.translate("Mã WO"),
                        template: '<a href="javascript:void(0);" title="#=code#" ng-click=vm.showDetail(dataItem)>#=code#</a>',
                        hidden: false,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"},
                        width: "120px",
                    },
                    {
                        field: "typeWo",
                        title: CommonService.translate("Loại WO"),
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"},
                        template: function (dataItem) {
                            return CommonService.translate("Thông tin công tác kiểm tra các đơn vị");
                        },
                        hidden: false,
                        width: "120px"
                    },
                    {
                        field: "sysGroupLv2Name",
                        title: CommonService.translate("Đơn vị nhận việc"),
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"},
                        hidden: false,
                        width: "120px"

                    },
                    {
                        field: "statusDvApprove",
                        title: CommonService.translate("Trạng thái DV nhận WO"),
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"},
                        template: function (dataItem) {
                            vm.statusDvApproveArray.forEach(function (data) {
                                if (data.id == dataItem.statusDvApprove) {
                                    dataItem.statusDvApproveName = data.name;
                                }
                            });
                            return dataItem.statusDvApproveName ? dataItem.statusDvApproveName : '';
                        },
                        hidden: false,
                        width: "90px"

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
                        title: CommonService.translate("Trạng thái phê duyệt của P.PC&KSNB"),
                        field: 'statusKtnbVerify',
                        width: "90px",
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
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"},
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
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"},
                        hidden: false,
                        template: function (dataItem) {
                            return (
                                '<div class="text-center #=waDvManageId#"">' +
                                //ng-if="vm.isRoleApprove && dataItem.statusDvApprove == 0"
                                '<button ng-if="vm.isRoleApprove && dataItem.statusDvApprove == 0" style=" border: none; background-color: white;" class="#=waDvManageId# icon_table ng-scope" uib-tooltip="Nhận việc" translate="" ' +
                                'ng-click="vm.approve(dataItem)" > <i style="color:green;" class="fa fa-check ng-scope" aria-hidden="true"></i>' +
                                '</button>' +
                                //ng-if="vm.isRoleApprove && dataItem.statusDvApprove == 0"
                                '<button ng-if="vm.isRoleApprove && dataItem.statusDvApprove == 0" style=" border: none; background-color: white;" class="#=waDvManageId# icon_table ng-scope" uib-tooltip="Từ chối" translate="" ' +
                                'ng-click="vm.openRejectView(dataItem)" > <i style="color:red;" class="fa fa-times ng-scope" aria-hidden="true"></i>' +
                                '</button>' +
                                //ng-if="dataItem.statusDvApprove == 1  && dataItem.statusAssignNv > 0 && dataItem.statusAssignAllNv != 0 "
                                '<button ng-if="dataItem.statusDvApprove == 1  && dataItem.statusAssignNv > 0 && dataItem.statusAssignAllNv != 0 " style=" border: none; background-color: white;" class="#=waDvManageId# icon_table ng-scope" uib-tooltip="Giao việc" translate="" ' +
                                'ng-click="vm.openAssignWork(dataItem)" > <i class="fa fa-hand-paper-o ng-scope" aria-hidden="true"></i>' +
                                '</button>' +
                                //ng-if="dataItem.statusDvApprove == 1  && dataItem.statusAssignNv == 0 && dataItem.statusAssignAllNv != 0 "
                                '<button ng-if="dataItem.statusDvApprove == 1  && dataItem.statusAssignNv == 0 && dataItem.statusAssignAllNv != 0 " style=" border: none; background-color: white;" class="#=waDvManageId# icon_table ng-scope" uib-tooltip="Sửa" translate="" ' +
                                'ng-click="vm.openEditAssignWork(dataItem)" > <i class="fa fa-pencil ng-scope" aria-hidden="true"></i>' +
                                '</button>' +
                                //ng-if="dataItem.status==2 && vm.isRoleApprove"
                                '<button ng-if="dataItem.status==2 && vm.isRoleApprove" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Duyệt giao việc" translate ' +
                                'ng-click="vm.approveStatus(dataItem)" > <i style="color:blueviolet;" class="fa fa-share ng-scope" aria-hidden="true"></i></button>'
                                +
                                //ng-if="dataItem.status==2 && vm.isRoleApprove"
                                '<button ng-if="dataItem.status==2 && vm.isRoleApprove" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Hủy duyệt giao việc" translate ' +
                                'ng-click="vm.cancelApproveStatus(dataItem)" > <i style="color:#2f3b49;" class="fa fa-undo ng-scope" aria-hidden="true"></i></button>'
                                +

                                // '<button style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Copy" translate ' +
                                // 'ng-click="vm.copy(dataItem)" ><i class="fa fa-copy ng-scope" aria-hidden="true" translate></i></button>'
                                // +

                                '<button ng-if="dataItem.statusOvercome==1&&dataItem.statusOvercome2 <= 0"' +
                                'style=" border: none; background-color: white;" class="#=manageWoEmployeeId# icon_table ng-scope" uib-tooltip="Tạo Wo khắc phục" translate="" ' +
                                'ng-click="vm.createOvercomeWo(dataItem)" > <i style="color:#0b94ea;" class="fa fa-plus ng-scope" aria-hidden="true"></i>' +
                                '</button>' +

                                '<button ng-if="dataItem.status==2" style=" border: none; background-color: white;" class="#=waDvManageId# icon_table ng-scope" uib-tooltip="Sửa" translate="" ' +
                                'ng-click="vm.openEditAssignWorkNew(dataItem)" > <i class="fa fa-pencil ng-scope" aria-hidden="true"></i>' +
                                '</button>' +

                                '<button ng-if="dataItem.status==0" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Xóa" translate ' +
                                'ng-click="vm.remove(dataItem)"> <i style="color:steelblue;" class="fa fa-trash ng-scope" aria-hidden="true"></i>' +
                                '</button>' +
                                //ng-if="vm.isRoleExtend && dataItem.status!=0 && dataItem.statusKtnbVerify != 0 && dataItem.statusKtnbVerify != 1 && dataItem.statusDvApprove!==2"
                                '<button ng-if="dataItem.status!=0 && dataItem.statusKtnbVerify != 0 && dataItem.statusKtnbVerify != 1 && dataItem.statusDvApprove!==2" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Gia hạn công việc" translate ' +
                                'ng-click="vm.openTimeExtendPopup(dataItem)"> <i class="fa fa-clock-o ng-scope" aria-hidden="true"></i>' +
                                '</button>' +

                                '<button ng-if="dataItem.statusVerifyWoDv==0" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Duyệt hoàn thành" translate ' +
                                'ng-click="vm.verifyWoDv(dataItem)"> <i style="color: darkgreen" class="fa fa-check-circle ng-scope" aria-hidden="true"></i>' +
                                '</button>' +

                                '<button ng-if="dataItem.statusVerifyWoDv==0" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Từ chối duyệt hoàn thành" translate ' +
                                'ng-click="vm.verifyWoDvReject(dataItem)"> <i style="color: darkred" class="fa fa-times-circle ng-scope" aria-hidden="true"></i>' +
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
                        headerAttributes: {
                            style: "text-align:center;",
                            translate: ""
                        },
                        hidden: false,
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"},
                    },
                    {
                        field: "code",
                        title: CommonService.translate("Mã WO"),
                        template: '<a href="javascript:void(0);" title="#=code#" ng-click=vm.showDetail(dataItem)>#=code#</a>',
                        hidden: false,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"},
                        width: "120px",
                    },
                    {
                        field: "typeStatusStr",
                        title: CommonService.translate("Loại trạng thái"),
                        hidden: false,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"},
                        width: "120px",
                    },
                    {
                        field: "isDvCreate",
                        title: CommonService.translate("Nguồn tạo"),
                        hidden: false,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"},
                        width: "120px",
                        template: dataItem => dataItem.isDvCreate == 1 ? 'Đơn vị' : 'P.PC&KSNB'
                    },
                    {
                        field: "sysGroupLv2Name",
                        title: CommonService.translate("Đơn vị nhận việc"),
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"},
                        hidden: true,
                        width: "120px"

                    },
                    {
                        field: "typeWo",
                        title: CommonService.translate("Loại WO"),
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"},
                        template: function (dataItem) {

                            vm.typeWoArray.forEach(function (data) {
                                if (data.id == dataItem.typeWo) {
                                    dataItem.typeWoName = data.name;
                                }
                            });
                            return dataItem.typeWoName ? dataItem.typeWoName : '';
                        },
                        hidden: true,
                        width: "120px"

                    },
                    {
                        field: "nameDocument",
                        title: CommonService.translate("Số văn bản"),
                        headerAttributes: {style: "text-align:center;white-space:normal;"},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"},
                        hidden: false,
                        width: "140px"

                    },
                    {
                        field: "startDate",
                        title: CommonService.translate("Thời gian bắt đầu WO"),
                        headerAttributes: {style: "text-align:center;white-space:normal;"},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"},
                        hidden: false,
                        width: "80px"

                    },
                    {
                        field: "closeDate",
                        title: CommonService.translate("Thời gian kết thúc WO"),
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"},
                        hidden: false,
                        width: "80px"

                    },
                    {
                        field: "completeNvDate",
                        title: CommonService.translate("Ngày nhân viên xác nhận hoàn thành"),
                        hidden: false,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"},
                        width: "80px",
                    },
                    {
                        field: "statusDvApprove",
                        title: CommonService.translate("Trạng thái DV nhận WO"),
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"},
                        template: function (dataItem) {
                            vm.statusDvApproveArray.forEach(function (data) {
                                if (data.id == dataItem.statusDvApprove) {
                                    dataItem.statusDvApproveName = data.name;
                                }
                            });
                            return dataItem.statusDvApproveName ? dataItem.statusDvApproveName : '';
                        },
                        hidden: false,
                        width: "90px"

                    },
                    {
                        title: CommonService.translate("Trạng thái KTNB xác nhận"),
                        field: 'statusKtnbVerify',
                        width: "90px",
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
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"},
                    },
                    {
                        field: "createByName",
                        title: CommonService.translate("Người tạo"),
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"},
                        hidden: true,
                        width: "100px"

                    },
                    {
                        field: "createDate",
                        title: CommonService.translate("Ngày tạo"),
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"},
                        hidden: true,
                        width: "80px"

                    },
                    {
                        field: "statusDoWork",
                        title: CommonService.translate("Tình trạng"),
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"},
                        hidden: false,
                        width: "80px"

                    },
                    {
                        field: "statusVerifyWoDv",
                        title: CommonService.translate("Trạng thái duyệt hoàn thành"),
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"},
                        hidden: false,
                        width: "80px",
                        template: dataItem => {
                            if (dataItem.statusVerifyWoDv == 0) {
                                return "Chờ duyệt";
                            } else if (dataItem.statusVerifyWoDv == 1) {
                                return "Đã duyệt";
                            } else if (dataItem.statusVerifyWoDv == 2) {
                                return "Từ chối duyệt";
                            } else {
                                return "";
                            }
                        }
                    },
                    {
                        field: "",
                        title: CommonService.translate("Ngày duyệt hoàn thành"),
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"},
                        hidden: false,
                        width: "80px"
                    },
                    {
                        title: CommonService.translate("Trạng thái thực hiện WO khắc phục"),
                        field: 'statusOvercome',
                        width: "100px",
                        template: function (dataItem) {
                            if (dataItem.statusKtnbVerify == null) {
                                return "";
                            }
                            if (dataItem.statusOvercome2 > 0) {
                                return "Đã tạo"
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
                        attributes: {style: "text-align:center;white-space:normal;background-color:${data.color}"},
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
                        hidden: false,
                        template: function (dataItem) {
                            return (
                                '<div class="text-center #=waDvManageId#"">' +
                                //ng-if="vm.isRoleApprove && dataItem.statusDvApprove == 0"
                                '<button ng-if="vm.isRoleApprove && dataItem.statusDvApprove == 0" style=" border: none; background-color: white;" class="#=waDvManageId# icon_table ng-scope" uib-tooltip="Nhận việc" translate="" ' +
                                'ng-click="vm.approve(dataItem)" > <i style="color:green;" class="fa fa-check ng-scope" aria-hidden="true"></i>' +
                                '</button>' +
                                //ng-if="vm.isRoleApprove && dataItem.statusDvApprove == 0"
                                '<button ng-if="vm.isRoleApprove && dataItem.statusDvApprove == 0" style=" border: none; background-color: white;" class="#=waDvManageId# icon_table ng-scope" uib-tooltip="Từ chối" translate="" ' +
                                'ng-click="vm.openRejectView(dataItem)" > <i style="color:red;" class="fa fa-times ng-scope" aria-hidden="true"></i>' +
                                '</button>' +
                                //ng-if="dataItem.statusDvApprove == 1  && dataItem.statusAssignNv > 0 && dataItem.statusAssignAllNv != 0 "
                                '<button ng-if="dataItem.statusDvApprove == 1  && dataItem.statusAssignNv > 0 && dataItem.statusAssignAllNv != 0 " style=" border: none; background-color: white;" class="#=waDvManageId# icon_table ng-scope" uib-tooltip="Giao việc" translate="" ' +
                                'ng-click="vm.openAssignWork(dataItem)" > <i class="fa fa-hand-paper-o ng-scope" aria-hidden="true"></i>' +
                                '</button>' +
                                //ng-if="dataItem.statusDvApprove == 1  && dataItem.statusAssignNv == 0 && dataItem.statusAssignAllNv != 0 "
                                '<button ng-if="dataItem.statusDvApprove == 1  && dataItem.statusAssignNv == 0 && dataItem.statusAssignAllNv != 0 " style=" border: none; background-color: white;" class="#=waDvManageId# icon_table ng-scope" uib-tooltip="Sửa" translate="" ' +
                                'ng-click="vm.openEditAssignWork(dataItem)" > <i class="fa fa-pencil ng-scope" aria-hidden="true"></i>' +
                                '</button>' +
                                //ng-if="dataItem.status==2 && vm.isRoleApprove"
                                '<button ng-if="dataItem.status==2 && vm.isRoleApprove" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Duyệt giao việc" translate ' +
                                'ng-click="vm.approveStatus(dataItem)" > <i style="color:blueviolet;" class="fa fa-share ng-scope" aria-hidden="true"></i></button>'
                                +
                                //ng-if="dataItem.status==2 && vm.isRoleApprove"
                                '<button ng-if="dataItem.status==2 && vm.isRoleApprove" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Hủy duyệt giao việc" translate ' +
                                'ng-click="vm.cancelApproveStatus(dataItem)" > <i style="color:#2f3b49;" class="fa fa-undo ng-scope" aria-hidden="true"></i></button>'
                                +

                                // '<button style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Copy" translate ' +
                                // 'ng-click="vm.copy(dataItem)" ><i class="fa fa-copy ng-scope" aria-hidden="true" translate></i></button>'
                                // +

                                '<button ng-if="dataItem.statusOvercome==1&&dataItem.statusOvercome2 <= 0"' +
                                'style=" border: none; background-color: white;" class="#=manageWoEmployeeId# icon_table ng-scope" uib-tooltip="Tạo Wo khắc phục" translate="" ' +
                                'ng-click="vm.createOvercomeWo(dataItem)" > <i style="color:#0b94ea;" class="fa fa-plus ng-scope" aria-hidden="true"></i>' +
                                '</button>' +

                                '<button ng-if="dataItem.status==2" style=" border: none; background-color: white;" class="#=waDvManageId# icon_table ng-scope" uib-tooltip="Sửa" translate="" ' +
                                'ng-click="vm.openEditAssignWorkNew(dataItem)" > <i class="fa fa-pencil ng-scope" aria-hidden="true"></i>' +
                                '</button>' +

                                '<button ng-if="dataItem.status==0" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Xóa" translate ' +
                                'ng-click="vm.remove(dataItem)"> <i style="color:steelblue;" class="fa fa-trash ng-scope" aria-hidden="true"></i>' +
                                '</button>' +
                                //ng-if="vm.isRoleExtend && dataItem.status!=0 && dataItem.statusKtnbVerify != 0 && dataItem.statusKtnbVerify != 1 && dataItem.statusDvApprove!==2"
                                '<button ng-if="dataItem.status!=0 && dataItem.statusKtnbVerify != 0 && dataItem.statusKtnbVerify != 1 && dataItem.statusDvApprove!==2" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Gia hạn công việc" translate ' +
                                'ng-click="vm.openTimeExtendPopup(dataItem)"> <i class="fa fa-clock-o ng-scope" aria-hidden="true"></i>' +
                                '</button>' +

                                '<button ng-if="dataItem.statusVerifyWoDv==0" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Duyệt hoàn thành" translate ' +
                                'ng-click="vm.verifyWoDv(dataItem)"> <i style="color: darkgreen" class="fa fa-check-circle ng-scope" aria-hidden="true"></i>' +
                                '</button>' +

                                '<button ng-if="dataItem.statusVerifyWoDv==0" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Từ chối duyệt hoàn thành" translate ' +
                                'ng-click="vm.verifyWoDvReject(dataItem)"> <i style="color: darkred" class="fa fa-times-circle ng-scope" aria-hidden="true"></i>' +
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
                    $("#waDvManage_startDate").focus();
                    return;
                }
            }
            if (vm.searchForm.closeDate) {
                var d1 = kendo.parseDate(vm.searchForm.closeDate, "dd/MM/yyyy");
                if (d1 == null) {
                    toastr.error("Bạn vui lòng nhập đúng định dạng ngày dd/mm/yyyy");
                    $("#waDvManage_closeDate").focus();
                    return;
                }
            }
            if (vm.searchForm.startDate && vm.searchForm.closeDate) {
                var d1 = kendo.parseDate(vm.searchForm.startDate, "dd/MM/yyyy");
                var d2 = kendo.parseDate(vm.searchForm.closeDate, "dd/MM/yyyy");
                if (d1 > d2) {
                    console.log("aa", d1)
                    toastr.error("Ngày bắt đầu tìm kiếm phải nhỏ hơn ngày kết thúc tìm kiếm");
                    $("#waDvManage_closeDate").focus();
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
            console.log(vm.searchForm);
            var grid = vm.waDvManageGrid;
            grid.setOptions({columns: getColumn()})
            CommonService.doSearchGrid(grid, {pageSize: grid.dataSource.pageSize()});
        };

        vm.exportExcelGrid = function () {
            kendo.ui.progress(vm.documentBody, true);
            var obj = angular.copy(vm.searchForm);
            obj.page = null;
            obj.pageSize = null;

            waDvManageService.doSearch(obj).then(function (d) {
                kendo.ui.progress(vm.documentBody, false);
                var data = d.data;
                CommonService.exportFile2(vm.waDvManageGrid, data, vm.listRemove, vm.listConvert, CommonService.translate("Danh sách WO của đơn vị"));
            });
        }

        function checkPermissionDvApprove() {
            vm.isRoleApprove = false;
            let obj = {};
            obj.adResourceCode = "WO_DV";
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

        vm.approve = function (dataItem) {
            kendo.ui.progress($(vm.modalBody), true);
            var obj = {};
            obj.workAssignId = dataItem.workAssignId;
            obj.statusDvApprove = 1;
            confirm(CommonService.translate('Bạn có chắc chắn NHẬN VIỆC không?'), function () {
                Restangular.all("workAssignRsService/approveDvStatus").post(obj).then(function (response) {
                    kendo.ui.progress($(vm.modalBody), false);
                    toastr.success(CommonService.translate("Phê duyệt thành công!!"));
                    vm.doSearch();
                }).catch(function (err) {
                    kendo.ui.progress($(vm.modalBody), false);
                    console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
                });
            })
        };
        vm.openRejectView = function (dataItem) {
            vm.rejectForm = {};
            vm.rejectForm.workAssignId = dataItem.workAssignId;
            vm.typeCreate = 'rejectWork';
            var templateUrl = 'ktnb/waDvManage/rejectPopup.html';
            var title = "Từ chối nhận việc";
            modalReject = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "30%", null, null);
        };
        vm.openAssignWork = function (dataItem) {
            vm.assignForm = {};
            vm.typeCreate = 'assignWork';
            dataItem.typeFile = "WOKTNB";
            waDvManageService.getDetail(dataItem).then(function (data) {
                vm.assignForm = angular.copy(data);
                var templateUrl = 'ktnb/waDvManage/assignWorkPopup.html';
                var title = CommonService.translate("Giao việc cho nhân viên");
                modalAssign = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "70%", null, null);
                vm.dataFile = vm.assignForm.listAttachDocument;
                vm.listWADetail = vm.assignForm.listWorkAssignDetail;
                fillFileTable(vm.dataFile);
                fillDataWorkAssignDetail(vm.listWADetail);
            }, function () {
                toastr.error(CommonService.translate("Có lỗi xảy ra"));
            });
        };

        vm.openEditAssignWork = function (dataItem) {
            vm.assignForm2 = {};
            vm.typeCreate = 'editAssignWork';
            dataItem.typeFile = "WOKTNB";
            waDvManageService.getDetail(dataItem).then(function (data) {
                vm.assignForm = angular.copy(data);
                var templateUrl = 'ktnb/waDvManage/assignWorkPopup.html';
                var title = CommonService.translate("Chỉnh sửa giao việc cho nhân viên");
                modalAssign = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "70%", null, null);
                vm.dataFile = vm.assignForm.listAttachDocument;
                vm.listWADetail = vm.assignForm.listWorkAssignDetail;
                fillFileTable(vm.dataFile);
                fillDataWorkAssignDetail(vm.listWADetail);
            }, function () {
                toastr.error(CommonService.translate("Có lỗi xảy ra"));
            });
        };

        vm.showDetail = function (dataItem) {
            vm.assignForm = {};
            vm.typeCreate = 'detail';
            dataItem.typeFile = "WOKTNB";
            vm.newTypeWo = dataItem.typeWo == 4 ? true : false;
            waDvManageService.getDetail(dataItem).then(function (data) {
                vm.assignForm = angular.copy(data);
                if (vm.assignForm.inspectionInformationDTOs) {
                    vm.assignForm.inspectionInformationDTOs.map(x => {
                        x.inspectionUnits = x.problemDiscoveredDTOList.map(y => y.groupName).toString().replace(",", ';,');
                        return x;
                    })
                }

                var templateUrl = 'ktnb/waDvManage/detailPopup.html';
                var title = CommonService.translate("Giao việc cho nhân viên");
                modalAssign = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "70%", null, null);
                vm.dataFile = vm.assignForm.listAttachDocument;
                vm.listWADetail = vm.assignForm.listWorkAssignDetail;
                fillFileTable(vm.dataFile);
                fillDataWorkAssignDetail(vm.listWADetail);
            }, function () {
                toastr.error(CommonService.translate("Có lỗi xảy ra"));
            });
        }

        // đính kèm file
        function fillFileTable(data) {
            var dataSource = new kendo.data.DataSource({
                data: data,
                pageSize: 5
            });
            vm.gridFileOptions = kendoConfig.getGridOptions({
                autoBind: true,
                scrollable: false,
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
                ]
            });
        }

        // Xóa file đính kèm
        // Danh sach cong viec
        var recordWAD = 0;

        function fillDataWorkAssignDetail(data) {
            var dataItem = {
                data: data,
                page: 1,
                pageSize: 5,
            };
            vm.listDvWorkAssignDetailGridOptions = kendoConfig.getGridOptions({
                autoBind: true,
                scrollable: true,
                editable: true,
                resizable: true,
                sortable: false,
                columnMenu: false,
                serverPaging: true,
                dataBinding: function () {
                    recordWAD = (this.dataSource.page() - 1) * this.dataSource.pageSize();
                },
                dataSource: dataItem,
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
                            return ++recordWAD;
                        },
                        width: "45px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        type: "text",
                        editable: false
                    }, {
                        title: CommonService.translate("Tên công việc"),
                        field: 'workName',
                        width: "100px",
                        editable: false,
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        type: "text",
                        attributes: {
                            style: "text-align:left;white-space:normal;"
                        }
                    }, {
                        title: CommonService.translate("Nội dung chi tiết"),
                        field: "description",
                        width: "200px",
                        type: "text",
                        editable: false,
                        attributes: {
                            style: "white-space:normal;"
                        }
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
                        type: "text",
                        editable: false

                    },
                    {
                        title: CommonService.translate("Ngày đơn vị giao WO"),
                        field: 'coordinateNvDate',
                        headerAttributes: {
                            style: "text-align:center;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; white-space:normal;"
                        },
                        width: "80px",
                        type: "text",
                        editable: false

                    },
                    {
                        title: CommonService.translate("Nhân viên thực hiện chính"),
                        field: "performerName",
                        editor: mainStaffAutoCompleteEditor,
                        width: "130px",
                        editable: function (dataItem) {
                            return (dataItem.isKtnbReject == 1 || dataItem.statusNvApprove != 1) && vm.typeCreate != 'detail';
                        },
                        type: "text",
                    }, {
                        title: CommonService.translate("Nhân viên thực hiện cùng"),
                        field: "performerTogether",
                        // editor: togetherStaffAutoCompleteEditor,
                        width: "130px",
                        // editable: true,
                        editable: function (dataItem) {
                            return (dataItem.isKtnbReject == 1 || dataItem.statusNvApprove != 1) && vm.typeCreate != 'detail';
                        },
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        type: "text",
                        template: function (dataItem) {
                            if (!((dataItem.isKtnbReject == 1 || dataItem.statusNvApprove != 1) && vm.typeCreate != 'detail')) {
                                return dataItem.performerTogether == null ? '' : dataItem.performerTogether;
                                // return  '<div disabled >' + dataItem.performerTogether == null ? '' : dataItem.performerTogether + '</div>'
                            } else {
                                return '<div class="input-icon right ">' +
                                    '<i title="Thêm nhân viên thực hiện cùng" style="color:#f1c40f;" class="fa fa-plus " ng-click="caller.openPopupTogether(dataItem)"></i>' +
                                    '<input type="text" class="form-control width100" ng-model="dataItem.performerTogether"' +
                                    ' />' +
                                    '</div>'
                            }

                        },
                    },
                    {
                        title: CommonService.translate("Trạng thái"),
                        field: "statusNvApprove",
                        width: "70px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        template: function (dataItem) {
                            if (dataItem.statusNvApprove == '0') {
                                return "Chưa nhận việc";
                            } else if (dataItem.statusNvApprove == '1') {
                                return "Đã nhận việc";
                            } else if (dataItem.statusNvApprove == '2') {
                                return "Từ chối việc";
                            } else return '';
                        },
                        editable: false,
                        type: "text",
                    }, {
                        title: CommonService.translate("Lý do"),
                        field: "cancelNvDescription",
                        width: "70px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        editable: false,
                        type: "text",
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
                    //     type: "text",
                    //     hidden: vm.assignForm.typeWo!=1
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
                        type: "text",
                        hidden: vm.assignForm.typeWo != 1,
                        template: dataItem => {
                            if (dataItem.statusOvecome == 0) {
                                return 'Không cần khắc phục';
                            } else if (dataItem.statusOvercome == 1) {
                                return 'Chưa tạo';
                            } else return '';
                        }
                    },
                ]
            });
        }

        vm.seletedMainStaff = false;

        function mainStaffAutoCompleteEditor(container, options) {
            $('<input data-bind="value:' + options.field + '"/>')
                .appendTo(container)
                .kendoAutoComplete({
                    clearButton: false,
                    autoBind: true,
                    dataTextField: "fullName",
                    dataValueField: "sysUserId",
                    valuePrimitive: true,
                    filter: "contains",
                    minLength: 1,
                    pageSize: 10,
                    open: function (e) {
                        vm.seletedMainStaff = false;
                    },
                    select: function (e) {
                        var dataItem = this.dataItem(e.item.index());
                        vm.seletedMainStaff = true;
                        options.model.performerName = dataItem.fullName;
                        options.model.performerId = dataItem.sysUserId;
                        options.model.performerCode = dataItem.employeeCode;
                    },
                    change: function (e) {
                        $timeout(function () {
                            if (e.sender.value() === '' || !vm.seletedMainStaff) {
                                options.model.performerName = null;
                                options.model.performerId = null;
                                options.model.performerCode = null;
                            }
                        }, 100);
                    },
                    close: function (e) {
                        $timeout(function () {
                            if (options.model.performerId == null) {
                                options.model.performerName = null;
                                options.model.performerId = null;
                                options.model.performerCode = null;
                            }
                        }, 1000);

                    },
                    dataSource: {
                        serverFiltering: true,
                        transport: {
                            read: function (options) {
                                vm.seletedMainStaff = false;
                                // vm.keySearch = options.model.performerName;
                                return Restangular.all("commonRsService/getSysUserForAutoComplete").post(
                                    {
                                        keySearch: options.data.filter.filters[0].value,
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
                        '<p class="col-md-6 text-header-auto border-right-ccc" translate>Mã NV</p>' +
                        '<p class="col-md-6 text-header-auto" translate>Tên NV</p>' +
                        '</div>' +
                        '</div>',
                    template: '<div class="row" ><div class="col-md-6 col-xs-5" style="float:left">#: data.employeeCode #</div><div  style="padding-left: 5px;width:auto;overflow: hidden"> #: data.fullName #</div> </div>',

                });
            // }

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
        // add người đi cùng start
        var togetherByColumns = [
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
                    '			<i ng-click="caller.saveSelectTogether(dataItem)" class="fa fa-check color-green" aria-hidden="true"></i> ' +
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
        var modalTogether = null;
        vm.openPopupTogether = function (data) {
            var templateUrl = "ktnb/popup/popupCommonSearch.html";
            var title = CommonService.translate("Tìm kiếm nhân viên");
            var windowId = "POPUP_SELECT_TOGETHER_USER";
            vm.placeHolder = CommonService.translate("Mã/tên nhân viên");
            CommonService.populatePopupCreate(templateUrl, title, null, vm, windowId, null, '60%', '50%', null);
            setTimeout(function () {
                modalTogether = CommonService.getModalInstance1();
            }, 100);
            vm.commonPopupSearch = {};
            vm.commonPopupSearch.workAssignDetailId = data.workAssignDetailId;
            var api = "commonRsService/getSysUserForAutoComplete";
            CommonService.fillDataPopupCommonSearch(api, vm.commonPopupSearch, togetherByColumns, vm);
        }

        vm.saveSelectTogether = function (dataItem) {
            var lstGrid = vm.listDvWorkAssignDetailGrid.dataSource.data();
            for (let i = 0; i < lstGrid.length; i++) {
                if (lstGrid[i].workAssignDetailId == vm.commonPopupSearch.workAssignDetailId) {
                    if (lstGrid[i].performerTogether != null) {
                        lstGrid[i].performerTogether += "," + dataItem.codeName;
                    } else {
                        lstGrid[i].performerTogether = dataItem.codeName;
                    }

                }
            }
            vm.listDvWorkAssignDetailGrid.dataSource.data(lstGrid);
            vm.listDvWorkAssignDetailGrid.refresh();
            modalTogether.dismiss();
        }
        // add người đi cùng end
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
                vm.searchForm.sysGroupLv2Id = dataItem.sysGroupId;
                vm.searchForm.sysGroupLv2Code = dataItem.code;
                vm.searchForm.sysGroupLv2Name = dataItem.name;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSysGroup) {
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
                        vm.isSelectSysGroup = false;
                        return Restangular.all("commonRsService/getSysGroupForAutoComplete").post(
                            {
                                keySearch: vm.searchForm.sysGroupLv2Name,
                                groupLevelLst: ['2', '3'],
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
                '<p class="col-md-6 text-header-auto border-right-ccc" translate>Mã đơn vị</p>' +
                '<p class="col-md-6 text-header-auto" translate>Tên đơn vị</p>' +
                '</div>' +
                '</div>',
            template: '<div class="row" ><div class="col-md-6 col-xs-5" style="float:left">#: data.code #</div><div  style="padding-left: 5px;width:auto;overflow: hidden"> #: data.name #</div> </div>',
        };
        vm.saveItemWA = function () {
            if (vm.typeCreate === 'assignWork') {
                var lstDataGrid = vm.listDvWorkAssignDetailGrid.dataSource._data;
                for (let i = 0; i < lstDataGrid.length; i++) {
                    if (lstDataGrid[i].performerId == null || lstDataGrid[i].performerId == "") {
                        toastr.error(CommonService.translate("Chưa chọn Người thực hiện "));
                        return;
                    }
                }

                let obj = {};
                obj.workAssignId = vm.assignForm.workAssignId;
                obj.listFileAttach = vm.listFileAttach;
                obj.listWorkAssignDetail = lstDataGrid;
                Restangular.all("workAssignRsService/assignWork").post(obj).then(function (response) {
                    if (response && response.error) {
                        toastr.error(response.error);
                    } else {
                        toastr.success("Ghi lại thành công");
                        vm.doSearch();
                        modalAssign.close();
                    }
                }).catch(function (err) {
                    console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
                });
            } else if (vm.typeCreate === 'editAssignWork') {
                var lstDataGrid = vm.listDvWorkAssignDetailGrid.dataSource.data();
                for (let i = 0; i < lstDataGrid.length; i++) {
                    if (lstDataGrid[i].performerId == null || lstDataGrid[i].performerId == "") {
                        toastr.error(CommonService.translate("Chưa chọn Người thực hiện "));
                        return;
                    }
                }

                let obj = angular.copy(vm.assignForm);
                obj.workAssignId = vm.assignForm.workAssignId;
                obj.listFileAttach = vm.listFileAttach;
                obj.listWorkAssignDetail = lstDataGrid;
                Restangular.all("workAssignRsService/editAssignWork").post(obj).then(function (response) {
                    if (response && response.error) {
                        toastr.error(response.error);
                    } else {
                        toastr.success("Ghi lại thành công");
                        vm.doSearch();
                        modalAssign.close();
                    }
                }).catch(function (err) {
                    console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
                });
            } else if (vm.typeCreate === 'rejectWork') {
                if (vm.rejectForm.cancelDvDescription == null) {
                    toastr.error("Chưa nhập lý do từ chối");
                    return;
                }
                var obj = vm.rejectForm;
                obj.statusDvApprove = 2;
                Restangular.all("workAssignRsService/approveDvStatus").post(obj).then(function (response) {
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

            } else if (vm.typeCreate === 'openEditAssignWorkNew') {
                var lstDataGrid = vm.listDvWorkAssignDetailGrid.dataSource.data();
                for (let i = 0; i < lstDataGrid.length; i++) {
                    if (lstDataGrid[i].performerId == null || lstDataGrid[i].performerId == "") {
                        toastr.error(CommonService.translate("Chưa chọn Người thực hiện "));
                        return;
                    }
                }

                let obj = angular.copy(vm.assignForm);
                obj.workAssignId = vm.assignForm.workAssignId;
                obj.listFileAttach = vm.listFileAttach;
                obj.listWorkAssignDetail = lstDataGrid;
                kendo.ui.progress($(".k-window"), true);
                Restangular.all("workAssignRsService/editAssignWorkNew").post(obj).then(function (response) {
                    if (response && response.error) {
                        toastr.error(response.error);
                        kendo.ui.progress($(".k-window"), false);
                    } else {
                        toastr.success("Ghi lại thành công");
                        vm.doSearch();
                        kendo.ui.progress($(".k-window"), false);
                        modalAssign.close();
                    }
                }).catch(function (err) {
                    console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
                    kendo.ui.progress($(".k-window"), false);
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

        //------------------------ start don vi
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
            vm.searchForm.sysGroupLv2Id = dataItem.sysGroupId;
            vm.searchForm.sysGroupLv2Code = dataItem.code;
            vm.searchForm.sysGroupLv2Name = dataItem.name;
            modalSysGroup.dismiss();
        }
        //------------------------ end don vi

        // đính kèm file
        function fillFileTable(data) {
            var dataSource = new kendo.data.DataSource({
                data: data,
                pageSize: 5
            });
            vm.gridFileOptions = kendoConfig.getGridOptions({
                autoBind: true,
                scrollable: false,
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

        // function formatDate(date) {
        //     var d = new Date(date),
        //         month = '' + (d.getMonth() + 1),
        //         day = '' + d.getDate(),
        //         year = d.getFullYear()
        //
        //     if (month.length < 2)
        //         month = '0' + month;
        //     if (day.length < 2)
        //         day = '0' + day;
        //     return [year, month, day].join('-');
        // }
        //
        // vm.deleteFileAttach = function (objectId){
        //     confirm('Xác nhận xóa file đã chọn?', function(){
        //         for( let i = 0; i < vm.listFileAttach.length; i++){
        //             if ( vm.listFileAttach[i].objectId == objectId){ vm.listFileAttach.splice(i, 1); }
        //             vm.attachFileListTable.dataSource.read();
        //         }
        //     })
        // }
        //------------------------ import file đính kèm
        vm.checkErr = function () {
            if (vm.searchForm.startDate == null) {
                vm.errMessage = CommonService.translate("Ngày đến không được để trống");
                $("#waDvManage_startDate").focus();
                return vm.errMessage;
            }
            let startDate = kendo.parseDate(vm.searchForm.startDate, "dd/MM/yyyy");
            let closeDate = kendo.parseDate(vm.searchForm.closeDate, "dd/MM/yyyy");
            let curDate = new Date();
            if (startDate > curDate) {
                vm.errMessage = CommonService.translate("Ngày bắt đầu không được lớn hơn ngày hiện tại");
                $("#waDvManage_startDate").focus();
                return vm.errMessage;
            } else if (closeDate != null && startDate > closeDate) {
                vm.errMessage = CommonService.translate("Ngày bắt đầu không được lớn hơn ngày đến");
                $("#waDvManage_startDate").focus();
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
                $("#waDvManage_closeDate").focus();
                return vm.errMessage1;
            }
            let startDate = kendo.parseDate(vm.searchForm.startDate, "dd/MM/yyyy");
            let closeDate = kendo.parseDate(vm.searchForm.closeDate, "dd/MM/yyyy");
            let curDate = new Date();
            if (closeDate > curDate) {
                vm.errMessage1 = CommonService.translate("Ngày bắt đầu không được lớn hơn ngày hiện tại");
                $("#waDvManage_closeDate").focus();
                return vm.errMessage1;
            } else if (startDate > closeDate) {
                vm.errMessage1 = CommonService.translate("Ngày đến không được nhỏ hơn ngày bắt đầu");
                $("#waDvManage_closeDate").focus();
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
                case 'sysGroupId':
                    vm.searchForm.sysGroupLv2Id = null;
                    vm.searchForm.sysGroupLv2Name = null;
                    vm.searchForm.sysGroupLv2Code = null;
                    break;
                case 'createBy_search':
                    vm.searchForm.createBy = null;
                    vm.searchForm.createByName = null;
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
                    vm.searchForm.groupIds = null;
                    vm.searchForm.groupNames = null;
                    break;
                }
            }
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

        vm.isSelectSearchPerformer = false;
        vm.performerSearchOptions = {
            clearButton: false,
            dataTextField: "name", placeholder: CommonService.translate("Nhập tên/mã người thực hiện"),
            dataValueField: "name",
            open: function (e) {
                vm.isSelectSearchPerformer = false;
            },
            select: function (e) {
                vm.isSelectSearchPerformer = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchForm.performerId = dataItem.sysUserId;
                vm.searchForm.performerName = dataItem.fullName;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSearchPerformer) {
                        vm.searchForm.performerId = null;
                        vm.searchForm.performerName = null;
                    }
                }, 100);
            },
            close: function (e) {
                $timeout(function () {
                    if (vm.searchForm.performerId == null) {
                        vm.searchForm.performerName = null;
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
                                keySearch: vm.searchForm.performerName,
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

        // ================= tao wo khac phuc ============== //
        var modalAdd = null;
        vm.createOvercomeWo = function (dataItem) {
            Restangular.all("workAssignRsService/getListFileComplete").post({workAssignId: dataItem.workAssignId}).then(function (res) {
                vm.insertForm = {};
                vm.insertForm.workAssignId = dataItem.workAssignId;
                vm.insertForm.overcomeContents = dataItem.overcomeContents;
                vm.insertForm.code = dataItem.code;
                var templateUrl = 'ktnb/waDvManage/createOvercomeWo.html';
                var title = CommonService.translate("Tạo mới công việc khắc phục");
                modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "80%", null, null);
                vm.listWorkAssignOvercome = [];
                fillDataTableWorkAssign(vm.listWorkAssignOvercome);
                fillDataFileComplete(res);
            }, function (err) {
                toastr.error("Có lỗi xảy ra khi lấy file hoàn thành công việc")
            });
        }

        var recordWaKP = 0;
        var recordWadKP = 0;
        var recordCompleteFile = 0;

        function fillDataFileComplete(data) {
            recordCompleteFile = 0
            var dataSource = new kendo.data.DataSource({
                pageSize: 5,
                data: data,
                autoSync: false,
                schema: {
                    total: function (response) {
                        return data.length;
                    },
                    model: {
                        fields: {
                            stt: {editable: false},
                            name: {editable: false},
                            createdUserName: {editable: false},
                            createdDate: {editable: false},
                        }
                    }
                }
            });

            vm.fileCompleteGridOptions = kendoConfig.getGridOptions({
                autobind: false,
                sortable: true,
                scrollable: false,
                columnMenu: false,
                dataSource: dataSource,
                dataBinding: function () {
                    recordCompleteFile = (this.dataSource.page() - 1) * this.dataSource.pageSize();
                },
                noRecords: true,
                messages: {
                    noRecords: gettextCatalog.getString("Không có kết quả hiển thị")
                },
                pageable: {
                    refresh: false,
                    pageSizes: [5, 10, 15, 20, 25],
                    pageSize: 5,
                    messages: {
                        display: "{0}-{1} của {2} kết quả",
                        itemsPerPage: "kết quả/trang",
                        empty: "Không có kết quả hiển thị"
                    }
                },
                pageSize: 5,
                columns: [
                    {
                        title: "TT",
                        field: "stt",
                        template: function () {
                            return ++recordCompleteFile;
                        },
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center;"
                        },
                    }, {
                        title: "Tên file",
                        field: 'name',
                        width: "50%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left;"
                        },
                        template: function (dataItem) {
                            return "<a href='' ng-click='caller.downloadFile(dataItem)'>" + dataItem.name + "</a>";
                        }
                    }, {
                        title: "Người upload",
                        field: 'createdUserName',
                        width: "20%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left;"
                        },
                    }, {
                        title: "Ngày upload",
                        field: 'createdDate',
                        width: "20%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left;"
                        },
                    }]
            });
        }

        function fillDataTableWorkAssign(data) {
            recordWaKP = 0
            var dataSource = new kendo.data.DataSource({
                pageSize: 5,
                data: data,
                autoSync: false,
                schema: {
                    total: function (response) {
                        return data.length;
                    },
                    model: {
                        fields: {
                            stt: {editable: false},
                            name: {editable: false},
                            actions: {editable: false},
                        }
                    }
                }
            });

            vm.workAssignOvercomeGridOptions = kendoConfig.getGridOptions({
                change: function () {
                    var dataItem = this.dataItem(this.select());
                    for (let i = 0; i < vm.listWorkAssignOvercome.length; i++) {
                        if (vm.listWorkAssignOvercome[i].description === dataItem.description) {
                            vm.workAssignOvercome = vm.listWorkAssignOvercome[i];
                            break;
                        }
                    }
                    fillDataTableWorkAssignDetail(vm.workAssignOvercome.listWorkAssignOvercomeDetail);
                    var gridDetails = $("#workAssignDetailOvercomeGrid").data("kendoGrid");
                    if (gridDetails) {
                        gridDetails.dataSource.data(vm.workAssignOvercome.listWorkAssignOvercomeDetail);
                        gridDetails.refresh();
                    }
                },

                dataBound: function (e) {
                    var tr = $("#workAssignOvercomeGrid").data("kendoGrid").select("tr:eq(1)");
                },
                autoBind: true,
                resizable: true,
                selectable: true,
                columnMenu: false,
                dataSource: dataSource,
                scrollable: false,
                dataBinding: function () {
                    recordWaKP = (this.dataSource.page() - 1) * this.dataSource.pageSize();
                },
                noRecords: true,
                pageSize: 5,
                messages: {
                    noRecords: gettextCatalog.getString("Không có kết quả hiển thị")
                },
                pageable: {
                    refresh: false,
                    pageSizes: [5, 10, 15, 20, 25],
                    pageSize: 5,
                    messages: {
                        display: "{0}-{1} của {2} kết quả",
                        itemsPerPage: "kết quả/trang",
                        empty: "Không có kết quả hiển thị"
                    }
                },
                toolbar: '<div class=" pull-left ">' +
                    '<button type="button" class="btn btn-qlk padding-search-right addQLK ng-scope" style="width: 120px" ng-click="caller.openAddWoOvercome()" translate>Thêm mới' +
                    '</button>' +
                    '</div>',
                columns: [
                    {
                        title: "TT",
                        field: "stt",
                        template: function () {
                            return ++recordWaKP;
                        },
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center;"
                        },
                    }, {
                        title: "Ngày bắt đầu",
                        field: 'startDate',
                        width: "20%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left;"
                        },
                    }, {
                        title: "Ngày kết thúc",
                        field: 'closeDate',
                        width: "20%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left;"
                        },
                    }, {
                        title: "Nội dung công việc",
                        field: 'description',
                        width: "40%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left;"
                        },
                    }, {
                        title: "Xóa",
                        field: "actions",
                        template: dataItem =>
                            '<div class="text-center">' +
                            '<button style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Xóa" translate ' +
                            'ng-click="vm.removeItem(dataItem,\'workAssign\')" > <i style="color:steelblue;" class="fa fa-trash ng-scope" aria-hidden="true"></i></button>' +
                            '</div>',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center;"
                        },
                    }]
            });
        }

        // grid detail
        function fillDataTableWorkAssignDetail(data) {
            recordWadKP = 0;
            var dataSource = new kendo.data.DataSource({
                pageSize: 5,
                data: data,
                autoSync: false,
            });
            vm.workAssignDetailOvercomeGridOptions = kendoConfig.getGridOptions({
                autobind: false,
                sortable: true,
                scrollable: false,
                columnMenu: false,
                dataSource: dataSource,
                dataBinding: function () {
                    recordWadKP = (this.dataSource.page() - 1) * this.dataSource.pageSize();
                },
                noRecords: true,
                messages: {
                    noRecords: gettextCatalog.getString("Không có kết quả hiển thị")
                },
                pageable: {
                    refresh: false,
                    pageSizes: [5, 10, 15, 20, 25],
                    pageSize: 5,
                    messages: {
                        display: "{0}-{1} của {2} kết quả",
                        itemsPerPage: "kết quả/trang",
                        empty: "Không có kết quả hiển thị"
                    }
                },
                pageSize: 5,
                toolbar: '<div class=" pull-left ">' +
                    '<button type="button" class="btn btn-qlk padding-search-right addQLK ng-scope" style="width: 120px" ng-click="caller.openAddWoDetailOvercome()" translate>Thêm mới' +
                    '</button>' +
                    '</div>',
                columns: [
                    {
                        title: "TT",
                        field: "stt",
                        template: function () {
                            return ++recordWadKP;
                        },
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center;"
                        },
                    }, {
                        title: "Nội dung công việc con",
                        field: 'workName',
                        width: "40%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left;"
                        },
                    }, {
                        title: "Hạn hoàn thành",
                        field: 'deadline',
                        width: "20%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left;"
                        },
                    }, {
                        title: "Người thực hiện",
                        field: 'performerName',
                        width: "20%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left;"
                        },
                    }, {
                        title: "TT",
                        field: "stt",
                        template: dataItem =>
                            '<div class="text-center">' +
                            '<button style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Xóa" translate ' +
                            'ng-click="vm.removeItem(dataItem,\'workAssignDetail\')" > <i style="color:steelblue;" class="fa fa-trash ng-scope" aria-hidden="true"></i></button>' +
                            '</div>',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center;"
                        },
                    }]
            });
        }

        var modalAddOvercome = null;
        vm.openAddWoOvercome = function () {
            vm.workAssignOvercomeInsertForm = {};
            var templateUrl = 'ktnb/waDvManage/addWoOvercomePopup.html';
            var title = "Thêm mới WO khắc phục";
            modalAddOvercome = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "30%", null, null);
        }

        vm.openAddWoDetailOvercome = function () {
            vm.workAssignOvercomeInsertForm = {};
            var templateUrl = 'ktnb/waDvManage/addWoDetailOvercomePopup.html';
            var title = "Thêm mới công việc khắc phục";
            modalAddOvercome = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "30%", null, null);
        }

        vm.cancelPopup = function () {
            modalAddOvercome.dismiss();
        }

        vm.saveItem = function () {
            if (vm.workAssignOvercomeInsertForm.startDate == null || vm.workAssignOvercomeInsertForm.startDate == '') {
                toastr.error("Ngày bắt đầu không được để trống");
                return;
            }
            if (vm.workAssignOvercomeInsertForm.closeDate == null || vm.workAssignOvercomeInsertForm.closeDate == '') {
                toastr.error("Ngày kết thúc không được để trống");
                return;
            }
            if (vm.workAssignOvercomeInsertForm.description == null || vm.workAssignOvercomeInsertForm.description == '') {
                toastr.error("Nội dung Wo không được để trống");
                return;
            }
            for (let i = 0; i < vm.listWorkAssignOvercome.length; i++) {
                if (vm.listWorkAssignOvercome[i].description === vm.workAssignOvercomeInsertForm.description) {
                    toastr.error("Nội dung Wo không được trùng nhau");
                    return;
                }
            }
            vm.workAssignOvercomeInsertForm.listWorkAssignOvercomeDetail = [];
            vm.listWorkAssignOvercome.push(vm.workAssignOvercomeInsertForm);
            var gridDetails = $("#workAssignOvercomeGrid").data("kendoGrid");
            if (gridDetails) {
                gridDetails.dataSource.data(vm.listWorkAssignOvercome);
                gridDetails.refresh();
            }
            modalAddOvercome.dismiss()
        }

        var index = 0;
        vm.saveItemDetail = function () {
            if (vm.workAssignOvercomeInsertForm.deadline == null || vm.workAssignOvercomeInsertForm.deadline == '') {
                toastr.error("Hạn hoàn thành không được để trống");
                return;
            }
            if (vm.workAssignOvercomeInsertForm.performerId == null || vm.workAssignOvercomeInsertForm.performerId == '') {
                toastr.error("Người thực hiện không được để trống");
                return;
            }
            if (vm.workAssignOvercomeInsertForm.workName == null || vm.workAssignOvercomeInsertForm.workName == '') {
                toastr.error("Nội dung công việc không được để trống");
                return;
            }
            for (let i = 0; i < vm.listWorkAssignOvercome.length; i++) {
                if (vm.workAssignOvercome.description === vm.listWorkAssignOvercome[i].description) {
                    if (vm.listWorkAssignOvercome[i].listWorkAssignOvercomeDetail == null) {
                        vm.listWorkAssignOvercome[i].listWorkAssignOvercomeDetail = [];
                    }
                    for (let j = 0; j < vm.listWorkAssignOvercome[i].listWorkAssignOvercomeDetail.length; j++) {
                        if (vm.listWorkAssignOvercome[i].listWorkAssignOvercomeDetail[j].workName === vm.workAssignOvercomeInsertForm.workName) {
                            toastr.error("Nội dung công việc không được trùng nhau");
                            return;
                        }
                    }
                    vm.listWorkAssignOvercome[i].listWorkAssignOvercomeDetail.push(vm.workAssignOvercomeInsertForm);
                    index = i;
                }
            }
            var gridDetails = $("#workAssignDetailOvercomeGrid").data("kendoGrid");
            if (gridDetails) {
                gridDetails.dataSource.data(vm.listWorkAssignOvercome[index].listWorkAssignOvercomeDetail);
                gridDetails.refresh();
            }
            modalAddOvercome.dismiss()
        }

        vm.removeItem = function (dataItem, type) {
            if (type === 'workAssign') {
                for (let i = 0; i < vm.listWorkAssignOvercome.length; i++) {
                    if (vm.listWorkAssignOvercome[i].description === dataItem.description) {
                        vm.listWorkAssignOvercome.splice(i, 1);
                        break;
                    }
                }
                var gridDetails = $("#workAssignDetailOvercomeGrid").data("kendoGrid");
                if (gridDetails) {
                    gridDetails.dataSource.data([]);
                    gridDetails.refresh();
                }
            } else if (type === 'workAssignDetail') {
                for (let i = 0; i < vm.workAssignOvercome.listWorkAssignOvercomeDetail.length; i++) {
                    if (vm.workAssignOvercome.listWorkAssignOvercomeDetail[i].workName === dataItem.workName) {
                        vm.workAssignOvercome.listWorkAssignOvercomeDetail.splice(i, 1);
                        break;
                    }
                }
                for (let i = 0; i < vm.listWorkAssignOvercome.length; i++) {
                    if (vm.listWorkAssignOvercome[i].name === vm.workAssignOvercome.name) {
                        vm.listWorkAssignOvercome[i].listWorkAssignOvercomeDetail = vm.workAssignOvercome.listWorkAssignOvercomeDetail;
                        break;
                    }
                }
                var gridDetails2 = $("#workAssignDetailOvercomeGrid").data("kendoGrid");
                if (gridDetails2) {
                    gridDetails2.dataSource.data(vm.listWorkAssignOvercome.listWorkAssignOvercomeDetail);
                    gridDetails2.refresh();
                }
            }
        }

        vm.isSelectPerformerId = false;
        vm.performerIdOptions = {
            clearButton: false,
            dataTextField: "fullName", placeholder: CommonService.translate("Nhập tên/mã người thực hiện"),
            dataValueField: "sysUserId",
            open: function (e) {
                vm.isSelectPerformerId = false;
            },
            select: function (e) {
                vm.isSelectPerformerId = true;
                var dataItem = this.dataItem(e.item.index());
                vm.workAssignOvercomeInsertForm.performerId = dataItem.sysUserId;
                vm.workAssignOvercomeInsertForm.performerName = dataItem.fullName;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectPerformerId) {
                        vm.workAssignOvercomeInsertForm.performerId = null;
                        vm.workAssignOvercomeInsertForm.performerName = null;
                    }
                }, 100);
            },
            pageSize: 10,
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        vm.isSelectPerformerId = false;
                        return Restangular.all("commonRsService/getSysUserForAutoComplete").post(
                            {
                                keySearch: vm.workAssignOvercomeInsertForm.performerName,
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

        vm.saveCreateWo = function () {
            confirm("Bạn đã chắc chắn tạo đủ WO khắc phục?" + '<h5 style="color: red;font-size: 12px">Sau khi bấm ghi lại ' +
                'bạn sẽ không thể tạo thêm WO khắc phục từ Wo gốc</h5>', function () {
                kendo.ui.progress($(".k-window"), true);
                vm.insertForm.listWorkAssignOvercome = vm.listWorkAssignOvercome;
                Restangular.all("workAssignRsService/saveOvercomeWo").post(vm.insertForm).then(function (res) {
                    if (res && res.error) {
                        toastr.error(res.error);
                        kendo.ui.progress($(".k-window"), false);
                    } else {
                        vm.listWorkAssignOvercome = [];
                        vm.cancel();
                        toastr.success("Ghi lại thành công");
                        vm.doSearch();
                        kendo.ui.progress($(".k-window"), false);
                    }
                }, function (err) {
                    toastr.error("Có lỗi xảy ra.");
                    kendo.ui.progress($(".k-window"), false);
                });
            });
        }

        vm.openAdd = function () {
            vm.insertForm = {};
            var templateUrl = 'ktnb/waDvManage/createWoType2Popup.html';
            var title = CommonService.translate("Thêm mới Wo kết luận thanh kiểm tra");
            modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "70%", null, null);
            vm.dataFile = [];
            vm.listWADetail = [];
            fillFileTable([]);
            fillDataWorkAssignDetail2([]);
        }

        var recordWAD2 = 0;
        vm.isEdit = true;

        function fillDataWorkAssignDetail2(data) {
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
                    recordWAD2 = (this.dataSource.page() - 1) * this.dataSource.pageSize();
                },
                toolbar: [
                    {
                        name: "actions",
                        template: '<div class=" pull-left " ng-if="!caller.checkViewDetail" ng-hide="caller.typeCreate === \'extend\'" >' +
                            '<button class="btn btn-qlk padding-search-right addQLK ng-scope"' +
                            'ng-click="caller.listWorkAssignDetailGrid.addRow()" uib-tooltip="Thêm công việc" style="width: 200px" translate>Thêm công việc</button>' + //ng-click="caller.addWorkAssignDetail()"
                            // 'ng-click="caller.addRow()" uib-tooltip="Thêm công việc" style="width: 200px" translate>Thêm công việc</button>' + //ng-click="caller.addWorkAssignDetail()"
                            '</div>'
                    }
                ],
                // dataSource: dataItem,
                dataSource: {
                    data: data,
                    page: 1,
                    pageSize: 5,
                    schema: {
                        model: {
                            fields: {
                                stt: {editable: false},
                                workName: {editable: true},
                                performerName: {editable: true},
                                deadline: {editable: false},
                                acctions: {editable: false},
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
                columns: [
                    {
                        title: CommonService.translate("STT"),
                        field: "stt",
                        template: function () {
                            ++recordWAD2;
                            dataItem.stt = recordWAD2;
                            return recordWAD2;
                        },
                        editable: false,
                        width: "50px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;"},
                        type: 'text'
                    }, {
                        title: CommonService.translate("Tên công việc"),
                        field: 'workName',
                        width: "200px",
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal;"
                        },
                        type: 'text'
                    },
                    {
                        title: CommonService.translate("Người thực hiện"),
                        field: "performerName",
                        editor: mainStaffAutoCompleteEditor,
                        width: "130px",
                        type: "text",
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal;"
                        },
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
            });
        }

        vm.save = function () {
            if (vm.insertForm.startDate == null || vm.insertForm.startDate == '') {
                toastr.error("Ngày bắt đầu không được để trống.");
                return;
            }
            if (vm.insertForm.closeDate == null || vm.insertForm.closeDate == '') {
                toastr.error("Ngày kết thúc không được để trống.");
                return;
            }
            if (vm.insertForm.description == null || vm.insertForm.description == '') {
                toastr.error("Nội dung công việc không được để trống.");
                return;
            }
            vm.insertForm.listAttachDocument = $("#listAttachDocumentGrid").data("kendoGrid").dataSource._data;
            vm.insertForm.listWorkAssignDetail = $("#listWorkAssignDetailGrid").data("kendoGrid").dataSource._data;
            Restangular.all("workAssignRsService/saveType2Wo").post(vm.insertForm).then(function () {
                toastr.success(CommonService.translate("Thêm mới bản ghi thành công"));
                vm.cancel();
                vm.doSearch();
                kendo.ui.progress(vm.documentBody, false);
            }, function (err) {
                toastr.error(CommonService.translate("Có lỗi xảy ra"));
                kendo.ui.progress(vm.documentBody, false);
            });
        }

        vm.approveStatus = function (dataItem) {
            confirm(CommonService.translate("Bạn có chắc chắn DUYỆT GIAO VIỆC mã WO") + " " + dataItem.code + " " + CommonService.translate("không?"), function () {
                vm.insertForm = angular.copy(dataItem);
                vm.insertForm.status = 1;
                // vm.insertForm.statusDvApprove = 0;
                Restangular.all("workAssignRsService/approveStatusDv").post(vm.insertForm).then(function (data) {
                    toastr.success(CommonService.translate("Duyệt giao việc thành công"));
                    vm.doSearch();
                    vm.cancel();
                }, function () {
                    toastr.error(CommonService.translate("Có lỗi xảy ra"));
                });
            });
        }

        vm.cancelApproveStatus = function (dataItem) {
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
            vm.insertForm.status = 0;
            vm.insertForm.cancelDvAssignDescription = vm.insertForm.rejectDescription;
            Restangular.all("workAssignRsService/approveStatusDv").post(vm.insertForm).then(function (data) {
                toastr.success(CommonService.translate("Từ chối giao việc thành công"));
                vm.doSearch();
                vm.cancel();
            }, function () {
                toastr.error(CommonService.translate("Có lỗi xảy ra"));
            });
        }

        vm.showAdvancedSearch = false;
        vm.advancedSearch = function () {
            vm.showAdvancedSearch = !vm.showAdvancedSearch;
        }

        vm.openEditAssignWorkNew = function (dataItem) {
            vm.assignForm2 = {};
            vm.typeCreate = 'openEditAssignWorkNew';
            dataItem.typeFile = "WOKTNB";
            waDvManageService.getDetail(dataItem).then(function (data) {
                vm.assignForm = angular.copy(data);
                var templateUrl = 'ktnb/waDvManage/assignWorkPopup.html';
                var title = CommonService.translate("Chỉnh sửa giao việc cho nhân viên");
                modalAssign = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "70%", null, null);
                vm.dataFile = vm.assignForm.listAttachDocument;
                vm.listWADetail = vm.assignForm.listWorkAssignDetail;
                fillFileTable(vm.dataFile);
                fillDataWorkAssignDetail(vm.listWADetail);
            }, function () {
                toastr.error(CommonService.translate("Có lỗi xảy ra"));
            });
        }

        vm.remove = function (dataItem) {
            confirm(CommonService.translate("Bạn có chắc chắn muốn xóa bản ghi này?"), function () {
                vm.insertForm = angular.copy(dataItem);
                kendo.ui.progress(vm.documentBody, true);
                Restangular.all("workAssignRsService/remove").post(vm.insertForm).then(function () {
                    toastr.success(CommonService.translate("Xóa bản ghi thành công"));
                    // vm.cancel();
                    vm.doSearch();
                    kendo.ui.progress(vm.documentBody, false);
                }, function (err) {
                    toastr.error(CommonService.translate("Có lỗi xảy ra"));
                    kendo.ui.progress(vm.documentBody, false);
                });
            });
        }

        vm.verifyWoDv = function (dataItem) {
            confirm(CommonService.translate("Bạn có chắc chắn muốn duyệt hoàn thành?"), function () {
                vm.rejectForm = angular.copy(dataItem);
                kendo.ui.progress(vm.documentBody, true);
                Restangular.all("workAssignRsService/verifyWoDv").post(vm.rejectForm).then(function () {
                    toastr.success(CommonService.translate("Xóa bản ghi thành công"));
                    // vm.cancel();
                    vm.doSearch();
                    kendo.ui.progress(vm.documentBody, false);
                }, function (err) {
                    toastr.error(CommonService.translate("Có lỗi xảy ra"));
                    kendo.ui.progress(vm.documentBody, false);
                });
            });
        }

        vm.verifyWoDvReject = function (dataItem) {
            vm.rejectForm = angular.copy(dataItem);
            var templateUrl = 'ktnb/workAssign/rejectPopup.html';
            var title = CommonService.translate("Từ chối duyệt hoàn thành");
            modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "30%", "20%", null, null);
        }

        vm.rejectWoDv = function () {
            vm.rejectForm.rejectWoDvDescription = vm.rejectForm.cancelDvDescription;
            if (vm.rejectForm.rejectWoDvDescription == null || vm.rejectForm.rejectWoDvDescription == "") {
                toastr.error("Lý do từ chối duyệt không được để trống");
                return;
            }
            confirm(CommonService.translate("Bạn có chắc chắn muốn từ chối duyệt hoàn thành?"), function () {
                kendo.ui.progress(vm.documentBody, true);
                Restangular.all("workAssignRsService/rejectWoDv").post(vm.rejectForm).then(function () {
                    toastr.success(CommonService.translate("Từ chối bản ghi thành công"));
                    vm.cancel();
                    vm.doSearch();
                    kendo.ui.progress(vm.documentBody, false);
                }, function (err) {
                    toastr.error(CommonService.translate("Có lỗi xảy ra"));
                    kendo.ui.progress(vm.documentBody, false);
                });
            });
        }

        vm.openTimeExtendPopup = function (dataItem) {
            vm.isEdit = false;
            vm.isCreateForm = false;
            vm.checkViewDetail = false;
            vm.typeCreate = 'extend';
            dataItem.typeFile = "WOKTNB";
            waDvManageService.getDetail(dataItem).then(function (data) {
                vm.insertForm = angular.copy(data);
                var templateUrl = 'ktnb/waDvManage/assignWorkPopupEx.html';
                var title = CommonService.translate("Màn hình gia hạn công việc");
                modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "90%", "50%", null, null);
                vm.listWADetail = vm.insertForm.listWorkAssignDetail;
                fillDataWorkAssignDetail(vm.listWADetail);
            }, function () {
                toastr.error(CommonService.translate("Có lỗi xảy ra"));
            });
        }

        vm.openExtendTimeHistory = function () {
            var templateUrl = 'ktnb/workAssign/ExtendTimeHistory.html';
            var title = CommonService.translate("Lịch sử gia hạn WO");
            modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "50%", null, null);
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
            Restangular.all("workAssignRsService/saveExtend").post(vm.insertForm).then(function () {
                toastr.success(CommonService.translate("Gia hạn thành công"));
                vm.cancel();
                vm.doSearch();
                $("#extendButton").disabled = false;
            }, function (err) {
                toastr.error(CommonService.translate("Có lỗi xảy ra"));
                $("#extendButton").disabled = false;
            });
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
