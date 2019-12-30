const LinkContragent = (conf)=>{
    console.log(conf)
    const phone = (()=>{
        let p = [];
        let c = 0;
        for (let key in (conf.src.data.Phone)){
            p[c]={cols:[
                {view:"text", label:"Телефон", labelWidth:150, name:"Phone.v"+c+".type"},
                {view:"text", label:"", labelWidth:1, name:"Phone.v"+c+".value"}
            ]};
            c++
          }
        return {rows:p}
    })()
    return  [ 
        { view:"textarea", label:"Организация", labelWidth:150, height:75, name:"FullName"},
        { view:"fieldset", label:"Связь", body:{
            rows:[
                { view:"text", label:"Email", labelWidth:150, name:"Email"},
                phone,
                { view:"text", label:"Сайт", labelWidth:150, name:"Web"}
              ]}},
        { view:"fieldset", label:"Реквизиты", body:{
            rows:[
                { view:"text", label:"ИНН", labelWidth:150, name:"INN"},
                { view:"text", label:"КПП", labelWidth:150, name:"KPP"},
                { view:"text", label:"ОГРН", labelWidth:150, name:"OGRN"}
              ]}}

    ]
}


const LinkContragentBoss = (conf)=>{
    return  [ 
        { view:"text", label:"Фамилия И.О", labelWidth:150, name:"LinkContragentBoss.FullName"},
        { view:"text", label:"Должность", labelWidth:150, name:"LinkContragentBoss.FullPost"},
        { view:"text", label:"На основании", labelWidth:150, name:"LinkContragentBoss.ДействуетНаОсновании"}

    ]
}
const LinkContragentAddress = (conf)=>{
    return  [ 
        { view:"text", label:"Индекс", labelWidth:150, name:"LinkContragent.Address.Юридический.Индекс"},
        { view:"text", label:"Страна", labelWidth:150, name:"LinkContragent.Address.Юридический.Страна"},
        { view:"text", label:"Регион", labelWidth:150, name:"LinkContragent.Address.Юридический.Регион"},
        { view:"text", label:"Город", labelWidth:150, name:"LinkContragent.Address.Юридический.Город"},
        { view:"text", label:"Улица", labelWidth:150, name:"LinkContragent.Address.Юридический.Улица"}

    ]
}
const LinkContragentBank = (conf)=>{
    return  [ 
        { view:"text", label:"FaceAccount", labelWidth:150, name:"LinkContragentBank.FaceAccount"},
        { view:"text", label:"Operator", labelWidth:150, name:"LinkContragentBank.Operator"},
        { view:"text", label:"Name", labelWidth:150, name:"LinkContragentBank.Name"},
        { view:"text", label:"City", labelWidth:150, name:"LinkContragentBank.City"},
        { view:"text", label:"Selector", labelWidth:150, name:"LinkContragentBank.Selector"},
        { view:"text", label:"Account", labelWidth:150, name:"LinkContragentBank.Account"},
        { view:"text", label:"БИК", labelWidth:150, name:"LinkContragentBank.BIK"}

    ]
}
const dlg = (conf)=>{
    return  [ 

    ]
}

//--------------------------
export {dlg}
export {LinkContragent}
export {LinkContragentBoss}
export {LinkContragentAddress}
export {LinkContragentBank}