/* Modal Controller */
MetronicApp.controller('PopupCommonControllerCtrl', [
    '$scope',
    'data',
    'caller',
    'modalInstance',
    'windowId',
    'isCreateNew',
    'CommonService',
    'SearchService',
    'PopupConst',
    'RestEndpoint',
    '$localStorage',
    '$rootScope',
    function($scope, data, caller, modalInstance, windowId, isCreateNew,
             CommonService, SearchService, PopupConst, RestEndpoint,
             $localStorage, $rootScope) {

        $rootScope.flag=false;
        $scope.data = data;
        $scope.modalInstance = modalInstance;
        $scope.windowId = windowId;
        $scope.caller = caller;
        $scope.cancel = cancel;
        $scope.save = save;
        $scope.remove = remove;
        $scope.isCreateNew = isCreateNew;
        $scope.saveConfig = saveConfig;
        $scope.validatorOptions = kendoConfig.get('validatorOptions');
        $scope.onSelectFileForYearPlan=function(){
            if($("#files")[0].files[0].name.split('.').pop() !='xls' && $("#files")[0].files[0].name.split('.').pop() !='xlsx'){
                toastr.warning("Sai định dạng file");
                setTimeout(function() {
                    $(".k-upload-files.k-reset").find("li").remove();
                    $(".k-upload-files").remove();
                    $(".k-upload-status").remove();
                    $(".k-upload.k-header").addClass("k-upload-empty");
                    $(".k-upload-button").removeClass("k-state-focused");
                },10);
                return;
            }
            else{
                if(104857600<$("#files")[0].files[0].size){
                    toastr.warning("Dung lượng file vượt quá 100MB! ");
                    return;
                }
                $("#fileName").innerHTML=$("#files")[0].files[0].name
            }
        }

        function cancel() {
            CommonService.dismissPopup();
        }

        $(document).on("click",".k-overlay",function(){
            // $("div.k-window-actions > a.k-window-action > span.k-i-close").click();
            CommonService.dismissPopup();

        });

        $scope.focusOut=function(){
            if ($(document).find("button.saveQLK").is(':hover')) {
                setTimeout(function(){
                    if (!$scope.validator.validate()) {
                        focusElement($scope.validator._errors);
                        var typeAdds = document.getElementsByName("typeAdd");
                        var applyAdds = document.getElementsByName("applyAdd");
                        var ignoreAdds = document.getElementsByName("ignoreAdd");
                        if(typeAdds.length){
                            if (typeAdds[0].checked == false && typeAdds[1].checked == false) {
                                var msg = '<br /><br /><span >Loại thuế chưa được chọn</span><br /><br />';
                                document.getElementById('msg').innerHTML = msg;
                            }
                        }

                        if(applyAdds.length){
                            if (ignoreAdds[0].checked == false && ignoreAdds[1].checked == false) {
                                var msg = '<br /><br /><span >Miễn thuế chưa được chọn</span><br /><br />';
                                document.getElementById('msg1').innerHTML = msg;
                            }
                        }
                        if(ignoreAdds.length){
                            if (applyAdds[0].checked == false && applyAdds[1].checked == false) {
                                var msg = '<br /><br /><span >Phân bổ chưa được chọn</span><br /><br />';
                                document.getElementById('msg2').innerHTML = msg;
                            }
                        }
                    }
                },20);
            }

        }



        function save() {
            if ($scope.validator.validate()) {
                caller.save($scope.data, $scope.isCreateNew);
            } else {
                focusElement($scope.validator._errors)
                return;
            }
        }

        function saveConfig() {
            if ($scope.validator.validate()) {
                caller.saveConfig();
            }
        }

        function remove(){
            if ($scope.validator.validate()) {
                caller.remove($scope.data);
            }
            else{
                $("#cancelReasonCode").data("kendoDropDownList").focus();
                return;
            }
        }
        $scope.onSelectFile= function() {
            caller.onSelectFile();
        }
        $scope.onSelectVuongFile= function() {
            caller.onSelectVuongFile();
        }
        $scope.onSelectBGMBFile= function() {
            caller.onSelectBGMBFile();
        }
    } ]);
