const fetch = require('node-fetch')

const API_KEY = 'a7565f490c1a73874bb42f725e98815a'

function loadWeather(city = undefined, coord = undefined, id = undefined, callback) {
    //console.log(city, coord, callback)
    
    if(id) {
        //console.log('id:', id)
        fetch(`https://api.openweathermap.org/data/2.5/weather?id=${encodeURIComponent(id)}&appid=${API_KEY}&units=metric`)
            .then(res => {
                return res.json()
            })
            .then(data => {
				//console.log(data)
                callback(data)
            })
			.catch(err => {
				// alert('Ошибка API')
				callback(null)
			})
    } else {
        if(city) {
            //console.log('city:', city)
            fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`)
                .then(res => {
                    return res.json()
                })
                .then(data => {
                    //console.log(data)
                    callback(data)
                })
                .catch(err => {
                    // alert('Ошибка API')
                    //console.log(err)
                    callback(null)
                })
        } else {
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(coord.lat)}&lon=${encodeURIComponent(coord.lon)}&appid=${API_KEY}&units=metric`)
                .then(res => {
                    return res.json()
                })
                .then(data => {
                    callback(data)
                })
                .catch(err => {
                    // alert('Ошибка API')
                    callback(null)
                })
        }
    }
}

function byID (id, callback)  {
    loadWeather(undefined, undefined, id, callback)

}

function byName (name, callback){
    loadWeather(name, undefined, undefined, callback)
}

function byCoord (coord, callback){
    loadWeather(undefined, coord, undefined, callback)
}

module.exports = {
    byID,
    byName,
    byCoord
}