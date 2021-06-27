const { Client, MessageEmbed, MessageFlags } = require('discord.js');
const config = require('./config');
const Youtube = require("simple-youtube-api");
const youtube = new Youtube(config.youtube);
const keepAlive = require("./server.js");
const version = config.version;
const prefix = config.prefix;
const fs = require("fs");
const code = require("unescape");
const ytdl = require("ytdl-core");
const users = [];
const bot = new Client({
  presence: {
    status: 'online',
    activity: {
      name: `${prefix}명령어`,
      type: 'LISTENING'
    }
  }
});
//setup functions
function search(value="", index=3){
    return new Promise(resolve => {
        youtube.searchVideos(value, index)
    .then(youtube_results => {
        resolve(youtube_results);
    }).catch((e) => console.log(e));
});
}
function loop(connection, url){
  connection.play(ytdl(url, { filter: "audioonly", quality: 'highestaudio' }))
  .on("finish", () => {
    loop(connection,url);
  });
}
bot.on('ready', () => {
    console.log("Sonnet is running");
});
bot.on("guildCreate", (guild) => {
    const welcomeEmbed = new MessageEmbed()
    .setColor("F44444")
    .setTitle("안녕하세요 소네트입니다")
    .setDescription(`도움말: ${prefix}명령어`);
    guild.systemChannel.send(welcomeEmbed);
});
bot.on('message', async message => {
  try{
  const msg = message.content;
  if(msg == "sonnet" || msg == prefix|| msg == "Sonnet" || msg == "SONNET" || msg == "소넷"){
      const Embed = new MessageEmbed()
      .setColor("#F44444")
      .setTitle(`안녕하세요! ${message.author.username.length >= 7?message.author.username.slice(0,7)+"...":message.author.username}님, Sonnet입니다`)
      .setDescription(`명령어: ${prefix}명령어`)
      .setFooter("Made By SepJ")
      .setAuthor("Sonnet", bot.user.displayAvatarURL(),"https://sepsite.kro.kr");
      message.channel.send(Embed);
  }
	  if (message.content.startsWith(prefix)) {
    let command = message.content.slice(prefix.length).includes(" ")?message.content.slice(prefix.length).replace(/ /g,""):message.content.slice(prefix.length);
    //startsWith cmd
    switch (true){
    case msg.startsWith(`${prefix}재생 `):
      let title = msg.slice(`${prefix}재생 `.length);
      if(message.member.voice.channel){
      if(isNaN(title)){
        //if title is string or etc
        if(users.find(e => e.channel === message.member.voice.channelID)){
        search(title,3)
        .then(results => {
        var new_user = {
          query: title,
          list: results
        }
        let searchEmbed = new MessageEmbed()
        .setTitle(title.length>10?title.substring(0,10)+"...":title+"에 대한 검색결과입니다")
        .setColor("F44444")
        .setFooter("Made By SepJ");
        Object.assign(users.find(e => e.channel === message.member.voice.channelID), new_user);
        for(var i = 0;i < 3;i++){
          searchEmbed.addField("**["+(i+1)+"]**  : " + code(results[i].title), results[i].description.length>30?results[i].description.substring(0,30)+"...":results[i].description, i%2==0?true:false);
        }
        message.channel.send(searchEmbed);
      }).catch((e) => console.log(e));
      }//if exists users
      else{
        message.channel.send("**먼저 소네트참가로 Sonnet가 음성채널을 들어가게 해주세요**");
      }
      }else{
        //if title is number
        if(users.find(e => e.channel === message.member.voice.channelID)){
          var user = users.find(e => e.channel === message.member.voice.channelID);
          let musicResult = user.list[Number(title)-1];
          let url = musicResult.url;
          user.url = url;
          user.dispatcher = user.connection.play(ytdl(url, { filter: "audioonly", quality: 'highestaudio' }))
          .on("finish", () => {
            loop(user.connection, url);
          });
          user.dispatcher.setVolume(0.5);
          let musicEmbed = new MessageEmbed()
          .setColor("F44444")
          .setTitle(musicResult.title)
          .setThumbnail(musicResult.thumbnails.high.url)
          .setURL(musicResult.url)
          .setDescription(musicResult.description.length>30?musicResult.description.substring(0,30)+"...":musicResult.description)
          .setTimestamp(musicResult.publishedAt);
          message.channel.send(musicEmbed)
            .then(async react_msg => {
              await react_msg.react("🎵");
              await react_msg.react("🎧");
              await react_msg.react("🔊");
            });
        }else{
          message.channel.send("**먼저 소네트참가로 Sonnet가 음성채널을 들어가게 해주세요**");
        }
      }
    }else{
      message.channel.send("**먼저 음성채널에 들어가주세요**");
    }
    break;
  }
    switch (command) {
      case "음악":
      case "노래":
      case "명령어":
      case "도움말":
      case "도움":
          const cmdEmbed = new MessageEmbed()
            .addFields({
                name:`>>> **${prefix}참가**`,value: `=> 음성채널 참가`, inline:false
            },{
                name:`>>> **${prefix}퇴장**`, value:"=> 음성채널 퇴장", inline:true
            },{
                name:`>>> **${prefix}재생 (음악)**` , value:"=> 음악 재생", inline:false
            })
            .addFields({
                name : `>>> **${prefix}정지**`, value: "=> 음악 일시정지", inline:true
            },{
                name: `>>> **${prefix}시작**`, value:"=> 음악 일시정지 해제", inline:true
            })
            .setColor("F44444")
            .setTitle("Sonnet의 음악 명령어")
            .setFooter("버전 : "+version)
            .setAuthor(`SepJ#0359`, "https://imgur.com/a/HkDzbOC.jpg");
            message.channel.send(cmdEmbed);
      break;
      case "참가":
      case "들어와":
      case "참여":
        if(message.member.voice.channel){
          if(users.find(e => e.channel === message.member.voice.channelID)){
            var user_index = users.findIndex(e => e.channel === message.member.voice.channelID);
            users.splice(user_index,1);
            var user = {
              channel: message.member.voice.channelID,
              connection: await message.member.voice.channel.join()
            };
            users.push(user);
            user.connection.setSpeaking("SPEAKING");
            message.channel.send(`Sonnet가 음성채널에 참가하였습니다!\n=> 이제 소네트재생 (제목)으로 노래를 찾아보세요!`);
          }else{
          var user = {
            channel: message.member.voice.channelID,
            connection: await message.member.voice.channel.join()
          };
          users.push(user);
          user.connection.setSpeaking("SPEAKING");
          message.channel.send(`Sonnet가 음성채널에 참가하였습니다!\n=> 이제 소네트재생 (제목)으로 노래를 찾아보세요!`);
        }
        }else{
          message.channel.send("**먼저 음성채널에 들어가주세요**");
        }
        break;
      case "시작":
      case "재시작":
      case "계속":
      case "계속시작":
        if(!message.member.voice.channel){
            message.channel.send("**먼저 음성채널에 들어가주세요**");
        }else{
          var user = users.find(e => e.channel === message.member.voice.channelID);
          if(user == null){
            message.channel.send("**먼저 소네트참가로 Sonnet가 음성채널을 들어가게 해주세요**");
          }else{
            if(!user.dispatcher){
              message.channel.send("**아직 재생을 하지 않았습니다**");
            }else{
              if(!user.dispatcher.paused){
                message.channel.send("**노래가 정지되지 않았습니다**");
              }else{
                user.dispatcher.resume();
                message.channel.send("음악재생을 계속 시작합니다\n\n현재 상태 : 재생");
              }
            }
          }
        }
        break;
      case "정지":
      case "중지":
      case "멈춰":
      case "그만":
        if(!message.member.voice.channel){
          message.channel.send("**먼저 음성채널에 들어가주세요**");
      }else{
        var user = users.find(e => e.channel === message.member.voice.channelID);
        if(user == null){
          message.channel.send("**먼저 소네트참가로 Sonnet가 음성채널을 들어가게 해주세요**");
        }else{
          if(!user.dispatcher){
            message.channel.send("**아직 재생을 하지 않았습니다**");
          }else{
            if(user.dispatcher.paused){
              message.channel.send("**노래가 이미 정지되어있습니다**");
            }else{
              user.dispatcher.pause();
              message.channel.send("음악재생이 정지되었습니다\n\n현재 상태 : 정지");
            }
          }
        }
      }
    break;
      case "퇴장":
      case "나가":
      case "나가기":
        if(!message.member.voice.channel){
          message.channel.send("**먼저 음성채널에 들어가주세요**");
        }else{
          var user = users.find(e => e.channel === message.member.voice.channelID);
          if(!user){
            message.channel.send("**먼저 소네트참가로 Sonnet가 음성채널을 들어가게 해주세요**");
          }else{
            var user_index = users.findIndex(e => e.channel === message.member.voice.channelID)
            users.splice(user_index,1);
            message.member.voice.channel.leave();
            message.channel.send("이 음성채널을 나갔습니다\n=> 다음에 또 봐요!")
            .then(react_msg => react_msg.react("🖐"));
          }
        }
      break;
    } //switch
  }
}catch(e){
  console.log(e);
}
});
keepAlive();
bot.login(config.token);