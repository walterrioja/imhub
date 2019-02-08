var app = angular.module('applicants_icx', []);

app.controller('Analytics', ['$scope', '$http', function ($scope,$http) {
	$scope.go = function () {
		var access_token = $scope.access_token;
		var start_date = document.getElementById("fecha_in").value;
		var end_date = document.getElementById("fecha_out").value;
		var programa = document.getElementById("programa").value;
		//var lc = document.getElementById("lc").value;
		var lc = '1553';

		//Final value
		var projects_expa = [];

		var projectsId = [];

		//MC CAMAC
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

		var options = {
			uri_base: 'https://gis-api.aiesec.org/v2/',
			uri_point: 'opportunities.json?access_token=',
			filters: '&filters%5Bcommittee%5D=' + lc + '&filters%5Bstatuses%5D%5B%5D=open&per_page=500&&filters%5Bprogrammes%5D%5B%5D=1'
		}


		var options_proyecto = {
			uri_point: 'opportunities/',
			uri_point2:'/applications.json?access_token=',
			filters: '&page=1'
		}

		$http.get(options.uri_base + options.uri_point + access_token + options.filters).
		success(function(res) {
			console.log(res);
			for (i in res.data){
				projectsId.push({
					'id': res.data[i].id,
					'name': res.data[i].title,
					'status': res.data[i].status,
					'applicants': res.data[i].applications_count,
					'close': res.data[i].applications_close_date,
					'created_at': res.data[i].created_at,
					'earliest_start_date': res.data[i].earliest_start_date,
					'latest_end_date': res.data[i].latest_end_date

				})
				res.data[i]
			}
			/*
			for (var i = res.length - 1; i >= 0; i--) {
				projectsId.push({
					'id': res.data[i].id,
					'openings': res.data[j].openings
				})
			};*/

			$scope.projects = projectsId;
		}
			//function(res){
			//	for (var i = 0; i < res.paging.total_items; i++) {
			//		console.log(res);
					/*
					projectsId.push({
						"id": res.data[i].id,
						"openings": res.data[i].openings
					})*/

					/*
					$http.get(options.uri_base + options_proyecto.uri_point + res.data[i].id + options_proyecto.uri_point2 + access_token + options_proyecto.filters).
					success(
						function (resp) {
							console.log(resp);
							
							projects_expa.push({
								"id":
								"name":
								"open":
							})

							//console.log(projects_expa);
						}
					).
					error(
						function (error) {
							console.log(error);
						}
					)
				};*/

				//$scope.projects = projects_expa;
			//}
		).
		error(
			function (error){
				console.log(error);
			}
		)
	}
}])
