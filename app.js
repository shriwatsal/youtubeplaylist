const express = require('express');
const axios = require('axios');
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const path =require('path');

app.get("/",(req,res)=>
{
  res.sendFile(path.join(__dirname, '/index.html'));
})
app.post("/", async (req, res) => {
    let totalHours = 0;
    let totalMinutes = 0;
    let totalSeconds = 0;

    const youtubeLink = req.body.link;
    // console.log(youtubeLink);
    const playlistIdRegex = /list=([a-zA-Z0-9_-]+)/;
    const matches = youtubeLink.match(playlistIdRegex);

    if (matches && matches.length >= 2) {
        const playlistId = matches[1];
        const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=AIzaSyBTxd5lQkSU9OXSGeSdQlrh-SuWX_FtRyc`;

        try {
            const response = await axios.get(apiUrl);
            const data = response.data;
            console.log(" response data",data);
            // console.log("page info",data.items);
            let numberofvideos=data.pageInfo.totalResults;
            
            for (const item of data.items) {
              
                const videoId = item.snippet.resourceId.videoId;
                const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=AIzaSyBTxd5lQkSU9OXSGeSdQlrh-SuWX_FtRyc`;

                try {
                    const videoResponse = await axios.get(videoDetailsUrl);
                    const videoData = videoResponse.data;
                    const videoDuration = videoData.items[0].contentDetails.duration;
                    console.log(videoDuration);
                    const durationRegex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
                    const durationMatches = videoDuration.match(durationRegex);

                    let hours = parseInt(durationMatches[1]) || 0;
                    let minutes = parseInt(durationMatches[2]) || 0;
                    let seconds = parseInt(durationMatches[3]) || 0;

                    minutes += Math.floor(seconds / 60);
                    seconds %= 60;
                    hours += Math.floor(minutes / 60);
                    minutes %= 60;

                    totalHours += hours;
                    totalMinutes += minutes;
                    totalSeconds += seconds;
                    totalMinutes += Math.floor(totalSeconds / 60);
                    totalSeconds %= 60;
                    totalHours += Math.floor(totalMinutes / 60);
                    totalMinutes %= 60;
                } catch (error) {
                    console.error("Error making API request for Video Details:", error.message);
                }
            }
            
            const totaltime = `${totalHours}h ${totalMinutes}m ${totalSeconds}s`;
            console.log("Accumulated Total Duration:", totaltime);
             
            const totalDurationInSeconds = totalHours * 3600 + totalMinutes * 60 + totalSeconds;
            const totalDurationAt125x = totalDurationInSeconds / 1.25;

// Convert total duration at 1.25x speed to h:m:s format
const hoursAt125x = Math.floor(totalDurationAt125x / 3600);
const minutesAt125x = Math.floor((totalDurationAt125x % 3600) / 60);
const secondsAt125x = Math.floor(totalDurationAt125x % 60);
const at125=`${hoursAt125x}h ${minutesAt125x}m ${secondsAt125x}s`;

const totalDurationAt15x = totalDurationInSeconds / 1.5;
const hoursAt15x = Math.floor(totalDurationAt15x / 3600);
const minutesAt15x = Math.floor((totalDurationAt15x % 3600) / 60);
const secondsAt15x = Math.floor(totalDurationAt15x % 60);
const at15=`${hoursAt15x}h ${minutesAt15x}m ${secondsAt15x}s`;

 const totalDurationAt175x = totalDurationInSeconds / 1.75;
 const hoursAt175x = Math.floor(totalDurationAt175x / 3600);
 const minutesAt175x = Math.floor((totalDurationAt175x % 3600) / 60);
 const secondsAt175x = Math.floor(totalDurationAt175x % 60);
 const at175=`${hoursAt175x}h ${minutesAt175x}m ${secondsAt175x}s`;

 const totalDurationAt2x = totalDurationInSeconds / 2;
const hoursAt2x = Math.floor(totalDurationAt2x / 3600);
const minutesAt2x = Math.floor((totalDurationAt2x % 3600) / 60);
const secondsAt2x = Math.floor(totalDurationAt2x % 60);
const at2=`${hoursAt2x}h ${minutesAt2x}m ${secondsAt2x}s`;
            
            //  at125=`${at125H}h ${at125m}m ${at125s}s`;
            res.send(
              `
    <center>
        <h2><b>No of Videos:</b>${numberofvideos}</h2>
        
        <h2><b>Total length of playlist:</b> ${totaltime}</h2>
        <h2><b>At 1.25X:</b> ${ at125 }</h2>
        <h2><b>At 1.5X:</b> ${ at15 }</h2>
        <h2><b>At 1.75X:</b> ${ at175 }</h2>
        <h2><b>At 2X:</b> ${ at2}</h2>
        
    </center>
`);

        } catch (error) {
            console.error("Error making API request for Playlist Items:", error.message);
            res.status(500).send("Internal Server Error");
        }
    } else {
        console.log("Unable to extract the playlist ID from the link.");
        res.status(400).send("Bad Request");
    }
});

const port = process.env.PORT || 8085;
app.listen(port, () => {
    console.log("listening on port " + port);
});
