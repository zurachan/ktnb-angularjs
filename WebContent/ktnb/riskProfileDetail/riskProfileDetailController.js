(function () {
    'use strict';
    var controllerId = 'riskProfileDetailController';

    angular.module('MetronicApp').controller(controllerId, riskProfileDetailController);

    function riskProfileDetailController($scope,$http, $templateCache, $rootScope, $timeout, gettextCatalog,
                                  kendoConfig, $kWindow, $q, riskProfileDetailService,
                                  CommonService, htmlCommonService, PopupConst, Restangular, RestEndpoint, Constant) {
        var vm = this;

        vm.documentBody = $(".tab-content");
        vm.modalBody = $(".k-window");
        vm.searchForm = {};
        vm.insertForm = {};
        vm.searchForm.status = 1;
        vm.insertForm.influenceLevelTa = null;
        vm.insertForm.influenceLevelTt = null;
        vm.insertForm.influenceLevelCn = null;
        vm.insertForm.possibilityTa = null;
        vm.insertForm.possibilityTt = null;
        vm.insertForm.possibilityCn = null;
        vm.modalAdd = null;
        vm.modalAdd1 = null;
        vm.showSolutionBs = false;
        vm.type = null;
        vm.listRemove = [{title: CommonService.translate("Thao tác"),}];
        vm.listConvert = [
            {
                field: "status",
                data: {
                    0: 'Hết hiệu lực',
                    1: 'Hiệu lực',
                }
            },
            {
                field: "statusApprovedDv",
                data: {
                    null: '',
                    0: 'Chờ xác nhận',
                    1: 'Đã xác nhận',
                    2: 'Từ chối',
                }
            },
            {
                field: "statusApprovedKtnb",
                data: {
                    null: '',
                    0: 'Chờ xác nhận',
                    1: 'Đã xác nhận',
                    2: 'Từ chối',
                }
            },
        ];
        initForm();
        function initForm() {
            if ($rootScope.stringtile) {
                vm.string = CommonService.translate("Quản trị rủi ro") + " > "+ CommonService.translate("Giải pháp ứng phó của rủi ro");
            };
            fillDataRiskProfileDetail([])
        }

        Restangular.all("commonRsService/checkPermission").post({sysUserId: Constant.user.vpsUserToken.sysUserId, adResourceCode:"RPD_DV", operationCode:"APPROVED"}).then(function(d){
            vm.approveDvPermission = d;
        }, function(){
            console.log('Có lỗi xảy ra khi check quyền');
        });
        Restangular.all("commonRsService/checkPermission").post({sysUserId: Constant.user.vpsUserToken.sysUserId, adResourceCode:"RPD_KTNB", operationCode:"APPROVED"}).then(function(d){
            vm.approveKtnbPermission = d;
        }, function(){
            console.log('Có lỗi xảy ra khi check quyền');
        });

        vm.doSearch = function () {
            var grid = $("#riskProfileDetailGrid").data("kendoGrid");
            if (grid) {
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        }

        var record = 0;
        function fillDataRiskProfileDetail(data) {
            vm.riskProfileDetailGridOptions = kendoConfig.getGridOptions({
                autoBind: true,
                resizable: true,
                scrollable: true,
                toolbar: [
                    {
                        name: "actions",
                        template:
                            '<div class=" pull-left ">' +
                            '<button  type="button" class="btn btn-qlk padding-search-right addQLK ng-scope" style="width: 120px" ng-click="vm.openAdd()" translate>Thêm mới' +
                            '</button>' +
                            '</div>' +
                            '<div class="btn-group pull-right margin_top_button margin_right10">' +
                            '<i class="tooltip1 action-button excelQLK" ng-click="vm.exportExcelGrid()"  aria-expanded="false"><span class="tooltipArrow"></span><span class="tooltiptext" translate>Xuất Excel</span></i>' +
                            '<div class="dropdown-menu hold-on-click dropdown-checkboxes" role="menu">' +
                            '</div></div>'
                    }
                ],
                dataBinding: function () {
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
                            vm.countRiskProfileDetail = response.total;
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
                            url: Constant.BASE_SERVICE_URL + "riskProfileDetail/doSearch",
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
                        title: CommonService.translate("TT"),
                        field: "stt",
                        template: function () {
                            return ++record;
                        },
                        width: "40px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; white-space:normal;"
                        },
                    }, {
                        title: CommonService.translate("Mã rủi ro"),
                        field: 'code',
                        width: "120px",
                        template: '<a href="javascript:void(0);" title="#=code#" ng-click=vm.showDetail(dataItem)>#=code#</a>',
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; white-space:normal;"
                        },
                    }, {
                        title: CommonService.translate("Tên rủi ro"),
                        field: 'name',
                        width: "150px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; white-space:normal;"
                        },
                    }, {
                        title: CommonService.translate("Nguyên nhân cốt lõi"),
                        field: 'reasonDescription',
                        width: "200px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; white-space:normal;"
                        },
                    },
                    {
                        title: CommonService.translate("Đơn vị thực hiện hiện tại"),
                        field: 'implementDvHtName',
                        width: "150px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; white-space:normal;"
                        },
                    },
                    {
                        title: CommonService.translate("Đơn vị thực hiện bổ sung"),
                        field: 'implementDvBsName',
                        width: "150px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; white-space:normal;"
                        },
                    },
                    {
                        title: CommonService.translate("Trạng thái"),
                        field: 'status',
                        width: "100px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; "
                        },
                        template: function (dataItem) {
                            if (dataItem.status == 0) {
                                return CommonService.translate("Hết hiệu lực");
                            } else if (dataItem.status == 1) {
                                return CommonService.translate("Hiệu lực");
                            } else {
                                return "";
                            }
                        },
                    },
                    {
                        title: CommonService.translate("Trạng thái đơn vị duyệt"),
                        field: 'statusApprovedDv',
                        width: "100px",
                        template: function (dataItem) {
                            if (dataItem.statusApprovedDv == 0) {
                                return CommonService.translate("Chờ xác nhận");
                            } else if (dataItem.statusApprovedDv == 1) {
                                return CommonService.translate("Đã xác nhận");
                            } else if (dataItem.statusApprovedDv == 2) {
                                return CommonService.translate("Từ chối");
                            } else {
                                return "";
                            }
                        },
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; white-space:normal;"
                        },
                    },
                    {
                        title: CommonService.translate("Trạng thái KTNB duyệt"),
                        field: 'statusApprovedKtnb',
                        width: "100px",
                        template: function (dataItem) {
                            if (dataItem.statusApprovedKtnb == 0) {
                                return CommonService.translate("Chờ xác nhận");
                            } else if (dataItem.statusApprovedKtnb == 1) {
                                return CommonService.translate("Đã xác nhận");
                            } else if (dataItem.statusApprovedKtnb == 2) {
                                return CommonService.translate("Từ chối");
                            } else {
                                return "";
                            }
                        },
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; white-space:normal;"
                        },
                    },
                    {
                        title: CommonService.translate("Thao tác"),
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; white-space:normal;"
                        },
                        template: dataItem =>
                            '<div class="text-center">' +
                            '<button style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Sửa" translate ' +
                            'ng-click="vm.update(dataItem)" ng-if="dataItem.status == 1 && (dataItem.statusApprovedDv==2 || (dataItem.statusApprovedDv==1&&dataItem.statusApprovedKtnb==2)||dataItem.statusApprovedDv==null)"><i class="fa fa-pencil ng-scope" aria-hidden="true" translate></i></button>'
                            +
                            '<button style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Xóa" translate ' +
                            'ng-click="vm.remove(dataItem)" ng-if="dataItem.status == 1 && (dataItem.statusApprovedDv==2 || (dataItem.statusApprovedDv==1&&dataItem.statusApprovedKtnb==2)||dataItem.statusApprovedDv==null)"> <i style="color:steelblue;" class="fa fa-trash ng-scope" aria-hidden="true"></i></button>'
                            +
                            '<button  style=" border: none; background-color: white;" class="#=riskProfileId# icon_table ng-scope" uib-tooltip="DV duyệt" translate="" ' +
                            'ng-click="vm.openApprovePopup(dataItem, 1)" ng-if="dataItem.status == 1 && dataItem.statusApprovedDv == 0 && vm.approveDvPermission">' +
                            ' <i style="color:#53b453;" class="fa fa-check ng-scope" aria-hidden="true"></i>' +
                            '</button>'
                            +
                            '<button  style=" border: none; background-color: white;" class="#=riskProfileId# icon_table ng-scope" uib-tooltip="KTNB duyệt" translate="" ' +
                            'ng-click="vm.openApprovePopup(dataItem, 2)" ng-if="dataItem.status == 1 && dataItem.statusApprovedDv == 1 && dataItem.statusApprovedKtnb == 0 && vm.approveKtnbPermission">' +
                            ' <i style="color:#53b453;" class="fa fa-check ng-scope" aria-hidden="true"></i>' +
                            '</button>'
                            +
                            '</div>',
                            // '<div class="text-center">' +
                            // '<button style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Sửa" translate ' +
                            // 'ng-click="vm.update(dataItem)"><i class="fa fa-pencil ng-scope" aria-hidden="true" translate></i></button>'
                            // +
                            // '<button style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Xóa" translate ' +
                            // 'ng-click="vm.remove(dataItem)"> <i style="color:steelblue;" class="fa fa-trash ng-scope" aria-hidden="true"></i></button>'
                            // +
                            // '<button  style=" border: none; background-color: white;" class="#=riskProfileId# icon_table ng-scope" uib-tooltip="DV duyệt" translate="" ' +
                            // 'ng-click="vm.openApprovePopup(dataItem, 1)">' +
                            // ' <i style="color:#53b453;" class="fa fa-check ng-scope" aria-hidden="true"></i>' +
                            // '</button>'
                            // +
                            // '<button  style=" border: none; background-color: white;" class="#=riskProfileId# icon_table ng-scope" uib-tooltip="KTNB duyệt" translate="" ' +
                            // '>' +
                            // ' <i style="color:#53b453;" class="fa fa-check ng-scope" aria-hidden="true"></i>' +
                            // '</button>'
                            // +
                            // '</div>',

                        width: "150px",
                        field: "stt"
                    }
                ]
            });
        }

        vm.clear = function (data) {
            switch (data) {
                case 'riskProfile': {
                    vm.searchForm.name = null;
                    vm.searchForm.riskProfileId = null;
                    break;
                }
                case 'reasonDescription': {
                    vm.searchForm.reasonDescription = null;
                    break;
                }
                case 'implementDvHt': {
                    vm.searchForm.implementDvHtName = null;
                    vm.searchForm.implementDvHt = null;
                    break;
                }
                case 'implementDvBs': {
                    vm.searchForm.implementDvBsName = null;
                    vm.searchForm.implementDvBs = null;
                    break;
                }
                case 'riskProfileInsert': {
                    vm.insertForm.name = null;
                    vm.insertForm.riskProfileId = null;
                    vm.insertForm.code = null;
                    vm.insertForm.reasonDescription = null;
                    break;
                }
                case 'implementDvHtInsert': {
                    vm.insertForm.implementDvHtName = null;
                    vm.insertForm.implementDvHt = null;
                    break;
                }
                case 'implementDvBsInsert': {
                    vm.insertForm.implementDvBsName = null;
                    vm.insertForm.implementDvBs = null;
                    break;
                }
                case 'evaluationDate': {
                    vm.insertForm.evaluationDate = null;
                    vm.insertForm.expectedDate = null;
                    break;
                }

            }
        }

        vm.save = function () {
            if (vm.insertForm.riskProfileId == null) {
                toastr.error(CommonService.translate("Tên rủi ro không được để trống"));
                return;
            }
            if (vm.insertForm.reasonDescription == null || vm.insertForm.reasonDescription == "") {
                toastr.error(CommonService.translate("Nguyên nhân cốt lõi không được để trống"));
                return;
            }
            if (vm.insertForm.solutionHt == null || vm.insertForm.solutionHt == "") {
                toastr.error(CommonService.translate("Giải pháp ứng phó hiện tại không được để trống"));
                return;
            }
            if (vm.insertForm.solutionBs == null || vm.insertForm.solutionBs == "") {
                toastr.error(CommonService.translate("Giải pháp ứng phó bổ sung không được để trống"));
                return;
            }
            if (vm.insertForm.groupSolutionHt == null) {
                toastr.error(CommonService.translate("Nhóm giải pháp của PA ứng phó hiện tại không được để trống"));
                return;
            }
            if (vm.insertForm.groupSolutionBs == null) {
                toastr.error(CommonService.translate("Nhóm giải pháp của PA ứng phó bổ sung không được để trống"));
                return;
            }
            if (vm.insertForm.impactSolutionHt == null) {
                toastr.error(CommonService.translate("Tác động của GP ứng phó hiện tại không được để trống"));
                return;
            }
            if (vm.insertForm.impactSolutionBs == null) {
                toastr.error(CommonService.translate("Tác động của GP ứng phó bổ sung không được để trống"));
                return;
            }
            if (vm.insertForm.implementDvHt == null) {
                toastr.error(CommonService.translate("Đơn vị thực hiện PA hiện tại không được để trống"));
                return;
            }
            if (vm.insertForm.implementDvBs == null) {
                toastr.error(CommonService.translate("Đơn vị thực hiện PA bổ sung không được để trống"));
                return;
            }
            if (vm.insertForm.monitoringDoc == null) {
                toastr.error(CommonService.translate("Tài liệu giám sát không được để trống"));
                return;
            }
            if (vm.insertForm.expectedDate == null || vm.insertForm.expectedDate == "") {
                toastr.error(CommonService.translate("Thời gian dự kiến thực hiện không được để trống"));
                return;
            }
            if (vm.insertForm.evaluationDate == null || vm.insertForm.evaluationDate == "") {
                toastr.error(CommonService.translate("Thời gian đánh giá không được để trống"));
                return;
            }
            var date = new Date();
            date.setHours(0,0,0,0);
            if (kendo.parseDate(vm.insertForm.expectedDate,"dd/MM/yyyy")<kendo.parseDate(date,"dd/MM/yyyy")){
                toastr.error(CommonService.translate("Thời gian dự kiến thực hiện không được nhỏ hơn ngày hiện tại."));
                return;
            }

            if (kendo.parseDate(vm.insertForm.evaluationDate,"dd/MM/yyyy")<=kendo.parseDate(vm.insertForm.expectedDate,"dd/MM/yyyy")){
                toastr.error(CommonService.translate("Thời gian đánh giá không được nhỏ hơn ngày dự kiến thực hiện."));
                return;
            }

            $("#sav")[0].disabled = true;
            if (vm.isCreateForm) {
                riskProfileDetailService.save(vm.insertForm).then(function () {
                    toastr.success(CommonService.translate("Thêm mới bản ghi thành công"));
                    vm.doSearch();
                    vm.cancel();
                }, function (err) {
                    toastr.error(CommonService.translate("Có lỗi xảy ra"));
                    $("#sav")[0].disabled = false;
                });

            } else {
                if(vm.insertForm.statusApprovedDv==2){
                    vm.insertForm.statusApprovedDv = 0;
                } else if(vm.insertForm.statusApprovedKtnb==2){
                    vm.insertForm.statusApprovedKtnb = 0;
                }
                riskProfileDetailService.update(vm.insertForm).then(function () {
                    toastr.success(CommonService.translate("Cập nhật bản ghi thành công"));
                    vm.cancel();
                    vm.doSearch();
                }, function (err) {
                    toastr.error(CommonService.translate("Có lỗi xảy ra"));
                    $("#sav")[0].disabled = false;
                });
            }
        }
        vm.cancel = function () {
            setTimeout(function () {
                if (vm.modalAdd1 != null) {vm.modalAdd1.dismiss();vm.modalAdd1 = null}
                else if (vm.modalAdd != null){vm.modalAdd.dismiss();vm.modalAdd = null;}
            },200)

        };

        vm.isCreateForm = true;
        vm.checkViewDetail = false;
        vm.openAdd = function () {
            vm.type = 'create';
            $("#text_err").text("");
            vm.showButtonSaveUpdate = true;
            vm.showSolutionBs = false;
            vm.isView = false;
            vm.isEdit = false;
            vm.isCreateForm = true;
            vm.isUpdateForm = false;
            vm.showButtonApproveDv = false;
            vm.showButtonApproveKtnb = false;
            vm.insertForm = {};
            var templateUrl = 'ktnb/riskProfileDetail/riskProfileDetailPopup.html';
            var title = CommonService.translate("Giải pháp cho rủi ro");
            vm.modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "70%", null, null);
        }
        vm.update = function (dataItem) {
            vm.showSolutionBs = true;
            vm.type = 'update';
            $("#text_err").text("");
            vm.showButtonSaveUpdate = true;
            vm.isView = false;
            vm.isEdit = true;
            vm.showButtonApproveDv = false;
            vm.showButtonApproveKtnb = false;
            vm.isCreateForm = false;
            vm.isUpdateForm = true;
            vm.insertForm = angular.copy(dataItem);
            var templateUrl = 'ktnb/riskProfileDetail/riskProfileDetailPopup.html';
            var title = CommonService.translate("Cập nhật giải pháp cho rủi ro");
            vm.modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "70%", null, null);
        }

        vm.showDetail = function (dataItem) {
            vm.showButtonSaveUpdate = false;
            vm.showSolutionBs = true;
            $("#text_err").text("");
            vm.isView = true;
            vm.isEdit = false;
            vm.showButtonApproveDv = false;
            vm.showButtonApproveKtnb = false;
            vm.isCreateForm = false;
            vm.isUpdateForm = false;
            dataItem.typeFile = "WOKTNB";
            vm.insertForm = angular.copy(dataItem);
            var templateUrl = 'ktnb/riskProfileDetail/riskProfileDetailPopup.html';
            var title = CommonService.translate("Chi tiết giải pháp cho rủi ro");
            vm.modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "70%", null, null);
        }

        vm.sysGroupHtInsertOptions = {
            clearButton: false,
            dataTextField: "name",
            select: function(e) {
                vm.selectedSysGroupHtInsert = true;
                var dataItem = this.dataItem(e.item.index());
                vm.insertForm.implementDvHtName = dataItem.name;
                vm.insertForm.implementDvHt = dataItem.code;
                // var obj = {};
                // obj.sysGroupId = dataItem.sysGroupId;
                // riskProfileDetailService.getCode(obj).then(function (d) {
                //     vm.insertForm.code = d;
                // })
            },
            pageSize: 10,
            open: function(e) {
                vm.selectedSysGroupHtInsert = false;
            },
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function(options) {
                        vm.selectedSysGroupHtInsert = false;
                        return Restangular.all("commonRsService/getAppParam").post({
                            keySearch: $("#insertImplementDvHt").val().trim(),
                            parType: 'KTNB_QTRR_KRI_OWNER'
                        }).then(function(response) {
                            options.success(response.data);
                        }).catch(function(err) {
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
            change: function(e) {
                if (!vm.selectedSysGroupHtInsert) {
                    vm.insertForm.implementDvHtName = null;
                    vm.insertForm.implementDvHt = null;
                }
            },
            ignoreCase: false
        }

        vm.sysGroupBsInsertOptions = {
            clearButton: false,
            dataTextField: "name",
            select: function(e) {
                vm.selectedSysGroupBsInsert = true;
                var dataItem = this.dataItem(e.item.index());
                vm.insertForm.implementDvBsName = dataItem.name;
                vm.insertForm.implementDvBs = dataItem.sysGroupId;
                // var obj = {};
                // obj.sysGroupId = dataItem.sysGroupId;
                // riskProfileDetailService.getCode(obj).then(function (d) {
                //     vm.insertForm.code = d;
                // })
            },
            pageSize: 10,
            open: function(e) {
                vm.selectedSysGroupBsInsert = false;
            },
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function(options) {
                        vm.selectedSysGroupBsInsert = false;
                        return Restangular.all("dataDamageRsServiceRest/getSysGroup").post({
                            pageSize: 15,
                            page: 1,
                            keySearch: $("#insertImplementDvBs").val().trim(),
                            groupLevelLst: [2]
                        }).then(function(response) {
                            options.success(response.data);
                        }).catch(function(err) {
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
            change: function(e) {
                if (!vm.selectedSysGroupBsInsert) {
                    vm.insertForm.implementDvBsName = null;
                    vm.insertForm.implementDvBs = null;
                }
            },
            ignoreCase: false
        }

        vm.sysGroupHtSearchOptions = {
            clearButton: false,
            dataTextField: "name",
            select: function(e) {
                vm.selectedSysGroupHtSearch = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchForm.implementDvHtName = dataItem.name;
                vm.searchForm.implementDvHt = dataItem.sysGroupId;
                // var obj = {};
                // obj.sysGroupId = dataItem.sysGroupId;
                // riskProfileDetailService.getCode(obj).then(function (d) {
                //     vm.insertForm.code = d;
                // })
            },
            pageSize: 10,
            open: function(e) {
                vm.selectedSysGroupHtSearch = false;
            },
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function(options) {
                        vm.selectedSysGroupHtSearch = false;
                        return Restangular.all("dataDamageRsServiceRest/getSysGroup").post({
                            pageSize: 15,
                            page: 1,
                            keySearch: $("#searchSysGroupHt").val().trim(),
                            groupLevelLst: [2]
                        }).then(function(response) {
                            options.success(response.data);
                        }).catch(function(err) {
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
            change: function(e) {
                if (!vm.selectedSysGroupHtSearch) {
                    vm.searchForm.implementDvHtName = null;
                    vm.searchForm.implementDvHt = null;
                }
            },
            ignoreCase: false
        }

        vm.sysGroupBsSearchOptions = {
            clearButton: false,
            dataTextField: "name",
            select: function(e) {
                vm.selectedSysGroupBsSearch = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchForm.implementDvBsName = dataItem.name;
                vm.searchForm.implementDvBs = dataItem.sysGroupId;
                // var obj = {};
                // obj.sysGroupId = dataItem.sysGroupId;
                // riskProfileDetailService.getCode(obj).then(function (d) {
                //     vm.insertForm.code = d;
                // })
            },
            pageSize: 10,
            open: function(e) {
                vm.selectedSysGroupBsSearch = false;
            },
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function(options) {
                        vm.selectedSysGroupBsSearch = false;
                        return Restangular.all("dataDamageRsServiceRest/getSysGroup").post({
                            pageSize: 15,
                            page: 1,
                            keySearch: $("#searchSysGroupBs").val().trim(),
                            groupLevelLst: [2]
                        }).then(function(response) {
                            options.success(response.data);
                        }).catch(function(err) {
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
            change: function(e) {
                if (!vm.selectedSysGroupBsSearch) {
                    vm.searchForm.implementDvBsName = null;
                    vm.searchForm.implementDvBs = null;
                }
            },
            ignoreCase: false
        }

        vm.selectSysGroup = function(data){
            vm.flagSysGroup = data;
            var teamplateUrl = "ktnb/dataDamage/sysGroupPopupSearch.html";
            var title = CommonService.translate("Lựa chọn đơn vị");
            var windowId = "SELECT_SYS_GROUP";
            vm.objSearchGSearch = {};
            vm.objSearchGSearch.groupLevelLst = [2];
            fillDataSysGSearchTable(vm.objSearchGSearch);
            CommonService.populatePopupCreate(teamplateUrl, title, null, vm, windowId, null, '60%', '60%', 'changepopupSys');
        }

        vm.selectRiskProfile = function(data){
            vm.flagRp = data;
            var teamplateUrl = "ktnb/riskProfileDetail/riskProfileSearch.html";
            var title = CommonService.translate("Lựa chọn hồ sơ rủi ro");
            var windowId = "SELECT_RISK_PROFILE";
            vm.objSearchRp = {};
            fillDataRpSearchTable(vm.objSearchRp);
            CommonService.populatePopupCreate(teamplateUrl, title, null, vm, windowId, null, '60%', '60%', 'changepopupSys');
        }

        var recordRp = 0;
        function fillDataRpSearchTable(dataRp) {
            vm.gridRpGOptions = kendoConfig.getGridOptions({
                autoBind: true,
                scrollable: false,
                resizable: true,
                editable: false,
                sortable: false,
                serverPaging: true,
                dataBinding: function() {
                    recordRp = (this.dataSource.page() -1) * this.dataSource.pageSize();
                },
                reorderable: true,
                dataSource:{
                    serverPaging: true,
                    schema: {
                        total: (response)=>response.total,
                        data: (response)=> response.data
                    },
                    transport: {
                        read: {
                            // Thuc hien viec goi service
                            url: Constant.BASE_SERVICE_URL + "riskProfileDetail/getRiskProfileForAutoComplete",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: (options, type) => {
                            dataRp.page = options.page;
                            dataRp.pageSize = options.pageSize;
                            return JSON.stringify(dataRp);
                        }
                    },
                    pageSize: 10
                },

                noRecords: true,
                columnMenu: false,
                messages: {
                    noRecords : gettextCatalog.getString("<div style='margin:5px'>Không có kết quả hiển thị</div>")
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
                    template: (dataItem)=> $("#gridRp").data("kendoGrid").dataSource.indexOf(dataItem)+ 1+($("#gridRp").data("kendoGrid").dataSource.page()-1)*$("#gridRp").data("kendoGrid").dataSource.pageSize(),
                    width: '5%',
                    headerAttributes: {
                        style: "text-align:center; font-weight: bold",
                        translate:""
                    },
                    attributes: {
                        style: "text-align:center; font-weight: bold"
                    },
                },
                    {
                        title: "Tên hồ sơ rủi ro",
                        width: '20%',
                        field: 'name',
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold"
                        },
                        attributes: {
                            style: "text-align:left;"
                        },
                    },
                    {
                        title: "Mã rủi ro",
                        width: '20%',
                        field: 'code',
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold"
                        },
                        attributes: {
                            style: "text-align:left;"
                        },
                    },
                    {
                        title: "Chủ sở hữu",
                        width: '20%',
                        field: 'sysGroupName',
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold"
                        },
                        attributes: {
                            style: "text-align:left;"
                        },
                    },
                    {
                        title: "Nguyên nhân rủi ro",
                        width: '30%',
                        field: 'reasonDescription',
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
                            '			<i id="#=code#" ng-click="caller.selectRpItemSearch(dataItem)" class="fa fa-check color-green #=code#" aria-hidden="true"></i> ' +
                            '		</a>'
                            + '</div>',
                        headerAttributes: {
                            style: "text-align:center;"
                        }
                    }]
            });
        }

        var recordSys = 0;
        function fillDataSysGSearchTable(dataSys) {
            vm.gridSysGSearchOptions = kendoConfig.getGridOptions({
                autoBind: true,
                scrollable: false,
                resizable: true,
                editable: false,
                sortable: false,
                serverPaging: true,
                dataBinding: function() {
                    recordSys = (this.dataSource.page() -1) * this.dataSource.pageSize();
                },
                reorderable: true,
                dataSource:{
                    serverPaging: true,
                    schema: {
                        total: (response)=>response.total,
                        data: (response)=> response.data
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
                    noRecords : gettextCatalog.getString("<div style='margin:5px'>Không có kết quả hiển thị</div>")
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
                    template: (dataItem)=> $("#sysGGridSearch").data("kendoGrid").dataSource.indexOf(dataItem)+ 1+($("#sysGGridSearch").data("kendoGrid").dataSource.page()-1)*$("#sysGGridSearch").data("kendoGrid").dataSource.pageSize(),
                    width: '5%',
                    headerAttributes: {
                        style: "text-align:center; font-weight: bold",
                        translate:""
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

        vm.selectSysGroupItemSearch = function(dataItem){
            if (vm.flagSysGroup == 'htInsert') {
                vm.insertForm.implementDvHtName = dataItem.name;
                vm.insertForm.implementDvHt = dataItem.code;
            } else if (vm.flagSysGroup == 'bsInsert') {
                vm.insertForm.implementDvBsName = dataItem.name;
                vm.insertForm.implementDvBs = dataItem.sysGroupId;
            } else if (vm.flagSysGroup == 'htSearch') {
                vm.searchForm.implementDvHtName = dataItem.name;
                vm.searchForm.implementDvHt = dataItem.sysGroupId;
            } else if (vm.flagSysGroup == 'bsSearch') {
                vm.searchForm.implementDvBsName = dataItem.name;
                vm.searchForm.implementDvBs = dataItem.sysGroupId;
            }
            CommonService.dismissPopup1();
        }

        vm.selectRpItemSearch = function(dataItem){
            if (vm.flagRp == 'rpSearch') {
                vm.searchForm.name = dataItem.name;
                vm.searchForm.riskProfileId = dataItem.riskProfileId;
            } else if (vm.flagRp == 'rpInsert') {
                vm.insertForm.name = dataItem.name;
                vm.insertForm.code = dataItem.code;
                vm.insertForm.riskProfileId = dataItem.riskProfileId;
                vm.insertForm.reasonDescription = dataItem.reasonDescription;
            }
            CommonService.dismissPopup1();
        }

        vm.riskProfileInsertOptions = {
            clearButton: false,
            dataTextField: "name",
            select: function(e) {
                vm.selectedRiskProfileInsert = true;
                var dataItem = this.dataItem(e.item.index());
                vm.insertForm.name = dataItem.name;
                vm.insertForm.code = dataItem.code;
                vm.insertForm.riskProfileId = dataItem.riskProfileId;
                vm.insertForm.reasonDescription = dataItem.reasonDescription;
                // var obj = {};
                // obj.sysGroupId = dataItem.sysGroupId;
                // riskProfileDetailService.getCode(obj).then(function (d) {
                //     vm.insertForm.code = d;
                // })
            },
            pageSize: 10,
            open: function(e) {
                vm.selectedRiskProfileInsert = false;
            },
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function(options) {
                        vm.selectedRiskProfileInsert = false;
                        return Restangular.all("riskProfileDetail/getRiskProfileForAutoComplete").post({
                            pageSize: 15,
                            page: 1,
                            keySearch: $("#insertRiskProfileDetailSysGroupPs").val().trim()
                        }).then(function(response) {
                            options.success(response.data);
                        }).catch(function(err) {
                            console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
                        });
                    }
                }
            },
            headerTemplate: '<div class="dropdown-header row text-center k-widget k-header">' +
                '<p class="col-md-2 text-header-auto">Mã rủi ro</p>' +
                '<p class="col-md-4 text-header-auto">Tên rủi ro</p>' +
                '<p class="col-md-6 text-header-auto">Chủ sở hữu</p>' +
                '</div>',
            template: '<div class="row" style="display: flex"><div style="float:left; width: 20%;">#: data.code #</div><div style="width:35%;overflow: hidden"> #: data.name #</div><div style="width:45%;overflow: hidden"> #: data.sysGroupName #</div> </div>',
            change: function(e) {
                if (!vm.selectedRiskProfileInsert) {
                    vm.insertForm.name = null;
                    vm.insertForm.code = null;
                    vm.insertForm.riskProfileId = null;
                    vm.insertForm.reasonDescription = null
                }
            },
            ignoreCase: false
        }

        vm.riskProfileSearchOptions = {
            clearButton: false,
            dataTextField: "name",
            select: function(e) {
                vm.selectedRiskProfileSearch = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchForm.name = dataItem.name;
                vm.searchForm.riskProfileId = dataItem.riskProfileId;
                // var obj = {};
                // obj.sysGroupId = dataItem.sysGroupId;
                // riskProfileDetailService.getCode(obj).then(function (d) {
                //     vm.insertForm.code = d;
                // })
            },
            pageSize: 10,
            open: function(e) {
                vm.selectedRiskProfileSearch = false;
            },
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function(options) {
                        vm.selectedRiskProfileSearch = false;
                        return Restangular.all("riskProfileDetail/getRiskProfileForAutoComplete").post({
                            pageSize: 15,
                            page: 1,
                            keySearch: $("#searchRiskProfile").val().trim()
                        }).then(function(response) {
                            options.success(response.data);
                        }).catch(function(err) {
                            console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
                        });
                    }
                }
            },
            headerTemplate: '<div class="dropdown-header row text-center k-widget k-header">' +
                '<p class="col-md-6 text-header-auto">Mã rủi ro</p>' +
                '<p class="col-md-6 text-header-auto">Tên rủi ro</p>' +
                '</div>',
            template: '<div class="row" ><div class="col-xs-5" style="padding: 0px 32px 0 0;float:left">#: data.code #</div><div style="padding-left:10px;width:auto;overflow: hidden"> #: data.name #</div> </div>',
            change: function(e) {
                if (!vm.selectedRiskProfileSearch) {
                    vm.searchForm.name = null;
                    vm.searchForm.riskProfileId = null;
                }
            },
            ignoreCase: false
        }

        vm.riskProfileDetail = function (data) {
            switch (data) {
                case 'ta': {
                    if (vm.insertForm.influenceLevelTa != null && vm.insertForm.possibilityTa != null) {
                        var temp = parseInt(vm.insertForm.influenceLevelTa) + parseInt(vm.insertForm.possibilityTa);
                        if (vm.insertForm.influenceLevelTa === '5' && vm.insertForm.possibilityTa === '1') {
                            vm.insertForm.statusTa = 5;
                        } else if (temp > 1 && temp <= 3) {
                            vm.insertForm.statusTa = 1;
                        } else if (temp > 3 && temp <= 6) {
                            vm.insertForm.statusTa = 2;
                        } else if (temp > 6 && temp <= 8) {
                            vm.insertForm.statusTa = 3;
                        } else if (temp > 8 && temp <= 10) {
                            vm.insertForm.statusTa = 4;
                        }
                    }
                    console.log("ta: " + vm.insertForm.statusTa)
                    break;
                }
                case 'tt': {
                    if (vm.insertForm.influenceLevelTt != null && vm.insertForm.possibilityTt != null) {
                        var temp = parseInt(vm.insertForm.influenceLevelTt) + parseInt(vm.insertForm.possibilityTt);
                        if (vm.insertForm.influenceLevelTt === '5' && vm.insertForm.possibilityTt === '1') {
                            vm.insertForm.statusTt = 5;
                        } else if (temp > 1 && temp <= 3) {
                            vm.insertForm.statusTt = 1;
                        } else if (temp > 3 && temp <= 6) {
                            vm.insertForm.statusTt = 2;
                        } else if (temp > 6 && temp <= 8) {
                            vm.insertForm.statusTt = 3;
                        } else if (temp > 8 && temp <= 10) {
                            vm.insertForm.statusTt = 4;
                        }
                    }
                    console.log("tt: " + vm.insertForm.statusTt + "," + temp)
                    break;
                }
                case 'cn': {
                    if (vm.insertForm.influenceLevelCn != null && vm.insertForm.possibilityCn != null) {
                        var temp = parseInt(vm.insertForm.influenceLevelCn) + parseInt(vm.insertForm.possibilityCn);
                        if (vm.insertForm.influenceLevelCn === '5' && vm.insertForm.possibilityCn === '1') {
                            vm.insertForm.statusTtCn = 5;
                        } else if (temp > 1 && temp <= 3) {
                            vm.insertForm.statusTtCn = 1;
                        } else if (temp > 3 && temp <= 6) {
                            vm.insertForm.statusTtCn = 2;
                        } else if (temp > 6 && temp <= 8) {
                            vm.insertForm.statusTtCn = 3;
                        } else if (temp > 8 && temp <= 10) {
                            vm.insertForm.statusTtCn = 4;
                        }
                    }
                    console.log("cn: " + vm.insertForm.statusTtCn)
                    break;
                }
            }
        }

        vm.remove = function (dataItem){
            confirm(CommonService.translate("Bạn có chắc chắn muốn xóa bản ghi này?"), function () {
                vm.insertForm = angular.copy(dataItem);
                kendo.ui.progress(vm.documentBody, true);
                riskProfileDetailService.remove(vm.insertForm).then(function () {
                    toastr.success(CommonService.translate("Xóa bản ghi thành công"));
                    vm.doSearch();
                    kendo.ui.progress(vm.documentBody, false);
                }, function (err) {
                    toastr.error(CommonService.translate("Có lỗi xảy ra"));
                    kendo.ui.progress(vm.documentBody, false);
                });
            });
        };
        vm.doSearchSysGroupSearchPopup = function(){
            var grid = vm.sysGGridSearch;
            if(grid){
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        }
        vm.doSearchRiskProfile = function(){
            var grid = vm.gridRp;
            if(grid){
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        }

        vm.openApprovePopup = function (dataItem, type) {
            vm.flagApprovePopup = type;
            vm.isView = true;
            vm.isCreateForm = false;
            vm.isEdit = false;
            vm.showButtonSaveUpdate = false;
            vm.showButtonApproveDv = false;
            vm.showButtonApproveKtnb = false;
            vm.insertForm = angular.copy(dataItem);
            var title="";
            if (type == 1) {
                vm.showButtonApproveDv = true;
                title="Xác nhận duyệt đơn vị";
                openPopupHtml(title, vm);
            } else if (type == 2) {
                vm.showButtonApproveKtnb = true;
                title="Quản trị rủi ro duyệt Giai Đoạn 2";
                openPopupHtml(title, vm);
            }
        }

        function openPopupHtml(title, vm) {
            var templateUrl="ktnb/riskProfileDetail/riskProfileDetailPopup.html";
            var windowId="APPROVE_DV";
            CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "80%", null, null);
        }

        var modalCancelApproveDv = null;
        vm.cancelApproveDv = function () {
            var templateUrl = 'ktnb/riskProfile/popupCancel.html';
            var title = CommonService.translate("Từ chối");
            vm.reasonReject = null;
            modalCancelApproveDv = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "30%", "20%", null, null);
        }

        vm.cancelApproveKtnb = function () {
            var templateUrl = 'ktnb/riskProfile/popupCancel.html';
            var title = CommonService.translate("Từ chối");
            vm.reasonReject = null;
            modalCancelApproveDv = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "30%", "20%", null, null);
        }

        vm.cancelPopupReject = function () {
            modalCancelApproveDv.dismiss();
        }

        vm.saveCancelStatus = function() {
            if (vm.flagApprovePopup === 1) {
                vm.insertForm.cancelDvDescription = vm.reasonReject;
                if (vm.insertForm.cancelDvDescription == null || vm.insertForm.cancelDvDescription.trim() == "") {
                    toastr.error(CommonService.translate("Lý do không được để trống"));
                    $("#reasonReject").focus();
                    return;
                }
                kendo.ui.progress($("#ktnb_popup_Cancel"), true);
                riskProfileDetailService.cancelApproveDv(vm.insertForm).then(function (res) {
                    if (res && res.error) {
                        toastr.error(CommonService.translate(res.error));
                        kendo.ui.progress($("#ktnb_popup_Cancel"), true);
                        return;
                    }
                    toastr.success(CommonService.translate("Từ chối bản ghi thành công"));
                    vm.doSearch();
                    kendo.ui.progress($("#ktnb_popup_Cancel"), true);
                    $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
                });
            } else if (vm.flagApprovePopup === 2) {
                vm.insertForm.cancelKtnbDescription = vm.reasonReject;
                if (vm.insertForm.cancelKtnbDescription == null || vm.insertForm.cancelKtnbDescription.trim() === "") {
                    toastr.error(CommonService.translate("Lý do không được để trống"));
                    $("#reasonReject").focus();
                    return;
                }
                kendo.ui.progress($("#ktnb_popup_Cancel"), true);
                riskProfileDetailService.cancelApproveKtnb(vm.insertForm).then(function (res) {
                    if (res && res.error) {
                        toastr.error(CommonService.translate(res.error));
                        kendo.ui.progress($("#ktnb_popup_Cancel"), true);
                        return;
                    }
                    toastr.success(CommonService.translate("Từ chối thành công"));
                    vm.doSearch();
                    kendo.ui.progress($("#ktnb_popup_Cancel"), true);
                    $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
                });
            }
        }
        vm.saveApproveDv = function() {
            kendo.ui.progress($("#riskProfile_import_popupId"), true);
            riskProfileDetailService.saveApproveDv(vm.insertForm).then(function (res) {
                if (res && res.error) {
                    toastr.error(CommonService.translate(res.error));
                    kendo.ui.progress($("#riskProfile_import_popupId"), false);
                    return;
                }
                toastr.success(CommonService.translate("Duyệt bản ghi thành công"));
                vm.doSearch();
                kendo.ui.progress($("#riskProfile_import_popupId"), false);
                $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
            });
        }

        vm.saveApproveKtnb = function() {
            kendo.ui.progress($("#riskProfile_import_popupId"), true);
            riskProfileDetailService.saveApproveKtnb(vm.insertForm).then(function (res) {
                if (res && res.error) {
                    toastr.error(CommonService.translate(res.error));
                    kendo.ui.progress($("#riskProfile_import_popupId"), false);
                    return;
                }
                toastr.success(CommonService.translate("Duyệt bản ghi thành công"));
                vm.doSearch();
                kendo.ui.progress($("#riskProfile_import_popupId"), false);
                $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
            });
        }

        $scope.$watch("vm.insertForm.name",function () {
            if(vm.type != 'update'){
                vm.showSolutionBs = false;
            }
            vm.haveProfileDetail = false;
            $("#text_err").text("");

            vm.insertForm.solutionHt = null;
            vm.insertForm.groupSolutionHt = null;
            vm.insertForm.impactSolutionHt = null;
            vm.insertForm.implementDvHtName = null;

            if (vm.insertForm.name != null && vm.type == 'create'){
                riskProfileDetailService.getRiskProfileDetail(vm.insertForm).then(function (res){
                    if (res.length > 0){
                        var data = res[0];
                        vm.insertForm.solutionHt = data.solutionHt;
                        vm.insertForm.groupSolutionHt = data.groupSolutionHt;
                        vm.insertForm.impactSolutionHt = data.impactSolutionHt;
                        vm.insertForm.implementDvHtName = data.implementDvHtName;
                        vm.haveProfileDetail = true;
                        var date = new Date();
                        var d = date.getDate();
                        var m = date.getMonth() +1 ;
                        var y = date.getFullYear();
                        var currentDate = new Date(''+y+'/'+m+'/'+d+'');
                        if(data.statusApprovedDv == 1 && data.statusApprovedKtnb == 1){
                            if (currentDate > kendo.parseDate(data.evaluationDate,'dd/MM/yyyy')){
                                vm.showSolutionBs = true;
                            }else {
                                $("#text_err").text('Chưa hết hạn thời gian thực hiện của giải pháp trước, bạn không thể thêm mới Phương pháp ứng phó bổ sung. Thời gian hết hạn giải pháp trước: '+data.evaluationDate);
                            }
                        }else {
                            $("#text_err").text('Giải pháp trước chưa được duyệt, bạn không thể thêm mới Phương pháp ứng phó bổ sung !');
                        }
                    }
                    else {
                        vm.showSolutionBs = true;
                    }

                })
            }

        });

        vm.exportExcelGrid = function () {
            vm.searchForm.page=null;
            vm.searchForm.pageSize=null;
            riskProfileDetailService.doSearch(vm.searchForm).then(function(d) {
                var temp = d.data;
                CommonService.exportFile(vm.riskProfileDetailGrid, temp, vm.listRemove, vm.listConvert, "GiaiPhapUngPhoRuiRo");
            });
        }

    }
})();

