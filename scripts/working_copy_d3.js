$(function() {
	var workoutData;
	var relapseData;
	var challengeData;

	var workoutsByWeekData;

	var loadDataRenderCharts = function(data){
		workoutData = data.workouts
		relapseData = data.relapses;
		challengeData = data.challenges;
		updateCharts();
	};

	function updateCharts(){
		$('.last-workout').text(updateLastOccurrence(workoutData));
		$('.clean-time').text(updateLastOccurrence(relapseData));
		$('.total-workouts').text(consecutiveWorkoutDays(workoutData));
		updateRelapseMeter(relapseRisk(workoutData));
		mapRelapses(relapseData, workoutData);
		buildDonutChart(dataTransformer.typeDonutChart(workoutData), "FitMo", "#workout-donut-chart svg");
		buildBarChart(dataTransformer.typeBarChart(workoutData), "Workouts by Type", "#workout-bar-chart svg");
		buildLineChart(dataTransformer.typeLineChart(workoutData), "Workouts by Duration (min)", "#workout-line-chart svg");
	};

	d3.json('data/new_workouts_two.json', loadDataRenderCharts);
	
	function buildLineChart(data, title, selector){

		nv.addGraph(function() {
	        var chart = nv.models.lineChart();
	        var fitScreen = false;
	        var width = 900;
	        var height = 200;
	        var zoom = 1;

	        chart.useInteractiveGuideline(true);

	        chart.xAxis
                .tickFormat(function(d) {
                    // I didn't feel like changing all the above date values
                    // so I hack it to make each value fall on a different date
                    return d3.time.format('%a %m/%e' )(new Date(d));
                });
	      
	        chart.lines.dispatch.on("elementClick", function(evt) {
	            console.log(evt);
	        });

	        chart.yAxis
	            .axisLabel(title)
	            .tickFormat(d3.format(',.0f'));

	        d3.select('#workout-line-chart svg')
	            .attr('perserveAspectRatio', 'xMinYMid')
	            .attr('width', width)
	            .attr('height', height)
	            .datum(data);

			setChartViewBox();
			resizeChart();

	        nv.utils.windowResize(resizeChart);

	        function setChartViewBox() {
	            var w = width * zoom,
	                h = height * zoom;

	            chart
	                .width(w)
	                .height(h);

	            d3.select(selector)
	                .attr('viewBox', '0 0 ' + w + ' ' + h)
	                .transition().duration(1200)
	                .call(chart);
	        }

	        // This resize simply sets the SVG's dimensions, without a need to recall the chart code
	        // Resizing because of the viewbox and perserveAspectRatio settings
	        // This scales the interior of the chart unlike the above
	        function resizeChart() {
	            var container = d3.select('#workout-line-chart');
	            var svg = container.select('svg');

	            if (fitScreen) {
	                // resize based on container's width AND HEIGHT
	                var windowSize = nv.utils.windowSize();
	                svg.attr("width", windowSize.width);
	                svg.attr("height", windowSize.height);
	            } else {
	                // resize based on container's width
	                var aspect = chart.width() / chart.height();
	                var targetWidth = parseInt(container.style('width'));
	                svg.attr("width", targetWidth);
	                svg.attr("height", Math.round(targetWidth / aspect));
	            }
	        }
	        d3.selectAll('text').style({'font-family': 'ProximaNova-Light', 'fill': '#00ebd2'});


    		return chart;
		});
	};

	function buildLineChartByWeek(data, title, selector){

		nv.addGraph(function() {
	        var chart = nv.models.lineChart();
	        var fitScreen = false;
	        var width = 900;
	        var height = 200;
	        var zoom = 1;

	        chart.useInteractiveGuideline(true);

	        chart.xAxis
	        	.axisLabel('Workouts by week of the year')
                .tickFormat(d3.format(',.0f'));
	      
	        chart.lines.dispatch.on("elementClick", function(evt) {
	            console.log(evt);
	        });

	        chart.yAxis
	            .axisLabel('Duration of Workouts (min)')
	            .tickFormat(d3.format(',.0f'));

	        d3.select('#workout-line-chart svg')
	            .attr('perserveAspectRatio', 'xMinYMid')
	            .attr('width', width)
	            .attr('height', height)
	            .datum(data);

			setChartViewBox();
			//resizeChart();

	        //nv.utils.windowResize(resizeChart);

   
	        function setChartViewBox() {
	            var w = width * zoom,
	                h = height * zoom;

	            chart
	                .width(w)
	                .height(h);

	            d3.select('#workout-line-chart svg')
	                .attr('viewBox', '0 0 ' + w + ' ' + h)
	                .transition().duration(1200)
	                .call(chart);
	        }

	        // This resize simply sets the SVG's dimensions, without a need to recall the chart code
	        // Resizing because of the viewbox and perserveAspectRatio settings
	        // This scales the interior of the chart unlike the above
	        function resizeChart() {
	            var container = d3.select('#workout-line-chart');
	            var svg = container.select('svg');

	            if (fitScreen) {
	                // resize based on container's width AND HEIGHT
	                var windowSize = nv.utils.windowSize();
	                svg.attr("width", windowSize.width);
	                svg.attr("height", windowSize.height);
	            } else {
	                // resize based on container's width
	                var aspect = chart.width() / chart.height();
	                var targetWidth = parseInt(container.style('width'));
	                svg.attr("width", targetWidth);
	                svg.attr("height", Math.round(targetWidth / aspect));
	            }
	        }
	        d3.selectAll('text').style({'font-family': 'ProximaNova-Light', 'fill': '#00ebd2'});

    		return chart;
		});
	}

	function buildDonutChart(data, title, selector){

    	var height = 350;
    	var width = 750;

    	var chart1;

	    nv.addGraph(function() {
	        var chart1 = nv.models.pieChart()
	            .x(function(d) { return d.key })
	            .y(function(d) { return d.y })
	            .donut(true)
	            .width(width)
	            .height(height)
	            .padAngle(.05)
	            .cornerRadius(5)
	            .id('donut1'); // allow custom CSS for this one svg

	        chart1.title(title);
	        chart1.pie.donutLabelsOutside(true).donut(true);

	        d3.select(selector)
	            .datum(dataTransformer.typeDonutChart(workoutData))
	            .transition().duration(1200)
	            .call(chart1);

	        nv.utils.windowResize(chart1.update);
	        d3.selectAll('text').style('font-family', 'ProximaNova-Light');

	        return chart1;

	    });
	};

	function buildBarChart(data, title, selector){
		var chartData = [
			        {
			            key: title,
			            values: data
			        }];

		nv.addGraph(function() {
    		var chart = nv.models.discreteBarChart()
        		.x(function(d) { return d.label })
        		.y(function(d) { return d.value })
        		.staggerLabels(true)
        		// .staggerLabels(historicalBarChart[0].values.length > 8)
        		.showValues(true)
        		.duration(1200);
      
    		d3.select(selector)
        		.datum(chartData)
        		.call(chart);

    		nv.utils.windowResize(chart.update);
    		d3.selectAll('text').style('font-family', 'ProximaNova-Light');
    		return chart;
		});
	};

	var dataTransformer = {
		typeLineByWeeks: function(data){
			var dataObj = {};
			var objStorage = [];
			var relapseZoneStorage = [];

			data.forEach(function(obj){
				var prop = obj.week;
				if(dataObj[prop]){
					dataObj[prop] += obj.duration
				} else {
					dataObj[prop] = obj.duration;
				}
			});
			for(var key in dataObj){
				objStorage.push({x: key, y: dataObj[key]});
				relapseZoneStorage.push({x: key, y: 160});
			}

			return [
				{
					values: objStorage,
					key: 'Duration of workouts by week',
					color: "#00ebd2"
				},
				{
					values: relapseZoneStorage,
					key: 'Relapse Zone',
					color: '#c40147'
				}
			];
		},
		typeLineChart: function(data){
			var objStorage = [];
			var relapseZoneStorage = [];

			var dateNum; 
			data.forEach(function(item, idx){
				dateNum = new Date(item.date);
				objStorage.push({x: dateNum, y: item.duration});
				relapseZoneStorage.push({x: dateNum, y: 40});
			});

			var results = [
					{
						values: objStorage,
						key: "Duration of Workouts",
						color: "#00ebd2"	
					},
					{
						values: relapseZoneStorage,
						key: 'Relapse Zone',
						color: '#c40147'	
					}	
				];
			return results;
		},
		typeDonutChart: function(data){
			var typeObj = {};
			var results = [];

			data.forEach(function(item){
				if(item.type === null){
					return;
				}
				else if(typeObj[item.type]){
					typeObj[item.type].urge_to_relapse += item.urge_to_relapse;
					typeObj[item.type].count++;
				} else {
					typeObj[item.type] = {urge_to_relapse: item.urge_to_relapse, count: 1};
				}
			})

			for(var key in typeObj){
				results.push({
					key: key, y: (typeObj[key].urge_to_relapse / typeObj[key].count)
				})
			}

			return results;
		},
		typeBarChart: function(data){
			var typeObj = {};
			var results = [];
			var cardioNum = strengthNum = sportsNum = 0;

			data.forEach(function(obj){
				if(obj.category == 'cardio'){
					cardioNum++;
				} else if(obj.category == 'strength'){
					strengthNum++
				} else if(obj.category == 'sports'){
					sportsNum++;
				}
				if(obj.category == null){
					return;
				} else if(typeObj[obj.category]){
					typeObj[obj.category] += obj.fun_factor;
				} else {
					typeObj[obj.category] = obj.fun_factor;
				}
			})

			for(var key in typeObj){
				if(key == 'cardio'){
					results.push({'label': key, 'value': typeObj[key] / cardioNum});					
				} else if(key == 'strength'){
					results.push({'label': key, 'value': typeObj[key] / strengthNum});
				} else {
					results.push({'label': key, 'value': typeObj[key] / sportsNum});
				}

			}
			return results;
		}
	};



	function buildWorkoutObject(){
		var typeInput = $('#type-input').val();
		var durationInput = Number($('#duration-input').val());
		var intensityInput = Number($('#intensity[name:checked]').val());
		var relapseInput = Number($('#relapse-input').val());
		var funFactorInput = Number($('#fun-factor-input').val());
		var today = new Date();
		workoutData.push({date: today, type: typeInput, duration: durationInput, intensity: intensityInput, urge_to_relapse: relapseInput,fun_factor: funFactorInput});
	};

	function buildRelapseObject(){
		var today = new Date();
		var substanceType = $('input[name="substance-type"]:checked').val();
		var place = $('#location-input').val();
		var associations = $('input[name="association-type"]:checked').val();
		var emotion = $('input[name="emotion-type"]:checked').val();
		var attitude = $('input[name="attitude-type"]:checked').val();
		var obj = {date: today, subtance: substanceType, location: place, associations: associations, emotions: emotion, attitude: attitude};
		relapseData.push(obj);
		$('#clean-time').text(updateLastOccurrence(relapseData));
	};

	function updateLastOccurrence(data){
		var recent = data[data.length - 1];

		var today = new Date().getTime();
		var last = new Date(recent.date).getTime();

		var days = Math.floor((today - last) / 1000 / 60 / 60 / 24);
		if(days < 0){
			return 0;
		}
		return days;
	};

	function updateRelapseMeter(num){
		var $relapseText = $('.relapse-meter');
		if(num <= 3){
			$relapseText.css('color', 'limegreen').text(num);
		} else if(num > 3 && num <= 6){
			$relapseText.css('color', 'yellow').text(num);
		} else {
			$relapseText.css('color', 'red').text(num);
		}
	};

	function relapseRisk(data){
		var total_risk = 0
		var lastFive = data.slice(data.length - 5);

		lastFive.forEach(function(workout){
			total_risk += workout.urge_to_relapse;
		});

		return (total_risk / lastFive.length).toFixed(1);
	};

	function consecutiveWorkoutDays(data){
		var today = Math.floor(new Date().getTime() / 86400000);
		var dayCount = 0, i = 1;

		var lastWorkout = Math.floor(new Date(data[data.length - i].date).getTime() / 86400000);

		while(data[data.length - i].duration > 0 && today - lastWorkout <= 1){
			dayCount++;
			i++;
			today = lastWorkout;
			lastWorkout = Math.floor(new Date(data[data.length - i].date).getTime() / 86400000);
		}
		return dayCount;
	}

	var month = 11;
	var day = 30;
	var year = 2015;

	function addWorkoutObject(){
		var types = ['running', 'tennis', 'yoga'];
		var category = ['cardio', 'strength', 'sports'];
		var durations = [0, 15, 30, 45, 60, 90];
		var randomTypeNum = Math.floor(Math.random() * types.length);
		var randomDurationNum = Math.floor(Math.random() * durations.length);
		var today = new Date().getTime();

		var obj = {
			date: month + '/' + day + '/' + year,
			type: types[randomTypeNum],
			duration: durations[randomDurationNum],
			intensity: Math.floor(Math.random() * 9 + 1),
			urge_to_relapse: Math.floor(Math.random() * 9 + 1),
			fun_factor: Math.floor(Math.random() * 9 + 1),
			category: category[Math.floor(Math.random() * category.length)]
		};

		
		workoutData.shift();
		workoutData.push(obj);
		day++;
		if(day == 32){
			day = 1;
			month++;
			if(month == 13){
				month = 1;
				year++;
			}
		}
		updateCharts();
	};

	// setInterval(addWorkoutObject, 3000);

	function mapRelapses(data1, data2){
		data1.forEach(function(relapse){
			data2.forEach(function(workout){
				if(relapse.date === workout.date){
					workout.relapse = true;
				}
			})
		})
	};

		// logs workout data when modal is closed
	$('#workout-modal').on('hidden.bs.modal', function(){
		buildWorkoutObject();
		updateCharts();
	});

	// logs relapse data when modal is closed
	$('#relapse-modal').on('hidden.bs.modal', function(){
		buildRelapseObject();
		updateCharts();
		console.log('relapse submitted')
	});


	$('#scroll-left').on('click', function(){
		console.log('left');
	});

	$('#scroll-right').on('click', function(){
		console.log('right');
	});

	function show()	{
		$('#greet-user').toggle('fold', 2000);
	}

	setTimeout(show, 1000);

	// $('body').on('click', function(){
	// 	$('#greet-user').toggle('fold');
	// })
	
	 $('#weekly').on('click', function(){
	 	console.log('clickweek');
    	buildLineChartByWeek(dataTransformer.typeLineByWeeks(workoutData));
    });

	 $('#daily').on('click', function(){
    	console.log('clickday');
    	buildLineChart(dataTransformer.typeLineChart(workoutData));
	});
	



})
