export default {}

webix.protoUI(
    {
      name:"mTextLabel",
        $init:function(config){
            const type = config.border ? "form":"line";
            const lblShadow = config.shadow ?
                     {"background":"#F4f4f4","font-weight":"440","color":"#222"}:
                     "webix_inp_label"
            config.rows = [{
                type:type, 
                //margin:30,
                padding:2, 
                cols: [
                { template:config.label+":", borderless:true, width:150,
                css:lblShadow
                },
                { template:config.value, borderless:true, padding:5, autoheight:true
                }
            ]}]
        }
    },webix.ui.layout);