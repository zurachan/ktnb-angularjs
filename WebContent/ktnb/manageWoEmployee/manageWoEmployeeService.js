angular.module('MetronicApp').factory('manageWoEmployeeService', ['$http', '$q', 'RestEndpoint', 'Restangular', '$kWindow', function ($http, $q, RestEndpoint, Restangular, $kWindow) {
    var data = undefined;
    var serviceUrl = RestEndpoint.WORK_ASSIGN_SERVICE_URL;
    var serviceDetailUrl = RestEndpoint.WORK_ASSIGN_DETAIL_SERVICE_URL;
    var factory = {
        getListWorkAssignDetail: getListWorkAssignDetail,
        doSearch:doSearch,
        getDetail : getDetail ,
        getListAttachedFile:getListAttachedFile,
        uploadAttachment:uploadAttachment,
        setData: setData,
        getData: getData,
    };
    return factory;

    function setData(data) {
        this.data = data
    }
    function getData() {
        return data;
    }
    function doSearch(obj) {
        return Restangular.all(serviceDetailUrl + "/doSearch").post(obj);
    }

    function getListWorkAssignDetail(obj) {
        return Restangular.all(serviceDetailUrl + "/getListWorkAssignDetail").post(obj);
    }

    function getDetail (obj) {
        return Restangular.all(serviceUrl + "/getDetail ").post(obj);
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
    // function exportFileBM(obj) {
    //     return Restangular.all(serviceUrl + "/exportFileBM").post(obj);
    // }
    // function saveByImportExcel(obj) {
    //     return Restangular.all(serviceUrl + "/saveByImportExcel").post(obj);
    // }
}]);
