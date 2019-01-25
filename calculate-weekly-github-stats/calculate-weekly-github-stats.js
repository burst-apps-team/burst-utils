/**
 * Calculate Weekly Github Stats
 * Tallies up the additions and deletions across a number of repos for a given org.
 * 
 * NOTE: RUN THIS SCRIPT TWICE!!
 * Because Github caches everything, this script should be run once, then wait 30 seconds, and run it again.
 * Read more: https://developer.github.com/v3/repos/statistics/
 * 
 * If you get this error: "Error: Request failed with status code 403" it's because of rate limiting. 
 * Please wait 60 minutes and try again.
 */

const axios = require('axios');

const org = 'burst-apps-team';

const repos = [
    'burstcoin',
    'phoenix',
    'burstpool',
    'burstkit4j',
    'burstcoin-packager',
    'engraver',
    'rosetta',
    'burstcoin-mobile'
]

axios.all(repos.map((repo) => {
    return axios.get(`https://api.github.com/repos/${org}/${repo}/stats/code_frequency`)
})).then(axios.spread((...responses) => {
    let output = responses.map(({data}) => {
      console.log('got a response', data.length);
      return data && data.length && data[data.length-1].length === 3 && data[data.length-1]
    }).reduce((prev, curr) => {
      /** Response format:
       * [
          [
            1302998400, // timestamp
            1124, // additions
            -435 // deletions
          ]
        ]
       */
      return {
        additions: prev.additions + curr[1],
        deletions: prev.deletions + curr[2]
      }
    }, {
      additions: 0,
      deletions: 0
    });
    console.log(output);
}))