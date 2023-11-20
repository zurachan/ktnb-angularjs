(function () {
    'use strict';
    var controllerId = 'dashboardPunishmentController';

    angular.module('MetronicApp').controller(controllerId, dashboardPunishmentController);

    function dashboardPunishmentController($scope,$http, $templateCache, $rootScope, $timeout, gettextCatalog,
                                     kendoConfig, $kWindow, $q,
                                     CommonService, htmlCommonService, PopupConst, Restangular, RestEndpoint, Constant) {
        var vm = this;

        vm.documentBody = $(".tab-content");
        vm.searchForm = {};
        vm.listMonth = [];
        vm.listYear = [];
        for (let i = 1; i < 13; i++) {
            vm.listMonth.push({value: i, name:'Tháng '+i});
        }
        var year = new Date().getFullYear();
        for (let i = year; i > year-1 ; i--) {
            vm.listYear.push({value: i, name:'Năm '+i});
        }
        initForm();
        function initForm() {
            vm.breadcrumb = CommonService.translate("Dashboard");
            creatReport1();
        }

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

        function creatReport1(){
            Restangular.all("punishmentRequestDetailRsService/doSearchForChart1").post(vm.searchForm).then(function (response) {
                creatChartReport1(response.data);
                $("#reportOneTableGrid").data("kendoGrid").dataSource.data(response.data);
                fillChartOne2(response.data);
            },function (error) {
                console.log(error);
                toastr.error(CommonService.translate("Có lỗi xảy ra khi vẽ chart"));
            })
        }

        function creatChartReport1(data) {
            $("#reportOneChart").kendoChart({
                title: {
                    text: "Chi tiết số lượng lỗi vi phạm",
                    font: '18px system-ui ',
                    color: "#000",
                },
                dataSource:{
                    data:data
                },
                legend: {
                    labels: {
                        text: "Mức độ vi phạm",
                        margin: {
                            bottom: 20
                        }
                    },
                    position: "right",
                },
                seriesDefaults: {
                    labels: {
                        visible: true,
                        background: "transparent",
                        format:"{0:n0}"
                    }
                },
                series: [
                    {
                        type: "pie",
                        field: "numberViolation",
                        categoryField: "label"
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
                seriesColors: ["rgba(0,90,194,0.38)","rgba(153,204,0,0.6)","rgba(255,204,0,0.55)","rgba(237, 7, 99, 0.6)"],
                categoryAxis: {
                },
                tooltip: {
                    color: "#fff",
                    visible: true,
                    format: "N0",
                    template: "#: category #"
                }
            });
        }

        vm.tblReport1Options = kendoConfig.getGridOptions({
            toolbar:'<h4 style="text-align: center;font-weight:bold;text-shadow:0px 1px 4px red">Bảng chi tiết tiền vi phạm</h4>',
            pageable: false,
            autoBind:true,
            dataSource: {
                data: [],
                aggregate: [
                    { field: "label", aggregate: "count" },
                    { field: "numberViolation", aggregate: "sum" },
                    { field: "total", aggregate: "sum" },
                ]
            },
            columns: [
                {
                    title: CommonService.translate("Mức độ vi phạm"),
                    field: 'label',
                    width: "70px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:left;white-space:normal;font-weight: 600;font-style: italic;", translate: ""},
                    aggregates: ['sum'],
                    footerTemplate: "Tổng:"
                },
                {
                    title: CommonService.translate("Số lượng lỗi vi phạm"),
                    field: 'numberViolation',
                    width: "70px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                    aggregates: ['sum'],
                    footerTemplate: "#=sum#"
                },
                {
                    title: CommonService.translate("Tổng vi phạm"),
                    field: 'total',
                    format: "{0:n0}",
                    width: "70px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                    aggregates: ['sum'],
                    footerTemplate: "#=kendo.toString(sum, 'n0')#"
                },
            ]
        });

        function fillChartOne2(data){
            $("#reportOneChart2").kendoChart({
                title: {
                    text: "Số lượng lỗi vi phạm và chi tiết tiền vi phạm",
                    font: '18px sans-serif ',
                    color: "#000",
                },
                dataSource: data,
                legend: {
                    position: "bottom",
                },
                series: [
                    {
                        type: "line",
                        name: "Tổng tiền vi phạm",
                        field: "total",
                        categoryField: "label"
                    },
                    {
                        type: "column",
                        field: "numberViolation",
                        categoryField: "label",
                        name: "Số lượng hành vi vi phạm trong tháng",
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
                                    return e.value >= 1000000? e.value/1000000 : e.value;
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
                        return e.value>=1000000?  (e.value/1000000 + " triệu VNĐ"): e.value;

                    }
                }
            });
        }

        vm.doSearch1 = function(){
            creatReport1();
        };
    }
})();

