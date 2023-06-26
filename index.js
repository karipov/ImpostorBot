const Discord = require('discord.js')
const { prefix, token } = require('./config.json')
const DisTube = require('distube')
const commands = require('./commands.json')


const client = new Discord.Client({
    intents: ['GUILDS', 'GUILD_VOICE_STATES', 'GUILD_MESSAGES'],
})
const distube = new DisTube.default(client)

function randomChooser(in_array) {
    return in_array[Math.floor(in_array.length * Math.random())];
}


client.once('ready', () => {
    console.log('Logged in!')
    console.log(owo('The bot has logged in, and is ready to start working!'))

    distube.on('error', (channel, error) => {
        console.error(error)
        channel.send(`An error encoutered: ${error.slice(0, 1979)}`)
    })
})

client.on("ready", () => {
    client.user.setStatus("online");
    client.user.setActivity("!help, Ready to Play :)", { type: "PLAYING" })
})

client.on('messageCreate', message => {
    // if we the bot is the author then we don't respond
    if (message.author.bot) return;

    const args = message.content
        .slice(prefix.length)
        .trim()
        .split(' ')
    const command = args.shift().toLowerCase()

    // distube commands
    if (command === 'play') {
        distube.play(message.member.voice.channel, args.join(' '), {
            message,
            textChannel: message.channel,
            member: message.member,
        })
        if (distube.getQueue(message)) {
            message.channel.send(`Queued`);
        } else {
            message.channel.send(`Playing your song!`)
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
                message.channel.send("Skipped track");
            } else {
                message.channel.send("No track to skip to!");
            }
        } else {
            message.channel.send("No track to skip to!");
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
        message.channel.send('Current queue:\n' + queue.songs.map((song, id) =>
            `**${id+1}**. ${song.name} - \`${song.formattedDuration}\``
        ).join("\n"));
    }

    else {
        var conditions = Object.keys(commands);
        var in_string = message.content.toLowerCase();

        if (conditions)
            var found = conditions.find(element => in_string.includes(element));

        if (found && message.author !== client.user) {
            // replies for correct word
            var chosen_arr = commands[found]; 
            if (chosen_arr["delete"]) { message.delete() }
            message.channel.send(randomChooser(chosen_arr["replies"]));
        }
    }
})

client.login(token)