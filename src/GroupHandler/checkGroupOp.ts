async function checkOp(session,config) {
  for(let i = 0; i < config.op.length; i++){
    //console.log("now"+session.author.id);
    //console.log("config:"+config.op[i].Id);
    if(session.author.id == config.op[i].Id){
      if(config.op[i].Level == 1){
        return 1;
      }else if(config.op[i].Level == 2){
        return 2;
      }
    }
  }
  return 0;
}

const gop ={checkOp};

export default gop;
