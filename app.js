const redis = require('redis')
const cors = require('cors')
const nodeFetch = require('node-fetch')
const express = require('express')
const bodyParser = require('body-parser')

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
            res.status(404)
        }
    })
})

app.get('/getWeather/byName', (req, res) => {
    loadWeather.byName(req.query.name, (data) => {
        if (data) {
            res.json(data)
        } else {
            res.status(404)
        }
    })
})

app.get('/getWeather/byCoord', (req, res) => {
    loadWeather.byCoord({lat: req.query.lat, lon: req.query.lon}, (data) => {
        if (data) {
            res.json(data)
        } else {
            res.status(404)
        }
    })
})

app.use('/favs', (req, res, next) => {
    client.get('FAV_CITIES', (err, reply) => {
        if(err) {
            console.log(err)
            res.status(500).end()
        } else {
            if(reply) {
                next()
            } else {
                client.set('FAV_CITIES', '[]', (err, reply) => {
                    if(err) {
                        console.log(err)
                        res.status(500).end()
                        return
                    } 
                    next()
                })
            }
        }
    })
})

app.get('/favs', (req, res) => {
    client.get('FAV_CITIES', (err, reply) => {
        if (err) {
            console.log(err)
            res.status(500)
            return 
        }

        res.json(JSON.parse(reply || '[]'))
    })
})

app.use('/favs', bodyParser())

app.post('/favs', (req, res) => {
    client.get('FAV_CITIES', (err, reply) => {
        if(err) {
            console.log(err)
            res.status(400).end()
        } else {
            let data = JSON.parse(reply || '[]')
            data = data.concat(req.body.data)
            client.set('FAV_CITIES', JSON.stringify(data), (err) => {
                if(err) {
                    console.log(err)
                    res.status(400).end()
                } else {
                    res.status(200).end()
                }
            })
        }
    })
})

app.delete('/favs', (req, res) => {
    client.get('FAV_CITIES', (err, reply) => {
        if(err) {
            console.log(err)
            res.status(400).end()
        } else {
            let data = JSON.parse(reply || '[]')
            console.log(data, req.body)
            let index = data.indexOf(req.body.city)
            if(index !== -1) {
                data.splice(index, 1)
            }
            console.log(data)
            client.set('FAV_CITIES', JSON.stringify(data), (err) => {
                if(err) {
                    console.log(err)
                    res.status(400).end()
                } else {
                    res.status(200).end()
                }
            })
        }
    })
})

app.get('/getFavCities', (req,res) => {
    client.get('FAV_CITIES', (err, reply) => {
        if (err) {
            console.log(err)
            res.status(500)
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
            res.status(500)
        } else {
            res.status(200)
        }
    })
})

app.listen(5000)

