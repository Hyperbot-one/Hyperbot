
/*TODO:
	- !kao banned
	- add multiple quotes with same auth/date (recursively search auth/date, if found add i to end)
	- !cj random pepes
	- rickroll on 20's
	- counter for time since last rec emote fuckup, shun spelling kdubs wrong etc.	
	... plus others moon2T
*/

const Discord = require("discord.js");
const config = require("./config.json");
const hidCmds = require("./hiddenCmds");
var fs = require('fs');
var bot = new Discord.Client();
var token = config.token;
var cheerRoles;
var spamRoles;
var roll20Cooldown;

//-------------COMMANDS -----------------------------------------------------------------
var commands = new Map([
	["DnD", {process:
		function(bot,msg){
			msg.channel.sendMessage("moon2WOO we're going to start a DnD campaign! Juk has been kind enough to sacrifice his time to get one set up and dm for us, If you want to be added to the list of potential players type `!IWantToPlayDnD` and when the time comes to get the party set up there will be a draw to see who gets to play, from there we can schedule a time that works for everyone. More info to come soon!");				
	}}],
	["IWantToPlayDnD", {process:
		function(bot,msg){
			let userName = msg.author.username;
			add2GiveAway(userName);
			if(searchGiveAway(userName, getJSON('./giveaway.json')) != -1){
				msg.reply("You've been added to the shortlist for the THC DND campaign");
			} else {
				msg.reply("There was an error adding you to the dnd list, please try again or contact kdubious");
			}					
	}}],
	["DnDDraw", {process:
		function(bot,msg){
			if(msg.author.username == "kdubious"){
				draw = getJSON('./giveaway.json');
				winners = [];
				for(var i = 0; i < 6; i++){
					var x = randomIntBtw(0,draw.length);
					winners.push(draw[x]);
					draw.splice(x,1);
				}
				str = "The party members for the first THC DnD group are: ";
				for(var i = 0; i < winners.length; i++){
					if(i != 5){
						str = str + winners[i] + ", ";
					}else{
						str = str + " and " + winners[i];
					}
				}
				msg.channel.sendMessage(str);
				console.log(draw);
			} else {
				msg.channel.sendMessage("you do not have permision to enter this command.");
			}
	}}],
	["spamList", {process:
		function(bot,msg,spam){
			let spamList = "";
			for(let txt of Object.keys(spam.txt)){
				spamList = spamList + "!" + txt + "\n";
			}
			spamList = spamList + "!acc (custom input)\n";
			spamList = spamList + "!juk (custom input)\n";
			msg.channel.sendMessage("```"+spamList+"```")
	}}],
	["cheerList",{process:
		function(bot,msg,spam){
			let cheerList = "";
			for(let cheer of Object.keys(spam.cheers)){
				cheerList = cheerList + "!cheer " + cheer + "\n";
			}
			msg.channel.sendMessage("```"+cheerList+"```")
	}}],
	["randomCheer",{process:
		function(bot, msg, spam){
			msg.channel.sendMessage(spam.cheers[randomCheer(spam.cheers)]);
	}}],
	["acc",{process:
		function(bot, msg, spam){
			let x = msg.content.slice(1).split(" ").slice(1).join(" ");
			msg.channel.sendMessage("I'm AcceptableLosses and " + x);
	}}],
	["juk",{process:
		function(bot, msg, spam){
			let x = msg.content.slice(1).split(" ").slice(1).join(" ");
			msg.channel.sendMessage("I go "+x+" now chat ill be in and out....... .tv/jukuren201 if anyone is interested :thinking:");
	}}],
	["addCheer",{process:
		function(bot,msg,spam,approvedRoles){
			let cheer = msg.content.slice(1).split(" ").slice(1).join(" ").split("|");
			let cheerName = cheer[0];
			let cheerTxt = cheer[1];
			let approved = false;
			for(let role of approvedRoles){
				if(role.members.has(msg.author.id)){
					approved = true;
				}
			}
			if(approved){
				if(searchCheers(cheerName,getJSON('./spam.json'))){
					msg.channel.sendMessage("a cheer with this name already exists");
					return;
				}
				spam.cheers[cheerName] = cheerTxt;
				writeSpam(spam.cheers, spam.txt);
				if(searchCheers(cheerName,getJSON('./spam.json'))){
					msg.channel.sendMessage("your cheer has successfully been added to the list");
					console.log(msg.author.username + " has added cheer- "+ cheer[0] +" : "+ cheer[1]);
				} else {
					msg.channel.sendMessage("your cheer has not been added to the list, make sure you are correctly formating the command ex. `!addCheer name|cheer`");
				}
			}else{
				msg.channel.sendMessage("Sorry you dont have permision to use this command");
			}
	}}],
	["removeCheer", {process: 
		function(bot,msg,spam,approvedRoles){
			let cheerName = msg.content.slice(1).split(" ").slice(1);
			let approved = false;
			for(let role of approvedRoles){
				if(role.members.has(msg.author.id)){
					approved = true;
				}
			}
			if(approved){
				if(!searchCheers(cheerName,getJSON('./spam.json'))){
					msg.channel.sendMessage(cheerName + " is not a listed cheer");
					return;
				}
				delete spam.cheers[cheerName];
				writeSpam(spam.cheers, spam.txt);
				if(!searchCheers(cheerName,getJSON('./spam.json'))){
					msg.channel.sendMessage(cheerName +" has been deleted");
					console.log(msg.author.username + " has removed " + cheerName);
				} else {
					msg.channel.sendMessage(cheerName + "was not removed from the list, try again or contact kdubious");
				}
			}else{
				msg.channel.sendMessage("Sorry you dont have permision to use this command");
			}
	}}],
	["addCommand",{process:
		function(bot,msg,spam,approvedRoles){
			let txt = msg.content.slice(1).split(" ").slice(1).join(" ").split("|");
			let txtName = txt[0];
			let txtContent = txt[1];
			let approved = false;
			for(let role of approvedRoles){
				if(role.members.has(msg.author.id)){
					approved = true;
				}
			}
			if(approved){
				if(searchKey(txtName,getJSON('./spam.json'))){
					msg.channel.sendMessage("a command with this name already exists");
					return;
				}
				spam.txt[txtName] = txtContent;
				writeSpam(spam.cheers, spam.txt);
				if(searchKey(txtName,getJSON('./spam.json'))){
					msg.channel.sendMessage("your command has successfully been added to the list");
					console.log(msg.author.username + " has added command- "+ txt[0] +" : "+ txt[1]);
				} else {
					msg.channel.sendMessage("your command has not been added to the list, make sure you are correctly formating the command ex. `!addCommand name|content`");
				}
			}else{
				msg.channel.sendMessage("Sorry you dont have permision to use this command");
			}
	}}],
	["removeCommand", {process: 
		function(bot,msg,spam,approvedRoles){
			let txtName = msg.content.slice(1).split(" ").slice(1);
			let approved = false;
			for(let role of approvedRoles){
				if(role.members.has(msg.author.id)){
					approved = true;
				}
			}
			if(approved){
				if(!searchKey(txtName,getJSON('./spam.json'))){
					msg.channel.sendMessage(txtName + " is not a listed command");
					return;
				}
				delete spam.txt[txtName];
				writeSpam(spam.cheers, spam.txt);
				if(!searchKey(txtName,getJSON('./spam.json'))){
					msg.channel.sendMessage(txtName +" has been deleted");
					console.log(msg.author.username + " has removed " + txtName);
				} else {
					msg.channel.sendMessage(txtName + "was not removed from the list, try again or contact kdubious");
				}
			}else{
				msg.channel.sendMessage("Sorry you dont have permision to use this command");
			}
	}}],
	["quote",{process:
		function(bot,msg){
			let quotes = getJSON('./quotes.json');
			let randQuote = randomCheer(quotes);
			msg.channel.sendMessage(quotes[randQuote] + "\n    -" + randQuote);
		
	}}],
	["addQuote",{process:
		function(bot,msg){
			let quotes = getJSON('./quotes.json');
			let input = msg.content.slice(1).split(" ").slice(1).join(" ").split("|");
			let auth = input[0];
			let quote = input[1];
			console.log(auth + " : " + quote);
			
			if(searchTxt(quote,getJSON('./quotes.json'))){
				msg.channel.sendMessage("this quote has already been entered");
				return;
			}
			
			quotes[auth] = quote;
			fs.writeFileSync('./quotes.json', JSON.stringify(quotes));
			
			if(searchTxt(quote,getJSON('./quotes.json'))){
				msg.channel.sendMessage("your quote has successfully been added to the list");
				console.log(msg.author.username + " has added quote- "+ auth +" : "+ quote);
			} else {
				msg.channel.sendMessage("your quote has not been added to the list, make sure you are correctly formating the command ex. `!addQuote name date|quote`");
			}			
	}}],
	["removeQuote", {process:
		function(bot,msg,approvedRoles){
			let quotes = getJSON('./quotes.json');
			let quote = msg.content.slice(1).split(" ").slice(1).join(" ")
			let approved = false;
			
			for(let role of approvedRoles){
				if(role.members.has(msg.author.id)){
					approved = true;
				}
			}
			if(approved){
				if(!searchTxt(quote,quotes)){
					msg.channel.sendMessage("`" + quote + "` is not a listed quote");
					return;
				}else{
					for(var key in quotes){
						if(quotes[key] == quote){
							delete quotes[key];
						}
					}
				}

				fs.writeFileSync('./quotes.json', JSON.stringify(quotes));
				if(!searchTxt(quote,getJSON('./quotes.json'))){
					msg.channel.sendMessage("your quote has successfully been removed to the list");
					console.log(msg.author.username + " has removed quote- "+ quote);
				} else {
					msg.channel.sendMessage("your quote has not been removed from the list, make sure you are correctly formating the command ex. `!removeQuote quote`");
			}
			}else{
				msg.channel.sendMessage("Sorry you dont have permision to use this command");
			}
	}}],
	["roll20", {process:
		function(bot,msg){
			var cooldown = Math.round(new Date() / 1000) - lastRoll;
			if(cooldown >= 10){
				let leaderboard = getJSON('./roll20.json');
				var userIndex = searchLeaderboard(msg.author.username,leaderboard);
										
				//returns index of user if found, -1 if not
				if( userIndex == -1){
					userIndex = leaderboard.push({"user":msg.author.username, "twenty":0, "high":0, "med":0, "low":0, "one":0}) - 1;
				}
				let i = randomIntBtw(1,21);
				if(i == 20){
					msg.channel.sendMessage(msg.author + " PogChamp you rolled " + i + "! Watch out we have a bad ass over here BadAss https://www.youtube.com/watch?v=6RJgpPyadeM");
					leaderboard[userIndex].twenty ++;
				} else if(i < 20 && i >= 15){
					msg.channel.sendMessage(msg.author + " you rolled " + i + " moon2OOO Not too bad! https://media.makeameme.org/created/well-done-you-htk6a4.jpg");
					leaderboard[userIndex].high ++;
				} else if(i < 15 && i > 5){
					msg.channel.sendMessage(msg.author + " you rolled " + i + ", congrats you're mediocre FeelsBadMan");
					leaderboard[userIndex].med ++;
				} else if(i <= 5 && i > 1){
					msg.channel.sendMessage(msg.author + " you rolled " + i + ", at least you tried FailFish https://s-media-cache-ak0.pinimg.com/736x/a7/92/e7/a792e77615f449b39f173fc0c165ada5.jpg");
					leaderboard[userIndex].low ++;
				} else {
					msg.channel.sendMessage(msg.author + " you rolled " + i + "! LOLguy git gud scrub https://www.youtube.com/watch?v=2-CnmVVHIzU");
					leaderboard[userIndex].one ++;
				}		
			
				
				var json = JSON.stringify(leaderboard);
				fs.writeFileSync('./roll20.json', json);
				lastRoll = Math.round(new Date() / 1000);
			} else {
				msg.reply("please wait " + (10 - cooldown) + " seconds to roll again");
			}
	}}],
	["leaderboard", {process:
		function(bot,msg){
			let mod = msg.content.slice(1).split(" ")[1];
			let leaderboard = getJSON('./roll20.json');
			var str = "";
			if(mod == "20"){
				var leaderboardSort = leaderboard.slice(0);
				leaderboardSort.sort(function(a,b){return b.twenty - a.twenty;});
				str = "__**ROLL 20 LEADERBOARD: MOST 20 ROLLS**__\n\n";
				for(user of leaderboardSort){
					str = str + "__**" + user.user + "**__:\n	 **20's: " + user.twenty + "** | high rolls: " + user.high + " | medium rolls: " + user.med + " | low rolls: " + user.low + " | ones: " + user.one +"\n\n\u0000";
				}
			}else if(mod == "high"){
				var leaderboardSort = leaderboard.slice(0);
				leaderboardSort.sort(function(a,b){return b.high - a.high;});
				str = "__**ROLL 20 LEADERBOARD: MOST HIGH ROLLS**__\n\n";
				for(user of leaderboardSort){
					str = str + "__**" + user.user + "**__:\n	 20's: " + user.twenty + " | **high rolls: " + user.high + "** | medium rolls: " + user.med + " | low rolls: " + user.low + " | ones: " + user.one +"\n\n\u0000";
				}
			}else if(mod == "med"){
				var leaderboardSort = leaderboard.slice(0);
				leaderboardSort.sort(function(a,b){return b.med - a.med;});
				str = "__**ROLL 20 LEADERBOARD: MOST MEDIUM ROLLS**__\n\n";
				for(user of leaderboardSort){
					str = str + "__**" + user.user + "**__:\n	 20's: " + user.twenty + " | high rolls: " + user.high + " | **medium rolls: " + user.med + "** | low rolls: " + user.low + " | ones: " + user.one +"\n\n\u0000";
				}
			}else if(mod == "low"){
				var leaderboardSort = leaderboard.slice(0);
				leaderboardSort.sort(function(a,b){return b.low - a.low;});
				str = "__**ROLL 20 LEADERBOARD: MOST LOW ROLLS**__\n\n";
				for(user of leaderboardSort){
					str = str + "__**" + user.user + "**__:\n	 20's: " + user.twenty + " | high rolls: " + user.high + " | medium rolls: " + user.med + " | **low rolls: " + user.low + "** | ones: " + user.one +"\n\n\u0000";
				}
			}else if(mod == "1"){
				var leaderboardSort = leaderboard.slice(0);
				leaderboardSort.sort(function(a,b){return b.one - a.one;});
				str = "__**ROLL 20 LEADERBOARD: MOST ONE ROLLS**__\n\n";
				for(user of leaderboardSort){
					str = str + "__**" + user.user + "**__:\n	 20's: " + user.twenty + " | high rolls: " + user.high + " | medium rolls: " + user.med + " | low rolls: " + user.low + " | **ones: " + user.one +"**\n\n\u0000";
				}
			}else if(mod == "20%"){
				var leaderboardSort = leaderboard.slice(0);
				leaderboardSort.sort(function(a,b){return (b.twenty / (b.twenty + b.high + b.med + b.low + b.one)*100)-(a.twenty / (a.twenty + a.high + a.med + a.low + a.one)*100);});
				str = "__**ROLL 20 LEADERBOARD: TOP 20 ROLL PERCENTAGES**__\n\n";
				for(user of leaderboardSort){
					var total = user.twenty + user.high + user.med + user.low + user.one;
					str = str + "__**" + user.user + "**__:\n	 **20's: " + Math.round((user.twenty/total*100)*100)/100 + "%** | high rolls: " + Math.round((user.high/total*100)*100)/100 + "% | medium rolls: " + Math.round((user.med/total*100)*100)/100 + "% | low rolls: " + Math.round((user.low/total*100)*100)/100 + "% | ones: " + Math.round((user.one/total*100)*100)/100 +"%\n\n\u0000";
				}
			}else if(mod == "high%"){
				var leaderboardSort = leaderboard.slice(0);
				leaderboardSort.sort(function(a,b){return (b.high / (b.twenty + b.high + b.med + b.low + b.one)*100)-(a.high / (a.twenty + a.high + a.med + a.low + a.one)*100);});
				str = "__**ROLL 20 LEADERBOARD: TOP HIGH ROLL PERCENTAGES**__\n\n";
				for(user of leaderboardSort){
					var total = user.twenty + user.high + user.med + user.low + user.one;
					str = str + "__**" + user.user + "**__:\n	 20's: " + Math.round((user.twenty/total*100)*100)/100 + "% | **high rolls: " + Math.round((user.high/total*100)*100)/100 + "%** | medium rolls: " + Math.round((user.med/total*100)*100)/100 + "% | low rolls: " + Math.round((user.low/total*100)*100)/100 + "% | ones: " + Math.round((user.one/total*100)*100)/100 +"%\n\n\u0000";
				}
			}else if(mod == "med%"){
				var leaderboardSort = leaderboard.slice(0);
				leaderboardSort.sort(function(a,b){return (b.med / (b.twenty + b.high + b.med + b.low + b.one)*100)-(a.med / (a.twenty + a.high + a.med + a.low + a.one)*100);});
				str = "__**ROLL 20 LEADERBOARD: TOP MEDIUM ROLL PERCENTAGES**__\n\n";
				for(user of leaderboardSort){
					var total = user.twenty + user.high + user.med + user.low + user.one;
					str = str + "__**" + user.user + "**__:\n	 20's: " + Math.round((user.twenty/total*100)*100)/100 + "% | high rolls: " + Math.round((user.high/total*100)*100)/100 + "% | **medium rolls: " + Math.round((user.med/total*100)*100)/100 + "%** | low rolls: " + Math.round((user.low/total*100)*100)/100 + "% | ones: " + Math.round((user.one/total*100)*100)/100 +"%\n\n\u0000";
				}
			}else if(mod == "low%"){
				var leaderboardSort = leaderboard.slice(0);
				leaderboardSort.sort(function(a,b){return (b.low / (b.twenty + b.high + b.med + b.low + b.one)*100)-(a.low / (a.twenty + a.high + a.med + a.low + a.one)*100);});
				str = "__**ROLL 20 LEADERBOARD: TOP LOW ROLL PERCENTAGES**__\n\n";
				for(user of leaderboardSort){
					var total = user.twenty + user.high + user.med + user.low + user.one;
					str = str + "__**" + user.user + "**__:\n	 20's: " + Math.round((user.twenty/total*100)*100)/100 + "% | high rolls: " + Math.round((user.high/total*100)*100)/100 + "% | medium rolls: " + Math.round((user.med/total*100)*100)/100 + "% | **low rolls: " + Math.round((user.low/total*100)*100)/100 + "%** | ones: " + Math.round((user.one/total*100)*100)/100 +"%\n\n\u0000";
				}
			}else if(mod == "1%"){
				var leaderboardSort = leaderboard.slice(0);
				leaderboardSort.sort(function(a,b){return (b.one / (b.twenty + b.high + b.med + b.low + b.one)*100)-(a.one / (a.twenty + a.high + a.med + a.low + a.one)*100);});
				str = "__**ROLL 20 LEADERBOARD: TOP ONE ROLL PERCENTAGES**__\n\n";
				for(user of leaderboardSort){
					var total = user.twenty + user.high + user.med + user.low + user.one;
					str = str + "__**" + user.user + "**__:\n	 20's: " + Math.round((user.twenty/total*100)*100)/100 + "% | high rolls: " + Math.round((user.high/total*100)*100)/100 + "% | medium rolls: " + Math.round((user.med/total*100)*100)/100 + "% | low rolls: " + Math.round((user.low/total*100)*100)/100 + "% | **ones: " + Math.round((user.one/total*100)*100)/100 +"%**\n\n\u0000";
				}
			} else {
				str = "please select the type of leaderboard you wish to view `!leaderboard (20/high/med/low/1)` or `!leaderboard (20%/high%/med%/low%/1%)`";
			}
			if(str.length >= 2000){
				var strArr = str.split("\u0000");
				var strArr2 = [];
				strArr2[0] = strArr[0];
				var x = 0;
				for(var i = 1; i < strArr.length; i++){
					if(typeof strArr2[x] === 'undefined'){
						strArr2[x] = strArr[i];
					}else if(strArr2[x].length < 1700){
						strArr2[x] = strArr2[x] + strArr[i];
					}else{
						x++;
					}
				}
				for(var i = 0; i < strArr2.length; i++){
					msg.channel.sendMessage(strArr2[i]);
				}
			}else{
			msg.channel.sendMessage(str);
			}
	}}],
	["avatar", {process:
		function(bot, msg){
			if(searchBL(msg.author.id, getJSON('./blacklist.json')) == -1){
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
				if(searchBL(userID, getJSON('./blacklist.json')) != -1){
					msg.reply("You've been added to the !avatar blacklist, to be removed type \"!blacklist remove\"");
				} else {
					msg.reply("There was an error adding you to the blacklist, please try again or contact kdubious");
				}					
			}else if(mod == "remove"){
				console.log("mod: remove");
				removeFromBL(userID);
				if(searchBL(userID, getJSON('./blacklist.json')) == -1){
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
	["smurglord", {process:
		function(bot, msg){
			var cooldown = Math.round(new Date() / 1000) - lastSmurg;
			if(cooldown >= 600){
				msg.channel.sendMessage("now summoning the Smurglord...");
				setTimeout(() => { msg.channel.sendMessage("<@155123023496740865> ***ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn***")}, 1000);
				setTimeout(() => { msg.channel.sendMessage("<@155123023496740865> ***ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn***")}, 2000);
				setTimeout(() => { msg.channel.sendMessage("<@155123023496740865> ***ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn***")}, 3000);
				setTimeout(() => { msg.channel.sendMessage("<@155123023496740865> ***ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn***")}, 4000);
				lastSmurg = Math.round(new Date() / 1000);
			} else {
				msg.reply("the smurglord slumbers try summoning again in " + (600 - cooldown) + " seconds");
			}
	}}],
	["farming", {process: 
		function(bot,msg){
			let txt = msg.content.slice(1).split(" ").slice(1).join(" ")
			let colonCount = 0;
			let emote = '';
			let str = '';
			for(c in txt){
				if(txt[c] == ":"){
					colonCount++;
				}else if(colonCount == 1){
					emote = emote + txt[c];
				}else if(colonCount >= 2){
					break;
				}
			}
			if(colonCount == 0) emote = txt;
			for(let i = 0; i <= 5; i++){
				str = str + emote + " ";
			}
			str = str + ":tractor: KKona:flip";
			msg.channel.sendMessage(str);
	}}],
	["commands", {process:
		function(bot,msg){
			let commandList = "";
			commandList = commandList + "!help\n";
			commandList = commandList + "!git\n";
			for (var [key, value] of commands){
				if(key == "avatar"){
					commandList = commandList + "!" + key + " (username/nickname)\n";
				} else if(key == "blacklist"){
					commandList = commandList + "!" + key + " (add/remove)\n";
				} else if(key == "addCheer"){
					commandList = commandList + "!" + key + " cheerName|cheer\n";
				} else if(key == "removeCheer"){
					commandList = commandList + "!" + key + " cheerName\n";
				} else if(key == "addCommand"){
					commandList = commandList + "!" + key + " commandName|content\n";
				} else if(key == "removeCommand"){
					commandList = commandList + "!" + key + " commandName\n";
				} else if(key == "addQuote"){
					commandList = commandList + "!" + key + " author date|quote\n";
				} else if(key == "farming"){
					commandList = commandList + "!" + key + " (twitch/bd emote)\n";
				} else if(key == "acc" || key == "giveaway" || key == "IWantToPlayDnD" || key == "DnDDraw" || key == "juk"){
					continue;
				} else{
					commandList = commandList + "!" + key + "\n";
				}
			}
			
			msg.channel.sendMessage("```"+commandList+"```");
	}}]
]);
//--------------------------END COMMANDS-----------------------------------------------------

function writeSpam(cheersMap, txtMap){
	var spam = getJSON('./spam.json');
	spam.cheers = cheersMap;
	spam.txt = txtMap;
	var json = JSON.stringify(spam);
	fs.writeFileSync('./spam.json', json);	
}

function searchCheers(key,spam){
	for(let cheer of Object.keys(spam.cheers)){
		if(cheer == key){
			return true;
		}
	}
	return false;
}

function searchKey(key,spam){
	for(let cheer of Object.keys(spam.txt)){
		if(cheer == key){
			return true;
		}
	}
	return false;
}

function searchTxt(input, arr){
	for(let txt of Object.keys(arr).map(function(key) {return arr[key];} )){
		if(txt == input){
			return true;
		}
	}
	return false;
}

function searchLeaderboard(username,leaderboard){
	for(let user of leaderboard){
		if(username == user.user) return leaderboard.indexOf(user);
	}
	return -1;
}

function add2GiveAway(userName){
	var giveaway = getJSON('./giveaway.json');
	if(searchGiveAway(userName, giveaway) == -1){
		giveaway.push(userName);
		fs.writeFileSync('./giveaway.json', JSON.stringify(giveaway));
	}
}

function searchGiveAway(userName, giveaway){
	for(var i = 0; i < giveaway.length; i++){
		if(giveaway[i] == userName) return i;
	}
	return -1;	
}


//adds a user to the blacklist array and saves to blacklist.json
function add2BL(userID){
	var bl = getJSON('./blacklist.json');
	if(searchBL(userID, bl) == -1){
		bl.push(userID);
		writeBL(bl, userID, "add");
	}
}

//removes a user to the blacklist array and saves to blacklist.json
function removeFromBL(userID){
	var bl = getJSON('./blacklist.json');
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
	var bl = getJSON('./blacklist.json');
	for(var i = 0; i < bl.length; i++){
		ch.sendMessage(bl[i] + " ");
	}
}

//returns the javascript equivalent object from the provided .json file 
function getJSON(path){
	return JSON.parse(fs.readFileSync(path, 'utf8'));
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

function randomIntBtw(min, max){
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random()*(max - min)) + min;	
}

function randomCheer(cheerMap){
	var keysArr = [];
	for(let key of Object.keys(cheerMap)){
		keysArr.push(key);
	}
	return keysArr[randomIntBtw(0,keysArr.length)];
}

function getLowerCaseKeyMap(obj, map){
	var lk = new Map();
	if(map){
		for(var x of obj.keys()){
			lk.set(x.toLowerCase(), x);
		}
	}else{
		for(var x of Object.keys(obj)){
			lk.set(x.toLowerCase(), x);
		}
	}
	return lk;	
}

//--------------------------EVENTS--------------------------------------------------------------------------------
bot.on("message", msg => {
	let prefix = '!';
	
	//ignore messages that don't start with ! or is from a bot
	if(!msg.content.startsWith(prefix)) return;
	if(msg.author.bot) return;
	
	/*limits hyperbot to #hyperbot-factory in Hypercats server for testing
	if (msg.guild.id == "154419834728218625"){
		if (msg.channel.id != "279104520104050688" ){
			return;
		}
	}*/
	var spam = getJSON('./spam.json');
	var hiddenCmds = getJSON('./hidden.json');
	
	var cmdKeys = getLowerCaseKeyMap(commands, true);
	var cheerKeys = getLowerCaseKeyMap(spam.cheers, false);
	var txtKeys = getLowerCaseKeyMap(spam.txt, false);

	var command = msg.content.slice(1).split(" ");
	console.log(command[0]);
	var cmd = command[0].toLowerCase();
	if(command[1]){	var cheer = command[1].toLowerCase();}
	
	//takes the first word of the message and searches the commands Map, the cheers map, and the txt map, if it is a valid command it will run the coresponding function
	if (cmdKeys.has(cmd)){
		if(cmd == "cheerlist" || cmd == "randomcheer" || cmd == "spamlist"){
			commands.get(cmdKeys.get(cmd)).process(bot,msg,spam);
		}else if(cmd == "addcheer"){
			commands.get(cmdKeys.get(cmd)).process(bot,msg,spam,cheerAddRoles);
		}else if(cmd == "removecheer" || cmd == "removecommand" || cmd == "addcommand"){
			commands.get(cmdKeys.get(cmd)).process(bot,msg,spam,cheerRemoveRoles);
		}else if(cmd == "removequote"){
			commands.get(cmdKeys.get(cmd)).process(bot,msg,cheerRemoveRoles);
		}else{
			commands.get(cmdKeys.get(cmd)).process(bot,msg);
		}
	}else if(cmd == "cheer" && cheerKeys.has(cheer)){
		msg.channel.sendMessage(spam.cheers[cheerKeys.get(cheer)]);
	}else if(txtKeys.has(cmd)){
		msg.channel.sendMessage(spam.txt[txtKeys.get(cmd)]);
	}else if(hiddenCmds.hasOwnProperty(command)){
		msg.channel.sendMessage(hiddenCmds[command]);
		hidCmds.command(command);
	}
});

bot.on('guildMemberAdd',user =>{
	var thc = bot.guilds.get('154419834728218625');
    if(user.guild == thc){
		bot.channels.get('278395091641565196').sendMessage("@here " + user.user.username + " has joined the server");
	}
});

bot.on('ready', () => {
	console.log(`Ready to server in ${bot.channels.size} channels on ${bot.guilds.size} servers, for a total of ${bot.users.size} users.`);
	thc = bot.guilds.get('154419834728218625');
	cheerAddRoles = [
		thc.roles.get('275378439031095316'),	//Hyper SPAM Queen
		thc.roles.get('278394315770822656'),	//Tech Help
		thc.roles.get('276489543853801483'),	//Team HyperCat
		thc.roles.get('278387425850556417'),	//HyperCat Coach
		thc.roles.get('276488938456219659'),	//HyperKittens
	];
	
	cheerRemoveRoles = [
		thc.roles.get('275378439031095316'),	//Hyper SPAM Queen
		thc.roles.get('278394315770822656'),	//Tech Help
		thc.roles.get('278387425850556417'),	//HyperCat Coach
	];
	lastRoll = Math.round(new Date() / 1000);
	lastSmurg = Math.round(new Date() / 1000);
});
//--------------------------END EVENTS----------------------------------------------------------------------------
bot.login(token);