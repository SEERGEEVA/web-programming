let cities = []
let column = 0
const columns_id = ['fav-cities-left', 'fav-cities-right']

function saveListOfFavCities() {
    fetch(`http://localhost:5000/saveFavCities/?listCities=${JSON.stringify(cities)}`)
}

function loadListOfFavCities(callback) {
    fetch(`http://localhost:5000/getFavCities/`)
        .then(res => res.json())
        .then(data => callback(data))
} 

function loadWeather(city = undefined, coord = undefined, id = undefined, callback) {
    console.log(city, coord, callback)
    
    if(id) {
        console.log('id:', id)
        fetch(`http://localhost:5000/getWeather/byID?id=${id}`)
            .then(res => {
                return res.json()
            })
            .then(data => {
				console.log(data)
                callback(data)
            })
			.catch(err => {
				// alert('Ошибка API')
				callback(null)
			})
    } else {
        if(city) {
            console.log('city:', city)
            fetch(`http://localhost:5000/getWeather/byName?name=${city}`)
                .then(res => {
                    return res.json()
                })
                .then(data => {
                    console.log(data)
                    callback(data)
                })
                .catch(err => {
                    // alert('Ошибка API')
                    console.log(err)
                    callback(null)
                })
        } else {
            fetch(`http://localhost:5000/getWeather/byCoord?lat=${coord.lat}&lon=${coord.lon}`)
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

function loaderCity(city) {
    let t = document.querySelector('#tmpMiniLoader')
    t.content.querySelector('li').setAttribute('id', `loading-city-${city}`)
    console.log(document.importNode(t.content, true) )
    return document.importNode(t.content, true) 
}

function cityCard(data) {
    let template= document.querySelector('#tmpcityCard')
    template.content.querySelector('#tmp\\:name').textContent = `${data?.name}`
    console.log(template.content.querySelector('button'))
    template.content.querySelector('#tmp\\:temp').textContent = `${data?.main.temp} °С`
    template.content.querySelector('#tmp\\:wind').textContent = `${data?.wind.speed} m/s, ${data.wind.deg}`
    template.content.querySelector('#tmp\\:clouds').textContent = `${data?.clouds.all} %`
    template.content.querySelector('#tmp\\:pressure').textContent = `${data?.main.pressure} hpa`
    template.content.querySelector('#tmp\\:humidity').textContent = `${data?.main.humidity} %`
    template.content.querySelector('#tmp\\:coord').textContent = `[${data?.coord.lat}, ${data?.coord.lon}]`
    let clone = document.importNode(template.content, true)
    clone.querySelector('button').addEventListener('click', function() {deleteCity(this, data.id)})
    return clone
}

function renderCity(city = undefined, id = undefined, callback, flag = true) {
    let favs = document.getElementById(columns_id[column])
    column = column ^ 1
    favs.append(loaderCity(city))

    loadWeather(city, undefined, id, function(data) {
        console.log('data', data)
        if(!data) {
            alert('Ошибка API')
        }
        document.getElementById(`loading-city-${city}`).remove()
        if(data) { 
            if(flag && cities.indexOf(data.id) !== -1) {
                alert('Город уже есть')
                return
            }
            favs.append(cityCard(data))
            console.log(cities.indexOf(data.id))
            if(cities.indexOf(data.id) === -1 && callback) {
                callback(data.id)
            }
        } else {
            alert('Ошибка API')
        }
    })
}

function deleteCity(item, id){
	item.parentElement.parentElement.parentElement.remove()
	let index = cities.indexOf(id)
	cities.splice(index, 1)
    console.log(item, id)
	saveListOfFavCities()
}

function loadCurrentWeather(callback) {
    let defaultCity = 'Moscow'

    console.log(defaultCity)
    
    if(!navigator.geolocation) {
        alert('Вы не имеете геолокации')
        loadWeather(defaultCity, undefined, callback)
    }

    navigator.geolocation.getCurrentPosition(
        function(loc) {
            loadWeather(undefined, {lat: loc.coords.latitude, lon: loc.coords.longitude}, undefined, callback)
        },
        function() {
            alert('У меня нет доступа к геолокации')
            loadWeather(defaultCity, undefined, callback)
        }
    )
}

function changeCurrentWeaher() {
    let primary = document.getElementById('primary')
    primary.classList.add('loader')
    primary.innerHTML = ''
    primary.append(document.importNode(document.querySelector('#tmpLoader').content, true))
    loadCurrentWeather(function(data) {
		primary.classList.remove('loader')
        primary.innerHTML = ''
		if (!data) {
			return 
		}
        let template= document.querySelector('#tmpPrimary')
        template.content.querySelector('#tmp\\:name').textContent = `${data?.name}`
        template.content.querySelector('#tmp\\:temp').textContent = `${data?.main.temp} °С`
        template.content.querySelector('#tmp\\:wind').textContent = `${data?.wind.speed} m/s, ${data.wind.deg}`
        template.content.querySelector('#tmp\\:clouds').textContent = `${data?.clouds.all} %`
        template.content.querySelector('#tmp\\:pressure').textContent = `${data?.main.pressure} hpa`
        template.content.querySelector('#tmp\\:humidity').textContent = `${data?.main.humidity} %`
        template.content.querySelector('#tmp\\:coord').textContent = `[${data?.coord.lat}, ${data?.coord.lon}]`
        primary.append(document.importNode(template.content, true))
    })
}

document.getElementById('form-add-city').onsubmit = function(e) {
    e.preventDefault();
    let name = document.getElementById('form-add-city-input').value 

    name = name.toLowerCase()

    if(name == '') {
        alert('пустой город')
        return
    }

    if(cities.indexOf(name) !== -1) {
        alert('Уже есть')
        return
    }

    document.getElementById('form-add-city-input').value = ''

    console.log('aaaaaa')
    renderCity(name, undefined, (id) => {cities.push(id); saveListOfFavCities()})


    return false
}


changeCurrentWeaher()
document.getElementById('reload-gelocation').addEventListener('click', changeCurrentWeaher)

loadListOfFavCities(data => {
    cities = data
    for(let i = 0; i < cities.length; i++) {
        city = cities[i]
        console.log(city)
        renderCity(undefined, city, undefined, false)
    }
})

