/*!
 * Poketwo Autocatcher
 * https://github.com/Team-BANERUS/poketwo-Autocatcher
 * @Team_Banerus
 *
 * Professional, Clean, Lightweight Poketwo Autocatcher coded with excellence!
 *
 * NOTE: This file is not allocated & publically distributed
 */

const {
    poketwo_builder,
    //...//
} = require("source/poketwoBuilder.js");
const {
    pokedetector,
    trader,
    tradeLock
    //...//
} = require("source/pokeCommands.js");
const {
    pokelogger,
    notifications,
    helpMenu,
    refresh,
    delay,
    //...//
} = require("source/baseCommands.js")
//
const {
    Discord,
    Client,
    Intents,
    Collection,
    MessageEmbed
} = require('discord.js');
const config = require('./source/config.json');
const db = require('./source/dbconnector.js');
const client = new Discord.Client({
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_PRESENCES
    ],
    presence: {
        status: "online"
    }
});
/* Activity */
let statuses = ['Poketwo Autocatcher', "This AC is awesome!", "sampleStatus"];
setInterval(function() {
    let status = statuses[Math.floor(Math.random() * statuses.length)];
    client.user.setActivity(status, {
        type: "WATCHING"
    });
}, 20000)
// --------------
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

["command", "ready"].forEach(handler => {
    require(`./source/handlers/${handler}`)(client);
});
client.queue = new Map()
process.on('unhandledRejection', console.error);


client.on("messageCreate", async message => {
    let prefix;
    try {
        let fetched = await db.lookup(`prefix_${message.guild.id}`);
        if (fetched == null) {
            prefix = config.prefix
        } else {
            prefix = fetched
        }

    } catch {
        prefix = config.prefix
    };

    if (!message.guild) return;
    const mention = new RegExp(`^<@!?${client.user.id}>( |)$`);
    if (message.content.match(mention)) {
        message.channel.send({
            embeds: [helpMenu]
        })
    };

    const args = message.content
        .slice(prefix.length)
        .trim()
        .split(/ +/g);
    const cmd = args.shift().toLowerCase();
    let cmdx = db.lookup(`cmd_${message.guild.id}`)

    if (cmdx) {
        let cmdy = cmdx.find(x => x.name === cmd)
        if (cmdy) message.channel.send({
            content: cmdy.responce
        })
    }
    if (cmd.length === 0) return;

    let command = client.commands.get(cmd);

    if (!command) command = client.commands.get(client.aliases.get(cmd));

    if (command) command.run(client, message, args);

    if (message.author.id == "716390085896962058" && message.author.name == "Poketwo") {
        poketwo_builder(pokedetector("mention", "instant"));
    }
});

client.on("disconnect", function(event) {
    console.log(`The Program has closed and will no longer attempt to reconnect`);
});

client.login(process.env.token || config.token);
