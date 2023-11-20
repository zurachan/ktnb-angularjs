/* Modal Controller */
MetronicApp.controller('signVofficeController', [
		'$scope',
		'businessType',
		'caller',
		'modalInstance',
		'data',
		'popupId',
		'isMultiSelect',
		'CommonService',
		'SearchService',
		'PopupConst',
		'RestEndpoint',
		'$localStorage',
		'$rootScope',
		'Restangular',
		'$kWindow',
	function ($scope, businessType, caller, modalInstance1, data, popupId, isMultiSelect,
			  CommonService, SearchService, PopupConst, RestEndpoint,
			  $localStorage, $rootScope, Restangular,$kWindow) {
		$rootScope.flag = false;
		$scope.modalInstance1 = modalInstance1;
		$scope.popupId = popupId;
		$scope.caller = caller;
		$scope.cancel = cancel;
		$scope.save = save;
		$scope.isMultiSelect = isMultiSelect;
		$scope.list = [];
		$scope.search = {};
		$scope.data = data;
		$scope.rowIndex = 0;
		PASSWORD_UNAVAILABLE = 'Bạn chưa nhập mật khẩu Voffice';
		AUTHEN_FAILED = 'Lỗi đăng nhập tài khoản tập trung SSO';
		$scope.gridVofficeOptions = kendoConfig.getGridOptions({
			autoBind: true,
			resizable: true,
			dataSource: data,
			noRecords: true,
			messages: {
				noRecords: "Không có kết quả hiển thị"
			},
			dataBound: function (e) {
				var grid = $("#gridVoffice").data("kendoGrid");
				if (grid) {
					if (!$scope.rowIndex) {
						grid.select("tr:eq(0)");
					} else {
						grid.select("tr:eq(" + $scope.rowIndex + ")");
					}
				}
			},
			columnMenu: false,
			pageSize: 10,
			pageable: false,
			columns: [{
				title: "TT",
				field: "objectId",
				template: dataItem => $("#gridVoffice").data("kendoGrid").dataSource.indexOf(dataItem) + 1,
				width: "10%",
			headerAttributes: {style: "text-align:center;white-space:normal;",translate: ""},
					attributes: {style: "text-align:center;white-space:normal;",translate: ""},
	}, {
			title: "Xóa",
				field: "ff",
				template:
			'<div class="text-center "> ' +
			'		<a  type="button" class="icon_table" style="color:red;"  uib-tooltip="Xóa" translate>' +
			'			<i  ng-click=remove(dataItem) class="fa fa-times" aria-hidden="true"></i> ' +
			'		</a>'
			+ '</div>',
				width: "20%",
		}, {
			title: "Mã yêu cầu",
				field: "objectCode",
				width: "70%",
		}]
	});

		$scope.onRowChange = onRowChange;

		function onRowChange(dataItem) {
			if (dataItem) {
				$scope.orderObj = dataItem;
				$scope.search.stockId = dataItem.stockId;
				$scope.search.bussTypeId = $scope.businessType;
				$scope.list = dataItem.listSignVoffice;
				document.getElementById('storeNameSign').innerHTML = dataItem.objectCode;
			}
		}

		function cancel() {
			$("div.k-window-actions > a.k-window-action > span.k-i-close").click();
		}

		$scope.remove = function (dataItem) {
			var grid = $scope.gridVoffice;
			var list = grid.dataSource.data();
			var index = list.indexOf(dataItem);
			list.splice(index, 1);
			if (list.length === 0) {
				document.getElementById('storeNameSign').innerHTML = "";
			}
			grid.dataSource(list);
			grid.refresh();
		}

		$scope.preview = preview;
		function preview() {
			var obj = $scope.orderObj;
			obj.bussinessType = !!obj.listSignVoffice[0].bussinessType ? obj.listSignVoffice[0].bussinessType : null;
			obj.levelStock = obj.listSignVoffice[0].levelStock;
			obj.stringMoney = DocTienBangChu(obj.totalPrice);
			CommonService.previewDocSign(obj);
		}

		// Trình ký
		function save() {
			if ($("input[name*='rolePopup0_input']")) {
				if ($("input[name*='rolePopup0_input']").val() == "") {
					setTimeout(function () {
						$("input[name*='rolePopup0_input']").focus();
					}, 0);
				}
			}

			if ($("#userPopup0")) {
				if ($("#userPopup0").val() == "") {
					setTimeout(function () {
						$("#userPopup0").focus();
					}, 0);
				}
			}

			if ($("input[name*='rolePopup1_input']")) {
				if ($("input[name*='rolePopup1_input']").val() == "") {
					setTimeout(function () {
						$("input[name*='rolePopup1_input']").focus();
					}, 0);
				}
			}

			if ($("#userPopup1")) {
				if ($("#userPopup1").val() == "") {
					setTimeout(function () {
						$("#userPopup1").focus();
					}, 0);
				}
			}

			if ($("input[name*='rolePopup2_input']")) {
				if ($("input[name*='rolePopup2_input']").val() == "") {
					setTimeout(function () {
						$("input[name*='rolePopup2_input']").focus();
					}, 0);
				}
			}

			if ($("#userPopup2")) {
				if ($("#userPopup2").val() == "") {
					setTimeout(function () {
						$("#userPopup2").focus();
					}, 0);
				}
			}

			if ($("input[name*='rolePopup3_input']")) {
				if ($("input[name*='rolePopup3_input']").val() == "") {
					setTimeout(function () {
						$("input[name*='rolePopup3_input']").focus();
					}, 0);
				}
			}

			if ($("#userPopup3")) {
				if ($("#userPopup3").val() == "") {
					setTimeout(function () {
						$("#userPopup3").focus();
					}, 0);
				}
			}

			if ($("input[name*='rolePopup4_input']")) {
				if ($("input[name*='rolePopup4_input']").val() == "") {
					setTimeout(function () {
						$("input[name*='rolePopup4_input']").focus();
					}, 0);
				}
			}

			if ($("#userPopup4")) {
				if ($("#userPopup4").val() == "") {
					setTimeout(function () {
						$("#userPopup4").focus();
					}, 0);
				}
			}

			var grid = $scope.gridVoffice;
			var rowList = grid.dataSource.data();
			var msg = null;

			if (rowList.length == 0) {
				toastr.error("Không có dữ liệu để trình ký!");
				CommonService.dismissPopup();
				return;
			}

			var data = [];
			for (var i = 0; i < rowList.length; i++) {
				var dataItem = rowList[i];
//				dataItem.bussinessType = dataItem.listSignVoffice[0].bussinessType;
				dataItem.bussinessType = !!dataItem.listSignVoffice[0].bussinessType ? dataItem.listSignVoffice[0].bussinessType : null;
				dataItem.levelStock = dataItem.listSignVoffice[0].levelStock;
				if (validateData(dataItem)) {
					if (!msg) {
						msg = validateData(dataItem);
						$scope.rowIndex = i;
					}
				}
				dataItem.stringMoney = DocTienBangChu(dataItem.totalPrice);
				data.push(dataItem);
			};

			if (msg) {
				grid.refresh();
				toastr.error(msg);
				return;
			}

			CommonService.signVoffice(data).then(function (d) {
				if (d.error) {
					toastr.error(d.error);
					if(d.error == PASSWORD_UNAVAILABLE || d.error == AUTHEN_FAILED){
//						$('[ng-click="enterPass()"]').click();
						$rootScope.modalInstance = $kWindow
							.open({
								options: {
									modal: true,
									title: "Nhập mật khẩu Voffice",
									visible: false,
									width: 400,
									height: 130,
									actions: ["Minimize",
										"Maximize", "Close"],
									open: function () {
									},
									close: function () {
									},
									resolve: {
										modalInstance: function () {
											return this;
										}
									}
								},
								template: "<div class='col-md-12 form-group'>" +
									"<br><label class = 'col-md-12'>Nhập mật khẩu:</label>" +
									"<div class='col-md-12 form-group'>" +
									"<form><input type = 'password' class='form-control' name='vofficePass' id='vofficePass' ng-model='pass'/></form>"+
									"<br><button ng-click='submit()' class='btn btn-primary'>Lưu</button>"+
									"</div></div>",
								controller: 'AppController',
								resolve: {
								}
							});
					}
					return;
				}
				toastr.success("Trình ký thành công!");
				$("div.k-window-actions > a.k-window-action > span.k-i-close").click();
				caller.doSearch();
				if(!!caller.afterSignHandle){
					caller.afterSignHandle();
				}
			}, function () {
				toastr.error('Error');
			});
		}

		function validateData(dataItem) {
			for (var i = 0; i < dataItem.listSignVoffice.length; i++) {
				var msg = null;
				if (!dataItem.listSignVoffice[i].sysUserId || !dataItem.listSignVoffice[i].sysRoleId) {
					msg = "Bản ghi có mã " + dataItem.objectCode + " chưa đầy đủ dữ liệu trình ký";
					if(!dataItem.listSignVoffice[i].sysRoleId){
						msg = msg + "!!!";
					}
					return msg;
				}
			}
		}
	}]);

angular.module('MetronicApp').directive('comboDataSign', function ($rootScope, RestEndpoint, CommonService, gettextCatalog, $http) {
	var watch;
	var selectionProcessed = false;
	var searchAutocompleteMinLength = 1;
	return {
		restrict: 'AE',
		scope: {
			modelLabel: "@",
			modelUserId: '=',
			modelUserCode: '=',
			modelUserName: '=',
			modelRoleId: '=',
			modelAdOrgId: '=',
			modelRoleName: '=',
			caller: '=',
			req: "@",
			msg: "@",
			iddiv: "@",
			idlable: "@",
			disabled: '=',
			disabledEditVOffice: "=",
			searchtype: "=",
			page: '=',
			pageSize: '=',
			eventchange: "@",
			change: "@",
			comboUserId: "@",
			comboRoleId: "@",
			comboSourceUserLink: "@",
			comboSourceRoleLink: "@",
			comboUserName: "@",
			comboUserValue: "@",
			comboUserCode: "@",
			comboRoleName: "@",
			comboRoleValue: "@",
			comboRoleAdorg: "@",
			comboSearch: '=',
			comboGrid: '=',
			eventClick: '&',
			eventBlur: '&',
			eventChange: '&',
			eventCopy: '&',
			eventCut: '&',
			eventDbllick: '&',
			eventFocus: '&',
			eventKeydown: '&',
			eventKeypress: '&',
			eventKeyup: '&',
			eventMousedown: '&',
			eventMouseenter: '&',
			eventMouseleave: '&',
			eventMousemove: '&',
			eventMouseover: '&',
			eventMouseup: '&',
			eventPaste: '&'
		},
		template: '<div>' +
			'<div class="clearfix" style="margin-top: 20px;">' +
			'<div class="form-group col-md-12">' +
			'<label class="col-md-12 control-label" style="margin-left: 0px" translate>{{modelLabel}}</label>' +
			'</div>' +
			'</div>' +
			'<div class="clearfix">' +
			'<div class="form-group col-md-6">' +
			'<div class="col-md-12">' +
			'<input type="hidden" ng-model="modelUserId" />' +
			'<input type="hidden" ng-model="modelUserCode" />' +
			'<input id="{{comboUserId}}" name="{{comboUserId}}" style="width: 100%;" maxlength="100"' +
			//VietNT_15/08/2019_start
			' ng-disabled="{{disabledEditVOffice}}" ' +
			//VietNT_end
			'class=" form-control width100" type="text"  ng-model="modelUserName"/>' +
			'</div>' +
			'<div class="One_icon" ng-click="" ' +
			//VietNT_15/08/2019_start
			' ng-hide="{{disabledEditVOffice}}" ' +
			//VietNT_end
			'id="clearAll">' +
			'<i class="fa fa-times" aria-hidden="true"></i>' +
			'</div>' +
			'</div>' +
			'<div class=" col-md-6">' +
			'<div class="col-md-4" style="padding-left: 0px;">' +
			'<label class="control-label" translate>Vai trò</label>' +
			'</div>' +
			'<div class="col-sm-8" style="padding-left: 0px;">' +
			'<input type="hidden" ng-model="modelRoleId" />' +
			'<input type="hidden" ng-model="modelAdOrgId" />' +
			'<input  id="{{comboRoleId}}" name="{{comboRoleId}}" class="form-control width100" ' +
			//VietNT_15/08/2019_start
			' ng-disabled="{{disabledEditVOffice}}" ' +
			//VietNT_end
			'ng-model="modelRoleName" >' +
			'</div>' +
			'</div>' +
			'</div>' +
			'</div>',
		replace: true,
		link: function ($scope, element, attrs, ctrl) {
			$scope.comboSearchUser = {};
			$scope.comboSearchRole = {};
			console.log($scope);
			console.log($scope.disabledEditVOffice);
			function creatCombobox() {
				if (attrs.comboSourceRoleLink != undefined) {
					$('#' + attrs.comboRoleId).kendoComboBox({
						dataTextField: attrs.comboRoleName,
						dataValueField: attrs.comboRoleValue,
						dataSource: {
							serverFiltering: true,
							type: "json",
							transport: {
								read: {
									type: "POST",
									url: RestEndpoint.BASE_SERVICE_URL + attrs.comboSourceRoleLink,
									contentType: "application/json; charset=utf-8",
									dataType: "json"
								},
								parameterMap: function (options, operation) {
									if ($scope.modelRoleName == null || $scope.modelRoleName === "" || $scope.modelUserCode == null) {
										$scope.modelRoleId = null;
									}
									//									$scope.comboSearchRole.name = $scope.modelRoleName;
									$scope.comboSearchRole.listEmail = [];
									$scope.comboSearchRole.listEmail.push($scope.modelUserCode);
									return JSON.stringify($scope.comboSearchRole);
								}
							}
						},
						dataBound: function(e) {
							if (!($('#' + attrs.comboRoleId).data('kendoComboBox').options.value) && (e.sender.dataSource._data.length === 1)){
								var getModelRoleName = {};
								getModelRoleName = e.sender.dataSource._data[0];
								$scope.modelRoleId = getModelRoleName.sysRoleId;
								$scope.modelRoleName = getModelRoleName.sysRoleName;
								$scope.modelAdOrgId = getModelRoleName.adOrgId;
								$('#' + attrs.comboRoleId).data('kendoComboBox').value(getModelRoleName.sysRoleName);
								$rootScope.$broadcast('changeData');
							}
						},
						suggest: true,
						filter: "contains",
						select: function (e) {
							var dataItem = (e.item == null ? null : this.dataItem(e.item.index()));
							$scope.modelRoleId = dataItem[attrs.comboRoleValue];
							$scope.modelRoleName = dataItem[attrs.comboRoleName];
							$scope.modelAdOrgId = dataItem[attrs.comboRoleAdorg];
							$('#' + attrs.comboRoleId).data('kendoComboBox').value(dataItem[attrs.comboRoleName]);
							if (typeof attrs.eventchange !== "undefined" && attrs.eventchange != null) {
								$rootScope.$broadcast(attrs.eventchange, $scope.modelId);
							}
						},
						open: function (e) {
							selectionProcessed = false;
						},
						change: function (e) {
							if (e.sender.value() === '') {
								$scope.modelRoleId = null;
								$scope.modelRoleName = null;
								$('#' + attrs.comboRoleId).data('kendoComboBox').value(null);
							}
							if (typeof attrs.eventchange !== "undefined" && attrs.eventchange != null) {
								$rootScope.$broadcast(attrs.eventchange, $scope.modelId);
							}
						},
						ignoreCase: false
					});
				}
			}

			element.find('#' + attrs.comboUserId).bind('change', function (e) {
				if (!selectionProcessed)
					processSearch();
			});

			setTimeout(function () {
				$(element).find($(".fa.fa-times")).on('click', function (e) {
					$scope.$apply(function () {
						$scope.modelUserId = null;
						$scope.modelUserCode = null;
						creatCombobox();
						$('#checkout').attr('disabled', false);
					});
					$scope.$apply(function () {
						$scope.modelRoleId = null;
						$scope.modelRoleName = null;
						$scope.modelAdOrgId = null;
					});
					$('#' + attrs.comboRoleId).data('kendoComboBox').value(null);
					$('#' + attrs.comboUserId).val("");
				});

				if (attrs.comboSourceUserLink != undefined) {
					$('#' + attrs.comboUserId).kendoAutoComplete({
						dataTextField: attrs.comboUserName,
						dataValueField: attrs.comboUserValue,
						headerTemplate: '<div class="dropdown-header row text-center k-widget k-header">' +
							'<p class="col-md-6 text-header-auto border-right-ccc">Mã NV</p>' +
							'<p class="col-md-6 text-header-auto">Họ Tên</p>' +
							'</div>',
						template: '<div class="row" ><div class="col-xs-5" style="float:left">#: data.employeeCode #</div><div  style="padding-left: 5px;width:auto;overflow: hidden"> #: data.fullName #</div> </div>',
						dataSource: {
							serverFiltering: true,
							type: "json",
							transport: {
								read: {
									type: "POST",
									url: RestEndpoint.BASE_SERVICE_URL + attrs.comboSourceUserLink,
									contentType: "application/json; charset=utf-8",
									dataType: "json"
								},
								parameterMap: function (options, operation) {
									if ($scope.modelUserName == null || $scope.modelUserName === "") {
										$scope.modelUserId = null;
									}
									$scope.comboSearchUser.fullName = $scope.modelUserName;
									$scope.comboSearchUser.pageSize = $scope.pageSize;
									$scope.comboSearchUser.isSize = true;
									return JSON.stringify($scope.comboSearchUser);
								}
							}
						},
						suggest: true,
						filter: "contains",
						select: function (e) {
							var dataItem = this.dataItem(e.item.index());
							selectionProcessed = true;
							navigateTo(dataItem);
							if (dataItem != null && dataItem[attrs.comboValue] == 0) {
								e.preventDefault();
							}
						},
						open: function (e) {
							selectionProcessed = false;
						},
						change: function (e) {
							if (!selectionProcessed) {
								selectionProcessed = true;
								processSearch();
							} else {
								selectionProcessed = false;
							}
						},
						ignoreCase: false
					});
				}

				//TODO
				creatCombobox();

				function processSearch() {
					var autocomplete = $('#' + attrs.comboUserId).data('kendoAutoComplete');
					var searchDataItem = null;
					if (autocomplete.value() != "") {
						if (autocomplete.value().length >= searchAutocompleteMinLength) {
							autocomplete.search(autocomplete.value());
							if (autocomplete.dataItem(0) != undefined) {
								searchDataItem = autocomplete.dataItem(0);
							}
						}
					}
					navigateTo(searchDataItem);
				}

				function navigateTo(item) {
					if (item != null) {
						if (item[attrs.comboUserValue] != 0) {
							if ($scope.modelUserId !== item[attrs.comboUserValue]) {
								$scope.$apply(function () {
									$scope.modelRoleId = null;
									$scope.modelRoleName = null;
									$scope.modelAdOrgId = null;
								});
								$('#' + attrs.comboRoleId).data('kendoComboBox').value(null);
							}
							$scope.$apply(function () {
								$scope.modelUserId = item[attrs.comboUserValue];
								$scope.modelUserName = item[attrs.comboUserName];
								$scope.modelUserCode = item[attrs.comboUserCode];
								creatCombobox();
								$('#' + attrs.comboUserId).data('kendoAutoComplete').value(item[attrs.comboUserName]);
							});
						}
					} else {
						$scope.$apply(function () {
							$scope.modelUserId = [];
							$scope.modelUserName = null;
							$scope.modelUserCode = null;
							$scope.modelRoleId = null;
							$scope.modelRoleName = null;
							$scope.modelAdOrgId = null;
							creatCombobox();
						});
						$('#' + attrs.comboUserId).data('kendoAutoComplete').value(null);
						$('#' + attrs.comboRoleId).data('kendoComboBox').value(null);
					}
				}
			}, 3);

		}
	};
});
