angular.module('MetronicApp').factory('awardService', ['$http', '$q', 'RestEndpoint', 'Restangular', '$kWindow', function ($http, $q, RestEndpoint, Restangular, $kWindow) {
    var serviceUrl = RestEndpoint.PUNISHMENT_REQUEST_SERVICE_URL;
    var factory = {
        doSearch: doSearch,
    };
    return factory;

    function doSearch(id) {
        return Restangular.all(serviceUrl + "/doSearch").post(id);
    }
}]);