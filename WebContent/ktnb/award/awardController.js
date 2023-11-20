(function () {
    'use strict';
    var controllerId = 'awardController';

    angular.module('MetronicApp').controller(controllerId, awardController);

    function awardController($scope, $http, $templateCache, $rootScope, $timeout, gettextCatalog,
                                         kendoConfig, $kWindow, $q, awardService,
                                         CommonService, htmlCommonService, PopupConst, Restangular, RestEndpoint, Constant) {
        var vm = this;
        vm.documentBody = $(".tab-content");
        vm.modalBody = $(".k-window");
        vm.searchForm = {};
        vm.insertForm = {};
        vm.listDelete = [];
        vm.listRemove = [{
            title: CommonService.translate("Thao tác"),
        },{
            title: "<input type='checkbox' id='checkalllistEx' name='gridchkselectall' ng-click='vm.chkSelectAllForExq();' ng-model='vm.chkAllForExReq' />",
        },{
            title: "Tháng/Năm",
        }];
        vm.listConvert = [
            {
                field: "status",
                data: {
                    0: 'Hết hiệu lực',
                    1: 'Hiệu lực',
                }
            },
            {
                field: "statusApproved",
                data: {
                    0: 'Chờ duyệt',
                    1: 'Đã duyệt',
                    2: 'Từ chối',
                }
            },
            {
                field: "statusKtnb",
                data: {
                    0: 'Chờ duyệt',
                    1: 'Đã duyệt',
                    2: 'Từ chối',
                }
            },
        ];

        vm.listAllViolation = [];
        vm.searchForm.status = 1;
        function convertStatus(status){
            switch (status) {
                case 0: return 'Chờ duyệt';
                case 1: return 'Đã duyệt';
                case 2: return 'Từ chối';
                default: return '';
            }
        }

        initForm();
        function initForm() {
            if ($rootScope.stringtile) {
                vm.String = CommonService.translate("Quản lý thưởng phạt ") + " > "+ CommonService.translate(" Danh mục đề xuất thưởng");
                vm.checkDate = new Date().getDate()>10 && new Date().getDate()<25;
                // vm.checkDate = false;
            }
            fillDataAward([]);
            checkPermissionAwardApprove();
            checkPermissionAwardApproveKtnb();
        }

        vm.listCheck = [];
        vm.chkAllForExReq = false;
        vm.chkSelectAllForExq = function(){
            console.log(vm.chkAllForExReq);
            if(vm.chkAllForExReq){
                vm.listCheck = [];
                var lst = vm.awardGrid.dataSource._data;
                for (let i = 0; i < lst.length; i++) {
                    if((lst[i].status==1&&(lst[i].statusApproved==null||lst[i].statusApproved==2))){
                        vm.listCheck.push(lst[i]);
                        lst[i].selected = true;
                    }
                }
            } else {
                vm.listCheck = [];
                var lst = vm.awardGrid.dataSource._data;
                for (let i = 0; i < lst.length; i++) {
                    lst[i].selected = false;
                }
            }
        }

        vm.handleCheckForExq = function(dataItem){
            if(dataItem.selected){
                vm.listCheck.push(dataItem);
            } else {
                for (let i = 0; i < vm.listCheck.length; i++) {
                    if(vm.listCheck[i].awardId===dataItem.awardId){
                        vm.listChecked.splice(i,1);
                        break;
                    }
                }
            }
        }

        function checkPermissionAwardApproveKtnb() {
            vm.isRoleApproveKtnb = false;
            let obj = {};
            obj.adResourceCode = "AWARD_KTNB";
            obj.operationCode = "APPROVED";
            CommonService.checkPermission(obj).then(
                function (resp) {
                    if (resp) {
                        vm.isRoleApproveKtnb = resp;
                    }
                },
                function (error) {
                    console.log(error);
                    toastr.error("Có lỗi xảy ra!");
                }
            )
            console.log(vm.isRoleApproveKtnb)
        }

        function checkPermissionAwardApprove() {
            vm.isRoleApprove = false;
            let obj = {};
            obj.adResourceCode = "AWARD";
            obj.operationCode = "APPROVED";
            CommonService.checkPermission(obj).then(
                function (resp) {
                    if (resp) {
                        vm.isRoleApprove = resp;
                    }
                },
                function (error) {
                    console.log(error);
                    toastr.error("Có lỗi xảy ra!");
                }
            )
            console.log(vm.isRoleApprove)
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
            var grid = $("#awardGrid").data("kendoGrid");
            if (grid) {
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        }

        var recordAward = 0;
        vm.countAward = 0;
        function fillDataAward(data) {
            vm.awardGridOptions = kendoConfig.getGridOptions({
                reorderable: true,
                autoBind: true,
                resizable: true,
                toolbar: [
                    {
                        name: "actions",
                        template:
                            '<div class=" pull-left ">' +
                            '<button  type="button" class="btn btn-qlk padding-search-right addQLK ng-scope" style="width: 120px" ng-click="vm.create()">Thêm mới'+
                            '</button>'+
                            '<button  type="button" class="btn btn-qlk padding-search-right TkQLK ng-scope" style="width: 120px" ng-click="vm.submitDone()">Trình ký' +
                            '</button>' +
                            '<h5 style="color: red" ng-if="vm.checkDate">Đã quá hạn đề xuất!</h5>' +
                            '</div>' +
                            '<div class="pull-right col-md-2">' +
                            '<div class="btn-group pull-right margin_top_button margin_right10">' +
                            '    <i data-toggle="dropdown" class="tooltip1" aria-expanded="false"><span class="tooltipArrow"></span><span class="tooltiptext" translate>Cài đặt</span><i class="fa fa-cog" aria-hidden="true"></i></i>' +
                            '    <i class="tooltip1 action-button excelQLK" ng-click="vm.exportExcelGrid()"  aria-expanded="false"><span class="tooltipArrow"></span><span class="tooltiptext" translate>Xuất Excel</span></i>' +
                            '    <div class="dropdown-menu hold-on-click dropdown-checkboxes" role="menu">' +
                            '    <label ng-repeat="column in vm.awardGrid.columns.slice(1,vm.awardGrid.columns.length)| filter: vm.gridColumnShowHideFilter">' +
                            '    <input type="checkbox" checked="column.hidden" ng-click="vm.showHideColumn(column)"> {{column.title}}' +
                            '    </label>' +
                            '    </div></div>' +
                            '</div>'
                    }
                ],
                dataBinding: function () {
                    recordAward = (this.dataSource.page() - 1) * this.dataSource.pageSize();
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
                            vm.countAward = response.total;
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
                            url: Constant.BASE_SERVICE_URL + "awardRsService/doSearch",
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
                        title : "<input type='checkbox' id='checkalllistEx' name='gridchkselectall' ng-click='vm.chkSelectAllForExq();' ng-model='vm.chkAllForExReq' />",
                        template: "<input type='checkbox'  id='childcheckInExReq' name='gridcheckbox' ng-click='vm.handleCheckForExq(dataItem)' ng-model='dataItem.selected' ng-if='dataItem.status==1&&(dataItem.statusApproved==2||dataItem.statusApproved==null)'/>",
                        width: "3%",
                        headerAttributes: {style:"text-align:center;"},
                        attributes:{style:"text-align:center;"}
                    },
                    {
                        title: CommonService.translate("TT"),
                        field: "stt",
                        template: function () {
                            return ++recordAward;
                        },
                        width: "3%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center;"
                        },
                    }, {
                        title: CommonService.translate("Mã đề xuất"),
                        field: 'code',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem => '<a ng-click="vm.view(dataItem)">'+dataItem.code+'</a>'
                    }, {
                        title: CommonService.translate("Tên đề xuất"),
                        field: 'name',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    }, {
                        title: CommonService.translate("Tháng/Năm"),
                        field: 'text',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem => dataItem.punishMonth+'/'+dataItem.punishYear
                    }, {
                        title: CommonService.translate("Đơn vị đề xuất thưởng"),
                        field: 'sysGroupName',
                        width: "20%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Tổng thưởng"),
                        field: 'money',
                        width: "20%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                        template: dataItem => dataItem.money==null||dataItem.money==undefined?'':formatToCurrency(dataItem.money),
                    },{
                        title: CommonService.translate("Lĩnh vực"),
                        field: 'field',
                        width: "15%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Người tạo"),
                        field: 'createByName',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    }, {
                        title: CommonService.translate("Ngày tạo"),
                        field: 'createDate',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },{
                        title: CommonService.translate("Trạng thái"),
                        field: 'status',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem => dataItem.status==1?'Hiệu lực':dataItem.status==0?'Hết hiệu lực':'',
                    }, {
                        title: CommonService.translate("Trạng thái đơn vị đề xuất duyệt"),
                        field: 'statusApproved',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem => convertStatus(dataItem.statusApproved),
                    }, {
                        title: CommonService.translate("Trạng thái P.PC&KSNB duyệt"),
                        field: 'statusKtnb',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem => convertStatus(dataItem.statusKtnb),
                    }, {
                        title: CommonService.translate("Thao tác"),
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate:""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem => /*chua set dk nut*/
                            '<div class="text-center #=assetLiquidateReqId#"">' +
                            '<button ng-if="dataItem.status==1&&(dataItem.statusApproved==2||dataItem.statusApproved==null)" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Cập nhật" translate ' +
                            'ng-click="vm.update(dataItem)" ><i class="fa fa-pencil ng-scope" aria-hidden="true" translate></i></button>'
                            +
                            '<button ng-if="dataItem.status==1&&dataItem.statusApproved==null" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Hết hiệu lực" translate ' +
                            'ng-click="vm.remove(dataItem)" > <i style="color:steelblue;" class="fa fa-trash ng-scope" aria-hidden="true"></i></button>'
                            +
                            '<button ng-if="dataItem.status==1&&dataItem.statusApproved==0&&vm.isRoleApprove" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Chỉ huy đơn vị duyệt" translate ' +
                            'ng-click="vm.approve(dataItem)" > <i style="color:green;" class="fa fa-check ng-scope" aria-hidden="true"></i></button>'
                            +
                            '<button ng-if="dataItem.status==1&&dataItem.statusKtnb==0&&vm.isRoleApproveKtnb" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="P.PC&KSNB duyệt" translate ' +
                            'ng-click="vm.approveKtnb(dataItem)" > <i style="color:black;" class="fa fa-check-square ng-scope" aria-hidden="true"></i></button>'
                            +
                            '</div>',

                        width: "10%",
                        field: ""
                    }
                ]
            });
        }

        vm.splitDate = function(){
            if(vm.searchForm.date == null || vm.searchForm.date == ""){
                vm.searchForm.monthPunish = null;
                vm.searchForm.yearPunish = null;
            }
            else {
                var date = vm.searchForm.date;
                var str = date.split('/');
                vm.searchForm.monthPunish = str[0];
                vm.searchForm.yearPunish = str[1];
            }
        }

        vm.isSelectSysGroupSearchDvg = false;
        vm.sysGroupSearchOptions = {
            clearButton: false,
            dataTextField: "name",
            placeholder: CommonService.translate("Nhập mã hoặc tên đơn vị"),
            dataValueField: "name",
            open: function (e) {
                vm.isSelectSysGroupSearchDvg = false;
            },
            select: function (e) {
                vm.isSelectSysGroupSearchDvg = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchForm.sysGroupName = dataItem.name;
                vm.searchForm.sysGroupId = dataItem.sysGroupId;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSysGroupSearchDvg) {
                        vm.searchForm.sysGroupName = null;
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
                        vm.isSelectSysGroupSearchDvg = false;
                        return Restangular.all("commonRsService/getSysGroupForAutoComplete").post(
                            {
                                keySearch: vm.searchForm.sysGroupName,
                                page: 1,
                                pageSize: 10,
                                groupLevelLst: [2,3]
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
                '<p class="col-md-6 text-header-auto border-right-ccc bold" translate>Mã đơn vị</p>' +
                '<p class="col-md-6 text-header-auto bold" translate>Tên đơn vị</p>' +
                '</div>' +
                '</div>',
            template: '<div class="row" ><div class="col-md-6 col-xs-5" style="float:left">#: data.code #</div><div  style="padding-left: 5px;width:auto;overflow: hidden"> #: data.name #</div> </div>',
        }

        var modal = null;

        vm.openPopupSysGroup = function(){
            var templateUrl = "ktnb/popup/popupCommonSearch.html";
            var title = CommonService.translate("Tìm kiếm đơn vị đề xuất thưởng");
            var windowId = "POPUP_SELECT_SYS_GROUP_RECEIVE";
            vm.placeHolder = CommonService.translate("Mã/tên đơn vị");
            CommonService.populatePopupCreate(templateUrl, title, null, vm, windowId, null, '60%', '50%', null);
            setTimeout(function () {
                modal = CommonService.getModalInstance1();
            }, 100);
            vm.commonPopupSearch = {};
            var api = "commonRsService/getSysGroupForAutoComplete";
            CommonService.fillDataPopupCommonSearch(api, vm.commonPopupSearch, sysGroupSearchColumns, vm);
        }

        var sysGroupSearchColumns = [
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
                title: CommonService.translate("Mã đơn vị"),
                field: 'code',
                width: "20%",
                headerAttributes: {
                    style: "text-align:center;", translate: "",
                },
                attributes: {
                    style: "text-align:left;"
                },
            }, {
                title: CommonService.translate("Tên đơn vị"),
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
                    '	   <i ng-click="caller.saveSelectSysGroupSearch(dataItem)" class="fa fa-check color-green" aria-hidden="true"></i> ' +
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

        vm.saveSelectSysGroupSearch = function (dataItem) {
            vm.searchForm.sysGroupId = dataItem.sysGroupId;
            vm.searchForm.sysGroupName = dataItem.name;
            modal.dismiss();
        }

        vm.isSelectSysUserSearchDvg = false;
        vm.sysUserSearchOptions = {
            clearButton: false,
            dataTextField: "name",
            placeholder: CommonService.translate("Nhập mã hoặc tên nhân viên"),
            dataValueField: "name",
            open: function (e) {
                vm.isSelectSysUserSearchDvg = false;
            },
            select: function (e) {
                vm.isSelectSysUserSearchDvg = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchForm.createByName = dataItem.fullName;
                vm.searchForm.createBy = dataItem.sysUserId;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSysUserSearchDvg) {
                        vm.searchForm.createByName = null;
                        vm.searchForm.createBy = null;
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
                        vm.isSelectSysUserSearchDvg = false;
                        return Restangular.all("commonRsService/getSysUserForAutoComplete").post(
                            {
                                keySearch: vm.searchForm.createByName,
                                page: 1,
                                pageSize: 10,
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
        vm.openPopupSysUser = function(){
            var templateUrl = "ktnb/popup/popupCommonSearch.html";
            var title = CommonService.translate("Tìm kiếm nhân viên");
            var windowId = "POPUP_SELECT_SYS_User";
            vm.placeHolder = CommonService.translate("Mã/tên nhân viên");
            CommonService.populatePopupCreate(templateUrl, title, null, vm, windowId, null, '60%', '50%', null);
            setTimeout(function () {
                modal = CommonService.getModalInstance1();
            }, 100);
            vm.commonPopupSearch = {};
            var api = "commonRsService/getSysUserForAutoComplete";
            CommonService.fillDataPopupCommonSearch(api, vm.commonPopupSearch, sysUserSearchColumns, vm);
        }

        var sysUserSearchColumns = [
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
                title: CommonService.translate("Chọn"),
                field: 'choose',
                width: "10%",
                template:
                    '<div class="text-center "> ' +
                    '	<a  type="button" class=" icon_table" uib-tooltip="Chọn" translate>' +
                    '	   <i ng-click="caller.saveSelectSysUserSearch(dataItem)" class="fa fa-check color-green" aria-hidden="true"></i> ' +
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

        vm.saveSelectSysUserSearch = function (dataItem) {
            vm.searchForm.createByName = dataItem.fullName;
            vm.searchForm.createBy = dataItem.sysUserId;
            modal.dismiss();
        }

        vm.create = function () {
            if (vm.checkDate) {
                toastr.error(CommonService.translate('Đã quá thời gian đề xuất!'));
                return;
            }
            vm.type = 'create';
            vm.insertForm = {};
            var templateUrl = 'ktnb/award/awardPopup.html';
            var title = CommonService.translate("Đề xuất thưởng đơn vị");
            vm.modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "90%", "70%", null, null);
            fillDataListViolation([]);
            fillDataListSg([]);
            var date = new Date();
            if(date.getDate()>=25){
                if (date.getMonth() === 0) {
                    vm.insertForm.punishMonth = 1;
                    vm.insertForm.punishYear = date.getFullYear() - 1;
                } else {
                    vm.insertForm.punishMonth = date.getMonth()+1;
                    vm.insertForm.punishYear = date.getFullYear();
                }
            } else {
                if (date.getMonth() === 0) {
                    vm.insertForm.punishMonth = 12;
                    vm.insertForm.punishYear = date.getFullYear() - 1;
                } else {
                    vm.insertForm.punishMonth = date.getMonth();
                    vm.insertForm.punishYear = date.getFullYear();
                }
            }
            Restangular.all("awardRsService/doSearch").post({code: 'DXT/'+date.getFullYear()+'/'}).then(function(res){
                if(res.data){
                    var sequence = res.data.length + 1;
                    vm.insertForm.code = 'DXT/'+date.getFullYear() + "/" + zeroPad(sequence,6);
                }
            },function (e) {
                console.log(e);
                toastr.error(CommonService.translate("Có lỗi xảy ra khi tự động gen code"))
            });
        }

        function fillDataListViolation(data) {
            var listViolation = 0;
            vm.listViolationOptions = kendoConfig.getGridOptions({
                autoBind: true,
                scrollable: true,
                resizable: true,
                dataBinding: function () {
                    listViolation = (this.dataSource.page() - 1) * this.dataSource.pageSize();
                },
                reorderable: true,
                columnMenu: false,
                noRecords: true,
                messages: {
                    noRecords: CommonService.translate("Không có kết quả hiển thị")
                },
                dataSource:{
                    data:data,
                    pageSize:10,
                },
                group: { field: "total", aggregates: [{ field: "total", aggregate: "sum" }]},
                pageable: {
                    refresh: false,
                    pageSizes: [5, 10, 15, 20, 25],
                    messages: {
                        display: "{0}-{1} của {2} kết quả",
                        itemsPerPage: "kết quả/trang",
                        empty: "Không có kết quả hiển thị"
                    }
                },
                toolbar: [
                    {
                        name: "actions",
                        template:
                            '<div class=" pull-left ">' +
                            '<button ng-if="caller.type===\'create\'||caller.type===\'update\'" type="button" class="btn btn-qlk padding-search-right addQLK ng-scope" ' +
                            'style="width: 120px" ng-click="caller.addListViolation()" translate>Thêm mới' +
                            '</button> '
                            +
                            '</div>'
                    }
                ],
                columns:[
                    {
                        title: CommonService.translate("STT"),
                        field: "stt",
                        template: function (dataItem) {
                            return ++listViolation;
                        },
                        width: "5%",
                        headerAttributes: { style: "text-align:center; font-weight: bold;", translate: "" },
                        attributes: {  style: "text-align:center;white-space:normal"},
                        editable: true,
                    },
                    // {
                    //     title: CommonService.translate("Loại lỗi"),
                    //     field: "type",
                    //     width: "10%",
                    //     headerAttributes: { style: "text-align:center; font-weight: bold;", translate: "" },
                    //     attributes: {  style: "text-align:center;white-space:normal"},
                    //     template: dataItem => dataItem.type==1?'Thông thường':dataItem.type==2?'Ít nghiêm trọng':dataItem.type==3?'Nghiêm trọng':dataItem.type==4?'Rất nghiêm trọng':'',
                    //     editable: true,
                    // },
                    {
                        title: CommonService.translate("Tên lỗi vi phạm"),
                        field: "name",
                        width: "20%",
                        headerAttributes: { style: "text-align:center; font-weight: bold;", translate: "" },
                        attributes: {  style: "text-align:left;white-space:normal"},
                        editable: true,
                    },
                    {
                        title: CommonService.translate("Đon vị xây dựng hành vi vi phạm"),
                        field: "groupName",
                        width: "20%",
                        headerAttributes: { style: "text-align:center; font-weight: bold; white-space: normal", translate: "" },
                        attributes: {  style: "text-align:left; white-space: normal;"},
                    },
                    {
                        title: CommonService.translate("Lĩnh vực"),
                        field: "field",
                        width: "15%",
                        headerAttributes: { style: "text-align:center; font-weight: bold; white-space: normal", translate: "" },
                        attributes: {  style: "text-align:left; white-space: normal;"},
                    },
                    {
                        title: CommonService.translate("Mức chế tài"),
                        field: "sanction",
                        width: "10%",
                        headerAttributes: { style: "text-align:center; font-weight: bold;", translate: "" },
                        attributes: {  style: "text-align:right;white-space:normal"},
                        editable: true,
                        template: dataItem => formatToCurrency(dataItem.sanction),
                    },
                    {
                        title: CommonService.translate("Số lượng lỗi"),
                        field: "numberViolation",
                        width: "10%",
                        headerAttributes: { style: "text-align:center; font-weight: bold;", translate: "" },
                        attributes: {  style: "text-align:right;white-space:normal"},
                        editable: true,
                    },
                    {
                        title: CommonService.translate("Tổng phạt"),
                        field: "total",
                        width: "10%",
                        headerAttributes: { style: "text-align:center; font-weight: bold;", translate: "" },
                        attributes: {  style: "text-align:right;white-space:normal"},
                        editable: true,
                        template: dataItem => formatToCurrency(dataItem.sanction*dataItem.numberViolation),
                    },
                    {
                        title: CommonService.translate("Thao tác"),
                        field: "TT",
                        width: "10%",
                        headerAttributes: { style: "text-align:center; font-weight: bold;", translate: "" },
                        attributes: {  style: "text-align:center;"},
                        template:dataItem=> '<div class="text-center">\n' +
                            '<button ng-if="caller.type===\'create\'||caller.type===\'update\'" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Xóa" translate=""  ng-click="caller.removeDataItem(dataItem,\'listWorkOrderDV\')" ng-show="caller.type!=\'detail\'">  \n' +
                            '<i style="color:steelblue;" class="fa fa-trash ng-scope" aria-hidden="true"></i>\n' +
                            '</button>\n' +
                            '</div>',
                        editable: true,
                    }
                ]
            });
        }

        function formatToCurrency(amount){
            return amount.toLocaleString('it-IT', {style : 'currency', currency : 'VND'});
        }

        function zeroPad(num, places) {
            var zero = places - num.toString().length + 1;
            return Array(+(zero > 0 && zero)).join("0") + num;
        };

        vm.modalAdd1 = null;
        vm.addListViolation = function(){
            var templateUrl = 'ktnb/award/violationListPopup.html';
            var title = CommonService.translate("Chọn lỗi vi phạm ");
            vm.listChecked = [];
            vm.formSearchListViolation.field = 'Xây lắp'
            vm.modalAdd1 = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "75%", null, null);
        }

        function fillDataListSg(data) {
            var listSg = 0;
            vm.listSgOptions = kendoConfig.getGridOptions({
                autoBind: true,
                scrollable: true,
                resizable: true,
                editable: false,
                dataSource:{
                    data:data,
                    pageSize:10
                },
                dataBinding: function () {
                    listSg = (this.dataSource.page() - 1) * this.dataSource.pageSize();
                },
                reorderable: true,
                columnMenu: false,
                noRecords: true,
                messages: {
                    noRecords: CommonService.translate("Không có kết quả hiển thị")
                },
                pageable: {
                    refresh: false,
                    pageSizes: [5, 10, 15, 20, 25],
                    messages: {
                        display: "{0}-{1} của {2} kết quả",
                        itemsPerPage: "kết quả/trang",
                        empty: "Không có kết quả hiển thị"
                    }
                },
                columns:[
                    {
                        title: CommonService.translate("STT"),
                        field: "stt",
                        template: function () {  return ++listSg;},
                        width: "5%",
                        headerAttributes: { style: "text-align:center; font-weight: bold;", translate: "" },
                        attributes: {  style: "text-align:center;"},
                    },
                    {
                        title: CommonService.translate("Tên nhân viên"),
                        field: "fullName",
                        width: "20%",
                        headerAttributes: { style: "text-align:center; font-weight: bold;", translate: "" },
                        attributes: {  style: "text-align:center;"},
                    },
                    {
                        title: CommonService.translate("Mã nhân viên"),
                        field: "employeeCode",
                        width: "20%",
                        headerAttributes: { style: "text-align:center; font-weight: bold;", translate: "" },
                        attributes: {  style: "text-align:center;"},
                    },
                    {
                        title: CommonService.translate("Email"),
                        field: "email",
                        width: "20%",
                        headerAttributes: { style: "text-align:center; font-weight: bold;", translate: "" },
                        attributes: {  style: "text-align:center;"},
                    },
                    {
                        title: CommonService.translate("Tiền thưởng"),
                        field: "money",
                        width: "20%",
                        headerAttributes: { style: "text-align:center; font-weight: bold;", translate: "" },
                        attributes: {  style: "text-align:center;"},
                        template: dataItem => dataItem.money==null||dataItem.money==undefined?'':formatToCurrency(dataItem.money),
                    },
                    {
                        title: CommonService.translate("Thao tác"),
                        field: "TT",
                        width: "5%",
                        headerAttributes: { style: "text-align:center; font-weight: bold;", translate: "" },
                        attributes: {  style: "text-align:center;"},
                        template:dataItem=> '<div class="text-center">\n' +
                            '<button ng-if="caller.type===\'create\'||caller.type===\'update\'" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Xóa" translate=""  ng-click="caller.removeDataSg(dataItem)" ng-show="caller.type!=\'detail\'"> \n' +
                            '<i style="color:steelblue;" class="fa fa-trash ng-scope" aria-hidden="true"></i>\n' +
                            '</button>\n' +
                            '</div>'
                    }
                ]
            });
        }

        var recordListViolation = 0;
        vm.countListViolation = 0;
        vm.formSearchListViolation = {};
        vm.listViolationsOptions = kendoConfig.getGridOptions({
            autoBind: true,
            scrollable: true,
            resizable: true,
            dataBinding: function () {
                recordListViolation = (this.dataSource.page() - 1) * this.dataSource.pageSize();
            },
            reorderable: true,
            dataSource: {
                serverPaging:true,
                schema:{
                    errors: function (response) {
                        if (response.error) {
                            toastr.error(response.error);
                        }
                        return response.error;
                    },
                    total: function (response) {
                        vm.countListViolation = response.total;
                        return response.total;
                    },
                    data: function (response) {
                        return response.data;
                    }
                },
                transport:{
                    read:{
                        url:Constant.BASE_SERVICE_URL + "violationRsService/doSearchForAward",
                        type:"POST",
                        contentType: "application/json; charset=utf-8",
                    },
                    parameterMap: function (options, type) {
                        // vm.formSearchListViolation.sysGroupId = $rootScope.$root.authenticatedUser.VpsUserInfo.sysGroupId;
                        vm.formSearchListViolation.page = options.page;
                        vm.formSearchListViolation.pageSize = options.pageSize;
                        vm.formSearchListViolation.punishMonth = vm.insertForm.punishMonth;
                        vm.formSearchListViolation.punishYear = vm.insertForm.punishYear;
                        return JSON.stringify(vm.formSearchListViolation);
                    },
                    pageSize: 10,
                },
                pageSize: 10,
            },
            columnMenu: false,
            noRecords: true,
            messages: {
                noRecords: CommonService.translate("Không có kết quả hiển thị")
            },
            pageable: {
                refresh: false,
                pageSizes: [5, 10, 15, 20, 25],
                messages: {
                    display: "{0}-{1} của {2} kết quả",
                    itemsPerPage: "kết quả/trang",
                    empty: "Không có kết quả hiển thị"
                }
            },
            columns:[
                {
                    title: CommonService.translate("Lựa chọn"),
                    field: "checked",
                    width: "2%",
                    selectable: true ,
                    template: dataItem => "<input type='checkbox' name='checkboxViolationList' class='checkbox' ng-click='caller.onChange(dataItem)'/>",
                    headerAttributes: { style: "text-align:center; font-weight: bold;", translate: "" },
                    attributes: {  style: "text-align:center;"},
                },
                {
                    title: CommonService.translate("STT"),
                    field: "stt",
                    template: function () { return ++recordListViolation;},
                    width: "3%",
                    headerAttributes: { style: "text-align:center; font-weight: bold;", translate: "" },
                    attributes: {  style: "text-align:center;"},
                },
                {
                    title: CommonService.translate("Tên lỗi vi phạm"),
                    field: "name",
                    width: "20%",
                    headerAttributes: { style: "text-align:center; font-weight: bold;", translate: "" },
                    attributes: {  style: "text-align:left; white-space: normal;"},
                },
                {
                    title: CommonService.translate("Đon vị xây dựng hành vi vi phạm"),
                    field: "groupName",
                    width: "20%",
                    headerAttributes: { style: "text-align:center; font-weight: bold; white-space: normal", translate: "" },
                    attributes: {  style: "text-align:left; white-space: normal;"},
                },
                {
                    title: CommonService.translate("Lĩnh vực"),
                    field: "field",
                    width: "15%",
                    headerAttributes: { style: "text-align:center; font-weight: bold; white-space: normal", translate: "" },
                    attributes: {  style: "text-align:left; white-space: normal;"},
                },
                // {
                //     title: CommonService.translate("Phân loại lỗi"),
                //     field: "type",
                //     width: "20%",
                //     headerAttributes: { style: "text-align:center; font-weight: bold;", translate: "" },
                //     attributes: {  style: "text-align:center; white-space: normal;"},
                //     template: dataItem => dataItem.type==1?'Thông thường':dataItem.type==2?'Ít nghiêm trọng':dataItem.type==3?'Nghiêm trọng':dataItem.type==4?'Rất nghiêm trọng':'',
                // },
                {
                    title: CommonService.translate("Mức chế tài"),
                    field: "sanction",
                    width: "20%",
                    headerAttributes: { style: "text-align:center; font-weight: bold;", translate: "" },
                    attributes: {  style: "text-align:right; white-space: normal"},
                    template: dataItem => formatToCurrency(dataItem.sanction),
                },
                {
                    title: CommonService.translate("Số lượng lỗi"),
                    field: "numberViolation",
                    width: "20%",
                    headerAttributes: { style: "text-align:center; font-weight: bold;", translate: "" },
                    attributes: {  style: "text-align:right; white-space: normal"},
                },
                {
                    title: CommonService.translate("Tổng phạt"),
                    field: "",
                    width: "20%",
                    headerAttributes: { style: "text-align:center; font-weight: bold;", translate: "" },
                    attributes: {  style: "text-align:right; white-space: normal"},
                    template: dataItem => formatToCurrency(dataItem.sanction*dataItem.numberViolation),
                },
            ]
        });

        vm.onChange = function(dataItem) {
            var flag = false;
            if (vm.listChecked.length === 0  ){
                vm.listChecked.push(dataItem);
            }else {
                for (var i = 0; i < vm.listChecked.length; i++){
                    if (dataItem.violationId == vm.listChecked[i].violationId){
                        vm.listChecked.splice(i, 1);
                        flag = true;
                    }
                }
                if (flag == false){
                    vm.listChecked.push(dataItem);
                }
            }
        };

        vm.doSearchListViolation = function () {
            if(vm.formSearchListViolation.field==null){
                toastr.error("Bắt buộc chọn lĩnh vực!");
                return;
            }
            var grid = $("#listVio").data("kendoGrid");
            if (grid) {
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        }

        var listRemoveViolation = [];

        vm.removeDataItem =function (dataItem) {
            $('#listViolation').data('kendoGrid').dataSource.remove(dataItem);
            // calculateMoney();
            listRemoveViolation.push(dataItem);
        };

        vm.saveTempViolationList = function () {
            var data_ = $("#listViolation").data("kendoGrid").dataSource._data;
            if (data_.length > 0){
                for (var i = 0; i < vm.listChecked.length; i++){
                    var flag = true;
                    for (var j = 0; j < data_.length; j++){
                        if (vm.listChecked[i].violationId === data_[j].violationId ){
                            toastr.warning(CommonService.translate(vm.listChecked[i].name  +"đã tồn tại!"));
                            flag = false;
                        }
                    }
                    if (flag == true ){
                        $("#listViolation").data("kendoGrid").dataSource.add(vm.listChecked[i]);
                    }
                }
            } else {
                $("#listViolation").data("kendoGrid").dataSource.data(vm.listChecked);
            }

            $("#listViolation").data("kendoGrid").refresh();
            // if($("#listSg").data("kendoGrid").dataSource._data.length!==0) calculateMoney();
            vm.cancel();
        }

        vm.cancel = function(){
            if (vm.modalAdd1!==null){
                vm.modalAdd1.dismiss();
                vm.modalAdd1 = null;
            } else {
                vm.modalAdd.dismiss();
            }
        }

        vm.getExcelTemplate = function (type) {
            $http({
                url: Constant.BASE_SERVICE_URL + RestEndpoint.AWARD_SERVICE_URL +"/exportFileBM",
                method: "POST",
                data: {},
                headers: {
                    'Content-type': 'application/json'
                },
                responseType: 'arraybuffer'
            }).success(function (data, status, headers, config) {
                saveFile(data,"Bieu_mau_danh_sach_don_vi_de_xuat_thuong.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
            }).error(function (data, status, headers, config) {
                toastr.error("Có lỗi xảy ra! Vui lòng thử lại sau.");
            });
        };

        function saveFile(data, filename, type) {
            var file = new Blob([data], {type: type});
            if (window.navigator.msSaveOrOpenBlob)
                window.navigator.msSaveOrOpenBlob(file, filename);
            else {
                var a = document.createElement("a"),
                    url = URL.createObjectURL(file);
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                setTimeout(function() {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 0);
            }
        }

        var modalAdd
        var modalInstanceImport;
        vm.submit = function(){
            vm.dataImport = [];
            var element = $("#capNhatId");
            kendo.ui.progress(element, true);
            // if($("#listViolation").data("kendoGrid").dataSource._data.length===0){
            //     toastr.warning(CommonService.translate("Vui lòng chọn danh sách lỗi vi phạm trước."));
            //     return;
            // }
            if(vm.insertForm.field == null || vm.insertForm.field == ''){
                toastr.warning(CommonService.translate('Vui lòng chọn lĩnh vực trước.'));
                return;
            }
            if ($("#fileS")[0].files[0] == null) {
                toastr.warning(CommonService.translate("Bạn chưa chọn file để import"));
                return;
            }
            if ($("#fileS")[0].files[0].name.split('.').pop() != 'xls' && $("#fileS")[0].files[0].name.split('.').pop() != 'xlsx') {
                toastr.warning(CommonService.translate("Sai định dạng file"));
                $("#fileS").replaceWith($("#fileS").val('').clone(true));
                return;
            }
            var formData = new FormData();
            formData.append('multipartFile', $('#fileS')[0].files[0]);
            var pathImport = "awardRsService/importSysGroup";
            return $.ajax({
                url: Constant.BASE_SERVICE_URL + pathImport,
                type: "POST",
                data: formData,
                enctype: 'multipart/form-data',
                processData: false,
                contentType: false,
                cache: false,
                success: function (data) {
                    if (data.length === 0) {
                        vm.disableSubmit = false;
                        toastr.warning("File import không có nội dung");
                        kendo.ui.progress(element, false);
                    } else if (data.length === 1 && !!data[data.length - 1].errorList && data[data.length - 1].errorList.length > 0) {
                        kendo.ui.progress(element, false);
                        vm.lstErrImport = data[data.length - 1].errorList;
                        vm.objectErr = data[data.length - 1];
                        var templateUrl = "ktnb/popup/importResultPopUp.html";
                        var title = "Kết quả Import";
                        var windowId = "ERR_IMPORT";
                        vm.disableSubmit = false;
                        CommonService.populatePopupCreate(templateUrl, title, vm.lstErrImport, vm, windowId, false, '80%', '420px');
                        // modalInstanceImport = CommonService.createCustomPopupWithEvent(templateUrl, title, vm.lstErrImport, null, "80%", "420px", initDataErrImportFunction, null);

                        setTimeout(function () {
                            modalInstanceImport = CommonService.getModalInstance1();
                        }, 100);
                        fillDataImportErrTable(vm.lstErrImport);
                    } else {
                        var date = new Date();
                        if(date.getMonth()===0){
                            var punishMonth = 12;
                            var punishYear = date.getFullYear()-1;
                        } else {
                            var punishMonth = date.getMonth();
                            var punishYear = date.getFullYear();
                        }
                        // var listViolationId = [];
                        // for (let i = 0; i < $('#listViolation').data("kendoGrid").dataSource._data.length; i++) {
                        //     listViolationId.push($('#listViolation').data("kendoGrid").dataSource._data[i].violationId);
                        // }
                        Restangular.all('reportPunishmentRsService/doSearchReport1').post({punishMonth: punishMonth, punishYear: punishYear, field: vm.insertForm.field }).then(function(res){
                            var listSgCheck = res.data;
                            var realData = [];
                            for (let i = 0; i < data.length; i++) {
                                var count = 0;
                                for (let j = 0; j < listSgCheck.length; j++) {
                                    if(listSgCheck[j].sysUserIdReceive===data[i].sysUserId){
                                        toastr.warning(CommonService.translate('Nhân viên '+listSgCheck[j].sysUserNameReceive+' đã bị phạt trong tháng ở lĩnh vực '+ vm.insertForm.field + ', hệ thống sẽ tự động loại khỏi danh sách được thưởng!'));
                                        break;
                                    } else {
                                        count++;
                                    }
                                }
                                if(count===listSgCheck.length){
                                    realData.push(data[i]);
                                }
                            }
                            kendo.ui.progress(element, false);
                            vm.dataImport = realData;
                            var listVio = $('#listViolation').data("kendoGrid").dataSource._data;
                            var sum = 0;
                            for (let i = 0; i < listVio.length; i++) {
                                sum+=listVio[i].numberViolation * listVio[i].sanction;
                            }
                            for (let i = 0; i < vm.dataImport.length; i++) {
                                vm.dataImport[i].money = 100000; //fix cung 100.000VND
                            }
                            $('#listSg').data("kendoGrid").dataSource.data(vm.dataImport);
                        });
                    }
                    $("#fileS").val("");
                    $scope.$apply();
                }
            });
        };

        var countSg = 0;

        function fillDataImportErrTable(data) {
            vm.importResultGridOptions = kendoConfig.getGridOptions({
                autoBind: true,
                resizable: true,
                dataSource: data,
                noRecords: true,
                columnMenu: false,
                messages: {
                    noRecords: CommonService.translate("Không có kết quả hiển thị")
                },
                pageSize: 10,
                pageable: {
                    pageSize: 10,
                    refresh: false,
                    pageSizes: [10, 15, 20, 25],
                    messages: {
                        display: "{0}-{1} của {2} kết quả",
                        itemsPerPage: "kết quả/trang",
                        empty: "Không có kết quả hiển thị"
                    }
                },
                columns: [
                    {
                        title: "TT",
                        field: "stt",
                        template: function (dataItem) {
                            return $("#importResultGrid").data("kendoGrid").dataSource.indexOf(dataItem) + 1;
                        },
                        width: 70,
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        attributes: {
                            style: "text-align:center;"
                        },
                    }, {
                        title: "Dòng lỗi",
                        field: 'lineError',
                        width: 100,
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        attributes: {
                            style: "text-align:center;"
                        }
                    }, {
                        title: "Cột lỗi",
                        field: 'columnError',
                        width: 100,
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        attributes: {
                            style: "text-align:center;"
                        }
                    }, {
                        title: "Nội dung lỗi",
                        field: 'detailError',
                        width: 250,
                        headerAttributes: {
                            style: "text-align:center;"
                        },
                        attributes: {
                            style: "text-align:left;"
                        }
                    }
                ]
            });
        }

        vm.exportExcelErr = function () {
            Restangular.all("fileservice/exportExcelError").post(vm.objectErr).then(function (d) {
                var data = d.plain();
                window.location = Constant.BASE_SERVICE_URL + "fileservice/downloadFileATTT?" + data.fileName;
            }).catch(function () {
                toastr.error(gettextCatalog.getString("Lỗi khi export!"));
                return;
            });
        };
        // đóng poup lỗi
        vm.closeErrImportPopUp = function closeErrImportPopUp() {
            modalInstanceImport.dismiss();
        }

        var listSgRemove = [];
        vm.removeDataSg = function(dataItem){
            $("#listSg").data("kendoGrid").dataSource.remove(dataItem);
            listSgRemove.push(dataItem);
            vm.dataImport = $("#listSg").data("kendoGrid").dataSource._data;
            $("#listSg").data("kendoGrid").refresh();
            // calculateMoney();
        }

        vm.save = function(type){
            if(vm.insertForm.name == null || vm.insertForm.name == ''){
                toastr.error(CommonService.translate('Tên đề xuất thưởng không được để trống.'));
                return;
            }
            if(vm.insertForm.field == null || vm.insertForm.field == ''){
                toastr.error(CommonService.translate('Lĩnh vực không được để trống.'));
                return;
            }
            // if($("#listViolation").data("kendoGrid").dataSource._data.length===0){
            //     toastr.error(CommonService.translate('Danh sách lỗi vi phạm không được để trống.'));
            //     return;
            // }
            if($("#listSg").data("kendoGrid").dataSource._data.length===0){
                toastr.error(CommonService.translate('Danh sách cá nhân đề xuất thưởng không được để trống.'));
                return;
            }
            var listAllViolation = [];
            Restangular.all("violationRsService/doSearchForAward").post({field: vm.insertForm.field, punishYear:vm.insertForm.punishYear, punishMonth:vm.insertForm.punishMonth}).then(function(res){
                listAllViolation=angular.copy(res.data);
                var totalPhat = 0;
                var totalThuong = 0;
                for (let i = 0; i < listAllViolation.length; i++) {
                    totalPhat+=listAllViolation[i].sanction*listAllViolation.numberViolation;
                }
                for (let i = 0; i < $("#listSg").data("kendoGrid").dataSource._data.length; i++) {
                    totalThuong+=$("#listSg").data("kendoGrid").dataSource._data[i].money;
                }
                if(totalPhat<totalThuong){
                    toastr.error(CommonService.translate('Tổng thưởng đang lớn hơn tổng phạt.'));
                    return;
                }
                if(type==='new'){
                    kendo.ui.progress($('.k-window'), true);
                    vm.insertForm.listDetail = listAllViolation;
                    vm.insertForm.listSg = $("#listSg").data("kendoGrid").dataSource._data;
                    Restangular.all("awardRsService/save").post(vm.insertForm).then(function(res){
                        toastr.success(CommonService.translate("Thêm mới bản ghi thành công!"));
                        vm.doSearch();
                        vm.cancel();
                        kendo.ui.progress($('.k-window'), false);
                    },function (error) {
                        console.log(error);
                        toastr.error(CommonService.translate("Có lỗi xảy ra!"));
                        kendo.ui.progress($('.k-window'), false);
                    });
                }
                if(type==='update'){
                    kendo.ui.progress($('.k-window'), true);
                    vm.insertForm.listDetail = listAllViolation;
                    vm.insertForm.listSg = $("#listSg").data("kendoGrid").dataSource._data;
                    vm.insertForm.listDetailRemove = listRemoveViolation;
                    vm.insertForm.listSgRemove = listSgRemove;
                    Restangular.all("awardRsService/update").post(vm.insertForm).then(function(res){
                        toastr.success(CommonService.translate("Chỉnh sửa bản ghi thành công!"));
                        vm.doSearch();
                        vm.cancel();
                        kendo.ui.progress($('.k-window'), false);
                    },function (error) {
                        console.log(error);
                        toastr.error(CommonService.translate("Có lỗi xảy ra!"));
                        kendo.ui.progress($('.k-window'), false);
                    });
                }
            });

        }

        vm.view = function (dataItem) {
            vm.type = 'view';
            vm.detailForm = angular.copy(dataItem);
            Restangular.all('awardRsService/getDetailByAwardId').post(vm.detailForm.awardId).then(function(res){
                Restangular.all('awardRsService/getSysGroupByAwardId').post(vm.detailForm.awardId).then(function(data){
                    var templateUrl = 'ktnb/award/awardDetailPopup.html';
                    var title = CommonService.translate("Chi tiết đề xuất thưởng");
                    vm.modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "60%", null, null);
                    fillDataListViolation(res.data);
                    fillDataListSg(data.data);
                }, function (er){
                    toastr.error(CommonService.translate('Có lỗi xảy ra.'));
                });
            }, function(err){
                toastr.error(CommonService.translate('Có lỗi xảy ra.'));
            });
        }

        vm.approve = function(dataItem) {
            vm.type = 'approve';
            vm.detailForm = angular.copy(dataItem);
            Restangular.all('awardRsService/getDetailByAwardId').post(vm.detailForm.awardId).then(function(res){
                Restangular.all('awardRsService/getSysGroupByAwardId').post(vm.detailForm.awardId).then(function(data){
                    var templateUrl = 'ktnb/award/awardDetailPopup.html';
                    var title = CommonService.translate("Duyệt đề xuất thưởng");
                    vm.modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "60%", null, null);
                    fillDataListViolation(res.data);
                    fillDataListSg(data.data);
                }, function (er){
                    toastr.error(CommonService.translate('Có lỗi xảy ra.'));
                });
            }, function(err){
                toastr.error(CommonService.translate('Có lỗi xảy ra.'));
            });
        }

        vm.approveAward = function(){
            kendo.ui.progress($('.k-window'), true);
            Restangular.all('awardRsService/approveAward').post(vm.detailForm).then(function(res){
                toastr.success(CommonService.translate("Xác nhận duyệt thành công !!!"));
                vm.doSearch();
                vm.cancel();
                vm.cancel();
                kendo.ui.progress($('.k-window'), false);
            }, function(error){
                console.log(error);
                kendo.ui.progress($('.k-window'), false);
                toastr.error(CommonService.translate("Có lỗi xảy ra!"));
            });
        }

        vm.reject = function(){
            var templateUrl = 'ktnb/award/awardRejectPopup.html';
            var title = CommonService.translate("Lý do từ chối");
            vm.typeReject = 'DV';
            vm.modalAdd1 = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "40%", null, null);
        }

        vm.rejectAward = function(){
            if(vm.detailForm.rejectReason == null){
                toastr.error(CommonService.translate("lý do từ chối không được để trống!"));
                return;
            }
            kendo.ui.progress($('.k-window'), true);
            Restangular.all('awardRsService/rejectAward').post(vm.detailForm).then(function(res){
                toastr.success(CommonService.translate("Xác nhận từ chối thành công !!!"));
                vm.doSearch();
                vm.cancel();
                kendo.ui.progress($('.k-window'), false);
                vm.cancel();
            }, function(error){
                console.log(error);
                kendo.ui.progress($('.k-window'), false);
                toastr.error(CommonService.translate("Có lỗi xảy ra!"));
            });
        }

        vm.approveKtnb = function(dataItem) {
            vm.type = 'approveKtnb';
            vm.detailForm = angular.copy(dataItem);
            Restangular.all('awardRsService/getDetailByAwardId').post(vm.detailForm.awardId).then(function(res){
                Restangular.all('awardRsService/getSysGroupByAwardId').post(vm.detailForm.awardId).then(function(data){
                    var templateUrl = 'ktnb/award/awardDetailPopup.html';
                    var title = CommonService.translate("Duyệt đề xuất thưởng");
                    vm.modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "60%", null, null);
                    fillDataListViolation(res.data);
                    fillDataListSg(data.data);
                }, function (er){
                    toastr.error(CommonService.translate('Có lỗi xảy ra.'));
                });
            }, function(err){
                toastr.error(CommonService.translate('Có lỗi xảy ra.'));
            });
        }

        vm.approveAwardKtnb = function(){
            kendo.ui.progress($('.k-window'), true);
            Restangular.all('awardRsService/approveAwardKtnb').post(vm.detailForm).then(function(res){
                toastr.success(CommonService.translate("Xác nhận duyệt thành công !!!"));
                vm.doSearch();
                vm.cancel();
                vm.cancel();
                kendo.ui.progress($('.k-window'), false);
            }, function(error){
                console.log(error);
                kendo.ui.progress($('.k-window'), false);
                toastr.error(CommonService.translate("Có lỗi xảy ra!"));
            });
        }

        vm.rejectKtnb = function(){
            var templateUrl = 'ktnb/award/awardRejectPopup.html';
            var title = CommonService.translate("Lý do từ chối");
            vm.typeReject = 'KTNB';
            vm.modalAdd1 = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "40%", null, null);
        }

        vm.rejectAwardKtnb = function(){
            if(vm.detailForm.rejectKtnbReason == null){
                toastr.error(CommonService.translate("lý do từ chối không được để trống!"));
                return;
            }
            kendo.ui.progress($('.k-window'), true);
            Restangular.all('awardRsService/rejectAwardKtnb').post(vm.detailForm).then(function(res){
                toastr.success(CommonService.translate("Xác nhận từ chối thành công !!!"));
                vm.doSearch();
                vm.cancel();
                kendo.ui.progress($('.k-window'), false);
                vm.cancel();
            }, function(error){
                console.log(error);
                kendo.ui.progress($('.k-window'), false);
                toastr.error(CommonService.translate("Có lỗi xảy ra!"));
            });
        }

        vm.remove = function(dataItem){
            confirm(CommonService.translate("Hết hiệu lực bản ghi?"), function (){
                var obj  = angular.copy(dataItem);
                kendo.ui.progress($('.k-window'), true);
                Restangular.all('awardRsService/remove').post(obj).then(function(res){
                    kendo.ui.progress($('.k-window'), false);
                    toastr.success(CommonService.translate("Hết hiệu lực thành công !!!"));
                    vm.doSearch();
                },function (error) {
                    console.log(error);
                    toastr.error(CommonService.translate("Có lỗi xảy ra!"));
                })
            });
        }

        vm.update = function(dataItem) {
            vm.type = 'update';
            vm.insertForm = angular.copy(dataItem);
            listRemoveViolation = [];
            listSgRemove = [];
            Restangular.all('awardRsService/getDetailByAwardId').post(vm.insertForm.awardId).then(function(res){
                Restangular.all('awardRsService/getSysGroupByAwardId').post(vm.insertForm.awardId).then(function(data){
                    var templateUrl = 'ktnb/award/awardPopup.html';
                    var title = CommonService.translate("Chỉnh sửa đề xuất thưởng");
                    vm.modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "60%", null, null);
                    fillDataListViolation(res.data);
                    fillDataListSg(data.data);
                }, function (er){
                    toastr.error(CommonService.translate('Có lỗi xảy ra.'));
                });
            }, function(err){
                toastr.error(CommonService.translate('Có lỗi xảy ra.'));
            });
        }

        // function calculateMoney(){
        //     var sumPhat = 0;
        //     var listVio = $("#listViolation").data("kendoGrid").dataSource._data;
        //     if(listVio.length===0){
        //         for (let i = 0; i < $("#listSg").data("kendoGrid").dataSource._data.length; i++) {
        //             $("#listSg").data("kendoGrid").dataSource._data[i].money = 0;
        //         }
        //     }
        //     else for (let i = 0; i < listVio.length; i++) {
        //         sumPhat += listVio[i].sanction* listVio[i].numberViolation;
        //     }
        //     for (let i = 0; i < $("#listSg").data("kendoGrid").dataSource._data.length; i++) {
        //         $("#listSg").data("kendoGrid").dataSource._data[i].money = sumPhat/$("#listSg").data("kendoGrid").dataSource._data.length;
        //     }
        //     $("#listSg").data("kendoGrid").refresh();
        // }

        vm.submitDone = function(){
            if (vm.checkDate) {
                toastr.error(CommonService.translate('Đã quá thời gian đề xuất!'));
                return;
            }
            for (let i = 0; i < vm.listCheck.length; i++) {
                if(vm.listCheck[i].status==0||vm.listCheck[i].statusApproved==0||vm.listCheck[i].statusApproved==1){
                    toastr.warning(CommonService.translate('Đề xuất có mã '+vm.listCheck[i].code+' không đúng trạng thái trình ký, hệ thóng sẽ tự động loại trừ khoi danh sách duyệt.'));
                    vm.listCheck.splice(i,1);
                }
            }
            if(vm.listCheck.length==0){
                toastr.warning("Yêu cầu chọn ít nhất 1 bản ghi đúng trạng thái trình ký!");
                return;
            }
            confirm(CommonService.translate("Bạn có chắc chắn muốn trình ký các bản ghi này?"), function () {
                kendo.ui.progress($('.tab-content'), true);
                Restangular.all("awardRsService/submitDone").post(vm.listCheck).then(function (res) {
                    toastr.success(CommonService.translate("Trình ký thành công!"));
                    kendo.ui.progress($('.tab-content'), false);
                    vm.doSearch();
                    vm.cancel();
                    $("#checkalllistEx").click();
                }, function (error) {
                    console.log(error);
                    toastr.error(CommonService.translate("Có lỗi xảy ra!"));
                    kendo.ui.progress($('.tab-content'), false);
                    $("#checkalllistEx").click();
                });
            });
        }

        vm.clear = function(type){
            if(type==='keySearch'){
                vm.searchForm.keySearch = null;
            } else if(type==='sysUserSearch'){
                vm.searchForm.createBy = null;
                vm.searchForm.createByName = null;
            } else if(type==='sysGroupSearch'){
                vm.searchForm.sysGroupId = null;
                vm.searchForm.sysGroupName = null;
            } else if(type==='sanction'){
                vm.searchForm.fromSanction = null;
                vm.searchForm.toSanction = null;
            }
        }

        vm.exportExcelGrid =function () {
            kendo.ui.progress(vm.documentBody, true);
            var obj = angular.copy(vm.searchForm);
            obj.page = null;
            obj.pageSize = null;
            awardService.doSearch(obj).then(function (d) {
                kendo.ui.progress(vm.documentBody, false);
                var data = d.data;
                CommonService.exportFile(vm.awardGrid, data, vm.listRemove, vm.listConvert, CommonService.translate("Danh sách đề xuất thưởng"));
            });
        }

        vm.showHideColumn = function (column) {
            if (angular.isUndefined(column.hidden)) {
                vm.awardGrid.hideColumn(column);
            } else if (column.hidden) {
                vm.awardGrid.showColumn(column);
            } else {
                vm.awardGrid.hideColumn(column);
            }
        };
    }
})();
