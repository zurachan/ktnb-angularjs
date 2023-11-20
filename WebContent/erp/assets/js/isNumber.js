
(function () {
  'use strict';
  var module = angular.module('vt.directive.isNumber', []);
  module.directive('isNumber', ['$filter', function ($filter) {
	  return {
	        require: '?ngModel',
	        link: function (scope, elem, attrs, ctrl) {
	            if (!ctrl) return;


	            ctrl.$formatters.unshift(function () {
	                return $filter('number')(ctrl.$modelValue,0)
	            });


	            ctrl.$parsers.unshift(function (viewValue) {
	                var plainNumber = viewValue.replace(/[^0-9]/g, '');
	                ctrl.$setViewValue(plainNumber);
	                ctrl.$render();
	                elem.val($filter('number')(plainNumber,0));
	                return plainNumber;
	            });
	        }
	    };
	}]);
  
  module.directive('isFloat', ['$filter', function ($filter) {
	  return {
	        require: '?ngModel',
	        link: function (scope, elem, attrs, ctrl) {
	            if (!ctrl) return;


	            ctrl.$formatters.unshift(function () {
	                return $filter('number')(ctrl.$modelValue)
	            });

	            ctrl.$parsers.unshift(function (viewValue) {
	                var plainNumber = kendo.parseFloat(viewValue);
	                ctrl.$setViewValue(plainNumber);
	                ctrl.$render();
	                elem.val(kendo.toString(kendo.parseFloat(plainNumber), "n3"));
	                return plainNumber;
	            });
	        }
	    };
	}]);
  
  module.directive("autoGrow", ['$window', function($window){
	  return {
	      restrict: 'A',
	      link: function postLink(scope, element, attrs) {
	          var update = function(){
	        	  element.css({
	                  height: 'auto',
	                  overflow: 'hidden'
	                });
	              var height = element[0].scrollHeight;
	              if(height > 0){
	            	  element.css("height", height + "px");
	        	  }
	          };
	          scope.$watch(attrs.ngModel, function(){
	        		  update();
	          });

	          attrs.$set("ngTrim", "false");
	      }
	    };
	}]);
  
  module.directive('formatDate', ['$filter', function ($filter) {
      return {
          require: '?ngModel',
          link: function (scope, element, attrs, ctrl) {
        	  element.mask("99/99/9999");
        	  
        	  
          }
      };
  }]);


    module.directive("decimals", function ($filter) {
        return {
            restrict: "A", // Only usable as an attribute of another HTML element
            require: "?ngModel",
            scope: {
                decimals: "@",
                decimalPoint: "@"
            },
            link: function (scope, element, attr, ngModel) {
                var decimalCount = parseInt(scope.decimals) || 2;
                var decimalPoint = scope.decimalPoint || ".";

                // Run when the model is first rendered and when the model is changed from code
                ngModel.$render = function() {
                    if (ngModel.$modelValue != null && ngModel.$modelValue >= 0) {
                        if (typeof decimalCount === "number") {
                            element.val(ngModel.$modelValue.toFixed(decimalCount).toString().replace(".", ","));
                        } else {
                            element.val(ngModel.$modelValue.toString().replace(".", ","));
                        }
                    }
                }

                // Run when the view value changes - after each keypress
                // The returned value is then written to the model
                ngModel.$parsers.unshift(function(newValue) {
                    if (typeof decimalCount === "number") {
                        var floatValue = parseFloat(newValue.replace(",", "."));
                        if (decimalCount === 0) {
                            return parseInt(floatValue);
                        }
                        return parseFloat(floatValue.toFixed(decimalCount));
                    }

                    return parseFloat(newValue.replace(",", "."));
                });

                // Formats the displayed value when the input field loses focus
                element.on("change", function(e) {
                    var floatValue = parseFloat(element.val().replace(",", "."));
                    if (!isNaN(floatValue) && typeof decimalCount === "number") {
                        if (decimalCount === 0) {
                            element.val(parseInt(floatValue));
                        } else {
                            var strValue = floatValue.toFixed(decimalCount);
                            element.val(strValue.replace(".", decimalPoint));
                        }
                    }
                });
            }
        }
    });

    module.directive('priceInput', function($filter, $browser) {
        return {
            require: '?ngModel',
            link: function($scope, $element, $attrs, ngModelCtrl) {
                var listener = function() {
                    var value = $element.val().replace(/,/g, '')
                    $element.val($filter('number')(value))
                }

                // This runs when we update the text field
                ngModelCtrl.$parsers.push(function(viewValue) {
                    return viewValue.replace(/,/g, '');
                })

                // This runs when the model gets updated on the scope directly and keeps our view in sync
                ngModelCtrl.$render = function() {
                    $element.val($filter('number')(ngModelCtrl.$viewValue))
                }

                $element.bind('change', listener)
                $element.bind('keydown', function(event) {
                    var key = event.keyCode
                    // If the keys include the CTRL, SHIFT, ALT, or META keys, or the arrow keys, do nothing.
                    // This lets us support copy and paste too
                    if ((key < 48 || (57 < key && key < 96) || key > 105) && key != 8) {
                        event.preventDefault();
                        return;
                    }

                    $browser.defer(listener) // Have to do this or changes don't get picked up properly
                })

                $element.bind('paste cut', function() {
                    $browser.defer(listener)
                })
            }
        }
    });
})();

