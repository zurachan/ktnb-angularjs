(function () {
    'use strict';
    var controllerId = 'updateEvaluateResultController';

    angular.module('MetronicApp').controller(controllerId, updateEvaluateResultController);
    function updateEvaluateResultController($scope, $http,$timeout,$rootScope, $log, $filter,Constant,Restangular,CommonService,kendoConfig,$kWindow,RestEndpoint,gettextCatalog) {
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
            $("#ktnb_searchForm_updateEvaluateResultId").click(function (e) {
            });
            // fillDataTable([]);
            vm.String = CommonService.translate("Cập nhật kết quả thực hiện đánh giá")
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
            var grid = vm.updateEvaluateResultGrid;
            if (angular.isUndefined(column.hidden)) {
                grid.hideColumn(column);
            } else if (column.hidden) {
                grid.showColumn(column);
            } else {
                grid.hideColumn(column);
            }
        };

        vm.openEvaluate = false;
                Restangular.all("emulationEvaluationRsServiceRest/checkOpenDayUpdate").post({sysUserId: Constant.user.vpsUserToken.sysUserId}).then(function(d){
                    if (d == 1) {
                        vm.openEvaluate = true;
                    } else {
                        vm.openEvaluate = false;
                    }
                }, function(){
                    console.log('Có lỗi xảy ra khi check quyền tạo yêu cầu từ nhà cung cấp đến CNKT');
                });

        //
        var record = 0;
        vm.updateEvaluateResultGridOptions = kendoConfig.getGridOptions({
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
                        // '<button  type="button"  class="btn btn-qlk padding-search-right iconReview ng-scope" style="width: 180px" ng-click="vm.create()">Cập nhật kết quả </button>'+
                        '<button  type="button" ng-disabled="!vm.openEvaluate" class="btn btn-qlk padding-search-right iconReview ng-scope" style="width: 180px" ng-click="vm.create()">Cập nhật kết quả</button>' +
                        '<span style="color: red; margin-left: 10px;" ng-if="!vm.openEvaluate">Đã hết thời hạn đánh giá hoặc bạn không có quyền cập nhật. Vui lòng liên hệ Phòng Kế Hoạch</span>' +
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
                        url: Constant.BASE_SERVICE_URL + "emulationEvaluationRsServiceRest/doSearchEvaluateResult",
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
                    width: "10%"
                },{
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
                {   title: CommonService.translate("Người tạo"),
                    field: "sysUserName",
                    headerAttributes: {
                        "class": "table-header-cell",
                        style: "text-align: center; font-weight: bold;white-space:normal;"
                    },
                    attributes: {
                        "class": "table-cell",
                        style: "text-align: left; "
                    },
                    hidden: false,
                    width: "10%"

                },{   title: CommonService.translate("Ngày tạo"),
                    field: "created",
                    headerAttributes: {
                        "class": "table-header-cell",
                        style: "text-align: center; font-weight: bold;white-space:normal;"
                    },
                    attributes: {
                        "class": "table-cell",
                        style: "text-align: left; "
                    },
                    hidden: false,
                    width: "10%"

                }
            ]
        });

        //tim kiem
        vm.doSearch = doSearch;
        function doSearch() {
            var grid = vm.updateEvaluateResultGrid;
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

        //mo popup cap nhat ket qua
        vm.isCreateNew = false;
        vm.addForm = {};
        vm.create=function(){
            var teamplateUrl="ktnb/updateEvaluateResult/addEvaluateResultPopup.html";
            var title="Cập nhật kết quả ";
            var windowId="ADD_EVALUATE_RESULT";
            var currentDate = new Date();
            currentDate.setDate(1);
            currentDate.setMonth(currentDate.getMonth() - 1);
            var obj = {};
            obj.sysUserId = Constant.user.vpsUserToken.sysUserId;
            obj.periodName = "Tháng " + (currentDate.getMonth() + 1) + "/" + currentDate.getFullYear();
            Restangular.all("emulationEvaluationRsServiceRest/getDataEvaluateResult").post(obj).then(function(d){
                vm.addForm = d.data[0];
                if(vm.addForm.sysGroupEvaluateResultId == null){
                    vm.addForm.periodName = "Tháng " + (currentDate.getMonth() + 1) + "/" + currentDate.getFullYear();
                    vm.isCreateNew = true;
                }
                CommonService.populatePopupCreate(teamplateUrl,title,null,vm,windowId,true,'40%','40%',null);
            }, function(){
                console.log('Có lỗi xảy ra');
                toastr.warning("Bạn không có quyền cập nhật kết quả");
            });
        }

        vm.save= function(){
            if(vm.addForm.result == null || vm.addForm.result == ""){
                toastr.warning("Trường kết quả không được để trống!");
                return;
            }
            if(vm.isCreateNew == true) {
                var obj = {};
                obj.sysGroupEvaluateName = vm.addForm.sysGroupEvaluateName;
                obj.sysGroupEvaluateId = vm.addForm.sysGroupEvaluateId;
                obj.periodName = vm.addForm.periodName;
                var currentDate = new Date();
                currentDate.setDate(1);
                currentDate.setMonth(currentDate.getMonth() - 1);
                obj.periodDate = currentDate;
                obj.result = vm.addForm.result;
                obj.created = new Date();
                obj.createdBy = Constant.user.vpsUserToken.sysUserId;

                Restangular.all("emulationEvaluationRsServiceRest/add").post(obj).then(function(d){
                    if (result.error) {
                        toastr.error(errResponse.data.error);
                    }
                    toastr.success("Cập nhật kết quả thành công!");
                    vm.isCreateNew = false;
                    $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
                    doSearch();


                }, function(errResponse){
                    if (errResponse.status === 409) {
                        toastr.error(gettextCatalog.getString("Đã tồn tại !"));
                    } else {
                        toastr.error(errResponse.data.error);
                    }
                });
            } else{
                var obj = {};
                obj.sysGroupEvaluateResultId = vm.addForm.sysGroupEvaluateResultId;
                obj.result = vm.addForm.result;
                Restangular.all("emulationEvaluationRsServiceRest/update").post(obj).then(function(d){
                    if (result.error) {
                        toastr.error(errResponse.data.error);
                    }
                    toastr.success("Cập nhật kết quả thành công!");
                    $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
                    doSearch();


                }, function(errResponse){
                    if (errResponse.status === 409) {
                        toastr.error(gettextCatalog.getString("Đã tồn tại !"));
                    } else {
                        toastr.error(errResponse.data.error);
                    }
                });
            }
        }


        /*
		 * đóng Popup
		 */
        vm.cancel = function () {
            $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
        }



        // đóng poup lỗi
        vm.closeErrImportPopUp = function closeErrImportPopUp() {
            modalInstanceImport.dismiss();
        }
        //------------------------
        vm.readOnlyReceiver = false;


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

    }
})();
