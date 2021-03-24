const redis = require('redis')
const cors = require('cors')
const nodeFetch = require('node-fetch')
const express = require('express')
const loadWeather = require('./loadWeather')

const client = redis.createClient()
const app = express()

app.use(cors())
app.use('/src', express.static(__dirname + '/src'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/src/index.html')
})

app.get('/getWeather/byID', (req, res) => {
    loadWeather.byID(req.query.id, (data) => {
        if (data) {
            res.json(data)
        } else {
            res.status(400)
        }
    })
})

app.get('/getWeather/byName', (req, res) => {
    loadWeather.byName(req.query.name, (data) => {
        if (data) {
            res.json(data)
        } else {
            res.status(400)
        }
    })
})

app.get('/getWeather/byCoord', (req, res) => {
    loadWeather.byCoord({lat: req.query.lat, lon: req.query.lon}, (data) => {
        if (data) {
            res.json(data)
        } else {
            res.status(400)
        }
    })
})

app.get('/getFavCities', (req,res) => {
    client.get('FAV_CITIES', (err, reply) => {
        if (err) {
            console.log(err)
            res.status(400)
            return 
        }

        res.json(JSON.parse(reply || '[]'))
    })
})

app.get('/saveFavCities', (req,res) => {
    console.log(req.query)
    client.set('FAV_CITIES', req.query.listCities, err => {
        if (err) {
            console.log(err)
            res.status(400)
        } else {
            res.status(200)
        }
    })
})

app.listen(5000)

