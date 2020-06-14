const score = document.querySelector('.score');
const start = document.querySelector('.start');
const gameArea = document.querySelector('.gameArea');
const car = document.createElement('div');
car.classList.add('car')
const audio = new Audio('./audio.mp3');
const crash = new Audio('./crash.mp3');
let topFive = [];
let content = document.querySelector('.content');
start.addEventListener('click', startGame);
document.addEventListener('keydown', startRun);
document.addEventListener('keyup', stopRun);

document.querySelector(".close").addEventListener("click", closeModalWindow)
  
let topArr = [
		{name: 'Igor', result: 1600},
		{name: 'Dmitry', result: 1550},
		{name: 'Olga', result: 1380},
		{name: 'Nikolai', result: 1000},
		{name: 'Marina', result: 800}
		];

if (!localStorage.getItem('TOP5')) {
	setTop(topArr);
} else {
	topFive = JSON.parse(localStorage.getItem('TOP5'));
}

const keys = {
	ArrowUp: false,
	ArrowDown: false,
	ArrowRight: false,
	ArrowLeft: false
};

const setting= {
	start: false,
	score: 0,
	speed: 3,
	traffic:3,
	acceleration: 0.003
};

function setTop(arr){
	let newArr = JSON.stringify(arr);
	window.localStorage.setItem('TOP5', newArr);
	closeModalWindow();
}

//вычисляет сколько элементов поместится на странице
function getQuantityElements(heightElement){
	return document.documentElement.clientHeight / heightElement + 1;
}

function startGame(e){
	if(e.target.classList.contains("easy")){
		setting.speed = 3;
		setting.traffic = 3;
		setting.acceleration = 0.003;
	}

	if(e.target.classList.contains("middle")){
		setting.speed = 5;
		setting.traffic = 2;
		setting.acceleration = 0.007;
	}

	if(e.target.classList.contains("hard")){
		setting.speed = 7;
		setting.traffic = 2;
		setting.acceleration = 0.01;
	}


	start.classList.add('hide');
	gameArea.innerHTML = "";

	//линии
	for(let i = 0; i < getQuantityElements(100); i++){
		const line = document.createElement('div');
		line.classList.add('line');
		line.style.top = (i * 100) + 'px'; //расстояние межу линиями 
		line.y = i * 100; //координата для манипулирования движения дороги
		gameArea.appendChild(line);
	}

	for(let i = 0; i < getQuantityElements(200 * setting.traffic); i++){
		const enemy = document.createElement('div');
		let enemyImg = Math.floor(Math.random()*5)+1;
		enemy.classList.add('enemy');
		enemy.y = -200 * setting.traffic * (i+1);
		enemy.style.left = Math.floor(Math.random() * (gameArea.offsetWidth - 50)) + 'px';
		enemy.style.top = enemy.y + 'px';
		enemy.style.background = `transparent url(./image/enemy${enemyImg}.png) center / cover no-repeat`;
		gameArea.appendChild(enemy);
	}
	setting.score = 0;
	setting.start =  true;
	gameArea.appendChild(car);
	car.style.left = gameArea.offsetWidth / 2 - car.offsetWidth / 2;
	car.style.top = "auto";
	car.style.bottom = "10px";
	setting.x = car.offsetLeft; //изменяем координату х во время игры
	setting.y = car.offsetTop;
	requestAnimationFrame(playGame);
}

function playGame(){
		audio.play();
		setting.speed += 0.01;
		setting.score += Math.round(setting.speed);
		score.innerHTML = 'SCORE:<br/>' + setting.score;
		moveRoad();
		moveEnemy();
		//двигаем стрелки и не выходило за пределы поля
		if(keys.ArrowLeft && setting.x > 0){
			setting.x -= setting.speed;// равносильно setting.x - setting.speed
		}

		if(keys.ArrowRight && setting.x < (gameArea.offsetWidth - car.offsetWidth)){
			setting.x += setting.speed;
		}

	    if(keys.ArrowUp && setting.y > 0){
	    	setting.y -= setting.speed;
	    }

	    if(keys.ArrowDown && setting.y < (gameArea.offsetHeight - car.offsetHeight)){
	    	setting.y += setting.speed;
	    }
	    //передаем значения машине
	    car.style.left = setting.x + 'px';
	    car.style.top = setting.y + 'px';

	if(setting.start){
	    requestAnimationFrame(playGame);
	}
}

function startRun(event){
	if (event.key in keys) {
		keys[event.key] = true;
	}
}

function stopRun(event){
	if (event.key in keys) {
		keys[event.key] = false;
	}
}
//движение дороги
function moveRoad(){
	let lines = document.querySelectorAll('.line');
	lines.forEach(function(line){
		line.y += setting.speed;
		line.style.top = line.y + 'px'; //
		if(line.y >= document.documentElement.clientHeight){
			line.y = -100; //если линия скрывается, поднимаем ее вверх
		}
	});
}

function collapse(enemyRect) {
	let carRect = car.getBoundingClientRect();
	return carRect.top <= enemyRect.bottom && 
			carRect.right >= enemyRect.left &&
			carRect.left <= enemyRect.right &&
			carRect.bottom >= enemyRect.top;
}

function moveEnemy(){
	let enemy = document.querySelectorAll('.enemy');
	enemy.forEach(function(item){
		let enemyRect = item.getBoundingClientRect();
		if(collapse(enemyRect)){
				setting.start = false;
				start.classList.remove('hide');
				start.style.top = score.offsetHeight + "px"; 
				audio.load();
				crash.play();
				if(topFive[topFive.length-1].result < setting.score) {
					addNewWinner();
				}
		}
		item.y += setting.speed / 2;
		item.style.top = item.y + 'px';
		if(item.y >= document.documentElement.clientHeight){
			item.y = -200 * setting.traffic; //чтоб сохранялась плотность, умножаем на трафик
			item.style.left = Math.floor(Math.random() * (gameArea.offsetWidth - 50)) + 'px'; //чтоб не уходили авто за пределы поля, отнимаем ширину машинки
		}
	})
}


function addToLocalStorage(){
		topFive[topFive.length-1] =  {name: document.getElementById('name').value, result: setting.score};
		topFive.sort((a, b) => a.result > b.result ? -1 : 1);
		setTop(topFive);
		closeModalWindow();
		saveResult();
}


function closeModalWindow(){
	document.querySelector('.modal').style.display = "none";
	content.innerHTML = "";
}

function addNewWinner(){
	document.querySelector('.modal').style.display = "block";
	let text = document.createElement('div');
	text.classList.add('text')
	text.innerHTML = "Поздравляем!<br/>Вы установили рекорд!<br/>Введите свое имя:";
	content.appendChild(text);
	let wrap = document.createElement('div');
	wrap.classList.add('wrap');
	let winnersName = document.createElement('input');
	winnersName.setAttribute('id', "name");
	winnersName.classList.add('newWinner');
	wrap.appendChild(winnersName);
	let button = document.createElement('input');
	button.setAttribute('type', 'submit');
	button.setAttribute('id', 'record');
	button.setAttribute('value', 'Добавить рекорд');
	button.setAttribute("onclick", "addToLocalStorage()");
	button.style.cursor = "pointer";
	button.classList.add('newWinner');
	wrap.appendChild(button);
	content.appendChild(wrap);
}

function saveResult() {
		document.querySelector('.modal').style.display = "block";
		let text = document.createElement('div');
		let table = document.createElement("table");
		table.classList.add('table');
		let  caption = document.createElement("caption");
		caption.innerText = 'Таблица результатов';
		caption.classList.add('caption')
	    table.appendChild(caption);
    	topFive.forEach(item => {
        let tr = document.createElement("tr");
        tr.classList.add('tr');
        let personName = document.createElement('td');
        personName.innerHTML = item.name;

        let personScore = document.createElement('td');
        personScore.innerHTML = item.result;
        if(item.result === setting.score){
        	tr.classList.add('currentWinner');
        }

        tr.appendChild(personName);
        tr.appendChild(personScore);

        table.appendChild(tr);
        content.appendChild(table);

    });
}

