function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function PDRequest(token, endpoint, method, options) {

	if ( !token ) {
		alert("Please put a token in the URL, like .../index.html?token=<YOUR_V2_API_TOKEN>");
		return;
	}
	
	var subdomain = location.host.split('.')[0];

	var merged = $.extend(true, {}, {
		type: method,
		dataType: "json",
		url: "https://" + subdomain + ".pagerduty.com/" + endpoint,
		headers: {
//			"Authorization": "Token token=" + token,
			"Accept": "application/vnd.pagerduty+json;version=2"
		},
		error: function(err, textStatus) {
			$('.busy').hide();
			var alertStr = "Error '" + err.status + " - " + err.statusText + "' while attempting " + method + " request to '" + endpoint + "'";
			try {
				alertStr += ": " + err.responseJSON.error.message;
			} catch (e) {
				alertStr += ".";
			}
			
			try {
				alertStr += "\n\n" + err.responseJSON.error.errors.join("\n");
			} catch (e) {}

			alert(alertStr);
		}
	},
	options);

	$.ajax(merged);
}

function hourNumberToString(n, long) {
	var m = (n > 12) ? "p" : "a";
	var h = (n % 12 == 0) ? 12 : n % 12;
	
	if (long) { return h + ":00" + m + "m"; }
	else { return h + m }
}

function dayNumberToString(n, long) {
	var dayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	
	if (long) { return dayNames[n]; }
	else { return dayNamesShort[n]; }
}