import {JetView} from "/jet.js";

export default class repView extends JetView{
	config(){return {}}

	ready(v){
//		console.log(this.app.getUrlString())
		const url = this.app.getUrlString()

		this.app.show(url.replace('/users','/view?db=users'));
		webix.message('users')
		
	}
}
