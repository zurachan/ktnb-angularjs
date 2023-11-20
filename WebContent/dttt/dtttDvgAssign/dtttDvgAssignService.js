angular.module('MetronicApp').factory('dtttDvgAssignService', ['$http', '$q', 'RestEndpoint', 'Restangular', '$kWindow', function ($http, $q, RestEndpoint, Restangular, $kWindow) {
    var serviceUrl = "dtttAssignRsService";
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
        return Restangular.all(serviceUrl + "/doSearchViewDvg").post(id);
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

}]);
