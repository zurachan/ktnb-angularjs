(function () {
    'use strict';
    var controllerId = 'reportSummaryKriController';

    angular.module('MetronicApp').controller(controllerId, reportSummaryKriController, '$scope', '$modal', '$rootScope');

    function reportSummaryKriController($scope, $templateCache, $rootScope, $timeout,
                                        gettextCatalog, $filter, kendoConfig, $kWindow,
                                        htmlCommonService, CommonService, PopupConst, Restangular,
                                        RestEndpoint, Constant, $http, $modal) {

        var vm = this;
        vm.searchForm = {};
        vm.documentBody = $(".tab-content");
        init();

        function init() {
            if ($rootScope.stringtile) {
                vm.String = CommonService.translate("Báo cáo") + " > " + CommonService.translate("Báo cáo tổng hợp tình trạng cập nhật KRI");
            }
            fillDataReport([]);
        }

        vm.listMeasureUnit = [];
        Restangular.all("commonRsService/getAppParam").post({parType:"KTNB_QTRR_MEASURE_UNIT"}).then(function (res) {
            if (res && res.error){
                toastr.error(CommonService.translate("Có lỗi xảy ra khi get Param"));
            }
            if (res && res.data){
                for (var i = 0; i < res.data.length; i++){
                    var obj = {};
                    obj.name = res.data[i].name;
                    vm.listMeasureUnit.push(obj);
                }
            }
        },function (err) {
            toastr.error(CommonService.translate("Có lỗi xảy ra!"))
        });

        vm.listMonth = [
            {value: 1, name: "Tháng 1"},
            {value: 2, name: "Tháng 2"},
            {value: 3, name: "Tháng 3"},
            {value: 4, name: "Tháng 4"},
            {value: 5, name: "Tháng 5"},
            {value: 6, name: "Tháng 6"},
            {value: 7, name: "Tháng 7"},
            {value: 8, name: "Tháng 8"},
            {value: 9, name: "Tháng 9"},
            {value: 10, name: "Tháng 10"},
            {value: 11, name: "Tháng 11"},
            {value: 12, name: "Tháng 12"},
        ];

        vm.listSeason = [
            {value: 1, name: "Quý I"},
            {value: 2, name: "Quý II"},
            {value: 3, name: "Quý III"},
            {value: 4, name: "Quý IV"},
        ]

        vm.listYear = [];
        var year = new Date().getFullYear();
        for (let i = year; i > 2021 ; i--) {
            vm.listYear.push({value: i, name:'Năm '+i});
        }

        vm.listMeasureUnit = [];
        Restangular.all("commonRsService/getAppParam").post({parType:"KTNB_QTRR_MEASURE_UNIT"}).then(function (res) {
            if (res && res.error){
                toastr.error(CommonService.translate("Có lỗi xảy ra khi get param"));
            }
            if (res && res.data){
                for (var i = 0; i < res.data.length; i++){
                    var obj = {};
                    obj.name = res.data[i].name;
                    obj.value = res.data[i].code;
                    vm.listMeasureUnit.push(obj);
                }
            }
        },function (err) {
            console.log(err);
            toastr.error(CommonService.translate("Có lỗi xảy ra!"))
        });

        function getMeasureUnit(id){
            for (let i = 0; i < vm.listMeasureUnit.length; i++) {
                if(id==vm.listMeasureUnit[i].value){
                    return vm.listMeasureUnit[i].name;
                }
            }
            return '';
        }

        vm.listSystem = [];
        Restangular.all("commonRsService/getAppParam").post({parType:"KTNB_QTRR_CALCULATING_SYSTEM"}).then(function (res) {
            if (res && res.error){
                toastr.error(CommonService.translate("Có lỗi xảy ra khi get param"));
            }
            if (res && res.data){
                for (var i = 0; i < res.data.length; i++){
                    var obj = {};
                    obj.name = res.data[i].name;
                    obj.value = res.data[i].code;
                    vm.listSystem.push(obj);
                }
            }
        },function (err) {
            console.log(err);
            toastr.error(CommonService.translate("Có lỗi xảy ra!"))
        });

        function getSystem(id){
            for (let i = 0; i < vm.listSystem.length; i++) {
                if(id==vm.listSystem[i].value){
                    return vm.listSystem[i].name;
                }
            }
            return '';
        }

        vm.doSearch = function () {
            var grid = $("#rp1").data("kendoGrid");
            if (grid) {
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        }

        var recordRp1 = 0;
        vm.countRp1 = 0;
        function fillDataReport(data){
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
                            $("#countAssetReduce").text("" + response.total);
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
                            url: Constant.BASE_SERVICE_URL + "riskIndexRsService/doSearchReportSummaryKri",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, type) {
                            vm.searchForm.page = options.page;
                            vm.searchForm.pageSize = options.pageSize;
                            vm.searchForm.timeIndex = null;
                            if(vm.searchForm.month!=null&&vm.searchForm.month!=''){
                                vm.searchForm.timeIndex = vm.searchForm.month;
                            }
                            if(vm.searchForm.season!=null&&vm.searchForm.season!=''){
                                vm.searchForm.timeIndex = vm.searchForm.season;
                            }
                            if(vm.searchForm.frequency==3&&vm.searchForm.year!=null&&vm.searchForm.year!=''){
                                if(vm.searchForm.month==null||vm.searchForm.month==''||vm.searchForm.season==null||vm.searchForm.season==''){
                                    vm.searchForm.timeIndex = 1;
                                }
                            }
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
                        title: CommonService.translate("STT"),
                        field: "stt",
                        template: function () {
                            return ++recordRp1;
                        },
                        width: "50px",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center;"
                        },
                    }, {
                        title: CommonService.translate("Tên rủi ro"),
                        field: 'riskProfileName',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Mã rủi ro"),
                        field: 'riskProfileCode',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Mã KRI"),
                        field: 'code',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Mô tả KRI"),
                        field: 'description',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Loại KRI"),
                        field: 'typeKri',
                        width: "7%",
                        template: function (dataItem){
                            switch (dataItem.typeKri) {
                                case 1: return 'Cảnh báo'; break;
                                case 2: return 'Theo dõi'; break;
                                default: return ''; break;
                            }
                        },
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Ngưỡng cảnh báo"),
                        field: 'alertValue',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Ngưỡng chú ý"),
                        field: 'warningValue',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Đơn vị đo"),
                        field: 'measureUnit',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem => getMeasureUnit(dataItem.measureUnit)
                    },
                    {
                        title: CommonService.translate("Tần suất đo"),
                        field: 'frequency',
                        width: "10%",
                        template: function (dataItem){
                            switch (dataItem.frequency) {
                                case 1: return 'Tháng'; break;
                                case 2: return 'Quý'; break;
                                case 3: return 'Năm'; break;
                                default: return ''; break;
                            }
                        },
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Phụ trách tính toán"),
                        field: 'sysGroupName',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Dữ liệu cần thu thập"),
                        field: 'dataKri',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold; white-space: normal",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Công thức tính toán"),
                        field: 'formula',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold; white-space: normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Hệ thống hỗ trợ tính toán"),
                        field: 'calculatingSystem',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold; white-space:normal",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                        template: dataItem => getSystem(dataItem.calculatingSystem)
                    },
                    {
                        title: CommonService.translate("Chỉ số KRI"),
                        field: 'kriValue',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold; white-space: normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Thời điểm"),
                        field: 'timeIndex',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold; white-space: normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem => getTimeIndexName(dataItem)
                    },
                    {
                        title: CommonService.translate("Đánh giá"),
                        field: 'commentRisk',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold; white-space: normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Tình trạng"),
                        field: 'state',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold; white-space: normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem => dataItem.state==0?"Trong hạn":dataItem.state==1?"Quá hạn":""
                    },
                    {
                        title: CommonService.translate("Số ngày chậm"),
                        field: 'expireDay',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold; white-space: normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },
                ]
            });
        }

        vm.exportReport = function () {
            vm.searchForm.timeIndex = null;
            if(vm.searchForm.month!=null&&vm.searchForm.month!=''){
                vm.searchForm.timeIndex = vm.searchForm.month;
            }
            if(vm.searchForm.season!=null&&vm.searchForm.season!=''){
                vm.searchForm.timeIndex = vm.searchForm.season;
            }
            if(vm.searchForm.frequency==3&&vm.searchForm.year!=null&&vm.searchForm.year!=''){
                if(vm.searchForm.month==null||vm.searchForm.month==''||vm.searchForm.season==null||vm.searchForm.season==''){
                    vm.searchForm.timeIndex = 1;
                }
            }
            var obj = {};
            obj.reportName = "BaoCaoTongHopTinhTrangCapNhatKri";
            obj.reportType = "EXCEL";
            obj.riskIndexId = vm.searchForm.riskIndexId;
            obj.riskProfileId = vm.searchForm.riskProfileId;
            obj.timeIndex = vm.searchForm.timeIndex;
            obj.year = vm.searchForm.year;
            obj.frequency = vm.searchForm.frequency;
            var date = kendo.toString(new Date((new Date()).getTime()), "dd-MM-yyyy");
            CommonService.exportReport(obj).then(
                function (data) {
                    var binarydata = new Blob([data], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
                    kendo.saveAs({dataURI: binarydata, fileName: date + "_" + obj.reportName + '.xlsx'});
                }, function (errResponse) {
                    toastr.error(CommonService.translate("Lỗi không export EXCEL được!"));
                });
        };

        // =================================================
        //                  start autocomplete
        // =================================================

        vm.doSearchCommonPopup = function () {
            var grid = $("#commonSearchPopupGrid").data("kendoGrid");
            if (grid) {
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        }

        vm.isSelectRiskProfileDvg = false;
        vm.riskProfileOptions = {
            clearButton: false,
            dataTextField: "code",
            placeholder: CommonService.translate("Nhập mã hoặc tên rủi ro"),
            dataValueField: "code",
            open: function (e) {
                vm.isSelectRiskProfileDvg = false;
            },
            select: function (e) {
                vm.isSelectRiskProfileDvg = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchForm.riskProfileCode = dataItem.code;
                vm.searchForm.riskProfileName = dataItem.name;
                vm.searchForm.riskProfileId = dataItem.riskProfileId;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectRiskProfileDvg) {
                        vm.searchForm.riskProfileCode = null;
                        vm.searchForm.riskProfileName = null;
                        vm.searchForm.riskProfileId = null;
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
                        vm.isSelectRiskProfileDvg = false;
                        return Restangular.all("commonRsService/getRiskProfileForAutoComplete").post(
                            {
                                keySearch: vm.searchForm.riskProfileCode,
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

            headerTemplate: '<div class="dropdown-header row text-center k-widget k-header">' +
                '<p class="col-md-2 text-header-auto bold">Mã rủi ro</p>' +
                '<p class="col-md-4 text-header-auto bold">Tên rủi ro</p>' +
                '<p class="col-md-6 text-header-auto bold">Chủ sở hữu</p>' +
                '</div>',
            template: '<div class="row" style="display: flex"><div style="float:left; width: 20%;">#: data.code #</div><div style="width:35%;overflow: hidden"> #: data.name #</div><div style="width:45%;overflow: hidden"> #: data.sysGroupName #</div> </div>',
        }

        var modal = null;
        vm.openPopupRiskProfile = function(){
            var templateUrl = "ktnb/popup/popupCommonSearch.html";
            var title = CommonService.translate("Tìm kiếm rủi ro");
            var windowId = "POPUP_SELECT_RISK_PROFILE";
            vm.placeHolder = CommonService.translate("Mã/tên rủi ro");
            CommonService.populatePopupCreate(templateUrl, title, null, vm, windowId, null, '60%', '50%', null);
            setTimeout(function () {
                modal = CommonService.getModalInstance1();
            }, 100);
            vm.commonPopupSearch = {};
            var api = "commonRsService/getRiskProfileForAutoComplete";
            CommonService.fillDataPopupCommonSearch(api, vm.commonPopupSearch, riskProfileColumns, vm);
        }

        var riskProfileColumns = [
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
                title: CommonService.translate("Mã rủi ro"),
                field: 'code',
                width: "20%",
                headerAttributes: {
                    style: "text-align:center;", translate: "",
                },
                attributes: {
                    style: "text-align:left;"
                },
            }, {
                title: CommonService.translate("Tên rủi ro"),
                field: 'name',
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
                    '	   <i ng-click="caller.saveSelectRiskProfile(dataItem)" class="fa fa-check color-green" aria-hidden="true"></i> ' +
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

        vm.saveSelectRiskProfile = function (dataItem) {
            vm.searchForm.riskProfileCode = dataItem.code;
            vm.searchForm.riskProfileName = dataItem.name;
            vm.searchForm.riskProfileId = dataItem.riskProfileId;
            modal.dismiss();
        }

        vm.isSelectRiskIndexDvg = false;
        vm.riskIndexOptions = {
            clearButton: false,
            dataTextField: "code",
            placeholder: CommonService.translate("Nhập mã KRI"),
            dataValueField: "code",
            open: function (e) {
                vm.isSelectRiskIndexDvg = false;
            },
            select: function (e) {
                vm.isSelectRiskIndexDvg = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchForm.riskIndexCode = dataItem.code;
                vm.searchForm.riskIndexId = dataItem.riskIndexId;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectRiskIndexDvg) {
                        vm.searchForm.riskIndexCode = null;
                        vm.searchForm.riskIndexId = null;
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
                        vm.isSelectRiskProfileDvg = false;
                        return Restangular.all("commonRsService/getRiskIndexForAutoComplete").post(
                            {
                                keySearch: vm.searchForm.riskIndexCode,
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

            headerTemplate: '<div class="dropdown-header row text-center k-widget k-header">' +
                '<p class="col-md-2 text-header-auto bold">Mã KRI</p>' +
                '<p class="col-md-4 text-header-auto bold">Mã rủi ro</p>' +
                '<p class="col-md-6 text-header-auto bold">Tên rủi ro</p>' +
                '</div>',
            template: '<div class="row" style="display: flex"><div style="float:left; width: 20%;">#: data.code #</div><div style="width:35%;overflow: hidden"> #: data.riskProfileCode #</div><div style="width:45%;overflow: hidden"> #: data.riskProfileName #</div> </div>',
        }

        vm.openPopupRiskIndex = function(){
            var templateUrl = "ktnb/popup/popupCommonSearch.html";
            var title = CommonService.translate("Tìm kiếm chỉ số rủi ro");
            var windowId = "POPUP_SELECT_RISK_INDEX";
            vm.placeHolder = CommonService.translate("Mã KRI");
            CommonService.populatePopupCreate(templateUrl, title, null, vm, windowId, null, '60%', '50%', null);
            setTimeout(function () {
                modal = CommonService.getModalInstance1();
            }, 100);
            vm.commonPopupSearch = {};
            var api = "commonRsService/getRiskIndexForAutoComplete";
            CommonService.fillDataPopupCommonSearch(api, vm.commonPopupSearch, riskIndexColumns, vm);
        }

        var riskIndexColumns = [
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
                title: CommonService.translate("Mã KRI"),
                field: 'code',
                width: "20%",
                headerAttributes: {
                    style: "text-align:center;", translate: "",
                },
                attributes: {
                    style: "text-align:left;"
                },
            }, {
                title: CommonService.translate("Mã rủi ro"),
                field: 'riskProfileCode',
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
                    '	   <i ng-click="caller.saveSelectRiskIndex(dataItem)" class="fa fa-check color-green" aria-hidden="true"></i> ' +
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

        vm.saveSelectRiskIndex = function (dataItem) {
            vm.searchForm.riskIndexCode = dataItem.code;
            vm.searchForm.riskIndexId = dataItem.riskIndexId;
            modal.dismiss();
        }
        // =================================================
        //                  End autocomplete
        // =================================================

        vm.clear = function (data) {
            switch (data) {
                case 'riskProfileCode': {
                    vm.searchForm.riskProfileCode = null;
                    vm.searchForm.riskProfileName = null;
                    vm.searchForm.riskProfileId = null;
                    break;
                }
                case 'riskIndexCode':{
                    vm.searchForm.riskIndexCode = null;
                    vm.searchForm.riskIndexId = null;
                }
            }
        }

        vm.clearSearch = function(){
            vm.searchForm.month = null;
            vm.searchForm.season = null;
            vm.searchForm.year = null;
            vm.searchForm.timeIndex = null;
        }

        function getTimeIndexName(dataItem){
            if(dataItem.frequency==1){
                return 'Tháng '+dataItem.timeIndex+'/'+dataItem.year;
            } else if(dataItem.frequency==2){
                return 'Quý '+dataItem.timeIndex+'/'+dataItem.year;
            } else if(dataItem.frequency==3){
                return 'Năm '+dataItem.year;
            } else return '';
        }
    }
})();
