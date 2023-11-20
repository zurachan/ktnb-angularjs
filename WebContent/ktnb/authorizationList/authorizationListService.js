angular.module('MetronicApp').factory('authorizationListService', ['$http', '$q', 'RestEndpoint', 'Restangular', '$kWindow', function ($http, $q, RestEndpoint, Restangular, $kWindow) {
    var serviceUrl = RestEndpoint.AUTHORIZATION_SERVICE_URL;
    var factory = {
        doSearch:doSearch,
        add: add,
        remove: remove,
        update: update,
        getDetail: getDetail,
        getListAttachedFile: getListAttachedFile,
    };
    return factory;

    function doSearch(obj) {
        return Restangular.all(serviceUrl + "/doSearch").post(obj);
    }

    function getListAuthorization(obj) {
        return Restangular.all(serviceUrl + "/getListAuthorization").post(obj);
    }

    function add(obj) {
        return Restangular.all(serviceUrl + "/add").post(obj);
    }

    function update(obj) {
        return Restangular.all(serviceUrl + "/update").post(obj);
    }

    function remove(id) {
        return Restangular.all(serviceUrl + "/remove").patch(id);
    }

    function getDetail(id) {
        return Restangular.all(serviceUrl + "/getDetail").post(id);
    }

    function getListAttachedFile(id) {
        return Restangular.all(RestEndpoint.COMMON_RS_SERVICE_URL + "/getListAttachedFile").post(id);
    }

}]);
