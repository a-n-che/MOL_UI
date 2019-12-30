import {JetView} from "/jet.js";
import {Cabinet} from "/form.js";
//import {mForm} from "/mClasses.js"

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
       this.formCabinet = new Cabinet( this.app,"",dr);
       
       return {
           rows:[
            this.formCabinet
           ]
       }
   }

   ready(view){
    //webix.message("App run");
   /* const data = this.formCabinet.DataRec.data;

    // подключаем клики на диалоги запросов измения данных
    // Котрагент
    let y = document.getElementById('bossDBox');
    y.addEventListener( 'click', async (event) => {
      //console.log(data)
      let doc = data.LinkContragentBoss;
      console.log(doc)  
      let ret = await dialogBox({
         ctx: "dbcarea",
         form:"LinkContragentBoss", 
         title:"Организация", 
         width: 900,
         doc: doc
       })
      //webix.message("Диалог закрыт")
      console.log(ret)
    } );
/*
    // Юридический адрес
    let y = document.getElementById('lawAddrDBox');
    y.addEventListener( 'click', async (event) => {
      //console.log(data)
      let doc = data.LinkContragent;
      //console.log(doc.Phone)  
      let ret = await dialogBox({
         ctx: "dbcarea",
         form:"LinkContragentAddress", 
         title:"Адрес", 
         width: 900,
         doc: doc
       })
      //webix.message("Диалог закрыт")
      console.log(ret)
    } );

    // 
    /*let y = document.getElementById('orgDBox');
    y.addEventListener( 'click', async (event) => {
      //console.log(data)
      let doc = data.LinkContragent;
      //console.log(doc.Phone)  
      let ret = await dialogBox({
         ctx: "dbcarea",
         form:"LinkContragent", 
         title:"Организация", 
         width: 900,
         doc: doc
       })
      //webix.message("Диалог закрыт")
      console.log(ret)
    } );

    // 
    let y = document.getElementById('orgDBox');
    y.addEventListener( 'click', async (event) => {
      //console.log(data)
      let doc = data.LinkContragent;
      //console.log(doc.Phone)  
      let ret = await dialogBox({
         ctx: "dbcarea",
         form:"LinkContragent", 
         title:"Организация", 
         width: 900,
         doc: doc
       })
      //webix.message("Диалог закрыт")
      console.log(ret)
    } );*/


   }
}