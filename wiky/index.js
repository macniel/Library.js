/**
 * js - Javascript library to converts Wiki MarkUp language to HTML.
 * You can do whatever with it. Please give me some credits (Apache License)
 * - Tanin Na Nakorn 
 */

var references = [];
var link = 0;

exports.process = function(wikitext) {
	console.log("Wiki Processor");
	var lines = wikitext.split(/\n/);
	var TOC = ""
	link = 0;
	references = [];
	var html = "<p>";
	
	for (i=0;i<lines.length;i++)
	{
		line = lines[i];

		if (line.match(/^====+(\s*)====$/)!=null )
		{
			html += "</p><a name='" + line.substring(4,line.length-4) +"'/><h5>"+line.substring(4,line.length-4)+"</h5><p>";
			TOC += "<span style='padding-left:45px'><a href='#" + line.substring(4,line.length-4) + "'>" + line.substring(4,line.length-4) + "</a></span> <br/>"
		}
		else if (line.match(/^====.+$/)!=null )
		{
			html += "</p><a name='" + line.substring(4,line.length) +"'/><h5>"+line.substring(4,line.length)+"</h5><p>";
			TOC += "<span style='padding-left:45px'><a href='#" + line.substring(4,line.length) + "'>" + line.substring(4,line.length) + "</a></span> <br/>"
		}
		else if (line.match(/^===+(\s*)===$/)!=null )
		{
			html += "</p><a name='" + line.substring(3,line.length) +"'/><h4>"+line.substring(3,line.length-3)+"</h4><p>";
			TOC += "<span style='padding-left:30px'><a href='#" + line.substring(3,line.length-3) + "'>" + line.substring(3,line.length-3) + "</a></span> <br/>"
		}
		else if (line.match(/^===.+$/)!=null )
		{
			html += "</p><a name='" + line.substring(3,line.length) +"'/><h4>"+line.substring(3,line.length)+"</h4><p>";
			TOC += "<span style='padding-left:30px'><a href='#" + line.substring(3,line.length) + "'>" + line.substring(3,line.length) + "</a></span> <br/>"
		}
		else if (line.match(/^==+(\s*)==$/)!=null )
		{
			html += "</p><a name='" + line.substring(2,line.length) +"'/><h3>"+line.substring(2,line.length-2)+"</h3><p>";
			TOC += "<span style='padding-left:15px'><a href='#" + line.substring(2,line.length-2) + "'>" + line.substring(2,line.length-2) + "</a></span> <br/>"
		}
		else if (line.match(/^==.+$/)!=null )
		{
			html += "</p><a name='" + line.substring(2,line.length) +"'/><h3>"+line.substring(2,line.length)+"</h3><p>";
			TOC += "<span style='padding-left:15px'><a href='#" + line.substring(2,line.length) + "'>" + line.substring(2,line.length) + "</a></span> <br/>";
		}
		else if (line.match(/^=+(\s*)=$/)!=null )
		{
			html += "</p><a name='" + line.substring(1,line.length) +"'/><h2>"+line.substring(1,line.length-1)+"</h2><p>";
			TOC += "<span style='padding-left:0px'><a href='#" + line.substring(1,line.length-1) + "'>" + line.substring(1,line.length-1) + "</a></span> <br/>"
		}
		else if (line.match(/^=.+$/)!=null )
		{
			html += "</p><a name='" + line.substring(1,line.length) +"'/><h2>"+line.substring(1,line.length)+"</h2><p>";
			TOC += "<span style='padding-left:0px'><a href='#" + line.substring(1,line.length) + "'>" + line.substring(1,line.length) + "</a></span><br/>"
		}
		else if (line.match(/^\|/)!=null)
		{
			// find start line and ending line
			start = i;
			while (i < lines.length && lines[i].match(/^\|/)!=null) 
			{ 
				i++;
			}
			i--;
			console.log("processing table");
			html += process_table(lines, start, i);
		}
		else if (line.match(/^----+(\s*)$/)!=null)
		{
			html += "</p><hr/><p>";
		}
		else if (line.match(/^<<Template:/)!=null) 
		{
			// find start line and ending line
			start = i;
			console.log(i + ": " + lines[i]);
			var j = i;
			while (i < lines.length && lines[i].match(/>>$/)==null) i++;
			html += process_template_block(lines,start,i);
			i = j;
		}
		else if (line.match(/\{\{\{/)!=null)
		{
			// find start line and ending line
			start = i;
			while (i < lines.length && lines[i].match(/\}\}\}/)==null) i++;
			html += process_no_format(lines,start,i);
		}	
		else if (line.match("'''")!=null)
		{
			// find start line and ending line
			start = i;
			while (i < lines.length && lines[i].match("'''")==null) i++;
			html += process_blockquote(lines,start,i);
		}	
		else if (line.match(/^(\*+) /)!=null)
		{
			// find start line and ending line
			start = i;
			while (i < lines.length && lines[i].match(/^(\*+|\#\#+)\:? /)!=null) i++;
			i--;
			
			html += process_bullet_point(lines,start,i);
		}
		else if (line.match(/^(\#+) /)!=null)
		{
			// find start line and ending line
			start = i;
			while (i < lines.length && lines[i].match(/^(\#+|\*\*+)\:? /)!=null) i++;
			i--;
			
			html += process_bullet_point(lines,start,i);
			
		}
		else if ( line.match(/^$/)!=null)
		{
			html += "</p><p>";
		}
		else 
		{
			html += process_normal(line);

		}
	}
	var org;
	do 
	{
		org = html;
		html = html.replace("</ul><br>", "</ul>");
		html = html.replace("</ol><br>", "</ol>");
	} 
	while ( html != org );
	html = html.replace("<references/>", process_referencelist());
	html = html.replace("__TOC__", "<div class='toc'>" + TOC + "</div>");
	html = html.replace("__PAGECOUNT__", require("../controller/topics").count());
	return html;
}

process_template_block = function(lines, start, end) {
	var templateName;
	var topics = require("../controller/topics");
	var content;
	if ( lines[start].indexOf("|") == -1 && lines[start].indexOf(">>") == -1) {
		templateName = lines[start].substring(2).replace(/^\s+|\s+$/g, "");
	} else if ( lines[start].indexOf(">>") != -1 ) {
		templateName = lines[start].substring(2, lines[start].indexOf(">>")).replace(/^\s+|\s+$/g, "");
	} else {
		templateName = lines[start].substring(2, lines[start].indexOf("|") - 1).replace(/^\s+|\s+$/g, "");
	}
	// does this template exists?
	if ( topics.hasTopic(templateName) ) {
		
		content = topics.get("/" + templateName)["parsed"];
		for ( var i = start; i <= end; i++) {
		// parameter
			parameter = /\|(.+)/.exec(lines[i]); // | parameter = value
			if ( parameter != null ) {
				
				param = parameter[1].substring(0, parameter[1].indexOf("="));
				value = parameter[1].substring(parameter[1].indexOf("=") + 1, parameter[1].length);
				param = param.replace(/^\s+|\s+$/g, ""); // trim string
				value = value.replace(/^\s+|\s+$/g, ""); // trim string
				console.log(value);
				content = content.replace("<<<" + param + ">>>", process_normal(value));
			}
			lines[i] = "";
		}
		return content.replace(/<<<.+?>>>/g, "");
	}
	return "";
}

process_referencelist = function() {
	
	var html = "<a name='Referenzen'/><h2>Referenzen</h2><ul class='references'>";
	var once = false;
	for ( cited in references ) {
		if ( !once ) {
			once = true;
			TOC += "<span style='padding-left:0px'><a href='#Referenzen'>Referenzen</a></span> <br/>"
		}
		var text = "" + cited;
		html += "<li><a name='ref-" + references[cited] + "' /><sup>" + references[cited] + "</sup>" + process_normal(text) + "</li>";
	}
	return html += "</ul>";
}
process_blockquote = function(lines, start, end) {
	var i = start;
	var html = "";
	
	for(var i=start;i<=end;i++) {
		var text = process_normal(lines[i]);
		var ref  = /\((.+)\)?/.exec(text);
		var cited = "";
		if ( ref != null ) {
			++link;
			cited = ref.pop();
			cited = cited.substring(0, cited.length - 1);
			references[cited] = link;
		}
		html += lines[i].replace(/^'''/,"<blockquote>").replace(/'''$/, "</blockquote>").replace(/'''\(.+?\)/, "<sup>[<a href='#ref-" + link + "'>" + link + "</a>]</sup></blockquote>");
	}
	
	return html;
}


process_table = function(lines, start, end) {
	var i = start;
	var html = "<table border=\"1\">";
	
	for(var i=start;i<=end;i++) {
		html += "<tr>";
		
			cells = lines[i].split("|");
			for ( cell in cells ) {
				if ( typeof cells[cell] == "string" && cells[cell] ) {
					if ( cells[cell].indexOf("=") == -1)  // td
					{
						html += "<td>" + process_normal(cells[cell]) + "</td>";
					}
					else // th
					{
						html += "<th>" + process_normal(cells[cell].substring(1)) + "</th>";
					}
				}
			}
		
		html += "</tr>";
	}
	html += "</table>";
	return html;
}

process_no_format = function(lines, start, end) {
	var i = start;
	var html = lines[start].replace(/^\{\{\{/, "<tt>");
	for ( var i = start+1; i < end; i++) {
		html += process_inline_no_format(lines[i].replace(/^\{\{\{/, "").replace(/\}\}\}$/, "")) + "<br>";
	}
	html += lines[end].replace(/\}\}\}$/, "</tt>");
	return html;
}

process_indent = function(lines,start,end) {
	var i = start;
	
	var html = "<dl>";
	
	for(var i=start;i<=end;i++) {
		
		html += "<dd>";
		
		var this_count = lines[i].match(/^(\:+) /)[1].length;
		
		html += process_normal(lines[i].substring(this_count));
		
		var nested_end = i;
		for (var j=i+1;j<=end;j++) {
			var nested_count = lines[j].match(/^(\:+) /)[1].length;
			if (nested_count <= this_count) break;
			else nested_end = j;
		}
		
		if (nested_end > i) {
			html += process_indent(lines,i+1,nested_end);
			i = nested_end;
		}
		
		html += "</dd>";
	}
	
	html += "</dl>";
	return html;
}

process_bullet_point = function(lines,start,end) {
	var i = start;
	
	var html = (lines[start].charAt(0)=='*')?"<ul>":"<ol>";
	
	for(var i=start;i<=end;i++) {
		
		html += "<li>";
		
		var this_count = lines[i].match(/^(\*+|\#+) /)[1].length;
		
		html += process_normal(lines[i].substring(this_count+1));
		
		// continue previous with #:
		{
			var nested_end = i;
			for (var j = i + 1; j <= end; j++) {
				var nested_count = lines[j].match(/^(\*+|\#+)\:? /)[1].length;
				
				if (nested_count < this_count) 
					break;
				else {
					if (lines[j].charAt(nested_count) == ':') {
						html += process_normal(lines[j].substring(nested_count + 2));
						nested_end = j;
					} else {
						break;
					}
				}
					
			}
			
			i = nested_end;
		}
		
		// nested bullet point
		{
			var nested_end = i;
			for (var j = i + 1; j <= end; j++) {
				var nested_count = lines[j].match(/^(\*+|\#+)\:? /)[1].length;
				if (nested_count <= this_count) 
					break;
				else 
					nested_end = j;
			}
			
			if (nested_end > i) {
				html += process_bullet_point(lines, i + 1, nested_end);
				i = nested_end;
			}
		}
		
		// continue previous with #:
		{
			var nested_end = i;
			for (var j = i + 1; j <= end; j++) {
				var nested_count = lines[j].match(/^(\*+|\#+)\:? /)[1].length;
				
				if (nested_count < this_count) 
					break;
				else {
					if (lines[j].charAt(nested_count) == ':') {
						html += process_normal(lines[j].substring(nested_count + 2));
						nested_end = j;
					} else {
						break;
					}
				}
					
			}
			
			i = nested_end;
		}
		
		html += "</li>";
	}
	
	html += (lines[start].charAt(0)=='*')?"</ul>":"</ol>";
	return html;
}

process_url = function(txt) {
	var index = txt.indexOf("|");
	
	if (index == -1) 
	{
		txt = txt.substring(1);
		return "<a title='" + txt + "' target='"+txt+"' href='"+txt+"' style='background: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAFZJREFUeF59z4EJADEIQ1F36k7u5E7ZKXeUQPACJ3wK7UNokVxVk9kHnQH7bY9hbDyDhNXgjpRLqFlo4M2GgfyJHhjq8V4agfrgPQX3JtJQGbofmCHgA/nAKks+JAjFAAAAAElFTkSuQmCC\") no-repeat scroll right center transparent;padding-right: 13px;'>"+txt+"</a>";
	}
	else
	{
		url = txt.substring(1,index);
		label = txt.substring(index+1);
		return "<a title='" + url + "' target='"+url+"' href='"+url+"' style='background: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAFZJREFUeF59z4EJADEIQ1F36k7u5E7ZKXeUQPACJ3wK7UNokVxVk9kHnQH7bY9hbDyDhNXgjpRLqFlo4M2GgfyJHhjq8V4agfrgPQX3JtJQGbofmCHgA/nAKks+JAjFAAAAAElFTkSuQmCC\") no-repeat scroll right center transparent;padding-right: 13px;'>"+label+"</a>";
	}
}

process_internal_url = function(txt) {
	
	var index = txt.indexOf("|");
	if (index == -1) 
	{
		txt = txt.substr(1);
		if ( require("../controller/Topics").hasTopic(txt) != false )
			return "<a title='" + txt + "' href='#' onclick='describe(\"" + txt +"\")'>"+txt+"</a>";
		else
			return "<a title='" + txt + "' href='#' class=\"redlink\" onclick='describe(\"" + txt +"\")'>"+txt+"</a>";
		
	}
	else
	{
		url = txt.substring(1,index);
		label = txt.substring(index+1);
		if ( require("../controller/Topics").hasTopic(url) )
			return "<a title='" + url + "' href='#' onclick='describe(\"" + url +"\")'>"+label+"</a>";
		else
			return "<a title='" + url + "' href='#' class=\"redlink\" onclick='describe(\"" + url +"\")'>"+label+"</a>";
		
	}

}

process_image = function(txt) {
	var index = txt.indexOf("|");
	url = txt;
	label = "";
	if (index > -1) 
	{
		
		url = txt.substring(0,index);
		label = txt.substring(index+1);
		
		if ( label.indexOf("|") > -1 ) 
		{
			index = label.indexOf("|");
			floating = label.substring(0, index);
			switch ( floating ) {
				case 'float left' : 
					style = "float:left";
				break;
				case 'float right' :
					style = "float:right"
				break;
				case 'left' :
					style = "text-align: left"
				break;
				case 'right' :
					style = "text-align: right"
				break;
				case 'center' :
					style = "text-align: center"
				break;
			}
			label = label.substring(index+1);
			return "<a href=\"#\" style=\"" + style +"\" onclick=\"file('" + url + "')\"><img style=\"max-width:100%\" src='images/"+url+"' alt=\""+label+"\"/></a>"; 
		}
		else 
		{
			var style = "";
			switch ( label ) {
				case 'float left' : 
					style = "float:left";
				break;
				case 'float right' :
					style = "float:right"
				break;
				case 'left' :
					style = "text-align: left"
				break;
				case 'right' :
					style = "text-align: right"
				break;
				case 'center' :
					style = "text-align: center"
				break;
			}
			if ( style == "" ) 
			{
				return "<a href=\"#\" onclick=\"file('" + url + "')\"><img style=\"max-width:100%\" src='images/"+url+"' alt=\""+label+"\"/></a>"; 
			} 
			else {
				return "<a href=\"#\" style=\""+style+"\" onclick=\"file('" + url + "')\"><img style=\"max-width:100%\" src='images/"+url+"' /></a>"; 
			}
		}
	}
	else 
	{
		return "<a href=\"#\" onclick=\"file('" + url + "')\"><img style=\"max-width:100%\" src='images/"+url+"' /></a>";
	}
	
}

process_line_break = function() {
	return "<br>";
}

process_inline_no_format = function(txt) {
	txt = txt.replace(/#/g, "&#35;");
	txt = txt.replace(/\//g, "&#47;"); 
	txt = txt.replace(/\*/g, "&#42;");
	txt = txt.replace(/</g, "&#60;");
	txt = txt.replace(/>/g, "&#62;");
	txt = txt.replace(/\{/g, "&#123;");
	txt = txt.replace(/\}/g, "&#125;");
	txt = txt.replace(/\|/g, "&#124;");
	return txt;
}

process_normal = function(wikitext) {

	// Image
	{
		var index = wikitext.indexOf("{{{");
			var end_index = wikitext.indexOf("}}}", index + 3);
			while (index > -1 && end_index > -1) {
				
				wikitext = wikitext.substring(0,index) 
							+ process_inline_no_format(wikitext.substring(index+3,end_index)) 
							+ wikitext.substring(end_index+3);
			
				index = wikitext.indexOf("{{{");
				end_index = wikitext.indexOf("}}}", index + 3);
			}
	}

	// Image
	{
		var index = wikitext.indexOf("{{");
			var end_index = wikitext.indexOf("}}", index + 2);
			while (index > -1 && end_index > -1) {
				
				wikitext = wikitext.substring(0,index) 
							+ process_image(wikitext.substring(index+2,end_index)) 
							+ wikitext.substring(end_index+2);
			
				index = wikitext.indexOf("{{");
				end_index = wikitext.indexOf("}}", index + 2);
			}
	}

	// Linebreak
	
	{
		var index = wikitext.indexOf("\\");
		while (index > -1 ) {
			wikitext = wikitext.substring(0,index) 
						+ process_line_break() 
						+ wikitext.substring(index+2);
		
			index = wikitext.indexOf("\\");
			end_index = index +2;
		}
	}

	// Internal URL
	
	var index = wikitext.indexOf("[[");
	var end_index = wikitext.indexOf("]]", index + 1);
	while (index > -1 && end_index > -1) {
		if ( wikitext.indexOf("://", index + 1) != -1) 
		{ // External URL 
			wikitext = wikitext.substring(0,index) 
						+ process_url(wikitext.substring(index+1,end_index)) 
						+ wikitext.substring(end_index+2);
		
			index = wikitext.indexOf("[[",end_index+1);
			end_index = wikitext.indexOf("]]", index +1);
		}
		else 
		{
			wikitext = wikitext.substring(0,index) 
						+ process_internal_url(wikitext.substring(index+1,end_index)) 
						+ wikitext.substring(end_index+2);
		
			index = wikitext.indexOf("[[",end_index+1);
			end_index = wikitext.indexOf("]]", index +1);
		}
	}

	// Inlinequote
	{
		var index = wikitext.indexOf("''");
		var end_index = wikitext.indexOf("''", index + 2);
		while (index > -1 && end_index > -1) {
			
			wikitext = wikitext.substring(0,index) 
						+ "<q>" + wikitext.substring(index+2,end_index) + "</q>"
						+ wikitext.substring(end_index+2);
		
			index = wikitext.indexOf("''");
			end_index = wikitext.indexOf("''", index + 2);
		}
	}

	
	// Superscript

	{
		var index = wikitext.indexOf("^^");
		var end_index = wikitext.indexOf("^^", index + 2);
		while (index > -1 && end_index > -1) {
			
			wikitext = wikitext.substring(0,index) 
						+ "<sup>" + wikitext.substring(index+2,end_index) + "</sup>"
						+ wikitext.substring(end_index+2);
		
			index = wikitext.indexOf("^^");
			end_index = wikitext.indexOf("^^", index + 2);
		}
	}

	// Subscript

	{
		var index = wikitext.indexOf("~~");
		var end_index = wikitext.indexOf("~~", index + 2);
		while (index > -1 && end_index > -1) {
			
			wikitext = wikitext.substring(0,index) 
						+ "<sub>" + wikitext.substring(index+2,end_index) + "</sub>"
						+ wikitext.substring(end_index+2);
		
			index = wikitext.indexOf("~~");
			end_index = wikitext.indexOf("~~", index + 2);
		}
	}	
	var count_b = 0;
	var index = wikitext.indexOf("**");
	while(index > -1) {
		
		if ((count_b%2)==0) wikitext = wikitext.replace("**","<strong>");
		else wikitext = wikitext.replace("**","</strong>");
		
		count_b++;
		
		index = wikitext.indexOf("**",index);
	}
	
	var count_i = 0;
	var index = wikitext.indexOf("//");
	if ( wikitext[index-1] != ":" ) { // ignore ://
		while(index > -1) {
			
			if ((count_i%2)==0) wikitext = wikitext.replace("//","<em>");
			else wikitext = wikitext.replace("//","</em>");
			
			count_i++;
			
			index = wikitext.indexOf("//",index);
		}
		
	}
	wikitext = wikitext.replace(/<\/strong><\/em>/g,"</em></strong>");
	
	return wikitext;
}

