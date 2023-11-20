(function () {
    'use strict';
    var controllerId = 'dtttWoEmployeeController';

    angular.module('MetronicApp').controller(controllerId, dtttWoEmployeeController);

    function dtttWoEmployeeController($scope, $http, $timeout, $rootScope, $log, Constant, Restangular, CommonService, kendoConfig, $kWindow, dtttWoEmployeeService, RestEndpoint, gettextCatalog) {
        var vm = this;
        var modalComplete, modalReject, modalDetail;
        vm.modalBody = ".k-widget.k-window";
        vm.documentBody = $(".tab-content");
        vm.listFileAttach = [];
        vm.listFileGv = [];
        vm.indexFileAttach = 0;

        initFormData();

        //
        function initFormData() {
            $("#ktnb_searchForm_dtttWoEmployeeId").click(function (e) {
                console.log(vm.searchForm);
            });
            vm.String = CommonService.translate("Quản lý công việc phòng DTTT") + " > " + CommonService.translate("Quản lý công việc của nhân viên");
            vm.searchForm = {
                // isActive : "Y"
            };

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
            vm.statusDvnVerifyArray = [
                {id: 0, name: "Chờ xác nhận"},
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

        }

        // ----- Main Grid start
        vm.showHideColumnDetail = function (column) {
            var grid = vm.dtttWoEmployeeGrid;
            if (angular.isUndefined(column.hidden)) {
                grid.hideColumn(column);
            } else if (column.hidden) {
                grid.showColumn(column);
            } else {
                grid.hideColumn(column);
            }
            // CommonService.showHideColumnGrid(grid, column)
        };

        vm.gridColumnShowHideFilter = function (item) {
            return item.type == null || item.type !== 1;
        };
        vm.exportFile = function () {
            kendo.ui.progress(vm.documentBody, true);

            var obj = angular.copy(vm.searchForm);
            obj.page = null;
            obj.pageSize = null;

            dtttWoEmployeeService.doSearch(obj).then(function (d) {
                kendo.ui.progress(vm.documentBody, false);
                var data = d.data;
                CommonService.exportFile(vm.dtttWoEmployeeGrid, data, vm.listRemove, vm.listConvert,
                    "Danh sách chỉ tiêu");
            });
        };
        vm.listRemove = [{
            title: "Thao tác",
        }];
        vm.listConvert = [
            // {
            //     field: "isActive",
            //     data: {
            //         'Y': _ACTIVE,
            //         'N': _UNACTIVE
            //     }
            // }
        ];
        //
        var record = 0;
        // Grid colunm config
        vm.dtttWoEmployeeGridOptions = kendoConfig.getGridOptions({
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
                        url: Constant.BASE_SERVICE_URL + "dtttAssignDetailRsService/doSearchDtttWoEmployee",
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
            columns: [
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
                    field: "code",
                    title: CommonService.translate("Mã WO"),
                    template: '<a href="javascript:void(0);" title="#=code#" ng-click=vm.showDetail(dataItem)>#=code#</a>',
                    hidden: false,
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center"},
                    width: "120px",
                },
                {
                    title: CommonService.translate("Tên công việc"),
                    field: 'workName',
                    width: "120px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                }, {
                    title: CommonService.translate("Đơn vị giao việc"),
                    field: 'sysGroupDvgName',
                    width: "120px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
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
                    field: "assignDvnByName",
                    title: CommonService.translate("Người giao việc"),
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                    hidden: false,
                    width: "120px"

                },
                {
                    field: "statusDvnVerify",
                    title: CommonService.translate("Trạng thái DV xác nhận"),
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                    template: function (dataItem) {
                        vm.statusDvnVerifyArray.forEach(function (data) {
                            if (data.id == dataItem.statusDvnVerify) {
                                dataItem.statusDvnVerifyName = data.name;
                            }
                        });
                        return dataItem.statusDvnVerifyName ? dataItem.statusDvnVerifyName : '';
                    },
                    hidden: false,
                    width: "120px"

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
                            '<div class="text-center #=dtttWoEmployeeId#"">' +

                            '<button ng-if="dataItem.statusNvApprove == 0" style=" border: none; background-color: white;" class="#=dtttWoEmployeeId# icon_table ng-scope" uib-tooltip="Nhận việc" translate="" ' +
                            'ng-click="vm.acceptWork(dataItem)" > <i style="color:green;" class="fa fa-check ng-scope" aria-hidden="true"></i>' +
                            '</button>' +

                            '<button ng-if="dataItem.statusNvApprove == 1 && (dataItem.statusComplete == 0 ||dataItem.statusComplete == 1) " style=" border: none; background-color: white;" class="#=dtttWoEmployeeId# icon_table ng-scope" uib-tooltip="Giao việc cho người khác" translate="" ' +
                            'ng-click="vm.openAssignWorkToOther(dataItem)" > <i style="color:green;" class="fa fa-share ng-scope" aria-hidden="true"></i>' +
                            '</button>' +

                            '<button ng-if="dataItem.statusNvApprove == 1 && (dataItem.statusComplete == 0 ||dataItem.statusComplete == 1) " style=" border: none; background-color: white;" class="#=dtttWoEmployeeId# icon_table ng-scope" uib-tooltip="Thực hiện việc" translate="" ' +
                            'ng-click="vm.openDoWork(dataItem)" > <i style="color:#0b94ea;" class="fa fa-plus ng-scope" aria-hidden="true"></i>' +
                            '</button>' +

                            '<button ng-if="dataItem.statusNvApprove == 0" style=" border: none; background-color: white;" class="#=dtttWoEmployeeId# icon_table ng-scope" uib-tooltip="Từ chối" translate="" ' +
                            'ng-click="vm.openRejectView(dataItem)" > <i style="color:red;" class="fa fa-times ng-scope" aria-hidden="true"></i>' +
                            '</button>' +

                            '</div>'
                        )
                    },
                    width: "120px"
                }
            ],
        });

        vm.doSearch = doSearch;

        function doSearch() {
            if ($('.k-invalid-msg').is(':visible')) {
                return;
            }
            console.log(vm.searchForm);
            var grid = vm.dtttWoEmployeeGrid;
            CommonService.doSearchGrid(grid, {pageSize: grid.dataSource.pageSize()});
            // grid.refresh();
        };
        vm.openRejectView = function (dataItem) {
            vm.rejectForm = {};
            vm.rejectForm = angular.copy(dataItem);
            vm.typeCreate = 'rejectWork';
            var templateUrl = 'dttt/dtttWoEmployee/rejectPopup.html';
            var title = "Từ chối nhận việc";
            modalReject = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "30%", null, null);
        };

        vm.checkViewAssignToOther = false;
        vm.openAssignWorkToOther = function (dataItem) {
            vm.completeForm = {};
            dataItem.typeFile = "WODTTT";
            dtttWoEmployeeService.getDetail(dataItem).then(function (data) {
                vm.completeForm = angular.copy(data);
                vm.typeCreate = 'assignWorkToOther';
                vm.checkViewAssignToOther = true;
                var templateUrl = 'dttt/dtttWoEmployee/assignWorkToOtherPopup.html';
                var title = "Giao việc cho người khác";
                modalComplete = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "70%", null, null);
                vm.listFileGv = data.listAttachDocument;
                fillFileGv(vm.listFileGv);
                fillDataDtttAssignDetail(data.listDtttAssignDetail);
            }, function () {
                toastr.error(CommonService.translate("Có lỗi xảy ra"));
            });
        };

        vm.openDoWork = function (dataItem) {
            let obj = {};
            obj.dtttAssignDetailId = dataItem.dtttAssignDetailId;
            Restangular.all(RestEndpoint.DTTT_ASSIGN_DETAIL_SERVICE_URL + "/getDetailById").post(obj).then(function (data) {
                vm.completeForm = {};
                vm.completeForm = angular.copy(data);
                vm.typeCreate = 'completeWork';
                var templateUrl = 'dttt/dtttWoEmployee/completeWorkPopup.html';
                var title = "Thực hiện công việc";
                modalComplete = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "70%", null, null);
                fillFileTable(data.listFileAttach);
            });

        };

        vm.deleteRowWork = function (dataItem) {
            confirm("Xác nhận xoá bản ghi ?", function () {
                let dataWork = vm.listDtttAssignDetailGrid.dataSource._data;
                dataWork.splice(dataItem.stt - 1, 1);
                vm.obj.listSumaryPayCost = dataWork;
                vm.listDtttAssignDetailGrid.dataSource.read();
                vm.listDtttAssignDetailGrid.refresh();
            });
        }

        vm.showDetail = function (dataItem) {
            // let obj = {};
            vm.completeForm = {};
            dataItem.typeFile = "WODTTT";
            dtttWoEmployeeService.getDetail(dataItem).then(function (data) {
                vm.completeForm = angular.copy(data);
                vm.typeCreate = 'detail';
                vm.checkViewAssignToOther = true;
                var templateUrl = 'dttt/dtttWoEmployee/assignWorkToOtherPopup.html';
                var title = "Xem chi tiết";
                modalComplete = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "70%", null, null);
                // fillFileTable(data.listFileAttach);
                vm.listFileGv = data.listAttachDocument;
                fillFileGv(vm.listFileGv);
                fillDataDtttAssignDetail(data.listDtttAssignDetail);
            }, function () {
                toastr.error(CommonService.translate("Có lỗi xảy ra"));
            });
        }

        vm.saveItem = function () {
            if (vm.typeCreate === 'assignWorkToOther') {
                let obj = vm.completeForm;
                obj.listFileAttach = vm.listFileAttach;
                var lstDataGrid = vm.listDtttAssignDetailGrid.dataSource._data;
                obj.listDtttAssignDetail = lstDataGrid;
                kendo.ui.progress($(vm.modalBody), true);
                Restangular.all("dtttAssignRsService/assignWorkToOther").post(obj).then(function (response) {
                    kendo.ui.progress($(vm.modalBody), false);
                    if (response && response.error) {
                        toastr.error(response.error);
                    } else {
                        toastr.success("Ghi lại thành công");
                        vm.doSearch();
                        modalComplete.close();
                    }
                }).catch(function (err) {
                    kendo.ui.progress($(vm.modalBody), false);
                    console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
                });

            } if (vm.typeCreate === 'completeWork') {
                if (vm.completeForm.commentComplete == null || vm.completeForm.commentComplete == ""){
                    toastr.error("Chưa nhập Nội dung hoàn thành");
                    return;
                }
                let obj = vm.completeForm;
                obj.listFileAttach = vm.listFileAttach;
                kendo.ui.progress($(vm.modalBody), true);
                Restangular.all("dtttAssignDetailRsService/saveNvCompleteWork").post(obj).then(function (response) {
                    kendo.ui.progress($(vm.modalBody), false);
                    if (response && response.error) {
                        toastr.error(response.error);
                    } else {
                        toastr.success("Ghi lại thành công");
                        vm.doSearch();
                        modalComplete.close();
                    }
                }).catch(function (err) {
                    kendo.ui.progress($(vm.modalBody), false);
                    console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
                });

            } else if (vm.typeCreate === 'rejectWork') {
                if (vm.rejectForm.cancelNvDescription == null || vm.rejectForm.cancelNvDescription == ""){
                    toastr.error("Chưa nhập Lí do từ chối");
                    return;
                }
                var obj = vm.rejectForm;
                kendo.ui.progress($(vm.modalBody), true);
                Restangular.all("dtttAssignDetailRsService/saveNvRejectWork").post(obj).then(function (response) {
                    kendo.ui.progress($(vm.modalBody), false);
                    if (response && response.error) {
                        toastr.error(response.error);
                    } else {
                        toastr.success("Từ chối thành công");
                        vm.doSearch();
                        modalReject.close();
                    }
                }).catch(function (err) {
                    kendo.ui.progress($(vm.modalBody), false);
                    console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
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
        vm.acceptWork = function (dataItem) {
            var obj = {};
            obj.dtttAssignDetailId = dataItem.dtttAssignDetailId;
            confirm(CommonService.translate('Bạn đã sẵn sàng nhận WO này?'), function () {
                kendo.ui.progress($(vm.modalBody), true);
                Restangular.all("dtttAssignDetailRsService/acceptWork").post(obj).then(function (response) {
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
                vm.searchForm.sysGroupDvgName = dataItem.name;
                vm.searchForm.sysGroupDvgId = dataItem.sysGroupId;
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
                            keySearch: $("#sysGroupDvgId").val().trim(),
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
                    vm.searchForm.sysGroupDvgId = null;
                    vm.searchForm.sysGroupDvgName = null;
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
            vm.searchForm.sysGroupDvgName = dataItem.name;
            vm.searchForm.sysGroupDvgId = dataItem.sysGroupId;
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
        function fillFileGv(data){
            var dataSource = new kendo.data.DataSource({
                data: data,
                pageSize: 5
            });
            vm.gridFileGvOptions = kendoConfig.getGridOptions({
                autoBind: true,
                scrollable: false,
                resizable: true,
                editable: false,
                dataSource: dataSource,
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
                        template: dataItem =>
                            '<div class="text-center #=utilAttachDocumentId#" ng-if="caller.typeCreate != \'detail\'"> ' +
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
                vm.listFileAttach = $('#listAttachDocumentGrid').data('kendoGrid').dataSource.data();
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
                    
                        obj.objectId = vm.completeForm.dtttAssignDetailId;
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
            if (vm.searchForm.approveDvgDateFrom == null) {
                vm.errMessage = CommonService.translate("Ngày đến không được để trống");
                $("#dtttWoEmployee_approveDvgDateFrom").focus();
                return vm.errMessage;
            }
            let approveDvgDateFrom = kendo.parseDate(vm.searchForm.approveDvgDateFrom, "dd/MM/yyyy");
            let approveDvgDateTo = kendo.parseDate(vm.searchForm.approveDvgDateTo, "dd/MM/yyyy");
            let curDate = new Date();
            if (approveDvgDateFrom > curDate) {
                vm.errMessage = CommonService.translate("Ngày bắt đầu không được lớn hơn ngày hiện tại");
                $("#dtttWoEmployee_approveDvgDateFrom").focus();
                return vm.errMessage;
            } else if (approveDvgDateTo != null && approveDvgDateFrom > approveDvgDateTo) {
                vm.errMessage = CommonService.translate("Ngày bắt đầu không được lớn hơn ngày đến");
                $("#dtttWoEmployee_approveDvgDateFrom").focus();
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
                $("#dtttWoEmployee_approveDvgDateTo").focus();
                return vm.errMessage1;
            }
            let approveDvgDateFrom = kendo.parseDate(vm.searchForm.approveDvgDateFrom, "dd/MM/yyyy");
            let approveDvgDateTo = kendo.parseDate(vm.searchForm.approveDvgDateTo, "dd/MM/yyyy");
            let curDate = new Date();
            if (approveDvgDateTo > curDate) {
                vm.errMessage1 = CommonService.translate("Ngày bắt đầu không được lớn hơn ngày hiện tại");
                $("#dtttWoEmployee_approveDvgDateTo").focus();
                return vm.errMessage1;
            } else if (approveDvgDateFrom > approveDvgDateTo) {
                vm.errMessage1 = CommonService.translate("Ngày đến không được nhỏ hơn ngày bắt đầu");
                $("#dtttWoEmployee_approveDvgDateTo").focus();
                return vm.errMessage1;
            } else if (approveDvgDateFrom <= approveDvgDateTo) {
                vm.errMessage = '';
                vm.errMessage1 = '';
                return vm.errMessage1;
            }
        };

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
                editable: true,
                dataBinding: function () {
                    recordWAD = (this.dataSource.page() - 1) * this.dataSource.pageSize();
                },
                toolbar: [
                    {
                        name: "actions",
                        template: '<div class=" pull-left "  ng-if="caller.typeCreate == \'assignWorkToOther\' ">' +
                            '<button class="btn btn-qlk padding-search-right addQLK ng-scope"' +
                            'ng-click="caller.listDtttAssignDetailGrid.addRow()" ' +
                            'uib-tooltip="Thêm công việc" style="width: 200px" translate>Thêm công việc</button>' +
                            '</div>'
                    }
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
                        editable: function (dataItem) {
                            return vm.typeCreate == 'assignWorkToOther';
                        },
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        type: "text",
                        attributes: {
                            style: "text-align:left;"
                        }
                    }, {
                        title: CommonService.translate("Nội dung chi tiết"),
                        field: "description",
                        width: "50px",
                        type: "text",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        editable: function (dataItem) {
                            return vm.typeCreate == 'assignWorkToOther';
                        },
                    }, {
                        title: CommonService.translate("Nhân viên thực hiện chính"),
                        field: "performerName",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        editable: function (dataItem) {
                            return vm.typeCreate == 'assignWorkToOther';
                        },
                        editor: mainStaffAutoCompleteEditor,
                        width: "70px",
                        // editable: function (dataItem) {
                        //     return (dataItem.isKtnbReject == 1 || dataItem.statusNvApprove != 1) && vm.typeCreate != 'detail';
                        // },
                        type: "text",
                    }, {
                        title: CommonService.translate("Nhân viên thực hiện cùng"),
                        field: "performerTogether",
                        width: "200px",
                        // editable: function (dataItem) {
                        //     return (dataItem.isKtnbReject == 1 || dataItem.statusNvApprove != 1) && vm.typeCreate != 'assignWorkToOther';
                        // },
                        editable: function (dataItem) {
                            return vm.typeCreate == 'assignWorkToOther';
                        },
                        headerAttributes: {style: "text-align:center;white-space:normal;"},
                        type: "text",
                        template: function (dataItem) {
                            // if (!((dataItem.isKtnbReject == 1 || dataItem.statusNvApprove != 1) && vm.typeCreate != 'detail')) {
                            //     return dataItem.performerTogether == null ? '' : dataItem.performerTogether;

                            if (!( vm.typeCreate == 'assignWorkToOther')) {
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
                        width: "70px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        editable: false,
                        type: "text",
                    }, {
                        title: CommonService.translate("Lý do chỉ huy đơn vị từ chối đóng việc"),
                        field: "rejectDvnDescription",
                        width: "70px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        editable: false,
                        type: "text",
                    },
                    {
                        title: CommonService.translate("File hoàn thành"),
                        width: "120px",
                        template: function (dataItem) {
                            var result = '';
                            if (dataItem.listFileAttach && dataItem.listFileAttach.length > 0) {
                                for (let i = 0; i < dataItem.listFileAttach.length; i++) {
                                    result += '<a ng-click="caller.downloadFileByPath(\'' + dataItem.listFileAttach[i].filePath + '\')"' + '>' + dataItem.listFileAttach[i].name + '</a><br>';
                                }
                            }
                            return result;
                        },
                    },
                    {
                        title: CommonService.translate("Xóa"),
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold",
                            translate: ""
                        },
                        editable: false,
                        template: dataItem =>
                            '<div class="text-center" ng-if="caller.typeCreate == \'assignWorkToOther\'" > ' +
                            '<button style=" border: none;" class="icon_table" uib-tooltip="Xóa" ng-click="caller.removeRowDetail(dataItem)"  translate>  ' +
                            '<i style="color: steelblue;" class="fa fa-trash" ria-hidden="true"></i>' +
                            '</button>' +
                            '</div>',
                        width: '30px',
                        type: "text"
                    }
                ]
            });
        }

        vm.checkViewDetail = function(){
            if (vm.typeCreate == 'detail'){
                return true;
            }
            return false;
        }

        vm.downloadFileByPath = function (filePath) {
            window.location = Constant.BASE_SERVICE_URL + "fileservice/downloadFileATTT?" + filePath;
        }

        // var modalAddWork = null;
        // vm.addDtttAssignDetail = function () {
        //     vm.addDetailForm = {};
        //     var templateUrl = 'dttt/dtttWoEmployee/addWorkPopup.html';
        //     var title = CommonService.translate("Thêm mới công việc");
        //     modalAddWork = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "40%", "30%", null, null);
        // }

        vm.removeRowDetail =  function (dataItem) {
            confirm(CommonService.translate("Xác nhận xóa"), function () {
                $('#listDtttAssignDetailGrid').data('kendoGrid').dataSource.remove(dataItem);
                // vm.listFileAttach = $('#listDtttAssignDetailGrid').data('kendoGrid').dataSource.data();
            })
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
                                        sysGroupId: vm.completeForm.sysGroupDvnId,
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
            vm.commonPopupSearch.sysGroupId = vm.completeForm.sysGroupDvnId;
            var api = "commonRsService/getSysUserSgLv2ForAutoComplete";
            CommonService.fillDataPopupCommonSearch(api, vm.commonPopupSearch, togetherByColumns, vm);
        }

        vm.saveSelectTogether = function (dataItem) {
            var lstGrid = vm.listDtttAssignDetailGrid.dataSource.data();
            for (let i = 0; i < lstGrid.length; i++) {
                if (lstGrid[i].dtttAssignDetailId == vm.commonPopupSearch.dtttAssignDetailId) {
                    if (lstGrid[i].performerTogether != null) {
                        lstGrid[i].performerTogether += "," + dataItem.codeName;
                    } else {
                        lstGrid[i].performerTogether = dataItem.codeName;
                    }

                }
            }
            vm.listDtttAssignDetailGrid.dataSource.data(lstGrid);
            vm.listDtttAssignDetailGrid.refresh();
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
        // * end popup common

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
                    vm.searchForm.statusDvnVerify = null;
                    break;
                case 'typeWo':
                    vm.searchForm.typeWo = null;
                    break;
                case 'sysGroupDvgId':
                    vm.searchForm.sysGroupDvgId = null;
                    vm.searchForm.sysGroupDvgName = null;
                    vm.searchForm.sysGroupDvgCode = null;
                    break;
            }
        }
    }
})();
