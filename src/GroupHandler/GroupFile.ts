import {} from 'koishi-plugin-markdown-to-image-service';
import PostHandler from "../PostHandler/_index";

async function getGroupFiles(session,num) {
  const fileobjarr = await PostHandler.postcat.getGroupFiles(session,num);
  return fileobjarr;
}

async function removeGroupFile(session,num,fileArray) {

  /*
  interface removeFileMsg {
    statemsg: string,
    fileName: string
  }
  let stateobj: removeFileMsg[] = [];
  */

  const groupId = await session.channelId;
  let markdowntable = "| 文件名 | 状态 |\n| :---: | :---: |"
  console.log(num);
  for(let i = 0; i < num; i++) {
    //console.log(fileArray);
    const fileId = fileArray[i].fileId;
    //console.log(fileId);
    const statemsg = await PostHandler.postcat.deleteGroupFile(groupId,fileId);
    //console.log(fileArray[i].fileName);
    //console.log(statemsg);
    markdowntable += `\n| ${fileArray[i].fileName} | ${statemsg} |`
  }

  return markdowntable;
}

const gfile = {getGroupFiles,removeGroupFile};

export default gfile;
