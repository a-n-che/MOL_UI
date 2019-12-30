const dialogBox = async (conf)=>{
    //console.log(conf)
    return new Promise(async (resolve, reject) => {
        // Формируем идентификаторы
        let dlgID = conf.id ? conf.id: webix.uid();//ID окна
        let prev = $$(dlgID);
        if(prev) prev.destructor()

        const formID = webix.uid();//ID формы

        // Формируем дата-рекорд
        let dr = conf.doc
        if(!dr) dr={}//если не передали данных, то создаем пустую заглушку
        //если передали объект, а не датарекорд - преобразуем его в него...
        if(dr.__proto__.name!=='DataRecord') dr = new webix.DataRecord(conf.doc)

        //ищем и загружаем модуль с диалоговой формой
        let url ='';
        if(conf.ctx){//если есть контекст, то выбираем его из "базы"
            let db = conf.ctx; // он либо имя "базы", или обект JetView
            if(typeof(conf.ctx)==='object'){
                //если передали объект JetView, выбираем из url'а параметр тек.базы
                db=conf.ctx.getParam("db")
                if(!db){//если по итогу DB не определеился, то прекращаем с ошибкой....
                    webix.message("Ошибка контекста вызова функции")
                    console.log('Ошибка контекста вызова функции! Контекст:')
                    console.log(conf.ctx)
                    reject(new Error("Ошибка контекста вызова функции")); 
                    return;              
                }
            }
            url = "/app/"+db+"/dialog.js"
        }else{
            //если контекста нет, то ищем в Общих Диалогах
            url = "/commonDialogs.js"
        }
        //console.log(url)
        const m = await getModules(url);
        //console.log(m)
        if(!m) {
            reject(new Error("Ошибка загрузки модуля")); 
            return;
        };
        let dialog = m[conf.form];
        if(!dialog) {
            webix.message("Не найдена форма диалогового окна: "+conf.form)
            reject(new Error("Не найдена форма диалогового окна")); 
            return;
        }
        //console.log(typeof(dialog));
        //если в качестве диалога "фабрика", то вызываем ее...
        if(typeof(dialog)==='function') { 
            dialog = dialog({
                dialigID: dlgID,
                formID: formID,
                src: dr,

                set: (fld,val)=>{
                    const frm = $$(formID)
                    let doc = frm.getValues()
                    doc[fld] = val;
                    frm.setValues(doc)
                }
            }) 
        }

        //------------------------------------------------------------
        // формируем компанент диалогового окна
        let isOK = false;
        const w = webix.ui({
            view:"window",
            move:true,
            position:"center",
            id: dlgID,
            head: conf.title,
            modal:true,
            close:true,
            body: { 
                cols: [
                    {// блок отображения формы
                        view: "form",
                        complexData:true,
                        autoheight: true,
                        width: conf.width,
                        id: formID,
                        elements: dialog, // вот и встроили форму в диалог
                        borderless: true
                    },
                    {// блок кнопок
                        width: 130,//ширина блока
                        rows: [
                            { view: "template", template: "", height: 20, borderless: true },
                            { label: "OK", view: "button", autoheight: false, // Кнопка ОК
                                    click:()=>{ 
                                        isOK = true;
                                        $$(formID).save()//cохраняем датарекорд данные из формы
                                        $$(dlgID).hide()
                                    }},
                            { label: "Отмена", view: "button", autoheight: false, // Кнопка Cancel
                                    click:()=>{ 
                                        $$(dlgID).hide()
                                    }},
                            { view: "template", template: "", borderless: true }
                        ],
                        borderless: true,
                        padding: { right: 5 }
                    }
                ]
            }
        });
        // Выводим окно
        w.show();
        //связываем окно с датарекордом
        $$(formID).bind(dr)

        w.attachEvent("onHide", async ()=>{
            if(isOK) { resolve(dr.data) }
            else {resolve()}
            w.destructor()
        })
    })
}

export default dialogBox;