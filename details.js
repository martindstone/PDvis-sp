function showDetails(data, since, until, day, hour) {

	var headline = "Incidents occurring";
	if ( hour > -1 ) { headline += " in the " + hourNumberToString(hour, true) + " hour"; }
	if ( day > -1 ) { headline += " on " + dayNumberToString(day, true) + "s"; }
	headline += " between " + moment(since).format("LLLL") + " and " + moment(until).format("LLLL");
	
	$('#result').html('<h3>' + headline + '</h3>');
	$('#result').append($('<table/>', {
		id: "result-table"
	}));

	var infoFns = [];
	data.forEach(function(incident) {
		if ( ! incident.id ) {
			return;
		}
		if ( ( day == -1 || moment(incident.created_on).day() == day ) && ( hour == -1 || moment(incident.created_on).hour() == hour ) ) {
			infoFns.push(function(callback) {
				var options = {
					success: function(info) {
						callback(null, info);
					}
				}
				PDRequest(getParameterByName('token'), "incidents/" + incident.id, "GET", options);
			});
		}
	});
	async.parallel(infoFns, function(err, results) {
		var tableData = [];
		results.forEach(function(result) {
			tableData.push(
				[
					'<a href="' + result.incident.html_url + '" target="blank">' + result.incident.incident_number + '</a>',
					(new Date(result.incident.created_at)).toLocaleString(),
					result.incident.status,
					result.incident.service.summary,
					result.incident.summary
				]
			);
		});
		$('#result-table').DataTable({
			data: tableData,
			columns: [
				{ title: "#" },
				{ title: "Created at" },
				{ title: "Status" },
				{ title: "Service Name" },
				{ title: "Summary" }
			]
		});
		$('.busy').hide();
	});
}

function fetch(since, until, day, hour) {
	var options = {
		success: function(data) {
			data = data.replace(/^\s*[\r\n]/gm, '');		// seems like the .csv has either blank lines
			data = data.replace(/(\r\n|\n|\r)/gm,"\n");		// or inconsistent line endings, sometimes.
			Papa.parse(data, {
				header: true,
				complete: function(parsed) {
					showDetails(parsed.data, since, until, day, hour);
				}
			});
		},
		data: {
			since: since.toISOString(),
			until: until.toISOString()
		},
		dataType: "text"
	}
	
	PDRequest(getParameterByName('token'), '/reports/raw/incidents.csv', 'GET', options);
}

function main() {
	var until = new Date(getParameterByName('until'));
	var since = new Date(getParameterByName('since'));
	var hour = getParameterByName('hour');
	var day = getParameterByName('day');
	
	if ( moment(until).isAfter(moment()) ) {
		until = new Date();
		console.log("until is in the future");
	}
	
	since.setHours(0,0,0,0);
	until.setHours(23,59,59,999);

	if ( day == null ) {
		day = -1;
	}
	
	if ( hour == null ) {
		hour = -1;
	}

	$('.busy').show();
	
	fetch(since, until, day, hour);	
}

$(document).ready(main);
