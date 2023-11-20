angular.module('MetronicApp')
    .factory('incidentReportService', ['$http', '$q', 'RestEndpoint', 'Restangular', '$kWindow', function ($http, $q, RestEndpoint, Restangular, $kWindow) {

        var serviceUrl = RestEndpoint.INCIDENT_REPORT_SERVICE_URL;
        var factory = {
            doSearch: doSearch,
            save: save,
            checkPermission: checkPermission,
            approve: approve,
            remove: remove,
            remove2: remove2,
            saveResult: saveResult,
            approve2: approve2,
            saveEdit: saveEdit,
            deleteData: deleteData
        }

        return factory;
        function doSearch(obj) {
            return Restangular.all(serviceUrl + "/doSearch").post(obj);
        }
        function save(obj) {
            return Restangular.all(serviceUrl + "/save").post(obj);
        }
        function checkPermission(obj) {
            return Restangular.all(serviceUrl + "/checkPermission").post(obj);
        }
        function approve(obj) {
            return Restangular.all(serviceUrl + "/approve").post(obj);
        }
        function remove(obj) {
            return Restangular.all(serviceUrl + "/remove").post(obj);
        }
        function saveResult(obj) {
            return Restangular.all(serviceUrl + "/saveResult").post(obj);
        }
        function approve2(obj) {
            return Restangular.all(serviceUrl + "/approve2").post(obj);
        }
        function remove2(obj) {
            return Restangular.all(serviceUrl + "/remove2").post(obj);
        }
        function saveEdit(obj) {
            return Restangular.all(serviceUrl + "/saveEdit").post(obj);
        }
        function deleteData(obj) {
            return Restangular.all(serviceUrl + "/deleteData").post(obj);
        }
    }]);
