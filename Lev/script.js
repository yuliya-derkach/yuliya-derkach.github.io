class User {
	constructor() {}
}

class Editor extends User {
	constructor() {
		super();
		this.isEditor = true;
	}
}

class Admin extends Editor {
	constructor() {
		super();
		this.isAdmin = true;
	}
}

//SPA

window.onhashchange = switchToStateFromURLHash;

// Model 
var SPAState = {};

function switchToStateFromURLHash() {
	let URLHash = window.location.hash;
	let stateStr = URLHash.substr(1);

	if (stateStr != "") {
		SPAState = {
			pagename: stateStr
		};
	} else
		SPAState = {
			pagename: 'ModalWindow'
		};

	//  View 
	var pageHTML = "";
	switch (SPAState.pagename) {
		case 'ModalWindow':
			pageHTML = document.getElementById('ModalWindow').innerHTML;
			break;
		case 'MainPage':
			pageHTML = document.getElementById('MainPage').innerHTML;
			break;
		case 'PersonalPage':
			pageHTML = document.getElementById('PersonalPage').innerHTML;
			break;
		case 'SettingsPage':
			pageHTML = document.getElementById('SettingsPage').innerHTML;
			break;
	}
	document.getElementById('IPage').innerHTML = pageHTML;

}

function switchToState(newState) {
	let stateStr = newState.pagename;
	location.hash = stateStr;
}

function switchToModalWindow() {
	switchToState({
		pagename: 'ModalWindow'
	});

}

function switchToMainPage() {
	switchToState({
		pagename: 'MainPage'
	});
	getRequest(renderMain);
}

function switchToPersonalPage() {
	switchToState({
		pagename: 'PersonalPage'
	});
	getRequest(renderPersonalPage);
}

function switchToSettingsPage() {
	switchToState({
		pagename: 'SettingsPage'
	});
	getRequest(renderSettingsPage);
}

switchToStateFromURLHash();

//wrapper for request
function getJSON(type, url) {
	return new Promise((resolve, reject) => {
		let xhr = new XMLHttpRequest();
		xhr.open(type, url);
		xhr.responseType = "json";
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");
		xhr.onload = () => {
			if (xhr.status === 200)
				resolve(xhr.response);
			else
				reject(new Error(`${xhr.status}: ${xhr.statusText}`));
		};
		xhr.onerror = () => {
			reject(new Error(`Ошибка сети. Сервер не отдал код ошибки.`));
		};
		xhr.send();
	});
}

//get json
async function getRequest(param) {
	try {
		let data = await getJSON("GET", "DATA.json");
		param(data);
	} catch (e) {
		console.log(e.message);
	}
}

// get new array after filter
function getRequestForSearch(param, names) {
	try {
		let data = names;
		param(data);
	} catch (e) {
		console.log(e.message);
	}
}
document.querySelector(".header-logo").addEventListener('click', switchToMainPage);

//authorization and add data to local storage
let userRole = null;
let a = function (data) {
	let obj = {
		user: document.getElementById('username').value,
		password: document.getElementById('password').value
	};
	let serialObj = JSON.stringify(obj);
	localStorage.setItem("myKey", serialObj);
	switchToMainPage();
	userRole = getUser(data);


}

// add class for user
function getUser(data) {
	for (let i = 0; i < data.length; i++) {
		if (document.getElementById('username').value === data[i].lastName) {
			let role = data[i].role;
			let user = null;

			switch (role) {
				case "user":
					user = new User();

					break;

				case "editor":
					user = new Editor();

					break;

				case "admin":
					user = new Admin();

					break;
			}
			return user;

		}

	}
}

// render modal window
function renderModalWindow() {
	document.getElementById('SignIn').addEventListener('click', getRequest(a));
}

// switch view butons
function viewGrid() {
	document.querySelector('.view-options').addEventListener('click', function (e) {
		const items = document.querySelectorAll('i.show-grid, i.show-list');
		const target = e.target;
		const list = document.querySelector('.employees-list');
		Array.from(items).forEach(item => {
			item.classList.remove('active-view');
		});
		target.classList.add('active-view');

		if (target.classList.contains('show-list')) {
			list.classList.add('list');
			document.querySelector('.t-head').style.display = "flex";
		} else {
			list.classList.remove('list');
			document.querySelector('.t-head').style.display = "none";
		}
	});

}

// render home page
let renderMain = function (data) {
	document.querySelector(".employees-list").innerHTML = "";
	document.querySelector('.search-button').addEventListener('click', getDataForSearch);
	document.getElementById('roles-page').addEventListener('click', switchToSettingsPage);
	document.querySelectorAll('.switch-view').forEach(elem => elem.addEventListener('click', viewGrid));

	for (let i = 0; i < data.length; i++) {
		let b = document.getElementById("item_tmpl1").innerHTML;
		document.querySelector(".employees-list").innerHTML += b.replace('$src', data[i].img).replace('$firstName', data[i].firstName).replace('$lastName', data[i].lastName).replace('$firstNameCirilic', data[i].firstNameCirilic).replace('$lastNameCirilic', data[i].lastNameCirilic).replace('$department', data[i].department).replace('$room', data[i].room);
	}
	let numberOfEmployees = data.length;
	let countOfEmployees = document.querySelector('.count-of-employees');
	countOfEmployees.textContent = numberOfEmployees + ' employees displayed';
	document.querySelector(".toolbar").prepend(countOfEmployees);
	if (userRole.isAdmin) {
		document.getElementById('roles-page').style.display = "flex";
	}
	document.querySelectorAll('.employee-item').forEach(elem => elem.addEventListener('click', switchToPersonalPage));


}

//render personal page

let renderPersonalPage = function (data) {
	document.querySelector(".photo-info").innerHTML = "";
	let imgTmpl = document.getElementById("imageTemplate").innerHTML;
	document.querySelector(".photo-info").innerHTML = imgTmpl.replace('$abbr', "- " + data[2].abbr + " -")
		.replace('$src', data[2].img)
		.replace('$name', data[2].firstName + " " + data[2].lastName)
		.replace('$nativeName', data[2].lastNameCirilic + " " + data[2].firstNameCirilic + " " + data[2].middleNameCirilic)

	document.getElementById("info").innerHTML = "";
	let persTmpl = document.getElementById("personalInfoTemplate").innerHTML;
	document.getElementById("info").innerHTML = persTmpl.replace('$department', data[2].department)
		.replace('$room', data[2].room)
		.replace('$intemalPhone', data[2].intemalPhone)
		.replace('$mobilePhone', data[2].mobilePhone)
		.replace('$email', data[2].email)
		.replace('$skype', data[2].skype)
		.replace('$cNumber', data[2].cNumber)
		.replace('$hireDate', getDate(data[2].hireDate))
		.replace('$status', data[2].status)

	document.getElementById('email').setAttribute('href', "mailto:" + data[2].email);
	document.getElementById('skype').setAttribute('href', "skype:" + data[2].skype + "?chat");

	if (userRole.isAdmin || userRole.isEditor) {
		document.getElementById('forms-buttons').style.display = "flex";
		document.getElementById('mobilePhoneRow').style.display = "flex";
		document.getElementById('HireDateRow').style.display = "flex";
	}
	document.querySelector('.back').addEventListener('click', switchToMainPage);

}

// update data after filter
function getDataForSearch() {
	getRequest(search);
}

let search = function (data) {
	let search = document.getElementById('search').value.toLowerCase();
	let employeesList = document.querySelector('.employees-list');
	employeesList.textContent = "";
	let names = data.filter(function (elem) {
		return elem.firstName.toLowerCase().includes(search) || elem.lastName.toLowerCase().includes(search) || elem.firstNameCirilic.toLowerCase().includes(search) || elem.lastNameCirilic.toLowerCase().includes(search);
	});

	getRequestForSearch(renderMain, names)

	if (names.length == 0) {
		employeesList.textContent = 'Совпадений не найдено!'
	}
}

//render settings page
let renderSettingsPage = function (data) {
	let a;
	document.querySelector(".roles-list").innerHTML = "";
	for (let i = 0; i < data.length; i++) {
		a = document.getElementById("item_tmpl2").innerHTML;
		let admin = "adminRole" + [i];
		let editor = "editorRole" + [i];
		let user = "employeeRole" + [i];

		document.querySelector(".roles-list").innerHTML += a.replace('$src', data[i].img)
			.replace('$employeeRole', user)
			.replace('$editorRole', editor)
			.replace('$adminRole', admin)
			.replace('$employeeRoleLabel', user)
			.replace('$editorRoleLabel', editor)
			.replace('$adminRoleLabel', admin)
			.replace('$nameUser', "name" + [i])
			.replace('$nameEditor', "name" + [i])
			.replace('$nameAdmin', "name" + [i])
			.replace('$firstName', data[i].firstName)
			.replace('$lastName', data[i].lastName)
			.replace('$firstNameCirilic', data[i].firstNameCirilic)
			.replace('$lastNameCirilic', data[i].lastNameCirilic);


		if (data[i].role == "admin") {
			document.getElementById(admin).classList.add('active');
			document.getElementById(admin).checked = "true";
		} else if (data[i].role == "editor") {
			document.getElementById(editor).checked = "true";
			document.getElementById(editor).classList.add('active');

		} else {
			document.getElementById(user).checked = "true";
			document.getElementById(user).classList.add('active');
		}


	}
}

// convert date
function getDate(date) {
	let d = new Date(date);
	let curr_date = addZero(d.getDate());
	let curr_month = addZero(d.getMonth() + 1);
	let curr_year = d.getFullYear();
	return (curr_date + "-" + curr_month + "-" + curr_year);

	function addZero(num) {
		return (num >= 0 && num < 10) ? "0" + num : num + "";
	}
}