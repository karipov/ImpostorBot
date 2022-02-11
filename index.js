const discord = require('discord.js');
const bot = new discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] })
const config = require('./config.json');
const replies = require('./replies.json');
const PREFIX = '!';

const ytdl = require("ytdl-core");
const queue = new Map();



function randomChooser(in_array) {
  // floor rounds down to the nearest integer and random is never 1
  // therefore works for 1 length arrays too 
  return in_array[Math.floor(in_array.length * Math.random())];
}

// sets the bots status
bot.on("ready", () => {
  bot.user.setStatus("online");
  bot.user.setActivity('Happy Valentines day! Type ,help for a list of commands!', { type: "PLAYING" })
})

// reads an incoming message and reacts accordingly
bot.on('message', async message => {
    if (message.author.bot) return;

    let args = message.content.substring(PREFIX.length).split(" ");
    const serverQueue = queue.get()


    switch (args[0]) {
        case 'play':
            await execute(message, serverQueue);
            return;

        case 'skip':
            skip(message, serverQueue);
            return;

        case 'stop':
            stop(message, serverQueue);
            return;
    }
});

async function execute(message, serverQueue) {
    const args = message.content.split(" ");

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
        return message.channel.send(
            "You need to be in a voice channel to play music!"
        );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channel.send(
            "I need the permissions to join and speak in your voice channel!"
        );
    }

    const songInfo = await ytdl.getInfo(args[1]);
    const song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
    };

    if (!serverQueue) {
        const queueContruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
        };

        queue.set(message.guild.id, queueContruct);

        queueContruct.songs.push(song);

        try {
            var connection = await voiceChannel.join();
            queueContruct.connection = connection;
            play(message.guild, queueContruct.songs[0]);
        } catch (err) {
            console.log(err);
            queue.delete(message.guild.id);
            return message.channel.send(err);
        }
    } else {
        serverQueue.songs.push(song);
        return message.channel.send(`${song.title} has been added to the queue!`);
    }
}

function skip(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send(
            "You have to be in a voice channel to stop the music!"
        );
    if (!serverQueue)
        return message.channel.send("There is no song that I could skip!");
    serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send(
            "You have to be in a voice channel to stop the music!"
        );

    if (!serverQueue)
        return message.channel.send("There is no song that I could stop!");

    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }

    const dispatcher = serverQueue.connection
        .play(ytdl(song.url))
        .on("finish", () => {
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        })
        .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}

/*var conditions = Object.keys(replies);
var musickeyword = ",play"
var in_string = ReceivedMessage.content.toLowerCase();

if (conditions)
  var found = conditions.find(element => in_string.includes(element));

if (found && ReceivedMessage.author !== bot.user) {
  var chosen_arr = replies[found]; // replies for correct word

  if (chosen_arr["delete"]) {
    ReceivedMessage.delete()
  }

  ReceivedMessage.channel.send(randomChooser(chosen_arr["replies"]));
}*/

// handles login with API key
bot.login(config["token"]);
