/**
 * Jquery Parallel coordinates extended plugin
 *
 * requires Parallel coordinates v1.0 and JqueryUI 1.8.4
 *
 * Example Usage
 * <code>
 * var markup = [
 *		{
 *			'type'	: 'slider',
 *			'label'	: 'column1',
 *			'min' 	: 0,
 *			'max' 	: 100
 *		},
 *		{
 *			'type'	: 'slider',
 *			'label'	: 'column2',
 *			'min' 	: 100,
 *			'max' 	: 600
 *		}
 * ]; 
 *
 *	$('div.code-demo').parallelcoordinates_extended({
 *	 	color: '3072F3,ff0000,00aaaa,FE6E00,DCFE00,66FE00,0015FE,6100FE,FE1E00',
 *		data: [[70,2], [20,80], [30,43]],
 *		height: 300,
 *		width: 450,
 *		markup: markup
 *	});
 * </code>
 *
 * Future
 * @TODO : filter_data fetch mode
 * @TODO : checkbox
 * @TODO : convert to per cent
 * @TODO : step slider
 * 
 * @author Han Lin Yap < http://zencodez.net/ >
 * @copyright 2010 zencodez.net
 * @license http://creativecommons.org/licenses/by-sa/3.0/
 * @package parallel_coordinates
 * @version 1.0 - 2010-08-14
 */ 
(function($){
	$.fn.parallelcoordinates_extended = function(options) {
		function urldata_to_data(url) {
			var xy = url.split('|');
			xy = jQuery.grep(xy, function (n, i) {
				return (i%2==1);
			});
			xy = jQuery.map(xy, function (n, i) {
				return [n.split(',')];
			});
			return xy;
		} // function urldata_to_data
		
		// urldata to data
		if (options.urldata && options.urldata.length > 0 && options.urldata.split('|').length > 0) {
			options.data = urldata_to_data(options.urldata);
			delete options.urldata;
		}
		
		function get_filter(table) {
			var filter = [];
			$.each(options.markup, function(i, v) {
				if (v.type == 'slider') {
					filter[i] = {
						'max' : (parseInt(table.find('tr:eq(1)').find('td:eq(' + i + ') > input').val()) - v.min) / ((v.max - v.min) / 100),
						'min' : (parseInt(table.find('tr:eq(3)').find('td:eq(' + i + ') > input').val()) - v.min) / ((v.max - v.min) / 100)
					};
				}
			});
			return filter;
		} // function get_filter
		
		function filter_data(table) {
			var cur_filter = get_filter(table);
			return jQuery.grep(options.data, function (n, i) {
				var filter = true;
				$.each(n, function(i, v) {
					n = v / (1 - (55 / (options.height + 50)));
					if (cur_filter[i].min > n || cur_filter[i].max < n) {
						filter = false;
						return false;
					}
				});
				return filter;
			});
		} // function filter_data
		
		// shrink data
		$.each(options.data, function(i, v) {
			options.data[i] = jQuery.map(v, function (n, i) {
				return (n * (1 - (55 / (options.height + 50)))).toFixed(2);
			});
		});
		
		// default options
		var defaults = {
			fetch : false
		};
		var options = $.extend(defaults, options);
		
		return this.each(function() {
			var $this = $(this);
		
			// Initialize
			var html = "<table class='table-coords'>",
				labels = [],
				content = [];
			
			// Labels
			$.each(options.markup, function(i, v) {
				labels.push(v.label);
			});
			html += "<tr><th>" + labels.join('</th><th>') + "</th></tr>";
			
			// Inputbox - max
			$.each(options.markup, function(i, v) {
				if (v.type == 'slider') {
					content.push('<input type="text" value="' + v.max + '" />');
				} else {
					content.push(' ');
				}
			});
			html += "<tr><td>" + content.join('</td><td>') + "</td></tr>";
			content = [];
			
			// Content - slider or checkbox
			$.each(options.markup, function(i, v) {
				content.push('<div class="filter-' + v.type + ' filter-coords"></div>');
			});
			html += "<tr><td style='height: " + (options.height-45) + "px;'>" + content.join("</td><td style='height: " + (options.height-45) + "px;'>") + "</td></tr>";
			content = [];
			
			// Inputbox - min
			$.each(options.markup, function(i, v) {
				if (v.type == 'slider') {
					content.push('<input type="text" value="' + v.min + '" />');
				} else {
					content.push(' ');
				}
			});
			html += "<tr><td>" + content.join('</td><td>') + "</td></tr>";
			
			html += "</table>";
			var table = $this.html(html).find('table');
			table.css({
				width : options.width, 
				height : options.height,
				position : 'absolute',
				top : 0,
				left : 11,
				zIndex : 2
			});
			// Evaluate slider and checkbox and their events
			$.each(options.markup, function(i, v) {
				if (v.type == 'slider') {
					html = '';
					
					m_log = 1;
					while(v.max > m_log * 10 && v.max / m_log > 15) {
						m_log *= 10;
					};
					
					var sticks = (v.max - v.min) / m_log + 1;
					for (j = 0; j < sticks ; j++) {
						// hr
						html += '<span style="display: block; position: absolute; top: ' + Math.round(55 + j*(options.height-45)/(sticks-1)) + 'px; width: 13px; left: ' + Math.round(5 + options.width / options.markup.length * (i + 0.5)) + 'px; border-top: 1px solid #CCC; z-index: 3;"></span>';
						// text
						html += '<span style="display: block; color: #333; padding: 0 2px; background-color: #fff; font-size: 10px; position: absolute; top: ' + Math.round(55 + j*(options.height-45)/(sticks-1) - 5) + 'px; left: ' + Math.round(25 + options.width / options.markup.length * (i + 0.5)) + 'px; z-index: 3;">' + Math.round((sticks-j-1) * m_log + v.min) + '</span>';
					}
					table.before(html);
					
					table.find('tr:eq(2)').find('td:eq(' + i + ') > div').slider({
						orientation: "vertical",
						range: true,
						values: [v.min, v.max],
						min: v.min,
						max: v.max,
						change: function(event, ui) {
							var cur_filter = get_filter(table);
							var filters = {
								data : filter_data(table)
							};
							
							var values = $.extend({}, options, filters);
							
							$this.parallelcoordinates(values);
						},
						slide: function(event, ui) {							
							// Change textbox values
							// max
							table.find('tr:eq(1)').find('td:eq(' + i + ') > input').val(ui.values[1]);
							// min
							table.find('tr:eq(3)').find('td:eq(' + i + ') > input').val(ui.values[0]);
						}
					});
					
					// Change slider when textbox change
					table.find('tr:eq(1)').find('td:eq(' + i + ') > input').bind('blur', function(e) {
						table.find('tr:eq(2)').find('td:eq(' + i + ') > div').slider("values", 1, parseInt($(this).val()));
					});
					
					table.find('tr:eq(3)').find('td:eq(' + i + ') > input').bind('blur', function(e) {
						table.find('tr:eq(2)').find('td:eq(' + i + ') > div').slider("values", 0, parseInt($(this).val()));
					});
				} else {
					// checkbox
				}
			});
			
			// Update on key enter
			table.find('input').bind('keyup', function (e) {
				if (e.keyCode == 13) {
					$(this).trigger('blur');
				}
			});
				
			$this.parallelcoordinates(options);
		});
	};
})(jQuery);