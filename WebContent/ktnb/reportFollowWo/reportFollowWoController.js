(function () {
    'use strict';
    var controllerId = 'reportFollowWoController';

    angular.module('MetronicApp').controller(controllerId, reportFollowWoFunc, '$scope', '$modal', '$rootScope');

    function reportFollowWoFunc($scope, $templateCache, $rootScope, $timeout,
                                 gettextCatalog, $filter, kendoConfig, $kWindow,
                                 htmlCommonService, CommonService, PopupConst, Restangular,
                                 RestEndpoint, Constant, $http, $modal) {

        var vm = this;
        vm.dataResult = [];
        vm.searchForm = {};
        vm.listConvert = [
            {
                field: "statusKtnbVerify",
                data: {
                    '0': CommonService.translate("Chờ duyệt"),
                    '1': CommonService.translate("Đã duyệt"),
                    '2': CommonService.translate("Từ chối")
                }
            },
        ];
        vm.String = CommonService.translate("Báo cáo") + " > " + CommonService.translate("Báo cáo theo dõi khắc phục các kiến nghị Kiểm toán");
        vm.disableInputSysGroup = true;
        vm.documentBody = $("#rpDetail");
        init();

        function init() {
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
            vm.departmentCode = [
                {value: 'KTNB', name: CommonService.translate("Kiểm toán nội bộ")},
                {value: 'KSNB', name: CommonService.translate("Kiểm soát nội bộ")},
                {value: 'QTRR', name: CommonService.translate("Quản trị rủi ro")},
                {value: 'PCHE', name: CommonService.translate("Pháp chế")}
            ];
        }

        vm.doSearch = function () {
            var grid = $("#rpDetail").data("kendoGrid");
            if (grid) {
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        }
        var recordRpDetail = 0;
        vm.countDetail = 0;
        vm.rpDetailGridOptions = kendoConfig.getGridOptions({
            autoBind: false,
            resizable: true,
            dataBinding: function () {
                recordRpDetail = (this.dataSource.page() - 1) * this.dataSource.pageSize();
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
                        vm.countDetail = response.total;
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
                        url: Constant.BASE_SERVICE_URL + "workAssignRsService/dosearchReportFollow",
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
                        return ++recordRpDetail;
                    },
                    width: "50px",
                    headerAttributes: {
                        style: "text-align:center;",
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
                    headerAttributes: { style: "text-align:center;",  translate: ""},
                    attributes: { style: "text-align:center;"},
                },
                {
                    title: CommonService.translate("Ngày ban hành"),
                    field: 'dateIssued',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Tháng"),
                    field: 'month',
                    width: "60px",
                    headerAttributes: { style: "text-align:center;",  translate: ""},
                    attributes: { style: "text-align:center;"},
                },
                {
                    title: CommonService.translate("Năm"),
                    field: 'year',
                    width: "60px",
                    headerAttributes: { style: "text-align:center;",  translate: ""},
                    attributes: { style: "text-align:center;"},
                },
                {
                    title: CommonService.translate("Mã WO"),
                    field: 'code',
                    width: "120px",
                    headerAttributes: { style: "text-align:center;",  translate: ""},
                    attributes: { style: "text-align:center;"},
                },
                {
                    title: CommonService.translate("Nội dung phát hiện"),
                    field: 'detection',
                    width: "200px",
                    headerAttributes: { style: "text-align:center;",  translate: ""},
                    attributes: { style: "text-align:center;"},
                },
                {
                    title: CommonService.translate("Nội dung kiến nghị kiểm toán"),
                    field: 'description',
                    width: "200px",
                    headerAttributes: { style: "text-align:center;",  translate: ""},
                    attributes: { style: "text-align:center;"},
                },
                {
                    title: CommonService.translate("Đơn vị thực hiện"),
                    field: 'sysGroupLv2Name',
                    width: "100px",
                    headerAttributes: { style: "text-align:center;",  translate: ""},
                    attributes: { style: "text-align:center;"},
                },
                {
                    title: CommonService.translate("Người chịu trách nhiệm"),
                    field: 'performers',
                    width: "120px",
                    headerAttributes: { style: "text-align:center;",  translate: ""},
                    attributes: { style: "text-align:center;"},
                },
                {
                    title: CommonService.translate("Thời hạn hoàn thành"),
                    field: 'closeDate',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Thời gian gia hạn hoàn thành"),
                    field: 'extendDateTo',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Đánh giá của kiểm toán viên"),
                    field: 'commentKtnb',
                    width: "200px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Kết luận"),
                    field: 'stateWo',
                    width: "200px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Lý do gia hạn"),
                    field: 'extendReason',
                    width: "200px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                }
            ]
        });
        function numberFormat(number) {
            return number.toLocaleString('it-IT', {style : 'currency', currency : 'VND'});
        }

        vm.splitDate = function(){
            if(vm.searchForm.date == null || vm.searchForm.date == ""){
                vm.searchForm.monthPunish = null;
                vm.searchForm.yearPunish = null;
            }
            else {
                var date = vm.searchForm.date;
                var str = date.split('/');
                vm.searchForm.monthPunish = str[0];
                vm.searchForm.yearPunish = str[1];
            }
        }

        vm.exportReport = function () {
            var obj = {};
            if (vm.searchForm.type == null) {
                toastr.error("Yêu cầu chọn loại WO!");
                return;
            }
            if (vm.searchForm.departmentCode == null) {
                toastr.error("Yêu cầu chọn bộ phận giao WO!");
                return;
            }
            if (vm.searchForm.type == "1") {
                obj.reportName = "BaoCaoTongHopTienPhatKhongHoanThanhWO";
                obj.sysGroupLv2Id = vm.searchForm.sysGroupLv2Id;
                obj.departmentCode = vm.searchForm.departmentCode?vm.searchForm.departmentCode.toUpperCase() : null;
            }
            if (vm.searchForm.type == "2") {
                if (vm.searchForm.departmentCode == 'PCHE'){
                    obj.reportName = "PhuLuc1BaoCaoTongHopTienPhatWO_PCHE";
                }
                else {
                    obj.reportName = "PhuLuc1BaoCaoTongHopTienPhatWO";
                }
                obj.sysGroupLv2Id = vm.searchForm.sysGroupLv2Id;
                obj.departmentCode = vm.searchForm.departmentCode?vm.searchForm.departmentCode.toUpperCase() : null;
            }
            if (vm.searchForm.type == "3") {
                if (vm.searchForm.departmentCode == 'PCHE'){
                    obj.reportName = "PhuLuc2BaoCaoTongHopTienPhatWO_PCHE";
                }
                else {
                    obj.reportName = "PhuLuc2BaoCaoTongHopTienPhatWO";
                }
                obj.sysGroupLv2Id = vm.searchForm.sysGroupLv2Id;
                obj.departmentCode = vm.searchForm.departmentCode?vm.searchForm.departmentCode.toUpperCase() : null;
            }

            obj.monthPunish = parseInt(vm.searchForm.monthPunish);
            obj.yearPunish = parseInt(vm.searchForm.yearPunish);
            obj.reportType = "EXCEL";
            var date = kendo.toString(new Date((new Date()).getTime()), "dd-MM-yyyy");
            CommonService.exportReport(obj).then(
                function (data) {
                    var binarydata = new Blob([data], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
                    kendo.saveAs({dataURI: binarydata, fileName: date + "_" + obj.reportName + '.xlsx'});
                }, function (errResponse) {
                    toastr.error(CommonService.translate("Lỗi không export EXCEL được!"));
                });
        };

        vm.isFirst = true;
        $scope.$watch("vm.searchForm.type", function () {
            if (vm.searchForm.type === "1") {
                vm.dataAvailable1 = true;
                vm.dataAvailable2 = false;
                vm.dataAvailable3 = false;
                if (!vm.isFirst) {
                    $("#rpPL1").data("kendoGrid").dataSource.data([]);
                    vm.countDetail = 0;

                }
            }
            if (vm.searchForm.type === "2") {
                vm.dataAvailable1 = false;
                vm.dataAvailable2 = true;
                vm.dataAvailable3 = false;
                if (!vm.isFirst) {
                    $("#rpDetail").data("kendoGrid").dataSource.data([]);
                    vm.countPL1 = 0;
                }
            }
            if (vm.searchForm.type === "3") {
                vm.dataAvailable1 = false;
                vm.dataAvailable2 = false;
                vm.dataAvailable3 = true;
                if (!vm.isFirst) {
                    $("#rpDetail").data("kendoGrid").dataSource.data([]);
                    vm.countPL2 = 0;
                }
            }
            vm.isFirst = false;
        });

        // =================================================
        //                  start don vi
        // =================================================
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
        // =================================================
        //                  End don vi
        // =================================================

        vm.clear = function (data) {
            switch (data) {
                case 'sysGroupId_search': {
                    vm.searchForm.sysGroupLv2Id = null;
                    vm.searchForm.sysGroupLv2Code = null;
                    vm.searchForm.sysGroupLv2Name = null;
                    break;
                }
                case 'code':{
                    vm.searchForm.code = null;
                }
                case 'nameDocument':{
                    vm.searchForm.nameDocument = null;
                }
            }
        }
        vm.exportExcelGrid = function () {
            kendo.ui.progress(vm.documentBody, true);
            var obj = angular.copy(vm.searchForm);
            obj.page = null;
            obj.pageSize = null;
            Restangular.all("workAssignRsService/dosearchReportFollow").post(obj).then(function (d) {
                kendo.ui.progress(vm.documentBody, false);
                var data = d.data;
                CommonService.exportFile(vm.rpDetail, data, [], vm.listConvert, CommonService.translate("Danh sách WO"));
            });
        }
    }
})();
