(function () {
    'use strict';
    var controllerId = 'assignmentManagementController';

    angular.module('MetronicApp').controller(controllerId, assignmentManagementFnc);
    function assignmentManagementFnc($scope, $window, $http, $timeout, $rootScope, $log, Constant, Restangular, CommonService, kendoConfig, reportASsignmentWOService, $kWindow, RestEndpoint, gettextCatalog) {
        var vm = this;
        var record = 0;
        vm.documentBody = $("#assignmentManagement");

        vm.searchForm = {
            page: 1,
            pageSize: 10,
            keySearch: null,
            woType: null,
            startDate: null,
            endDate: null,
            woStatus: null,
            woVerifyStatus: null,
            creatorName: null,
            createBy: null,
            woEmployeeGroupId: null,
            woDateStatus: null,
        }
        vm.listLoaiWO = [
            { name: 'Giao việc ngành dọc P.TCLĐ', value: 1 },
            { name: 'Cập nhật thông tin CBNV mới', value: 2 }
        ]

        vm.listTinhTrangDuyetDongWO = [
            { name: "Chờ duyệt", value: 0 },
            { name: "Đã duyệt", value: 1 },
            { name: "Từ chối", value: 2 },
        ]

        vm.listTrangThaiWO = [
            { name: "Dự thảo", value: 0 },
            { name: "Hiệu lực", value: 1 },
            { name: "Hết hiệu lực", value: 2 },
        ]
        vm.listTinhTrangWO = [
            { name: "Trong hạn", value: 1 },
            { name: "Quá hạn", value: 2 },

        ]

        initFormData();
        function initFormData() {
            vm.string = CommonService.translate("Quản lý giao việc của P.Tổ chức lao động") + " > " + CommonService.translate("Báo cáo tổng hơp WO");
            fillDataSource([])

            vm.checkExpiredDate = function checkExpiredDate(dataItem) {
                const d = new Date()
                const date = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`.split('/')
                const end = dataItem.endDate
                if (!end) return false

                // const today = new Date(date.split('/').reverse().join('-'));
                const today = new Date(+date[2], +date[1], +date[0]);
                const dateEnd = new Date(+end.split('/')[2], +end.split('/')[1], +end.split('/')[0])
                if (today - dateEnd == 0) return false
                if (today - dateEnd > 0) return true
                if (today - dateEnd < 0) return false
            }



        }

        vm.doSearch = function () {

            if (vm.searchForm.startDate && vm.searchForm.startDate.split('/')[1] > 12) {
                toastr.error("Vui lòng nhập đúng định dạng bắt đầu ngày dd/mm/yyyy");
                return;
            }

            if (vm.searchForm.endDate && vm.searchForm.endDate.split('/')[1] > 12) {
                toastr.error("Vui lòng nhập đúng định dạng ngày kết thúc dd/mm/yyyy");
                return;
            }
            if (vm.searchForm.startDate && vm.searchForm.endDate) {
                var d1 = kendo.parseDate(vm.searchForm.startDate, "dd/MM/yyyy");
                var d2 = kendo.parseDate(vm.searchForm.endDate, "dd/MM/yyyy");
                if (d1 > d2) {
                    toastr.error("Ngày bắt đầu tìm kiếm phải nhỏ hơn bằng ngày kết thúc tìm kiếm");
                    return;
                }
            }

            var grid = vm.reportAssignmentWOGrid
            if (grid) {
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        }

        function initDataAddFunction() {
            $("#assiManagement_add_popupId_add_popupId").click(function (e) {
            });
            setTimeout(function () {
                $(".k-icon .k-clear-value .k-i-close").remove();
            }, 10);
        }

        function fillDataSource(data) {

            vm.reportAssignmentWOGridOptions = kendoConfig.getGridOptions({
                autoBind: true,
                resizable: true,
                scrollable: true,
                toolbar: [],
                dataBinding: function (options) {
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
                            vm.count = response.total
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
                            url: Constant.BASE_SERVICE_URL + "workAssignTCLDService/search_export",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, type) {
                            vm.searchForm.page = options.page;
                            vm.searchForm.pageSize = options.pageSize;
                            const payload = {
                                ...vm.searchForm,
                                keySearch: vm.searchForm.keySearch ? vm.searchForm.keySearch.trim() : null,
                                creatorName: vm.searchForm.creatorName ? vm.searchForm.creatorName.trim() : null,
                                woType: vm.searchForm.woType !== null && vm.searchForm.woType !== '' ? +(vm.searchForm.woType) : null,
                                woStatus: vm.searchForm.woStatus !== null && vm.searchForm.woStatus !== '' ? +(vm.searchForm.woStatus) : null,
                                woDateStatus: vm.searchForm.woDateStatus !== null && vm.searchForm.woDateStatus !== '' ? +(vm.searchForm.woDateStatus) : null,
                                woVerifyStatus: vm.searchForm.woVerifyStatus !== null && vm.searchForm.woVerifyStatus !== '' ? +(vm.searchForm.woVerifyStatus) : null,
                            }
                            return JSON.stringify(payload);
                        }
                    },
                    pageSize: 10,
                    page: 1,

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
                        title: CommonService.translate("STT"),
                        field: "stt",
                        template: function (dataItem) {
                            ++record
                            const stt = (vm.reportAssignmentWOGrid.dataSource.page() - 1) * vm.reportAssignmentWOGrid.dataSource.pageSize() + vm.reportAssignmentWOGrid.dataSource.data().indexOf(dataItem) + 1
                            return stt
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
                        title: CommonService.translate("Mã WO"),
                        field: 'woCode',
                        width: "110px",
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
                        title: CommonService.translate("Loại WO"),
                        field: 'woType',
                        width: "180px",
                        template: function (dataItem) {
                            if (dataItem.woType == 1) {
                                return CommonService.translate("Giao việc ngành dọc P.TCLĐ");
                            }
                            return CommonService.translate("Cập nhật thông tin CBNV mới");

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
                    // {
                    //     title: CommonService.translate("Tên WO"),
                    //     field: 'woName',
                    //     width: "180px",
                    //     headerAttributes: {
                    //         "class": "table-header-cell",
                    //         style: "text-align: center; font-weight: bold;white-space:normal;"
                    //     },
                    //     attributes: {
                    //         "class": "table-cell",
                    //         style: "text-align: left; "
                    //     },
                    // }, 
                    {
                        title: CommonService.translate("Nội dung công việc"),
                        field: 'woName',
                        width: "250px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; white-space:normal; "
                        },

                    }, {
                        title: CommonService.translate("Thời hạn hoàn thành"),
                        field: 'endDate',
                        width: "100px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; white-space:normal;  "
                        },
                    },
                    {
                        title: CommonService.translate("Người tạo"),
                        field: 'creatorName',
                        width: "130px",
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
                        title: CommonService.translate("Nhân viên thực hiện"),
                        field: 'woEmployeeName',
                        width: "130px",
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
                        title: CommonService.translate("Đơn vị"),
                        field: 'woEmployeeGroupName',
                        width: "250px",
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
                        title: CommonService.translate("Thời gian hoàn thành"),
                        field: 'woEmployeeCompleteDate',
                        width: "100px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center;  white-space:normal; "
                        },
                    },
                    {
                        title: CommonService.translate("Trạng thái nhân viên thực hiện"),
                        field: 'woEmployeeStatus',
                        width: "120px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; "
                        },
                        template: (dataItem) => {
                            if (dataItem.woEmployeeStatus === 0) return 'Chưa nhận việc'
                            if (dataItem.woEmployeeStatus === 1) return 'Đã nhận việc'
                            if (dataItem.woEmployeeStatus === 2) return 'Từ chối'
                            if (dataItem.woEmployeeStatus === 3) return 'Đã hoàn thành'
                            if (!dataItem.woEmployeeStatus) return ''
                        }
                    },

                    {
                        title: CommonService.translate("Tình trạng duyệt đóng WO của P.TCLĐ"),
                        field: 'woVerifyStatus',
                        width: "100px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; "
                        },
                        template: (dataItem) => {
                            if (dataItem.woVerifyStatus === 0) return 'Chờ duyệt'
                            if (dataItem.woVerifyStatus === 1) return 'Đã duyệt'
                            if (dataItem.woVerifyStatus === 2) return 'Từ chối'
                            if (!dataItem.woVerifyStatus) return ''
                        }
                    },
                    {
                        title: CommonService.translate("Ngày duyệt của P.TCLĐ"),
                        field: 'closeDate',
                        width: "100px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; "
                        }
                    },
                    {
                        title: CommonService.translate("Tình trạng thực hiện"),
                        field: 'statusStr',
                        width: "100px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; "
                        },
                        // template: (dataItem) => {
                        //     dataItem.tinhtrang = !vm.checkExpiredDate(dataItem) ? 'Trong hạn' : 'Quá hạn'
                        //     return !vm.checkExpiredDate(dataItem) ? 'Trong hạn' : 'Quá hạn'
                        // },
                    },
                    {
                        title: CommonService.translate("Số ngày quá hạn"),
                        field: 'outOfDate',
                        width: "80px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; "
                        }
                    }
                ]
            });

        }

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

                vm.searchForm.woEmployeeGroupId = dataItem.sysGroupId;
                // getSequenceIncidentCode(dataItem.code)



            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSysGroupDvg) {
                        vm.sysGroupName = null;
                        vm.searchForm.sysGroupId = null;

                        // --------- Chức năng thêm mới -----------
                        vm.insertForm.sysGroupName = null;
                        vm.insertForm.sysGroupId = null;

                        vm.insertForm.code = null;
                        vm.insertFormDisplay.areaName = null;
                    }
                }, 100);
            },
            close: function (e) {
            },
            pageSize: 10,
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        vm.isSelectSysGroupDvg = false;
                        return Restangular.all("commonRsService/getSysGroupForAutoComplete").post(
                            {
                                keySearch: vm.searchForm.woEmployeeGroupName,
                                // groupLevelLst: ['2', '3'],
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

        vm.exportFile = function () {
            kendo.ui.progress(vm.documentBody, true);
            const columns = vm.reportAssignmentWOGrid.columns
            columns.shift()
            const grid = { ...vm.reportAssignmentWOGrid, columns: columns }
            var obj = angular.copy(vm.searchForm);
            obj.page = null;
            obj.pageSize = null;
            reportASsignmentWOService.doSearch(obj).then(function (d) {
                kendo.ui.progress(vm.documentBody, false);
                var data = d.data.map(t => {
                    if (t.woEmployeeStatus === 0) { t.woEmployeeStatus = 'Chưa nhận việc' }
                    if (t.woEmployeeStatus === 1) { t.woEmployeeStatus = 'Đã nhận việc' }
                    if (t.woEmployeeStatus === 2) { t.woEmployeeStatus = 'Từ chối' }
                    if (t.woEmployeeStatus === 3) { t.woEmployeeStatus = 'Đã hoàn thành' }
                    if (!t.woEmployeeStatus) { t.woEmployeeStatus = '' }

                    if (t.woApproveStatus === 0) { t.woApproveStatus = 'Chờ duyệt' }
                    if (t.woApproveStatus === 1) { t.woApproveStatus = 'Đã duyệt' }
                    if (t.woApproveStatus === 2) { t.woApproveStatus = 'Từ chối' }
                    if (!t.woApproveStatus) { t.woApproveStatus = '' }

                    if (t.woStatus === 0) { t.woStatus = 'Dự thảo' }
                    if (t.woStatus === 1) { t.woStatus = 'Hiệu lực' }
                    if (t.woStatus === 2) { t.woStatus = 'Hết hiệu lực' }
                    if (!t.woStatus) { t.woStatus = '' }

                    if (t.woVerifyStatus === 0) { t.woVerifyStatus = 'Chờ duyệt' }
                    if (t.woVerifyStatus === 1) { t.woVerifyStatus = 'Đã duyệt' }
                    if (t.woVerifyStatus === 2) { t.woVerifyStatus = 'Từ chối' }
                    if (!t.woVerifyStatus) { t.woVerifyStatus = '' }
                    t.tinhtrang = !vm.checkExpiredDate(t) ? 'Trong hạn' : 'Quá hạn'

                    return {
                        ...t,
                        woType: t.woType == 1 ? CommonService.translate("Giao việc ngành dọc P.TCLĐ") : CommonService.translate("Cập nhật thông tin CBNV mới"),
                    }
                })
                CommonService.exportFile(grid, data, vm.listRemove, [], "Báo cáo tổng hợp WO");
            });
        };
        vm.listRemove = [{
            title: "Thao tác",
        }];

        vm.createBySearchOptions = {
            clearButton: false,
            dataTextField: "name", placeholder: CommonService.translate("Nhập tên/mã nhân viên"),
            dataValueField: "name",
            open: function (e) {
                vm.isSelectSearchCreateBy = false;
            },
            select: function (e) {
                vm.isSelectSearchCreateBy = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchForm.createBy = dataItem.sysUserId;
                vm.searchForm.creatorName = dataItem.fullName;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSearchCreateBy) {
                        vm.searchForm.createBy = null;
                        vm.searchForm.creatorName = null;
                    }
                }, 100);
            },
            close: function (e) {
                // $timeout(function () {
                //     if (vm.searchForm.createBy == null) {
                //         vm.searchForm.creatorName = null;
                //     }
                // }, 1000);

            },
            pageSize: 10,
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        vm.isSelectSearchCreateBy = false;
                        return Restangular.all("commonRsService/getSysUserForAutoComplete").post(
                            {
                                keySearch: vm.searchForm.creatorName,
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

        vm.exportFile = function () {
            kendo.ui.progress(vm.documentBody, true);
            const columns = vm.reportAssignmentWOGrid.columns
            columns.shift()
            const grid = { ...vm.reportAssignmentWOGrid, columns: columns }
            var obj = angular.copy(vm.searchForm);
            obj.page = null;
            obj.pageSize = null;
            reportASsignmentWOService.doSearch(obj).then(function (d) {
                kendo.ui.progress(vm.documentBody, false);
                var data = d.data.map(t => {
                    if (t.woEmployeeStatus === 0) { t.woEmployeeStatus = 'Chưa xác nhận' }
                    if (t.woEmployeeStatus === 1) { t.woEmployeeStatus = 'Đồng ý' }
                    if (t.woEmployeeStatus === 2) { t.woEmployeeStatus = 'Từ chối' }
                    if (t.woEmployeeStatus === 3) { t.woEmployeeStatus = 'Đã hoàn thành' }
                    if (!t.woEmployeeStatus) { t.woEmployeeStatus = '' }

                    if (t.woApproveStatus === 0) { t.woApproveStatus = 'Chờ duyệt' }
                    if (t.woApproveStatus === 1) { t.woApproveStatus = 'Đã duyệt' }
                    if (t.woApproveStatus === 2) { t.woApproveStatus = 'Từ chối' }
                    if (!t.woApproveStatus) { t.woApproveStatus = '' }

                    if (t.woStatus === 0) { t.woStatus = 'Dự thảo' }
                    if (t.woStatus === 1) { t.woStatus = 'Hiệu lực' }
                    if (t.woStatus === 2) { t.woStatus = 'Hết hiệu lực' }
                    if (!t.woStatus) { t.woStatus = '' }
                    t.tinhtrang = !vm.checkExpiredDate(t) ? 'Trong hạn' : 'Quá hạn'

                    return {
                        ...t,
                        woType: t.woType == 1 ? CommonService.translate("Giao việc ngành dọc P.TCLĐ") : CommonService.translate("Cập nhật thông tin CBNV mới"),
                    }
                })
                const date = `${new Date().getDate().toString().padStart(2, '0')}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${new Date().getFullYear()}`
                CommonService.exportFile(grid, data, vm.listRemove, [], `${date}_BaoCaoTongHopWO`);
            });
        };

    }
})();
