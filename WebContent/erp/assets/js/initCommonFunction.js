/**
 * Created by pm1_os42 on 4/18/2018.
 */
function initCommonFunction($scope, $rootScope,$filter ){
//    $rootScope.validateDate = function(inputDate,minDate,maxDate,form,id) {
	//chinhpxn20180714_start
    	$rootScope.validateDate = function(inputDate,minDate,maxDate,form, form2,id) {
    		//chinhpxn20180714_end
        if (form != null) {
            form.$setDirty(true);
            var isDate
            if (inputDate != null && inputDate != '') {
                var date = $scope.stringToDate(inputDate, "dd/MM/yyyy", "/")
                isDate = angular.isDate(date)
                form.$setValidity('date', isDate);
                $rootScope.isValidDate = isDate;
                if(id == 21){
                    $rootScope.isTrueBGMB = isDate;
                }else if(id == 22){
                    $rootScope.isTrue = isDate;
                }else if(id == 26){
                    $rootScope.isTrueNT = isDate;
                }else if(id == 27){
                    $rootScope.isTrueHT = isDate;
                }
                if(isDate){
                    validateMinMaxDate(date,minDate,maxDate,form, form2);
                }else{
                    form.$setValidity('max', true);
                    form.$setValidity('min', true);
                }
            } else {
                if(id == 21){
                    $rootScope.isTrueBGMB = true;
                }else if(id == 22){
                    $rootScope.isTrue = true;
                }else if(id == 26){
                    $rootScope.isTrueNT = true;
                }else if(id == 27){
                    $rootScope.isTrueHT = true;
                }
                form.$setValidity('max', true);
                form.$setValidity('min', true);
                form.$setValidity('date', true);
                $rootScope.isValidDate = true;
            }
        }
    }
    //chinhpxn_20180714_start
    function validateMinMaxDate(date,minDate,maxDate,form, form2, id){
	//chinhpxn_20180714_end
        date.setHours(0, 0, 0, 0);
        if(minDate!=null&&minDate!=''){
            var min = $scope.stringToDate(minDate, "dd/MM/yyyy", "/");
            min.setHours(0, 0, 0, 0);
            if (date.getTime() < min.getTime()) {
                form.$setValidity('min', false);
                $rootScope.isValidDate = false;
                if(id == 21){
                    $rootScope.isTrueBGMB = false;
                }else if(id == 22){
                    $rootScope.isTrue = false;
                }else if(id == 26){
                    $rootScope.isTrueNT = false;
                }else if(id == 27){
                    $rootScope.isTrueHT = false;
                }
            } else {
                form.$setValidity('min', true);
//                chinhpxn20180714_start
                if(form2 != null) {
                	form2.$setValidity('max', true);
                }
//                chinhpxn20180714_end
            }
            if (date.getYear() == min.getYear() && date.getMonth() == min.getMonth() && date.getDate() == min.getDate()) {
                form.$setValidity('min', true);
            }
        }else{
            form.$setValidity('min', true);
            $rootScope.isValidDate = true;
            if(id == 21){
                $rootScope.isTrueBGMB = true;
            }else if(id == 22){
                $rootScope.isTrue = true;
            }else if(id == 26){
                $rootScope.isTrueNT = true;
            }else if(id == 27){
                $rootScope.isTrueHT = true;
            }
        }
        if(maxDate!=null&&maxDate!=''){
            var max = $scope.stringToDate(maxDate, "dd/MM/yyyy", "/");
            max.setHours(0, 0, 0, 0);
            if (max.getTime() < date.getTime()) {
                form.$setValidity('max', false);
                $rootScope.isValidDate = false;
            } else {
                form.$setValidity('max', true);
//                chinhpxn20180714_start
                if(form2 != null) {
                	form2.$setValidity('min', true);
                }
//                chinhpxn20180714_end
            }
        }
    }
    $scope.stringToDate = function (_date, _format, _delimiter) {
        //example
        //stringToDate("17/9/2014","dd/MM/yyyy","/");
        //stringToDate("9/17/2014","mm/dd/yyyy","/")
        //stringToDate("9-17-2014","mm-dd-yyyy","-")
        _date = _date + "";
        var formatLowerCase = _format.toLowerCase();
        var formatItems = formatLowerCase.split(_delimiter);
        var dateItems = _date.split(_delimiter);
        var monthIndex = formatItems.indexOf("mm");
        var dayIndex = formatItems.indexOf("dd");
        var yearIndex = formatItems.indexOf("yyyy");
        var year = parseInt(dateItems[yearIndex]);
        var month = parseInt(dateItems[monthIndex]);
        var day = parseInt(dateItems[dayIndex]);
        if(month>12||month<1)
        return null;
        if(year>9999||year<1000)
        return null;
        if(day>31||day<1)
        return null;
        var formatedDate = new Date(year, month, dateItems[dayIndex]);
        return formatedDate;
    }
}
