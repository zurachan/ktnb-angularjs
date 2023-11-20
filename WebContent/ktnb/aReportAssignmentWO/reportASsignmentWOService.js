angular.module('MetronicApp').factory('reportASsignmentWOService', ['$http', '$q', 'RestEndpoint', 'Restangular', '$kWindow', function ($http, $q, RestEndpoint, Restangular, $kWindow) {
    var factory = {
        doSearch:doSearch,
        
    };
    return factory;

    function doSearch(obj) {
        return Restangular.all("workAssignTCLDService/search_export").post(obj);
    }
  

}]);
