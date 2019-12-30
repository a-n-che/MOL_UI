import {mForm} from "/mClasses.js"

class Cabinet extends mForm{
 
  toolbar(){
    return [
      { view: "label", label: this.DataRec.data.LinkContragent.Selector, autowidth:true },
        {},
      { view: "button", value:"Кнопка", autowidth:true, 
        click: async ()=>{
          let doc = this.DataRec.data.LinkContragent;
          console.log(doc.Phone)  
          let ret = await dialogBox({
             ctx: "dbcarea",
             form:"LinkContragent", 
             title:"Организация", 
             width: 900,
             doc: doc
           })
          //webix.message("Диалог закрыт")
          console.log(ret)
        }},
      { view: "button", value:"Выход", autowidth:true, 
        click: ()=>{
          webix.message("До свидания");
          window.location.href='/logout'
         }}
       ]
  }

  form(){
    //console.log(this.DataRec.data.LinkContragent.Address.Юридический.Город)
    const d = this.DataRec.data;
    //Переобразуем телефоны.....
    if(d.LinkContragent.Phone){
      let p = {};
      let c=0;
      for (let key in (d.LinkContragent.Phone)){
        p["v"+c++]={"type":key, "value":d.LinkContragent.Phone[key]}
      }
      d.LinkContragent.Phone = p   
    }
    //console.log(d.LinkContragent.Phone)

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
                { view:"mTextLabel", label:"Организация", value: d.LinkContragent.FullName,border:1},
                {height:10},
                { view:"fieldset", label:"Руководитель <span id='bossDBox' class='webix_icon wxi-pencil'></span>", body:{ //style='color:blue'
                  rows:[
                      { view:"mTextLabel", label:"Фамилия И.О", value: d.LinkContragentBoss.FullName},
                      { view:"mTextLabel", label:"Должность", value: d.LinkContragentBoss.FullPost,borderless:true},
                      { view:"mTextLabel", label:"На основании", value: d.LinkContragentBoss.ДействуетНаОсновании,borderless:true}
                    ]}},
                { view:"fieldset", label:"Юридический адрес <span id='lawAddrDBox' class='webix_icon wxi-pencil'></span>", body:{
                  rows:[
                    { view:"mTextLabel", label:"Индекс", value: d.LinkContragent.Address.Юридический.Индекс},
                    { view:"mTextLabel", label:"Страна", value: d.LinkContragent.Address.Юридический.Страна},
                    { view:"mTextLabel", label:"Регион", value: d.LinkContragent.Address.Юридический.Регион},
                    { view:"mTextLabel", label:"Город", value: d.LinkContragent.Address.Юридический.Город},
                    { view:"mTextLabel", label:"Улица", value: d.LinkContragent.Address.Юридический.Улица}
                  ]}},
                { view:"fieldset", label:"Связь <span id='connectDBox' class='webix_icon wxi-pencil'></span>", body:{
                  rows:[
                      { view:"mTextLabel", label:"Email", value: d.LinkContragent.Email},
                      { view:"mTextLabel", label:"Телефон", value: d.LinkContragent.Phone.Секретарь},
                    ]}},
                { view:"fieldset", label:"Реквизиты <span id='rekDBox'class='webix_icon wxi-pencil'></span>", body:{
                  rows:[
                       { view:"mTextLabel", label:"ИНН", value: d.LinkContragent.INN},
                       { view:"mTextLabel", label:"КПП", value: d.LinkContragent.KPP},
                       { view:"mTextLabel", label:"ОГРН", value: d.LinkContragent.OGRN}
                     ]}},  
                { view:"fieldset", label:"Банк <span id='bankDBox'class='webix_icon wxi-pencil'></span>", body:{
                  rows:[
                        { view:"mTextLabel", label:"FaceAccount", value: d.LinkContragentBank.FaceAccount},
                        { view:"mTextLabel", label:"Operator", value: d.LinkContragentBank.Operator},
                        { view:"mTextLabel", label:"Name", value: d.LinkContragentBank.Name},
                        { view:"mTextLabel", label:"City", value: d.LinkContragentBank.City},
                        { view:"mTextLabel", label:"Selector", value: d.LinkContragentBank.Selector},
                        { view:"mTextLabel", label:"Account", value: d.LinkContragentBank.Account},
                        { view:"mTextLabel", label:"БИК", value: d.LinkContragentBank.BIK}
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

            {id:"emptyView",   rows:[
              {view: 'mTextLabel', label:"111", value:this.DataRec.data.LinkContragent.FullName, shadow:1},
              {view: 'mTextLabel', label:"222", value:"Value 2",borderless:true, shadow:1},
              {view: 'mTextLabel', label:"333", value:"Value 3 dsf dsm fds mflmdsl ldsmlmdlmfldsmfld mlmdlmfdlsmflds mlfdm lkfm lfmldkmlkdsm lfdm lmfdlmfldmfldmfldmflmdslk mfldmflmdlfm ldk mflk lk mdlksm flkdmslkmfldksmflkdm fldsmfldmslsm ldmslfmdlsm fldsmlfmd"},
              {view: 'mTextLabel', label:"444", value:"Value 4", borderless:false},
              {view: 'label', label:"5555", value:"Value 555 ;lf kg;lk;glfdg;lfk ; gkf;lg kl; fkg; flkg;lk fg;l fkg; kf;gl kdf; gkf;l gk;fl kg;flk g;f kg; fk;l gkf;l gkf;ldk gfl; kg;l kf;lgkf;l gk;fl gkl;fk gl;fk g;lfk gl;k f;l gkdfl;kg;lfkdgl; k;fld gkfl; dkg;lf kgl;kf;lg kdfl;kg;dfk g;lfk;gl kf;l gk;fl kgl;f kg;lf kgl; fkl;gk dfl;k gfl;k gl;fk l;gkf ;gkf;l kg;fkg;kgl;f 000000000000000000000000000000000000000000000000"}
            ]}
          ]
        }
      ]

  return frm
  }
}


// ************* EXPORT BLOCK ****************
export default Cabinet;
export {Cabinet}