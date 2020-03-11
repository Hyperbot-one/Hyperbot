
/*TODO:
	
	-dnd stuff:
		- add calendar that advances with add downtime
		- !calendar date
		- !calendar setDays
		- !calendar events (add)
		- !inventory (itemType)|(#1)|(#2)|(#3)|(#4) 						  ...generates an inventory for the specified shop with the amount of items of each rarity randomly chosen from the list
	   eg.!inventory accessory|5|3|0-2|0 										 (can indicate a range of possible number of items it chooses)
		   upgrade item display
		
		
	... plus others moon2T
*/

const Discord = require("discord.js");
const config = require("./config.json");
const hidCmds = require("./hiddenCmds");
const fs = require('fs');
const Cleverbot = require("cleverbot-node");
const request = require('request');
const cheerio = require('cheerio');
const Horseman = require('node-horseman');
const {Translate} = require('@google-cloud/translate');

var bot = new Discord.Client();
var token = config.token;
var cbKey = config.cbAPI;
var projectID = config.googleProjectID;
const googleTranslate = new Translate({projectID});

var roll20Cooldown;
var lastKickedRoles;
var cleverbotCounter = 0;
var gdqStart = new Date(2018,0,10,16,00); //year, month(0-11), day, hour, minute
var remindersChannel;
var remindersMsg;
var botOnlyChannel;
var rainbowRoles;
var dndServer;
var kdubs;
var annaColours = {count:0, colours:['#AF838D', '#B2394F', '#AEC97E', '#F2B4A2', '#E87171',  '#F4909F']};
var recColours = {count:0, colours:['#EE82EE', '#DA70D6', '#FF00FF', '#BA55D3', '#9370DB', '#8A2BE2', '#9400D3', '#9932CC', '#8B008B', '#800080', '#4B0082']};
var oneTime = false;
var Quoths = [	'Which program do Jedi use to open PDF files?\n\nAdobe Wan Kenobi.',
				'Which website did Chewbacca get arrested for creating?\n\nWookieleaks.',
'Why did Anakin Skywalker cross the road?\n\nTo get to the Dark Side.',
'Is BB hungry?\n\nNo, BB8.',
'How did Darth Vader know what Luke was getting for Xmas?\n\nHe felt his presents.',
'Why did Kylo Ren chase Rey through the forest?\n\nHe probably just wanted a girlfriend. After all, he’d Ben Solo for so long.',
'How does Wicket get around Endor?\n\nEwoks.',
'What do you call a pirate droid?\n\nArrgghh-2-D2.',
'What do Gungans put things in?\n\nJar Jars.',
'What do you call Chewbacca when he has chocolate stuck in his hair?\n\nChocolate Chip Wookiee.',
'Why does Princess Leia keep her hair tied up in buns?\n\nSo it doesn’t Hang Solow.',
'How do you unlock doors on Kashyyyk?\n\nWith a woo-key.',
'Which Star Wars character works at a restaurant?\n\nDarth Waiter.',
'What’s a baseball player’s least favorite Star Wars movie?\n\nThe Umpire Strikes Back.',
'Why did Anakin change his nickname to Skywalker?\n\nHe couldn’t stand the old one Ani longer.',
'What do you call an invisible droid?\n\nC-through-PO.',
'Which Jedi became a rock star?\n\nBon Jovi-Wan Kenobi.',
'What did Obi Wan tell Luke when he had trouble eating Chinese food?\n\nUse the forks, Luke.',
'Why is Yoda such a good gardener?\n\nBecause he has a green thumb.',
'What did Obi-Wan say at the rodeo?\n\nUse the horse, Luke!',
'What’s the most popular Star Wars movie in Italy?\n\nThe Phantom Venice.',
'How do Ewoks communicate over long distances?\n\nWith Ewokie Talkies.',
'What do you call a bird of prey with a thousand lives?\n\nA millennium falcon!',
'What do you get if you mix a bounty hunter with a tropical fruit?\n\nMango Fett!',
'Why was the droid angry?\n\nPeople kept pushing its buttons.',
'What is Jabba the Hutt’s middle name?\n\n“The.”',
'What kind of car takes you to a jedi?\n\nA toyoda.',
'What do you call 5 Siths piled on top of a lightsaber?\n\nA Sith-Kabob.',
'Why is Luke Skywalker always invited on picnics?\n\nHe always has the forks with him.',
'What do you call an evil procrastinator?\n\nDarth Later.',
'Why is The Force like duct tape?\n\nIt has a light side, a dark side, and it binds the galaxy together.',
'What do you call a Jedi who’s in denial?\n\nObi-Wan Cannot Be.',
'Why is a droid mechanic never lonely?\n\nBecause he’s always making new friends.',
'What would you call Padme if she was a dog?\n\nPetme Imadoggie.',
'Why do doctors make the best Jedi?\n\nBecause a Jedi must have patience.',
'Why can’t you count on Yoda to pick up the tab?\n\nBecause he’s always a little short.',
'Which Star Wars character travels around the world?\n\nGlobi-wan Kenobi.',
'What do you call Harrison Ford when he smokes weed?\n\nHan So-high.',
'What do you call a potato that has turned to the Dark side?\n\nDarth Tater.',
'Where does Jabba the Hutt eat?\n\nPizza Hutt.',
'Where did Luke get his bionic hand?\n\nThe second hand store.',
'When did Anakin’s Jedi masters know he was leaning towards the dark side?\n\nIn the Sith Grade.',
'What is a Jedi’s favorite toy?\n\nA yo-yoda.',
'Where do Sith shop?\n\nThe Maul. Everything is half off.',
'What’s the internal temperature of a Tauntaun?\n\nLukewarm.',
'What do you call a Sith who won’t fight?\n\nA Sithy.',
'How do Tusken’s cheat on their taxes?\n\nThey always single file, to hide their numbers.',
'What do storm troopers eat?\n\nWookie steak, but it’s a little Chewy.',
'Why did movies 4, 5, and 6 come before 1, 2, and 3?\n\nBecause in charge of directing, Yoda was.',
'If you date someone who doesn’t like Star Wars puns…\n\nThen you’re looking for love in Alderaan places.'
];//37 Jaden Smith tweets
			  
							  
//-------------COMMANDS -----------------------------------------------------------------
var commands = new Map([
	["spamList", {process:
		function(bot,msg,spam){
			let spamList = "";
			for(let txt of Object.keys(spam.txt)){
				spamList = spamList + "!" + txt + "\n";
			}
			spamList = spamList + "!acc (custom input)\n";
			spamList = spamList + "!juk (custom input)\n";
			spamList = spamList + "!rec\n";
			spamList = spamList + "!shun\n";
			spamList = spamList + "!smurglord\n";
			spamList = spamList + "!booly\n";
			spamList = spamList + "!mcnugget\n";
			msg.channel.sendMessage("```"+spamList+"```");
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
	["addCheer",{process:
		function(bot,msg,spam,approvedRoles){
			let cheer = msg.content.slice(1).split(" ").slice(1).join(" ").split("|");
			let cheerName = cheer[0];
			let cheerTxt = cheer[1];

			if(approvedRole(approvedRoles, msg.author) != false){
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

			if(approvedRole(approvedRoles, msg.author) != false){
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

			if(approvedRole(approvedRoles, msg.author) != false){
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

			if(approvedRole(approvedRoles, msg.author) != false){
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

			if(approvedRole(approvedRoles, msg.author) != false){
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
					msg.channel.sendMessage("your ***to*** has been successfully quote ***from*** removed list");
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
				var userIndex = searchLeaderboard(msg.author.id,leaderboard);
										
				//returns index of user if found, -1 if not
				if( userIndex == -1){
					userIndex = leaderboard.push({"user":msg.author.id, "twenty":0, "high":0, "med":0, "low":0, "one":0, "shiny20": 0}) - 1;
				}
				let i = randomIntBtw(1,21);
				if(i == 20){
					if(randomIntBtw(0,1000) == randomIntBtw(0,1000)){
						msg.channel.sendMessage("@everyone PagChomp:shake3 " + msg.author.username + " rolled a shiny 20!\nattkStar:flip RickPls:3spin attkStar:flip RickPls:2spin attkStar:flip RickPls:1spin attkStar:flip RickPls:shake2 attkStar:flip RickPls:shake2 attkStar:flip RickPls:pulse attkStar RickPls:shake2 attkStar RickPls:shake3 attkStar    RickPls:spin attkStar RickPls:spin2 attkStar RickPls:spin2 attkStar RickPls:spin3 attkStar \n https://www.youtube.com/watch?v=Gc2u6AFImn8");
						if(leaderboard[userIndex].shiny20 === undefined){leaderboard[userIndex].shiny20 = 1;}
						else {leaderboard[userIndex].shiny20 ++;}
					}else{
						msg.channel.sendMessage(msg.author + " PogChamp you rolled " + i + "! Watch out we have a bad ass over here BadAss https://www.youtube.com/watch?v=6RJgpPyadeM");
					}
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
			if(mod == "s20"){
				var leaderboardSort = leaderboard.slice(0);
				leaderboardSort.sort(function(a,b){return b.shiny20 - a.shiny20;});
				str = "__**ROLL 20 LEADERBOARD: MOST SHINY 20 ROLLS**__\n\n";
				for(user of leaderboardSort){
					if(bot.users.get(user.user) === undefined) continue;
					if(user.shiny20 > 0){
						str = str + "__**" + bot.users.get(user.user).username + "**__:\n	 **shiny 20's: " + user.shiny20 + "**\n\n\u0000";
					}
				}
			}else if(mod == "20"){
				var leaderboardSort = leaderboard.slice(0);
				leaderboardSort.sort(function(a,b){return b.twenty - a.twenty;});
				str = "__**ROLL 20 LEADERBOARD: MOST 20 ROLLS**__\n\n";
				for(user of leaderboardSort){
					if(bot.users.get(user.user) === undefined) continue;
					str = str + "__**" + bot.users.get(user.user).username + "**__:\n	 **20's: " + user.twenty + "** | high rolls: " + user.high + " | medium rolls: " + user.med + " | low rolls: " + user.low + " | ones: " + user.one +"\n\n\u0000";
				}
			}else if(mod == "high"){
				var leaderboardSort = leaderboard.slice(0);
				leaderboardSort.sort(function(a,b){return b.high - a.high;});
				str = "__**ROLL 20 LEADERBOARD: MOST HIGH ROLLS**__\n\n";
				for(user of leaderboardSort){
					if(bot.users.get(user.user) === undefined) continue;
					str = str + "__**" + bot.users.get(user.user).username + "**__:\n	 20's: " + user.twenty + " | **high rolls: " + user.high + "** | medium rolls: " + user.med + " | low rolls: " + user.low + " | ones: " + user.one +"\n\n\u0000";
				}
			}else if(mod == "med"){
				var leaderboardSort = leaderboard.slice(0);
				leaderboardSort.sort(function(a,b){return b.med - a.med;});
				str = "__**ROLL 20 LEADERBOARD: MOST MEDIUM ROLLS**__\n\n";
				for(user of leaderboardSort){
					if(bot.users.get(user.user) === undefined) continue;
					str = str + "__**" + bot.users.get(user.user).username + "**__:\n	 20's: " + user.twenty + " | high rolls: " + user.high + " | **medium rolls: " + user.med + "** | low rolls: " + user.low + " | ones: " + user.one +"\n\n\u0000";
				}
			}else if(mod == "low"){
				var leaderboardSort = leaderboard.slice(0);
				leaderboardSort.sort(function(a,b){return b.low - a.low;});
				str = "__**ROLL 20 LEADERBOARD: MOST LOW ROLLS**__\n\n";
				for(user of leaderboardSort){
					if(bot.users.get(user.user) === undefined) continue;
					str = str + "__**" + bot.users.get(user.user).username + "**__:\n	 20's: " + user.twenty + " | high rolls: " + user.high + " | medium rolls: " + user.med + " | **low rolls: " + user.low + "** | ones: " + user.one +"\n\n\u0000";
				}
			}else if(mod == "1"){
				var leaderboardSort = leaderboard.slice(0);
				leaderboardSort.sort(function(a,b){return b.one - a.one;});
				str = "__**ROLL 20 LEADERBOARD: MOST ONE ROLLS**__\n\n";
				for(user of leaderboardSort){
					if(bot.users.get(user.user) === undefined) continue;
					str = str + "__**" + bot.users.get(user.user).username + "**__:\n	 20's: " + user.twenty + " | high rolls: " + user.high + " | medium rolls: " + user.med + " | low rolls: " + user.low + " | **ones: " + user.one +"**\n\n\u0000";
				}
			}else if(mod == "20%"){
				var leaderboardSort = leaderboard.slice(0);
				leaderboardSort.sort(function(a,b){return (b.twenty / (b.twenty + b.high + b.med + b.low + b.one)*100)-(a.twenty / (a.twenty + a.high + a.med + a.low + a.one)*100);});
				str = "__**ROLL 20 LEADERBOARD: TOP 20 ROLL PERCENTAGES**__\n\n";
				for(user of leaderboardSort){
					if(bot.users.get(user.user) === undefined) continue;
					var total = user.twenty + user.high + user.med + user.low + user.one;
					str = str + "__**" + bot.users.get(user.user).username + "**__:\n	 **20's: " + Math.round((user.twenty/total*100)*100)/100 + "%** | high rolls: " + Math.round((user.high/total*100)*100)/100 + "% | medium rolls: " + Math.round((user.med/total*100)*100)/100 + "% | low rolls: " + Math.round((user.low/total*100)*100)/100 + "% | ones: " + Math.round((user.one/total*100)*100)/100 +"%\n\n\u0000";
				}
			}else if(mod == "high%"){
				var leaderboardSort = leaderboard.slice(0);
				leaderboardSort.sort(function(a,b){return (b.high / (b.twenty + b.high + b.med + b.low + b.one)*100)-(a.high / (a.twenty + a.high + a.med + a.low + a.one)*100);});
				str = "__**ROLL 20 LEADERBOARD: TOP HIGH ROLL PERCENTAGES**__\n\n";
				for(user of leaderboardSort){
					if(bot.users.get(user.user) === undefined) continue;
					var total = user.twenty + user.high + user.med + user.low + user.one;
					str = str + "__**" + bot.users.get(user.user).username + "**__:\n	 20's: " + Math.round((user.twenty/total*100)*100)/100 + "% | **high rolls: " + Math.round((user.high/total*100)*100)/100 + "%** | medium rolls: " + Math.round((user.med/total*100)*100)/100 + "% | low rolls: " + Math.round((user.low/total*100)*100)/100 + "% | ones: " + Math.round((user.one/total*100)*100)/100 +"%\n\n\u0000";
				}
			}else if(mod == "med%"){
				var leaderboardSort = leaderboard.slice(0);
				leaderboardSort.sort(function(a,b){return (b.med / (b.twenty + b.high + b.med + b.low + b.one)*100)-(a.med / (a.twenty + a.high + a.med + a.low + a.one)*100);});
				str = "__**ROLL 20 LEADERBOARD: TOP MEDIUM ROLL PERCENTAGES**__\n\n";
				for(user of leaderboardSort){
					if(bot.users.get(user.user) === undefined) continue;
					var total = user.twenty + user.high + user.med + user.low + user.one;
					str = str + "__**" + bot.users.get(user.user).username + "**__:\n	 20's: " + Math.round((user.twenty/total*100)*100)/100 + "% | high rolls: " + Math.round((user.high/total*100)*100)/100 + "% | **medium rolls: " + Math.round((user.med/total*100)*100)/100 + "%** | low rolls: " + Math.round((user.low/total*100)*100)/100 + "% | ones: " + Math.round((user.one/total*100)*100)/100 +"%\n\n\u0000";
				}
			}else if(mod == "low%"){
				var leaderboardSort = leaderboard.slice(0);
				leaderboardSort.sort(function(a,b){return (b.low / (b.twenty + b.high + b.med + b.low + b.one)*100)-(a.low / (a.twenty + a.high + a.med + a.low + a.one)*100);});
				str = "__**ROLL 20 LEADERBOARD: TOP LOW ROLL PERCENTAGES**__\n\n";
				for(user of leaderboardSort){
					if(bot.users.get(user.user) === undefined) continue;
					var total = user.twenty + user.high + user.med + user.low + user.one;
					str = str + "__**" + bot.users.get(user.user).username + "**__:\n	 20's: " + Math.round((user.twenty/total*100)*100)/100 + "% | high rolls: " + Math.round((user.high/total*100)*100)/100 + "% | medium rolls: " + Math.round((user.med/total*100)*100)/100 + "% | **low rolls: " + Math.round((user.low/total*100)*100)/100 + "%** | ones: " + Math.round((user.one/total*100)*100)/100 +"%\n\n\u0000";
				}
			}else if(mod == "1%"){
				var leaderboardSort = leaderboard.slice(0);
				leaderboardSort.sort(function(a,b){return (b.one / (b.twenty + b.high + b.med + b.low + b.one)*100)-(a.one / (a.twenty + a.high + a.med + a.low + a.one)*100);});
				str = "__**ROLL 20 LEADERBOARD: TOP ONE ROLL PERCENTAGES**__\n\n";
				for(user of leaderboardSort){
					if(bot.users.get(user.user) === undefined) continue;
					var total = user.twenty + user.high + user.med + user.low + user.one;
					str = str + "__**" + bot.users.get(user.user).username + "**__:\n	 20's: " + Math.round((user.twenty/total*100)*100)/100 + "% | high rolls: " + Math.round((user.high/total*100)*100)/100 + "% | medium rolls: " + Math.round((user.med/total*100)*100)/100 + "% | low rolls: " + Math.round((user.low/total*100)*100)/100 + "% | **ones: " + Math.round((user.one/total*100)*100)/100 +"%**\n\n\u0000";
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
	["alert", {process:
		function(bot, msg){
			let userName = msg.content.slice(1).split(" ").slice(1).join(" ");
			let user = bot.users.find('username', userName);
			if(user == null){
				user = msg.guild.members.find('nickname', userName);
				if(user == null){
					msg.reply(userName + " does not exist");
					return;
				} else {
					user = user.user;
				}
			}
			
			msg.channel.send("<@"+user.id+"> <a:Siren:555747621814403073> BIG NERD ALERT <a:Siren:555747621814403073>")
				.then(message => console.log(`Sent message: ${message.content}`))
				.catch(console.error);;
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
	["farming", {process: 
		function(bot,msg){
			let txt = msg.content.slice(1).split(" ").slice(1).join(" ")
			//let colonCount = 0;
			//let emote = '';
			let str = '';
			/*for(c in txt){
				if(txt[c] == ":"){
					colonCount++;
				}else if(colonCount == 1){
					emote = emote + txt[c];
				}else if(colonCount >= 2){
					break;
				}
			}*/
			//if(colonCount == 0)
				emote = txt;
			for(let i = 0; i <= 5; i++){
				str = str + emote + " ";
			}
			str = str + ":tractor: KKona:flip";
			msg.channel.sendMessage(str);
	}}],
	["xd", {process:
		function(bot,msg){
			let emote = msg.content.slice(1).split(" ").slice(1).join(" ");
			let str = emote + "                              " + emote + "        " + emote + " " + emote + " " + emote + " \n     " + emote + "                    " + emote + "             " + emote + "                    " + emote + " \n          " + emote + "          " + emote + "                  " + emote + "                         " + emote + " \n               " + emote + " " + emote + "                      " + emote + "                         " + emote + " \n               " + emote + " " + emote + "                      " + emote + "                         " + emote + " \n          " + emote + "           " + emote + "                 " + emote + "                         " + emote + " \n     " + emote + "                     " + emote + "            " + emote + "                    " + emote + " \n" + emote + "                               " + emote + "       " + emote + " " + emote + " " + emote;
			msg.channel.sendMessage(str);
	}}],
	["r34", {process:
		function(bot,msg){
			if(msg.channel.id == "279096351139168258"){
				let search = msg.content.slice(1).split(" ").slice(1).join(" ");
				search = search.replace(" ","_");
				request(`http://rule34.paheal.net/post/list/${search}/1`, (err, res, data) => {
					if(!err && res.statusCode === 200){
						var $ = cheerio.load(data);
						var imgs = [];
						$('#imagelist img').each(function(i, element){imgs.push(this);});
						console.log(search);
						console.log(imgs.length);
						
						if(imgs.length == 0){
							msg.channel.sendMessage("no results found.");
							return;
						}
						randomImgRule34(imgs,msg,search);
					}else{
						if(typeof res != 'undefined') console.log(res.statusCode);
						else console.log("status code undefined");
						msg.channel.sendMessage("no results found.");
					}
				});
			}else{msg.channel.sendMessage("wrong channel moon2T");}
	}}],
	["nsfw", {process:
		function(bot,msg){
			if(msg.channel.id == "279096351139168258" || msg.channel.id == "280543345720295424"){
				let search = "";
				let mod = "";
				if(msg.content.slice(1).split(" ").slice(1)[0] == "gay"){
					search = msg.content.slice(1).split(" ").slice(3).join(" ");
					search = "gay+" + search;
				}else{
					search = msg.content.slice(1).split(" ").slice(2).join(" ");
				}
				
				let type = msg.content.slice(1).split(" ").slice(1)[0];
				search = search.replace(" ","_");
				
				if(type == "gif"){
					type = 'gifs';
				}else if(type == "pic"){
					type = 'pics';
				}else{
					msg.channel.sendMessage("please enter a valid type, currently only gifs and pics work, videos coming soon. `!nsfw (gif/pic) (search terms)` with out the parenthesis");
					return;
				}
				request(`http://www.sex.com/search/${type}?query=${search}`, (err, res, data) => {
					if(!err /*&& res.statusCode === 200*/){
						var $ = cheerio.load(data);
						var imgURLs = [];
						$('.image_wrapper').each(function(i, element){imgURLs.push("http://www" + mod + ".sex.com" + this.attribs.href);});
						console.log(search);
						console.log(imgURLs.length);
																		
						if(imgURLs.length == 0){
							msg.channel.sendMessage("no results found.");
							return;
						}
						randomImgNsfw(imgURLs,msg,search);	
					}else{
						if(typeof res != 'undefined') console.log(res.statusCode);
						else console.log("status code undefined");
						msg.channel.sendMessage("no results found.");
					}
				});
			}else{msg.channel.sendMessage("wrong channel moon2T");}
	}}],
	["remindMe", {process:
		function(bot,msg){
			var reminders = getJSON('./reminders.json');
			var message = msg.content.slice(1).split(" ").slice(1).join(" ").split("|")[1];
			var times = msg.content.slice(1).split(" ").slice(1).join(" ").split("|")[0].split(" ").filter(Boolean);
			var remindTime = 0;//in seconds
			var startTime = Math.round(new Date() / 1000);
			
			for(var i = 0; i < times.length; i++){
				let timeArray = times[i].split(/(\d+)/).filter(Boolean);
				console.log(timeArray);
				let time = isNaN(timeArray[0]) ? 0 : timeArray[0];
				let unit = timeArray[1] === undefined ? 'a' : timeArray[1];
				console.log("time: " + time + ", unit: "+unit);
				remindTime += (time * unit2Mills(unit));
			}	
			
			reminders.push({"user":msg.author.id, "start":startTime, "end":remindTime, "msg":message, "channel":msg.channel.id});
			var json = JSON.stringify(reminders);
			fs.writeFileSync('./reminders.json', json);
			if(checkReminderAdded(msg,startTime)){
				if(remindTime != 0){
					msg.reply("reminder set for" + secondsToReasonableTime(remindTime));
				}
			}else{
				msg.reply("your reminder was not added, please try again using the command `!remindme (time)|(msg)` for example `!remindme 5minutes|Tell KDubs he's so talented FeelsWowMan`");
			}
	}}],
	["reminders", {process:
		function(bot,msg){
			var reminders = getJSON('./reminders.json');
			var txt = "";
			for(var i in reminders){
				var user = bot.users.get(reminders[i].user).username;
				var start = reminders[i].start;
				var startDate = new Date();
				startDate.setMilliseconds(start);
				var timeLeft = secondsToReasonableTime(reminders[i].end - (Math.round(new Date() / 1000) - start));
				txt = txt + "**" + user + "** set reminder \"" + reminders[i].msg + "\" with" + timeLeft + " left\n"; 
			
			}
			remindersChannel = msg.channel;
			botOnlyChannel.send(txt);
	}}],
	["OWLCountdown", {process:
		function(bot,msg){
			var horseman = new Horseman();
			horseman
				.open('https://overwatchleague.com/en-us/schedule')
				.text('.Countdown.LiveMatch-countdown')
				.then(function(text){
					console.log("owlcountdown: " + text );
					msg.channel.sendMessage("The next Overwatch League game is in " + text);
				})
				.finally(function(){
					return horseman.close();
				});

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
					commandList = commandList + "!" + key + " (cheerName)|(cheer)\n";
				} else if(key == "removeCheer"){
					commandList = commandList + "!" + key + " (cheerName)\n";
				} else if(key == "addCommand"){
					commandList = commandList + "!" + key + " (commandName)|(content)\n";
				} else if(key == "removeCommand"){
					commandList = commandList + "!" + key + " (commandName)\n";
				} else if(key == "addQuote"){
					commandList = commandList + "!" + key + " (author date)|(quote)\n";
				} else if(key == "removeQuote"){
					commandList = commandList + "!" + key + " (quote text/link)\n";
				} else if(key == "leaderboard"){
					commandList = commandList + "!" + key + " (20/high/med/low/1)\n";
					commandList = commandList + "!" + key + " (20%/high%/med%/low%/1%)\n";
				} else if(key == "farming"){
					commandList = commandList + "!" + key + " (twitch/bd emote)\n";
				} else if(key == "remindMe"){
					commandList = commandList + "!" + key + " (time)|(message)\n";
				} else if(key == "quoth" || key == "serverlist" || key == "acc" || key == "giveaway" || key == "IWantToPlayDnD" || key == "DnDDraw" || key == "juk" || key == "rec" || key == "shun" || key == "smurglord" || key == "booly" || key == "mcnugget"){
					continue;
				} else{
					commandList = commandList + "!" + key + "\n";
				}
			}
			
			msg.channel.sendMessage("```"+commandList+"```");
	}}],
	["kao",{process: 
		function(bot,msg,adminRoles){
			if(approvedRole(adminRoles,msg.author) != false){
				// let misc = getJSON('./misc.json');
				 let user = msg.content.slice(1).split(" ").slice(1).join(" ");
				 let bannedMember = msg.guild.members.find('displayName', user);
				if(!bannedMember){
					do{
						bannedMember = msg.guild.members.random();
					}while(approvedRole(adminRoles,bannedMember.user) != false);
				}
				//let bannedUser = bannedMember.user;
				
				// misc.lastKickedId = bannedMember.id;
				// lastKickedRoles = bannedMember.roles;
				// console.log("before promise rejection?");
				
				msg.channel.sendMessage(bannedMember + "YOU CALL ME A PUSC? I FUK U UP! _BAN_ FeelsReinMan moon2BANNED");
				setTimeout(() => { msg.channel.sendMessage("Jebaited")}, 3000);
				// msg.guild.defaultChannel.createInvite({maxAge:3600, maxUses:1}).then(invite => {
					// console.log("invite created")
					// let inviteLink = "http://discord.gg/" + invite.code;
					// bannedUser.send("YOU CALL ME A PUSC? I FUK U UP! _BAN_ FeelsReinMan moon2BANNED");
					// bannedUser.send("Im sorry, I love you please come back " + inviteLink);
					// setTimeout(() => { bannedMember.kick()}, 2000);
				// });
				
				
				// fs.writeFileSync('./misc.json', JSON.stringify(misc));
				
			}else{
				msg.channel.sendMessage("Sorry you dont have permision to use this command");
			}			

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
	["rec",{process:
		function(bot,msg){
			let misc = getJSON('./misc.json');
			let current = Math.round(new Date() / 1000);
			msg.channel.sendMessage("It's been " + secondsToReasonableTime(current - misc.recTimer) + " since Rec last fucked up an emote YouTried");
			misc.recTimer = current;
			fs.writeFileSync('./misc.json', JSON.stringify(misc));
	}}],
	["shun",{process:
		function(bot,msg){
			let misc = getJSON('./misc.json');
			let current = Math.round(new Date() / 1000);
			msg.channel.sendMessage("Call a Bondulance! It's been " + secondsToReasonableTime(current - misc.shunTimer) + " since Shun last stroked out on his keyboard BrokeBack");
			misc.shunTimer = current;
			fs.writeFileSync('./misc.json', JSON.stringify(misc));
	}}],
	["ze",{process:
		function(bot,msg){
			msg.channel.sendMessage("Cunt")
			.then(message => message.react(dndServer.emojis.get('460290371650584576')))
			.catch(console.error);
	}}],
	["cunt",{process:
		function(bot,msg){
			msg.channel.sendMessage("Ze")
			.catch(console.error);
	}}],
	["LULFratDied",{process:
		function(bot,msg){
			let misc = getJSON('./misc.json');
			let ded = misc.fratlyDed
			ded ++;
			msg.channel.sendMessage("Fratly died AGAIN, thats " + ded + " times now EleGiggle");
			misc.fratlyDed = ded;
			fs.writeFileSync('./misc.json', JSON.stringify(misc));
	}}],
	["FratlyCounter",{process:
		function(bot,msg){
			let misc = getJSON('./misc.json');
			msg.channel.sendMessage("Fratly has died " + misc.fratlyDed + " times now EleGiggle");
	}}],
	["smurglord", {process:
		function(bot, msg){
			var cooldown = Math.round(new Date() / 1000) - lastSmurg;
			if(cooldown >= 10){
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
	["booly",{process:
		function(bot,msg){
			let i = randomIntBtw(1,101);
			if(i < 85){
				msg.channel.sendMessage(":alarm_clock: ðŸ‡® ðŸ‡¹ ðŸ‡¸ \n:alarm_clock: ðŸ‡§ ðŸ‡´ ðŸ‡´ ðŸ‡± ðŸ‡¾ \n:alarm_clock: ðŸ‡¹ ðŸ‡® ðŸ‡² ðŸ‡ª");
			}else if(i >= 85 && i < 95){
				msg.channel.sendMessage(":alarm_clock: :regional_indicator_i: :regional_indicator_t: :regional_indicator_s: \n"
									  + ":alarm_clock: :regional_indicator_b: :regional_indicator_o: :regional_indicator_o: :regional_indicator_l: :regional_indicator_y: \n"
									  + ":alarm_clock: :regional_indicator_t: :regional_indicator_i: :regional_indicator_m: :regional_indicator_e: \n"
									  + ":alarm_clock: :regional_indicator_m: :regional_indicator_o: :regional_indicator_t: :regional_indicator_h: :regional_indicator_e: :regional_indicator_r: :regional_indicator_f: :regional_indicator_u: :regional_indicator_c: :regional_indicator_k: :regional_indicator_e: :regional_indicator_r:");
			}else if(i >= 95){
				msg.channel.sendMessage("https://cdn.discordapp.com/attachments/281255280329752577/291779503364243457/lV_rfhV8rAM.png");
			}
	}}],
	["mcnugget", {process:
		function(bot,msg){
			msg.channel.sendMessage("Not so fast Morty :runner::skin-tone-1: you heard your mom :person_with_pouting_face::skin-tone-2: weâ€™ve got adventures :fire: to go on Morty :scream::weary::ok_hand: Just you :facepalm::skin-tone-1:â€â™‚ï¸:gun: and me :man:â€:microscope::gun: and sometimes your sister :information_desk_person::iphone: and sometimes your mom :woman::skin-tone-2:â€âš•ï¸:racehorse: but :bangbang:ï¸ NEVER :raised_hand: your :triumph: dad! :shrug::skin-tone-1:â€â™‚ï¸:x::mask: You wanna :see_no_evil: know why Morty? :speak_no_evil::100: Because he CROSSED me :rage::no_good:â€â™‚ï¸ Oh :dizzy_face: it gets darker Morty :sunglasses::new_moon_with_face: Welcome :alien: to the :sob: darkest :smiling_imp: year of our :man:â€:boy:adventures :pray::tired_face: First 1ï¸âƒ£ thing thatâ€™s :woman:â€:microphone: different :interrobang:ï¸ No more dad Morty :cool: He threatened :eyes::thumbsdown: to turn me in :raising_hand:â€â™‚ï¸:cop: to the government :sweat::rolling_eyes: so I made him :drooling_face::rat: and the government :poop: go away");
			msg.channel.sendMessage("I repla:confounded:ced them both :last_quarter_moon_with_face::first_quarter_moon_with_face:as the :smiling_imp: defacto :clown: patriarch :older_man::skin-tone-1: of your family :man:â€:girl:â€:boy:and :astonished: your universe :scream::milky_way::raised_hands: Your mom :racehorse: wouldnâ€™t have :wave: accepted :handshake: me :rolling_eyes: if I came home :house_with_garden: without you :boy::skin-tone-1: and your sister :person_with_blond_hair:â€â™€ï¸ so now you know :mortar_board: the real :100: reason :star2: I rescued :helmet_with_cross: you :thumbsup: I JUST :nail_care::skin-tone-2: TOOK OVER :top::dizzy_face: THE FAMILY :man:â€:girl:â€:boy: MORTY :person_frowning::skin-tone-1:â€â™‚ï¸ And :eyes: if you tell :speaking_head: your mom or sister :woman::skin-tone-2:â€âš•ï¸:information_desk_person: I said any of this :speak_no_evil: Iâ€™ll deny it :no_good:â€â™‚ï¸:triumph: And :smirk: theyâ€™ll take my side :two_hearts::relieved::couple: because Iâ€™m a :man_dancing: hero :medal::trophy: Morty :joy::rofl: And now :punch: youâ€™re gonna have to do :juggler::skin-tone-1:â€â™‚ï¸:monkey: whatever I say :stuck_out_tongue_closed_eyes: Morty :disappointed_relieved: Forever :clock1::clock5::clock930::clock10::skull: And Iâ€™ll go out :walking::skin-tone-2: and find :telescope: some more :scream_cat: of that :tongue: Mulan :martial_arts_uniform::dolls: Szechuan :dragon::izakaya_lantern:Teriyaki :tired_face::sweat_drops: dipping sauce :fire::ok_hand::pray: Morty :sweat_drops::sweat_drops::sweat_drops::raised_hands:");
			msg.channel.sendMessage("Because thatâ€™s :point_right: what this :tada: is all about Morty :poultry_leg: Thatâ€™s my :one:  one :point_up:ï¸ arm :selfie: man :man_dancing: Iâ€™m not :x: driven :oncoming_automobile: by avenging :fist::skin-tone-1: my dead :skull: family :sob::family_mwg: Morty :droplet: That :rofl: was :hear_no_evil: FAKE :sparkles: Iâ€™m :man:â€:microscope: driven :dash: by finding :eyes: that :weary: McNugget :metal: :fries: Sauce :sweat_drops: I want :scream: that :flushed: Mulan :dragon::martial_arts_uniform: McNugget :clown: Sauce :eggplant::sweat_drops:Morty :sob: Thatâ€™s :muscle::skin-tone-2: my series :clapper: arc :rainbow: Morty :crown: If it takes :heart:ï¸ 9 :heart:ï¸ seasons :heart:ï¸ I WANT :tired_face: MY :clap: MCNUGGET :poultry_leg::fries: DIPPING SAUCE :sweat_drops:SZECHUAN :fire: SAUCE MORTY :rage::dizzy_face: ITâ€™S :drooling_face: GONNA :cartwheel:â€â™€ï¸TAKE :rocket: US :ok_woman::skin-tone-1:â€â™‚ï¸:older_man::skin-tone-1: ALL THE WAY :dizzy: TO :point_right: THE :point_right: END MORTY :checkered_flag: :nine: MORE :moneybag: SEASONS :robot: MORTY :gem: :nine:MORE SEASONS :raised_hands: UNTIL I GET :gift: THAT :heart_eyes: DIPPING :bangbang:ï¸:fire: SZECHUAN :dolls: SAUCE :eggplant::sweat_drops::weary: FOR :nine::seven: MORE YEARS :hourglass:ï¸:clock: MORTY :skull: I :clap: WANT :clap: THAT :clap: MCNUGGET :clap: SAUCE :clap: MORTY");
	}}],
	["2D",{process:
		function(bot,msg){
			let i = randomIntBtw(1,101);
			if(i < 85){
				msg.channel.sendMessage("<a:ArousedBy2Dabs:394032814347124739> THIS <a:ArousedBy2Dabs:394032814347124739> MAN <a:ArousedBy2Dabs:394032814347124739> AROUSED <a:ArousedBy2Dabs:394032814347124739> BY <a:ArousedBy2Dabs:394032814347124739> 2D <a:ArousedBy2Dabs:394032814347124739> WENT <a:ArousedBy2Dabs:394032814347124739> TO <a:ArousedBy2Dabs:394032814347124739> SGDQ <a:ArousedBy2Dabs:394032814347124739> WITH <a:ArousedBy2Dabs:394032814347124739> A <a:ArousedBy2Dabs:394032814347124739> moon2SMUG <a:ArousedBy2Dabs:394032814347124739> SHIRT <a:ArousedBy2Dabs:394032814347124739> AND <a:ArousedBy2Dabs:394032814347124739> DABBED <a:ArousedBy2Dabs:394032814347124739> ON <a:ArousedBy2Dabs:394032814347124739> CAMERA <a:ArousedBy2Dabs:394032814347124739>");
			}else if(i >= 85){
				msg.channel.sendMessage("https://cdn.discordapp.com/attachments/292764371812089856/332663385277726721/dontbelieve2d.png");
			}
	}}],
	["serverlist",{process:
		function(bot,msg){
			if(msg.author != bot.users.get("164837968668917760")){
				msg.channel.sendMessage("sorry you do not have permission to use this command");
				return;
			}
			let serverId = msg.content.slice(1).split(" ").slice(1).join(" ");
			var guilds = bot.guilds;
			console.log("Hyperbot is currently in " + guilds.size + " servers");
			for(let [key, value] of guilds){
				console.log(value.name + ": " + value.id);
				let guildMembers = value.members;
				for(let [key, value] of guildMembers){
					console.log(value.user.username);
				}
				console.log("~~~~~~~");
			}			
	}}],
	["editRole",{process:
		function(bot,msg,approvedRoles){
			if(approvedRole(adminRoles,msg.author) != false){
				let mod = msg.content.slice(1).split(" ").slice(1).join(" ").split("|");
				let role = mod[0];
				let property = mod[1];
				let change = mod[2];
								
				role = msg.guild.roles.find("name",role)
				if(role == null){
					msg.channel.sendMessage(mod[0] + " is not a valid role");
					return;
				}
				
				switch(property) {
					case 'name':
					case 'Name':
						role.setName(change)
						 .then(r => {console.log(`Edited name of role ${r}`); msg.channel.sendMessage(`Edited name of role ${r}`);})
						.catch(
							(reason) => {
							console.log('Handle rejected promise ('+reason+') here.');
							msg.channel.sendMessage("error, ask kdubs why");
							});
						break;
					case 'color':
					case 'colour':
					case 'Color':
					case 'Colour':
						role.setColor(change)
						.then(r => {console.log(`Set colour of role ${r}`); msg.channel.sendMessage(`Edited colour of role ${r}`);})
						.catch(
							(reason) => {
							console.log('Handle rejected promise ('+reason+') here.');
							if(reason == 'Error: Forbidden'){
								msg.channel.sendMessage("error, I cannot edit that role");
							}else{
								msg.channel.sendMessage("error, try entering another colour in hexcode");
							}
							});
						break;
					default:
						msg.channel.sendMessage("try changing the role name or colour eg. `!editRole currentRoleName|name|newRoleName` or `!editRole currentRoleName|colour|#ff0000`");
				}
			}else if(approvedRole(personalRoles,msg.author) != false){
				let role = approvedRole(personalRoles,msg.author);
				let mod = msg.content.slice(1).split(" ").slice(1).join(" ").split("|");
				let property = mod[0];
				let change = mod[1];
				if(mod.length != 2){
					msg.channel.sendMessage("try changing the role name or colour eg. `!editRole name|newRoleName` or `!editRole colour|#ff0000`");
					return;
				}

				switch(property) {
					case 'name':
					case 'Name':
						role.setName(change)
						 .then(r => {console.log(`Edited name of role ${r}`); msg.channel.sendMessage(`Edited name of role ${r}`);})
						.catch(
							(reason) => {
							console.log('Handle rejected promise ('+reason+') here.');
							msg.channel.sendMessage("error, ask kdubs why");
							});
						break;
					case 'color':
					case 'colour':
					case 'Color':
					case 'Colour':
						role.setColor(change)
						.then(r => {console.log(`Set colour of role ${r}`); msg.channel.sendMessage(`Edited colour of role ${r}`);})
						.catch(
							(reason) => {
							console.log('Handle rejected promise ('+reason+') here.');
							if(reason == 'Error: Forbidden'){
								msg.channel.sendMessage("error, I cannot edit that role");
							}else{
								msg.channel.sendMessage("error, try entering another colour in hexcode");
							}
							});
						break;
					default:
						msg.channel.sendMessage("try changing the role name or colour eg. `!editRole name|newRoleName` or `!editRole colour|#ff0000`");
				}

			}
			else{
				msg.channel.sendMessage("Sorry you don't have permission to use this command");
			}	
	}}],
	["getRoles",{process:
		function(bot,msg){
			var guilds = bot.guilds;
			for(let [key, value] of guilds){
				console.log(value.name + ": " + value.id);
				let roles = value.roles;
				for(let [key, value] of roles){
					console.log("  " + value.name + ": " + value.id);
				}
				console.log("~~~~~~~");
			}
	
	}}],
	["quoth",{process:
		function(bot,msg){
			let quote = Quoths[randomIntBtw(0,49)];
			msg.channel.sendMessage(quote);
	}}],
	["CtoF",{process:
		function(bot,msg){
			let Ctemp = parseInt(msg.content.slice(1).split(" ").slice(1).join(" "));
			let Ftemp = (Ctemp * 1.8) + 32;
			msg.channel.sendMessage(Ftemp + "F");
	}}],
	["FtoC",{process:
		function(bot,msg){
			let Ftemp = parseInt(msg.content.slice(1).split(" ").slice(1).join(" "));
			let Ctemp = (Ftemp - 32)/1.8;
			msg.channel.sendMessage(Ctemp + "C");
	}}],
	["Translate",{process:
		function(bot,msg){
			let mods = msg.content.slice(1).split(" ").slice(1).join(" ").split("|");
			if(mods.length == 3){
				let sourceLang = mods[0].toLowerCase();;
				let targetLang = mods[1].toLowerCase();;
				let translateTxt = mods[2];
				if(config.googleLangs[sourceLang]){
					if(config.googleLangs[targetLang]){
						if(translateTxt === ""){
							msg.channel.sendMessage("please enter a sentence to translate");
						}else{
							sourceLang = config.googleLangs[sourceLang];
							targetLang = config.googleLangs[targetLang];
							console.log(sourceLang + " | " + targetLang + " | " + translateTxt);
							console.log(mods.length);
							googleTranslate.translate(translateTxt, sourceLang, targetLang, function(err, translation) {
								console.log(translation);
								msg.channel.sendMessage(translation.getTranslatedText());
							});
						}
					}else{
						console.log(targetLang + " not found");
						msg.channel.sendMessage(targetLang + " not found");
					}
				}else{
					console.log(sourceLang + " not found");
					msg.channel.sendMessage(sourceLang + " not found");
				}
				//googleTranslate.translate(translateTxt, sourceLang, targetLang, function(err, translation) {
				//	console.log(translation.translatedText);
					// =>  { translatedText: 'Hallo', originalText: 'Hello', detectedSourceLanguage: 'en' }
				//});
			}else if(mods.length == 2){
				let targetLang = mods[0].toLowerCase();
				let translateTxt = mods[1];
				if(config.googleLangs[targetLang]){
					if(translateTxt === ""){
						msg.channel.sendMessage("please enter a sentence to translate");
					}else{
						targetLang = config.googleLangs[targetLang];
						console.log(targetLang + "|" + translateTxt);
						console.log(mods.length);
						let translation = googleTranslate.translate(translateTxt, targetLang);
						//translations = Array.isArray(translations) ? translations : [translations];
						console.log(translation);
						//translations.forEach((translation, i) => {
						//	console.log(`${translateTxt[i]} => (${targetLang}) ${translation}`);
						// });
						//msg.channel.sendMessage(translation + "\n (source language: " + getKeyByValue(config.googleLangs, translation.detectedSourceLanguage) + ")");
					}
				}else{
					console.log(targetLang + " not found");
					msg.channel.sendMessage(targetLang + " not found");
				}
			}else{
				msg.channel.sendMessage("not enough inputs, please enter a language to translate to, a language to translate from (optional), and a sentence to translate ex. `!Translate English|traduce esto.` or `!Translate Spanish|English|traduce esto.`");
				return;
			}

	}}],
	["hexColour",{process:
		function(bot,msg){
			let name = msg.content.slice(1).split(" ").slice(1).join(" ");
			let user = msg.guild.members.find('displayName', name);
			//console.log(user);
			msg.channel.sendMessage(user.displayHexColor);
	}}],
	
	//**********************************************************************
	// DnD commands for Avandra's Rest campaign
	//**********************************************************************
	["myMagicItem",{process:
		function(bot,msg){
			if(!approvedRole(dndApprovedRoles, msg.author)){
				let players = getJSON('./dnd.json').playerArray;
				
				for(let p in players){
					let player = players[p];
					if(player.user == msg.author.id){
						msg.channel.sendMessage(player.item);
					}
				}
			}else{
				let dnd = getJSON('./dnd.json');
				let players = dnd.playerArray;
				let character = msg.content.slice(1).split(" ").slice(1).join(" ");
				
				for(let p in players){
					let player = players[p];
					if(player.character.toLowerCase() == character.toLowerCase()){
						msg.channel.sendMessage(player.item);
						return;
					}
				}
				msg.channel.sendMessage("Character name not recognized try again");
				
			}
	}}],
	["findMagicItem",{process:
		function(bot,msg){
			if(!approvedRole(dndApprovedRoles, msg.author)){
				msg.channel.sendMessage("sorry you dont have permission to use this command");
				return;
			}
			let dnd = getJSON('./dnd.json');
			let players = dnd.playerArray;
			let character = msg.content.slice(1).split(" ").slice(1).join(" ");
			
			for(let p in players){
				let player = players[p];
				if(player.character == character){
					msg.channel.sendMessage(player.item);
					return;
				}
			}
			msg.channel.sendMessage("Character name not recognized try again");
	}}],
	["addMagicItem",{process:
		function(bot,msg){
			if(!approvedRole(dndApprovedRoles, msg.author)){
				msg.channel.sendMessage("sorry you dont have permission to use this command");
				return;
			}
			let dnd = getJSON('./dnd.json');
			let players = dnd.playerArray;
			let input = msg.content.slice(1).split(" ").slice(1).join(" ").split("|");
			let character = input[0];
			let item = input[1];
			
			for(let p in players){
				if(players[p].character.toLowerCase() == character.toLowerCase()){
					players[p].item = item;
					if(players[p].item != ""){
						msg.channel.sendMessage(players[p].character + "'s magic item has been added");
						fs.writeFileSync('./dnd.json', JSON.stringify(dnd));
					}else{
						msg.channel.sendMessage("item not added, please try again with a correct input eg.`!addMagicItem Gorthrak|\"Gorthrak's super cool epic shield of blast your fucking face off\"`");
					}
					return;
				}
			}
			msg.channel.sendMessage("Character name not recognized try again with a correct input eg.`!addMagicItem Gorthrak|\"Gorthrak's super cool epic shield of blast your fucking face off\"`");
	}}],
	["myDownTime",{process:
		function(bot,msg){
			let players = getJSON('./dnd.json').playerArray;
			for(let p in players){
				let player = players[p];
				if(player.user == msg.author.id){
					if(player.downtime < 7)
						msg.channel.sendMessage(player.character + ", you have " + player.downtime + (player.downtime == 1 ? ' day' : ' days') + " of downtime.");
					else
						msg.channel.sendMessage(player.character + ", you have " + player.downtime + (player.downtime == 1 ? ' day' : ' days') + " of downtime. You can exchange 5 of these for a downtime activity!");
				}
			}
	}}],
	["checkDownTime",{process:
		function(bot,msg){
			if(!approvedRole(dndApprovedRoles, msg.author)){
				msg.channel.sendMessage("sorry you dont have permission to use this command");
				return;
			}
			let players = getJSON('./dnd.json').playerArray;
			let input = msg.content.slice(1).split(" ").slice(1).join(" ").toLowerCase().replace(/\s+/g, '');
			var str = "";

			for(let p in players){
				let player = players[p];
				if((player.character.toLowerCase() == input)||(input == 'list')){
					str = str + player.character + " has " + player.downtime + (player.downtime == 1 ? ' day' : ' days') + " of downtime.\n";
				}
			}
			if(str == "") msg.channel.sendMessage("please enter a valid input eg. `!checkdowntime gorthrak` or `!checkdowntime list`");
			else msg.channel.sendMessage(str);
	}}],
	["addDownTime",{process:
		function(bot,msg){
			if(!approvedRole(dndApprovedRoles, msg.author)){
				msg.channel.sendMessage("sorry you dont have permission to use this command");
				return;
			}
			let dnd = getJSON('./dnd.json');
			let players = dnd.playerArray;
			let input = msg.content.slice(1).split(" ").slice(1).join(" ").split("|");
			
			if(input.length != 2){
				msg.channel.sendMessage("please enter valid input eg. `!addDownTime 2|Gorthrak`");
				return;
			}
			
			let days = parseInt(input[0]);
			let character = input[1].toLowerCase().replace(/\s+/g, '');
				
			if(isNaN(days)){
				msg.channel.sendMessage("please enter a valid number of days eg. `!addDownTime 2|Gorthrak`");
				return;
			}
				
			for(let p in players){
				let player = players[p];
				if(player.character.toLowerCase() == character){
					player.downtime += days;
					msg.channel.sendMessage(player.character + " now has " + player.downtime + (player.downtime == 1 ? ' day' : ' days') + " of downtime.");
					fs.writeFileSync('./dnd.json', JSON.stringify(dnd));
					return
				}
			}
			msg.channel.sendMessage("please enter a valid character name eg. `!addDownTime 2|Gorthrak`");
	}}],
	["removeDownTime",{process:
		function(bot,msg){
			if(!approvedRole(dndApprovedRoles, msg.author)){
				msg.channel.sendMessage("sorry you dont have permission to use this command");
				return;
			}
			let dnd = getJSON('./dnd.json');
			let players = dnd.playerArray;
			let input = msg.content.slice(1).split(" ").slice(1).join(" ").split("|");
			
			if(input.length != 2){
				msg.channel.sendMessage("please enter valid input eg. `!removeDownTime 2|Gorthrak`");
				return;
			}
			
			let days = parseInt(input[0]);
			let character = input[1].toLowerCase().replace(/\s+/g, '');
				
			if(isNaN(days)){
				msg.channel.sendMessage("please enter a valid number of days eg. `!addDownTime 2|Gorthrak`");
				return;
			}
				
			for(let p in players){
				let player = players[p];
				if(player.character.toLowerCase() == character){
					player.downtime -= days;
					msg.channel.sendMessage(player.character + " now has " + player.downtime + (player.downtime == 1 ? ' day' : ' days') + " of downtime.");
					fs.writeFileSync('./dnd.json', JSON.stringify(dnd));
					return
				}
			}
			msg.channel.sendMessage("please enter a valid character name eg. `!addDownTime 2|Gorthrak`");
	}}],
	["sessionTime", {process:
		function(bot,msg){
			console.log("test");
			if(!approvedRole(dndApprovedRoles, msg.author)){
				msg.channel.sendMessage("sorry you dont have permission to use this command");
				return;
			}
			let dnd = getJSON('./dnd.json');
			let players = dnd.playerArray;
			let input = msg.content.slice(1).split(" ").slice(1).join(" ").split("|");
			let days = parseInt(input[0]);
			
			//checks if amount of input is valid
			if(input.length != 2){
				msg.channel.sendMessage("please enter valid input eg. `!sessionTime 2|Gorthrak, Yaya, Neldor`");
				return;
			}
			//checks if input of days is valid
			if(isNaN(days)){
				msg.channel.sendMessage("please enter a valid number of days eg. `!addDownTime 2|Gorthrak`");
				return;
			}
			
			let played = input[1].toLowerCase().replace(/\s+/g, '').split(",");
			var str = ""
			var someoneNotGettingDowntime = false;
			
			
			//checks if all characters provided as argument are valid
			for(let p in played){
				var valid = false;
				for(let p2 in players){
					if(players[p2].character.toLowerCase() == played[p]){
						valid = true;
					}
				}
				if(valid == false){
					msg.channel.sendMessage(played[p] + " is not a valid character, please try again");
					console.log("test");
					return;
				}
			}
			
			for(let p3 in players){
				let player = players[p3];
				let absent = true;
				
				for(let p4 in played){
					if(player.character.toLowerCase() == played[p4]){
						absent = false;
						someoneNotGettingDowntime = true;
					}
				}
				
				if(absent){
					player.downtime += days;
					str += player.character + " now has " + player.downtime + (player.downtime == 1 ? ' day' : ' days') + " of downtime.\n";
				}
			}
			console.log("test2");
			if(!someoneNotGettingDowntime){
				msg.channel.sendMessage("everyone one is recieving downtime, check your input and try again eg. `!sessionTime 2| gorthrak, Yaya, neldor`");
			}else{
				msg.channel.sendMessage(str);
				fs.writeFileSync('./dnd.json', JSON.stringify(dnd));
			}
	}}],
	["dndCommands", {process: 
		function(bot,msg){
			msg.channel.sendMessage("```!mydowntime \n!checkDownTime (list/PC name) \n!addDowntime (#days)|(PC name) \n!removeDownTime (#days)|(PC character) \n !sessionTime (#days)|(pc characters that played seperated by commas) eg. !sessiontime 2|Gorthrak, Yaya, Neldor```");
				
	}}],
	["findItem", {process: 
		function(bot,msg){
			findItem(bot,msg);
	}}],
	["listItems", {process: 
		function(bot,msg){
			let dnd = getJSON('./dnd.json');
			let items = dnd.itemArray;
			let input = msg.content.slice(1).split(" ").slice(1).join(" ").split("|");
			if(input.length != 2){
				msg.channel.sendMessage("please enter a valid search by name, rarity, price, or type eg. ```!listItems name|ring \n!listItems rarity|5\n!listItems price|100 or !listItems price|100-500\n!listItems type|Arcane```");
				return;
			}
			let mod = input[0];
			let search = input[1].toLowerCase().replace(/\s+/g, '');
			let output = "```";
			let found = false;
			
			switch(mod){
				case "name":
					for (let i in items){
						let name = items[i].Item;
						let rarity = items[i].Rarity;
						let price = items[i].Price;
						let type = items[i].Type;
						if(items[i].Item.toLowerCase().replace(/\s+/g, '').indexOf(search) > -1){
							output = output + "Item: " + name + ", Rarity: " + rarity + " Price: " + price + " Type: " + type + "\n";
							found = true;
						}
					}
					if(found == false){
						msg.channel.sendMessage(mod + ": " + search + " not found");
					}
					break;
				case "rarity":
					for (let i in items){
						let name = items[i].Item;
						let rarity = items[i].Rarity;
						let price = items[i].Price;
						let type = items[i].Type;
						if(isNaN(parseInt(search))){
							msg.channel.sendMessage(search + " is not a number");
							return;
						}else{
							if(parseInt(items[i].Rarity) == parseInt(search)){
								output = output + "Item: " + name + ", Rarity: " + rarity + " Price: " + price + " Type: " + type + "\n";
								found = true;
							}
						}
					}
					if(found == false){
						msg.channel.sendMessage(mod + ": " + search + " not found");
					}
					break;	
				case "price":
					//search a range of prices
					if(search.indexOf('-') > -1){
						search = search.split('-');
						let n1 = parseInt(search[0]);
						let n2 = parseInt(search[1]);
						if(isNaN(n1) || isNaN(n2)){
							msg.channel.sendMessage("please enter a valid number range eg. !listItems price|100-500");
						}else{
							if(n1 > n2){
								let buff = n1;
								n1 = n2;
								n2 = buff;
							}
							for(let i in items){
								let name = items[i].Item;
								let rarity = items[i].Rarity;
								let price = items[i].Price;
								let type = items[i].Type;
								if((parseInt(price) >= n1) && (parseInt(price) <= n2)){
									output = output + "Item: " + name + ", Rarity: " + rarity + " Price: " + price + " Type: " + type + "\n";
									found = true;
								}
							}
						}
					//search exact price
					}else{
						if(isNaN(parseInt(search))){
							msg.channel.sendMessage("Please enter a valid price or range to search eg. `!listItems price|100` or `!listItems price|100-500`");
							break;
						}else{
							for (let i in items){
								let name = items[i].Item;
								let rarity = items[i].Rarity;
								let price = items[i].Price;
								let type = items[i].Type;
								if(parseInt(items[i].Price) == parseInt(search)){
									output = output + "Item: " + name + ", Rarity: " + rarity + " Price: " + price + " Type: " + type + "\n";
									found = true;
								}
							}
						}
					}
					if(found == false){
						msg.channel.sendMessage(mod + ": " + search + " not found");
					}
					break;
				case "type":
					for (let i in items){
						let name = items[i].Item;
						let rarity = items[i].Rarity;
						let price = items[i].Price;
						let type = items[i].Type;
						if(items[i].Type.toLowerCase().replace(/\s+/g, '').indexOf(search) > -1){
							output = output + "Item: " + name + ", Rarity: " + rarity + " Price: " + price + " Type: " + type + "\n";
							found = true;
						}
					}
					if(found == false){
						msg.channel.sendMessage(mod + ": " + search + " not found");
					}
					break;
				default:
					msg.channel.sendMessage(mod + " search filter not found, please search for items by name, rarity, price, or type eg. ```!listItems name|ring \n!listItems rarity|5\n!listItems price|100 or !listItems price|100-500\n!listItems type|Arcane```");
			}
			
			if(found){
				output = output + "```";
				msg.channel.sendMessage(output, {split: {prepend: '```', append: '```'}});
			}
		
	}}],
	["addItem", {process: 
		function(bot,msg){
			let dnd = getJSON('./dnd.json');
			let input = msg.content.slice(1).split(" ").slice(1).join(" ").split("|");
			if(input.length != 4){
				msg.channel.sendMessage("please enter a valid item including name|rarity|price|type eg. !addItem Item of Testing|3|100|Accessory");
				return;
			}
			let items = dnd.itemArray;
			let name = input[0];
			let rarity = parseInt(input[1]);
			let price = parseInt(input[2]);
			let type = input[3].replace(/\s+/g, '');
			let validTypes = ["Accessory", "Alchemy", "Arcane", "Armor", "Clothing", "Weapon", "Wondrous"];
			
			if(isNaN(rarity) || rarity < 1 || rarity > 5){
				msg.channel.sendMessage("The rarity entered is not a valid number (1 for common to 5 for legendary) try again eg. !addItem Item of Testing|3|100|Accessory");
				return;
			}
			if(isNaN(price)){
				msg.channel.sendMessage("The price entered is not a valid number, try again eg. !addItem Item of Testing|3|100|Accessory ");
				return;
			}
			let found = false;
			for(let i in validTypes){
				if(type == validTypes[i]){
					found = true;
					break;
				}
			}
			if(!found){
				msg.channel.sendMessage(type + " is not a valid item type, try again using Accessory, Alchemy, Arcane, Clothing, Weapon, or Wondrous");
				return;
			}
			if(findItem(bot,msg,true)){
				msg.channel.sendMessage(name + " is already in the database");
				
			}else{
				let item = {"Item": name,
							"Rarity": rarity,
							"Price": price,
							"Type": type
						   }
				items.push(item);
				fs.writeFileSync('./dnd.json', JSON.stringify(dnd));
				if(findItem(bot,msg)){
					msg.channel.sendMessage(name + " was successfully added to the list.");	
				}else{
					msg.channel.sendMessage(name + " was not added to the list try again.");
				}
			}
	}}],
				
	//to test dndCommands, findItem
	
	
	/*-dnd stuff:
		x !dndCommands
		x !sessionTime (#days)|(list of characters who played seperated by ,) ...adds amount of days to everyone in the dndplayer json aray not listed (Titus only)
		x !addDownTime (#days)|(character) 									  ...adds time to a character or list of characters (Titus only)
		x !removeDownTime (#days)|(character) 								  ...removes time from a character or list of characters (Titus only)
		x !myDownTime 														  ...displays msg.authors amount of downtime
		x !checkdowntime (name)
		x !downtimeList 													  ...displays a list of downtime activities and the cost of gold and time of each
		x !findItem (name)													  ...displays all information for an item
		x !listItems (name/rarity/price/type)|(search term/number/#range)     ...lists all items found from a search
																		         (name: list all items containing a term) (rarity/price: list all items with specific or range of number) (type: list all items of a specific type)
		x !addItem (name)|(rarity)|(price)|(type)							  ...adds a new item to the list (Titus only)
		x !removeItem (name)												  ...removes an item from the list (Titus only)
		O !inventory (itemType)|(#1)|(#2)|(#3)|(#4) 						  ...generates an inventory for the specified shop with the amount of items of each rarity randomly chosen from the list
			eg.!inventory accessory|5|3|0-2|0 										 (can indicate a range of possible number of items it chooses)
		O add images to items
		O !findItem send as embed
		O add calendar that advances with add downtime
		O !calendar date
		O !calendar setDays
		O !calendar events (add)


	
	
	*/	
	
	/* raffle commands
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
	}}]*/
]);
//--------------------------HELPER FUNCTIONS-----------------------------------------------------

function findItem(bot,msg,check=false){
	let input = msg.content.slice(1).split(" ").slice(1).join(" ").split("|");
	let dnd = getJSON('./dnd.json');
	let items = dnd.itemArray;
		
	for(let i in items){
		if(items[i].Item.toLowerCase().replace(/\s+/g, '') == input[0].toLowerCase().replace(/\s+/g, '')){
			//TO DO: send as embed with item image
			let name = items[i].Item;
			let rarity = items[i].Rarity;
			let price = items[i].Price;
			let type = items[i].Type;
			msg.channel.sendMessage("```Item: " + name + "\nRarity: " + rarity + "\nPrice: " + price + "\nType: " + type + "```");
			return true;
		}
	}
	if(!check){
		msg.channel.sendMessage(input[0] + " not found, please try again using the full item name eg. `!finditem wand of web`");
	}
	return false;
}


function secToDate(secs){
	var date = new Date();
	date.setSeconds(secs);
	return date;
}
function secondsToReasonableTime(secs){
	let time = {};
	
	time['days'] = Math.floor(secs / 86400);
	secs -= time['days'] * 86400;
	
	time['hours'] = Math.floor(secs / 3600) % 24;
	secs -= time['hours'] * 3600
	
	time['minutes'] = Math.floor(secs / 60) % 60;
	secs -= time['minutes'] * 60;
	
	time['seconds'] = Math.floor(secs % 60);

	
	let reasonableTime = ""
	if(time['days'] > 0) reasonableTime = reasonableTime + " " + time['days'] + "day(s)";
	if(time['hours'] > 0){
		if(time['minutes'] == 0 && time['seconds'] == 0 && time['days'] > 0) reasonableTime = reasonableTime + " and " + time['hours'] + " hour(s)";
		else reasonableTime = reasonableTime + " " + time['hours'] + " hour(s)";
	}
	if(time['minutes'] > 0){
		if(time['seconds'] == 0 && (time['hours'] > 0 || time['days'] > 0)) reasonableTime = reasonableTime + " and " + time['minutes'] + " minute(s)";
		else reasonableTime = reasonableTime + " " + time['minutes'] + " minute(s)";
	}
	if(time['seconds'] > 0){
		if(time['days'] == 0 && time['hours'] == 0 && time['minutes'] == 0) reasonableTime = reasonableTime + " " + time['seconds'] + " second(s)";
		else reasonableTime = reasonableTime + " and " + time['seconds'] + " second(s)";			
	}
	
	
	return reasonableTime;
}

function unit2Mills(unit){
	switch(unit.toLowerCase()){
		case "y":
		case "year":
		case "years":
			return 31556952;
		case "mo":
		case "month":
		case "months":
			return 2629746;
		case "w":
		case "week":
		case "weeks":
			return 604800;
		case "d":
		case "day":
		case "days":
			return 86400;
		case "h":
		case "hr":
		case "hrs":
		case "hour":
		case "hours":
			return 3600;
		case "m":
		case "min":
		case "mins":
		case "minute":
		case "minutes":
			return 60;
		case "s":
		case "sec":
		case "secs":
		case "second":
		case "seconds":
			return 1;
		default:
			return 0;
	}
}

function checkReminderAdded(msg,startTime){
	var reminders = getJSON('./reminders.json');
	for(var i = 0; i < reminders.length; i++){
		if((reminders[i].user == msg.author.id) && (reminders[i].start == startTime)){
			return true;
		}
	}
	return false;
}

function randomImgRule34(imgs,msg,search){
	var imgLink = "http://rule34.paheal.net" + imgs[randomIntBtw(0,imgs.length)].parent.attribs.href;
	console.log(imgLink);
	request(imgLink,(error,result,html) => {
		if(!error && result.statusCode === 200){
			var $ = cheerio.load(html);
			var tag = $('#main_image').prop("tagName");
			console.log(tag);
			if(tag == "IMG"){
				msg.channel.sendMessage(search + " " + $('#main_image').attr('src'));
				return;
			}else{
				randomImgRule34(imgs,msg,search);
			}
		}else{
			if(typeof result != 'undefined') console.log(result.statusCode + "-2");
			else console.log("status code undefined -2");
		}
	});
}

function randomImgNsfw(imgs,msg,search){
	var imgLink = imgs[randomIntBtw(0,imgs.length)];
	console.log(imgLink);
	request(imgLink,(error,result,html) => {
		if(!error && result.statusCode === 200){
			var $ = cheerio.load(html);
			msg.channel.sendMessage(search + " " + $('.image_frame').find('img').attr('src'));
		}else{
			if(typeof result != 'undefined') console.log(result.statusCode + "-2");
			else console.log("status code undefined -2");
		}
	});
}

//returns the javascript equivalent object from the provided .json file 
function getJSON(path){
	return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function writeSpam(cheersMap, txtMap){
	var spam = getJSON('./spam.json');
	spam.cheers = cheersMap;
	spam.txt = txtMap;
	var json = JSON.stringify(spam);
	fs.writeFileSync('./spam.json', json);	
}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
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

function searchLeaderboard(userid,leaderboard){
	for(let user of leaderboard){
		if(userid == user.user) return leaderboard.indexOf(user);
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

//min inclusive, max exclusive
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

function rawrXD(msg){
	console.log(msg.author.username + " triggered with: " + msg);
	msg.channel.sendMessage(":3");
	setTimeout(() => { msg.channel.sendMessage(":C3")}, 2000);
	//setTimeout(() => { msg.channel.sendMessage("jk TrollFace")}, 4000);
	
	setTimeout(() => { msg.channel.sendMessage(":C==3")}, 6000);
	setTimeout(() => { msg.channel.sendMessage(":C===3")}, 8000);
	setTimeout(() => { msg.channel.sendMessage(":C====3")}, 10000);
	setTimeout(() => { msg.channel.sendMessage(":OC====3")}, 12000);
	setTimeout(() => { msg.channel.sendMessage(":o C====3")}, 14000);
	setTimeout(() => { msg.channel.sendMessage(":D ~~C====3")}, 16000);

}

function approvedRole(approvedRoles, user){
	for(let role of approvedRoles){
		if(role.members.has(user.id)){
			return role;
		}
	}
	return false;
}

function checkReminders(){
	//console.log("check");
	let reminders = getJSON('./reminders.json');
	let current = Math.round(new Date() / 1000);
	
	for(var i in reminders){
		//console.log(current - reminders[i].start);
		if((current - reminders[i].start) >= reminders[i].end){
			if(reminders[i].msg === undefined){
				bot.channels.get(reminders[i].channel).sendMessage("<@" + reminders[i].user + "> here's your reminder, next time you can leave a msg for me to remind you with using `!remindMe (time)|(message)`");
			}else{
				bot.channels.get(reminders[i].channel).sendMessage("<@" + reminders[i].user + "> " + reminders[i].msg);
			}
			delete reminders[i];
			fs.writeFileSync('./reminders.json', JSON.stringify(reminders.filter(Boolean)));
			break;
		}
	}
}

function setRainbowRole(rainbowRole, user){
	if(user.id == "191119825353965568"){
		let x = randomIntBtw(0,annaColours.colours.length);
		setColour(rainbowRole, annaColours.colours[x]);
		
	}else if(user.id == "181850134747938816"){
		let i = randomIntBtw(0,recColours.colours.length);
		setColour(rainbowRole, recColours.colours[i]);
		
	}else{
		setColour(rainbowRole, "random");
	}
}

function setColour(rainbowRole, colour){
	if(colour == "random") colour = getRandomColor();
	rainbowRole.setColor(colour)
		.then()
		.catch(
			(reason) => {
				console.log('Handle rejected promise ('+reason+') here.');
				if(reason == 'Error: Forbidden'){
					msg.channel.sendMessage("error, I cannot edit that role");
				}else{
					msg.channel.sendMessage("error, try entering another colour in hexcode");
				}
		});
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  //console.log(color);
  return color;
}

function bingQuote(){
	let quote = bingQuotes[randomIntBtw(0,36)];
	let now = new Date();
	let minutes = now.getMinutes();
	if(minutes == 0 && oneTime == false){
		bot.channels.get("278704539056734211").sendMessage('<@210470562919743498> ' + quote);
		oneTime = true;
	} else if(minutes != 0 && oneTime == true){
		oneTime = false;
	}
}


//--------------------------EVENTS--------------------------------------------------------------------------------
bot.on("message", msg => {
	//ignore messages that don't start with ! or is from a bot
	if(msg.channel == botOnlyChannel){
		if(msg.author.bot){
			msgString = msg.cleanContent;
			remindersChannel.send(msgString);
		}
		return;
	}
	else if(msg.author.bot){
		return;
	}
	
	//
	if(msg.author.id == kdubs){
		if(msg.channel.type == "dm"){
			bot.channels.get("154419834728218625").sendMessage(msg.content);
			return;
		}
	}
	
	let rainbowRole = approvedRole(rainbowRoles, msg.author);
	if(rainbowRole != false){
			setRainbowRole(rainbowRole, msg.author);
	}
	
	
	if(msg.content.indexOf(":3") > -1){
		if(randomIntBtw(0,1000) == randomIntBtw(0,1000)){
			rawrXD(msg);
		}
	}
	if((msg.content.indexOf("#suck-a-dick") > -1) || (msg.content.indexOf("#suck_a_dick") > -1)){
		msg.reply("I really hope you're not telling me to suck a dick");
		
	}else if(msg.content.toLowerCase().replace(/\s+/g, '').indexOf("cunt") > -1){
		msg.react(dndServer.emojis.get('460290371650584576'));
	}
	
	if((msg.mentions.users.get("128780798399610880")) != null){
		msg.reply("no u");
	}
	
	let prefix = '!';
	if(!msg.content.startsWith(prefix))	return;
	
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
	console.log("\n" + msg.guild.name + " - " + msg.channel.name + " - " + msg.author.username + ": " + command[0]);
	var cmd = command[0].toLowerCase();
	if(command[1]){	var cheer = command[1].toLowerCase();}
	
	//disables certain commands for the DnD server
	if(msg.guild.id == "313766870064824320" && msg.channel.id != "335549937276420109"){
		if((cmd == "quote")||(cmd == "xd")) return;
		if((cmd == "listitems")||(cmd == "finditem")){
			if((msg.channel.id != "337305982377918474")&&(msg.channel.id != "335549937276420109")&&(msg.author.id != "164837968668917760")){
				msg.channel.sendMessage("please use this command in <#335549937276420109>");
				return;
			}
		}
	}
	
	if(msg.guild.id == "154419834728218625"){
		if((cmd == "dragons") || (cmd == "whitedragon") || (cmd == "reddragon") || (cmd == "bluedragon") || (cmd == "greendragon") || (cmd == "blackdragon")){
			console.log("dragons in thc");
			return;
		}
	}
	
	//takes the first word of the message and searches the commands Map, the cheers map, and the txt map, if it is a valid command it will run the coresponding function
	//handles command map commands
	if (cmdKeys.has(cmd)){
		if(cmd == "cheerlist" || cmd == "randomcheer" || cmd == "spamlist"){
			commands.get(cmdKeys.get(cmd)).process(bot,msg,spam);
		}else if(cmd == "addcheer"){
			commands.get(cmdKeys.get(cmd)).process(bot,msg,spam,teamRoles);
		}else if(cmd == "removecheer" || cmd == "removecommand" || cmd == "addcommand"){
			commands.get(cmdKeys.get(cmd)).process(bot,msg,spam,adminRoles);
		}else if(cmd == "removequote" || cmd == "kao" || cmd == "editrole"){
			commands.get(cmdKeys.get(cmd)).process(bot,msg,adminRoles);
		}else if(cmd == "ze"){
			commands.get(cmdKeys.get(cmd)).process(bot,msg);
			msg.channel.sendMessage(spam.txt[txtKeys.get(cmd)]);
		}else{
			commands.get(cmdKeys.get(cmd)).process(bot,msg);
		}
	
	//handles cheer commands	
	}else if(cmd == "cheer" && cheerKeys.has(cheer)){
		msg.channel.sendMessage(spam.cheers[cheerKeys.get(cheer)]);
	
	//handles the simple txt commands	
	}else if(txtKeys.has(cmd)){
		msg.channel.sendMessage(spam.txt[txtKeys.get(cmd)]);
	
	//handles hidden commands
	}else if(hiddenCmds.hasOwnProperty(command)){
		msg.channel.sendMessage(hiddenCmds[command]);
		hidCmds.command(command,msg);
		
	//cleverbot messages	
	}else if(cmd[0] == "!"){
		let misc = getJSON('./misc.json');
		if(misc.cbCounter <= 1000){
			var cleverMessage = msg.content.slice(2);
			if(cleverMessage.toLowerCase().split(" ").join("").includes("butthole")){
				msg.reply("Dude not cool.");
			} else {
				cleverbot.write(cleverMessage, function (response) {
					console.log(msg.author.username + ": " + cleverMessage);
					console.log("cleverbot: " + response.output);
					msg.reply(response.output);
				});
				misc.cbCounter++;
				console.log("cleverbot counter: " + misc.cbCounter);
				fs.writeFileSync('./misc.json', JSON.stringify(misc));
			}
		}else{
				msg.reply("I've exceded 1k messages today, time to nap");
		}
	}
});

bot.on('guildMemberAdd',member =>{
	var thc = bot.guilds.get('154419834728218625');
	var misc = getJSON('./misc.json');
	if(member.id == misc.lastKickedId){
			member.addRoles(lastKickedRoles);
		}
	
    if(member.guild == thc){
		if(member.id == "220438649227968513"){
			member.addRoles(["279836856395235328","330586569801203712"]) //nsfw, hyperkitten
				.then(r => console.log(`added role ${r} to user`))
				.catch((reason) => {
					console.log('Error Adding Role: Handle rejected promise ('+reason+') here.');
				}
			);
		}else{
			bot.channels.get('278395091641565196').sendMessage("@here " + member.user.username + " has joined the server");
		}
	}
});

bot.on("error", (err) => {
  console.error(`An error occurred. The error was: ${err}.`)
});

bot.on('ready', () => {
	cleverbot = new Cleverbot;
	cleverbot.configure({botapi: cbKey});
	
	console.log(`Ready to server in ${bot.channels.size} channels on ${bot.guilds.size} servers, for a total of ${bot.users.size} users.`);
	
	thc = bot.guilds.get('154419834728218625');
	testServer = bot.guilds.get('273241020077047810');
	dndServer = bot.guilds.get('313766870064824320');
	botOnlyChannel = bot.channels.get('309176012061671425');
	
	rainbowRoles = [
		thc.roles.get('332937724233515019'), //velv role - Prinses
		thc.roles.get('334149357337313291'), //sin role - GAY
		thc.roles.get('334156905549266945'), //rec role - Can't Type
		thc.roles.get('334223963322581004'), //woops role - Dead Meme
		thc.roles.get('334227066931380225'), //juk role - Unicorn Barf
		thc.roles.get('334227296246562816'), //amat role - Fucker
		//thc.roles.find("name","Koreaboo")
		//thc.roles.get('334230581833629697'), //anna role - Koreaboo
	];
	
	personalRoles = [
	//thc.roles.get(''),
		thc.roles.get('294710091154718730'), //kdubs role - Best Pepe
		thc.roles.get('417763957684699136'), //shun's role
		thc.roles.get('417775035152072715'), //cheese's role
		thc.roles.get('334227296246562816'), //amat's role
		thc.roles.get('417325479054409728'), //matt's role
		thc.roles.get('334230581833629697'), //anna role - Koreaboo
	];
	
	teamRoles = [
		thc.roles.get('275378439031095316'),	//Hyper SPAM Queen
		thc.roles.get('278394315770822656'),	//hypermods
		thc.roles.get('276488938456219659')	    //HyperKittens
	];
	
	adminRoles = [
		thc.roles.get('275378439031095316'),	//Hyper SPAM Queen
		thc.roles.get('278394315770822656'),	//Hypermods
		dndServer.roles.get('313767162919518209'), //Dungeon Master
	];
	
	testServerRoles = [
		testServer.roles.get('280120872654602241') //admin
	];
	
	dndApprovedRoles = [
		dndServer.roles.get('313767162919518209'), //Dungeon Master
		dndServer.roles.get('337306193036836866')  //Master Botter
	]
	
	kdubs = "164837968668917760";
	lastRoll = Math.round(new Date() / 1000);
	lastSmurg = Math.round(new Date() / 1000);
	
	setInterval(function(){ checkReminders(); /*bingQuote();*/}, 1000);
	//setInterval(function(){ setRainbowRole(thc.roles.find("name","Brighter Ugly Pepe"), thc.members.get("164837968668917760")); }, 1);
	
});

//--------------------------END EVENTS----------------------------------------------------------------------------
bot.login(token);