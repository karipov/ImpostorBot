const discord = require('discord.js');
const bot = new discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] })
const config = require('./config.json');
const replies = require('./replies.json');
const PREFIX = '!';

const ytdl = require("ytdl-core");




function randomChooser(in_array) {
  // floor rounds down to the nearest integer and random is never 1
  // therefore works for 1 length arrays too 
  return in_array[Math.floor(in_array.length * Math.random())];
}

var servers = {}

// sets the bots status
bot.on("ready", () => {
  bot.user.setStatus("online");
  bot.user.setActivity('Happy Valentines day! Type ,help for a list of commands!', { type: "PLAYING" })
})

// reads an incoming message and reacts accordingly
bot.on('message', message => {

    let args = message.content.substring(PREFIX.length).split(" ");

    switch (args[0]) {
      case 'play':

            function play(connection, message){
                var server = servers[message.guild.id];

                server.dispatcher = connection.playStream(ytdl(server.queue[0], {filter: "audioonly"}));

                server.queue.shift();

                server.dispatcher.on("end", function(){
                    if (server.queue[0]){
                        play(connection, message);
                    }
                    else {
                        connection.disconnect();
                    }
                })
            }


            if (!args[1]){
              message.channel.send("Pretty sus ඞ - you need to give me a link for me to be able to play anything!")
                return;
            }
            if (!message.member.voiceChannel){
                message.channel.send("You need to be in a voice channel so that I know where to go! ඞ")
                return;
            }
            if (!servers[message.guild.id]) servers[message.guild.id] = {
                queue: []
            }

            var server = servers[message.guild.id];

            server.queue.push(args[1]);

            if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection){
                play(connection, message)
            })
        break;

        case 'skip':
            var server = servers[message.guild.id];
            if (server.dispatcher) server.dispatcher.end();
            message.channel.send("Song skipped! ඞ")

        break;

        case 'stop':
            var server = servers[message.guild.id];
            if (message.guild.voiceConnection){
                for (var i = server.queue.length -1; i >= 0; i--){
                    server.queue.splice(i, 1);
                }

                server.dispatcher.end();
                message.channel.send("Stopped the queue. ඞ")
            }

            if (message.guild.connection) message.guild.voiceConnection.disconnect();

    }

});

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
