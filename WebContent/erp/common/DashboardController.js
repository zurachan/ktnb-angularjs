
(function () {
    'use strict';
    var controllerId = 'DashboardController';
    angular.module('MetronicApp').filter('startFrom', function () {
        return function (input, start) {
            start = +start; //parse to int
            return input.slice(start);
        }
    });
    angular.module('MetronicApp').controller(controllerId,ktnbEmployeeFunc);
    function ktnbEmployeeFunc($scope, $templateCache, $rootScope, $timeout, gettextCatalog,
                              kendoConfig, $kWindow, $q,$http,
                              CommonService,manageWoEmployeeService, htmlCommonService, PopupConst, Restangular, RestEndpoint, Constant) {

        var vm = this;

        vm.documentBody = $("#ktnbEmployee");
        vm.modalBody = ".k-widget .k-window";
        vm.searchForm = {};
        vm.searchDateToDate = false;
        vm.searchRiskMap = {};


        initForm();
        // searchRiskMap();

        function initForm() {
            createChart();
        }
        // ===========================================================================
        //                             Coppy Phần cũ sang
        // ===========================================================================

        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        var vm = this;
        vm.obj = {};
        vm.obj.reportGroup = "DASH_BROAD";
        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = false;

        //VietNT_20190118_start
//    window.confirm = function (message, doYes, caption) {
        window.confirm = function (message, doYes, caption, doCancel, width='300', height='150') {
            //VietNT_end
            caption = caption || 'Xác nhận'
            var windowTemplate = kendo.template($("#windowConfirmTemplate").html());
//        $scope.message= message ;
            var data = {message: message};
            vm.modalBody = ".k-widget.k-window";
            var modalInstance = $kWindow.open({
                options: {
                    modal: true,
                    title: caption,
                    visible: false,
                    width: width,
                    height: height,
                    actions: ["close"],
                    open: function () {
                        this.wrapper.children('.k-window-content').addClass("fix-footer");

                        $("#confirmPopup_btnCancel").click(function () {
                            modalInstance.dismiss();
                            kendo.ui.progress($(vm.modalBody), false);
                            if (doCancel && (typeof doCancel === "function")) {
                                doCancel();
                            }
                        });

                        $("#confirmPopup_btnConfirm").click(function () {
                            modalInstance.dismiss();
                            kendo.ui.progress($(vm.modalBody), false);
                            if (doYes && (typeof doYes === "function")) {
                                doYes();
                            }
                        });
                    }
                },
                /* template: '<div class="modal-body">'+
                 '<label class="control-label" traslate>{{$scope.message}}</label> </div>  '	+
                 '<div class="modal-footer">'+
                     '<button id="confirmPopup_btnCancel" type="button" class="btn green btn-outline padding-search" translate>Bỏ qua</button>'+
                     '<button id="confirmPopup_btnConfirm" type="button" class="btn green border-button-tree padding-search-right" translate>Xác nhận</button>'+
                 '</div>'*/
                template: windowTemplate(data)
            });
        };

        window.prompt = function (message, doYes, caption, require, requireMsg) {
            caption = caption || 'Nh?c nh?'
            var windowTemplate = kendo.template($("#windowPromptTemplate").html());
            var data = {message: message};
            var modalInstance = $kWindow.open({
                options: {
                    modal: true,
                    title: caption,
                    visible: false,
                    width: '350',
                    height: '200',
                    actions: ["close"],
                    open: function () {
                        this.wrapper.children('.k-window-content').addClass("fix-footer");

                        $("#promptPopup_btnCancel").click(function () {
                            modalInstance.dismiss();
                        });

                        $("#promptPopup_btnConfirm").click(function () {
                            var value = $('#promptPopup_txtReason').val();
                            if (require && (value.trim() == undefined || value.trim() == '')) {
                                toastr.warning(requireMsg);
                            } else {
                                modalInstance.dismiss();
                                if (doYes && (typeof doYes === "function")) {
                                    doYes(value);
                                }
                            }
                        });
                    }
                },
                template: windowTemplate(data)
            });
        };


        $(document).ready(function () {

            $("#week").addClass("active");
            $("#amount").addClass("active");

            kendo.ui.Tooltip.fn._show = function (show) {
                return function (target) {
                    var e = {
                        sender: this,
                        target: target,
                        preventDefault: function () {
                            this.isDefaultPrevented = true;
                        }
                    };

                    if (typeof this.options.beforeShow === "function") {
                        this.options.beforeShow.call(this, e);
                    }
                    if (!e.isDefaultPrevented) {
                        show.call(this, target);
                    }
                };
            }(kendo.ui.Tooltip.fn._show);

            var tooltip = $("#MainTabController").kendoTooltip({
                filter: "button",
                width: 120,
                position: "bottom",
                beforeShow: function (e) {
                    if ($(e.target).data("title") === undefined) {
                        e.preventDefault();
                    }
                },
                show: function (e) {
                    var position = e.sender.options.position;
                    if (position == "bottom") {
                        e.sender.popup.element.css("margin-top", "10px");
                    } else if (position == "top") {
                        e.sender.popup.element.css("margin-bottom", "10px");
                    }
                }
            }).data("kendoTooltip");
            Dashboard.init();

            $scope.$watch(function () {

                return $rootScope.casUser;
            }, function (casUser) {

                if (casUser == null) {
                    return;
                }
                // initChar();
            });
        });

        // ===========================================================================
        //                             End copy Phần cũ sang
        // ===========================================================================
        $scope.$watch("vm.searchForm.dateSearch",function () {
           if(vm.searchForm.dateSearch == 1){
               vm.searchDateToDate = true;
           }
           else {
               vm.searchDateToDate = false;
               vm.searchForm.dateFrom = null;
               vm.searchForm.dateTo = null;
           }
        });
        // $scope.$watch("vm.sysGroupName",function () {
        //     if(vm.sysGroupName == null || vm.sysGroupName == ""){
        //         vm.searchForm.areaCode = null;
        //     }
        // });
        vm.clear = function (data) {
            switch (data){
                case 'sysGroupDvg' : {
                    vm.sysGroupName = null;
                    vm.searchForm.sysGroupIdPs = null;
                    break;
                }
                case 'areaCode':{
                    vm.searchForm.areaCode = null;
                    break;
                }
                case 'dateSearch':{
                    vm.searchForm.dateSearch = null;
                    vm.searchForm.dateFrom = null;
                    vm.searchForm.dateTo = null;
                    break;
                }
                case 'dateToDate':{
                    vm.searchForm.dateFrom = null;
                    vm.searchForm.dateTo = null;
                    break;
                }
                case 'sysGroupRiskMap':{
                    vm.searchRiskMap.sysGroupName = null;
                    vm.searchRiskMap.sysGroupId = null;
                    break;
                }
                case 'dateSearchRisk': {
                    vm.searchRiskMap.startDate = null;
                    vm.searchRiskMap.endDate = null;
                }
            }
        }
        // =================================================
        //                  start don vi
        // =================================================
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
                vm.searchForm.sysGroupIdPs = dataItem.sysGroupId;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSysGroupDvg) {
                        vm.sysGroupName = null;
                        vm.searchForm.sysGroupIdPs = null;
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

        vm.openPopupSysGroup = function () {
            var templateUrl = "ktnb/popup/popupCommonSearch.html";
            var title = CommonService.translate("Tìm kiếm đơn vị");
            var windowId = "POPUP_SELECT_SYS_GROUP";
            vm.placeHolder = CommonService.translate("Mã/tên đơn vị");
            CommonService.populatePopupCreate(templateUrl, title, null, vm, windowId, null, '60%', '50%', null);
            setTimeout(function () {
                vm.modal = CommonService.getModalInstance1();
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

        vm.saveSelectSysGroup = function (dataItem) {
            vm.sysGroupName = dataItem.name;
            vm.searchForm.sysGroupIdPs = dataItem.sysGroupId;
            // =============Phần risk map=================
            vm.searchRiskMap.sysGroupName = dataItem.name;
            vm.searchRiskMap.sysGroupId =dataItem.sysGroupId;
            vm.cancel();
        };
        vm.doSearchCommonPopup = function () {
            var grid = $("#commonSearchPopupGrid").data("kendoGrid");
            if (grid) {
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        }
        vm.cancel = function () {
            vm.modal.dismiss();
        }
        // =================================================
        //                  End don vi
        // =================================================

        function createChart() {
            $("#chart1").kendoChart({
                title: {
                    text: "Số lượng SKRR theo nhóm rủi ro",
                    font: '18px sans-serif ',
                    color: "#000",
                },
                dataSource:{
                    transport: {
                        read: {
                            url: RestEndpoint.BASE_SERVICE_URL + "commonRsService/numberSKRRChart",
                            type: "POST",
                            contentType: "application/json; charset=utf-8"
                        },
                        parameterMap: function(options, type) {
                            var obj = angular.copy(vm.searchForm);
                            return JSON.stringify(obj);
                        }
                    },
                    group: {
                        field: "damageTypeName"
                    },
                },
                legend: {
                    position: "bottom",
                },
                seriesDefaults: {
                    type: "bar",
                    labels: {
                        visible: true,
                        format: "{0}"
                    }

                },
                series: [
                    {
                        field: "sumDamageSKRR",
                        categoryField: "riskTypeName"
                    },
                ],
                categoryAxis: {
                    labels: {
                        rotation: -60,
                    },
                    majorGridLines: {
                        visible: false
                    }
                },
                valueAxis:{
                    labels:{
                        rotation: -60,
                    }
                },
                seriesColors: ["#FF9900","#339900","#FF3366"],
                tooltip: {
                    color: "#fff",
                    visible: true,
                    format: "N0",
                    template: "#: series.name #"
                }
            });



            $("#chart2").kendoChart({
                title: {
                    text: "Trạng thái khắc phục của SKRR",
                    font: '18px sans-serif ',
                    color: "#000",
                },
                dataSource:{
                    transport: {
                        read: {
                            url: RestEndpoint.BASE_SERVICE_URL + "commonRsService/statusOvercomeSKRR",
                            type: "POST",
                            contentType: "application/json; charset=utf-8"
                        },
                        parameterMap: function(options, type) {
                            var obj = angular.copy(vm.searchForm);
                            return JSON.stringify(obj);
                        }
                    },
                },
                legend: {
                    position: "bottom",
                },
                seriesDefaults: {
                    labels: {
                        visible: true,
                        format: "{0}%"
                    }
                },
                categoryAxis: {
                    labels: {
                        rotation: -60,
                    },
                    majorGridLines: {
                        visible: false
                    }
                },
                series: [
                    {
                        type:"bar",
                        name: "Tình trạng khắc phục",
                        field: "statusOvercome",
                        categoryField: "riskTypeName"
                    }
                ],
                valueAxis:{
                    labels:{
                        rotation: -60,
                    }
                },
                seriesColors: ["#005AC2"],
                tooltip: {
                    color: "#fff",
                    visible: true,
                    format: "N0",
                    template: "#: category #"
                }
            });


            $("#chart3").kendoChart({
                title: {
                    text: "Cơ cấu nguyên nhân gây ra SKRR",
                    font: '18px sans-serif ',
                    color: "#000",
                },
                dataSource:{
                    transport: {
                        read: {
                            url: RestEndpoint.BASE_SERVICE_URL + "commonRsService/numberReasonTypeSKRR",
                            type: "POST",
                            contentType: "application/json; charset=utf-8"
                        },
                        parameterMap: function(options, type) {
                            var obj = angular.copy(vm.searchForm);
                            return JSON.stringify(obj);
                        }
                    },
                },
                legend: {
                    labels: {
                        text: "Các loại nguyên nhân"
                    },
                    position: "right",
                },
                seriesDefaults: {
                    labels: {
                        visible: true,
                        background: "transparent",
                    }
                },
                series: [
                    {
                        type: "pie",
                        field: "sumReasonType",
                        categoryField: "reasonTypeName"
                    }
                ],
                seriesClick: function(e){
                    $.each(e.sender.dataSource.view(), function() {
                        this.explode = false;
                    });
                    e.sender.options.transitions = false;
                    e.dataItem.explode = true;
                    e.sender.refresh();
                },
                valueAxis:{
                    labels:{
                        rotation: -60,
                    }
                },
                seriesColors: ["#005AC2","#99CC00","#FFCC00","#66CCCC","#FF99CC","#99FFCC","#DD0000","#000011","#FF99FF","#006600","#00FF00","#660066"],
                categoryAxis: {
                },
                tooltip: {
                    color: "#fff",
                    visible: true,
                    format: "N0",
                    template: "#: category #"
                }
            });

            $("#chart4").kendoChart({
                title: {
                    text: "Giá trị tổn thất thuần theo loại tổn thất",
                    font: '18px sans-serif ',
                    color: "#000",
                },
                dataSource:{
                    transport: {
                        read: {
                            url: RestEndpoint.BASE_SERVICE_URL + "commonRsService/numberLossValueSKRR",
                            type: "POST",
                            contentType: "application/json; charset=utf-8"
                        },
                        parameterMap: function(options, type) {
                            var obj = angular.copy(vm.searchForm);
                            return JSON.stringify(obj);
                        }
                    },
                },
                legend: {
                    position: "bottom",
                },
                seriesDefaults: {
                    labels: {
                        visible: true,
                        template: function(e){
                            return (e.value/1000000).toFixed(3);
                        }
                    }
                },
                categoryAxis: {
                    maxDivisions: 12,
                    labels: {
                        rotation: -60,
                    },
                    majorGridLines: {
                        visible: false,
                    },
                },
                series: [
                    {
                        type:"bar",
                        name: "Giá trị tổn thất thuần (triệu VNĐ)",
                        field: "lossValue",
                        categoryField: "damageTypeName",
                    }
                ],
                valueAxis:{
                    labels:{
                        rotation: -60,
                        template: function(e){
                            return e.value > 1000000? e.value/1000000 : e.value;
                        }
                    },
                },
                seriesColors: ["#6daf6d"],
                tooltip: {
                    color: "#fff",
                    visible: true,
                    format: "N0",
                    // template: "#: value #"
                    template: function(e){
                        return (e.value/1000000).toFixed(3) + " triệu VNĐ";
                    }
                }
            });
            $("#chart5").kendoChart({
                title: {
                    text: "Số lượng SKRR và tổn thất tài chính thuần theo tháng",
                    font: '18px sans-serif ',
                    color: "#000",
                },
                dataSource:{
                    transport: {
                        read: {
                            url: RestEndpoint.BASE_SERVICE_URL + "commonRsService/numberLossValueMonthSKRR",
                            type: "POST",
                            contentType: "application/json; charset=utf-8"
                        },
                        parameterMap: function(options, type) {
                            var obj = angular.copy(vm.searchForm);
                            return JSON.stringify(obj);
                        }
                    },
                },
                legend: {
                    position: "bottom",
                },
                series: [
                    {
                        type: "line",
                        name: "Tổng tổn thất trong tháng (triệu VNĐ)",
                        field: "lossValue",
                        categoryField: "monthLossValue"
                    },
                    {
                        type: "column",
                        field: "numberDamageType",
                        categoryField: "monthLossValue",
                        name: "Số lượng SKRR trong tháng",
                        axis: "axis",
                        color: "#3eaee2"
                    },
                ],
                categoryAxis: {
                    labels: {
                        rotation: -60,
                    },
                    axisCrossingValue: [0, 100],
                    majorGridLines: {
                        visible: false
                    }
                },
                valueAxis: [
                    {
                        labels:
                        {
                            rotation: -60,
                            template:function(e){
                                return e.value > 1000000? e.value/1000000 : e.value;
                            }
                        },
                        line: { visible: false },
                    },
                    {
                        name: "axis",
                        axisCrossingValue: 0,
                        majorUnit: 30,
                        labels: {
                            rotation: -60,
                        },
                        line: {
                            visible: false
                        }
                    }
                ],

                tooltip: {
                    color: "#fff",
                    visible: true,
                    format: "N0",
                    // template: "#: value #"
                    template: function(e){
                        return e.value>1000000?  (e.value/1000000 + " triệu VNĐ"): e.value;

                    }
                }
            });
            $("#chart6").kendoChart({
                title: {
                    text: "Số lượng SKRR có thiệt hại phi tài chính",
                    font: '18px sans-serif ',
                    color: "#000",
                },
                dataSource:{
                    transport: {
                        read:{
                          url: RestEndpoint.BASE_SERVICE_URL + "commonRsService/numberValueDamageNon",
                          type: "POST",
                          contentType: "application/json; charset=utf-8"
                        },
                        parameterMap: function(options, type) {
                            var obj = angular.copy(vm.searchForm);
                            return JSON.stringify(obj);
                        }
                    }
                },
                legend: {
                    position: "bottom",
                },
                seriesDefaults: {
                    labels: {
                        visible:true,
                        format:"{0}"
                    }
                },
                series: [
                    {
                      name: CommonService.translate("Số lượng SKRR phi tài chính"),
                      type: "column",
                      field: "numberValueDamageNon",
                      color: "#9999CC"
                    },
                ],
                categoryAxis: {
                    majorGridLines: {
                        visible: false
                    },
                    field: "valueDamageNon",
                    labels: {
                        rotation:-60,
                        template: function (e) {
                            var str = e.value;
                            var len = 10;
                            return str.length > len ? str.substring(0, len) + "..." : str;
                        }
                    }
                },
                seriesColors:{},
                valueAxis:{
                    labels: {
                        rotation:-60
                    }
                },
                tooltip: {
                    color:"#fff",
                    visible: true,
                    template: "#: category #"
                },
            });

        }
        $(document).ready(function(){
            $(document).bind("kendo:skinChange", createChart);
        })


        vm.doSearch = function(){
            vm.String = "";
            if(vm.sysGroupName){
                vm.String = vm.sysGroupName ;
            }
            if (vm.searchForm.areaCode){
                vm.String += (" - " + vm.searchForm.areaCode );
            }
            if(vm.searchForm.dateSearch){
                vm.String += (" - " + getDateSearchByValue(vm.searchForm.dateSearch) );
            }

            if(vm.searchForm.dateSearch != 1){
                var date = new Date().getDate();
                var month = new Date().getMonth();
                var year = new Date().getFullYear();
                vm.searchForm.dateTo = kendo.toString(kendo.parseDate(new Date()),'dd/MM/yyyy');
                if (vm.searchForm.dateSearch == 2){
                    vm.searchForm.dateFrom = kendo.toString(kendo.parseDate(new Date(year,month,date-7)),'dd/MM/yyyy');
                }
                if (vm.searchForm.dateSearch == 3){
                    vm.searchForm.dateFrom = kendo.toString(kendo.parseDate(new Date(year,month-1,date)),'dd/MM/yyyy');
                }
                if (vm.searchForm.dateSearch == 4){
                    vm.searchForm.dateFrom = kendo.toString(kendo.parseDate(new Date(year,month-3,date)),'dd/MM/yyyy');
                }
            }
            else
            {
                if (!vm.searchForm.dateFrom && !vm.searchForm.dateTo ){
                    toastr.error(CommonService.translate("Vui lòng chọn ngày tháng!"));
                    return;
                }
                if (vm.searchForm.dateFrom && !vm.searchForm.dateTo ){
                    toastr.error(CommonService.translate("Chưa chọn ngày tháng kết thúc!"));
                    return;
                }
                if (!vm.searchForm.dateFrom && vm.searchForm.dateTo ){
                    toastr.error(CommonService.translate("Chưa chọn ngày tháng bắt đầu!"));
                    return;
                }
                if (new Date(vm.searchForm.dateTo) < new Date(vm.searchForm.dateFrom ) ){
                    toastr.error(CommonService.translate("Vui lòng chọn ngày kết thúc lớn hơn ngày bắt đầu"));
                    return;
                }
            }
            if(vm.searchForm.dateFrom){
                vm.String += (" - từ ngày: " + vm.searchForm.dateFrom);
            }
            if(vm.searchForm.dateTo && vm.searchForm.dateFrom){
                vm.String += (" - đến ngày: " + vm.searchForm.dateTo);
            }
            $("#chart1").data("kendoChart").dataSource.read();
            $("#chart2").data("kendoChart").dataSource.read();
            $("#chart3").data("kendoChart").dataSource.read();
            $("#chart4").data("kendoChart").dataSource.read();
            $("#chart5").data("kendoChart").dataSource.read();
            $("#chart6").data("kendoChart").dataSource.read();

        }
        function getDateSearchByValue(value) {
            switch (value){
                case '1':{
                    return CommonService.translate("");
                    break;
                }
                case '2':{
                    return CommonService.translate("7 ngày trước");
                    break;
                }
                case '3':{
                    return CommonService.translate("1 tháng trước");
                    break;
                }
                case '4':{
                    return CommonService.translate("3 tháng trước");
                    break;
                }
            }

        }

        // ===============================Phần Thằng Đạt thêm tạo riskheat Map ========================
        // ============================================================================================
        // $(document).ready(function(){
        //     searchRiskMap(null);
        // });
        vm.sysGroupRiskMapOptions = {
            clearButton: false,
            dataTextField: "name", placeholder: CommonService.translate("Nhập tên đơn vị"),
            dataValueField: "name",
            open: function (e) {
                vm.isSelectSysGroupDvg = false;
            },
            select: function (e) {
                vm.isSelectSysGroupDvg = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchRiskMap.sysGroupName = dataItem.name;
                vm.searchRiskMap.sysGroupId =dataItem.sysGroupId;

            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSysGroupDvg) {
                        vm.searchRiskMap.sysGroupName = null;
                        vm.searchRiskMap.sysGroupId = null;
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
                                keySearch: vm.searchRiskMap.sysGroupName,
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

        vm.horizontal = ["Rất thấp","Thấp","Trung bình","Cao","Rất cao"];
        vm.vertical = ["Rất thấp","Thấp","Trung bình","Cao","Rất cao"];
        vm.data_ = [];
        function searchRiskMap(obj) {
            Restangular.all("riskProfile/getRpForMap").post(obj).then(function(response){
                vm.riskMapData = response.rpForMap;
                vm.riskMapData2 = response.rpForMap2;
                vm.riskMapData3 = response.rpForMap3;
                vm.influence = '';
                vm.possibility = '';
                vm.data_ = [];
                if (vm.riskMapData.length > 0){
                    for (let i = 0; i < vm.riskMapData.length; i++) {
                        var rp = "<span class='circleRp1'>"+vm.riskMapData[i].code+"</span>";
                        var rpSlug = "[data-coords= '" + vm.riskMapData[i].possibilityTa + "_" + vm.riskMapData[i].influenceLevelTa + "']";
                        var index = vm.riskMapData[i].possibilityTa + "_" + vm.riskMapData[i].influenceLevelTa;

                        var temp = {
                            index:'',
                            code :[],
                        };
                        if (vm.data_.length  == 0){
                            temp.index = index;temp.code.push({code:vm.riskMapData[i].code,name:vm.riskMapData[i].name,color:"#32CD32"});vm.data_.push(temp);
                        }else {
                            var t ;
                            var flag = false;
                            for (let k = 0; k < vm.data_.length; k++){
                                if (vm.data_[k].index == index){
                                    t = k; flag = true; break;
                                }
                            }
                            if (flag == true){ vm.data_[t].code.push({code:vm.riskMapData[i].code,name:vm.riskMapData[i].name,color:"#32CD32"});
                            }else {
                                temp.index = index;
                                temp.code.push({code:vm.riskMapData[i].code,name:vm.riskMapData[i].name,color:"#32CD32"});
                                vm.data_.push(temp);
                            }
                        }
                        if ($('td' + rpSlug + '> span').length > 7) {
                            continue;
                        }
                        if ($('td' + rpSlug + '> span').length == 7) {
                            $('td' + rpSlug).append('<span>.....</span>'); continue;

                        }
                        if ($('td' + rpSlug + '> span').length == 2 || $('td' + rpSlug + '> span').length == 4) {
                            $('td' + rpSlug).html($('td' + rpSlug).html()+rp+'</br>');
                        }
                        else $('td' + rpSlug).html($('td' + rpSlug).html()+rp);
                    }
                }
                // ==========================Risk Map 2=========================================
                if (vm.riskMapData2.length > 0){
                    for (let i = 0; i < vm.riskMapData2.length; i++) {
                        var rp = "<span class='circleRp2'>"+vm.riskMapData2[i].code+"</span>";
                        var rpSlug = "[data-coords= '" + vm.riskMapData2[i].possibilityTt + "_" + vm.riskMapData2[i].influenceLevelTt + "']";
                        var index = vm.riskMapData2[i].possibilityTt + "_" + vm.riskMapData2[i].influenceLevelTt;


                        var temp = {
                            index:'',
                            code :[],
                        };

                        if (vm.data_.length  == 0){
                            temp.index = index;temp.code.push({code:vm.riskMapData2[i].code,name:vm.riskMapData2[i].name,color:"#1E90FF"});vm.data_.push(temp);
                        }
                        else {
                            var t ;
                            var flag = false;
                            for (let k = 0; k < vm.data_.length; k++){
                                if (vm.data_[k].index == index){
                                    t = k; flag = true; break;
                                }
                            }
                            if (flag == true){ vm.data_[t].code.push({code:vm.riskMapData2[i].code,name:vm.riskMapData2[i].name,color:"#1E90FF"});
                            }else {
                                temp.index = index;
                                temp.code.push({code:vm.riskMapData2[i].code,name:vm.riskMapData2[i].name,color:"#1E90FF"});
                                vm.data_.push(temp);
                            }
                        }
                        if ($('td' + rpSlug + '> span').length > 7) {
                            continue;
                        }
                        if ($('td' + rpSlug + '> span').length == 7) {
                            $('td' + rpSlug).append('<span>.....</span>');
                            continue;
                        }
                        if ($('td' + rpSlug + '> span').length == 2 || $('td' + rpSlug + '> span').length == 4) {
                            $('td' + rpSlug).html($('td' + rpSlug).html()+rp+'</br>');
                        } else $('td' + rpSlug).html($('td' + rpSlug).html()+rp);
                    }
                }
                // ==========================Risk Map 3=========================================
                if (vm.riskMapData3.length > 0){
                    for (let i = 0; i < vm.riskMapData3.length; i++) {
                        var rp = "<span class='circleRp3'>"+vm.riskMapData3[i].code+"</span>",
                            rpSlug = "[data-coords= '" + vm.riskMapData3[i].possibilityCn + "_" + vm.riskMapData3[i].influenceLevelCn + "']";
                        var index = vm.riskMapData3[i].possibilityCn + "_" + vm.riskMapData3[i].influenceLevelCn;

                        var temp = {
                            index:'',
                            code :[],
                        };

                        if (vm.data_.length  == 0){
                            temp.index = index;temp.code.push({code:vm.riskMapData3[i].code,name:vm.riskMapData3[i].name,color:"#8B008B"});vm.data_.push(temp);
                        }
                        else {
                            var t ;
                            var flag = false;
                            for (let k = 0; k < vm.data_.length; k++){
                                if (vm.data_[k].index == index){
                                    t = k; flag = true; break;
                                }
                            }
                            if (flag == true){ vm.data_[t].code.push({code:vm.riskMapData3[i].code,name:vm.riskMapData3[i].name,color:"#8B008B"});
                            }else {
                                temp.index = index;
                                temp.code.push({code:vm.riskMapData3[i].code,name:vm.riskMapData3[i].name,color:"#8B008B"});
                                vm.data_.push(temp);
                            }
                        }
                        if ($('td' + rpSlug + '> span').length > 7) {
                            continue;
                        }
                        if ($('td' + rpSlug + '> span').length == 7) {
                            $('td' + rpSlug).append('<span>.....</span>');
                            continue;
                        }
                        if ($('td' + rpSlug + '> span').length == 2 || $('td' + rpSlug + '> span').length == 4) {
                            $('td' + rpSlug).html($('td' + rpSlug).html()+rp+'</br>');
                        } else $('td' + rpSlug).html($('td' + rpSlug).html()+rp);
                    }
                }
            }, function(){
                console.log('Có lỗi xảy ra');
            });
        }
        $('#table_risk_heatmap td').on('click', function(event) {
                $("#influenceRiskMap").text('');
                $("#possibilityRiskMap").text('');
                document.getElementById("regionCodeHover").innerHTML = '';
                $(this).addClass("highlight");
            if (vm.data_.length > 0){
                var coords = event.target.dataset.coords;
                for (var i = 0; i < vm.data_.length; i++) {
                    if (vm.data_[i].index == coords){
                        var td = coords.split('_');
                        var y = td[0]-1; var x = td[1]-1;
                        $("#influenceRiskMap").text(vm.vertical[x]);
                        $("#possibilityRiskMap").text(vm.horizontal[y]);


                        var codeList = vm.data_[i].code;
                        var html = '';
                        for (var j=0;j < codeList.length; j++){
                            html += '<div class="row col-md-6"><span class="circleRp" style="background: '+codeList[j].color+'">'+codeList[j].code+'</span><span style="font-weight: bold"> - '+codeList[j].name+'</span></div>'
                        }
                        document.getElementById("regionCodeHover").innerHTML = html;
                    }
                }
            }
        });
        vm.doSearchRiskMap = function () {
            $("#riskMatrix table tr span").remove();
            $("#riskMatrix table tr br").remove();
            vm.sysGroupNameRisk = vm.searchRiskMap.sysGroupName;
            searchRiskMap(vm.searchRiskMap);
        }

// ===============================Phần Thằng Đạt thêm tạo riskheat Map ========================
// ============================================================================================

        //---------appTran mo tab tu link email -----------//
        var url = window.location.href;
        if(url.includes("appTrans")) {
            CommonService.goTo("MANAGE_WO_EMPLOYEE");
            var part = url.split("?appTrans=")
            if(part[1].includes("&ticket")) {
                var rawCode = part[1].split("&ticket=");
                manageWoEmployeeService.setData(rawCode[0]);
            } else {
                manageWoEmployeeService.setData(part[1]);
            }
        }
    }

})();
