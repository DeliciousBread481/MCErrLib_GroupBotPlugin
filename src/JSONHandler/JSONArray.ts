async function findValue(key,json) {

  const len = json.length;
  let Idstr = ""
  const text = JSON.stringify(json);

  let  pos2 = 0
  for (let i = 0; i < len; i++) {
    let  pos1 = text.indexOf(`${key}`,pos2) + 11;
    pos2 = text.indexOf(",",pos1);
    //console.log(pos1,pos2);
    //console.log(text.substring(pos1,pos2));
    Idstr = Idstr + text.substring(pos1,pos2) + "+";
    //console.log(Idstr);
  }

  return Idstr;
  
}

const jarr = {findValue};

export default jarr;