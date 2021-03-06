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
    'rosetta',
    'burstcoin-mobile'
];

const lastWeek = process.argv.indexOf('lastWeek') > -1 && 1 || 0;

axios.all(repos.map((repo) => {
    return axios.get(`https://api.github.com/repos/${org}/${repo}/stats/contributors`)
})).then(axios.spread((...responses) => {
    let output = responses.map(({data}) => {
      if (data.length) {
        console.log(data);
        return data.map((contributor) => {
          return contributor && 
            contributor.weeks && 
            contributor.weeks.length && 
            contributor.weeks[contributor.weeks.length-(1+lastWeek)]
        })
        .filter((val) => val)
        .reduce((prev, curr) => { 
          return {
            additions: prev.additions + curr.a,
            deletions: prev.deletions + curr.d,
            commits: prev.commits + curr.c
          }
        }, {
          additions: 0,
          deletions: 0,
          commits: 0
        });
      }
    }).reduce((prev, curr) => { 
      console.log(prev, curr);
      return {
        additions: prev.additions + curr.additions,
        deletions: prev.deletions + curr.deletions,
        commits: prev.commits + curr.commits
      }
    }, {
      additions: 0,
      deletions: 0,
      commits: 0
    });
    console.log(output);
}))