angular.module('MetronicApp')
    .factory('ktnbEmployeeService', ['$http', '$q', 'RestEndpoint', 'Restangular', '$kWindow', function ($http, $q, RestEndpoint, Restangular, $kWindow) {

        var serviceUrl = RestEndpoint.KTNB_EMPLOYEE_SERVICE_URL;
        var factory = {
            doSearch: doSearch,
            importListEmployee : importListEmployee,
            save: save,
            update: update,
            remove: remove,

        }

        return factory;
        function doSearch(obj) {
            debugger
            return Restangular.all(serviceUrl + "/doSearch").post(obj);
        }
        function importListEmployee(obj) {
            return Restangular.all(serviceUrl + "/importListEmployee").post(obj);
        }
        function save(obj) {
            return Restangular.all(serviceUrl + "/save").post(obj);
        }
        function update(obj) {
            return Restangular.all(serviceUrl + "/update").post(obj);
        }
        function remove(obj) {
            return Restangular.all(serviceUrl + "/remove").post(obj);
        }
    }]);
