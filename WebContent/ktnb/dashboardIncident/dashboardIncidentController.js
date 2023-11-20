(function () {
    'use strict';
    var controllerId = 'dashboardIncidentController';

    angular.module('MetronicApp').controller(controllerId, dashboardIncidentController);

    function dashboardIncidentController($scope,$http, $templateCache, $rootScope, $timeout, gettextCatalog,
                                     kendoConfig, $kWindow, $q,
                                     CommonService, htmlCommonService, PopupConst, Restangular, RestEndpoint, Constant) {
        var vm = this;

        vm.documentBody = $("#dashboardIncidentControllerId");
        vm.searchForm = {};
        vm.listIncidentType=[
            { value:"1", title:"Tai nạn lao động"},
            { value:"2", title:"Tai nạn giao thông"},
            { value:"3", title:"Trộm cắp tài sản"},
            { value:"4", title:"Cháy nổ"},
            { value:"5", title:"Vụ việc khác"},
        ]

        initForm();
        function initForm() {
            creatChart1();
            creatChart2();
            creatChart3();
            creatChart4();
            creatChart5();
            // console.log($("#chartIncident1").data("kendoChart").dataSource)
        }


        function creatChart1(){
            $("#chartIncident1").kendoChart({
                title: {
                    text: "Biểu đồ cơ cấu loại vụ việc",
                    font: '18px system-ui',
                    color: "#000",
                },
                dataSource:{
                    schema: {
                        data: function (response) {
                            return response.data;
                        },
                    },
                    transport: {
                        read: {
                            url: RestEndpoint.BASE_SERVICE_URL + "incidentRsService/getDataForChart1",
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
                    type: "column",
                    gap: 5
                },
                series: [
                    {
                        name: "Tai nạn lao động",
                        field:"numOfType1",
                        color: "#18e129"
                    },{
                        name: "Tai nạn giao thông",
                        field:"numOfType2",
                        color: "#ce2d2d"
                    }, {
                        name: "Trộm cắp tài sản",
                        field:"numOfType3",
                        color: "#06bfd7"
                    },{
                        name: "Cháy nổ",
                        field:"numOfType4",
                        color: "#cfd94c"
                    },{
                        name: "Vụ việc khác",
                        field:"numOfType5",
                        color: "#bb9dde"
                    }
                ],
                categoryAxis: {
                    field: "yearReport",
                    labels: {
                        rotation: -90,
                        font: '10px system-ui',
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
                tooltip: {
                    color: "#fff",
                    visible: true,
                    format: "N0",
                    template: "#= series.name #: #= value #"
                }
            });
        }
        function creatChart2(){
            $("#chartIncident2").kendoChart({
                title: {
                    text: "Biểu đồ số lượng vụ việc",
                    font: '18px system-ui',
                    color: "#000",
                },
                dataSource:{
                    schema: {
                        data: function (response) {
                            return response.data;
                        },
                    },
                    transport: {
                        read: {
                            url: RestEndpoint.BASE_SERVICE_URL + "incidentRsService/getDataForChart2",
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
                    type: "line",
                },
                series: [
                    {
                        name: "Năm 2021",
                        field:"numOfYear1",
                        color: "#18e129"
                    },{
                        name: "Năm 2022",
                        field:"numOfYear2",
                        color: "#ce2d2d"
                    }, {
                        name: "Năm 2023",
                        field:"numOfYear3",
                        color: "#06bfd7"
                    }
                ],
                categoryAxis: {
                    field: "monthReport",
                    labels: {
                        rotation: -90,
                        font: '10px system-ui',
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
            });
        }

        function creatChart3(){
            $("#chartIncident3").kendoChart({
                title: {
                    text: "Biểu đồ cơ cấu vụ việc",
                    font: '18px system-ui',
                    color: "#000",
                },
                dataSource:{
                    schema: {
                        data: function (response) {
                            return response.data;
                        },
                    },
                    transport: {
                        read: {
                            url: RestEndpoint.BASE_SERVICE_URL + "incidentRsService/getDataForChart3",
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
                    type: "pie",
                },
                series: [
                    {
                        categoryField: "type",
                        field:"numOfType"
                    }
                ],
                seriesColors: ["#18e129", "#ce2d2d", "#06bfd7", "#cfd94c", "#bb9dde"],
                tooltip: {
                    color: "#fff",
                    visible: true,
                    format: "N0",
                    template: function (e) {
                        return   e.category + ': '+ ((e.dataItem.numOfType / e.dataItem.total) * 100).toFixed(0) + '%';
                    }
                }
            });
        }

        function creatChart4(){
            $("#chartIncident4").kendoChart({
                title: {
                    text: "Biểu đồ tình trạng xử lý vụ việc",
                    font: '18px system-ui',
                    color: "#000",
                },
                dataSource:{
                    schema: {
                        data: function (response) {
                            return response.data;
                        },
                    },
                    transport: {
                        read: {
                            url: RestEndpoint.BASE_SERVICE_URL + "incidentRsService/getDataForChart4",
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
                    type: "pie",
                },
                series: [
                    {
                        categoryField: "state",
                        field:"numOfState"
                    }
                ],
                seriesColors: ["#18e129", "#ce2d2d", "#06bfd7", "#cfd94c", "#bb9dde", "#2a7826", "#d27a9e", "#1a1717"],
                tooltip: {
                    color: "#fff",
                    visible: true,
                    format: "N0",
                    template: function (e) {
                        return   e.category + ': '+ ((e.dataItem.numOfState / e.dataItem.total) * 100).toFixed(0) + '%';
                    }
                }
            });
        }

        function creatChart5(){
            $("#chartIncident5").kendoChart({
                title: {
                    text: "Biểu đồ cơ cấu vụ việc và thiệt hại",
                    font: '18px system-ui',
                    color: "#000",
                },
                dataSource:{
                    schema: {
                        data: function (response) {
                            return response.data;
                        },
                    },
                    transport: {
                        read: {
                            url: RestEndpoint.BASE_SERVICE_URL + "incidentRsService/getDataForChart5",
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
                        name: "Thiệt hại",
                        field: "totalMoney",
                        categoryField: "monthReport"
                    },
                    {
                        type: "column",
                        field: "numOfReport",
                        categoryField: "monthReport",
                        name: "Số vụ việc",
                        axis: "axis",
                        color: "#3eaee2"
                    },
                ],
                categoryAxis: {
                    labels: {
                        rotation: -90,
                        font: '10px system-ui',
                    },
                    majorGridLines: {
                        visible: false
                    },
                    axisCrossingValues: [12, 0],
                },
                valueAxis: [
                    {
                        labels:
                            {
                                rotation: -60,
                                // template:function(e){
                                //     return e.value > 1000000? e.value/1000000 : e.value;
                                // }
                            },
                        line: { visible: false },
                    },
                    {
                        name: "axis",
                        axisCrossingValue: 0,
                        majorUnit: 1,
                        labels: {
                            rotation: -60,
                        },
                        line: {
                            visible: false
                        }
                    }
                ],
            });
        }
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
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSysGroupDvg) {
                        vm.sysGroupName = null;
                        vm.searchForm.sysGroupId = null;
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

        vm.doSearch = function () {
            creatChart1();
            creatChart2();
            creatChart3();
            creatChart4();
            creatChart5();
        }
    }
})();

