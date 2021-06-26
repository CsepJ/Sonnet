const { prefix, youtube, version } = requrie("./config.js");
const Youtube = require("simple-youtube-api");
const yts = new Youtube(youtube);
const music = {};
class Music{
    getMusic(channelID, query){
        let result = {"bool" : false, "result" : null};
        yts.searchVideos(query, 3)
        .then(list => {
            if(!list.length == undefined || !list.length == 0){
            result.bool = true;
            result.result = list;
            }
        });
        music[channelID] = result.result;
        return result;
    }
    
}