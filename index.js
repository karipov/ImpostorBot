const discord = require('discord.js');
const bot = new discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] })
const config = require('./config.json');
const replies = require('./replies.json');


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
bot.on('messageCreate', (ReceivedMessage) => {
  var conditions = Object.keys(replies);
  var in_string = ReceivedMessage.content.toLowerCase();

  // based words detection
  in_string = in_string
    .replace(" ", "")
    .replace(":", "")
    .replace("🅱️", "b")
    .replace("🅰️️", "a");

  var found = conditions.find(element => in_string.includes(element));

  if (found && ReceivedMessage.author !== bot.user) {
    var chosen_arr = replies[found]; // replies for correct word

    if (chosen_arr["delete"]) {
      ReceivedMessage.delete()
    }

    ReceivedMessage.channel.send(randomChooser(chosen_arr["replies"]));
  }

});

// handles login with API key
bot.login(config["token"]);
