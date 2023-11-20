(function () {
    'use strict';
    var controllerId = 'dashboardWorkController';

    angular.module('MetronicApp').controller(controllerId, dashboardWorkController);

    function dashboardWorkController($scope, $http, $templateCache, $rootScope, $timeout, gettextCatalog,
                                     kendoConfig, $kWindow, $q,
                                     CommonService, htmlCommonService, PopupConst, Restangular, RestEndpoint, Constant) {
        var vm = this;

        vm.documentBody = $("#dashboardWorkControllerId");
        vm.modalBody = ".k-window";
        vm.searchForm = {};
        vm.searchForm4 = {};
        vm.searchForm5 = {};
        vm.insertForm = {};
        vm.dataTable = [];
        vm.dataTable3 = [];
        vm.dataTable4 = [];
        vm.listMonth = [];
        vm.listYear = [];
        vm.data = [];

        vm.searchForm6 = {}
        vm.dataTable6 = [];
        vm.dataTable6Column = [];
        vm.dataTable6DynamicColumn = [];
        vm.dataTable6Aggregate = [];

        vm.searchForm7 = {}
        vm.dataTable7 = [];
        vm.dataTable7Column = [];
        vm.dataTable7DynamicColumn = [];
        vm.dataTable7Aggregate = [];

        vm.searchForm8 = {};
        vm.dataTable8 = [];
        vm.dataTable8Column = [];
        vm.dataTable8DynamicColumn = [];
        vm.dataTable8Aggregate = [];
        vm.typeLevelOneProblem = [
            // {id: 1, name: CommonService.translate("Không có vấn đề")},
            {id: 2, name: CommonService.translate("Quy trình"), field: "quytrinh"},
            {id: 3, name: CommonService.translate("Quản trị"), field: "quantri"},
            {id: 4, name: CommonService.translate("Con người"), field: "connguoi"},
            {id: 5, name: CommonService.translate("Công cụ"), field: "congcu"}
        ];
        vm.dataChart8 = [];

        vm.unitDatasource = [];

        $(document).ready(function () {
            $("#multiSg").kendoMultiSelect({
                placeholder: 'Nhập tên đơn vị',
                dataTextField: "sysGroupLv2Name",
                dataValueField: "code",
                tagMode: "single",
                tagTemplate: data => data.values.length + ' đơn vị đã được chọn',
                dataSource: {
                    schema: {
                        errors: function (response) {
                            if (response.error) {
                                toastr.error(response.error);
                            }
                            return response.error;
                        },
                        total: function (response) {
                            return response.total;
                        },
                        data: function (response) {
                            var x = convertDataChart(response.data, 'report2');
                            // return convertDataChart(response.data,'report2');
                            return x;
                        },
                    },
                    transport: {
                        read: {
                            url: RestEndpoint.BASE_SERVICE_URL + "workAssignRsService/getDataForReport2",
                            type: "POST",
                            contentType: "application/json; charset=utf-8"
                        },
                        parameterMap: function (options, type) {
                            var obj = angular.copy(vm.searchForm);
                            return JSON.stringify(obj);
                        }
                    },
                },
            });
        });

        $(document).ready(function () {
            $("#multiSu").kendoMultiSelect({
                placeholder: 'Nhập tên nhân viên',
                dataTextField: "fullName",
                dataValueField: "sysUserId",
                tagMode: "single",
                tagTemplate: data => data.values.length + ' nhân viên đã được chọn',
                dataSource: {
                    schema: {
                        errors: function (response) {
                            if (response.error) {
                                toastr.error(response.error);
                            }
                            return response.error;
                        },
                        total: function (response) {
                            return response.total;
                        },
                        data: function (response) {
                            var x = convertDataChart(response.data, 'report3');
                            // return convertDataChart(response.data,'report2');
                            return x;
                        },
                    },
                    transport: {
                        read: {
                            url: RestEndpoint.BASE_SERVICE_URL + "workAssignRsService/getDataForReport3",
                            type: "POST",
                            contentType: "application/json; charset=utf-8"
                        },
                        parameterMap: function (options, type) {
                            var obj = angular.copy(vm.searchForm);
                            return JSON.stringify(obj);
                        }
                    },
                },
            });
        });

        for (let i = 1; i < 13; i++) {
            vm.listMonth.push({value: i, name: 'Tháng ' + i});
        }
        var year = new Date().getFullYear();
        for (let i = year; i > year - 1; i--) {
            vm.listYear.push({value: i, name: 'Năm ' + i});
        }
        initForm();

        function initForm() {
            vm.breadcrumb = CommonService.translate("Dashboard");
            initLabelTable();
            initInspectionDate();

            creatReport1();
            creatReport2();
            creatReport3();
            creatReport4();
            creatReport5();

            getColumnTable6();
            getColumnTable7();
            getColumnTable8();
            createReport8();
            getUnitDatasource()
        }

        function creatReport1() {
            Restangular.all("workAssignRsService/getDataForReport").post(vm.searchForm).then(function (response) {
                convertSQLToDataMapTable(response.data);
                creatChartReport1();
                $("#reportOneTableGrid").data("kendoGrid").dataSource.data(vm.dataTable);
            }, function (error) {
                console.log(error);
                toastr.error(CommonService.translate("Có lỗi xảy ra khi vẽ chart"));
            })
        }

        function creatReport2() {
            $("#reportTwoChart").kendoChart({
                title: {
                    text: "Biểu đồ chi tiết WO của từng đơn vị",
                    font: '18px system-ui ',
                    color: "#000",
                },
                chartArea: {
                    background: "rgba(229,223,245,0.34)"
                },
                dataSource: {
                    schema: {
                        errors: function (response) {
                            if (response.error) {
                                toastr.error(response.error);
                            }
                            return response.error;
                        },
                        total: function (response) {
                            return response.total;
                        },
                        data: function (response) {
                            var x = convertDataChart(response.data, 'report2');
                            // return convertDataChart(response.data,'report2');
                            return x;
                        },
                    },
                    transport: {
                        read: {
                            url: RestEndpoint.BASE_SERVICE_URL + "workAssignRsService/getDataForReport2",
                            type: "POST",
                            contentType: "application/json; charset=utf-8"
                        },
                        parameterMap: function (options, type) {
                            var obj = angular.copy(vm.searchForm);
                            return JSON.stringify(obj);
                        }
                    },
                },
                legend: {
                    position: "bottom",
                },
                pannable: true,
                seriesDefaults: {
                    type: "column",
                    gap: 5,
                },
                series: [{
                    name: "Quá hạn chờ duyệt",
                    field: "numberQHChoViec",
                    color: "#18e129",
                    stack: 'col',
                }, {
                    name: "Quá hạn chưa thực hiện",
                    field: "numberQHChuaThucHien",
                    color: "#ce2d2d",
                    stack: 'col',
                }, {
                    name: "Quá hạn đã duyệt",
                    field: "numberQHDaDuyet",
                    color: "#06bfd7",
                    stack: 'col',
                }, {
                    name: "Quá hạn từ chối",
                    field: "numberQHTuChoi",
                    color: "#cfd94c",
                    stack: 'col',
                },
                    {
                        name: "Quá hạn từ chối nhận việc",
                        field: "numberQHTuChoiNhanViec",
                        color: "#bb9dde",
                        stack: 'col',
                    },
                    {
                        name: "Trong hạn chờ duyệt",
                        field: "numberTHChoDuyet",
                        color: "#2a7826",
                        stack: 'col',
                    },
                    {
                        name: "Trong hạn đã duyệt",
                        field: "numberTHDaDuyet",
                        color: "#d27a9e",
                        stack: 'col',
                    },
                    {
                        name: "Trong hạn Đang thực hiện",
                        field: "numberTHDangThucHien",
                        color: "#1a1717",
                        stack: 'col',
                    }
                    , {
                        name: "Trong hạn từ chối",
                        field: "numberTHTuChoi",
                        color: "#4003bb",
                        stack: 'col',
                    }
                ],
                categoryAxis: {
                    field: "code",
                    labels: {
                        rotation: -90,
                        font: '10px system-ui ',
                    },
                    majorGridLines: {
                        visible: false
                    }
                },
                valueAxis: {
                    labels: {
                        rotation: -60,
                    }
                },
                tooltip: {
                    color: "#fff",
                    visible: true,
                    format: "N0",
                    template: function (e) {
                        var debug = e.category + '-' + e.dataItem.sysGroupLv2Name + '</br>';
                        if (e.dataItem.numberQHChoViec > 0) {
                            debug += 'Quá hạn chờ duyệt: ' + e.dataItem.numberQHChoViec + '</br>';
                        }
                        if (e.dataItem.numberQHChuaThucHien > 0) {
                            debug += 'Quá hạn chưa thực hiện: ' + e.dataItem.numberQHChuaThucHien + '</br>';
                        }
                        if (e.dataItem.numberQHDaDuyet > 0) {
                            debug += 'Quá hạn đã duyệt: ' + e.dataItem.numberQHDaDuyet + '</br>';
                        }
                        if (e.dataItem.numberQHTuChoi > 0) {
                            debug += 'Quá hạn từ chối: ' + e.dataItem.numberQHTuChoi + '</br>';
                        }
                        if (e.dataItem.numberQHTuChoiNhanViec > 0) {
                            debug += 'Quá hạn từ chối nhận việc: ' + e.dataItem.numberQHTuChoiNhanViec + '</br>';
                        }
                        if (e.dataItem.numberTHChoDuyet > 0) {
                            debug += 'Trong hạn chờ duyệt: ' + e.dataItem.numberTHChoDuyet + '</br>';
                        }
                        if (e.dataItem.numberTHDaDuyet > 0) {
                            debug += 'Trong hạn đã duyệt: ' + e.dataItem.numberTHDaDuyet + '</br>';
                        }
                        if (e.dataItem.numberTHDangThucHien > 0) {
                            debug += 'Trong hạn đang thực hiện: ' + e.dataItem.numberTHDangThucHien + '</br>';
                        }
                        if (e.dataItem.numberTHTuChoi > 0) {
                            debug += 'Trong hạn từ chối: ' + e.dataItem.numberTHTuChoi + '</br>';
                        }
                        return debug;
                    }
                }
            });
        }

        function creatReport3() {
            Restangular.all("workAssignRsService/getDataForReport3").post(vm.searchForm).then(function (response) {
                vm.dataTable3 = convertDataChart(response.data, 'report3');
                creatChartReport3();
                $("#tblReportThree").data("kendoGrid").dataSource.data(vm.dataTable3);

            }, function (error) {
                console.log(error);
                toastr.error(CommonService.translate("Có lỗi xảy ra khi vẽ chart"));
            })
        }

        function creatReport4() {
            Restangular.all("workAssignRsService/getDataForReport4").post(vm.searchForm4).then(function (response) {
                vm.dataTable4 = convertDataReport4(response.data);
                // fillDataTableForReport4(vm.dataTable4);
                creatChartReport4();
                $("#tblReportFour").data("kendoGrid").dataSource.data(vm.dataTable4)
            }, function (error) {
                console.log(error);
                toastr.error(CommonService.translate("Có lỗi xảy ra khi vẽ chart"));
            })
        }

        function creatReport5() {
            Restangular.all("workAssignRsService/getDataForReport5").post(vm.searchForm5).then(function (response) {
                vm.data = []
                var pie1 = 0;
                var pie2 = 0;
                var pie3 = 0;
                var pie4 = 0;
                var pie5 = 0;
                var total = 0;
                for (let i = 0; i < response.data.length; i++) {
                    pie1 += response.data[i].chuaTH;
                    pie2 += response.data[i].dangTH;
                    pie3 += response.data[i].giaHan;
                    pie4 += response.data[i].hoanThanh;
                    pie5 += response.data[i].quaHan;
                    total += response.data[i].total
                }
                var obj1 = {
                    name: "Chưa thực hiện",
                    count: pie1,
                    percent: (100 * pie1 / total).toFixed(3),
                }
                var obj2 = {
                    name: "Đang thực hiện",
                    count: pie2,
                    percent: (100 * pie2 / total).toFixed(3),
                }
                var obj3 = {
                    name: "Gia hạn",
                    count: pie3,
                    percent: (100 * pie3 / total).toFixed(3),
                }
                var obj4 = {
                    name: "Hoàn thành",
                    count: pie4,
                    percent: (100 * pie4 / total).toFixed(3),
                }
                var obj5 = {
                    name: "Quá hạn",
                    count: pie5,
                    percent: (100 * pie5 / total).toFixed(3),
                }
                vm.data.push(obj1);
                vm.data.push(obj2);
                vm.data.push(obj3);
                vm.data.push(obj4);
                vm.data.push(obj5);
                creatChartReport5();
                $("#tblReportFive").data("kendoGrid").dataSource.data(response.data)
            }, function (error) {
                console.log(error);
                toastr.error(CommonService.translate("Có lỗi xảy ra khi vẽ chart"));
            })
        }

        function createReport6() {
            Restangular.all("workAssignRsService/getDataForDashBoard1").post(vm.searchForm6).then(function (response) {
                let grid = $("#tblReportSix").data("kendoGrid");
                grid.setOptions({columns: vm.dataTable6Column})
                vm.dataTable6 = [];
                response.data.forEach(x => {
                    let item = {};
                    item['stt'] = response.data.indexOf(x) + 1;
                    item['groupName'] = x.groupName
                    vm.dataTable6DynamicColumn.forEach(c => {
                        let value = x.dataObj.find(i => i.column == c.field);
                        item[c.field] = value ? value.count : 0
                    });

                    item['total'] = x.total;
                    vm.dataTable6.push(item)
                })
                grid.dataSource.data(vm.dataTable6);
            }, function (error) {
                console.log(error);
                toastr.error(CommonService.translate("Có lỗi xảy ra khi gọi dữ liệu Thống kê số lượng kiểm tra"));
            })
        }

        function createReport7() {
            Restangular.all("workAssignRsService/getDataForDashBoard2").post(vm.searchForm7).then(function (response) {
                let grid = $("#tblReportSeven").data("kendoGrid");
                grid.setOptions({columns: vm.dataTable7Column});

                vm.dataTable7 = [];
                response.data.forEach(x => {
                    let item = {};
                    item['stt'] = response.data.indexOf(x) + 1;
                    item['groupName'] = x.groupName
                    vm.dataTable7DynamicColumn.forEach(c => {
                        let value = x.dataObj.find(i => i.column == c.field);
                        item[c.field] = value ? value.count : 0
                    });

                    item['total'] = x.total;
                    vm.dataTable7.push(item)
                })
                createChartReport7();
                grid.dataSource.data(vm.dataTable7);

            }, function (error) {
                console.log(error);
                toastr.error(CommonService.translate("Có lỗi xảy ra khi gọi dữ liệu Thống kê số lượng lỗi theo từng đơn vị"));
            })
        }

        function createReport8() {
            Restangular.all("workAssignRsService/getDataForDashBoard3").post(vm.searchForm8).then(function (response) {
                vm.dataTable8 = [];
                vm.dataChart8 = [];
                vm.typeLevelOneProblem.forEach(x => {
                    vm.dataChart8.push({
                        title: x.name,
                        field: x.field,
                        id: x.id,
                        value: 0
                    })
                })
                response.data.forEach(x => {
                    let item = {};
                    item['stt'] = response.data.indexOf(x) + 1;
                    item['groupName'] = x.groupName
                    vm.dataTable8DynamicColumn.forEach(c => {
                        let value = x.dataObj.find(i => i.levelOneProblem == c.field);
                        item[c.title] = value ? value.count : 0
                    });
                    item['total'] = x.total;
                    vm.dataTable8.push(item)
                })

                vm.dataTable8.forEach(x => {
                    vm.dataChart8.map(i => {
                        i.value += x[i.field];
                        return i;
                    })
                })

                vm.dataChart8 = vm.dataChart8.filter(x => x.value > 0)
                let total = 0;
                vm.dataChart8.forEach(x => {
                    total += x.value
                });

                vm.dataChart8.map(x => {
                    let percent = x.value / total * 100;
                    x.percent = Math.round((percent + Number.EPSILON) * 100) / 100;
                    return x;
                })
                createChartReport8();
                $("#tblReportEight").data("kendoGrid").dataSource.data(vm.dataTable8);

            }, function (error) {
                console.log(error);
                toastr.error(CommonService.translate("Có lỗi xảy ra khi gọi dữ liệu Tổng hợp các loại vấn đề"));
            })
        }

        function creatChartReport1() {
            $("#reportOneChart").kendoChart({
                title: {
                    text: "Biểu đồ chi tiết",
                    font: '18px system-ui ',
                    color: "#000",
                },
                chartArea: {
                    background: "rgba(194,236,227,0.34)"
                },
                dataSource: {
                    data: vm.dataTable
                },
                legend: {
                    position: "bottom",
                },
                seriesDefaults: {
                    type: "column",
                },
                series: [{
                    name: "KSNB",
                    field: "KSNB",
                    color: "#18e129",
                    stack: 'col',
                }, {
                    name: "KTNB",
                    field: "KTNB",
                    color: "#ce2d2d",
                    stack: 'col',
                }, {
                    name: "PCHE",
                    field: "PCHE",
                    color: "#06bfd7",
                    stack: 'col',
                }, {
                    name: "QTRR",
                    field: "QTRR",
                    color: "#ede207",
                    stack: 'col',
                }],
                categoryAxis: {
                    field: "title",
                    labels: {
                        rotation: -60,
                        font: '10px system-ui'
                    },
                    majorGridLines: {
                        visible: false
                    }
                },
                valueAxis: {
                    labels: {
                        rotation: -60,
                    }
                },
                tooltip: {
                    color: "#fff",
                    visible: true,
                    format: "N0",
                    template: function (e) {
                        return e.category + '</br>' + 'KSNB: ' + e.dataItem.KSNB + '</br>' + 'KTNB: ' + e.dataItem.KTNB + '</br>' + 'PCHE: ' + e.dataItem.PCHE + '</br>' + 'QTRR: ' + e.dataItem.QTRR;
                    }
                }
            });
        }

        function creatChartReport3() {
            $("#reportThreeChart").kendoChart({
                title: {
                    text: "Biểu đồ chi tiết của từng cá nhân",
                    font: '18px system-ui ',
                    color: "#000",
                },
                chartArea: {
                    background: "rgba(206,239,209,0.45)"
                },
                dataSource: {
                    data: vm.dataTable3
                    // schema: {
                    //     errors: function (response) {
                    //         if (response.error) {
                    //             toastr.error(response.error);
                    //         }
                    //         return response.error;
                    //     },
                    //     total: function (response) {
                    //         return response.total;
                    //     },
                    //     data: function (response) {
                    //         vm.dataTable3 = convertDataChart(response.data,'report3');
                    //         return vm.dataTable3;
                    //     },
                    // },
                    // transport: {
                    //     read: {
                    //         url: RestEndpoint.BASE_SERVICE_URL + "workAssignRsService/getDataForReport3",
                    //         type: "POST",
                    //         contentType: "application/json; charset=utf-8"
                    //     },
                    //     parameterMap: function(options, type) {
                    //         var obj = angular.copy(vm.searchForm);
                    //         return JSON.stringify(obj);
                    //     }
                    // },
                },
                legend: {
                    position: "bottom",
                },
                seriesDefaults: {
                    type: "column",
                    gap: 5,
                },
                series: [
                    {
                        name: "Quá hạn chờ duyệt",
                        field: "numberQHChoViec",
                        color: "#18e129",
                        stack: 'col',
                    }, {
                        name: "Quá hạn chưa thực hiện",
                        field: "numberQHChuaThucHien",
                        color: "#ce2d2d",
                        stack: 'col',
                    }, {
                        name: "Quá hạn đã duyệt",
                        field: "numberQHDaDuyet",
                        color: "#06bfd7",
                        stack: 'col',
                    }, {
                        name: "Quá hạn từ chối",
                        field: "numberQHTuChoi",
                        color: "#cfd94c",
                        stack: 'col',
                    },
                    // {
                    //     name: "Quá hạn từ chối nhận việc",
                    //     field:"numberQHTuChoiNhanViec",
                    //     color: "#bb9dde",
                    //     stack: 'col',
                    // },
                    {
                        name: "Trong hạn chờ duyệt",
                        field: "numberTHChoDuyet",
                        color: "#2a7826",
                        stack: 'col',
                    },
                    {
                        name: "Trong hạn đã duyệt",
                        field: "numberTHDaDuyet",
                        color: "#d27a9e",
                        stack: 'col',
                    },
                    {
                        name: "Trong hạn Đang thực hiện",
                        field: "numberTHDangThucHien",
                        color: "#1a1717",
                        stack: 'col',
                    }
                    , {
                        name: "Trong hạn từ chối",
                        field: "numberTHTuChoi",
                        color: "#4003bb",
                        stack: 'col',
                    }
                ],
                categoryAxis: {
                    field: "fullName",
                    labels: {
                        rotation: -60,
                        font: '10px system-ui ',
                    },
                    majorGridLines: {
                        visible: false
                    }
                },
                valueAxis: {
                    labels: {
                        rotation: -60,
                    }
                },
                tooltip: {
                    color: "#fff",
                    visible: true,
                    format: "N0",
                    template: function (e) {
                        var debug = e.category + '</br>';
                        if (e.dataItem.numberQHChoViec > 0) {
                            debug += 'Quá hạn chờ duyệt: ' + e.dataItem.numberQHChoViec + '</br>';
                        }
                        if (e.dataItem.numberQHChuaThucHien > 0) {
                            debug += 'Quá hạn chưa thực hiện: ' + e.dataItem.numberQHChuaThucHien + '</br>';
                        }
                        if (e.dataItem.numberQHDaDuyet > 0) {
                            debug += 'Quá hạn đã duyệt: ' + e.dataItem.numberQHDaDuyet + '</br>';
                        }
                        if (e.dataItem.numberQHTuChoi > 0) {
                            debug += 'Quá hạn từ chối: ' + e.dataItem.numberQHTuChoi + '</br>';
                        }/*if(e.dataItem.numberQHTuChoiNhanViec>0){
                            debug+='Quá hạn từ chối nhận việc: '+ e.dataItem.numberQHTuChoiNhanViec  + '</br>';
                        }*/
                        if (e.dataItem.numberTHChoDuyet > 0) {
                            debug += 'Trong hạn chờ duyệt: ' + e.dataItem.numberTHChoDuyet + '</br>';
                        }
                        if (e.dataItem.numberTHDaDuyet > 0) {
                            debug += 'Trong hạn đã duyệt: ' + e.dataItem.numberTHDaDuyet + '</br>';
                        }
                        if (e.dataItem.numberTHDangThucHien > 0) {
                            debug += 'Trong hạn đang thực hiện: ' + e.dataItem.numberTHDangThucHien + '</br>';
                        }
                        if (e.dataItem.numberTHTuChoi > 0) {
                            debug += 'Trong hạn từ chối: ' + e.dataItem.numberTHTuChoi + '</br>';
                        }
                        return debug;
                    }
                }
            });
        }

        function creatChartReport4() {
            $("#reportFourChart").kendoChart({
                title: {
                    text: "Chi tiết tiền phạt của từng đơn vị giao việc",
                    font: '18px system-ui ',
                    color: "#000",
                },
                chartArea: {
                    background: "rgba(206,239,209,0.45)"
                },
                dataSource: {
                    data: vm.dataTable4
                },
                legend: {
                    labels: {
                        text: "Đơn vị áp chế tài",
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
                        format: "{0:n0}"
                    }
                },
                series: [
                    {
                        type: "pie",
                        field: "totalMoney",
                        categoryField: "departmentCode"
                    }
                ],
                seriesClick: function (e) {
                    $.each(e.sender.dataSource.view(), function () {
                        this.explode = false;
                    });
                    e.sender.options.transitions = false;
                    e.dataItem.explode = true;
                    e.sender.refresh();
                },
                valueAxis: {
                    labels: {
                        rotation: -60,
                    }
                },
                seriesColors: ["rgba(0,90,194,0.38)", "rgba(153,204,0,0.6)", "rgba(255,204,0,0.55)", "rgba(237, 7, 99, 0.6)"],
                categoryAxis: {},
                tooltip: {
                    color: "#fff",
                    visible: true,
                    format: "N0",
                    template: "#: category #"
                }
            });
        }

        function creatChartReport5() {
            $("#reportFiveChart").kendoChart({
                title: {
                    text: "Tổng hợp WO",
                    font: '18px system-ui ',
                    color: "#000",
                },
                chartArea: {
                    background: "rgba(206,239,209,0.45)"
                },
                dataSource: {
                    data: vm.data
                },
                legend: {
                    labels: {
                        text: "Đơn vị áp chế tài",
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
                        format: "{0:n0}"
                    }
                },
                series: [
                    {
                        type: "pie",
                        field: "percent",
                        categoryField: "name"
                    }
                ],
                seriesClick: function (e) {
                    $.each(e.sender.dataSource.view(), function () {
                        this.explode = false;
                    });
                    e.sender.options.transitions = false;
                    e.dataItem.explode = true;
                    e.sender.refresh();
                },
                valueAxis: {
                    labels: {
                        rotation: -60,
                    }
                },
                seriesColors: ["rgba(0,90,194,0.38)", "rgba(153,204,0,0.6)", "rgba(255,204,0,0.55)", "rgba(237, 7, 99, 0.6)", "#1a1717"],
                categoryAxis: {},
                tooltip: {
                    color: "#fff",
                    visible: true,
                    format: "N0",
                    template: "#: category#: #: value#%"
                }
            });
        }

        function createChartReport7() {
            $("#reportSevenChart").kendoChart({
                title: {
                    text: "Báo cáo thống kê số lượng lỗi theo từng đơn vị",
                    font: '18px system-ui ',
                    color: "#000",
                },
                chartArea: {
                    background: "rgba(194,236,227,0.34)"
                },
                dataSource: {
                    data: vm.dataTable7
                },
                legend: {
                    visible: "false",
                },
                seriesDefaults: {
                    type: "bar",
                    labels: {
                        visible: true,
                        format: "{0}"
                    }
                },
                series: [{
                    name: "Tổng số",
                    field: "total",
                    categoryField: "groupName"
                }],
                seriesColors: ["#2b76cc"],
                valueAxis: {
                    max: 10,
                    labels: {
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

        function createChartReport8() {
            $("#reportEightChart").kendoChart({
                title: {
                    text: "Báo cáo tổng hợp các loại vấn đề",
                    font: '18px system-ui ',
                    color: "#000",
                },
                chartArea: {
                    background: "rgba(206,239,209,0.45)"
                },
                dataSource: {
                    data: vm.dataChart8
                },
                legend: {
                    visible: false,
                },
                seriesDefaults: {
                    labels: {
                        visible: true,
                        position: "center",
                        background: "transparent",
                        template: "#= category #: #= value#%"
                    }
                },
                series: [
                    {
                        type: "pie",
                        field: "percent",
                        categoryField: "title",
                        name: "Tổng số"
                    }
                ],
                valueAxis: {
                    labels: {
                        rotation: -60,
                    }
                },
                seriesColors: ["rgba(0,90,194,0.38)", "rgba(153,204,0,0.6)", "rgba(255,204,0,0.55)", "rgba(237, 7, 99, 0.6)"],
                categoryAxis: {},
                tooltip: {
                    color: "#fff",
                    visible: true,
                    format: "N0",
                    template: function (dataItem) {
                        return "Tổng số: " + dataItem.dataItem.value
                    }
                }
            });
        }

        // ========================= Table region =========================
        vm.reportOneTableGridOptions = kendoConfig.getGridOptions({
            autoBind: true,
            pageable: false,
            dataSource: {
                data: vm.dataTable,
                group: {
                    field: "status", sort: "desc", aggregate: [
                        {field: "KSNB", aggregate: "sum"},
                        {field: "KTNB", aggregate: "sum"},
                        {field: "PCHE", aggregate: "sum"},
                        {field: "QTRR", aggregate: "sum"},
                        {field: "total", aggregate: "sum"},
                    ]
                },
                aggregate: [
                    {field: "title", aggregate: "count"},
                    {field: "KSNB", aggregate: "sum"},
                    {field: "KTNB", aggregate: "sum"},
                    {field: "PCHE", aggregate: "sum"},
                    {field: "QTRR", aggregate: "sum"},
                    {field: "total", aggregate: "sum"},
                ]
            },
            columns: [
                {
                    title: CommonService.translate("Tình trạng"),
                    field: 'title',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {
                        style: "text-align:left;white-space:normal;font-weight: 600;font-style: italic;",
                        translate: ""
                    },
                    aggregates: ['sum'],
                    footerTemplate: "Tổng:"
                },
                {
                    title: CommonService.translate("KSNB"),
                    field: 'KSNB',
                    width: "70px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                    aggregates: ['sum'],
                    footerTemplate: "#=sum#"
                },
                {
                    title: CommonService.translate("KTNB"),
                    field: 'KTNB',
                    width: "70px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                    aggregates: ['sum'],
                    footerTemplate: "#=sum#"
                },
                {
                    title: CommonService.translate("PCHE"),
                    field: 'PCHE',
                    width: "70px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                    aggregates: ['sum'],
                    footerTemplate: "#=sum#"
                },
                {
                    title: CommonService.translate("QTRR"),
                    field: 'QTRR',
                    width: "70px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                    aggregates: ['sum'],
                    footerTemplate: "#=sum#"
                },
                {
                    title: CommonService.translate("Tổng cộng"),
                    field: 'total',
                    width: "70px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                    aggregates: ['sum'],
                    footerTemplate: "#=sum#"
                },
            ]
        });
        vm.tblReportThreeOptions = kendoConfig.getGridOptions({
            autoBind: true,
            resizable: true,
            noRecords: true,
            columnMenu: true,
            toolbar: '<h4 style="text-align: center;font-weight:bold;text-shadow:0px 1px 4px red">Bảng chi tiết từng cá nhân</h4>',
            messages: {
                noRecords: CommonService.translate("Không có kết quả hiển thị")
            },
            pageable: {
                refresh: false,
                pageSizes: [10, 15],
                messages: {
                    display: CommonService.translate("{0}-{1} của {2} kết quả"),
                    itemsPerPage: CommonService.translate("kết quả/trang"),
                    empty: CommonService.translate("Không có kết quả hiển thị")
                }
            },
            scrollable: true,
            dataSource: {
                data: vm.dataTable3,
                pageSize: 10,
                aggregate: [
                    {field: "fullName", aggregate: "count"},
                    {field: "numberQHChoViec", aggregate: "sum"},
                    {field: "numberQHChuaThucHien", aggregate: "sum"},
                    {field: "numberQHDaDuyet", aggregate: "sum"},
                    {field: "numberQHTuChoi", aggregate: "sum"},
                    {field: "numberTHChoDuyet", aggregate: "sum"},
                    {field: "numberTHDaDuyet", aggregate: "sum"},
                    {field: "numberTHDangThucHien", aggregate: "sum"},
                    {field: "numberTHTuChoi", aggregate: "sum"}
                ]
            },
            columns: [
                {
                    title: CommonService.translate("Nhân viên"),
                    field: 'fullName',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {
                        style: "text-align:left;white-space:normal;font-weight: 600;font-style: italic;",
                        translate: ""
                    },
                    aggregates: ["count"],
                    footerTemplate: "Tổng:"
                },
                {
                    title: CommonService.translate("Quá hạn chờ duyệt"),
                    field: 'numberQHChoViec',
                    width: "70px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;color:red"},
                    aggregates: ["sum"],
                    footerTemplate: "#=sum#"
                },
                {
                    title: CommonService.translate("Quá hạn chưa thực hiện"),
                    field: 'numberQHChuaThucHien',
                    width: "90px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;color:red"},
                    aggregates: ["sum"],
                    footerTemplate: "#=sum#"
                },
                {
                    title: CommonService.translate("Quá hạn đã duyệt"),
                    field: 'numberQHDaDuyet',
                    width: "70px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;color:red"},
                    aggregates: ["sum"],
                    footerTemplate: "#=sum#"
                },
                {
                    title: CommonService.translate("Quá hạn từ chối "),
                    field: 'numberQHTuChoi',
                    width: "90px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;color:red"},
                    aggregates: ["sum"],
                    footerTemplate: "#=sum#"
                },
                {
                    title: CommonService.translate("Tổng quá hạn"),
                    field: 'tongQuaHan',
                    width: "90px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;color:red;font-weight:bold"},
                },
                {
                    title: CommonService.translate("Trong hạn chờ duyệt"),
                    field: 'numberTHChoDuyet',
                    width: "70px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;color:green"},
                    aggregates: ["sum"],
                    footerTemplate: "#=sum#"
                },
                {
                    title: CommonService.translate("Trong hạn đã duyệt"),
                    field: 'numberTHDaDuyet',
                    width: "70px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;color:green"},
                    aggregates: ["sum"],
                    footerTemplate: "#=sum#"
                },
                {
                    title: CommonService.translate("Trong hạn đang thực hiện"),
                    field: 'numberTHDangThucHien',
                    width: "90px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;color:green"},
                    aggregates: ["sum"],
                    footerTemplate: "#=sum#"
                },
                {
                    title: CommonService.translate("Trong hạn từ chối"),
                    field: 'numberTHTuChoi',
                    width: "70px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;color:green"},
                    aggregates: ["sum"],
                    footerTemplate: "#=sum#"
                },
                {
                    title: CommonService.translate("Tổng trong hạn"),
                    field: 'tongTrongHan',
                    width: "90px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;color:green;font-weight:bold"},
                },
            ]
        });
        vm.tblReportFourOptions = kendoConfig.getGridOptions({
            toolbar: '<h4 style="text-align: center;font-weight:bold;text-shadow:0px 1px 4px red">Bảng chi tiết đơn vị giao việc</h4>',
            pageable: false,
            autoBind: true,
            dataSource: {
                data: [],
                aggregate: [
                    {field: "departmentCode", aggregate: "count"},
                    {field: "lateWork", aggregate: "sum"},
                    {field: "lateComplete", aggregate: "sum"},
                    {field: "totalMoney", aggregate: "sum"},
                ]
            },
            columns: [
                {
                    title: CommonService.translate("Đơn vị áp chế tài"),
                    field: 'departmentCode',
                    width: "70px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {
                        style: "text-align:left;white-space:normal;font-weight: 600;font-style: italic;",
                        translate: ""
                    },
                    aggregates: ['sum'],
                    footerTemplate: "Tổng:"
                },
                // {
                //     title: CommonService.translate("Số ngày chậm nhận việc"),
                //     field: 'lateWork',
                //     width: "70px",
                //     headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                //     attributes: {style: "text-align:center;white-space:normal;"},
                //
                //     aggregates: ['sum'],
                //     footerTemplate: "#=sum#"
                // },
                {
                    title: CommonService.translate("Số ngày chậm hoàn thành"),
                    field: 'lateComplete',
                    width: "70px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                    aggregates: ['sum'],
                    footerTemplate: "#=sum#"
                },
                {
                    title: CommonService.translate("Tổng tiền"),
                    field: 'totalMoney',
                    format: "{0:n0}",
                    width: "70px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                    aggregates: ['sum'],
                    footerTemplate: "#=kendo.toString(sum, 'n0')#"
                },
            ]
        });
        vm.tblReportFiveOptions = kendoConfig.getGridOptions({
            toolbar: '<h4 style="text-align: center;font-weight:bold;text-shadow:0px 1px 4px red">Bảng tổng hợp WO</h4>',
            autoBind: true,
            messages: {
                noRecords: CommonService.translate("Không có kết quả hiển thị")
            },
            pageable: {
                refresh: false,
                pageSizes: [5, 10],
                messages: {
                    display: CommonService.translate("{0}-{1} của {2} kết quả"),
                    itemsPerPage: CommonService.translate("kết quả/trang"),
                    empty: CommonService.translate("Không có kết quả hiển thị")
                }
            },
            scrollable: true,
            dataSource: {
                data: [],
                pageSize: 5,
                aggregate: [
                    {field: "sysGroupLv2Name", aggregate: "count"},
                    {field: "chuaTH", aggregate: "sum"},
                    {field: "dangTH", aggregate: "sum"},
                    {field: "giaHan", aggregate: "sum"},
                    {field: "hoanThanh", aggregate: "sum"},
                    {field: "quaHan", aggregate: "sum"},
                    {field: "total", aggregate: "sum"},
                ]
            },
            columns: [
                {
                    title: CommonService.translate("Đơn vị thực hiện"),
                    field: 'sysGroupLv2Name',
                    width: "150px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {
                        style: "text-align:left;white-space:normal;font-weight: 600;font-style: italic;",
                        translate: ""
                    },
                    aggregates: ['sum'],
                    footerTemplate: "Tổng cộng:"
                },
                {
                    title: CommonService.translate("Chưa thực hiện"),
                    field: 'chuaTH',
                    width: "70px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                    aggregates: ['sum'],
                    footerTemplate: "#=sum#"
                },
                {
                    title: CommonService.translate("Đang thực hiện"),
                    field: 'dangTH',
                    width: "70px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                    aggregates: ['sum'],
                    footerTemplate: "#=sum#"
                },
                {
                    title: CommonService.translate("Gia hạn"),
                    field: 'giaHan',
                    width: "70px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                    aggregates: ['sum'],
                    footerTemplate: "#=sum#"
                },
                {
                    title: CommonService.translate("Hoàn thành"),
                    field: 'hoanThanh',
                    width: "70px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                    aggregates: ['sum'],
                    footerTemplate: "#=sum#"
                },
                {
                    title: CommonService.translate("Quá hạn"),
                    field: 'quaHan',
                    width: "70px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                    aggregates: ['sum'],
                    footerTemplate: "#=sum#"
                },
                {
                    title: CommonService.translate("Tổng cộng"),
                    field: 'total',
                    width: "70px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                    aggregates: ['sum'],
                    footerTemplate: "#=sum#"
                },
            ]
        });

        vm.tblReportEightOptions = kendoConfig.getGridOptions({
            toolbar: '<h4 style="text-align: center;font-weight:bold;text-shadow:0px 1px 4px red">Báo cáo tổng hợp các loại vấn đề</h4>',
            autoBind: true,
            resizable: true,
            noRecords: true,
            columnMenu: true,
            messages: {
                noRecords: CommonService.translate("Không có kết quả hiển thị")
            },
            pageable: {
                refresh: false,
                pageSizes: [10, 15],
                messages: {
                    display: CommonService.translate("{0}-{1} của {2} kết quả"),
                    itemsPerPage: CommonService.translate("kết quả/trang"),
                    empty: CommonService.translate("Không có kết quả hiển thị")
                }
            },
            scrollable: true,
            dataSource: {
                data: vm.dataTable8,
                pageSize: 10,
                aggregate: getAggregateTable8(),
            },
            columns: getColumnTable8(),
        });
        // ========================= Table region =========================

        vm.doSearch1 = function () {
            // query chart 1
            vm.dataTable = [];
            initLabelTable();
            creatReport1();
            // query chart 2
            // var chart2 = $("#reportTwoChart").data("kendoChart");
            // if(chart2){
            //     chart2.dataSource.query();
            // }
            // // query chart 3
            // var chart3 = $("#reportThreeChart").data("kendoChart");
            // if(chart3){
            //     chart3.dataSource.query();
            // }


            // vm.searchForm.createdByName= $rootScope.$root.authenticatedUser.VpsUserInfo.fullName;
            // vm.searchForm.sysUserId = $rootScope.$root.authenticatedUser.VpsUserInfo.sysUserId;
        };
        vm.doSearch2 = function () {
            var chart2 = $("#reportTwoChart").data("kendoChart");
            if (chart2) {
                chart2.dataSource.read();
            }
        }
        vm.doSearch3 = function () {
            creatReport3();
        }
        vm.doSearch4 = function () {
            creatReport4();
        };
        vm.doSearch5 = function () {
            creatReport5();
        };
        vm.cancel = function () {
            setTimeout(function () {
                if (vm.modalAdd1 != null) {
                    vm.modalAdd1.dismiss();
                    vm.modalAdd1 = null
                } else if (vm.modalAdd != null) {
                    vm.modalAdd.dismiss();
                    vm.modalAdd = null;
                }
            }, 200)
        };

        vm.doSearch6 = function () {
            getColumnTable6()
        }
        vm.doSearch7 = function () {
            getColumnTable7()
        }
        vm.doSearch8 = function () {
            createReport8()
        }

        function getColumnTable6() {
            debugger
            vm.searchForm6.type = 1;
            vm.dataTable6Column = [];
            vm.dataTable6DynamicColumn = [];
            vm.dataTable6Aggregate = [];
            //get dynamic column api
            Restangular.all("workAssignRsService/getColumns").post(vm.searchForm6).then(function (res) {
                debugger
                vm.dataTable6Column.push(
                    {
                        title: CommonService.translate("STT"),
                        field: 'stt',
                        width: '50px',
                        headerAttributes: {
                            style: "text-align:center;white-space:normal;font-weight:bold",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center;white-space:normal;",
                            translate: ""
                        }
                    },
                    {
                        title: CommonService.translate("Đơn vị được kiểm tra/ Đơn vị thực hiện kiểm tra"),
                        field: 'groupName',
                        width: "100px",
                        headerAttributes: {
                            style: "text-align:center;white-space:normal;font-weight:bold",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left;white-space:normal;font-weight: 600;font-style: italic;",
                            translate: ""
                        },
                        aggregates: ['sum'],
                        footerTemplate: "Tổng cộng:"
                    },
                )
                if (res) {
                    res.forEach(x => {
                        vm.dataTable6Column.push({
                            title: CommonService.translate(x.columnName),
                            field: x.codeName,
                            width: "100px",
                            headerAttributes: {
                                style: "text-align:center;white-space:normal;font-weight:bold",
                                translate: ""
                            },
                            attributes: {
                                style: "text-align:center;white-space:normal;",
                                translate: ""
                            },
                            aggregates: ['sum'],
                            footerTemplate: "#=sum#"
                        });

                        vm.dataTable6DynamicColumn.push({
                            title: x.columnName,
                            field: x.codeName,
                        })

                        vm.dataTable6Aggregate.push({
                            field: x.codeName,
                            aggregate: "sum"
                        })
                    })
                    vm.dataTable6Column.push({
                        title: CommonService.translate("Tổng cộng"),
                        field: 'total',
                        width: "70px",
                        headerAttributes: {
                            style: "text-align:center;white-space:normal;font-weight:bold",
                            translate: ""
                        },
                        attributes: {style: "text-align:center;white-space:normal;font-weight: bold;"},
                        aggregates: ['sum'],
                        footerTemplate: "#=sum#"
                    })
                    vm.dataTable6Aggregate.push({
                        field: 'total',
                        aggregate: "sum"
                    })

                    vm.tblReportSixOptions = kendoConfig.getGridOptions({
                        autoBind: true,
                        resizable: true,
                        noRecords: true,
                        columnMenu: true,
                        toolbar: '<h4 style="text-align: center;font-weight:bold;text-shadow:0px 1px 4px red">Thống kê số lượng kiểm tra</h4>',
                        messages: {
                            noRecords: CommonService.translate("Không có kết quả hiển thị")
                        },
                        pageable: {
                            refresh: false,
                            pageSizes: [10, 15],
                            messages: {
                                display: CommonService.translate("{0}-{1} của {2} kết quả"),
                                itemsPerPage: CommonService.translate("kết quả/trang"),
                                empty: CommonService.translate("Không có kết quả hiển thị")
                            }
                        },
                        scrollable: true,
                        dataSource: {
                            data: vm.dataTable6,
                            pageSize: 10,
                            aggregate: vm.dataTable6Aggregate,
                        },
                        columns: vm.dataTable6Column
                    });

                    createReport6();
                }
            }, function (error) {
                console.log(error);
                toastr.error(CommonService.translate("Có lỗi xảy ra khi gọi danh sách cột Báo cáo thống kê số lượng kiểm tra"));
            })
        }

        function getColumnTable7() {
            vm.searchForm7.type = 2;
            vm.dataTable7Column = [];
            vm.dataTable7DynamicColumn = [];
            vm.dataTable7Aggregate = [];
            Restangular.all("workAssignRsService/getColumns").post(vm.searchForm7).then(function (res) {
                vm.dataTable7Column.push(
                    {
                        title: CommonService.translate("STT"),
                        field: 'stt',
                        width: '50px',
                        headerAttributes: {
                            style: "text-align:center;white-space:normal;font-weight:bold",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center;white-space:normal;",
                            translate: ""
                        }
                    },
                    {
                        title: CommonService.translate("Đơn vị được kiểm tra/ Đơn vị thực hiện kiểm tra"),
                        field: 'groupName',
                        width: "100px",
                        headerAttributes: {
                            style: "text-align:center;white-space:normal;font-weight:bold",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left;white-space:normal;font-weight: 600;font-style: italic;",
                            translate: ""
                        },
                        aggregates: ['sum'],
                        footerTemplate: "Tổng cộng:"
                    }
                )
                if (res) {
                    res.forEach(x => {
                        vm.dataTable7Column.push({
                            title: CommonService.translate(x.columnName),
                            field: x.codeName,
                            width: "100px",
                            headerAttributes: {
                                style: "text-align:center;white-space:normal;font-weight:bold",
                                translate: ""
                            },
                            attributes: {
                                style: "text-align:center;white-space:normal;",
                                translate: ""
                            },
                            aggregates: ['sum'],
                            footerTemplate: "#=sum#"
                        })
                        vm.dataTable7DynamicColumn.push({
                            title: x.columnName,
                            field: x.codeName,
                        })
                        vm.dataTable7Aggregate.push({
                            field: x.codeName,
                            aggregate: "sum"
                        })
                    })
                    vm.dataTable7Column.push({
                        title: CommonService.translate("Tổng cộng"),
                        field: 'total',
                        width: "70px",
                        headerAttributes: {
                            style: "text-align:center;white-space:normal;font-weight:bold",
                            translate: ""
                        },
                        attributes: {style: "text-align:center;white-space:normal;font-weight: bold;"},
                        aggregates: ['sum'],
                        footerTemplate: "#=sum#"
                    })
                    vm.dataTable7Aggregate.push({
                        field: 'total',
                        aggregate: "sum"
                    })

                    vm.tblReportSevenOptions = kendoConfig.getGridOptions({
                        autoBind: true,
                        resizable: true,
                        noRecords: true,
                        columnMenu: true,
                        toolbar: '<h4 style="text-align: center;font-weight:bold;text-shadow:0px 1px 4px red">Báo cáo thống kê số lượng lỗi theo từng đơn vị</h4>',
                        messages: {
                            noRecords: CommonService.translate("Không có kết quả hiển thị")
                        },
                        pageable: {
                            refresh: false,
                            pageSizes: [10, 15],
                            messages: {
                                display: CommonService.translate("{0}-{1} của {2} kết quả"),
                                itemsPerPage: CommonService.translate("kết quả/trang"),
                                empty: CommonService.translate("Không có kết quả hiển thị")
                            }
                        },
                        scrollable: true,
                        dataSource: {
                            data: vm.dataTable7,
                            pageSize: 10,
                            aggregate: vm.dataTable7Aggregate,
                        },
                        columns: vm.dataTable7Column
                    });

                    createReport7();
                }
            }, function (error) {
                console.log(error);
                toastr.error(CommonService.translate("Có lỗi xảy ra khi gọi danh sách cột Báo cáo thống kê số lượng lỗi theo từng đơn vị"));
            })
        }

        function getColumnTable8() {
            vm.dataTable8Column = [];
            vm.dataTable8DynamicColumn = [];
            vm.dataTable8Column.push(
                {
                    title: CommonService.translate("STT"),
                    field: 'stt',
                    width: "50px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Đơn vị được kiểm tra"),
                    field: 'groupName',
                    width: "150px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {
                        style: "text-align:left;white-space:normal;font-weight: 600;font-style: italic;",
                        translate: ""
                    },
                    aggregates: ['sum'],
                    footerTemplate: "Tổng cộng:"
                }
            )

            vm.typeLevelOneProblem.forEach(x => {
                vm.dataTable8Column.push({
                    title: CommonService.translate(x.name),
                    field: x.field,
                    width: "70px",
                    headerAttributes: {
                        style: "text-align:center;white-space:normal;font-weight:bold",
                        translate: ""
                    },
                    attributes: {style: "text-align:center;white-space:normal;"},
                    aggregates: ['sum'],
                    footerTemplate: "#=sum#"
                })
                vm.dataTable8DynamicColumn.push({
                    title: x.field,
                    field: x.id,
                })
            })
            vm.dataTable8Column.push({
                title: CommonService.translate("Tổng cộng"),
                field: 'total',
                width: "70px",
                headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                attributes: {style: "text-align:center;white-space:normal;"},
                aggregates: ['sum'],
                footerTemplate: "#=sum#"
            })
            return vm.dataTable8Column;
        }

        function getAggregateTable8() {
            vm.dataTable8Aggregate = [];
            vm.dataChart8 = [];
            vm.typeLevelOneProblem.forEach(x => {
                vm.dataTable8Aggregate.push({
                    field: x.field,
                    aggregate: "sum"
                })
            })
            vm.dataTable8Aggregate.push({
                field: 'total',
                aggregate: "sum"
            });
            return vm.dataTable8Aggregate;
        }

        function convertDataChart(data, type) {
            var dataReturn = [];
            if (data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    var flag = true;
                    var obj = {
                        numberQHChoViec: 0,
                        numberQHChuaThucHien: 0,
                        numberQHDaDuyet: 0,
                        numberQHTuChoi: 0,
                        numberQHTuChoiNhanViec: 0,
                        numberTHChoDuyet: 0,
                        numberTHDaDuyet: 0,
                        numberTHDangThucHien: 0,
                        numberTHTuChoi: 0,
                        tongQuaHan: 0,
                        tongTrongHan: 0
                    };
                    if (dataReturn.length > 0) {
                        if (type === 'report2') {
                            for (var j = 0; j < dataReturn.length; j++) {
                                if (data[i].sysGroupLv2Name === dataReturn[j].sysGroupLv2Name) {
                                    flag = false;
                                }
                            }
                            if (flag) {
                                obj.sysGroupLv2Name = data[i].sysGroupLv2Name;
                                obj.code = data[i].code;
                                dataReturn.push(obj)
                            }
                        }
                        if (type === 'report3') {
                            for (var j = 0; j < dataReturn.length; j++) {
                                if (data[i].fullName === dataReturn[j].fullName) {
                                    flag = false;
                                }
                            }
                            if (flag) {
                                obj.fullName = data[i].fullName;
                                obj.sysUserId = data[i].sysUserId;
                                obj.tongQuaHan = data[i].tongQuaHan;
                                obj.tongTrongHan = data[i].tongTrongHan;
                                dataReturn.push(obj)
                            }
                        }

                    } else {
                        if (type === 'report2') {
                            obj.sysGroupLv2Name = data[i].sysGroupLv2Name;
                            obj.code = data[i].code;
                            dataReturn.push(obj)
                        }
                        if (type === 'report3') {
                            obj.fullName = data[i].fullName;
                            obj.sysUserId = data[i].sysUserId;
                            obj.tongQuaHan = data[i].tongQuaHan;
                            obj.tongTrongHan = data[i].tongTrongHan;
                            dataReturn.push(obj)
                        }
                    }
                }

                for (var i = 0; i < data.length; i++) {
                    for (var j = 0; j < dataReturn.length; j++) {
                        if (type === 'report2') {
                            if (data[i].sysGroupLv2Name == dataReturn[j].sysGroupLv2Name) {
                                if (data[i].statusName == "QuaHanChoDuyet") {
                                    dataReturn[j].numberQHChoViec += data[i].numberWork;
                                }
                                if (data[i].statusName == "QuaHanChuaThucHien") {
                                    dataReturn[j].numberQHChuaThucHien += data[i].numberWork;
                                }
                                if (data[i].statusName == "QuaHanDaDuyet") {
                                    dataReturn[j].numberQHDaDuyet += data[i].numberWork;
                                }
                                if (data[i].statusName == "QuaHantuChoi") {
                                    dataReturn[j].numberQHTuChoi += data[i].numberWork;
                                }
                                if (data[i].statusName == "QuaHanTuChoiNhanViec") {
                                    dataReturn[j].numberQHTuChoiNhanViec += data[i].numberWork;
                                }
                                if (data[i].statusName == "TrongHanChoDuyet") {
                                    dataReturn[j].numberTHChoDuyet += data[i].numberWork;
                                }
                                if (data[i].statusName == "TrongHanDaDuyet") {
                                    dataReturn[j].numberTHDaDuyet += data[i].numberWork;
                                }
                                if (data[i].statusName == "TrongHanDangThucHien") {
                                    dataReturn[j].numberTHDangThucHien += data[i].numberWork;
                                }
                                if (data[i].statusName == "TrongHanTuChoi") {
                                    dataReturn[j].numberTHTuChoi += data[i].numberWork;
                                }
                            }
                        }
                        if (type === 'report3') {
                            if (data[i].fullName == dataReturn[j].fullName) {
                                if (data[i].statusName == "QuaHanChoDuyet") {
                                    dataReturn[j].numberQHChoViec += data[i].numberWork;
                                }
                                if (data[i].statusName == "QuaHanChuaThucHien") {
                                    dataReturn[j].numberQHChuaThucHien += data[i].numberWork;
                                }
                                if (data[i].statusName == "QuaHanDaDuyet") {
                                    dataReturn[j].numberQHDaDuyet += data[i].numberWork;
                                }
                                if (data[i].statusName == "QuaHantuChoi") {
                                    dataReturn[j].numberQHTuChoi += data[i].numberWork;
                                }
                                if (data[i].statusName == "QuaHanTuChoiNhanViec") {
                                    dataReturn[j].numberQHTuChoiNhanViec += data[i].numberWork;
                                }
                                if (data[i].statusName == "TrongHanChoDuyet") {
                                    dataReturn[j].numberTHChoDuyet += data[i].numberWork;
                                }
                                if (data[i].statusName == "TrongHanDaDuyet") {
                                    dataReturn[j].numberTHDaDuyet += data[i].numberWork;
                                }
                                if (data[i].statusName == "TrongHanDangThucHien") {
                                    dataReturn[j].numberTHDangThucHien += data[i].numberWork;
                                }
                                if (data[i].statusName == "TrongHanTuChoi") {
                                    dataReturn[j].numberTHTuChoi += data[i].numberWork;
                                }
                            }
                        }

                    }
                }

            }
            if (type === 'report2') {
                vm.listGroupSelectReport2 = angular.copy(dataReturn);
            }
            return dataReturn;
        }

        function convertSQLToDataMapTable(data) {
            if (data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    for (var j = 0; j < vm.dataTable.length; j++) {
                        if (data[i].stateName === vm.dataTable[j].status && data[i].statusName === vm.dataTable[j].label) {
                            if (data[i].departmentCode === "KSNB") {
                                vm.dataTable[j].KSNB += data[i].numberWork;
                                vm.dataTable[j].total += data[i].numberWork;
                            }
                            if (data[i].departmentCode === "KTNB") {
                                vm.dataTable[j].KTNB += data[i].numberWork;
                                vm.dataTable[j].total += data[i].numberWork;
                            }
                            if (data[i].departmentCode === "PCHE") {
                                vm.dataTable[j].PCHE += data[i].numberWork;
                                vm.dataTable[j].total += data[i].numberWork;
                            }
                            if (data[i].departmentCode === "QTRR") {
                                vm.dataTable[j].QTRR += data[i].numberWork;
                                vm.dataTable[j].total += data[i].numberWork;
                            }
                        }
                        ;
                    }
                }
            }
        }

        function initLabelTable() {
            vm.dataTable.push({
                total: 0,
                title: "Quá hạn chờ duyệt",
                label: "QuaHanChoDuyet",
                KSNB: 0,
                KTNB: 0,
                PCHE: 0,
                QTRR: 0,
                status: "Quá hạn"
            })
            vm.dataTable.push({
                total: 0,
                title: "Quá hạn chưa thực hiện",
                label: "QuaHanChuaThucHien",
                KSNB: 0,
                KTNB: 0,
                PCHE: 0,
                QTRR: 0,
                status: "Quá hạn"
            })
            vm.dataTable.push({
                total: 0,
                title: "Quá hạn đã duyệt",
                label: "QuaHanDaDuyet",
                KSNB: 0,
                KTNB: 0,
                PCHE: 0,
                QTRR: 0,
                status: "Quá hạn"
            })
            vm.dataTable.push({
                total: 0,
                title: "Quá hạn từ chối",
                label: "QuaHanTuChoi",
                KSNB: 0,
                KTNB: 0,
                PCHE: 0,
                QTRR: 0,
                status: "Quá hạn"
            })
            vm.dataTable.push({
                total: 0,
                title: "Quá hạn từ chối nhận việc",
                label: "QuaHanTuChoiNhanViec",
                KSNB: 0,
                KTNB: 0,
                PCHE: 0,
                QTRR: 0,
                status: "Quá hạn"
            });
            vm.dataTable.push({
                total: 0,
                title: "Trong hạn chờ duyệt",
                label: "TrongHanChoDuyet",
                KSNB: 0,
                KTNB: 0,
                PCHE: 0,
                QTRR: 0,
                status: "Trong hạn"
            });
            vm.dataTable.push({
                total: 0,
                title: "Trong hạn đã duyệt",
                label: "TrongHanDaDuyet",
                KSNB: 0,
                KTNB: 0,
                PCHE: 0,
                QTRR: 0,
                status: "Trong hạn"
            });
            vm.dataTable.push({
                total: 0,
                title: "Trong hạn đang thực hiện",
                label: "TrongHanDangThucHien",
                KSNB: 0,
                KTNB: 0,
                PCHE: 0,
                QTRR: 0,
                status: "Trong hạn"
            });
            vm.dataTable.push({
                total: 0,
                title: "Trong hạn từ chối",
                label: "TrongHanTuChoi",
                KSNB: 0,
                KTNB: 0,
                PCHE: 0,
                QTRR: 0,
                status: "Trong hạn"
            });
        }

        function initInspectionDate() {
            let date = new Date(), y = date.getFullYear(), m = date.getMonth();
            let firstDay = new Date(y, m, 1);
            vm.searchForm6.startInspectionDate = kendo.toString(firstDay, "dd/MM/yyyy");
            vm.searchForm7.startInspectionDate = kendo.toString(firstDay, "dd/MM/yyyy");
            vm.searchForm8.startInspectionDate = kendo.toString(firstDay, "dd/MM/yyyy");

            let current = new Date();
            vm.searchForm6.endInspectionDate = kendo.toString(current, "dd/MM/yyyy");
            vm.searchForm7.endInspectionDate = kendo.toString(current, "dd/MM/yyyy");
            vm.searchForm8.endInspectionDate = kendo.toString(current, "dd/MM/yyyy");
        }

        function convertDataReport4(data) {
            var dataReturn = [];
            if (data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].departmentCode != null) {
                        var obj = {};
                        obj.departmentCode = data[i].departmentCode;
                        // obj.lateWork = Math.abs(data[i].lateWork);
                        obj.lateComplete = data[i].lateComplete;
                        obj.totalMoney = /*Math.abs(data[i].lateWork) * 300000 +*/ data[i].lateComplete * 500000;
                        dataReturn.push(obj);
                    }

                }
            }
            return dataReturn;
        }

        function convertDataReport5(data) {
            var dataReturn = [];
            if (data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].departmentCode != null) {
                        var obj = {};
                        obj.departmentCode = data[i].departmentCode;
                        // obj.lateWork = Math.abs(data[i].lateWork);
                        obj.lateComplete = data[i].lateComplete;
                        obj.totalMoney = /*Math.abs(data[i].lateWork) * 300000 +*/ data[i].lateComplete * 500000;
                        dataReturn.push(obj);
                    }

                }
            }
            return dataReturn;
        }

        vm.searchForm.listSysGroup = [];
        vm.searchForm.listSysUser = [];

        vm.sysUserOptions = {
            clearButton: false,
            dataTextField: "fullName", placeholder: CommonService.translate("Nhập tên nhân viên"),
            dataValueField: "fullName",
            open: function (e) {
                vm.isSelectUser = false;
            },
            select: function (e) {
                vm.isSelectUser = true;
                var dataItem = this.dataItem(e.item.index());

                vm.searchForm.sysUserName = dataItem.fullName;
                vm.searchForm.sysUserId = dataItem.sysUserId;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectUser) {
                        vm.searchForm.sysUserName = null;
                        vm.searchForm.sysUserId = null;
                    }
                }, 100);
            },
            close: function (e) {
                $timeout(function () {
                    if (vm.insertForm.signedBy == null) {
                    }
                }, 1000);

            },
            pageSize: 10,
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        vm.isSelectUser = false;
                        return Restangular.all("commonRsService/getSysUserForAutoComplete").post(
                            {
                                keySearch: vm.searchForm.sysUserName,
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
                '<p class="col-md-5 text-header-auto border-right-ccc" translate>MNV </p>' +
                '<p class="col-md-7 text-header-auto" translate>Tên NV</p>' +
                '</div>' +
                '</div>',
            template: '<div class="row" ><div class="col-md-4 col-xs-4" style="float:left">#: data.employeeCode #</div><div  style="padding-left: 5px;width:auto;overflow: hidden"> #: data.fullName #</div> </div>',
        };

        vm.clear = function (type) {
            switch (type) {
                case 'sg': {
                    vm.searchForm.listSysGroup = null;
                    $('#multiSg').data("kendoMultiSelect").value([]);
                    break;
                }
                case 'su': {
                    vm.searchForm.listSysUser = null;
                    $('#multiSu').data("kendoMultiSelect").value([]);
                    break;
                }
                case 'sysGroupId_search': {
                    vm.searchForm5.sysGroupLv2Name = null;
                    vm.searchForm5.sysGroupLv2Id = null;
                    vm.searchForm5.sysGroupLv2Code = null;
                    break;
                }
            }
        }

        vm.isSelectSearchSysGroup = false;
        vm.sysGroupSearchOptions = {
            clearButton: false,
            dataTextField: "name", placeholder: CommonService.translate("Nhập tên đơn vị"),
            dataValueField: "name",
            open: function (e) {
                vm.isSelectSearchSysGroup = false;
            },
            select: function (e) {
                vm.isSelectSearchSysGroup = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchForm5.sysGroupLv2Id = dataItem.sysGroupId;
                vm.searchForm5.sysGroupLv2Code = dataItem.code;
                vm.searchForm5.sysGroupLv2Name = dataItem.name;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSearchSysGroup) {
                        vm.searchForm5.sysGroupLv2Id = null;
                        vm.searchForm5.sysGroupLv2Code = null;
                        vm.searchForm5.sysGroupLv2Name = null;
                    }
                }, 100);
            },
            close: function (e) {
                $timeout(function () {
                    if (vm.searchForm5.sysGroupLv2Id == null) {
                        vm.searchForm5.sysGroupLv2Code = null;
                        vm.searchForm5.sysGroupLv2Name = null;
                    }
                }, 1000);

            },
            pageSize: 10,
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        vm.isSelectSearchSysGroup = false;
                        return Restangular.all("commonRsService/getSysGroupForAutoComplete").post(
                            {
                                keySearch: vm.searchForm5.sysGroupLv2Name,
                                groupLevelLst: ['2', '3'],
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

        function getUnitDatasource(unitName) {
            return Restangular.all("commonRsService/getSysGroupForAutoComplete").post(
                {
                    keySearch: unitName,
                    groupLevelLst: ['2', '3'],
                    page: 1,
                    pageSize: 10000
                }
            ).then(function (response) {
                vm.unitDatasource = response.data.map(x => {
                    x.codeName = x.code + " - " + x.name;
                    return x;
                });
            }).catch(function (err) {
                console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
            });
        }

        vm.exportExcelGrid6 = function () {
            kendo.ui.progress(vm.documentBody, true);
            vm.searchForm6.page = null;
            vm.searchForm6.pageSize = null;
            getColumnTable6();
            Restangular.all("workAssignRsService/getDataForDashBoard1").post(vm.searchForm6).then(function (response) {
                kendo.ui.progress(vm.documentBody, false);
                vm.dataTable6 = [];
                var itemTotal = {};
                response.data.forEach(x => {
                    let item = {};
                    item['stt'] = response.data.indexOf(x) + 1;
                    item['groupName'] = x.groupName
                    vm.dataTable6DynamicColumn.forEach(c => {
                        let value = x.dataObj.find(i => i.column == c.field);
                        item[c.field] = value ? value.count : 0
                    });

                    item['total'] = x.total;
                    vm.dataTable6.push(item);
                    // Tinh tong
                    vm.dataTable6DynamicColumn.forEach(c => {
                        if (vm.dataTable6.length > 0) {
                            itemTotal[c.field] = vm.dataTable6.map(d => d[c.field]).reduce((prev, next) => prev + next);
                        }
                    });
                    if (vm.dataTable6.length > 0) {
                        itemTotal['total'] = vm.dataTable6.map(d => d['total']).reduce((prev, next) => prev + next);
                    }
                })
                itemTotal['stt'] = '';
                itemTotal['groupName'] = 'Tổng cộng';
                vm.dataTable6.push(itemTotal);
                CommonService.exportFile(vm.tblReportSix, vm.dataTable6, [], [], CommonService.translate("Báo cáo thống kê số lượng kiểm tra"));

            }, function (error) {
                console.log(error);
                toastr.error(CommonService.translate("Có lỗi xảy ra khi gọi dữ liệu Thống kê số lượng kiểm tra"));
            })
        }

        vm.exportExcelGrid7 = function () {
            kendo.ui.progress(vm.documentBody, true);
            vm.searchForm7.page = null;
            vm.searchForm7.pageSize = null;
            getColumnTable7();
            Restangular.all("workAssignRsService/getDataForDashBoard2").post(vm.searchForm7).then(function (response) {
                kendo.ui.progress(vm.documentBody, false);
                vm.dataTable7 = [];
                var itemTotal = {};
                response.data.forEach(x => {
                    let item = {};
                    item['stt'] = response.data.indexOf(x) + 1;
                    item['groupName'] = x.groupName
                    vm.dataTable7DynamicColumn.forEach(c => {
                        let value = x.dataObj.find(i => i.column == c.field);
                        item[c.field] = value ? value.count : 0
                    });

                    item['total'] = x.total;
                    vm.dataTable7.push(item);
                    // Tinh tong
                    vm.dataTable7DynamicColumn.forEach(c => {
                        if (vm.dataTable7.length > 0) {
                            itemTotal[c.field] = vm.dataTable7.map(d => d[c.field]).reduce((prev, next) => prev + next);
                        }
                    });
                    if (vm.dataTable7.length > 0) {
                        itemTotal['total'] = vm.dataTable7.map(d => d['total']).reduce((prev, next) => prev + next);
                    }
                })
                itemTotal['stt'] = '';
                itemTotal['groupName'] = 'Tổng cộng';
                vm.dataTable7.push(itemTotal);
                CommonService.exportFile(vm.tblReportSeven, vm.dataTable7, [], [], CommonService.translate("Báo cáo thống kê số lượng lỗi theo từng đơn vị"));

            }, function (error) {
                console.log(error);
                toastr.error(CommonService.translate("Có lỗi xảy ra khi gọi dữ liệu Thống kê số lượng kiểm tra"));
            })
        }

        vm.exportExcelGrid8 = function () {
            kendo.ui.progress(vm.documentBody, true);
            vm.searchForm8.page = null;
            vm.searchForm8.pageSize = null;
            getColumnTable8();
            Restangular.all("workAssignRsService/getDataForDashBoard3").post(vm.searchForm8).then(function (response) {
                kendo.ui.progress(vm.documentBody, false);
                vm.dataTable8 = [];
                var itemTotal = {};

                response.data.forEach(x => {
                    let item = {};
                    item['stt'] = response.data.indexOf(x) + 1;
                    item['groupName'] = x.groupName
                    vm.dataTable8DynamicColumn.forEach(c => {
                        let value = x.dataObj.find(i => i.levelOneProblem == c.field);
                        item[c.title] = value ? value.count : 0
                    });

                    item['total'] = x.total;
                    vm.dataTable8.push(item);

                    vm.dataTable8DynamicColumn.forEach(c => {
                        if (vm.dataTable8.length > 0) {
                            itemTotal[c.title] = vm.dataTable8.map(d => d[c.title]).reduce((prev, next) => prev + next);
                        }
                    });
                    if (vm.dataTable8.length > 0) {
                        itemTotal['total'] = vm.dataTable8.map(d => d['total']).reduce((prev, next) => prev + next);
                    }
                })

                itemTotal['stt'] = '';
                itemTotal['groupName'] = 'Tổng cộng';
                vm.dataTable8.push(itemTotal);
                CommonService.exportFile(vm.tblReportEight, vm.dataTable8, [], [], CommonService.translate("Báo cáo tổng hợp các loại vấn đề"));

            }, function (error) {
                console.log(error);
                toastr.error(CommonService.translate("Có lỗi xảy ra khi gọi dữ liệu Thống kê số lượng kiểm tra"));
            })
        }

        vm.ValidateInspectionDate6 = function (eleId) {
            let start = kendo.parseDate(vm.searchForm6.startInspectionDate, "dd/MM/yyyy");
            let end = kendo.parseDate(vm.searchForm6.endInspectionDate, "dd/MM/yyyy");
            let now = new Date();
            now.setHours(0, 0, 0, 0);
            let current = kendo.parseDate(now, "dd/MM/yyyy");
            if (start != null && start > current) {
                $('#' + eleId).focus();
                $('#' + eleId).val('');
                toastr.error("Thời gian bắt đầu kiểm tra phải nhỏ hơn ngày hiện tại");
                return;
            }
            if (start != null && end != null && start > end) {
                $('#' + eleId).focus();
                $('#' + eleId).val('');
                toastr.error("Thời gian bắt đầu kiểm tra phải nhỏ hơn thời gian kết thúc kiểm tra");
                return;
            }
        }
        vm.ValidateInspectionDate7 = function (eleId) {
            let start = kendo.parseDate(vm.searchForm7.startInspectionDate, "dd/MM/yyyy");
            let end = kendo.parseDate(vm.searchForm7.endInspectionDate, "dd/MM/yyyy");
            let now = new Date();
            now.setHours(0, 0, 0, 0);
            let current = kendo.parseDate(now, "dd/MM/yyyy");
            if (start != null && start > current) {
                $('#' + eleId).focus();
                $('#' + eleId).val('');
                toastr.error("Thời gian bắt đầu kiểm tra phải nhỏ hơn ngày hiện tại");
                return;
            }
            if (start != null && end != null && start > end) {
                $('#' + eleId).focus();
                $('#' + eleId).val('');
                toastr.error("Thời gian bắt đầu kiểm tra phải nhỏ hơn thời gian kết thúc kiểm tra");
                return;
            }
        }
        vm.ValidateInspectionDate8 = function (eleId) {
            let start = kendo.parseDate(vm.searchForm8.startInspectionDate, "dd/MM/yyyy");
            let end = kendo.parseDate(vm.searchForm8.endInspectionDate, "dd/MM/yyyy");
            let now = new Date();
            now.setHours(0, 0, 0, 0);
            let current = kendo.parseDate(now, "dd/MM/yyyy");
            if (start != null && start > current) {
                $('#' + eleId).focus();
                $('#' + eleId).val('');
                toastr.error("Thời gian bắt đầu kiểm tra phải nhỏ hơn ngày hiện tại");
                return;
            }
            if (start != null && end != null && start > end) {
                $('#' + eleId).focus();
                $('#' + eleId).val('');
                toastr.error("Thời gian bắt đầu kiểm tra phải nhỏ hơn thời gian kết thúc kiểm tra");
                return;
            }
        }


    }
})();

