import PostHandler from "../PostHandler/_index";

async function sendGroupMsg(groupId,text) {
  await PostHandler.postcat.sendGroupMsg(groupId,text);
}

async function handleAtMsg(session) {
  let content;
  let atId;
  const len = await session.elements.length;
  for (let i = 0; i < len; i++) {
    if(session.elements[i].type == 'at') {
      atId = await session.elements[i].attrs.id;
    }
    if(session.elements[i].type == 'text') {
      content = await session.elements[i].attrs.content;
    }
  }

  if(content == undefined || atId == undefined) {
    session.send("来人告诉面包 小麦出了点问题~");
  }

  const msgobj = {
    atId: atId,
    content: content
  }

  //console.log(msgobj);

  return msgobj;
}

async function handleMsg(session) {

  const msgobj = {
    type: session.elements[0].type,
    content: session.elements[0].attrs
  }

  return msgobj;
}

const gmsg = {sendGroupMsg,handleAtMsg,handleMsg};

export default gmsg;
