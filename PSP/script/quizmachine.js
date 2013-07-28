var QuizMachine = function() {
	var quizmachine = this;
	var questions;
	var reversed;
	var catmap;
	var catnames;
	var title;
	
	this.create = function(params) {
		params.target.append("<ol id=\"quizlist\"></ol>");
		
		jQuery.i18n.properties({
		    name:params.name, 
		    path:params.path + '/', 
		    mode:'map',
		    language:'us_EN', 
		    
		    callback: function() {
				$.getJSON("{0}/{1}.json".format(params.path, params.name), function(data) {
			    	quizmachine.title = data.title;
			    	quizmachine.initcategorymapping(data);
			    	
					for (var i = 1; i <= data.questions; i++) {
						$("#quizlist").append(
							"<li class=\"{0}\">{1}<span class=\"questiontext\">{2}</span></li>"
								.format(((i % 2 == 0) ? "even" : "odd"), 
								quizmachine.createboxes(1, i), 
								jQuery.i18n.prop("question" + i)
						));
					}
				});
		    }
		});
	}
	
	this.initcategorymapping = function(data) {
		quizmachine.catmap = new Array();
		quizmachine.reversed = new Array();
		quizmachine.catnames = new Array();
		
    	for (var i = 0; i < data.categories.length; i++) {
    		var category = data.categories[i];
    		quizmachine.catnames[i] = new Object();
    		quizmachine.catnames[i].short = category.short;
    		quizmachine.catnames[i].long = category.long;
    		
    		for (var j = 0; j < category.qs.length; j++) {
    			var q = parseInt(category.qs[j]);
    			var rvr = (q < 0);
    			if (rvr) {
    				q = (-1 * q);
    			}
    			quizmachine.reversed[q] = rvr;
    			
    			if (quizmachine.catmap[q] === undefined) {
    				quizmachine.catmap[q] = new Array();
    			}
   				quizmachine.catmap[q][quizmachine.catmap[q].length] = category.short;
    		}
    	}
	}
	
	this.createboxes = function(person, question) {
		return "<span class=\"answerbox {2}\" id=\"p{0}q{1}\">".format(person, question, quizmachine.categoryclasses(question)) + 
				quizmachine.radio(person, question, quizmachine.reversed[question] ? 0 : 2, "Yes") + 
				quizmachine.radio(person, question, 1, "Maybe") + 
				quizmachine.radio(person, question, quizmachine.reversed[question] ? 2 : 0, "No") + 
			"</span>";
	};
	
	this.categoryclasses = function(question) {
		var cc = "";
		for (var i = 0; i < quizmachine.catmap[parseInt(question)].length; i++) {
			if (i > 0) cc += " ";
			cc += "cat" + quizmachine.catmap[parseInt(question)][i];
		}
		return cc;
	}
	
	this.radio = function(person, question, pointvalue, labeltext) {
		return "<input type=\"radio\" value=\"{0}\" class=\"p{1}radio \" /><label>{3}</label>"
			.format(pointvalue, person, question, labeltext);
	};
	
	this.checker = function(person) {
		var selections = $(".p{0}radio:checked".format(person));
		alert (selections.length);
		if (selections.length < quizmachine.questions){
			for (var i = 1; i <= quizmachine.questions; i++) {
				var thisquestion = $("#p{0}q{1}".format(person, i));
				var thisselected = thisquestion.find("input:checked");
				
				if (thisselected.length == 0) {
					thisquestion.addClass("unanswered");
				}
			}
		} else {
			quizmachine.collectscores();
		}
	};
	
	this.score = function() {
		$("#results").html("");
		for (var i = 0; i < quizmachine.catnames.length; i++) {
			$("#results").append("<div>{0} {1}</div>".format(quizmachine.tallycategory(quizmachine.catnames[i].short), quizmachine.catnames[i].long));
		}
	}
	
	this.tallycategory = function(catshort) {
		var points = 0;
		$("span.cat{0} input:checked".format(catshort)).each(function() {
			points += parseInt($(this).val());
		});
		return points;
	}
};