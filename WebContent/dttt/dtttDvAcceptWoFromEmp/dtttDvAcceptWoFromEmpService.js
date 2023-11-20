angular.module('MetronicApp').factory('dtttDvAcceptWoFromEmpService', ['$http', '$q', 'RestEndpoint', 'Restangular', '$kWindow', function ($http, $q, RestEndpoint, Restangular, $kWindow) {
    var serviceUrl = RestEndpoint.WORK_ASSIGN_DETAIL_SERVICE_URL;
    var factory = {
        getListWorkAssignDetail: getListWorkAssignDetail,
        doSearch:doSearch,
        add: add,
        remove: remove,
        update: update,
        getListAttachedFile:getListAttachedFile,
        uploadAttachment:uploadAttachment,
        getDetail : getDetail ,
    };
    return factory;

    function doSearch(obj) {
        return Restangular.all(serviceUrl + "/doSearch").post(obj);
    }

    function getListWorkAssignDetail(obj) {
        return Restangular.all(serviceUrl + "/getListWorkAssignDetail").post(obj);
    }

    function add(obj) {
        return Restangular.all(serviceUrl + "/add").post(obj);
    }

    function update(obj) {
        return Restangular.all(serviceUrl + "/update").post(obj);
    }

    function remove(id) {
        return Restangular.all(serviceUrl + "/remove").post(id);
    }
    function getListAttachedFile(obj) {
        return Restangular.all(RestEndpoint.COMMON_RS_SERVICE_URL + "/getListAttachedFile").post(obj);
    }
    function uploadAttachment(apiEndpoint, formData){
        return $http.post(apiEndpoint, formData, {
            transformRequest: angular.identity,
            headers: {'Content-Type': 'multipart/form-data'}
        });
    }
    function getDetail (obj) {
        return Restangular.all(RestEndpoint.DTTT_ASSIGN_SERVICE_URL + "/getDetail ").post(obj);
    }
    // function exportFileBM(obj) {
    //     return Restangular.all(serviceUrl + "/exportFileBM").post(obj);
    // }
    // function saveByImportExcel(obj) {
    //     return Restangular.all(serviceUrl + "/saveByImportExcel").post(obj);
    // }
}]);
