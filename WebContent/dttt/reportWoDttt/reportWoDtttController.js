(function () {
    'use strict';
    var controllerId = 'reportWoDtttController';

    angular.module('MetronicApp').controller(controllerId, reportWoDtttController,
        '$scope', '$modal', '$rootScope');

    function reportWoDtttController($scope, $templateCache, $rootScope, $timeout,
                                gettextCatalog, $filter, kendoConfig, $kWindow,
                                htmlCommonService, CommonService, PopupConst, Restangular,
                                RestEndpoint, Constant, $http, $modal) {

        var vm = this;
        vm.dataResult = [];
        vm.searchForm = {};
        vm.String = CommonService.translate("Báo cáo") + " > " + CommonService.translate("Báo cáo tổng hợp work order");
        vm.disableInputSysGroup = true;
        vm.documentBody = $(".tab-content");
        init();

        function init() {
            // getCnktOfUser();

            vm.levelActionArray = [
                {id: 1, name: CommonService.translate("Giao việc trong đơn vị")},
                {id: 2, name: CommonService.translate("Giao việc ngoài đơn vị")}
            ];

            vm.statusCompleteArray = [
                {id: 0, name: "Chưa thực hiện"},
                {id: 1, name: "Đang thực hiện"},
                {id: 2, name: "Hoàn Thành"}
            ];
            vm.statusDvnApproveArray = [
                {id: 0, name: "Chưa nhận việc"},
                {id: 1, name: "Đã nhận việc"},
                {id: 2, name: "Từ chối nhận việc"}
            ];
            vm.statusDvgVerifyArray = [
                {id: 0, name: "Chưa xác nhận"},
                {id: 1, name: "Đã xác nhận"},
                {id: 2, name: "Từ chối"}
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
        }

        // function getCnktOfUser() {
        //     var loginName = $rootScope.casUser.userName;
        //     reportWoDtttService.getCnktOfUser(loginName).then(function (res) {
        //         if(res && res.data){
        //             var cnkt = res.data;
        //             if(cnkt.code == 'CQC'){
        //                 vm.disableInputSysGroup = false;
        //             }
        //             else{
        //                 vm.disableInputSysGroup = true;
        //                 vm.searchForm.sysGroupId = cnkt.sysGroupId;
        //                 vm.searchForm.sysGroupName = cnkt.groupName;
        //             }
        //             moreInit();
        //         }
        //     })
        // }

        // function moreInit() {
        //     fillDataTable();
        //     setDateDefault();
        // }

        vm.doSearch = function () {
                var grid = $("#rpWoGrid1").data("kendoGrid");
                if (grid) {
                    grid.dataSource.query({
                        page: 1,
                        pageSize: 10
                    });
                }


        }


        var recordrpWo1 = 0;
        vm.countRp1 = 0;
        vm.rpWoGridOptions1 = kendoConfig.getGridOptions({
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
                        url: Constant.BASE_SERVICE_URL + "dtttAssignRsService/doSearchSynthesisReport",
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
                    title: CommonService.translate("Đơn vị giao"),
                    field: 'sysGroupDvgName',
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
                    title: CommonService.translate("Đơn vị thực hiện"),
                    field: 'sysGroupDvnName',
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
                    title: CommonService.translate("Mã WO"),
                    field: 'code',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Nội dung công việc"),
                    field: 'description',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                }, {
                    title: CommonService.translate("Thời hạn hoàn thành"),
                    field: 'closeDate',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    field: "statusDvnApprove",
                    title: CommonService.translate("Trạng thái đơn vị nhận nhận việc"),
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                    template: function (dataItem) {
                        vm.statusDvnApproveArray.forEach(function (data) {
                            if (data.id == dataItem.statusDvnApprove) {
                                dataItem.statusDvnApproveName = data.name;
                            }
                        });
                        return dataItem.statusDvnApproveName ? dataItem.statusDvnApproveName : '';
                    },
                    hidden: false,
                    width: "120px"

                },

                {
                    title: CommonService.translate("Trạng thái đơn vị giao xác nhận đóng việc"),
                    field: 'statusDvgVerify',
                    width: "100px",
                    template: function (dataItem) {
                        if (dataItem.statusDvgVerify === 0) {
                            return CommonService.translate("Chờ duyệt");
                        } else if (dataItem.statusDvgVerify === 1) {
                            return CommonService.translate("Đã duyệt");
                        } else if (dataItem.statusDvgVerify === 2) {
                            return CommonService.translate("Từ chối");
                        } else {
                            return "";
                        }
                    },
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Tình trạng thực hiện"),
                    field: 'statusDoWork',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Chất lượng"),
                    field: 'assessQuality',
                    width: "100px",
                    template: function (dataItem) {
                        vm.assessArray.forEach(function (data) {
                            if (data.code == dataItem.assessQuality) {
                                dataItem.assessQualityName = data.name;
                            }
                        });
                        return dataItem.assessQualityName ? dataItem.assessQualityName : '';
                    },
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                }, {
                    title: CommonService.translate("Tiến độ"),
                    field: 'assessProgress',
                    width: "100px",
                    template: function (dataItem) {
                        vm.progressArray.forEach(function (data) {
                            if (data.code == dataItem.assessProgress) {
                                dataItem.assessProgressName = data.name;
                            }
                        });
                        return dataItem.assessProgressName ? dataItem.assessProgressName : '';
                    },
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                }, {
                    title: CommonService.translate("Thái độ"),
                    field: 'assessAttitude',
                    width: "100px",
                    template: function (dataItem) {
                        vm.attitudeArray.forEach(function (data) {
                            if (data.code == dataItem.assessAttitude) {
                                dataItem.assessAttitudeName = data.name;
                            }
                        });
                        return dataItem.assessAttitudeName ? dataItem.assessAttitudeName : '';
                    },
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                }, {
                    title: CommonService.translate("Điểm"),
                    field: 'assessGrade',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
            ]
        });

        vm.exportReport = function () {
            var obj = {};
            obj.sysGroupDvgId = vm.searchForm.sysGroupDvgId;
            obj.sysGroupDvnId = vm.searchForm.sysGroupDvnId;
            obj.statusDoWork = vm.searchForm.statusDoWork;
            obj.levelAction = vm.searchForm.levelAction;
            obj.reportType = "EXCEL";
            obj.reportName = "BaoCaoTongHopDTTTWO";
            var date = kendo.toString(new Date((new Date()).getTime()), "dd-MM-yyyy");
            CommonService.exportReport(obj).then(
                function (data) {
                    var binarydata = new Blob([data], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
                    kendo.saveAs({dataURI: binarydata, fileName: date + "_" + obj.reportName + '.xlsx'});
                }, function (errResponse) {
                    toastr.error(CommonService.translate("Lỗi không export EXCEL được!"));
                });
        };

        //------------------------ start don vi
        vm.selectedSysGroupDvg = false;
        vm.sysGroupDvgOptions = {
            clearButton: false,
            dataTextField: "name",
            select: function (e) {
                vm.selectedSysGroupDvg = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchForm.sysGroupDvgName = dataItem.name;
                vm.searchForm.sysGroupDvgId = dataItem.sysGroupId;
            },
            pageSize: 10,
            open: (e) => {
                vm.selectedSysGroupDvg = false;
            },
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: (options) => {
                        vm.selectedSysGroupDvg = false;
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

                if (!vm.selectedSysGroupDvg) {
                    vm.searchForm.sysGroupDvgId = null;
                    vm.searchForm.sysGroupDvgName = null;
                }
            },
            ignoreCase: false
        }

        vm.selectedSysGroupDvn = false;
        vm.sysGroupDvnOptions = {
            clearButton: false,
            dataTextField: "name",
            select: function (e) {
                vm.selectedSysGroupDvn = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchForm.sysGroupDvnName = dataItem.name;
                vm.searchForm.sysGroupDvnId = dataItem.sysGroupId;
            },
            pageSize: 10,
            open: (e) => {
                vm.selectedSysGroupDvn = false;
            },
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: (options) => {
                        vm.selectedSysGroupDvn = false;
                        return Restangular.all("dataDamageRsServiceRest/getSysGroup").post({
                            pageSize: 15,
                            page: 1,
                            keySearch: $("#sysGroupDvnId").val().trim(),
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

                if (!vm.selectedSysGroupDvn) {
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
                            '			<i id="#=code#" ng-click="caller.selectDvgSysGroupItemSearch(dataItem)" class="fa fa-check color-green #=code#" aria-hidden="true"></i> ' +
                            '		</a>'
                            + '</div>',
                        headerAttributes: {
                            style: "text-align:center;"
                        }
                    }]
            });
        }

        vm.selectDvgSysGroupItemSearch = function (dataItem) {
            vm.searchForm.sysGroupDvgName = dataItem.name;
            vm.searchForm.sysGroupDvgId = dataItem.sysGroupId;
            CommonService.dismissPopup1();
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
        //------------------------ end don vi

        vm.gridColumnShowHideFilter = function (item) {
            return item.type == null || item.type !== 1;
        };

        // vm.listRemove = [{
        //     title: "Thao tác",
        // }];
        // vm.listConvert = [{
        //     field: "fuelType",
        //     data: {
        //         1: "Xe dầu",
        //         2: "Xe xăng"
        //     }
        // }
        // ];
        // ----- export start

        // export end -----
        vm.clear = function (data) {
            switch (data) {
                case 'sysGroupDvg': {
                    vm.searchForm.sysGroupDvgId = null;
                    vm.searchForm.sysGroupDvgCode = null;
                    vm.searchForm.sysGroupDvgName = null;
                    break;
                }  case 'sysGroupDvn': {
                    vm.searchForm.sysGroupDvnId = null;
                    vm.searchForm.sysGroupDvnCode = null;
                    vm.searchForm.sysGroupDvnName = null;
                    break;
                }
            }
        }
    }
})();
