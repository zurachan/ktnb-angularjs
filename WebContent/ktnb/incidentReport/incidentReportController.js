(function () {
    'use strict';
    var controllerId = 'incidentReportController';
    angular.module('MetronicApp').controller(controllerId,incidentReportFuc);
    function incidentReportFuc($scope, $templateCache, $rootScope, $timeout, gettextCatalog,
                               kendoConfig, $kWindow, $q, incidentReportService,
                               CommonService, htmlCommonService, PopupConst, Restangular, RestEndpoint, Constant) {

        var vm = this;

        vm.documentBody = $("#incidentReport");
        vm.modalBody = ".k-widget .k-window";
        vm.searchForm = {};
        vm.insertForm = {};
        vm.listEmployee = [];
        vm.rootSysGroup = {};
        vm.isCreateForm = false;
        vm.confirmDataIncident = 0;
        vm.isDisabled = true;
        vm.listIncidentType=[
            { value:"1", title:"Tai nạn lao động"},
            { value:"2", title:"Tai nạn giao thông"},
            { value:"3", title:"Trộm cắp tài sản"},
            { value:"4", title:"Cháy nổ"},
            { value:"5", title:"Vụ việc khác"},
        ]
        vm.approvedPermission = '';
        vm.confirmPermission = '';
        vm.viewPermission = '';

        Restangular.all("commonRsService/checkPermission").post({sysUserId: Constant.user.vpsUserToken.sysUserId, adResourceCode:"DATA_INCIDENT", operationCode:"APPROVED"}).then(function(d) {
            vm.approvedPermission = d;
        }, function () {
            console.log('có lỗi khi check quyền')
        });
        Restangular.all("commonRsService/checkPermission").post({sysUserId: Constant.user.vpsUserToken.sysUserId, adResourceCode:"DATA_INCIDENT", operationCode:"CONFIRM"}).then(function(d) {
            vm.confirmPermission = d;
        }, function () {
            console.log('có lỗi khi check quyền')
        });
        Restangular.all("commonRsService/checkPermission").post({sysUserId: Constant.user.vpsUserToken.sysUserId, adResourceCode:"DATA_INCIDENT", operationCode:"VIEW"}).then(function(d) {
            vm.viewPermission = d;
        }, function () {
            console.log('có lỗi khi check quyền')
        });


        initForm();
        function initForm() {
            vm.String = CommonService.translate("Kiểm toán nội bộ") + " > " +
                CommonService.translate("Quản lý báo cáo vụ việc mất an toàn");
                fillDataListIncidentReport([]);
        }



        // ======================clear==================
        vm.clear = function (type) {
            if(type == 'summaryIncidentInsert'){
                $("#summaryIncidentDescription").val("");
                vm.insertForm.summaryIncident = null;

            }
            if(type == 'damagesAssetInsert'){
                $("#insertDamagesAsset").val("");
                vm.insertForm.damagesAsset = null;
            }
            if(type == 'reasonDescriptionInsert'){
                $("#insertReasonDescription").val("");
                vm.insertForm.reasonDescription = null;
            }
            if(type == 'codeIncidentSearch'){
                $("#codeIncidentSearch").val("");
                vm.searchForm.code = null;
            }
            if(type == 'sysGroupDvg'){
                $("#sysGroupDvgId").val("");
                vm.searchForm.sysGroupId = null;
            }
            if(type == 'discipline'){
                $("#discipline").val("");
                vm.insertForm.discipline = null;
            }
            if(type == 'criminalSettlement'){
                $("#criminalSettlement").val("");
                vm.insertForm.criminalSettlement = null;
            }
            if(type == 'civilSettlement'){
                $("#civilSettlement").val("");
                vm.insertForm.civilSettlement = null;
            }
            if(type == 'note'){
                vm.insertForm.note = null;
            }
        }
        // ==================== Hàm doSearch ==============
        vm.doSearch = function () {
            var grid = $("#incidentReportGrid").data("kendoGrid");
            if (grid) {
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        }
        // ========================End doSearch =============
        // ================== Hàm sequence===================
        function zeroPad(num, places) {
            var zero = places - num.toString().length + 1;
            return Array(+(zero > 0 && zero)).join("0") + num;
        }
        //============= Khởi tạo grid on start==============
        var recordIncident = 0;
        vm.countIncident = 0;
        function fillDataListIncidentReport(data) {
            vm.incidentReportOptions = kendoConfig.getGridOptions({
                autoBind: true,
                resizable: true,
                scrollable: true,
                change: vm.onchange,
                toolbar: [
                    {
                        name: "actions",
                        template:
                            '<div class=" pull-left ">' +
                            '<button  type="button" class="btn btn-qlk padding-search-right addQLK ng-scope" style="width: 120px" ng-click="vm.openAdd()" translate>Thêm mới' +
                            '</button> ' +
                            '<button  type="button" class="btn btn-qlk padding-search-right iconReview ng-scope" style="width: 130px;padding-left: 30px" ng-click="vm.createWordReport()" translate>Xuất báo cáo</button>' +
                            '</div>'
                    }
                ],
                dataBinding: function () {
                    recordIncident = (this.dataSource.page() - 1) * this.dataSource.pageSize();
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
                            vm.countIncident = response.total;
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
                            url: Constant.BASE_SERVICE_URL + "incidentRsService/doSearch",
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
                columnMenu: true,
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
                        selectable: true,
                        width: "50px",
                        // field: "incidentReportId",
                        template: dataItem => '<input type="checkbox" name="incidentReportId" ng-model=\'dataItem.selected\' ng-click="vm.addChoice(dataItem)">',
                        attributes: {style: "text-align:center;"},
                    },

                    {
                        title: CommonService.translate("TT"),
                        field: "stt",
                        template: function () {
                            return ++recordIncident;
                        },
                        width: "40px",
                        headerAttributes: {style: "text-align:center", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    }, {
                        title: CommonService.translate("Mã vụ việc"),
                        field: 'code',
                        width: "120px",
                        // template: '<a href="javascript:void(0);" title="#=code#" ng-click=vm.showDetail(dataItem)>#=code#</a>',
                        headerAttributes: {style: "text-align:center", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    }, {
                        title: CommonService.translate("Đơn vị"),
                        field: 'sysGroupCode',
                        width: "150px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Loại vụ việc"),
                        field: 'incidentType',
                        width: "120px",
                        template: function (dataItem) {
                            for (var i = 0; i < vm.listIncidentType.length; i++) {
                                if (dataItem.incidentType == vm.listIncidentType[i].value) {
                                    return CommonService.translate(vm.listIncidentType[i].title);
                                }
                            }
                        },
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },  {
                        title: CommonService.translate("Người tạo"),
                        field: 'createdBy',
                        width: "120px",
                        template: function (dataItem) {
                          return dataItem.sysUserCode + ", "+ dataItem.sysUserName;
                        },
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Ngày tạo"),
                        field: 'createdDate',
                        width: "100px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Trạng thái đơn vị duyệt"),
                        field: 'statusApproved',
                        width: "100px",
                        template: function (dataItem) {
                            if (dataItem.statusApproved == 0) {
                                return CommonService.translate("Chờ duyệt");
                            } else if (dataItem.statusApproved == 1) {
                                return CommonService.translate("Đã duyệt");
                            } else if (dataItem.statusApproved == 2) {
                                return CommonService.translate("Từ chối");
                            } else {
                                return "";
                            }
                        },
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Trạng thái P.PC&KSNB duyệt"),
                        field: 'statusConfirm',
                        width: "100px",
                        template: function (dataItem) {
                            if (dataItem.statusConfirm == 0) {
                                return CommonService.translate("Chờ duyệt");
                            } else if (dataItem.statusConfirm == 1) {
                                return CommonService.translate("Đã duyệt");
                            } else if (dataItem.statusConfirm == 2) {
                                return CommonService.translate("Từ chối");
                            } else {
                                return "";
                            }
                        },
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Trạng thái"),
                        field: 'status',
                        width: "100px",
                        template: function (dataItem) {
                            if (dataItem.status == 0) {
                                return CommonService.translate("Hết hiệu lực");
                            } else if (dataItem.status == 1) {
                                return CommonService.translate("Hiệu lực");
                            } else {
                                return "";
                            }
                        },
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Thao tác"),
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                        template: dataItem =>
                            '<div class="text-center">' +
                            '<button ng-if="dataItem.status == 1 && (dataItem.statusApproved == 0 || dataItem.statusApproved == 2)"  ' +
                            'style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Sửa" translate ' +
                            'ng-click="vm.openEdit(dataItem)" ><i class="fa fa-pencil ng-scope" aria-hidden="true" translate></i></button>'+
                        '   <button  ' +
                                'style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Xem chi tiết" translate ' +
                            'ng-click="vm.openResultIncident(dataItem,1)" ><i class="fa fa-eye ng-scope" aria-hidden="true" translate></i></button>'
                            +
                            '<button ng-if="dataItem.status == 1 && (dataItem.statusApproved == 0)"  ' +
                            'style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Xóa bản ghi" translate ' +
                            'ng-click="vm.delete(dataItem)" ><i class="fa fa-trash ng-scope" aria-hidden="true" translate></i></button>'
                            +
                            '<button ng-if="dataItem.status == 1 && dataItem.statusApproved != 1 && dataItem.statusApproved != 2" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Từ chối" translate ' +
                            'ng-click="vm.remove(dataItem,(dataItem.status == 1 && dataItem.statusApproved == 1 && dataItem.statusConfirm == 0))" >' +
                            '<i style="color:red;" class="fa fa-times ng-scope" aria-hidden="true"></i></button>'
                            +
                            '<button ng-if="dataItem.status == 1 && dataItem.statusApproved == 0" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Đơn vị duyệt" translate ' +
                            'ng-click="vm.approved(dataItem,\'first\')" > <i style="color:greenyellow;" class="fa fa-check ng-scope" aria-hidden="true"></i></button>'
                            +
                            '<button ng-if="((dataItem.status == 1 && dataItem.statusApproved == 1) || (dataItem.statusApproved == 1 && dataItem.statusConfirm == 2)) && dataItem.statusConfirm != 1" ' +
                            'style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Thêm tiến trình xử lý vụ việc" translate ' +
                            'ng-click="vm.openResultIncident(dataItem)" > <i style="color:deepskyblue;" class="fa fa-plus ng-scope" aria-hidden="true"></i></button>'
                            +
                            '<button ng-if="((dataItem.status == 1 && dataItem.statusApproved == 1 && dataItem.statusConfirm == 0) && (vm.confirmPermission)) " style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="P.PC&KSNB duyệt" translate ' +
                            'ng-click="vm.approved(dataItem,\'second\')"> <i style="color:green;" class="fa fa-check-square ng-scope" aria-hidden="true"></i></button>'
                            +
                            '</div>',

                        width: "240px",
                        field: "ThaoTac"
                    }
                ]
            });
            vm.listChoices = [];
            vm.addChoice = function (dataItem) {
                if(!dataItem.selected){
                    for(var i=0; i< vm.listChoices.length; i++) {
                        if (vm.listChoices[i].incidentReportId == dataItem.incidentReportId) {
                            vm.listChoices.splice(i,1);
                        }
                    }
                }else {
                    vm.listChoices.push(dataItem);
                }
            }
            vm.createWordReport = function () {
                if(vm.listChoices.length > 1) {
                    toastr.error(CommonService.translate("Chỉ được chọn 1 bản ghi để xuất báo cáo!!"));
                    return;
                }
                else if(vm.listChoices.length == 0){
                    toastr.error(CommonService.translate("Phải chọn 1 bản ghi để xuất báo cáo!!"));
                    return;
                }
                else {
                    // tiến hành xuất báo cáo
                    var obj = {};
                    obj.incidentReportId = vm.listChoices[0].incidentReportId;
                    obj.reportType = "docx";
                    // obj.reportName = "BaoCaoVuViecMatAnToan";
                    obj.reportName = "BaoCaoVuViecMatAnToan";
                    var date = kendo.toString(new Date((new Date()).getTime()), "dd-MM-yyyy");
                    CommonService.exportReport(obj).then(
                        function (data) {
                            var binarydata = new Blob([data], { type: 'application/octet-stream' });
                            kendo.saveAs({dataURI: binarydata, fileName: date + "_" + obj.reportName + '.docx'});
                        }, function (errResponse) {
                            toastr.error(CommonService.translate("Lỗi không xuất được file word được!"));
                        }
                    );
                }
            }
            vm.delete = function (dataItem) {
                vm.insertForm = angular.copy(dataItem);
                confirm(CommonService.translate("Bạn chắc chắn muốn xóa bản ghi này?"), function () {
                    kendo.ui.progress(vm.documentBody, true);
                    incidentReportService.deleteData(vm.insertForm).then(function (data) {
                        kendo.ui.progress(vm.documentBody, false);
                        toastr.success(CommonService.translate("Xóa bản ghi thành công !!!"));
                        vm.doSearch();
                    }, function () {
                        kendo.ui.progress(vm.documentBody, false);
                        toastr.error(CommonService.translate("Có lỗi xảy ra"));
                    });
                });
                kendo.ui.progress(vm.documentBody, false);

            }
            vm.openEdit =  function (dataItem) {
                vm.isCreateForm = true;
                vm.insertForm = angular.copy(dataItem);
                vm.listEmployee = vm.insertForm.listEmployee;
                vm.insertForm.incidentName = getIncidentByType(dataItem.incidentType);
                vm.insertForm.reasonName = getReasonByType(dataItem.reasonType);
                vm.insertForm.statusIncidentName = getStateIncidentByType(dataItem.stateIncident);
                vm.insertForm.levelReportName = getLevelReportType(dataItem.levelReport);
                fillDataEmployee();
                console.log(vm.insertForm)
                vm.sysGroupName = dataItem.sysGroupName;
                vm.catStationName = dataItem.catStationName
                var templateUrl = 'ktnb/incidentReport/editIncidentPopup.html';
                var title = CommonService.translate("Cập nhật thông tin vụ việc");
                vm.modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "70%", null, null);
            };
            vm.approved = function (dataItem,type) {
                vm.insertForm = angular.copy(dataItem);
                vm.catStationName = dataItem.catStationName
                if(type == 'first'){
                    confirm(CommonService.translate("Bạn chắc chắn muốn duyệt bản ghi này?"), function () {
                        kendo.ui.progress(vm.documentBody, true);
                        incidentReportService.approve(vm.insertForm).then(function (data) {
                            kendo.ui.progress(vm.documentBody, false);
                            toastr.success(CommonService.translate("Duyệt bản ghi thành công !!!"));
                            vm.doSearch();
                        }, function () {
                            kendo.ui.progress(vm.documentBody, false);
                            toastr.error(CommonService.translate("Có lỗi xảy ra"));
                        });
                    });
                    kendo.ui.progress(vm.documentBody, false);
                }
                if(type == 'second'){
                    confirm(CommonService.translate("Bạn chắc chắn muốn duyệt bản ghi này?"), function () {
                        kendo.ui.progress(vm.documentBody, true);
                        incidentReportService.approve2(vm.insertForm).then(function (data) {
                            kendo.ui.progress(vm.documentBody, false);
                            toastr.success(CommonService.translate("Duyệt bản ghi thành công !!!"));
                            vm.doSearch();
                        }, function () {
                            kendo.ui.progress(vm.documentBody, false);
                            toastr.error(CommonService.translate("Có lỗi xảy ra"));
                        });
                    });
                    kendo.ui.progress(vm.documentBody, false);
                }
            }
            vm.remove = function (dataItem,number) {
                vm.insertForm = angular.copy(dataItem);
                var templateUrl = 'ktnb/incidentReport/cancelApprovedPopup.html';
                var title = CommonService.translate("Từ chối đề xuất");
                vm.cancelDescription = null;
                vm.modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "30%", "20%", null, null);
                if(number == 1){
                    vm.insertForm.rejectSecond = true;
                }

            }
            vm.saveCancelStatus = function (type) {
                if(vm.cancelDescription == null || vm.cancelDescription == ""){
                    toastr.error(CommonService.translate("Lí do từ chối không được để trống!"));
                    return;
                }
                else {
                    vm.insertForm.cancelDescription = vm.cancelDescription;
                    if(type == true){
                    //    Từ chối lần 2
                        confirm(CommonService.translate("Xác nhận từ chối bản ghi này!"),function () {
                            incidentReportService.remove2(vm.insertForm).then( function () {
                                vm.insertForm = {};
                                toastr.success(CommonService.translate("Từ chối bản ghi thành công!"));
                                vm.cancel();
                                vm.doSearch();
                                kendo.ui.progress(vm.documentBody, false);
                            }, function (err) {
                                toastr.error(CommonService.translate("Có lỗi xảy ra"));
                                kendo.ui.progress(vm.documentBody, false);
                            });
                        });
                        kendo.ui.progress(vm.documentBody, false);
                    }else {
                        // Từ chối lần 1

                        kendo.ui.progress(vm.documentBody, true);
                        confirm(CommonService.translate("Xác nhận từ chối bản ghi này!"),function () {
                            incidentReportService.remove(vm.insertForm).then( function () {
                                vm.insertForm = {};
                                toastr.success(CommonService.translate("Từ chối bản ghi thành công!"));
                                vm.cancel();
                                vm.doSearch();
                                kendo.ui.progress(vm.documentBody, false);
                            }, function (err) {
                                toastr.error(CommonService.translate("Có lỗi xảy ra"));
                                kendo.ui.progress(vm.documentBody, false);
                            });
                        });
                        kendo.ui.progress(vm.documentBody, false);
                    }

                }
            }

            vm.openResultIncident = function (dataItem,number) {
                vm.disabled = false;
                if (number == 1 ){
                    vm.disabled = true;
                }
                console.log(dataItem);
                vm.insertForm = angular.copy(dataItem);
                vm.catStationName = dataItem.catStationName
                vm.insertForm.incidentName = getIncidentByType(dataItem.incidentType);
                vm.insertForm.reasonName = getReasonByType(dataItem.reasonType);
                vm.insertForm.statusIncidentName = getStateIncidentByType(dataItem.stateIncident);
                vm.insertForm.levelReportName = getLevelReportType(dataItem.levelReport);
                vm.isCreateForm = false;
                vm.listEmployee = vm.insertForm.listEmployee;
                vm.sysGroupName = dataItem.sysGroupName;
                fillDataEmployee()

                var templateUrl = 'ktnb/incidentReport/resultIncidentPopup.html';
                var title = CommonService.translate("Kết quả vụ việc mất an toàn");
                vm.modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "90%", "90%", null, null);
            }
            vm.caculator = function () {
                vm.insertForm.backlogAsset = vm.insertForm.convertMoney - vm.insertForm.recall;
            }
            function getIncidentByType(type) {
                if(type == "1"){ return "Tai nạn lao động"}
                if(type == "2"){ return "Tai nạn giao thông"}
                if(type == "3"){ return "Trộm cắp tài sản"}
                if(type == "4"){ return "Cháy nổ"}
                if(type == "5"){ return "Vụ việc khác"}
            }
            function getReasonByType(type) {
                if(type == "1"){ return "Khách quan"}
                if(type == "2"){ return "Chủ quan"}
            }
            function getStateIncidentByType(type) {
                if(type == "1"){ return "Hoàn thành"}
                if(type == "2"){ return "Công an đang điều tra"}
                if(type == "3"){ return "BQP đang điều tra"}
                if(type == "4"){ return "Đang truy tố"}
                if(type == "5"){ return "Đang xét xử"}
                if(type == "6"){ return "Thi hành án"}
                if(type == "7"){ return "Đang xét họp kỷ luật"}
                if(type == "8"){ return "Đang tạm đóng chờ tiếp tục xử lý"}
            }
            function getLevelReportType(type) {
                if(type == "1"){ return "Bộ quốc phòng "}
                if(type == "2"){ return "Tập đoàn"}
                if(type == "3"){ return "Tổng công ty"}
            }

            // =====================Chức năng thêm mới==============

            vm.openAdd = function () {
                vm.isCreateForm = true;
                vm.insertForm = {};
                vm.catStationName = null;
                vm.sysGroupName = null;
                var templateUrl = 'ktnb/incidentReport/incidentReportAddPopup.html';
                var title = CommonService.translate("Thêm mới vụ việc mất an toàn");
                vm.modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "70%", null, null);
                vm.listEmployee = [];
                fillDataEmployee();
            }

            // ======================= autoComplete đơn vị==========================
            vm.isSelectSysGroupDvg = false;
            vm.insertFormDisplay = {};
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
                    vm.sysGroupName = dataItem.name;
                    vm.searchForm.sysGroupId = dataItem.sysGroupId;

                    // -----------Chức năng thêm mới-------------------
                    vm.insertFormDisplay.sysGroupName = dataItem.name;
                    vm.insertForm.sysGroupId = dataItem.sysGroupId;

                    getSequenceIncidentCode(dataItem.code)



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
                    $timeout(function () {

                    }, 1000);

                },
                pageSize: 10,
                dataSource: {
                    serverFiltering: true,
                    transport: {
                        read: function (options) {
                            vm.isSelectSysGroupDvg = false;
                            return Restangular.all("commonRsService/getSysGroupForAutoComplete").post(
                                {
                                    keySearch: vm.sysGroupName,
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
        }

        vm.isSelectCatStation = false;
        // vm.insertFormDisplay = {};
        vm.catStationOptions = {
            clearButton: false,
            dataTextField: "name", placeholder: CommonService.translate("Nhập tên/mã trạm"),
            dataValueField: "name",
            open: function (e) {
                vm.isSelectCatStation = false;
            },
            select: function (e) {
                vm.isSelectCatStation = true;
                var dataItem = this.dataItem(e.item.index());
                vm.catStationName = dataItem.catStationName;
                vm.searchForm.catStationId = dataItem.catStationId;

                // -----------Chức năng thêm mới-------------------
                vm.insertForm.catStationId = dataItem.catStationId;
                vm.insertForm.catStationName = dataItem.catStationName;
                // getSequenceIncidentCode(dataItem.code)
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectCatStation) {
                        vm.catStationName = null;
                        vm.searchForm.catStationId = null;

                        // --------- Chức năng thêm mới -----------
                        vm.insertForm.catStationName = null;
                        vm.insertForm.catStationId = null;
                    }
                }, 100);
            },
            close: function (e) {
                $timeout(function () {

                }, 1000);

            },
            pageSize: 10,
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        vm.isSelectCatStation = false;
                        return Restangular.all("commonRsService/getStationForAutoComplete").post(
                            {
                                keySearch: vm.catStationName,
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
                '<p class="col-md-6 text-header-auto border-right-ccc" translate>Mã trạm</p>' +
                '<p class="col-md-6 text-header-auto" translate>Tên trạm</p>' +
                '</div>' +
                '</div>',
            template: '<div class="row" ><div class="col-md-6 col-xs-5" style="float:left">#: data.catStationCode #</div><div  style="padding-left: 5px;width:auto;overflow: hidden"> #: data.catStationName #</div> </div>',
        };

        vm.save = function (type) {
            if(type === 'new'){
                if (vm.insertForm.sysGroupId == null || vm.insertFormDisplay.sysGroupName =="") {toastr.error(CommonService.translate("Đơn vị không được để trống"));$("#sysGroupDvgId").focus();return;}
                if (vm.insertForm.incidentType == null || vm.insertForm.incidentType == '' ) {toastr.error(CommonService.translate("Chưa chọn Loại vụ việc!"));return;}
                // if (vm.insertForm.catStationId == null || vm.insertFormDisplay.catStationId =="") {toastr.error(CommonService.translate("Chưa nhập mã trạm"));return;}
                if (vm.insertForm.timeReport == null || vm.insertForm.timeReport == '') {toastr.error(CommonService.translate("Thời gian báo cáo không được để trống"));return;}
                if (vm.insertForm.areaName == null || vm.insertForm.areaName == '') {toastr.error(CommonService.translate("Địa điểm không được để trống"));return;}
                if (vm.insertForm.timeHappened == null || vm.insertForm.timeHappened == '') {toastr.error(CommonService.translate("Thời gian xảy ra vụ việc không được để trống"));return;}
                if (kendo.parseDate(vm.insertForm.timeHappened, "dd/MM/yyyy") > kendo.parseDate(vm.insertForm.timeReport, "dd/MM/yyyy")) {toastr.error(CommonService.translate("Thời gian xảy ra vụ việc không được lớn hơn thời gian báo cáo"));return;}
                if (kendo.parseDate(vm.insertForm.timeHappened, "dd/MM/yyyy") > kendo.parseDate(new Date(), "dd/MM/yyyy")) {toastr.error(CommonService.translate("Thời gian xảy ra vụ việc không được lớn hơn ngày hiện tại"));return;}
                if (kendo.parseDate(vm.insertForm.timeReport, "dd/MM/yyyy") > kendo.parseDate(new Date(), "dd/MM/yyyy")) {toastr.error(CommonService.translate("Thời gian báo cáo không được lớn hơn ngày hiện tại"));return;}
                if (vm.insertForm.summaryIncident == null || vm.insertFormDisplay.summaryIncident =="") {toastr.error(CommonService.translate("Tóm tắt vụ việc không được để trống"));$("#summaryIncidentDescription").focus();return;}
                if (vm.insertForm.damagesEmployee == null || vm.insertFormDisplay.damagesEmployee =="") {toastr.error(CommonService.translate("Số người chết (CBNV) không được để trống"));$("#damagesEmployeeInsert").focus();return;}
                if (vm.insertForm.hurtEmployee == null || vm.insertFormDisplay.hurtEmployee =="") {toastr.error(CommonService.translate("Số người bị thương (CBNV) không được để trống"));$("#hurtEmployeeInsert").focus();return;}
                if (vm.insertForm.damagesPerson == null || vm.insertFormDisplay.damagesPerson =="") {toastr.error(CommonService.translate("Số người chết (người dân) không được để trống"));$("#damagesPersonInsert").focus();return;}
                if (vm.insertForm.hurtPerson == null || vm.insertFormDisplay.hurtPerson =="") {toastr.error(CommonService.translate("Số người bị thương (người dân) không được để trống"));$("#hurtPersonInsert").focus();return;}
                if (vm.insertForm.reasonType == null || vm.insertFormDisplay.reasonType =="") {toastr.error(CommonService.translate("Chưa chọn Loại nguyên nhân!"));return;}
                if (vm.insertForm.reasonType == 1 && (vm.insertForm.objectiveReason == null || vm.insertFormDisplay.objectiveReason =="")) {toastr.error(CommonService.translate("Nguyên nhân khách quan không được để trống"));return;}
                if (vm.insertForm.reasonType == 2 && (vm.insertForm.subjectiveReason == null || vm.insertFormDisplay.subjectiveReason =="")) {toastr.error(CommonService.translate("Nguyên nhân chủ quan không được để trống"));return;}
                if (vm.insertForm.damageType == 2 && (vm.insertForm.convertMoney == null || vm.insertFormDisplay.convertMoney =="")) {toastr.error(CommonService.translate("Thiệt hại quy đổi ra tiền không được để trống"));return;}
                if (vm.insertForm.damageType == 1 && (vm.insertForm.assetDamage == null || vm.insertFormDisplay.assetDamage =="")) {toastr.error(CommonService.translate("Thiệt hại về tài sản không được để trống"));return;}
                if (vm.insertForm.stateIncident == null || vm.insertFormDisplay.stateIncident =="") {toastr.error(CommonService.translate("Chưa chọn tình trạng!"));return;}
                if (vm.insertForm.damageType == null || vm.insertFormDisplay.damageType =="") {toastr.error(CommonService.translate("Loại thiệt hại không được để trống"));$("#insertDamagesAsset").focus();return;}
                if (vm.insertForm.reasonDescription == null || vm.insertFormDisplay.reasonDescription =="") {toastr.error(CommonService.translate("Nguyên nhân cụ thể không được để trống"));$("#insertReasonDescription").focus();return;}
                if (vm.insertForm.hurtPerson == null || vm.insertFormDisplay.hurtPerson =="") {toastr.error(CommonService.translate("Số người dân bị thương không được để trống"));$("#hurtPersonInsert").focus();return;}
                if (vm.insertForm.hurtEmployee == null || vm.insertFormDisplay.hurtEmployee =="") {toastr.error(CommonService.translate("Số CBNV bị thương không được để trống"));$("#hurtEmployeeInsert").focus();return;}
                if (vm.insertForm.levelReport == null || vm.insertFormDisplay.levelReport =="") {toastr.error(CommonService.translate("Chưa chọn cấp báo cáo!"));return;}
                // if (vm.insertForm.listEmployee == null) {toastr.error(CommonService.translate("Chưa"));return;}
                vm.insertForm.listEmployee = $('#listEmployeeGrid').data('kendoGrid').dataSource._data
                console.log("data: ", $('#listEmployeeGrid').data('kendoGrid').dataSource._data)
                confirm(CommonService.translate("Xác nhận lưu bản ghi này?"), function () {
                    kendo.ui.progress(vm.documentBody, true);
                    incidentReportService.save(vm.insertForm).then(function () {
                        toastr.success(CommonService.translate("Lưu bản ghi thành công"));
                        vm.sysGroupName = null;
                        vm.searchForm = {};
                        vm.doSearch();
                        vm.cancel();
                        kendo.ui.progress(vm.documentBody, false);
                        vm.insertFormDisplay = {};
                    }, function (err) {
                        toastr.error(CommonService.translate("Có lỗi xảy ra"));
                        kendo.ui.progress(vm.documentBody, false);
                    });
                });
                kendo.ui.progress(vm.documentBody, false);
            }
            if(type == "result"){
                if (vm.insertForm.recall == null ) {toastr.error(CommonService.translate("Giá trị thu hồi không được để trống"));$("#recall").focus();return;}
                if (vm.insertForm.discipline == null || vm.insertForm.discipline == "" ) {toastr.error(CommonService.translate("Kỷ luật không được để trống!"));$("#discipline").focus();return;}
                if (vm.insertForm.criminalSettlement == null || vm.insertForm.criminalSettlement == '') {toastr.error(CommonService.translate("Giải quyết hình sự không được để trống"));$("#criminalSettlement").focus();return;}
                if (vm.insertForm.civilSettlement == null || vm.insertForm.civilSettlement == '') {toastr.error(CommonService.translate("Giải quyết dân sự không được để trống"));$("#civilSettlement").focus();return;}
                confirm(CommonService.translate("Xác nhận lưu lại bản ghi này?"), function () {
                    kendo.ui.progress(vm.documentBody, true);
                    incidentReportService.saveResult(vm.insertForm).then(function () {
                        kendo.ui.progress(vm.documentBody, false);
                        toastr.success(CommonService.translate("Duyệt bản ghi thành công !!!"));
                        vm.insertForm = {};
                        vm.doSearch();
                        vm.cancel();
                    }, function () {
                        kendo.ui.progress(vm.documentBody, false);
                        toastr.error(CommonService.translate("Có lỗi xảy ra"));
                    });

                });
                kendo.ui.progress(vm.documentBody, false);
            }
            if(type == 'edit'){
                if (vm.insertForm.sysGroupId == null || vm.insertFormDisplay.sysGroupName =="") {toastr.error(CommonService.translate("Đơn vị không được để trống"));$("#sysGroupDvgId").focus();return;}
                if (vm.insertForm.incidentType == null || vm.insertForm.incidentType == '' ) {toastr.error(CommonService.translate("Chưa chọn Loại vụ việc!"));return;}
                // if (vm.insertForm.catStationId == null || vm.insertFormDisplay.catStationId =="") {toastr.error(CommonService.translate("Chưa nhập mã trạm"));return;}
                if (vm.insertForm.areaName == null || vm.insertFormDisplay.areaName == '') {toastr.error(CommonService.translate("Địa điểm không được để trống"));return;}
                if (vm.insertForm.timeReport == null || vm.insertForm.timeReport == '') {toastr.error(CommonService.translate("Thời gian báo cáo không được để trống"));return;}
                if (vm.insertForm.timeHappened == null || vm.insertForm.timeHappened == '') {toastr.error(CommonService.translate("Thời gian xảy ra vụ việc không được để trống"));return;}
                if (kendo.parseDate(vm.insertForm.timeHappened, "dd/MM/yyyy") > kendo.parseDate(vm.insertForm.timeReport, "dd/MM/yyyy")) {toastr.error(CommonService.translate("Thời gian xảy ra vụ việc không được lớn hơn thời gian báo cáo"));return;}
                if (kendo.parseDate(vm.insertForm.timeHappened, "dd/MM/yyyy") > kendo.parseDate(new Date(), "dd/MM/yyyy")) {toastr.error(CommonService.translate("Thời gian xảy ra vụ việc không được lớn hơn ngày hiện tại"));return;}
                if (kendo.parseDate(vm.insertForm.timeReport, "dd/MM/yyyy") > kendo.parseDate(new Date(), "dd/MM/yyyy")) {toastr.error(CommonService.translate("Thời gian báo cáo không được lớn hơn ngày hiện tại"));return;}
                if (vm.insertForm.summaryIncident == null || vm.insertFormDisplay.summaryIncident =="") {toastr.error(CommonService.translate("Tóm tắt vụ việc không được để trống"));$("#summaryIncidentDescription").focus();return;}
                if (vm.insertForm.damagesEmployee == null || vm.insertFormDisplay.damagesEmployee =="") {toastr.error(CommonService.translate("Thiệt hại về người (CBNV) không được để trống"));$("#damagesEmployeeInsert").focus();return;}
                if (vm.insertForm.hurtEmployee == null || vm.insertFormDisplay.hurtEmployee =="") {toastr.error(CommonService.translate("Số người bị thương (CBNV) không được để trống"));$("#hurtEmployeeInsert").focus();return;}
                if (vm.insertForm.damagesPerson == null || vm.insertFormDisplay.damagesPerson =="") {toastr.error(CommonService.translate("Thiệt hại về người dân không được để trống"));$("#damagesPersonInsert").focus();return;}
                if (vm.insertForm.hurtPerson == null || vm.insertFormDisplay.hurtPerson =="") {toastr.error(CommonService.translate("Số người bị thương (người dân) không được để trống"));$("#hurtPersonInsert").focus();return;}
                if (vm.insertForm.reasonType == null || vm.insertFormDisplay.reasonType =="") {toastr.error(CommonService.translate("Chưa chọn Loại nguyên nhân!"));return;}
                if (vm.insertForm.reasonType == 1 && (vm.insertForm.objectiveReason == null || vm.insertFormDisplay.objectiveReason =="")) {toastr.error(CommonService.translate("Nguyên nhân khách quan không được để trống"));return;}
                if (vm.insertForm.reasonType == 2 && (vm.insertForm.subjectiveReason == null || vm.insertFormDisplay.subjectiveReason =="")) {toastr.error(CommonService.translate("Nguyên nhân chủ quan không được để trống"));return;}
                if (vm.insertForm.damageType == 2 && (vm.insertForm.convertMoney == null || vm.insertFormDisplay.convertMoney =="")) {toastr.error(CommonService.translate("Thiệt hại quy đổi ra tiền không được để trống"));return;}
                if (vm.insertForm.damageType == 1 && (vm.insertForm.assetDamage == null || vm.insertFormDisplay.assetDamage =="")) {toastr.error(CommonService.translate("Thiệt hại về tài sản không được để trống"));return;}
                if (vm.insertForm.stateIncident == null || vm.insertFormDisplay.stateIncident =="") {toastr.error(CommonService.translate("Chưa chọn tình trạng!"));return;}
                if (vm.insertForm.damageType == null || vm.insertFormDisplay.damageType =="") {toastr.error(CommonService.translate("Thiệt hại về tài sản không được để trống"));$("#insertDamagesAsset").focus();return;}
                if (vm.insertForm.reasonDescription == null || vm.insertFormDisplay.reasonDescription =="") {toastr.error(CommonService.translate("Nguyên nhân cụ thể không được để trống"));$("#insertReasonDescription").focus();return;}
                if (vm.insertForm.levelReport == null || vm.insertFormDisplay.levelReport =="") {toastr.error(CommonService.translate("Chưa chọn cấp báo cáo!"));return;}
                confirm(CommonService.translate("Xác nhận lưu bản ghi này?"), function () {
                    kendo.ui.progress(vm.documentBody, true);
                    incidentReportService.saveEdit(vm.insertForm).then(function () {
                        toastr.success(CommonService.translate("Lưu bản ghi thành công"));
                        vm.sysGroupName = null;
                        vm.searchForm = {};
                        vm.doSearch();
                        vm.cancel();
                        kendo.ui.progress(vm.documentBody, false);
                        vm.insertFormDisplay = {};
                    }, function (err) {
                        toastr.error(CommonService.translate("Có lỗi xảy ra"));
                        kendo.ui.progress(vm.documentBody, false);
                    });
                });
                kendo.ui.progress(vm.documentBody, false);
            }

        }
        vm.openPopupSysGroup = function () {
            var templateUrl = "ktnb/popup/popupCommonSearch.html";
            var title = CommonService.translate("Tìm kiếm đơn vị");
            var windowId = "POPUP_SELECT_SYS_GROUP";
            vm.placeHolder = CommonService.translate("Mã/tên đơn vị");
            CommonService.populatePopupCreate(templateUrl, title, null, vm, windowId, null, '60%', '50%', null);
            setTimeout(function () {
                vm.modalAdd = CommonService.getModalInstance1();
            }, 100);
            vm.commonPopupSearch = {};
            var api = "commonRsService/getSysGroupForAutoComplete";
            CommonService.fillDataPopupCommonSearch(api, vm.commonPopupSearch, sysGroupColumns, vm);
        }
        // * popup common
        vm.recordPopup = 0;
        // popup don vi thuc hien
        var sysGroupColumns = [
            {
                title: "TT",
                field: "stt",
                template: function () {
                    return ++vm.recordPopup;
                },
                width: "50px",
                headerAttributes: {
                    style: "text-align:center;", translate: "",
                },
                attributes: {
                    style: "text-align:center;"
                },
            }, {
                title: CommonService.translate("Mã đơn vị"),
                field: 'code',
                width: "200px",
                headerAttributes: {
                    style: "text-align:center;", translate: "",
                },
                attributes: {
                    style: "text-align:left;"
                },
            }, {
                title: CommonService.translate("Tên đơn vị"),
                field: 'name',
                width: "350px",
                headerAttributes: {
                    style: "text-align:center;", translate: "",
                },
                attributes: {
                    style: "text-align:left;"
                },
            }, {
                title: CommonService.translate("Chọn"),
                field: 'choose',
                width: "100px",
                template:
                    '<div class="text-center "> ' +
                    '		<a  type="button" class=" icon_table" uib-tooltip="Chọn" translate>' +
                    '			<i ng-click="caller.saveSelectSysGroup(dataItem)" class="fa fa-check color-green" aria-hidden="true"></i> ' +
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
        vm.doSearchCommonPopup = function () {
            var grid = $("#commonSearchPopupGrid").data("kendoGrid");
            if (grid) {
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        }
        vm.saveSelectSysGroup = function (dataItem) {
            vm.insertForm.sysGroupId = dataItem.sysGroupId;
            vm.insertForm.sysGroupName = dataItem.name;
            vm.insertForm.sysGroupCode = dataItem.code;
            vm.sysGroupName = dataItem.name;
            getSequenceIncidentCode(dataItem.code);
            vm.insertForm.areaId = dataItem.areaId;
            vm.insertForm.areaCode = dataItem.code;
            vm.insertFormDisplay.areaName = dataItem.areaCode;
            vm.cancel();
        }
        vm.cancel = function () {
            kendo.ui.progress(vm.documentBody, false);
            vm.modalAdd.dismiss();
            vm.sysGroupName = null;
        };
        function getSequenceIncidentCode(code) {
            Restangular.all("incidentRsService/doSearch").post({code: code}).then(function (res) {
                if(res.data){
                    var sequence = res.data.length + 1;
                    vm.insertForm.code = code + "/" + zeroPad(sequence,6);
                }
            });
        }

        var recordAuthor = 0;
        function fillDataEmployee() {
            vm.listEmployeeGridOptions = kendoConfig.getGridOptions({
                autoBind: true,
                scrollable: true,
                resizable: true,
                sortable: false,
                columnMenu: false,
                serverPaging: true,
                editable: false,
                dataBinding: function () {
                    recordAuthor = (this.dataSource.page() - 1) * this.dataSource.pageSize();
                },
                toolbar: [
                    {
                        name: "actions",
                        template: '<div ng-hide="caller.type==\'detail\'" class="col-md-9" style="text-align: right" ng-if="caller.isCreateForm"><label>Thêm CBNV:</label></div>' +
                            '<div ng-if="caller.isCreateForm" class="col-md-3"><input class="form-control width100" type="text" k-options="caller.sgAutoCOptions" ' +
                            'kendo-auto-complete ng-model="caller.sgForm.keySearch" id="autoCompleteSgAutoC"/></div>'
                    }
                ],
                dataSource: {
                    data: vm.listEmployee,
                    pageSize: 10
                },
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
                            return ++recordAuthor;
                        },
                        width: "30px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    }, {
                        title: CommonService.translate("Mã nhân viên"),
                        field: 'employeeCode',
                        width: "150px",
                        headerAttributes: {
                            style: "text-align:center;white-space:normal;"
                        },
                        attributes: {
                            style: "text-align:left;white-space:normal;white-space:normal;"
                        },
                    },{
                        title: CommonService.translate("Tên nhân viên"),
                        field: 'fullName',
                        width: "200px",
                        headerAttributes: {
                            style: "text-align:center;white-space:normal;"
                        },
                        attributes: {
                            style: "text-align:left;white-space:normal;"
                        },
                    },
                    {
                        title: CommonService.translate("Đơn vị"),
                        field: 'sysGroupNameLv2',
                        width: "200px",
                        headerAttributes: {
                            style: "text-align:center;white-space:normal;"
                        },
                        attributes: {
                            style: "text-align:left;white-space:normal;"
                        },
                    },
                    {
                        title: CommonService.translate("Xóa"),
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold",
                            translate: ""
                        },
                        template: dataItem =>
                            '<div class="text-center " > ' +
                            '<button ng-hide="caller.type==\'detail\'" style=" border: none;" class="icon_table" uib-tooltip="Xóa" ng-click="caller.removeDetail(\'author\',dataItem)"  translate>  ' +
                            '<i style="color: steelblue;" class="fa fa-trash" aria-hidden="true"></i>' +
                            '</button>' +
                            '</div>',
                        width: '30px',
                        field: "actions"
                    }
                ]
            });
            try {
                $('#listEmployeeGrid').data('kendoGrid').dataSource.data(vm.listEmployee);
            } catch(exception){}
        }
        vm.isSelectSgAutoC = false;
        vm.sgAutoCOptions = {
            dataTextField: "name", placeholder: "Tên, Mã nhân viên",
            dataValueField: "sysUserId",
            open: function (e) {
                vm.isSelectSgAutoC = false;
            },
            select: function (e) {
                vm.isSelectSgAutoC = true;
                var dataItem = this.dataItem(e.item.index());
                vm.sgForm.keySearch = null;
                if (vm.listEmployee.length > 0) {
                    for (var i = 0; i < vm.listEmployee.length; i++) {
                        if (dataItem.sysUserId === vm.listEmployee[i].authorId ) {
                            toastr.error("Đã tồn tại tác giả trong danh sách!");
                            return;
                        }
                    }
                }
                let obj = {};
                obj.sysUserId = dataItem.sysUserId;
                obj.fullName = dataItem.fullName;
                obj.employeeCode = dataItem.employeeCode;
                obj.email = dataItem.email;
                obj.phoneNumber = dataItem.phoneNumber;
                obj.groupNameLevel3 = dataItem.groupNameLevel3;
                obj.sysGroupNameLv2 = dataItem.sysGroupNameLv2;
                vm.listEmployee.push(obj);
                vm.listEmployeeGrid.dataSource.data(vm.listEmployee);
                vm.listEmployeeGrid.refresh();
                console.log(vm.listEmployee);
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSgAutoC) {
                        vm.sgForm.sysUserId = null;
                        vm.sgForm.keySearch = null;
                    }
                }, 100);
            },
            close: function (e) {
                $timeout(function () {
                    if (vm.sgForm.sysUserId == null) {
                        vm.sgForm.sysUserId = null;
                        vm.sgForm.keySearch = null;
                    }
                }, 1000);

            },
            pageSize: 10,
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        vm.isSelectSgAutoC = false;
                        return Restangular.all("commonRsService/getSysUserForAutoComplete").post(
                            {
                                keySearch: vm.sgForm.keySearch,
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
                '<div class="row">'+
                '<p class="col-md-6 text-header-auto border-right-ccc" translate>Mã nhân viên</p>' +
                '<p class="col-md-6 text-header-auto" translate>Tên nhân viên </p>' +
                '</div>'+
                '</div>',
            template: '<div class="row" ><div class="col-md-6 col-xs-5" style="float:left">#: data.employeeCode #</div><div  style="padding-left: 5px;width:auto;overflow: hidden"> #: data.fullName #</div> </div>',
        };
    }
})();
