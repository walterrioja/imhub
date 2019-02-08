var app = angular.module('myApp', []);

app.controller('Analytics', ['$scope', '$http', function($scope, $http) {
    $scope.go = function() {
  	var access_token = $scope.access_token;
	var start_date = document.getElementById("fecha_in").value;
	var end_date = document.getElementById("fecha_out").value;
	console.log()

	//MC Dynamo
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

	var options = {
		uri_base: 'https://gis-api.aiesec.org/v2/',
		uri_point: 'lists/mcs.json?access_token='
	};
	
	//Global Variables
	var mcs = [];
	var rankMcs = [];
	var rankMcs20 = [];
	var rankGCDP = [];

	//List of MCS
	//URL: https://gis-api.aiesec.org/v2/lists/mcs.json?access_token=TOKEN
	$http.get(options.uri_base + options.uri_point + access_token).
		success(
			function (data) {
				for (var i = 0; i <= data.length - 1; i++){
					mcs.push({
						"id": data[i].id, 
						"name": data[i].name
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
					+ '&programmes%5B%5D=2' //GIP
					+ '&basic%5Btype%5D=opportunity' //iGIP
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
					"apps": data.analytics.total_realized.doc_count, //6
					"app_app": data.analytics.total_applications.applicants.value, //1
					"app_apps": data.analytics.total_applications.doc_count, //2
					"ma_app": data.analytics.total_an_accepted.unique_profiles.value, //3
					"ma_apps": data.analytics.total_matched.doc_count, //4
					"appro": data.analytics.total_approvals.doc_count, //5
					"comp": data.analytics.total_completed.doc_count //7
				});

				if(j == len) {
					rankMcs.sort(function(a, b) {
						return parseFloat(b.apps) - parseFloat(a.apps);
					});

					//RANK 20
					for (var i = 0; i < 20; i++) {			
						rankMcs20.push({
							"id":   rankMcs[i].id,
							"name": rankMcs[i].name,
							"apps":   rankMcs[i].apps,
							"app_app": rankMcs[i].app_app, //1
							"app_apps": rankMcs[i].app_apps, //2
							"ma_app": rankMcs[i].ma_app, //3
							"ma_apps": rankMcs[i].ma_apps, //4
							"appro": rankMcs[i].appro, //5
							"comp": rankMcs[i].comp //7
						});
					};

					$scope.mcs20 = rankMcs;
					rank(rankMcs20);
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
	            text: 'iGIP Rank<br>' + 'Fechas: ' + start_date + ' - ' + end_date
	        },
	        subtitle: {
	            text: 'Click en las barras para obtener más información.'
	        },
	        xAxis: {
	            type: 'category'
	        },
	        yAxis: {
	            title: {
	                text: 'Total iGIP'
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
	            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:,.0f}</b> of total<br/>'
	        },

	        series: [{
	            name: 'iGIP',
	            colorByPoint: true,
	            data: [{
	                name: '1. ' + ranking[0].name,
	                y: ranking[0].apps,
	                drilldown: ranking[0].name
	            }, {
	                name: '2. ' + ranking[1].name,
	                y: ranking[1].apps,
	                drilldown: ranking[1].name
	            }, {
	                name: '3. ' + ranking[2].name,
	                y: ranking[2].apps,
	                drilldown: ranking[2].name
	            },{
	                name: '4. ' + ranking[3].name,
	                y: ranking[3].apps,
	                drilldown: ranking[3].name
	            },{
	                name: '5. ' + ranking[4].name,
	                y: ranking[4].apps,
	                drilldown: ranking[4].name
	            },{
	                name: '6. ' + ranking[5].name,
	                y: ranking[5].apps,
	                drilldown: ranking[5].name
	            },{
	                name: '7. ' + ranking[6].name,
	                y: ranking[6].apps,
	                drilldown: ranking[6].name
	            },{
	                name: '8. ' + ranking[7].name,
	                y: ranking[7].apps,
	                drilldown: ranking[7].name
	            },{
	                name: '9. ' + ranking[8].name,
	                y: ranking[8].apps,
	                drilldown: ranking[8].name
	            },{
	                name: '10. ' + ranking[9].name,
	                y: ranking[9].apps,
	                drilldown: ranking[9].name
	            },{
	                name: '11. ' + ranking[10].name,
	                y: ranking[10].apps,
	                drilldown: ranking[10].name
	            },{
	                name: '12. ' + ranking[11].name,
	                y: ranking[11].apps,
	                drilldown: ranking[11].name
	            },{
	                name: '13. ' + ranking[12].name,
	                y: ranking[12].apps,
	                drilldown: ranking[12].name
	            },{
	                name: '14. ' + ranking[13].name,
	                y: ranking[13].apps,
	                drilldown: ranking[13].name
	            },{
	                name: '15. ' + ranking[14].name,
	                y: ranking[14].apps,
	                drilldown: ranking[14].name
	            },{
	                name: '16. ' + ranking[15].name,
	                y: ranking[15].apps,
	                drilldown: ranking[15].name
	            },{
	                name: '17. ' + ranking[16].name,
	                y: ranking[16].apps,
	                drilldown: ranking[16].name
	            },{
	                name: '18. ' + ranking[17].name,
	                y: ranking[17].apps,
	                drilldown: ranking[17].name
	            },{
	                name: '19. ' + ranking[18].name,
	                y: ranking[18].apps,
	                drilldown: ranking[18].name
	            },{
	                name: '20. ' + ranking[19].name,
	                y: ranking[19].apps,
	                drilldown: ranking[19].name
	            }]
	        }],
	        drilldown: {
	            series: [
	            {
	                name: ranking[0].name,
	                id: ranking[0].name,
	                data: [
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
	                    	'Realized',
	                    	ranking[0].apps
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
	                    	'Realized',
	                    	ranking[1].apps
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
	                    	'Realized',
	                    	ranking[2].apps
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
	                    	'Realized',
	                    	ranking[3].apps
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
	                    	'Realized',
	                    	ranking[4].apps
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
	                    	'Realized',
	                    	ranking[5].apps
	                    ],
	                    [
	                        'Completed',
	                        ranking[5].comp
	                    ]
	                ]
	            },{
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
	                    	'Realized',
	                    	ranking[6].apps
	                    ],
	                    [
	                        'Completed',
	                        ranking[6].comp
	                    ]
	                ]
	            },{
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
	                    	'Realized',
	                    	ranking[7].apps
	                    ],
	                    [
	                        'Completed',
	                        ranking[7].comp
	                    ]
	                ]
	            },{
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
	                    	'Realized',
	                    	ranking[8].apps
	                    ],
	                    [
	                        'Completed',
	                        ranking[8].comp
	                    ]
	                ]
	            },{
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
	                    	'Realized',
	                    	ranking[9].apps
	                    ],
	                    [
	                        'Completed',
	                        ranking[9].comp
	                    ]
	                ]
	            },{
	                name: ranking[10].name,
	                id: ranking[10].name,
	                data: [
	                    [
	                        'app/Applicants',
	                        ranking[10].app_app
	                    ],
	                    [
	                        'app/Applications',
	                        ranking[10].app_apps
	                    ],
	                    [
	                        'MA/Applicants',
	                        ranking[10].ma_app
	                    ],
	                    [
	                        'MA/Applications',
	                        ranking[10].ma_apps
	                    ],
	                    [
	                        'Approved',
	                        ranking[10].appro
	                    ],
	                    [
	                    	'Realized',
	                    	ranking[10].apps
	                    ],
	                    [
	                        'Completed',
	                        ranking[10].comp
	                    ]
	                ]
	            },{
	                name: ranking[11].name,
	                id: ranking[11].name,
	                data: [
	                    [
	                        'app/Applicants',
	                        ranking[11].app_app
	                    ],
	                    [
	                        'app/Applications',
	                        ranking[11].app_apps
	                    ],
	                    [
	                        'MA/Applicants',
	                        ranking[11].ma_app
	                    ],
	                    [
	                        'MA/Applications',
	                        ranking[11].ma_apps
	                    ],
	                    [
	                        'Approved',
	                        ranking[11].appro
	                    ],
	                    [
	                    	'Realized',
	                    	ranking[11].apps
	                    ],
	                    [
	                        'Completed',
	                        ranking[11].comp
	                    ]
	                ]
	            },{
	                name: ranking[12].name,
	                id: ranking[12].name,
	                data: [
	                    [
	                        'app/Applicants',
	                        ranking[12].app_app
	                    ],
	                    [
	                        'app/Applications',
	                        ranking[12].app_apps
	                    ],
	                    [
	                        'MA/Applicants',
	                        ranking[12].ma_app
	                    ],
	                    [
	                        'MA/Applications',
	                        ranking[12].ma_apps
	                    ],
	                    [
	                        'Approved',
	                        ranking[12].appro
	                    ],
	                    [
	                    	'Realized',
	                    	ranking[12].apps
	                    ],
	                    [
	                        'Completed',
	                        ranking[12].comp
	                    ]
	                ]
	            },{
	                name: ranking[13].name,
	                id: ranking[13].name,
	                data: [
	                    [
	                        'app/Applicants',
	                        ranking[13].app_app
	                    ],
	                    [
	                        'app/Applications',
	                        ranking[13].app_apps
	                    ],
	                    [
	                        'MA/Applicants',
	                        ranking[13].ma_app
	                    ],
	                    [
	                        'MA/Applications',
	                        ranking[13].ma_apps
	                    ],
	                    [
	                        'Approved',
	                        ranking[13].appro
	                    ],
	                    [
	                    	'Realized',
	                    	ranking[13].apps
	                    ],
	                    [
	                        'Completed',
	                        ranking[13].comp
	                    ]
	                ]
	            },{
	                name: ranking[14].name,
	                id: ranking[14].name,
	                data: [
	                    [
	                        'app/Applicants',
	                        ranking[14].app_app
	                    ],
	                    [
	                        'app/Applications',
	                        ranking[14].app_apps
	                    ],
	                    [
	                        'MA/Applicants',
	                        ranking[14].ma_app
	                    ],
	                    [
	                        'MA/Applications',
	                        ranking[14].ma_apps
	                    ],
	                    [
	                        'Approved',
	                        ranking[14].appro
	                    ],
	                    [
	                    	'Realized',
	                    	ranking[14].apps
	                    ],
	                    [
	                        'Completed',
	                        ranking[14].comp
	                    ]
	                ]
	            },{
	                name: ranking[15].name,
	                id: ranking[15].name,
	                data: [
	                    [
	                        'app/Applicants',
	                        ranking[15].app_app
	                    ],
	                    [
	                        'app/Applications',
	                        ranking[15].app_apps
	                    ],
	                    [
	                        'MA/Applicants',
	                        ranking[15].ma_app
	                    ],
	                    [
	                        'MA/Applications',
	                        ranking[15].ma_apps
	                    ],
	                    [
	                        'Approved',
	                        ranking[15].appro
	                    ],
	                    [
	                    	'Realized',
	                    	ranking[15].apps
	                    ],
	                    [
	                        'Completed',
	                        ranking[15].comp
	                    ]
	                ]
	            },{
	                name: ranking[16].name,
	                id: ranking[16].name,
	                data: [
	                    [
	                        'app/Applicants',
	                        ranking[16].app_app
	                    ],
	                    [
	                        'app/Applications',
	                        ranking[16].app_apps
	                    ],
	                    [
	                        'MA/Applicants',
	                        ranking[16].ma_app
	                    ],
	                    [
	                        'MA/Applications',
	                        ranking[16].ma_apps
	                    ],
	                    [
	                        'Approved',
	                        ranking[16].appro
	                    ],
	                    [
	                    	'Realized',
	                    	ranking[16].apps
	                    ],
	                    [
	                        'Completed',
	                        ranking[16].comp
	                    ]
	                ]
	            },{
	                name: ranking[17].name,
	                id: ranking[17].name,
	                data: [
	                    [
	                        'app/Applicants',
	                        ranking[17].app_app
	                    ],
	                    [
	                        'app/Applications',
	                        ranking[17].app_apps
	                    ],
	                    [
	                        'MA/Applicants',
	                        ranking[17].ma_app
	                    ],
	                    [
	                        'MA/Applications',
	                        ranking[17].ma_apps
	                    ],
	                    [
	                        'Approved',
	                        ranking[17].appro
	                    ],
	                    [
	                    	'Realized',
	                    	ranking[17].apps
	                    ],
	                    [
	                        'Completed',
	                        ranking[17].comp
	                    ]
	                ]
	            },{
	                name: ranking[18].name,
	                id: ranking[18].name,
	                data: [
	                    [
	                        'app/Applicants',
	                        ranking[18].app_app
	                    ],
	                    [
	                        'app/Applications',
	                        ranking[18].app_apps
	                    ],
	                    [
	                        'MA/Applicants',
	                        ranking[18].ma_app
	                    ],
	                    [
	                        'MA/Applications',
	                        ranking[18].ma_apps
	                    ],
	                    [
	                        'Approved',
	                        ranking[18].appro
	                    ],
	                    [
	                    	'Realized',
	                    	ranking[18].apps
	                    ],
	                    [
	                        'Completed',
	                        ranking[18].comp
	                    ]
	                ]
	            },{
	                name: ranking[19].name,
	                id: ranking[19].name,
	                data: [
	                    [
	                        'app/Applicants',
	                        ranking[19].app_app
	                    ],
	                    [
	                        'app/Applications',
	                        ranking[19].app_apps
	                    ],
	                    [
	                        'MA/Applicants',
	                        ranking[19].ma_app
	                    ],
	                    [
	                        'MA/Applications',
	                        ranking[19].ma_apps
	                    ],
	                    [
	                        'Approved',
	                        ranking[19].appro
	                    ],
	                    [
	                    	'Realized',
	                    	ranking[19].apps
	                    ],
	                    [
	                        'Completed',
	                        ranking[19].comp
	                    ]
	                ]
	            },
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
