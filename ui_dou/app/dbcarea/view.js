import {mView} from "/mClasses.js";

class UserAll extends mView{
    toolbar(){
        return [
            { view: "label", label: "Пользователи", width:200 },
            { view: "icon", icon: "mdi mdi-account", click: ()=>{
                    webix.message("Make New Users");
                    this.show("doc?db=USERS&edit=1")
                }}
            ]
    }

    columns(){
        return [
            {id:"username", header:["Имя пользователя", {content:"textFilter"}], fillspace:true, sort:"string"},
            {id:"login", header:["LoginName", {content:"textFilter"}], width:200}
        ]
    }

    url(){
        return "/api/getview?db=USERS&view=ALL"
    }

};

export default UserAll;
export {UserAll as alluser}
