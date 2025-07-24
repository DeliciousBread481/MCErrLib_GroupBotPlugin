import { Context } from "koishi";
import PostHandler from "../PostHandler/_index";

async function banUser(groupId,atId) {
  //await Context.Database.get("GroupBan",[])
  await PostHandler.postcat.setGroupBan(groupId,atId);
}

const gban = {banUser};

export default gban;
