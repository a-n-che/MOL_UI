import {JetView} from "/jet.js";
import {Cabinet} from "/form.js";

async function getdoc(){
    console.log("get doc ");
    try{
        let url = "/api/cabinet"
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
       const doc = await getdoc()
       //console.log(doc)
       if(doc===undefined){
           webix.message("Запрашиваемый документ не найден!");
           return {}
       }

       const dr = new webix.DataRecord(doc)
       let jv = new Cabinet( this.app,"",dr);
       
       return {
           rows:[
               jv
           ]
       }
   }
}