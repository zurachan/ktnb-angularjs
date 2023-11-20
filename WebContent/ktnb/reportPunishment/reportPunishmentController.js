(function () {
    'use strict';
    var controllerId = 'reportPunishmentController';

    angular.module('MetronicApp').controller(controllerId, reportPunishmentController, '$scope', '$modal', '$rootScope');

    function reportPunishmentController($scope, $templateCache, $rootScope, $timeout,
                                 gettextCatalog, $filter, kendoConfig, $kWindow,
                                 htmlCommonService, CommonService, PopupConst, Restangular,
                                 RestEndpoint, Constant, $http, $modal) {

        var vm = this;
        vm.dataResult = [];
        vm.searchForm = {};
        vm.String = CommonService.translate("Báo cáo") + " > " + CommonService.translate("Báo cáo thưởng phạt cá nhân");
        vm.documentBody = $(".tab-content");
        init();

        function init() {}

        function getTypeName(value){
            switch (value){
                case 1: return 'Thông thường'; break;
                case 2: return 'Ít nghiêm trọng'; break;
                case 3: return 'Nghiêm trọng'; break;
                case 4: return 'Rất nghiêm trọng'; break;
                default: return ''; break;
            }
        }

        function formatToCurrency(amount){
            return amount.toLocaleString('it-IT', {style : 'currency', currency : 'VND'});
        }

        vm.listField = [];
        Restangular.all("commonRsService/getAppParam").post({parType:"VIOLATION_GROUP_DETAIL"}).then(function (res) {
            if (res && res.error){
                toastr.error(CommonService.translate("Có lỗi xảy ra khi get Param"));
            }
            if (res && res.data){
                for (var i = 0; i < res.data.length; i++){
                    var obj = {};
                    obj.name = res.data[i].name;
                    vm.listField.push(obj);
                }
            }
            console.log(vm.listField);
        },function (err) {
            console.log(err);
            toastr.error(CommonService.translate("Có lỗi xảy ra!"))
        });

        vm.doSearch = function () {
            if (vm.searchForm.type == null) {
                toastr.error("Yêu cầu nhập loại báo cáo!");
                return;
            }
            if (vm.searchForm.type === "1") {
                var grid = $("#rp1").data("kendoGrid");
                if (grid) {
                    grid.dataSource.query({
                        page: 1,
                        pageSize: 10
                    });
                }
            }
            if (vm.searchForm.type === "2") {
                var grid = $("#rp2").data("kendoGrid");
                if (grid) {
                    grid.dataSource.query({
                        page: 1,
                        pageSize: 10
                    });
                }
            }
        }
        var recordRp1 = 0;
        vm.countRp1 = 0;
        vm.rp1GridOptions = kendoConfig.getGridOptions({
            autoBind: false,
            resizable: true,
            dataBinding: function () {
                recordRp1 = (this.dataSource.page() - 1) * this.dataSource.pageSize();
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
                        url: Constant.BASE_SERVICE_URL + "reportPunishmentRsService/doSearchReport1",
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
                        return ++recordRp1;
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
                    title: CommonService.translate("Tháng xét phạt"),
                    field: 'punishMonth',
                    width: "100px",
                    headerAttributes: { style: "text-align:center; font-weight: bold",  translate: ""},
                    attributes: { style: "text-align:center;"},
                },
                {
                    title: CommonService.translate("Năm xét phạt"),
                    field: 'punishYear',
                    width: "100px",
                    headerAttributes: { style: "text-align:center; font-weight: bold",  translate: ""},
                    attributes: { style: "text-align:center;"},
                },
                {
                    title: CommonService.translate("Cá nhân vi phạm"),
                    field: 'sysUserNameReceive',
                    width: "200px",
                    headerAttributes: { style: "text-align:center; font-weight: bold",  translate: ""},
                    attributes: { style: "text-align:center; white-space:normal"},
                },
                {
                    title: CommonService.translate("Đơn vị"),
                    field: 'sysGroupNameReceive',
                    width: "200px",
                    headerAttributes: { style: "text-align:center; font-weight: bold",  translate: ""},
                    attributes: { style: "text-align:center; white-space:normal"},
                },
                // {
                //     title: CommonService.translate("Loại lỗi"),
                //     field: 'type',
                //     width: "100px",
                //     headerAttributes: { style: "text-align:center;font-weight: bold",  translate: ""},
                //     attributes: { style: "text-align:center; white-space: normal;"},
                //     template: dataItem => getTypeName(dataItem.type),
                // },
                {
                    title: CommonService.translate("Tên lỗi"),
                    field: 'name',
                    width: "200px",
                    headerAttributes: { style: "text-align:center;font-weight: bold",  translate: ""},
                    attributes: { style: "text-align:center; white-space: normal;"},
                },
                {
                    title: CommonService.translate("Đơn vị xây dựng hành vi vi phạm"),
                    field: 'groupName',
                    width: "150px",
                    headerAttributes: {
                        style: "text-align:center;font-weight: bold;white-space:normal;",
                        translate: ""
                    },
                    attributes: {
                        style: "text-align:left; white-space:normal"
                    },
                },
                {
                    title: CommonService.translate("Lĩnh vực"),
                    field: 'field',
                    width: "120px",
                    headerAttributes: {
                        style: "text-align:center;font-weight: bold;white-space:normal;",
                        translate: ""
                    },
                    attributes: {
                        style: "text-align:center; white-space:normal"
                    },
                },
                {
                    title: CommonService.translate("Mo tả hành vi vi phạm"),
                    field: 'description',
                    width: "400px",
                    headerAttributes: {
                        style: "text-align:center;font-weight: bold;white-space:normal;",
                        translate: ""
                    },
                    attributes: {
                        style: "text-align:left; white-space:normal"
                    },
                },
                {
                    title: CommonService.translate("Mức phạt"),
                    field: 'sanction',
                    width: "150px",
                    headerAttributes: { style: "text-align:center; font-weight: bold",  translate: ""},
                    attributes: { style: "text-align:center; white-space: normal;"},
                    template: dataItem => formatToCurrency(dataItem.sanction),
                },
                {
                    title: CommonService.translate("Số lượng lỗi"),
                    field: 'numberViolation',
                    width: "50px",
                    headerAttributes: { style: "text-align:center; font-weight: bold",  translate: ""},
                    attributes: { style: "text-align:center; white-space: normal;"},
                },
                {
                    title: CommonService.translate("Đơn vị tính lỗi"),
                    field: 'unitType',
                    width: "150px",
                    headerAttributes: {
                        style: "text-align:center;font-weight: bold;white-space:normal;",
                        translate: ""
                    },
                    attributes: {
                        style: "text-align:left; white-space:normal"
                    },
                },
                {
                    title: CommonService.translate("Tổng tiền phạt"),
                    field: 'total',
                    width: "150px",
                    headerAttributes: { style: "text-align:center; font-weight: bold",  translate: ""},
                    attributes: { style: "text-align:center; white-space: normal;"},
                    template: dataItem => formatToCurrency(dataItem.total),
                },
                {
                    title: CommonService.translate("Bảo lưu"),
                    field: 'reserve',
                    width: "100px",
                    headerAttributes: { style: "text-align:center; font-weight: bold",  translate: ""},
                    attributes: { style: "text-align:center; white-space: normal;"},
                    template: dataItem => dataItem.reserve===1?'Có':'',
                },
                {
                    title: CommonService.translate("Đơn vị áp chế tài"),
                    field: 'sysGroupNameRequest',
                    width: "200px",
                    headerAttributes: { style: "text-align:center; font-weight: bold",  translate: ""},
                    attributes: { style: "text-align:center; white-space: normal;"},
                },
                {
                    title: CommonService.translate("Đầu mối đơn vị áp chế tài"),
                    field: 'createByName',
                    width: "220px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Ghi chú"),
                    field: 'note',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                    template: dataItem => dataItem.note==null?'':dataItem.note,
                },
            ]
        });

        var recordRp2 = 0;
        vm.countRp2 = 0;
        vm.rp2GridOptions = kendoConfig.getGridOptions({
            autoBind: false,
            resizable: true,
            dataBinding: function () {
                recordRp2 = (this.dataSource.page() - 1) * this.dataSource.pageSize();
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
                        url: Constant.BASE_SERVICE_URL + "reportPunishmentRsService/doSearchReport2",
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
                        return ++recordRp2;
                    },
                    width: "50px",
                    headerAttributes: {
                        style: "text-align:center;font-weight: bold",
                        translate: ""
                    },
                    attributes: {
                        style: "text-align:center;"
                    },
                },
                {
                    title: CommonService.translate("Tháng xét thưởng"),
                    field: 'punishMonth',
                    width: "100px",
                    headerAttributes: {
                        style: "text-align:center;font-weight: bold",
                        translate: ""
                    },
                    attributes: {
                        style: "text-align:center;"
                    },
                },
                {
                    title: CommonService.translate("Năm xét thưởng"),
                    field: 'punishYear',
                    width: "100px",
                    headerAttributes: {
                        style: "text-align:center;font-weight: bold",
                        translate: ""
                    },
                    attributes: {
                        style: "text-align:center;"
                    },
                },
                {
                    title: CommonService.translate("Cá nhân được thưởng"),
                    field: 'fullName',
                    width: "200px",
                    headerAttributes: {
                        style: "text-align:center;font-weight: bold",
                        translate: ""
                    },
                    attributes: {
                        style: "text-align:center; white-space: normal"
                    },
                },
                {
                    title: CommonService.translate("Đơn vị"),
                    field: 'sysGroupName',
                    width: "200px",
                    headerAttributes: {
                        style: "text-align:center;font-weight: bold",
                        translate: ""
                    },
                    attributes: {
                        style: "text-align:center; white-space: normal"
                    },
                },
                {
                    title: CommonService.translate("Lĩnh vực"),
                    field: 'field',
                    width: "200px",
                    headerAttributes: {
                        style: "text-align:center;font-weight: bold",
                        translate: ""
                    },
                    attributes: {
                        style: "text-align:center; white-space: normal"
                    },
                },
                {
                    title: CommonService.translate("Tiền thưởng"),
                    field: 'total',
                    width: "120px",
                    headerAttributes: {
                        style: "text-align:center;font-weight: bold",
                        translate: ""
                    },
                    attributes: {
                        style: "text-align:center; white-space:normal"
                    },
                    template: (dataItem)=>formatToCurrency(dataItem.total),
                },
                {
                    title: CommonService.translate("Đơn vị đề xuất thưởng"),
                    field: 'sysGroupNameRequest',
                    width: "200px",
                    headerAttributes: {
                        style: "text-align:center;font-weight: bold",
                        translate: ""
                    },
                    attributes: {
                        style: "text-align:center; white-space: normal"
                    },
                },
                {
                    title: CommonService.translate("Đầu mối đơn vị đề xuất thưởng"),
                    field: 'email',
                    width: "200px",
                    headerAttributes: {
                        style: "text-align:center;font-weight: bold",
                        translate: ""
                    },
                    attributes: {
                        style: "text-align:center; white-space: normal"
                    },
                },
            ]
        });

        vm.splitDate = function(){
            if(vm.searchForm.date == null || vm.searchForm.date == ""){
                vm.searchForm.punishMonth = null;
                vm.searchForm.punishYear = null;
            }
            else {
                var date = vm.searchForm.date;
                var str = date.split('/');
                vm.searchForm.punishMonth = str[0];
                vm.searchForm.punishYear = str[1];
            }
        }

        vm.exportReport = function () {
            var obj = {};
            if (vm.searchForm.type == null) {
                toastr.error("Yêu cầu chọn loại báo cáo!");
                return;
            }
            if (vm.searchForm.type == "1") {
                obj.reportName = "ChiTietDanhMucApCheTaiCaNhan";
                obj.sysUserId = vm.searchForm.sysUserIdReceive;
            }
            if (vm.searchForm.type == "2") {
                obj.reportName = "ChiTietTienThuongCaNhanHoanThanhTotNhiemVu";
                obj.sysUserId = vm.searchForm.sysUserIdReceive;
            }

            obj.monthPunish = parseInt(vm.searchForm.monthPunish);
            obj.yearPunish = parseInt(vm.searchForm.yearPunish);
            obj.field = vm.searchForm.field;
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
                if (!vm.isFirst) {
                    $("#rp1").data("kendoGrid").dataSource.data([]);
                    vm.countRp1 = 0;

                }
            }
            if (vm.searchForm.type === "2") {
                vm.dataAvailable1 = false;
                vm.dataAvailable2 = true;
                if (!vm.isFirst) {
                    $("#rp2").data("kendoGrid").dataSource.data([]);
                    vm.countRp2 = 0;
                }
            }
            vm.isFirst = false;
        });

        // =================================================
        //                  start don vi
        // =================================================

        vm.isSelectSysGroupDvg = false;
        vm.sysGroupOptions = {
            clearButton: false,
            dataTextField: "name",
            placeholder: CommonService.translate("Nhập mã hoặc tên CBNV"),
            dataValueField: "name",
            open: function (e) {
                vm.isSelectSysGroupDvg = false;
            },
            select: function (e) {
                vm.isSelectSysGroupDvg = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchForm.sysUserNameReceive = dataItem.fullName;
                vm.searchForm.sysUserIdReceive = dataItem.sysUserId;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSysGroupDvg) {
                        vm.searchForm.sysUserNameReceive = null;
                        vm.searchForm.sysUserIdReceive = null;
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
                        return Restangular.all("commonRsService/getSysUserForAutoComplete").post(
                            {
                                keySearch: vm.searchForm.sysUserNameReceive,
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
                '<p class="col-md-6 text-header-auto border-right-ccc bold" translate>Mã nhân viên</p>' +
                '<p class="col-md-6 text-header-auto bold" translate>Tên nhân viên</p>' +
                '</div>' +
                '</div>',
            template: '<div class="row" ><div class="col-md-6 col-xs-5" style="float:left">#: data.employeeCode #</div><div  style="padding-left: 5px;width:auto;overflow: hidden"> #: data.fullName #</div> </div>',
        }

        var modal = null;
        vm.openPopupSysGroup = function(){
            var templateUrl = "ktnb/popup/popupCommonSearch.html";
            var title = CommonService.translate("Tìm kiếm nhân viên");
            var windowId = "POPUP_SELECT_SYS_GROUP";
            vm.placeHolder = CommonService.translate("Mã/tên nhân viên");
            CommonService.populatePopupCreate(templateUrl, title, null, vm, windowId, null, '60%', '50%', null);
            setTimeout(function () {
                modal = CommonService.getModalInstance1();
            }, 100);
            vm.commonPopupSearch = {};
            var api = "commonRsService/getSysUserForAutoComplete";
            CommonService.fillDataPopupCommonSearch(api, vm.commonPopupSearch, sysUserColumns, vm);
        }

        var sysUserColumns = [
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
                title: CommonService.translate("Email"),
                field: 'email',
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
                    '	<a  type="button" class=" icon_table" uib-tooltip="Chọn" translate>' +
                    '	   <i ng-click="caller.saveSelectSysUser(dataItem)" class="fa fa-check color-green" aria-hidden="true"></i> ' +
                    '	</a>' +
                    '</div>'
                ,
                headerAttributes: {
                    style: "text-align:center;", translate: "",
                },
                attributes: {
                    style: "text-align:center;"
                },
            }
        ];

        vm.saveSelectSysUser = function (dataItem) {
            vm.searchForm.sysUserIdReceive = dataItem.sysUserId;
            vm.searchForm.sysUserNameReceive = dataItem.fullName;
            modal.dismiss();
        }
        // =================================================
        //                  End don vi
        // =================================================

        vm.clear = function (data) {
            switch (data) {
                case 'organization': {
                    vm.searchForm.sysUserIdReceive = null;
                    vm.searchForm.sysUserNameReceive = null;
                    break;
                }
                case 'departmentCode':{
                    vm.searchForm.date = null;
                }
            }
        }
    }
})();
