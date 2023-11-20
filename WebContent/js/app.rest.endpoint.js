/* global toastr:false, moment:false */
(function() {
	'use strict';

	angular.module('MetronicApp').constant('RestEndpoint', RestEndpoint());

	/* @ngInject */
	function RestEndpoint() {
		var endpoints = {
			// BUILD
			BASE_SERVICE_URL : API_URL
			,WORK_ASSIGN_SERVICE_URL : "workAssignRsService"
			,WORK_LIST_SERVICE_URL : "workListRsService"
			,WORK_ASSIGN_DETAIL_SERVICE_URL : "workAssignDetailRsService"
			,COMMON_RS_SERVICE_URL : "commonRsService"
			,IMPELLENT_BROADCASTING_STATION : "impellentBroadcastingStationRsService"
			,AUTHORIZATION_SERVICE_URL : "authorizationRsService"
			,DATA_DAMAGE_SERVICE_URL : "dataDamageRsServiceRest"
			,DTTT_ASSIGN_SERVICE_URL : "dtttAssignRsService"
			,DTTT_ASSIGN_DETAIL_SERVICE_URL : "dtttAssignDetailRsService"
			,INCIDENT_REPORT_SERVICE_URL : "incidentRsService"
			,KTNB_EMPLOYEE_SERVICE_URL : "ktnbEmployeeRSService"
			,RISK_INDEX_SERVICE_URL : "riskIndexRsService"
			,VIOLATION_SERVICE_URL : "violationRsService"
			,PUNISHMENT_REQUEST_SERVICE_URL : "punishmentRequestRsService"
			,PUNISHMENT_REQUEST_DETAIL_SERVICE_URL : "punishmentRequestDetailRsService"
			,AWARD_SERVICE_URL : "awardRsService"
			,RISK_CONFIG_SERVICE_URL : "riskConfigRsService"
			,DATA_DAMAGE_CONFIG_SERVICE_URL : "dataDamageConfigRsService"
		};

		return endpoints;
	}
})();
