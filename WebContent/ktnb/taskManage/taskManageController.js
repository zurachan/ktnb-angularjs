(function () {
    'use strict';
    var controllerId = 'taskManageController';

    angular.module('MetronicApp').controller(controllerId, taskManageController);

    function taskManageController($scope, $http, $timeout, $rootScope, $log, $filter, Constant, Restangular, CommonService, kendoConfig, $kWindow, RestEndpoint, gettextCatalog) {
        var vm = this;
        var modalPopup;
        vm.formGetWork = {};
        vm.formDoWork = {};
        vm.formReject = {};
        vm.listtaskManageExportTemp = [];
        vm.modalBody = ".k-widget.k-window";
        vm.documentBody = $(".tab-content");
        vm.searchForm = {
            keyword: null,
            date: null,
            statusTask: null,
            statusApprove: null,
            woType: null,
        };
        vm.pattern = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

        vm.listStatusTask = [
            {id: 0, name: 'Chưa nhận việc'},
            {id: 1, name: 'Đã nhận việc'},
            {id: 2, name: 'Từ chối'},
            {id: 3, name: 'Đã hoàn thành'},
        ]
        vm.listStatusApprove = [
            {id: 0, name: 'Chờ duyệt'},
            {id: 1, name: 'Đã duyệt'},
            {id: 2, name: 'Từ chối'},
        ]

        initFormData();

        //
        function initFormData() {
            $("#ktnb_searchForm_taskManageId").click(function (e) {
            });
            // fillDataTable([]);
            vm.String = CommonService.translate("Quản lý công việc nhân viên")
            vm.addForm = {};
            vm.dataList = [];
        }

        // ----- Main Grid start
        vm.showHideColumnDetail = function (column) {
            var grid = vm.taskManageGrid;
            if (angular.isUndefined(column.hidden)) {
                grid.hideColumn(column);
            } else if (column.hidden) {
                grid.showColumn(column);
            } else {
                grid.hideColumn(column);
            }
        };

        //
        var record = 0;
        vm.taskManageGridOptions = kendoConfig.getGridOptions({
            autoBind: true,
            scrollable: true,
            resizable: true,
            editable: false,
            dataBinding: function () {
                record = (this.dataSource.page() - 1) * this.dataSource.pageSize();
            },
            reorderable: true,
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
                        url: Constant.BASE_SERVICE_URL + "workAssignTCLDService/doSearchViewKtnbTCLDNV",
                        contentType: "application/json; charset=utf-8",
                        type: "POST"
                    },
                    parameterMap: function (options, type) {
                        document.getElementById("keyword").value = vm.searchForm.keyword ? vm.searchForm.keyword.trim() : null;

                        if (vm.searchForm.date && vm.searchForm.date !== '__/__/____' && !vm.pattern.test(vm.searchForm.date)) {
                            toastr.error('Bạn vui lòng nhập đúng định dạng ngày dd/mm/yyyy.');
                            return;
                        }

                        var obj = angular.copy(vm.searchForm);
                        obj.page = options.page;
                        obj.pageSize = options.pageSize;
                        // obj.sysUserId = Constant.user.vpsUserToken.sysUserId;
                        obj.keySearch = vm.searchForm.keyword ? vm.searchForm.keyword.trim() : null;
                        obj.woType = vm.searchForm.woType || null;
                        obj.closeDate = vm.searchForm.date === '__/__/____' ? null : vm.searchForm.date;
                        obj.woEmployeeStatus = vm.searchForm.statusTask || null ;
                        obj.woVerifyStatus = vm.searchForm.statusApprove || null;

                        record = 0;
                        return JSON.stringify(obj);
                    }
                },
                pageSize: 15
            },
            columnMenu: false,
            noRecords: true,
            messages: {
                noRecords: "<div style='margin:5px'>Không có kết quả hiển thị</div>"
            },
            pageable: {
                refresh: false,
                pageSizes: [15, 20, 25],
                messages: {
                    display: "{0}-{1} của {2} kết quả",
                    itemsPerPage: "kết quả/trang",
                    empty: " "
                    // empty: "Không có kết quả hiển thị"
                }
            },
            columns: [
                {
                    title: CommonService.translate("STT"),
                    field: "stt",
                    template: function () {
                        return ++record;
                    },
                    width: "4%",
                    headerAttributes: {
                        style: "text-align:center; font-weight: bold; text-wrap: wrap;",
                        translate: ""
                    },
                    hidden: false,
                    attributes: {
                        style: "text-align: center; text-wrap: wrap;"
                    }
                },
                {
                    title: CommonService.translate("Mã WO"),
                    field: "woCode",
                    width: "9%",
                    headerAttributes: {
                        style: "text-align:center; font-weight: bold; text-wrap: wrap;",
                        translate: ""
                    },
                    hidden: false,
                    attributes: {
                        style: "text-align: left; text-wrap: wrap;"
                    },
                    template: function (dataItem) {
                        return `
                            <button type="button" style="border: none; background-color: transparent; text-decoration: underline; color: #0a4d85; cursor: pointer"
                                ng-click="vm.openPopup(dataItem, 1)" translate>
                                {{dataItem.woCode}}
                            </button>
                        `
                    }
                },
                {
                    title: CommonService.translate("Nội dung công việc"),
                    field: "woName",
                    headerAttributes: {
                        "class": "table-header-cell",
                        style: "text-align:center; font-weight: bold; text-wrap: wrap;",
                    },
                    attributes: {
                        "class": "table-cell",
                        style: "text-align: left; text-wrap: wrap;"
                    },
                    hidden: false,
                    width: "12%"
                },
                {
                    title: CommonService.translate("Thời gian bắt đầu"),
                    field: "startDate",
                    width: "8%",
                    footerAttributes: {style: "display:none"},
                    headerAttributes: {
                        style: "text-align:center; font-weight: bold; text-wrap: wrap;",
                        translate: ""
                    },
                    attributes: {style: "text-align:center; text-wrap: wrap;white-space:normal;"},
                }, {
                    title: CommonService.translate("Thời gian kết thúc"),
                    field: "endDate",
                    width: "8%",
                    footerAttributes: {style: "display:none"},
                    headerAttributes: {
                        style: "text-align:center; font-weight: bold; text-wrap: wrap;",
                        translate: ""
                    },
                    attributes: {style: "text-align:center; text-wrap: wrap;white-space:normal;"},
                }, {
                    title: CommonService.translate("Người giao việc"),
                    field: "creatorName",
                    width: "9%",
                    footerAttributes: {style: "display:none"},
                    headerAttributes: {
                        style: "text-align:center; font-weight: bold; text-wrap: wrap;",
                        translate: ""
                    },
                    attributes: {style: "text-align:center; text-wrap: wrap;white-space:normal;"},
                }, {
                    title: CommonService.translate("Nhân viên thực hiện"),
                    field: "woEmployeeName",
                    width: "9%",
                    footerAttributes: {style: "display:none"},
                    headerAttributes: {
                        style: "text-align:center; font-weight: bold; text-wrap: wrap;",
                        translate: ""
                    },
                    attributes: {style: "text-align:center; text-wrap: wrap;white-space:normal;"},
                }, {
                    title: CommonService.translate("Trạng thái nhân viên thực hiện"),
                    field: "woEmployeeStatus",
                    template: function (dataItem) {
                        return (dataItem.woEmployeeStatus !== null ? vm.listStatusTask[dataItem.woEmployeeStatus].name : "")
                    },
                    width: "9%",
                    footerAttributes: {style: "display:none"},
                    headerAttributes: {
                        style: "text-align:center; font-weight: bold; text-wrap: wrap;",
                        translate: ""
                    },
                    attributes: {style: "text-align:center; text-wrap: wrap;white-space:normal;"},
                }, {
                    title: CommonService.translate("Ngày hoàn thành"),
                    field: "woEmployeeCompleteDate",
                    width: "9%",
                    footerAttributes: {style: "display:none"},
                    headerAttributes: {
                        style: "text-align:center; font-weight: bold; text-wrap: wrap;",
                        translate: ""
                    },
                    attributes: {style: "text-align:center; text-wrap: wrap;white-space:normal;"},
                }, {
                    title: CommonService.translate("Tình trạng duyệt đóng WO của P.TCLĐ"),
                    field: "woVerifyStatus",
                    template: function (dataItem) {
                        return (dataItem.woVerifyStatus !== null ? vm.listStatusApprove[dataItem.woVerifyStatus].name : "")
                    },
                    width: "8%",
                    footerAttributes: {style: "display:none"},
                    headerAttributes: {
                        style: "text-align:center; font-weight: bold; text-wrap: wrap;",
                        translate: ""
                    },
                    attributes: {style: "text-align:center; text-wrap: wrap;white-space:normal;"},
                }, {
                    title: CommonService.translate("Tình trạng WO"),
                    field: "woStatus",
                    template: function (dataItem) {
                        const day = dataItem.endDate.slice(0, 2)
                        const month = dataItem.endDate.slice(3, 5)
                        const year = dataItem.endDate.slice(6)
                        const status = ((!dataItem.endDate) || (dataItem.endDate && (new Date(year, month, day) > new Date())) ? "Trong hạn" : "Quá hạn")
                        return status
                    },
                    width: "8%",
                    footerAttributes: {style: "display:none"},
                    headerAttributes: {
                        style: "text-align:center; font-weight: bold; text-wrap: wrap;",
                        translate: ""
                    },
                    attributes: {style: "text-align:center; text-wrap: wrap;white-space:normal;"},
                },
                {
                    title: CommonService.translate("Thao tác"),
                    headerAttributes: {
                        "class": "table-header-cell",
                        style: "text-align:center; font-weight: bold; text-wrap: wrap;",
                    },
                    attributes: {
                        "class": "table-cell",
                        style: "text-align: center; text-wrap: wrap;"
                    },
                    template: dataItem =>
                        '<div class="text-center">'
                        +
                        '<button style=" border: none; background-color: white;" class="#=riskProfileId# icon_table ng-scope" uib-tooltip="Thực hiện công việc" translate="" ' +
                        'ng-click="vm.openPopup(dataItem, 0)" ng-if="dataItem.woEmployeeStatus === 1 || dataItem.woVerifyStatus === 2">' +
                        ' <i style="color:#015478;" class="fa fa-plus ng-scope" aria-hidden="true"></i>' +
                        '</button>'
                        +
                        '<button style=" border: none; background-color: white;" class="#=riskProfileId# icon_table ng-scope" uib-tooltip="Nhận việc" translate="" ' +
                        'ng-click="vm.acceptOrRejectWork(null, 1, dataItem)" ng-if="!dataItem.woEmployeeStatus">' +
                        ' <i style="color:#4b7902;" class="fa fa-check ng-scope" aria-hidden="true"></i>' +
                        '</button>'
                        +
                        '<button style=" border: none; background-color: white;" class="#=riskProfileId# icon_table ng-scope" uib-tooltip="Từ chối nhận việc" translate="" ' +
                        'ng-click="vm.openCloseOrReject(dataItem, 2)" ng-if="!dataItem.woEmployeeStatus">' +
                        ' <i style="color:#d9001b;" class="fa fa-times ng-scope" aria-hidden="true"></i>' +
                        '</button>'
                        +
                        // '<button class="#=riskProfileId# icon_table ng-scope" uib-tooltip="Từ chối nhận việc" translate="" ' +
                        // 'ng-click="vm.openPopup(dataItem, 0)">' +
                        // ' <i class="fa fa-eye ng-scope" aria-hidden="true"></i>' +
                        // '</button>'
                        // +
                        '</div>',
                    width: "8%",
                    field: "actions"
                }
            ]
        });

        vm.openPopup = function (dataItem, isView = 0) {
            vm.isViewPopUp = isView
            const templateUrl = 'ktnb/taskManage/taskManagePopupDetail.html';
            const title = isView ? "Chi tiết công việc" : "Thực hiện công việc";

            modalPopup = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "80%", "70%", initDataAddFunction, null);
            fillDataPopup()
            // fillDataJobs()
            fillDataListJobGrid()
            vm.getDetail(dataItem)
        };

        vm.openCloseOrReject = function (dataItem, status) {
            var templateUrl = 'ktnb/taskManage/taskManagePopupReject.html';
            var title = "Từ chối nhận việc";
            vm.formReject = {
                woId: dataItem.woId,
                woEmployeeStatus: status,
                woEmployeeNote: null
            };

            modalPopup = CommonService.createCustomPopupWithEvent(templateUrl, title, vm, null, "50%", "24%", initDataAddFunction, null);
        };

        vm.getDetail = function (dataItem) {
            var apiUrl = Constant.BASE_SERVICE_URL + "workAssignTCLDService/getDetail";
            var requestBody = {
                woId: dataItem.woId
            };

            $http.post(apiUrl, requestBody)
                .then(function (response) {
                    vm.formGetWork = response.data;

                    $.map(vm.formGetWork.listWorkAssignTCLDFile, function (item, index) {
                        vm.dataFileGiaoViec = vm.listFileGiaoViecOptions.dataSource.data();
                        vm.dataFileGiaoViec.push(item);
                    })
                    $.map(vm.formGetWork.listWorkAssignTCLDDetail, function (item, index) {
                        if (vm.formGetWork.woVerifyStatus === 2) {
                            item.woDetailComment = null;
                            item.woDetailNote = null;

                            if (vm.isViewPopUp === 0) {
                                item.workAssignTCLDFiles = [];
                            }
                        }

                        vm.dataJobs = vm.listJobsGridOptions.dataSource.data();
                        vm.dataJobs.push(item);
                    })
                })
                .catch(function (error) {
                    console.error('Error:', error);
                });
        }

        function initDataAddFunction() {
            $("#taskManage_popupId").click(function (e) {
                console.log(vm.addForm);
            });
            setTimeout(function () {
                $(".k-icon .k-clear-value .k-i-close").remove();
            }, 10);
        }

        //tim kiem
        vm.doSearch = doSearch;

        function doSearch() {
            const formValue = vm.searchForm
            var grid = vm.taskManageGrid;
            if (grid) {
                grid.dataSource.query({
                    page: 1,
                    pageSize: 15
                });
                vm.listDataChoise = [];
            }
        };

        //clear
        vm.clear = function (a) {
            if (a === 'keyword') {
                vm.searchForm.keyword = null;
            } else if (a === 'date') {
                vm.searchForm.date = null;
            }
        }

        /*
         * đóng Popup
         */
        vm.cancel = function () {
            $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
        }

        vm.acceptOrRejectWork = function (data, type = 1, dataItem = null) {
            const apiUrl = Constant.BASE_SERVICE_URL + "workAssignTCLDService/employee_status";
            const requestBody = {
                ...vm.formReject,
                woEmployeeNote: data && data.woEmployeeNote ? data.woEmployeeNote.trim() : null
            };
            type === 1 ? (
                requestBody.woId = dataItem.woId,
                    requestBody.woEmployeeStatus = 1
            ) : ''

            kendo.ui.progress($(vm.modalBody), true);
            $http.post(apiUrl, requestBody)
                .then(function (response) {
                    kendo.ui.progress($(vm.modalBody), false);
                    if (response && response.error) {
                        toastr.error(response.error);
                    } else {
                        toastr.success(`${type === 1 ? 'Nhận việc' : 'Từ chối nhận việc'} thành công`);
                        vm.doSearch();
                        $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
                    }
                })
                .catch(function (error) {
                    kendo.ui.progress($(vm.modalBody), false);
                    console.log('Không thể kết nối để cập nhật dữ liệu: ' + err.message);
                });
        }

        vm.save = function (woType) {
            const apiUrl = Constant.BASE_SERVICE_URL + "workAssignTCLDService/performTheWork";

            if (woType === 1) {
                vm.listJobsGrid.dataSource.sync(); // Assuming you want to persist the changes to the server
                vm.formGetWork.listWorkAssignTCLDDetail = vm.listJobsGrid.dataSource.data();

                if (vm.formGetWork.listWorkAssignTCLDDetail.length) {
                    for (var i = 0; i < vm.formGetWork.listWorkAssignTCLDDetail.length; i++) {
                        var item = vm.formGetWork.listWorkAssignTCLDDetail[i];

                        if (item.workAssignTCLDFiles.length) {
                            for (var k = 0; k < item.workAssignTCLDFiles.length; k++) {
                                var file = item.workAssignTCLDFiles[k];

                                if (!file.fileName || !file.filePath) {
                                    // console.log('Item at index ' + i + ' has missing fileName or filePath:', file);
                                    toastr.error('File đính kèm không được để trống.');
                                    return;
                                }
                            }
                        } else {
                            toastr.error('File đính kèm không được để trống.');
                            return;
                        }
                    }
                } else {
                    toastr.error('File đính kèm không được để trống.');
                    return;
                }
            } else if (woType === 2) {

                if (!vm.formGetWork.listWorkAssignTCLDDetail[0].woDetailComment) {
                    toastr.error('Nội dung cập nhật công việc của nhân viên không được để trống.');
                    return;
                } else {
                    vm.formGetWork.listWorkAssignTCLDDetail[0].woDetailComment = vm.formGetWork.listWorkAssignTCLDDetail[0].woDetailComment.trim()
                    if (vm.formGetWork.listWorkAssignTCLDDetail[0].woDetailComment.length >= 1000) {
                        toastr.error('Nội dung cập nhật công việc của nhân viên quá dài.');
                        return;
                    }
                }
            }

            kendo.ui.progress($(vm.modalBody), true);
            const requestBody = vm.formGetWork
            // console.log('requestBody', requestBody)
            $http.post(apiUrl, requestBody)
                .then(function (response) {
                    kendo.ui.progress($(vm.modalBody), false);
                    if (response && response.error) {
                        toastr.error(response.error);
                    } else {
                        toastr.success(`Ghi lại thành công`);
                        vm.doSearch();
                        modalPopup.close();
                    }
                })
                .catch(function (error) {
                    kendo.ui.progress($(vm.modalBody), false);
                    console.log('Không thể kết nối để cập nhật dữ liệu: ' + err.message);
                });
        }

       function fillDataPopup() {
           vm.listFileGiaoViecOptions = kendoConfig.getGridOptions({
               autoBind: false,
               scrollable: false,
               resizable: true,
               dataSource: new kendo.data.DataSource({
                   data: [],
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
                   schema: {
                       model: {
                           id: "fullName",
                           fields: {
                               sysRoleName: {type: "string"},
                           }
                       }
                   }
               }),
               editable: false,
               dataBinding: function () {
                   record = (this.dataSource.page() - 1) * this.dataSource.pageSize();
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
                       empty: "<div style='margin:5px'> </div>"
                   }
               },
               columns: [
                   {
                       title: "STT",
                       field: "stt",
                       width: "5%",
                       headerAttributes: {style: "text-align:center;"},
                       attributes: {style: "text-align:center;"},
                       template: function (dataItem) {
                           return ++record;
                       },
                       editable: false
                   },
                   {
                       title: "Tên file",
                       field: "fileName",
                       width: "60%",
                       headerAttributes: {style: "text-align:center;"},
                       attributes: {style: "text-align:left;white-space:normal;"},
                       editable: false,
                       template: function (dataItem) {
                           return "<a href='' ng-click='caller.downloadFile(dataItem)'>" + dataItem.fileName + "</a>";
                       }
                   },
                   {
                       title: "Người upload",
                       field: "fileUploader",
                       width: "35%",
                       headerAttributes: {style: "text-align:center;"},
                       attributes: {style: "text-align:left;"},
                       type: "text",
                       editable: true
                   },
               ]
           });
       }

       function fillDataJobs() {
           vm.listJobsGridOptions = kendoConfig.getGridOptions({
               autoBind: false,
               scrollable: false,
               resizable: true,
               dataSource: new kendo.data.DataSource({
                   data: [],
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
                   schema: {
                       model: {
                           id: "fullName",
                           fields: {
                               sysRoleName: {type: "string"},
                           }
                       }
                   }
               }),
               editable: false,
               dataBinding: function () {
                   record = (this.dataSource.page() - 1) * this.dataSource.pageSize();
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
                       empty: "<div style='margin:5px'> </div>"
                       // empty: "<div style='margin:5px'>Không có kết quả hiển thị</div>"
                   }
               },
               toolbar: [
                   {
                       name: "actions",
                       template: function () {
                           return `
                        <div class="border-gray">
                        <div>
                            <center translate>Kéo thả các file vào đây hoặc click để chọn file</center>
                        </div>
                        <div class="clearfix">
                            <div class="col-md-12">
                                <input class="file-input" name="files" type="file"
                                        kendo-upload id="files" tabindex="10" k-select="caller.onSelectFileGiaoViec" />
                            </div>
                        </div>
                        <center>
                            <span ng-if="caller.isViewPopUp !== 1" style="color: #d9001b" translate>Đồng chí lưu ý: Đính kèm file PDF được lãnh đạo đơn vị duyệt khi hoàn thành WO</span>
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
                       headerAttributes: {style: "text-align:center; text-wrap: wrap;"},
                       attributes: {style: "text-align:center; text-wrap: wrap;"},
                       template: function (dataItem) {
                           return ++record;
                       },
                       editable: false
                   },
                   {
                       title: "Tên file",
                       field: "fileName",
                       width: "20%",
                       headerAttributes: {style: "text-align:center; text-wrap: wrap;"},
                       attributes: {style: "text-align:left;white-space:normal; text-wrap: wrap;"},
                       editable: false,
                   },
                   {
                       title: "Ngày upload",
                       field: "createAt",
                       width: "20%",
                       headerAttributes: {style: "text-align:center; text-wrap: wrap;"},
                       attributes: {style: "text-align:left;white-space:normal; text-wrap: wrap;"},
                       editable: false,
                   },
                   {
                       title: "Người upload",
                       field: "fileUploader",
                       width: "25%",
                       headerAttributes: {style: "text-align:center; text-wrap: wrap;"},
                       attributes: {style: "text-align:left; text-wrap: wrap;"},
                       type: "text",
                       editable: true
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

        function fillDataListJobGrid() {
            vm.listJobsGridOptions = kendoConfig.getGridOptions({
                autoBind: true,
                resizable: true,
                scrollable: true,
                dataBinding: function () {
                    record = (this.dataSource.page() - 1) * this.dataSource.pageSize();
                },
                dataSource: new kendo.data.DataSource({
                    data: [],
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
                }),
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
                        empty: ''
                        // empty: CommonService.translate("Không có kết quả hiển thị")
                    }
                },
                toolbar: [
                    {
                        name: "actions",
                        template: function () {
                            return `
                        <div class="border-gray">
                            <center>
                                <span ng-if="caller.isViewPopUp !== 1" style="color: #d9001b" translate>Đồng chí lưu ý: Đính kèm file PDF được lãnh đạo đơn vị duyệt khi hoàn thành WO</span>
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
                            return ++record;
                        },
                        editable: false
                    },
                    {
                        title: "Nội dung công việc",
                        field: "woDetailName",
                        width: "15%",
                        headerAttributes: { style: "text-align:center;" },
                        attributes: { style: "text-align:left;white-space:normal;" },
                    },
                    {
                        title: "Nội dung chi tiết",
                        field: "woDetailContent",
                        width: "20%",
                        headerAttributes: { style: "text-align:center;" },
                        attributes: { style: "text-align:left;white-space:normal;" },
                        type: "text",
                    },
                    {
                        title: "Hạn hoàn thành",
                        field: "woDetailEndDate",
                        width: "10%",
                        headerAttributes: { style: "text-align:center;" },
                        attributes: { style: "text-align:left;white-space:normal;" },
                        template: function (dataItem) {
                            return `
<!--                                <span>{{caller.formGetWork.woVerifyStatus !== 2 ? dataItem.woDetailEndDate : ''}}</span>-->
                                <span>{{dataItem.woDetailEndDate}}</span>
                            `
                        }
                    },
                    {
                        title: "Tiến độ công việc",
                        field: "woDetailNote",
                        width: "20%",
                        headerAttributes: { style: "text-align:center;" },
                        attributes: { style: "text-align:left;white-space:normal;" },
                        template: function (dataItem) {
                            return `
                                <div>
                                    <span ng-if="caller.isViewPopUp === 1">{{dataItem.woDetailNote}}</span>

                                    <div ng-if="caller.isViewPopUp !== 1">
                                        <input class="form-control width100" type="text" maxlength="500"
                                            name="woDetailNote" ng-change="caller.onChangeProgress(dataItem)" ng-model="dataItem.woDetailNote"/>
                                    </div>
                                </div>
                            `
                        }
                    },
                    {
                        title: "File đính kèm",
                        width: '20%',
                        field: "workAssignTCLDFile",
                        headerAttributes: { style: "text-align:center;" },
                        attributes: { style: "text-align:left;white-space:normal;" },
                        template: function(dataItem) {
                            return `
                            <div class="text-center">
                                <div ng-if="dataItem.workAssignTCLDFiles[0].fileName">
                                    <a href='' ng-click='caller.downloadFile(dataItem.workAssignTCLDFiles[0])'>{{dataItem.workAssignTCLDFiles[0].fileName}}</a>
                                    <button style="margin-left: 3px; border: none; background-color: white;" class="#=riskProfileId# icon_table ng-scope" uib-tooltip="Xóa file" 
                                        ng-click="caller.onRemoveFile(dataItem.workAssignTCLDFiles[0])" ng-if="dataItem.workAssignTCLDFiles[0].fileName && caller.isViewPopUp !== 1">
                                        <i style="color:#d9001b;" class="fa fa-times ng-scope" aria-hidden="true"></i>
                                    </button>
                                </div>
                                <div ng-if="!dataItem.workAssignTCLDFiles[0].fileName && caller.isViewPopUp !== 1">
                                    <button style="margin-left: 3px; border: none; background-color: white;" class="#=riskProfileId# icon_table ng-scope" uib-tooltip="Upload file" 
                                        ng-click="caller.onSelectFileGiaoViec(dataItem)">
                                        <i style="color:#0a4d85;" class="fa fa-upload ng-scope" aria-hidden="true"></i>
                                    </button>
                                </div>
                            </div>
                        `;
                        }
                    }
                ]
            });

        }

        vm.onChangeProgress = function (dataItem) {
            dataItem.woDetailNote = dataItem.woDetailNote ? dataItem.woDetailNote.trim() : null

            // Ensure vm.formGetWork.listWorkAssignTCLDDetail is defined before using find
            if (vm.formGetWork && vm.formGetWork.listWorkAssignTCLDDetail) {
                let found = vm.formGetWork.listWorkAssignTCLDDetail.find(function (item) {
                    return item.woDetailId === dataItem.woDetailId;
                });
                let foundIdx = vm.formGetWork.listWorkAssignTCLDDetail.findIndex(function (item) {
                    return item.woDetailId === dataItem.woDetailId;
                });

                if (found) {
                    found = dataItem
                }
                if (foundIdx) {
                    vm.formGetWork.listWorkAssignTCLDDetail[foundIdx] = dataItem
                }

            }
        }

        vm.onRemoveFile = function (oldFile) {
            oldFile.filePath = null
            oldFile.fileName = null
            oldFile.createAt = null
            oldFile.fileUploader = null
        }

        vm.onSelectFileGiaoViec = function (dataItem) {
            const fileInput = document.createElement('input');
            fileInput.setAttribute('type', 'file');
            fileInput.style.display = 'none';

            fileInput.addEventListener('change', function () {
                const file = fileInput.files[0];
                if (file.size > 52428800) {
                    toastr.warning(CommonService.translate("Dung lượng file lớn hơn 50MB"));
                    return;
                }

                const fileName = file.name.split('.').pop().toLowerCase();
                const allowedExtensions = ['pdf'];
                if (!allowedExtensions.includes(fileName)) {
                    toastr.warning(CommonService.translate("Sai định dạng file"));
                    return;
                }

                const formData = new FormData();
                formData.append('multipartFile', file);

                // Use AngularJS $http service for the AJAX request
                $http({
                    method: 'POST',
                    url: Constant.BASE_SERVICE_URL + "fileservice/uploadATTT?folder=" + Constant.UPLOAD_FOLDER_TYPE_TEMP,
                    data: formData,
                    headers: { 'Content-Type': undefined }, // Set Content-Type to undefined for multipart/form-data
                    transformRequest: angular.identity, // Use Angular's default transformation for FormData
                }).then(function (response) {
                    const uploadedFile = {
                        fileName: file.name,
                        filePath: response.data[0], // Assuming response.data is an array containing file paths
                        createAt: kendo.toString(new Date(), "dd/MM/yyyy"),
                        fileUploader: Constant.user.VpsUserInfo.fullName,
                    };

                    // Add the uploaded file to the dataItem's workAssignTCLDFiles array
                    if (!dataItem.workAssignTCLDFiles[0]?.fileName) {
                        const obj = {
                            ...uploadedFile,
                            "woId": dataItem.woId,
                            "woDetailId": dataItem.woDetailId,
                            "woFileId": null,
                            "fwmodelId": null,
                            "fileType": 2,
                            "defaultSortField": "name",
                            "page": null,
                            "id": null,
                            "pathFile": null,
                            "filePathError": null,
                            "errorList": null,
                            "messageColumn": 0,
                            "text": null,
                            "isSize": false,
                            "pageSize": null,
                            "keySearch": null,
                            "keySearchAction": null,
                            "keySearch2": null,
                            "totalRecord": null,
                            "checkedQty": null,
                            "size": false
                        }
                        dataItem.workAssignTCLDFiles = [obj];

                    } else {
                        const obj = {
                            ...dataItem.workAssignTCLDFiles[0],
                            ...uploadedFile,
                        }
                        dataItem.workAssignTCLDFiles = [obj]
                        // dataItem.workAssignTCLDFiles[0] = obj
                    }

                    if (vm.formGetWork && vm.formGetWork.listWorkAssignTCLDDetail && Array.isArray(vm.formGetWork.listWorkAssignTCLDDetail)) {
                        let foundIdx = vm.formGetWork.listWorkAssignTCLDDetail.findIndex(function (item) {
                            return item.woDetailId === dataItem.woDetailId;
                        });
                        if (foundIdx) {
                            vm.formGetWork.listWorkAssignTCLDDetail[foundIdx] = dataItem
                        }
                    }

                    // Update the grid data
                    vm.listJobsGrid.dataSource.sync();

                }).catch(function (error) {
                    // Handle error
                    console.error(error);
                });

                // Reset the file input element
                fileInput.value = '';
            });

            // Trigger the file input click event to open the file dialog
            fileInput.click();
        };


        vm.downloadFile = function downloadFile(data) {
            window.location = Constant.BASE_SERVICE_URL + "fileservice/downloadFileATTT?" + data.filePath;
        }

    }
})();
