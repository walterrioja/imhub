var app = angular.module('applicants_icx', []);

app.controller('Analytics', ['$scope', '$http', function ($scope,$http) {
	$scope.go = function() {

		spinner_up();
		
		$http.get("./get-data.php").
			success(
				function(res){
					access_token = res;
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
				}
				).
			error(
				function(error){
					console.log(error);
				}
				);

		var start_date = document.getElementById("fecha_in").value;
		var end_date = document.getElementById("fecha_out").value;
		var programa = document.getElementById("programa").value;

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
			uri_point: 'applications.json?access_token=',		
			filters: '',
			sub_filter: '&page='
		};		

		//iGV
 		if(programa == '1'){
 			options.filters = '&filters%5Bcreated_at%5Bfrom%5D%5D=' + start_date + '&filters%5Bcreated_at%5Bto%5D%5D=' + end_date + '&filters%5Bfor%5D=opportunities&filters%5Bprogrammes%5D%5B%5D=1&filters%5Bstatuses%5D%5B%5D=open&per_page=200&filters%5Bopportunity_committee%5D=1553&sort=status'
		}//iGT
		else if(programa == '2'){
			options.filters = '&filters%5Bcreated_at%5Bfrom%5D%5D=' + start_date + '&filters%5Bcreated_at%5Bto%5D%5D=' + end_date + '&filters%5Bfor%5D=opportunities&filters%5Bprogrammes%5D%5B%5D=5&filters%5Bstatuses%5D%5B%5D=open&per_page=200&filters%5Bopportunity_committee%5D=1553&sort=status'
		}else{
			options.filters = '&filters%5Bcreated_at%5Bfrom%5D%5D=' + start_date + '&filters%5Bcreated_at%5Bto%5D%5D=' + end_date + '&filters%5Bfor%5D=opportunities&filters%5Bprogrammes%5D%5B%5D=2&filters%5Bstatuses%5D%5B%5D=open&per_page=200&filters%5Bopportunity_committee%5D=1553&sort=status'

		}

		var people_expa = [];
		var people_detail = [];

		function add (pag) {
			for (var i = 0; i <= pag - 1; i++) {
				$http.get(options.uri_base + options.uri_point + access_token + options.filters + options.sub_filter + (i+1) ).
	    			success(function(res) {
						for (var j =  0; j <= res.data.length - 1; j++) {

							people_expa.push({
								"id": res.data[j].person.id,
								"name": res.data[j].person.first_name,
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

						};

						if(i == pag){
							person_detail(people_expa);							
						}

	    			}).
	    			error(
	    				function (error) {
						console.log(error);
						}
					);
			};
		}

		function person_detail(people_without_detail) {
			if (people_without_detail !== null){
				for (var j = 0; j <= people_without_detail.length - 1; j++) {
					options_person_detail = {
						uri: 
						'https://gis-api.aiesec.org/v2/people/'+ people_without_detail[j].id +'.json?'
						+ 'access_token=' + access_token
					};

					person_detail_fin(options_person_detail, people_without_detail[j].id, people_without_detail, j, people_without_detail.length, 
						people_without_detail[j].tn_id, 
						people_without_detail[j].tn_name,
						people_without_detail[j].status,
						people_without_detail[j].host_lc
						);
				}
			}
		}

		function person_detail_fin(options, id, people, j, len, opp_id, opp_name, status, host_lc){
			$http.get(options.uri).
				success(function(res){
							country_code = res.contact_info == null ? '' : (res.contact_info.country_code === null ? '' : res.contact_info.country_code);
							phone = res.contact_info == null ? '' : (res.contact_info.phone === null ? ' ': res.contact_info.phone);

							people_detail.push({
								"id": id,
								"first_name": res.first_name,
								"last_name": res.last_name,
								"email": res.email,
								"phone": country_code + " " + phone,
								"home_lc": res.home_lc.name,
								"tn_id": opp_id,
								"tn_name": opp_name,
								"host_lc": host_lc,
								"country": res.home_lc.country,
								"status": status
							});
							
							$scope.people = people_detail;
							spinner();
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

	}
}])
