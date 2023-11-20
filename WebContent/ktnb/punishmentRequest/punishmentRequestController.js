(function () {
    'use strict';
    var controllerId = 'punishmentRequestController';

    angular.module('MetronicApp').controller(controllerId, punishmentRequestController);

    function punishmentRequestController($scope, $http, $templateCache, $rootScope, $timeout, gettextCatalog,
                                 kendoConfig, $kWindow, $q, punishmentRequestService,
                                 CommonService, htmlCommonService, PopupConst, Restangular, RestEndpoint, Constant) {
        var vm = this;
        vm.documentBody = $("#punishmentRequest");
        vm.modalBody = $(".k-window");
        vm.searchForm = {status: 1, statusApprove: 0};
        vm.insertForm = {};
        vm.listDelete = [];
        vm.listRemove = [{
            title: CommonService.translate("Thao tác"),
        },{
            title: "<input type='checkbox' id='checkalllistEx' name='gridchkselectall' ng-click='vm.chkSelectAllForExq();' ng-model='vm.chkAllForExReq' />",
        }];
        vm.listConvert = [
            {
                field: "status",
                data: {
                    0: 'Hết hiệu lực',
                    1: 'Hiệu lực',
                    2: 'Dự thảo'
                }
            },
            {
                field: "statusApprove",
                data: {
                    0: 'Chờ duyệt',
                    1: 'Đã duyệt',
                    2: 'Từ chối',
                }
            },
        ];

        vm.listType = [
            {value: 0, name: 'Chờ duyệt'},
            {value: 1, name: 'Đã duyệt'},
            {value: 2, name: 'Từ chối'},
        ]

        vm.listMonth = [];
        vm.listMonth.push({value: null, name: '---Chọn---'});
        for (let i = 1; i < 13; i++) {
            vm.listMonth.push({value: i, name: 'Tháng ' + i});
        }

        vm.listYear = [];
        vm.listYear.push({value: null, name: '---Chọn---'});
        for (let i = new Date().getFullYear(); i > new Date().getFullYear() - 14; i--) {
            vm.listYear.push({value: i, name: 'Năm ' + i});
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

        vm.getStatusApprove = function(value) {
            if (value.statusApprove == 0) {
                return 'Chờ duyệt';
            }
            if (value.statusApprove == 1 && value.isReserve == 0) {
                return 'Đã duyệt';
            }
            if (value.statusApprove == 1 && value.isReserve > 0) {
                return 'Đã duyệt(Bảo lưu)';
            }
            if (value.statusApprove == 2) {
                return 'Chờ duyệt';
            }
            return '';
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

        function getTypeStatusApprove(value) {
            switch (value) {
                case 0:
                    return 'Chờ duyệt';
                    break;
                case 1:
                    return 'Đã duyệt';
                    break;
                case 2:
                    return 'Từ chối';
                    break;
                default:
                    return '';
                    break;
            }
        }

        function checkPermissionPunishmentApprove() {
            vm.isRoleApprove = false;
            let obj = {};
            obj.adResourceCode = "PUNISHMENT_REQUEST";
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


        initForm();

        function initForm() {
            if ($rootScope.stringtile) {
                vm.String = CommonService.translate("Quản lý thưởng phạt ") + " > " + CommonService.translate(" Đề xuất áp chế tài đích danh cá nhân");
                vm.checkDate = new Date().getDate()>10 && new Date().getDate()<25;
                // vm.checkDate = false;
            }
            fillDataPunishmentRequest([]);
            checkPermissionPunishmentApprove();
        }

        vm.doSearch = function () {
            var grid = $("#punishmentRequestGrid").data("kendoGrid");
            if (grid) {
                grid.dataSource.query({
                    page: vm.currentPage,
                    pageSize: vm.currentPageSize
                });
            }
        }

        vm.isOkToApprove = function(dataItem){
            var sysUserId = Constant.user.VpsUserInfo.sysUserId;
            for (let i = 0; i < dataItem.listSysUserApprove.length; i++) {
                if(sysUserId == dataItem.listSysUserApprove[i].sysUserId){
                    return true;
                }
            }
            return false;
        }

        var recordPunishmentRequest = 0;
        vm.countPunishmentRequest = 0;

        vm.listCheck = [];
        vm.chkAllForExReq = false;
        vm.chkSelectAllForExq = function(){
            console.log(vm.chkAllForExReq);
            if(vm.chkAllForExReq){
                vm.listCheck = [];
                var lst = vm.punishmentRequestGrid.dataSource._data;
                for (let i = 0; i < lst.length; i++) {
                    if((lst[i].status==2&&(lst[i].statusApprove==null||lst[i].statusApprove==2)&&lst[i].createBy==Constant.user.VpsUserInfo.sysUserId)||(vm.isRoleApprove&&lst[i].status==2&&lst[i].statusApprove==0&&vm.isOkToApprove(lst[i]))){
                        vm.listCheck.push(lst[i]);
                        lst[i].selected = true;
                    }
                }
            } else {
                vm.listCheck = [];
                var lst = vm.punishmentRequestGrid.dataSource._data;
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
                   if(vm.listCheck[i].punishmentRequestId===dataItem.punishmentRequestId){
                       vm.listChecked.splice(i,1);
                       break;
                   }
                }
            }
        }

        function fillDataPunishmentRequest(data) {
            vm.punishmentRequestGridOptions = kendoConfig.getGridOptions({
                reorderable: true,
                autoBind: true,
                resizable: true,
                toolbar: [
                    {
                        name: "actions",
                        template:
                            '<div class=" pull-left ">' +
                            '<button  type="button" class="btn btn-qlk padding-search-right addQLK ng-scope" style="width: 120px" ng-click="vm.create()">Thêm mới' +
                            '</button>' +
                            '<button  type="button" class="btn btn-qlk padding-search-right TkQLK ng-scope" style="width: 120px" ng-click="vm.submitDone()">Trình ký' +
                            '</button>' +
                            '<button  type="button" class="btn btn-qlk padding-search-right saveQLK ng-scope" style="width: 120px" ng-click="vm.approveList()">Duyệt' +
                            '</button>' +
                            '<button ng-if="vm.checkResend()" type="button" class="btn btn-qlk padding-search-right saveQLK ng-scope" style="width: 120px" ng-click="vm.resendApproveList()">Resend mail' +
                            '</button>' +
                            '<h5 style="color: red" ng-if="vm.checkDate">Đã quá hạn đề xuất!</h5>' +
                            '</div>' +
                            '<div class="form-group col-md-10">\n' +
                            '                    <div>\n' +
                            '                        <file-input list-file-type="xls,xlsx" model="caller.dataList"\n' +
                            '                                    size="104857600" caller="caller" input-id="fileChange"\n' +
                            '                                    model-label="File import"\n' +
                            '                                    msg="Không được để trống file"></file-input>\n' +
                            '\n' +
                            '                    </div>\n' +
                            '                    <button class="col-md-2" ng-click="vm.submitImportNewTargets()"\n' +
                            '                            id="upfile">Tải lên\n' +
                            '                    </button>\n' +
                            '                    <div class="col-md-1" id="modalLoading"\n' +
                            '                         style="display: none; margin-left: 30px; height: 20px;"></div>\n' +
                            '\n' +
                            '                    <div class="form-group col-md-4" align="right" id="hiden11">\n' +
                            '                        <a id="templateLink" href="" ng-click="vm.getExcelTemplate()">Tải\n' +
                            '                            biểu mẫu</a>\n' +
                            '                    </div>\n' +
                            '                </div>\n' +
                            '<div class="pull-right col-md-2">' +
                            '<div class="btn-group pull-right margin_top_button margin_right10">' +
                            '    <i data-toggle="dropdown" class="tooltip1" aria-expanded="false"><span class="tooltipArrow"></span><span class="tooltiptext" translate>Cài đặt</span><i class="fa fa-cog" aria-hidden="true"></i></i>' +
                            '    <i class="tooltip1 action-button excelQLK" ng-click="vm.exportExcelGrid()"  aria-expanded="false"><span class="tooltipArrow"></span><span class="tooltiptext" translate>Xuất Excel</span></i>' +
                            '    <div class="dropdown-menu hold-on-click dropdown-checkboxes" role="menu">' +
                            '    <label ng-repeat="column in vm.punishmentRequestGrid.columns.slice(1,vm.punishmentRequestGrid.columns.length)| filter: vm.gridColumnShowHideFilter">' +
                            '    <input type="checkbox" checked="column.hidden" ng-click="vm.showHideColumn(column)"> {{column.title}}' +
                            '    </label>' +
                            '    </div></div>' +
                            '</div>' +
                            '                <div class="form-group col-md-5" align="right" id="hiden12">\n' +
                            '                    <i style="color: gray; margin-right:  50px;">Dung lượng <= 100MB, định dạng xls,xlsx</i>\n' +
                            '                </div>'
                    }
                ],
                dataBinding: function () {
                    recordPunishmentRequest = (this.dataSource.page() - 1) * this.dataSource.pageSize();
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
                            vm.countPunishmentRequest = response.total;
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
                            url: Constant.BASE_SERVICE_URL + "punishmentRequestRsService/doSearch",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, type) {
                            vm.searchForm.page = options.page;
                            vm.currentPage = options.page;
                            vm.searchForm.pageSize = options.pageSize;
                            vm.currentPageSize = options.pageSize;
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
                    pageSizes: [10, 15, 20, 25, 50, 100, 200],
                    messages: {
                        display: CommonService.translate("{0}-{1} của {2} kết quả"),
                        itemsPerPage: CommonService.translate("kết quả/trang"),
                        empty: CommonService.translate("Không có kết quả hiển thị")
                    }
                },
                columns: [
                    {
                        title : "<input type='checkbox' id='checkalllistEx' name='gridchkselectall' ng-click='vm.chkSelectAllForExq();' ng-model='vm.chkAllForExReq' />",
                        template: "<input type='checkbox'  id='childcheckInExReq' name='gridcheckbox' ng-click='vm.handleCheckForExq(dataItem)' ng-model='dataItem.selected' ng-if='(dataItem.status==2&&vm.showButtonEdit(dataItem)&&(dataItem.statusApprove==null||dataItem.statusApprove==2))||(vm.isRoleApprove&&dataItem.status==2&&dataItem.statusApprove==0&&vm.isOkToApprove(dataItem))'/>",
                        width: "3%",
                        headerAttributes: {style:"text-align:center;"},
                        attributes:{style:"text-align:center;"}
                    },
                    {
                        title: CommonService.translate("TT"),
                        field: "stt",
                        template: function () {
                            return ++recordPunishmentRequest;
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
                        title: CommonService.translate("Tháng xét"),
                        field: 'punishMonth',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    }, {
                        title: CommonService.translate("Năm xét"),
                        field: 'punishYear',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    }, {
                        title: CommonService.translate("Mã đề xuất áp chế tài"),
                        field: 'code',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem => '<a ng-click="vm.view(dataItem)">' + dataItem.code + '</a>'
                    }, {
                        title: CommonService.translate("Đơn vị áp chế tài"),
                        field: 'sysGroupNameRequest',
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
                        title: CommonService.translate("Cá nhân vi phạm"),
                        field: 'sysUserNameReceive',
                        width: "15%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                    }, {
                        title: CommonService.translate("Tổng tiền khấu trừ"),
                        field: 'toSanction',
                        width: "15%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:right; white-space:normal"
                        },
                        template: dataItem => formatToCurrency(dataItem.toSanction)
                    }, {
                        title: CommonService.translate("Người tạo"),
                        field: 'text',
                        width: "15%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                    }, {
                        title: CommonService.translate("Hiệu lực"),
                        field: 'status',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem => dataItem.status == 1 ? 'Hiệu lực' : dataItem.status == 0 ? 'Hết hiệu lực' : dataItem.status == 2 ? 'Dự thảo' : '',
                    }, {
                        title: CommonService.translate("Trạng thái đơn vị ký duyệt"),
                        field: 'statusApprove',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem => vm.getStatusApprove(dataItem),
                    }, {
                        title: CommonService.translate("Thao tác"),
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem =>
                            '<div class="text-center #=assetLiquidateReqId#"">' +
                            '<button ng-if="dataItem.status==2&&(dataItem.statusApprove==2||dataItem.statusApprove==null)&&vm.showButtonEdit(dataItem)" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Cập nhật" translate ' +
                            'ng-click="vm.update(dataItem)" ><i class="fa fa-pencil ng-scope" aria-hidden="true" translate></i></button>'
                            +
                            // '<button ng-if="dataItem.status==1&&(dataItem.statusApprove==2||dataItem.statusApprove==null)" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Trình ký" translate ' +
                            // 'ng-click="vm.submitDone(dataItem)" ><i class="fa fa-save ng-scope" aria-hidden="true" translate></i></button>'
                            // +
                            '<button ng-if="vm.isRoleApprove&&dataItem.status==2&&dataItem.statusApprove==0&&vm.isOkToApprove(dataItem)" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Duyệt" translate ' +
                            'ng-click="vm.approve(dataItem)" > <i style="color:green;" class="fa fa-check ng-scope" aria-hidden="true"></i></button>'
                            +
                            '<button ng-if="vm.isRoleApprove&&dataItem.status==2&&dataItem.statusApprove==0&&vm.isOkToApprove(dataItem)" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Từ chối" translate ' +
                            'ng-click="vm.reject(dataItem)" > <i style="color:darkred;" class="fa fa-times ng-scope" aria-hidden="true"></i></button>'
                            +
                            '<button ng-if="dataItem.isReserve==1&&!vm.checkDate" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Bảo lưu" translate ' +
                            'ng-click="vm.view(dataItem)" > <i style="color:red;" class="fa fa-flag ng-scope" aria-hidden="true"></i></button>'
                            +
                            '<button ng-if="dataItem.status==2&&dataItem.statusApprove!=1&&vm.showButtonEdit(dataItem)" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Hết hiệu lực" translate ' +
                            'ng-click="vm.remove(dataItem)" > <i style="color:steelblue;" class="fa fa-trash ng-scope" aria-hidden="true"></i></button>'
                            +
                            '</div>',

                        width: "10%",
                        field: ""
                    }
                ]
            });
        }

        vm.isSelectSysGroupSearchDvg = false;
        vm.sysGroupSearchOptions = {

            clearButton: false,
            dataTextField: "name",
            placeholder: CommonService.translate("Nhập mã hoặc tên nhân viên"),
            dataValueField: "name",
            open: function (e) {
                vm.isSelectSysGroupSearchDvg = false;
            },
            select: function (e) {
                vm.isSelectSysGroupSearchDvg = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchForm.sysUserNameReceive = dataItem.fullName;
                vm.searchForm.sysUserIdReceive = dataItem.sysUserId;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSysGroupSearchDvg) {
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
                        vm.isSelectSysGroupSearchDvg = false;
                        return Restangular.all("commonRsService/getSysUserForAutoComplete").post(
                            {
                                keySearch: vm.searchForm.sysUserNameReceive,
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
        vm.openPopupSysGroup = function () {
            var templateUrl = "ktnb/popup/popupCommonSearch.html";
            var title = CommonService.translate("Tìm kiếm cá nhân vi phạm");
            var windowId = "POPUP_SELECT_SYS_GROUP_RECEIVE";
            vm.placeHolder = CommonService.translate("Mã/tên nhân viên");
            CommonService.populatePopupCreate(templateUrl, title, null, vm, windowId, null, '60%', '50%', null);
            setTimeout(function () {
                modal = CommonService.getModalInstance1();
            }, 100);
            vm.commonPopupSearch = {};
            var api = "commonRsService/getSysUserForAutoComplete";
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
            vm.searchForm.sysUserIdReceive = dataItem.sysUserId;
            vm.searchForm.sysUserNameReceive = dataItem.fullName;
            modal.dismiss();
        }

        vm.create = function () {
            if (vm.checkDate) {
                toastr.error(CommonService.translate('Đã quá thời gian đề xuất!'));
                return;
            }
            vm.type = 'create';
            vm.insertForm = {};
            var templateUrl = 'ktnb/punishmentRequest/punishmentRequestPopup.html';
            var title = CommonService.translate("Đề xuất cá nhân bị áp chế tài");
            vm.modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "90%", "70%", null, null);
            fillDataListViolation([]);
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
            vm.insertForm.date = vm.insertForm.punishMonth+'/'+vm.insertForm.punishYear;
            vm.insertForm.sysGroupIdRequest = $rootScope.$root.authenticatedUser.VpsUserInfo.sysGroupId;
            vm.insertForm.sysGroupNameRequest = $rootScope.$root.authenticatedUser.VpsUserInfo.groupNameLevel2;
            Restangular.all("punishmentRequestRsService/doSearch").post({code: 'CTP/' + date.getFullYear() + '/'}).then(function (res) {
                if (res.data) {
                    var sequence = res.data.length + 1;
                    vm.insertForm.code = 'CTP/' + date.getFullYear() + "/" + zeroPad(sequence, 6);
                }
            }, function (e) {
                console.log(e);
                toastr.error(CommonService.translate("Có lỗi xảy ra khi tự động gen code"))
            });
        }

        function zeroPad(num, places) {
            var zero = places - num.toString().length + 1;
            return Array(+(zero > 0 && zero)).join("0") + num;
        };

        vm.isSelectSysGroupInsertDvg = false;
        vm.sysUserInsertOptions = {
            clearButton: false,
            dataTextField: "name",
            placeholder: CommonService.translate("Nhập mã hoặc tên nhân viên"),
            dataValueField: "name",
            open: function (e) {
                vm.isSelectSysGroupInsertDvg = false;
            },
            select: function (e) {
                vm.isSelectSysGroupInsertDvg = true;
                var dataItem = this.dataItem(e.item.index());
                vm.insertForm.sysUserNameReceive = dataItem.fullName;
                vm.insertForm.sysUserIdReceive = dataItem.sysUserId;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSysGroupInsertDvg) {
                        vm.insertForm.sysUserNameReceive = null;
                        vm.insertForm.sysUserIdReceive = null;
                    }
                }, 100);
            },
            pageSize: 10,
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        vm.isSelectSysGroupInsertDvg = false;
                        return Restangular.all("commonRsService/getSysUserForAutoComplete").post(
                            {
                                keySearch: vm.insertForm.sysUserNameReceive,
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
        vm.openPopupSysUserInsert = function () {
            var templateUrl = "ktnb/popup/popupCommonSearch.html";
            var title = CommonService.translate("Tìm kiếm cá nhân vi phạm");
            var windowId = "POPUP_SELECT_SYS_GROUP_RECEIVE";
            vm.placeHolder = CommonService.translate("Mã/tên cá nhân vi phạm");
            CommonService.populatePopupCreate(templateUrl, title, null, vm, windowId, null, '60%', '50%', null);
            setTimeout(function () {
                modal = CommonService.getModalInstance1();
            }, 100);
            vm.commonPopupSearch = {};
            var api = "commonRsService/getSysUserForAutoComplete";
            CommonService.fillDataPopupCommonSearch(api, vm.commonPopupSearch, sysUserInsertColumns, vm);
        }

        var sysUserInsertColumns = [
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
                    '	   <i ng-click="caller.saveSelectSysUserInsert(dataItem)" class="fa fa-check color-green" aria-hidden="true"></i> ' +
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

        vm.saveSelectSysUserInsert = function (dataItem) {
            vm.insertForm.sysUserNameReceive = dataItem.fullName;
            vm.insertForm.sysUserIdReceive = dataItem.sysUserId;
            modal.dismiss();
        }

        function fillDataListViolation(data) {
            var listViolation = 0;
            vm.listViolationOptions = kendoConfig.getGridOptions({
                autoBind: true,
                scrollable: true,
                resizable: true,
                dataBinding: function () {
                    listViolation = (this.dataSource.page() - 1) * this.dataSource.pageSize();

                    // var gridData = grid.dataSource.data();
                    // if (gridData.length > 0) {
                    //     for (var i = 0; i < gridData.length; i++) {
                    //         if (gridData[i].numberViolation == undefined) {
                    //             gridData[i].numberViolation = 1;
                    //         }
                    //         if (gridData[i].numberViolation != undefined) {
                    //             gridData[i].total = gridData[i].numberViolation * gridData[i].sanction;
                    //         } else {
                    //             gridData[i].total = 0;
                    //         }
                    //     }
                    // }
                },
                reorderable: true,
                columnMenu: false,
                noRecords: true,
                messages: {
                    noRecords: CommonService.translate("Không có kết quả hiển thị")
                },
                dataSource: {
                    data: data,
                    pageSize: 10,
                },
                save: function (e) {
                    if (e.values.hasOwnProperty("sanction") ||
                        e.values.hasOwnProperty("numberViolation")) {
                        var totalSpan = e.container.closest("TR").find(".totalSpan");
                        if (e.values.hasOwnProperty("sanction")) {
                            totalSpan.html(formatToCurrency(e.values.sanction * e.model.numberViolation));
                        } else {
                            totalSpan.html(formatToCurrency(e.values.numberViolation * e.model.sanction));
                        }
                    }
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
                toolbar: [
                    {
                        name: "actions",
                        template:
                            '<div class=" pull-left ">' +
                            '<button ng-if="caller.type!==\'view\'" type="button" class="btn btn-qlk padding-search-right addQLK ng-scope" ' +
                            'style="width: 120px" ng-click="caller.addListViolation()" translate>Thêm mới' +
                            '</button> ' +
                            '</div>'
                    }
                ],
                columns: [
                    {
                        title: CommonService.translate("STT"),
                        field: "stt",
                        template: function (dataItem) {
                            return ++listViolation;
                        },
                        width: "5%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold;white-space:normal",
                            translate: ""
                        },
                        attributes: {style: "text-align:center;white-space:normal"},
                        editable: true,
                    },
                    {
                        title: CommonService.translate("Tên lỗi vi phạm"),
                        field: "name",
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold;white-space:normal",
                            translate: ""
                        },
                        attributes: {style: "text-align:left;white-space:normal"},
                        editable: true,
                    },
                    {
                        title: CommonService.translate("Mô tả hành vi vi phạm"),
                        field: "description",
                        width: "20%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold;white-space:normal",
                            translate: ""
                        },
                        attributes: {style: "text-align:left;white-space:normal"},
                        editable: true,
                    },
                    {
                        title: CommonService.translate("Đơn vị tính lỗi"),
                        field: "unitType",
                        width: "8%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold;white-space:normal",
                            translate: ""
                        },
                        attributes: {style: "text-align:left;white-space:normal"},
                        editable: true,
                    },
                    // {
                    //     title: CommonService.translate("Đơn vị xây dựng vi phạm"),
                    //     field: "groupName",
                    //     width: "12%",
                    //     headerAttributes: {
                    //         style: "text-align:center; font-weight: bold;white-space:normal",
                    //         translate: ""
                    //     },
                    //     attributes: {style: "text-align:left;white-space:normal"},
                    //     editable: true,
                    // },
                    {
                        title: CommonService.translate("Lĩnh vực"),
                        field: "field",
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold;white-space:normal",
                            translate: ""
                        },
                        attributes: {style: "text-align:center;white-space:normal"},
                        editable: true,
                    },
                    {
                        title: CommonService.translate("Mức chế tài"),
                        field: "sanction",
                        width: "13%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold;white-space:normal",
                            translate: ""
                        },
                        attributes: {style: "text-align:right;white-space:normal"},
                        editable: true,
                        template: dataItem => formatToCurrency(dataItem.sanction),
                    },
                    {
                        title: CommonService.translate("Số lượng lỗi"),
                        field: "numberViolation",
                        width: "8%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold;white-space:normal",
                            translate: ""
                        },
                        attributes: {style: "text-align:right;white-space:normal"},
                        editable: vm.type === 'view',
                    },
                    {
                        title: CommonService.translate("Tổng tiền vi phạm"),
                        field: "total",
                        width: "13%",
                        headerAttributes: {style: "text-align:center; font-weight: bold;", translate: ""},
                        attributes: {style: "text-align:right;white-space:normal"},
                        template: dataItem => {
                            var x = formatToCurrency(dataItem.numberViolation * dataItem.sanction);
                            return "<span class='totalSpan'>" + x + "</span>"
                        },
                        editable: true,
                    },
                    {
                        title: CommonService.translate("Trạng thái cá nhân vi phạm duyệt"),
                        field: "status",
                        width: "15%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold;white-space:normal",
                            translate: ""
                        },
                        attributes: {style: "text-align:center;white-space:normal"},
                        template: dataItem => getTypeStatusApprove(dataItem.status),
                        editable: true,
                        hidden: vm.type !== 'view',
                    },
                    {
                        title: CommonService.translate("Lí do cá nhân vi phạm từ chối"),
                        field: "rejectDescription",
                        width: "15%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold;white-space:normal",
                            translate: ""
                        },
                        attributes: {style: "text-align:left;white-space:normal"},
                        editable: true,
                        hidden: vm.type !== 'view',
                    },
                    {
                        title: CommonService.translate("File từ chối"),
                        field: "TT",
                        width: "7%",
                        headerAttributes: {style: "text-align:center; font-weight: bold;white-space:normal", translate: ""},
                        attributes: {style: "text-align:center;"},
                        template: dataItem => '<div class="text-center">\n' +
                            '<button ng-if="dataItem.listReject.length!=0" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Tải file cá nhân từ chối" translate ' +
                            'ng-click="caller.downloadFileType(\'reject\',dataItem)" > <i style="color:darkred;" class="fa fa-download ng-scope" aria-hidden="true"></i></button>'
                            +
                            '</div>',
                        editable: true,
                        hidden: vm.type === 'update'
                    },
                    {
                        title: CommonService.translate("Bảo lưu"),
                        field: "reserve",
                        width: "6%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold;white-space:normal",
                            translate: ""
                        },
                        attributes: {style: "text-align:center;white-space:normal"},
                        template: dataItem => '<input disabled type="checkbox" ng-checked="dataItem.reserve==1">',
                        editable: true,
                        hidden: vm.type !== 'view',
                    },
                    {
                        title: CommonService.translate("File bảo lưu"),
                        field: "TT",
                        width: "7%",
                        headerAttributes: {style: "text-align:center; font-weight: bold;white-space:normal", translate: ""},
                        attributes: {style: "text-align:center;"},
                        template: dataItem => '<div class="text-center">\n' +
                            '<button ng-if="dataItem.listReserve.length!=0" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Tải file đơn vị bảo lưu" translate ' +
                            'ng-click="caller.downloadFileType(\'reserve\',dataItem)" > <i style="color:darkblue;" class="fa fa-download ng-scope" aria-hidden="true"></i></button>'
                            +
                            '</div>',
                        editable: true,
                        hidden: vm.type === 'update',
                    },
                    {
                        title: CommonService.translate("Trạng thái P.PC&KSNB duyệt"),
                        field: "statusKtnb",
                        width: "15%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold;white-space:normal",
                            translate: ""
                        },
                        attributes: {style: "text-align:center;white-space:normal"},
                        template: dataItem => getTypeStatusApprove(dataItem.statusKtnb),
                        editable: true,
                        hidden: vm.type !== 'view',
                    },
                    {
                        title: CommonService.translate("Lí do P.PC&KSNB từ chối"),
                        field: "rejectKtnbDescription",
                        width: "15%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold;white-space:normal",
                            translate: ""
                        },
                        attributes: {style: "text-align:left;white-space:normal"},
                        editable: true,
                        hidden: vm.type !== 'view',
                    },
                    {
                        title: CommonService.translate("Thao tác"),
                        field: "TT",
                        width: "10%",
                        headerAttributes: {style: "text-align:center; font-weight: bold;", translate: ""},
                        attributes: {style: "text-align:center;"},
                        template: dataItem => '<div class="text-center">\n' +
                            '<button ng-if="caller.type!==\'view\'" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Xóa" translate=""  ng-click="caller.removeDataItem(dataItem,\'listWorkOrderDV\')" ng-show="caller.type!=\'detail\'">  \n' +
                            '<i style="color:steelblue;" class="fa fa-trash ng-scope" aria-hidden="true"></i>\n' +
                            '</button>\n' +
                            '<button ng-if="dataItem.status==2&&dataItem.statusKtnb==null&&!caller.checkDate" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Bảo lưu" translate ' +
                            'ng-click="caller.reserve(dataItem)" > <i style="color:#ff3c1d;" class="fa fa-flag ng-scope" aria-hidden="true"></i></button>'
                            +
                            '</div>',
                        editable: true,
                    }
                ]
            });
        }

        vm.modalAdd1 = null;
        vm.addListViolation = function () {
            var templateUrl = 'ktnb/punishmentRequest/punishmentRequestViolationListPopup.html';
            var title = CommonService.translate("Chọn lỗi vi phạm ");
            vm.listChecked = []
            vm.modalAdd1 = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "75%", null, null);
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
                serverPaging: true,
                schema: {
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
                transport: {
                    read: {
                        url: Constant.BASE_SERVICE_URL + "violationRsService/doSearch",
                        type: "POST",
                        contentType: "application/json; charset=utf-8",
                    },
                    parameterMap: function (options, type) {
                        // vm.formSearchListViolation.sysGroupId = $rootScope.$root.authenticatedUser.VpsUserInfo.sysGroupId;
                        vm.formSearchListViolation.page = options.page;
                        vm.formSearchListViolation.pageSize = options.pageSize;
                        vm.formSearchListViolation.status = 1;
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
            columns: [
                {
                    title: CommonService.translate("Lựa chọn"),
                    field: "checked",
                    width: "2%",
                    selectable: true,
                    template: dataItem => "<input type='checkbox' name='checkboxViolationList' class='checkbox' ng-click='caller.onChange(dataItem)'/>",
                    headerAttributes: {style: "text-align:center; font-weight: bold;", translate: ""},
                    attributes: {style: "text-align:center;"},
                },
                {
                    title: CommonService.translate("STT"),
                    field: "stt",
                    template: function () {
                        return ++recordListViolation;
                    },
                    width: "3%",
                    headerAttributes: {style: "text-align:center; font-weight: bold;", translate: ""},
                    attributes: {style: "text-align:center;"},
                },
                {
                    title: CommonService.translate("Tên lỗi vi phạm"),
                    field: "name",
                    width: "20%",
                    headerAttributes: {style: "text-align:center; font-weight: bold;", translate: ""},
                    attributes: {style: "text-align:left; white-space: normal;"},
                },
                {
                    title: CommonService.translate("Mô tả hành vi vi phạm"),
                    field: "description",
                    width: "20%",
                    headerAttributes: {style: "text-align:center; font-weight: bold;white-space:normal", translate: ""},
                    attributes: {style: "text-align:left;white-space:normal"},
                    editable: true,
                },
                {
                    title: CommonService.translate("Đơn vị tính lỗi"),
                    field: "unitType",
                    width: "8%",
                    headerAttributes: {style: "text-align:center; font-weight: bold;white-space:normal", translate: ""},
                    attributes: {style: "text-align:left;white-space:normal"},
                    editable: true,
                },
                {
                    title: CommonService.translate("Đơn vị xây dựng vi phạm"),
                    field: "groupName",
                    width: "12%",
                    headerAttributes: {style: "text-align:center; font-weight: bold;white-space:normal", translate: ""},
                    attributes: {style: "text-align:left;white-space:normal"},
                    editable: true,
                },
                {
                    title: CommonService.translate("Lĩnh vực"),
                    field: "field",
                    width: "10%",
                    headerAttributes: {style: "text-align:center; font-weight: bold;white-space:normal", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal"},
                    editable: true,
                },
                // {
                //     title: CommonService.translate("Phân loại lỗi"),
                //     field: "type",
                //     width: "10%",
                //     headerAttributes: {style: "text-align:center; font-weight: bold;", translate: ""},
                //     attributes: {style: "text-align:center; white-space: normal;"},
                //     template: dataItem => dataItem.type == 1 ? 'Thông thường' : dataItem.type == 2 ? 'Ít nghiêm trọng' : dataItem.type == 3 ? 'Nghiêm trọng' : dataItem.type == 4 ? 'Rất nghiêm trọng' : '',
                // },
                {
                    title: CommonService.translate("Mức chế tài"),
                    field: "sanction",
                    width: "10%",
                    headerAttributes: {style: "text-align:center; font-weight: bold;", translate: ""},
                    attributes: {style: "text-align:right; white-space: normal"},
                    template: dataItem => formatToCurrency(dataItem.sanction),
                },
            ]
        });

        vm.onChange = function (dataItem) {
            var flag = false;
            if (vm.listChecked.length === 0) {
                vm.listChecked.push(dataItem);
            } else {
                for (var i = 0; i < vm.listChecked.length; i++) {
                    if (dataItem.violationId == vm.listChecked[i].violationId) {
                        vm.listChecked.splice(i, 1);
                        flag = true;
                    }
                }
                if (flag == false) {
                    vm.listChecked.push(dataItem);
                }
            }
        };

        vm.saveTempViolationList = function () {
            var data_ = $("#listViolation").data("kendoGrid").dataSource._data;
            if (data_.length > 0) {
                for (var i = 0; i < vm.listChecked.length; i++) {
                    var flag = true;
                    for (var j = 0; j < data_.length; j++) {
                        if (vm.listChecked[i].violationId === data_[j].violationId) {
                            toastr.warning(CommonService.translate(vm.listChecked[i].name + " với mức chế tài " + formatToCurrency(vm.listChecked[i].sanction) + " VNĐ đã tồn tại!"));
                            flag = false;
                        }
                    }
                    if (flag == true) {
                        vm.listChecked[i].numberViolation = 1;
                        vm.listChecked[i].listReject = [];
                        vm.listChecked[i].listReserve = [];
                        vm.insertForm.listViolationAdd.push(vm.listChecked[i]);
                        $("#listViolation").data("kendoGrid").dataSource.add(vm.listChecked[i]);
                    }
                }
            } else {
                for (let i = 0; i < vm.listChecked.length; i++) {
                    vm.listChecked[i].numberViolation = 1;
                    vm.listChecked[i].listReject = [];
                    vm.listChecked[i].listReserve = [];
                }
                $("#listViolation").data("kendoGrid").dataSource.data(vm.listChecked);
                vm.insertForm.listViolationAdd = vm.listChecked;
            }

            $("#listViolation").data("kendoGrid").refresh();
            vm.cancel();
        }

        vm.doSearchListViolation = function () {
            var grid = $("#listVio").data("kendoGrid");
            if (grid) {
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        }

        vm.cancel = function () {
            if (vm.modalAdd1 !== null) {
                vm.modalAdd1.dismiss();
                vm.modalAdd1 = null;
            } else {
                vm.modalAdd.dismiss();
            }
        }

        vm.insertForm.listViolationRemove = [];
        vm.removeDataItem = function (dataItem) {
            $('#listViolation').data('kendoGrid').dataSource.remove(dataItem);
            vm.insertForm.listViolationRemove.push(dataItem);
            for (var i = 0; i < vm.insertForm.listViolationAdd.length; i++) {
                if (dataItem.violationId == vm.insertForm.listViolationAdd[i].violationId) {
                    vm.insertForm.listViolationAdd.splice(i, 1);
                }
            }
        };

        vm.save = function (type) {
            if (vm.insertForm.sysUserIdReceive == null) {
                toastr.error(CommonService.translate("Cá nhân vi phạm không được để trống!"));
                return;
            }
            if ($("#listViolation").data("kendoGrid").dataSource._data.length === 0) {
                toastr.error(CommonService.translate("Danh sách lỗi vi phạm không được để trống!"));
                return;
            }
            var data_ = $("#listViolation").data("kendoGrid").dataSource._data;
            for (let i = 0; i < data_.length; i++) {
                if (data_[i] === null) {
                    toastr.error(CommonService.translate('Số lượng lỗi ở dòng ' + (i + 1) + ' không được để trống'));
                    return;
                }
                if (data_[i].numberViolation <= 0) {
                    toastr.error(CommonService.translate('Số lượng lỗi ở dòng ' + (i + 1) + ' phải là số dương.'));
                    return;
                }
            }
            if (type === 'new') {
                kendo.ui.progress($('.k-window'), true);
                Restangular.all("punishmentRequestRsService/save").post(vm.insertForm).then(function (res) {
                    if(res && res.error) {
                        toastr.error(CommonService.translate(res.error));
                    } else {
                        toastr.success(CommonService.translate("Lưu dữ liệu thành công !"));
                        vm.doSearch();
                        vm.cancel();
                    }
                    kendo.ui.progress($('.k-window'), false);
                }, function (error) {
                    console.log(error);
                    toastr.error(CommonService.translate("Không thể lưu dữ liệu"));
                    kendo.ui.progress($('.k-window'), false);
                });
            } else if (type === 'update') {
                kendo.ui.progress($('.k-window'), true);
                vm.insertForm.listViolation = $("#listViolation").data("kendoGrid").dataSource._data;
                Restangular.all("punishmentRequestRsService/update").post(vm.insertForm).then(function (res) {
                    if(res && res.error) {
                        toastr.error(CommonService.translate(res.error));
                    } else {
                        toastr.success(CommonService.translate("Lưu dữ liệu thành công !"));
                        vm.doSearch();
                        vm.cancel();
                    }
                    kendo.ui.progress($('.k-window'), false);
                }, function (error) {
                    console.log(error);
                    toastr.error(CommonService.translate("Không thể lưu dữ liệu"));
                    kendo.ui.progress($('.k-window'), false);
                });
            }
        }

        vm.submitDone = function(){
            for (let i = 0; i < vm.listCheck.length; i++) {
                if(vm.listCheck[i].status==0||vm.listCheck[i].statusApprove==0||vm.listCheck[i].statusApprove==1){
                    toastr.warning(CommonService.translate('Đề xuất có mã '+vm.listCheck[i].code+' không đúng trạng thái trình ký, hệ thóng sẽ tự động loại trừ khỏi danh sách duyệt.'));
                    vm.listCheck.splice(i,1);
                }
            }
            if(vm.listCheck.length==0){
                toastr.warning("Yêu cầu chọn ít nhất 1 bản ghi đúng trạng thái trình ký!");
                return;
            }
            confirm(CommonService.translate("Bạn có chắc chắn muốn trình ký các bản ghi này?"), function () {
                kendo.ui.progress($('.tab-content'), true);
                Restangular.all("punishmentRequestRsService/submitDone").post(vm.listCheck).then(function (res) {
                    if(res && res.error) {
                        toastr.error(CommonService.translate(res.error));
                    } else {
                        toastr.success(CommonService.translate("Trình ký thành công!"));
                        vm.doSearch();
                        vm.listCheck = [];
                        vm.cancel();
                        // $("#checkalllistEx").click();
                        vm.chkAllForExReq = false;
                    }
                    kendo.ui.progress($('.tab-content'), false);
                }, function (error) {
                    console.log(error);
                    toastr.error(CommonService.translate("Có lỗi xảy ra!"));
                    kendo.ui.progress($('.tab-content'), false);
                    // $("#checkalllistEx").click();
                    vm.chkAllForExReq = false;
                });
            });
        }

        vm.view = function (dataItem) {
            vm.type = 'view';
            vm.insertForm = angular.copy(dataItem);
            vm.insertForm.date = vm.insertForm.punishMonth+'/'+vm.insertForm.punishYear;
            Restangular.all('punishmentRequestDetailRsService/doSearch2').post({punishmentRequestId: vm.insertForm.punishmentRequestId}).then(function (res) {
                vm.insertForm.listViolationAdd = [];
                vm.insertForm.listViolationRemove = [];
                var templateUrl = 'ktnb/punishmentRequest/punishmentRequestPopup.html';
                var title = CommonService.translate("Chi tiết đề xuất áp chế tài");
                vm.modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "50%", null, null);
                fillDataListViolation(res.data);
            }, function (err) {
                toastr.error(CommonService.translate('Có lỗi xảy ra.'));
            });
        }

        vm.update = function (dataItem) {
            if (vm.checkDate) {
                toastr.error(CommonService.translate('Đã quá thời gian đề xuất!'));
                return;
            }
            vm.type = 'update';
            vm.insertForm = angular.copy(dataItem);
            vm.insertForm.date = vm.insertForm.punishMonth+'/'+vm.insertForm.punishYear;
            Restangular.all('punishmentRequestDetailRsService/doSearch').post({code: vm.insertForm.code}).then(function (res) {
                vm.insertForm.listViolationAdd = [];
                vm.insertForm.listViolationRemove = [];
                var templateUrl = 'ktnb/punishmentRequest/punishmentRequestPopup.html';
                var title = CommonService.translate("Cập nhật đề xuất áp chế tài");
                vm.modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "50%", null, null);
                fillDataListViolation(res.data);
            }, function (err) {
                toastr.error(CommonService.translate('Có lỗi xảy ra.'));
            });

        }

        vm.approve = function (dataItem) {
            if (vm.checkDate) {
                toastr.error(CommonService.translate('Đã quá thời gian đề xuất!'));
                return;
            }
            confirm(CommonService.translate("Xác nhận duyệt!"), function () {
                var obj = angular.copy(dataItem);
                kendo.ui.progress(vm.documentBody, true);
                Restangular.all('punishmentRequestRsService/approve').post(obj).then(function (res) {
                    kendo.ui.progress(vm.documentBody, false);
                    if(res && res.error) {
                        toastr.error(CommonService.translate(res.error));
                    } else {
                        toastr.success(CommonService.translate("Xác nhận duyệt thành công !!!"));
                        vm.doSearch();
                        // $("#checkalllistEx").click();
                        vm.chkAllForExReq = false;
                    }
                }, function (error) {
                    console.log(error);
                    toastr.error(CommonService.translate("Có lỗi xảy ra!"));
                    // $("#checkalllistEx").click();
                    vm.chkAllForExReq = false;
                })
            });
        }

        vm.approveList = function () {
            if (vm.checkDate) {
                toastr.error(CommonService.translate('Đã quá thời gian đề xuất!'));
                return;
            }
            if(!vm.isRoleApprove){
                toastr.error(CommonService.translate('Bạn không có quyền duyệt đề xuất áp chế tài'));
                return;
            }
            for (let i = 0; i < vm.listCheck.length; i++) {
                if(vm.listCheck[i].status==0||vm.listCheck[i].statusApprove!==0){
                    toastr.error(CommonService.translate('Đề xuất có mã '+vm.listCheck[i].code+' không đúng trạng thái duyệt, hệ thóng sẽ tự động loại trừ khỏi danh sách duyệt.'));
                    vm.listCheck.splice(i,1);
                }
            }
            if(vm.listCheck.length==0){
                toastr.error(CommonService.translate('Yêu cầu chọn ít nhất 1 bản ghi đúng trạng thái chờ duyệt!'));
                return;
            }
            confirm(CommonService.translate("Xác nhận duyệt!"), function () {
                kendo.ui.progress(vm.documentBody, true);
                Restangular.all('punishmentRequestRsService/approveList').post(vm.listCheck).then(function (res) {
                    kendo.ui.progress(vm.documentBody, false);
                    if(res && res.error) {
                        toastr.error(CommonService.translate(res.error));
                    } else {
                        toastr.success(CommonService.translate("Xác nhận duyệt thành công !!!"));
                        vm.doSearch();
                        vm.listCheck = [];
                        // $("#checkalllistEx").click();
                        vm.chkAllForExReq = false;
                    }
                }, function (error) {
                    console.log(error);
                    toastr.error(CommonService.translate("Có lỗi xảy ra!"));
                    // $("#checkalllistEx").click();
                    vm.chkAllForExReq = false;
                })
            });
        }
        vm.checkResend = function () {
            return Constant.user.VpsUserInfo.sysUserId == 55321
        }
        vm.resendApproveList = function () {
            Restangular.all('punishmentRequestRsService/resendApproveList').post([]).then(function (res) {
                kendo.ui.progress(vm.documentBody, false);
                if(res && res.error) {
                    toastr.error(CommonService.translate(res.error));
                } else {
                    toastr.success(CommonService.translate("OK"));
                }
            }, function (error) {
                console.log(error);
                toastr.error(CommonService.translate("Có lỗi xảy ra!"));
                vm.chkAllForExReq = false;
            })
        }

        vm.reject = function (dataItem) {
            if (vm.checkDate) {
                toastr.error(CommonService.translate('Đã quá thời gian đề xuất!'));
                return;
            }
            var templateUrl = 'ktnb/punishmentRequest/punishmentRequestRejectPopup.html';
            var title = CommonService.translate("Lý do từ chối");
            vm.insertForm = angular.copy(dataItem);
            vm.modalAdd1 = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "50%", "30%", null, null);
        }

        vm.rejectRequest = function () {
            if (vm.insertForm.rejectDescription == null) {
                toastr.error(CommonService.translate("lý do từ chối không được để trống!"));
                return;
            }
            kendo.ui.progress($(vm.modalBody), true);
            Restangular.all('punishmentRequestRsService/reject').post(vm.insertForm).then(function (res) {
                kendo.ui.progress($(vm.modalBody), false);
                if(res && res.error) {
                    toastr.error(CommonService.translate(res.error));
                } else {
                    vm.cancel();
                    vm.doSearch();
                    toastr.success(CommonService.translate("Từ chối duyệt thành công"));
                    vm.cancel();
                }
                // vm.cancel();
            }, function (error) {
                console.log(error);
                toastr.error(CommonService.translate("Có lỗi xảy ra"));
                kendo.ui.progress($(vm.modalBody), false);
            })
        }

        vm.remove = function (dataItem) {
            if (vm.checkDate) {
                toastr.error(CommonService.translate('Đã quá thời gian đề xuất!'));
                return;
            }
            confirm(CommonService.translate("Xác nhận hết hiệu lực bản ghi!"), function () {
                var obj = angular.copy(dataItem);
                kendo.ui.progress(vm.documentBody, true);
                Restangular.all('punishmentRequestRsService/remove').post(obj).then(function (res) {
                    if(res && res.error) {
                        toastr.error(CommonService.translate(res.error));
                    } else {
                        toastr.success(CommonService.translate("Hết hiệu lực thành công !!!"));
                        vm.doSearch();
                    }
                    kendo.ui.progress(vm.documentBody, false);
                }, function (error) {
                    console.log(error);
                    toastr.error(CommonService.translate("Có lỗi xảy ra!"));
                })
            });
        }

        function formatToCurrency(amount) {
            return amount.toLocaleString('it-IT', {style: 'currency', currency: 'VND'});
        }

        function getTypeName(value) {
            switch (value) {
                case 1:
                    return 'Thông thường';
                    break;
                case 2:
                    return 'Ít nghiêm trọng';
                    break;
                case 3:
                    return 'Nghiêm trọng';
                    break;
                case 4:
                    return 'Rất nghiêm trọng';
                    break;
                default:
                    return '';
                    break;
            }
        }

        vm.listFileAttach = [];
        vm.reserve = function (dataItem) {
            vm.typeReserve = 'reserve';
            var templateUrl = 'ktnb/punishmentRequestDetail/punishmentRequestDetailReservePopup.html';
            var title = CommonService.translate("Bảo lưu chế tài");
            vm.insertForm = angular.copy(dataItem);
            var x = [];
            x.push(dataItem);
            vm.listFileAttach = [];
            vm.modalAdd1 = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "70%", null, null);
            fillDataPunishmentRequestDetailReserve(x);
            fillFileTable([]);
        }

        function fillDataPunishmentRequestDetailReserve(data) {
            vm.punishmentRequestDetailGridReserveOptions = kendoConfig.getGridOptions({
                reorderable: true,
                autoBind: true,
                resizable: true,
                dataSource: data,
                noRecords: true,
                columnMenu: false,
                scrollable: true,
                messages: {
                    noRecords: CommonService.translate("Không có kết quả hiển thị")
                },
                columns: [
                    {
                        title: CommonService.translate("Loại lỗi"),
                        field: 'type',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem => getTypeName(dataItem.type),
                    }, {
                        title: CommonService.translate("Tên lỗi"),
                        field: 'name',
                        width: "15%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                    }, {
                        title: CommonService.translate("Mức chế tài"),
                        field: 'sanction',
                        width: "5%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem => formatToCurrency(dataItem.sanction),
                    }, {
                        title: CommonService.translate("Số lượng lỗi"),
                        field: 'numberViolation',
                        width: "5%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    }, {
                        title: CommonService.translate("Tổng tiền vi phạm"),
                        field: 'total',
                        width: "5%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem => formatToCurrency(dataItem.sanction * dataItem.numberViolation),
                    }, {
                        title: CommonService.translate("Trạng thái duyệt"),
                        field: 'status',
                        width: "7%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        // template: dataItem => dataItem.status === 0 ? 'Chờ duyệt' : dataItem.status === 1 ? 'Đã duyệt' : dataItem.status === 2 ? 'Từ chối' : '',
                        template: dataItem => vm.getStatusApprove(dataItem),
                    }, {
                        title: CommonService.translate("Đầu mối liên hệ"),
                        field: 'createByName',
                        width: "15%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    }
                ]
            });
        }

        vm.submitReserve = function (bool) {
            var obj = angular.copy(vm.insertForm);
            if (bool) {
                if($('#listAttachDocumentGrid').data('kendoGrid').dataSource._data.length===0){
                    toastr.error(CommonService.translate('File đính kèm được để trống.'));
                    return;
                }
                obj.listFileAttach = $('#listAttachDocumentGrid').data('kendoGrid').dataSource._data;
                kendo.ui.progress(vm.modalBody, true);
                Restangular.all('punishmentRequestDetailRsService/reserveOn').post(obj).then(function (res) {
                    kendo.ui.progress(vm.modalBody, false);
                    if(res && res.error) {
                        toastr.error(CommonService.translate(res.error));
                    } else {
                        vm.cancel();
                        vm.doSearch();
                        toastr.success(CommonService.translate("Bảo lưu thành công"));
                        vm.cancel();
                    }
                    // vm.cancel();
                }, function (error) {
                    console.log(error);
                    toastr.error(CommonService.translate("Có lỗi xảy ra"));
                    kendo.ui.progress(vm.modalBody, false);
                })
            } else {
                kendo.ui.progress(vm.modalBody, true);
                Restangular.all('punishmentRequestDetailRsService/reserveOff').post(obj).then(function (res) {
                    kendo.ui.progress(vm.modalBody, false);
                    if(res && res.error) {
                        toastr.error(CommonService.translate(res.error));
                    } else {
                        vm.cancel();
                        vm.doSearch();
                        toastr.success(CommonService.translate("Từ chối bảo lưu thành công"));
                        vm.cancel();
                    }
                    // vm.cancel();
                }, function (error) {
                    console.log(error);
                    toastr.error(CommonService.translate("Có lỗi xảy ra"));
                    kendo.ui.progress(vm.modalBody, false);
                })
            }
        }

        vm.clear = function (type) {
            if (type === 'sysUserReceiveInsert') {
                vm.insertForm.sysUserNameReceive = null;
                vm.insertForm.sysUserIdReceive = null;
            } else if (type === 'codeSearch') {
                vm.searchForm.code = null;
            } else if (type === 'dateSearch') {
                vm.searchForm.date=null;
                vm.searchForm.punishMonth=null;
                vm.searchForm.punishYear=null;
            } else if (type === 'sysUserReceiveSearch') {
                vm.searchForm.sysUserIdReceive = null;
                vm.searchForm.sysUserNameReceive = null;
            } else if (type === 'sysGroupRequestSearch') {
                vm.searchForm.sysGroupIdRequest = null;
                vm.searchForm.sysGroupNameRequest = null;
            } else if (type === 'createByNameSearch') {
                vm.searchForm.createBy = null;
                vm.searchForm.createByName = null;
            } else if (type === 'field'){
                vm.searchForm.field = null;
            } else if (type === 'sysGroupReceiveSearch'){
                vm.searchForm.sysGroupIdReceive = null;
                vm.searchForm.sysGroupNameReceive = null;
            } else if (type === 'sanction'){
                vm.searchForm.fromSanction = null;
                vm.searchForm.toSanction = null;
            }
        }

        vm.isSelectSysGroupRequestSearchDvg = false;
        vm.sysGroupRequestSearchOptions = {
            clearButton: false,
            dataTextField: "name",
            placeholder: CommonService.translate("Nhập mã hoặc tên đơn vị"),
            dataValueField: "name",
            open: function (e) {
                vm.isSelectSysGroupRequestSearchDvg = false;
            },
            select: function (e) {
                vm.isSelectSysGroupRequestSearchDvg = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchForm.sysGroupNameRequest = dataItem.name;
                vm.searchForm.sysGroupIdRequest = dataItem.sysGroupId;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSysGroupRequestSearchDvg) {
                        vm.searchForm.sysGroupNameRequest = null;
                        vm.searchForm.sysGroupIdRequest = null;
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
                        vm.isSelectSysGroupRequestSearchDvg = false;
                        return Restangular.all("commonRsService/getSysGroupForAutoComplete").post(
                            {
                                keySearch: vm.searchForm.sysGroupNameRequest,
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

        vm.openPopupSysGroupRequest = function () {
            var templateUrl = "ktnb/popup/popupCommonSearch.html";
            var title = CommonService.translate("Tìm kiếm đơn vị đề xuất áp chế tài");
            var windowId = "POPUP_SELECT_SYS_GROUP_RECEIVE";
            vm.placeHolder = CommonService.translate("Mã/tên đơn vị");
            CommonService.populatePopupCreate(templateUrl, title, null, vm, windowId, null, '60%', '50%', null);
            setTimeout(function () {
                modal = CommonService.getModalInstance1();
            }, 100);
            vm.commonPopupSearch = {groupLevelLst: [2,3]};
            var api = "commonRsService/getSysGroupForAutoComplete";
            CommonService.fillDataPopupCommonSearch(api, vm.commonPopupSearch, sysGroupRequestSearchColumns, vm);
        }

        var sysGroupRequestSearchColumns = [
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
                    '	   <i ng-click="caller.saveSelectSysGroupRequestSearch(dataItem)" class="fa fa-check color-green" aria-hidden="true"></i> ' +
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

        vm.saveSelectSysGroupRequestSearch = function (dataItem) {
            vm.searchForm.sysGroupIdRequest = dataItem.sysGroupId;
            vm.searchForm.sysGroupNameRequest = dataItem.name;
            modal.dismiss();
        }

        vm.doSearchCommonPopup = function () {
            var grid = $("#commonSearchPopupGrid").data("kendoGrid");
            if (grid) {
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        }

        vm.getExcelTemplate = function() {
            $http({
                url: Constant.BASE_SERVICE_URL + RestEndpoint.PUNISHMENT_REQUEST_SERVICE_URL +"/exportFileBM",
                method: "POST",
                data: {},
                headers: {
                    'Content-type': 'application/json'
                },
                responseType: 'arraybuffer'
            }).success(function (data, status, headers, config) {
                saveFile(data,"Bieu_mau_import_de_xuat_ap_che_tai.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
            }).error(function (data, status, headers, config) {
                toastr.error("Có lỗi xảy ra! Vui lòng thử lại sau.");
            });
        }

        function saveFile(data, filename, type) {
            var file = new Blob([data], {type: type});
            if (window.navigator.msSaveOrOpenBlob) // IE10+
                window.navigator.msSaveOrOpenBlob(file, filename);
            else { // Others
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

        var modalAdd;
        var modalInstanceImport;
        vm.submitImportNewTargets = function submitImportNewTargets() {
            vm.dataImport = [];
            var element = $("#capNhatId");
            kendo.ui.progress(element, true);
            if ($("#fileChange")[0].files[0] == null) {
                kendo.ui.progress(element, false);
                toastr.warning(CommonService.translate("Bạn chưa chọn file để import"));
                return;
            }
            if ($("#fileChange")[0].files[0].name.split('.').pop() != 'xls' && $("#fileChange")[0].files[0].name.split('.').pop() != 'xlsx') {
                kendo.ui.progress(element, false);
                toastr.warning(CommonService.translate("Sai định dạng file"));
                return;
            }
            var formData = new FormData();

            // ?folder=temp
            formData.append('multipartFile', $("#fileChange")[0].files[0]);
            return $.ajax({
                url: Constant.BASE_SERVICE_URL + RestEndpoint.PUNISHMENT_REQUEST_SERVICE_URL + "/importExcel?folder=temp",
                type: "POST",
                data: formData,
                enctype: 'multipart/form-data',
                processData: false,
                contentType: false,
                cache: false,
                success: function (data) {
                    if (data == 'NO_CONTENT') {
                        vm.disableSubmit = false;
                        toastr.warning("File import không có nội dung");
                        kendo.ui.progress(element, false);
                    } else if (data.length == 1 && !!data[data.length - 1].errorList && data[data.length - 1].errorList.length > 0) {
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
                        kendo.ui.progress(element, false);
                        vm.disableSubmit = false;
                        vm.dataImport = data;
                        var templateUrl = 'ktnb/punishmentRequest/punishmentRequestImportPopup.html';
                        var title = CommonService.translate("Xác nhận thêm dữ liệu");
                        modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "50%", null, null);
                        fillDataImportResTable(vm.dataImport);
                    }
                    $("#fileChange").val("");
                    $scope.$apply();
                },
            });
        }

        function fillDataImportResTable(data) {
            vm.importResGridOptions = kendoConfig.getGridOptions({
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
                        title: CommonService.translate("TT"),
                        field: "stt",
                        template: function (dataItem) {
                            return $("#violationGrid2").data("kendoGrid").dataSource.indexOf(dataItem) + 1
                        },
                        width: "3%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center;"
                        },
                    },
                    {
                        title: CommonService.translate("Tháng xét"),
                        field: 'punishMonth',
                        width: "5%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Năm xét"),
                        field: 'punishYear',
                        width: "5%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Mã đề xuất chế tài phạt"),
                        field: 'code',
                        width: "20%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem => '<a ng-click="caller.viewImportDetail(dataItem)">' + dataItem.code + '</a>'

                    },
                    {
                        title: CommonService.translate("Cá nhân vi phạm"),
                        field: 'sysUserNameReceive',
                        width: "20%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Thao tác"),
                        field: 'choose',
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate:""
                        },
                        template: dataItem =>
                            '<div class="text-center #=assetLiquidateReqId#"">' +
                            '<button style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Hết hiệu lực" translate ' +
                            'ng-click="caller.removeItem(dataItem)" > <i style="color:steelblue;" class="fa fa-trash ng-scope" aria-hidden="true"></i></button>'
                            +
                            '</div>',

                        width: "10%",
                    }],
            });
        }

        vm.removeItem = function(dataItem){
            $("#importResultGrid").data("kendoGrid").dataSource.remove(dataItem);
            vm.dataImport = $("#importResultGrid").data("kendoGrid").dataSource._data;
            $("#importResultGrid").data("kendoGrid").refresh();
        }

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
        vm.viewImportDetail = function(dataItem) {
            vm.type = 'view';
            vm.insertForm = angular.copy(dataItem);
            vm.insertForm.date = vm.insertForm.punishMonth+'/'+vm.insertForm.punishYear;
            vm.insertForm.sysGroupIdRequest = $rootScope.$root.authenticatedUser.VpsUserInfo.sysGroupId;
            vm.insertForm.sysGroupNameRequest = $rootScope.$root.authenticatedUser.VpsUserInfo.groupNameLevel2;
            var templateUrl = 'ktnb/punishmentRequest/punishmentRequestPopup.html';
            var title = CommonService.translate("Chi tiết đề xuất áp chế tài");
            vm.modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "50%", null, null);
            fillDataListViolation(dataItem.listViolation);
        }
        vm.submitByImport = function (){
            var list = [];
            list = $("#violationGrid2").data("kendoGrid").dataSource._data;
            Restangular.all('punishmentRequestRsService/submitByImport').post(list).then(function(res){
                    toastr.success(CommonService.translate("Thêm mới bản ghi thành công!"));
                    vm.doSearch();
                    modalAdd.dismiss();
                    vm.doSearch();
                kendo.ui.progress(vm.modalBody, false);
            }, function (err) {
                toastr.error(gettextCatalog.getString("Lỗi khi thêm mới!"));
                // vm.doSearch();
                // modalAdd.dismiss();
                kendo.ui.progress(vm.modalBody, false);
            });
        }
        function fillFileTable() {
            vm.gridFileOptions = kendoConfig.getGridOptions({
                autoBind: true,
                scrollable: false,
                resizable: true,
                editable: false,
                dataSource: {
                    data: vm.listFileAttach,
                    pageSize: 5
                },
                // save: function () {
                //     vm.workItemGrid.refresh();
                // },
                messages: {
                    noRecords: gettextCatalog.getString(CommonService.translate("Không có kết quả hiển thị"))
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
                        template: dataItem => $("#listAttachDocumentGrid").data("kendoGrid").dataSource.indexOf(dataItem) + 1,
                        width: '10%',
                        columnMenu: false,
                        headerAttributes: {style: "text-align:center;font-weight: bold;", translate: ""},
                        attributes: {
                            style: "text-align:center;"
                        },
                        type: 'text',
                        editable: false
                    },
                    {
                        title: CommonService.translate("Tên file"),
                        width: '30%',
                        field: "name",
                        headerAttributes: {style: "text-align:center;font-weight: bold;", translate: ""},
                        attributes: {
                            style: "text-align:left;"
                        },
                        type: 'text',
                        editable: false,
                        template: function (dataItem) {
                            return "<a href='' ng-click='caller.downloadFile(dataItem)'>" + dataItem.name + "</a>";
                        }
                    },
                    {
                        title: CommonService.translate("Ngày upload"),
                        field: 'createdDate',
                        width: '20%',
                        headerAttributes: {style: "text-align:center;font-weight: bold;", translate: ""},
                        attributes: {
                            style: "text-align:center;"
                        },
                        type: 'text',
                        editable: false
                    },
                    {
                        title: CommonService.translate("Người upload"),
                        field: 'createdUserName',
                        width: '20%',
                        headerAttributes: {style: "text-align:center;font-weight: bold;", translate: ""},
                        attributes: {
                            style: "text-align:center;"
                        },
                        type: 'text',
                        editable: false
                    },
                    {
                        title: CommonService.translate("Thao tác"),
                        field: '',
                        width: '20%',
                        headerAttributes: {style: "text-align:center;font-weight: bold;", translate: ""},
                        attributes: {
                            style: "text-align:center;"
                        },
                        template: function(dataItem){
                            return vm.type!=='detail'?'<button style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Xóa" translate ' +
                                'ng-click="caller.removeDetail(\'file\',dataItem)" > <i style="color:steelblue;" class="fa fa-trash ng-scope" aria-hidden="true"></i></button>':'';
                        },
                        editable: false
                    }
                ]
            });
            try{
                $("#listAttachDocumentGrid").data("kendoGrid").dataSource.data(vm.listFileAttach);
            } catch (exception){}
        }

        vm.listFileAttach = [];
        vm.onSelect = function (e) {
            if ($("#files")[0].files[0].size > 52428800) {
                toastr.warning(CommonService.translate("Dung lượng file lớn hơn 50MB"));
                removeFileUpload();
                return;
            }

            if ($("#files")[0].files[0].name.split('.').pop() != 'pdf')
            {
                toastr.warning(CommonService.translate("Sai định dạng file"));
                removeFileUpload();
                return;
            }
            if (vm.listFileAttach != null) {
                for (var h = 0; h < vm.listFileAttach.length; h++) {
                    if (vm.listFileAttach[h].name == $("#files")[0].files[0].name) {
                        toastr.warning(CommonService.translate("Không được upload file trùng nhau"));
                        removeFileUpload();
                        return;
                    }
                }
            }

            var formData = new FormData();
            jQuery.each(jQuery('#files')[0].files, function (i, file) {
                formData.append('multipartFile' + i, file);
            });

            return $.ajax({
                url: Constant.BASE_SERVICE_URL + "fileservice/uploadATTT?folder=" + Constant.UPLOAD_FOLDER_TYPE_INPUT,
                type: "POST",
                data: formData,
                enctype: 'multipart/form-data',
                processData: false,
                contentType: false,
                cache: false,
                success: function (data) {
                    removeFileUpload();
                    $.map(e.files, function (file, index) {
                        vm.listFileAttach = $("#listAttachDocumentGrid").data("kendoGrid").dataSource._data;
                        var obj = {};
                        obj.name = file.name;
                        obj.utilAttachDocumentId = null;
                        obj.filePath = data[index];
                        obj.createdDate = kendo.toString(new Date((new Date()).getTime()), "dd/MM/yyyy");
                        obj.createdUserId = Constant.user.VpsUserInfo.sysUserId;
                        obj.createdUserName = Constant.user.VpsUserInfo.fullName;
                        vm.listFileAttach.push(obj);
                    })
                    refreshGrid(vm.listFileAttach);
                    removeFileUpload();
                }
            });
        }

        function removeFileUpload() {
            setTimeout(function () {
                $(".k-upload-files.k-reset").find("li").remove();
                $(".k-upload-files").remove();
                $(".k-upload-status").remove();
                $(".k-upload.k-header").addClass("k-upload-empty");
                $(".k-upload-button").removeClass("k-state-focused");
            }, 10);
        }

        function refreshGrid(d) {
            var grid = vm.listAttachDocumentGrid;
            if (grid) {
                grid.dataSource.data(d);
                grid.refresh();
            }
        }

        vm.removeDetail = function(type,dataItem){
            if(type==='file'){
                $('#listAttachDocumentGrid').data('kendoGrid').dataSource.remove(dataItem);
                vm.listFileAttachRemove.push(dataItem);
                toastr.success(CommonService.translate("Xóa bản ghi thành công!!"));
            }
        }

        vm.showButtonEdit = function(dataItem){
            if(dataItem.createBy==Constant.user.VpsUserInfo.sysUserId){
                return true;
            }
            return false;
        }

        vm.isSelectCreateBySearchDvg = false;
        vm.createByOptions = {

            clearButton: false,
            dataTextField: "name",
            placeholder: CommonService.translate("Nhập mã hoặc tên nhân viên"),
            dataValueField: "name",
            open: function (e) {
                vm.isSelectCreateBySearchDvg = false;
            },
            select: function (e) {
                vm.isSelectCreateBySearchDvg = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchForm.createByName = dataItem.fullName;
                vm.searchForm.createBy = dataItem.sysUserId;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectCreateBySearchDvg) {
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
                        vm.isSelectCreateBySearchDvg = false;
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

        vm.openPopupCreateBy = function () {
            var templateUrl = "ktnb/popup/popupCommonSearch.html";
            var title = CommonService.translate("Tìm kiếm người tạo đề xuất");
            var windowId = "POPUP_SELECT_SYS_GROUP_RECEIVE";
            vm.placeHolder = CommonService.translate("Mã/tên nhân viên");
            CommonService.populatePopupCreate(templateUrl, title, null, vm, windowId, null, '60%', '50%', null);
            setTimeout(function () {
                modal = CommonService.getModalInstance1();
            }, 100);
            vm.commonPopupSearch = {};
            var api = "commonRsService/getSysUserForAutoComplete";
            CommonService.fillDataPopupCommonSearch(api, vm.commonPopupSearch, createBySearchColumns, vm);
        }

        var createBySearchColumns = [
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
                    '	   <i ng-click="caller.saveSelectCreateBySearch(dataItem)" class="fa fa-check color-green" aria-hidden="true"></i> ' +
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

        vm.saveSelectCreateBySearch = function (dataItem) {
            vm.searchForm.createBy = dataItem.sysUserId;
            vm.searchForm.createByName = dataItem.fullName;
            modal.dismiss();
        }

        vm.isSelectSysGroupReceiveSearchDvg = false;
        vm.sysGroupReceiveSearchOptions = {
            clearButton: false,
            dataTextField: "name",
            placeholder: CommonService.translate("Nhập mã hoặc tên đơn vị"),
            dataValueField: "name",
            open: function (e) {
                vm.isSelectSysGroupReceiveSearchDvg = false;
            },
            select: function (e) {
                vm.isSelectSysGroupReceiveSearchDvg = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchForm.sysGroupNameReceive = dataItem.name;
                vm.searchForm.sysGroupIdReceive = dataItem.sysGroupId;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSysGroupReceiveSearchDvg) {
                        vm.searchForm.sysGroupNameReceive = null;
                        vm.searchForm.sysGroupIdReceive = null;
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
                        vm.isSelectSysGroupReceiveSearchDvg = false;
                        return Restangular.all("commonRsService/getSysGroupForAutoComplete").post(
                            {
                                keySearch: vm.searchForm.sysGroupNameReceive,
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

        vm.openPopupSysGroupReceive = function () {
            var templateUrl = "ktnb/popup/popupCommonSearch.html";
            var title = CommonService.translate("Tìm kiếm đơn vị cá nhân vi phạm");
            var windowId = "POPUP_SELECT_SYS_GROUP_RECEIVE";
            vm.placeHolder = CommonService.translate("Mã/tên đơn vị");
            CommonService.populatePopupCreate(templateUrl, title, null, vm, windowId, null, '60%', '50%', null);
            setTimeout(function () {
                modal = CommonService.getModalInstance1();
            }, 100);
            vm.commonPopupSearch = {groupLevelLst: [2,3]};
            var api = "commonRsService/getSysGroupForAutoComplete";
            CommonService.fillDataPopupCommonSearch(api, vm.commonPopupSearch, sysGroupReceiveSearchColumns, vm);
        }

        var sysGroupReceiveSearchColumns = [
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
                    '	   <i ng-click="caller.saveSelectSysGroupReceiveSearch(dataItem)" class="fa fa-check color-green" aria-hidden="true"></i> ' +
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

        vm.saveSelectSysGroupReceiveSearch = function (dataItem) {
            vm.searchForm.sysGroupIdReceive = dataItem.sysGroupId;
            vm.searchForm.sysGroupNameReceive = dataItem.name;
            modal.dismiss();
        }

        vm.downloadFileType = function(type,dataItem) {
            var data = null;
            if(type === 'reserve'){
                data = dataItem.listReserve;
            } else if(type === 'reject'){
                data = dataItem.listReject;
            }
            let currentIndex = 0;
            const intervalId = setInterval(() => {
                if (currentIndex === data.length - 1) clearInterval(intervalId);
                window.location.href = Constant.BASE_SERVICE_URL + "fileservice/downloadFileATTT?"+data[currentIndex].filePath;
                currentIndex++;
            }, 1000);
        }

        vm.exportExcelGrid =function () {
            kendo.ui.progress(vm.documentBody, true);
            var obj = angular.copy(vm.searchForm);
            obj.page = null;
            obj.pageSize = null;
            punishmentRequestService.doSearch(obj).then(function (d) {
                kendo.ui.progress(vm.documentBody, false);
                var data = d.data;
                CommonService.exportFile(vm.punishmentRequestGrid, data, vm.listRemove, vm.listConvert, CommonService.translate("Danh sách đề xuất áp chế tài"));
            });
        }

        vm.showHideColumn = function (column) {
            if (angular.isUndefined(column.hidden)) {
                vm.punishmentRequestGrid.hideColumn(column);
            } else if (column.hidden) {
                vm.punishmentRequestGrid.showColumn(column);
            } else {
                vm.punishmentRequestGrid.hideColumn(column);
            }
        };
    }
})();
