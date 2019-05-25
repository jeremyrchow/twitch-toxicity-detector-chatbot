/* Imports */

const tmi = require('tmi.js'); // for 
var http = require('http'); //for HTTP Posts
var request = require('request');
var fs = require('fs');

// HEROKU syntax for passing twitch account user auth key
var oauth_key =  process.env.TWITCH_OAUTH_KEY;
//var oauth_key = fs.readFileSync('./oauth_key/key.txt').toString();


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
// Set model URL to send classification requests to
const model_URL = 'https://chat-toxicity-classifier.herokuapp.com/?chat_in=yeah'

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
  // ^ This step is not necessary, handled by website
  
  console.log("\nInput Message: " + msg)
  
  const commandName = msg
  
  // Send a post request to model URL. Website will handle post request, and send JSON with
  // rows of format {{'name' = 'toxic_category' : 'probability' = value}}

  var message_to_print = "";
  request.post({
    url:      model_URL,
    form:    { mes: `${commandName}` }
  }, 
    function(error, response, body){
      
      const converted_message = JSON.parse(body);
      //console.log(typeof converted_message);
      console.log("JSON object: ");
      console.log(converted_message);

      // Iterate through message and convert to readable format
      for (toxic_category in converted_message){
            if (converted_message[toxic_category]['prob'] > .3 ){
               message_to_print = message_to_print.concat(converted_message[toxic_category]['name'] +
               ": " + String(converted_message[toxic_category]['prob']*100).substring(0,4) + "%, "); 
            }
            
      }
      
      console.log("Chatbot Response is: " + message_to_print);
      client.say(target, message_to_print);
    }
  );

  // Stuff out here doesn't happen on message received
  //console.log("Message2 is: " + message_to_print);
  
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}