(function () {
    'use strict';
    var controllerId = 'impellentBroadcastingStationController';

    angular.module('MetronicApp').controller(controllerId, impellentBroadcastingStationController);

    function impellentBroadcastingStationController($scope, $http, $timeout, $rootScope, $log, $filter, Constant, Restangular, CommonService, kendoConfig, $kWindow, RestEndpoint, gettextCatalog, impellentBroadcastingStationService) {
        var vm = this;
        vm.addForm = {};
        vm.searchForm = {};
        vm.String = "Kiểm toán nội bộ" + " > " + 'Đăng ký thi đua "Tháng Công nhân" năm 2022';
        vm.isCreate = false;
        vm.checkRoleViewManyRecord = false;
        // vm.description = "";
        initFormData();

        //
        function initFormData() {
            impellentBroadcastingStationService.checkRoleBtnAdd().then(function (data) {
                if (data == "1") {
                    vm.checkRoleViewManyRecord = true;
                }
            }, function (e) {
                toastr.error("Có lỗi trong quá trình lấy dữ liệu quyền thao tác.");
            });

            fillDataTable([]);
            fillDataTableAdd([]);

            var currentDate = new Date();
            currentDate.setDate(1);
            currentDate.setMonth(currentDate.getMonth() - 1);
            vm.searchForm.fromYear = ("0" + (currentDate.getMonth() + 1)).slice(-2) + "/" + currentDate.getFullYear();
        }

        // ----- Main Grid start
        vm.showHideColumnDetail = function (column) {
            var grid = vm.impellentBroadcastingStation;
            if (angular.isUndefined(column.hidden)) {
                grid.hideColumn(column);
            } else if (column.hidden) {
                grid.showColumn(column);
            } else {
                grid.hideColumn(column);
            }
        };

        var record = 0;

        function fillDataTable(data) {
            vm.impellentBroadcastingStationOptions = kendoConfig.getGridOptions({
                autoBind: true,
                scrollable: true,
                resizable: true,
                editable: false,
                dataBinding: function () {
                    record = (this.dataSource.page() - 1) * this.dataSource.pageSize();
                },
                reorderable: true,
                toolbar: [
                    {
                        name: "actions",
                        template: '<div class=" pull-left ">' +
                            '<button  type="button"  class="btn btn-qlk padding-search-right iconReview ng-scope" style="width: 120px" ng-click="vm.create()">Cam kết</button>' +
                            '</div>'
                    }
                ],
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
                            url: Constant.BASE_SERVICE_URL + "impellentBroadcastingStationRsService/doSearch",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, type) {
                            var obj = angular.copy(vm.searchForm);
                            obj.page = options.page;
                            obj.pageSize = options.pageSize;
                            return JSON.stringify(obj);
                        }
                    },
                    pageSize: 15
                },
                columnMenu: false,
                noRecords: true,
                messages: {
                    noRecords: CommonService.translate("Không có kết quả hiển thị")
                },
                pageable: {
                    refresh: false,
                    pageSizes: [15, 20, 25],
                    messages: {
                        display: "{0}-{1} của {2} kết quả",
                        itemsPerPage: "kết quả/trang",
                        empty: "Không có kết quả hiển thị"
                    }
                },
                columns: [
                    {
                        title: CommonService.translate("STT"),
                        field: "stt",
                        template: function () {
                            return ++record;
                        },
                        width: "3%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold;",
                            translate: ""
                        },
                        hidden: false,
                        attributes: {
                            style: "text-align:center;"
                        }
                    },
                    {
                        title: CommonService.translate("Đơn vị cam kết"),
                        field: "sysGroupName",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                        hidden: false,
                        width: "20%"
                    },
                    {
                        title: CommonService.translate("Người cam kết"),
                        field: "createdUserName",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                        hidden: false,
                        width: "20%"

                    },
                    // {
                    //     title: CommonService.translate("Số hợp đồng cam kết"),
                    //     field: "stationNumber",
                    //     headerAttributes: {
                    //         "class": "table-header-cell",
                    //         style: "text-align: center; font-weight: bold;white-space:normal;"
                    //     },
                    //     attributes: {
                    //         "class": "table-cell",
                    //         style: "text-align: center; "
                    //     },
                    //     hidden: false,
                    //     width: "8%"
                    //
                    // },
                    {
                        title: CommonService.translate("Nội dung cam kết"),
                        field: "description",
                        template : "<textarea class='k-textbox' kendoGridFocusable (keydown.enter)='$event.stopImmediatePropagation()' ng-model='dataItem.description' rows='3' style='width: -webkit-fill-available; height: 100%' disabled='disabled'></textarea>",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                        hidden: false,
                        width: "20%"

                    },
                    {
                        title: CommonService.translate("Ngày tạo"),
                        field: "createdDate",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; "
                        },
                        hidden: false,
                        width: "10%"

                    }, {
                        title: CommonService.translate("Người tạo"),
                        field: "createdUserName",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                        hidden: false,
                        width: "10%"

                    }
                ]
            });
        }


        //tim kiem
        vm.doSearch = doSearch;

        function doSearch() {
            var grid = vm.impellentBroadcastingStation;
            if (grid) {
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        };

        /*
		 * đóng Popup
		 */
        vm.cancel = function () {
            $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
        }

        vm.create = function () {
            vm.addForm = {};
            vm.isCreate = true;
            var teamplateUrl = "ktnb/impellentBroadcastingStation/impellentBroadcastingStationPopup.html";
            var title = 'Đăng ký thi đua "Tháng Công nhân" năm 2022';
            var windowId = "IMPELLENT_ADD";
            Restangular.all(RestEndpoint.IMPELLENT_BROADCASTING_STATION + "/getDataMapProvinceStationNumber").post().then(function (d) {
                CommonService.populatePopupCreate(teamplateUrl, title, null, vm, windowId, true, '1000', '500', null);
                fillDataTableAdd(d);
            }, function () {
                console.log('Có lỗi xảy ra');
            });

        }

        function fillDataTableAdd(data) {
            var dataSource = {
                // pageSize: 10,
                data: data,
                autoSync: true,
                schema: {
                    model: {
                        id: "impellentBroadcastingStationAddGridId",
                        fields: {
                            stt: {type: "String", editable: false},
                            sysGroupName: {type: "String", editable: false},
                            stationNumber: {type: "Number"},
                            description: {type: "String", editable: false}
                        }
                    }
                }
            };

            vm.impellentBroadcastingStationAddGridOptions = kendoConfig.getGridOptions({
                autoBind: true,
                resizable: true,
                dataSource: dataSource,
                noRecords: true,
                columnMenu: false,
                scrollable: false,
                messages: {
                    noRecords: CommonService.translate("Không có kết quả hiển thị")
                },
                columns: [
                    {
                        title: CommonService.translate("STT"),
                        field: "stt",
                        template: dataItem => $("#impellentBroadcastingStationAddGridId").data("kendoGrid").dataSource.indexOf(dataItem) + 1,
                        width: "5%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold;",
                            translate: ""
                        },
                        hidden: false,
                        attributes: {
                            style: "text-align:center;"
                        }
                    },
                    {
                        title: CommonService.translate("Đơn vị cam kết"),
                        field: "sysGroupName",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                        hidden: false,
                        width: "35%"
                    },
                    // {
                    //     title: CommonService.translate("Số hợp đồng cam kết"),
                    //     field: "stationNumber",
                    //     headerAttributes: {
                    //         "class": "table-header-cell",
                    //         style: "text-align: center; font-weight: bold;white-space:normal;"
                    //     },
                    //     attributes: {
                    //         "class": "table-cell",
                    //         style: "text-align: center; "
                    //     },
                    //     hidden: false,
                    //     width: "20%"
                    // },
                    // {
                    //     title: CommonService.translate("Nội dung cam kết"),
                    //     field: "description",
                    //     template : function (dataItem) {
                    //         if(dataItem.stationNumber == null){
                    //             dataItem.stationNumber = 0;
                    //         }
                    //         dataItem.description = dataItem.descriptionPart1 +' '+ dataItem.stationNumber +' '+ dataItem.descriptionPart2
                    //     return "<textarea class='k-textbox' kendoGridFocusable (keydown.enter)='$event.stopImmediatePropagation()' ng-model='dataItem.description' rows='3' style='width: -webkit-fill-available; height: 100%' disabled='disabled'></textarea>"
                    //     },
                    //     headerAttributes: {
                    //         "class": "table-header-cell",
                    //         style: "text-align: center; font-weight: bold;white-space:normal;"
                    //     },
                    //     attributes: {
                    //         "class": "table-cell",
                    //         style: "text-align: left; "
                    //     },
                    //     hidden: false,
                    //     width: "35%"
                    // },
                    {
                        title: CommonService.translate("Nội dung cam kết"),
                        field: "description",
                        template : function (dataItem) {
                            return "<textarea class='k-textbox' kendoGridFocusable (keydown.enter)='$event.stopImmediatePropagation()' ng-model='dataItem.description' rows='3' style='width: -webkit-fill-available; height: 100%'></textarea>"
                        },
                        headerAttributes: {
                            "class": "table-header-cell",
                                style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                                style: "text-align: left; "
                        },
                        hidden: false,
                        width: "35%"
                    }
                ]
            });
        }

        vm.save = function () {
            var dataGrid = $("#impellentBroadcastingStationAddGridId").data("kendoGrid").dataSource.data();
            var obj = dataGrid[0];
            // obj.description = vm.description;
            if (obj.description == null || obj.description.trim() == "") {
                toastr.error("Nội dung cam kết không được để trống");
                return;
            }
            kendo.ui.progress($("#impellentBroadcastingStationAddGridId"), true);
            if (vm.isCreate) {
                impellentBroadcastingStationService.saveNew(dataGrid[0]).then(function (data) {
                    if (data != undefined && data.error) {
                        kendo.ui.progress($("#impellentBroadcastingStationAddGridId"), false);
                        toastr.error(data.error);
                        return;
                    }
                    kendo.ui.progress($("#impellentBroadcastingStationAddGridId"), false);
                    toastr.success("Lưu dữ liệu thành công.");
                    $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
                    doSearch();
                }, function (e) {
                    toastr.error("Có lỗi trong quá trình xử lý dữ liệu.");
                    kendo.ui.progress($("#impellentBroadcastingStationAddGridId"), false);
                });
            } else {
                toastr.error("Chưa có tính năng cập nhật dữ liệu");
                kendo.ui.progress($("#impellentBroadcastingStationAddGridId"), false);
            }
        }

        vm.listRemove = [];
        vm.listConvert = [];

        vm.exportExcel = function exportExcel() {
            vm.searchForm.page = null;
            vm.searchForm.pageSize = null;
            impellentBroadcastingStationService.doSearch(vm.searchForm).then(function (d) {
                CommonService.exportFile(vm.impellentBroadcastingStation, d.data, vm.listRemove, vm.listConvert, "Danh sách phát động phát sóng trạm");
            });

        }

        vm.isSelect = false;
        vm.sysGroupSelectOptions = {
            dataTextField: "sysGroupName",
            placeholder: "Nhập mã đơn vị hoặc tên đơn vị",
            open: function (e) {
                vm.isSelect = false;
            },
            select: function (e) {
                vm.isSelect = true;
                var data = this.dataItem(e.item.index());
                vm.searchForm.sysGroupName = data.name;
                vm.searchForm.sysGroupId = data.sysGroupId;
            },
            pageSize: 10,
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        return Restangular.all("impellentBroadcastingStationRsService/getSysGroupIdByPathUser").post({
                            pageSize: 10,
                            page: 1,
                            keySearch: $("#sysGroupName").val().trim()
                        }).then(function (response) {
                            options.success(response.data);
                        }).catch(function (err) {
                            console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
                        });
                    }
                }
            },
            headerTemplate: '<div class="dropdown-header row text-center k-widget k-header">' +
                '<p class="col-md-6 text-header-auto border-right-ccc">Mã đơn vị</p>' +
                '<p class="col-md-6 text-header-auto">Tên đơn vị</p>' +
                '</div>',
            template: '<div class="row" ><div class="col-xs-5" style="padding: 0px 32px 0 0;word-wrap: break-word;float:left">#: data.sysGroupCode #</div><div style="padding-left:10px;width:auto;overflow: hidden"> #: data.sysGroupName #</div> </div>',
            change: function (e) {
                if (!vm.isSelect) {
                    vm.searchForm.sysGroupId = null;
                    vm.searchForm.sysGroupName = null;
                    $("#sysGroupName").val(null);
                }
            },
            close: function (e) {
                // handle the event0
            }
        };

        // End controller
    }
})();
