angular.module('MetronicApp').factory('methodReduceRiskRsService', ['$http', '$q', 'RestEndpoint', 'Restangular', '$kWindow', function ($http, $q, RestEndpoint, Restangular, $kWindow) {
    var serviceUrl = "methodReduceRiskRsService";
    var factory = {
        doSearch: doSearch,
        doCoordinate:doCoordinate,
        doProcess:doProcess,
        acceptWork:acceptWork,
        doCloseWork:doCloseWork,
        doRejectWork:doRejectWork
    };
    return factory;

    function doSearch(id) {
        return Restangular.all(serviceUrl + "/doSearch").post(id);
    }
    function doCoordinate(obj) {
        return Restangular.all(serviceUrl + "/doCoordinate").post(obj);
    }
    function doProcess(obj) {
        return Restangular.all(serviceUrl + "/doProcess").post(obj);
    }
    function acceptWork(obj) {
        return Restangular.all(serviceUrl + "/acceptWork").post(obj);
    }
    function doCloseWork(obj) {
        return Restangular.all(serviceUrl + "/doCloseWork").post(obj);
    }
    function doRejectWork(obj) {
        return Restangular.all(serviceUrl + "/doRejectWork").post(obj);
    }
}]);
