(function () {
    'use strict';
    var controllerId = 'reportNotDoneWoController';

    angular.module('MetronicApp').controller(controllerId, reportNotDoneWoFunc, '$scope', '$modal', '$rootScope');

    function reportNotDoneWoFunc($scope, $templateCache, $rootScope, $timeout,
                                gettextCatalog, $filter, kendoConfig, $kWindow,
                                htmlCommonService, CommonService, PopupConst, Restangular,
                                RestEndpoint, Constant, $http, $modal) {

        var vm = this;
        vm.dataResult = [];
        vm.searchForm = {};
        vm.String = CommonService.translate("Báo cáo") + " > " + CommonService.translate("Báo cáo quá hạn nhận việc hoặc quá hạn hoàn thành WO");
        vm.disableInputSysGroup = true;
        vm.documentBody = $(".tab-content");
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
            if (vm.searchForm.type == null) {
                toastr.error("Yêu cầu nhập loại WO!");
                return;
            }
            if(vm.searchForm.departmentCode == null) {
                toastr.error("Yêu cầu nhập bộ phận giao WO!");
                return;
            }
            if (vm.searchForm.type === "1") {
                var grid = $("#rpDetail").data("kendoGrid");
                if (grid) {
                    grid.dataSource.query({
                        page: 1,
                        pageSize: 10
                    });
                }
            }
            if (vm.searchForm.type === "2") {
                var grid = $("#rpPL1").data("kendoGrid");
                if (grid) {
                    grid.dataSource.query({
                        page: 1,
                        pageSize: 10
                    });
                }
            }
            if (vm.searchForm.type === "3") {
                var grid = $("#rpPL2").data("kendoGrid");
                if (grid) {
                    grid.dataSource.query({
                        page: 1,
                        pageSize: 10
                    });
                }
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
                        url: Constant.BASE_SERVICE_URL + "workAssignDetailRsService/doSearchReportDetail",
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
                    headerAttributes: { style: "text-align:center;",  translate: ""},
                    attributes: { style: "text-align:center;"},
                },
                {
                    title: CommonService.translate("Người ký"),
                    field: 'signedByName',
                    width: "100px",
                    headerAttributes: { style: "text-align:center;",  translate: ""},
                    attributes: { style: "text-align:center;"},
                },
                {
                    title: CommonService.translate("Chức vụ"),
                    field: 'positionName',
                    width: "100px",
                    headerAttributes: { style: "text-align:center;",  translate: ""},
                    attributes: { style: "text-align:center;"},
                },
                {
                    title: CommonService.translate("Nội dung văn bản"),
                    field: 'textContent',
                    width: "100px",
                    headerAttributes: { style: "text-align:center;",  translate: ""},
                    attributes: { style: "text-align:center;"},
                },
                {
                    title: CommonService.translate("Đơn vị thực hiện"),
                    field: 'sysGroupLv2Name',
                    width: "200px",
                    headerAttributes: { style: "text-align:center;",  translate: ""},
                    attributes: { style: "text-align:center;"},
                },
                {
                    title: CommonService.translate("Mã DV thực hiện"),
                    field: 'sysGroupLv2Code',
                    width: "100px",
                    headerAttributes: { style: "text-align:center;",  translate: ""},
                    attributes: { style: "text-align:center;"},
                },
                {
                    title: CommonService.translate("Bộ phận giao WO"),
                    field: 'departmentCode',
                    width: "100px",
                    headerAttributes: { style: "text-align:center;",  translate: ""},
                    attributes: { style: "text-align:center;"},
                },
                // {
                //     title: CommonService.translate("Mã WO"),
                //     field: 'code',
                //     width: "100px",
                //     headerAttributes: { style: "text-align:center;",  translate: ""},
                //     attributes: { style: "text-align:center;"},
                // },
                {
                    title: CommonService.translate("Tên WO"),
                    field: 'workName',
                    width: "200px",
                    headerAttributes: { style: "text-align:center;",  translate: ""},
                    attributes: { style: "text-align:center;"},
                },
                {
                    title: CommonService.translate("Mã WO"),
                    field: 'code',
                    width: "170px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Nội dung công việc"),
                    field: 'description',
                    width: "500px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Ngày giao việc"),
                    field: 'approveKtnbDate',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Ngày nhận việc"),
                    field: 'approveDvDate',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Thời hạn hoàn thành"),
                    field: 'closeDate',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Ngày nhân viên xác nhận hoàn thành"),
                    field: 'completeDate',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Ngày PC&KTNB xác nhận hoàn thành"),
                    field: 'verifyKtnbDate',
                    width: "170px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                // {
                //     title: CommonService.translate("Số ngày quá hạn"),
                //     field: 'performerName',
                //     width: "200px",
                //     headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                //     attributes: {style: "text-align:center;white-space:normal;"},
                //     columns: [
                //         {
                //             title: CommonService.translate("Quá hạn nhận việc"),
                //             field: 'lateWork',
                //             width: "100px",
                //             headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                //             attributes: {style: "text-align:center;white-space:normal;"},
                //             template:function (dataItem){return Math.abs(dataItem.lateWork)}
                //         },
                        {
                            title: CommonService.translate("Số ngày quá hạn hoàn thành"),
                            field: 'lateComplete',
                            width: "100px",
                            headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                            attributes: {style: "text-align:center;white-space:normal;"},
                        // }
                //     ]
                },
                // {
                //     title: CommonService.translate("Tiền phạt"),
                //     field: 'moneyPunish',
                //     width: "300px",
                //     headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                //     attributes: {style: "text-align:center;white-space:normal;"},
                //     columns: [
                //         {
                //             title: CommonService.translate("Phạt chậm nhận việc"),
                //             field: 'moneyPunishLateWork',
                //             width: "100px",
                //             headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                //             attributes: {style: "text-align:center;white-space:normal;"},
                //             template: function (dataItem) {return numberFormat(Math.abs(dataItem.lateWork) * 300000)}
                //         },
                        {
                            title: CommonService.translate("Số tiền phạt chậm hoàn thành"),
                            field: 'moneyPunishLateComplete',
                            width: "100px",
                            headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                            attributes: {style: "text-align:center;white-space:normal;"},
                            template: function (dataItem) {return numberFormat(Math.abs(dataItem.lateComplete) * 500000)}
                        },
                //         {
                //             title: CommonService.translate("Tổng tiền phạt"),
                //             field: 'performerName',
                //             width: "100px",
                //             headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                //             attributes: {style: "text-align:center;white-space:normal;"},
                //             template: function (dataItem) {return numberFormat((Math.abs(dataItem.lateComplete) * 500000) + (Math.abs(dataItem.lateWork) * 300000))}
                //         }
                //     ]
                // },
                // {
                //     title: CommonService.translate("Lỗi vi phạm"),
                //     field: "statusComplete",
                //     headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                //     attributes: {style: "text-align:center;white-space:normal;"},
                //     width: "150px",
                //     template: function (dataItem) {
                //         if(dataItem.lateComplete > 0 ){
                //             return "Lỗi nghiêm trọng";
                //         }else if (dataItem.lateWork < 0 ){
                //             return "Lỗi ít nghiêm trọng";
                //         }
                //         else return  ""
                //     }
                // },
                // {
                //     title: CommonService.translate("Loại lỗi"),
                //     field: 'completeDate',
                //     width: "150px",
                //     headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                //     attributes: {style: "text-align:center;white-space:normal;"},
                //     template: function (dataItem) {
                //         if(dataItem.lateComplete > 0 ){
                //             return "Chậm hoàn thành WO";
                //         }else if (dataItem.lateWork < 0 ){
                //             return "Chậm nhận việc";
                //         }
                //         else return  ""
                //     }
                // }
            ]
        });
        function numberFormat(number) {
            return number.toLocaleString('it-IT', {style : 'currency', currency : 'VND'});
        }

        var recordRpPL1 = 0;
        vm.countPL1 = 0;
        vm.rpPL1GridOptions = kendoConfig.getGridOptions({
            autoBind: false,
            resizable: true,
            dataBinding: function () {
                recordRpPL1 = (this.dataSource.page() - 1) * this.dataSource.pageSize();
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
                        vm.countPL1 = response.total;
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
                        url: Constant.BASE_SERVICE_URL + "workAssignDetailRsService/doSearchReportPL1",
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
                        return ++recordRpPL1;
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
                    title: CommonService.translate("Đơn vị bị áp chế tài"),
                    field: 'sysGroupCodeName',
                    width: "100px",
                    headerAttributes: {
                        style: "text-align:center;",
                        translate: ""
                    },
                    attributes: {
                        style: "text-align:center;"
                    },
                },
                {
                    title: CommonService.translate("Tổng tiền phạt (VNĐ)"),
                    field: 'moneyPunish',
                    width: "100px",
                    headerAttributes: {
                        style: "text-align:center;",
                        translate: ""
                    },
                    attributes: {
                        style: "text-align:center;"
                    },
                    template: function (dataItem) {return numberFormat((Math.abs(dataItem.lateComplete) * 500000) + (Math.abs(dataItem.lateWork) * 300000))}
                },
                {
                    title: CommonService.translate("Tháng xét phạt"),
                    field: 'monthPunish',
                    width: "100px",
                    headerAttributes: {
                        style: "text-align:center;",
                        translate: ""
                    },
                    attributes: {
                        style: "text-align:center;"
                    },
                },
                {
                    title: CommonService.translate("Năm xét phạt"),
                    field: 'yearPunish',
                    width: "100px",
                    headerAttributes: {
                        style: "text-align:center;",
                        translate: ""
                    },
                    attributes: {
                        style: "text-align:center;"
                    },
                }
            ]
        });

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

        var recordRpPL2 = 0;
        vm.countPL2 = 0;
        vm.rpPL2GridOptions = kendoConfig.getGridOptions({
            autoBind: false,
            resizable: true,
            dataBinding: function () {
                recordRpPL2 = (this.dataSource.page() - 1) * this.dataSource.pageSize();
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
                        vm.countPL2 = response.total;
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
                        url: Constant.BASE_SERVICE_URL + "workAssignDetailRsService/doSearchReportPL2",
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
                        return ++recordRpPL2;
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
                    title: CommonService.translate("Đơn vị bị áp chế tài"),
                    field: 'sysGroupCodeName',
                    width: "200px",
                    headerAttributes: {
                        style: "text-align:center;",
                        translate: ""
                    },
                    attributes: {
                        style: "text-align:center;"
                    },
                },
                {
                    title: CommonService.translate("Loại"),
                    field: 'typeFault',
                    width: "100px",
                    headerAttributes: {
                        style: "text-align:center;",
                        translate: ""
                    },
                    attributes: {
                        style: "text-align:center;"
                    },
                    template: function (dataItem) {
                        if(dataItem.lateComplete > 0 ){
                            return "Lỗi nghiêm trọng";
                        }
                        else if(dataItem.lateWork < 0 ){
                            return "Lỗi ít nghiêm trọng";
                        }else return "" ;
                    }
                },
                {
                    title: CommonService.translate("Tên lỗi"),
                    field: 'nameFault',
                    width: "100px",
                    headerAttributes: {
                        style: "text-align:center;",
                        translate: ""
                    },
                    attributes: {
                        style: "text-align:center;"
                    },
                    template: function (dataItem) {
                        if(dataItem.lateComplete > 0 ){
                            return "Chậm hoàn thành WO";
                        }
                        else if(dataItem.lateWork < 0 ){
                            return "Chậm nhận việc";
                        }else return "" ;
                    }

                },
                {
                    title: CommonService.translate("Mức phạt (VNĐ)"),
                    field: 'unitPunish',
                    width: "100px",
                    headerAttributes: {
                        style: "text-align:center;",
                        translate: ""
                    },
                    attributes: {
                        style: "text-align:center;"
                    },
                    template: function (dataItem) {
                        if(dataItem.lateComplete > 0 ){
                            return numberFormat((Math.abs(500000)))
                        }
                        else if(dataItem.lateWork < 0 ){
                            return numberFormat((Math.abs(300000)))
                        }else return "" ;
                    }
                },
                {
                    title: CommonService.translate("Số ngày chậm"),
                    field: 'lateDate',
                    width: "100px",
                    headerAttributes: {
                        style: "text-align:center;",
                        translate: ""
                    },
                    attributes: {
                        style: "text-align:center;"
                    },
                    template: function (dataItem) {
                        if(dataItem.lateComplete > 0 && dataItem.lateWork < 0){
                            return dataItem.lateComplete + Math.abs(dataItem.lateWork);
                        }
                        else if(dataItem.lateComplete > 0 ){
                            return dataItem.lateComplete;
                        }
                        else if(dataItem.lateWork < 0 ){
                            return Math.abs(dataItem.lateWork)
                        }else return "" ;
                    }
                },
                {
                    title: CommonService.translate("Số lượng lỗi"),
                    field: 'numberFault',
                    width: "100px",
                    headerAttributes: {
                        style: "text-align:center;",
                        translate: ""
                    },
                    attributes: {
                        style: "text-align:center;"
                    },
                    template: function (dataItem) {
                        if(dataItem.lateComplete > 0 ){
                            return dataItem.numberSerious;
                        }
                        else if(dataItem.lateWork < 0 ){
                            return dataItem.numberLessSerious;
                        }else return "" ;
                    }
                },
                {
                    title: CommonService.translate("Tổng tiền phạt (VNĐ)"),
                    field: 'moneyPunish',
                    width: "100px",
                    headerAttributes: {
                        style: "text-align:center;",
                        translate: ""
                    },
                    attributes: {
                        style: "text-align:center;"
                    },
                    template: function (dataItem) {
                        return numberFormat((Math.abs(dataItem.lateComplete) * 500000) + (Math.abs(dataItem.lateWork) * 300000))
                    }
                },
                {
                    title: CommonService.translate("Đơn vị áp chế tài"),
                    field: 'departmentCode',
                    width: "100px",
                    headerAttributes: {
                        style: "text-align:center;",
                        translate: ""
                    },
                    attributes: {
                        style: "text-align:center;"
                    },
                },
                {
                    title: CommonService.translate("Tháng xét phạt"),
                    field: 'monthPunish',
                    width: "100px",
                    headerAttributes: {
                        style: "text-align:center;",
                        translate: ""
                    },
                    attributes: {
                        style: "text-align:center;"
                    },
                },
                {
                    title: CommonService.translate("Năm xét phạt"),
                    field: 'yearPunish',
                    width: "100px",
                    headerAttributes: {
                        style: "text-align:center;",
                        translate: ""
                    },
                    attributes: {
                        style: "text-align:center;"
                    },
                }
            ]
        });

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
        vm.selectedSysGroup = false;
        vm.sysGroupOptions = {
            clearButton: false,
            dataTextField: "name",
            select: function (e) {
                vm.selectedSysGroup = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchForm.sysGroupLv2Name = dataItem.name;
                vm.searchForm.sysGroupLv2Id = dataItem.sysGroupId;
                vm.searchForm.sysGroupLv2Code = dataItem.code;
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
                    vm.searchForm.sysGroupLv2Code = null;
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
            vm.searchForm.sysGroupLv2Code = dataItem.code;
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
        // =================================================
        //                  End don vi
        // =================================================

        vm.clear = function (data) {
            switch (data) {
                case 'organization': {
                    vm.searchForm.sysGroupLv2Id = null;
                    vm.searchForm.sysGroupLv2Code = null;
                    vm.searchForm.sysGroupLv2Name = null;
                    break;
                }
                case 'departmentCode':{
                        vm.searchForm.departmentCode = null;
                }
            }
        }
    }
})();
