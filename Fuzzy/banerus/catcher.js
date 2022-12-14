/*
           Developer: Team_Banerus

The Autocatcher module for Banerus's Fuzzy bot is an interface,
that connects the following components:

  1. Prediction
  2. Catch prefix
  3. Catch delay
  4. Spam delay
  5. Randomizer

---------------------------------------------------

The module includes the following functions:
  • exploit_hint(message, database) :
    In case of an incorrect prediction,
    this functions can be used to exploit the p!hint system to determine the correct name.
  
  • catch_phrase(), spam_randomDelay(), catch_randomDelay() :
    These methods handle autosleeping and delays based on the provided delay times (in seconds).
  
  • randomize(elements) :
    This method takes a group of elements and returns one of them at random.
    It is often used in algorithms to prevent detection.
  
  • randomNumber(minimum, maximum) :
  this method takes a minimum and maximum value and returns a random number within those parameters.
  It is also commonly used in algorithms to prevent detection.

---------------------------------------------------
The Autocatcher module was developed by Team_Banerus.
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Writing code is time-consuming, and we are happy to help you.
Thank you for understanding ^_^.
*/

let catch_phrase = randomize(["c", "c"]);
let catch_randomDelay = randomize([2000,
	3000, 4000, 5000, 7000
]);
let spam_randomDelay = randomize([4300,
	3700, 5100, 6200
]);

function exploit_hint(pmsg, pokemonlist) {
	// Extract the Pokémon's name from the pmsg string
	let decodeName = pmsg.toString().replace(/The (wild )?pokémon is \.?/, '');
	// Loop through the pokemonlist array
	for (let c of pokemonlist) {
		// Check if the length of the current Pokémon's name matches the length of decodeName
		if (c.length !== decodeName.length) {
			continue;
		}
		// Assume that the current Pokémon's name matches decodeName
		let match = true;
		// Loop through the characters in decodeName and check if they match the characters in the current Pokémon's name
		for (let i = 0; i < decodeName.length; i++) {
			// If the character in decodeName is not an underscore and it doesn't match the corresponding character in the current Pokémon's name, set match to false and break out of the loop
			if (decodeName[i] !== '_' && c[i] !== decodeName[i]) {
				match = false;
				break;
			}
		}
		// If the current Pokémon's name matches decodeName, return it
		if (match) {
			return c;
		}
	}
}


function randomize(options) {
	return options[Math.floor(Math
		.random() * options
		.length)];
}

function randomNumber(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (
		max - min + 1)) + min;
}

function randomText(nlength) {
	const random_string = Array.from({
		length: nlength
	}, () => {
		const possible_chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz,0123456789';
		return possible_chars[Math.floor(Math.random() * possible_chars.length)];
	}).join('');
	return random_string;
}

function runningTime() {
	var time = process.uptime();
	var uptime = (time + "").toHHMMSS();
	return uptime;
}

// Exporting
module.exports = {
	catch_phrase,
	catch_randomDelay,
	spam_randomDelay,
	exploit_hint,
	randomize,
	randomNumber,
	randomText,
	runningTime
};
