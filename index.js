const API_KEY = 'a7565f490c1a73874bb42f725e98815a'

let cities = []
let column = 0
const columns_id = ['fav-cities-left', 'fav-cities-right']

function saveToLocalStorage() {
    localStorage.setItem('CITIES', JSON.stringify(cities))
}

function loadFromLocalStorage() {
    cities = JSON.parse(localStorage.getItem('CITIES') || '[]')
} 

function loadWeather(city = undefined, coord = undefined, callback) {
    console.log(city, coord, callback)
    
    if(city) {
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`)
            .then(res => {
                return res.json()
            })
            .then(data => {
                callback(data)
            })
			.catch(err => {
				alert('Ошибка API')
				callback(null)
			})
    } else {
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${coord.lat}&lon=${coord.lon}&appid=${API_KEY}&units=metric`)
            .then(res => {
                return res.json()
            })
            .then(data => {
                callback(data)
            })
			.catch(err => {
				alert('Ошибка API')
				callback(null)
			})
    }
}

function loaderCity(city) {
    let loader = document.createElement('li')
    loader.id = `loading-city-${city}`
	loader.setAttribute("class", "mini-loader")
    loader.innerHTML = `
			<h3>Подождите, данные загружаются</h3>
			<img src="https://i.dlpng.com/static/png/6913756_preview.png">
    `
    return loader
}

function cityCard(data) {
    let city = document.createElement('li')
    city.innerHTML = `
        <div class="favourite-list-item">
            <div class="favourite-head">
                <h3>${data.name}</h3>
                <p>${data.main.temp} °С</p>
                <img src="https://cdn2.iconfinder.com/data/icons/weather-flat-14/64/weather04-512.png" alt="Иконка погоды" class="img2">
                <button class="delete but2" onclick="deleteCity(this, '${data.name}')">×</button>
            </div>
            <ul class="items">
                <li>
                    <span>Ветер</span>
                    <span>${data.wind.speed} m/s, ${data.wind.deg}</span>
                </li>
                <li>
                    <span>Облачность</span>
                    <span>${data.clouds.all} %</span>
                </li>
                <li>
                    <span>Давление</span>
                    <span> ${data.main.pressure} hpa</span>
                </li>
                <li>
                    <span>Влажность</span>
                    <span>${data.main.humidity} %</span>
                </li>
                <li>
                    <span>Координаты</span>
                    <span>[${data.coord.lat}, ${data.coord.lon}]</span>
                </li>
            </ul>
        </div>
    `
    return city
}

function renderCity(city = undefined) {
    let favs = document.getElementById(columns_id[column])
    column = column ^ 1
    favs.append(loaderCity(city))

    loadWeather(city, undefined, function(data) {
        console.log('data', data)
        document.getElementById(`loading-city-${city}`).remove()
        if (data) favs.append(cityCard(data))
    })
}

function deleteCity(item, name){
	console.log(item)
	item.parentElement.parentElement.parentElement.remove()
	let index = cities.indexOf(name.toLowerCase)
	cities.splice(index, 1)
	saveToLocalStorage()
	console.log(cities)
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
            loadWeather(undefined, {lat: loc.coords.latitude, lon: loc.coords.longitude}, callback)
        },
        function() {
            alert('У меня нет доступа к геолокации')
            loadWeather(defaultCity, undefined, callback)
        }
    )
}

function changeCurrentWeaher() {
    loadCurrentWeather(function(data) {
		let primary = document.getElementById('primary')
		primary.classList.remove('loader')
		if (!data) {
			primary.innerHTML = ""
			return 
		}
        primary.innerHTML = `
        <div class="city">
            <h2>${data.name}</h2>
        </div>
        <div class="weat-icon">
            <img src="https://cdn2.iconfinder.com/data/icons/weather-flat-14/64/weather04-512.png" alt="Иконка погоды" class="img1">
            <p>${data.main.temp} °С</p>
        </div>
        <div class="primary-right">
            <ul class="items">
                <li>
                    <span>Ветер</span>
                    <span>${data.wind.speed} m/s, ${data.wind.deg}</span>
                </li>
                <li>
                    <span>Облачность</span>
                    <span>${data.clouds.all} %</span>
                </li>
                <li>
                    <span>Давление</span>
                    <span>1013 hpa</span>
                </li>
                <li>
                    <span>Влажность</span>
                    <span>${data.main.humidity} %</span>
                </li>
                <li>
                    <span>Координаты</span>
                    <span>[${data.coord.lat}, ${data.coord.lon}]</span>
                </li>
            </ul>
        </div>
        `
    })
}

document.getElementById('form-add-city').onsubmit = function(e) {
    e.preventDefault();
    let name = document.getElementById('form-add-city-input').value 

    name = name.toLowerCase()

    if(cities.indexOf(name) !== -1) {
        alert('Уже есть')
        return
    }

    document.getElementById('form-add-city-input').value = ''

    renderCity(name)
	
	cities.push(name)
	
	saveToLocalStorage()

    return false
}


    changeCurrentWeaher()
    document.getElementById('reload-gelocation').addEventListener('click', changeCurrentWeaher)

    loadFromLocalStorage()

    for(let i = 0; i < cities.length; i++) {
        city = cities[i]
        console.log(city)
        renderCity(city)
    }
