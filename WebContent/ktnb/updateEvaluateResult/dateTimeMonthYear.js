angular.module('MetronicApp')
	.directive(
		'dateTimeMonthYear',
		function ($rootScope, RestEndpoint, CommonService,
			gettextCatalog, $http) {

			return {
				restrict: 'AE',
				scope: {
					ngModel: '=',
					caller: '=',
					id: "@",
					errorDate: '=',
					rule: '=',
				},

				link: function ($scope, element, attrs, ctrl) {

					var transDate = $("#" + attrs.id);
					transDate.kendoMaskedTextBox({
						mask: "00",
					});

					transDate.kendoDatePicker({
						depth: "year",
					    start: "year",
						format: "MM/yyyy"
					});

					transDate.closest(".k-datepicker").add(transDate)
						.removeClass("k-textbox");


					//							 element.bind('blur', function(e) {
					//							  if($scope.rule._errors[attrs.name]!=null || $scope.rule._errors[attrs.name] != undefined){
					//									  $("#"+attrs.id).focus();
					//								  }
					//							 });

					/*element.bind('change', function(e) {
					// if($scope.rule._errors[attrs.name]){
							// $("#"+attrs.id).focus();
						// }
					});*/



				}
			};
		});
