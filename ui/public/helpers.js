//####################################
//#### Общие и служебные функции #####
//####################################

//####  ФУНКЦИИ ЗАГРУЗКИ МОДУЛЕЙ #####

//####################################
var require = async (url)=>{ // обертка для работы загрузки модулей в WEBIX
    //console.log(url);
    let md = await getModule('/'+url+'.js')
    if (md) {
        return md
    } else {
        return {}
    }
};

//####################################
async function getModule(url){ //загрузка из модуля default функции
    try {
        let mod = await import(url)
        return mod.default
    } catch(e){
        webix.message("Ошибка закрузки модуля: "+url)
        return undefined
    }
}

//####################################
async function getModules(url){ //загрузка из модуля импортируемых функций
    try {
        let mod = await import(url)
        //console.log(mod)
        return mod
    } catch(e){
        webix.message("Ошибка закрузки модуля: "+url)
        return undefined
    }
}
//####################################
//const $ = {}
//####################################

//####################################№
//## ФУНКЦИЯ РАБОТЫ С ДИАЛОВЫМ ОКНОМ ##
//####################################№

getModule('/helpers/dialogs.js').then((m)=> dialogBox = m )
