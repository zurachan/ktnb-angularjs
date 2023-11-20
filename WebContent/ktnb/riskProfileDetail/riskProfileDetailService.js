angular.module('MetronicApp').factory('riskProfileDetailService', ['$http', '$q', 'RestEndpoint', 'Restangular', '$kWindow', function ($http, $q, RestEndpoint, Restangular, $kWindow) {
    var serviceUrl = "riskProfileDetail";
    var factory = {
        save: save,
        update: update,
        remove: remove,
        doSearch: doSearch,
        checkDuplicate: checkDuplicate,
        getDetail: getDetail,
        getDetailForCopy: getDetailForCopy,
        approveStatus: approveStatus,
        getListAttachedFile:getListAttachedFile,
        getCode: getCode,
        cancelApproveDv: cancelApproveDv,
        cancelApproveKtnb: cancelApproveKtnb,
        saveApproveDv: saveApproveDv,
        saveApproveKtnb: saveApproveKtnb,
        getRiskProfileForAutoComplete: getRiskProfileForAutoComplete,
        getRiskProfileDetail:getRiskProfileDetail
    };
    return factory;

    function save(obj) {
        return Restangular.all(serviceUrl + "/save").post(obj);
    }

    function update(obj) {
        return Restangular.all(serviceUrl + "/update").post(obj);
    }

    function remove(id) {
        return Restangular.all(serviceUrl + "/remove").post(id);
    }

    function doSearch(id) {
        return Restangular.all(serviceUrl + "/doSearch").post(id);
    }

    function checkDuplicate(id) {
        return Restangular.all(serviceUrl + "/checkDuplicate").post(id);
    }
    function getDetail(id) {
        return Restangular.all(serviceUrl + "/getDetail").post(id);
    }
    function getDetailForCopy(id) {
        return Restangular.all(serviceUrl + "/getDetailForCopy").post(id);
    }
    function approveStatus(id) {
        return Restangular.all(serviceUrl + "/approveStatus").post(id);
    }
    function getListAttachedFile(obj) {
        return Restangular.all(RestEndpoint.COMMON_RS_SERVICE_URL + "/getListAttachedFile").post(obj);
    }
    function getCode(obj) {
        return Restangular.all(serviceUrl + "/getCode").post(obj);
    }
    function cancelApproveDv(obj) {
        return Restangular.all(serviceUrl + "/cancelApproveDv").post(obj);
    }
    function cancelApproveKtnb(obj) {
        return Restangular.all(serviceUrl + "/cancelApproveKtnb").post(obj);
    }
    function saveApproveDv(obj) {
        return Restangular.all(serviceUrl + "/saveApproveDv").post(obj);
    }
    function saveApproveKtnb(obj) {
        return Restangular.all(serviceUrl + "/saveApproveKtnb").post(obj);
    }
    function getRiskProfileForAutoComplete(obj) {
        return Restangular.all(serviceUrl + "/getRiskProfileForAutoComplete").post(obj);
    }
    function getRiskProfileDetail(obj) {
        return Restangular.all(serviceUrl + "/getRiskProfileDetail").post(obj);
    }
}]);
