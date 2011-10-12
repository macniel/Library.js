String.prototype.ReplaceAll = function(stringToFind,stringToReplace){
    var temp = this;
    var index = temp.indexOf(stringToFind);
        while(index != -1){
            temp = temp.replace(stringToFind,stringToReplace);
            index = temp.indexOf(stringToFind);
        }
    return temp;
}

var divisions = {
	Command : {
		0: "Operations",
		1: "Conn",
		2: "Tactical",
		3: "Security",
		4: "Enviormental"
	},
	Sciences : {
		0: "Long Range Sensors",
		1: "Navigational Sensors",
		2: "Instrumented Probes",
		3: "Life Sciences"
	},
	Engineering : {
		0: "Computer Systems",
		1: "Electropaslam Systems",
		2: "M/AM Reaction Systems",
		3: "Warp Propulsion",
		4: "Impulse Propulsion",
		5: "Communications",
		6: "Transporter Systems"
	},
	Support : {
		0: "Medical",
		1: "Food Replication",
		2: "Crew Quarters",
		3: "Turbolift Transport",
		4: "Holographic Simulator"
	}
};

exports.get = function(division) {
	
	if ( typeof division == "string" && division.indexOf("/") == 0 ) {
		division = division.substr(1);
		division = division.replaceAll("%20", " ");
	}

	if ( typeof division != "undefined" && typeof divisions[division] != "undefined" ) {
		return divisions[division];
	} else {
		return divisions;
	}
}