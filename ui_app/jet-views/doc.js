import {JetView} from "/jet.js";

async function getdoc(db, id){
    //console.log("get doc "+id);
    try{
        let url = "/api/doc?db="+db
        if(id) url=url+"&id="+id;
        const ret = await webix.ajax().get(url)
        let data = ret.json()
        if(data===null) data={};
        return data
    } catch(e){
        console.log(e) 
        return undefined
    }
}


export default class DocView extends JetView{

     async config(){
        const id = this.getParam("id");
        const db = this.getParam("db");
        let em = this.getParam("edit")
       // console.log(em)
        const EditMode = (em==="1") ? true : ((em==="true") ? true : false);
        //console.log(EditMode)
        const doc = await getdoc(db, id)
        //console.log(doc)
        if(doc===undefined){
            webix.message("Запрашиваемый документ не найден!");
            return {}
        }

        const dr = new webix.DataRecord(doc)
        dr.attachEvent("onChange", (obj)=>{
            //Обработчик сохранения документа
            //webix.message("Update DataRecord");
            //console.log(dr.data)
            let url = "/api/doc?db="+db
            if(id) url=url+"&id="+id
            webix.ajax().post(url, dr.data)
            .then( (ret)=> {
                //console.log(ret.json());
                webix.message("Документ сохранен");
            })
            .catch((err)=>{
              webix.message("Ошибка сохранения документа");
              console.log(err);
            })
        });

        const uri = "/app/"+db+"/form.js"
        let form = ""
        if(doc._form) {
            const m = await getModules(uri);
            form = m[doc._form]
        }else{
            form = await getModule(uri);
        }
        
        let jv = {}
        if(form){
            jv = new form( this.app,"",dr, EditMode);
        }
        
        return {
            rows:[
                jv
            ]
        }
    }
}