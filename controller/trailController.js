const fetch = require('node-fetch');

//API request REI API with a latitute and longitude of central LA, with a search radius of 20 miles with 100 max results with a minimum of 3 stars and my user key
// let url = 'https://www.hikingproject.com/data/get-trails?lat=34.383966&lon=-118.537239&maxDistance=20&maxResults=100&minStars=3.5&key=200597455-cfbe6650f3776f2f486ae788a2ecf16b'


const API_URI = `https://www.hikingproject.com/`

const trailController = {};

//middleware functuon to fetch trail information from REI API
trailController.getTrails = (req, res, next) => {
  console.log('trailController.getTrails');

  console.log(req.query)
  const lat = req.query.lat;
  console.log(lat);
  const long = req.query.lon;
  console.log(long)

  const url = `${API_URI}data/get-trails?lat=${lat}&lon=${long}&maxDistance=20&maxResults=100&minStars=3.5&key=200597455-cfbe6650f3776f2f486ae788a2ecf16b`

  fetch(url)
    .then(res => res.json())
    .then(json => {
      res.locals.trails = json
      return next()})
    .catch(err => console.log(`***trailController.js => .getTrails fetch req failed: ${err}`))



  // fetch(url)
  // .then(res => res.json())
  // .then(json => {
  //     res.locals.trails = json
  //     return next()})
  // .catch(err => next({
  //     err: 'trailController.getTrails: ERROR: Check server logs for details' 
  // }));
};

module.exports = trailController;