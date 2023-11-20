/**
 * Created by pm1_os42 on 2/25/2018.
 */
(function () {
    'use strict';
    var module = angular.module('vt.directive.maskInput', []);

    module.directive('maskInputFull', function () {
        return {
            require: '?ngModel',
            link: function (scope, element, attrs, ctrl) {
                element.mask("99/99/9999");
            }
        };
    });
    module.directive('maskInputMonth', ['$filter', function ($filter) {
        return {
            require: '?ngModel',
            link: function (scope, element, attrs, ctrl) {
                element.mask("99/9999");
            }
        };
    }]);
    module.directive('maskInputYear', ['$filter', function ($filter) {
        return {
            require: '?ngModel',
            link: function (scope, element, attrs, ctrl) {
                element.mask("9999");
            }
        };
    }]);

})()