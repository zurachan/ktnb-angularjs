angular.module('MetronicApp').factory('dataDamageService', ['$http', '$q', 'RestEndpoint', 'Restangular', '$kWindow', function ($http, $q, RestEndpoint, Restangular, $kWindow) {
    var serviceUrl = RestEndpoint.DATA_DAMAGE_SERVICE_URL;
    var factory = {
        getListWorkList: getListWorkList,
        doSearch:doSearch,
        save: save,
        remove: remove,
        update: update,
        exportFileBM:exportFileBM,
        saveByImportExcel:saveByImportExcel,
        saveApproveGD1: saveApproveGD1,
        cancelApproveGD1: cancelApproveGD1,
        saveQtrrApproveGD2: saveQtrrApproveGD2,
        cancelQtrrApproveGD2: cancelQtrrApproveGD2,
        saveGd2: saveGd2,
        saveGd2Temp: saveGd2Temp,
        saveConfirmGD2: saveConfirmGD2,
        cancelConfirmGD2: cancelConfirmGD2,
        getAttachFile: getAttachFile,
        saveComplete: saveComplete,
        saveConfirmGd3: saveConfirmGd3,
        cancelConfirmGd3: cancelConfirmGd3
    };
    return factory;

    function doSearch(obj) {
        return Restangular.all(serviceUrl + "/doSearch").post(obj);
    }

    function getListWorkList(obj) {
        return Restangular.all(serviceUrl + "/getListWorkList").post(obj);
    }

    function save(obj) {
        return Restangular.all(serviceUrl + "/save").post(obj);
    }

    function update(obj) {
        return Restangular.all(serviceUrl + "/update").post(obj);
    }

    function remove(id) {
        return Restangular.all(serviceUrl + "/remove").post(id);
    }
    function exportFileBM(obj) {
        return Restangular.all(serviceUrl + "/exportFileBM").post(obj);
    }
    function saveByImportExcel(obj) {
        return Restangular.all(serviceUrl + "/saveByImportExcel").post(obj);
    }
    function saveApproveGD1(obj) {
        return Restangular.all(serviceUrl + "/saveApproveGD1").post(obj);
    }
    function cancelApproveGD1(obj) {
        return Restangular.all(serviceUrl + "/cancelApproveGD1").post(obj);
    }
    function saveQtrrApproveGD2(obj) {
        return Restangular.all(serviceUrl + "/saveQtrrApproveGD2").post(obj);
    }
    function cancelQtrrApproveGD2(obj) {
        return Restangular.all(serviceUrl + "/cancelQtrrApproveGD2").post(obj);
    }
    function saveGd2(obj) {
        return Restangular.all(serviceUrl + "/saveGd2").post(obj);
    }
    function saveGd2Temp(obj) {
        return Restangular.all(serviceUrl + "/saveGd2Temp").post(obj);
    }
    function saveConfirmGD2(obj) {
        return Restangular.all(serviceUrl + "/saveConfirmGD2").post(obj);
    }
    function cancelConfirmGD2(obj) {
        return Restangular.all(serviceUrl + "/cancelConfirmGD2").post(obj);
    }
    function getAttachFile(obj) {
        return Restangular.all(serviceUrl + "/getAttachFile").post(obj);
    }
    function saveComplete(obj) {
        return Restangular.all(serviceUrl + "/saveComplete").post(obj);
    }
    function saveConfirmGd3(obj) {
        return Restangular.all(serviceUrl + "/saveConfirmGd3").post(obj);
    }
    function cancelConfirmGd3(obj) {
        return Restangular.all(serviceUrl + "/cancelConfirmGd3").post(obj);
    }
}]);
