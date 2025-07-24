import PostHandler from "../PostHandler/_index";
import GroupHandler from "./_index";

async function Curfew(groupId,boolban) {
  await PostHandler.postcat.setGroupWholeBan(groupId,boolban);
  if(!boolban){
    await GroupHandler.gmsg.sendGroupMsg(groupId,
    "本群现已宵禁 有能力解答的人已经睡觉觉咯 你也早点睡吧 将于早上七点解除全体禁言 早点睡吧 早晨再来寻求帮助");
  }
}

const gcurfew ={Curfew};

export default gcurfew;