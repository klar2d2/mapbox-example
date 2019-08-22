require('dotenv').config();
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const express = require('express');
const methodOverride = require('method-override')
const layouts = require('express-ejs-layouts')
const geocodingClient = mbxGeocoding({ accessToken: process.env.accessToken});

const app = express()

// Middleware and config

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(methodOverride('_method'))
app.use(layouts)


// render the city search view
app.get('/', (req, res) => {
  res.render('citySearch')
})

// use forward geocoding to search for cities
// Render the search results page
app.post('/search', (req, res) => {
  let city = req.body.city
  let state = req.body.state
  let query = `${city}, ${state}`
  console.log(city, state, query)
    geocodingClient.forwardGeocode({ query })
    .send()
    .then(response => {
      //To do: send All of the city listings instead of just the first one
      // update the search Results to match
      const match = response.body.features[0]
      let lat = match.center[1]
      let long = match.center[0]
      let splitPlace_name = match.place_name.split(',')
      let city = splitPlace_name[0]
      let state = splitPlace_name[1]

      res.json({
        lat,
        long,
        city,
        state
      })
    })
})

const db = require('./models')
// Add selected city to favorites
app.post('/favorites', (req, res) => {
  db.place.create(req.body)
  .then(() => {
    res.redirect('/favorites')
  })
  .catch(err => {
    console.log('err', err)
    res.send('err')
  })
})

//Get favorites
app.get('/favorites', (req, res) => {
  console.log('We hit get favs')
  db.place.findAll()
  .then(places => {
    res.json(places)
  })
  .catch(err => {
    console.log('err', err)
    res.json({ err: err.message })
  })
})

//Delete the city from the favorites table and then redirect to the favorites
app.delete('/favorites/:id', (req, res) => {
  db.place.destroy({
    where: { id: req.params.id }
  })
  .then(() => {
    res.redirect('/favorites')
  })
  .catch(err => {
    console.log('err', err)
    res.send('err')
  })
})

// app.get('/api/favorites', (req, res) => {
//   db.places.findAll()
//   .then(res.json( places ))
//   .catch(err => {
//     console.log('err', err)
//     res.send('err')
//   })
//
// })
//
// app.post('/api/favorites', (req, res) => {
//   db.places.create(req.body)
//   .then(() => {
//     res.redirect('/api/favorites')
//   })
//   .catch(err => {
//     console.log('err', err)
//     res.send('err')
//   })
// })

// app.delete('/api/:id', (req, res) => {
//   db.place.destroy({
//     where: { id: req.params.id }
//   })
//   .then(() => {
//     res.redirect('/api/favorites')
//   })
//   .catch(err => {
//     console.log('err', err)
//     res.send('err')
//   })
// })
//
// app.put('/api/favorites/:id/update', (req, res) => {
//   db.place.findAll()
//   .then(place => {
//     places[id.req.params].city = req.body.city
//     places[id.req.params].state = req.body.state
//     places[id.req.params].lat = req.body.lat
//     places[id.req.params].long = req.body.long
//   })
//   .catch(err => {
//     console.log('err', err)
//     res.send('err')
//   })
// })
//
// app.get('/api/favorites/:id', (req, res) => {
//   db.place.findOne()
//   .then(places => {
//     res.json({
//       city,
//       state,
//       lat,
//       long
//     })
//   })
//   .catch(err => {
//     console.log('err', err)
//     res.send('err')
//   })
// })

// Hear it
app.listen(3000, () => {
  console.log('Now listening on port 3000')
})
