const dlg = (conf)=>{
    //console.log(conf)
    return  [ 
        /*{ label: "test", view: "button", autoheight: true, // Кнопка ОК
        click:()=>{ 
            conf.set('password', '1234567890')

        }},*/
        { view:"text", width: 900, label:"Имя:", labelWidth:80,  name:"username"},
        { view:"text", label:"Login:", labelWidth:80, name:"login"},
        //{ view:"text", label:"Test:", labelWidth:80, name:"test"},
        { cols:[
            { view:"label", label:"Pass:", width:80, align:"left"}, 
            { view:"label", name:"password", align:"left"}
        ]}/*,
        { cols:[
            { view:"label", label:"TEMP:", width:80}, 
            { view:"label", name:"temp"}
        ]}*/

    ]
}



//--------------------------
export {dlg}