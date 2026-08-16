require('dotenv').config()

module.exports = {
  /**
   * return a button receiving type, shape, destination and the text button
   * props examples
   * {
   *    'link' : https://enlaceaotrolado.com/blablabla
   *    'destination' : 'view_alert/1120'
   *    'other' : can use html or css properties like disabled="disabed" OR style="display:cursor"
   * }
   */
    boton(props){
        let laLiga = "", otherProperties = ""

        if(props.hasOwnProperty('destination') && props.destination != ""){
            laLiga = ' href="'+process.env.APP_API_FRONT+'/'+props.destination+'" '
        }

        if(props.hasOwnProperty('link') && props.link != ""){
            laLiga = ' href="'+props.link+'" '
        }

        if(props.hasOwnProperty('other') && props.other != ""){
            otherProperties = ' '+ props.other +' '
        }

        
        var typeButton = {background:'#2C7695',color:'#FFFFFF'}  
        switch(props.type){
            case 'success': 
                typeButton = { background:'#37BC98', color:'#FFFFFF'}
            break;
            case 'warn': 
                typeButton =  {background:'#FBB919', color:'#333333'}
            break;
            case 'error': 
                typeButton =  {background:'#DA4453', color:'#FFFFFF'}
            break;
            case 'info': 
                typeButton =  {background:'#2C7695', color:'#FFFFFF'}
            break;
            default: 
                typeButton = {background:'#2C7695', color:'#FFFFFF'}
            break;
        }
        var shapeButton = ' border-radius:1px; '
        switch(props.shape){
            case 'round': 
                shapeButton = ' border-radius:25px; '
            break;
            case 'square': 
                shapeButton =  ' border-radius:4px; '
            break;
            case 'fit': 
                shapeButton =  ' border-radius:2px; '
            break;
            default: 
                shapeButton = ' border-radius:1px; '
            break;
        }

        return (`<a ${laLiga} ${otherProperties} 
        style="margin:5px;padding:15px 30px; ${shapeButton} background-color: ${typeButton.background};color: ${typeButton.color} ;
        display:inline-block;font-family:Arial,sans-serif;font-size:13pt;font-weight:normal;line-height:120%;
        text-decoration:none;text-transform:none;"
        target="_bank">${props.text}</a>`);
    }
}
