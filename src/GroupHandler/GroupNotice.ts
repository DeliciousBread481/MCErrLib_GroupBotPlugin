import {} from "koishi"
import PostHandler from "../PostHandler/_index";

/*
async function goinGroup(session,config) {
  let addId;
  let groupId;
  let msg;
  let welcome
  groupId = await session.event.channel.id;
  console.log(config);
  if(groupId == config.groupId){
    groupId = parseInt(groupId);
    addId = await session.event.user.id;
    msg = `[CQ:at,qq=${addId}]`;
    welcome = await config.welcome;
    msg = msg+"\n"+welcome;
    //console.log(addId);
    await session.send(groupId,msg);
    /*
    if(boolban){
      await session.onebot.sendGroupMsg(groupId,
        "本群现已宵禁 有能力解答的人已经睡觉觉咯 你也早点睡吧 将于07:00解除全体禁言 早点睡吧 早晨再来寻求帮助"
      );
    }

  }
}


async function gooutGroup(session,config) {
  let removeId;
  let groupId;
  let msg;
  let goodbye
  groupId = await session.event.channel.id;
  if(groupId == config.groupId){
    groupId = parseInt(groupId);
    removeId = await session.event.user.id;
    goodbye = await config.goodbye;
    msg = msg+"\n"+goodbye;
    //console.log(removeId);
    await session.send(<>111</>)
  }
}
*/

/**
* @brief 自动补发群公告
* @param session
* @param config
* @param msgjson
* @returns
*/
async function sendNotice(session,config) {
  const msgjson = await session.onebot.getMsg(session.messageId);
  const groupId = await msgjson.group_id;
  const notice = await config.notice;
  await session.send("检测到群公告疑似被吞 现重新补发");
  await PostHandler.postcat.sendGroupNotice(groupId,notice);
}

const gnotices = {sendNotice};

export default gnotices

