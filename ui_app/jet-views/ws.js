import {JetView} from "/jet.js";

export default class TopView extends JetView{
	config()
		{
		//----------- GLOBAL SUB-APP MENU -------------------------
		const global_subapp_menu_data = [
			{id: "start", value: "Домой", icon: "home"},
			{id: "users", value: "Пользователи..", icon: "account"},
			{id: "domino", value: "Domino", icon: "cube"},
			{id: "reports", value: "Reports", icon: "chart-bar"},
			{id: "database", value: "Database", icon: "database"},
			{id: "settings", value: "Settings", icon: "cogs"}
			];
		//---->
		const global_subapp_menu = {
			view: "sidemenu",
			id: "global_subapp_menu",
			width: 200,
			zIndex:999,
			position: "left",
			state:function(state){
						var toolbarHeight = $$("global_ws_toolbar").$height;
						state.top = toolbarHeight;
						state.height -= toolbarHeight;
			},
			css: "my_menu",
			body:{
						view:"list",
						borderless:true,
						scroll: false,
						template: "<span class='webix_icon mdi mdi-#icon#'></span> #value#",
						data: global_subapp_menu_data,
						select:true,
						type:{
								height: 40
						},
						on:{
								onItemClick: (id)=>{
												this.show(id);
												$$("global_subapp_menu").hide()
										}
								}
					}
			};
		webix.ui(global_subapp_menu);
		
		//----------- UI -------------------------------------
		const ui = {
				rows: [
					{ view: "toolbar", id:"global_ws_toolbar", padding:3, elements: [
						{
							view: "icon", icon: "mdi mdi-menu",
							click: ()=>{ 
								const menu = $$("global_subapp_menu");
								(menu.config.hidden) ? menu.show() : menu.hide() }
						 },
						{ view: "label", label: "Движение ONLINE", width:200 },
						
						{},
						{ view: "icon", icon: "mdi mdi-cogs", click: ()=>{webix.message("Настройки")}}
						]
					},
					{ $subview:true }
				]
			};
	
		return ui;
	}
}
