angular.module('MetronicApp').factory('workAssignService', ['$http', '$q', 'RestEndpoint', 'Restangular', '$kWindow', function ($http, $q, RestEndpoint, Restangular, $kWindow) {
    var serviceUrl = "workAssignRsService";
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
        getExtendTimeHistoryByWorkAssignId:getExtendTimeHistoryByWorkAssignId,
        saveExtend:saveExtend,
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
        return Restangular.all(serviceUrl + "/doSearchViewKtnb").post(id);
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
    function getExtendTimeHistoryByWorkAssignId(obj) {
        return Restangular.all(serviceUrl + "/getExtendTimeHistoryByWorkAssignId").post(obj);
    }
    function saveExtend(obj) {
        return Restangular.all(serviceUrl + "/saveExtend").post(obj);
    }
}]);
