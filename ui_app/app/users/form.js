import {mForm} from "/mClasses.js"

class UserEdit extends mForm{
 
  toolbar_view(){
    return [
          { view: "button", value:"Закрыть", autowidth:true, 
          click: ()=>{
            this.close()
           }},
           { view: "button", value:"Правка", autowidth:true, 
           click: async ()=>{
             this.edit();
           }},
           { view: "button", value:"test DLG", autowidth:true, 
           click: async ()=>{
             console.log(this.DataRec.data)
             let ret = await dialogBox({
                ctx:this,
                form:"dlg", 
                title:"Test", 
                //width: 700,
                doc:this.DataRec//.data
              })
             //webix.message("Диалог закрыт")
             console.log(ret)
           }},
        {},
        { view: "label", label: "Пользователь", width:200 }
       ]
  }
  toolbar(){
    return [
        { view: "button", value:"Сохранить", autowidth:true, 
          click: async ()=>{
            //webix.message("Save...");
            await this.save()
            //this.show("view?db=users&id=alluser")
            this.close()
          }},
          { view: "button", value:"Отменить", autowidth:true, 
          click: ()=>{
            //webix.message("Cancel...");
            //this.show("view?db=users&id=alluser")
            this.close()
           }},
        {},
        { view: "label", label: "Пользователь", width:200 }
       ]
  }

  form_edit(){
    return [

      { view:"text", label:"Имя пользователя", labelWidth:150,  name:"username"},
      { view:"text", label:"Login", labelWidth:150, name:"login"},
     // { view:"text", label:"Test:", labelWidth:80, name:"test"},
      { view:"text", type:"password", label:"Пароль", labelWidth:150, name:"password"}

     ]
  }
  form_view(){
    return [

      { view:"text", label:"Имя пользователя", labelWidth:150,  name:"username", readonly:true},
      { view:"text", label:"Login", labelWidth:150, name:"login", readonly:true}

     ]
  }
}


// ************* EXPORT BLOCK ****************
export default UserEdit;
export {UserEdit}