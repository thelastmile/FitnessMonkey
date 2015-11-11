// console.log('connected');

function draw(data){
			var myData = data.workouts;
			console.log(myData, myData.length);

			// eventually this will need to call
			// window.height?
			var w = 700, h = 350;

			var svg = d3.select('#dataViz').append('svg').attr({width: w, height: h});

			var xExtent = d3.extent([1, 7]);
			var yExtent = d3.extent([0, d3.max(myData, function(d){return d.duration})]);

			var xScale = d3.scale.linear().domain(xExtent).range([30, 695]);
			var yScale = d3.scale.linear().domain(yExtent).range([330, 5]);

			svg.selectAll('circle')
				.data(myData)
				.enter()
				.append('circle')
				.attr({
					'cx': function(d, i){return xScale(i + 1)},
					'cy': function(d){return yScale(d.duration)},
					'r': '3',
					'fill': 'limegreen'
				
				})
				.append('title').text(function(d){return 'date: ' + d.date + '\ntype: ' + d.type + '\nintensity: ' + d.intensity})

			// Create the X-axis
			var xAxis = d3.svg.axis()
							.scale(xScale)
							.orient('bottom')
							.ticks(7);

			svg.append('g')
				.attr('class', 'axis')
				.attr('transform', 'translate(0,' + (h - 20) + ')')
				.call(xAxis);


			// Create the Y-axis
			var yAxis = d3.svg.axis()
							.scale(yScale)
							.orient('left');

			svg.append('g')
				.attr('class', 'axis')
				.attr('transform', 'translate(30, 0)')
				.call(yAxis);


			// Create the path to connect the dots
			var line = d3.svg.line()
							.interpolate('cardinal')
							.x(function(d, i){return xScale(i + 1)})
							.y(function(d){return yScale(d.duration)});

			svg.append('path')
				.attr('d', line(myData))
				.attr('class', 'wavyLine')
				.attr('fill', 'none')
				.attr('stroke', 'limegreen');

			// this click function shows how the date will be updated over time
			svg.on('click', function(){
				var x = myData.pop();
				myData.unshift(x);
				
				d3.selectAll('title').remove();

				d3.selectAll('circle')
					.data(myData)
					.transition()
					.duration(1000)
					.attr({
						'cx': function(d, i){return xScale(i + 1)},
						'cy': function(d){return yScale(d.duration)},
						'r': 3,
						'fill': 'dodgerblue'
					})

				d3.selectAll('circle')
					.append('title').text(function(d){return 'date: ' + d.date + '\ntype: ' + d.type + '\nintensity: ' + d.intensity})

				svg.select('.wavyLine')
					.transition()
					.duration(1000)
					.attr('d', line(myData))
					.attr('stroke', 'dodgerblue');
				
			})


		};

		d3.json('../data/workouts.json', draw);
