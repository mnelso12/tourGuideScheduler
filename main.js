$(document).ready(function(){
	// the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
	$('.modal').modal();
	$('.datepicker').pickadate({
		    selectMonths: true, // Creates a dropdown to control month
		    selectYears: 5 // Creates a dropdown of 5 years to control year
		  });

	doStylingThings();

	$(".save-new-row").click(function(){
		console.log("save new row");
		createNewRow();
	});

	$(document).on('click', ".deleteRow", function() {
		console.log("delete this row");
		$(this).parents("tr").remove();
	});

	$(document).on('click', ".edit-row", function() {
		console.log("edit this row");
		var date = $(this).parents("tr").children("td")[0].innerHTML; 
		var time = $(this).parents("tr").children("td")[1].innerHTML; 
		var names = $(this).parents("tr").children("td")[2].innerHTML; 
		var notes = $(this).parents("tr").children("td")[3].innerHTML; 

		$("#date-input").val(date);
		$("#time-input").val(time);
		$("#names-input").val(names);
		$("#notes-input").val(notes);

		$(this).parents("tr").remove(); // delete row because is being edited above
		sortRowsByDate();
	});

});


function doStylingThings() {
	var today = new Date; // get current date
	var curr = new Date; // get date variable
	var first = today.getDate() - today.getDay(); // First day is the day of the month - the day of the week

	var dayOfWeek = today.getDay();
	var dayFirst = today.getDate();
	var monthFirst = today.getMonth()+1;
	var yearFirst = today.getFullYear();

	var offset = (7+(dayOfWeek-1))%7;
	var dateOfLastMonday = dayFirst - offset;

	var last = dateOfLastMonday + 6;
	var lastday = new Date(curr.setDate(last));

	var dayLast = lastday.getDate();
	var monthLast = lastday.getMonth()+1;
	var yearLast = lastday.getFullYear();
	
	$("#pageTitle").text(monthFirst + "/" + dateOfLastMonday + " - " + monthLast + "/" + dayLast);
}

function checkInputFieldsValid() {
	var date = $("#date-input").val();	
	var time = $("#time-input").val();	
	var names = $("#names-input").val();	

	if (date == "" || time == "" || names == "") {
		return false;
	}
	
	return true;
}

function sortRowsByDate() {
	var tbl = document.getElementById("scheduleCreationTable").tBodies[0];
	var store = [];
	for(var i=0, len=tbl.rows.length; i<len; i++){
		var row = tbl.rows[i];
		var sortnr = parseFloat(row.cells[0].textContent || row.cells[0].innerText);
		if(!isNaN(sortnr)) store.push([sortnr, row]);
	}
	store.sort(function(x,y){
		return x[0] - y[0];
	});
	for(var i=0, len=store.length; i<len; i++){
		tbl.appendChild(store[i][1]);
	}
	store = null;
}


function createNewRow() {

	if (checkInputFieldsValid() == false) {
		$('#modal2').modal('open');
		return; // don't create new row
	}

	var date = $("#date-input").val();	
	var time = $("#time-input").val();	
	var names = $("#names-input").val();	
	var notes = $("#notes-input").val();	

	$("#scheduleCreationTable tbody").append($('<tr class="tourRow"><td class="date date-cell">'+date+'</td><td class="time-cell">'+time+'</td><td class="names-cell">'+names+'</td><td class="notes-cell">'+notes+'</td><td> <a class="btn-floating waves-effect waves-light cyan edit-row"><i class="material-icons">edit</i></a> ' + ' <a class="btn-floating waves-effect waves-light red deleteRow">' + '<i class="material-icons">delete</i></a> </td> </tr>'));
	
	clearInputs();
	sortRowsByDate();
};

function clearInputs() {
	var date = $("#date-input").val("");	
	var time = $("#time-input").val("");	
	var names = $("#names-input").val("");	
	var notes = $("#notes-input").val("");	
}
