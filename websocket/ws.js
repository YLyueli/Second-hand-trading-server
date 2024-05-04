const db = require('../db/index')
const wss = require('../app')

wss.on('connection', function connection (ws) {
  console.log('连接成功...')
  //监听客户端发送得消息
  ws.on('message', (data) => {
    console.log('来自客户端得message:', typeof JSON.parse(data), JSON.parse(data))
    const dataInfo = JSON.parse(data)
    if (dataInfo.type === 'clientId')
    {
      ws.client_id = dataInfo.id
      return
    }
    if (dataInfo.type === 'historycomment')
    {
      const sql = `SELECT comment_id,comment.user_id,comment.receive_user_id, content, time, u1.user_img, u1.user_name, u2.user_name name, group_id FROM
      COMMENT LEFT JOIN USER u1 ON u1.user_id = COMMENT.user_id
      LEFT JOIN USER u2 ON u2.user_id = COMMENT.receive_user_id  where commodity_id = ? `
      db.query(sql, dataInfo.commodity_id, (err, res) => {
        console.log("查看所有评论：", res);
        if (res != null)
        {
          ws.send(JSON.stringify(res))
        }
      })
      return
    }
    if (dataInfo.type === 'comment')
    {
      const sql = "insert into comment set ?"
      const sqll = `SELECT comment_id,comment.user_id,comment.receive_user_id, content, time, u1.user_img, u1.user_name, u2.user_name name, group_id FROM
      COMMENT LEFT JOIN USER u1 ON u1.user_id = COMMENT.user_id
      LEFT JOIN USER u2 ON u2.user_id = COMMENT.receive_user_id where comment.user_id=? and content=? and time=?`
      let msgInfo = {
        user_id: dataInfo.user_id,
        receive_user_id: dataInfo.receive_user_id,
        content: dataInfo.content,//发送的消息
        commodity_id: dataInfo.commodity_id,
        time: dataInfo.time,
        group_id: dataInfo.group_id
      }
      db.query(sql, msgInfo, function (err, res) {
        console.log('插入一条评论:', res);
        db.query(sqll, [msgInfo.user_id, msgInfo.content, msgInfo.time], (err, res) =>{
          console.log("查看插入评论的id", res);
          if (res != null)
          {
            msgInfo = {
              comment_id: res[0].comment_id,
              user_id: dataInfo.user_id,
              receive_user_id: dataInfo.receive_user_id,
              content: dataInfo.content,//发送的消息
              commodity_id: dataInfo.commodity_id,
              time: dataInfo.time,
              user_name: res[0].user_name,
              user_img: res[0].user_img,
              group_id: res[0].group_id,
              name: res[0].name,
            }
            wss.clients.forEach(function each (client) {
              client.send(JSON.stringify([msgInfo]))
            }) 
          }
        })

      })

      return
    }

    if (dataInfo.type === 'history')
    {
      console.log('查询历史记录...');
      const sql = `SELECT
      m.user_id,
      receive_user_id,
      msg_content,
      msg_time,
      t1.user_img as loginImg,
      t1.user_name as loginName,
      t2.user_img as receiveImg,
      t2.user_name as receiveName
     FROM
      msg m
     LEFT JOIN user t1 ON m.user_id = t1.user_id
     LEFT JOIN user t2 ON m.receive_user_id = t2.user_id
     WHERE m.group_id=? order by m.id asc`
      db.query(sql, parseInt(dataInfo.group_id), function (err, res) {
        console.log('历史聊天信息:', res)
        if (res != null)
        {
          ws.send(JSON.stringify(res))
        }
      })
      const sql1 = `update msg set is_read = '1' where receive_user_id = ? and group_id = ?`
      db.query(sql1, [dataInfo.user_id, parseInt(dataInfo.group_id)], (err, res) => {
        console.log('设置为已读', res);
      })

    } else
    {
      const sql = "insert into msg set ?"
      const msgInfo = {
        user_id: dataInfo.user_id,
        receive_user_id: dataInfo.receive_user_id,
        msg_content: dataInfo.msg,
        msg_time: dataInfo.msg_time,
        commodity_id: dataInfo.commodity_id,
        group_id: dataInfo.group_id,
        is_read: dataInfo.is_read
      }
      db.query(sql, msgInfo, function (err, res) {
        console.log('消息列表插入数据:', res);//res.insertId
      })
      // 把消息发送到所有的客户端, wss.clients获取所有链接的客户端
      // console.log(wss.clients);
      wss.clients.forEach(function each (client) {
        if (client.client_id == msgInfo.user_id || client.client_id == msgInfo.receive_user_id)
        {
          client.send(JSON.stringify([msgInfo]))
        }
      })
    }
  })
  ws.on("close", (msg) => {
    console.log("服务器已与您断开连接...")
  })
})
