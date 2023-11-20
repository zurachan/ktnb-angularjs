angular.module('MetronicApp').factory('assignmentManagementService', ['$http', '$q', 'RestEndpoint', 'Restangular', '$kWindow', function ($http, $q, RestEndpoint, Restangular, $kWindow) {
    var serviceUrl = RestEndpoint.BASE_SERVICE_URL;
    var factory = {
        doSearch:doSearch,
        add: add,
        remove: remove,
        update: update,
        getDetail: getDetail,
        getListAttachedFile: getListAttachedFile,
        history: history,
        getFileGiaoViec: getFileGiaoViec,
        getDanhSachCongViec: getDanhSachCongViec,
        getDonViThucHien: getDonViThucHien,
        save: save,
        giahan: giahan,
        approveOrReject:approveOrReject,
        closeOrReject: closeOrReject,
        checkPermissionApproveAndReject: checkPermissionApproveAndReject,
        isTruongPhong: isTruongPhong,
        duyetdong: duyetdong,
        multipleApprove: multipleApprove,
        getListRole: getListRole
    };
    return factory;

    function doSearch(obj) {
        return Restangular.all("workAssignTCLDService/doSearchViewKtnbTCLD").post(obj);
    }
    function history(obj) {
        return Restangular.all("workAssignTCLDService/listHisExtend").post(obj);
    }

    function getFileGiaoViec(obj) {
        return Restangular.all("/getListAuthorization").post(obj);
    }
    function approveOrReject(obj) {
        return Restangular.all("workAssignTCLDService/approve_status").post(obj);
    }
    function closeOrReject(obj) {
        return Restangular.all("workAssignTCLDService/employee_status").post(obj);
    }
    
    function getDanhSachCongViec(obj) {
        return Restangular.all("/getListAuthorization").post(obj);
    }
    function getDonViThucHien(obj) {
        return Restangular.all("/getListAuthorization").post(obj);
    }

    function add(obj) {
        return Restangular.all("/add").post(obj);
    }

    function update(obj) {
        return Restangular.all("workAssignTCLDService/update").post(obj);
    }
    function save(obj) {
        return Restangular.all("workAssignTCLDService/save").post(obj);
    }
    function giahan(obj) {
        return Restangular.all("workAssignTCLDService/extTime").post(obj);
    }
    function duyetdong(obj) {
        return Restangular.all("workAssignTCLDService/verify_status").post(obj);
    }
    

    function remove(id) {
        return Restangular.all("workAssignTCLDService/remove").post(id);
    }

    function getDetail(id) {
        return Restangular.all("workAssignTCLDService/getDetail").post(id);
    }

    function getListAttachedFile(id) {
        return Restangular.all(RestEndpoint.COMMON_RS_SERVICE_URL + "/getListAttachedFile").post(id);
    }

    function checkPermissionApproveAndReject() {
        return Restangular.all("workAssignTCLDService/checkRoleVerify").post();

    }

    function getListRole() {
        return Restangular.all("workAssignTCLDService/getListRole").post();

    }

    function isTruongPhong() {
        return Restangular.all("workAssignTCLDService/checkPositionTP").post();

    }
    function multipleApprove(obj) {
        return Restangular.all("workAssignTCLDService/checkPositionTP").post(obj);

    }

}]);
