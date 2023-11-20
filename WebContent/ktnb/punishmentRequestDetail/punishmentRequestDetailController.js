(function () {
    'use strict';
    var controllerId = 'punishmentRequestDetailController';

    angular.module('MetronicApp').controller(controllerId, punishmentRequestDetailController);

    function punishmentRequestDetailController($scope, $http, $templateCache, $rootScope, $timeout, gettextCatalog,
                                         kendoConfig, $kWindow, $q, punishmentRequestDetailService,
                                         CommonService, htmlCommonService, PopupConst, Restangular, RestEndpoint, Constant) {
        var vm = this;
        vm.documentBody = $("#punishmentRequestDetail");
        vm.modalBody = $(".k-window");
        vm.searchForm = {};
        vm.insertForm = {};
        vm.currentUserId = null;

        vm.listMonth = [];
        vm.listMonth.push({value: null, name: '---Chọn---'});
        for (let i = 1; i < 13; i++) {
            vm.listMonth.push({value: i, name:'Tháng '+i});
        }

        vm.listYear = [];
        vm.listYear.push({value: null, name: '---Chọn---'});
        for (let i = new Date().getFullYear(); i > new Date().getFullYear()-14 ; i--) {
            vm.listYear.push({value: i, name: 'Năm '+i});
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

        initForm();
        function initForm() {
            if ($rootScope.stringtile) {
                vm.String = CommonService.translate("Quản lý thưởng phạt ") + " > "+ CommonService.translate(" Phản hồi chế tài");
            }
            vm.currentUserId = Constant.user.VpsUserInfo.sysUserId;
            vm.checkDate = new Date().getDate()>10 && new Date().getDate()<25;
            fillDataPunishmentRequestDetail([]);
            checkPermissionPunishmentApprove();
            checkPermissionPunishmentApproveKtnb();
        }

        function checkPermissionPunishmentApproveKtnb() {
            vm.isRoleApproveKtnb = false;
            let obj = {};
            obj.adResourceCode = "PUNISHMENT_KTNB";
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

        function checkPermissionPunishmentApprove() {
            vm.isRoleApprove = true;
            // let obj = {};
            // obj.adResourceCode = "PUNISHMENT_REQUEST";
            // obj.operationCode = "DVACT";
            // CommonService.checkPermission(obj).then(
            //     function (resp) {
            //         if (resp) {
            //             vm.isRoleApprove = resp;
            //         }
            //     },
            //     function (error) {
            //         console.log(error);
            //         toastr.error("Có lỗi xảy ra!");
            //     }
            // )
            // console.log(vm.isRoleApprove);
        }

        function getTypeName(value){
            switch (value){
                case 1: return 'Thông thường'; break;
                case 2: return 'Ít nghiêm trọng'; break;
                case 3: return 'Nghiêm trọng'; break;
                case 4: return 'Rất nghiêm trọng'; break;
                default: return ''; break;
            }
        }

        vm.doSearch = function () {
            var grid = $("#punishmentRequestDetailGrid").data("kendoGrid");
            if (grid) {
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        }

        vm.cancel = function(){
            if (vm.modalAdd1!==null){
                vm.modalAdd1.dismiss();
                vm.modalAdd1 = null;
            } else {
                vm.modalAdd.dismiss();
            }
        }

        var recordPunishmentRequestDetail = 0;
        vm.countPunishmentRequestDetail = 0;
        function fillDataPunishmentRequestDetail(data) {
            vm.punishmentRequestDetailGridOptions = kendoConfig.getGridOptions({
                reorderable: true,
                autoBind: true,
                resizable: true,
                dataBinding: function () {
                    recordPunishmentRequestDetail = (this.dataSource.page() - 1) * this.dataSource.pageSize();
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
                            vm.countPunishmentRequestDetail = response.total;
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
                            url: Constant.BASE_SERVICE_URL + "punishmentRequestDetailRsService/doSearch",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, type) {
                            vm.searchForm.page = options.page;
                            vm.searchForm.pageSize = options.pageSize;
                            vm.searchForm.typeSearch = 1;
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
                toolbar: [{
                    name:"actions",
                    template: '<div class="btn-group pull-right margin_top_button margin_right10">' +
                        '    <i data-toggle="dropdown" class="tooltip1" aria-expanded="false"><span class="tooltipArrow"></span><span class="tooltiptext" translate>Cài đặt</span><i class="fa fa-cog" aria-hidden="true"></i></i>' +
                        '    <i class="tooltip1 action-button excelQLK" ng-click="vm.exportExcelGrid()"  aria-expanded="false"><span class="tooltipArrow"></span><span class="tooltiptext" translate>Xuất Excel</span></i>' +
                        '    <div class="dropdown-menu hold-on-click dropdown-checkboxes" role="menu">' +
                        '    <label ng-repeat="column in vm.punishmentRequestDetailGrid.columns.slice(1,vm.punishmentRequestDetailGrid.columns.length)| filter: vm.gridColumnShowHideFilter">' +
                        '    <input type="checkbox" checked="column.hidden" ng-click="vm.showHideColumn(column)"> {{column.title}}' +
                        '    </label>' +
                        '    </div></div>' +
                        '</div>'
                }],
                columns: [
                    {
                        title: CommonService.translate("TT"),
                        field: "stt",
                        template: function () {
                            return ++recordPunishmentRequestDetail;
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
                        title: CommonService.translate("Tháng xét phạt"),
                        field: 'punishMonth',
                        width: "5%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    }, {
                        title: CommonService.translate("Năm xét phạt"),
                        field: 'punishYear',
                        width: "7%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },  {
                        title: CommonService.translate("Mã chế tài"),
                        field: 'code',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },  {
                        title: CommonService.translate("Đơn vị áp chế tài"),
                        field: 'sysGroupNameRequest',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                    },
                    // {
                    //     title: CommonService.translate("Đơn vị bị áp chế tài"),
                    //     field: 'sysGroupNameReceive',
                    //     width: "15%",
                    //     headerAttributes: {
                    //         style: "text-align:center;font-weight: bold;",
                    //         translate: ""
                    //     },
                    //     attributes: {
                    //         style: "text-align:left; white-space:normal"
                    //     },
                    // },
                    // {
                    //     title: CommonService.translate("Loại lỗi"),
                    //     field: 'type',
                    //     width: "8%",
                    //     headerAttributes: {
                    //         style: "text-align:center;font-weight: bold;white-space:normal",
                    //         translate: ""
                    //     },
                    //     attributes: {
                    //         style: "text-align:center; white-space:normal"
                    //     },
                    //     template: dataItem => getTypeName(dataItem.type),
                    // },
                    {
                        title: CommonService.translate("Tên lỗi vi phạm"),
                        field: "name",
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold;white-space:normal",
                            translate: ""
                        },
                        attributes: {style: "text-align:left;white-space:normal"},
                        template: dataItem => '<a ng-click="vm.viewDetail(dataItem)">'+dataItem.name+'</a>',
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
                    },
                    {
                        title: CommonService.translate("Mức chế tài"),
                        field: 'sanction',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem => formatToCurrency(dataItem.sanction),
                    }, {
                        title: CommonService.translate("Số lượng lỗi"),
                        field: 'numberViolation',
                        width: "6%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    }, {
                        title: CommonService.translate("Tổng tiền phạt"),
                        field: 'total',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem => formatToCurrency(dataItem.sanction*dataItem.numberViolation),
                    }, {
                        title: CommonService.translate("Trạng thái cá nhân duyệt"),
                        field: 'status',
                        width: "7%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        // template: dataItem => dataItem.status===0?'Chờ duyệt':dataItem.status===1?'Đã duyệt':dataItem.status===2?'Từ chối' ? ():'',
                        template: dataItem => vm.checkPersonalStatus(dataItem)
                    }, {
                        title: CommonService.translate("Bảo lưu"),
                        field: "reserve",
                        width: "7%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold;white-space:normal",
                            translate: ""
                        },
                        attributes: {style: "text-align:center;white-space:normal"},
                        template: dataItem => '<input disabled type="checkbox" ng-checked="dataItem.reserve==1">',
                    }, {
                        title: CommonService.translate("Trạng thái P.PC&KSNB duyệt"),
                        field: 'statusKtnb',
                        width: "7%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem => dataItem.statusKtnb===0?'Chờ duyệt':dataItem.statusKtnb===1?'Đã duyệt':dataItem.statusKtnb===2?'Từ chối':'',
                    },{
                        title: CommonService.translate("Đầu mối liên hệ"),
                        field: 'createByName',
                        width: "13%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },{
                        title: CommonService.translate("Thao tác"),
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal",
                            translate:""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem =>
                            '<div class="text-center #=assetLiquidateReqId#"">' +
                            '<button ng-if="vm.isRoleApprove&&dataItem.status==0&&dataItem.sysUserIdReceive==vm.currentUserId&&!vm.checkDate" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Duyệt" translate ' +
                            'ng-click="vm.approve(dataItem)" > <i style="color:green;" class="fa fa-check ng-scope" aria-hidden="true"></i></button>'
                            +
                            '<button ng-if="vm.isRoleApprove&&dataItem.status==0&&dataItem.sysUserIdReceive==vm.currentUserId&&!vm.checkDate" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Từ chối" translate ' +
                            'ng-click="vm.reject(dataItem)" > <i style="color:darkred;" class="fa fa-times ng-scope" aria-hidden="true"></i></button>'
                            +
                            '<button ng-if="vm.isRoleApproveKtnb&&(dataItem.status==1||(dataItem.status==2&&dataItem.reserve==1))&&dataItem.statusKtnb==0" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="P.PC&KSNB Duyệt" translate ' +
                            'ng-click="vm.approveKtnb(dataItem)" > <i style="color:green;" class="fa fa-check ng-scope" aria-hidden="true"></i></button>'
                            +
                            '<button ng-if="vm.isRoleApproveKtnb&&(dataItem.status==1||(dataItem.status==2&&dataItem.reserve==1))&&dataItem.statusKtnb==0" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="P.PC&KSNB Từ chối" translate ' +
                            'ng-click="vm.rejectKtnb(dataItem)" > <i style="color:darkred;" class="fa fa-times ng-scope" aria-hidden="true"></i></button>'
                            +
                            '</div>',

                        width: "10%",
                        field: ""
                    }
                ]
            });
        }

        vm.approve = function(dataItem) {
            confirm(CommonService.translate("Xác nhận duyệt chế tài."), function (){
                var obj  = angular.copy(dataItem);
                kendo.ui.progress(vm.documentBody, true);
                Restangular.all('punishmentRequestDetailRsService/approve').post(obj).then(function(res){
                    kendo.ui.progress(vm.documentBody, false);
                    if(res && res.error) {
                        toastr.error(CommonService.translate(res.error));
                    } else {
                        toastr.success(CommonService.translate("Xác nhận duyệt thành công !!!"));
                        vm.doSearch();
                    }
                },function (error) {
                    console.log(error);
                    toastr.error(CommonService.translate("Có lỗi xảy ra!"));
                })
            });
        }

        vm.reject = function(dataItem) {
            var templateUrl = 'ktnb/punishmentRequestDetail/punishmentRequestDetailRejectPopup.html';
            var title = CommonService.translate("Lý do từ chối");
            vm.typeReject = 'DV';
            vm.listFileAttachApproved = [];
            vm.insertForm = angular.copy(dataItem);
            vm.modalAdd1 = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "40%", null, null);
        }
        vm.checkPersonalStatus = function(dataItem) {
            if (dataItem.status === 0) {
                return 'Chờ duyệt'
            }
            if (dataItem.status === 1) {
                return 'Đã duyệt'
            }
            if (dataItem.status === 2 && dataItem.reserve != 1) {
                return 'Từ chối'
            }
            if (dataItem.status === 2 && dataItem.reserve == 1) {
                return 'Từ chối(Bảo lưu)'
            }
        }

        vm.rejectRequest = function(){
            if(vm.insertForm.rejectDescription == null||$("#listAttachDocumentApprovedGrid").data("kendoGrid").dataSource._data.length===0){
                toastr.error(CommonService.translate("Yêu cầu nhập lý do từ chối hoặc đính kèm file!"));
                return;
            }
            vm.insertForm.listFileAttach = $("#listAttachDocumentApprovedGrid").data("kendoGrid").dataSource._data;
            kendo.ui.progress(vm.modalBody, true);
            Restangular.all('punishmentRequestDetailRsService/reject').post(vm.insertForm).then(function(res){
                kendo.ui.progress(vm.modalBody, false);
                if(res && res.error) {
                    toastr.error(CommonService.translate(res.error));
                } else {
                    vm.cancel();
                    vm.doSearch();
                    toastr.success(CommonService.translate("Từ chối duyệt thành công"));
                    vm.cancel();
                }
                // vm.cancel();
            },function(error){
                console.log(error);
                toastr.error(CommonService.translate("Có lỗi xảy ra"));
                kendo.ui.progress(vm.modalBody, false);
            })
        }

        function formatToCurrency(amount){
            return amount.toLocaleString('it-IT', {style : 'currency', currency : 'VND'});
        }

        vm.approveKtnb = function(dataItem) {
            confirm(CommonService.translate("P.PC&KSNB xác nhận duyệt chế tài."), function (){
                var obj  = angular.copy(dataItem);
                kendo.ui.progress(vm.documentBody, true);
                Restangular.all('punishmentRequestDetailRsService/approveKtnb').post(obj).then(function(res){
                    if(res && res.error) {
                        toastr.error(CommonService.translate(res.error));
                    } else {
                        toastr.success(CommonService.translate("Xác nhận duyệt thành công !!!"));
                        vm.doSearch();
                    }
                    kendo.ui.progress(vm.documentBody, false);
                },function (error) {
                    console.log(error);
                    toastr.error(CommonService.translate("Có lỗi xảy ra!"));
                })
            });
        }

        vm.rejectKtnb = function(dataItem) {
            var templateUrl = 'ktnb/punishmentRequestDetail/punishmentRequestDetailRejectPopup.html';
            var title = CommonService.translate("Lý do từ chối");
            vm.typeReject = 'KTNB';
            vm.insertForm = angular.copy(dataItem);
            vm.modalAdd1 = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "40%", null, null);
        }

        vm.rejectRequestKtnb = function(){
            if(vm.insertForm.rejectKtnbDescription == null){
                toastr.error(CommonService.translate("lý do từ chối không được để trống!"));
                return;
            }
            kendo.ui.progress(vm.modalBody, true);
            Restangular.all('punishmentRequestDetailRsService/rejectKtnb').post(vm.insertForm).then(function(res){
                kendo.ui.progress(vm.modalBody, false);
                if(res && res.error) {
                    toastr.error(CommonService.translate(res.error));
                } else {
                    vm.cancel();
                    vm.doSearch();
                    toastr.success(CommonService.translate("Từ chối duyệt thành công"));
                    vm.cancel();
                }
                // vm.cancel();
            },function(error){
                console.log(error);
                toastr.error(CommonService.translate("Có lỗi xảy ra"));
                kendo.ui.progress(vm.modalBody, false);
            })
        }

        vm.listFileAttach = [];
        vm.viewDetail = function(dataItem){
            var templateUrl = 'ktnb/punishmentRequestDetail/punishmentRequestDetailReservePopup.html';
            var title = CommonService.translate("Chi tiết chế tài phạt");
            vm.typeReserve = 'detail';
            var x = [];
            x.push(dataItem);
            vm.insertForm = angular.copy(dataItem);
            vm.modalAdd1 = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "70%", null, null);
            fillDataPunishmentRequestDetailReserve(x);
            Restangular.all('commonRsService/getFileAttach').post({objectId: vm.insertForm.punishmentRequestDetailId, type: 'PUNISHMENT_REQUEST_RESERVE'}).then(function(res) {
                vm.listFileAttach = res.data;
                fillFileTable([]);
            }, function (err){
                toastr.error("Có lỗi xảy ra khi lấy file đính kèm: "+err.message);
            });
        }

        function fillDataPunishmentRequestDetailReserve(data){
            vm.punishmentRequestDetailGridReserveOptions = kendoConfig.getGridOptions({
                reorderable: true,
                autoBind: true,
                resizable: true,
                dataSource: data,
                noRecords: true,
                columnMenu: false,
                scrollable: true,
                editable: false,
                messages: {
                    noRecords: CommonService.translate("Không có kết quả hiển thị")
                },
                columns: [
                    // {
                    //     title: CommonService.translate("Loại lỗi"),
                    //     field: 'type',
                    //     width: "10%",
                    //     headerAttributes: {
                    //         style: "text-align:center;font-weight: bold; white-space:normal",
                    //         translate: ""
                    //     },
                    //     attributes: {
                    //         style: "text-align:center; white-space:normal"
                    //     },
                    //     template: dataItem => getTypeName(dataItem.type),
                    // },
                    {
                        title: CommonService.translate("Tên lỗi vi phạm"),
                        field: 'name',
                        width: "15%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold; white-space:normal",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
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
                    },
                    {
                        title: CommonService.translate("Đơn vị xây dựng vi phạm"),
                        field: "groupName",
                        width: "12%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold;white-space:normal",
                            translate: ""
                        },
                        attributes: {style: "text-align:left;white-space:normal"},
                    },
                    {
                        title: CommonService.translate("Lĩnh vực"),
                        field: "field",
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold;white-space:normal",
                            translate: ""
                        },
                        attributes: {style: "text-align:center;white-space:normal"},
                    },
                    {
                        title: CommonService.translate("Mức chế tài"),
                        field: 'sanction',
                        width: "5%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold; white-space:normal",
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
                        title: CommonService.translate("Tổng tiền phạt"),
                        field: 'total',
                        width: "5%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold; white-space:normal",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem => formatToCurrency(dataItem.sanction*dataItem.numberViolation),
                    }, {
                        title: CommonService.translate("Trạng thái duyệt"),
                        field: 'status',
                        width: "7%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold; white-space:normal",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem => dataItem.status===0?'Chờ duyệt':dataItem.status===1?'Đã duyệt':dataItem.status===2?'Từ chối':'',
                    }, {
                        title: CommonService.translate("Đầu mối liên hệ"),
                        field: 'createByName',
                        width: "15%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold; white-space:normal",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    }
                ]
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
                ]
            });
            try{
                $("#listAttachDocumentGrid").data("kendoGrid").dataSource.data(vm.listFileAttach);
            } catch (exception){}
        }

        vm.downloadFile = function(dataItem) {
            window.location = Constant.BASE_SERVICE_URL + "fileservice/downloadFileATTT?" + dataItem.filePath;
        }

        var modal = null;
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

        vm.clear = function(type){
            if(type==='field'){
                vm.searchForm.field = null;
            } else if(type==='sanction'){
                vm.searchForm.fromSanction = null;
                vm.searchForm.toSanction = null;
            } else if (type === 'codeSearch') {
                vm.searchForm.code = null;
            } else if (type === 'sysGroupRequestSearch') {
                vm.searchForm.sysGroupIdRequest = null;
                vm.searchForm.sysGroupNameRequest = null;
            } else if (type === 'createByNameSearch') {
                vm.searchForm.createBy = null;
                vm.searchForm.createByName = null;
            }
        }

        vm.listFileAttachApproved = [];
        vm.onSelectFileApproved = function (e) {
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
            if (vm.listFileAttachApproved != null) {
                for (var h = 0; h < vm.listFileAttachApproved.length; h++) {
                    if (vm.listFileAttachApproved[h].name == $("#files")[0].files[0].name) {
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
                        vm.listFileAttachApproved = $("#listAttachDocumentApprovedGrid").data("kendoGrid").dataSource._data;
                        var obj = {};
                        obj.name = file.name;
                        obj.utilAttachDocumentId = null;
                        obj.filePath = data[index];
                        obj.createdDate = kendo.toString(new Date((new Date()).getTime()), "dd/MM/yyyy");
                        obj.createdUserId = Constant.user.VpsUserInfo.sysUserId;
                        obj.createdUserName = Constant.user.VpsUserInfo.fullName;
                        vm.listFileAttachApproved.push(obj);
                    })
                    refreshGrid(vm.listFileAttachApproved);
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
            var grid = vm.listAttachDocumentApprovedGrid;
            if (grid) {
                grid.dataSource.data(d);
                grid.refresh();
            }
        }

        vm.gridFileOptionsApproved = kendoConfig.getGridOptions({
            autoBind: true,
            scrollable: false,
            resizable: true,
            editable: false,
            dataSource: {
                data: [],
                pageSize: 5
            },
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
                    template: dataItem => $("#listAttachDocumentApprovedGrid").data("kendoGrid").dataSource.indexOf(dataItem) + 1,
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
                            'ng-click="caller.removeDetail(dataItem)" > <i style="color:steelblue;" class="fa fa-trash ng-scope" aria-hidden="true"></i></button>':'';
                    },
                    editable: false
                }
            ]
        });

        vm.removeDetail = function(dataItem){
            $('#listAttachDocumentApprovedGrid').data('kendoGrid').dataSource.remove(dataItem);
            toastr.success(CommonService.translate("Xóa bản ghi thành công!!"));

        }

        vm.listRemove = [{
            title: CommonService.translate("Thao tác"),
        }];
        vm.listConvert = [
            {
                field: "status",
                data: {
                    0: 'Chờ duyệt',
                    1: 'Đã duyệt',
                    2: 'Từ chối'
                }
            },
            {
                field: "reserve",
                data: {
                    1: 'Có',
                    null: '',
                    0: 'Không'
                }
            },
            {
                field: "statusKtnb",
                data: {
                    0: 'Chờ duyệt',
                    1: 'Đã duyệt',
                    2: 'Từ chối'
                }
            },
        ];

        vm.exportExcelGrid =function () {
            kendo.ui.progress(vm.documentBody, true);
            var obj = angular.copy(vm.searchForm);
            obj.page = null;
            obj.pageSize = null;
            punishmentRequestDetailService.doSearch(obj).then(function (d) {
                kendo.ui.progress(vm.documentBody, false);
                var data = d.data;
                CommonService.exportFile(vm.punishmentRequestDetailGrid, data, vm.listRemove, vm.listConvert, CommonService.translate("Danh sách phản hồi chế tài"));
            });
        }

        vm.showHideColumn = function (column) {
            if (angular.isUndefined(column.hidden)) {
                vm.punishmentRequestDetailGrid.hideColumn(column);
            } else if (column.hidden) {
                vm.punishmentRequestDetailGrid.showColumn(column);
            } else {
                vm.punishmentRequestDetailGrid.hideColumn(column);
            }
        };

    }
})();
