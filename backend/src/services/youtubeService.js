const axios = require("axios");

async function searchVideos(query = 'electric car OR EV car OR electric vehicle India', maxResults = 10) {
  const url = "https://www.googleapis.com/youtube/v3/search";

  const { data } = await axios.get(url, {
    params: {
      key: process.env.YOUTUBE_API_KEY,
      part: "snippet",
      q: query,
      type: "video",
      maxResults
    }
  });

  return data.items;
}

module.exports = { searchVideos };