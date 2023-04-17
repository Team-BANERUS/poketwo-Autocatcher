
/*
@Developer: Team_Banerus
Name: Fuzzy Bot
Version: V7.0.1
Description: A Discord bot to help users with catching pokemons
@Supported: poketwo/pokemon/mewbot/deriver
*/

// Imports
const {
	catch_phrase,
	spam_randomDelay,
	exploit_hint,
	randomize,
	randomNumber,
	randomText
} = require('./banerus/catcher.js');
const {
	botToken,
	botPrefix,
	botMode,
	ownerID,
	catchChannels,
	textsendChannels,
	textgenEnabled,
	logEnabled,
	logWebhook,
	catchDelay,
	autobots
} = require('./config.js');
const {
	abc,
	aiSolve
} = require('./banerus/model.js')

const fs = require('fs')
const axios = require('axios');
const express = require("express");
const chalk = require("chalk");
const setting = require("./config.js");
const pokelist = require('./banerus/pokedata.json');
const {
	Client,
	WebhookClient,
	MessageEmbed
} = require('discord.js');

// Variables
const currentVersion = "v7.0.1";
const client = new Client({
	checkUpdate: false
});
const webhookClient = new WebhookClient({
	url: logWebhook
});
const app = express();

// on ready event
client.on('ready', async () => {
	console.log(chalk.yellow(`=> [${new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getUTCSeconds()}]. Started Fuzzy bot - Free version`));
	console.log("_______________________________________");
	setTimeout(() => {
		console.log(chalk.magenta.bold(`Ｉｎｆｏｒｍａｔｉｏｎ : `));
		console.log(chalk.green(`UserName : ${client.user.username} `));
		console.log(chalk.green(`Bot Prefix : ${botPrefix}`));
		console.log(chalk.blue(`Your Version : ${currentVersion}`));
		console.log("");
		console.log(chalk.red("@Developer: Team_Banerus"));
		console.log("_______________________________________");
	}, 3000)
});

// On message event
client.on('messageCreate', async msg => {

	/* Catching & Log Module */
	if (autobots[msg.author.id] && catchChannels.includes(msg.channel.id)) {
		msg.embeds.forEach(async function(e) {
			if (e.description && e.description.startsWith("Guess")) {
				console.log(chalk.yellow("A new pokemon has spawned"))
				if (!fileExists()) return setTimeout(() => {
					msg.channel.send(autobots[msg.author.id][1].concat("hint"))
				}, randomNumber(2500, 5000));

				try {
					console.log(chalk.blue("Fuzzy - Attempting to catch the pokemon"))
					let pokename = await aiSolve(msg.author.id, e.image.url);
					if (typeof pokename === "undefined") return console.log(chalk.red("pokeName is undefined, hence unable to reply"));
					catchDelay ? setTimeout(() => {
						msg.channel.send(autobots[msg.author.id][1].concat(catch_phrase, ' ', pokename.msg.toLowerCase()));
					}, randomNumber(2500, 5000)) : msg.channel.send(autobots[msg.author.id][1].concat(catch_phrase, ' ', pokename.msg.toLowerCase()));

				} catch (error) {
					console.log(chalk.red("You have been Ratelimited"))
				}
			}
		});
		if (msg.content.indexOf("wild pokémon") !== -1 || msg.content.indexOf("pokémon") !== -1) {
			console.log(msg.content)
			let pokename = exploit_hint(msg.content, pokelist);
			console.log(pokename)
			setTimeout(() => {
				msg.channel.send(autobots[msg.author.id][1].concat(catch_phrase, ' ', pokename.toLowerCase()));
			}, randomNumber(2500, 5000))
		}

		if (msg.content.startsWith("Congratulations")) {
			if (!logenabled) return;

			console.log(chalk.green("[Fuzzy] The pokemon has been captured"))
			const catchEmbed = new MessageEmbed()
				.setTitle('[FREE VERSION - Fuzzy] A new pokemon has been Captured!')
				.setURL(`https://www.youtube.com/channel/UCaAwXOPWvyrJNaG5KFzQbgQ`)
				.setAuthor({
					name: `Developers - Team_Banerus`,
					iconURL: "https://github.com/Team-BANERUS/poketwo-Autocatcher/blob/main/Fuzzy/fuzzy-logo.png?raw=true"
				})
				.setDescription(`${abc() || currentVersion}`)
				.setColor(`#c9a0ff`)
				.addFields({
					name: '** Bot Message **',
					value: `${autobots[msg.author.id][0]} : __${msg.content}__`,
					inline: false
				}, {
					name: '**Encountered in**:',
					value: `Server : **${msg.guild.name}** , Channel : **${msg.channel.name}** `
				})
				.setTimestamp();
			webhookClient.send({
				content: 'The Fuzzy bot is designed for Multiple bots such as Poketwo, Pokemon, Mewbot & many more as Free & Limited version',
				username: 'Fuzzy Bot',
				avatarURL: 'https://github.com/Team-BANERUS/poketwo-Autocatcher/blob/main/Fuzzy/fuzzy-logo.png?raw=true',
				embeds: [catchEmbed],
			});
		}
	}
	/* Ownercmd Module */
	if (ownerID.includes(msg.author.id)) {
		if (msg.content.includes(botPrefix + "say")) {
			(msg.channel.permissionsFor(msg.guild.me).has("MANAGE_MESSAGES")) ?
			msg.delete(): console.log(chalk.red("[Fuzzy Catcher] Missing permission to delete messages"));

			const args = msg.content.slice(botPrefix.length + 'say'.length).trim().split(/ +/);
			if (!args.length) return;
			msg.channel.send(args.join(' '));
		}

		if (msg.content == botPrefix + "textgen" && textgenEnabled) {
			console.log(chalk.yellow("[Fuzzy] Started Text generation"))
			msg.channel.send("__Activated Text generation.__ \n **(Fuzzy Bot) Warning:** Avoid using spamming for extended periods of time and avoid repeating this command frequently for safety");
			setInterval(() => {
				msg.channel.send(randomText(randomNumber(500, 1000)));
			}, randomize([4000, 5000, 6000, 7000]))
		} else {
			console.log("To use this command, enable 'textgenEnabled' in config file")
		}
	}

});

// Logging to the Discord Api
client.login(botToken)
	.catch(error => {
		console.error("Invalid Token provided! Contact us for help");
	});

// Ensuring that the bot remains online 24/7 in its uptime.
app.listen(8080, () => {})

// Functions
function fileExists() {
	try {
		return fs.statSync("./banerus/model.js").isFile();
	} catch (err) {
		return false;
	}
}
