angular.module('MetronicApp').factory('riskIndexService', ['$http', '$q', 'RestEndpoint', 'Restangular', '$kWindow', function ($http, $q, RestEndpoint, Restangular, $kWindow) {
    var serviceUrl = RestEndpoint.RISK_INDEX_SERVICE_URL;
    var factory = {
        save: save,
        update: update,
        remove: remove,
        doSearch: doSearch,
        getSequenceCode:getSequenceCode,
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

    function doSearch(obj) {
        return Restangular.all(serviceUrl + "/doSearch").post(obj);
    }

    function getSequenceCode(obj){
        return Restangular.all(serviceUrl + "/getSequenceCode").post(obj);
    }
}]);