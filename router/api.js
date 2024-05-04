const express = require('express')
const router = express.Router()
const db = require('../db/index')

// 用户举报
router.post('/report/set', (req, res) => {
    const dataInfo = req.body
    console.log('插入举报数据', dataInfo);
    const sql = `insert into report(content,user_id,commodity_id,my_id) values(?,?,?,?)`
    db.query(sql, [dataInfo.content, dataInfo.user_id, parseInt(dataInfo.commodity_id), dataInfo.my_id], (err, results) => {
        console.log("我举报的商品数据：", results, typeof results);
        if (err) return res.cc(err)
        res.send({
            status: 0,
            message: '举报成功！',
            data: null
        })
    })
})
// 查询用户举报
router.post('/report/info', (req, res) => {
    const dataInfo = req.body
    console.log('我举报的商品数据：', dataInfo);
    const sql = `select * from report where user_id=? and commodity_id=? and my_id=?`
    db.query(sql, [dataInfo.user_id, parseInt(dataInfo.commodity_id), dataInfo.my_id], (err, results) => {
        console.log("我举报的商品数据：", results, typeof results);
        if (err) return res.cc(err)
        res.send({
            status: 0,
            message: '获取举报数据成功！',
            data: results
        })
    })
})
// 用户发布的商品
router.post('/user_release', (req, res) => {
    const dataInfo = req.body
    console.log('我发布的商品：', dataInfo);
    const sql = `select * from commodity where user_id=? and sell=0`
    db.query(sql, dataInfo.user_id, (err, results) => {
        console.log("我发布的商品：", results, typeof results);
        if (err) return res.cc(err)
        res.send({
            status: 0,
            message: '已关注！',
            data: results
        })
    })
})
// 用户卖出的商品
router.post('/user_sell', (req, res) => {
    const dataInfo = req.body
    console.log('我卖出的！', dataInfo);
    const sql = `select * from commodity where user_id=? and sell=1`
    db.query(sql, dataInfo.user_id, (err, results) => {
        console.log("我卖出的！", results, typeof results);
        if (err) return res.cc(err)
        res.send({
            status: 0,
            message: '我卖出的！',
            data: results
        })
    })
})
// 买家或买家信息
router.post('/user_info', (req, res) => {
    const dataInfo = req.body
    console.log('信息：', dataInfo);
    if (dataInfo.type === 'buy')
    {
        const sql = `select * from user left join dialogue on user.user_id = dialogue.buy_id where commodity_id=?`
        db.query(sql, dataInfo.commodity_id, (err, results) => {
            console.log("信息：", results, typeof results);
            if (err) return res.cc(err)
            res.send({
                status: 0,
                message: '买家信息！',
                data: results
            })
        })
    } else if (dataInfo.type === 'sell1')
    {
        const sql = `select * from dialogue left join user on user.user_id = dialogue.sell_id where commodity_id=? and status=1`
        db.query(sql, dataInfo.commodity_id, (err, results) => {
            console.log("信息：", results, typeof results);
            if (err) return res.cc(err)
            res.send({
                status: 0,
                message: '卖家信息！',
                data: results
            })
        })
    } else if (dataInfo.type === 'sell0')
    {
        const sql = `select * from commodity left join user on user.user_id = commodity.user_id where commodity_id=?`
        db.query(sql, dataInfo.commodity_id, (err, results) => {
            console.log("信息：", results, typeof results);
            if (err) return res.cc(err)
            res.send({
                status: 0,
                message: '卖家信息！',
                data: results
            })
        })
    } else
    {
        const sql = `select * from dialogue where id=?`
        db.query(sql, dataInfo.group_id, (err, results) => {
            console.log("信息：", results, typeof results);
            if (err) return res.cc(err)
            res.send({
                status: 0,
                message: '信息！',
                data: results
            })
        })
    }

})
// 用户买到的商品
router.post('/user_buy', (req, res) => {
    const dataInfo = req.body
    console.log('我买到的！', dataInfo);
    const sql = `select * from dialogue left join commodity on dialogue.commodity_id = commodity.commodity_id where buy_id=? and status=1`
    db.query(sql, dataInfo.user_id, (err, results) => {
        console.log("我买到的！", results, typeof results);
        if (err) return res.cc(err)
        res.send({
            status: 0,
            message: '我买到的！',
            data: results
        })
    })
})
// 用户收藏的商品
router.post('/user_collection', (req, res) => {
    const dataInfo = req.body
    console.log('我收藏的！', dataInfo);
    const sql = `select * from collection left join commodity on collection.commodity_id = commodity.commodity_id where my_id=?`
    db.query(sql, dataInfo.user_id, (err, results) => {
        console.log("我收藏的！", results, typeof results);
        if (err) return res.cc(err)
        res.send({
            status: 0,
            message: '我收藏的！',
            data: results
        })
    })
})
// 用户的好友
router.post('/user_friend', (req, res) => {
    const dataInfo = req.body
    console.log('我的好友', dataInfo);
    const sql = `select * from friend left join user on user.user_id = friend.my_attention_id where friend.user_id=?`
    db.query(sql, dataInfo.user_id, (err, results) => {
        console.log("我的好友", results, typeof results);
        if (err) return res.cc(err)
        res.send({
            status: 0,
            message: '我的好友',
            data: results
        })
    })
})
// 购买商品
router.post('/purchase', (req, res) => {
    const userInfo = req.body
    console.log('购买商品', userInfo);

    const sql1 = 'update commodity set sell=1 where commodity_id=?'
    db.query(sql1, userInfo.commodity_id, (err, results) => {
        console.log('修改商品购买状态：', results);
        if (err) return res.cc(err)
        const sql2 = 'update dialogue set status=1 where id=?'
        db.query(sql2, parseInt(userInfo.group_id), (err, results) => {
            console.log('修改订单购买状态：', results);
            if (err) return res.cc(err)
            res.send({
                status: 0,
                message: '订单成功！',
                data: null
            })
        })

    })

})
// 绑定学校
router.post('/add/school', (req, res) => {
    const schoolInfo = req.body
    console.log('schoolInfo', schoolInfo);
    const sql = `update user set user_school=? where user_id=?`
    db.query(sql, [schoolInfo.school, schoolInfo.user_id], (err, results) => {
        console.log(results);
        if (err) return res.cc(err)

        res.send({
            status: 0,
            message: '用户学校信息已更新！',
            data: null
        })
    })
})
// 是否关注
router.post('/user_follow', (req, res) => {
    const dataInfo = req.body
    console.log('是否关注：', dataInfo);
    const sql = `select * from friend where user_id=? and my_attention_id=?`
    db.query(sql, [dataInfo.user_id, dataInfo.my_attention_id], (err, results) => {
        console.log("是否关注：", results, typeof results);
        if (err) return res.cc(err)
        console.log(results.length);
        if (results.length === 0)
        {
            res.send({
                status: 0,
                message: '未关注！',
                data: '0'
            })
        } else
        {
            res.send({
                status: 0,
                message: '已关注！',
                data: '1'
            })
        }
    })
})
// 添加关注
router.post('/add_follow', (req, res) => {
    const dataInfo = req.body
    console.log('添加关注：', dataInfo);
    const sql = `insert into friend(user_id, my_attention_id) values(?,?)`
    db.query(sql, [dataInfo.user_id, dataInfo.my_attention_id], (err, results) => {
        console.log("添加关注：", results, typeof results);
        if (err) return res.cc(err)

        res.send({
            status: 0,
            message: '添加成功！',
            data: '1'
        })
    })
})
// 取消关注
router.post('/cancel_follow', (req, res) => {
    const dataInfo = req.body
    console.log('取消关注：', dataInfo);
    const sql = `delete from friend where user_id=? and my_attention_id=?`
    db.query(sql, [dataInfo.user_id, dataInfo.my_attention_id], (err, results) => {
        console.log("取消关注：", results, typeof results);
        if (err) return res.cc(err)

        res.send({
            status: 0,
            message: '取消关注成功！',
            data: '0'
        })
    })
})
// 是否收藏
router.post('/user/collection', (req, res) => {
    const dataInfo = req.body
    console.log('是否收藏：', dataInfo);
    const sql = `select * from collection where my_id=? and commodity_id=?`
    db.query(sql, [dataInfo.my_id, dataInfo.commodity_id], (err, results) => {
        console.log("是否收藏：", results, typeof results);
        if (err) return res.cc(err)
        console.log(results.length);
        if (results.length === 0)
        {
            res.send({
                status: 0,
                message: '未收藏！',
                data: 0
            })
        } else
        {
            res.send({
                status: 0,
                message: '已收藏！',
                data: 1
            })
        }
    })
})
// 添加收藏
router.post('/add_collection', (req, res) => {
    const dataInfo = req.body
    console.log('添加收藏：', dataInfo);
    const sql = `insert into collection(my_id, commodity_id) values(?,?)`
    db.query(sql, [dataInfo.my_id, dataInfo.commodity_id], (err, results) => {
        console.log("添加收藏：", results, typeof results);
        if (err) return res.cc(err)

        res.send({
            status: 0,
            message: '添加成功！',
            data: 1
        })
    })
})
// 取消收藏
router.post('/cancel_collection', (req, res) => {
    const dataInfo = req.body
    console.log('取消收藏：', dataInfo);
    const sql = `delete from collection where my_id=? and commodity_id=?`
    db.query(sql, [dataInfo.my_id, dataInfo.commodity_id], (err, results) => {
        console.log("取消收藏：", results, typeof results);
        if (err) return res.cc(err)

        res.send({
            status: 0,
            message: '取消成功！',
            data: 0
        })
    })
})
// 通知
router.post('/get/notice', (req, res) => {
    const dataInfo = req.body
    console.log('通知：', dataInfo);
    const sql = `select * from notice where user_id=? order by time desc` 
    db.query(sql, dataInfo.user_id, (err, results) => {
        console.log("通知：", results, typeof results);
        if (err) return res.cc(err)
        let num = 0
        results.forEach(v => {
            if (v.is_read === '0')
            {
                num++
            }
        });
        res.send({
            status: 0,
            message: '消息获取成功！',
            data: {
                results,
                num
            }
        })
    })
})
// 通知已读
router.post('/set/notice', (req, res) => {
    const dataInfo = req.body
    console.log('通知：', dataInfo);
    const sql = `update notice set is_read='1' where user_id=?`
    db.query(sql, dataInfo.user_id, (err, results) => {
        console.log("设置通知已读：", results, typeof results);
        if (err) return res.cc(err)
        res.send({
            status: 0,
            message: "设置通知已读",
            data: null
        })
    })
})
// 消息已读
router.post('/msg/read', (req, res) => {
    const dataInfo = req.body
    console.log('消息：', dataInfo);
    const sql = `update msg set is_read='1' where receive_user_id=? and msg_time=?`
    db.query(sql, [dataInfo.user_id, dataInfo.msg_time], (err, results) => {
        console.log("设置消息已读：", results, typeof results);
        if (err) return res.cc(err)
        res.send({
            status: 0,
            message: "设置消息已读",
            data: null
        })
    })
})
// 用户点击我想要
router.post('/add/wants', (req, res) => {
    const data = req.body
    console.log(data);
    const sql1 = `select * from dialogue where buy_id = ? and sell_id = ? and commodity_id = ?`
    let dataEnd = ""
    db.query(sql1, [data.buy_id, data.sell_id, parseInt(data.commodity_id)], (err, results) => {
        console.log('我想要', results);
        if (err) return res.cc(err)
        if (results == [] || results.length === 0)
        {
            const sql2 = `insert into dialogue(buy_id, sell_id, commodity_id) values(?,?,?)`
            db.query(sql2, [data.buy_id, data.sell_id, parseInt(data.commodity_id)], (err, results1) => {
                console.log(results1);
                if (err) return res.cc(err)
                dataEnd = "聊天列表已更新"
                db.query(`update commodity set wants = wants + 1 where commodity_id=?`, parseInt(data.commodity_id), (err, res) => {
                    console.log('我想要添加一人', res);
                })
                db.query(`select id from dialogue where buy_id=? and sell_id=? and commodity_id=?`, [data.buy_id, data.sell_id, parseInt(data.commodity_id)], (err, results2) => {
                    console.log('查询对话框id', results2[0].id);
                    res.send({
                        status: 0,
                        message: "用户点击我想要结果",
                        data: {
                            dataEnd: dataEnd,
                            id: results2[0].id
                        }
                    })
                })
            })
        } else
        {
            dataEnd = "聊天列表已存在"
            db.query(`select id from dialogue where buy_id=? and sell_id=? and commodity_id=?`, [data.buy_id, data.sell_id, parseInt(data.commodity_id)], (err, results2) => {
                console.log('查询对话框id', results2[0].id);
                res.send({
                    status: 0,
                    data: "用户点击我想要结果",
                    data: {
                        dataEnd: dataEnd,
                        id: results2[0].id
                    }
                })
            })
        }
    })
})
// 发布商品
router.post('/release/goods', (req, res) => {
    console.log(req);
    const userInfo = req.body

    const sql1 = 'insert into commodity (user_id, title, content, imgs, price, time, wants, sell, classify ) values (?,?,?,?,?,?,?,?,?)'
    const sql2 = 'select * from commodity where user_id=? and time=?'
    db.query(sql1, [userInfo.user_id, userInfo.title, userInfo.content, userInfo.imgList, userInfo.price, userInfo.time, 0, 0, userInfo.classify], (err, results1) => {
        console.log('111', results1);
        if (err) return res.cc(err)
        db.query(sql2, [userInfo.user_id, userInfo.time], (err, results2) => {
            if (err) return res.cc(err)
            res.send({
                status: 0,
                message: '发布成功！',
                data: results2
            })
        })
    })
})
// 上架商品
router.post('/reset/goods', (req, res) => {
    console.log(req);
    const data = req.body

    const sql = 'update commodity set sell=0 where commodity_id=?'
    db.query('update dialogue set status=2 where id=?', data.group_id, (err, results) => {
        if (err) return res.cc(err)
        db.query(sql, data.commodity_id, (err, results) => {
            if (err) return res.cc(err)
            res.send({
                status: 0,
                message: '上架成功！',
                data: results
            })
        })
    })
})
// 修改商品
router.post('/update/goods', (req, res) => {
    console.log(req);
    const userInfo = req.body

    const sql1 = 'update commodity set title=?, content=?, imgs=?, price=?, time=?, classify=? where commodity_id=?'
    db.query(sql1, [userInfo.title, userInfo.content, userInfo.imgList, userInfo.price, userInfo.time, userInfo.classify, userInfo.commodity_id], (err, results) => {
        console.log('修改商品：', results);
        if (err) return res.cc(err)
        res.send({
            status: 0,
            message: '商品修改成功！',
            data: null
        })
    })
})
// 删除商品
router.post('/delete/goods', (req, res) => {
    console.log(req);
    const userInfo = req.body

    const sql1 = 'update commodity set sell=2 where commodity_id=?'
    db.query(sql1, userInfo.commodity_id, (err, results) => {
        console.log('删除商品', results);
        if (err) return res.cc(err)
        res.send({
            status: 0,
            message: '商品删除成功！',
            data: null
        })
    })
})
// 个人主页
router.post('/person', (req, res) => {
    console.log(req.body);
    const id = req.body.id
    const sql1 = "select * from user right join commodity on user.user_id = commodity.user_id where user.user_id = ? and sell != 2 order by time desc"
    const sql2 = "select count(*) num from user right join friend on user.user_id = friend.user_id where user.user_id = ?"
    const sql3 = "select count(*) num from user right join friend on user.user_id = friend.my_attention_id where friend.my_attention_id = ?"
    const sql4 = "select * from user where user_id = ?"
    let commoditys = []
    let fans = 0
    let attentions = 0
    let user = {}

    db.query(sql1, id, (err, results1) => {
        commoditys = results1
        db.query(sql2, id, (err, results2) => {
            attentions = results2[0].num
            db.query(sql3, id, (err, results3) => {
                fans = results3[0].num
                db.query(sql4, id, (err, results4) => {
                    user = results4[0]
                    console.log(user);
                    res.send({
                        status: 0,
                        message: '获取用户主页信息成功！',
                        data: {
                            commoditys: commoditys,
                            fans: fans,
                            attentions: attentions,
                            user: user
                        }
                    })
                })

            })
        })
    })



})
// 获取消息列表
router.post('/msg_list', (req, res) => {
    console.log(req.body);
    // 这是用户id,查询这个用户和多少人商品有联系
    const id = req.body.buy_id
    const sql = `SELECT
	msg.id,
	msg.user_id,
	msg.receive_user_id,
	msg.msg_content,
	msg_time,
	commodity_id,
  msg.group_id,
	u1.user_id receiveUserId,
	u1.user_name receiveUserName,
	u1.user_img receiveUserImg,
	u2.user_id userId,
	u2.user_name userName,
	u2.user_img userImg 
FROM
	msg
	LEFT JOIN USER u1 ON msg.receive_user_id = u1.user_id
	LEFT JOIN USER u2 ON msg.user_id = u2.user_id 
WHERE
msg.id IN ( SELECT max( id ) AS mid FROM msg WHERE user_id = ? OR receive_user_id = ? GROUP BY group_id )
ORDER BY
	msg_time DESC`
    db.query(sql, [id, id], (err, results) => {
        console.log(results)
        res.send({
            status: 0,
            message: "消息列表获取成功",
            data: results
        })
    })
})
// 获取消息列表
router.post('/msg_unread_num', (req, res) => {
    console.log(req.body);
    // 这是用户id,查询这个用户和多少人商品有联系
    const id = req.body.id
    const sql = `SELECT count(*) num, group_id FROM msg WHERE receive_user_id = ? and is_read = '0' GROUP BY group_id`
    db.query(sql, id, (err, results) => {
        console.log(results)
        res.send({
            status: 0,
            message: "未读消息数获取成功",
            data: results
        })
    })
})
module.exports = router