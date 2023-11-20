angular.module('MetronicApp').factory('impellentBroadcastingStationService', ['$http', '$q', 'RestEndpoint', 'Restangular', '$kWindow', function ($http, $q, RestEndpoint, Restangular, $kWindow) {
    var serviceUrl = RestEndpoint.IMPELLENT_BROADCASTING_STATION;
    var factory = {
        doSearch:doSearch,
        saveNew:saveNew,
        checkRoleBtnAdd:checkRoleBtnAdd
    };
    return factory;

    function doSearch(obj) {
        return Restangular.all(serviceUrl + "/doSearch").post(obj);
    }

    function saveNew(obj) {
        return Restangular.all(serviceUrl + "/saveNew").post(obj);
    }

    function checkRoleBtnAdd() {
        return Restangular.all(serviceUrl + "/checkRoleBtnAdd").post();
    }

}]);
