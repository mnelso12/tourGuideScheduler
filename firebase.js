var database = firebase.database();

$(document).ready(function(){
	$('.datepicker').pickadate({
		    selectMonths: true, // Creates a dropdown to control month
		    selectYears: 5 // Creates a dropdown of 5 years to control year
		  });

	$(document).on('click', "#saveScheduleToFB", function() {
		addNewlyCreatedToursToFB();
	});

	$(document).on('click', "#allSchedulesTable tr td", function() {

		clearSpecificScheduleTable();
		var mondayOfInterest = $(this)[0].innerHTML;
		getScheduleForWeek(mondayOfInterest);
		$("#selectedWeekLabel").html(mondayOfInterest);
	});

	writeUserData("mnelso12", "madelyn", "blah@nd.edu", "my.jpg");
	getCurrentWeeksSchedule(); 
	var mondaysList = getListOfAllScheduleMondays();
	// TODO fill left table with list of mondays
});

function getListOfAllScheduleMondays() {
	return firebase.database().ref('/tours/').once('value').then(function(snapshot) {
		var allWeeks = snapshot.val();
		var mondaysList = [];
		for (var monday in allWeeks) {
			mondaysList.push(monday);
		}
		return listOfMondays;
	});
}

function clearSpecificScheduleTable() {
	$("#specificScheduleTable tbody").remove();
	$("#specificScheduleTable thead").remove();
}


function writeUserData(userId, name, email, imageUrl) {
/*
	var tours = {  
		"2-20-2017": { 
			"1":{
				"toursObj":{
					"0" : {
						"date":"2-20-2017",
						"time":"2:00 pm",
						"names":"Nelson, Martin, Berry",
						"notes":"from FB"
					}
				}
			},
			"2":{
				"toursObj":{
					"0" : {
						"date":"2-21-2017",
						"time":"2:00 pm",
						"names":"Nelson, Martin, Berry",
						"notes":"from FB"
					},
					"1" : {
						"date":"2-21-2017",
						"time":"3:00 PM",
						"names":"Nelson, Martin",
						"notes":"from FB"
					}
				}
			}
		},
		"2-27-2017": { 
			"1":{
				"toursObj":{
					"0" : {
						"date":"2-27-2017",
						"time":"2:00 pm",
						"names":"Nelson, Martin, Berry",
						"notes":"from FB"
					}
				}
			},
			"2":{
				"toursObj":{
					"0" : {
						"date":"2-28-2017",
						"time":"2:00 pm",
						"names":"Nelson, Martin, Berry",
						"notes":"from FB"
					},
					"1" : {
						"date":"2-29-2017",
						"time":"4:00 pm",
						"names":"Nelson, Martin, Berry",
						"notes":"from FB"
					}
				}
			}
		}
	};


	firebase.database().ref('/').set({
		tours : tours
	});
	*/
}

function getScheduleForWeek(mondayFormatted) {
	console.log(mondayFormatted);
	return firebase.database().ref('/tours/' + mondayFormatted).once('value').then(function(snapshot) {
		var thisWeek = snapshot.val();
		console.log("week of interest data:", thisWeek);

		updateAllSchedulesTableWithData(thisWeek);

	});
}

function getCurrentWeeksSchedule() {
	console.log("getting current week's schedule");
	var today = new Date; // get current date
	var first = today.getDate() - today.getDay(); // First day is the day of the month - the day of the week
	console.log(today);

	var dayOfWeek = today.getDay();
	var day = today.getDate();
	var month = today.getMonth()+1;
	var year = today.getFullYear();

	var offset = (7+(dayOfWeek-1))%7;
	var dateOfLastMonday = day - offset;

	var mondayFormatted = month+"-"+dateOfLastMonday+"-"+year;

	return firebase.database().ref('/tours/' + mondayFormatted).once('value').then(function(snapshot) {
		var thisWeek = snapshot.val();

		updateScheduleWithData(thisWeek);

	});
}

function addNewlyCreatedToursToFB() {

	$('#scheduleCreationTable tbody tr').each(function() {

		if ($(this).hasClass("tourRow") == true) {

			var date = $(this)[0]["children"][0].innerHTML;
			var time = $(this)[0]["children"][1].innerHTML;
			var names = $(this)[0]["children"][2].innerHTML;
			var notes = $(this)[0]["children"][3].innerHTML;
			saveTourToFB(date, time, names, notes);
		}
		else {
			//console.log("found some input rows");
		}
	});

}

function getDayOfWeek(date) {
	var today = new Date(date); 
	var dayOfWeek = today.getDay();
	return dayOfWeek;
}

function getLastMonday(date) {
	var today = new Date(date); 
	var first = today.getDate() - today.getDay(); // First day is the day of the month - the day of the week

	var dayOfWeek = today.getDay();
	var day = today.getDate();
	var month = today.getMonth()+1;
	var year = today.getFullYear();

	var offset = (7+(dayOfWeek-1))%7;
	var dateOfLastMonday = day - offset;

	
	// accounts for weeks that span two months
	if (dateOfLastMonday <= 0) {
		var nextMonday = dateOfLastMonday + 7;
		var nextMondayFormatted = month+"-"+nextMonday+"-"+year;
		var oneWeekAgo = new Date(nextMondayFormatted);
		oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
		
		var dayOfWeek = oneWeekAgo.getDay();
		var day = oneWeekAgo.getDate();
		var month = oneWeekAgo.getMonth()+1;
		var year = oneWeekAgo.getFullYear();
		return  month+"-"+day+"-"+year;
	}
	else {
		var mondayFormatted = month+"-"+dateOfLastMonday+"-"+year;
		//console.log("last monday of", date, "was", mondayFormatted);
		return mondayFormatted;
	}
}

function formatDateForFB(date) {
	var comps = date.split(" ");
	var day = comps[0]
	var monthStr = comps[1]
	var year = comps[2]

	var months = ["January,", "February,", "March,", "April,", "May,", "June,", "July,", "August,", "September,", "October,", "November,", "December"];

	var monthIndex = months.indexOf(monthStr)+1;
	return monthIndex+"-"+day+"-"+year;
}


function saveTourToFB(date, time, names, notes) {
	var formattedDate = formatDateForFB(date); // 12-25-2017
	var previousMonday = getLastMonday(formattedDate);
	var dayOfWeek = getDayOfWeek(formattedDate);
	console.log(previousMonday, dayOfWeek, formattedDate);

	var thisTour = {
		"date": formattedDate,
		"time": time,
		"names": names,
		"notes": notes
	}


	var toursObj = {};

	console.log("PATH:", '/tours/' + previousMonday + '/' + dayOfWeek+'/toursObj/');
	firebase.database().ref('/tours/' + previousMonday + '/' + dayOfWeek+'/toursObj/').once('value').then(function(snapshot) {
		var dayScheduleValue = snapshot.val();

		if (snapshot.exists()) {
			toursObj = dayScheduleValue;
			//console.log("tours on this day!");
			//console.log("toursObj before push", toursObj);
			toursObj.push(thisTour);
			//console.log("toursObj after push", toursObj);
		}
		else {
			//console.log("no tours on this day yet");
			toursObj = {"0":thisTour};
			//console.log("toursObj after added only tour", toursObj);
		}
	


		firebase.database().ref('/tours/' + previousMonday +"/" + dayOfWeek).set({
			toursObj
		});


	});
}


function updateScheduleWithData(thisWeek) {
	console.log("this week:", thisWeek);
	for (var day in thisWeek) {

		// make table header
		var weekdayArr = ["Sunday", "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
		var dayOfWeek = weekdayArr[day] // Monday
		$("#scheduleTable").append("<thead id="+ dayOfWeek +"><tr><th>"+dayOfWeek+"</th><th></th><th></th></tr></thead>");

		// fill in table body
		var tourInfo = thisWeek[day]["toursObj"]
		console.log("tourInfo",tourInfo);
		console.log("tourInfo[0]", tourInfo[0]);

		$("#scheduleTable").append("<tbody>");
		var contentsOfTbody = "<tbody>";
		var index = 0
		for (var tour in tourInfo) {

			var tourDate = tourInfo[index]["date"]
			var tourTime = tourInfo[index]["time"]
			var tourNames = tourInfo[index]["names"]
			var tourNotes = tourInfo[index]["notes"]

			contentsOfTbody += "<tr><td>"+tourTime+"</td><td>"+tourNames+"</td><td>"+tourNotes+"</td></tr>";
			index += 1
		}
		contentsOfTbody += "</tbody>";
		$("#scheduleTable").append(contentsOfTbody);
	}
}

function updateAllSchedulesTableWithData(thisWeek) {
	console.log("the week we want:", thisWeek);
	for (var day in thisWeek) {

		// make table header
		var weekdayArr = ["Sunday", "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
		var dayOfWeek = weekdayArr[day] // Monday
		$("#specificScheduleTable").append("<thead id="+ dayOfWeek +"><tr><th>"+dayOfWeek+"</th><th></th><th></th></tr></thead>");

		// fill in table body
		var tourInfo = thisWeek[day]["toursObj"]
		console.log("tourInfo",tourInfo);
		console.log("tourInfo[0]", tourInfo[0]);

		$("#specificScheduleTable").append("<tbody>");
		var contentsOfTbody = "<tbody>";
		var index = 0
		for (var tour in tourInfo) {

			var tourDate = tourInfo[index]["date"]
			var tourTime = tourInfo[index]["time"]
			var tourNames = tourInfo[index]["names"]
			var tourNotes = tourInfo[index]["notes"]

			contentsOfTbody += "<tr><td>"+tourTime+"</td><td>"+tourNames+"</td><td>"+tourNotes+"</td></tr>";
			index += 1
		}
		contentsOfTbody += "</tbody>";
		$("#specificScheduleTable").append(contentsOfTbody);
	}
}
