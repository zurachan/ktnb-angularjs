(function () {
    'use strict';
    var controllerId = 'emulationEvaluationController';

    angular.module('MetronicApp').controller(controllerId, emulationEvaluationController);
    function emulationEvaluationController($scope, $http,$timeout,$rootScope, $log, $filter,Constant,Restangular,CommonService,kendoConfig,$kWindow,RestEndpoint,gettextCatalog) {
        var vm = this;
        var modalAdd,modalEdit,modalInstanceImport;
        vm.addForm = {};
        vm.listemulationEvaluationExportTemp = [];
        vm.modalBody = ".k-widget.k-window";
        vm.documentBody = $(".tab-content");
        const _ACTIVE = 'Hoạt động';
        const _UNACTIVE = 'Không hoạt động';
        vm.searchForm = {};

        initFormData();
        //
        function initFormData() {
            $("#ktnb_searchForm_emulationEvaluationId").click(function (e) {
            });
            // fillDataTable([]);
            vm.String = CommonService.translate("Đánh giá thi đua")
            vm.addForm = {};
            vm.activeArray = [
                {id: "Y", nameActive: _ACTIVE},
                {id: "N", nameActive: _UNACTIVE}
            ];
            vm.dataList=[];

            var currentDate = new Date();
            currentDate.setDate(1);
            currentDate.setMonth(currentDate.getMonth() - 1);
            vm.searchForm.fromYear = ("0"+(currentDate.getMonth() + 1)).slice(-2)  + "/" + currentDate.getFullYear();
        }

        // ----- Main Grid start
        vm.showHideColumnDetail = function (column) {
            var grid = vm.emulationEvaluationGrid;
            if (angular.isUndefined(column.hidden)) {
                grid.hideColumn(column);
            } else if (column.hidden) {
                grid.showColumn(column);
            } else {
                grid.hideColumn(column);
            }
        };

        vm.openEvaluate = false;
        Restangular.all("emulationEvaluationRsServiceRest/checkOpenDay").post({sysUserId: Constant.user.vpsUserToken.sysUserId}).then(function(d){
            if (d == 1) {
                vm.openEvaluate = true;
            } else {
                vm.openEvaluate = false;
            }
        }, function(){
            console.log('Có lỗi xảy ra khi check quyền tạo yêu cầu từ nhà cung cấp đến CNKT');
        });

        //check xuat excel cho ong admin
        vm.openExportExcelAdmin = false;
        Restangular.all("emulationEvaluationRsServiceRest/checkExportExcel").post({sysUserId: Constant.user.vpsUserToken.sysUserId}).then(function(d){
            if (d == 1) {
                vm.openExportExcelAdmin = true;
            } else {
                vm.openExportExcelAdmin = false;
            }
        }, function(){
            console.log('Có lỗi xảy ra khi check quyền tạo yêu cầu từ nhà cung cấp đến CNKT');
        });

        //check xuat excel cho ong truong phong
        // vm.sysTP = {};
        // Restangular.all("emulationEvaluationRsServiceRest/checkExportExcelTp").post({sysUserId: Constant.user.vpsUserToken.sysUserId}).then(function(d){
        //     vm.sysTP = d.data;
        //     if(vm.sysTP.length != 0 && vm.sysTP != null){
        //         vm.sysTP.sysGroupId = vm.sysTP[0].sysGroupEvaluateId;
        //         vm.openExportExcelAdmin = true;
        //     }
        // }, function(){
        //     console.log('Có lỗi xảy ra khi check quyền tạo yêu cầu từ nhà cung cấp đến CNKT');
        // });

        //
        var record = 0;
        vm.emulationEvaluationGridOptions = kendoConfig.getGridOptions({
            autoBind: true,
            scrollable: true,
            resizable: true,
            editable: false,
            dataBinding: function () {
                record = (this.dataSource.page() - 1) * this.dataSource.pageSize();
            },
            reorderable: true,
            toolbar: [
                {
                    name: "actions",
                    template: '<div class=" pull-left ">' +
                        // '<button  type="button"  class="btn btn-qlk padding-search-right iconReview ng-scope" style="width: 120px" ng-click="vm.create()">Đánh giá</button>' +
                        '<button  type="button" ng-disabled="!vm.openEvaluate" class="btn btn-qlk padding-search-right iconReview ng-scope" style="width: 120px" ng-click="vm.create()">Đánh giá</button>' +
                        '<span style="color: red; margin-left: 10px;" ng-if="!vm.openEvaluate">Đã hết thời hạn đánh giá. Vui lòng liên hệ Phòng Kế Hoạch</span>' +
                        '</div>'
                }
            ],
            dataSource: {
                serverPaging: true,
                schema: {
                    total: function (response) {
                        vm.count = response.total;
                        return response.total;
                    },
                    data: function (response) {
                        return response.data;
                    }
                },
                transport: {
                    read: {
                        url: Constant.BASE_SERVICE_URL + "emulationEvaluationRsServiceRest/doSearch",
                        contentType: "application/json; charset=utf-8",
                        type: "POST"
                    },
                    parameterMap: function (options, type) {
                        var obj = angular.copy(vm.searchForm);
                        obj.page = options.page;
                        obj.pageSize = options.pageSize;
                        obj.sysUserId = Constant.user.vpsUserToken.sysUserId;
                        if (obj.fromYear) {
                            obj.fromYear = "01/"+ obj.fromYear;
                        }
                        if (obj.toYear) {
                            obj.toYear = "01/"+ obj.toYear;
                        }
                        record = 0;
                        return JSON.stringify(obj);
                    }
                },
                pageSize: 15
            },
            columnMenu: false,
            noRecords: true,
            messages: {
                noRecords: CommonService.translate("Không có kết quả hiển thị")
            },
            pageable: {
                refresh: false,
                pageSizes: [15, 20, 25],
                messages: {
                    display: "{0}-{1} của {2} kết quả",
                    itemsPerPage: "kết quả/trang",
                    empty: "Không có kết quả hiển thị"
                }
            },
            columns: [
                {
                    title: CommonService.translate("STT"),
                    field: "stt",
                    template: function () {
                        return ++record;
                    },
                    width: "3%",
                    headerAttributes: {
                    style: "text-align:center; font-weight: bold;",
                        translate: ""
                    },
                    hidden: false,
                        attributes: {
                        style: "text-align:center;"
                    }
                },
                {
                    title: CommonService.translate("Kỳ"),
                    field: "periodName",
                    // template: function() {
                    //     var currentDate = new Date();
                    //     currentDate.setDate(1);
                    //     currentDate.setMonth(currentDate.getMonth() - 1);
                    //     return "Tháng " + (currentDate.getMonth() + 1) + "/" + currentDate.getFullYear();
                    // },
                    width: "7%",
                    headerAttributes: {
                        style: "text-align:center; font-weight: bold;",
                        translate: ""
                    },
                    hidden: false,
                    attributes: {
                        style: "text-align:left;"
                    }
                },
                {   title: CommonService.translate("Tên phòng ban"),
                    field: "sysGroupEvaluateName",
                    headerAttributes: {
                    "class": "table-header-cell",
                        style: "text-align: center; font-weight: bold;white-space:normal;"
                    },
                    attributes: {
                        "class": "table-cell",
                        style: "text-align: left; "
                    },
                    hidden: false,
                    width: "12%"
                },
                {
                    title: "Kết quả",
                    field: "result",
                    template: function (dataItem) {
                        return (dataItem.result ? dataItem.result.split("\n").join('<br>') : "");
                    },
                    width: '25%',
                    footerAttributes: {style: "display:none"},
                    headerAttributes: {
                        style: "text-align:center; font-weight: bold",
                        translate:""
                    },
                    attributes: {style: "text-align:left;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Kết quả, lý do đánh giá"),
                        field: "#",
                    columns:[
                    {
                        title: "Đạt",
                        field: "evaluateOk",
                        width: '5%',
                        template: function (dataItem) {
                            if (dataItem.evaluate == "Y") {
                                dataItem.selectedOk = true
                            }
                            return "<input type='checkbox' disabled  ng-model='dataItem.selectedOk'/>"
                        },
                        footerAttributes: {style: "display:none"},
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold",
                            translate:""
                        },
                        attributes: {style: "text-align:center;"},
                    },{
                        title: "Không đạt",
                        field: "evaluateNotOk",
                        width: '6%',
                        template: function (dataItem) {
                            if (dataItem.evaluate == "N") {
                                dataItem.selectedNotOk = true
                            }
                            return "<input type='checkbox' disabled  ng-model='dataItem.selectedNotOk'/>"
                        },
                        footerAttributes: {style: "display:none"},
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold",
                            translate:""
                        },
                        attributes: {style: "text-align:center;"},
                    },{
                        title: "Lý do",
                        field: "reason",
                        template: function (dataItem) {
                            return (dataItem.reason ? dataItem.reason.split("\n").join('<br>') : "");
                        },
                        width: '25%',
                        footerAttributes: {style: "display:none"},
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold",
                            translate:""
                        },
                        attributes: {style: "text-align:left;white-space:normal;"},
                    }
                ],
                    headerAttributes: {
                    "class": "table-header-cell",
                        style: "text-align: center; font-weight: bold;white-space:normal;"
                    },
                    attributes: {
                        "class": "table-cell",
                            style: "text-align: left; "
                    },
                    hidden: false,
                        width: "35%"
                },
                {   title: CommonService.translate("Đề xuất"),
                    field: "suggest",
                    template: function (dataItem) {
                        return (dataItem.suggest ? dataItem.suggest.split("\n").join('<br>') : "");
                    },
                    width: '15%',
                    footerAttributes: {style: "display:none"},
                    headerAttributes: {
                        style: "text-align:center; font-weight: bold",
                        translate:""
                    },
                    attributes: {style: "text-align:left;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Người đánh giá"),
                    field: "sysUserName",
                    template: function (dataItem) {
                        return (dataItem.sysUserName ? dataItem.sysUserName.split("\n").join('<br>') : "");
                    },
                    width: "8%",
                    footerAttributes: {style: "display:none"},
                    headerAttributes: {
                        style: "text-align:center; font-weight: bold",
                        translate:""
                    },
                    attributes: {style: "text-align:left;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Đơn vị đánh giá"),
                    field: "sysGroupName",
                    template: function (dataItem) {
                        return (dataItem.sysGroupName ? dataItem.sysGroupName.split("\n").join('<br>') : "");
                    },
                    width: "10%",
                    footerAttributes: {style: "display:none"},
                    headerAttributes: {
                        style: "text-align:center; font-weight: bold",
                        translate:""
                    },
                    attributes: {style: "text-align:left;white-space:normal;"},
                }
            ]
        });

        //tim kiem
        vm.doSearch = doSearch;
        function doSearch() {
            var grid = vm.emulationEvaluationGrid;
            if(grid){
                grid.dataSource.query({
                    page: 1,
                    pageSize: 15
                });
                vm.listDataChoise = [];
            }
        };

        //clear
        vm.clear = function(a){
            if( a == 'sysGroupId'){
                vm.searchForm.sysGroupEvaluateId = null;
                vm.searchForm.sysGroupEvaluateName = null;
            } else if (a == 'date') {
                vm.searchForm.fromYear = null;
                vm.searchForm.toYear = null;
            }
        }


        /*
		 * đóng Popup
		 */
        vm.cancel = function () {
            $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
        }

        vm.create=function(){
            vm.sys ={};
            vm.sys = Constant.user.VpsUserInfo.groupNameLevel2;

            vm.addForm = {};
            vm.viewInfo = false;
            vm.typeCreate = 'add';
            var teamplateUrl="ktnb/emulationEvaluation/emulationEvaluationAddPopupExcel.html";
            var title="Đánh giá phòng ban";
            var windowId="WORK_LIST_ADD";
            Restangular.all("emulationEvaluationRsServiceRest/getDataEvaluation").post({sysUserId : Constant.user.vpsUserToken.sysUserId}).then(function(d){
                d.data.forEach(function (i) {
                    if (i.evaluate == "Y") {
                        i.selectedOk = true
                    }
                    if (i.evaluate == "N") {
                        i.selectedNotOk = true
                    }
                })
                initGridAdd(d.data);
                CommonService.populatePopupCreate(teamplateUrl,title,null,vm,windowId,true,'1500','850',null);
            }, function(){
                console.log('Có lỗi xảy ra');
            });

        }

        function initGridAdd(data) {
            var dataSource = new kendo.data.DataSource({
                // pageSize: 10,
                data: data,
                autoSync: true,
                schema: {
                    model: {
                        fields: {
                            stt: { editable: false },
                            periodName: { editable: false },
                            sysGroupEvaluateName: { editable: false },
                            result: { editable: false },
                            suggest: { editable: true },
                            evaluateOk: { editable: false },
                            evaluateNotOk: { editable: false },
                            reason: { editable: true }

                        }
                    }
                }
            });

            vm.emulationEvaluationAddGridOptions = kendoConfig.getGridOptions({
                autoBind: true,
                resizable: true,
                dataSource: dataSource,
                noRecords: true,
                columnMenu: false,
                scrollable: false,
                messages: {
                    noRecords: CommonService.translate("Không có kết quả hiển thị")
                }, dataBound: function () {
                    var GridDestination = $("#emulationEvaluationAddGrid").data("kendoGrid");
                    GridDestination.pager.element.hide();
                },
                columns: [
                    {
                        title: CommonService.translate("STT"),
                        field: "stt",
                        template: dataItem => $("#emulationEvaluationAddGrid").data("kendoGrid").dataSource.indexOf(dataItem) + 1,
                        width: "3%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold;",
                            translate: ""
                        },
                        hidden: false,
                        attributes: {
                            style: "text-align:center;"
                        }
                    },
                    {
                        title: CommonService.translate("Kỳ"),
                        field: "periodName",
                        template: function() {
                            var currentDate = new Date();
                            currentDate.setDate(1);
                            currentDate.setMonth(currentDate.getMonth() - 1);
                            return "Tháng " + (currentDate.getMonth() + 1) + "/" + currentDate.getFullYear();
                        },
                            width: "9%",
                            headerAttributes: {
                            style: "text-align:center; font-weight: bold;",
                                translate: ""
                        },
                            hidden: false,
                                attributes: {
                            style: "text-align:left;"
                        }
                    },
                    {   title: CommonService.translate("Tên phòng ban"),
                        field: "sysGroupEvaluateName",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                        hidden: false,
                        width: "14%"
                    },
                    {
                        title: "Kết quả",
                            field: "result",
                        template: function (dataItem) {
                            return (dataItem.result ? dataItem.result.split("\n").join('<br>') : "");
                            },
                        width: '40%',
                            footerAttributes: {style: "display:none"},
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold",
                                translate:""
                        },
                        attributes: {style: "text-align:left;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Kết quả, lý do đánh giá"),
                        field: "#",
                        columns:[
                            {
                                title: "Đạt",
                                field: "evaluateOk",
                                width: '5%',
                                template: function (dataItem) {
                                    return "<input type='checkbox' ng-click='caller.selectEvaluate(dataItem, 1)' ng-model='dataItem.selectedOk'/>"
                                },
                                footerAttributes: {style: "display:none"},
                                headerAttributes: {
                                    style: "text-align:center; font-weight: bold",
                                    translate:""
                                },
                                attributes: {style: "text-align:center;"},
                            },{
                                title: "Không đạt",
                                field: "evaluateNotOk",
                                width: '5%',
                                template: function (dataItem) {
                                    return "<input type='checkbox' ng-click='caller.selectEvaluate(dataItem, 2)' ng-model='dataItem.selectedNotOk'/>"
                                },
                                footerAttributes: {style: "display:none"},
                                headerAttributes: {
                                    style: "text-align:center; font-weight: bold",
                                    translate:""
                                },
                                attributes: {style: "text-align:center;"},
                            },{
                                title: "Lý do",
                                field: "reason",
                                template : "<textarea class='k-textbox' kendoGridFocusable (keydown.enter)='$event.stopImmediatePropagation()' ng-model='dataItem.reason' rows='3' style='width: -webkit-fill-available; height: 100%'></textarea>",
                                width: '30%',
                                footerAttributes: {style: "display:none"},
                                headerAttributes: {
                                    style: "text-align:center; font-weight: bold",
                                    translate:""
                                },
                                attributes: {style: "text-align:left;"},//white-space:normal;
                            }
                        ],
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                        hidden: false,
                        width: "40%"

                    },
                    {
                        title: CommonService.translate("Đề xuất"),
                        field: "suggest",
                        template : "<textarea class='k-textbox' kendoGridFocusable (keydown.enter)='$event.stopImmediatePropagation()' ng-model='dataItem.suggest' rows='3' style='width: -webkit-fill-available; height: 100%'></textarea>",
                        headerAttributes: {
                            "class": "table-header-cell",style: "text-align: center; font-weight: bold;white-space:normal;"
                            },
                        attributes: {
                            "class": "table-cell",style: "text-align: left; "
                            },
                        hidden: false
                            , width: "16%"
                    }
                ]
            });
        }

        vm.selectEvaluate = function (dataItem, type) {
            if (type == 1) {
                dataItem.selectedNotOk = false;
            } else {
                dataItem.selectedOk = false;
            }
        }

        // đóng poup lỗi
        vm.closeErrImportPopUp = function closeErrImportPopUp() {
            modalInstanceImport.dismiss();
        }
        //------------------------
        vm.readOnlyReceiver = false;

        vm.saveByImportExcel = function () {

            kendo.ui.progress($(vm.modalBody), true);

            var listDto = $("#emulationEvaluationAddGrid").data('kendoGrid').dataSource._data;
            for (var i = 0; i < listDto.length; i++) {
                if (!listDto[i].selectedNotOk && !listDto[i].selectedOk) {
                    toastr.error(gettextCatalog.getString("Chưa đánh giá ") + listDto[i].sysGroupEvaluateName);
                    kendo.ui.progress($(vm.modalBody), false);
                    return;
                }
                if (listDto[i].selectedNotOk) {
                    if (!listDto[i].reason) {
                        toastr.error(gettextCatalog.getString("Chưa điền lý do khi đánh giá ") + listDto[i].sysGroupEvaluateName);
                        kendo.ui.progress($(vm.modalBody), false);
                        return;
                    }
                }
            };

            if(vm.typeCreate == 'add'){
                var listData = [];
                $("#emulationEvaluationAddGrid").data('kendoGrid').dataSource._data.forEach(function (i) {
                    if (i.selectedNotOk || i.selectedOk) {
                        i.sysUserId = Constant.user.vpsUserToken.sysUserId;
                        i.sysUserName = Constant.user.vpsUserToken.fullName;
                        i.sysGroupName = Constant.user.VpsUserInfo.groupNameLevel2;
                        if (i.selectedNotOk) {
                            i.evaluate = 'N';
                        } else {
                            i.evaluate = 'Y';
                        }
                        var currentDate = new Date();
                        currentDate.setDate(1);
                        currentDate.setMonth(currentDate.getMonth() - 1);
                        i.periodName = "Tháng " + (currentDate.getMonth() + 1) + "/" + currentDate.getFullYear();
                        i.dateEvaluate = ("0" + currentDate.getDate()).slice(-2) + "/" + ("0"+(currentDate.getMonth()+1)).slice(-2) + "/" + currentDate.getFullYear();
                        listData.push(i);
                    }
                });

                return Restangular.all("emulationEvaluationRsServiceRest/create").post(listData).then(function (res) {
                        kendo.ui.progress($(vm.modalBody), false);
                        if (res.error) {
                            toastr.error(res.error);
                            return;
                        }
                        toastr.success("Đánh giá thành công!");
                        vm.doSearch();
                        $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
                    }, function (err) {
                        kendo.ui.progress($(vm.modalBody), false);
                        toastr.error("Đánh giá thất bại");
                });
            }
        };


        vm.selectedSysGroup = false;
        vm.sysGroupOptions = {
            clearButton: false,
            dataTextField: "sysGroupEvaluateName",
            select: function(e) {
                vm.selectedSysGroup = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchForm.sysGroupEvaluateName = dataItem.sysGroupEvaluateName;
                vm.searchForm.sysGroupEvaluateId = dataItem.sysGroupEvaluateId;
            },
            // pageSize: 10,
            open: (e)=>{
                vm.selectedSysGroup = false;
            },
            dataSource: {
                serverFiltering: true,
                    transport: {
                    read: (options)=> {
                        vm.selectedSysGroup = false;
                        return Restangular.all("emulationEvaluationRsServiceRest/getDataSysGroupEvaluation").post({
                            pageSize: 15,
                            page: 1,
                            keySearch: $("#sysGroupId").val().trim()
                        }).then((response)=> {
                            options.success(response.data);
                    }).catch((err)=> {
                            console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
                    });
                    }
                }
            },
            headerTemplate: '<div class="dropdown-header row text-center k-widget k-header">' +
            '<p class="col-md-12 text-header-auto">Tên đơn vị</p>' +
            '</div>',
                template: '<div class="row" ><div style="padding-left:10px;width:auto;overflow: hidden"> #: data.sysGroupEvaluateName #</div> </div>',
                change: (e)=> {

                if (!vm.selectedSysGroup) {
                    vm.searchForm.sysGroupEvaluateId = null;
                    vm.searchForm.sysGroupEvaluateName = null;
                }
            },
            ignoreCase: false
    }

        vm.selectSysGroup = function(){
            var teamplateUrl = "ktnb/emulationEvaluation/sysGroupPopupSearch.html";
            var title = CommonService.translate("Lựa chọn đơn vị");
            var windowId = "SELECT_SYS_GROUP";
            vm.objSearchGSearch = {};
            fillDataSysGSearchTable(vm.objSearchGSearch);
            CommonService.populatePopupCreate(teamplateUrl, title, null, vm, windowId, null, '60%', '60%', 'changepopupSys');
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
                        var GridDestination = $("#sysGGridSearch").data("kendoGrid");
                        GridDestination.pager.element.hide();
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
                    url: Constant.BASE_SERVICE_URL + "emulationEvaluationRsServiceRest/getDataSysGroupEvaluation",
                        contentType: "application/json; charset=utf-8",
                        type: "POST"
                },
                parameterMap: (options, type) => {
                    dataSys.page = options.page;
                    dataSys.pageSize = options.pageSize;
                    return JSON.stringify(dataSys);
                }
            }
            },

            noRecords: true,
                columnMenu: false,
                messages: {
                noRecords : gettextCatalog.getString("<div style='margin:5px'>Không có kết quả hiển thị</div>")
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
                field: 'sysGroupEvaluateName',
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
                '			<i ng-click="caller.selectSysGroupItemSearch(dataItem)" class="fa fa-check color-green " aria-hidden="true"></i> ' +
                '		</a>'
                + '</div>',
                    headerAttributes: {
                style: "text-align:center;"
                }
            }]
        });
        }

        vm.selectSysGroupItemSearch = function(dataItem){
            vm.searchForm.sysGroupEvaluateName = dataItem.sysGroupEvaluateName;
            vm.searchForm.sysGroupEvaluateId = dataItem.sysGroupEvaluateId;
            CommonService.dismissPopup1();
        }

        vm.doSearchSysGroupSearchPopup = function(){
            var grid = vm.sysGGridSearch;
            if(grid){
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        }

        vm.checkDateTo = true;
        vm.checkErr1 = function(){
            var startDate = $('#fromYear').val();
            var endDate = $('#toYear').val();

            vm.errMessage1 = "";

            if (startDate !== "") {
                if (kendo.parseDate(startDate, "M/yyyy") == null) {
                    vm.errMessage1 = CommonService.translate('Thời gian từ không hợp lệ');
                    $("#fromYear").focus();
                    vm.checkDateTo = false;
                    return vm.errMessage1;
                } else if (kendo.parseDate(startDate, "M/yyyy").getFullYear() > 9999 || kendo.parseDate(startDate, "M/yyyy").getFullYear() < 1000) {
                    vm.errMessage1 = CommonService.translate('Thời gian từ không hợp lệ');
                    $("#fromYear").focus();
                    vm.checkDateTo = false;
                    return vm.errMessage1;
                } else if (endDate!= null && endDate != '' && kendo.parseDate(startDate, "M/yyyy") > kendo.parseDate(endDate, "M/yyyy")) {
                    vm.errMessage1 = CommonService.translate('Ngày tạo phải nhỏ hơn ngày đến');
                    $("#fromYear").focus();
                    vm.checkDateTo = false;
                    return vm.errMessage1;
                }else if (kendo.parseDate(startDate, "M/yyyy") <= kendo.parseDate(endDate, "M/yyyy")) {
                    vm.errMessage1 = "";
                    vm.errMessage2 = "";
                    vm.checkDateTo = true;
                    return vm.errMessage1;
                }else{
                    vm.errMessage1 = "";
                    vm.checkDateTo = true;
                    return vm.errMessage1;
                }
            } else {
                vm.errMessage1 = "";
                vm.checkDateTo = true;
                return vm.errMessage1;
            }
        }

        vm.checkDateFrom = true;
        vm.checkErr2 = function(){
            var startDate = $('#fromYear').val();
            var expireDate = $('#toYear').val();

            var curDate = new Date();

            vm.errMessage2 ="";

            if (expireDate !== "") {
                if (kendo.parseDate(expireDate, "M/yyyy") == null) {
                    vm.errMessage2 = CommonService.translate('Thời gian đến không hợp lệ');
                    $("#toYear").focus();
                    vm.checkDateFrom = false;
                    return vm.errMessage2;
                } else if (kendo.parseDate(expireDate, "M/yyyy").getFullYear() > 9999 || kendo.parseDate(expireDate, "M/yyyy").getFullYear() < 1000) {
                    vm.errMessage2 = CommonService.translate('Thời gian đến không hợp lệ');
                    $("#toYear").focus();
                    vm.checkDateFrom = false;
                    return vm.errMessage2;
                } else if (startDate!= null && startDate != '' &&kendo.parseDate(startDate, "M/yyyy") > kendo.parseDate(expireDate, "M/yyyy")) {
                    vm.errMessage2 = CommonService.translate('Ngày đến phải lớn hơn ngày từ');
                    $("#creImpNoteFromDate").focus();
                    vm.checkDateTo = false;
                    return vm.errMessage2;
                }
                else {
                    vm.errMessage2 = "";
                    vm.checkDateFrom = true;
                    return vm.errMessage2;
                }
            } else {
                vm.errMessage2 = "";
                vm.checkDateFrom = true;
                return vm.errMessage2;
            }
        }

        vm.exportexcel= function(){
            var obj = angular.copy(vm.searchForm);
            if (obj.fromYear) {
                obj.fromYear = "01/"+ obj.fromYear;
            }
            if (obj.toYear) {
                obj.toYear = "01/"+ obj.toYear;
            }
            // if(vm.sysTP.sysGroupId != null){
            //     obj.sysGroupEvaluateId = vm.sysTP.sysGroupId;
            // }
            obj.reportType="EXCEL";
            obj.reportName="DanhGiaPhongBanTCT";
            var date = kendo.toString(new Date((new Date()).getTime()),"dd-MM-yyyy");
            CommonService.exportReport(obj).then(
                function(data) {
                    var binarydata= new Blob([data],{ type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
                    kendo.saveAs({dataURI: binarydata, fileName: date + "_DanhGiaPhongBanTCT" + '.xlsx'});
                }, function(errResponse) {
                    toastr.error(CommonService.translate("Lỗi không export EXCEL được!"));
                });

        }

    }
})();
