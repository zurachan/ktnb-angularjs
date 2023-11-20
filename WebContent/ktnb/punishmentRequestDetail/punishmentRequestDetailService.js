angular.module('MetronicApp').factory('punishmentRequestDetailService', ['$http', '$q', 'RestEndpoint', 'Restangular', '$kWindow', function ($http, $q, RestEndpoint, Restangular, $kWindow) {
    var serviceUrl = RestEndpoint.PUNISHMENT_REQUEST_DETAIL_SERVICE_URL;
    var factory = {
        doSearch: doSearch,
    };
    return factory;

    function doSearch(obj) {
        return Restangular.all(serviceUrl + "/doSearch").post(obj);
    }
}]);