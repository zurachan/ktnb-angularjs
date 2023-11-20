(function() {
    'use strict';
    var controllerId = 'ChartController';
    angular.module('MetronicApp').filter('startFrom', function() {
        return function(input, start) {
            start = +start; // parse to int
            return input.slice(start);
        }


    });

//    var vm = this;
//	vm.chartSearch={};
//    var date = new Date();
//    var start = new Date(date.getFullYear(), date.getMonth(), 1);
//    var end = new Date(date.getFullYear(), date.getMonth() +1, 0);
//    vm.chartSearch.dateTo = '01/10/2018';
//    vm.chartSearch.dateFrom = '31/10/2018';
//    doSearch();

angular.module('MetronicApp').controller(controllerId, function($rootScope, $scope, $http, $timeout,$kWindow,$filter, CommonService, Constant,Restangular,RestEndpoint,gettextCatalog,kendoConfig,htmlCommonService) {
	var vm = this;
	var date = new Date();
	vm.chartSearch={};

//     AmCharts.translations["export"]["en"]["fallback.save.text"] = CommonService.translate("Ấn CTRL + C để copy dữ liệu");
//     AmCharts.translations["export"]["en"]["fallback.save.image"] = CommonService.translate("Ấn chuột phải -> Lưu ảnh ... để lưu ảnh về.");
//     AmCharts.translations["export"]["en"]["capturing.delayed.menu.label"] = CommonService.translate("{{duration}}");
//     AmCharts.translations["export"]["en"]["capturing.delayed.menu.title"] = CommonService.translate("Click để hủy");
//     AmCharts.translations["export"]["en"]["menu.label.print"] = CommonService.translate("In");
//     AmCharts.translations["export"]["en"]["menu.label.undo"] = CommonService.translate("Quay lại");
//     AmCharts.translations["export"]["en"]["menu.label.redo"] = CommonService.translate("Tiếp theo");
//     AmCharts.translations["export"]["en"]["menu.label.cancel"] = CommonService.translate("Hủy");
//     AmCharts.translations["export"]["en"]["menu.label.save.image"] = CommonService.translate("Tải về ...");
//     AmCharts.translations["export"]["en"]["menu.label.save.data"] = CommonService.translate("Lưu thành ...");
//     AmCharts.translations["export"]["en"]["menu.label.draw"] = CommonService.translate("Chú thích ...");
//     AmCharts.translations["export"]["en"]["menu.label.draw.change"] = CommonService.translate("Đổi ...");
//     AmCharts.translations["export"]["en"]["menu.label.draw.add"] = CommonService.translate("Thêm ...");
//     AmCharts.translations["export"]["en"]["menu.label.draw.shapes"] = CommonService.translate("Hình ...");
//     AmCharts.translations["export"]["en"]["menu.label.draw.colors"] = CommonService.translate("Màu ...");
//     AmCharts.translations["export"]["en"]["menu.label.draw.widths"] = CommonService.translate("Cỡ ...");
//     AmCharts.translations["export"]["en"]["menu.label.draw.opacities"] = CommonService.translate("Độ mờ ...");
//     AmCharts.translations["export"]["en"]["menu.label.draw.text"] = CommonService.translate("Chữ");
//     AmCharts.translations["export"]["en"]["menu.label.draw.modes"] = CommonService.translate("Chế độ ...");
//     AmCharts.translations["export"]["en"]["menu.label.draw.modes.pencil"] = CommonService.translate("Bút chì");
//     AmCharts.translations["export"]["en"]["menu.label.draw.modes.line"] = CommonService.translate("Đường thẳng");
//     AmCharts.translations["export"]["en"]["menu.label.draw.modes.arrow"] = CommonService.translate("Mũi tên");
//     AmCharts.translations["export"]["en"]["label.saved.from"] = CommonService.translate("Lưu từ:");
//
//     initMonthYear();
// 	function initMonthYear() {
//         var yearcurr = new Date().getFullYear();
//         var monthCur = date.getMonth() + 1;
//         if (monthCur < 10) {
//             vm.chartSearch.monthYear = '0' + monthCur + "/" + yearcurr;
//         } else {
//             vm.chartSearch.monthYear = monthCur + "/" + yearcurr;
//         }
//     }
//
//     var chartNameList = {
//         "rpChartDiv3": "cumulative_revenue_industry",
//         "rpChartDiv4": "deployment",
//         "rpChartDiv5": "revenue_proportion",
//         "rpChartDiv6": "customer_reuse",
//         "rpChartDiv7": "top_three_cities",
//         "chartdiv6": "top_three_fail_service",
//         "rpChartDiv3cumDoanhThu": "top_three_groups",
//         "chartdiv3groups": "top_three_groups_fail_service",
//     }
//
// 	setTimeout(function(){
// 		doSearch();
// 	},200);
//
//     vm.isSearchGroup = false;
//     vm.doSearch= doSearch;
//     function doSearch(){
//         if($("#monthId").val()!=""){
//             if(kendo.parseDate($("#monthId").val(),'MM/yyyy')==null){
//                 toastr.warning("Tháng/Năm sai định dạng (VD: 04/2019)");
//                 $("#monthId").focus();
//                 return;
//             }
//         }
//         //tatph-start-2/1/2020
//         if(vm.chartSearch.sysGroupId != null){
//             vm.isSearchGroup = true;
//         }else{
//             vm.isSearchGroup = false;
//         }
//         //tatph-end-2/1/2020
//
//
// //    	chartComplete();
// //    	chartCompleteAcc();
// //    	chartPie();
//    	    chartColumn();
//         chartPie1();
//         chartLine();
//
//
//         var chartList = [];
//         chartList.push(chartNameList.rpChartDiv3);
//         chartList.push(chartNameList.rpChartDiv4);
//         chartList.push(chartNameList.rpChartDiv5);
//         chartList.push(chartNameList.rpChartDiv6);
//         chartList.push(chartNameList.rpChartDiv7);
//         chartList.push(chartNameList.rpChartDiv3cumDoanhThu);
//
//         var monthYear = vm.chartSearch.monthYear.split("/");
//         vm.chartSearch.chartList = chartList;
//         vm.chartSearch.performerGroupId = vm.chartSearch.sysGroupId;
//         vm.chartSearch.month = monthYear[0];
//         vm.chartSearch.year = monthYear[1];
//         vm.searchByDept = !!(vm.chartSearch.performerGroupId);
//         //tatph-start-16/12/2019
//    	    chartColumn3GroupsFail();
//         //tatph-end-16/12/2019
//         Restangular.all('reportAioService' + '/doSearchDataChart').post(vm.chartSearch).then(function (response) {
//             generateChart3(response.cumulative_revenue_industry);
//             generateChart4(response.deployment);
//             generateChart5(response.revenue_proportion);
//             generateChart6(response.customer_reuse);
//             generateChart7(response.top_three_cities);
//             generateChartThreeGroupsChart(response.top_three_groups);
//         });
//     }
//
// 	/**Biểu đồ cột**/
// 	function chartColumn(){
// 		Restangular.all("aioMonthPlanService/" + 'doSearchChartColumnFailProvince').post(vm.chartSearch).then(function (response) {
// 			var list = response.plain();
// 			function generateChartColumnData(){
// 		        var chartData =[];
// 		        for(var i =0; i < Math.min(9, list.length); i++){
// 		        	 chartData.push({
// 		        		 	"sysGroupName": list[i].sysGroupName,
// 			                "thucHien1Ngay": list[i].thucHien1Ngay,
// 			                "thucHien2Ngay": list[i].thucHien2Ngay,
// 			                "thucHien3Ngay": list[i].thucHien3Ngay
// 		        	 });
// 		        }
// 		        return chartData;
// 		    }
//
// 			AmCharts.makeChart("chartdiv6", {
// 	            "legend": {
// 	                "align": "center",
// 	                "valueText": "[[close]]",
// 	                "markerSize": 10,
// 	                "spacing": 20,
// 	                "valueWidth": 0,
// 	                "verticalGap": 5
// 	            },
// 	            "type": "serial",
// 	            "theme": "dark", //Đổi màu
// 	            "dataProvider": generateChartColumnData(),
// 	            "startDuration": 1,
// 	            "valueAxes": [{
// 	                "stackType": "regular",
// 	                "axisAlpha": 0.3,
// 	                "gridAlpha": 0
// 	            }],
// 	            "graphs": [{
// 	                "balloonText": "KPI 1 ngày [[category]]: [[value]]",
// 	                "type": "column",
// 	                "valueField": "thucHien1Ngay",
// 	                "fillAlphas": 1,
// 	                "lineAlpha": 0,
// 	                "title": "KPI 1 ngày",
//                     "fillColors": "orange",
//                     "labelPosition" : "top",
//                     "labelText":"[[value]]%"
// 	            }, {
// 	                "balloonText": "KPI 2 ngày [[category]]: [[value]]",
// 	                "type": "column",
// 	                "valueField": "thucHien2Ngay",
// 	                "fillAlphas": 1,
// 	                "lineAlpha": 0,
// 	                "title": "KPI 2 ngày",
//                     "fillColors": "brown",
//                     "labelPosition" : "top",
//                     "labelText":"[[value]]%"
// 	            },{
// 	                "balloonText": "KPI 3 ngày [[category]]: [[value]]",
// 	                "type": "column",
// 	                "valueField": "thucHien3Ngay",
// 	                "fillAlphas": 1,
// 	                "lineAlpha": 0,
// 	                "title": "KPI 3 ngày",
//                     "fillColors": "red",
//                     "labelPosition" : "top",
//                     "labelText":"[[value]]%"
// 	            }
// 	            ],
// 	            "categoryField": "sysGroupName",
// 	            "categoryAxis": {
// 	                "gridPosition": "start",
// 	                "fillAlpha": 0,
// 	                // "fillColor": "#000000",
// 	                "gridAlpha": 0,
// 	                "position": "bottom",
// 	                "labelRotation": 45
// 	            },
// 	            "export": {
// 	                "enabled": true,
// 	                processData: function(data, cfg) {
// 	                    if ((cfg.format === "XLSX") && !cfg.ignoreThatRequest) {
// 	                        var fieldList = [];
// 	                        var rowData = [];
// 	                        var row = {};
//
// 	                        for (var i = 0; i < data.length; i++) {
// 	                            var field = data[i].sysGroupName + i;
// 	                            if (i < 3) {
// 	                                row[field] = data[i].thucHien1Ngay;
// 	                            } else if(i >= 3 && i<6){
// 	                                row[field] = data[i].thucHien2Ngay;
// 	                            } else {
// 	                            	row[field] = data[i].thucHien3Ngay;
// 	                            }
//
// 	                            fieldList.push({
// 	                                "field": field,
// 	                                "title": data[i].sysGroupName
// 	                            });
// 	                        }
//
// 	                        rowData.push(row);
// 	                        directExport(rowData, fieldList, chartNameList.chartdiv6)
// 	                    }
// 	                }
// 	            }
// 	        });
// 		});
// 	}
//
// 	function chartLine(){
// 		var monthYear = $("#monthId").val().split("/");
// 		vm.chartSearch.month = monthYear[0];
// 		vm.chartSearch.year = monthYear[1];
// 		Restangular.all("aioMonthPlanService/" + 'doSearchChartLine').post(vm.chartSearch).then(function (response) {
// 			var list = response;
// 			function generateChartLineData(){
// //				var listData = [];
// //				for(var j =0; j < list.length; j++){
// //					listData.push(list[j].performValue);
// //		        }
// 		        var chartData =[];
// 		        for(var i =0; i < list.length; i++){
// 		        	 chartData.push({
// 			                "date": list[i].dateMonth,
// 			                "plan": Math.round(list[i].planValue),
// 			                "perform": list[i].performValue,
// //			                "min": listData.min(),
// //			                "max": listData.max()
// 			            });
// 		        }
// 		        return chartData;
// 		    }
// 	var chart = AmCharts.makeChart("chartdiv4", {
// 	    "type": "serial",
// 	    "theme": "light",
// 	    "legend": {
// 	        "useGraphSettings": true
// 	    },
// 	    "dataProvider": generateChartLineData(),
// 	    "valueAxes": [{
// 	        "integersOnly": true,
// //	        "maximum": "max",
// //	        "minimum": "min",
// 	        "reversed": false, //Giá trị tăng dần từ dưới lên trên
// 	        "axisAlpha": 0,
// 	        "dashLength": 5,
// 	        "gridCount": 10,
// 	        "position": "left", //Trục y nằm bên trái
// 	        "title": "Tiến độ theo ngày (VND)",
// 	        "titleColor": "gray"
// 	    }],
// 	    "startDuration": 0.5,
// 	    "graphs": [{
// 	        "balloonText": "Tiến độ thực hiện theo ngày [[category]]: [[value]]",
// 	        "bullet": "square",
// 	        "title": "Thực hiện",
// 	        "valueField": "perform",
// 	        "fillAlphas": 0
// 	    }, {
// 	        "balloonText": "Tiến độ kế hoạch theo ngày [[category]]: [[value]]",
// 	        "bullet": "round",
// 	        "title": "Kế hoạch",
// 	        "valueField": "plan",
// 	        "fillAlphas": 0
// 	    }],
// 	    "chartCursor": {
// 	        "cursorAlpha": 0,
// 	        "zoomable": false
// 	    },
// 	    "categoryField": "date",
// 	    "categoryAxis": {
// 	        "gridPosition": "start",
// 	        "axisAlpha": 0, //0: nét đứt trục X, 1: nét liền
// 	        "fillAlpha": 0.05, //Độ đậm màu của cột nền
// 	        "fillColor": "#000000", //Màu của cột nền
// 	        "gridAlpha": 0,
// 	        "position": "bottom", //Trục X nằm bên dưới
// 	        "labelRotation": 45 //Độ nghiêng phần tử trục X
// 	    },
// 	    "export": {
// 	    	"enabled": true
// //	        "position": "bottom-right"
// 	     }
// 	});
// 	});
// 	}
//
// 	function chartPie1(){
// 		var monthYear = $("#monthId").val().split("/");
// 		vm.chartSearch.month = monthYear[0];
// 		vm.chartSearch.year = monthYear[1];
// 		Restangular.all("aioMonthPlanService/" + 'doSearchChart').post(vm.chartSearch).then(function (response) {
// 			var list = response;
// 			function generateChartPie1Data(){
// 		        var chartData =[];
// 		        var totalThucHien = 0;
// 		        for(var i =0; i < list.length; i++){
// //		        	if(list[i].titleName=='Thực hiện'){
// //		        		list[i].color = 'orange';
// //		        	} else {
// //		        		list[i].color = 'blue';
// //		        	}
// 					if (list[i].titleName == 'Thực hiện') {
// 						totalThucHien = list[i].totalAmount;
// 					}
// 					if (list[i].titleName == 'Còn phải TH') {
// 						list[i].totalAmount = list[i].totalAmount - totalThucHien;
// 					}
// 		        	 chartData.push({
// 			                "litres": list[i].totalAmount,
// 			                "country": list[i].titleName,
// //			                "color": list[i].color
// 			            });
// 		        }
// 		        return chartData;
// 		    }
//
// 			var chart = AmCharts.makeChart( "chartdiv5", {
//                 "legend":
//                     {
//                         "align": "center",
//                         "valueText": "[[close]]",
//                         "markerSize": 10,
//                         "spacing": 20,
//                         "valueWidth": 0,
//                         "verticalGap": 5
//                     },
//                 "type": "pie",
//                 "theme": "light", //Đổi màu
//                 "dataProvider": generateChartPie1Data(),
//                 "valueField": "litres",
//                 "titleField": "country",
//                 "labelsEnabled": true,
//                 "labelText": "[[percents]]%",
//                 "balloonText" : "[[title]]:[[value]]",
//                 //"labelRadius": -40,
//                 "outlineAlpha": 0.4,
//                 "percentPrecision": 1,
//                 "export": {
//                   "enabled": true
//                 }
//             } );
//
// 		});
// 	}
//
//     function generateChart3(list) {
//         if (list && list.length > 0) {
//             $("#exportExcelChart3").show();
//         } else {
//             $("#exportExcelChart3").hide();
//             $("#rpChartDiv3").empty();
//             return;
//         }
//
//         function generateData() {
//             var chartData = [];
//             for (var i = 0; i < list.length; i++) {
//                 chartData.push({
//                     "pointName": list[i].pointName,
//                     "totalAmount": list[i].totalAmount
//                 });
//             }
//             return chartData;
//         }
//
//         AmCharts.makeChart("rpChartDiv3", {
//             "legend": {
//                 "align": "center",
//                 "valueText": "[[close]]",
//                 "markerSize": 10,
//                 "spacing": 20,
//                 "valueWidth": 0,
//                 "verticalGap": 5
//             },
//             "type": "pie",
//             "theme": "light", //Đổi màu
//             "dataProvider": generateData(),
//             "labelsEnabled": true,
//             "labelText": "[[percents]]%",
//             "balloonText" : "[[title]]:[[value]]",
//             "valueField": "totalAmount",
//             "titleField": "pointName",
//             //"labelRadius": -40,
//             "outlineAlpha": 0.4,
//             "percentPrecision": 1,
//             "export": {
//                 "enabled": true,
//                 processData: function(data, cfg) {
//                     if ((cfg.format === "XLSX") && !cfg.ignoreThatRequest) {
//                         vm.exportExcel(chartNameList.rpChartDiv3)
//                     }
//                 }
//             }
//         });
//     }
//
//     function generateChart4(list) {
//         if (!list || !list.length > 0 || !list[0].deploymentMap || list[0].deploymentMap.TRADEPLANDAY1 == null) {
//             $("#rpChartDiv4").empty();
//             return;
//         }
//         var data = list[0].deploymentMap;
//
//         function generateData() {
//             var chartData = [];
//
//             var group1 = {
//                 "groupName": "KPI 1 ngày",
//                 "tradePlan": data.TRADEPLANDAY1,
//                 "tradeReality": data.TRADEREALITYDAY1,
//                 "servicePlan": data.SERVICEPLANDAY1,
//                 "serviceReality": data.SERVICEREALITYDAY1
//             };
//             var group2 = {
//                 "groupName": "KPI 2 ngày",
//                 "tradePlan": data.TRADEPLANDAY2,
//                 "tradeReality": data.TRADEREALITYDAY2,
//                 "servicePlan": data.SERVICEPLANDAY2,
//                 "serviceReality": data.SERVICEREALITYDAY2
//             };
//             var group3 = {
//                 "groupName": "KPI 3 ngày",
//                 "tradePlan": data.TRADEPLANDAY3,
//                 "tradeReality": data.TRADEREALITYDAY3,
//                 "servicePlan": data.SERVICEPLANDAY3,
//                 "serviceReality": data.SERVICEREALITYDAY3
//             };
//
//             chartData.push(group1, group2, group3);
//             return chartData;
//         }
//
//         AmCharts.makeChart("rpChartDiv4", {
//             "legend": {
//                 "align": "center",
//                 "valueText": "[[close]]",
//                 "markerSize": 10,
//                 "spacing": 20,
//                 "valueWidth": 0,
//                 "verticalGap": 5
//             },
//             "type": "serial",
//             "theme": "light", //Đổi màu
//             "dataProvider": generateData(),
//             "startDuration": 1,
//             "graphs": [{
//                 "balloonText": "Target thương mại [[category]]: [[value]]",
//                 "type": "column",
//                 "valueField": "tradePlan",
//                 "fillAlphas": 1,
//                 "title": "Target thương mại",
//                 "labelPosition" : "top",
//                 "labelText":"[[value]]%"
//             }, {
//                 "balloonText": "Thực hiện thương mại [[category]]: [[value]]",
//                 "type": "column",
//                 "valueField": "tradeReality",
//                 "fillAlphas": 1,
//                 "title": "Thực hiện thương mại",
//                 "labelPosition" : "top",
//                 "labelText":"[[value]]%"
//             }, {
//                 "balloonText": "Target dịch vụ [[category]]: [[value]]",
//                 "type": "column",
//                 "valueField": "servicePlan",
//                 "fillAlphas": 1,
//                 "title": "Target dịch vụ",
//                 "labelPosition" : "top",
//                 "labelText":"[[value]]%"
//             }, {
//                 "balloonText": "Thực hiện dịch vụ [[category]]: [[value]]",
//                 "type": "column",
//                 "valueField": "serviceReality",
//                 "fillAlphas": 1,
//                 "title": "Thực hiện dịch vụ",
//                 "labelPosition" : "top",
//                 "labelText":"[[value]]%"
//             }],
//             "categoryField": "groupName",
//             "categoryAxis": {
//                 "gridPosition": "start",
//                 "fillAlpha": 0.05, //Độ đậm màu của cột nền
//                 "fillColor": "#000000", //Màu của cột nền
//                 "gridAlpha": 0,
//                 "position": "bottom" //Trục X nằm bên dưới
//             },
//             "export": {
//                 "enabled": true,
//                 processData: function(data, cfg) {
//                     if ((cfg.format === "XLSX") && !cfg.ignoreThatRequest) {
//                         var fieldList = [];
//                         fieldList.push({
//                             "field": cfg.dataFieldsMap.groupName,
//                             "title": "Nhóm"
//                         }, {
//                             "field": cfg.dataFieldsMap.tradePlan,
//                             "title": "Target thương mại"
//                         }, {
//                             "field": cfg.dataFieldsMap.tradeReality,
//                             "title": "Thực hiện thương mại"
//                         }, {
//                             "field": cfg.dataFieldsMap.servicePlan,
//                             "title": "Target dịch vụ"
//                         }, {
//                             "field": cfg.dataFieldsMap.serviceReality,
//                             "title": "Thực hiện dịch vụ"
//                         })
//                         directExport(data, fieldList, chartNameList.rpChartDiv4)
//                     }
//                 }
//             }
//         });
//     }
//
//     function generateChart5(list) {
//         if (list && list.length > 0) {
//             $("#exportExcelChart5").show();
//         } else {
//             $("#exportExcelChart5").hide();
//             $("#rpChartDiv5").empty();
//             return;
//         }
//
//         function generateData() {
//             var chartData = [];
//             for (var i = 0; i < list.length; i++) {
//                 chartData.push({
//                     "pointName": list[i].pointName,
//                     "totalAmount": list[i].totalAmount
//                 });
//             }
//             return chartData;
//         }
//
//         AmCharts.makeChart("rpChartDiv5", {
//             "legend": {
//                 "align": "center",
//                 "valueText": "[[close]]",
//                 "markerSize": 10,
//                 "spacing": 20,
//                 "valueWidth": 0,
//                 "verticalGap": 5
//             },
//             "type": "pie",
//             "theme": "light", //Đổi màu
//             "dataProvider": generateData(),
//             "labelsEnabled": true,
//             "labelText": "[[percents]]%",
//             "valueField": "totalAmount",
//             "balloonText" : "[[title]]:[[value]]",
//             "titleField": "pointName",
//             //"labelRadius": -40,
//             "outlineAlpha": 0.4,
//             "percentPrecision": 1,
//             "export": {
//                 "enabled": true,
//                 processData: function(data, cfg) {
//                     if ((cfg.format === "XLSX") && !cfg.ignoreThatRequest) {
//                         vm.exportExcel(chartNameList.rpChartDiv5)
//                     }
//                 }
//             }
//         });
//     }
//
//     function generateChart6(list) {
//         if (!list || !list.length > 0 || !list[0].customerReuseMap || list[0].customerReuseMap.AMOUNT1TIME == null) {
//             $("#rpChartDiv6").empty();
//             return;
//         }
//         var data = list[0].customerReuseMap;
//
//         function generateData() {
//             var chartData = [];
//             var amount1Time = {
//                 "pointName": "KH dùng 1 lần",
//                 "totalAmount": data.AMOUNT1TIME
//             }
//             var amount2Tines = {
//                 "pointName": "KH dùng 2 lần",
//                 "totalAmount": data.AMOUNT2TINES
//             }
//             var amount3Times = {
//                 "pointName": "KH dùng 3 lần",
//                 "totalAmount": data.AMOUNT3TIMES
//             }
//             var amountMore3Times = {
//                 "pointName": "KH dùng quá 3 lần",
//                 "totalAmount": data.AMOUNTMORE3TIMES
//             }
//
//             chartData.push(amount1Time, amount2Tines, amount3Times, amountMore3Times);
//             return chartData;
//         }
//
//         AmCharts.makeChart("rpChartDiv6", {
//             "legend": {
//                 "align": "center",
//                 "valueText": "[[close]]",
//                 "markerSize": 10,
//                 "spacing": 20,
//                 "valueWidth": 0,
//                 "verticalGap": 5
//             },
//             "type": "pie",
//             "theme": "light", //Đổi màu
//             "dataProvider": generateData(),
//             "showZeroSlices": true,
//             "labelsEnabled": true,
//             "labelText": "[[percents]]%",
//             "balloonText" : "[[title]]:[[value]]",
//             "valueField": "totalAmount",
//             "titleField": "pointName",
//             //"labelRadius": -40,
//             "outlineAlpha": 0.4,
//             "percentPrecision": 1,
//             "export": {
//                 "enabled": true,
//                 processData: function(data, cfg) {
//                     if ((cfg.format === "XLSX") && !cfg.ignoreThatRequest) {
//                         var fieldList = [];
//                         var rowData = [];
//                         var row = {};
//
//                         for (var i = 0; i < data.length; i++) {
//                             fieldList.push({
//                                 "field": data[i].pointName,
//                                 "title": data[i].pointName
//                             });
//                             row[data[i].pointName] = data[i].totalAmount;
//                         }
//
//                         rowData.push(row);
//                         directExport(rowData, fieldList, chartNameList.rpChartDiv6)
//                     }
//                 }
//             }
//         });
//     }
//
//     function generateChart7(list) {
//         if (list && list.length > 0) {
//             $("#exportExcelChart7").show();
//         } else {
//             $("#exportExcelChart7").hide();
//             $("#rpChartDiv7").empty();
//             return;
//         }
//
//         function generateData() {
//             var chartData = [];
//             for (var i = 0; i < 6; i++) {
//                 if (list[i].goodCityAmount && !list[i].badCityAmount) {
//                     chartData.push({
//                         "pointName": list[i].pointName.replace("TTKT.", ""),
//                         "goodValue": list[i].goodCityAmount,
//                         "totalTh": list[i].totalTh,
//                         "totalKh": list[i].totalKh
//                     });
//                 }
//                 if (!list[i].goodCityAmount) {
//                     // && list[i].badCityAmount) {
//                     chartData.push({
//                         "pointName": list[i].pointName.replace("TTKT.", ""),
//                         "badValue": list[i].badCityAmount,
//                         "totalTh": list[i].totalTh,
//                         "totalKh": list[i].totalKh
//                     });
//                 }
//             }
//             console.log(chartData)
//             return chartData;
//         }
//
//         AmCharts.makeChart("rpChartDiv7", {
//             "legend": {
//                 "align": "center",
//                 "valueText": "[[close]]",
//                 "markerSize": 10,
//                 "spacing": 20,
//                 "valueWidth": 0,
//                 "verticalGap": 5
//             },
//             "type": "serial",
//             "theme": "light", //Đổi màu
//             "dataProvider": generateData(),
//             "startDuration": 1,
//             "valueAxes": [{
//                 "stackType": "regular",
//                 "axisAlpha": 0.3,
//                 "gridAlpha": 0
//             }],
//             "graphs": [{
//                 // "balloonText": "Tỉnh tốt [[category]]: [[value]]",
//                 "type": "column",
//                 "valueField": "goodValue",
//                 "fillAlphas": 1,
//                 "lineAlpha": 0,
//                 "title": "Tỉnh tốt",
//                 "labelPosition" : "top",
//                 "labelText":"[[value]]%",
//                 "balloonFunction" : function (item) {
//                     var totalKh = kendo.format('{0:n0}', item.dataContext.totalKh);
//                     var totalTh = kendo.format('{0:n0}', item.dataContext.totalTh);
//                     var goodValue = kendo.format('{0:n2}%', item.dataContext.goodValue);
//                     return totalTh + "/" + totalKh + " = " + goodValue;
//                 }
//             }, {
//                 "balloonText": "Tỉnh xấu [[category]]: [[value]]",
//                 "type": "column",
//                 "valueField": "badValue",
//                 "fillAlphas": 1,
//                 "lineAlpha": 0,
//                 "title": "Tỉnh tồi",
//                 "labelPosition" : "top",
//                 "labelText":"[[value]]%",
//                 "fillColors": "#cc4748",
//                 "balloonFunction" : function (item) {
//                     var totalKh = kendo.format('{0:n0}', item.dataContext.totalKh);
//                     var totalTh = kendo.format('{0:n0}', item.dataContext.totalTh);
//                     var badValue = kendo.format('{0:n2}%', item.dataContext.badValue);
//                     return totalTh + "/" + totalKh + " = " + badValue;
//                 }
//             }],
//             "categoryField": "pointName",
//             "categoryAxis": {
//                 "gridPosition": "start",
//                 "fillAlpha": 0,
//                 // "fillColor": "#000000",
//                 "gridAlpha": 0,
//                 "position": "bottom"
//             },
//             "export": {
//                 "enabled": true,
//                 processData: function(data, cfg) {
//                     if ((cfg.format === "XLSX") && !cfg.ignoreThatRequest) {
//                         var fieldList = [];
//                         var rowData = [];
//                         var row = {};
//
//                         for (var i = 0; i < data.length; i++) {
//                             if (i < 3) {
//                                 row[data[i].pointName] = data[i].goodValue;
//                             } else {
//                                 row[data[i].pointName] = data[i].badValue;
//                             }
//
//                             fieldList.push({
//                                 "field": data[i].pointName,
//                                 "title": data[i].pointName
//                             });
//                         }
//
//                         rowData.push(row);
//                         directExport(rowData, fieldList, chartNameList.rpChartDiv7)
//                     }
//                 }
//             }
//         });
//     }
//
//     vm.exportExcel = function (chartName) {
//         vm.chartSearch.chartList = [chartName];
//         Restangular.all('reportAioService' + '/doSearchDataExport').post(vm.chartSearch).then(function (list) {
//             if (list && list.length > 0) {
//                 var rowDataList = [];
//                 var fieldList = [
//                     {
//                         "field": "code",
//                         "title": "Đơn vị",
//                         "attributes": {"style": "text-align:left;white-space:normal;"}
//                     }
//                 ];
//
//                 var totalRow = {
//                     code: "Tổng"
//                 };
//                 for (var i = 0; i < list.length; i++) {
//                     var code = list[i].code;
//                     var pointName = list[i].pointName;
//                     var totalAmount = list[i].totalAmount;
//
//                     var field = fieldList.find(function (item) {
//                         return item.field === pointName
//                     });
//                     if (!field) {
//                         var field = {};
//                         field.field = pointName;
//                         field.title = pointName;
//                         field.attributes = {"style": "text-align:right;white-space:normal;"};
//                         field.excelFormat ="#,###";
//                         fieldList.push(field);
//                     }
//
//                     var row = rowDataList.find(function (item) {
//                         return item.code === code
//                     });
//                     if (!row) {
//                         var row = {};
//                         row.code = list[i].code;
//                         row[pointName] = totalAmount;
//                         rowDataList.push(row);
//                     } else {
//                         row[pointName] = totalAmount;
//                     }
//                     if (!totalRow[pointName])
//                         totalRow[pointName] = 0;
//                     totalRow[pointName] += totalAmount;
//                 }
//                 rowDataList.push(totalRow);
//                 var fileName = "";
//                 switch (chartName) {
//                     case chartNameList.rpChartDiv3:
//                         fileName = "Doanh thu lũy kế theo ngành hàng ";
//                         break;
//                     case chartNameList.rpChartDiv5:
//                         fileName = "Tỷ trọng doanh thu dịch vụ ";
//                         break;
//                 }
//                 fileName = fileName + vm.chartSearch.month + "-" + vm.chartSearch.year;
//                 CommonService.exportFileNoGrid(rowDataList, fieldList, fileName);
//             }
//         });
//     };
//
//     function directExport(data, fieldList, chartName) {
//         if (data && data.length > 0) {
//             var dataExport = angular.copy(data);
//             for (var i = 0; i < fieldList.length; i++) {
//                 fieldList[i].attributes = {"style": "text-align:left;white-space:normal;"};
//             }
//
//             var fileName = "";
//             switch (chartName) {
//                 case chartNameList.rpChartDiv4:
//                     fileName = "Triển khai ";
//                     for (var i = 0; i < fieldList.length; i++) {
//                         if (i == 0) {
//                             fieldList[i].attributes = {"style": "text-align:left;white-space:normal;"};
//                         } else {
//                             fieldList[i].attributes = {"style": "text-align:right;white-space:normal;"};
//                             fieldList[i].excelFormat ="#,##0.00\\%";
//                         }
//                     }
//                     break;
//                 case chartNameList.rpChartDiv6:
//                     fileName = "Khách hàng sử dụng dịch vụ lặp ";
//                     dataExport.forEach(function (item) {
//                         var total = 0;
//                         for (var key in item) {
//                             if (item.hasOwnProperty(key)) {
//                                 total += item[key];
//                             }
//                         }
//                         item.total = total;
//                     });
//                     for (var i = 0; i < fieldList.length; i++) {
//                         fieldList[i].attributes = {"style": "text-align:right;white-space:normal;"};
//                         fieldList[i].excelFormat ="#,###";
//                     }
//                     fieldList.push({
//                         field: "total",
//                         title: "Tổng KH",
//                         attributes : {"style": "text-align:right;white-space:normal;"},
//                         excelFormat :"#,##0"
//                     });
//                     break;
//                 case chartNameList.rpChartDiv7:
//                     for (var i = 0; i < fieldList.length; i++) {
//                         if (i == 0) {
//                             fieldList[i].attributes = {"style": "text-align:left;white-space:normal;"};
//                         } else {
//                             fieldList[i].attributes = {"style": "text-align:right;white-space:normal;"};
//                             fieldList[i].excelFormat ="#,##0.00\\%";
//                         }
//                     }
//                     fileName = "3 tỉnh tốt 3 tỉnh tồi doanh thu ";
//                     break;
//             }
//             fileName = fileName + vm.chartSearch.month + "-" + vm.chartSearch.year;
//             CommonService.exportFileNoGrid(dataExport, fieldList, fileName);
//         }
//     }
//
//     vm.openDepartmentTo = openDepartmentTo
//     function openDepartmentTo(popUp) {
//         vm.obj = {};
//         vm.departmentpopUp = popUp;
//         var templateUrl = 'coms/popup/findDepartmentPopUp.html';
//         var title = gettextCatalog.getString("Tìm kiếm đơn vị");
//         CommonService.populatePopupDept(templateUrl, title, null, null, vm, popUp, 'string', false, '92%', '89%');
//     }
//
//     vm.onSave = onSave;
//     function onSave(data) {
//         if (vm.departmentpopUp === 'dept') {
//             vm.chartSearch.sysGroupName = data.text;
//             vm.chartSearch.sysGroupId = data.id;
//         }
//     }
//
//     // clear data
//     vm.changeDataAuto = changeDataAuto
//     function changeDataAuto(id) {
//         switch (id) {
//             case 'dept':
//             {
//                 if (processSearch(id, vm.selectedDept1)) {
//                     vm.chartSearch.sysGroupId = null;
//                     vm.chartSearch.sysGroupName = null;
//                     vm.selectedDept1 = false;
//                 }
//                 break;
//             }
//         }
//     }
//
//     vm.cancelInput = function (param) {
//         if (param == 'dept') {
//             vm.chartSearch.sysGroupId = null;
//             vm.chartSearch.sysGroupName = null;
//         }
//         if (param == 'month') {
//             // vm.chartSearch.monthYear = null;
//             initMonthYear();
//         }
//         if (param == 'year') {
//             vm.chartSearch.year = null;
//         }
//     }
//
//     vm.selectedDept1 = false;
//     vm.deprtOptions1 = {
//         dataTextField: "sysGroupName",
//         dataValueField: "sysGroupId",
//     	placeholder:"Nhập mã hoặc tên đơn vị",
//         select: function (e) {
//             vm.selectedDept1 = true;
//             var data = this.dataItem(e.item.index());
//             vm.chartSearch.sysGroupName = data.sysGroupName;
//             vm.chartSearch.sysGroupId = data.sysGroupId;
//         },
//         pageSize: 10,
//         open: function (e) {
//             vm.selectedDept1 = false;
//         },
//         dataSource: {
//             serverFiltering: true,
//             transport: {
//                 read: function (options) {
//                     vm.selectedDept1 = false;
//                     return Restangular.all("aioMonthPlanService/" + 'getAutoCompleteSysGroupLevel').post({
//                     	sysGroupName: vm.chartSearch.sysGroupName,
//                         pageSize: vm.deprtOptions1.pageSize
//                     }).then(function (response) {
//                         options.success(response);
//                     }).catch(function (err) {
//                         console.log('Không thể kết nối để lấy dữ liệu: ' + err.message);
//                     });
//                 }
//             }
//         },
//         template: '<div class="row" ><div class="col-xs-5" style="float:left">#: data.sysGroupCode #</div><div  style="padding-left: 5px;width:auto;overflow: hidden"> #: data.sysGroupName #</div> </div>',
//         change: function (e) {
//             if (e.sender.value() === '') {
//                 vm.chartSearch.sysGroupName = null;// thành name
//                 vm.chartSearch.sysGroupId = null;
//             }
//         },
//         ignoreCase: false
//     }
//
//     vm.cancelListYear= cancelListYear;
//     function cancelListYear(){
//     	vm.chartSearch.dateTo = null;
//     	vm.chartSearch.dateFrom = null;
//     }
//   //tatph-start 13/12/2019
//     function generateChartThreeGroupsChart(list) {
//         if (list && list.length > 0) {
// //            $("#exportExcelChart7").show();
//         } else {
// //            $("#exportExcelChart7").hide();
//             $("#rpChartDiv3cumDoanhThu").empty();
//             return;
//         }
//
//         function generateData3groups() {
//             var chartData = [];
//             for (var i = 0; i < 6; i++) {
//                 if (list[i].goodCityAmount && !list[i].badCityAmount) {
//                     chartData.push({
//                         "pointName": list[i].pointName,
//                         "goodValue": list[i].goodCityAmount,
//                         "totalTh": list[i].totalTh,
//                         "totalKh": list[i].totalKh
//                     });
//                 }
//                 if (!list[i].goodCityAmount) {
//                     // && list[i].badCityAmount) {
//                     chartData.push({
//                         "pointName": list[i].pointName,
//                         "badValue": list[i].badCityAmount,
//                         "totalTh": list[i].totalTh,
//                         "totalKh": list[i].totalKh
//                     });
//                 }
//             }
//             console.log(chartData)
//             return chartData;
//         }
//
//         AmCharts.makeChart("rpChartDiv3cumDoanhThu", {
//             "legend": {
//                 "align": "center",
//                 "valueText": "[[close]]",
//                 "markerSize": 10,
//                 "spacing": 20,
//                 "valueWidth": 0,
//                 "verticalGap": 5
//             },
//             "type": "serial",
//             "theme": "light", //Đổi màu
//             "dataProvider": generateData3groups(),
//             "startDuration": 1,
//             "valueAxes": [{
//                 "stackType": "regular",
//                 "axisAlpha": 0.3,
//                 "gridAlpha": 0
//             }],
//             "graphs": [{
//                 // "balloonText": "Tỉnh tốt [[category]]: [[value]]",
//                 "type": "column",
//                 "valueField": "goodValue",
//                 "fillAlphas": 1,
//                 "lineAlpha": 0,
//                 "title": "Tỉnh tốt",
//                 "labelPosition" : "top",
//                 "labelText":"[[value]]%",
//                 "balloonFunction" : function (item) {
//                     var totalKh = kendo.format('{0:n0}', item.dataContext.totalKh);
//                     var totalTh = kendo.format('{0:n0}', item.dataContext.totalTh);
//                     var goodValue = kendo.format('{0:n2}%', item.dataContext.goodValue);
//                     return totalTh + "/" + totalKh + " = " + goodValue;
//                 }
//             }, {
//                 "balloonText": "Tỉnh xấu [[category]]: [[value]]",
//                 "type": "column",
//                 "valueField": "badValue",
//                 "fillAlphas": 1,
//                 "lineAlpha": 0,
//                 "title": "Tỉnh tồi",
//                 "labelPosition" : "top",
//                 "labelText":"[[value]]%",
//                 "fillColors": "#cc4748",
//                 "balloonFunction" : function (item) {
//                     var totalKh = kendo.format('{0:n0}', item.dataContext.totalKh);
//                     var totalTh = kendo.format('{0:n0}', item.dataContext.totalTh);
//                     var badValue = kendo.format('{0:n2}%', item.dataContext.badValue);
//                     return totalTh + "/" + totalKh + " = " + badValue;
//                 }
//             }],
//             "categoryField": "pointName",
//             "categoryAxis": {
//                 "gridPosition": "start",
//                 "fillAlpha": 0,
//                 "labelRotation": 45, //Độ nghiêng phần tử trục X
//                 "gridAlpha": 0,
//                 "position": "bottom"
//             },
//             "export": {
//                 "enabled": true,
//                 processData: function(data, cfg) {
//                     if ((cfg.format === "XLSX") && !cfg.ignoreThatRequest) {
//                         var fieldList = [];
//                         var rowData = [];
//                         var row = {};
//
//                         for (var i = 0; i < data.length; i++) {
//                             if (i < 3) {
//                                 row[data[i].pointName] = data[i].goodValue;
//                             } else {
//                                 row[data[i].pointName] = data[i].badValue;
//                             }
//
//                             fieldList.push({
//                                 "field": data[i].pointName,
//                                 "title": data[i].pointName
//                             });
//                         }
//
//                         rowData.push(row);
//                         directExport(rowData, fieldList, chartNameList.rpChartDiv3cumDoanhThu)
//                     }
//                 }
//             }
//         });
//     }
//
// 	function chartColumn3GroupsFail(){
// 		Restangular.all("aioMonthPlanService/" + 'doSearchChartColumnFailGroup').post(vm.chartSearch).then(function (response) {
// 			var list = response.plain();
// 			 if (list && list.length > 0) {
// //	            $("#exportExcelChart7").show();
// 	        } else {
// //	            $("#exportExcelChart7").hide();
// 	            $("#rpChartDiv3cumTrienKhai").empty();
// 	            return;
// 	        }
// 			function generateChartColumnData(){
// 		        var chartData =[];
// 		        for(var i =0; i < 9; i++){
// 		        	 chartData.push({
// 		        		 	"sysGroupName": list[i].sysGroupName,
// 			                "thucHien1Ngay": list[i].thucHien1Ngay,
// 			                "thucHien2Ngay": list[i].thucHien2Ngay,
// 			                "thucHien3Ngay": list[i].thucHien3Ngay
// 		        	 });
// 		        }
// 		        return chartData;
// 		    }
//
// 			AmCharts.makeChart("rpChartDiv3cumTrienKhai", {
// 	            "legend": {
// 	                "align": "center",
// 	                "valueText": "[[close]]",
// 	                "markerSize": 10,
// 	                "spacing": 20,
// 	                "valueWidth": 0,
// 	                "verticalGap": 5
// 	            },
// 	            "type": "serial",
// 	            "theme": "dark", //Đổi màu
// 	            "dataProvider": generateChartColumnData(),
// 	            "startDuration": 1,
// 	            "valueAxes": [{
// 	                "stackType": "regular",
// 	                "axisAlpha": 0.3,
// 	                "gridAlpha": 0
// 	            }],
// 	            "graphs": [{
// 	                "balloonText": "KPI 1 ngày [[category]]: [[value]]",
// 	                "type": "column",
// 	                "valueField": "thucHien1Ngay",
// 	                "fillAlphas": 1,
// 	                "lineAlpha": 0,
// 	                "title": "KPI 1 ngày",
//                     "fillColors": "orange",
//                     "labelPosition" : "top",
//                     "labelText":"[[value]]%"
// 	            }, {
// 	                "balloonText": "KPI 2 ngày [[category]]: [[value]]",
// 	                "type": "column",
// 	                "valueField": "thucHien2Ngay",
// 	                "fillAlphas": 1,
// 	                "lineAlpha": 0,
// 	                "title": "KPI 2 ngày",
//                     "fillColors": "brown",
//                     "labelPosition" : "top",
//                     "labelText":"[[value]]%"
// 	            },{
// 	                "balloonText": "KPI 3 ngày [[category]]: [[value]]",
// 	                "type": "column",
// 	                "valueField": "thucHien3Ngay",
// 	                "fillAlphas": 1,
// 	                "lineAlpha": 0,
// 	                "title": "KPI 3 ngày",
//                     "fillColors": "red",
//                     "labelPosition" : "top",
//                     "labelText":"[[value]]%"
// 	            }
// 	            ],
// 	            "categoryField": "sysGroupName",
// 	            "categoryAxis": {
// 	                "gridPosition": "start",
// 	                "fillAlpha": 0,
// 	                // "fillColor": "#000000",
// 	                "gridAlpha": 0,
// 	                "position": "bottom",
// 	                "labelRotation": 45
// 	            },
// 	            "export": {
// 	                "enabled": true,
// 	                processData: function(data, cfg) {
// 	                    if ((cfg.format === "XLSX") && !cfg.ignoreThatRequest) {
// 	                        var fieldList = [];
// 	                        var rowData = [];
// 	                        var row = {};
//
// 	                        for (var i = 0; i < data.length; i++) {
// 	                            var field = data[i].sysGroupName + i;
// 	                            if (i < 3) {
// 	                                row[field] = data[i].thucHien1Ngay;
// 	                            } else if(i >= 3 && i<6){
// 	                                row[field] = data[i].thucHien2Ngay;
// 	                            } else {
// 	                            	row[field] = data[i].thucHien3Ngay;
// 	                            }
//
// 	                            fieldList.push({
// 	                                "field": field,
// 	                                "title": data[i].sysGroupName
// 	                            });
// 	                        }
//
// 	                        rowData.push(row);
// 	                        directExport(rowData, fieldList, chartNameList.chartdiv3groups)
// 	                    }
// 	                }
// 	            }
// 	        });
// 		});
// 	}
//     //tatph-end 13/12/2019


});

})();
