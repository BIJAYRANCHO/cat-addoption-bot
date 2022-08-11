const dotenv = require('dotenv');
const { resolveConfig } = require('prettier');
const Twitter = require('twitter-api-v2').default
require('isomorphic-fetch');

// import Twitter from 'twitter'
const fetch = require('node-fetch').default

dotenv.config({ path: './config.env' });


const twitterClient = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_SECRET

});

//sync / await is to simplify the syntax necessary to consume promise-based APIs. 
const newCatsThisHour = async () => {
    const hourAgo = new Date(new Date().getTime() - 1000 * 60 * 60).to;

    let catsWithPhotos = []

    try {

        const tokenRes = await fetch('https://api.petfinder.com/v2/oauth2/token', {
            method: 'POST',
            body: `grant_type=client_credentials&client_id=${process.env.PF_API_Key}&client_secret=${process.env.PF_SECRET_Key}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },

        });


        const { access_token } = await tokenRes.json();
        console.log(access_token)


        const catRes = await fetch(
            `https://api.petfinder.com/v2/animals?type=cat&page=${Math.floor(Math.random() * (20 - 1 + 1) + 1)}`,
            // `https://api.petfinder.com/v2/animals?type=cat&page=2`,
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        )


        const { animals } = await catRes.json()
        console.log(animals)

        if (animals.length === 0) {
            return null
        }
        if (animals.length > 0) {
            let catsWithPhotos = animals.filter(animal => animal.photos.length > 0)
            return catsWithPhotos;
        }

    } catch (error) {
        console.log(error)
    }
};



const shareCat = async () => {
    const newCats = await newCatsThisHour()
    if (newCats) {

        twitterClient.post(
            'statuses/update',
            {
                status: `I'm looking for home! ${newCats[0].url}`,

            },
            function (error, tweet, response) {
                if (!error) {
                    console.log(tweet)
                }
                if (error) {
                    console.log(error)
                }
            }
        )
    }
}

shareCat();


setInterval(shareCat, 1000*60*60);



