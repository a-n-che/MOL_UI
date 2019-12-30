import {JetView} from "/jet.js";

//############################################################################################################
// ********** FORM ******************
export class mForm  extends JetView{
    constructor(app, name, data, EditMode){
        //console.log('New user form')
        super(app, name);
        this.DataRec = data;
        this.EditMode = EditMode
     }
    init(view){
        $$("document_form").bind(this.DataRec);
    }

    config(){
        let tb = this.toolbar();
        let frm= this.form();
        if(this.EditMode){
            if(this.toolbar_edit) tb = this.toolbar_edit();
            if(this.form_edit) frm = this.form_edit();
        }else{
            if(this.toolbar_view) tb = this.toolbar_view();
            if(this.form_view) frm = this.form_view();
        }
        return {
          rows:[
           { 
               view: "toolbar", 
               id:"document_toolbar", 
               elements: tb
           },
           {
             view:"form", 
             complexData:true,
             scroll:true,
             id:"document_form",
             elements:frm
            }
         ]}
       }

    // тулбар по умолчанию
    toolbar(){//выводим только кнопку "Закрыть"
        return [
            { view: "button", value:"Закрыть", autowidth:true, click: ()=>{ this.close()} }
        ]}
    // форма по умолчанию
    form(){return []}



    // ***** Common function - ПРЕДОПРЕДЕЛЕННЫЕ\ВНУТРЕННИЕ функции для форм *****

    //####################
    async save(){ // Сохранить текущий документ
        $$("document_form").save()   
    }

    //####################
    close(){ // Закрыть текущий документ и перейти в передыдущую вьюшку
        const vw = webix.storage.local.get("parentView");
        if (vw){
            this.show(vw.url).then(()=>{
                const tbl = $$("documents_table_view")
                const oal = tbl.attachEvent("onAfterLoad", ()=>{
                    //console.log(vw)
                    tbl.detachEvent(oal)
                    if(vw.state){
                        tbl.setState(vw.state)
                    }

                })
            })
            

        }else{
            this.show("view?db="+this.getParam("db"))
        }
            
    }

    //####################
    async edit(){ // перевести текущий документ в режим правки
        const app = this.app;
        const url = app.getUrlString();
        //console.log(url)
        await app.show(url.slice(0,url.lastIndexOf('/')))
        app.show(url+"&edit=1")
    }
}

//############################################################################################################
// *********** VIEW ******************
export class mView extends JetView{
	config(){
        const db = this.getParam("db");
        //console.log(db)
        return { rows:[
			{ view: "toolbar", id:"subapp_users_toolbar", elements: this.toolbar()
			},
			{
				id: "documents_table_view",
				view: "datatable",
				select:"row",
                columns: this.columns(),
                scroll:"y",
                // Автоподгрузка данных (start\count)
                datafetch:20,//default
                loadahead:20,
                datathrottle: 500, // Итервал запроов - для пропуска при быстром скролинге
                // грузим данные
                url: this.url(),
                // Обработчик для открытия документов
				on:{
					"onItemDblClick": (id)=>{
                        const tbl = $$("documents_table_view"); 
						let _id = tbl.getItem(id)._id || tbl.getItem(id)['@unid'];
                        //webix.message("Open user by ID:"+_id)
                        webix.storage.local.put("parentView", {
                            url: this.getUrlString(),
                            curId: _id,
                            state: tbl.getState()
                        })
						this.show("../doc?db="+db+"&id="+_id)
					}
				}
			}
		]}
        }

//******************************************
    toolbar(){
        return []
    }

    columns(){
        return []
    }

    url(){
        return ""
    }

};

//############################################################################################################
