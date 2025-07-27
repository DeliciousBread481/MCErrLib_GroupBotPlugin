import axios from 'axios';

async function sendGroupNotice(groupId,notice) {

  const data = JSON.stringify({
    "group_id": groupId,
    "content": notice,
    "pinned": 1,
  })

  const config = {
    method: 'post',
    url: 'http://0.0.0.0:3001/_send_group_notice',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  }

  axios(config)
  .then(function (response) {
    console.log("已发送群公告")
  })
  .catch(function (error) {
    console.log(error)
  })

}


/**
 * @brief 获取群公告数据
 * @param session
 */
async function checkNotices(session) {
  let getdata;

  const data = JSON.stringify({
    "group_id":session.channelId
  });

  const config = {
    method:'post',
    url:'http://0.0.0.0:3001/_get_group_notice',
    headers:{
      'Content-Type':'application/json'
    },
    data:data
  };

  await axios(config)
  .then(function (response) {
    //console.log(JSON.stringify(response.data));
    getdata = response.data.data;
  })
  .catch(function (error) {
    console.log(error);
  })

  return getdata;
}

/**
 * @brief 获取禁言列表
 * @param session
 */
async function getGroupBan(session) {
  let backdata;

  const data = JSON.stringify({
    "group_id":session.channelId
  })

  const config = {
    method:'post',
    url:'http://127.0.0.1:3001/get_group_shut_list',
    headers:{
      'Content-Type':'application/json'
    },
    data:data
  }

  await axios(config)
  .then(function (response) {
    backdata = response.data.data;
  })
  .catch(function (error) {
    console.log(error);
  })

  return backdata;
}

/**
 * @brief 设置全体禁言
 * @param session
 * @param boolban
 */
async function setGroupWholeBan(groupId,boolban) {
  let data;
  if(boolban){
    data = JSON.stringify({
      "group_id":groupId,
      "enable":false
    })
  }else{
    data = JSON.stringify({
      "group_id":groupId,
      "enable":true
    })
  }

  const config = {
    method:'post',
    url:'http://127.0.0.1:3001/set_group_whole_ban',
    headers:{
      'Content-Type':'application/json'
    },
    data:data
  }

  await axios(config)
  .then(function (response) {
    if(boolban){
      console.log("已关闭全员禁言")
    }else{
      console.log("已开启全员禁言")
    }
  })
  .catch(function (error) {
    console.log(error);
  })

}


async function sendGroupMsg(groupId,text) {

  const data = JSON.stringify({
    "group_id": groupId,
    "message": [
      {
        "type": "text",
        "data": {
          "text": text
        }
      }
    ]
  });

  const config = {
    method: 'post',
    url: 'http://127.0.0.1:3001/send_group_msg',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  };

  await axios(config)
  .then(function (response) {
    console.log("发送消息："+`${text}}`);
  })
  .catch(function (error) {
    console.log(error);
  })
}

async function setGroupBan(groupId,userId) {

  const data = JSON.stringify({
    "group_id": groupId,
    "user_id": userId,
    "duration": 180
  })

  const config = {
    method: 'post',
    url: 'http://127.0.0.1:3001/set_group_ban',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  }

  await axios(config)
  .then(function (response) {
    console.log("已禁言："+`${userId}`);
  })
  .catch(function (error) {
    console.log(error);
  })
}

async function getGroupFiles(session,num) {
  let back = [];

  const data = {
    "group_id": session.channelId,
    "file_count": num
  }

  const config = {
    method: 'post',
    url: 'http://127.0.0.1:3001/get_group_root_files',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  }

  await axios(config)
  .then(function (response) {
    //console.log("获取文件：\n");
    console.log(response.data.data.files[0]);
    //console.log(response.data);
    const len = response.data.data.files.length;
    for (let i = 0; i < len; i++) {
      //console.log("一次");
      back.push({
        fileId: response.data.data.files[i].file_id,
        fileName: response.data.data.files[i].file_name
      });
    }
  })
  .catch(function (error) {
    console.log(error);
  })

  return back;
}

async function getGroupFileURL(session,fileId,fileName) {
  let callback = "";
  const data = {
    "group_id": session.channelId,
    "file_id": fileId
  }

  const config = {
    method: 'post',
    url: 'http://127.0.0.1:3001/get_group_file_url',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  }

  await axios(config)
  .then(function (response) {
    //console.log(response.data.data.url);
    callback = response.data.data.url;
  })
  .catch(function (error) {
    console.log(error);
  })

  callback += fileName;
  //console.log(callback);

  return callback;
}

async function downloadGroupFile(session,fileId,fileName) {
  console.log("下载文件：");
  const url = await getGroupFileURL(session,fileId,fileName);
  console.log(url);
  const data = JSON.stringify({
    "url": url
  })

  const config = {
    method: 'post',
    url: 'http://127.0.0.1:3001/download_file',
    headers: {
      'Content-Type': 'application/json'
    },
    data : data
  }

  await axios(config)
  .then(function (response) {
    console.log("已将文件保存至："+`${response.data.data.file}`);
  })
  .catch(function (error) {
    console.log(error);
  })
}

async function deleteGroupFile(groupId,fileId) {
  let errmsg;
  let successFile;
  let status
  const data = {
    "group_id": groupId,
    "file_id": fileId
  }

  const config = {
    method: 'post',
    url: 'http://127.0.0.1:3001/delete_group_file',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  }

  await axios(config)
  .then(function (response) {
    errmsg = response.data.message;
    status = response.data.status;
  })
  .catch(function (error) {
    console.log(error);
  })


  if(status != "ok"){
    return errmsg;
  }else{
    console.log("成功删除文件");
    //console.log(successFile);
    return "ok"
  }

}

async function checkGroupBan(groupId) {
  const data = {
    "group_id": groupId
  }

  const config = {
    method: 'post',
    url: 'http://127.0.0.1:3001/get_group_shut_list',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  }

  let state;
  await axios(config)
  .then(function (response) {
    state = response.data.data;
    /*
    if(response.data.data.length > 5){
      state = true;
    }else{
      state = false;
    }
      */
  })
  .catch(function (error) {
    console.log(error);
  })

  return state;

}


const postcat = {
  sendGroupNotice,
  checkNotices,
  getGroupBan,
  setGroupWholeBan,
  sendGroupMsg,
  setGroupBan,
  getGroupFiles,
  getGroupFileURL,
  downloadGroupFile,
  deleteGroupFile,
  checkGroupBan
};

export default postcat;
