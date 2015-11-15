$(function() {
	var workoutData;
	var relapseData;

	var loadDataRenderCharts = function(data){
		workoutData = data.workouts;
		relapseData = data.relapses;
		updateCharts();
	};

	function updateCharts(){
		$('#total-workouts').text(workoutData.length);
		$('#last-workout').text(updateLastWorkout(workoutData));
		$('#clean-time').text(updateDaysClean(relapseData));
		buildDonutChart(dataTransformer.typeDonutChart(workoutData), "FitMo", "#workout-donut-chart svg");
		buildBarChart(dataTransformer.typeBarChart(workoutData), "Workouts by Type", "#workout-bar-chart svg");
		buildLineChart(dataTransformer.typeLineChart(workoutData), "Workouts by Type", "#workout-line-chart svg");		
	};

	d3.json('../data/new_workouts.json', loadDataRenderCharts);

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
	        d3.selectAll('text').style('font-family', 'sawasdee');

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
        		.duration(250);
      
    		d3.select(selector)
        		.datum(chartData)
        		.call(chart);

    		nv.utils.windowResize(chart.update);
    		d3.selectAll('text').style('font-family', 'sawasdee');
    		return chart;
		});
	};

	function buildLineChart(data, title, selector){
		nv.addGraph(function() {
	        var chart = nv.models.lineChart();
	        var fitScreen = false;
	        var width = 900;
	        var height = 300;
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
	            .tickFormat(d3.format(',.2f'));

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
	                .transition().duration(500)
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
	        d3.selectAll('text').style({'font-family': 'sawasdee', 'fill': 'limegreen'});
    		return chart;
		});
	};

	var dataTransformer = {
		typeDonutChart: function(data){
			var categoryObj = {};
			var results = [];

			data.forEach(function(obj){
				if(obj.category == null){
					return;
				}
				if(categoryObj[obj.category]){
					categoryObj[obj.category]++;
				} else {
					categoryObj[obj.category] = 1;
				}
			})
			for(var key in categoryObj){
				results.push({key: key, y: categoryObj[key]});
			}
			// console.log(results);
			return results;
		},
		typeBarChart: function(data){
			var typeObj = {};
			var results = [];

			data.forEach(function(obj){
				if(obj.category == null){
					return;
				} else if(typeObj[obj.category]){
					typeObj[obj.category]++;
				} else typeObj[obj.category] = 1;
			})

			for(var key in typeObj){
				results.push({'label': key, 'value': typeObj[key]});
			}
			console.log(results)
			return results;
		},
		typeLineChart: function(data){
			var objStorage = [];

			var dateNum; 
			data.forEach(function(item, idx){
				dateNum = new Date(item.date);
				objStorage.push({x: dateNum, y: item.duration})
			});

			var results = [
					{
						values: objStorage,
						key: "Duration of Workouts",
						color: "dodgerblue"	
					}
				];
			return results;
		}
	};



	$('#add-workout').on('submit', function(e){
		e.preventDefault();
		var type = $('#type-input').val();
		var duration = $('#duration-input').val();
		var intensity = $('#intensity-input').val();
		var date = new Date();

		$('#add-workout').hide();
		$('.ads').slideToggle();

		workoutData.push({date: date, type: type, duration: duration, intensity: intensity});
		updateCharts();
	});

	$('#log-workout-btn').on('click', function(){
		$('.ads').hide();
		$('#add-workout').slideToggle();
	});

	$('#log-relapse-btn').on('click', function(){
		$('.ads').hide();
		$('#log-relapse').slideToggle();
	});

	$('#log-relapse').on('submit', function(e){
		e.preventDefault();
		buildRelapseObject();

		var today = new Date();
		var substanceType = 
		$(this).hide();
		$('.ads').show();
	});

	function buildRelapseObject(){
		var today = new Date();
		var substanceType = $('input[name="substance-type"]:checked').val();
		var place = $('#location-input').val();
		var associations = $('input[name="association-type"]:checked').val();
		var emotion = $('input[name="emotion-type"]:checked').val();
		var attitude = $('input[name="attitude-type"]:checked').val();
		var obj = {date: today, subtance: substanceType, location: place, associations: associations, emotions: emotion, attitude: attitude};
		relapseData.push(obj);
		$('#clean-time').text(updateDaysClean(relapseData));
	}

	 // $('input[name="question' + questionCount + '"]:checked').val();

	function updateLastWorkout(data){
		var recent = data[data.length - 1];

		var today = new Date().getTime();
		var last = new Date(recent.date).getTime();


		var days = Math.floor((today - last) / 1000 / 60 / 60 / 24);
		return days;
	};



	function updateDaysClean(data){
		var today = new Date().getTime();
		var lastRelapse = new Date(data[data.length - 1].date).getTime();
		var time = today - lastRelapse;
		var convertNum = 1000 * 60 * 60 * 24;

		return Math.floor(time / convertNum)
	};

	function updateRelapseMeter(num){
		var randomNum = (Math.random() * 9).toFixed(1);
		var $relapseText = $('#relapse-meter');
		var $outer = $('#inner');
		if(randomNum <= 3){
			$relapseText.css('color', 'limegreen').text(randomNum);
		} else if(randomNum > 3 && randomNum <= 6){
			$relapseText.css('color', 'yellow').text(randomNum);
		} else {
			$relapseText.css('color', 'red').text(randomNum);
		}
	};

	setInterval(updateRelapseMeter, 10000)

	




})