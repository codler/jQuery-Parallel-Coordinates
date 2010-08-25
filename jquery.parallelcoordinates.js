/**
 * Jquery Parallel coordinates plugin
 *
 * Usage example 
 * <code>
$('div.code-demo').parallelcoordinates({
	color: '3072F3,ff0000,00aaaa,FE6E00,DCFE00,66FE00,0015FE,6100FE,FE1E00',
	data: [[1,2,30,4],[4,3,2,1]],
	height: 300,
	width: 450
});
 * </code>
 * This will replace div.code-demo with an iframe which the Google chart will render
 * Parameter data - values are in per cent.
 *
 * @author Han Lin Yap < http://zencodez.net/ >
 * @copyright 2010 zencodez.net
 * @license http://creativecommons.org/licenses/by-sa/3.0/
 * @package parallel_coordinates
 * @version 1.1 - 2010-08-14
 */

(function($){
	$.fn.parallelcoordinates = function(options) {
		function render_chart(color, data, element, size, cache) {
			// Cache
			cache = (!cache) ? '?' + new Date().getTime() : '';
			
			// iframe html
			var html = '&lt;!DOCTYPE html&gt; &lt;html&gt; &lt;head&gt; &lt;script&gt; \
document.getElementById(\'post_form\').submit(); \
&lt;/script&gt; &lt;/head&gt; &lt;body&gt; \
&lt;form action="http://chart.apis.google.com/chart' + cache + '" method="POST" id="post_form"&gt; \
	&lt;input type="hidden" name="cht" value="lxy:nda" /&gt; \
	&lt;input type="hidden" name="chs" value="' + size.width + 'x' + size.height + '" /&gt; \
	&lt;input type="hidden" name="chco" value="' + color + '" /&gt; \
	&lt;input type="hidden" name="chd" value="t:' + data + '" /&gt; \
	&lt;input type="submit" style="visibility: hidden;" /&gt; \
&lt;/form&gt; &lt;/body&gt; &lt;/html&gt;';	
			
			// setup iframe
			iframe = document.createElement("iframe");
			iframe.src = "/index-blank.html";
			iframe.width = size.width + 50;
			iframe.height = size.height + 50;
			iframe.style.border = "none";
			
			iframe.style.position = 'absolute';
			iframe.style.top = "0px";
			iframe.style.left = "0px";
			if ($.browser.msie) {
				iframe.style.top = "-7px";
				iframe.style.left = "-4px";
			} else if ($.browser.webkit) {
				iframe.style.top = "8px";
				iframe.style.left = "6px";
			} else {
				iframe.style.top = "0px";
				iframe.style.left = "0px";
			}
			/**
			 * Fix iframe border bug in IE7
			 * @link http://codingforums.com/showthread.php?t=140363
			 */
			iframe.setAttribute("frameBorder","0");
			if ($(element).find("iframe").length == 0) {
				$(element).append(iframe).css('position', ($.browser.msie) ? 'absolute' : 'relative');
			} else {
				$(element).find("iframe").replaceWith(iframe).css('position', ($.browser.msie) ? 'absolute' : 'relative');
			}
			
			var doc = iframe.contentDocument || 
				(iframe.contentWindow && iframe.contentWindow.document) || 
				iframe.document || 
				null;
					
			if (doc == null) {
				return true;
			}
			
			html = html.replace(/<\/?a.*?>/ig, "")
				.replace(/<\/?strong.*?>/ig, "")
				.replace(/&lt;/g, "<").replace(/&gt;/g, ">")
				.replace(/&amp;/g, "&");
			
			html = html
				.replace(/<script>([^<])/g,"<script>window.onload = (function(){\ntry{$1")
				.replace(/([^>])<\/sc/g,  '$1\n}catch(e){}});</sc');

			html = html
				.replace("</head>", "<style>html,body{border:0; margin:0; padding:0;}</style></head>");

			doc.open();
			doc.write( html );
			doc.close();
		} // function render_chart
	
		var columns = (options.urldata && options.urldata.length > 0 && options.urldata.split('|').length > 0) ? options.urldata.split('|')[0].split(',').length : 0;
		columns = (columns == 0 && options.data && options.data.length > 0) ? options.data[0].length : columns;
		// default options
		var defaults = {
			color: 'CCCCCC',
			columns: columns,
			data: [],
			height: 300,
			urldata: false,
			width: 1000
		};
		var options = $.extend(defaults, options);
		
		// precalculate x position
		x = [];
		for (var i = 0; i < options.columns; i++) {
			x.push(Math.round(i*(100/options.columns)+100/options.columns/2));
		}
		x = x.join(',');
		
		// options.urldata
		if (options.urldata) {
			working_data = options.urldata;
			
			working_data = jQuery.map(working_data.split('|'), function (n, i) {
				return (i%2==0) ? x : n;
			});
			working_data = working_data.join('|');
		} else {
			// options.data
		
			// convert data to google chart url
			working_data = [];
			$.each(options.data, function(index, value) { 
				y = [];
				for (var i = 0; i < options.columns; i++) {
					y.push(options.data[index][i]);
				}
				working_data.push(x);
				working_data.push(y.join(','));
			});
			
			working_data = working_data.join('|');
		}

		return this.each(function() {
			$(this).addClass('p-coords');
			// render chart
			render_chart(options.color, working_data, this, {
				'height' : options.height, 
				'width' : options.width
			});
		});
	};
})(jQuery);