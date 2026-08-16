require('dotenv').config()

module.exports = {
    headStyle: (props)=>{
        switch(props.type){
            default:
                return ({
                    fill: {type: 'pattern',patternType: props.pattern||'solid',fgColor: props.fgcolor||'#2C7695'},
                    font: {
                        name: props.fontname || 'Calibri',
                        color: props.fontcolor||'#FFFFFF',
                        alignment:{wrapText: true,horizontal:'center'},
                        bold: true,
                        alignment:{
                            vertical:'baseline',
                            horizontal:'center'
                        },
                        size: 11,
                    },
                    border:{
                        left:{color: 'black',style: "thin" },
                        right:{color: 'black',style: "thin" },
                        top:{color: 'black',style: "thin" },
                        bottom:{color: 'black',style: "thin" }
                    },
                })
            break;
        }
    },
    generalStyle:(props)=>{
        switch(props.type){
            default:
                return ({
                    font: {
                        name: props.fontname || 'Calibri',                        
                        color: '#222222',
                        alignment:{wrapText: true},
                        bold: false,
                        size: 10,
                    },
                    border:{
                        left:{color: 'black',style: "thin" },
                        right:{color: 'black',style: "thin" },
                        top:{color: 'black',style: "thin" },
                        bottom:{color: 'black',style: "thin" }
                    },
                })
            break;
        }
    },
}