const express = require('express');
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

const needle = require('needle');
const { token } = require('./config');
const endpointURL = 'https://api.twitter.com/2/users/by?usernames=';

app.get('/', async (req, res) => {
  const params_obama = {
    usernames: 'POTUS44',
    'user.fields': 'description,id,profile_image_url',
    expansions: 'pinned_tweet_id',
  };
  const response_obama = await needle('get', endpointURL, params_obama, {
    headers: {
      'User-Agent': 'v2UserLookupJS',
      authorization: `Bearer ${token}`,
    },
  });

  const params_trump = {
    usernames: 'POTUS45',
    'user.fields': 'description,id,profile_image_url',
    expansions: 'pinned_tweet_id',
  };
  const response_trump = await needle('get', endpointURL, params_trump, {
    headers: {
      'User-Agent': 'v2UserLookupJS',
      authorization: `Bearer ${token}`,
    },
  });

  const params_biden = {
    usernames: 'POTUS',
    'user.fields': 'description,id,profile_image_url',
    expansions: 'pinned_tweet_id',
  };
  const response_biden = await needle('get', endpointURL, params_biden, {
    headers: {
      'User-Agent': 'v2UserLookupJS',
      authorization: `Bearer ${token}`,
    },
  });

  res.render('home', {
    obama_data: response_obama.body.data,
    trump_data: response_trump.body.data,
    biden_data: response_biden.body.data,
  });
});

app.get('/obama', async (req, res) => {
  const userId = req.query.presidentId;
  const url = `https://api.twitter.com/2/users/${userId}/tweets`;

  const picUrl = req.query.obamaPicUrl;
  const name = req.query.obamaName;
  const params = {
    max_results: 5,
    'tweet.fields': 'public_metrics',
  };

  const response = await needle('get', url, params, {
    headers: {
      'User-Agent': 'v2UserTweetsJS',
      authorization: `Bearer ${token}`,
    },
  });
  res.render('president', {
    data: response.body.data,
    presidentId: userId,
    picUrl: picUrl,
    name: name,
  });
});

app.get('/trump', async (req, res) => {
  const userId = req.query.presidentId;
  const url = `https://api.twitter.com/2/users/${userId}/tweets`;

  const picUrl = req.query.trumpPicUrl;
  const name = req.query.trumpName;
  const params = {
    max_results: 5,
    'tweet.fields': 'public_metrics',
  };

  const response = await needle('get', url, params, {
    headers: {
      'User-Agent': 'v2UserTweetsJS',
      authorization: `Bearer ${token}`,
    },
  });
  if (response.body.meta.result_count == 0) {
    res.render('president', { data: [] });
  } else {
    res.render('president', {
      data: response.body.data,
      presidentId: userId,
      picUrl: picUrl,
      name: name,
    });
  }
});

app.get('/biden', async (req, res) => {
  const userId = req.query.presidentId;
  const url = `https://api.twitter.com/2/users/${userId}/tweets`;

  const picUrl = req.query.bidenPicUrl;
  const name = req.query.bidenName;
  const params = {
    max_results: 5,
    'tweet.fields': 'public_metrics',
  };

  const response = await needle('get', url, params, {
    headers: {
      'User-Agent': 'v2UserTweetsJS',
      authorization: `Bearer ${token}`,
    },
  });
  res.render('president', {
    data: response.body.data,
    presidentId: userId,
    picUrl: picUrl,
    name: name,
  });
});

app.get('/presidentDetail', async (req, res) => {
  const userId = req.query.userId;
  const url = `https://api.twitter.com/2/users/${userId}/tweets`;

  const picUrl = req.query.picUrl;
  const name = req.query.name;
  const tweetsNumber =
    req.query.tweetsNumber != '' ? req.query.tweetsNumber : 5;
  const sortLikes = req.query.sortLikes;

  const params = {
    max_results: tweetsNumber,
    'tweet.fields': 'public_metrics',
  };

  const response = await needle('get', url, params, {
    headers: {
      'User-Agent': 'v2UserTweetsJS',
      authorization: `Bearer ${token}`,
    },
  });

  const tweets = response.body.data;

  switch (sortLikes) {
    case 'none':
      break;
    case 'ascending':
      tweets.sort((a, b) => {
        return b.public_metrics.like_count - a.public_metrics.like_count;
      });
      break;
    case 'descending':
      tweets.sort((a, b) => {
        return a.public_metrics.like_count - b.public_metrics.like_count;
      });
      break;
    default:
      console.log('Sorting Unexpected Error');
  }

  res.render('president', {
    data: tweets,
    checked: sortLikes,
    counts: tweetsNumber,
    presidentId: userId,
    picUrl: picUrl,
    name: name,
  });
});

app.listen(3000, () => {
  console.log('server started');
});
