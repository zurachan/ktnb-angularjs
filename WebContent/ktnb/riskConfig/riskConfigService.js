angular.module('MetronicApp').factory('riskConfigService', ['$http', '$q', 'RestEndpoint', 'Restangular', '$kWindow', function ($http, $q, RestEndpoint, Restangular, $kWindow) {
    var serviceUrl = RestEndpoint.RISK_CONFIG_SERVICE_URL;
    var factory = {
        save: save,
        update: update,
        remove: remove,
        doSearch: doSearch,
        genCode: genCode,
        genRiskConfigGroup: genRiskConfigGroup,
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

    function genCode(id) {
        return Restangular.all(serviceUrl + "/genCode").post(id);
    }

    function genRiskConfigGroup(id) {
        return Restangular.all(serviceUrl + "/genRiskConfigGroup").post(id);
    }
}]);