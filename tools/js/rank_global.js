var app = angular.module('myApp', []);

app.controller('Analytics', ['$scope', '$http', function($scope, $http) {

	$scope.go = function() {
  	var access_token = $scope.access_token;
	var country = document.getElementById("country").value;
	var start_date = document.getElementById("fecha_in").value;
	var end_date = document.getElementById("fecha_out").value;

	//MC Camac
	if(!start_date && !end_date){
		start_date = '2016-07-01'; //AÑO-MES-DÍA
		var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth()+1; //January is 0!
		var yyyy = today.getFullYear();

		if(dd<10) {
    		dd = '0' + dd
		} 

		if(mm<10) {
    		mm = '0' + mm
		}
		end_date = yyyy+'-'+mm+'-'+dd; //HOY
	}

	spinner_up();

	//https://gis-api.aiesec.org/v1/offices/"+req_entity+".json
	var options = {
		uri_base: 'https://gis-api.aiesec.org/v1/',
		uri_point: 'offices/' + country +  '.json?access_token='
	};


	//Global Variables
	var mcs = [];
	var rankMcs = [];
	var rankMcs20 = [];
	var rankGCDP = [];
	var rankOGIP = [];
	var rankGIP = [];

	//List of MCS
	//URL: https://gis-api.aiesec.org/v2/lists/mcs.json?access_token=TOKEN
	$http.get(options.uri_base + options.uri_point + access_token).
		success(
			function (data) {
				for (var i = 0; i <= data.suboffices.length - 1; i++){
					mcs.push({
						"id": data.suboffices[i].id, 
						"name": data.suboffices[i].name
					});
				}

				ranking_ogcdp(mcs);
			}).
		error(
			function (error) {
				console.log(error);
			}
		);

	//oGCDP
	function ranking_ogcdp (mcs) {
		if (mcs !== null){
			for (var j = 0; j <= mcs.length - 1; j++) {
				options_rank_ogcdp = {
					uri: 
					'https://gis-api.aiesec.org/v2/applications/analyze.json?'
					+ 'access_token=' + access_token 
					+ '&basic%5Bhome_office_id%5D=' + mcs[j].id 
					+ '&programmes%5B%5D=1' //GCDP
					+ '&basic%5Btype%5D=person' //oGCDP
					+ '&start_date=' + start_date
					+ '&end_date=' + end_date 
				};

				ranking_ogcdp_rank(options_rank_ogcdp, mcs[j].id, mcs[j].name, j, mcs.length - 1);
			}
		}
	}

	function ranking_ogcdp_rank (options, id, name, j, len) {
		$http.get(options.uri).
		success(
			function (data) {			
				rankMcs.push({
					"id": id,
					"name": name, 
					"re": data.analytics.total_realized.doc_count, //6
					"app_app": data.analytics.total_applications.applicants.value, //1
					"app_apps": data.analytics.total_applications.doc_count, //2
					"ma_app": data.analytics.total_an_accepted.unique_profiles.value, //3
					"ma_apps": data.analytics.total_matched.doc_count, //4
					"appro": data.analytics.total_approvals.doc_count, //5
					"comp": data.analytics.total_completed.doc_count //7
				});

				if(j == len) {					
					ranking_igcdp(rankMcs);
				};	
			}).
		error(
			function (error) {
				console.log(error);
			}
		);
	}

	//iGCDP
	function ranking_igcdp (ogcdp) {
		if (ogcdp !== null){
			for (var j = 0; j <= ogcdp.length - 1; j++) {
				options_rank_igcdp = {
					uri: 
					'https://gis-api.aiesec.org/v2/applications/analyze.json?'
					+ 'access_token=' + access_token 
					+ '&basic%5Bhome_office_id%5D=' + ogcdp[j].id 
					+ '&programmes%5B%5D=1' //GCDP
					+ '&basic%5Btype%5D=opportunity' //igcdp
					+ '&start_date=' + start_date
					+ '&end_date=' + end_date 
				};

				ranking_igcdp_rank(options_rank_igcdp, ogcdp[j].id, ogcdp[j].name, ogcdp[j], j, ogcdp.length - 1);
			}
		}
	}

	function ranking_igcdp_rank (options, id, name, ogcdp, j, len) {
		$http.get(options.uri).
		success(
			function (data) {
				rankGCDP.push({
					"id": id, 
					"name": name, 
					"ogv_re": ogcdp.re,
					"ogv_app_app": ogcdp.app_app,
					"ogv_app_apps": ogcdp.app_apps,
					"ogv_ma_app": ogcdp.ma_app,
					"ogv_ma_apps": ogcdp.ma_app,
					"ogv_appro": ogcdp.appro,
					"ogv_comp": ogcdp.comp,

					"igv_re": data.analytics.total_realized.doc_count,
					"igv_app_app": data.analytics.total_applications.applicants.value,
					"igv_app_apps": data.analytics.total_applications.doc_count,
					"igv_ma_app": data.analytics.total_an_accepted.unique_profiles.value,
					"igv_ma_apps": data.analytics.total_matched.doc_count,
					"igv_appro": data.analytics.total_approvals.doc_count,
					"igv_comp": data.analytics.total_completed.doc_count,

					"re": ogcdp.re + data.analytics.total_realized.doc_count, //6
					"app_app": ogcdp.app_app + data.analytics.total_applications.applicants.value, //1
					"app_apps": ogcdp.app_apps + data.analytics.total_applications.doc_count, //2
					"ma_app": ogcdp.ma_app + data.analytics.total_an_accepted.unique_profiles.value, //3
					"ma_apps": ogcdp.ma_apps + data.analytics.total_matched.doc_count, //4
					"appro": ogcdp.appro + data.analytics.total_approvals.doc_count, //5
					"comp": ogcdp.comp + data.analytics.total_completed.doc_count //7
				});

				if(j == len) {					
					ranking_ogip(rankGCDP);
				};	
			}).
		error(
			function (error) {
				console.log(error);
			}
		);
	}

	//oGIP
	function ranking_ogip (gcdp) {
		console.log('aqui - ogip');
		if (gcdp !== null){
			for (var j = 0; j <= gcdp.length - 1; j++) {
				options_rank_ogip = {
					uri: 
					'https://gis-api.aiesec.org/v2/applications/analyze.json?'
					+ 'access_token=' + access_token 
					+ '&basic%5Bhome_office_id%5D=' + gcdp[j].id 
					+ '&programmes%5B%5D=2' //GCDP
					+ '&basic%5Btype%5D=person' //ogip
					+ '&start_date=' + start_date
					+ '&end_date=' + end_date 
				};

				ranking_ogip_rank(options_rank_ogip, gcdp[j].id, gcdp[j].name, gcdp[j], j, gcdp.length - 1);
			}
		}
	}

	function ranking_ogip_rank (options, id, name, gcdp, j, len) {
		console.log('aqui oGIP RANK');
		$http.get(options.uri).
		success(
			function (data) {			
				rankOGIP.push({
					"id": id, 
					"name": name, 

					"ogv_re": gcdp.ogv_re,
					"ogv_app_app": gcdp.ogv_app_app,
					"ogv_app_apps": gcdp.ogv_app_apps,
					"ogv_ma_app": gcdp.ogv_ma_app,
					"ogv_ma_apps": gcdp.ogv_ma_app,
					"ogv_appro": gcdp.ogv_appro,
					"ogv_comp": gcdp.ogv_comp,

					"igv_re": gcdp.igv_re,
					"igv_app_app": gcdp.igv_app_app,
					"igv_app_apps": gcdp.igv_app_apps,
					"igv_ma_app": gcdp.igv_ma_app,
					"igv_ma_apps": gcdp.igv_ma_app,
					"igv_appro": gcdp.igv_appro,
					"igv_comp": gcdp.igv_comp,

					"ogt_re": data.analytics.total_realized.doc_count, //6
					"ogt_app_app": data.analytics.total_applications.applicants.value, //1
					"ogt_app_apps": data.analytics.total_applications.doc_count, //2
					"ogt_ma_app": data.analytics.total_an_accepted.unique_profiles.value, //3
					"ogt_ma_apps": data.analytics.total_matched.doc_count, //4
					"ogt_appro": data.analytics.total_approvals.doc_count, //5
					"ogt_comp": data.analytics.total_completed.doc_count, //7

					"re": gcdp.re + data.analytics.total_realized.doc_count, //6
					"app_app": gcdp.app_app + data.analytics.total_applications.applicants.value, //1
					"app_apps": gcdp.app_apps + data.analytics.total_applications.doc_count, //2
					"ma_app": gcdp.ma_app + data.analytics.total_an_accepted.unique_profiles.value, //3
					"ma_apps": gcdp.ma_apps + data.analytics.total_matched.doc_count, //4
					"appro": gcdp.appro + data.analytics.total_approvals.doc_count, //5
					"comp": gcdp.comp + data.analytics.total_completed.doc_count //7
				});

				if(j == len) {
					ranking_igip(rankOGIP);
				};	
			}).
		error(
			function (error) {
				console.log(error);
			}
		);
	}

	//iGIP
	function ranking_igip (ogip) {
		console.log("aqui gip");
		if (ogip !== null){
			for (var j = 0; j <= ogip.length - 1; j++) {
				options_rank_ogip = {
					uri: 
					'https://gis-api.aiesec.org/v2/applications/analyze.json?'
					+ 'access_token=' + access_token 
					+ '&basic%5Bhome_office_id%5D=' + ogip[j].id 
					+ '&programmes%5B%5D=2' //GIP
					+ '&basic%5Btype%5D=opportunity' //igip
					+ '&start_date=' + start_date
					+ '&end_date=' + end_date 
				};

				ranking_igip_rank(options_rank_ogip, ogip[j].id, ogip[j].name, ogip[j], j, ogip.length - 1);
			}
		}
	}

	function ranking_igip_rank (options, id, name, ogip, j, len) {
		$http.get(options.uri).
		success(
			function (data) {			
				rankGIP.push({
					"id": id, 
					"name": name, 
					
					"ogv_re": ogip.ogv_re,
					"ogv_app_app": ogip.ogv_app_app,
					"ogv_app_apps": ogip.ogv_app_apps,
					"ogv_ma_app": ogip.ogv_ma_app,
					"ogv_ma_apps": ogip.ogv_ma_app,
					"ogv_appro": ogip.ogv_appro,
					"ogv_comp": ogip.ogv_comp,

					"igv_re": ogip.igv_re,
					"igv_app_app": ogip.igv_app_app,
					"igv_app_apps": ogip.igv_app_apps,
					"igv_ma_app": ogip.igv_ma_app,
					"igv_ma_apps": ogip.igv_ma_app,
					"igv_appro": ogip.igv_appro,
					"igv_comp": ogip.igv_comp,

					"ogt_re": ogip.ogt_re,
					"ogt_app_app": ogip.ogt_app_app,
					"ogt_app_apps": ogip.ogt_app_apps,
					"ogt_ma_app": ogip.ogt_ma_app,
					"ogt_ma_apps": ogip.ogt_ma_app,
					"ogt_appro": ogip.ogt_appro,
					"ogt_comp": ogip.ogt_comp,

					"igt_re": data.analytics.total_realized.doc_count, //6
					"igt_app_app": data.analytics.total_applications.applicants.value, //1
					"igt_app_apps": data.analytics.total_applications.doc_count, //2
					"igt_ma_app": data.analytics.total_an_accepted.unique_profiles.value, //3
					"igt_ma_apps": data.analytics.total_matched.doc_count, //4
					"igt_appro": data.analytics.total_approvals.doc_count, //5
					"igt_comp": data.analytics.total_completed.doc_count, //7

					"re": ogip.re + data.analytics.total_realized.doc_count, //6
					"app_app": ogip.app_app + data.analytics.total_applications.applicants.value, //1
					"app_apps": ogip.app_apps + data.analytics.total_applications.doc_count, //2
					"ma_app": ogip.ma_app + data.analytics.total_an_accepted.unique_profiles.value, //3
					"ma_apps": ogip.ma_apps + data.analytics.total_matched.doc_count, //4
					"appro": ogip.appro + data.analytics.total_approvals.doc_count, //5
					"comp": ogip.comp + data.analytics.total_completed.doc_count //7

				});
				console.log('test');
				if(j == len) {
					rankGIP.sort(function(a, b) {
						return parseFloat(b.re) - parseFloat(a.re);
					});

					//RANK 20
					/*
					for (var i = 0; i < 20; i++) {			
						rankMcs20.push({
							"id":   rankGIP[i].id,
							"name": rankGIP[i].name,
							"apps":   rankGIP[i].apps,
							"app_app": rankGIP[i].app_app, //1
							"app_apps": rankGIP[i].app_apps, //2
							"ma_app": rankGIP[i].ma_app, //3
							"ma_apps": rankGIP[i].ma_apps, //4
							"appro": rankGIP[i].appro, //5
							"comp": rankGIP[i].comp //7
						});
					};*/
					

					$scope.mcs20 = rankGIP;
					console.log(rankGIP);
					rank(rankGIP);
					spinner();
				};	
			}).
		error(
			function (error) {
				console.log(error);
			}
		);
	}


	function spinner () {
		$('#status').fadeOut(); // will first fade out the loading animation
		$('#preloader').delay(300).fadeOut('slow'); // will fade out the white DIV that covers the website.
		$('body').delay(300).css({'overflow':'visible'});
	}

	function spinner_up () {
		$('#status').fadeIn(); // will first fade out the loading animation
		$('#preloader').delay(300).fadeIn('slow'); // will fade out the white DIV that covers the website.
		$('body').delay(300).css({'overflow':'hidden'});
	}

	function rank (ranking) {
	    // Create the chart
	    $('#container').highcharts({
	        chart: {
	            type: 'bar'
	        },
	        title: {
	            text: 'AIESEC<br>' + 'Fechas: ' + start_date + ' - ' + end_date
	        },
	        subtitle: {
	            text: 'Click en las barras para obtener más información.'
	        },
	        xAxis: {
	            type: 'category'
	        },
	        yAxis: {
	            title: {
	                text: 'Total'
	            }

	        },
	        legend: {
	            enabled: false
	        },
	        plotOptions: {
	            series: {
	                borderWidth: 0,
	                dataLabels: {
	                    enabled: true,
	                    format: '{point.y:,.0f}'
	                }
	            }
	        },

	        tooltip: {
	            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
	            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:,.0f}</b> del total<br/>'
	        },

	        series: [{
	            name: 'Total',
	            colorByPoint: true,
	            //Enrique
	            data:
	            [{
	                name: '1. ' + ranking[0].name,
	                y: ranking[0].re,
	                drilldown: ranking[0].name
	            }, {
	                name: '2. ' + ranking[1].name,
	                y: ranking[1].re,
	                drilldown: ranking[1].name
	            }, {
	                name: '3. ' + ranking[2].name,
	                y: ranking[2].re,
	                drilldown: ranking[2].name
	            },{
	                name: '4. ' + ranking[3].name,
	                y: ranking[3].re,
	                drilldown: ranking[3].name
	            },{
	                name: '5. ' + ranking[4].name,
	                y: ranking[4].re,
	                drilldown: ranking[4].name
	            },{
	                name: '6. ' + ranking[5].name,
	                y: ranking[5].re,
	                drilldown: ranking[5].name
	            },{
	                name: '7. ' + ranking[6].name,
	                y: ranking[6].re,
	                drilldown: ranking[6].name
	            },{
	                name: '8. ' + ranking[7].name,
	                y: ranking[7].re,
	                drilldown: ranking[7].name
	            },{
	                name: '9. ' + ranking[8].name,
	                y: ranking[8].re,
	                drilldown: ranking[8].name
	            },{
	                name: '10. ' + ranking[9].name,
	                y: ranking[9].re,
	                drilldown: ranking[9].name
	            }/*,{
	                name: '11. ' + ranking[10].name,
	                y: ranking[10].re,
	                drilldown: ranking[10].name
	            },{
	                name: '12. ' + ranking[11].name,
	                y: ranking[11].re,
	                drilldown: ranking[11].name
	            },{
	                name: '13. ' + ranking[12].name,
	                y: ranking[12].re,
	                drilldown: ranking[12].name
	            },{
	                name: '14. ' + ranking[13].name,
	                y: ranking[13].re,
	                drilldown: ranking[13].name
	            },{
	                name: '15. ' + ranking[14].name,
	                y: ranking[14].re,
	                drilldown: ranking[14].name
	            },{
	                name: '16. ' + ranking[15].name,
	                y: ranking[15].re,
	                drilldown: ranking[15].name
	            },{
	                name: '17. ' + ranking[16].name,
	                y: ranking[16].re,
	                drilldown: ranking[16].name
	            },{
	                name: '18. ' + ranking[17].name,
	                y: ranking[17].re,
	                drilldown: ranking[17].name
	            },{
	                name: '19. ' + ranking[18].name,
	                y: ranking[18].re,
	                drilldown: ranking[18].name
	            },{
	                name: '20. ' + ranking[19].name,
	                y: ranking[19].re,
	                drilldown: ranking[19].name
	            }*/]
	        }],
	        drilldown: {
	            series:
	            [
	            {
	                name: ranking[0].name,
	                id: ranking[0].name,
	                //Enrique
	                data: 
	                [
	                    [
	                        'app/Applicants',
	                        ranking[0].app_app
	                    ],
	                    [
	                        'app/Applications',
	                        ranking[0].app_apps
	                    ],
	                    [
	                        'MA/Applicants',
	                        ranking[0].ma_app
	                    ],
	                    [
	                        'MA/Applications',
	                        ranking[0].ma_apps
	                    ],
	                    [
	                        'Approved',
	                        ranking[0].appro
	                    ],
	                    [
	                        'Completed',
	                        ranking[0].comp
	                    ]
	                ]
	            },
	            {
	                name: ranking[1].name,
	                id: ranking[1].name,
	                data: [
	                    [
	                        'app/Applicants',
	                        ranking[1].app_app
	                    ],
	                    [
	                        'app/Applications',
	                        ranking[1].app_apps
	                    ],
	                    [
	                        'MA/Applicants',
	                        ranking[1].ma_app
	                    ],
	                    [
	                        'MA/Applications',
	                        ranking[1].ma_apps
	                    ],
	                    [
	                        'Approved',
	                        ranking[1].appro
	                    ],
	                    [
	                        'Completed',
	                        ranking[1].comp
	                    ]
	                ]
	            },
	            {
	                name: ranking[2].name,
	                id: ranking[2].name,
	                data: [
	                    [
	                        'app/Applicants',
	                        ranking[2].app_app
	                    ],
	                    [
	                        'app/Applications',
	                        ranking[2].app_apps
	                    ],
	                    [
	                        'MA/Applicants',
	                        ranking[2].ma_app
	                    ],
	                    [
	                        'MA/Applications',
	                        ranking[2].ma_apps
	                    ],
	                    [
	                        'Approved',
	                        ranking[2].appro
	                    ],
	                    [
	                        'Completed',
	                        ranking[2].comp
	                    ]
	                ]
	            },
	            {
	                name: ranking[3].name,
	                id: ranking[3].name,
	                data: [
	                    [
	                        'app/Applicants',
	                        ranking[3].app_app
	                    ],
	                    [
	                        'app/Applications',
	                        ranking[3].app_apps
	                    ],
	                    [
	                        'MA/Applicants',
	                        ranking[3].ma_app
	                    ],
	                    [
	                        'MA/Applications',
	                        ranking[3].ma_apps
	                    ],
	                    [
	                        'Approved',
	                        ranking[3].appro
	                    ],
	                    [
	                        'Completed',
	                        ranking[3].comp
	                    ]
	                ]
	            },
	            {
	                name: ranking[4].name,
	                id: ranking[4].name,
	                data: [
	                    [
	                        'app/Applicants',
	                        ranking[4].app_app
	                    ],
	                    [
	                        'app/Applications',
	                        ranking[4].app_apps
	                    ],
	                    [
	                        'MA/Applicants',
	                        ranking[4].ma_app
	                    ],
	                    [
	                        'MA/Applications',
	                        ranking[4].ma_apps
	                    ],
	                    [
	                        'Approved',
	                        ranking[4].appro
	                    ],
	                    [
	                        'Completed',
	                        ranking[4].comp
	                    ]
	                ]
	            },
	            {
	                name: ranking[5].name,
	                id: ranking[5].name,
	                data: [
	                    [
	                        'app/Applicants',
	                        ranking[5].app_app
	                    ],
	                    [
	                        'app/Applications',
	                        ranking[5].app_apps
	                    ],
	                    [
	                        'MA/Applicants',
	                        ranking[5].ma_app
	                    ],
	                    [
	                        'MA/Applications',
	                        ranking[5].ma_apps
	                    ],
	                    [
	                        'Approved',
	                        ranking[5].appro
	                    ],
	                    [
	                        'Completed',
	                        ranking[5].comp
	                    ]
	                ]
	            },
	            {
	                name: ranking[6].name,
	                id: ranking[6].name,
	                data: [
	                    [
	                        'app/Applicants',
	                        ranking[6].app_app
	                    ],
	                    [
	                        'app/Applications',
	                        ranking[6].app_apps
	                    ],
	                    [
	                        'MA/Applicants',
	                        ranking[6].ma_app
	                    ],
	                    [
	                        'MA/Applications',
	                        ranking[6].ma_apps
	                    ],
	                    [
	                        'Approved',
	                        ranking[6].appro
	                    ],
	                    [
	                        'Completed',
	                        ranking[6].comp
	                    ]
	                ]
	            },
	            {
	                name: ranking[7].name,
	                id: ranking[7].name,
	                data: [
	                    [
	                        'app/Applicants',
	                        ranking[7].app_app
	                    ],
	                    [
	                        'app/Applications',
	                        ranking[7].app_apps
	                    ],
	                    [
	                        'MA/Applicants',
	                        ranking[7].ma_app
	                    ],
	                    [
	                        'MA/Applications',
	                        ranking[7].ma_apps
	                    ],
	                    [
	                        'Approved',
	                        ranking[7].appro
	                    ],
	                    [
	                        'Completed',
	                        ranking[7].comp
	                    ]
	                ]
	            },
	            {
	                name: ranking[8].name,
	                id: ranking[8].name,
	                data: [
	                    [
	                        'app/Applicants',
	                        ranking[8].app_app
	                    ],
	                    [
	                        'app/Applications',
	                        ranking[8].app_apps
	                    ],
	                    [
	                        'MA/Applicants',
	                        ranking[8].ma_app
	                    ],
	                    [
	                        'MA/Applications',
	                        ranking[8].ma_apps
	                    ],
	                    [
	                        'Approved',
	                        ranking[8].appro
	                    ],
	                    [
	                        'Completed',
	                        ranking[8].comp
	                    ]
	                ]
	            },
	            {
	                name: ranking[9].name,
	                id: ranking[9].name,
	                data: [
	                    [
	                        'app/Applicants',
	                        ranking[9].app_app
	                    ],
	                    [
	                        'app/Applications',
	                        ranking[9].app_apps
	                    ],
	                    [
	                        'MA/Applicants',
	                        ranking[9].ma_app
	                    ],
	                    [
	                        'MA/Applications',
	                        ranking[9].ma_apps
	                    ],
	                    [
	                        'Approved',
	                        ranking[9].appro
	                    ],
	                    [
	                        'Completed',
	                        ranking[9].comp
	                    ]
	                ]
	            }
	            ]
	        }
	    });
	}

	/**
	 * Dark theme for Highcharts JS
	 * @author Torstein Honsi
	 */

	// Load the fonts
	Highcharts.createElement('link', {
	   href: 'http://fonts.googleapis.com/css?family=Lato',
	   rel: 'stylesheet',
	   type: 'text/css'
	}, null, document.getElementsByTagName('head')[0]);

	Highcharts.theme = {
	   colors: ["#037ff3", "#037ff3", "#037ff3", "#037ff3", "#037ff3", "#037ff3", "#037ff3",
	      "#037ff3", "#037ff3", "#037ff3", "#037ff3"],
	   chart: {
	      backgroundColor: {
	         linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
	         stops: [
	            [0, '#2a2a2b'],
	            [1, '#3e3e40']
	         ]
	      },
	      style: {
	         fontFamily: "'Unica One', sans-serif"
	      },
	      plotBorderColor: '#606063'
	   },
	   title: {
	      style: {
	         color: '#E0E0E3',
	         textTransform: 'uppercase',
	         fontSize: '20px'
	      }
	   },
	   subtitle: {
	      style: {
	         color: '#E0E0E3',
	         textTransform: 'uppercase'
	      }
	   },
	   xAxis: {
	      gridLineColor: '#707073',
	      labels: {
	         style: {
	            color: '#E0E0E3'
	         }
	      },
	      lineColor: '#707073',
	      minorGridLineColor: '#505053',
	      tickColor: '#707073',
	      title: {
	         style: {
	            color: '#A0A0A3'

	         }
	      }
	   },
	   yAxis: {
	      gridLineColor: '#707073',
	      labels: {
	         style: {
	            color: '#E0E0E3'
	         }
	      },
	      lineColor: '#707073',
	      minorGridLineColor: '#505053',
	      tickColor: '#707073',
	      tickWidth: 1,
	      title: {
	         style: {
	            color: '#A0A0A3'
	         }
	      }
	   },
	   tooltip: {
	      backgroundColor: 'rgba(0, 0, 0, 0.85)',
	      style: {
	         color: '#F0F0F0'
	      }
	   },
	   plotOptions: {
	      series: {
	         dataLabels: {
	            color: '#B0B0B3'
	         },
	         marker: {
	            lineColor: '#333'
	         }
	      },
	      boxplot: {
	         fillColor: '#505053'
	      },
	      candlestick: {
	         lineColor: 'white'
	      },
	      errorbar: {
	         color: 'white'
	      }
	   },
	   legend: {
	      itemStyle: {
	         color: '#E0E0E3'
	      },
	      itemHoverStyle: {
	         color: '#FFF'
	      },
	      itemHiddenStyle: {
	         color: '#606063'
	      }
	   },
	   credits: {
	      style: {
	         color: '#666'
	      }
	   },
	   labels: {
	      style: {
	         color: '#707073'
	      }
	   },

	   drilldown: {
	      activeAxisLabelStyle: {
	         color: '#F0F0F3'
	      },
	      activeDataLabelStyle: {
	         color: '#F0F0F3'
	      }
	   },

	   navigation: {
	      buttonOptions: {
	         symbolStroke: '#DDDDDD',
	         theme: {
	            fill: '#505053'
	         }
	      }
	   },

	   // scroll charts
	   rangeSelector: {
	      buttonTheme: {
	         fill: '#505053',
	         stroke: '#000000',
	         style: {
	            color: '#CCC'
	         },
	         states: {
	            hover: {
	               fill: '#707073',
	               stroke: '#000000',
	               style: {
	                  color: 'white'
	               }
	            },
	            select: {
	               fill: '#000003',
	               stroke: '#000000',
	               style: {
	                  color: 'white'
	               }
	            }
	         }
	      },
	      inputBoxBorderColor: '#505053',
	      inputStyle: {
	         backgroundColor: '#333',
	         color: 'silver'
	      },
	      labelStyle: {
	         color: 'silver'
	      }
	   },

	   navigator: {
	      handles: {
	         backgroundColor: '#666',
	         borderColor: '#AAA'
	      },
	      outlineColor: '#CCC',
	      maskFill: 'rgba(255,255,255,0.1)',
	      series: {
	         color: '#7798BF',
	         lineColor: '#A6C7ED'
	      },
	      xAxis: {
	         gridLineColor: '#505053'
	      }
	   },

	   scrollbar: {
	      barBackgroundColor: '#808083',
	      barBorderColor: '#808083',
	      buttonArrowColor: '#CCC',
	      buttonBackgroundColor: '#606063',
	      buttonBorderColor: '#606063',
	      rifleColor: '#FFF',
	      trackBackgroundColor: '#404043',
	      trackBorderColor: '#404043'
	   },

	   // special colors for some of the
	   legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
	   background2: '#505053',
	   dataLabelsColor: '#B0B0B3',
	   textColor: '#C0C0C0',
	   contrastTextColor: '#F0F0F3',
	   maskColor: 'rgba(255,255,255,0.3)'
	};

	// Apply the theme
	Highcharts.setOptions(Highcharts.theme);
	}

}]);