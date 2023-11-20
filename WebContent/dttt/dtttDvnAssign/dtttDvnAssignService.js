angular.module('MetronicApp').factory('dtttDvnAssignService', ['$http', '$q', 'RestEndpoint', 'Restangular', '$kWindow', function ($http, $q, RestEndpoint, Restangular, $kWindow) {
    var serviceUrl = RestEndpoint.DTTT_ASSIGN_SERVICE_URL;
    var serviceDetailUrl = RestEndpoint.DTTT_ASSIGN_DETAIL_SERVICE_URL;
    var factory = {
        doSearch:doSearch,
        getDetail : getDetail ,
        getAttachedFile:getAttachedFile,
        uploadAttachment:uploadAttachment,
    };
    return factory;

    function doSearch(obj) {
        return Restangular.all(serviceUrl + "/doSearchViewDonVi").post(obj);
    }

    function getDetail (obj) {
        return Restangular.all(serviceUrl + "/getDetail ").post(obj);
    }

    function getAttachedFile(obj) {
        return Restangular.all(serviceDetailUrl + "/getAttachedFile").post(obj);
    }
    function uploadAttachment(apiEndpoint, formData){
        return $http.post(apiEndpoint, formData, {
            transformRequest: angular.identity,
            headers: {'Content-Type': 'multipart/form-data'}
        });
    }

}]);
