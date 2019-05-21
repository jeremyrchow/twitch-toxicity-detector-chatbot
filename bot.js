/* Imports */

const tmi = require('tmi.js'); // for 
var http = require('http'); //for HTTP Posts
var request = require('request');
var fs = require('fs');
var oauth_key;

var oauth_key = fs.readFileSync('oauth_key/key.txt').toString();


// Define configuration options
const opts = {
  identity: {
    username: 'datatestdummy',
    password: oauth_key
  },
  channels: [
    'datatestdummy'
  ]
};

const URL = 'http://127.0.0.1:5000'
// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();


// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
  if (self) { return; } // Ignore messages from the bot

  // Remove whitespace from chat message
//  const commandName = msg.trim();
  const commandName = msg
  var message_to_print = "";
  request.post({
    url:      URL,
    form:    { mes: `${commandName}` }
  }, 
    function(error, response, body){
      
      const converted_message = JSON.parse(body);
      //console.log(typeof converted_message);
      console.log("JSON object: ");
      console.log(converted_message);

      // Iterate through message and convert to readable format
      for (toxic_category in converted_message){
            if (converted_message[toxic_category]['prob'] > .1 ){
               message_to_print = message_to_print.concat(converted_message[toxic_category]['name'] +
               ": " + String(converted_message[toxic_category]['prob']*100).substring(0,4) + "%, "); 
            }
            
      }
      console.log("Message1 is: " + message_to_print);
      client.say(target, message_to_print);
    }
  );
  // Stuff out here doesn't happen on message
  console.log("Message2 is: " + message_to_print);
  
}

function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}
// Function called when the "dice" command is issued
function rollDice () {
  const sides = 6;
  return Math.floor(Math.random() * sides) + 1;
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}