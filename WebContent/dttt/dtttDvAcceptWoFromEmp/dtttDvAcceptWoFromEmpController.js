(function () {
    'use strict';
    var controllerId = 'dtttDvAcceptWoFromEmpController';

    angular.module('MetronicApp').controller(controllerId, dtttDvAcceptWoFromEmpController);

    function dtttDvAcceptWoFromEmpController($scope, $http, $timeout, $rootScope, $log, Constant, Restangular, CommonService, kendoConfig, $kWindow, dtttDvAcceptWoFromEmpService, RestEndpoint, gettextCatalog) {
        var vm = this;
        var modalComplete, modalReject, modalDetail;
        vm.listWorkAssignDetailExportTemp = [];
        vm.modalBody = ".k-widget.k-window";
        vm.documentBody = $(".tab-content");
        vm.listFileAttach = [];
        vm.indexFileAttach = 0;

        initFormData();

        //
        function initFormData() {
            $("#dttt_searchForm_dtttDvAcceptWoFromEmpId").click(function (e) {
                console.log(vm.searchForm);
            });
            vm.String = CommonService.translate("Quản lý công việc của đơn vị") + " > " + CommonService.translate("Đơn vị xác nhận công việc từ nhân viên");
            vm.searchForm = {

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
            checkPermissionDvnApprove();
        }

        // ----- Main Grid start
        vm.showHideColumnDetail = function (column) {
            var grid = vm.dtttDvAcceptWoFromEmpGrid;
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

            dtttDvAcceptWoFromEmpService.doSearch(obj).then(function (d) {
                kendo.ui.progress(vm.documentBody, false);
                var data = d.data;
                CommonService.exportFile(vm.dtttDvAcceptWoFromEmpGrid, data, vm.listRemove, vm.listConvert,
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
        vm.dtttDvAcceptWoFromEmpGridOptions = kendoConfig.getGridOptions({
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
                        url: Constant.BASE_SERVICE_URL + "dtttAssignDetailRsService/doSearchDtttDvAcceptWoFromEmp",
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
                    width: "120px"

                },
                {
                    field: "workName",
                    title: CommonService.translate("Tên công việc"),
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
                            '<div class="text-center #=dtttDvAcceptWoFromEmpId#"">' +

                            '<button ng-if="vm.isRoleApprove && dataItem.statusComplete == 2 && dataItem.statusDvnVerify == 0" style=" border: none; background-color: white;" class="#=dtttDvAcceptWoFromEmpId# icon_table ng-scope" uib-tooltip="Xác nhận hoàn thành" translate="" ' +
                            'ng-click="vm.openDvAcceptCompleteWork(dataItem)" > <i style="color:green;" class="fa fa-check ng-scope" aria-hidden="true"></i>' +
                            '</button>' +

                            '<button ng-if="vm.isRoleApprove && dataItem.statusComplete == 2 && dataItem.statusDvnVerify == 0" style=" border: none; background-color: white;" class="#=dtttDvAcceptWoFromEmpId# icon_table ng-scope" uib-tooltip="Từ chối" translate="" ' +
                            'ng-click="vm.openRejectView(dataItem)" > <i style="color:red;" class="fa fa-times ng-scope" aria-hidden="true"></i>' +
                            '</button>' +

                            '</div>'
                        )
                    },
                    width: "120px"
                }
            ],
        });

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

        vm.doSearch = doSearch;

        function doSearch() {
            if ($('.k-invalid-msg').is(':visible')) {
                return;
            }
            console.log(vm.searchForm);
            var grid = vm.dtttDvAcceptWoFromEmpGrid;
            CommonService.doSearchGrid(grid, {pageSize: grid.dataSource.pageSize()});
            // grid.refresh();
        };
        vm.openRejectView = function (dataItem) {
            vm.completeForm = dataItem;
            vm.typeCreate = 'rejectWork';
            var templateUrl = 'dttt/dtttDvAcceptWoFromEmp/rejectPopup.html';
            var title = "Từ chối hoàn thành";
            modalReject = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "30%", null, null);
        };

        vm.openRejectView2 = function (dataItem) {
            vm.completeForm = dataItem;
            vm.typeCreate = 'rejectWorkWhenOpenComplete';
            var templateUrl = 'dttt/dtttDvAcceptWoFromEmp/rejectPopup.html';
            var title = "Từ chối hoàn thành";
            modalReject = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "30%", null, null);
        };
        vm.openDvAcceptCompleteWork = function (dataItem) {
            let obj = {};
            obj.dtttAssignDetailId = dataItem.dtttAssignDetailId;
            kendo.ui.progress($(vm.modalBody), true);
            Restangular.all(RestEndpoint.DTTT_ASSIGN_DETAIL_SERVICE_URL + "/getDetailById").post(obj).then(function (data) {
                kendo.ui.progress($(vm.modalBody), false);
                vm.completeForm = {};
                vm.completeForm = angular.copy(data);
                vm.typeCreate = 'completeWork';
                var templateUrl = 'dttt/dtttDvAcceptWoFromEmp/completeWorkPopup.html';
                var title = "Xác nhận hoàn thành";
                modalComplete = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "70%", null, null);
                fillFileTable(data.listFileAttach);
            });
        };

        vm.showDetail = function (dataItem) {
            let obj = {};
            obj.dtttAssignDetailId = dataItem.dtttAssignDetailId;
            kendo.ui.progress($(vm.modalBody), true);
            Restangular.all(RestEndpoint.DTTT_ASSIGN_DETAIL_SERVICE_URL + "/getDetailById").post(obj).then(function (data) {
                kendo.ui.progress($(vm.modalBody), false);
                vm.completeForm = {};
                vm.completeForm = angular.copy(data);
                vm.typeCreate = 'detail';
                var templateUrl = 'dttt/dtttDvAcceptWoFromEmp/completeWorkPopup.html';
                var title = "Xem chi tiết";
                modalComplete = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "70%", null, null);
                fillFileTable(data.listFileAttach);
            });
        }

        // function fillFileGv(data){
        //     var dataSource = new kendo.data.DataSource({
        //         data: data,
        //         pageSize: 5
        //     });
        //     vm.gridFileGvOptions = kendoConfig.getGridOptions({
        //         autoBind: true,
        //         scrollable: false,
        //         resizable: true,
        //         editable: false,
        //         dataSource: dataSource,
        //         save: function () {
        //             vm.listFileGvGrid.refresh();
        //         },
        //         messages: {
        //             noRecords: gettextCatalog.getString(CommonService.translate("Không có kết quả hiển thị"))
        //         },
        //         pageable: {
        //             refresh: false,
        //             pageSizes: [10, 15, 20, 25],
        //             messages: {
        //                 display: CommonService.translate("{0}-{1} của {2} kết quả"),
        //                 itemsPerPage: CommonService.translate("kết quả/trang"),
        //                 empty: CommonService.translate("Không có kết quả hiển thị")
        //             }
        //         },
        //         columns: [
        //             {
        //                 title: CommonService.translate("STT"),
        //                 field: "stt",
        //                 template: dataItem => $("#listFileGvGrid").data("kendoGrid").dataSource.indexOf(dataItem) + 1,
        //                 width: '10%',
        //                 columnMenu: false,
        //                 headerAttributes: {style: "text-align:center;font-weight: bold;", translate: ""},
        //                 attributes: {
        //                     style: "text-align:center;"
        //                 },
        //                 type: 'text',
        //                 editable: false
        //             },
        //             {
        //                 title: CommonService.translate("Tên file"),
        //                 width: '30%',
        //                 field: "name",
        //                 headerAttributes: {style: "text-align:center;font-weight: bold;", translate: ""},
        //                 attributes: {
        //                     style: "text-align:left;"
        //                 },
        //                 type: 'text',
        //                 editable: false,
        //                 template: function (dataItem) {
        //                     return "<a href='' ng-click='caller.downloadFile(dataItem)'>" + dataItem.name + "</a>";
        //                 }
        //             },
        //             {
        //                 title: CommonService.translate("Ngày upload"),
        //                 field: 'createdDate',
        //                 width: '20%',
        //                 headerAttributes: {style: "text-align:center;font-weight: bold;", translate: ""},
        //                 attributes: {
        //                     style: "text-align:left;"
        //                 },
        //                 type: 'text',
        //                 editable: false
        //             },
        //             {
        //                 title: CommonService.translate("Người upload"),
        //                 field: 'createdUserName',
        //                 width: '20%',
        //                 headerAttributes: {style: "text-align:center;font-weight: bold;", translate: ""},
        //                 attributes: {
        //                     style: "text-align:left;"
        //                 },
        //                 type: 'text',
        //                 editable: false
        //             },
        //         ]
        //     });
        // }

        vm.saveItem = function () {
            if (vm.typeCreate === 'completeWork') {
                let obj = vm.completeForm;
                // obj.listFileAttach = vm.listFileAttach;
                kendo.ui.progress($(vm.modalBody), true);
                Restangular.all("dtttAssignDetailRsService/saveDvnCompleteWork").post(obj).then(function (response) {
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
                var obj = vm.completeForm;
                kendo.ui.progress($(vm.modalBody), true);
                Restangular.all("dtttAssignDetailRsService/saveDvnRejectWork").post(obj).then(function (response) {
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

            } else if (vm.typeCreate === 'rejectWorkWhenOpenComplete') {
                var obj = vm.completeForm;
                kendo.ui.progress($(vm.modalBody), true);
                Restangular.all("dtttAssignDetailRsService/saveDvnRejectWork").post(obj).then(function (response) {
                    kendo.ui.progress($(vm.modalBody), false);
                    if (response && response.error) {
                        toastr.error(response.error);
                    } else {
                        toastr.success("Từ chối thành công");
                        vm.doSearch();
                        modalReject.close();
                        modalComplete.close();
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
            kendo.ui.progress($(vm.modalBody), true);
            var obj = {};
            obj.workAssignDetailId = dataItem.workAssignDetailId;
            confirm(CommonService.translate('Bạn đã sẵn sàng nhận WO này?'), function () {
                Restangular.all("workAssignDetailRsService/dvAcceptWork").post(obj).then(function (response) {
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
            var teamplateUrl = "dttt/dataDamage/sysGroupPopupSearch.html";
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
                transport: {
                    read: {},
                    parameterMap: function (options, type) {
                        vm.completeForm.page = options.page
                        vm.completeForm.pageSize = options.pageSize
                        return JSON.stringify(vm.completeForm)
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
                }
            ]
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

        vm.checkErr = function () {
            if (vm.searchForm.startDate == null) {
                vm.errMessage = CommonService.translate("Ngày đến không được để trống");
                $("#dtttDvAcceptWoFromEmp_startDate").focus();
                return vm.errMessage;
            }
            let startDate = kendo.parseDate(vm.searchForm.startDate, "dd/MM/yyyy");
            let closeDate = kendo.parseDate(vm.searchForm.closeDate, "dd/MM/yyyy");
            let curDate = new Date();
            if (startDate > curDate) {
                vm.errMessage = CommonService.translate("Ngày bắt đầu không được lớn hơn ngày hiện tại");
                $("#dtttDvAcceptWoFromEmp_startDate").focus();
                return vm.errMessage;
            } else if (closeDate != null && startDate > closeDate) {
                vm.errMessage = CommonService.translate("Ngày bắt đầu không được lớn hơn ngày đến");
                $("#dtttDvAcceptWoFromEmp_startDate").focus();
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
                $("#dtttDvAcceptWoFromEmp_closeDate").focus();
                return vm.errMessage1;
            }
            let startDate = kendo.parseDate(vm.searchForm.startDate, "dd/MM/yyyy");
            let closeDate = kendo.parseDate(vm.searchForm.closeDate, "dd/MM/yyyy");
            let curDate = new Date();
            if (closeDate > curDate) {
                vm.errMessage1 = CommonService.translate("Ngày bắt đầu không được lớn hơn ngày hiện tại");
                $("#dtttDvAcceptWoFromEmp_closeDate").focus();
                return vm.errMessage1;
            } else if (startDate > closeDate) {
                vm.errMessage1 = CommonService.translate("Ngày đến không được nhỏ hơn ngày bắt đầu");
                $("#dtttDvAcceptWoFromEmp_closeDate").focus();
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
                case 'date':
                    vm.errMessage = '';
                    vm.errMessage1 = '';
                    vm.searchForm.startDate = null;
                    vm.searchForm.closeDate = null;
                    break;
                case 'statusComplete':
                    vm.searchForm.statusComplete = null;
                    break;
                case 'statusDvnVerify':
                    vm.searchForm.statusDvnVerify = null;
                    break;
                case 'sysGroupId':
                    vm.searchForm.sysGroupId = null;
                    vm.searchForm.sysGroupName = null;
                    vm.searchForm.sysGroupCode = null;
                    break;
            }
        }
    }
})();
