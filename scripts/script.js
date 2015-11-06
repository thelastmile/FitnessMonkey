$(function(){
	// setInterval(memberCount, 1000);
	var $signupBtn = $('#signupBtn');

	// hide all pages except for the login page
	// $('.page').hide();
	$('#loginPage').show();
	$('#navElements').hide();

	// Page one signup button takes user to membership signup page

	$('#signupBtn').on('click', function(){
		$('#loginPage').hide();
		$('#memberSignup').show();
	});

	// submit member form and return to login page
	$('#submitBtn').on('click', function(e){
		e.preventDefault;
		$('#memberSignup').hide();
		$('#loginPage').show();
	})

	// Page One login function takes you to workout/recovery selection page
	$('#loginBtn').on('click', function(){
		$('#navElements').show();
		$('#loginPage').hide();
		$('#optionsPage').show();
	});

	// Page Two workout/recovery page

	// Select workout button that takes you to workout selection page (cardio, sports, strength)
	$('#workoutBtn').on('click', function(){
		$('#optionsPage').hide();
		$('#workoutPage').show();
	});

	// Workout selection page

	// Cardio button takes you to cardio challenge page
	$('#cardioBtn').on('click', function(){
		$('#workoutPage').hide();
		$('#cardioPage').show();
	});

	// Sports button takes you to sports challenge page
	$('#sportBtn').on('click', function(){
		$('#workoutPage').hide();
		$('#sportPage').show();
	});

	// Stength button takes you to strength challenge page
	$('#strengthBtn').on('click', function(){
		$('#workoutPage').hide();
		$('#strengthPage').show();
	});

	// Once you finish a challenge, click the done button to log workout and checkout D3 visualization
	$('.doneBtn').on('click', function(){
		$('.page').hide();
		$('#visualPage').show();
	});

	// Recovery selection pages

	// Selecting recovery takes you to the set goals / log relapse page
	$('#recoveryBtn').on('click', function(){
		$('#optionsPage').hide();
		$('#recoveryPage').show();
	});

	// Set goals button allows you to set a recovery goal (week, month, year, etc)
	$('#setGoalBtn').on('click', function(){
		$('#recoveryPage').hide();
		$('#setGoalsPage').show();
	});

	// Lapse button allows you to log relapse occurrence (date, time, feelings, emotions, etc.)
	$('#lapseBtn').on('click', function(){
		$('#recoveryPage').hide();
		$('#logLapsePage').show();
	})

	// Go button takes you back to workout / recovery selection page
	$('.goBtn').on('click', function(){
		$('.page').hide();
		$('#optionsPage').show();
	})


	// Navbar functionality

	// Home icon takes you to login page
	$('#navHome').on('click', function(e){
		$('.page').hide();
		$('#navElements').hide();
		$('#loginPage').show();
	});

	// Heart icon takes you to cardio challenge page
	$('#navCardio').on('click', function(){
		$('.page').hide();
		$('#cardioPage').show();
	});

	// Flag icon takes you to sports challenge page
	$('#navSports').on('click', function(){
		$('.page').hide();
		$('#sportPage').show();
	});

	// Tower icon takes you to strength challenge page
	$('#navStrength').on('click', function(){
		$('.page').hide();
		$('#strengthPage').show();
	});

	// Lightning icon takes you to log relapse page
	$('#navRelapse').on('click', function(){
		$('.page').hide();
		$('#logLapsePage').show();
	});

	// User icon takes you to edit user info page 
	$('#navUser').on('click', function(){
		console.log('edit user info page');
	})
	


});

























// Random member count generator
function memberCount(){
	var $count = $('#num');
	var random = Math.floor(Math.random() * 1000);

	var currentCount = Number(removeCommas($count.text()));
	currentCount += random;
	currentCount = addCommas(currentCount);

	$count.text(currentCount);
};
// adds commas to member counts
function addCommas(number){
	var strNum = number.toString();
	var splitStr = strNum.split('');

	for (var i = splitStr.length - 1, count = 1; i >= 0; i--, count++) {
		if(count % 3 === 0){
			splitStr.splice(i, 0, ',');
		}
	}
	if(splitStr[0] === ','){
		splitStr.splice(0, 1);
	}
	return splitStr.join('');
};
// removes commas from member count text
function removeCommas(string){
	return string.split(',').join('');
};
