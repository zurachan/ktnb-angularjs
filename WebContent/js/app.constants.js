(function () {
	'use strict';

	angular.module('MetronicApp').constant('Constant', Config());

	/* @ngInject */
	function Config() {
		var config = {};
		config.authen = {
			LOGIN_URL: "auth/kttsAuthenRsService/login",
			LOGOUT_URL: "auth/kttsAuthenRsService/logout",
			GET_USER_INFO: 'auth/kttsAuthenRsService/getUserInfo'

		}
		/***********************************************************************
		 * HTTP STATUS
		 **********************************************************************/
		config.http = {
			SUCCESS: 0,
			ERROR: 1,
			BUSINESS_ERROR: 400
		};
		config.pageSize = 20,
			config.pageSizes = [10, 15, 20, 25],

			/**
			 * Thêm cấu hình các white list url không cần add version
			 */
			config.LIST_WHITE_LIST_VERSION_URL = [
				"template/tabs/tab.html",
				"template/tabs/tabset.html",
				"template/tooltip/tooltip-html-popup.html"],
			config.inWhiteListAddVersion = function (url) {
				if (url.startsWith(config.BASE_SERVICE_URL)) {
					return true;
				}
				if (url.startsWith('template/')) {
					return true;
				}
				if (url.indexOf('?tsVersion=')) {
					return true;
				}
				for (var str in config.LIST_WHITE_LIST_VERSION_URL) {
					if (url
						.indexOf(config.LIST_WHITE_LIST_VERSION_URL[str]) >= 0) {
						return true;
					}
				}
			}

		config.ROLE_ID = {
			employee_roleID_CDT_PTGST: 102,// 4 - RoleID 102
			employee_roleID_CDT_DDPN: 103,// 2 - RoleID 103
			employee_roleID_DT_KTTC: 104,// 5 - RoleID 104
			employee_roleID_DT_GDNT: 105,// 3 - RoleID 105
			employee_roleID_DT_PTTC: 106,// 1 - RoleID 106
			employee_roleID_TVTK_DDTV: 107,// 6 - RoleID 107
			employee_roleID_TVTK_CNTK: 108,// 7 - RoleID 108
			employee_roleID_TVGS_GSTC: 109, // 0 - RoleID 109
			employee_roleID_TVGS_PTGST: 110,// 8 - RoleID 110
			employee_roleID_TVGS_DDTVGS: 111,// 9 - RoleID 111
			employee_roleID_CDT_GSTC: 101,// 10 - RoleID 101
			employee_roleID_CDT_DDDVSDCT: 112
			// 11 - RoleID 112
		}

		// BUILD
		config.BASE_SERVICE_URL = API_URL;
		config.STATIC_URL = STATIC_URL;

		config.FILE_SERVICE_TEMP = 'fileservice/uploadTemp';
		config.UPLOAD_RS_SERVICE = 'fileservice/uploadATTT';
		config.FILE_SERVICE = 'fileservice/uploadATTT';
		config.DOWNLOAD_SERVICE = API_URL + 'fileservice/downloadFileATTT?';
		config.DOWNLOAD_SERVICE2 = API_URL + 'fileservice/downloadFileATTT2?';
		config.UPLOAD_FOLDER_TYPE_INPUT = 'input'; // folder lưu file nghiệp vụ, k xóa
		config.UPLOAD_FOLDER_TYPE_TEMP = 'temp'; //folder lưu file tạm, dc phép xóa
		config.contextPath = "wms-web";
		config.prefixLanguage = 'js/languages/',
			config.loginUrl = 'authenServiceRest/login';
		config.getUser = function () {
			return this.user;
		}



		config.setUser = function (user) {
			this.user = user;
			config.userInfo = this.user;
		}



		config.URL_POPUP = {
			DELETE_POPUP: 'wms/popup/Delete_Popup.html',
			VOFICE_POPUP: 'wms/popup/SignVofficePopup.html',
		}

		config.COLUMS_VALIDATE = {
			goods: [
				{
					colum: 'Mã hàng',
					field: 'code',
					dataType: "Text"
				},
				{
					colum: 'Tên hàng',
					field: 'name',
					dataType: "Text"
				},
				{
					colum: 'Đơn vị tính',
					field: 'unit',
					dataType: "Text"
				},
				{
					colum: 'Số lượng',
					field: 'qty',
					dataType: "Number"
				}
			]
		};
		config.TEMPLATE_URL = [
			{
				key: 'DASH_BOARD',
				title: 'Home',
				templateUrl: 'views/dashboard.html',
				lazyLoadFiles: [
					'erp/common/ChartController.js',

				]
			},
			{
				key: 'KTNB_COLLECTION_DATA',
				title: 'Quản lý thu thập dữ liệu tổn thất',
				templateUrl: 'ktnb/dataDamage/dataDamageList.html',
				lazyLoadFiles: [
					'ktnb/dataDamage/dataDamageController.js',
					'ktnb/dataDamage/dataDamageService.js'
				]
			},
			{
				key: 'MANAGE_WO_EMPLOYEE',
				title: 'Quản lý công việc của nhân viên',
				templateUrl: 'ktnb/manageWoEmployee/manageWoEmployeeList.html',
				lazyLoadFiles: [
					'ktnb/manageWoEmployee/manageWoEmployeeController.js',
					'ktnb/manageWoEmployee/manageWoEmployeeService.js'
				]
			}
			, {
				key: 'WORK_ASSIGN_MANAGE',
				title: 'Quản lý giao việc của phòng PC&KTNB',
				templateUrl: 'ktnb/workAssign/workAssignList.html',
				lazyLoadFiles: [
					'ktnb/workAssign/workAssignController.js',
					'ktnb/workAssign/workAssignService.js'
				]
			}
			, {
				key: 'ORGANIZATION_ACCEPT_WO',
				title: 'Đơn vị xác nhận công việc',
				templateUrl: 'ktnb/organizationAcceptWo/organizationAcceptWoList.html',
				lazyLoadFiles: [
					'ktnb/organizationAcceptWo/organizationAcceptWoController.js',
					'ktnb/organizationAcceptWo/organizationAcceptWoService.js',
					'ktnb/organizationAcceptWo/completeWorkPopup.html',
				]
			}, {
				key: 'WA_DV_MANAGE',
				title: 'Quản lý giao việc',
				templateUrl: 'ktnb/waDvManage/waDvManageList.html',
				lazyLoadFiles: [
					'ktnb/waDvManage/waDvManageController.js',
					'ktnb/waDvManage/waDvManageService.js'
				]
			}, {
				key: 'REPORT_WO',
				title: 'Báo cáo tổng hợp Work Order',
				templateUrl: 'ktnb/reportWo/reportWo.html',
				lazyLoadFiles: [
					'ktnb/reportWo/reportWoController.js'
				]
			},
			{
				key: 'KTNB_EMULATION_EVALUATION',
				title: 'Đánh giá thi đua',
				templateUrl: 'ktnb/emulationEvaluation/emulationEvaluationList.html',
				lazyLoadFiles: [
					'ktnb/emulationEvaluation/emulationEvaluationController.js',
					'ktnb/emulationEvaluation/dateTimeMonthYear.js'
				]
			},
			{
				key: 'KTNB_IMPELLENT_BROADCASTING_STATION',
				title: 'Đăng ký thi đua "Tháng Công nhân" năm 2022',
				templateUrl: 'ktnb/impellentBroadcastingStation/impellentBroadcastingStationList.html',
				lazyLoadFiles: [
					'ktnb/impellentBroadcastingStation/impellentBroadcastingStationController.js',
					'ktnb/impellentBroadcastingStation/impellentBroadcastingStationService.js'
				]
			}, {
				key: 'SYS_GROUP_EVALUATE_RESULT',
				title: 'Cập nhật kết quả thực hiện đánh giá',
				templateUrl: 'ktnb/updateEvaluateResult/updateEvaluateResultList.html',
				lazyLoadFiles: [
					'ktnb/updateEvaluateResult/updateEvaluateResultController.js',
					'ktnb/updateEvaluateResult/dateTimeMonthYear.js'
				]
			}, {
				key: 'AUTHORIZATION_LIST',
				title: 'Quản lý danh sách ủy quyền',
				templateUrl: 'ktnb/authorizationList/authorizationList.html',
				lazyLoadFiles: [
					'ktnb/authorizationList/authorizationListController.js',
					'ktnb/authorizationList/addPopup.html',
					'ktnb/authorizationList/authorizationListService.js',
					'ktnb/authorizationList/rejectPopup.html',
				]
			}, {
				key: 'REPORT_RESULT_AUTHORIZATION',
				title: 'Báo cáo kết quả ủy quyền',
				templateUrl: 'ktnb/reportResultAuthorization/reportResultAuthorization.html',
				lazyLoadFiles: [
					'ktnb/reportResultAuthorization/reportResultAuthorizationController.js',
					'ktnb/reportResultAuthorization/reportResultAuthorizationService.js',
					'ktnb/reportResultAuthorization/doWorkPopup.html',
				]
			}, {
				key: 'REPORT_AUTHORIZATION',
				title: 'Báo cáo ủy quyền',
				templateUrl: 'ktnb/reportAuthorization/reportAuthorization.html',
				lazyLoadFiles: [
					'ktnb/reportAuthorization/reportAuthorizationController.js'
				]
			},
			// dttt WO
			{
				key: 'DTTT_DVG_ASSIGN_MANAGE',
				title: 'Quản lý giao việc của đơn vị giao việc',
				templateUrl: 'dttt/dtttDvgAssign/dtttDvgAssignList.html',
				lazyLoadFiles: [
					'dttt/dtttDvgAssign/dtttDvgAssignController.js',
					'dttt/dtttDvgAssign/dtttDvgAssignService.js'
				]
			},
			{
				key: 'DTTT_DVN_MANAGE',
				title: 'Quản lý giao việc của đơn vị nhận việc',
				templateUrl: 'dttt/dtttDvnAssign/dtttDvnAssignList.html',
				lazyLoadFiles: [
					'dttt/dtttDvnAssign/dtttDvnAssignController.js',
					'dttt/dtttDvnAssign/dtttDvnAssignService.js'
				]
			}, {
				key: 'DTTT_DVN_APPROVE_WORK',
				title: 'Đơn vị xác nhận công việc từ nhân viên',
				templateUrl: 'dttt/dtttDvAcceptWoFromEmp/dtttDvAcceptWoFromEmpList.html',
				lazyLoadFiles: [
					'dttt/dtttDvAcceptWoFromEmp/dtttDvAcceptWoFromEmpController.js',
					'dttt/dtttDvAcceptWoFromEmp/dtttDvAcceptWoFromEmpService.js'
				]
			},
			{
				key: 'DTTT_WO_EMPLOYEE',
				title: 'Quản lý công việc của nhân viên',
				templateUrl: 'dttt/dtttWoEmployee/dtttWoEmployeeList.html',
				lazyLoadFiles: [
					'dttt/dtttWoEmployee/dtttWoEmployeeController.js',
					'dttt/dtttWoEmployee/dtttWoEmployeeService.js',
					'dttt/dtttWoEmployee/assignWorkToOtherPopup.html'
				]
			}, {
				key: 'REPORT_WO_DTTT',
				title: 'Báo cáo tổng hợp Work Order',
				templateUrl: 'dttt/reportWoDttt/reportWoDttt.html',
				lazyLoadFiles: [
					'dttt/reportWoDttt/reportWoDtttController.js'
				]
			},
			{
				key: 'INCIDENT_REPORT',
				title: 'Quản lý báo cáo vụ việc mất an toàn',
				templateUrl: 'ktnb/incidentReport/incidentReport.html',
				lazyLoadFiles: [
					'ktnb/incidentReport/incidentReportController.js',
					'ktnb/incidentReport/incidentReportService.js'
				]
			},
			{
				key: 'KTNB_EMPLOYEE',
				title: 'Quản lý nhân sự ngành dọc và trợ lý lãnh đạo đơn vị',
				templateUrl: 'ktnb/ktnbEmployee/ktnbEmployee.html',
				lazyLoadFiles: [
					'ktnb/ktnbEmployee/ktnbEmployeeController.js',
					'ktnb/ktnbEmployee/ktnbEmployeeService.js'
				]
			},
			{
				key: 'RP_NOT_DONE_WO',
				title: 'Dashboard Work TCLD',
				templateUrl: 'ktnb/dashboardWorkTCLD/dashboardWorkTCLDHomePage.html',
				lazyLoadFiles: [
					'ktnb/dashboardWorkTCLD/dashboardWorkTCLDController.js',
				]
			},
			{
				key: 'RP_NOT_DONE_WO',
				title: 'Báo cáo tổng hợp chậm nhận việc và chậm hoàn thành WO',
				templateUrl: 'ktnb/reportNtDoneWo/reportNotDoneWo.html',
				lazyLoadFiles: [
					'ktnb/reportNtDoneWo/reportNotDoneWoController.js'
				]
			},
			{
				key: 'KTNB_RISK_PROFILE',
				title: 'Quản lý hồ sơ rủi ro',
				templateUrl: 'ktnb/riskProfile/riskProfileList.html',
				lazyLoadFiles: [
					'ktnb/riskProfile/riskProfileController.js',
					'ktnb/riskProfile/riskProfileService.js'
				]
			},
			{
				key: 'KTNB_RISK_PROFILE_DETAIL',
				title: 'Giải pháp ứng phó của rủi ro',
				templateUrl: 'ktnb/riskProfileDetail/riskProfileDetailList.html',
				lazyLoadFiles: [
					'ktnb/riskProfileDetail/riskProfileDetailController.js',
					'ktnb/riskProfileDetail/riskProfileDetailService.js'
				]
			},
			{
				key: 'KTNB_RISK_INDEX',
				title: 'Quản lý chỉ số rủi ro',
				templateUrl: 'ktnb/riskIndex/riskIndexList.html',
				lazyLoadFiles: [
					'ktnb/riskIndex/riskIndexController.js',
					'ktnb/riskIndex/riskIndexService.js'
				]
			},
			{
				key: 'METHOD_REDUCE_RISK',
				title: 'Phương pháp giảm thiểu rủi ro',
				templateUrl: 'ktnb/methodReduceRisk/methodReduceRiskList.html',
				lazyLoadFiles: [
					'ktnb/methodReduceRisk/methodReduceRiskController.js',
					'ktnb/methodReduceRisk/methodReduceRiskService.js'
				]
			},
			{
				key: 'DASH_BOARD_WORK',
				title: 'Dashboard Work',
				templateUrl: 'ktnb/dashboardWork/dashboardWorkHomePage.html',
				lazyLoadFiles: [
					'ktnb/dashboardWork/dashboardWorkController.js',
				]
			},
			{
				key: 'DASH_BOARD_INCIDENT',
				title: 'Dashboard Quản lý vụ việc mất an toàn',
				templateUrl: 'ktnb/dashboardIncident/dashboardIncidentHomePage.html',
				lazyLoadFiles: [
					'ktnb/dashboardIncident/dashboardIncidentController.js',
				]
			},
			{
				key: 'VIOLATION_DV',
				title: 'Quản lý danh mục lỗi vi phạm',
				templateUrl: 'ktnb/violation/violationList.html',
				lazyLoadFiles: [
					'ktnb/violation/violationController.js',
					'ktnb/violation/violationService.js'
				]
			}, {
				key: 'PUNISHMENT_REQUEST',
				title: 'Đề xuất áp chế tài cá nhân',
				templateUrl: 'ktnb/punishmentRequest/punishmentRequestList.html',
				lazyLoadFiles: [
					'ktnb/punishmentRequest/punishmentRequestController.js',
					'ktnb/punishmentRequest/punishmentRequestService.js'
				]
			}, {
				key: 'PUNISHMENT_DETAIL',
				title: 'Phản hồi chế tài',
				templateUrl: 'ktnb/punishmentRequestDetail/punishmentRequestDetailList.html',
				lazyLoadFiles: [
					'ktnb/punishmentRequestDetail/punishmentRequestDetailController.js',
					'ktnb/punishmentRequestDetail/punishmentRequestDetailService.js'
				]
			}, {
				key: 'AWARD_REQUEST',
				title: 'Danh mục đề xuất thưởng',
				templateUrl: 'ktnb/award/awardList.html',
				lazyLoadFiles: [
					'ktnb/award/awardController.js',
					'ktnb/award/awardService.js'
				]
			}, {
				key: 'REPORT_PUNISH',
				title: 'Báo cáo thưởng phạt cá nhân',
				templateUrl: 'ktnb/reportPunishment/reportPunishmentList.html',
				lazyLoadFiles: [
					'ktnb/reportPunishment/reportPunishmentController.js',
				]
			}, {
				key: 'PUNISHMENT_DASHBOARD',
				title: 'Dashboard thưởng phạt cá nhân',
				templateUrl: 'ktnb/dashboardPunishment/dashboardPunishmentList.html',
				lazyLoadFiles: [
					'ktnb/dashboardPunishment/dashboardPunishmentController.js',
				]
			}, {
				key: 'RISK_CONFIG',
				title: 'Danh mục rủi ro',
				templateUrl: 'ktnb/riskConfig/riskConfigList.html',
				lazyLoadFiles: [
					'ktnb/riskConfig/riskConfigController.js',
					'ktnb/riskConfig/riskConfigService.js'
				]
			}, {
				key: 'REPORT_SUMMARY_KRI',
				title: 'Báo cáo tổng hợp tình trạng cập nhật KRI',
				templateUrl: 'ktnb/reportSummaryKri/reportSummaryKriList.html',
				lazyLoadFiles: [
					'ktnb/reportSummaryKri/reportSummaryKriController.js',
				]
			},
			// {
			// 	key: 'RP_FOLLOW_WO',
			// 	title: 'Báo cáo theo dõi khắc phục các kiến nghị Kiểm toán',
			// 	templateUrl: 'ktnb/reportFollowWo/reportFollowWo.html',
			// 	lazyLoadFiles: [
			// 		'ktnb/reportFollowWo/reportFollowWoController.js'
			// 	]
			// },
			{
				key: 'RP_FOLLOW_WO',
				title: 'Báo cáo theo dõi khắc phục các kiến nghị Kiểm toán',
				templateUrl: 'ktnb/reportFollowWo/reportFollowWo.html',
				lazyLoadFiles : [
					'ktnb/reportFollowWo/reportFollowWoController.js'
				]
			}, {
				key: 'DATA_DAMAGE_CONFIG',
				title: 'Danh mục tổn thất',
				templateUrl: 'ktnb/dataDamageConfig/dataDamageConfigList.html',
				lazyLoadFiles: [
					'ktnb/dataDamageConfig/dataDamageConfigController.js',
					'ktnb/dataDamageConfig/dataDamageConfigService.js',

				]
			},
			// {
			// 	key: 'ASSIGNMENT_MANAGEMENT',
			// 	title: 'Quản lý giao việc',
			// 	templateUrl: 'ktnb/assignmentManagement/listAssignmentManagement.html',
			// 	lazyLoadFiles : [
			// 		'ktnb/assignmentManagement/assignmentManagementController.js',
			// 		'ktnb/assignmentManagement/assignmentManagementService.js',
			// 	]
			// },
			{
				key: 'QLGV3',
				title: 'Quản lý giao việc',
				templateUrl: 'ktnb/assignmentManagement/listAssignmentManagement.html',
				lazyLoadFiles: [
					'ktnb/assignmentManagement/assignmentManagementController.js',
					'ktnb/assignmentManagement/assignmentManagementService.js',
				]
			},
			{
				key: 'RP_FOLLOW_TCLD_WO',
				title: 'Báo cáo tổng hơp WO',
				templateUrl: 'ktnb/aReportAssignmentWO/reportAssignmentWO.html',
				lazyLoadFiles: [
					'ktnb/aReportAssignmentWO/reportASsignmentWOController.js',
					'ktnb/aReportAssignmentWO/reportASsignmentWOService.js',
				]
			},
			{
				key: 'QLGV4',
				title: 'Quản lý công việc nhân viên',
				templateUrl: 'ktnb/taskManage/taskManageList.html',
				lazyLoadFiles: [
					'ktnb/taskManage/taskManageController.js',
					'ktnb/taskManage/dateTimeMonthYear.js'
				]
			},
			{
				key: 'DASH_BOARD_WORK_TCLD',
				title: 'Dashboard Work TCLD',
				templateUrl: 'ktnb/dashboardWorkTCLD/dashboardWorkTCLDHomePage.html',
				lazyLoadFiles: [
					'ktnb/dashboardWorkTCLD/dashboardWorkTCLDController.js',
				]
			},
		];

		config.getTemplateUrl = function (key) {
			for (var i in config.TEMPLATE_URL) {
				if (config.TEMPLATE_URL[i].key == key) {
					return config.TEMPLATE_URL[i];
				}
			}

			return null;
		}

		return config;
	}
	angular.module('MetronicApp').constant('PopupConst', {

	});

	angular.module('MetronicApp').constant('AppConst', {
		AR_INVOICE: {
			Invoice_Table_ID: 1000059,
			Tax_Account_ID: 1000027
		},
		AR_DEPOSITE_BROWSER: {
			document_type_id: 'D00001'
		},
		AR_REVALUATION: {
			Document_Type_Id: 17,
			Status: 'DR'
		},
		C_CONTIGENCY_SALE: {
			Status: 'DR',
			CurrencyName: '1000046'
		}
	});

})();
