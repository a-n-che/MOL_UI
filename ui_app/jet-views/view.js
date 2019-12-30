import {JetView} from "/jet.js";

export default class TopView extends JetView{

     async config(){
        const id = this.getParam("id");
        const db = this.getParam("db");
		let view = ""

		if(db){
        	const uri = "/app/"+db+"/view.js"
        	if(id) {
            	const m = await getModules(uri);
            	view = m[id]
      	  	}else{
        	    view = await getModule(uri);
       		}
		}
		//console.log(view)
        let jv = {}
        if(view){
            jv = new view( this.app,"");
		}
        return {
            rows:[
                jv
            ]
        }
    }
}