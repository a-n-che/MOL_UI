import {mView} from "/mClasses.js";

class UserAll extends mView{
    toolbar(){
        return [
            { view: "label", label: "Пользователи", width:200 }
            ]
    }

    columns(){
        return [
            {id:"FullName", header:["Имя сотрудника", {content:"textFilter"}], fillspace:true, sort:"string"},
            {id:"FullPost", header:["Должность", {content:"textFilter"}], fillspace:true},
            {id:"Phones", header:["Телефон"], width:120},
            {id:"RoomAddress", header:["Кабинет"], width:100}
        ]
    }

    url(){
        return "api/getview?db=dbstructure&view=postbyemployee"
    }

};

export default UserAll;
export {UserAll as alluser}
