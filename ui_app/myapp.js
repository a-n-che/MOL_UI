import {JetApp, UrlRouter, HashRouter} from "/jet.js";

// Корневой класс приложения
class MOLApp extends JetApp{
	constructor(config){
		const defaults = {
			id 		: "MOL_APP",
			version : "0.0.1",
			router 	: HashRouter,//UrlRouter,
			debug 	: true,
			start 	: "/ws/start",
			name	: "Movinment ONLINE"
		};
		
		super({ ...defaults, ...config })
	}
}


// После загрузки модулей запускаем приложение
webix.ready(() => {
	console.log('Start application')
	const app = new MOLApp().render(); //Cоздаем экземпляр класса и Отрисовываем
			
});





