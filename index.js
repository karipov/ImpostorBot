const Discord = require('discord.js')
const { prefix, token } = require('./config.json')
const DisTube = require('distube')
const replies = require('./replies.json')
const commands = require('./commands.json')
const client = new Discord.Client({
    intents: ['GUILDS', 'GUILD_VOICE_STATES', 'GUILD_MESSAGES'],
})
const distube = new DisTube.default(client)

client.once('ready', () => {
    console.log('Logged in!')

    distube.on('error', (channel, error) => {
        console.error(error)
        channel.send(`An error encoutered: ${error.slice(0, 1979)}`) // Discord limits 2000 characters in a message
    })
})

client.on("ready", () => {
    client.user.setStatus("online");
    client.user.setActivity("!help, Happy Valentine's Day!", { type: "PLAYING" })
})


function randomChooser(in_array) {
    // floor rounds down to the nearest integer and random is never 1
    // therefore works for 1 length arrays too
    return in_array[Math.floor(in_array.length * Math.random())];
}


client.on('messageCreate', message => {
    // If we the bot is the author then we don't respond
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix) || message.author.bot){

        var conditions = Object.keys(replies);
        var in_string = message.content.toLowerCase();
        if (conditions)
            var found = conditions.find(element => in_string.includes(element));
        if (found && message.author !== client.user) {
            var chosen_arr = replies[found]; // replies for correct word
            if (chosen_arr["delete"] && !chosen_arr["prefix-required"]) {
                message.delete()
            }
            if (!chosen_arr["prefix-required"]) {
                message.channel.send(randomChooser(chosen_arr["replies"]));
            }
        }
        return;
    }

    const args = message.content
        .slice(prefix.length)
        .trim()
        .split(' ')
    const command = args.shift().toLowerCase()

    if (command === 'play') {
        distube.play(message.member.voice.channel, args.join(' '), {
            message,
            textChannel: message.channel,
            member: message.member,
        })
        if (distube.getQueue(message)) {
            message.channel.send(`Queued`);
        } else {
            message.channel.send(`Playing your song! ඞ`)
        }
    }
    else if (command === 'stop') {
        if (distube.getQueue(message)) {
            distube.stop(message)
            message.channel.send("Music stopped");
        }
        else {
            message.channel.send("The queue is already empty");
        }
    }
    else if (command === 'skip') {
        if (distube.getQueue(message)) {
            const queue = distube.getQueue(message)
            if (queue.songs.length > 1) {
                distube.skip(message)
                message.channel.send("skipped track");
            } else {
                message.channel.send("No track to skip to! Pretty sus ඞ");
            }
        } else {
            message.channel.send("No track to skip to! Pretty sus ඞ");
        }
    }
    else if (command === 'pause'){
        distube.pause(message)
        message.channel.send("Paused the music!");
    }
    else if (command === 'resume'){
        distube.resume(message)
        message.channel.send("Resumed playback");
    }
    else if (command === 'queue'){
        const queue = distube.getQueue(message);
        message.channel.send('ඞ Current queue:\n' + queue.songs.map((song, id) =>
            `**${id+1}**. ${song.name} - \`${song.formattedDuration}\``
        ).join("\n"));
    }
    else {
        var conditions = Object.keys(commands);
        var in_string = message.content.toLowerCase();
        if (conditions)
            var found = conditions.find(element => in_string.includes(element));
        if (found && message.author !== client.user) {
            var chosen_arr = commands[found]; // replies for correct word
            if (chosen_arr["delete"]) {
                message.delete()
            }
            message.channel.send(randomChooser(chosen_arr["replies"]));
        }
    }

})

client.login(token)