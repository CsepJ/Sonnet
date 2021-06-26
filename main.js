const Discord = require("discord.js");
const bot = new Discord.Client();
const { prefix } = require("./config");
const yts = require("yt-search");
const ytdl = require("discord-ytdl-core");
const play = {};
bot.on("ready",() => console.log("On"));
bot.on("message", async message => {
    if(message.author.bot) return;
    const msg = message.content;
    const userID = message.author.id;
    const channelID = message.channel.id;
    if(msg.startsWith(`${prefix}재생 `)){
        try{
        if(message.member.voice.channel){
        let search = (await yts(msg.slice(prefix.length+3))).videos;
        let stream = ytdl(search[0]["url"], {
            filter: "audioonly",
            opusEncoded: true
        });
        message.member.voice.channel.join()
        .then(connection => {
            let dispatcher = connection.play(stream, {
                type: "opus"
            })
            .on("finish", () => {
                msg.guild.me.voice.channel.leave();
            })
        play[message.channel.id] = {
            music: search[0],
            id: channelID,
            dispatcher: dispatcher
        };
        var musicEmbed = new Discord.MessageEmbed()
        .setColor("F44444")
        .setTitle("노래를 재생합니다")
        .setURL(search[0]["url"])
        .setDescription(search[0]["title"].length>30?search[0].title.substring(0,30):search[0]["title"])
        .addField(
            search[0]["title"], search[0]["timestamp"], true
        );
        message.channel.send(musicEmbed);
});

    }else{
        message.channel.send("먼저 음성채널에 들어가주세요");
    }
}catch(e){
    console.log(e);
}
    }
if(msg == `${prefix}정지`){
    
}
});

bot.login(require("./config").token);