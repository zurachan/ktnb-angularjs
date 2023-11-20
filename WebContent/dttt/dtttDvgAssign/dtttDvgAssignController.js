(function () {
    'use strict';
    var controllerId = 'dtttDvgAssignController';

    angular.module('MetronicApp').controller(controllerId, dtttDvgAssignController);

    function dtttDvgAssignController($scope, $templateCache, $rootScope, $timeout, gettextCatalog,
                                  kendoConfig, $kWindow, $q, dtttDvgAssignService,
                                  CommonService, htmlCommonService, PopupConst, Restangular, RestEndpoint, Constant) {
        // start controller
        var vm = this;

        vm.documentBody = $(".tab-content");
        vm.modalBody = ".k-widget .k-window";
        vm.searchForm = {};
        vm.insertForm = {};
        vm.rootSysGroup = {};
        vm.isCreateForm = true;
        vm.checkViewDetail = false;
        var modalAdd;
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
                field: "statusDvgVerify",
                data: {
                    '0': CommonService.translate("Chờ duyệt"),
                    '1': CommonService.translate("Đã duyệt"),
                    '2': CommonService.translate("Từ chối")
                }
            },
            {
                field: "levelAction",
                data: {
                    '1': CommonService.translate("Giao việc trong đơn vị"),
                    '2': CommonService.translate("Giao việc ngoài đơn vị")
                }
            }, {
                field: "statusDvnApprove",
                data: {
                    '0': CommonService.translate("Chưa nhận việc"),
                    '1': CommonService.translate("Đã nhận việc"),
                    '2': CommonService.translate("Từ chối nhận việc"),
                }
            }
        ];

        vm.assessArray = [
            {code: "1", name: CommonService.translate("Không đạt")},
            {code: "2", name: CommonService.translate("Khá")},
            {code: "3", name: CommonService.translate("Tốt")},
            {code: "4", name: CommonService.translate("Rất tốt")},
        ];

        vm.progressArray = [
            {code: "1", name: CommonService.translate("Không đạt")},
            {code: "2", name: CommonService.translate("Đạt")},

        ];

        vm.attitudeArray = [
            {code: "1", name: CommonService.translate("Không đạt")},
            {code: "2", name: CommonService.translate("Đạt")},

        ];

        vm.levelActionArray = [
            {id: 1, name: CommonService.translate("Giao việc trong đơn vị")},
            {id: 2, name: CommonService.translate("Giao việc ngoài đơn vị")}
        ];

        vm.statusNvApproveArray = [
            {id: 0, name: "Chưa nhận việc"},
            {id: 1, name: "Đã nhận việc"},
            {id: 2, name: "Từ chối việc"}
        ];
        vm.statusDvgVerifyArray = [
            {id: 0, name: "Chưa xác nhận"},
            {id: 1, name: "Đã xác nhận"},
            {id: 2, name: "Từ chối"}
        ];
        vm.statusDvnApproveArray = [
            {id: 0, name: "Chưa nhận việc"},
            {id: 1, name: "Đã nhận việc"},
            {id: 2, name: "Từ chối nhận việc"}
        ];

        vm.statusArray = [
            {id: 0, name: "Hết hiệu lực"},
            {id: 1, name: "Hiệu lực"},
            {id: 2, name: "Dự thảo"}
        ];
        vm.statusDoWorkArray = [
            {id: 1, name: "Trong hạn"},
            {id: 2, name: "Quá hạn"}
        ];
        initForm();

        function initForm() {
            vm.String = CommonService.translate("Quản lý giao việc ĐTTT") + " > " +
                    CommonService.translate("Quản lý giao việc của đơn vị giao việc");

            fillDatadtttAssign([]);
            fillFileTable([]);
            checkPermissionDvgApprove();
            checkPermissionDvgComplete();
        }

        function checkPermissionDvgApprove() {
            vm.isRoleApprove = false;
            let obj = {};
            obj.adResourceCode = "WO_DVG";
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

        function checkPermissionDvgComplete() {
            vm.isRoleComplete = false;
            let obj = {};
            obj.adResourceCode = "WO_DVG";
            obj.operationCode = "APPROVED";
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

        vm.doSearch = function () {
            var grid = $("#dtttAssignGrid").data("kendoGrid");
            if (grid) {
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        }

        var recorddtttAssign = 0;
        vm.countdtttAssign = 0;

        function fillDatadtttAssign(data) {
            vm.dtttAssignGridOptions = kendoConfig.getGridOptions({
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

                            '<div class="btn-group pull-right margin_top_button margin_right10">' +
                            '<i data-toggle="dropdown" class="tooltip1" aria-expanded="false"><span class="tooltipArrow"></span><span class="tooltiptext" translate>Cài đặt</span><i class="fa fa-cog" aria-hidden="true"></i></i>' +
                            '<i class="tooltip1 action-button excelQLK" ng-click="vm.exportExcelGrid()"  aria-expanded="false"><span class="tooltipArrow"></span><span class="tooltiptext" translate>Xuất Excel</span></i>' +
                            '<div class="dropdown-menu hold-on-click dropdown-checkboxes" role="menu">' +
                            '<label ng-repeat="column in vm.dtttAssignGrid.columns.slice(1,vm.dtttAssignGrid.columns.length)| filter: vm.gridColumnShowHideFilter">' +
                            '<input type="checkbox" checked="column.hidden" ng-click="vm.showHideColumn(column)"> {{column.title}}' +
                            '</label>' +
                            '</div></div>'
                    }
                ],
                dataBinding: function () {
                    recorddtttAssign = (this.dataSource.page() - 1) * this.dataSource.pageSize();
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
                            vm.countdtttAssign = response.total;
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
                            url: Constant.BASE_SERVICE_URL + "dtttAssignRsService/doSearchViewDvg",
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
                columns: [
                    {
                        title: CommonService.translate("TT"),
                        field: "stt",
                        template: function () {
                            return ++recorddtttAssign;
                        },
                        width: "40px",
                        headerAttributes: {style: "text-align:center", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    }, {
                        title: CommonService.translate("Mã WO"),
                        field: 'code',
                        width: "120px",
                        template: '<a href="javascript:void(0);" title="#=code#" ng-click=vm.showDetail(dataItem)>#=code#</a>',
                        headerAttributes: {style: "text-align:center", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    }, {
                        title: CommonService.translate("Cấp thực hiện"),
                        field: 'levelAction',
                        width: "150px",
                        template: function (dataItem) {
                            if (dataItem.levelAction == 1) {
                                return CommonService.translate("Giao việc trong đơn vị");
                            } else if (dataItem.levelAction) {
                                return CommonService.translate("Giao việc ngoài đơn vị");
                            } else {
                                return "";
                            }
                        },
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Đơn vị nhận việc"),
                        field: 'sysGroupDvnName',
                        width: "120px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },  {
                        title: CommonService.translate("Đơn vị giao việc"),
                        field: 'sysGroupDvgName',
                        width: "120px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Thời gian bắt đầu"),
                        field: 'startDate',
                        width: "100px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Thời gian kết thúc"),
                        field: 'closeDate',
                        width: "100px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Trạng thái đơn vị nhận xác nhận"),
                        field: 'statusDvnApprove',
                        width: "100px",
                        template: function (dataItem) {
                            if (dataItem.statusDvnApprove == 0) {
                                return CommonService.translate("Chưa nhận việc");
                            } else if (dataItem.statusDvnApprove == 1) {
                                return CommonService.translate("Đã nhận việc");
                            } else if (dataItem.statusDvnApprove == 2) {
                                return CommonService.translate("Từ chối nhận việc");
                            } else {
                                return "";
                            }
                        },
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Ngày tạo"),
                        field: 'createDate',
                        width: "100px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Tình trạng"),
                        field: 'statusDoWork',
                        width: "80px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Trạng thái đơn vị giao đóng việc"),
                        field: 'statusDvgVerify',
                        width: "100px",
                        template: function (dataItem) {
                            if (dataItem.statusDvgVerify == 0) {
                                return CommonService.translate("Chờ duyệt");
                            } else if (dataItem.statusDvgVerify == 1) {
                                return CommonService.translate("Đã duyệt");
                            } else if (dataItem.statusDvgVerify == 2) {
                                return CommonService.translate("Từ chối");
                            } else {
                                return "";
                            }
                        },
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Trạng thái WO"),
                        field: 'status',
                        width: "100px",
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
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Thao tác"),
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                        template: dataItem =>
                            '<div class="text-center">' +
                            '<button style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Copy" translate ' +
                            'ng-click="vm.copy(dataItem)" ><i class="fa fa-copy ng-scope" aria-hidden="true" translate></i></button>'
                            +
                            '<button style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Sửa" translate ' +
                            'ng-click="vm.openEdit(dataItem)" ng-if="dataItem.status == 2"><i class="fa fa-pencil ng-scope" aria-hidden="true" translate></i></button>'
                            +
                            '<button style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Xóa" translate ' +
                            'ng-click="vm.remove(dataItem)" ng-if="dataItem.status == 2"> <i style="color:steelblue;" class="fa fa-trash ng-scope" aria-hidden="true"></i></button>'
                            +
                            '<button ng-if="vm.isRoleApprove && dataItem.status == 2" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Duyệt giao việc" translate ' +
                            'ng-click="vm.approveStatus(dataItem)" > <i style="color:blueviolet;" class="fa fa-share ng-scope" aria-hidden="true"></i></button>'
                            +
                            '<button ng-if="vm.isRoleApprove && dataItem.status == 2 " style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Hủy duyệt giao việc" translate ' +
                            'ng-click="vm.cancelApproveStatus(dataItem)" > <i style="color:#2f3b49;" class="fa fa-undo ng-scope" aria-hidden="true"></i></button>'
                            +
                            '<button ng-if="vm.isRoleComplete && dataItem.statusDvgVerify == 0 && dataItem.statusAssignAllNv == 0 && dataItem.statusDvnVerifyAll == 0  && dataItem.status != 0" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Xác nhận đóng việc" translate ' +
                            'ng-click="vm.openAcceptDvgVerify(dataItem)" > <i style="color:green;" class="fa fa-check ng-scope" aria-hidden="true"></i></button>'
                            +
                            '<button ng-if="vm.isRoleComplete && dataItem.statusDvgVerify == 0 && dataItem.statusAssignAllNv == 0 && dataItem.statusDvnVerifyAll == 0  && dataItem.status != 0 " style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Từ chối đóng việc" translate ' +
                            'ng-click="vm.openRejectDvgVerify(dataItem)"> <i style="color:firebrick;" class="fa fa-times ng-scope" aria-hidden="true"></i></button>'
                            +
                            '</div>',

                        width: "240px",
                        field: "stt"
                    }
                ]
            });
        }

        vm.showHideColumn = function (column) {
            if (angular.isUndefined(column.hidden)) {
                vm.dtttAssignGrid.hideColumn(column);
            } else if (column.hidden) {
                vm.dtttAssignGrid.showColumn(column);
            } else {
                vm.dtttAssignGrid.hideColumn(column);
            }
        };

        vm.openAdd = function () {
            var loginName = $rootScope.casUser.userName;
            CommonService.getCnktOfUser(loginName).then(function (res) {
                if(res && res.data){
                    var cnkt = res.data;
                    vm.isCreateForm = true;
                    vm.checkViewDetail = false;
                    vm.insertForm = {};
                    vm.insertForm.sysGroupDvgId = cnkt.sysGroupId;
                    vm.insertForm.sysGroupDvgName = cnkt.name;
                    var templateUrl = 'dttt/dtttDvgAssign/addPopup.html';
                    var title = CommonService.translate("Thêm mới công việc");
                    modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "70%", null, null);
                    vm.dataFile = [];
                    vm.listWADetail = [];
                    fillFileTable([]);
                    fillDataDtttAssignDetail([]);
                }
            })


        }

        vm.openEdit = function (dataItem) {
            vm.isCreateForm = false;
            vm.checkViewDetail = false;
            dataItem.typeFile = "WODTTT";
            dtttDvgAssignService.getDetail(dataItem).then(function (data) {
                vm.insertForm = angular.copy(data);
                var templateUrl = 'dttt/dtttDvgAssign/addPopup.html';
                var title = CommonService.translate("Cập nhật công việc");
                modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "50%", null, null);
                vm.dataFile = vm.insertForm.listAttachDocument;
                vm.listWADetail = vm.insertForm.listDtttAssignDetail;
                fillFileTable(vm.dataFile);
                fillDataDtttAssignDetail(vm.listWADetail);
            }, function () {
                toastr.error(CommonService.translate("Có lỗi xảy ra"));
            });
        }

        vm.copy = function (dataItem) {
            vm.isCreateForm = true;
            vm.checkViewDetail = false;
            dataItem.typeFile = "WODTTT";
            vm.insertForm = {};
            dtttDvgAssignService.getDetailForCopy(dataItem).then(function (data) {
                // vm.insertForm = angular.copy(data);
                vm.insertForm.startDate = data.startDate;
                vm.insertForm.closeDate = data.closeDate;
                vm.insertForm.levelAction = data.levelAction;
                vm.insertForm.createBy = data.createBy;
                vm.insertForm.description = data.description;
                vm.insertForm.sysGroupDvgId = data.sysGroupDvgId;
                vm.insertForm.sysGroupDvgName = data.sysGroupDvgName;
                vm.insertForm.sysGroupDvnId = data.sysGroupDvnId;
                vm.insertForm.sysGroupDvnName = data.sysGroupDvnName;
                var templateUrl = 'dttt/dtttDvgAssign/addPopup.html';
                var title = CommonService.translate("Tạo mới công việc");
                modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "70%", null, null);
                vm.dataFile = data.listAttachDocument;
                vm.listWADetail = data.listDtttAssignDetail;
                fillFileTable(vm.dataFile);
                fillDataDtttAssignDetail(vm.listWADetail);
            }, function () {
                toastr.error(CommonService.translate("Có lỗi xảy ra"));
            });
        }


        vm.remove = function (dataItem) {
            confirm(CommonService.translate("Bạn có chắc chắn muốn xóa bản ghi này?"), function () {
                vm.insertForm = angular.copy(dataItem);
                kendo.ui.progress(vm.documentBody, true);
                dtttDvgAssignService.remove(vm.insertForm).then(function () {
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

        vm.showDetail = function (dataItem) {
            vm.isCreateForm = false;
            vm.checkViewDetail = true;
            dataItem.typeFile = "WODTTT";
            dtttDvgAssignService.getDetail(dataItem).then(function (data) {
            //     CommonService.getAppParam({"parType": "ASSESS"}).then(
            //         function (resp) {
            //             if (resp.data) {
            //                 vm.assessArray = resp.data;
            //             }
                        vm.insertForm = angular.copy(data);
                        var templateUrl = 'dttt/dtttDvgAssign/detailPopup.html';
                        var title = CommonService.translate("Màn hình thông tin chi tiết");
                        modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "50%", null, null);
                        vm.dataFile = vm.insertForm.listAttachDocument;
                        vm.listWADetail = vm.insertForm.listDtttAssignDetail;
                        fillFileTable(vm.dataFile);
                        fillDataDtttAssignDetail(vm.listWADetail);
            //         },
            //         function (error) {
            //             toastr.error("Có lỗi xảy ra!");
            //         }
            //     )
            }, function () {
                toastr.error(CommonService.translate("Có lỗi xảy ra"));
            });
        }


        vm.save = function () {
            if (vm.insertForm.levelAction == null || vm.insertForm.levelAction == "") {
                toastr.error(CommonService.translate("Cấp thực hiện không được để trống"));
                return;
            }
            if (vm.insertForm.startDate == null) {
                toastr.error(CommonService.translate("Ngày bắt đầu không được để trống"));
                $("#insertDtttAssignStartDate").focus();
                return;
            }
            if (vm.insertForm.closeDate == null) {
                toastr.error(CommonService.translate("Ngày kết thúc không được để trống"));
                $("#insertDtttAssignEndDate").focus();
                return;
            }
            if (vm.insertForm.sysGroupDvgId == null || vm.insertForm.sysGroupDvgName == null || vm.insertForm.sysGroupDvgName == '') {
                toastr.error(CommonService.translate("Đơn vị giao việc không được để trống"));
                $("#insertDtttAssignSysGroupDvg").focus();
                return;
            }
            if (vm.insertForm.sysGroupDvnId == null || vm.insertForm.sysGroupDvnName == null || vm.insertForm.sysGroupDvnName == '') {
                toastr.error(CommonService.translate("Đơn vị nhận việc không được để trống"));
                $("#insertDtttAssignSysGroupDvn").focus();
                return;
            }
            if (vm.insertForm.description == null || vm.insertForm.description.trim() == '') {
                toastr.error(CommonService.translate("Nội dung không được để trống"));
                $("#insertDtttAssignDescription").focus();
                return;
            }
            var d1 = kendo.parseDate(vm.insertForm.startDate, "dd/MM/yyyy");
            var d2 = kendo.parseDate(vm.insertForm.closeDate, "dd/MM/yyyy");
            var curdate = new Date();
            curdate.setHours(0, 0, 0, 0);
            var sysDate = kendo.parseDate(curdate, "dd/MM/yyyy");
            if (d1 < sysDate) {
                toastr.error("Ngày bắt đầu phải lớn hơn ngày hiện tại");
                $("#insertdtttAssignStartDate").focus();
                return;
            }
            if (d2 < sysDate) {
                toastr.error("Ngày kết thúc phải lớn hơn ngày hiện tại");
                $("#insertdtttAssignEndDate").focus();
                return;
            }
            vm.insertForm.listAttachDocument = vm.dataFile;
            vm.insertForm.listDtttAssignDetail = vm.listWADetail;
            kendo.ui.progress($(vm.modalBody), true);
            if (vm.isCreateForm) {
                dtttDvgAssignService.save(vm.insertForm).then(function () {
                    toastr.success(CommonService.translate("Thêm mới bản ghi thành công"));
                    vm.cancel();
                    vm.doSearch();
                    kendo.ui.progress($(vm.modalBody), false);
                }, function (err) {
                    toastr.error(CommonService.translate("Có lỗi xảy ra"));
                    kendo.ui.progress($(vm.modalBody), false);
                });
            } else {
                vm.insertForm.status = 2;
                dtttDvgAssignService.update(vm.insertForm).then(function () {
                    toastr.success(CommonService.translate("Cập nhật bản ghi thành công"));
                    vm.cancel();
                    vm.doSearch();
                    kendo.ui.progress($(vm.modalBody), false);
                }, function (err) {
                    toastr.error(CommonService.translate("Có lỗi xảy ra"));
                    kendo.ui.progress($(vm.modalBody), false);
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

            dtttDvgAssignService.doSearch(obj).then(function (d) {
                kendo.ui.progress(vm.documentBody, false);
                var data = d.data;
                CommonService.exportFile(vm.dtttAssignGrid, data, vm.listRemove, vm.listConvert, CommonService.translate("Danh sách WO"));
            });
        }

        vm.managedtttAssignDetail = function (dataItem) {
            var obj = angular.copy(dataItem);
            dtttAssignDetailService.setData(obj);
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
        $rootScope.$on("callDoSearchdtttAssign", function () {
            vm.doSearch();
        });

        // autocomplete don vi thuc hien
        vm.isSelectSysGroupDvg = false;
        vm.sysGroupDvgOptions = {
            clearButton: false,
            dataTextField: "name", placeholder: CommonService.translate("Nhập tên đơn vị"),
            dataValueField: "name",
            open: function (e) {
                vm.isSelectSysGroupDvg = false;
            },
            select: function (e) {
                vm.isSelectSysGroupDvg = true;
                var dataItem = this.dataItem(e.item.index());
                vm.insertForm.sysGroupDvgId = dataItem.sysGroupId;
                vm.insertForm.sysGroupDvgCode = dataItem.code;
                vm.insertForm.sysGroupDvgName = dataItem.name;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSysGroupDvg) {
                        vm.insertForm.sysGroupDvgId = null;
                        vm.insertForm.sysGroupDvgCode = null;
                        vm.insertForm.sysGroupDvgName = null;
                    }
                }, 100);
            },
            close: function (e) {
                $timeout(function () {
                    if (vm.insertForm.sysGroupDvgId == null) {
                        vm.insertForm.sysGroupDvgCode = null;
                        vm.insertForm.sysGroupDvgName = null;
                    }
                }, 1000);

            },
            pageSize: 10,
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        vm.isSelectSysGroupDvg = false;
                        return Restangular.all("commonRsService/getSysGroupForAutoComplete").post(
                            {
                                keySearch: vm.insertForm.sysGroupDvgName,
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

        vm.isSelectSysGroupDvn = false;
        vm.sysGroupDvnOptions = {
            clearButton: false,
            dataTextField: "name", placeholder: CommonService.translate("Nhập tên đơn vị"),
            dataValueField: "name",
            open: function (e) {
                vm.isSelectSysGroupDvn = false;
            },
            select: function (e) {
                vm.isSelectSysGroupDvn = true;
                var dataItem = this.dataItem(e.item.index());
                vm.insertForm.sysGroupDvnId = dataItem.sysGroupId;
                vm.insertForm.sysGroupDvnCode = dataItem.code;
                vm.insertForm.sysGroupDvnName = dataItem.name;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSysGroupDvn) {
                        vm.insertForm.sysGroupDvnId = null;
                        vm.insertForm.sysGroupDvnCode = null;
                        vm.insertForm.sysGroupDvnName = null;
                    }
                }, 100);
            },
            close: function (e) {
                $timeout(function () {
                    if (vm.insertForm.sysGroupDvnId == null) {
                        vm.insertForm.sysGroupDvnCode = null;
                        vm.insertForm.sysGroupDvnName = null;
                    }
                }, 1000);

            },
            pageSize: 10,
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        vm.isSelectSysGroupDvn = false;
                        return Restangular.all("commonRsService/getSysGroupForAutoComplete").post(
                            {
                                keySearch: vm.insertForm.sysGroupDvnName,
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
            if (data == 'search_dvg') {
                vm.flagSysGroup = 1; //search don vi giao
            } else if (data == 'insert_dvg') {
                vm.flagSysGroup = 2; // insert don vi giao
            } else  if (data == 'search_dvn') {
                vm.flagSysGroup = 3; //search don vi giao
            } else if (data == 'insert_dvn') {
                vm.flagSysGroup = 4; // insert don vi giao
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
                vm.searchForm.sysGroupDvgId = dataItem.sysGroupId;
                vm.searchForm.sysGroupDvgCode = dataItem.code;
                vm.searchForm.sysGroupDvgName = dataItem.name;
            } else if (vm.flagSysGroup == 2) {
                vm.insertForm.sysGroupDvgId = dataItem.sysGroupId;
                vm.insertForm.sysGroupDvgCode = dataItem.code;
                vm.insertForm.sysGroupDvgName = dataItem.name;
            } else if (vm.flagSysGroup == 3) {
                vm.searchForm.sysGroupDvnId = dataItem.sysGroupId;
                vm.searchForm.sysGroupDvnCode = dataItem.code;
                vm.searchForm.sysGroupDvnName = dataItem.name;
            } else if (vm.flagSysGroup == 4) {
                vm.insertForm.sysGroupDvnId = dataItem.sysGroupId;
                vm.insertForm.sysGroupDvnCode = dataItem.code;
                vm.insertForm.sysGroupDvnName = dataItem.name;
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
        }
        // * end popup common

        $rootScope.$on("callDoSearchdtttAssign", function () {
            vm.doSearch();
        });

        vm.checkValidateStartDate = function () {
            var d1 = kendo.parseDate(vm.insertForm.startDate, "dd/MM/yyyy");
            var d2 = kendo.parseDate(vm.insertForm.closeDate, "dd/MM/yyyy");
            var curdate = new Date();
            curdate.setHours(0, 0, 0, 0);
            var sysDate = kendo.parseDate(curdate, "dd/MM/yyyy");
            if (d1 == null) {
                vm.insertForm.startDate = '';
                toastr.error("Ngày bắt đầu không hợp lệ");
                $("#insertdtttAssignStartDate").focus();
                return;
            }
            if (d2 != null && d1 > d2) {
                vm.insertForm.startDate = '';
                toastr.error("Ngày bắt đầu phải nhỏ hơn ngày kết thúc");
                $("#insertdtttAssignStartDate").focus();
                return;
            }
            if (d1 < sysDate + 1) {
                vm.insertForm.startDate = '';
                toastr.error("Ngày bắt đầu phải lớn hơn ngày hiện tại");
                $("#insertdtttAssignStartDate").focus();
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
                $("#insertdtttAssignEndDate").focus();
                return;
            }
            if (d1 != null && d1 > d2) {
                vm.insertForm.closeDate = '';
                toastr.error("Ngày bắt đầu phải nhỏ hơn ngày kết thúc");
                $("#insertdtttAssignEndDate").focus();
                return;
            }
            if (d2 < sysDate + 1) {
                vm.insertForm.closeDate = '';
                toastr.error("Ngày kết thúc phải lớn hơn ngày hiện tại");
                $("#insertdtttAssignEndDate").focus();
                return;
            }
        }

        // đính kèm file
        function fillFileTable() {
            var dataSource = new kendo.data.DataSource({
                data: vm.dataFile,
                pageSize: 5
            });
            vm.gridFileOptions = kendoConfig.getGridOptions({
                autoBind: true,
                scrollable: false,
                resizable: true,
                editable: false,
                dataSource: dataSource,
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
                        hidden: vm.checkViewDetail,
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
                && $("#files")[0].files[0].name.split('.').pop() != 'docx'  && $("#files")[0].files[0].name.split('.').pop() != 'xls'
                && $("#files")[0].files[0].name.split('.').pop() != 'xlsx' ) {
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

        function fillDataDtttAssignDetail(data) {
            var dataItem = {
                data: data,
                page: 1,
                pageSize: 5
            };
            vm.listDtttAssignDetailGridOptions = kendoConfig.getGridOptions({
                autoBind: true,
                scrollable: true,
                resizable: true,
                sortable: false,
                columnMenu: false,
                serverPaging: true,
                editable: false,
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
                        width: "50px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    }, {
                        title: CommonService.translate("Tên công việc"),
                        field: 'workName',
                        width: "80px",
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        attributes: {
                            style: "text-align:left;"
                        },
                    }, {
                        title: CommonService.translate("Nội dung chi tiết"),
                        field: "description",
                        width: "80px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Nhân viên thực hiện"),
                        field: "performerName",
                        width: "80px",
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        attributes: {
                            style: "text-align:center;"
                        }
                    },
                    // {
                    //     title: CommonService.translate("Trạng thái đơn vị nhận xác nhận"),
                    //     field: 'statusDvnApprove',
                    //     width: "100px",
                    //     template: function (dataItem) {
                    //         vm.statusDvnApproveArray.forEach(function (data) {
                    //             if (data.id == dataItem.statusDvnApprove) {
                    //                 dataItem.statusDvnApproveName = data.name;
                    //             }
                    //         });
                    //         return dataItem.statusDvnApproveName ? dataItem.statusDvnApproveName : '';
                    //     },
                    //     hidden: !vm.checkViewDetail,
                    //     headerAttributes: {
                    //         style: "text-align:center;"
                    //     },
                    //     attributes: {
                    //         style: "text-align:center;"
                    //     }
                    // },
                    // {
                    //     field: "statusNvApprove",
                    //     title: CommonService.translate("Trạng thái NV nhận việc"),
                    //     headerAttributes: {
                    //         style: "text-align:center;"
                    //     },
                    //     attributes: {
                    //         "class": "table-cell",
                    //         style: "text-align: left; "
                    //     },
                    //     hidden: !vm.checkViewDetail,
                    //     template: function (dataItem) {
                    //         vm.statusNvApproveArray.forEach(function (data) {
                    //             if (data.id == dataItem.statusNvApprove) {
                    //                 dataItem.statusNvApproveName = data.name;
                    //             }
                    //         });
                    //         return dataItem.statusNvApproveName ? dataItem.statusNvApproveName : '';
                    //     },
                    //     width: "80px"
                    //
                    // },
                    // {
                    //     title: CommonService.translate("Lý do từ chối"),
                    //     field: "cancelNvDescription",
                    //     width: "80px",
                    //     hidden: !vm.checkViewDetail,
                    //     headerAttributes: {
                    //         style: "text-align:center;"
                    //     },
                    //     attributes: {
                    //         style: "text-align:center;"
                    //     }
                    // },
                    {
                        title: CommonService.translate("Nội dung hoàn thành công việc"),
                        field: "commentComplete",
                        width: "80px",
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        attributes: {
                            style: "text-align:center;"
                        }
                    },
                    {
                        title: CommonService.translate("File hoàn thành"),
                        width: "120px",
                        // hidden: !vm.checkViewDetail,
                        template: function (dataItem) {
                            var result = '';
                            if (dataItem.listFileAttach && dataItem.listFileAttach.length > 0) {
                                for (let i = 0; i < dataItem.listFileAttach.length; i++) {
                                    result += '<a ng-click="caller.downloadFileByPath(\'' + dataItem.listFileAttach[i].filePath + '\')"' + '>' + dataItem.listFileAttach[i].name + '</a><br>';
                                }
                            }
                            return result;
                        },
                    }
                ]
            });
        }

        vm.addDetailForm = {};
        vm.listWADetail = [];
        var modalAdddtttAssignDetail = null;
        vm.adddtttAssignDetail = function () {
            vm.addDetailForm = {};
            var templateUrl = 'dttt/dtttDvgAssign/adddtttAssignDetailPopup.html';
            var title = CommonService.translate("Thêm mới công việc");
            modalAdddtttAssignDetail = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "40%", "30%", null, null);
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
            modalAdddtttAssignDetail.dismiss();
            vm.listWADetail.push(vm.addDetailForm);
            refreshDetailGrid(vm.listWADetail);
        }

        function refreshDetailGrid(d) {
            var grid = vm.listDtttAssignDetailGrid;
            if (grid) {
                grid.dataSource.data(d);
                grid.refresh();
            }
        }

        // Xóa row detail
        vm.removeRowDetail = removeRowDetail;

        function removeRowDetail(dataItem) {
            confirm(CommonService.translate("Xác nhận xóa"), function () {
                $('#listDtttAssignDetailGrid').data('kendoGrid').dataSource.remove(dataItem);
                vm.listWADetail = $('#listDtttAssignDetailGrid').data('kendoGrid').dataSource.data();
            });
        }

        // Xác nhận giao việc
        vm.approveStatus = function (dataItem) {
            confirm(CommonService.translate("Bạn có chắc chắn DUYỆT GIAO VIỆC mã WO") + " " + dataItem.code + " " + CommonService.translate("không?"), function () {
                vm.insertForm = angular.copy(dataItem);
                vm.insertForm.status = 1;
                vm.insertForm.statusDvnApprove = 0;
                kendo.ui.progress(vm.documentBody, true);
                dtttDvgAssignService.approveStatus(vm.insertForm).then(function (data) {
                    kendo.ui.progress(vm.documentBody, false);
                    toastr.success(CommonService.translate("Duyệt giao việc thành công"));
                    vm.doSearch();
                }, function () {
                    kendo.ui.progress(vm.documentBody, false);
                    toastr.error(CommonService.translate("Có lỗi xảy ra"));
                });
            });
        }

        vm.openRejectDvgVerify = function (dataItem) {
            vm.insertForm = angular.copy(dataItem);
            vm.typeCreate = 'rejectDvgVerify';
            var templateUrl = 'dttt/dtttDvgAssign/rejectPopup.html';
            var title = "Từ chối đóng việc";
            modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "30%", null, null);
        };

        vm.openAcceptDvgVerify = function (dataItem) {
            vm.isCreateForm = false;
            vm.checkViewDetail = false;
            vm.typeCreate = '';
            dataItem.typeFile = "WODTTT";
            dtttDvgAssignService.getDetail(dataItem).then(function (data) {
                // var obj = {"parType": "ASSESS"}
                // CommonService.getAppParam(obj).then(
                //     function (resp) {
                //         if (resp.data) {
                //             vm.assessArray = resp.data;
                //         }
                        vm.insertForm = angular.copy(data);
                        var templateUrl = 'dttt/dtttDvgAssign/verifyWorkPopup.html';
                        var title = CommonService.translate("Hoàn thành công việc");
                        modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "50%", null, null);
                        vm.dataFile = vm.insertForm.listAttachDocument;
                        vm.listWADetail = vm.insertForm.listDtttAssignDetail;
                        // file đính kèm start
                        fillFileTable();
                        // file đính kèm end
                        fillDataDtttAssignDetail(vm.listWADetail);

                //     },
                //     function (error) {
                //         toastr.error("Có lỗi xảy ra!");
                //     }
                // )
            }, function () {
                toastr.error(CommonService.translate("Có lỗi xảy ra"));
            });
        };

        // Từ chối giao việc
        vm.cancelApproveStatus = function (dataItem) {
            vm.typeCreate = 'cancelApproveStatus';
            vm.insertForm = angular.copy(dataItem);
            var templateUrl = 'dttt/dtttDvgAssign/rejectPopup.html';
            var title = CommonService.translate("Từ chối giao việc");
            modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "70%", "30%", null, null);
        }

        vm.saveReject = function () {
            if (vm.insertForm.rejectDescription == null) {
                toastr.error("Chưa nhập Lý do từ chối");
                return;
            }
            if (vm.typeCreate === 'cancelApproveStatus') {
                vm.insertForm.status = 0;
                vm.insertForm.cancelDvgDescription = vm.insertForm.rejectDescription;
                dtttDvgAssignService.approveStatus(vm.insertForm).then(function (data) {
                    toastr.success(CommonService.translate("Từ chối giao việc thành công"));
                    vm.doSearch();
                    modalAdd.dismiss();
                }, function () {
                    toastr.error(CommonService.translate("Có lỗi xảy ra"));
                });
            }
            if (vm.typeCreate === 'rejectDvgVerify') {
                vm.insertForm.statusDvgVerify = 2;
                vm.insertForm.statusDvnApprove = 0;
                vm.insertForm.rejectDvgDescription = vm.insertForm.rejectDescription;
                Restangular.all("dtttAssignRsService/verifyWorkByDvg").post(vm.insertForm).then(function (response) {
                    toastr.success(CommonService.translate("Từ chối đóng việc thành công"));
                    vm.doSearch();
                    modalAdd.dismiss();
                }).catch(function (err) {
                    console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
                });
            }
        }

        vm.saveDvgVerifyWork = function () {
            if (vm.insertForm.assessGrade == null || vm.insertForm.assessGrade == ""){
                toastr.error(CommonService.translate("Chưa cho điểm "));
                return;
            }
            if (vm.insertForm.assessQuality == null || vm.insertForm.assessQuality == ""){
                toastr.error(CommonService.translate("Chưa đánh giá Chất lương"));
                return;
            }
            if (vm.insertForm.assessProgress == null || vm.insertForm.assessProgress == ""){
                toastr.error(CommonService.translate("Chưa đánh giá Tiến độ"));
                return;
            }
            if (vm.insertForm.assessAttitude == null || vm.insertForm.assessAttitude == ""){
                toastr.error(CommonService.translate("Chưa đánh giá Thái độ"));
                return;
            }
            let obj = vm.insertForm;
            obj.statusDvgVerify = 1;
            debugger;
            Restangular.all("dtttAssignRsService/verifyWorkByDvg").post(obj).then(function (response) {
                if (response && response.error) {
                    toastr.error(response.error);
                } else {
                    toastr.success("Ghi lại thành công");
                    vm.doSearch();
                    modalAdd.close();
                }
            }).catch(function (err) {
                console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
            });

        };

        vm.changeAssess = function(){
            if (vm.insertForm.assessQuality == '1' || vm.insertForm.assessProgress == '1'|| vm.insertForm.assessAttitude == '1'){
                vm.insertForm.assessGrade = 1;
            }
            else if(vm.insertForm.assessQuality == '2'){
                vm.insertForm.assessGrade = 2;
            }
            else if(vm.insertForm.assessQuality == '3'){
                vm.insertForm.assessGrade = 3;
            }
            else if(vm.insertForm.assessQuality == '4'){
                vm.insertForm.assessGrade = 4;
            }
        }
        vm.clear = function (data) {
            switch (data) {
                case 'createDate_search': {
                    vm.searchForm.dateFrom = null;
                    vm.searchForm.dateTo = null;
                    break;
                }
                case 'keySearch': {
                    vm.searchForm.keySearch = null;
                    break;
                }
                case 'sysGroupDvgInsert': {
                    vm.insertForm.sysGroupDvgId = null;
                    vm.insertForm.sysGroupDvgCode = null;
                    vm.insertForm.sysGroupDvgName = null;
                    break;
                }
                case 'sysGroupDvnInsert': {
                    vm.insertForm.sysGroupDvnId = null;
                    vm.insertForm.sysGroupDvnCode = null;
                    vm.insertForm.sysGroupDvnName = null;
                    break;
                }
                //
                case 'date_insert': {
                    vm.insertForm.startDate = null;
                    vm.insertForm.closeDate = null;
                    break;
                }case 'descriptionInsert': {
                    vm.insertForm.description = null;
                    break;
                }

            }
        }

        // end controller
    }

})();
