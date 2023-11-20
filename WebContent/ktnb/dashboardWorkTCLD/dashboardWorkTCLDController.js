(function () {
    'use strict';
    var controllerId = 'dashboardWorkController';

    angular.module('MetronicApp').controller(controllerId, dashboardWorkController);

    function dashboardWorkController($scope,$http, $templateCache, $rootScope, $timeout, gettextCatalog,
                                  kendoConfig, $kWindow, $q,
                                  CommonService, htmlCommonService, PopupConst, Restangular, RestEndpoint, Constant) {
        var vm = this;

        vm.documentBody = $("#dashboardWorkControllerId");
        vm.modalBody = ".k-window";
        vm.searchForm = {};
        vm.insertForm = {};
        vm.dataTable = [];
        vm.dataTable3 = [];
        vm.listMonth = [];
        vm.listYear = [];
        vm.data = [];

        $(document).ready(function() {
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
                            var x = convertDataChart(response.data,'report3');
                            // return convertDataChart(response.data,'report2');
                            return x;
                        },
                    },
                    transport: {
                        read: {
                            url: RestEndpoint.BASE_SERVICE_URL + "workAssignTCLDService/getDataDashboard",
                            type: "POST",
                            contentType: "application/json; charset=utf-8"
                        },
                        parameterMap: function(options, type) {
                            var obj = angular.copy(vm.searchForm);
                            return JSON.stringify(obj);
                        }
                    },
                },
            });
        });

        for (let i = 1; i < 13; i++) {
            vm.listMonth.push({value: i, name:'Tháng '+i});
        }
        var year = new Date().getFullYear();
        for (let i = year; i > year-1 ; i--) {
            vm.listYear.push({value: i, name:'Năm '+i});
        }
        initForm();
        function initForm() {
            vm.breadcrumb = CommonService.translate("Dashboard TCLD");
            initLabelTable();
            creatReport3();
        }


        function creatReport3(){
            Restangular.all("workAssignTCLDService/getDataDashboard").post(vm.searchForm).then(function (response) {
                vm.dataTable3 = convertDataChart(response.data,'report3');
                creatChartReport3();
                $("#tblReportThree").data("kendoGrid").dataSource.data(vm.dataTable3);

            },function (error) {
                console.log(error);
                toastr.error(CommonService.translate("Có lỗi xảy ra khi vẽ chart"));
            })
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
                dataSource:{
                    data: vm.dataTable3
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
                        field:"numberQHChoViec",
                        color: "#18e129",
                        stack: 'col',
                    }, {
                        name: "Quá hạn chưa thực hiện",
                        field:"numberQHChuaThucHien",
                        color: "#ce2d2d",
                        stack: 'col',
                    }, {
                        name: "Quá hạn đã duyệt",
                        field:"numberQHDaDuyet",
                        color: "#06bfd7",
                        stack: 'col',
                    },{
                        name: "Quá hạn từ chối",
                        field:"numberQHTuChoi",
                        color: "#cfd94c",
                        stack: 'col',
                    },
                    {
                        name: "Trong hạn chờ duyệt",
                        field:"numberTHChoDuyet",
                        color: "#2a7826",
                        stack: 'col',
                    },
                    {
                        name: "Trong hạn đã duyệt",
                        field:"numberTHDaDuyet",
                        color: "#d27a9e",
                        stack: 'col',
                    },
                    {
                        name: "Trong hạn chưa thực hiện",
                        field:"numberTHChuaThucHien",
                        color: "#1a1717",
                        stack: 'col',
                    }
                    ,{
                        name: "Trong hạn từ chối",
                        field:"numberTHTuChoi",
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
                valueAxis:{
                    labels:{
                        rotation: -60,
                    }
                },
                tooltip: {
                    color: "#fff",
                    visible: true,
                    format: "N0",
                    template: function (e) {
                        var debug =   e.category + '</br>';
                        if(e.dataItem.numberQHChoViec>0){
                            debug+='Quá hạn chờ duyệt: '+ e.dataItem.numberQHChoViec  + '</br>';
                        }if(e.dataItem.numberQHChuaThucHien>0){
                            debug+='Quá hạn chưa thực hiện: '+ e.dataItem.numberQHChuaThucHien + '</br>';
                        }if(e.dataItem.numberQHDaDuyet>0){
                            debug+='Quá hạn đã duyệt: '+ e.dataItem.numberQHDaDuyet + '</br>';
                        }if(e.dataItem.numberQHTuChoi>0){
                            debug+='Quá hạn từ chối: '+ e.dataItem.numberQHTuChoi  + '</br>';
                        }/*if(e.dataItem.numberQHTuChoiNhanViec>0){
                            debug+='Quá hạn từ chối nhận việc: '+ e.dataItem.numberQHTuChoiNhanViec  + '</br>';
                        }*/if(e.dataItem.numberTHChoDuyet>0){
                            debug+='Trong hạn chờ duyệt: '+ e.dataItem.numberTHChoDuyet  + '</br>';
                        }if(e.dataItem.numberTHDaDuyet>0){
                            debug+='Trong hạn đã duyệt: '+ e.dataItem.numberTHDaDuyet  + '</br>';
                        }if(e.dataItem.numberTHChuaThucHien>0){
                            debug+='Trong hạn chưa thực hiện: '+ e.dataItem.numberTHChuaThucHien  + '</br>';
                        }if(e.dataItem.numberTHTuChoi>0){
                            debug+='Trong hạn từ chối: '+ e.dataItem.numberTHTuChoi  + '</br>';
                        }
                        return debug;
                    }
                }
            });
        }

        // ========================= Table region =========================
        vm.tblReportThreeOptions = kendoConfig.getGridOptions({
            autoBind: true,
            resizable: true,
            noRecords: true,
            columnMenu: true,
            toolbar:'<h4 style="text-align: center;font-weight:bold;text-shadow:0px 1px 4px red">Bảng chi tiết từng cá nhân</h4>',
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
                pageSize:10,
                aggregate: [
                    { field: "fullName", aggregate: "count" },
                    { field: "numberQHChoViec", aggregate: "sum" },
                    { field: "numberQHChuaThucHien", aggregate: "sum" },
                    { field: "numberQHDaDuyet", aggregate: "sum" },
                    { field: "numberQHTuChoi", aggregate: "sum" },
                    { field: "numberTHChoDuyet", aggregate: "sum" },
                    { field: "numberTHDaDuyet", aggregate: "sum" },
                    { field: "numberTHChuaThucHien", aggregate: "sum" },
                    { field: "numberTHTuChoi", aggregate: "sum" }
                ]
            },
            columns: [
                {
                    title: CommonService.translate("Nhân viên"),
                    field: 'fullName',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                    attributes: {style: "text-align:left;white-space:normal;font-weight: 600;font-style: italic;", translate: ""},
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
                    title: CommonService.translate("Trong hạn chưa thực hiện"),
                    field: 'numberTHChuaThucHien',
                    width: "90px",
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
                // {
                //     title: CommonService.translate("Tổng cộng"),
                //     field: 'total',
                //     width: "70px",
                //     headerAttributes: {style: "text-align:center;white-space:normal;font-weight:bold", translate: ""},
                //     attributes: {style: "text-align:center;white-space:normal;"},
                // },
            ]
        });


        vm.doSearch3 = function(){
            creatReport3();
        }
        vm.cancel = function () {
            setTimeout(function () {
                if (vm.modalAdd1 != null) {vm.modalAdd1.dismiss();vm.modalAdd1 = null}
                else if (vm.modalAdd != null){vm.modalAdd.dismiss();vm.modalAdd = null;}
            },200)
        };


        function convertDataChart(data,type){
            var dataReturn = [];
            if (data.length > 0 ){
                for(var i = 0; i < data.length; i++){
                    var flag = true;
                    var obj = {numberQHChoViec:0,numberQHChuaThucHien:0,numberQHDaDuyet:0,numberQHTuChoi:0,numberQHTuChoiNhanViec:0,numberTHChoDuyet:0,numberTHDaDuyet:0,numberTHChuaThucHien:0,numberTHTuChoi:0,tongQuaHan:0,tongTrongHan:0};
                    if (dataReturn.length > 0){
                        if(type === 'report2'){
                            for (var j = 0; j < dataReturn.length; j++){
                                if (data[i].sysGroupLv2Name === dataReturn[j].sysGroupLv2Name){
                                    flag = false;
                                }
                            }
                            if (flag){
                                obj.sysGroupLv2Name = data[i].sysGroupLv2Name;
                                obj.code = data[i].code;
                                dataReturn.push(obj)
                            }
                        }
                        if(type === 'report3'){
                            for (var j = 0; j < dataReturn.length; j++){
                                if (data[i].fullName === dataReturn[j].fullName){
                                    flag = false;
                                }
                            }
                            if (flag){
                                obj.fullName = data[i].fullName;
                                obj.sysUserId = data[i].sysUserId;
                                obj.tongQuaHan = data[i].tongQuaHan;
                                obj.tongTrongHan = data[i].tongTrongHan;
                                dataReturn.push(obj)
                            }
                        }

                    }else {
                        if (type === 'report2'){
                            obj.sysGroupLv2Name = data[i].sysGroupLv2Name;
                            obj.code = data[i].code;
                            dataReturn.push(obj)
                        }
                        if (type === 'report3'){
                            obj.fullName = data[i].fullName;
                            obj.sysUserId = data[i].sysUserId;
                            obj.tongQuaHan = data[i].tongQuaHan;
                            obj.tongTrongHan = data[i].tongTrongHan;
                            dataReturn.push(obj)
                        }
                    }
                }

                for (var i = 0; i < data.length; i++){
                    for (var j = 0; j < dataReturn.length; j++){
                        if (type === 'report2'){
                            if (data[i].sysGroupLv2Name == dataReturn[j].sysGroupLv2Name){
                                if (data[i].statusName == "QuaHanChoDuyet"){
                                    dataReturn[j].numberQHChoViec += data[i].numberWork;
                                }
                                if (data[i].statusName == "QuaHanChuaThucHien"){
                                    dataReturn[j].numberQHChuaThucHien += data[i].numberWork;
                                }
                                if (data[i].statusName == "QuaHanDaDuyet"){
                                    dataReturn[j].numberQHDaDuyet += data[i].numberWork;
                                }
                                if (data[i].statusName == "QuaHantuChoi"){
                                    dataReturn[j].numberQHTuChoi += data[i].numberWork;
                                }
                                if (data[i].statusName == "QuaHanTuChoiNhanViec"){
                                    dataReturn[j].numberQHTuChoiNhanViec += data[i].numberWork;
                                }
                                if (data[i].statusName == "TrongHanChoDuyet"){
                                    dataReturn[j].numberTHChoDuyet += data[i].numberWork;
                                }
                                if (data[i].statusName == "TrongHanDaDuyet"){
                                    dataReturn[j].numberTHDaDuyet += data[i].numberWork;
                                }
                                if (data[i].statusName == "TrongHanChuaThucHien"){
                                    dataReturn[j].numberTHChuaThucHien += data[i].numberWork;
                                }
                                if (data[i].statusName == "TrongHanTuChoi"){
                                    dataReturn[j].numberTHTuChoi += data[i].numberWork;
                                }
                            }
                        }
                        if (type === 'report3'){
                            if (data[i].fullName == dataReturn[j].fullName){
                                if (data[i].statusName == "QuaHanChoDuyet"){
                                    dataReturn[j].numberQHChoViec += data[i].numberWork;
                                }
                                if (data[i].statusName == "QuaHanChuaThucHien"){
                                    dataReturn[j].numberQHChuaThucHien += data[i].numberWork;
                                }
                                if (data[i].statusName == "QuaHanDaDuyet"){
                                    dataReturn[j].numberQHDaDuyet += data[i].numberWork;
                                }
                                if (data[i].statusName == "QuaHantuChoi"){
                                    dataReturn[j].numberQHTuChoi += data[i].numberWork;
                                }
                                if (data[i].statusName == "QuaHanTuChoiNhanViec"){
                                    dataReturn[j].numberQHTuChoiNhanViec += data[i].numberWork;
                                }
                                if (data[i].statusName == "TrongHanChoDuyet"){
                                    dataReturn[j].numberTHChoDuyet += data[i].numberWork;
                                }
                                if (data[i].statusName == "TrongHanDaDuyet"){
                                    dataReturn[j].numberTHDaDuyet += data[i].numberWork;
                                }
                                if (data[i].statusName == "TrongHanChuaThucHien"){
                                    dataReturn[j].numberTHChuaThucHien += data[i].numberWork;
                                }
                                if (data[i].statusName == "TrongHanTuChoi"){
                                    dataReturn[j].numberTHTuChoi += data[i].numberWork;
                                }
                            }
                        }

                    }
                }

            }
            if (type === 'report2'){
                vm.listGroupSelectReport2 = angular.copy(dataReturn);
            }
            return dataReturn;
        };
        function initLabelTable() {
            vm.dataTable.push({total:0,title:"Quá hạn chờ duyệt",label:"QuaHanChoDuyet",KSNB:0,KTNB:0,PCHE:0,QTRR:0,status:"Quá hạn"})
            vm.dataTable.push({total:0,title:"Quá hạn chưa thực hiện",label:"QuaHanChuaThucHien",KSNB:0,KTNB:0,PCHE:0,QTRR:0,status:"Quá hạn"})
            vm.dataTable.push({total:0,title:"Quá hạn đã duyệt",label:"QuaHanDaDuyet",KSNB:0,KTNB:0,PCHE:0,QTRR:0,status:"Quá hạn"})
            vm.dataTable.push({total:0,title:"Quá hạn từ chối",label:"QuaHanTuChoi",KSNB:0,KTNB:0,PCHE:0,QTRR:0,status:"Quá hạn"})
            vm.dataTable.push({total:0,title:"Quá hạn từ chối nhận việc",label:"QuaHanTuChoiNhanViec",KSNB:0,KTNB:0,PCHE:0,QTRR:0,status:"Quá hạn"});
            vm.dataTable.push({total:0,title:"Trong hạn chờ duyệt",label:"TrongHanChoDuyet",KSNB:0,KTNB:0,PCHE:0,QTRR:0,status:"Trong hạn"});
            vm.dataTable.push({total:0,title:"Trong hạn đã duyệt",label:"TrongHanDaDuyet",KSNB:0,KTNB:0,PCHE:0,QTRR:0,status:"Trong hạn"});
            vm.dataTable.push({total:0,title:"Trong hạn chưa thực hiện",label:"TrongHanChuaThucHien",KSNB:0,KTNB:0,PCHE:0,QTRR:0,status:"Trong hạn"});
            vm.dataTable.push({total:0,title:"Trong hạn từ chối",label:"TrongHanTuChoi",KSNB:0,KTNB:0,PCHE:0,QTRR:0,status:"Trong hạn"});
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

        // vm.clear = function(type){
        //     switch (type){
        //         case 'sg': {
        //             vm.searchForm.listSysGroup = null;
        //             $('#multiSg').data("kendoMultiSelect").value([]);
        //             break;
        //         }
        //         case 'su': {
        //             vm.searchForm.listSysUser = null;
        //             $('#multiSu').data("kendoMultiSelect").value([]);
        //             break;
        //         }
        //         case 'sysGroupId_search': {
        //             vm.searchForm5.sysGroupLv2Name = null;
        //             vm.searchForm5.sysGroupLv2Id = null;
        //             vm.searchForm5.sysGroupLv2Code = null;
        //             break;
        //         }
        //     }
        // }

        vm.isSelectSearchSysGroup = false;
        // vm.sysGroupSearchOptions = {
        //     clearButton: false,
        //     dataTextField: "name", placeholder: CommonService.translate("Nhập tên đơn vị"),
        //     dataValueField: "name",
        //     open: function (e) {
        //         vm.isSelectSearchSysGroup = false;
        //     },
        //     select: function (e) {
        //         vm.isSelectSearchSysGroup = true;
        //         var dataItem = this.dataItem(e.item.index());
        //         vm.searchForm5.sysGroupLv2Id = dataItem.sysGroupId;
        //         vm.searchForm5.sysGroupLv2Code = dataItem.code;
        //         vm.searchForm5.sysGroupLv2Name = dataItem.name;
        //     },
        //     change: function (e) {
        //         $timeout(function () {
        //             if (e.sender.value() === '' || !vm.isSelectSearchSysGroup) {
        //                 vm.searchForm5.sysGroupLv2Id = null;
        //                 vm.searchForm5.sysGroupLv2Code = null;
        //                 vm.searchForm5.sysGroupLv2Name = null;
        //             }
        //         }, 100);
        //     },
        //     close: function (e) {
        //         $timeout(function () {
        //             if (vm.searchForm5.sysGroupLv2Id == null) {
        //                 vm.searchForm5.sysGroupLv2Code = null;
        //                 vm.searchForm5.sysGroupLv2Name = null;
        //             }
        //         }, 1000);
        //
        //     },
        //     pageSize: 10,
        //     dataSource: {
        //         serverFiltering: true,
        //         transport: {
        //             read: function (options) {
        //                 vm.isSelectSearchSysGroup = false;
        //                 return Restangular.all("commonRsService/getSysGroupForAutoComplete").post(
        //                     {
        //                         keySearch: vm.searchForm5.sysGroupLv2Name,
        //                         groupLevelLst: ['2', '3'],
        //                         page: 1,
        //                         pageSize: 30
        //                     }
        //                 ).then(function (response) {
        //                     options.success(response.data);
        //                 }).catch(function (err) {
        //                     console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
        //                 });
        //             }
        //         }
        //     },
        //
        //     headerTemplate: '<div class="dropdown-header text-center k-widget k-header">' +
        //         '<div class="row">' +
        //         '<p class="col-md-6 text-header-auto border-right-ccc" translate>Mã đơn vị</p>' +
        //         '<p class="col-md-6 text-header-auto" translate>Tên đơn vị</p>' +
        //         '</div>' +
        //         '</div>',
        //     template: '<div class="row" ><div class="col-md-6 col-xs-5" style="float:left">#: data.code #</div><div  style="padding-left: 5px;width:auto;overflow: hidden"> #: data.name #</div> </div>',
        // };
    }
})();

