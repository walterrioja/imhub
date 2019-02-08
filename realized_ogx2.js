var app = angular.module('realized_ogx', []);

app.controller('Analytics', ['$scope', '$http', function ($scope,$http) {
	$scope.go = function() {
		var access_token = $scope.access_token;
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

		//oGV
		if(programa == '1'){
			options.filters = '&filters%5Bdate_realized%5Bfrom%5D%5D=' + start_date + '&filters%5Bdate_realized%5Bto%5D%5D=' + end_date + '&filters%5Bperson_committee%5D=1553&filters%5Bprogrammes%5D%5B%5D=1&per_page=200'
		}//oGE
		else if(programa == '2'){
			options.filters = '&filters%5Bdate_realized%5Bfrom%5D%5D=' + start_date + '&filters%5Bdate_realized%5Bto%5D%5D=' + end_date + '&filters%5Bperson_committee%5D=1553&filters%5Bprogrammes%5D%5B%5D=5&per_page=200'	//OGT
		}//oGT
		else if(programa == '3'){
			options.filters = '&filters%5Bdate_realized%5Bfrom%5D%5D=' + start_date + '&filters%5Bdate_realized%5Bto%5D%5D=' + end_date + '&filters%5Bperson_committee%5D=1553&filters%5Bprogrammes%5D%5B%5D=2&per_page=200'	//OGT
		}

		var people_expa = [];

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
							var lc;
							if(programa == '1' || programa == '2' || programa == '3'){
								lc = res.data[j].person.home_lc.name; //SOLO PARA oGX
							}else{
								lc = res.data[j].opportunity.office.name; //SOLO PARA iCX									
							}

							people_expa.push({
								//"name": res.data[j].first_name,
								"name": res.data[j].person.first_name === null ? '' : res.data[j].person.first_name ,
								"last_name": res.data[j].person.last_name === null ? '' : res.data[j].person.last_name,
								"email": res.data[j].person.email === null ? '':res.data[j].person.email,
								"home_lc": res.data[j].person.home_lc.country === null ? '' : res.data[j].person.home_lc.country,								
								"tn_id": res.data[j].opportunity.id === null ? '' : res.data[j].opportunity.id,
								"tn_name": res.data[j].opportunity.title === null ? '' : res.data[j].opportunity.title,
								"lc": res.data[j].opportunity.office.name === null ? '': res.data[j].opportunity.office.name,
								"country": res.data[j].opportunity.office === null ? '' : res.data[j].opportunity.office.country,
								"expa_link": 'https://experience.aiesec.org/#/people/' + res.data[j].person.id,
								"status": res.data[j].status === null ? '' : res.data[j].status,
								"referral": res.data[j].person.referral_type=== null ? '' : res.data[j].person.referral_type							});
						};			

						$scope.people = people_expa;
	    			}).
	    			error(
	    				function (error) {
						console.log(error);
						}
					);
			};
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
