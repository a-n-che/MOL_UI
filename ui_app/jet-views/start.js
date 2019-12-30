import {JetView} from "/jet.js";

export default class TopView extends JetView{
	config(){
		let ui = {
		//template:'Start page: "Движение OnLine"'
		 rows:[
				{ view:"button", type:"iconTop", icon:"mdi mdi-account", width: 170, height: 50,
				 id: "users", label: 'Полльзователи', 
				 click: ()=>{this.show("view?db=users")} },
			  	{ view:"button", type:"iconTop", icon:"mdi mdi-cube", width: 170, height: 50,
				  id: "products", label: "Domino", 
				  click: ()=>{this.show("view?db=dbstructure&view=postbyemployee")}},
				{ view:"button", type:"iconTop", icon:"mdi mdi-chart-bar", width: 170, height: 50,
				id: "reports", label: "Reports"},
		  		{ view:"button", type:"iconTop", icon:"mdi mdi-database", width: 170, height: 50,
				  id: "database", label: "Database"},
		   ]
		}

		return ui;
	}
};
