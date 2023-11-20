
(function () {
    'use strict';
    var controllerId = 'assignmentManagementController';

    angular.module('MetronicApp').controller(controllerId, assignmentManagementFnc);
    function assignmentManagementFnc($scope, $window, $http, $timeout, $rootScope, $log, Constant, Restangular, CommonService, kendoConfig, assignmentManagementService, $kWindow, RestEndpoint, gettextCatalog) {
        var vm = this;
        var modalPopup;
        var urlBieuMau = "workAssignTCLDService/exportFileTemplateExcelList"
        var record = 0;
        var sttFile = 0;
        var sttCongViec = 0;
        var sttDonVi = 0;
        var sttLichSuGiaHan = 0;

        vm.documentBody = $("#assignmentManagement");
        vm.listThongTinCanCapNhat =
            "1. Tiểu sử (SAP): Ảnh (theo mẫu TCT) - Quan hệ gia đình \n" +
            "2. Thông tin công tác (VHR): Quá trình công tác - Quá trình tượng \n" +
            "3. Thông tin định danh (SAP): CCCD/ CMND kèm Bản Scan 2 mặt - Địa chỉ: hộ khẩu kèm Bản Scan sổ hộ khẩu; Giấy xác nhận cư trú) \n" +
            "4. Trình độ chuyên môn (SAP): Trình độ đào tạo cao nhất kèm Bản Scan bằng tốt nghiệp+ bảng điểm - Chứng chỉ yêu vầu: (nếu có theo MTCV) kèm bản Scan chứng chỉ \n" +
            "5. Thông tin tài khoản (SAP): Tài khoản ViettelPay gói không giới hạn. \n" +
            "6. Thuế thu nhập cá nhân: Thông tin mã số thuế. \n"

        vm.searchForm = {

            "page": 1,
            "pageSize": 10,
            "keySearch": null, //Thông tin tìm kiếm
            "startDate": null, //ngày  bđ
            "endDate": null,//ngày  kt
            "woType": null, //Loại wo
            "woStatus": null,
            "woApproveStatus": null,
            "woEmployeeStatus": null,
            "woVerifyStatus": null,
            "woDateStatus": null,
            "creatorName": null


        }

        initFormData();
        function initFormData() {
            vm.isPermissionApproveAndReject = false
            vm.isTruongPhong = false
            vm.isThemSuaXoa = false
            vm.checkall = false
            vm.string = CommonService.translate("Quản lý giao việc của P.Tổ chức lao động") + " > " + CommonService.translate("Quản lý giao việc");
            fillDataSource([])
            getlistRole()

            const checkall = { title: "Tất cả", hidden: false }
            vm.settings = [checkall, vm.assignmentManagementOptions.columns.slice(1, vm.assignmentManagementOptions.columns.length)]

            vm.listLoaiWO = [
                { name: 'Giao việc ngành dọc P.TCLĐ', value: 1 },
                { name: 'Cập nhật thông tin CBNV mới', value: 2 }
            ]
            vm.listTrangThaiDuyetWO = [
                { name: "Chờ duyệt", value: 0 },
                { name: "Đã duyệt", value: 1 },
                { name: "Từ chối", value: 2 },
            ]

            function getlistRole() {
                assignmentManagementService.getListRole().then(res => {
                    vm.listRole = res.data
                    vm.isPermissionApproveAndReject = res.data.find(t => t.code === 'TCLĐ_WO' || t.code === 'TCLĐ_ADMIN_WO') ? true : false
                    vm.isTruongPhong = res.data.find(t => t.code === 'TCLĐ_WO_APRV' || t.code === 'TCLĐ_ADMIN_WO') ? true : false
                    vm.isThemSuaXoa = res.data.find(t => t.code === 'TCLĐ_DVIEC' || t.code === 'TCLĐ_ADMIN_WO') ? true : false
                    if(!vm.isTruongPhong) {
                        vm.assignmentManagementOptions.columns.splice(0,1)
                        vm.assignmentManagementGrid.refresh()
                    }
                }).catch(er => {
                })
            }

            vm.checkExpiredDate = function checkExpiredDate(dataItem) {
                const d = new Date()
                const date = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`.split('/')
                const end = dataItem.endDate
                if (!end) return false

                // const today = new Date(date.split('/').reverse().join('-'));
                const today = new Date(+date[2], +date[1], +date[0]);
                const dateEnd = new Date(+end.split('/')[2], +end.split('/')[1], +end.split('/')[0])
                if (today - dateEnd == 0) return false
                if (today - dateEnd > 0) return true
                if (today - dateEnd < 0) return false
            }

            vm.listTrangThaiNhanVienThucHien = [
                { name: "Chưa nhận việc", value: 0 },
                { name: "Đã nhận việc", value: 1 },
                { name: "Từ chối", value: 2 },
                { name: "Đã hoàn thành", value: 3 },
            ]

            vm.listTinhTrangDuyetDongWO = [
                { name: "Chờ duyệt", value: 0 },
                { name: "Đã duyệt", value: 1 },
                { name: "Từ chối", value: 2 },
            ]

            vm.listTrangThaiWO = [
                { name: "Dự thảo", value: 0 },
                { name: "Hiệu lực", value: 1 },
                { name: "Hết hiệu lực", value: 2 },
            ]
            vm.listTinhTrangWO = [
                { name: "Trong hạn", value: 1 },
                { name: "Quá hạn", value: 2 },

            ]

        }

        vm.changeTypeInsertForm = function () {

        }

        vm.gridColumnShowHideFilter = function (item) {
            return item.type == null || item.type !== 1;
        };
        vm.showHideColumn = function (column) {
            var grid = vm.assignmentManagementGrid;

            if (angular.isUndefined(column.hidden)) {
                grid.hideColumn(column);
            } else if (column.hidden) {
                grid.showColumn(column);
            } else {
                grid.hideColumn(column);
            }
            // CommonService.showHideColumnGrid(grid, column)
        };
        vm.getExcelTemplate = function () {
            $http({
                url: `${Constant.BASE_SERVICE_URL}${urlBieuMau}`,
                method: "POST",
                data: {},
                headers: {
                    'Content-type': 'application/json'
                },
                responseType: 'arraybuffer'
            }).success(function (data, status, headers, config) {
                saveFile(data, "BM_Import_QLGV.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
            }).error(function (data, status, headers, config) {
                toastr.error("Có lỗi xảy ra! Vui lòng thử lại sau.");
            });
        }
        vm.getExcelTemplateDonViThucHien = function () {
            $http({
                url: `${Constant.BASE_SERVICE_URL}workAssignTCLDService/exportFileTemplateExcel`,
                method: "POST",
                data: {},
                headers: {
                    'Content-type': 'application/json'
                },
                responseType: 'arraybuffer'
            }).success(function (data, status, headers, config) {
                saveFile(data, "BM_danhsachdonvinhanWO.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
            }).error(function (data, status, headers, config) {
                toastr.error("Có lỗi xảy ra! Vui lòng thử lại sau.");
            });
        }
        function saveFile(data, filename, type) {
            var file = new Blob([data], { type: type });
            if (window.navigator.msSaveOrOpenBlob) // IE10+
                window.navigator.msSaveOrOpenBlob(file, filename);
            else { // Others
                var a = document.createElement("a"),
                    url = URL.createObjectURL(file);
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                setTimeout(function () {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 0);
            }
        }

        vm.doSearch = function () {
            if (vm.searchForm.startDate && vm.searchForm.endDate) {
                var d1 = kendo.parseDate(vm.searchForm.startDate, "dd/MM/yyyy");
                var d2 = kendo.parseDate(vm.searchForm.endDate, "dd/MM/yyyy");
                if (d1 > d2) {
                    toastr.error("Ngày bắt đầu tìm kiếm phải nhỏ hơn ngày kết thúc tìm kiếm");
                    return;
                }
            }
            if (vm.searchForm.startDate && vm.searchForm.startDate.split('/')[1] > 12) {
                toastr.error("Tháng bắt đầu không được lớn hơn 12");
                return;
            }

            if (vm.searchForm.endDate && vm.searchForm.endDate.split('/')[1] > 12) {
                toastr.error("Tháng kết thúc không được lớn hơn 12");
                return;
            }
            var grid = vm.assignmentManagementGrid
            if (grid) {
                grid.dataSource.query({
                    page: 1,
                    pageSize: 10
                });
            }
        }
        vm.onMultipleApprove = function () {
            if (vm.listSelected.length === 0) {
                toastr.error('Không có bản ghi nào được chọn')
                return
            }
            const payload = {
                woIds: vm.listSelected.map(t => t.fwmodelId),
                woApproveStatus: 1,
                woEmployeeStatus: null,
                woVerifyStatus: null,
                woEmployeeNote: null
            }
            confirm(CommonService.translate(`Bạn có chắc chắn muốn duyệt ${vm.listSelected.length} bản ghi  này?`), function () {
                assignmentManagementService.approveOrReject(payload).then(function () {
                    kendo.ui.progress(vm.documentBody, false);
                    toastr.success(CommonService.translate("Duyệt giao việc thành công"));
                    vm.searchForm = {
                        "page": 1,
                        "pageSize": 10,
                        "keySearch": null, //Thông tin tìm kiếm
                        "startDate": null, //ngày  bđ
                        "endDate": null,//ngày  kt
                        "woType": null, //Loại wo
                        "woStatus": null,
                        "woApproveStatus": null,
                        "woEmployeeStatus": null,
                        "woVerifyStatus": null,
                        "woDateStatus": null,
                        "creatorName": null
                    }
                    vm.doSearch()
                })
            });

        }

        function initDataAddFunction() {
            $("#assiManagement_add_popupId_add_popupId").click(function (e) {
            });
            setTimeout(function () {
                $(".k-icon .k-clear-value .k-i-close").remove();
            }, 10);
        }

        vm.openAdd = function () {
            vm.isEditPopup = false;
            vm.isCreateForm = true;
            vm.isClose = null
            vm.isApproveOrReject = null
            vm.isGiahan = false
            vm.formThongTinChung = {
                woCode: null,
                woType: 1,
                startDate: null,
                endDate: null,
                woName: null
            };
            vm.formDongViec = {
                woId: null,
                woVerifyStatus: null,
                woVerifyNote: null
            }
            vm.formThongTinChiTiet = {
                woApproveName: null,
                woApproveDate: null,
                woEmployeeName: null,
                woEmployeeDate: null,
                woVerifyName: null,
                woVerifyDate: null,
            }
            vm.isView = false

            var templateUrl = 'ktnb/assignmentManagement/addAssignmentManagement.html';
            var title = "Thêm mới";
            modalPopup = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "70%", initDataAddFunction, null);
            fillDataListJobGrid()
            fillDonViThucHienGrid()
            fillListFIleGiaoViec()
        }

        vm.detail = {}
        vm.getDetail = function (dataItem) {
            vm.formThongTinChung.woCode = dataItem.woCode
            vm.formThongTinChung.woType = dataItem.woType
            vm.formThongTinChung.startDate = dataItem.startDate
            vm.formThongTinChung.endDate = dataItem.endDate
            vm.formThongTinChung.woName = dataItem.woName
            if (vm.isGiahan) {
                vm.formGiaHan.startDate = dataItem.endDate
            }
            if (vm.isClose ==='DONGY' || vm.isGiahan || vm.isView) {
                vm.listFileGiaoViecOptions.columns.splice(4, 1)
                vm.donViThucHienGridOptions.columns.splice(4, 1)
                // vm.listJobsGridOptions.columns.splice(5, 1)

            }
            if (vm.isEditPopup) {
                vm.donViThucHienGridOptions.columns.splice(4, 1)

            }
            if (vm.isClose) {
                vm.formDongViec = {
                    woId: vm.detail.fwmodelId,
                    woVerifyStatus: type,
                    woVerifyNote: null
                }
            }

            vm.formThongTinChiTiet.woApproveName = dataItem.woApproveName
            vm.formThongTinChiTiet.woApproveDate = dataItem.woApproveDate
            vm.formThongTinChiTiet.woApproveNote = dataItem.woApproveNote
            vm.formThongTinChiTiet.woEmployeeName = dataItem.woEmployeeName
            vm.formThongTinChiTiet.woEmployeeDate = dataItem.woEmployeeDate
            vm.formThongTinChiTiet.woEmployeeNote = dataItem.woEmployeeNote
            vm.formThongTinChiTiet.woVerifyName = dataItem.woVerifyName
            vm.formThongTinChiTiet.woVerifyDate = dataItem.woVerifyDate
            vm.formThongTinChiTiet.woVerifyNote = dataItem.woVerifyNote

            assignmentManagementService.getDetail({ woId: dataItem.fwmodelId }).then(res => {
                vm.detail = res

                // if(res.listWorkAssignTCLDDetail.length > 0) {
                //     let dataSource1 = new kendo.data.DataSource({
                //         data: res.listWorkAssignTCLDDetail,
                //         page: 1,
                //         pageSize: 10
                //     });
                //     vm.listJobsGrid.setDataSource(dataSource1)
                // }
                res.listWorkAssignTCLDDetail.forEach(data => {
                    const newData = vm.isCreateForm ? {...data, woDetailStatus: null} : data
                    vm.listJobsGrid.dataSource.add(newData)

                })

                if (res.woEmployeeName && res.woEmployeeGroupName) { //&& res.woEmployeeCode
                    const data2 = [
                        {
                            employeeCode: res.woEmployeeCode,
                            fullName: res.woEmployeeName,
                            sysGroupName: res.woEmployeeGroupName,
                            sysUserId: dataItem.woEmployee,
                            sysGroupId: dataItem.woEmployeeGroupId,
                        }
                    ]
                    vm.donViThucHienGrid.dataSource.add(data2[0])
                }


                res.listWorkAssignTCLDFile.forEach(data => {
                    vm.listFileGiaoViecGrid.dataSource.add(data)

                })



            }).catch(er => {
            })

        }

        vm.openCopy = function (dataItem) {
            vm.isEditPopup = false;
            vm.isCreateForm = true;
            vm.isClose = null
            vm.isApproveOrReject = null
            vm.isView = false

            vm.isGiahan = false
            vm.formThongTinChung = {
                woCode: null,
                woType: 1,
                startDate: null,
                endDate: null,
                ndung: null
            };
            vm.formDongViec = {
                woId: null,
                woVerifyStatus: null,
                woVerifyNote: null
            }
            vm.formThongTinChiTiet = {
                woApproveName: null,
                woEmployeeName: null,
                woVerifyName: null,
            }
            var templateUrl = 'ktnb/assignmentManagement/addAssignmentManagement.html';
            var title = "Copy";
            modalPopup = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "70%", null, null);
            fillDataListJobGrid()
            fillDonViThucHienGrid()
            fillListFIleGiaoViec()
            vm.getDetail(dataItem)
        };

        vm.openApproveOrReject = function (dataItem, type) {
            vm.isEditPopup = false;
            vm.isCreateForm = false;
            vm.isView = false
            vm.isApproveOrReject = type === 1 ? 'DONGY' : 'TU_CHOI'
            vm.isClose = null
            vm.isGiahan = false
            vm.formThongTinChung = {
                woCode: null,
                woType: 1,
                startDate: null,
                endDate: null,
                ndung: null
            };
            vm.formDongViec = {
                woId: null,
                woVerifyStatus: null,
                woVerifyNote: null
            }
            vm.formThongTinChiTiet = {
                woApproveName: null,
                woEmployeeName: null,
                woVerifyName: null,
            }
            vm.rejectReason = null

            vm.getDetail(dataItem)
            if (type === 1) {
                confirm(CommonService.translate("Bạn có chắc chắn muốn duyệt bản ghi này?"), function () {
                    const payload = {
                        woIds: [dataItem.fwmodelId],
                        woApproveStatus: 1,
                        woEmployeeStatus: null,
                        woVerifyStatus: null,
                        woEmployeeNote: null

                    }
                    kendo.ui.progress(vm.documentBody, true);
                    assignmentManagementService.approveOrReject(payload).then(function () {
                        kendo.ui.progress(vm.documentBody, false);
                        toastr.success(CommonService.translate("Duyệt giao việc thành công"));
                        vm.searchForm = {
                            "page": 1,
                            "pageSize": 10,
                            "keySearch": null, //Thông tin tìm kiếm
                            "startDate": null, //ngày  bđ
                            "endDate": null,//ngày  kt
                            "woType": null, //Loại wo
                            "woStatus": null,
                            "woApproveStatus": null,
                            "woEmployeeStatus": null,
                            "woVerifyStatus": null,
                            "woDateStatus": null,
                            "creatorName": null
                        }
                        vm.doSearch()
                    }, function (err) {
                        toastr.error(CommonService.translate("Có lỗi xảy ra khi duyệt giao việc"));
                        kendo.ui.progress(vm.documentBody, false);
                    });
                });

            } else {
                var templateUrl = 'ktnb/assignmentManagement/rejectPopup.html';
                var title = "Từ chối giao việc";
                modalPopup = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "40%", null, initDataAddFunction, null);
            }
        };


        vm.reject = function () {
            if (!vm.rejectReason) {
                toastr.error(CommonService.translate("Lí do từ chối không được để trống"))
                return
            }
            let payload
            let service
            // const payload = {
            //     "woIds": [vm.detail.fwmodelId],
            //     "woApproveStatus": 2,
            //     "woApproveNote": vm.rejectReason

            // }
            if(vm.isClose) {
                payload = {
                    woId: vm.detail.fwmodelId,
                    woVerifyStatus: 2,
                    woVerifyNote: vm.rejectReason
                }
                service = assignmentManagementService.duyetdong(payload)
            } else {
                payload = {
                    "woIds": [vm.detail.fwmodelId],
                    "woApproveStatus": 2,
                    "woApproveNote": vm.rejectReason
    
                }
                service = assignmentManagementService.approveOrReject(payload)
            }
            service.then(function (res) {
                kendo.ui.progress(vm.documentBody, false);
                vm.cancel()
                vm.doSearch()
                if (res.error) {
                    toastr.erorr(CommonService.translate("Có lỗi xảy ra khi từ chối"));
                } else {
                    toastr.success(CommonService.translate("Từ chối thành công"));
                }

            }, function (err) {
                toastr.error(CommonService.translate("Có lỗi xảy ra khi từ chối"));
                kendo.ui.progress(vm.documentBody, false);
            });
        }

        vm.openCloseOrReject = function (dataItem, type) {
            vm.isEditPopup = false;
            vm.isCreateForm = false;
            vm.isClose = type === 1 ? 'DONGY' : 'TU_CHOI'
            vm.isApproveOrReject = null
            vm.isView = false

            vm.isGiahan = false
            vm.formThongTinChung = {
                woCode: null,
                woType: 1,
                startDate: null,
                endDate: null,
                ndung: null
            };
            vm.formThongTinChiTiet = {
                woApproveName: null,
                woEmployeeName: null,
                woVerifyName: null,
            }
            vm.formDongViec = {
                woId: null,
                woVerifyStatus: null,
                woVerifyNote: null
            }
            vm.rejectReason = null
                var templateUrl = 'ktnb/assignmentManagement/addAssignmentManagement.html';
                var title = "Chi tiết đóng việc";
                modalPopup = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "70%", initDataAddFunction, null);
                fillDataListJobGrid()
                fillDonViThucHienGrid()
                fillListFIleGiaoViec()

                // let templateUrl = 'ktnb/assignmentManagement/rejectPopup.html';
                // let title = "Từ chối đóng việc";
                // modalPopup = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "40%", null, initDataAddFunction, null);

            vm.getDetail(dataItem)



        };

        vm.openEdit = function (dataItem) {
            vm.isEditPopup = true;
            vm.isCreateForm = false;
            vm.isClose = null
            vm.isGiahan = false
            vm.isView = false
            vm.isApproveOrReject = null
            vm.formThongTinChung = {
                woCode: null,
                woType: 1,
                startDate: null,
                endDate: null,
                ndung: null
            };
            vm.formDongViec = {
                woId: null,
                woVerifyStatus: null,
                woVerifyNote: null
            }
            vm.formThongTinChiTiet = {
                woApproveName: null,
                woEmployeeName: null,
                woVerifyName: null,
            }
            var templateUrl = 'ktnb/assignmentManagement/addAssignmentManagement.html';
            var title = "Cập nhật";
            vm.formThongTinChung = {
                woCode: null,
                woType: 1,
                startDate: null,
                endDate: null,
                ndung: null
            };
            modalPopup = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "70%", initDataAddFunction, null, dataItem);

            fillDataListJobGrid()
            fillDonViThucHienGrid()
            fillListFIleGiaoViec()
            vm.getDetail(dataItem)

        };
        vm.openView = function (dataItem) {
            vm.isEditPopup = false;
            vm.isCreateForm = false;
            vm.isClose = null
            vm.isGiahan = false
            vm.isView = true
            vm.isApproveOrReject = null
            vm.formThongTinChung = {
                woCode: null,
                woType: 1,
                startDate: null,
                endDate: null,
                ndung: null
            };
            vm.formDongViec = {
                woId: null,
                woVerifyStatus: null,
                woVerifyNote: null
            }
            vm.formThongTinChiTiet = {
                woApproveName: null,
                woEmployeeName: null,
                woVerifyName: null,
            }
            var templateUrl = 'ktnb/assignmentManagement/addAssignmentManagement.html';
            var title = "Chi tiết";
            vm.formThongTinChung = {
                woCode: null,
                woType: 1,
                startDate: null,
                endDate: null,
                ndung: null
            };
            modalPopup = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "70%", initDataAddFunction, null, dataItem);

            fillDataListJobGrid()
            fillDonViThucHienGrid()
            fillListFIleGiaoViec()
            vm.getDetail(dataItem)

        };

        vm.openGiaHan = function (dataItem) {
            vm.isEditPopup = false;
            vm.isCreateForm = false;
            vm.isClose = null
            vm.isGiahan = true
            vm.isView = false
            vm.formThongTinChiTiet = {
                woApproveName: null,
                woEmployeeName: null,
                woVerifyName: null,
            }
            vm.formThongTinChung = {
                woCode: null,
                woType: 1,
                startDate: null,
                endDate: null,
                ndung: null
            };
            vm.formGiaHan = {
                startDate: null,
                endDate: null,
                extendReason: null,
                woId: dataItem.fwmodelId
            }
            var templateUrl = 'ktnb/assignmentManagement/addAssignmentManagement.html';
            var title = "Gia hạn";
            modalPopup = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "70%", initDataAddFunction, null, dataItem);

            fillDataListJobGrid()
            fillDonViThucHienGrid()
            fillListFIleGiaoViec()
            vm.getDetail(dataItem)

        };

        vm.remove = function (dataItem) {
            confirm(CommonService.translate("Bạn có chắc chắn muốn xóa bản ghi này?"), function () {
                vm.addForm = angular.copy(dataItem);
                const payload = {
                    woId: dataItem.fwmodelId
                }
                kendo.ui.progress(vm.documentBody, true);
                assignmentManagementService.remove(payload).then(function (reponse) {
                    if (reponse.status !== 200) {
                        toastr.error(CommonService.translate("Xóa bản ghi thất bại"));
                    } else {
                        toastr.success(CommonService.translate("Xóa bản ghi thành công"));
                        // vm.searchForm = {
                        //     "page": 1,
                        //     "pageSize": 10,
                        //     "keySearch": null, //Thông tin tìm kiếm
                        //     "startDate": null, //ngày  bđ
                        //     "endDate": null,//ngày  kt
                        //     "woType": null, //Loại wo
                        //     "woStatus": null,
                        //     "woApproveStatus": null,
                        //     "woEmployeeStatus": null,
                        //     "woVerifyStatus": null,
                        //     "woDateStatus": null,
                        //     "creatorName": null
                        // }
                        vm.doSearch()

                        // assignmentManagementService.doSearch(vm.searchForm).then(function (response) {
                        //     let dataSource = new kendo.data.DataSource({
                        //         data: response.data || []
                        //     });
                        //     vm.assignmentManagementGrid.setDataSource(dataSource)
                        // })
                    }
                    kendo.ui.progress(vm.documentBody, false);
                }, function (err) {
                    toastr.error(CommonService.translate("Có lỗi xảy ra"));
                    kendo.ui.progress(vm.documentBody, false);
                });
            });
        };

        vm.openHistoryGiaHan = function () {
            var templateUrl = 'ktnb/assignmentManagement/woHistoryGiaHan.html';
            var title = "Lịch sử gia hạn";
            modalPopup = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "70%", initDataAddFunction, null);
            fillHistory()


        }

        function fillHistory() {
            vm.historyGiaHanGridOptions = kendoConfig.getGridOptions({
                autoBind: true,
                resizable: true,
                scrollable: true,

                dataBinding: function () {
                    sttLichSuGiaHan = (this.dataSource.page() - 1) * this.dataSource.pageSize();
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
                            vm.countRiskProfile = response.total;
                            return response.total;
                        },
                        data: function (response) {
                            var list = response.data;
                            return list;
                        },
                    },
                    transport: {
                        read: function (options) {
                            assignmentManagementService.history({ woId: vm.detail.fwmodelId }).then(function (response) {
                                // let dataSource = new kendo.data.DataSource({
                                //     data: response.data || []
                                // });

                                response.forEach(data => {

                                    vm.historyGiaHanGrid.dataSource.add(data)
                                })
                            })
                        }
                    },


                    pageSize: 10
                },
                noRecords: true,
                columnMenu: false,
                messages: {
                    noRecords: CommonService.translate("Không có kết quả hiển thị")
                },
                pageable: {
                    refresh: false,
                    pageSizes: [5, 10, 15, 20, 25],
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
                        template: function (dataItem) {
                            const stt = (vm.historyGiaHanGrid.dataSource.page() - 1) * vm.historyGiaHanGrid.dataSource.pageSize() + vm.historyGiaHanGrid.dataSource.data().indexOf(dataItem) + 1
                            return stt
                        },
                        width: "40px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; "
                        },
                    },
                    {
                        title: CommonService.translate("Người gia hạn"),
                        field: 'updateName',
                        // template: '<a href="javascript:void(0);" title="#=code#" ng-click=vm.showDetail(dataItem)>#=code#</a>',
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                    },
                    {
                        title: CommonService.translate("Ngày gia hạn"),
                        field: 'updateAt',
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                    },
                    {
                        title: CommonService.translate("Gia hạn từ ngày"),
                        field: 'woStartDateNew',
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                    },
                    {
                        title: CommonService.translate("Gia hạn đến ngày"),
                        field: 'woEndDateOld',
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                    },
                    {
                        title: CommonService.translate("Lý do gia hạn"),
                        field: 'extendReason',
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                    },



                ]
            });
        }
        vm.listSelected = []

        vm.checkAll = function (event) {
            vm.assignmentManagementGrid.dataSource.data().forEach(t => {
                t.selected = event.target.checked
            })
            if (event.target.checked) {
                vm.listSelected = [...new Set([...vm.listSelected, ...vm.assignmentManagementGrid.dataSource.data()])].filter(t => t.woStatus !== 0)
            } else {
                vm.listSelected = vm.listSelected.filter(t => !vm.assignmentManagementGrid.dataSource.data().map(item => item.fwmodelId).includes(t.fwmodelId))
            }

        }
        vm.onChangeCheckBox = function (dataItem, event) {
            const dataSource = vm.assignmentManagementGrid.dataSource
            dataItem.selected = event.target.checked
            if (event.target.checked) {
                vm.listSelected.push(dataItem)
            } else {
                vm.listSelected = vm.listSelected.filter(t => t.fwmodelId !== dataItem.fwmodelId)

            }
            const length = vm.listSelected.filter(t => t.woStatus === 0).length
            const lengthStatus = vm.assignmentManagementGrid.dataSource.data().filter(t => t.woStatus !== 0).length
            if (vm.listSelected.length !== 0 && (lengthStatus + length) % (dataSource.page() * dataSource.pageSize()) === 0) {
                vm.checkall = true
            } else {
                vm.checkall = false

            }
        }

        function fillDataSource(data) {
            vm.assignmentManagementOptions = kendoConfig.getGridOptions({
                autoBind: true,
                resizable: true,
                scrollable: true,
                toolbar: [

                    {
                        name: "actions",
                        template: //ng-if="vm.isThemSuaXoa"
                            '<div>' +
                            '<button type="button" class="btn btn-qlk padding-search-right addQLK ng-scope" style="width: 120px;margin-right:8px;" ng-click="vm.openAdd()" translate>Thêm mới' +
                            '</button>' +
                            '<button ng-if="vm.isTruongPhong" ng-click="vm.onMultipleApprove()" type="button" class="btn btn-qlk padding-search-right ng-scope" style="width: 140px" translate>Xác nhận duyệt' +
                            '</button>' +
                            '</div>' +
                            '</div>' +
                            '<div class="form-group col-md-12">\n' +
                            '                    <div class="col-md-10"> \n' +

                            '                        <file-input list-file-type="xls,xlsx" model="caller.dataList"\n' +
                            '                                    size="104857600" caller="caller" input-id="fileChange"\n' +
                            '                                    model-label="File import"\n' +
                            '                                    msg="Không được để trống file"></file-input>\n' +
                            '\n' +
                            '                    <button class="btn btn-qlk padding-search-right ng-scope" style="width: 120px;margin-right:8px;" ng-click="vm.submitImportNewTargets()"\n' +
                            '                            id="upfile">Tải lên\n' +
                            '                    </button>\n' +
                            '                    </div>\n' +
                            '                    <div class="col-md-1" id="modalLoading"\n' +
                            '                         style="display: none; margin-left: 30px; height: 20px;"></div>\n' +
                            '\n' +
                            '                    <div class="form-group col-md-2" align="right" id="hiden11">\n' +
                            '                        <a id="templateLink" href="" ng-click="vm.getExcelTemplate()">Tải\n' +
                            '                            biểu mẫu</a>\n' +
                            '                    </div>\n' +
                            '                </div>\n' +
                            '                <div class="form-group col-md-12" align="center" id="hiden12">\n' +
                            '                    <i style="color: gray; margin-right:  50px;">Dung lượng <= 100MB, định dạng xls,xlsx</i>\n' +
                            '                </div>' +
                            '<div class="btn-group pull-right margin_top_button margin_right10">' +
                            '<i data-toggle="dropdown" class="tooltip1" aria-expanded="false"><span class="tooltipArrow"></span><span class="tooltiptext" translate>Cài đặt</span><i class="fa fa-cog" aria-hidden="true"></i></i>' +
                            '<i class="tooltip1 action-button excelQLK" ng-click="vm.exportFile()"  aria-expanded="false"><span class="tooltipArrow"></span><span class="tooltiptext" translate>Xuất Excel</span></i>' +
                            '<div class="dropdown-menu hold-on-click dropdown-checkboxes" role="menu">' +
                            '<label ng-repeat="covlumn in vm.assignmentManagementGrid.columns.slice(1,vm.assignmentManagementGrid.columns.length)| filter: vm.gridColumnShowHideFilter">' +
                            '<input type="checkbox" checked="column.hidden" ng-click="vm.showHideColumn(column)"> {{column.title}}' +
                            '</label>' +
                            '</div></div>'
                    }
                ],
                dataBinding: function (options) {
                    vm.checkall = false
                    vm.listSelected = []
                    record = (this.dataSource.page() - 1) * this.dataSource.pageSize();
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
                            vm.count = response.total
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
                            url: Constant.BASE_SERVICE_URL + "workAssignTCLDService/doSearchViewKtnbTCLD",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, type) {
                            vm.searchForm.page = options.page;
                            vm.searchForm.pageSize = options.pageSize;
                            const payload = {
                                ...vm.searchForm,
                                keySearch: vm.searchForm.keySearch ? vm.searchForm.keySearch.trim() : null,
                                creatorName: vm.searchForm.creatorName ? vm.searchForm.creatorName.trim() : null,
                                woDateStatus: vm.searchForm.woDateStatus !== null && vm.searchForm.woDateStatus !== '' ? +(vm.searchForm.woDateStatus) : null,
                                woType: vm.searchForm.woType !== null && vm.searchForm.woType !== '' ? +(vm.searchForm.woType) : null,
                                woStatus: vm.searchForm.woStatus !== null && vm.searchForm.woStatus !== '' ? +(vm.searchForm.woStatus) : null,
                                woApproveStatus: vm.searchForm.woApproveStatus !== null && vm.searchForm.woApproveStatus !== '' ? +(vm.searchForm.woApproveStatus) : null,
                                woEmployeeStatus: vm.searchForm.woEmployeeStatus !== null && vm.searchForm.woEmployeeStatus !== '' ? +(vm.searchForm.woEmployeeStatus) : null,
                                woVerifyStatus: vm.searchForm.woVerifyStatus !== null && vm.searchForm.woVerifyStatus !== '' ? +(vm.searchForm.woVerifyStatus) : null,
                            }
                            return JSON.stringify(payload);
                        }
                    },
                    pageSize: 10,
                    page: 1,

                },
                noRecords: true,
                columnMenu: false,
                messages: {
                    noRecords: CommonService.translate("Không có kết quả hiển thị")
                },
                pageable: {
                    refresh: false,
                    pageSizes: [5, 10, 15, 20, 25],
                    messages: {
                        display: CommonService.translate("{0}-{1} của {2} kết quả"),
                        itemsPerPage: CommonService.translate("kết quả/trang"),
                        empty: CommonService.translate("Không có kết quả hiển thị")
                    }
                },
                columns: [
                    {
                        title: "<input id='checkall' type='checkbox' ng-click='vm.checkAll($event)' ng-model='vm.checkall'/>",
                        template: (dataItem) => {
                            return `<input ng-if=${vm.isTruongPhong && dataItem.woStatus === 0 && dataItem.woApproveStatus !== 2} type='checkbox' ng-click='vm.onChangeCheckBox(dataItem,$event)' ng-model='dataItem.selected'/>`
                        },
                        width: "40px",
                        headerAttributes: { style: "text-align:center;", translate: "" },
                        attributes: { style: "text-align:center;", translate: "" }
                    },
                    {
                        title: CommonService.translate("STT"),
                        field: "stt",
                        template: function (dataItem) {
                            ++record
                            const stt = (vm.assignmentManagementGrid.dataSource.page() - 1) * vm.assignmentManagementGrid.dataSource.pageSize() + vm.assignmentManagementGrid.dataSource.data().indexOf(dataItem) + 1
                            return stt
                        },
                        width: "40px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; "
                        },
                    }, {
                        title: CommonService.translate("Mã WO"),
                        field: 'woCode',
                        width: "110px",
                        template: '<a href="javascript:void(0);" ng-click=vm.openView(dataItem)><u>{{dataItem.woCode}}</u></a>',
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                    }, {
                        title: CommonService.translate("Loại WO"),
                        field: 'woType',
                        width: "200px",
                        template: function (dataItem) {
                            if (dataItem.woType == 1) {
                                return CommonService.translate("Giao việc ngành dọc P.TCLĐ");
                            } else {
                                return CommonService.translate("Cập nhật thông tin CBNV mới");
                            }
                        },
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                        // template: dataItem => vm.getRiskLevel(dataItem.riskLevel)
                    }, {
                        title: CommonService.translate("Ngày bắt đầu"),
                        field: 'startDate',
                        width: "100px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; white-space:normal; "
                        },

                    }, {
                        title: CommonService.translate("Ngày kết thúc"),
                        field: 'endDate',
                        width: "100px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; "
                        },
                    },
                    {
                        title: CommonService.translate("Người tạo"),
                        field: 'creatorName',
                        width: "150px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; "
                        },
                    },
                    {
                        title: CommonService.translate("Ngày tạo"),
                        field: 'createAt',
                        width: "100px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; white-space: normal;"
                        },
                    },
                    {
                        title: CommonService.translate("Đơn vị nhận việc"),
                        field: 'woEmployeeGroupName',
                        width: "250px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; "
                        },
                    },
                    {
                        title: CommonService.translate("Nhân viên thực hiện"),
                        field: 'woEmployeeName',
                        width: "150px",
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; "
                        },
                    },
                    {
                        title: CommonService.translate("Trạng thái nhân viên thực hiện"),
                        field: 'woEmployeeStatus',
                        width: "120px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; "
                        },
                        template: (dataItem) => {
                            if (dataItem.woEmployeeStatus === 0) return 'Chưa nhận việc'
                            if (dataItem.woEmployeeStatus === 1) return 'Đã nhận việc'
                            if (dataItem.woEmployeeStatus === 2) return 'Từ chối'
                            if (dataItem.woEmployeeStatus === 3) return 'Đã hoàn thành'
                            if (!dataItem.woEmployeeStatus) return ''
                        }
                    },
                    {
                        title: CommonService.translate("Ngày hoàn thành"),
                        field: 'woEmployeeCompleteDate',
                        width: "100px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; "
                        },
                    },
                    {
                        title: CommonService.translate("Trạng thái duyệt giao WO của P.TCLĐ"),
                        field: 'woApproveStatus',
                        width: "100px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; "
                        },
                        template: (dataItem) => {
                            if (dataItem.woApproveStatus === 0) return 'Chờ duyệt'
                            if (dataItem.woApproveStatus === 1) return 'Đã duyệt'
                            if (dataItem.woApproveStatus === 2) return 'Từ chối'
                            if (!dataItem.woApproveStatus) return ''
                        }
                    },
                    {
                        title: CommonService.translate("Tình trạng duyệt đóng WO của P.TCLĐ"),
                        field: 'woVerifyStatus',
                        width: "100px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; "
                        },
                        template: (dataItem) => {
                            if (dataItem.woVerifyStatus === 0) return 'Chờ duyệt'
                            if (dataItem.woVerifyStatus === 1) return 'Đã duyệt'
                            if (dataItem.woVerifyStatus === 2) return 'Từ chối'
                            if (!dataItem.woVerifyStatus) return ''
                        }
                    },
                    {
                        title: CommonService.translate("Ngày duyệt của P.TCLĐ"),
                        field: 'closeDate', //woApproveDate
                        width: "100px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; "
                        },
                    },
                    {
                        title: CommonService.translate("Trạng thái WO"),
                        field: 'woStatus',
                        width: "100px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; "
                        },
                        template: (dataItem) => {
                            if (dataItem.woStatus === 0) return 'Dự thảo'
                            if (dataItem.woStatus === 1) return 'Hiệu lực'
                            if (dataItem.woStatus === 2) return 'Hết hiệu lực'
                            if (!dataItem.woStatus) return ''
                        }
                    },
                    {
                        title: CommonService.translate("Tình trạng WO"),
                        field: 'tinhtrang',
                        template: (dataItem) => {
                            dataItem.tinhtrang = !vm.checkExpiredDate(dataItem) ? 'Trong hạn' : 'Quá hạn'
                            return !vm.checkExpiredDate(dataItem) ? 'Trong hạn' : 'Quá hạn'
                        },
                        width: "100px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; "
                        },
                    },
                    {
                        title: CommonService.translate("Thao tác"),
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: center; "
                        },
                        template: dataItem => {
                            const permission = (vm.isThemSuaXoa && dataItem.woEmployeeStatus === 3 && !dataItem.woVerifyStatus)
                                || (Constant.user.VpsUserInfo.fwmodelId === dataItem.createBy && dataItem.woEmployeeStatus === 3 && !dataItem.woVerifyStatus)
                            const isTruongPhong = vm.isTruongPhong
                            const isEditOrDelete = Constant.user.VpsUserInfo.fwmodelId === dataItem.createBy && (dataItem.woStatus === 0 || dataItem.woEmployeeStatus === 2) && vm.isThemSuaXoa
                            const isGiaHan = Constant.user.VpsUserInfo.fwmodelId === dataItem.createBy && dataItem.woStatus === 1 && dataItem.woApproveStatus === 1 && dataItem.woEmployeeStatus === 1 && dataItem.woVerifyStatus !== 1
                            // ng-if="vm.isThemSuaXoa"
                        //         <button type="button" ng-if="${permission}" style=" border: none; background-color: white;" class="#=riskProfileId# icon_table ng-scope" uib-tooltip="Từ chối đóng việc" translate=""
                        //     ng-click="vm.openCloseOrReject(dataItem, 2)">
                        //         <i style="color:#000000;" class="fa fa-times ng-scope" aria-hidden="true"></i>
                        // </button>
                            return `<div class="text-center">
                                <button  type="button" style=" border: none; background-color: white;" class="#=riskProfileId# icon_table ng-scope" uib-tooltip="Copy" translate="" 
                                ng-click="vm.openCopy(dataItem)">
                                 <i class="fa fa-copy ng-scope" aria-hidden="true"></i>
                                </button>
                            
                                <button type="button" ng-if="${isEditOrDelete}" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Sửa bản ghi" translate 
                                ng-click="vm.openEdit(dataItem)" ><i class="fa fa-pencil ng-scope" aria-hidden="true" translate></i></button>
                            
                                <button type="button" ng-if="${isEditOrDelete}" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Xóa bản ghi" translate 
                                ng-click="vm.remove(dataItem)"> <i style="color:steelblue;" class="fa fa-trash ng-scope" aria-hidden="true"></i></button>
                            
                                <button  ng-if="${isGiaHan}" type="button"  style=" border: none; background-color: white;" class="#=riskProfileId# icon_table ng-scope" uib-tooltip="Gia hạn bản ghi" translate="" 
                                ng-click="vm.openGiaHan(dataItem)" >
                                 <i style="color:#53b453;" class="fa fa-share fa-flip-horizontal ng-scope" aria-hidden="true"></i>
                                </button>
                            
                                <button ng-if="${isTruongPhong && dataItem.woStatus === 0 && dataItem.woApproveStatus !== 2}"  type="button" style=" border: none; background-color: white;" class="#=riskProfileId# icon_table ng-scope" uib-tooltip="Duyệt bản ghi" translate="" 
                                ng-click="vm.openApproveOrReject(dataItem, 1)">
                                 <i style="color:#0000ff;" class="fa fa-share ng-scope" aria-hidden="true"></i>
                                </button>
                            
                                <button ng-if="${isTruongPhong && dataItem.woStatus === 0 && dataItem.woApproveStatus !== 2}"  type="button" style=" border: none; background-color: white;" class="#=riskProfileId# icon_table ng-scope" uib-tooltip="Từ chối bản ghi" translate="" 
                                ng-click="vm.openApproveOrReject(dataItem, 2)">
                                 <i style="color:#000000;" class="fa fa-undo ng-scope" aria-hidden="true"></i>
                                </button>
                            
                                <button type="button" ng-if="${permission}" style=" border: none; background-color: white;" class="#=riskProfileId# icon_table ng-scope" uib-tooltip="Duyệt/ từ chối đóng việc" translate="" 
                                ng-click="vm.openCloseOrReject(dataItem, 1)">
                                 <i style="color:green;" class="fa fa-check ng-scope" aria-hidden="true"></i>
                                </button>
                            
                                

                                </div>`
                        },

                        width: "350px",
                        field: "stt"
                    }
                ]
            });
            

        }

        function fillDataListJobGrid() {
            vm.listJobsGridOptions = kendoConfig.getGridOptions({
                autoBind: true,
                resizable: true,
                scrollable: true,
                toolbar: [
                    {
                        name: "actions",
                        template:
                            '<div class=" pull-left" ng-if="caller.isCreateForm || caller.isEditPopup">' +
                            '<button  type="button" class="btn btn-qlk padding-search-right addQLK ng-scope" ng-click="caller.onNewLine()" translate>Thêm mới' +
                            '</button>'
                    }
                ],
                // dataBinding: function () {
                //     sttCongViec = (this.dataSource.page() - 1) * this.dataSource.pageSize();
                // },
                dataSource: {
                    // data:vm.detail.listWorkAssignTCLDDetail ,
                    serverPaging: false,
                    schema: {
                        errors: function (response) {
                            if (response.error) {
                                toastr.error(response.error);
                            }
                            return response.error;
                        },
                        total: function (response) {
                            vm.countRiskProfile = response.total;
                            return response.total;
                        },
                        data: function (response) {
                            var list = response.data
                            return list;
                        },
                    },
                    transport: {
                        create: function (options) {
                            options.success(options.data);
                        },
                        read: function (options) {
                            // options.success(vm.listUqPeople);
                        },
                    },
                    pageSize: 10,
                    page: 1,
                },
                noRecords: true,
                columnMenu: false,
                messages: {
                    noRecords: CommonService.translate("Không có kết quả hiển thị")
                },
                pageable: {
                    refresh: false,
                    pageSizes: [5, 10, 15, 20, 25],
                    messages: {
                        display: CommonService.translate("{0}-{1} của {2} kết quả"),
                        itemsPerPage: CommonService.translate("kết quả/trang"),
                        empty: CommonService.translate("Không có kết quả hiển thị")
                    }
                },
                columns: vm.isClose || vm.isView || vm.isGiahan ? [
                    {
                        title: "STT",
                        field: "stt",
                        width: "70px",
                        headerAttributes: { style: "text-align:center;" },
                        attributes: { style: "text-align:center;" },
                        template: function (dataItem) {
                            const stt = (vm.listJobsGrid.dataSource.page() - 1) * vm.listJobsGrid.dataSource.pageSize() + vm.listJobsGrid.dataSource.data().indexOf(dataItem) + 1
                            return stt
                        },
                        editable: false
                    },
                    {
                        title: "Tên công việc",
                        field: "woDetailName",
                        width: "200px",
                        headerAttributes: { style: "text-align:center;" },
                        attributes: { style: "text-align:left;white-space:normal;" },
                        template: function (dataItem) {
                            return `<div>
                                        <div ng-if="dataItem.isEdit">
                                        <input class=" form-control width100" type="text" required maxlength="500" data-required-msg="Trường này không được để trống"
                                            name="code123" ng-model="caller.formEditTable.woDetailName"/>
                                    </div>
                                        <div ng-if="!dataItem.isEdit" >{{dataItem.woDetailName}}</div>
                                    </div>`
                        }
                    },
                    {
                        title: "Nội dung chi tiết",
                        field: "woDetailContent",
                        width: "300px",
                        headerAttributes: { style: "text-align:center;" },
                        attributes: { style: "text-align:left;" },
                        type: "text",
                        template: function (dataItem) {
                            return `<div>
                                        <div ng-if="dataItem.isEdit">
                                        <textarea class=" form-control width100" type="text" required maxlength="2000" data-required-msg="Trường này không được để trống"
                                            name="code123" ng-model="caller.formEditTable.woDetailContent"></textarea>
                                    </div>
                                        <div ng-if="!dataItem.isEdit">{{dataItem.woDetailContent}}</div>
                                    </div>`
                        }
                    },
                    {
                        title: "Hạn hoàn thành",
                        field: "woDetailEndDate",
                        width: "120px",
                        headerAttributes: { style: "text-align:center;" },
                        attributes: { style: "text-align:center;white-space:normal;" },
                        template: function (dataItem) {
                            // <input kendo-date-picker date-time k-format="'dd/MM/yyyy'" required data-required-msg="Trường này không được để trống"
                            //                    ng-model="caller.formEditTable.woDetailEndDate" style="width: 100%;"
                            //                    min-year="1000"/>
                            return `<div>
                                        <div ng-if="dataItem.isEdit">
                                        <input kendo-date-picker k-format="'dd/MM/yyyy'" name="hanHoanThanh" id="hanHoanThanh"
                                            ng-model="caller.formEditTable.woDetailEndDate" style="width: 100%;" min-year="1000" date-time />
                                            
                                    </div>
                                        <div ng-if="!dataItem.isEdit">{{dataItem.woDetailEndDate}}</div>
                                    </div>`
                        }
                    },
                    {
                        title: "Nhân viên thực hiện",
                        field: "woDetailStatus",
                        width: "200px",
                        headerAttributes: { style: "text-align:center;" },
                        attributes: { style: "text-align:left;white-space:normal;" },
                        template: (dataItem) => {
                            return vm.detail.woEmployeeName
                        }
                     
                    },
                    {
                        title: "Trạng thái nhân viên thực hiện",
                        field: "woDetailStatus",
                        width: "200px",
                        headerAttributes: { style: "text-align:center;" },
                        attributes: { style: "text-align:left;white-space:normal;" },
                        template: (dataItem) => {
                            if (vm.detail.woEmployeeStatus === 0) return 'Chưa nhận việc'
                            if (vm.detail.woEmployeeStatus === 1) return 'Đã nhận việc'
                            if (vm.detail.woEmployeeStatus === 2) return 'Từ chối'
                            if (vm.detail.woEmployeeStatus === 3) return 'Đã hoàn thành'
                            if (!vm.detail.woEmployeeStatus) return ''
                        }
                     
                    },
                    {
                        title: "Lý do từ chối",
                        field: "woDetailStatus",
                        width: "300px",
                        headerAttributes: { style: "text-align:center;" },
                        attributes: { style: "text-align:left;white-space:normal;" },
                        template: (dataItem) => {
                            return vm.detail.woEmployeeStatus === 2 ? vm.detail.woEmployeeNote : ''
                        }
                    },
                    {
                        title: "Tiến độ công việc",
                        field: "woDetailStatus",
                        width: "200px",
                        headerAttributes: { style: "text-align:center;" },
                        attributes: { style: "text-align:left;white-space:normal;" },
                    },
                    {
                        title: "File đính kèm",
                        field: "workAssignTCLDFiles",
                        width: "200px",
                        headerAttributes: { style: "text-align:center;" },
                        attributes: { style: "text-align:left;white-space:normal;" },
                        template: function (dataItem) {
                            return `<div ng-repeat="op in dataItem.workAssignTCLDFiles" style="padding-bottom:8px">
                                       <a target='_blank' ng-click="caller.downloadFile(op)" >{{op.fileName}}</a>
                                    </div>`
                        }
                    },
                ] : [
                    {
                        title: "STT",
                        field: "stt",
                        width: "7%",
                        headerAttributes: { style: "text-align:center;" },
                        attributes: { style: "text-align:center;" },
                        template: function (dataItem) {
                            const stt = (vm.listJobsGrid.dataSource.page() - 1) * vm.listJobsGrid.dataSource.pageSize() + vm.listJobsGrid.dataSource.data().indexOf(dataItem) + 1
                            return stt
                        },
                        editable: false
                    },
                    {
                        title: "Tên công việc",
                        field: "woDetailName",
                        width: "20%",
                        headerAttributes: { style: "text-align:center;" },
                        attributes: { style: "text-align:left;white-space:normal;" },
                        template: function (dataItem) {
                            return `<div>
                                        <div ng-if="dataItem.isEdit">
                                        <input class=" form-control width100" type="text" required maxlength="500" data-required-msg="Trường này không được để trống"
                                            name="code123" ng-model="caller.formEditTable.woDetailName"/>
                                    </div>
                                        <div ng-if="!dataItem.isEdit" >{{dataItem.woDetailName}}</div>
                                    </div>`
                        }
                    },
                    {
                        title: "Nội dung chi tiết",
                        field: "woDetailContent",
                        width: "25%",
                        headerAttributes: { style: "text-align:center;" },
                        attributes: { style: "text-align:left;" },
                        type: "text",
                        template: function (dataItem) {
                            return `<div>
                                        <div ng-if="dataItem.isEdit">
                                        <input class=" form-control width100" type="text" required maxlength="2000" data-required-msg="Trường này không được để trống"
                                            name="code123" ng-model="caller.formEditTable.woDetailContent"/>
                                    </div>
                                        <div ng-if="!dataItem.isEdit">{{dataItem.woDetailContent}}</div>
                                    </div>`
                        }
                    },
                    {
                        title: "Hạn hoàn thành",
                        field: "woDetailEndDate",
                        width: "15%",
                        headerAttributes: { style: "text-align:center;" },
                        attributes: { style: "text-align:left;white-space:normal;" },
                        template: function (dataItem) {
                            // <input kendo-date-picker date-time k-format="'dd/MM/yyyy'" required data-required-msg="Trường này không được để trống"
                            //                    ng-model="caller.formEditTable.woDetailEndDate" style="width: 100%;"
                            //                    min-year="1000"/>
                            return `<div>
                                        <div ng-if="dataItem.isEdit">
                                        <input kendo-date-picker k-format="'dd/MM/yyyy'" name="hanHoanThanh" id="hanHoanThanh"
                                            ng-model="caller.formEditTable.woDetailEndDate" style="width: 100%;" min-year="1000" date-time />
                                            
                                    </div>
                                        <div ng-if="!dataItem.isEdit">{{dataItem.woDetailEndDate}}</div>
                                    </div>`
                        }
                    },
                    {
                        title: "Tiến độ công việc",
                        field: "woDetailNote",
                        width: "20%",
                        headerAttributes: { style: "text-align:center;" },
                        attributes: { style: "text-align:left;white-space:normal;" },
                        // template: function (dataItem) {
                        //     return `<div>
                        //                 <div ng-if="dataItem.isEdit">
                        //                     <input class=" form-control width100" type="text" required maxlength="250"
                        //                         name="code123" ng-model="caller.formEditTable.woDetailStatus"/>
                        //                 </div>
                        //                 <div ng-if="!dataItem.isEdit">{{dataItem.woDetailStatus}}</div>
                        //             </div>`
                        // }
                    },


                    {
                        title: "Thao tác",
                        width: '10%',
                        field: "action",
                        template: function (dataItem) {

                            return `<div class="text-center">
                                    <button type="button" ng-if="!dataItem.isEdit" style="border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="'Cập nhật'" translate>
                                        <i ng-click='caller.onEditLine(dataItem)' class="fa fa-pencil ng-scope" translate></i>
                                    </button>
                                    <button type="button" ng-if="dataItem.isEdit" style="border: none; background-color: white;" class="#=appParamId# icon_table" 
                                        ng-click="caller.onCancelLine(dataItem)" uib-tooltip="Xóa" translate>
                                        <i class="fa fa-ban" style="color: red;" aria-hidden="true"></i>
                                    </button>
                                    <button type="button" ng-if="!dataItem.isEdit" style="border: none; background-color: white;" class="#=appParamId# icon_table"  uib-tooltip="'Xóa'"
                                        ng-click="caller.onDeleteLine(dataItem)" uib-tooltip="Xóa" translate>
                                        <i class="fa fa-trash" style="color: #337ab7;" aria-hidden="true"></i>
                                    </button>
                                    
                                    <button type="button" ng-if="dataItem.isEdit" style="border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="'Lưu'" translate>
                                        <i ng-click='caller.onSaveLine(dataItem)' style="color: #337ab7;" class="fa fa-save ng-scope" translate></i>
                                    </button>
                                
                                </div>`
                        }
                    }
                ]
            });



        }
        vm.formEditTable = {
            woDetailName: null,
            woDetailContent: null,
            woDetailEndDate: null,
            woDetailStatus: null,
        }

        vm.onNewLine = function () {
            if (vm.listJobsGrid.dataSource.data().some(t => t.isEdit)) {
                return
            }
            vm.formEditTable = {
                woDetailName: null,
                woDetailContent: null,
                woDetailEndDate: null,
                woDetailStatus: null,
            }
            vm.listJobsGrid.dataSource.add({ ...vm.formEditTable, isEdit: true })
        }

        vm.onEditLine = function (dataItem) {
            if (vm.listJobsGrid.dataSource.data().some(t => t.isEdit)) {
                return
            }
            dataItem.isEdit = true
            vm.formEditTable.woDetailName = dataItem.woDetailName
            vm.formEditTable.woDetailContent = dataItem.woDetailContent
            vm.formEditTable.woDetailEndDate = dataItem.woDetailEndDate
            vm.formEditTable.woDetailStatus = dataItem.woDetailStatus

        }
        vm.onSaveLine = function (dataItem) {
            if (!vm.formEditTable.woDetailName || !vm.formEditTable.woDetailContent || !vm.formEditTable.woDetailEndDate) {
                toastr.error('Vui lòng nhập đầy đủ thông tin')
                return
            }
            if (vm.formThongTinChung.startDate && vm.formThongTinChung.endDate) {
                var d1 = kendo.parseDate(vm.formThongTinChung.startDate, "dd/MM/yyyy");
                var d2 = kendo.parseDate(vm.formThongTinChung.endDate, "dd/MM/yyyy");
                if (d1 > d2) {
                    toastr.error("Ngày bắt đầu phải nhỏ hơn bằng ngày kết thúc");
                    return;
                }
            }

            const minDate = kendo.parseDate(vm.formThongTinChung.startDate, "dd/MM/yyyy");
            const maxDate = kendo.parseDate(vm.formThongTinChung.endDate, "dd/MM/yyyy");
            const hanDate = kendo.parseDate(vm.formEditTable.woDetailEndDate, "dd/MM/yyyy");
            if (hanDate > maxDate) {
                toastr.error("Hạn hoàn thành phải nhỏ hơn bằng ngày giao việc kết thúc");
                return;
            }
            if (hanDate < minDate) {
                toastr.error("Hạn hoàn thành phải lớn hơn bằng ngày giao việc bắt đầu");
                return;
            }


            // if (vm.listJobsGrid.dataSource.data().some(t => {
            //     let date = kendo.parseDate(t.woDetailEndDate, "dd/MM/yyyy");
            //     if (date > maxDate) {
            //         return true
            //     }
            //     if (date < minDate) {
            //         return true
            //     }
            // })) {
            //     toastr.error("Hạn hoàn thành phải nằm trong khoảng từ ngày giao việc bắt đầu đến ngày giao việc kết thúc");
            //     return;
            // }


            dataItem.isEdit = false
            let found = vm.listJobsGrid.dataSource.data().find(t => t === dataItem)
            found.woDetailName = vm.formEditTable.woDetailName,
                found.woDetailContent = vm.formEditTable.woDetailContent,
                found.woDetailEndDate = vm.formEditTable.woDetailEndDate,
                vm.formEditTable = {
                    "woDetailName": null,
                    "woDetailContent": null,
                    "woDetailEndDate": null,
                }
        }
        vm.onCancelLine = function (dataItem) {

            if (!dataItem.woDetailName && !dataItem.woDetailEndDate) {
                vm.listJobsGrid.dataSource.remove(dataItem)
                return
            }

            dataItem.isEdit = false
            vm.formEditTable = {
                "woDetailName": null,
                "woDetailContent": null,
                "woDetailEndDate": null,
            }
            // dataItem = {...vm.formEditTable}
        }
        vm.onDeleteLine = function (dataItem) {

            confirm(CommonService.translate(`Bạn có chắc chắn muốn xóa bản ghi này?`), function () {
                vm.listJobsGrid.dataSource.remove(dataItem)
            });
            // dataItem = {...vm.formEditTable}
        }

        vm.downloadFile = function downloadFile(data) {
            window.open(Constant.BASE_SERVICE_URL + "fileservice/downloadFileATTT?" + data.filePath, '_blank');

            // window.location = Constant.BASE_SERVICE_URL + "fileservice/downloadFileATTT?" + data.fileName;
            // const url = Constant.BASE_SERVICE_URL + "fileservice/downloadFileATTT?" + data.filePath;
            // downloadFileWithUrl(url);

        }

        function fillDonViThucHienGrid() {
            vm.donViThucHienGridOptions = kendoConfig.getGridOptions({
                autoBind: false,
                scrollable: false,
                resizable: true,
                dataSource: {
                    serverPaging: false,
                    transport: {
                        create: function (options) {
                            options.success(options.data);
                        },
                        read: function (options) {
                            options.success(vm.listUqPeople);
                        },
                    },
                    pageSize: 10,
                    page: 1,
                    schema: {
                        model: {
                            id: "fullName",
                            fields: {
                                sysRoleName: { type: "string" },
                            }
                        }
                    }
                },
                editable: false,
                dataBinding: function () {
                    sttDonVi = (this.dataSource.page() - 1) * this.dataSource.pageSize();
                },
                reorderable: true,
                noRecords: true,
                columnMenu: false,
                messages: {
                    noRecords: "<div style='margin:5px'>Không có kết quả hiển thị</div>"
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
                // columns: columns,
                toolbar: [
                    {
                        name: "actions",
                        template: function () {
                            return '<div class="col-md-12" align="center" ng-if="caller.isCreateForm">\n' +
                                '                    <div>\n' +
                                '                        <file-input list-file-type="xls,xlsx" model="caller.dataList"\n' +
                                '                                    size="104857600" caller="caller" input-id="fileChangeNhanVien"\n' +
                                '                                    model-label="File import"\n' +
                                '                                    msg="Không được để trống file"></file-input>\n' +
                                '\n' +
                                '                    </div>\n' +
                                '                    <button type="button" class="col-md-2 form-group" style="margin-left:20px;margin-right:0" ng-click="caller.uploadExcelNhanVien()"\n' +
                                '                            id="upfile">Tải lên\n' +
                                '                    </button>\n' +
                                '                    <div class="col-md-1" id="modalLoading"\n' +
                                '                         style="display: none; margin-left: 30px; height: 20px;"></div>\n' +
                                '                    <div class="form-group col-md-3" align="right" id="hiden11">\n' +
                                '                        <a id="templateLink" href="" ng-click="caller.getExcelTemplateDonViThucHien()">Tải\n' +
                                '                            biểu mẫu</a>\n' +
                                '                    </div>\n' +
                                '\n' +
                                '                </div>\n' +
                                '                <div ng-if="caller.isCreateForm" class="col-md-12" align="center" id="hiden12" style="padding: 8px 0">\n' +
                                '                    <i style="color: gray; margin-right:  50px;">Dung lượng <= 100MB, định dạng xls,xlsx</i>\n' +
                                '                </div>' +
                                '<div ng-if="caller.isCreateForm" class="col-md-3" style="text-align: right"><label style="margin:0;display:flex; align-items:center ">Chọn nhân viên thực hiện <label style="color:red;">*</label>:</label></div>' +
                                '<div ng-if="caller.isCreateForm" class="col-md-9"><input class="form-control width100" type="text" k-options="caller.listNhanVienOptions" ' +
                                'kendo-auto-complete ng-model="caller.sgForm.keySearch"/></div>' +
                                '</div>'
                        }

                    },

                ],
                columns: [
                    {
                        title: "STT",
                        field: "stt",
                        width: "5%",
                        headerAttributes: { style: "text-align:center;" },
                        attributes: { style: "text-align:center;" },
                        template: function (dataItem) {
                            const stt = (vm.donViThucHienGrid.dataSource.page() - 1) * vm.donViThucHienGrid.dataSource.pageSize() + vm.donViThucHienGrid.dataSource.data().indexOf(dataItem) + 1
                            return stt
                        },
                        editable: false
                    },
                    {
                        title: "Mã nhân viên thực hiện",
                        field: "employeeCode",
                        width: "20%",
                        headerAttributes: { style: "text-align:center;" },
                        attributes: { style: "text-align:left;white-space:normal;" },
                        editable: false,
                    },
                    {
                        title: "Tên nhân viên thực hiện",
                        field: "fullName",
                        width: "25%",
                        headerAttributes: { style: "text-align:center;" },
                        attributes: { style: "text-align:left;" },
                        type: "text",
                        editable: true
                    },
                    {
                        title: "Đơn vị",
                        field: "sysGroupName",
                        width: "20%",
                        headerAttributes: { style: "text-align:center;" },
                        attributes: { style: "text-align:left;white-space:normal;" },
                        editable: false,
                    },
                    {
                        title: "Thao tác",
                        width: '15%',
                        field: "action",
                        editable: false,
                        template: function (dataItem) {
                            return '<div class="text-center">'
                                +
                                '<button type="button" style=" border: none; background-color: white;" class="#=appParamId# icon_table" ' +
                                'ng-click="caller.onDeleteDvThucHien(dataItem)" uib-tooltip="Xóa" translate>' +
                                '<i class="fa fa-trash" style="color: #337ab7;" aria-hidden="true"></i>' +
                                '</button>'
                                +
                                '</div>'
                        }
                    }
                ]
            })

        }
        vm.onDeleteDvThucHien = function (dataItem) {
            confirm(CommonService.translate("Bạn có chắc chắn muốn xóa bản ghi này?"), function () {
                vm.donViThucHienGrid.dataSource.remove(dataItem)
                kendo.ui.progress(vm.documentBody, true);

            });
        }
        function fillListFIleGiaoViec() {

            vm.listFileGiaoViecOptions = kendoConfig.getGridOptions({
                autoBind: false,
                scrollable: false,
                resizable: true,
                dataSource: {
                    serverPaging: false,
                    transport: {
                        create: function (options) {
                            options.success(options.data);
                        },
                        read: function (options) {
                            options.success(vm.listUqPeople);
                        },
                    },
                    pageSize: 10,
                    page: 1,
                    schema: {
                        model: {
                            id: "fullName",
                            fields: {
                                sysRoleName: { type: "string" },
                            }
                        }
                    }
                },
                editable: false,
                dataBinding: function () {
                    sttFile = (this.dataSource.page() - 1) * this.dataSource.pageSize();
                },
                reorderable: true,
                noRecords: true,
                columnMenu: false,
                messages: {
                    noRecords: "<div style='margin:5px'>Không có kết quả hiển thị</div>"
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
                // columns: columns,
                toolbar: [
                    {
                        name: "actions",
                        template: function () {
                            return `
                        <div class="border-gray" ng-if="caller.isCreateForm || caller.isEditPopup">
                        <div class="clearfix">
                            <div class="col-md-12">
                                <input class="file-input" name="files" type="file"  k-localization="{ select: 'Click để chọn file' }"
                                        kendo-upload id="files" tabindex="10" k-select="caller.onSelectFileGiaoViec" />
                            </div>
                        </div>
                        <center>
                            <span style="color: gray" translate>Dung lượng &#60;&#61; 50MB, định dạng pdf, doc, docx,xlxs,xls</span>
                        </center>
                        </div>
                    `
                        }
                    }
                ],
                columns: [
                    {
                        title: "STT",
                        field: "stt",
                        width: "5%",
                        headerAttributes: { style: "text-align:center;" },
                        attributes: { style: "text-align:center;" },
                        template: function (dataItem) {
                            const stt = (vm.listFileGiaoViecGrid.dataSource.page() - 1) * vm.listFileGiaoViecGrid.dataSource.pageSize() + vm.listFileGiaoViecGrid.dataSource.data().indexOf(dataItem) + 1
                            return stt
                        },
                        editable: false
                    },
                    {
                        title: "Tên file",
                        field: "fileName",
                        width: "20%",
                        headerAttributes: { style: "text-align:center;" },
                        attributes: { style: "text-align:left;white-space:normal;" },
                        editable: false,
                        template: function (dataItem) {

                            return `<a target='_blank' href="${Constant.BASE_SERVICE_URL + "fileservice/downloadFileATTT?" + dataItem.filePath}" >${dataItem.fileName}</a>`;
                        }
                    },
                    {
                        title: "Người upload",
                        field: "fileUploader",
                        width: "25%",
                        headerAttributes: { style: "text-align:center;" },
                        attributes: { style: "text-align:left;" },
                        type: "text",
                        editable: true
                    },
                    {
                        title: "Ngày upload",
                        field: "createAt",
                        width: "20%",
                        headerAttributes: { style: "text-align:center;" },
                        attributes: { style: "text-align:left;white-space:normal;" },
                        editable: false,
                    },
                    {
                        title: "Thao tác",
                        width: '15%',
                        field: "action",
                        editable: false,
                        template: function (dataItem) {
                            return '<div class="text-center">'
                                +
                                '<button type="button" style=" border: none; background-color: white;" class="#=appParamId# icon_table" ' +
                                'ng-click="caller.onDeleteFile(dataItem)" uib-tooltip="Xóa" translate>' +
                                '<i class="fa fa-trash" style="color: #337ab7;" aria-hidden="true"></i>' +
                                '</button>'
                                +
                                '</div>'
                        }
                    }
                ]
            });

        }

        vm.onDeleteFile = function (dataItem) {
            confirm(CommonService.translate(`Bạn có chắc chắn muốn xóa bản ghi này?`), function () {
                vm.listFileGiaoViecGrid.dataSource.remove(dataItem)
            });
        }



        vm.gridColumnShowHideFilter = function (item) {
            return item.type == null || item.type !== 1;
        };
        vm.exportFile = function () {
            kendo.ui.progress(vm.documentBody, true);
            const columns = vm.assignmentManagementGrid.columns
            if(vm.isTruongPhong) {
                columns.shift()
            }
            const grid = { ...vm.assignmentManagementGrid, columns: columns }
            var obj = angular.copy(vm.searchForm);
            obj.page = null;
            obj.pageSize = null;
            assignmentManagementService.doSearch(obj).then(function (d) {
                kendo.ui.progress(vm.documentBody, false);
                var data = d.data.map(t => {
                    if (t.woEmployeeStatus === 0) { t.woEmployeeStatus = 'Chưa xác nhận' }
                    if (t.woEmployeeStatus === 1) { t.woEmployeeStatus = 'Đồng ý' }
                    if (t.woEmployeeStatus === 2) { t.woEmployeeStatus = 'Từ chối' }
                    if (t.woEmployeeStatus === 3) { t.woEmployeeStatus = 'Đã hoàn thành' }
                    if (!t.woEmployeeStatus) { t.woEmployeeStatus = '' }

                    if (t.woApproveStatus === 0) { t.woApproveStatus = 'Chờ duyệt' }
                    if (t.woApproveStatus === 1) { t.woApproveStatus = 'Đã duyệt' }
                    if (t.woApproveStatus === 2) { t.woApproveStatus = 'Từ chối' }
                    if (!t.woApproveStatus) { t.woApproveStatus = '' }


                    if (t.woVerifyStatus === 0) { t.woVerifyStatus = 'Chờ duyệt' }
                    if (t.woVerifyStatus === 1) { t.woVerifyStatus = 'Đã duyệt' }
                    if (t.woVerifyStatus === 2) { t.woVerifyStatus = 'Từ chối' }
                    if (!t.woVerifyStatus) { t.woVerifyStatus = '' }


                    if (t.woStatus === 0) { t.woStatus = 'Dự thảo' }
                    if (t.woStatus === 1) { t.woStatus = 'Hiệu lực' }
                    if (t.woStatus === 2) { t.woStatus = 'Hết hiệu lực' }
                    if (!t.woStatus) { t.woStatus = '' }
                    t.tinhtrang = !vm.checkExpiredDate(t) ? 'Trong hạn' : 'Quá hạn'

                    return {
                        ...t,
                        woType: t.woType == 1 ? CommonService.translate("Giao việc ngành dọc P.TCLĐ") : CommonService.translate("Cập nhật thông tin CBNV mới"),
                    }
                })
                CommonService.exportFile(grid, data, vm.listRemove, [], "Danh sách giao việc");
            });
        };
        vm.listRemove = [{
            title: "Thao tác",
        }];

        vm.cancel = function () {
            modalPopup.dismiss();

            // $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
            // vm.doSearch();
            // modalPopupGood.cancel()
        }

        vm.listNhanVienOptions = {
            dataTextField: "name", placeholder: "Tên, Mã nhân viên",
            dataValueField: "sysUserId",
            open: function (e) {
                vm.isSelectSgAutoC = false;
            },
            select: function (e) {
                var dataItem = this.dataItem(e.item.index());
                vm.sgForm.keySearch = null;

                if (vm.donViThucHienGrid.dataSource.data().find(t => t.employeeCode === dataItem.employeeCode)) {
                    toastr.error("Đã tồn tại nhân viên trong danh sách!");
                    return;
                }
                let data = {
                    sysUserId: dataItem.fwmodelId,
                    fullName: dataItem.fullName,
                    sysGroupName: dataItem.sysGroupNameLv2,
                    sysGroupId: dataItem.sysGroupId,
                    employeeCode: dataItem.employeeCode
                };


                vm.donViThucHienGrid.dataSource.add(data);

            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSgAutoC) {
                        vm.sgForm.sysUserId = null;
                        vm.sgForm.keySearch = null;
                    }
                }, 100);
            },
            close: function (e) {
                $timeout(function () {
                    if (vm.sgForm.sysUserId == null) {
                        vm.sgForm.sysUserId = null;
                        vm.sgForm.keySearch = null;
                    }
                }, 1000);

            },
            pageSize: 10,
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        vm.isSelectSgAutoC = false;
                        return Restangular.all("commonRsService/getSysUserForAutoComplete").post(
                            {
                                keySearch: vm.sgForm.keySearch,
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
                '<p class="col-md-6 text-header-auto border-right-ccc" translate>Mã nhân viên</p>' +
                '<p class="col-md-6 text-header-auto" translate>Tên nhân viên </p>' +
                '</div>' +
                '</div>',
            template: '<div class="row" ><div class="col-md-6 col-xs-5" style="float:left">#: data.employeeCode #</div><div  style="padding-left: 5px;width:auto;overflow: hidden"> #: data.fullName #</div> </div>',
        };

        vm.saveAdd = () => {
            if (vm.formThongTinChung.woType === 1 && vm.listJobsGrid.dataSource.data().length === 0) {
                toastr.error("Danh sách công việc không được để trống");
                return
            }
            if (vm.listJobsGrid.dataSource.data().some(t => t.isEdit)) {
                toastr.error('Vui lòng hoàn thiện bảng')
                return
            }
            if (vm.formThongTinChung.startDate && vm.formThongTinChung.endDate) {
                var d1 = kendo.parseDate(vm.formThongTinChung.startDate, "dd/MM/yyyy");
                var d2 = kendo.parseDate(vm.formThongTinChung.endDate, "dd/MM/yyyy");
                if (d1 > d2) {
                    toastr.error("Ngày bắt đầu phải nhỏ hơn bằng ngày kết thúc");
                    return;
                }
            }
            if (vm.formThongTinChung.startDate && vm.formThongTinChung.startDate.split('/')[1] > 12) {
                toastr.error("Tháng bắt đầu không được lớn hơn 12");
                return;
            }

            if (vm.formThongTinChung.endDate && vm.formThongTinChung.endDate.split('/')[1] > 12) {
                toastr.error("Tháng kết thúc không được lớn hơn 12");
                return;
            }
            
            if (vm.donViThucHienGrid.dataSource.data().length === 0) {
                toastr.error("Đơn vị thực hiện không được để trống");
                return

            }
            if (!vm.formThongTinChung.startDate || !vm.formThongTinChung.endDate || !vm.formThongTinChung.woName) {
                toastr.error("Vui lòng nhập đầy đủ thông tin");
                return
            }
            let error = false
            const minDate = kendo.parseDate(vm.formThongTinChung.startDate, "dd/MM/yyyy");
            const maxDate = kendo.parseDate(vm.formThongTinChung.endDate, "dd/MM/yyyy");
            vm.listJobsGrid.dataSource.data().some(t => {
                if (t.woDetailEndDate) {
                    let date = kendo.parseDate(t.woDetailEndDate, "dd/MM/yyyy");
                    if (date > maxDate) {
                        error = true
                        toastr.error("Hạn hoàn thành phải nhỏ hơn bằng ngày giao việc kết thúc");
                        return true
                    }
                    if (date < minDate) {
                        error = true
                        toastr.error("Hạn hoàn thành phải lớn hơn bằng ngày giao việc bắt đầu");
                        return true
                    }
                }
                return false
            })

            if (error) return
            const payload = {
                ...vm.formThongTinChung,
                woType: +vm.formThongTinChung.woType,
                "woCode": null,
                "listUserReceiver": vm.donViThucHienGrid.dataSource.data(),
                "listWorkAssignTCLDFile": vm.listFileGiaoViecGrid.dataSource.data().map(t => {
                    return { ...t, woDetailId: null }
                }),
                "listWorkAssignTCLDDetail": +vm.formThongTinChung.woType === 1 ? vm.listJobsGrid.dataSource.data().map(t => {
                    return { ...t, woDetailId: null }
                }) : [{
                    woDetailContent: vm.listThongTinCanCapNhat,
                    woDetailName: null,
                    woDetailEndDate: null
                }]
            }
            assignmentManagementService.save(payload).then(function (response) {
                if (response.status == 200) {
                    toastr.success(CommonService.translate("Thêm mới thành công"))
                    vm.doSearch()
                    vm.cancel()
                } else {
                    toastr.error(CommonService.translate("Thêm mới thất bại"))
                }
            }).catch(err => {
                toastr.error(CommonService.translate("Thêm mới thất bại"))

            })
        }

        vm.saveEdit = () => {
            if (vm.formThongTinChung.startDate && vm.formThongTinChung.endDate) {
                var d1 = kendo.parseDate(vm.formThongTinChung.startDate, "dd/MM/yyyy");
                var d2 = kendo.parseDate(vm.formThongTinChung.endDate, "dd/MM/yyyy");
                if (d1 > d2) {
                    toastr.error("Ngày bắt đầu phải nhỏ hơn bằng ngày kết thúc");
                    return;
                }
            }
            if (vm.formThongTinChung.startDate && vm.formThongTinChung.startDate.split('/')[1] > 12) {
                toastr.error("Tháng bắt đầu không được lớn hơn 12");
                return;
            }

            if (vm.formThongTinChung.endDate && vm.formThongTinChung.endDate.split('/')[1] > 12) {
                toastr.error("Tháng kết thúc không được lớn hơn 12");
                return;
            }
            if (vm.listJobsGrid.dataSource.data().some(t => t.isEdit)) {
                toastr.error('Vui lòng hoàn thiện bảng')
                return
            }
            // if (vm.donViThucHienGrid.dataSource.data().length === 0) {
            //     toastr.error("Đơn vị thực hiện không được để trống");
            //     return

            // }
            if (!vm.formThongTinChung.startDate || !vm.formThongTinChung.endDate || !vm.formThongTinChung.woName) {
                toastr.error("Vui lòng nhập đầy đủ thông tin");
                return
            }
            let error = false
            const minDate = kendo.parseDate(vm.formThongTinChung.startDate, "dd/MM/yyyy");
            const maxDate = kendo.parseDate(vm.formThongTinChung.endDate, "dd/MM/yyyy");
            vm.listJobsGrid.dataSource.data().forEach(t => {
                if (t.woDetailEndDate) {
                    let date = kendo.parseDate(t.woDetailEndDate, "dd/MM/yyyy");
                    if (date > maxDate) {
                        error = true
                        toastr.error("Hạn hoàn thành phải nhỏ hơn bằng ngày giao việc kết thúc");
                        return
                    }
                    if (date < minDate) {
                        error = true
                        toastr.error("Hạn hoàn thành phải lớn hơn bằng ngày giao việc bắt đầu");
                        return
                    }
                }
            })

            if (error) return
            const payload = {
                ...vm.formThongTinChung,
                woId: vm.detail.fwmodelId,
                woType: +vm.formThongTinChung.woType,
                "listUserReceiver": vm.donViThucHienGrid.dataSource.data(),
                "listWorkAssignTCLDFile": vm.listFileGiaoViecGrid.dataSource.data(),
                "listWorkAssignTCLDDetail": +vm.formThongTinChung.woType === 1 ? vm.listJobsGrid.dataSource.data() : [{
                    woDetailContent: vm.listThongTinCanCapNhat,
                    woDetailName: null,
                    woDetailEndDate: null
                }]
            }
            assignmentManagementService.update(payload).then(function (response) {
                if (response.status === 200) {
                    toastr.success(CommonService.translate("Cập nhật thành công"))
                    vm.doSearch()
                    vm.cancel()
                } else {
                    toastr.error(CommonService.translate("Cập nhật thất bại"))
                }
            }).catch(err => {
                toastr.error(CommonService.translate("Cập nhật thất bại"))

            })
        }

        vm.saveGiaHan = () => {

            if (vm.formGiaHan.startDate) {
                var d1 = kendo.parseDate(vm.formGiaHan.startDate, "dd/MM/yyyy");
                var d2 = kendo.parseDate(vm.formThongTinChung.endDate, "dd/MM/yyyy");
                if (d1 < d2) {
                    toastr.error("Ngày bắt đầu gia hạn phải lớn hơn ngày kết thúc giao việc");
                    return;
                }
            }


            if (vm.formGiaHan.startDate && vm.formGiaHan.endDate) {
                var d1 = kendo.parseDate(vm.formGiaHan.startDate, "dd/MM/yyyy");
                var d2 = kendo.parseDate(vm.formGiaHan.endDate, "dd/MM/yyyy");
                if (d1 >= d2) {
                    toastr.error("Ngày bắt đầu gia hạn phải nhỏ hơn ngày kết thúc gia hạn");
                    return;
                }
            }
            
            if (vm.formGiaHan.startDate && vm.formGiaHan.startDate.split('/')[1] > 12) {
                toastr.error("Tháng bắt đầu không được lớn hơn 12");
                return;
            }

            if (vm.formGiaHan.endDate && vm.formGiaHan.endDate.split('/')[1] > 12) {
                toastr.error("Tháng kết thúc không được lớn hơn 12");
                return;
            }
            if (!vm.formGiaHan.startDate || !vm.formGiaHan.endDate || !vm.formGiaHan.extendReason) {
                toastr.error("Vui lòng nhập đầy đủ thông tin");
                return
            }
            assignmentManagementService.giahan(vm.formGiaHan).then(function (response) {
                toastr.success(CommonService.translate("Gia hạn thành công"))
                vm.doSearch()
                vm.cancel()
            }).catch(err => {
                toastr.success(CommonService.translate("Gia hạn thất bại"))

            })
        }

        vm.saveDuyetDong = (type) => {
            if (!vm.formDongViec.woVerifyNote) {
                toastr.error('Đánh giá công việc của P.TCLĐ không được để trống')
                return
            }
            const payload = {
                woId: vm.detail.fwmodelId,
                woVerifyStatus: type,
                woVerifyNote: vm.formDongViec.woVerifyNote
            }

            assignmentManagementService.duyetdong(payload).then(function (response) {
                toastr.success(CommonService.translate(`${type===1 ? "Đồng ý" : "Từ chối"} đóng duyệt thành công`))
                vm.doSearch()
                vm.cancel()
            }).catch(err => {
                toastr.success(CommonService.translate(`${type===1 ? "Đồng ý" : "Từ chối"} đóng duyệt thất bại`))

            })
        }


        vm.saveItem = () => {
            if (vm.isCreateForm) {
                vm.saveAdd()
            }
            if (vm.isGiahan) {
                vm.saveGiaHan()
            }
            if (vm.isClose) {
                vm.saveDuyetDong(1)
            }
            if (vm.isEditPopup) {
                vm.saveEdit()
            }
        }

        vm.onSelectFileGiaoViec = function (e) {
            if ($("#files")[0].files[0].size > 52428800) {
                toastr.warning(CommonService.translate("Dung lượng file lớn hơn 50MB"));
                setTimeout(function () {
                    $(".k-upload-files.k-reset").find("li").remove();
                    $(".k-upload-files").remove();
                    $(".k-upload-status").remove();
                    $(".k-upload.k-header").addClass("k-upload-empty");
                    $(".k-upload-button").removeClass("k-state-focused");
                }, 10);
                return;
            }
            const fileName = $("#files")[0].files[0].name.split('.')
            const files = ['xlsx', 'doc', 'docx', 'pdf', 'xls']
            if (!files.includes(fileName.pop())) {
                toastr.warning(CommonService.translate("Sai định dạng file"));

                setTimeout(function () {
                    $(".k-upload-files.k-reset").find("li").remove();
                    $(".k-upload-files").remove();
                    $(".k-upload-status").remove();
                    $(".k-upload.k-header").addClass("k-upload-empty");
                    $(".k-upload-button").removeClass("k-state-focused");
                }, 10);
                return;
            }

            if (vm.dataFile != null) {
                for (var h = 0; h < vm.dataFile.length; h++) {
                    if (vm.dataFile[h].name == $("#files")[0].files[0].name) {
                        toastr.warning(CommonService.translate("Không được upload file trùng nhau"));
                        setTimeout(function () {
                            $(".k-upload-files.k-reset").find("li").remove();
                            $(".k-upload-files").remove();
                            $(".k-upload-status").remove();
                            $(".k-upload.k-header").addClass("k-upload-empty");
                            $(".k-upload-button").removeClass("k-state-focused");
                        }, 10);
                        return;
                    }
                }
            }

            var formData = new FormData();
            jQuery.each(jQuery('#files')[0].files, function (i, file) {
                formData.append('multipartFile' + i, file);
            });

            return $.ajax({
                // url: Constant.BASE_SERVICE_URL + "workAssignTCLDService/employee_work",
                url: Constant.BASE_SERVICE_URL + "fileservice/uploadATTT?folder=" + Constant.UPLOAD_FOLDER_TYPE_TEMP,
                type: "POST",
                data: formData,
                enctype: 'multipart/form-data',
                processData: false,
                contentType: false,
                cache: false,
                success: function (data) {
                    $(".k-upload-files.k-reset").find("li").remove();
                    $(".k-upload-files").remove();
                    $(".k-upload-status").remove();
                    $(".k-upload.k-header").addClass("k-upload-empty");
                    $(".k-upload-button").removeClass("k-state-focused");
                    $.map(e.files, function (file, index) {
                        vm.dataFile = vm.listFileGiaoViecGrid.dataSource.data();
                        var obj = {};
                        obj.fileName = file.name;
                        obj.filePath = data[index];
                        obj.createAt = kendo.toString(new Date((new Date()).getTime()), "dd/MM/yyyy");
                        // obj.createdUserId = Constant.user.VpsUserInfo.sysUserId;
                        obj.fileUploader = Constant.user.VpsUserInfo.fullName;
                        vm.dataFile.push(obj);
                        // vm.listFileGiaoViecGrid.dataSource.insert(obj)
                    })

                    // refreshGrid(vm.dataFile);
                    setTimeout(function () {
                        $(".k-upload-files.k-reset").find("li").remove();
                        $(".k-upload-files").remove();
                        $(".k-upload-status").remove();
                        $(".k-upload.k-header").addClass("k-upload-empty");
                        $(".k-upload-button").removeClass("k-state-focused");
                    }, 10);
                }
            });
        }

        vm.submitImportNewTargets = function submitImportNewTargets() {
            vm.dataImport = [];
            var element = $("#capNhatId");
            kendo.ui.progress(element, true);
            if ($("#fileChange")[0].files[0] == null) {
                kendo.ui.progress(element, false);
                toastr.warning(CommonService.translate("Bạn chưa chọn file để import"));
                return;
            }
            if ($("#fileChange")[0].files[0].size > 52428800 * 2) {
                toastr.warning(CommonService.translate("Dung lượng file lớn hơn 100MB"));
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
                url: Constant.BASE_SERVICE_URL + "workAssignTCLDService/importExcelList",
                type: "POST",
                data: formData,
                enctype: 'multipart/form-data',
                processData: false,
                contentType: false,
                cache: false,
                success: function (res) {
                    if (res.data == 'NO_CONTENT') {
                        vm.disableSubmit = false;
                        toastr.warning("File import không có nội dung");
                        kendo.ui.progress(element, false);
                    } else if (res.data.length == 1 && !!res.data[0].errorList && res.data[0].errorList.length > 0) {
                        kendo.ui.progress(element, false);
                        vm.lstErrImport = res.data[0].errorList;
                        vm.objectErr = res.data[0];
                        var templateUrl = "ktnb/assignmentManagement/importResultErrorPopup.html";
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
                        toastr.success('Thêm dữ liệu thành công')
                        // vm.disableSubmit = false;
                        // vm.dataImport = data;
                        // var templateUrl = 'ktnb/assignmentManagement/woAssignImportPopup.html';
                        // var title = CommonService.translate("Xác nhận thêm dữ liệu");
                        // modalPopup = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "75%", "50%", null, null);
                        // fillDataImportResTable(vm.dataImport);
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
                        title: CommonService.translate("STT"),
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
                        title: CommonService.translate("Mã rủi ro"),
                        field: 'code',
                        width: "80px",
                        template: '<a href="javascript:void(0);" title="#=code#" ng-click=caller.showDetail(dataItem)>#=code#</a>',
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                    }, {
                        title: CommonService.translate("Tên rủi ro"),
                        field: 'name',
                        width: "200px",
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; white-space:normal; "
                        },
                    }, {
                        title: CommonService.translate("Loại rủi ro"),
                        field: 'riskType',
                        width: "150px",
                        template: function (dataItem) {
                            if (dataItem.riskType == 1) {
                                return CommonService.translate("Rủi ro hoạt động");
                            } else if (dataItem.riskType == 2) {
                                return CommonService.translate("Rủi ro tuân thủ");
                            } else if (dataItem.riskType == 3) {
                                return CommonService.translate("Rủi ro tài chính");
                            } else if (dataItem.riskType == 4) {
                                return CommonService.translate("Rủi ro chiến lược");
                            } else {
                                return "";
                            }
                        },
                        headerAttributes: {
                            "class": "table-header-cell",
                            style: "text-align: center; font-weight: bold;white-space:normal;"
                        },
                        attributes: {
                            "class": "table-cell",
                            style: "text-align: left; "
                        },
                    },
                    {
                        title: CommonService.translate("Thao tác"),
                        field: 'choose',
                        headerAttributes: {
                            style: "text-align:center;font-weight: bold;",
                            translate: ""
                        },
                        template: dataItem =>
                            '<div class="text-center #=assetLiquidateReqId#">' +
                            '<button type="button" style=" border: none; background-color: white;" class="icon_table ng-scope" uib-tooltip="Xóa" translate ' +
                            'ng-click="caller.removeItem(dataItem)" > <i style="color:steelblue;" class="fa fa-trash ng-scope" aria-hidden="true"></i></button>'
                            +
                            '</div>',

                        width: "10%",
                    }],
            });
        }

        vm.uploadExcelNhanVien = () => {
            var element = $("#capNhatId");
            kendo.ui.progress(element, true);
            const file = $("#fileChangeNhanVien")[0].files[0]
            if (file == null) {
                kendo.ui.progress(element, false);
                toastr.warning(CommonService.translate("Bạn chưa chọn file để import"));
                return;
            }
            if (file.size > 52428800 * 2) {
                toastr.warning(CommonService.translate("Dung lượng file lớn hơn 100MB"));
                return;
            }
            if (file.name.split('.').pop() != 'xls' && file.name.split('.').pop() != 'xlsx') {
                kendo.ui.progress(element, false);
                toastr.warning(CommonService.translate("Sai định dạng file"));
                return;
            }
            var formData = new FormData();

            // ?folder=temp
            formData.append('multipartFile', $("#fileChangeNhanVien")[0].files[0]);
            return $.ajax({
                url: Constant.BASE_SERVICE_URL + "workAssignTCLDService/importExcel",
                type: "POST",
                data: formData,
                enctype: 'multipart/form-data',
                processData: false,
                contentType: false,
                cache: false,
                success: function (res) {
                    if (res?.error) {
                        toastr.error(res?.error)

                    } else if (res.data.length == 1 && !!res.data[0].errorList && res.data[0].errorList.length > 0) {
                        kendo.ui.progress(element, false);
                        vm.lstErrImport = res.data[0].errorList;
                        vm.objectErr = res.data[0];
                        var templateUrl = "ktnb/assignmentManagement/importResultErrorPopup.html";
                        var title = "Kết quả Import";
                        var windowId = "ERR_IMPORT";
                        vm.disableSubmit = false;
                        CommonService.populatePopupCreate(templateUrl, title, vm.lstErrImport, vm, windowId, false, '80%', '420px');

                        // setTimeout(function () {
                        //     modalInstanceImport = CommonService.getModalInstance1();
                        // }, 100);
                        fillDataImportErrTable(vm.lstErrImport);
                    }
                    else {
                        vm.donViThucHienGrid.dataSource.add(...res.data)
                        toastr.success("Import file thành công");

                    }

                    // if (res?.error) {
                    //     toastr.error(res?.error)

                    // } else {
                    //     vm.donViThucHienGrid.dataSource.add(...res.data)
                    //     toastr.success("Import file thành công");

                    // }

                    $("#fileChangeNhanVien").val("");
                    $scope.$apply();
                },
            });

        }

        vm.closeErrImportPopUp = function closeErrImportPopUp() {
            CommonService.getModalInstance1().dismiss();
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
                        title: "STT",
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

        vm.createBySearchOptions = {
            clearButton: false,
            dataTextField: "name", placeholder: CommonService.translate("Nhập tên/mã nhân viên"),
            dataValueField: "name",
            open: function (e) {
                vm.isSelectSearchCreateBy = false;
            },
            select: function (e) {
                vm.isSelectSearchCreateBy = true;
                var dataItem = this.dataItem(e.item.index());
                // vm.searchForm.createBy = dataItem.sysUserId;
                vm.searchForm.creatorName = dataItem.fullName;
            },
            change: function (e) {
                $timeout(function () {
                    if (e.sender.value() === '' || !vm.isSelectSearchCreateBy) {
                        // vm.searchForm.createBy = null;
                        vm.searchForm.creatorName = null;
                    }
                }, 100);
            },
            close: function (e) {
                // $timeout(function () {
                //     if (vm.searchForm.createBy == null) {
                //         vm.searchForm.creatorName = null;
                //     }
                // }, 1000);

            },
            pageSize: 10,
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        vm.isSelectSearchCreateBy = false;
                        return Restangular.all("commonRsService/getSysUserForAutoComplete").post(
                            {
                                keySearch: vm.searchForm.creatorName,
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
                '<p class="col-md-6 text-header-auto border-right-ccc" translate>Mã nhân viên</p>' +
                '<p class="col-md-6 text-header-auto" translate>Tên nhân viên</p>' +
                '</div>' +
                '</div>',
            template: '<div class="row" ><div class="col-md-6 col-xs-5" style="float:left">#: data.employeeCode #</div><div  style="padding-left: 5px;width:auto;overflow: hidden"> #: data.fullName #</div> </div>',
        };


    }
})();
