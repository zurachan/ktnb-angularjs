angular.module('MetronicApp').factory('violationService', ['$http', '$q', 'RestEndpoint', 'Restangular', '$kWindow', function ($http, $q, RestEndpoint, Restangular, $kWindow) {
    var serviceUrl = RestEndpoint.VIOLATION_SERVICE_URL;
    var factory = {
        save: save,
        update: update,
        remove: remove,
        doSearch: doSearch,
    };
    return factory;

    function save(obj) {
        return Restangular.all(serviceUrl + "/save").post(obj);
    }

    function update(obj) {
        return Restangular.all(serviceUrl + "/update").post(obj);
    }

    function remove(obj) {
        return Restangular.all(serviceUrl + "/remove").post(obj);
    }

    function doSearch(id) {
        return Restangular.all(serviceUrl + "/doSearch").post(id);
    }
}]);