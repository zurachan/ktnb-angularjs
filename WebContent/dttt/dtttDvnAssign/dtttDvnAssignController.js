(function () {
    'use strict';
    var controllerId = 'dtttDvnManageController';

    angular.module('MetronicApp').controller(controllerId, dtttDvnManageController);

    function dtttDvnManageController($scope, $http, $timeout, $rootScope, $log, Constant, Restangular, CommonService, kendoConfig, $kWindow, dtttDvnAssignService, RestEndpoint, gettextCatalog) {
        var vm = this;
        var modalReject, modalAssign;
        vm.listdtttDvnAssignDetailExportTemp = [];
        vm.modalBody = $('.k-widget .k-window');
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
                field: "statusDvnApprove",
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
                    '2': CommonService.translate("Thực hiện kết luận sau thanh kiểm tra")
                }
            }
        ];
        initFormData();

        //
        function initFormData() {
            $("#ktnb_searchForm_dtttDvnAssignId").click(function (e) {
                console.log(vm.searchForm);
            });
            vm.String = CommonService.translate("Quản lý công việc phòng DTTT") + " > " + CommonService.translate("Quản lý giao việc của đơn vị");
            vm.searchForm = {};

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

            vm.statusCompleteArray = [
                {id: 0, name: "Chưa thực hiện"},
                {id: 1, name: "Đang thực hiện"},
                {id: 2, name: "Hoàn Thành"}
            ];

            vm.dataList = [];
            checkPermissionDvnApprove();
        }

        // ----- Main Grid start
        vm.showHideColumnDetail = function (column) {
            var grid = vm.dtttDvnAssignGrid;
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
        //
        var record = 0;
        // Grid colunm config
        vm.dtttDvnAssignGridOptions = kendoConfig.getGridOptions({
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
                        '<div class="btn-group pull-right margin_top_button margin_right10">' +
                        '<i data-toggle="dropdown" class="tooltip1" aria-expanded="false"><span class="tooltipArrow"></span><span class="tooltiptext" translate>Cài đặt</span><i class="fa fa-cog" aria-hidden="true"></i></i>' +
                        '<i class="tooltip1 action-button excelQLK" ng-click="vm.exportExcelGrid()"  aria-expanded="false"><span class="tooltipArrow"></span><span class="tooltiptext" translate>Xuất Excel</span></i>' +
                        '<div class="dropdown-menu hold-on-click dropdown-checkboxes" role="menu">' +
                        '<label ng-repeat="column in vm.dtttDvnAssignGrid.columns.slice(1,vm.dtttDvnAssignGrid.columns.length)| filter: vm.gridColumnShowHideFilter">' +
                        '<input type="checkbox" checked="column.hidden" ng-click="vm.showHideColumn(column)"> {{column.title}}' +
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
                        url: Constant.BASE_SERVICE_URL + "dtttAssignRsService/doSearchViewDvn",
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
            columns: [
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
                    attributes: {
                        style: "text-align:center;"
                    },
                },
                {
                    field: "code",
                    title: CommonService.translate("Mã WO"),
                    template: '<a href="javascript:void(0);" title="#=code#" ng-click=vm.showDetail(dataItem)>#=code#</a>',
                    hidden: false,
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center"},
                    width: "120px",
                },
                {
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
                },         {
                    title: CommonService.translate("Trạng thái đơn vị giao xác nhận"),
                    field: 'statusDvgVerify',
                    width: "100px",
                    template: function (dataItem) {
                        if (dataItem.statusDvgVerify == 0) {
                            return CommonService.translate("Chưa xác nhận");
                        } else if (dataItem.statusDvgVerify == 1) {
                            return CommonService.translate("Đã xác nhận");
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
                    title: CommonService.translate("Thao tác"),
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center", translate: ""},
                    hidden: false,
                    template: function (dataItem) {
                        return (
                            '<div class="text-center #=dtttDvnAssignId#"">' +
                            '<button ng-if="dataItem.statusDvgVerify != 1 && dataItem.statusDvgVerify != 2 && vm.isRoleApprove && dataItem.statusDvnApprove == 0" style=" border: none; background-color: white;" class="#=dtttDvnAssignId# icon_table ng-scope" uib-tooltip="Nhận việc" translate="" ' +
                            'ng-click="vm.approveWork(dataItem)" > <i style="color:green;" class="fa fa-check ng-scope" aria-hidden="true"></i>' +
                            '</button>' +

                            '<button ng-if="dataItem.statusDvgVerify != 1 && dataItem.statusDvgVerify != 2 && vm.isRoleApprove && dataItem.statusDvnApprove == 0" style=" border: none; background-color: white;" class="#=dtttDvnAssignId# icon_table ng-scope" uib-tooltip="Từ chối" translate="" ' +
                            'ng-click="vm.openRejectView(dataItem)" > <i style="color:red;" class="fa fa-times ng-scope" aria-hidden="true"></i>' +
                            '</button>' +

                            '<button ng-if="dataItem.statusDvnApprove == 1 && dataItem.assignDvnBy == null  " style=" border: none; background-color: white;" class="#=dtttDvnAssignId# icon_table ng-scope" uib-tooltip="Giao việc" translate="" ' +
                            'ng-click="vm.openAssignWork(dataItem)" > <i style="color:darkviolet;" class="fa fa-share ng-scope" aria-hidden="true"></i>' +
                            '</button>' +

                            '<button ng-if="dataItem.assignDvnBy != null && (dataItem.statusDvgVerify == 2 || ( dataItem.statusDvnApprove == 1 && dataItem.statusAssignAllNv != 0)) " style=" border: none; background-color: white;" class="#=dtttDvnAssignId# icon_table ng-scope" uib-tooltip="Sửa" translate="" ' +
                            'ng-click="vm.openEditAssignWork(dataItem)" > <i class="fa fa-pencil ng-scope" aria-hidden="true"></i>' +
                            '</button>' +

                            '</div>'
                        )
                    },
                    width: "130px"
                }
            ],
        });

        vm.doSearch = doSearch;

        function doSearch() {
            if ($('.k-invalid-msg').is(':visible')) {
                return;
            }
            console.log(vm.searchForm);
            var grid = vm.dtttDvnAssignGrid;
            CommonService.doSearchGrid(grid, {pageSize: grid.dataSource.pageSize()});
        };

        vm.exportExcelGrid = function () {
            kendo.ui.progress(vm.documentBody, true);
            var obj = angular.copy(vm.searchForm);
            obj.page = null;
            obj.pageSize = null;

            dtttDvnAssignService.doSearch(obj).then(function (d) {
                kendo.ui.progress(vm.documentBody, false);
                var data = d.data;
                CommonService.exportFile(vm.dtttDvnAssignGrid, data, vm.listRemove, vm.listConvert, CommonService.translate("Danh sách WO của đơn vị"));
            });
        }

        function checkPermissionDvnApprove() {
            vm.isRoleApprove = false;
            let obj = {};
            obj.adResourceCode = "WO_DVN";
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

        vm.approveWork = function (dataItem) {
            kendo.ui.progress($(vm.modalBody), true);
            var obj = {};
            obj.dtttAssignId = dataItem.dtttAssignId;
            obj.statusDvnApprove = 1;
            confirm(CommonService.translate('Bạn có chắc chắn NHẬN VIỆC không?'), function () {
                Restangular.all("dtttAssignRsService/approveDvnStatus").post(obj).then(function (response) {
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
            vm.rejectForm.dtttAssignId = dataItem.dtttAssignId;
            vm.typeCreate = 'rejectWork';
            var templateUrl = 'dttt/dtttDvnAssign/rejectPopup.html';
            var title = "Từ chối nhận việc";
            modalReject = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "30%", null, null);
        };
        vm.openAssignWork = function (dataItem) {
            vm.assignForm = {};
            vm.typeCreate = 'assignWork';
            dataItem.typeFile = "WODTTT";
            dtttDvnAssignService.getDetail(dataItem).then(function (data) {
                vm.assignForm = angular.copy(data);
                var templateUrl = 'dttt/dtttDvnAssign/assignWorkPopup.html';
                var title = CommonService.translate("Giao việc cho nhân viên");
                modalAssign = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "82%", "70%", null, null);
                vm.dataFile = vm.assignForm.listAttachDocument;
                fillFileTable(vm.dataFile);
            }, function () {
                toastr.error(CommonService.translate("Có lỗi xảy ra"));
            });
        };

        vm.openEditAssignWork = function (dataItem) {
            vm.assignForm = {};
            vm.typeCreate = 'editAssignWork';
            dataItem.typeFile = "WODTTT";
            dtttDvnAssignService.getDetail(dataItem).then(function (data) {
                vm.assignForm = angular.copy(data);
                var templateUrl = 'dttt/dtttDvnAssign/editAssignWorkPopup.html';
                var title = CommonService.translate("Chỉnh sửa giao việc cho nhân viên");
                modalAssign = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "82%", "70%", null, null);
                vm.dataFile = vm.assignForm.listAttachDocument;
                vm.listWADetail = vm.assignForm.listDtttAssignDetail;
                fillFileTable(vm.dataFile);
                fillListWork(vm.listWADetail);
            }, function () {
                toastr.error(CommonService.translate("Có lỗi xảy ra"));
            });
        };

        vm.showDetail = function (dataItem) {
            vm.assignForm = {};
            vm.typeCreate = 'detail';
            dataItem.typeFile = "WODTTT";
            dtttDvnAssignService.getDetail(dataItem).then(function (data) {
                vm.assignForm = angular.copy(data);
                var templateUrl = 'dttt/dtttDvnAssign/detailPopup.html';
                var title = CommonService.translate("Xem chi tiết");
                modalAssign = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "70%", null, null);
                vm.dataFile = vm.assignForm.listAttachDocument;
                vm.listWADetail = vm.assignForm.listDtttAssignDetail;
                fillFileTable(vm.dataFile);
                fillListWork(vm.listWADetail);
            }, function () {
                toastr.error(CommonService.translate("Có lỗi xảy ra"));
            });
        }

        // Xóa file đính kèm
        // Danh sach cong viec
        var recordWAD = 0;
        function fillListWork(data) {
            var dataItem = {
                data: data,
                page: 1,
                pageSize: 5
            };
            vm.listWorkGridOptions = kendoConfig.getGridOptions({
                autoBind: true,
                scrollable: true,
                resizable: true,
                sortable: false,
                columnMenu: false,
                serverPaging: true,
                editable: true,
                dataBinding: function () {
                    recordWAD = (this.dataSource.page() - 1) * this.dataSource.pageSize();
                },
                toolbar: [
                ],
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
                            ++recordWAD;
                            dataItem.stt = recordWAD;
                            return recordWAD;
                        },
                        editable: false,
                        type : 'text',
                        width: "45px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    }, {
                        title: CommonService.translate("Tên công việc"),
                        field: 'workName',
                        width: "70px",
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        editable: false,
                        type: "text",
                        attributes: {
                            style: "text-align:left;"
                        }
                    }, {
                        title: CommonService.translate("Nội dung chi tiết"),
                        field: "description",
                        width: "50px",
                        type: "text",
                        editable: false,
                    }, {
                        title: CommonService.translate("Nhân viên thực hiện chính"),
                        field: "performerName",
                        width: "70px",
                        type: "text",
                        editable: function (dataItem) {
                            return vm.typeCreate == 'editAssignWork';
                        },
                        editor: mainStaffAutoCompleteEditor,
                    }, {
                        title: CommonService.translate("Nhân viên thực hiện cùng"),
                        field: "performerTogether",
                        width: "200px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        type: "text",
                        editable: function (dataItem) {
                            return vm.typeCreate == 'editAssignWork';
                        },
                        template: function (dataItem) {
                            // if (!((dataItem.isKtnbReject == 1 || dataItem.statusNvApprove != 1) && vm.typeCreate != 'detail')) {
                            //     return dataItem.performerTogether == null ? '' : dataItem.performerTogether;

                            if (!( vm.typeCreate == 'editAssignWork')) {
                                return dataItem.performerTogether == null ? '' : dataItem.performerTogether;
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
                        title: CommonService.translate("Lý do NV từ chối nhận việc"),
                        field: "cancelNvDescription",
                        hidden: !vm.checkViewDetail,
                        width: "70px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        editable: false,
                        type: "text",
                    },
                    {
                        title: CommonService.translate("Thực hiện lại WO"),
                        field: "isChecked",
                        template: "<input ng-if='caller.typeCreate == \"editAssignWork\"' type='checkbox' id='check' name='gridcheckbox2' ng-model='dataItem.isChecked'/>",
                        width: "80px",
                        editable: false,
                        hidden: false,
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {
                            style: "text-align:center;"
                        },
                        type: "text",
                    },
                    {
                        title: CommonService.translate("File hoàn thành"),
                        width: "120px",
                        hidden: !vm.checkViewDetail,
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
        vm.seletedMainStaff = false;

        function mainStaffAutoCompleteEditor(container, options) {
            // if (options.model.statusNvApprove== 1){
            //     return '<div disabled >' + options.model.performerName + '</div>'
            // }else {
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
                                        sysGroupId: vm.assignForm.sysGroupDvnId,
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

        // add người đi cùng start
        var togetherByColumns = [
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
            vm.commonPopupSearch.dtttAssignDetailId = data.dtttAssignDetailId;
            vm.commonPopupSearch.sysGroupId = vm.assignForm.sysGroupDvnId;
            var api = "commonRsService/getSysUserSgLv2ForAutoComplete";
            CommonService.fillDataPopupCommonSearch(api, vm.commonPopupSearch, togetherByColumns, vm);
        }

        vm.saveSelectTogether = function (dataItem) {
            var lstGrid = vm.listWorkGrid.dataSource.data();
            for (let i = 0; i < lstGrid.length; i++) {
                if (lstGrid[i].dtttAssignDetailId == vm.commonPopupSearch.dtttAssignDetailId) {
                    if (lstGrid[i].performerTogether != null) {
                        lstGrid[i].performerTogether += "," + dataItem.codeName;
                    } else {
                        lstGrid[i].performerTogether = dataItem.codeName;
                    }

                }
            }
            vm.listWorkGrid.dataSource.data(lstGrid);
            vm.listWorkGrid.refresh();
            modalTogether.dismiss();
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
        // // * end popup common
        // // add người đi cùng start
        // var togetherByColumns = [
        //     {
        //         title: "TT",
        //         field: "stt",
        //         template: function () {
        //             return ++vm.recordPopup;
        //         },
        //         width: "50px",
        //         headerAttributes: {
        //             style: "text-align:center;", translate: "",
        //         },
        //         attributes: {
        //             style: "text-align:center;"
        //         },
        //     }, {
        //         title: CommonService.translate("Mã nhân viên"),
        //         field: 'employeeCode',
        //         width: "20%",
        //         headerAttributes: {
        //             style: "text-align:center;", translate: "",
        //         },
        //         attributes: {
        //             style: "text-align:left;"
        //         },
        //     }, {
        //         title: CommonService.translate("Tên nhân viên"),
        //         field: 'fullName',
        //         width: "20%",
        //         headerAttributes: {
        //             style: "text-align:center;", translate: "",
        //         },
        //         attributes: {
        //             style: "text-align:left;"
        //         },
        //     }, {
        //         title: CommonService.translate("Chọn"),
        //         field: 'choose',
        //         width: "10%",
        //         template:
        //             '<div class="text-center "> ' +
        //             '		<a  type="button" class=" icon_table" uib-tooltip="Chọn" translate>' +
        //             '			<i ng-click="caller.saveSelectTogether(dataItem)" class="fa fa-check color-green" aria-hidden="true"></i> ' +
        //             '		</a>'
        //             + '</div>'
        //         ,
        //         headerAttributes: {
        //             style: "text-align:center;", translate: "",
        //         },
        //         attributes: {
        //             style: "text-align:center;"
        //         },
        //     }
        // ];
        // var modalTogether = null;
        // vm.openPopupTogether = function (data) {
        //     var templateUrl = "ktnb/popup/popupCommonSearch.html";
        //     var title = CommonService.translate("Tìm kiếm nhân viên");
        //     var windowId = "POPUP_SELECT_TOGETHER_USER";
        //     vm.placeHolder = CommonService.translate("Mã/tên nhân viên");
        //     CommonService.populatePopupCreate(templateUrl, title, null, vm, windowId, null, '60%', '50%', null);
        //     setTimeout(function () {
        //         modalTogether = CommonService.getModalInstance1();
        //     }, 100);
        //     vm.commonPopupSearch = {};
        //     vm.commonPopupSearch.dtttDvnAssignDetailId = data.dtttDvnAssignDetailId;
        //     var api = "commonRsService/getSysUserForAutoComplete";
        //     CommonService.fillDataPopupCommonSearch(api, vm.commonPopupSearch, togetherByColumns, vm);
        // }
        //
        // vm.saveSelectTogether = function (dataItem) {
        //     var lstGrid = vm.listDvdtttDvnAssignDetailGrid.dataSource.data();
        //     for (let i = 0; i < lstGrid.length; i++) {
        //         if (lstGrid[i].dtttDvnAssignDetailId == vm.commonPopupSearch.dtttDvnAssignDetailId) {
        //             if (lstGrid[i].performerTogether != null) {
        //                 lstGrid[i].performerTogether += "," + dataItem.codeName;
        //             } else {
        //                 lstGrid[i].performerTogether = dataItem.codeName;
        //             }
        //
        //         }
        //     }
        //     vm.listDvdtttDvnAssignDetailGrid.dataSource.data(lstGrid);
        //     vm.listDvdtttDvnAssignDetailGrid.refresh();
        //     modalTogether.dismiss();
        // }
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
        vm.saveItem = function () {
            if (vm.typeCreate === 'assignWork') {
                if (vm.assignForm.performerId == null){
                    toastr.error("Bắt buộc nhập Nhân viên trưởng ban");
                    $("#assignWorkPerformer").focus();
                    return;
                }
                let obj = {};
                obj.dtttAssignId = vm.assignForm.dtttAssignId;
                obj.performerId = vm.assignForm.performerId;
                obj.listFileAttach = vm.listFileAttach;
                kendo.ui.progress($('.k-widget.k-window'), true);
                Restangular.all("dtttAssignRsService/assignWork").post(obj).then(function (response) {
                    if (response && response.error) {
                        toastr.error(response.error);
                    } else {
                        toastr.success("Ghi lại thành công");
                        vm.doSearch();
                        modalAssign.close();
                    }
                    kendo.ui.progress($('.k-widget.k-window'), false);
                }).catch(function (err) {
                    console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
                    kendo.ui.progress($('.k-widget.k-window'), false);
                });
            } else if (vm.typeCreate === 'editAssignWork') {
                let obj = {};
                obj.dtttAssignId = vm.assignForm.dtttAssignId;
                obj.listFileAttach = vm.listFileAttach;
                // obj.performerId = vm.assignForm.performerId;
                let lstDataGrid = vm.listWorkGrid.dataSource._data;
                obj.listDtttAssignDetail = lstDataGrid;
                kendo.ui.progress($(vm.modalBody), false);
                Restangular.all("dtttAssignRsService/editAssignWork").post(obj).then(function (response) {
                    if (response && response.error) {
                        toastr.error(response.error);
                    } else {
                        toastr.success("Ghi lại thành công");
                        vm.doSearch();
                        modalAssign.close();
                    }
                    kendo.ui.progress($(vm.modalBody), false);
                }).catch(function (err) {
                    kendo.ui.progress($(vm.modalBody), false);
                    console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
                });
            } else if (vm.typeCreate === 'rejectWork') {
                if (vm.rejectForm.cancelDvnDescription == null || vm.rejectForm.cancelDvnDescription == "") {
                    toastr.error("Chưa nhập lý do từ chối");
                    return;
                }
                var obj = vm.rejectForm;
                obj.statusDvnApprove = 2;
                kendo.ui.progress($(vm.modalBody), false);
                Restangular.all("dtttAssignRsService/approveDvnStatus").post(obj).then(function (response) {
                    if (response && response.error) {
                        toastr.error(response.error);
                    } else {
                        toastr.success("Từ chối thành công");
                        vm.doSearch();
                        modalReject.close();
                    }
                    kendo.ui.progress($(vm.modalBody), false);
                }).catch(function (err) {
                    console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
                    kendo.ui.progress($(vm.modalBody), false);
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
            if (vm.searchForm.approveDvgDateFrom == null) {
                vm.errMessage = CommonService.translate("Ngày đến không được để trống");
                $("#dtttDvnAssign_approveDvgDateFrom").focus();
                return vm.errMessage;
            }
            let approveDvgDateFrom = kendo.parseDate(vm.searchForm.approveDvgDateFrom, "dd/MM/yyyy");
            let approveDvgDateTo = kendo.parseDate(vm.searchForm.approveDvgDateTo, "dd/MM/yyyy");
            let curDate = new Date();
            if (approveDvgDateFrom > curDate) {
                vm.errMessage = CommonService.translate("Ngày bắt đầu không được lớn hơn ngày hiện tại");
                $("#dtttDvnAssign_approveDvgDateFrom").focus();
                return vm.errMessage;
            } else if (approveDvgDateTo != null && approveDvgDateFrom > approveDvgDateTo) {
                vm.errMessage = CommonService.translate("Ngày bắt đầu không được lớn hơn ngày đến");
                $("#dtttDvnAssign_approveDvgDateFrom").focus();
                return vm.errMessage;
            } else {
                vm.errMessage = '';
                vm.errMessage1 = '';
                return vm.errMessage;
            }
        };

        vm.checkErr1 = function () {
            if (vm.searchForm.approveDvgDateTo == null) {
                vm.errMessage1 = CommonService.translate("Ngày đến không được để trống");
                $("#dtttDvnAssign_approveDvgDateTo").focus();
                return vm.errMessage1;
            }
            let approveDvgDateFrom = kendo.parseDate(vm.searchForm.approveDvgDateFrom, "dd/MM/yyyy");
            let approveDvgDateTo = kendo.parseDate(vm.searchForm.approveDvgDateTo, "dd/MM/yyyy");
            let curDate = new Date();
            if (approveDvgDateTo > curDate) {
                vm.errMessage1 = CommonService.translate("Ngày bắt đầu không được lớn hơn ngày hiện tại");
                $("#dtttDvnAssign_approveDvgDateTo").focus();
                return vm.errMessage1;
            } else if (approveDvgDateFrom > approveDvgDateTo) {
                vm.errMessage1 = CommonService.translate("Ngày đến không được nhỏ hơn ngày bắt đầu");
                $("#dtttDvnAssign_approveDvgDateTo").focus();
                return vm.errMessage1;
            } else if (approveDvgDateFrom <= approveDvgDateTo) {
                vm.errMessage = '';
                vm.errMessage1 = '';
                return vm.errMessage1;
            }
        };
        vm.selectedSysGroup = false;
        vm.sysGroupDvnOptions = {
            clearButton: false,
            dataTextField: "name",
            select: function (e) {
                vm.selectedSysGroup = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchForm.sysGroupDvnName = dataItem.name;
                vm.searchForm.sysGroupDvnId = dataItem.sysGroupId;
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
                    vm.searchForm.sysGroupDvnId = null;
                    vm.searchForm.sysGroupDvnName = null;
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
            vm.searchForm.sysGroupDvnName = dataItem.name;
            vm.searchForm.sysGroupDvnId = dataItem.sysGroupId;
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

        vm.isSelectPerformer = false;
        vm.performerOptions = {
            clearButton: false,
            dataTextField: "fullName", placeholder: CommonService.translate("Họ tên, mã nhân viên, email, số điện thoại"),
            dataValueField: "fullName",
            open: function (e) {
                vm.isSelectPerformer = false;
            },
            select: function (e) {
                vm.isSelectPerformer = true;
                var dataItem = this.dataItem(e.item.index());
                vm.assignForm.performerId = dataItem.sysUserId;
                vm.assignForm.performerName = dataItem.codeName;
                vm.assignForm.positionId = dataItem.positionId;
                vm.assignForm.positionName = dataItem.positionName;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectPerformer) {
                        vm.assignForm.performerId = null;
                        vm.assignForm.performerName = null;
                        vm.assignForm.positionId = null;
                        vm.assignForm.positionName = null;
                    }
                }, 100);
            },
            close: function (e) {
                $timeout(function () {
                    if (vm.assignForm.performerId == null) {
                        vm.assignForm.performerCode = null;
                        vm.assignForm.performerName = null;
                        vm.assignForm.positionId = null;
                        vm.assignForm.positionName = null;
                    }
                }, 1000);

            },
            pageSize: 10,
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        vm.isSelectPerformer = false;
                        return Restangular.all("commonRsService/getSysUserSgLv2ForAutoComplete").post(
                            {
                                keySearch: vm.assignForm.performerName,
                                sysGroupId: vm.assignForm.sysGroupDvnId,
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
                    vm.searchForm.approveDvgDateFrom = null;
                    vm.searchForm.approveDvgDateTo = null;
                    break;
                case 'statusComplete':
                    vm.searchForm.statusComplete = null;
                    break;
                case 'statusDvnVerify':
                    vm.searchForm.statusDvVerify = null;
                    break;
                case 'sysGroupDvnId':
                    vm.searchForm.sysGroupDvnId = null;
                    vm.searchForm.sysGroupDvnName = null;
                    vm.searchForm.sysGroupDvnCode = null;
                    break;
            }
        }
    }
})();
