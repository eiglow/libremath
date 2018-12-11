// ================================================================
// CONFIG
// ================================================================

const DEBUGGING = 1;

const LANG = "EN";

const TEXT = {
	EN: {
		//yourScore : "your score",
		//incorrect : "incorrect",
		endgame: "game over",
		error: "there has been a Javascript error, please let me know!"
	}
};

const GAME_DEFAULTS = {
	level: 1,
	maxTime: 60
};

// ================================================================
// HELPERS
// ================================================================

function debug(...str) {
	switch (DEBUGGING) {
		case 1:
			console.log(...str);
			break;
		default:
			break;
	}
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

window.onerror = function(msg, url, line, col, error) {

	// extensions tend to randomly throw these
	if (url.startswith("moz-extension")) return;

	// Note that col & error are new to the HTML 5 spec and may not be supported in every browser.
	var extra = !col ? '' : '\ncolumn: ' + col;
	extra += !error ? '' : '\nerror: ' + error;

	// You can view the information in an alert to see things working like this:
	alert(TEXT[LANG].error + "\n error: " + msg + "\nurl: " + url + "\nline: " + line + extra);

	// TODO: Report this error via ajax so you can keep track of what pages have JS issues

	var suppressErrorAlert = true;
	// If you return true, then error alerts (like in older versions of 
	// Internet Explorer) will be suppressed.
	return suppressErrorAlert;
	
};

// ================================================================
// FUNCTIONS
// ================================================================

var problemGenerator = [

	// there is no level 0
	() => {
		debug("generating problem for level 0???");
		return {
			problemBefore: "error",
			problemAfter: "",
			solution: NaN
		};
	},

	// level 1
	// - addition up to 9
	// (it's 10 in real live mathletics but it's two characters, and is annoying to type lul)
	() => {

		var solution = getRandomInt(0, 9);
		var sum1 = getRandomInt(0, solution);
		var sum2 = solution - sum1;

		return {
			problemBefore: sum1.toString() + "+" + sum2.toString(),
			problemAfter: "",
			solution: solution.toString()
		};

	},

	// level 2
	// - addition and subtraction up to 20
	() => {

		var solution = getRandomInt(0, 20);
		var sign, sum1, sum2;
		if (getRandomInt(0, 1) === 1) {
			sign = "+";
			sum1 = getRandomInt(0, solution);
			sum2 = solution - sum1;
		} else {
			sign = "-";
			sum1 = getRandomInt(solution, 20);
			sum2 = Math.abs(solution - sum1);
		}

		return {
			problemBefore: sum1.toString() + sign + sum2.toString(),
			problemAfter: "",
			solution: solution.toString()
		};

	},

	// level 3
	// - addition and subtraction up to 50
	// - multiplication up to 10 times tables
	// - addition up to 20 with 3 numbers
	// - A + [] = B type questions, addition up to 20
	() => {

		var solution, sum1, sum2;
		// these cases correspond to the possibilites outlined above
		switch (getRandomInt(0, 3)) {

			case 0:

				solution = getRandomInt(0, 50);
				var sign;
				if (getRandomInt(0, 1) === 1) {
					sign = "+";
					sum1 = getRandomInt(0, solution);
					sum2 = solution - sum1;
				} else {
					sign = "-";
					sum1 = getRandomInt(solution, 50);
					sum2 = sum1 - solution;
				}

				return {
					problemBefore: sum1.toString() + sign + sum2.toString() + "=",
					problemAfter: "",
					solution: solution.toString()
				};

			case 1:

				sum1 = getRandomInt(0, 10);
				sum2 = getRandomInt(0, 10);
				solution = sum1 * sum2;

				return {
					problemBefore: sum1.toString() + "×" + sum2.toString() + "=",
					problemAfter: "",
					solution: solution.toString()
				};

			case 2:

				solution = getRandomInt(0, 20);
				sum2 = getRandomInt(0, solution);
				sum1 = getRandomInt(0, sum2);
				sum2 -= sum1;
				var sum3 = solution - (sum1 + sum2);

				return {
					problemBefore: sum1.toString() + "+" + sum2.toString() + "+" + sum3.toString() + "=",
					problemAfter: "",
					solution: solution.toString()
				};

			case 3:

				solution = getRandomInt(0, 20);
				sum1 = getRandomInt(0, solution);
				sum2 = solution - sum1;

				return {
					problemBefore: sum1.toString() + "+",
					problemAfter: "=" + solution,
					solution: sum2.toString()
				};

		}

	},

	// level 4
	// - addition and subtraction up to 100
	// - multiplication and division up to 10 times tables
	// - A * [] = B type questions
	// - A + [] = B type questions, addition up to 100
	// - addition up to 50 with 3 numbers
	() => {

	}

	// level 5
	// - addition and subtraction up to 500
	// - word problems ( How many minutes in N seconds, How many minutes in 2 hours, etc )
	// [] cm = 2m type questions with various metric units
	// - multiplication and division up to 10 times tables
	// - A * [] = B type questions
	// - A + [] = B type questions, addition up to 100
	// - addition up to 50 with 3 numbers


	// level 6
	// - []% of N
	// - pattern recognition with decimals
	// - problems with brackets
	// - word problems 


];

// ================================================================
// MAIN
// ================================================================

var app = new Vue({

	el: '#app',

	data: {
		equationBefore: '',
		equationAfter: '',
		yourScore: '',
		incorrect: '',
		timeLeft: '',
		overlayText: '',
		overlayHidden: false,
		userAnswer: '',
		restartButtonHidden: true,
		levelSelectorHidden: false,
		gameLevel: 0
	},

	methods: {

		handleSubmit: function(answer) {

			if (answer.length == 0) return;

			debug("handling answer " + answer.toString());
			debug("current solution " + currentSolution.toString());
			app.userAnswer = "";

			if (!gameRunning)
				return;
			if (currentSolution == parseInt(answer)) {
				debug("correct answer");
				app.yourScore++;
			} else {
				debug("incorrect answer");
				app.incorrect++;
				if (app.incorrect >= 3) {
					endGame();
					return;
				}
			}

			newEquation( GAME_DEFAULTS.level);

		},

		restartGame: function() {

			init();

		},
		
		initCountdown: function (time, callback) {
			
			debug("initCountdown", time, callback);
			var counter = time;
			setTimeout(() => {
				app.overlayHidden = true;
				callback();
				clearInterval(countdownInterval);
			}, time * 1000);
		
			app.overlayHidden = false;
			app.overlayText = counter.toString();
			app.levelSelectorHidden = true;
		
			var countdownInterval = setInterval(() => {
				counter -= 1;
				app.overlayText = counter.toString();
			}, 1000);
		
		},
		
		initGame: function () {
			
			debug("game start");
			gameRunning = true;
		
			app.timeLeft =  GAME_DEFAULTS.maxTime;
			app.yourScore = 0;
			app.incorrect = 0;
		
			setTimeout(endGame,  GAME_DEFAULTS.maxTime * 1000);
			gameLoopInterval = setInterval(gameLoop, 1000);
			
			newEquation(app.gameLevel);
			app.$refs.solution.focus();
			
		}

	}

});

// yeah i know globals are bad and all, shut up
var gameRunning,
	currentSolution,
	gameLoopInterval;

function gameLoop() {
	app.timeLeft--;
}

function endGame() {
	gameRunning = false;
	clearInterval(gameLoopInterval);

	app.overlayHidden = false;
	app.overlayText = TEXT[LANG].endgame;
	app.$refs.solution.blur();
	app.restartButtonHidden = false;
}

function newEquation(level) {
	var holder = problemGenerator[parseInt(level)]();
	debug(holder);
	app.equationBefore = holder.problemBefore;
	app.equationAfter = holder.problemAfter;
	currentSolution = holder.solution;
}

// ================================================================
// INIT
// ================================================================

function init() {

	debug("starting!");

	app.yourScore = 0;
	gameRunning = false;
	app.overlayHidden = false;
	app.levelSelectorHidden = false;
	app.restartButtonHidden = true;
	app.overlayText = "choose a level:";

}

//window.onload = init;
init();
