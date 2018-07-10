(function(){
	// Require stylesheets
	require('./styles/main.scss');

	let d3 = require('d3');

	let data = [
		{skill: 1, points: [0, 1, 2, 3, 4, 5]},
		{skill: 2, points: [0, 1, 2, 3, 4, 5]},
		{skill: 3, points: [0, 1, 2, 3, 4, 5]},
		{skill: 4, points: [0, 1, 2, 3, 4, 5]},
		{skill: 5, points: [0, 1, 2, 3, 4, 5]},
		{skill: 6, points: [0, 1, 2, 3, 4, 5]},
		{skill: 7, points: [0, 1, 2, 3, 4, 5]},
		{skill: 8, points: [0, 1, 2, 3, 4, 5]},
		{skill: 9, points: [0, 1, 2, 3, 4, 5]},
		{skill: 10, points: [0, 1, 2, 3, 4, 5]},
	]

	let colorScale = d3.scaleLinear()
		.domain([0, 2.5, 5])
		.range(['#4BB543', '#f48f42', '#ff0033']);

	let radius = 100,
		offset = 50,
		center = {x: window.innerWidth / 2, y: window.innerHeight / 2},
		nodes = createNodes(data),
		active_target = null,
		active_score = null,
		transition_duration = 100;
	// Graphics
	let svg = d3.select('body').append('svg')
		.style('height', '100vh')
		.style('width', '100vw');

	// General listener event to handle mouseup
	svg.on('mouseup', handleSelection);

	// Add base elements
	let skills_g = svg.append('svg:g')
		.selectAll('circle')
		.data(nodes).enter()
			.append('g')
			.attr('id', 'circleContainer')
			.attr('transform', function(d){
				return 'translate(' + d.x + ',' + d.y + ')';
			})
			.on('mousedown', expand);
	
	skills_g
		.append('svg:circle')
			.attr('cx', 0)
			.attr('cy', 0)
			.attr('r', 50)
			.classed('default', true);

	skills_g
		.append('text')
		.attr('class', 'inCircle')
		.text(function(d){
			return d.score;
		});
	// Functions
	function createNodes(data){
		return data.reduce((list, element) => {
			// Create outer nodes for points 0->5
			let outerCircles = element.points.reduce((circles, point) => {
				let angle = (point / (6 / 2)) * Math.PI,
					width = (radius * 2),
					x = (radius * Math.cos(angle)) + (width / 2),
					y = (radius * Math.sin(angle)) + (width / 2);
				circles.push({
					id: point,
					dx: x,
					dy: y,
					center: radius,
					r: 30,
					color: colorScale(point)
				});
				return circles;
			}, []);
			// Assign x and y values inside domain
			let x = (element.skill * 200) + 5,
				y = 500;
			list.push({
				id: element.skill,
				score: 0,
				x: x,
				y: y,
				orbit: outerCircles
			});
			return list;
		}, [])
	}
	// Event functions
	function handleSelection(){
		// First check if a selection was made
		if(active_score){
			console.log(active_score);
			console.log(d3.select(active_target));

		}

		// Always collapse when releasing mouse
		d3.selectAll('#circleContainer')
			.each(collapse);
	}
	function collapse(d){	
		// Need to save
		let this_node = d3.select(this);
		// Reset lowlight
		d3.selectAll('.default')
			.classed('lowlight', false);
		// Animate first
		d3.select(this)
			.select('g')
			.selectAll('circle')
			.transition()
			.duration(transition_duration)
				.attr('cx', function(d){return d.center})
				.attr('cy', function(d){return d.center})
				.attr('opacity', 0)
			.on('end', function(){
			this_node.select('g')
				.remove('circle');
			// Reset active target
			active_target = null;			
		})
	}
	function expand(d){
		active_target = d3.event.target;
		// Lowlight not selected circles
		d3.selectAll('.default')
			.classed('lowlight', function(){return active_target !== this});
		// Add circles around highlighted circle
		d3.select(this)
			.append('svg:g')
				.attr('transform', 'translate(' + (-radius)  + ',' + (-radius) + ')')
			.selectAll('circle')
			.data(d.orbit).enter()
			.append('svg:circle')
			.call(placeAround);
	}
	function placeAround(circles){
		circles
			.attr('r', function(d){return d.r})
			.attr('fill', function(d){return d.color})
			.attr('cx', function(d){return d.center})
			.attr('cy', function(d){return d.center})
			.attr('opacity', 0)
			.transition()
			.duration(transition_duration)
				.attr('opacity', 1)
				.attr('cx', function(d){return d.dx})
				.attr('cy', function(d){return d.dy});
		// Wait until animation done to add event listeners
		setTimeout(function(){
			circles.on('mouseover', function(d){
				d3.select(this)
					.attr('fill', function(d){
						 return d3.rgb(d.color).darker(1);
					})
				// Set active score
				active_score = d.id;
			})
			.on('mouseout', function(){
				d3.select(this)
					.attr('fill', function(d){return d.color;})
				// Reset active score
				active_score = null;
			})
		}, transition_duration);
	}
})();