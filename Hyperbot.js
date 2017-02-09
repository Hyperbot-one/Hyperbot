const Discord = require("discord.js");
var fs = require('fs');
var bot = new Discord.Client();
var token = "Mjc4Njc1MDkzNTgyOTA1MzQ2.C3vx8w.jpu_70aglJi3J3oLH7JCSx7Gv3g";
//-------------SPAM----------------------------------------------------------------------
var spam = new Map([
	["cancer", "calebSHUTTLE HERE COMES :busstop: THE SHUTTLE FeelsGoodMan"],
	["spamQueen1", "moon2SMAG THC moon2SMAG AKA moon2SMAG TEAM moon2SMAG OF moon2SMAG THE moon2SMAG SPAM moon2SMAG QUEEN moon2SMAG"],
	["spamQueen2", "moon2XD  THC DOESN'T CARE TO BE SEEN moon2VAPE WE ALREADY GOT OURSELVES A SPAM QUEEN moon2WOOP"],
	["spamQueen3", "moon2COOL OUR PLAYERS ARE MEAN AND LEAN moon2GASM OUR CHEERLEADERS WILL SUCK YOUR PEEN moon2BANNED OUR MANAGER'S THE SPAM QUEEN moon2CATEMOTE THC'S THE BEST TEAM YOU'VE EVER SEEN moon22"],
	["globaled", "moon2AWW OUR MASCOT'S CUTE moon2CATEMOTE OUR CHAT IS SPAM moon2MLEM OUR CAPTAIN'S USUALLY moon2SMAG GLOBAL BANNED moon2BANNED"],
	["THC","moon2SMAG Our rank doesnt matter moon2SMAG because teamwork is key moon2SMUG we are Team HyperCat moon2GOOD aka THC moon2VAPE"],
	["gold","moon2CATEMOTE  HYPERCAT IS PROUD moon2SMUG HYPERCAT IS BOLD moon2COOL WE GOT GRILLS moon2TEEHEE AND OUR CAPTAIN IS GOLD moon2LUL"],
	["mustBeTHC","moon2GOOD 3 masters moon2GOOD the rest are plat moon2GOOD must be moon2CATEMOTE Team HyperCat moon2CATEMOTE"]
]);


//-------------COMMANDS -----------------------------------------------------------------
var commands = new Map([
	["help",{process:
		function(bot, msg){
			msg.channel.sendMessage("Hi I'm Hyperbot!");
			msg.channel.sendMessage("I'm here for the meme's and to help you degens cheer on the best team in the Mooncord.");
			msg.channel.sendMessage("If you want to see what commands I currently respond to please type !commands.");
			msg.channel.sendMessage("!avatar followed by someone's username or nickname will link you to the full sized discord hosted image file of their avatar (e.g. \"!avatar Hyperbot\"), if you'd like to be added/removed from this functionality type !blacklist add/remove (e.g. \"!blacklist add\" will add you to the blacklist and users will not be able to download your avatar).");
			msg.channel.sendMessage("I'm programmed in Javascript using the node.js and discord.js frameworks, if you'd like to look at my code type !git");
	}}],
	["git", {process:
		function(bot, msg){
			msg.channel.sendMessage("https://github.com/Hyperbot-one/Hyperbot");
	}}],	
	["ping",{process:
		function(bot, msg){
			msg.channel.sendMessage("pong!");
	}}],
	["lenny",{process:
		function(bot, msg){
			msg.channel.sendMessage("( ͡° ͜ʖ ͡°)");
	}}],
	["justright",{process:
		function(bot, msg){
			msg.channel.sendMessage("✋😩👌");
	}}],
	["tableflip", {process:
		function(bot, msg){
			msg.channel.sendMessage("(╯°□°）╯︵ ┻━┻");
	}}],
	["unflip", {process:
		function(bot, msg){
			msg.channel.sendMessage("┬──┬﻿ ノ( ゜-゜ノ)");
	}}],
	["selfDestruct", {process:
		function(bot, msg){
			msg.channel.sendMessage("!selfDestruct");
			setTimeout(() => { msg.channel.sendMessage("!selfDestruct")}, 1000);
			setTimeout(() => { msg.channel.sendMessage("!selfDestruct")},2000);
			setTimeout(() => { msg.channel.sendMessage("!selfDestruct")}, 3000);
			setTimeout(() => { msg.channel.sendMessage("!selfDestruct")}, 4000);
			setTimeout(() => { msg.channel.sendMessage("BOOM Troll1")}, 5000);
			setTimeout(() => { msg.channel.sendMessage("testing timing of functions and that the bot can't trigger itself")}, 5500);
	}}],
	["avatar", {process:
		function(bot, msg){
			if(searchBL(msg.author.id, getBL()) == -1){
				let userName = msg.content.slice(1).split(" ").slice(1).join(" ");
				let userPic = bot.users.find('username', userName);
				if(userPic == null){
					userPic = msg.guild.members.find('nickname', userName);
					if(userPic == null){
						msg.reply(userName + " does not exist");
						return;
					} else {
						userPic = userPic.user;
					}
				}
				msg.reply(userPic.avatarURL);
			}else{
				msg.reply("this user has !avatar disabled");
			}
	}}],
	["blacklist", {process:
		function(bot, msg){
			let mod = msg.content.slice(1).split(" ")[1];
			let userID = msg.author.id;
			if(mod == "add"){
				console.log("mod: add");
				add2BL(userID);
				if(searchBL(userID, getBL()) != -1){
					msg.reply("You've been added to the !avatar blacklist, to be removed type \"!blacklist remove\"");
				} else {
					msg.reply("There was an error adding you to the blacklist, please try again or contact kdubious");
				}					
			}else if(mod == "remove"){
				console.log("mod: remove");
				removeFromBL(userID);
				if(searchBL(userID, getBL()) == -1){
					msg.reply("You've been removed from the !avatar blacklist, to be added type \"!blacklist add\"");
				} else {
					msg.reply("There was an error removing you from the blacklist, please try again or contact kdubious");
				}
			}else if(mod == "print"){
				console.log("mod: print");
				printBL(msg.channel);
			}else{
				console.log("mod: error");
				msg.channel.sendMessage("please type \"!blacklist add\" to be added to the !avatar blacklist, or \"!blacklist remove\" to be removed and allow !avatar commands with your name.");
			}		
	}}],
	["cheer",{process:
		function(bot, msg){
			let mod = msg.content.slice(1).split(" ")[1];
			if(spam.has(mod)){
				msg.channel.sendMessage(spam.get(mod));
			} else {
				msg.channel.sendMessage(mod + " is not a valid cheer, to view the list of cheers type !cheerList");
			}
	}}],
	["cheerList",{process:
		function(bot, msg){
			for(let cheer of spam.keys()){
				msg.channel.sendMessage("!cheer " + cheer);
			}
	}}],
	["cheerRandom",{process:
		function(bot, msg){
			msg.channel.sendMessage(spam.get(randomCheer()));
	}}],
	["commands", {process:
		function(bot,msg){
			let commandList = "";
			for (var [key, value] of commands){
				if(key == "avatar"){
					commandList = commandList + "!" + key + " (username/nickname)" + "\n";
				} else if(key == "blacklist"){
					commandList = commandList + "!" + key + " (add/remove)" + "\n";
				} else {
					commandList = commandList + "!" + key + "\n";
				}
			}
			msg.channel.sendMessage(commandList);
	}}]
]);
//--------------------------END COMMANDS-----------------------------------------------------

//adds a user to the blacklist array and saves to blacklist.json
function add2BL(userID){
	var bl = getBL();
	if(searchBL(userID, bl) == -1){
		bl.push(userID);
		writeBL(bl, userID, "add");
	}
}

//removes a user to the blacklist array and saves to blacklist.json
function removeFromBL(userID){
	var bl = getBL();
	var i = searchBL(userID, bl);
	if(i >= 0){
		bl.splice(i,1);
		writeBL(bl, userID, "remove");
	}
}

//searches the blacklist array for the userID and returns the index if found and -1 if not
function searchBL(userID, bl){
	for(var i = 0; i < bl.length; i++){
		if(bl[i] == userID) return i;
	}
	return -1;	
}

function printBL(ch){
	var bl = getBL();
	for(var i = 0; i < bl.length; i++){
		ch.sendMessage(bl[i] + " ");
	}
}


//parses the blacklist.json file to a js array containing userID's of users who want to be excluded from the !avatar feature
function getBL(){
	var bl = JSON.parse(fs.readFileSync('./blacklist.json', 'utf8'));
	/*fs.readFile('./blacklist.json', 'utf8', function (err, data) {
		if(err) throw err;
		bl = JSON.parse(data);
		console.log(bl)
	});*/
	console.log("reading blacklist.json:");
	for(var i = 0; i < bl.length; i++){
		console.log("	" + bl[i]);
	}
	return bl;
}

//writes the blacklist array object to blacklist.json
function writeBL(bl, userID, modType){
	console.log("mod:"+modType);
	var json = JSON.stringify(bl);
	fs.writeFileSync('./blacklist.json', json);
	/*
	fs.writeFile('./blacklist.json', json, (err) => {
		if(err) throw err;
		if(modType == 'add') console.log("adding " + userID + " to blacklist");
		else if(modType == "remove") console.log("removing " + userID + " from blacklist");
	});*/
}

function randomCheer(){
	var keysArr = [];
	for(let key of spam.keys()){
		keysArr.push(key);
	}
	console.log(keysArr[Math.floor(Math.random()*(keysArr.length))]);
	return keysArr[Math.floor(Math.random()*(keysArr.length))];
}

//--------------------------EVENTS--------------------------------------------------------------------------------
bot.on("message", msg => {
	let prefix = '!';
	
	//ignore messages that don't start with ! or is from a bot
	if(!msg.content.startsWith(prefix)) return;
	if(msg.author.bot) return;
	
	var cmd = msg.content.slice(1).split(" ");
	console.log(cmd[0]);
	cmd = cmd[0];
	
	//any messages in the delta group server is limited to the #discord_bots_testground channel
	if (msg.guild.id == "226465786871414784"){
		if (msg.channel.id != "257759410384797697" ){
			msg.channel.sendMessage("get back in #discord_bots_testground Kapp");
			return;
		}
	}
	
	//limits hyperbot to #hyperbot-factory in Hypercats server for testing
	if (msg.guild.id == "154419834728218625"){
		if (msg.channel.id != "279104520104050688" ){
			return;
		}
	}
	
	//takes the first word of the message and searches the commands Map, if it is a valid command it will run the coresponding function
	if (commands.has(cmd)){
		commands.get(cmd).process(bot,msg);
	}
});

bot.on('ready', () => {
  console.log(`Ready to server in ${bot.channels.size} channels on ${bot.guilds.size} servers, for a total of ${bot.users.size} users.`);
});
//--------------------------END EVENTS----------------------------------------------------------------------------
bot.login(token);