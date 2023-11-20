(function () {
    'use strict';
    var controllerId = 'riskIndexController';

    angular.module('MetronicApp').controller(controllerId, riskIndexController);

    function riskIndexController($scope,$http, $templateCache, $rootScope, $timeout, gettextCatalog,
                                 kendoConfig, $kWindow, $q, riskIndexService,
                                 CommonService, htmlCommonService, PopupConst, Restangular, RestEndpoint, Constant) {
        var vm = this;
        vm.documentBody = $(".tab-content");
        vm.modalBody = '.k-window';
        vm.searchForm = {};
        vm.searchForm.status = 1;
        vm.insertForm = {};
        vm.detailForm = {};
        vm.addPopup = {};
        vm.listDelete = [];
        vm.listRemove = [{
            title: CommonService.translate("Thao tác"),
        }];
        vm.listConvert = [
            {
                field: "status",
                data: {
                    0: 'Hết hiệu lực',
                    1: 'Hiệu lực'
                }
            },
            {
                field: "typeKri",
                data: {
                    1: 'Cảnh báo',
                    2: 'Theo dõi',
                }
            },
            {
                field: "frequency",
                data: {
                    1: 'Tháng',
                    2: 'Quý',
                    3: 'Năm',
                }
            },
        ];
        vm.listTypeKri = [
            {value:1, name: 'Cảnh báo'},
            {value:2, name: 'Theo dõi'}
        ];
        vm.listMeasureUnit = [];
        Restangular.all("commonRsService/getAppParam").post({parType:"KTNB_QTRR_MEASURE_UNIT"}).then(function (res) {
            if (res && res.error){
                toastr.error(CommonService.translate("Có lỗi xảy ra khi get param"));
            }
            if (res && res.data){
                for (var i = 0; i < res.data.length; i++){
                    var obj = {};
                    obj.name = res.data[i].name;
                    obj.value = res.data[i].code;
                    vm.listMeasureUnit.push(obj);
                }
            }
        },function (err) {
            console.log(err);
            toastr.error(CommonService.translate("Có lỗi xảy ra!"))
        });

        function getMeasureUnit(id){
            for (let i = 0; i < vm.listMeasureUnit.length; i++) {
                if(id==vm.listMeasureUnit[i].value){
                    return vm.listMeasureUnit[i].name;
                }
            }
            return '';
        }

        vm.listFrequency = [
            {value:1, name: 'Tháng'},
            {value:2, name: 'Quý'},
            {value:3, name: 'Năm'},
            {value:4, name: '6 tháng'}
        ];

        vm.listAcceptanceValue = [
            {value:1, name: 'Cao hơn'},
            {value:2, name: 'Thấp hơn'},
        ]

        vm.listSystem = [];
        Restangular.all("commonRsService/getAppParam").post({parType:"KTNB_QTRR_CALCULATING_SYSTEM"}).then(function (res) {
            if (res && res.error){
                toastr.error(CommonService.translate("Có lỗi xảy ra khi get param"));
            }
            if (res && res.data){
                for (var i = 0; i < res.data.length; i++){
                    var obj = {};
                    obj.name = res.data[i].name;
                    obj.value = res.data[i].code;
                    vm.listSystem.push(obj);
                }
            }
        },function (err) {
            console.log(err);
            toastr.error(CommonService.translate("Có lỗi xảy ra!"))
        });

        function getSystem(id){
            for (let i = 0; i < vm.listSystem.length; i++) {
                if(id==vm.listSystem[i].value){
                    return vm.listSystem[i].name;
                }
            }
            return '';
        }

        vm.currentMonth = new Date().getMonth()+1;
        vm.thisYear = 'Năm ' + new Date().getFullYear();
        initForm();
        function initForm() {
            if ($rootScope.stringtile) {
                vm.String = CommonService.translate("Quản trị rủi ro") + " > "+ CommonService.translate("Quản lý chỉ số rủi ro");
            }
            fillDataRiskIndex([]);
        }

        Restangular.all("commonRsService/checkPermission").post({sysUserId: Constant.user.vpsUserToken.sysUserId, adResourceCode:"RISK_INDEX", operationCode:"UPDATE"}).then(function(d){
            vm.isRoleUpdate = d;
            // vm.isRoleUpdate = true;
            console.log(vm.isRoleUpdate)
        }, function(){
            console.log('Có lỗi xảy ra khi check quyền');
        });

        vm.doSearch = function () {
            var grid = $("#riskIndexGrid").data("kendoGrid");
            if (grid) {
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        }

        var recordRiskIndex = 0;
        vm.countRiskIndex = 0;
        function fillDataRiskIndex(data) {
            vm.riskIndexGridOptions = kendoConfig.getGridOptions({
                autoBind: true,
                resizable: true,
                toolbar: [
                    {
                        name: "actions",
                        template:
                            '<div class=" pull-left con-md-2 ">' +
                            '<button ng-if="vm.isRoleUpdate" type="button" class="btn btn-qlk padding-search-right addQLK ng-scope" style="width: 120px; margin-top: 12px" ng-click="vm.create()">Thêm mới'+
                            '</button>' +
                            '</div>' + '<div ng-show="vm.isRoleUpdate" class="form-group col-md-10">\n' +
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
                            '                <div ng-if="vm.isRoleUpdate" class="form-group col-md-5" align="right" id="hiden12">\n' +
                            '                    <i style="color: gray; margin-right:  50px;">Dung lượng <= 100MB, định dạng xls,xlsx</i>\n' +
                            '                </div>'
                    }
                ],
                dataBinding: function () {
                    recordRiskIndex = (this.dataSource.page() - 1) * this.dataSource.pageSize();
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
                            vm.countRiskIndex = response.total;
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
                            url: Constant.BASE_SERVICE_URL + "riskIndexRsService/doSearch",
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
                        title: CommonService.translate("TT"),
                        field: "stt",
                        template: function () {
                            return ++recordRiskIndex;
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
                        title: CommonService.translate("Tên rủi ro"),
                        field: 'riskProfileName',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Mã rủi ro"),
                        field: 'riskProfileCode',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Mã KRI"),
                        field: 'code',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem => {
                            return '<a ng-click="vm.view(dataItem)">'+ dataItem.code+'</a>'
                        }
                    },
                    {
                        title: CommonService.translate("Chủ sở hữu rủi ro"),
                        field: 'riskProfileGroupName',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Mô tả KRI"),
                        field: 'description',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Loại KRI"),
                        field: 'typeKri',
                        width: "7%",
                        template: function (dataItem){
                            switch (dataItem.typeKri) {
                                case 1: return 'Cảnh báo'; break;
                                case 2: return 'Theo dõi'; break;
                                default: return ''; break;
                            }
                        },
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Ngưỡng cảnh báo"),
                        field: 'alertValue',
                        width: "8%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Ngưỡng chú ý"),
                        field: 'warningValue',
                        width: "8%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Đơn vị đo"),
                        field: 'measureUnit',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem => getMeasureUnit(dataItem.measureUnit)
                    },
                    {
                        title: CommonService.translate("Tần suất đo"),
                        field: 'frequency',
                        width: "10%",
                        template: function (dataItem){
                            switch (dataItem.frequency) {
                                case 1: return 'Tháng'; break;
                                case 2: return 'Quý'; break;
                                case 3: return 'Năm'; break;
                                case 4: return '6 tháng'; break;
                                default: return ''; break;
                            }
                        },
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Phụ trách tính toán"),
                        field: 'sysGroupName',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;white-space:normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Dữ liệu cần thu thập"),
                        field: 'dataKri',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold; white-space: normal",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Công thức tính toán"),
                        field: 'formula',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold; white-space: normal;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Hệ thống hỗ trợ tính toán"),
                        field: 'calculatingSystem',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold; white-space:normal",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                        template: dataItem => getSystem(dataItem.calculatingSystem)
                    },
                    {
                        title: CommonService.translate("Thao tác"),
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate:""
                        },
                        template: dataItem =>
                            '<div class="text-center #=assetLiquidateReqId#"">' +
                            '<button ng-if="dataItem.status==1&&dataItem.isHavingKri==0&&vm.isRoleUpdate" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Cập nhật" translate ' +
                            'ng-click="vm.update(dataItem)" ><i class="fa fa-pencil ng-scope" aria-hidden="true" translate></i></button>'
                            +
                            '<button ng-if="dataItem.status==1&&dataItem.isHavingWo===null&&vm.isRoleUpdate" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Hết hiệu lực" translate ' +
                            'ng-click="vm.remove(dataItem)" > <i style="color:steelblue;" class="fa fa-trash ng-scope" aria-hidden="true"></i></button>'
                            +
                            '<button ng-if="dataItem.status==1" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Cập nhật giá trị KRI" translate ' +
                            'ng-click="vm.updateDetail(dataItem)" > <i style="color:#0bb8ec;" class="fa fa-plus ng-scope" aria-hidden="true"></i></button>'
                            +
                            '</div>',

                        width: "10%",
                        field: "stt"
                    }
                ]
            });
        }

        vm.isCreateForm = false;
        var modalAdd;
        vm.create = function () {
            vm.type = 'create';
            vm.insertForm = {};
            vm.isCreateForm = true;
            var templateUrl = 'ktnb/riskIndex/riskIndexPopup.html';
            var title = CommonService.translate("Thêm mới chỉ số rủi ro");
            modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "50%", null, null);
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

        //autocomplete chủ sở hữu KRI //
        vm.isSelectSysGroupDvg = false;
        vm.sysGroupInsertOptions = {
            clearButton: false,
            dataTextField: "name",
            placeholder: CommonService.translate("Nhập mã hoặc tên KCQ TCT"),
            dataValueField: "name",
            open: function (e) {
                vm.isSelectSysGroupDvg = false;
            },
            select: function (e) {
                vm.isSelectSysGroupDvg = true;
                var dataItem = this.dataItem(e.item.index());
                vm.insertForm.sysGroupName = dataItem.name;
                vm.insertForm.sysGroupId = dataItem.sysGroupId;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSysGroupDvg) {
                        vm.insertForm.sysGroupName = null;
                        vm.insertForm.sysGroupId = null;
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
                        return Restangular.all("commonRsService/getSysGroupForAutoComplete2").post(
                            {
                                keySearch: vm.insertForm.sysGroupName,
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
                '<p class="col-md-12 text-header-auto bold" translate>Tên đơn vị</p>' +
                '</div>' +
                '</div>',
            template: '<div class="row" ><div  style="padding-left: 5px;width:auto;overflow: hidden"> #: data.name #</div> </div>',
        }

        var modal = null;
        vm.openPopupSysGroup = function(){
            var templateUrl = "ktnb/popup/popupCommonSearch.html";
            var title = CommonService.translate("Tìm kiếm đơn vị");
            var windowId = "POPUP_SELECT_SYS_GROUP";
            vm.placeHolder = CommonService.translate("Mã/tên đơn vị");
            CommonService.populatePopupCreate(templateUrl, title, null, vm, windowId, null, '60%', '50%', null);
            setTimeout(function () {
                modal = CommonService.getModalInstance1();
            }, 100);
            vm.commonPopupSearch = {};
            var api = "commonRsService/getSysGroupForAutoComplete2";
            CommonService.fillDataPopupCommonSearch(api, vm.commonPopupSearch, sysGroupColumns, vm);
        }

        var sysGroupColumns = [
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
                    '	   <i ng-click="caller.saveSelectSysGroup(dataItem)" class="fa fa-check color-green" aria-hidden="true"></i> ' +
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

        vm.saveSelectSysGroup = function (dataItem) {
            vm.insertForm.sysGroupId = dataItem.sysGroupId;
            vm.insertForm.email = dataItem.email;
            vm.insertForm.sysGroupName = dataItem.sysGroupNameLv2;
            modal.dismiss();
        }

        //end - autocomplete chủ sở hữu KRI //

        //autocomplete riskProfile//

        vm.isSelectRiskProfileDvg = false;
        vm.riskProfileInsertOptions = {
            clearButton: false,
            dataTextField: "code",
            placeholder: CommonService.translate("Nhập mã hoặc tên rủi ro"),
            dataValueField: "code",
            open: function (e) {
                vm.isSelectRiskProfileDvg = false;
            },
            select: function (e) {
                vm.isSelectRiskProfileDvg = true;
                var dataItem = this.dataItem(e.item.index());
                vm.insertForm.riskProfileCode = dataItem.code;
                vm.insertForm.riskProfileName = dataItem.name;
                vm.insertForm.riskProfileId = dataItem.riskProfileId;
                vm.insertForm.riskProfileGroupName = dataItem.sysGroupName;
                vm.insertForm.status = dataItem.status;
                vm.genCode();
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectRiskProfileDvg) {
                        vm.insertForm.riskProfileCode = null;
                        vm.insertForm.riskProfileName = null;
                        vm.insertForm.riskProfileId = null;
                        vm.insertForm.riskProfileGroupName = null;
                        vm.insertForm.status = null;
                        vm.insertForm.code = null;
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
                        vm.isSelectRiskProfileDvg = false;
                        return Restangular.all("commonRsService/getRiskProfileForAutoComplete").post(
                            {
                                keySearch: vm.insertForm.riskProfileCode,
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

            headerTemplate: '<div class="dropdown-header row text-center k-widget k-header">' +
                '<p class="col-md-6 text-header-auto bold">Mã rủi ro</p>' +
                '<p class="col-md-6 text-header-auto bold">Tên rủi ro</p>' +
                '</div>',
            template: '<div class="row" style="display: flex"><div style="float:left; width: 50%;">#: data.code #</div><div style="width:50%;overflow: hidden"> #: data.name #</div></div>',
        }

        vm.openPopupRiskProfile = function(){
            var templateUrl = "ktnb/popup/popupCommonSearch.html";
            var title = CommonService.translate("Tìm kiếm rủi ro");
            var windowId = "POPUP_SELECT_RISK_PROFILE";
            vm.placeHolder = CommonService.translate("Mã/tên rủi ro");
            CommonService.populatePopupCreate(templateUrl, title, null, vm, windowId, null, '60%', '50%', null);
            setTimeout(function () {
                modal = CommonService.getModalInstance1();
            }, 100);
            vm.commonPopupSearch = {};
            var api = "commonRsService/getRiskProfileForAutoComplete";
            CommonService.fillDataPopupCommonSearch(api, vm.commonPopupSearch, riskProfileColumns, vm);
        }

        var riskProfileColumns = [
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
                title: CommonService.translate("Mã rủi ro"),
                field: 'code',
                width: "20%",
                headerAttributes: {
                    style: "text-align:center;", translate: "",
                },
                attributes: {
                    style: "text-align:left;"
                },
            }, {
                title: CommonService.translate("Tên rủi ro"),
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
                    '	   <i ng-click="caller.saveSelectRiskProfile(dataItem)" class="fa fa-check color-green" aria-hidden="true"></i> ' +
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

        vm.saveSelectRiskProfile = function (dataItem) {
            vm.insertForm.riskProfileCode = dataItem.code;
            vm.insertForm.riskProfileName = dataItem.name;
            vm.insertForm.riskProfileId = dataItem.riskProfileId;
            vm.insertForm.riskProfileGroupName = dataItem.sysGroupName;
            vm.insertForm.status = dataItem.status;
            vm.genCode();
            modal.dismiss();
        }

        // end - autocomplete riskProfile//
        vm.cancel = function () {
            if(modalAdd1!==null){
                modalAdd1.dismiss();
                modalAdd1 = null;
            }
            else{
                modalAdd.dismiss();
            }
        }

        vm.genCode = function () {
            var obj = {};
            if(vm.insertForm.riskProfileId!=null){
                obj.riskProfileId = vm.insertForm.riskProfileId;
                Restangular.all("riskIndexRsService/getSequenceCode").post(obj).then(function(res){
                    if(res.data){
                        // if(res.data.length<5){
                        //     var sequence = res.data.length + 1;
                        //     vm.insertForm.code = vm.insertForm.riskProfileCode + ".0" + sequence;
                        // }
                        // else {
                        //     vm.insertForm.riskProfileCode = null;
                        //     vm.insertForm.riskProfileName = null;
                        //     vm.insertForm.riskProfileId = null;
                        //     vm.insertForm.riskProfileGroupName = null;
                        //     vm.insertForm.status = null;
                        //     toastr.error(CommonService.translate("Rủi ro đã tồn tại 5 mã KRI."));
                        // }
                        if(res.data.length<9){
                            var sequence = res.data.length + 1;
                            vm.insertForm.code = vm.insertForm.riskProfileCode + ".0" + sequence;
                        }
                        else {
                            var sequence2 = res.data.length + 1;
                            vm.insertForm.code = vm.insertForm.riskProfileCode + "." + sequence2;
                        }
                    }
                },function (e) {
                    console.log(e);
                    toastr.error(CommonService.translate("Có lỗi xảy ra khi tự động gen code."));
                });
            }
        }

        vm.save = function (){
            if(vm.insertForm.riskProfileCode == null){
                toastr.error(CommonService.translate("Mã rủi ro không được để trống!"));
                return;
            }
            if(vm.insertForm.description == null){
                toastr.error(CommonService.translate("Mô tả KRI không được để trống!"));
                return;
            }
            if(vm.insertForm.typeKri == null){
                toastr.error(CommonService.translate("Loại KRI không được để trống!"));
                return;
            }
            if(vm.insertForm.alertValue == null){
                toastr.error(CommonService.translate("Ngưỡng cảnh báo không được để trống!"));
                return;
            }
            if(vm.insertForm.warningValue == null){
                toastr.error(CommonService.translate("Ngưỡng chú ý không được để trống!"));
                return;
            }
            if(vm.insertForm.acceptanceValue == null){
                toastr.error(CommonService.translate("Mức chấp nhận ngưỡng không được để trống!"));
                return;
            }
            //acceptanvalue = 1 cao hon thi canh bao < chu y
            //acceptanvalue = 2 thap hon thi canh bao > chu y
            if(vm.insertForm.warningValue > vm.insertForm.alertValue && vm.insertForm.acceptanceValue==2){
                toastr.error(CommonService.translate("Ngưỡng chú ý phải nhỏ hơn hoặc bằng ngưỡng cảnh báo!"));
                return;
            }
            if(vm.insertForm.warningValue < vm.insertForm.alertValue && vm.insertForm.acceptanceValue==1){
                toastr.error(CommonService.translate("Ngưỡng chú ý phải lớn hơn hoặc bằng ngưỡng cảnh báo!"));
                return;
            }
            if(vm.insertForm.measureUnit == null){
                toastr.error(CommonService.translate("Đơn vị đo lường KRI không được để trống!"));
                return;
            }
            if(vm.insertForm.frequency == null){
                toastr.error(CommonService.translate("Tần suất đo không được để trống!"));
                return;
            }
            if(vm.insertForm.sysGroupId == null){
                toastr.error(CommonService.translate("Phụ trách tính toán không được để trống!"));
                return;
            }
            kendo.ui.progress($(vm.modalBody), true);
            if(vm.isCreateForm){
                Restangular.all("riskIndexRsService/save").post(vm.insertForm).then(function(res){
                    toastr.success(CommonService.translate("Lưu dữ liệu thành công!"));
                    vm.doSearch();
                    vm.cancel();
                    kendo.ui.progress($(vm.modalBody), false);
                },function (error) {
                    console.log(error);
                    toastr.error(CommonService.translate("Có lỗi xảy ra!"));
                    kendo.ui.progress($(vm.modalBody), false);
                });
            } else {
                Restangular.all("riskIndexRsService/update").post(vm.insertForm).then(function(res){
                    toastr.success(CommonService.translate("Cập nhật dữ liệu thành công!"));
                    kendo.ui.progress($(vm.modalBody), false);
                    vm.doSearch();
                    vm.cancel();
                },function (error) {
                    console.log(error);
                    toastr.error(CommonService.translate("Có lỗi xảy ra!"));
                    kendo.ui.progress($(vm.modalBody), false);
                });
            }
        }

        vm.update = function(dataItem){
            vm.type = 'update';
            vm.isCreateForm = false;
            vm.insertForm = angular.copy(dataItem);
            vm.insertForm.measureUnit = vm.insertForm.measureUnit+"";
            var templateUrl = 'ktnb/riskIndex/riskIndexPopup.html';
            var title = CommonService.translate("Cập nhật chỉ số rủi ro");
            modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "50%", null, null);
            fillKriTable(vm.insertForm.frequency);
        }

        vm.remove = function(dataItem){
            confirm(CommonService.translate("Bạn có chắc chắn muốn hết hiệu lực bản ghi này?"), function () {
                vm.insertForm = angular.copy(dataItem);
                kendo.ui.progress(vm.documentBody, true);
                riskIndexService.remove(vm.insertForm).then(function () {
                    toastr.success(CommonService.translate("Hết hiệu lực bản ghi thành công."));
                    vm.doSearch();
                    kendo.ui.progress(vm.documentBody, false);
                }, function (err) {
                    toastr.error(CommonService.translate("Có lỗi xảy ra."));
                    kendo.ui.progress(vm.documentBody, false);
                });
            });
        }

        vm.updateDetail = function(dataItem){
            vm.type = 'updateDetail';
            vm.isCreateForm = false;
            vm.insertForm = angular.copy(dataItem);
            vm.insertForm.measureUnit = vm.insertForm.measureUnit+"";
            // Restangular.all("riskIndexRsService/getRiskIndexDetail").post(vm.insertForm).then(function(res){
            var templateUrl = 'ktnb/riskIndex/riskIndexPopup.html';
            var title = CommonService.translate("Cập nhật giá trị KRI");
            modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "50%", null, null);
            fillKriTable(vm.insertForm.frequency);
            // },function (error) {
            //     console.log(error);
            //     toastr.error(CommonService.translate("Có lỗi xảy ra!"));
            //     kendo.ui.progress($(vm.modalBody), false);
            // });
        }

        vm.isEditable = function(timeIndex,year){
            if(vm.insertForm.frequency===1){
                return timeIndex>=vm.currentMonth;
            }
            if(vm.insertForm.frequency===2){
                return timeIndex>=vm.currentMonth/3+1;
            }
            if(vm.insertForm.frequency===3){
                return new Date().getFullYear()<=year;
            }
            if(vm.insertForm.frequency===4){
                return new Date().getFullYear()<=year;
            }
            return false;
        }

        var record = 0;
        function fillKriTable(type) {
            vm.kriValueGridOptions = kendoConfig.getGridOptions({
                autoBind: true,
                scrollable: false,
                resizable: true,
                toolbar: [
                    {
                        name: "actions",
                        template: '<div class=" pull-left " ng-show="caller.type===\'updateDetail\'">' +
                            '<button  type="button" class="btn btn-qlk padding-search-right addQLK ng-scope" style="width: 120px" ng-click="caller.push()">Thêm mới' +
                            '</button>' +
                            '</div>'
                    }
                ],
                dataSource:{
                    serverPaging: false,
                    transport: {
                        read: {
                            url: Constant.BASE_SERVICE_URL + "riskIndexRsService/getRiskIndexDetail",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, type) {
                            return JSON.stringify(vm.insertForm);
                        }
                    },
                    schema: {
                        errors: function (response) {
                            if (response.error) {
                                toastr.error(response.error);
                            }
                            return response.error;
                        },
                        total: function (response) {
                            $("#countAssetReduce").text("" + response.total);
                            vm.countIndex = response.total;
                            return response.total;
                        },
                        data: function (response) {
                            var list = response.data;
                            return list;
                        },
                    },
                    sort: {
                        field: "timeIndex",
                        dir: "asc"
                    },
                    pageSize: 10
                },
                dataBinding: function () {
                    record = (this.dataSource.page() - 1) * this.dataSource.pageSize();
                },
                noRecords: true,
                columnMenu: false,
                messages: {
                    noRecords: gettextCatalog.getString("<div style='margin:5px'>Không có kết quả hiển thị</div>")
                },
                pageable: {
                    refresh: false,
                    pageSizes: [10, 15, 20, 25],
                    messages: {
                        display: "{0}-{1} của {2} kết quả",
                        itemsPerPage: "kết quả/trang",
                        empty: "<div style='margin:5px'>Không có kết quả hiển thị</div>"
                    }
                },
                columns: [
                    {
                        title: "STT",
                        field: "",
                        template: function (dataItem) {
                            return  getColors(vm.insertForm.acceptanceValue,++record,vm.insertForm.warningValue,vm.insertForm.alertValue,dataItem.kriValue);
                        },
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold;",
                            translate: ""
                        },
                        hidden: false,
                        attributes: {
                            style: "text-align:center;"
                        },
                    },
                    {
                        title: "Thời điểm",
                        field: "timeIndex",
                        template: function (dataItem) {
                            if(dataItem.timeIndex!=null){
                                if(type===1){
                                    return getColors(vm.insertForm.acceptanceValue,'Tháng '+dataItem.timeIndex,vm.insertForm.warningValue,vm.insertForm.alertValue,dataItem.kriValue);
                                } else if(type===2){
                                    return getColors(vm.insertForm.acceptanceValue,'Quý '+dataItem.timeIndex,vm.insertForm.warningValue,vm.insertForm.alertValue,dataItem.kriValue);
                                } else if(type===3){
                                    return getColors(vm.insertForm.acceptanceValue,'Năm '+dataItem.year,vm.insertForm.warningValue,vm.insertForm.alertValue,dataItem.kriValue);
                                } else {
                                    return getColors(vm.insertForm.acceptanceValue,'6 tháng' + (dataItem.timeIndex==1?' đầu ':' cuối ')+'năm '+dataItem.year,vm.insertForm.warningValue,vm.insertForm.alertValue,dataItem.kriValue);
                                }
                            }
                            else return '';
                        },
                        width: "20%",
                        headerAttributes: {
                            style: "text-align:center; font-weight: bold;",
                            translate: ""
                        },
                        hidden: false,
                        attributes: {
                            style: "text-align:center;"
                        },
                        type: 'number',
                        editable: false,
                    },
                    {
                        title: CommonService.translate("Năm"),
                        field: "year",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center;white-space:normal;"
                        },
                        template: function(dataItem){
                            return getColors(vm.insertForm.acceptanceValue, dataItem.year,vm.insertForm.warningValue,vm.insertForm.alertValue,dataItem.kriValue);
                        },
                        hidden: false,
                        width: "20%",
                        type: 'number',
                        editable: false,
                    },
                    {
                        title: CommonService.translate("Giá trị KRI"),
                        field: "kriValue",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center;white-space:normal; "
                        },
                        template: function(dataItem){
                            return getColors(vm.insertForm.acceptanceValue ,dataItem.kriValue,vm.insertForm.warningValue,vm.insertForm.alertValue,dataItem.kriValue);
                        },
                        hidden: false,
                        width: "20%",
                        type: 'number',
                        editable: false,
                    },
                    {
                        title: CommonService.translate("Ngày tạo"),
                        field: "createDate",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center;white-space:normal;"
                        },
                        template: function(dataItem){
                            return getColors(vm.insertForm.acceptanceValue ,dataItem.createDate,vm.insertForm.warningValue,vm.insertForm.alertValue,dataItem.kriValue);
                        },
                        hidden: false,
                        width: "20%",
                    },
                    {
                        title: CommonService.translate("Đánh giá"),
                        field: "commentRisk",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center;white-space:normal;"
                        },
                        hidden: false,
                        width: "20%",
                        template: (dataItem) => vm.danhGiaKRI(vm.insertForm.acceptanceValue ,vm.insertForm.warningValue,vm.insertForm.alertValue,dataItem.kriValue)
                    },
                    {
                        title: CommonService.translate("Tình trạng"),
                        field: "state",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center;white-space:normal; font-weight: bold;"
                        },
                        template: function(dataItem){
                            return dataItem.state==1?getColors(vm.insertForm.acceptanceValue ,"Quá hạn",vm.insertForm.warningValue,vm.insertForm.alertValue,dataItem.kriValue)
                                :dataItem.state==0?getColors(vm.insertForm.acceptanceValue ,"Trong hạn",vm.insertForm.warningValue,vm.insertForm.alertValue,dataItem.kriValue):'';
                        },
                        hidden: false,
                        width: "20%",
                        type: 'number',
                        editable: false,
                    },
                    {
                        title: CommonService.translate("Thao tác"),
                        field: "",
                        template: dataItem =>
                            //ng-if="caller.type=='updateDetail'&&dataItem.type==1"
                            '<div class="text-center #=assetLiquidateReqId#"">' +
                            '<button ng-if="((caller.isEditable(dataItem.timeIndex,dataItem.year)||dataItem.type===1)&&dataItem.isHavingWo===null)&&caller.type!==\'view\'" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Xóa" translate ' +
                            'ng-click="caller.deleteData(dataItem)" > <i style="color:steelblue;" class="fa fa-trash ng-scope" aria-hidden="true"></i></button>' +
                            '<button ng-if="((caller.isEditable(dataItem.timeIndex,dataItem.year)||dataItem.type===1)&&dataItem.isHavingWo===null)&&caller.type!==\'view\'" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Cập nhật" translate ' +
                            'ng-click="caller.updateData(dataItem)" > <i class="fa fa-pencil ng-scope" aria-hidden="true"></i></button>'
                            +'</div>',
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center;white-space:normal; "
                        },
                        hidden: false,
                        width: "10%"
                    },
                ],
            });
        }

        var modalAdd1 = null;
        vm.push=function (){
            vm.addPopup.typePopup = 'push';
            vm.addPopup.kriValue = null;
            vm.addPopup.kriValueAlert = null;
            vm.addPopup.timeIndex = null;
            switch (vm.insertForm.frequency){
                case 1:
                    // if(record>11){
                    //     toastr.error(CommonService.translate("Chỉ được nhập 12 dòng cho 12 tháng"))
                    // }
                    vm.frequencyAddPopup = 'Tháng';
                    vm.listTimeIndex = [
                        {name: 'Tháng 1', value: 1},
                        {name: 'Tháng 2', value: 2},
                        {name: 'Tháng 3', value: 3},
                        {name: 'Tháng 4', value: 4},
                        {name: 'Tháng 5', value: 5},
                        {name: 'Tháng 6', value: 6},
                        {name: 'Tháng 7', value: 7},
                        {name: 'Tháng 8', value: 8},
                        {name: 'Tháng 9', value: 9},
                        {name: 'Tháng 10', value: 10},
                        {name: 'Tháng 11', value: 11},
                        {name: 'Tháng 12', value: 12},
                    ];
                    var date = new Date();
                    // var currentMonth = date.getMonth();
                    // vm.listTimeIndex = vm.listTimeIndex.slice(currentMonth,12);
                    break;
                case 2:
                    // if(record>3){
                    //     toastr.error(CommonService.translate("Chỉ được nhập 4 dòng cho 4 quý"))
                    // }
                    vm.frequencyAddPopup = 'Quý';
                    vm.listTimeIndex = [
                        {name: 'Quý I', value: 1},
                        {name: 'Quý II', value: 2},
                        {name: 'Quý III', value: 3},
                        {name: 'Quý IV', value: 4},
                    ];
                    // var date = new Date();
                    // var currentMonth = date.getMonth()+1;
                    // var current3Month = currentMonth%3===0?currentMonth/3:currentMonth/3+1;
                    // vm.listTimeIndex = vm.listTimeIndex.slice(current3Month-1,4);
                    break;
                case 3:
                    // if(record>0){
                    //     toastr.error(CommonService.translate("Chỉ được nhập 1 dòng cho 1 năm"));
                    //     return;
                    // }
                    vm.frequencyAddPopup = 'Năm';
                    vm.listTimeIndex = [
                        {name: 'Năm '+(new Date().getFullYear()-1), value: -1},
                        {name: 'Năm '+new Date().getFullYear(), value: 0},
                        {name: 'Năm '+(new Date().getFullYear()+1), value: 1},
                    ];
                    break;
                case 4:
                    vm.frequencyAddPopup = '6 tháng';
                    vm.listTimeIndex = [
                        {name: '6 tháng đầu năm', value: 1},
                        {name: '6 tháng cuối năm', value: 2},
                    ];
                    break;
            }

            var templateUrl = 'ktnb/riskIndex/riskIndexAddDetail.html';
            var title = CommonService.translate("Thêm mới giá trị KRI");
            modalAdd1 = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "50%", "30%", null, null);
        }

        vm.deleteData=function(dataItem){
            switch (vm.insertForm.frequency){
                case 1: $('#kriValueGridThang').data('kendoGrid').dataSource.remove(dataItem);vm.listDelete.push(dataItem); break;
                case 2: $('#kriValueGridQuy').data('kendoGrid').dataSource.remove(dataItem);vm.listDelete.push(dataItem);break;
                case 3: $('#kriValueGridNam').data('kendoGrid').dataSource.remove(dataItem);vm.listDelete.push(dataItem);break;
                case 3: $('#kriValueGrid6Thang').data('kendoGrid').dataSource.remove(dataItem);vm.listDelete.push(dataItem);break;
            }
            toastr.success(CommonService.translate("Xóa bản ghi thành công!!"));
        }

        vm.saveKri = function(){
            if(vm.addPopup.timeIndex===null && vm.frequencyAddPopup!=='Năm'){
                toastr.error(CommonService.translate("Thời điểm không được để trống."));
                return;
            }

            if(vm.addPopup.kriValue===null){
                toastr.error(CommonService.translate("Giá trị KRI không được để trống."));
                return;
            }

            if(vm.addPopup.kriValue<0){
                toastr.error(CommonService.translate("Giá trị KRI không được phép âm"));
                return;
            }

            // if((parseInt(vm.addPopup.timeIndex)<0 || parseInt(vm.addPopup.timeIndex)>12 && vm.insertForm.frequency ===1) ||
            //     (parseInt(vm.addPopup.timeIndex)<0 || parseInt(vm.addPopup.timeIndex)>4 && vm.insertForm.frequency ===2) ){
            //     toastr.error(CommonService.translate("Thời điểm không tồn tại."));
            //     return;
            // }

            if(vm.insertForm.frequency!==3){
                var arr;
                switch (vm.insertForm.frequency){
                    case 1:
                        arr = $('#kriValueGridThang').data('kendoGrid').dataSource.data();
                        break;
                    case 2:
                        arr = $('#kriValueGridQuy').data('kendoGrid').dataSource.data();
                        break;
                    case 4:
                        arr = $('#kriValueGrid6Thang').data('kendoGrid').dataSource.data();
                        break;
                }

                for (let i = 0; i < arr.length; i++) {
                    if(vm.addPopup.timeIndex==arr[i].timeIndex){
                        toastr.error("Thời điểm đã có dữ liệu");
                        return;
                    }
                }
            } else {
                arr = $('#kriValueGridNam').data('kendoGrid').dataSource.data();
                for (let i = 0; i < arr.length; i++) {
                    if(vm.addPopup.timeIndex==-1){
                        vm.addPopup.year = new Date().getFullYear()-1;
                    } else if(vm.addPopup.timeIndex==0){
                        vm.addPopup.year = new Date().getFullYear();
                    } else if(vm.addPopup.timeIndex==1){
                        vm.addPopup.year = new Date().getFullYear()+1;
                    }
                    if(vm.addPopup.year==arr[i].year){
                        toastr.error("Thời điểm đã có dữ liệu");
                        return;
                    }
                }
            }
            kendo.ui.progress($(vm.modalBody),true);
            var data = {};
            data.kriValue = vm.addPopup.kriValue;
            data.kriValueAlert = vm.addPopup.kriValueAlert;
            if(vm.insertForm.frequency!==3){
                data.timeIndex = vm.addPopup.timeIndex;
            } else {
                data.timeIndex = 1;
            }
            data.type = 1;
            data.isHavingWo = null;
            if(vm.insertForm.frequency!==3){
                data.year = new Date().getFullYear();
            } else {
                if(vm.addPopup.timeIndex==-1){
                    data.year = new Date().getFullYear()-1;
                } else if(vm.addPopup.timeIndex==0){
                    data.year = new Date().getFullYear();
                } else if(vm.addPopup.timeIndex==1){
                    data.year = new Date().getFullYear()+1;
                }
            }
            data.state = null;
            data.commentRisk = vm.danhGiaKRIText(vm.insertForm.acceptanceValue,vm.insertForm.warningValue,vm.insertForm.alertValue,data.kriValue);
            switch (vm.insertForm.frequency){
                case 1: $('#kriValueGridThang').data('kendoGrid').dataSource.insert(data);$('#kriValueGridThang').data('kendoGrid').refresh(); break;
                case 2: $('#kriValueGridQuy').data('kendoGrid').dataSource.insert(data);$('#kriValueGridQuy').data('kendoGrid').refresh(); break;
                case 3: $('#kriValueGridNam').data('kendoGrid').dataSource.insert(data);$('#kriValueGridNam').data('kendoGrid').refresh();break;
                case 4: $('#kriValueGrid6Thang').data('kendoGrid').dataSource.insert(data);$('#kriValueGrid6Thang').data('kendoGrid').refresh();break;
            }
            kendo.ui.progress($(vm.modalBody),false);
            vm.cancel();
        }

        vm.saveIndex = function(){
            var obj = angular.copy(vm.insertForm);

            switch (vm.insertForm.frequency){
                case 1: vm.countEnd = $('#kriValueGridThang').data('kendoGrid').dataSource.data().length; obj.listRiskIndexDetail = $('#kriValueGridThang').data('kendoGrid').dataSource.data(); break;
                case 2: vm.countEnd = $('#kriValueGridQuy').data('kendoGrid').dataSource.data().length; obj.listRiskIndexDetail = $('#kriValueGridQuy').data('kendoGrid').dataSource.data(); break;
                case 3: vm.countEnd = $('#kriValueGridNam').data('kendoGrid').dataSource.data().length; obj.listRiskIndexDetail = $('#kriValueGridNam').data('kendoGrid').dataSource.data(); break;
                case 4: vm.countEnd = $('#kriValueGrid6Thang').data('kendoGrid').dataSource.data().length; obj.listRiskIndexDetail = $('#kriValueGrid6Thang').data('kendoGrid').dataSource.data(); break;
            }

            if(vm.countEnd===0) {
                toastr.warning(CommonService.translate("Không có dữ liệu giá trị KRI!"));
                return;
            }

            obj.listRiskIndexDetailRemove = vm.listDelete;
            console.log(obj.listRiskIndexDetailRemove);
            kendo.ui.progress($(vm.modalBody), true);
            Restangular.all("riskIndexRsService/saveIndex").post(obj).then(function(res){
                toastr.success(CommonService.translate("Lưu dữ liệu thành công!"));
                kendo.ui.progress($(vm.modalBody), false);
                vm.doSearch();
                vm.cancel();
            },function (error) {
                toastr.error(CommonService.translate("Có lỗi xảy ra!"));
                kendo.ui.progress($(vm.modalBody), false);
            });
        }

        vm.view = function (dataItem){
            vm.type = 'view';
            vm.isCreateForm = false;
            vm.insertForm = angular.copy(dataItem);
            vm.insertForm.measureUnit = vm.insertForm.measureUnit+"";
            var templateUrl = 'ktnb/riskIndex/riskIndexPopup.html';
            var title = CommonService.translate("Chi tiết chỉ số rủi ro");
            modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "50%", null, null);
            fillKriTable(vm.insertForm.frequency);
        }

        vm.changeValue = function (){
            vm.insertForm.isEdit = 1;
        }

        vm.isSelectSysGroupSearchDvg = false;

        vm.sysGroupKriSearchOptions = {
            clearButton: false,
            dataTextField: "name",
            placeholder: CommonService.translate("Nhập mã hoặc tên KCQ TCT"),
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
                        return Restangular.all("commonRsService/getSysGroupForAutoComplete2").post(
                            {
                                keySearch: vm.searchForm.sysGroupName,
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
                '<p class="col-md-12 text-header-auto bold" translate>Tên đơn vị</p>' +
                '</div>' +
                '</div>',
            template: '<div class="row" ><div  style="padding-left: 5px;width:auto;overflow: hidden"> #: data.name #</div> </div>',
        }

        var modal = null;
        vm.openPopupSysGroupKriAutocomplete = function(){
            var templateUrl = "ktnb/popup/popupCommonSearch.html";
            var title = CommonService.translate("Phụ trách tính toán");
            var windowId = "POPUP_SELECT_SYS_GROUP_KRI";
            vm.placeHolder = CommonService.translate("Mã/tên KCQ TCT");
            CommonService.populatePopupCreate(templateUrl, title, null, vm, windowId, null, '60%', '50%', null);
            setTimeout(function () {
                modal = CommonService.getModalInstance1();
            }, 100);
            vm.commonPopupSearch = {};
            var api = "commonRsService/getSysGroupForAutoComplete2";
            CommonService.fillDataPopupCommonSearch(api, vm.commonPopupSearch, sysGroupKriColumns, vm);
        }

        var sysGroupKriColumns = [
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
                    '	   <i ng-click="caller.saveSelectSysGroupKri(dataItem)" class="fa fa-check color-green" aria-hidden="true"></i> ' +
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

        vm.saveSelectSysGroupKri = function (dataItem) {
            vm.searchForm.riskProfileGroupId = dataItem.sysGroupId;
            vm.searchForm.sysGroupName = dataItem.sysGroupNameLv2;
            modal.dismiss();
        }

        vm.isSelectRiskProfileGroupSearchDvg = false;

        vm.sysGroupSearchOptions = {
            clearButton: false,
            dataTextField: "name",
            placeholder: CommonService.translate("Nhập mã hoặc tên đơn vị"),
            dataValueField: "name",
            open: function (e) {
                vm.isSelectRiskProfileGroupSearchDvg = false;
            },
            select: function (e) {
                vm.isSelectRiskProfileGroupSearchDvg = true;
                var dataItem = this.dataItem(e.item.index());
                vm.searchForm.riskProfileGroupName = dataItem.name;
                vm.searchForm.riskProfileGroupId = dataItem.sysGroupId;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectRiskProfileGroupSearchDvg) {
                        vm.searchForm.riskProfileGroupName = null;
                        vm.searchForm.riskProfileGroupId = null;
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
                        vm.isSelectRiskProfileGroupSearchDvg = false;
                        return Restangular.all("commonRsService/getSysGroupForAutoComplete").post(
                            {
                                keySearch: vm.searchForm.riskProfileGroupName,
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
                '<p class="col-md-6 text-header-auto border-right-ccc bold" translate>Mã đơn vị</p>' +
                '<p class="col-md-6 text-header-auto bold" translate>Tên đơn vị</p>' +
                '</div>' +
                '</div>',
            template: '<div class="row" ><div class="col-md-6 col-xs-5" style="float:left">#: data.code #</div><div  style="padding-left: 5px;width:auto;overflow: hidden"> #: data.name #</div> </div>',
        }

        var modal = null;
        vm.openPopupSysGroupSearchAutocomplete = function(){
            var templateUrl = "ktnb/popup/popupCommonSearch.html";
            var title = CommonService.translate("Tìm kiếm chủ sở hữu rủi ro");
            var windowId = "POPUP_SELECT_SYS_GROUP_KRI";
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
            vm.searchForm.riskProfileGroupId = dataItem.sysGroupId;
            vm.searchForm.riskProfileGroupName = dataItem.sysGroupNameLv2;
            modal.dismiss();
        }

        vm.clear = function (x){
            switch(x){
                case 'riskProfileName': vm.searchForm.riskProfileName = null; break;
                case 'riskProfileCode': vm.searchForm.riskProfileCode = null; break;
                case 'riskProfileGroup': vm.searchForm.riskProfileGroupId = null; vm.searchForm.riskProfileGroupName = null; break;
                case 'code': vm.searchForm.code = null; break;
                case 'sysGroup': vm.searchForm.sysGroupId = null; vm.searchForm.sysGroupName = null; break;
                case 'insertRiskProfile':
                    vm.insertForm.riskProfileCode = null;
                    vm.insertForm.riskProfileName = null;
                    vm.insertForm.riskProfileId = null;
                    vm.insertForm.riskProfileGroupName = null;
                    vm.insertForm.status = null;
                    vm.insertForm.code = null; break;
                case 'insertAlertValue': vm.insertForm.alertValue = null; break;
                case 'insertWarningValue': vm.insertForm.warningValue = null; break;
                case 'insertSysGroup':
                    vm.insertForm.sysGroupName = null;
                    vm.insertForm.sysGroupId = null; break;
            }
        }

        vm.exportExcelGrid =function () {
            kendo.ui.progress(vm.documentBody, true);
            var obj = angular.copy(vm.searchForm);
            obj.page = null;
            obj.pageSize = null;
            riskIndexService.doSearch(obj).then(function (d) {
                kendo.ui.progress(vm.documentBody, false);
                var data = d.data;
                CommonService.exportFile(vm.riskIndexGrid, data, vm.listRemove, vm.listConvert, CommonService.translate("Chỉ số rủi ro."));
            });
        }

        vm.showHideColumn = function (column) {
            if (angular.isUndefined(column.hidden)) {
                vm.riskIndexGrid.hideColumn(column);
            } else if (column.hidden) {
                vm.riskIndexGrid.showColumn(column);
            } else {
                vm.riskIndexGrid.hideColumn(column);
            }
        };

        function getColors(accept, data, warningValue ,alertValue, kri ){
            //nguong cao
            if(accept==1) {
                if(kri<=alertValue) {
                    return '<p style="color:red;" >'+data+'</p>';
                }
                else if(kri<=warningValue) {
                    return '<p style="color:#e9b658;">'+data+'</p>';
                }
                else {
                    return '<p style="color:#25c325;">'+data+'</p>';
                }
            }
            //nguong thap
            else {
                if (warningValue == alertValue){
                    if (kri >= warningValue){
                        return '<p style="color:red;">'+data+'</p>';
                    } else {
                        return '<p style="color:#25c325;">'+data+'</p>';
                    }
                }else {
                    if (kri >= alertValue){
                        return '<p style="color:red;">'+data+'</p>';
                    }else if (kri < warningValue){
                        return '<p style="color:#25c325;">'+data+'</p>';
                    }else {
                        return '<p style="color:#e9b658;" >'+data+'</p>'
                    }
                }
            }
        };

        vm.updateData = function (dataItem){
            vm.addPopup = angular.copy(dataItem);
            vm.addPopup.typePopup = 'updateData';
            if(vm.insertForm.frequency==3){
                vm.addPopup.timeIndex = vm.addPopup.year-new Date().getFullYear();
            }
            switch (vm.insertForm.frequency){
                case 1:
                    // if(record>11){
                    //     toastr.error(CommonService.translate("Chỉ được nhập 12 dòng cho 12 tháng"))
                    // }
                    vm.frequencyAddPopup = 'Tháng';
                    vm.listTimeIndex = [
                        {name: 'Tháng 1', value: 1},
                        {name: 'Tháng 2', value: 2},
                        {name: 'Tháng 3', value: 3},
                        {name: 'Tháng 4', value: 4},
                        {name: 'Tháng 5', value: 5},
                        {name: 'Tháng 6', value: 6},
                        {name: 'Tháng 7', value: 7},
                        {name: 'Tháng 8', value: 8},
                        {name: 'Tháng 9', value: 9},
                        {name: 'Tháng 10', value: 10},
                        {name: 'Tháng 11', value: 11},
                        {name: 'Tháng 12', value: 12},
                    ];
                    var date = new Date();
                    // var currentMonth = date.getMonth();
                    // vm.listTimeIndex = vm.listTimeIndex.slice(currentMonth,12);
                    break;
                case 2:
                    // if(record>3){
                    //     toastr.error(CommonService.translate("Chỉ được nhập 4 dòng cho 4 quý"))
                    // }
                    vm.frequencyAddPopup = 'Quý';
                    vm.listTimeIndex = [
                        {name: 'Quý I', value: 1},
                        {name: 'Quý II', value: 2},
                        {name: 'Quý III', value: 3},
                        {name: 'Quý IV', value: 4},
                    ];
                    var date = new Date();
                    // var currentMonth = date.getMonth()+1;
                    var current3Month = currentMonth%3===0?currentMonth/3:currentMonth/3+1;
                    // vm.listTimeIndex = vm.listTimeIndex.slice(current3Month-1,4);
                    break;
                case 3:
                    // if(record>0){
                    //     toastr.error(CommonService.translate("Chỉ được nhập 1 dòng cho 1 năm"))
                    // }
                    vm.frequencyAddPopup = 'Năm';
                    vm.listTimeIndex = [
                        {name: 'Năm '+(new Date().getFullYear()-1), value: -1},
                        {name: 'Năm '+new Date().getFullYear(), value: 0},
                        {name: 'Năm '+(new Date().getFullYear()+1), value: 1},
                    ];
                    break;
                case 4:
                    vm.frequencyAddPopup = '6 tháng';
                    vm.listTimeIndex = [
                        {name: '6 tháng đầu năm', value: 1},
                        {name: '6 tháng cuối năm', value: 2},
                    ];
                    break;
            }
            var templateUrl = 'ktnb/riskIndex/riskIndexAddDetail.html';
            var title = CommonService.translate("Cập nhật giá trị KRI");
            modalAdd1 = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "50%", "30%", null, null);
        }

        vm.saveUpdateKri = function(dataItem) {
            if(vm.addPopup.kriValue == null){
                toastr.error(CommonService.translate("Giá trị KRI không được để trống!"));
                return;
            }
            if(vm.addPopup.kriValue < 0){
                toastr.error(CommonService.translate("Giá trị KRI không được nhập số âm!"));
                return;
            }
            // if(vm.addPopup.kriValueAlert == null){
            //     toastr.error(CommonService.translate("Giá trị KRI chú ý không được để trống!"));
            //     return;
            // }
            // if(vm.addPopup.kriValueAlert < 0){
            //     toastr.error(CommonService.translate("Giá trị KRI chú ý không được nhập số âm!"));
            //     return;
            // }
            var arrayKri = null;
            switch (vm.insertForm.frequency) {
                case 1: arrayKri = $('#kriValueGridThang').data('kendoGrid').dataSource.data(); break;
                case 2: arrayKri = $('#kriValueGridQuy').data('kendoGrid').dataSource.data(); break;
                case 3: arrayKri = $('#kriValueGridNam').data('kendoGrid').dataSource.data(); break;
                case 4: arrayKri = $('#kriValueGrid6Thang').data('kendoGrid').dataSource.data(); break;
            }
            kendo.ui.progress($(vm.modalBody),true);
            if(vm.insertForm.frequency!==3){
                for (let i = 0; i < arrayKri.length; i++) {
                    if(arrayKri[i].timeIndex==vm.addPopup.timeIndex){
                        arrayKri[i].kriValue = vm.addPopup.kriValue;
                        arrayKri[i].kriValueAlert = vm.addPopup.kriValueAlert;
                        arrayKri[i].isEdit = 1;
                    }
                }
            } else {
                for (let i = 0; i < arrayKri.length; i++) {
                    if(arrayKri[i].year==vm.addPopup.year){
                        arrayKri[i].kriValue = vm.addPopup.kriValue;
                        arrayKri[i].kriValueAlert = vm.addPopup.kriValueAlert;
                        arrayKri[i].isEdit = 1;
                    }
                }
            }
            switch (vm.insertForm.frequency) {
                case 1: arrayKri = $('#kriValueGridThang').data('kendoGrid').refresh(); break;
                case 2: arrayKri = $('#kriValueGridQuy').data('kendoGrid').refresh(); break;
                case 3: arrayKri = $('#kriValueGridNam').data('kendoGrid').refresh(); break;
                case 4: arrayKri = $('#kriValueGrid6Thang').data('kendoGrid').refresh(); break;
            }

            kendo.ui.progress($(vm.modalBody),false);
            vm.cancel();
        }

        vm.checkIsEditable = function(dataItem){
            Restangular.all("riskIndexRsService/getRiskIndexDetail").post(dataItem).then(function(res){
                return !res;
            },function (error) {
                toastr.error(CommonService.translate("Có lỗi xảy ra!"));
            });
        }

        vm.getExcelTemplate = function() {
            $http({
                url: Constant.BASE_SERVICE_URL + RestEndpoint.RISK_INDEX_SERVICE_URL +"/exportFileBM",
                method: "POST",
                data: {},
                headers: {
                    'Content-type': 'application/json'
                },
                responseType: 'arraybuffer'
            }).success(function (data, status, headers, config) {
                saveFile(data,"Bieu_mau_import_chi_so_rui_ro.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
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
                url: Constant.BASE_SERVICE_URL + RestEndpoint.RISK_INDEX_SERVICE_URL + "/importExcel?folder=temp",
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

                        setTimeout(function () {
                            modalInstanceImport = CommonService.getModalInstance1();
                        }, 100);
                        fillDataImportErrTable(vm.lstErrImport);
                    } else {
                        kendo.ui.progress(element, false);
                        vm.disableSubmit = false;
                        vm.dataImport = data;
                        var templateUrl = 'ktnb/riskIndex/riskIndexImportPopup.html';
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
                        template: function () {
                            return ++recordRiskIndex;
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
                        title: CommonService.translate("Tên rủi ro"),
                        field: 'riskProfileName',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Mã rủi ro"),
                        field: 'riskProfileCode',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Mô tả KRI"),
                        field: 'description',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Loại KRI"),
                        field: 'typeKri',
                        width: "7%",
                        template: function (dataItem){
                            switch (dataItem.typeKri) {
                                case 1: return 'Cảnh báo'; break;
                                case 2: return 'Theo dõi'; break;
                                default: return ''; break;
                            }
                        },
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Ngưỡng cảnh báo"),
                        field: 'alertValue',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Ngưỡng chú ý"),
                        field: 'warningValue',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Đơn vị đo"),
                        field: 'measureUnit',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                        template: dataItem => getMeasureUnit(dataItem.measureUnit)
                    },
                    {
                        title: CommonService.translate("Tần suất đo"),
                        field: 'frequency',
                        width: "10%",
                        template: function (dataItem){
                            switch (dataItem.frequency) {
                                case 1: return 'Tháng'; break;
                                case 2: return 'Quý'; break;
                                case 3: return 'Năm'; break;
                                case 4: return '6 tháng'; break;
                                default: return ''; break;
                            }
                        },
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:center; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Phụ trách tính toán"),
                        field: 'sysGroupName',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Dữ liệu cần thu thập"),
                        field: 'dataKri',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Công thức tính toán"),
                        field: 'formula',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
                        },
                    },
                    {
                        title: CommonService.translate("Hệ thống hỗ trợ tính toán"),
                        field: 'calculatingSystem',
                        width: "10%",
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        attributes: {
                            style: "text-align:left; white-space:normal"
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
                            '<button style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Xóa" translate ' +
                            'ng-click="caller.removeItem(dataItem)" > <i style="color:steelblue;" class="fa fa-trash ng-scope" aria-hidden="true"></i></button>'
                            +
                            '</div>',

                        width: "10%",
                    }],
            });
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

        vm.removeItem = function(dataItem){
            $("#importResultGrid").data("kendoGrid").dataSource.remove(dataItem);
            vm.dataImport = $("#importResultGrid").data("kendoGrid").dataSource._data;
            $("#importResultGrid").data("kendoGrid").refresh();
        }

        vm.submitByImport = function (){
            var list = [];
            list = $("#riskIndexGrid2").data("kendoGrid").dataSource._data;
            kendo.ui.progress($(".k-window"), true);
            Restangular.all('riskIndexRsService/submitByImport').post(list).then(function(){
                toastr.success(CommonService.translate("Thêm mới bản ghi thành công!"));
                vm.doSearch();
                vm.cancel();
                kendo.ui.progress($(".k-window"), false);
                vm.doSearch();
            }).catch(function () {
                toastr.error(gettextCatalog.getString("Lỗi khi thêm mới!"));
                vm.doSearch();
                vm.cancel();
                kendo.ui.progress($(".k-window"), false);
            });
        }

        vm.danhGiaKRI = function (acceptance, warning, alert, kri) {
            //cao
            if(acceptance==1) {
                if(kri<=alert) {
                    return '<p style="color:red;" >Vượt ngưỡng cảnh báo</p>';
                }
                else if(kri<=warning) {
                    return '<p style="color:#e9b658;">Vượt ngưỡng chú ý</p>';
                }
                else {
                    return '<p style="color:#25c325;">Đạt</p>';
                }
            }
            //thap
            else if(acceptance==2) {
                if (warning == alert){
                    if (kri >= warning){
                        return '<p style="color:red;">Vượt ngưỡng cảnh báo</p>';
                    } else {
                        return '<p style="color:#25c325;">Đạt</p>';
                    }
                }else {
                    if (kri >= alert){
                        return '<p style="color:red;">Vượt ngưỡng cảnh báo</p>';
                    }else if (kri < warning){
                        return '<p style="color:#25c325;">Đạt</p>';
                    }else {
                        return '<p style="color:#e9b658;">Vượt ngưỡng chú ý</p>';
                    }
                }
            }
        }

        vm.danhGiaKRIText = function (acceptance, warning, alert, kri) {
            //cao
            if(acceptance==1) {
                if(kri<=alert) {
                    return 'Vượt ngưỡng cảnh báo';
                }
                else if(kri<=warning) {
                    return 'Vượt ngưỡng chú ý';
                }
                else {
                    return 'Đạt';
                }
            }
            //thap
            else if(acceptance==2) {
                if (warning == alert){
                    if (kri >= warning){
                        return 'Vượt ngưỡng cảnh báo';
                    } else {
                        return 'Đạt';
                    }
                }else {
                    if (kri >= alert){
                        return 'Vượt ngưỡng cảnh báo';
                    }else if (kri < warning){
                        return 'Đạt';
                    }else {
                        return 'Vượt ngưỡng chú ý';
                    }
                }
            }
        }
    }
})();
