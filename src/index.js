(function(){
	// Require stylesheets
	require('./styles/main.scss');

	let d3 = require('d3');
	let interact = require('interactjs');

	let data = [
		{skill: 1, points: [0, 1, 2, 3, 4, 5], score: 0},
		{skill: 2, points: [0, 1, 2, 3, 4, 5], score: 0},
		{skill: 3, points: [0, 1, 2, 3, 4, 5], score: 0},
		{skill: 4, points: [0, 1, 2, 3, 4, 5], score: 0},
		{skill: 5, points: [0, 1, 2, 3, 4, 5], score: 0},
		{skill: 6, points: [0, 1, 2, 3, 4, 5], score: 0},
		{skill: 7, points: [0, 1, 2, 3, 4, 5], score: 0},
		{skill: 8, points: [0, 1, 2, 3, 4, 5], score: 0},
		{skill: 9, points: [0, 1, 2, 3, 4, 5], score: 0},
		{skill: 10, points: [0, 1, 2, 3, 4, 5], score: 0}
	];

	let colorScale = d3.scaleLinear()
		.domain([0, 3, 5])
		.range(['#00FF00', '#e5e500', '#ff0033']);

	let rad = window.innerWidth / 5,
		offset = 100,
		center = {x: window.innerWidth / 2, y: window.innerHeight / 2},
		nodes = createNodes(data),
		active_target = null,
		active_score = null,
		transition_duration = 100,
		index = 0;
	// SVG
	let svg = d3.select('body').append('svg');
	// Arcs, first for colors, second for labels
	let arc = d3.arc()
		.innerRadius(rad)
		.outerRadius(rad + offset)
		.cornerRadius(5);
	let label = d3.arc()
		.innerRadius(rad + offset/2)
		.outerRadius(rad + offset/2);
	// General listener event to handle mouseup
	svg.on('mouseup touchend', handleSelection);

	// Add base elements
	let big_g = svg.append('svg:g');
	let skills_g = big_g
		.selectAll('circle')
		.data(nodes).enter()
			.append('g')
			.attr('id', 'circleContainer')
			.attr('transform', function(d){
				return 'translate(' + d.x + ',' + d.y + ')';
			})
			.on('touchstart mousedown', expand)
			.on('touchmove', function(){
				// First touch
				let touch = d3.event.touches[0],
					elFromPoint = d3.select(document.elementFromPoint(touch.clientX, touch.clientY));

				// Reset all colors
				d3.selectAll('.circleArc')
					.attr('fill', d => {
						active_score = null;
						return d.data.color;
					});
				// Change color on element hovered, if hovered
				if(elFromPoint.attr('class') === 'circleArc'){
					elFromPoint
						.attr('fill', d => {
							active_score = d.data.value;
							return d3.rgb(d.data.color).darker(1); 
						})
				}			
			});
	// Add circles
	skills_g.call(addCircle);

	// Add texts
	skills_g
		.append('text')
		.attr('class', 'inCircle')
		.text(function(d){
			return d.score;
		});
	// Checking
	function checkInsideElement(coords, bbox){
	}
	// Creation Functions
	function createNodes(data){
		return data.reduce((list, element) => {
			// Create outer nodes for points 0->5
			let outerCircles = element.points.reduce((circles, point) => {
				let startAngle = (point / (6 / 2)) * Math.PI,
					endAngle = (((point + 1) > 6 ? 0: point + 1) / (6 / 2)) * Math.PI;
				circles.push({
					value: point,
					startAngle: startAngle,
					endAngle: endAngle,
					r: 30,
					color: colorScale(point)
				});
				return circles;
			}, []);
			// Assign x and y values inside domain
			let x = ((element.skill - 1) * window.innerWidth) + center.x,
				y = center.y;
			list.push({
				id: element.skill,
				score: 0,
				x: x,
				y: y,
				arc: outerCircles
			});
			return list;
		}, [])
	}
	function addCircle(d){
		d.append('svg:circle')
			.attr('cx', 0)
			.attr('cy', 0)
			.attr('r', rad)
			.attr('fill', function(d){return colorScale(d.score)})
			.classed('default', true);
	}
	// Event functions
	function handleSelection(){
		if(!active_target) return;
		// First check if a selection was made
		if(active_score != null){
			index ++;
			// Change text
			d3.select(active_target.parentNode)
				.select('text')
				.text(function(d){
					d.score = active_score;
					return d.score;
				});
			// Change color
			d3.select(active_target.parentNode)
				.select('.default')
				.attr('fill', function(d){
					return colorScale(d.score);
				});
			// Animate
			big_g.call(slide);
			active_score = null;
		}
		// Always collapse when releasing mouse
		d3.selectAll('#circleContainer')
			.each(collapse);

		active_target = null;
	}
	function collapse(d){	
		// Need to save
		let this_node = d3.select(this);
		// Reset lowlight
		d3.selectAll('.default')
			.classed('lowlight', false);
		// Animate first
		d3.select(this)
			.selectAll('.arc')
			.call(fadeOut)
			.on('end', function(){
				this_node.select('g')
					.remove('g');
		});
	}
	function expand(d){
		if(d3.select(d3.event.target).attr('class') !== 'default') return;
	    // handle touchstart here
		active_target = d3.event.target;
		// Prevent further handling
		d3.event.preventDefault();
		// Lowlight not selected circles
		d3.selectAll('.default')
			.classed('lowlight', function(){return active_target !== this})
		let arcs = d3.pie()
			.value(1/6)(d.arc);

		// Group that contains all arcs
		let _arc = d3.select(this)
			.append('svg:g')
		.selectAll('.arc')
			.data(arcs).enter()
			.append('g')
			.attr('class', 'arc');
		// Fill the arcs
		_arc.append('path')
			.attr('class', 'circleArc')
			.attr('fill', function(d){
				return d.data.color;
			})
			.attr('d', arc)
			.on('mouseover', function(d){
				d3.select(this)
					.attr('fill', function(d){
					return d3.rgb(d.data.color).darker(1);
				})
				// Set active score
				active_score = d.data.value;
			})
			.on('mouseout', function(){
				d3.select(this)
					.attr('fill', function(d){return d.data.color;})
				// Reset active score
				active_score = null;
			});
		// Add texts
		_arc.append('text')
			.attr('transform', function(d) { return "translate(" + label.centroid(d) + ")"; })
			.attr('class', 'inCircle')
			.text(function(d){return d.data.value});

		_arc.call(fadeIn);
	}
	// Animation
	function slide(d){
		d.transition()
			.duration(500)
			.attr('transform', 'translate(' + -window.innerWidth*index + ',' + 0 + ')');
	}
	function fadeIn(d){
		d
			.attr('opacity', 0)
			.transition()
			.duration(transition_duration)
				.attr('opacity', 1);
	}
	function fadeOut(d){
		d
			.transition()
			.duration(transition_duration)
				.attr('opacity', 0);
	}

})();
/*
	function placeAround(groups){
		groups
			.attr('transform', function(d){
				return 'translate(' + d.center + ',' + d.center + ')';
			})
			.attr('opacity', 0)
			.transition()
			.duration(transition_duration)
				.attr('transform', function(d){
					return 'translate(' + d.dx + ',' + d.dy + ')';
				})
				.attr('opacity', 1);
	}
*/
		/*
			// Add circles around highlighted circle
			let enter = d3.select(this)
				.append('svg:g')
					.attr('transform', 'translate(' + (-radius)  + ',' + (-radius) + ')')
				//.selectAll('circle')
				.data(d.orbit).enter();
			// Add groups for all data entries
			let group = enter.append('g').call(placeAround);
			// Add a circle and text per group
			group
				.append('svg:circle')
				.attr('r', function(d){return d.r;})
				.attr('fill', function(d){return d.color;})
				.on('mouseover', function(d){
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

			group
				.append('svg:text')
				.attr('class', 'inCircle')
				.text(function(d){return d.id});
		*/