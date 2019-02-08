var app = angular.module('applicants_icx', []);

app.controller('Analytics', ['$scope', '$http', function ($scope,$http) {
	$scope.go = function() {
		var access_token = $scope.access_token;
		var start_date = document.getElementById("fecha_in").value;
		var end_date = document.getElementById("fecha_out").value;
		var programa = document.getElementById("programa").value;

		var trainees = [];

		//spinner_up();

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

		//Por defecto oGV
		var options = {
			uri_base: 'https://gis-api.aiesec.org/v2/',
			uri_base_op: 'opportunities/',
			uri_point: 'applications.json?access_token=',		
			filters: '',
			sub_filter: '&page=',
			op_manager_query: '.json?access_token='
		};		

		//iGV
 		if(programa == '1'){
 			options.filters = '&filters%5Bcreated_at%5Bfrom%5D%5D=' + start_date + '&filters%5Bcreated_at%5Bto%5D%5D=' + end_date + '&filters%5Bfor%5D=opportunities&filters%5Bprogrammes%5D%5B%5D=1&filters%5Bstatuses%5D%5B%5D=open&per_page=200&sort=status'
			//options.filters = '&filters%5Bdate_approved%5Bfrom%5D%5D=' + start_date + '&filters%5Bdate_approved%5Bto%5D%5D='+ end_date + '&filters%5Bopportunity_committee%5D=1553&filters%5Bprogrammes%5D%5B%5D=1&per_page=200'	//iGV
		}//iGT
		else{
			options.filters = '&filters%5Bcreated_at%5Bfrom%5D%5D=' + start_date + '&filters%5Bcreated_at%5Bto%5D%5D=' + end_date + '&filters%5Bfor%5D=opportunities&filters%5Bprogrammes%5D%5B%5D=2&filters%5Bstatuses%5D%5B%5D=open&per_page=200&sort=status'
			//options.filters = '&filters%5Bdate_approved%5Bfrom%5D%5D=' + start_date + '&filters%5Bdate_approved%5Bto%5D%5D='+ end_date + '&filters%5Bopportunity_committee%5D=1553&filters%5Bprogrammes%5D%5B%5D=2&per_page=200'	//iGT
		}

		var people_expa = [];
		var people_end = [];

		$http.get(options.uri_base + options.uri_point + access_token + options.filters).
        		success(
        			function(res) {
        				add(res.paging.total_pages);        	
        			}
        		).
        		error(
        			function (error) {
						console.log(error);
					}
				);

		function add (pag) {
			for (var i = 0; i <= pag - 1; i++) {
				$http.get(options.uri_base + options.uri_point + access_token + options.filters + options.sub_filter + (i+1) ).
	    			success(function(res) {
						for (var j =  0; j <= res.data.length - 1; j++) {
							console.log("Aqui toy");
							people_expa.push({
								//"name": res.data[j].first_name,
								"name": res.data[j].person.first_name,
								//"last_name": res.data[j].last_name,
								"last_name": res.data[j].person.last_name,
								"email": res.data[j].person.email,
								"home_lc": res.data[j].person.home_lc.name,								
								"tn_id": res.data[j].opportunity.id,
								"tn_name": res.data[j].opportunity.title,
								"lc": res.data[j].person.home_lc.name,
								"host_lc": res.data[j].opportunity.office.name,								
								"country": res.data[j].person.home_lc.country,
								"expa_link": 'https://experience.aiesec.org/#/people/' + res.data[j].person.id,
								"status": res.data[j].status
							});

							if(j == res.data.length - 1){
								op_manager_opts(people_expa);							
							}
						};			
	    			}).
	    			error(
	    				function (error) {
						console.log(error);
						}
					);
			};
		}

		function op_manager_opts (people) {
			for (var i = people.length - 1; i >= 0; i--) {
				op_manager(people, i);				
			};
		}

		function op_manager (people, i) {		
			$http.get(options.uri_base + options.uri_base_op + people[i].tn_id + options.op_manager_query + access_token).
			success(function (r) {
				console.log(i);
				people_end.push({
					"name": people[i].name,
					"last_name": people[i].last_name,
					"email": people[i].email,
					"home_lc": people[i].home_lc,								
					"tn_id": people[i].tn_id,
					"tn_name": people[i].tn_name,
					"op_manager_name": r.managers[0].full_name,
					"op_manager_email": r.managers[0].email,
					"lc": people[i].lc,
					"host_lc": people[i].host_lc,								
					"country": people[i].country,
					"expa_link": people[i].expa_link,
					"status": people[i].status
				});

				$scope.people = people_end;

			}).
			error(
				function (error) {
					console.log(error);
			});

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

	}
}])