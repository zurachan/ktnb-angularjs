(function () {
    'use strict';
    var controllerId = 'reportAuthorizationController';

    angular.module('MetronicApp').controller(controllerId, reportAuthorizationController,
        '$scope', '$modal', '$rootScope');

    function reportAuthorizationController($scope, $templateCache, $rootScope, $timeout,
                                gettextCatalog, $filter, kendoConfig, $kWindow,
                                htmlCommonService, CommonService, PopupConst, Restangular,
                                RestEndpoint, Constant, $http, $modal) {

        var vm = this;
        vm.dataResult = [];
        vm.searchForm = {};
        vm.String = CommonService.translate("Báo cáo") + " > " + CommonService.translate("Báo cáo ủy quyền");
        vm.disableInputSysGroup = true;
        vm.documentBody = $(".tab-content");
        init();

        function init() {
            vm.typeCreateArray = [
                {id: 1, name: "Tạo mới"},
                {id: 2, name: "Tạo thay thế"}
            ];
        }

        vm.doSearch = function () {
            if (vm.searchForm.paperAuthType == null) {
                toastr.error("Yêu cầu chọn Loại giấy ủy quyền!");
                return;
            }
            if (vm.searchForm.paperAuthType === "1") {
                var grid = $("#rpAuthGrid1").data("kendoGrid");
                if (grid) {
                    grid.dataSource.query({
                        page: 1,
                        pageSize: 10
                    });
                }
            }
            if (vm.searchForm.paperAuthType === "2") {
                var grid = $("#rpAuthGrid2").data("kendoGrid");
                if (grid) {
                    grid.dataSource.query({
                        page: 1,
                        pageSize: 10
                    });
                }
            }

        }


        var recordrpWo1 = 0;
        vm.countRp1 = 0;
        vm.rpAuthGridOptions1 = kendoConfig.getGridOptions({
            autoBind: false,
            resizable: true,
            dataBinding: function () {
                recordrpWo1 = (this.dataSource.page() - 1) * this.dataSource.pageSize();
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
                        // $("#countAssetReduce").text("" + response.total);
                        vm.countRp1 = response.total;
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
                        url: Constant.BASE_SERVICE_URL + "authorizationRsService/doSearchRpRegular",
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
                        return ++recordrpWo1;
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
                    title: CommonService.translate("Phân loại"),
                    field: 'paperAuthType',
                    width: "100px",
                    headerAttributes: {
                        style: "text-align:center;",
                        translate: ""
                    },
                    attributes: {
                        style: "text-align:center;"
                    },
                    template: function(dataItem){
                        if (dataItem.paperAuthType == 1) {
                            return "Thường xuyên";
                        } else if (dataItem.paperAuthType == 2) {
                            return "Theo vụ việc/Phát sinh";
                        } else {
                            return "";
                        }
                    },
                },
                {
                    title: CommonService.translate("Mã UQ"),
                    field: 'code',
                    width: "100px",
                },
                {
                    title: CommonService.translate("Người UQ"),
                    field: 'sysUserName',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                }, {
                    title: CommonService.translate("Chức vụ người UQ"),
                    field: 'positionName',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                }, {
                    title: CommonService.translate("Đơn vị UQ"),
                    field: 'uqSysGroupName',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                }, {
                    title: CommonService.translate("Người được UQ"),
                    field: 'performerName',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                }, {
                    title: CommonService.translate("Chức vụ người được UQ"),
                    field: 'uqPositionName',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                }, {
                    title: CommonService.translate("Đơn vị được UQ"),
                    field: 'uqSysGroupName',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                }, {
                    title: CommonService.translate("Nội dung UQ"),
                    field: "description",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                    hidden: false,
                    width: "120px"

                }, {
                    title: CommonService.translate("Số UQ"),
                    field: 'paperAuthNo',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Người ký UQ"),
                    field: 'dateRelease',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Ngày hết hiệu lực UQ"),
                    field: 'closeDate',
                    width: "10%",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                }, {
                    title: CommonService.translate("Số UQ thay thế"),
                    field: 'oldCode',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                }, {
                    title: CommonService.translate("Ghi chú"),
                    field: 'note',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },{
                    title: CommonService.translate("Trình ký"),
                    field: 'signType',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                    template: function (dataItem) {
                        if (dataItem.signType == 1){
                            return "Ký VO";
                        } else  if (dataItem.signType == 2){
                            return "Ký cứng";
                        }else "";
                    }
                },
            ]
        });

        var recordrpWo2 = 0;
        vm.countRp2 = 0;
        vm.rpAuthGridOptions2 = kendoConfig.getGridOptions({
            autoBind: false,
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
                        var list = response.data;
                        return list;
                    },
                },
                transport: {
                    read: {
                        // Thuc hien viec goi service
                        url: Constant.BASE_SERVICE_URL + "authorizationRsService/doSearchRpIncurred",
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
                        return ++recordrpWo2;
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
                    title: CommonService.translate("Phân loại"),
                    field: 'paperAuthType',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    template: function(dataItem){
                        if (dataItem.paperAuthType == 1) {
                            return "Thường xuyên";
                        } else if (dataItem.paperAuthType == 2) {
                            return "Theo vụ việc/Phát sinh";
                        } else {
                            return "";
                        }
                    },
                },
                {
                    title: CommonService.translate("Mã UQ"),
                    field: 'code',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Người UQ"),
                    field: 'sysUserName',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Chức vụ người UQ"),
                    field: 'positionName',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Đơn vị UQ"),
                    field: 'uqSysGroupName',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Người được UQ"),
                    field: 'performerName',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Chức vụ người được UQ"),
                    field: 'uqPositionName',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Đơn vị được UQ"),
                    field: 'uqSysGroupName',
                    width: "10%",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                }, {
                    title: CommonService.translate("Nội dung UQ"),
                    field: 'description',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                }, {
                    title: CommonService.translate("Số UQ"),
                    field: 'paperAuthNo',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                }, {
                    title: CommonService.translate("Ngày ký UQ"),
                    field: 'dateRelease',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                }, {
                    title: CommonService.translate("Ngày hết hiệu lực UQ"),
                    field: "closeDate",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                    hidden: false,
                    width: "120px"

                }, {
                    title: CommonService.translate("Số UQ thay thế"),
                    field: 'oldCode',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                }, {
                    title: CommonService.translate("Ghi chú"),
                    field: "note",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                    hidden: false,
                    width: "120px"

                }, {
                    title: CommonService.translate("Trình ký"),
                    field: 'signType',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                    template: function (dataItem) {
                        if (dataItem.signType == 1){
                            return "Ký VO";
                        } else  if (dataItem.signType == 2){
                            return "Ký cứng";
                        }else "";
                    }
                },
            ]
        });

        vm.exportReport = function () {
            var obj = {};
            if (vm.searchForm.paperAuthType == null) {
                toastr.error("Yêu cầu nhập loại WO!");
                return;
            }
            if (vm.searchForm.paperAuthType == "1") {
                obj.reportName = "BaoCaoUqThuongXuyen";
            }
            if (vm.searchForm.paperAuthType == "2") {
                obj.reportName = "BaoCaoUqPhatSinh";
            }
            obj.sysGroupId = vm.searchForm.sysGroupId;
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
        $scope.$watch("vm.searchForm.paperAuthType", function () {
            if (vm.searchForm.paperAuthType === "1") {
                vm.dataAvailable1 = true;
                vm.dataAvailable2 = false;
                if (!vm.isFirst) {
                    $("#rpAuthGrid2").data("kendoGrid").dataSource.data([]);
                    vm.countRp2 = null;

                }
            }
            if (vm.searchForm.paperAuthType === "2") {
                vm.dataAvailable1 = false;
                vm.dataAvailable2 = true;
                if (!vm.isFirst) {
                    $("#rpAuthGrid1").data("kendoGrid").dataSource.data([]);
                    vm.countRp1 = null;
                }
            }
            vm.isFirst = false;
        });

        //------------------------ start don vi
        vm.selectedSysGroup = false;
        vm.sysGroupOptions = {
            clearButton: false,
            dataTextField: "name",
            select: function (e) {
                vm.selectedSysGroup = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchForm.uqSysGroupName = dataItem.name;
                vm.searchForm.uqSysGroupId = dataItem.sysGroupId;
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
                            keySearch: vm.searchForm.uqSysGroupName,
                            groupLevelLst: [2]
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
                    vm.searchForm.uqSysGroupId = null;
                    vm.searchForm.uqSysGroupName = null;
                }
            },
            ignoreCase: false
        }
        vm.selectSysGroup = function () {
            var teamplateUrl = "ktnb/dataDamage/sysGroupPopupSearch.html";
            var title = CommonService.translate("Lựa chọn đơn vị");
            var windowId = "SELECT_SYS_GROUP";
            vm.objSearchGSearch = {};
            vm.objSearchGSearch.groupLevelLst = [2];
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
            vm.searchForm.uqSysGroupName = dataItem.name;
            vm.searchForm.uqSysGroupId = dataItem.sysGroupId;
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

        vm.gridColumnShowHideFilter = function (item) {
            return item.type == null || item.type !== 1;
        };

        // ----- export start

        // export end -----
        vm.clear = function (data) {
            switch (data) {
                case 'organization': {
                    vm.searchForm.uqSysGroupId = null;
                    vm.searchForm.uqSysGroupCode = null;
                    vm.searchForm.uqSysGroupName = null;
                    break;
                }
            }
        }
    }
})();
