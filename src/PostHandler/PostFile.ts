import axios from "axios";
import fs from 'fs';
import path from 'path';
import PostHandler from "./_index";

async function PostFileInfo(fileName) {
  let specific_file = []
  if(fileName.includes("minecraft-exported-crash-info")) {
    specific_file = [
      "crash-","minecraft.log","latest.log","hmcl.log","hs_err_pid"
    ]
  }
  if(fileName.includes("错误报告-")) {
    specific_file = [
      "crash-","游戏崩溃前的输出.txt","latest.log","PCL 启动器日志.txt","hs_err_pid"
    ]
  }

  const data = JSON.stringify({
    "file_name": fileName,
    "specific_file": specific_file
  })

  const config = {
    method: 'post',
    url: 'http://localhost:5000/file_info',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  }

  axios(config)
  .then(function (response) {
    console.log(response.data)
  })
  .catch(function (error) {
    console.log(error)
  })
}

async function downloadFile(session,fileId,fileName) {
  const savePath = `F:/MC-Report/file-temp/${fileName}`;
  try{
    console.log("下载文件：");
    const url = await PostHandler.postcat.getGroupFileURL(session,fileId,fileName);

    const response = await axios.get(url, {
      responseType: 'arraybuffer'
    });

    const fileBuffer = Buffer.from(response.data, 'binary');

    const directory = path.dirname(savePath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    console.log(fileBuffer)
    fs.writeFileSync(savePath, fileBuffer);

    console.log(`文件下载成功并保存到：${savePath}`);
  } catch (error) {
    console.error('文件下载失败:', error);
  }
}


const postfile = {
  PostFileInfo,downloadFile
}

export default postfile;
