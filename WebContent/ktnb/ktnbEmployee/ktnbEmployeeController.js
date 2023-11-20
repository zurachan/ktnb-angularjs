(function () {
    'use strict';
    var controllerId = 'ktnbEmployeeController';
    angular.module('MetronicApp').controller(controllerId,ktnbEmployeeFunc);
    function ktnbEmployeeFunc($scope, $templateCache, $rootScope, $timeout, gettextCatalog,
                               kendoConfig, $kWindow, $q, ktnbEmployeeService,$http,
                               CommonService, htmlCommonService, PopupConst, Restangular, RestEndpoint, Constant) {

        var vm = this;

        vm.documentBody = $("#ktnbEmployee");
        vm.modalBody = ".k-widget .k-window";
        vm.searchForm = {};
        vm.insertForm = {};
        vm.createFrom = false;
        vm.showTypeLineDepartment = false;

        initForm();
        function initForm() {
            vm.String = CommonService.translate("Kiểm toán nội bộ") + " > " +
                CommonService.translate("Quản lý nhân sự ngành dọc và trợ lý lãnh đạo đơn vị");
            fillDataListKtnbEmployee([]);
        }
        $scope.$watch("vm.insertForm.type",function(){
            if(vm.insertForm.type != 1){
                vm.showTypeLineDepartment = false
                vm.lineDepartmentType = null;
            }else {
                vm.showTypeLineDepartment = true
            }
        })

        var recordKtnbEmployee = 0
        vm.countKtnbEmployee = 0;
        function fillDataListKtnbEmployee(data) {
            vm.ktnbEmployeeOptions = kendoConfig.getGridOptions({
                autoBind: true,
                resizable: true,
                scrollable: true,
                toolbar: [
                    {
                        name: "actions",
                        template:
                            '<div class="btn-group pull-right margin_top_button margin_right10">' +
                            '<i class="tooltip1 action-button excelQLK" ng-click="vm.exportExcelGrid()"  aria-expanded="false"><span class="tooltipArrow"></span><span class="tooltiptext" translate>Xuất Excel</span></i>' +
                            '<div class="dropdown-menu hold-on-click dropdown-checkboxes" role="menu">' +
                            '</div></div>'
                    }
                ],
                dataBinding: function () {
                    recordKtnbEmployee = (this.dataSource.page() - 1) * this.dataSource.pageSize();
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
                            vm.countKtnbEmployee = response.total;
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
                            url: Constant.BASE_SERVICE_URL + "ktnbEmployeeRSService/doSearch",
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
                columnMenu: true,
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
                    // {
                    //     selectable: true,
                    //     width: "50px",
                    //     // field: "incidentReportId",
                    //     template: dataItem => '<input type="checkbox" name="incidentReportId" ng-model=\'dataItem.selected\' ng-click="vm.addChoice(dataItem)">',
                    //     attributes: {style: "text-align:center;"},
                    // },

                    {
                        title: CommonService.translate("TT"),
                        field: "stt",
                        template: function () {
                            return ++recordKtnbEmployee;
                        },
                        width: "40px",
                        headerAttributes: {style: "text-align:center", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Đơn vị"),
                        field: 'sysGroupName',
                        width: "200px",
                        // template: function (dataItem) {
                        //     if (dataItem.type == 1) {
                        //         return CommonService.translate("Nhân sự ngành dọc PC&KTNB");
                        //     } else if (dataItem.type == 2) {
                        //         return CommonService.translate("Trợ lý lãnh đạo Phòng/Trung tâm TCT");
                        //     } else {
                        //         return "";
                        //     }
                        // },
                        headerAttributes: {style: "text-align:center", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Loại nhân sự"),
                        field: 'typeName',
                        width: "180px",
                        template: function (dataItem) {
                            if (dataItem.type == 1) {
                                return CommonService.translate("Nhân sự ngành dọc Pháp chế");
                            } else if (dataItem.type == 2) {
                                return CommonService.translate("Trợ lý lãnh đạo Phòng/Trung tâm TCT");
                            } else if (dataItem.type == 3) {
                                return CommonService.translate("Nhân sự ngành dọc KSNB");
                            } else {
                                return "";
                            }
                        },
                        headerAttributes: {style: "text-align:center", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    // {
                    //     title: CommonService.translate("Nhân sự ngành dọc"),
                    //     field: 'lineDepartmentType',
                    //     width: "150px",
                    //     template: function (dataItem) {
                    //         if (dataItem.lineDepartmentType == 1) {
                    //             return CommonService.translate("Nhân sự Pháp chế");
                    //         } else if (dataItem.lineDepartmentType == 2) {
                    //             return CommonService.translate("Nhân sự Kiểm soát nội bộ");
                    //         } else {
                    //             return "";
                    //         }
                    //     },
                    //     headerAttributes: {style: "text-align:center", translate: ""},
                    //     attributes: {style: "text-align:center;white-space:normal;"},
                    // },
                    {
                        title: CommonService.translate("Tên nhân viên"),
                        field: 'fullName',
                        width: "150px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Email"),
                        field: 'email',
                        width: "150px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Di động"),
                        field: 'phoneNumber',
                        width: "120px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Chức danh"),
                        field: 'positionName',
                        width: "100px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Năm sinh"),
                        field: 'birth',
                        width: "100px",
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Hiệu lực"),
                        field: 'status',
                        width: "100px",
                        template: function (dataItem) {
                            if (dataItem.status == 0) {
                                return CommonService.translate("Hết hiệu lực");
                            } else if (dataItem.status == 1) {
                                return CommonService.translate("Hiệu lực");
                            } else {
                                return "";
                            }
                        },
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                    },
                    {
                        title: CommonService.translate("Thao tác"),
                        headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                        attributes: {style: "text-align:center;white-space:normal;"},
                        template: dataItem =>
                            '<div class="text-center">' +
                            '<button ' +
                            'style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Sửa" translate ' +
                            'ng-click="vm.openEdit(dataItem)" ><i class="fa fa-pencil ng-scope" aria-hidden="true" translate></i></button>'
                            +
                            '<button ng-if="dataItem.status != 0" ' +
                            'style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Xóa bản ghi" translate ' +
                            'ng-click="vm.delete(dataItem)" ><i class="fa fa-trash ng-scope" aria-hidden="true" translate></i></button>' +
                            '</div>',

                        width: "240px",
                        field: "ThaoTac"
                    }
                ]
            });
        };

        vm.delete = function (dataItem) {
            vm.insertForm = angular.copy(dataItem);
            confirm(CommonService.translate("Xác nhận xóa bản ghi này?"), function () {
                kendo.ui.progress(vm.documentBody, true);
                ktnbEmployeeService.remove(vm.insertForm).then(function (data) {
                    kendo.ui.progress(vm.documentBody, false);
                    toastr.success(CommonService.translate("Xóa bản ghi thành công !!!"));
                    vm.doSearch();
                    vm.cancel();
                }, function () {
                    kendo.ui.progress(vm.documentBody, false);
                    toastr.error(CommonService.translate("Có lỗi xảy ra"));
                });
            });
            kendo.ui.progress(vm.documentBody, false);
        }
        vm.openEdit = function (dataItem) {
            vm.createFrom = true;
            vm.insertForm = angular.copy(dataItem);
            vm.insertForm.name = vm.insertForm.employeeCode + " - " + vm.insertForm.fullName;
            var templateUrl = 'ktnb/ktnbEmployee/ktnbEmployeeEditPopup.html';
            var title = CommonService.translate("Chỉnh sửa thông tin nhân sự");
            vm.modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "70%", null, null);

        }
        vm.parseDate = function (type) {
            if (type == 'startDate'){
                var date = kendo.toString(kendo.parseDate(vm.insertForm.startDate), 'dd/MM/yyyy');
            }
            if (type == 'birth'){
                kendo.toString(kendo.parseDate(vm.insertForm.birth), 'dd/MM/yyyy');
            }

        }


        vm.create = function () {
            vm.isCreateForm = true;
            vm.insertForm = {};
            vm.lineDepartmentType = 1;
            var templateUrl = 'ktnb/ktnbEmployee/ktnbEmployeeCreatPopup.html';
            var title = CommonService.translate("Thêm mới danh sách nhân sự");
            vm.modalAdd = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "70%", null, null);
        }

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

                //Chức năng edit
                if(vm.createFrom){
                    vm.insertForm.sysGroupName = dataItem.name;
                    vm.insertForm.sysGroupId = dataItem.sysGroupId;
                }else {
                    //Chức năng tìm kiếm
                    vm.sysGroupName = dataItem.name;
                    vm.searchForm.sysGroupId = dataItem.sysGroupId;
                }


            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSysGroupDvg) {
                        vm.sysGroupName = null;
                        vm.searchForm.sysGroupId = null;
                        //Chức năng edit
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
                        return Restangular.all("commonRsService/getSysGroupForAutoComplete").post(
                            {
                                keySearch: vm.sysGroupName,
                                // groupLevelLst: ['2', '3'],
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

        vm.openPopupSysGroup = function () {
            var templateUrl = "ktnb/popup/popupCommonSearch.html";
            var title = CommonService.translate("Tìm kiếm đơn vị");
            var windowId = "POPUP_SELECT_SYS_GROUP";
            vm.placeHolder = CommonService.translate("Mã/tên đơn vị");
            CommonService.populatePopupCreate(templateUrl, title, null, vm, windowId, null, '60%', '50%', null);
            setTimeout(function () {
                vm.modalAdd = CommonService.getModalInstance1();
            }, 100);
            vm.commonPopupSearch = {};
            var api = "commonRsService/getSysGroupForAutoComplete";
            CommonService.fillDataPopupCommonSearch(api, vm.commonPopupSearch, sysGroupColumns, vm);
        }

        // * popup common
        vm.recordPopup = 0;
        // popup don vi thuc hien
        var sysGroupColumns = [
            {
                title: "TT",
                field: "stt",
                template: function () {
                    return ++vm.recordPopup;
                },
                width: "50px",
                headerAttributes: {
                    style: "text-align:center;", translate: "",
                },
                attributes: {
                    style: "text-align:center;"
                },
            }, {
                title: CommonService.translate("Mã đơn vị"),
                field: 'code',
                width: "200px",
                headerAttributes: {
                    style: "text-align:center;", translate: "",
                },
                attributes: {
                    style: "text-align:left;"
                },
            }, {
                title: CommonService.translate("Tên đơn vị"),
                field: 'name',
                width: "350px",
                headerAttributes: {
                    style: "text-align:center;", translate: "",
                },
                attributes: {
                    style: "text-align:left;"
                },
            }, {
                title: CommonService.translate("Chọn"),
                field: 'choose',
                width: "100px",
                template:
                    '<div class="text-center "> ' +
                    '		<a  type="button" class=" icon_table" uib-tooltip="Chọn" translate>' +
                    '			<i ng-click="caller.saveSelectSysGroup(dataItem)" class="fa fa-check color-green" aria-hidden="true"></i> ' +
                    '		</a>'
                    + '</div>'
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
            if(vm.createFrom){
                vm.insertForm.sysGroupName = dataItem.name;
                vm.insertForm.sysGroupId = dataItem.sysGroupId;
            }else {
                vm.sysGroupName = dataItem.name;
                vm.searchForm.sysGroupId = dataItem.sysGroupId;
            }
            vm.cancel();
            vm.createFrom = true;
        };
        vm.cancel = function () {
            kendo.ui.progress(vm.documentBody, false);
            vm.createFrom = false;
            vm.modalAdd.dismiss();
        };
        vm.clear = function (type) {
            if(type == 'keySearch'){
                vm.searchForm.keySearch = null;
            }
            if(type == 'sysGroupDvg'){
                // vm.searchForm.sysGroupId = null;
                // vm.sysGroupName = null;
                vm.searchForm.sysGroupName = null;
            }
        };
        vm.doSearch = function(){
            var grid = $("#ktnbEmployeeGrid").data("kendoGrid");
            fillDataListKtnbEmployee([]);
            if(grid){
                grid.dataSource.query({
                    page: 1,
                    pageSize:10
                });
            }
        };

        vm.getExcelTemplate = function (type) {
            if(type == '' || type == null){
                toastr.error(CommonService.translate("Vui lòng chọn loại nhân sự trước!"));
                return;
            }
            var fileName = type == 2 ? "TroLyLanhDaoPhongVaTrungTam":"QuanLyNhanSuNganhDoc";
            $http({
                url: Constant.BASE_SERVICE_URL + RestEndpoint.KTNB_EMPLOYEE_SERVICE_URL +"/exportFileBM",
                method: "POST",
                data: {fileName : fileName},
                headers: {
                    'Content-type': 'application/json'
                },
                responseType: 'arraybuffer'
            }).success(function (data, status, headers, config) {
                saveFile(data,fileName + ".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
            }).error(function (data, status, headers, config) {
                toastr.error("Có lỗi xảy ra! Vui lòng thử lại sau.");
            });
        };
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
        };

        vm.submit = function () {
            if ($("#fileS")[0].files[0] == null) {
                toastr.warning(CommonService.translate("Bạn chưa chọn file để import"));
                return;
            }
            if ($("#fileS")[0].files[0].name.split('.').pop() != 'xls' && $("#fileS")[0].files[0].name.split('.').pop() != 'xlsx') {
                toastr.warning(CommonService.translate("Sai định dạng file"));
                $("#fileS").replaceWith($("#fileS").val('').clone(true));
                return;
            }
            if(vm.insertForm.type == "" || vm.insertForm.type == null){
                toastr.warning(CommonService.translate("Vui lòng chọn loại nhân sự trước khi tải lên!"));
                return ;
            }
            kendo.ui.progress(vm.documentBody, true);
            var formData = new FormData();
            formData.append('multipartFile', $('#fileS')[0].files[0]);
            var pathImport = "ktnbEmployeeRSService/importListEmployee";
            return $.ajax({
                url: Constant.BASE_SERVICE_URL + pathImport,
                type: "POST",
                data: formData,
                enctype: 'multipart/form-data',
                processData: false,
                contentType: false,
                cache: false,
                success: function (data) {
                    var listQuery = data[0];
                    var listImport = data[1];
                    var listHave = "";
                    vm.insertForm.listCodeUser = data[3];
                    if(data[3].length > 0){
                        Restangular.all("ktnbEmployeeRSService/doSearch").post({
                            type : vm.insertForm.type,
                            listCodeUser : data[3]
                        }).then(function(d) {
                            for(var i = 0; i < d.data.length; i++){
                                for(var j=0;j<listImport.length; j++){
                                    if(d.data[i].employeeCode == listImport[j].employeeCode ){
                                        listHave = listHave +d.data[i].employeeCode + ', ';
                                        continue;
                                    }
                                }
                            }
                            if(listHave != ""){
                                var str = "Mã nhân viên : "+ listHave + " thuộc loại nhân sự: ";
                                if(vm.insertForm.type == 1){
                                    str += " Nhân sự ngành dọc Pháp chế đã tồn tại trên hệ thống!"
                                }
                                if(vm.insertForm.type == 2){
                                    str += " Trợ lý lãnh đạo Phòng/Trung tâm TCT đã tồn tại trên hệ thống!"
                                }
                                if(vm.insertForm.type == 3){
                                    str += " Nhân sự ngành dọc KSNB đã tồn tại trên hệ thống!"
                                }
                                $("#listDup").text(str);
                                kendo.ui.progress(vm.documentBody, false);
                                return;
                            }else {
                                if (data[2].length > 0) {
                                    var line = "";
                                    for (var i =0;i<data[2].length;i++) {
                                        var line = data[2][i].lineError - 1;
                                        line =  line + ", ";
                                    };
                                    kendo.ui.progress(vm.documentBody, false);
                                    $("#listDup").text("Những STT: " + line + " bị trùng với những hàng khác trong file import! ");
                                    return;
                                }
                                else{
                                    $("#listDup").text("");
                                    for (var i = 0; i < listImport.length; i++){
                                        for(var j = 0;j<listQuery.length; j++){
                                            if(listImport[i].employeeCode == listQuery[j].employeeCode){
                                                listImport[i].fullName = listQuery[j].fullName;
                                                listImport[i].email = listQuery[j].email;
                                                // listImport[i].sysGroupName =  listQuery[j].sysGroupNameLv2;
                                                listImport[i].sysGroupId = listQuery[j].sysGroupId;
                                                listImport[i].sysUserId = listQuery[j].sysUserId;
                                                listImport[i].phoneNumber = listQuery[j].phoneNumber;
                                                listImport[i].state  = 1;
                                                continue;
                                            }
                                        }
                                    }
                                    toastr.success("Tải lên thông tin nhân viên thành công");
                                    $("#listEmployeeImportGrid").data("kendoGrid").dataSource.data(listImport);
                                    $("#listEmployeeImportGrid").data("kendoGrid").refresh();
                                }
                            }
                        }, function () {
                            console.log('có lỗi xảy ra')
                        });
                    }
                    $("#fileS").val("");
                    $scope.$apply();
                    kendo.ui.progress(vm.documentBody, false);
                }
            });


        }

        vm.save = function (type) {
            if(type == 'new'){
                var grid = $("#listEmployeeImportGrid").data("kendoGrid").dataSource._data;
                if(vm.insertForm.type == '' || vm.insertForm.type == null ){
                    toastr.error(CommonService.translate("Loại nhân sự không được để trống"));
                    return;
                }
                else if(grid.length == 0){
                    toastr.error(CommonService.translate("Danh sách nhân sự không được để trống!"));
                    return;
                }
                else {
                    vm.insertForm.listData = []
                    for (var i = 0; i < grid.length; i++){
                            grid[i].type = vm.insertForm.type
                            grid[i].lineDepartmentType = vm.lineDepartmentType
                            vm.insertForm.listData.push(grid[i])
                    }
                    confirm(CommonService.translate("Xác nhận lưu bản ghi này?"), function () {
                        kendo.ui.progress(vm.documentBody, true);
                        ktnbEmployeeService.save(vm.insertForm).then(function (data) {
                            kendo.ui.progress(vm.documentBody, false);
                            toastr.success(CommonService.translate("Lưu bản ghi thành công !!!"));
                            vm.cancel();
                        }, function () {
                            kendo.ui.progress(vm.documentBody, false);
                            toastr.error(CommonService.translate("Có lỗi xảy ra"));
                        });
                    });
                    kendo.ui.progress(vm.documentBody, false);
                }
            }
            if(type == 'edit'){
                if(vm.insertForm.type == '' || vm.insertForm.type == null ){toastr.error(CommonService.translate("Loại nhân sự không được để trống"));return;}
                if(vm.insertForm.sysGroupId == "" || vm.insertForm.sysGroupId == null ){ toastr.error(CommonService.translate("Đơn vị không được để trống!"));return;}
                // if(vm.insertForm.birth == "" || vm.insertForm.birth == null ){ toastr.error(CommonService.translate("Năm sinh không được để trống!"));return;}
                if(vm.insertForm.email == "" || vm.insertForm.email == null ){ toastr.error(CommonService.translate("Email không được để trống!"));return;}
                if(vm.insertForm.phoneNumber == "" || vm.insertForm.phoneNumber == null ){ toastr.error(CommonService.translate("SĐT không được để trống!"));return;}
                // if(vm.insertForm.positionName == "" || vm.insertForm.positionName == null ){ toastr.error(CommonService.translate("Chức danh chính quyền không được để trống!"));return;}

                confirm(CommonService.translate("Xác nhận lưu bản ghi này?"), function () {
                    kendo.ui.progress(vm.documentBody, true);
                    ktnbEmployeeService.update(vm.insertForm).then(function (data) {
                        kendo.ui.progress(vm.documentBody, false);
                        toastr.success(CommonService.translate("Lưu bản ghi thành công !!!"));
                        vm.cancel();
                    }, function () {
                        kendo.ui.progress(vm.documentBody, false);
                        toastr.error(CommonService.translate("Có lỗi xảy ra"));
                    });
                });
                kendo.ui.progress(vm.documentBody, false);

            }

        }

        var recordListEmployee = 0;
        vm.listEmployeeImportGridOptions = kendoConfig.getGridOptions({
            autoBind: true,
            resizable: true,
            scrollable: true,
            dataBinding: function () {
                recordListEmployee = (this.dataSource.page() - 1) * this.dataSource.pageSize();
            },
            dataSource: {
                pageSize: 10,
                autoSync: true,
                schema:{
                    model: {
                        fields:{
                            stt:{editable: false},
                            fullName:{editable: false},
                            email:{editable: false}
                        }
                    },
                },
            },
            noRecords: true,
            columnMenu: true,
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
                        return ++recordListEmployee;
                    },
                    width: "40px",
                    headerAttributes: {style: "text-align:center", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Đơn vị"),
                    field: 'sysGroupName',
                    width: "150px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Nhân viên"),
                    field: 'fullName',
                    width: "180px",
                    template: function(dataItem){
                       return  dataItem.employeeCode + " - " + dataItem.fullName
                    },
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Email"),
                    field: 'email',
                    width: "120px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Di động"),
                    field: 'phoneNumber',
                    template: dataItem =>'<span class="form-control" ng-bind="dataItem.phoneNumber"></span>',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Chức danh chính quyền"),
                    field: 'positionName',
                    template: dataItem => '<span class="form-control" ng-bind="dataItem.positionName"></span>',
                    width: "220px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Năm sinh"),
                    field: 'birth',
                    template: dataItem => '<span class="form-control" ng-bind="dataItem.birth"></span>',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Chức danh tổ chức quần chúng"),
                    template: dataItem => '<span class="form-control" ng-bind="dataItem.positionOther"></span>',
                    editable: false,
                    field: 'positionOther',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Chứng chỉ pháp chế"),
                    template: dataItem => '<span class="form-control" ng-bind="dataItem.certificatePCHE"></span>',
                    editable: false,
                    field: 'certificatePCHE',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Chứng chỉ KTNB"),
                    template: dataItem => '<span class="form-control" ng-bind="dataItem.certificateKTNB"></span>',
                    editable: false,
                    field: 'certificateKTNB',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Chứng chỉ QTRR"),
                    template: dataItem => '<span class="form-control" ng-bind="dataItem.certificateQTRR"></span>',
                    editable: false,
                    field: 'certificateQTRR',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Số QĐ GNV"),
                    template: dataItem => '<span class="form-control" ng-bind="dataItem.numberQdGnv"></span>',
                    editable: false,
                    field: 'numberQdGnv',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Ngày bắt đầu"),
                    template: dataItem => '<span class="form-control" ng-bind="dataItem.startDate"></span>',
                    editable: false,
                    field: 'startDate',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Tình trạng\n(0:Hết hiệu lực/1:Hiệu lực)"),
                    editable: false,
                    field: "state",
                    template: function(dataItem){
                        if(dataItem.state > 1 ||dataItem.state < 0){
                            toastr.error(CommonService.translate("Chỉ đc chọn 0: Hết hiệu lực hoặc 1: Hiệu lực !"));
                            return ;
                        }
                        else {
                            dataItem.stateName = dataItem.state == 1 ? "Hiệu lực" : "Hết hiệu lực";
                            return '<span class="form-control" ng-bind="dataItem.stateName"></span>'
                        }

                    },
                    width: "150px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Ghi chú"),
                    template: dataItem => '<span class="form-control" ng-bind="dataItem.note"></span>',
                    editable: false,
                    field: 'note',
                    width: "100px",
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Thao tác"),
                    headerAttributes: {style: "text-align:center;white-space:normal;", translate: ""},
                    attributes: {style: "text-align:center;white-space:normal;"},
                    template: dataItem =>
                        '<div class="text-center">' +
                        '<button '+
                        'style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Xóa bản ghi" translate ' +
                        'ng-click="caller.removeDataItem(dataItem)" ><i class="fa fa-trash ng-scope" aria-hidden="true" translate></i></button>' +
                        '</div>',

                    width: "100px",
                    field: "ThaoTac"
                }
            ]
        });
        vm.removeDataItem = function (dataItem) {
            var grid = $("#listEmployeeImportGrid").data("kendoGrid").dataSource;
            grid.remove(dataItem);
            toastr.success(CommonService.translate("Xóa bản ghi tên " + dataItem.fullName + " thành công!!"));
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

        vm.listRemove = [
            {
                title: CommonService.translate("Thao tác"),
            },
        ];

        vm.listConvert = [
            {
                field: "status",
                data: {
                    '0': CommonService.translate("Hết hiệu lực"),
                    '1': CommonService.translate("Hiệu lực"),
                }
            }, {
                field: "typeName",
                data: {
                    '1': CommonService.translate("Nhân sự ngành dọc Pháp chế"),
                    '2': CommonService.translate("Trợ lý lãnh đạo Phòng/Trung tâm TCT"),
                    '3': CommonService.translate("Nhân sự ngành dọc KSNB"),
                }
            }
        ];

        vm.exportExcelGrid = function () {
            kendo.ui.progress(vm.documentBody, true);
            var obj = angular.copy(vm.searchForm);
            obj.page = null;
            obj.pageSize = null;

            ktnbEmployeeService.doSearch(obj).then(function (d) {
                kendo.ui.progress(vm.documentBody, false);
                var data = d.data;
                CommonService.exportFile(vm.ktnbEmployeeGrid, data, vm.listRemove, vm.listConvert, CommonService.translate("QuanLyNhanSuVaNganhDoc"));
            });
        }
    }

})();