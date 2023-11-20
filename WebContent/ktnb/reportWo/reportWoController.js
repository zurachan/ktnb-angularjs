(function () {
    'use strict';
    var controllerId = 'reportWoController';

    angular.module('MetronicApp').controller(controllerId, reportWoController);

    function reportWoController($scope, $templateCache, $rootScope, $timeout,
                                gettextCatalog, $filter, kendoConfig, $kWindow,
                                htmlCommonService, CommonService, PopupConst, Restangular,
                                RestEndpoint, Constant, $http, $modal) {

        var vm = this;
        vm.dataResult = [];
        vm.searchForm = {};
        vm.disableInputSysGroup = true;
        vm.documentBody = $(".tab-content");
        vm.statusNvApproveArray = [
            {id: 0, name: "Chưa nhận việc"},
            {id: 1, name: "Đã nhận việc"},
            {id: 2, name: "Từ chối việc"}
        ];

        vm.statusDvVerifyArray = [
            {id: 0, name: "Chưa xác nhận"},
            {id: 1, name: "Đã xác nhận"},
            {id: 2, name: "Từ chối"},
            {id: 3, name: "Bỏ qua"}
        ];

        vm.typeWoArray = [
            {id: 1, name: "Giao việc ngành dọc PC&KTNB"},
            {id: 2, name: "Thực hiện kết luận sau thanh kiểm tra"}
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
        initForm();

        function initForm() {
            vm.String = CommonService.translate("Báo cáo") + " > " + CommonService.translate("Báo cáo tổng hợp work order");
            fillDataWoGrid2([]);
        }

        vm.doSearch = function () {
            var grid = $("#rpWoGrid2").data("kendoGrid");
            if (grid) {
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        }

        var recordrpWo2 = 0;
        vm.countRp2 = 0;
        function fillDataWoGrid2(data) {
            vm.rpWoGridOptions2 = kendoConfig.getGridOptions({
                autoBind: true,
                resizable: true,
                dataBinding: function () {
                    recordrpWo2 = (this.dataSource.page() - 1) * this.dataSource.pageSize();
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
                            vm.countRp2 = response.total;
                            return response.total;
                        },
                        data: function (response) {
                            return response.data;
                        },
                    },
                    transport: {
                        read: {
                            url: Constant.BASE_SERVICE_URL + "workAssignRsService/doSearchInspectionConclusionReport",
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
                toolbar: [
                    {
                        name: "actions",
                        template:
                            '<div class="btn-group pull-right margin_top_button margin_right10">' +
                            '<i data-toggle="dropdown" class="tooltip1" aria-expanded="false"><span class="tooltipArrow"></span><span class="tooltiptext" translate>Cài đặt</span><i class="fa fa-cog" aria-hidden="true"></i></i>' +
                            '<div class="dropdown-menu hold-on-click dropdown-checkboxes" role="menu">' +
                            '<label ng-repeat="column in vm.rpWoGrid2.columns.slice(1,vm.rpWoGrid2.columns.length)| filter: vm.gridColumnShowHideFilter">' +
                            '<input type="checkbox" checked="column.hidden" ng-click="vm.showHideColumn(column)"> {{column.title}}' +
                            '</label>' +
                            '</div></div>'
                    }
                ],
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
                            return ++recordrpWo2;
                        },
                        width: "50px",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center;"
                        },
                    },
                    {
                        title: CommonService.translate("Số văn bản"),
                        field: 'nameDocument',
                        width: "100px",
                        headerAttributes: {
                            style: "text-align:center;white-space:normal;font-weight: bold",
                            translate: ""
                        },
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Ngày ban hành"),
                        field: 'dateIssued',
                        width: "100px",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center;"
                        },
                    },
                    {
                        title: CommonService.translate("Người ký"),
                        field: 'signedByName',
                        width: "120px",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold",
                            translate: ""
                        },
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Chức vụ"),
                        field: 'positionName',
                        width: "120px",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold",
                            translate: ""
                        },
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Nội dung văn bản"),
                        field: 'textContent',
                        width: "300px",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold",
                            translate: ""
                        },
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Đơn vị thực hiện"),
                        field: 'sysGroupLv2Name',
                        width: "100px",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold",
                            translate: ""
                        },
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Mã WO"),
                        field: 'code',
                        width: "140px",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold",
                            translate: ""
                        },
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Bộ phận giao WO"),
                        field: 'departmentCode',
                        width: "100px",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold",
                            translate: ""
                        },
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Loại WO"),
                        field: '',
                        template: function (dataItem) {
                            if (dataItem.typeWo == 1) {
                                return 'Giao việc ngành dọc PC&KTNB';
                            } else if (dataItem.typeWo == 2) {
                                return 'Thực hiện kết luận sau thanh kiểm tra';
                            } else if (dataItem.typeWo == 3) {
                                return 'Cơ quan/ Đơn vị TCT giám sát ngành dọc';
                            }
                            return '';
                        },
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold",
                            translate: ""
                        },
                        attributes: {style: "text-align:center;white-space:normal;"},
                        width: "100px",
                    },
                    {
                        title: CommonService.translate("Nội dung công việc"),
                        field: 'description',
                        width: "300px",
                        headerAttributes: {
                            style: "text-align:center;white-space:normal;font-weight: bold",
                            translate: ""
                        },
                        attributes: {style: "text-align:center;white-space:normal;"},
                    }, {
                        title: CommonService.translate("Tên WO"),
                        field: 'workName',
                        width: "300px",
                        headerAttributes: {
                            style: "text-align:center;white-space:normal;font-weight: bold",
                            translate: ""
                        },
                        attributes: {style: "text-align:center;white-space:normal;"},
                    }, {
                        title: CommonService.translate("Thời hạn hoàn thành"),
                        field: 'closeDate',
                        width: "100px",
                        headerAttributes: {
                            style: "text-align:center;white-space:normal;font-weight: bold",
                            translate: ""
                        },
                        attributes: {style: "text-align:center;white-space:normal;"},
                    }, {
                        title: CommonService.translate("Thời gian đơn vị nhận WO"),
                        field: 'verifyDvDate',
                        width: "100px",
                        headerAttributes: {
                            style: "text-align:center;white-space:normal;font-weight: bold",
                            translate: ""
                        },
                        attributes: {style: "text-align:center;white-space:normal;"},
                    }, {
                        title: CommonService.translate("Thời gian đơn vị giao WO cho nhân viên"),
                        field: 'coordinateNvDate',
                        width: "100px",
                        headerAttributes: {
                            style: "text-align:center;white-space:normal;font-weight: bold",
                            translate: ""
                        },
                        attributes: {style: "text-align:center;white-space:normal;"},
                    }, {
                        title: CommonService.translate("Thời gian nhân viên nhận việc"),
                        field: 'approveNvDate',
                        width: "100px",
                        headerAttributes: {
                            style: "text-align:center;white-space:normal;font-weight: bold",
                            translate: ""
                        },
                        attributes: {style: "text-align:center;white-space:normal;"},
                    }, {
                        title: CommonService.translate("Người thực hiện"),
                        field: 'performerName',
                        width: "100px",
                        headerAttributes: {
                            style: "text-align:center;white-space:normal;font-weight: bold",
                            translate: ""
                        },
                        attributes: {style: "text-align:center;white-space:normal;"},
                    }, {
                        title: CommonService.translate("Người thực hiện cùng"),
                        field: 'performerTogether',
                        width: "100px",
                        headerAttributes: {
                            style: "text-align:center;white-space:normal;font-weight: bold",
                            translate: ""
                        },
                        attributes: {style: "text-align:center;white-space:normal;"},
                    }, {
                        field: "statusComplete",
                        title: CommonService.translate("Trạng thái nhân viên thực hiện"),
                        headerAttributes: {
                            style: "text-align:center;white-space:normal;font-weight: bold",
                            translate: ""
                        },
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

                    }, {
                        title: CommonService.translate("Thời gian nhân viên hoàn thành thực tế"),
                        field: 'completeDate',
                        width: "100px",
                        headerAttributes: {
                            style: "text-align:center;white-space:normal;font-weight: bold",
                            translate: ""
                        },
                        attributes: {style: "text-align:center;white-space:normal;"},
                    }, {
                        field: "statusDvVerify",
                        title: CommonService.translate("Trạng thái DV xác nhận đóng việc"),
                        headerAttributes: {
                            style: "text-align:center;white-space:normal;font-weight: bold",
                            translate: ""
                        },
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

                    }, {
                        title: CommonService.translate("Thời gian đơn vị hoàn thành thực tế"),
                        field: 'timeDvHTTT',
                        width: "100px",
                        headerAttributes: {
                            style: "text-align:center;white-space:normal;font-weight: bold",
                            translate: ""
                        },
                        attributes: {style: "text-align:center;white-space:normal;"},
                    }, {
                        title: CommonService.translate("Trạng thái P.KTNB xác nhận đóng việc"),
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
                        headerAttributes: {
                            style: "text-align:center;white-space:normal;font-weight: bold",
                            translate: ""
                        },
                        attributes: {style: "text-align:center;white-space:normal;"},
                    }, {
                        title: CommonService.translate("Thời gian P.KTNB hoàn thành thực tế"),
                        field: 'timeKtnbHTTT',
                        width: "100px",
                        headerAttributes: {
                            style: "text-align:center;white-space:normal;font-weight: bold",
                            translate: ""
                        },
                        attributes: {style: "text-align:center;white-space:normal;"},
                    }, {
                        title: CommonService.translate("Tình trạng thực hiện"),
                        field: 'statusDoWork',
                        width: "100px",
                        headerAttributes: {
                            style: "text-align:center;white-space:normal;font-weight: bold",
                            translate: ""
                        },
                        attributes: {style: "text-align:center;white-space:normal;"},
                    }, {
                        title: CommonService.translate("Số ngày quá hạn"),
                        field: 'numDayExpired',
                        width: "100px",
                        headerAttributes: {
                            style: "text-align:center;white-space:normal;font-weight: bold",
                            translate: ""
                        },
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                ]
            });
        }
        vm.exportReport = function () {
            var obj = {};
            if (vm.searchForm.type == null) {
                confirm(CommonService.translate("Bạn có chắc chắn muốn xuất báo cáo tổng hợp với tất cả loại WO?"), function () {
                    kendo.ui.progress(vm.documentBody, true);
                    exportPdf();
                    kendo.ui.progress(vm.documentBody, false);
                });
            } else {
                exportPdf();
            }
        };

        function exportPdf(){
            var obj = {};
            obj.reportName = "BaoCaoKetLuanSauKt";
            obj.sysGroupId = vm.searchForm.sysGroupId;
            obj.state = vm.searchForm.state;
            obj.code = vm.searchForm.code;
            obj.startDate = vm.searchForm.startDate;
            obj.closeDate = vm.searchForm.closeDate;
            obj.status = vm.searchForm.status;
            obj.statusKtnbVerify = vm.searchForm.statusKtnbVerify;
            obj.riskType = vm.searchForm.type;
            obj.reportType = "EXCEL";
            var date = kendo.toString(new Date((new Date()).getTime()), "dd-MM-yyyy");
            CommonService.exportReport(obj).then(
                function (data) {
                    var binarydata = new Blob([data], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
                    kendo.saveAs({dataURI: binarydata, fileName: date + "_" + "BaoCaoTongHopWO" + '.xlsx'});
                }, function (errResponse) {
                    toastr.error(CommonService.translate("Lỗi không export EXCEL được!"));
                });
        }

        //------------------------ start don vi
        vm.selectedSysGroup = false;
        vm.sysGroupOptions = {
            clearButton: false,
            dataTextField: "name",
            select: function (e) {
                vm.selectedSysGroup = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchForm.sysGroupLv2Name = dataItem.name;
                vm.searchForm.sysGroupLv2Id = dataItem.sysGroupId;
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
                    vm.searchForm.sysGroupLv2Id = null;
                    vm.searchForm.sysGroupLv2Name = null;
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
            vm.searchForm.sysGroupLv2Name = dataItem.name;
            vm.searchForm.sysGroupLv2Id = dataItem.sysGroupId;
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


        // export end -----
        vm.clear = function (data) {
            switch (data) {
                case 'organization': {
                    vm.searchForm.sysGroupLv2Id = null;
                    vm.searchForm.sysGroupLv2Code = null;
                    vm.searchForm.sysGroupLv2Name = null;
                    break;
                }
                case 'keySearch': {
                    vm.searchForm.keySearch = null;
                    break;
                }
            }
        }

        vm.showHideColumn = function (column) {
            if (angular.isUndefined(column.hidden)) {
                vm.rpWoGrid2.hideColumn(column);
            } else if (column.hidden) {
                vm.rpWoGrid2.showColumn(column);
            } else {
                vm.rpWoGrid2.hideColumn(column);
            }
        };
    }
})();
