$(function() {
	var workoutData;
	var relapseData;

	var loadDataRenderCharts = function(data){
		workoutData = data.workouts;
		relapseData = data.relapses;
		updateCharts();
	};

	function updateCharts(){
		$('#last-workout').text(updateLastOccurrence(workoutData));
		$('#clean-time').text(updateLastOccurrence(relapseData));
		$('#total-workouts').text(workoutData.length);
		buildDonutChart(dataTransformer.typeDonutChart(workoutData), "FitMo", "#workout-donut-chart svg");
		buildBarChart(dataTransformer.typeBarChart(workoutData), "Workouts by Type", "#workout-bar-chart svg");
		buildLineChart(dataTransformer.typeLineChart(workoutData), "Workouts by Type", "#workout-line-chart svg");
		updateRelapseMeter(relapseRisk(workoutData));
		updateConsecutive(workoutData);
		mapRelapses(relapseData, workoutData);
	};

	d3.json('data/new_workouts.json', loadDataRenderCharts);


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

	function buildLineChart(data, title, selector){
		nv.addGraph(function() {
	        var chart = nv.models.lineChart();
	        var fitScreen = false;
	        var width = 900;
	        var height = 200;
	        var zoom = 1;

	        chart.useInteractiveGuideline(true);

	        chart.xAxis
	        	.axisLabel("Dates")
                .tickFormat(function(d) {
                    // I didn't feel like changing all the above date values
                    // so I hack it to make each value fall on a different date
                    return d3.time.format('%x')(new Date(d));
                });
	      
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
	            .datum(dataTransformer.typeLineChart(workoutData));

			setChartViewBox();
			resizeChart();

	        nv.utils.windowResize(resizeChart);

	        d3.select('#zoomIn').on('click', zoomIn);
	        d3.select('#zoomOut').on('click', zoomOut);

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

	        function zoomOut() {
	            zoom += .25;
	            setChartViewBox();
	        }

	        function zoomIn() {
	            if (zoom <= .5) return;
	            zoom -= .25;
	            setChartViewBox();
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

	var dataTransformer = {
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
		},
		typeLineChart: function(data){
			var objStorage = [];
			var relapseZoneStorage = [];
			var relapseStorage = [];

			var dateNum; 
			data.forEach(function(item, idx){
				dateNum = new Date(item.date);
				objStorage.push({x: dateNum, y: item.duration});
				relapseZoneStorage.push({x: dateNum, y: 40});
				if(item.relapse == true){
					relapseStorage.push({x: dateNum, y: 120});
				} else {
					relapseStorage.push({x: dateNum, y: 0});
				}
			});

			var results = [
					{
						values: objStorage,
						key: "Duration of Workouts",
						color: "#00ebd2"	
					},
					// {
					// 	values: relapseZoneStorage,
					// 	key: 'Relapse Zone',
					// 	color: '#c40147'	
					// },
					{
						values: relapseStorage,
						key: 'Relapses',
						color: '#c40147'
					}	
				];
			return results;
		}
		
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

	// $('#relapse-modal').modal('show');

	function buildWorkoutObject(){
		var typeInput = $('#type-input').val();
		var durationInput = Number($('#duration-input').val());
		var intensityInput = Number($('#intensity-input').val());
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
		var $relapseText = $('#relapse-meter');
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

	function updateConsecutive(data){
		var x = data.map(function(item, index, array){
			var obj = {};
			for(var key in item){
				if(key == 'date'){
					obj.date = new Date(item[key]).getTime();
				} else obj[key] = item[key];
			}
			return obj;
		});

		var today = new Date().getTime();
		var convertNum = 86400000;

		var days = 0, lastWorkout;

		for (var i = 1; i < data.length; i++) {
			lastWorkoutDuration = x[x.length - i].duration;

			if(lastWorkoutDuration !== 0){
				days++;
			} else {
				$('#total-workouts').text(days);
				return days;
			}		
		}		
	};

	var month = 11;
	var day = 20;
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

	// setInterval(addWorkoutObject, 2000);

// function draw(data) {
// 	"use strict";
// 	var num = 0;
// 	d3.select('#workout-line-chart svg')
// 		.selectAll('circle')
// 		.data(data.relapses)
// 		.enter()
// 		.append('circle')
// 		.attr({
// 			'cx': function(d, i){return i * 100},
// 			'cy': function(d){return 5},
// 			'r': 10,
// 			'fill': 'rgba(255, 0, 0, .2)',
// 			'stroke': 'white'
// 		})
// 		.on('mouseover', function(){

// 			d3.select(this).transition().ease('back').duration(1000).attr('r', num += 25);
// 		})


// };

// d3.json('../data/new_workouts.json', draw);

function mapRelapses(data1, data2){
	data1.forEach(function(relapse){
		data2.forEach(function(workout){
			if(relapse.date === workout.date){
				workout.relapse = true;
			}
		})
	})
};


	

	




})
