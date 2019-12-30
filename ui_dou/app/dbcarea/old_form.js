import {mForm} from "/mClasses.js"

class Cabinet extends mForm{
 
  toolbar(){
    return [
      { view: "label", label: this.DataRec.data.LinkContragent.Selector, autowidth:true },
        {},
      { view: "button", value:"Кнопка", autowidth:true, 
        click: async ()=>{
          webix.message("Кнопка 1...");
        }},
      { view: "button", value:"Выход", autowidth:true, 
        click: ()=>{
          webix.message("До свидания");
          window.location.href='/logout'
         }}
       ]
  }

  form(){
    console.log(this.DataRec.data.LinkContragent.Address.Юридический.Город)
    const frm = [
        {
          borderless:true, view:"tabbar", id:"tabbar", multiview:true, options:[
            { value:'Общая информация', id:'AboutView'},
            { value:'Договора', id:'LinkAgreement'},
            { value:'Счета', id:'LinkCounts'},
            { value:'Empty', id:'emptyView'}
          ]
        },
        {
          cells:[
            {
              id:"AboutView",
                rows: [
                { view:"text", label:"Организация", labelWidth:150, name:"LinkContragent.FullName", readonly:true},
                { view:"fieldset", label:"Руководитель", body:{
                  rows:[
                      { view:"text", label:"Фамилия И.О", labelWidth:150, name:"LinkContragentBoss.FullName", readonly:true},
                      { view:"text", label:"Должность", labelWidth:150, name:"LinkContragentBoss.FullPost", readonly:true},
                      { view:"text", label:"На основании", labelWidth:150, name:"LinkContragentBoss.ДействуетНаОсновании", readonly:true}
                    ]}},
                { view:"fieldset", label:"Юридический адрес", body:{
                  rows:[
                    { view:"text", label:"Индекс", labelWidth:150, name:"LinkContragent.Address.Юридический.Индекс", readonly:true},
                    { view:"text", label:"Страна", labelWidth:150, name:"LinkContragent.Address.Юридический.Страна", readonly:true},
                    { view:"text", label:"Регион", labelWidth:150, name:"LinkContragent.Address.Юридический.Регион", readonly:true},
                    { view:"text", label:"Город", labelWidth:150, name:"LinkContragent.Address.Юридический.Город", readonly:true},
                    { view:"text", label:"Улица", labelWidth:150, name:"LinkContragent.Address.Юридический.Улица", readonly:true}
                  ]}},
                { view:"fieldset", label:"Связь", body:{
                  rows:[
                      { view:"text", label:"Email", labelWidth:150, name:"LinkContragent.Email", readonly:true},
                      { view:"text", label:"Телефон", labelWidth:150, name:"LinkContragent.Phone.Секретарь", readonly:true},
                    ]}},
                { view:"fieldset", label:"Реквизиты", body:{
                  rows:[
                       { view:"text", label:"ИНН", labelWidth:150, name:"LinkContragent.INN", readonly:true},
                       { view:"text", label:"КПП", labelWidth:150, name:"LinkContragent.KPP", readonly:true},
                       { view:"text", label:"ОГРН", labelWidth:150, name:"LinkContragent.OGRN", readonly:true}
                     ]}},  
                { view:"fieldset", label:"Банк", body:{
                  rows:[
                        { view:"text", label:"FaceAccount", labelWidth:150, name:"LinkContragentBank.FaceAccount", readonly:true},
                        { view:"text", label:"Operator", labelWidth:150, name:"LinkContragentBank.Operator", readonly:true},
                        { view:"text", label:"Name", labelWidth:150, name:"LinkContragentBank.Name", readonly:true},
                        { view:"text", label:"City", labelWidth:150, name:"LinkContragentBank.City", readonly:true},
                        { view:"text", label:"Selector", labelWidth:150, name:"LinkContragentBank.Selector", readonly:true},
                        { view:"text", label:"Account", labelWidth:150, name:"LinkContragentBank.Account", readonly:true},
                        { view:"text", label:"БИК", labelWidth:150, name:"LinkContragentBank.BIK", readonly:true}
                      ]}},
              ]
            },
            {
              id:"LinkAgreement", rows:[
                { view:"datatable", name:"LinkAgreement", //width: 820,
                  columns:[
                    { id:"Selector", header:"Название", width:215},
                    { id:"Subject",  header:"Тема", width:800},
                    { id:"Status",   header:"Состояние",   width:100}
                  ],
                data: this.DataRec.data.LinkAgreement
        
            }
              ]},
            {id:"LinkCounts", rows:[
              { view:"datatable", name:"LinkCounts",
                columns:[
                  { id:"Selector", header:"Название", width:220},
                  { id:"ExecutionType", header:"Тип", width:180},
                  { id:"Sum",      header:"Сумма",      width:70 },
                  { id:"NDS",      header:"НДС",      width:70 },
                  { id:"Status",   header:"Состояние",   width:100}
                ],
                data: this.DataRec.data.LinkCounts
              }                
            ]},

            {id:"emptyView", template:" "}
          ]
        }
      ]

  return frm
  }
}


// ************* EXPORT BLOCK ****************
export default Cabinet;
export {Cabinet}