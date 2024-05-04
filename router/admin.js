const express = require('express')
const router = express.Router()
const db = require('../db/index')

// 查询商品
router.post('/get/commodity', (req, res) => {
    const dataInfo = req.body
    console.log('查看商品数据', dataInfo, dataInfo.type, dataInfo.content);
    let sql = ``
    let data = dataInfo.content
    let index = dataInfo.currentPage
    if (dataInfo.type === 'commodity_id')
    {
        sql = `select * from commodity where commodity_id = ? and sell != 2`
    } else if (dataInfo.type === 'user_id')
    {
        sql = `select * from commodity where user_id = ? and sell != 2`
    } else if (dataInfo.type === 'title')
    {
        data = '%' + dataInfo.content + '%'
        sql = `select * from commodity where title like ? and sell != 2`
    } else if (dataInfo.type === 'classify')
    {
        sql = `select * from commodity where classify = ? and sell != 2`
    } else
    {
        sql = `select * from commodity where sell != 2`
    }
    db.query(sql, data, (err, results) => {
        console.log("查询的商品数据：");
        if (err) return res.cc(err)
        let totalNum = results.length
        db.query(sql, data, (err, results) => {
            console.log("查询的商品数据：", results, results.slice((index - 1) * 12, index * 12));
            if (err) return res.cc(err)
            res.send({
                status: 0,
                message: '查询商品成功！',
                data: {
                    results: results.slice((index - 1) * 12, index * 12),
                    totalNum
                }
            })
        })
    })
})
// 查询订单
router.post('/get/order', (req, res) => {
    const data = req.body
    console.log('管理员查询商品：', data);
    let index = data.currentPage
    let sql = ``
    if (data.order_id === '')
    {
        sql = `SELECT
        dialogue.id AS id, commodity.commodity_id as commodity_id, title, u2.user_name as sell_name, u2.user_school as sell_school, u1.user_name as buy_name, price, status
    FROM
        dialogue
        LEFT JOIN commodity ON dialogue.commodity_id = commodity.commodity_id
        LEFT JOIN USER u1 ON u1.user_id = dialogue.buy_id
        LEFT JOIN USER u2 ON u2.user_id = dialogue.sell_id 
    WHERE
        (STATUS = 1 
        OR STATUS = 2)`
    } else
    {
        sql = `SELECT
	dialogue.id AS id, commodity.commodity_id as commodity_id, title, u2.user_name as sell_name, u2.user_school as sell_school, u1.user_name as buy_name, price, status
FROM
	dialogue
	LEFT JOIN commodity ON dialogue.commodity_id = commodity.commodity_id
	LEFT JOIN USER u1 ON u1.user_id = dialogue.buy_id
	LEFT JOIN USER u2 ON u2.user_id = dialogue.sell_id 
WHERE
	(STATUS = 1 
	OR STATUS = 2) and dialogue.id = ? `
    }
    db.query(sql, data.order_id, (err, result) => {
        if (err) return res.cc(err)
        console.log('查询商品订单的数据量：', result.length);
        let totalNum = 0
        if (result.length)
        {
            totalNum = result.length
        }
        db.query(sql, data.order_id, (err, result1) => {
            if (err) return res.cc(err)
            res.send({
                status: 0,
                message: '查询订单成功！',
                data: {
                    totalNum,
                    result: result1.slice((index - 1) * 12, index * 12)
                }
            })
        })
    })

})
// 删除订单
router.post('/delete/order', (req, res) => {
    console.log(req);
    const data = req.body
    const sql1 = 'delete from dialogue where id=?'
    db.query(sql1, data.order_id, (err, results) => {
        console.log('删除订单', results);
        if (err) return res.cc(err)
        res.send({
            status: 0,
            message: '订单删除成功！',
            data: null
        })
    })
})
// 查询公告
router.post('/get/notice', (req, res) => {
    const dataInfo = req.body
    console.log('查看商品数据', dataInfo, dataInfo.type, dataInfo.content);
    let sql = ``
    let data = dataInfo.content
    let index = dataInfo.currentPage
    if (dataInfo.type === 'admin')
    {
        sql = `select * from notice where admin = ?`
    } else if (dataInfo.type === 'user_id')
    {
        sql = `select * from notice where user_id = ?`
    } else if (dataInfo.type === 'title')
    {
        data = '%' + dataInfo.content + '%'
        sql = `select * from notice where title like ?`
    } else
    {
        sql = `select * from notice`
    }
    db.query(sql, data, (err, results) => {
        console.log("查询的公告数据：");
        if (err) return res.cc(err)
        let totalNum = results.length
        db.query(sql, data, (err, results) => {
            console.log("查询的公告数据：", results, results.slice((index - 1) * 2, index * 2));
            if (err) return res.cc(err)
            res.send({
                status: 0,
                message: '查询公告成功！',
                data: {
                    results: results.slice((index - 1) * 12, index * 12),
                    totalNum
                }
            })
        })
    })
})
// 新增公告
router.post('/add/notice', (req, res) => {
    const dataInfo = req.body
    console.log('新增公告', dataInfo);
    let sql = ``
    if (dataInfo.limit !== '0')
    {
        sql = `insert into notice(title, content,user_id,time,is_read, admin, limitt) values(?,?,?,?,?,?,?)`
        let sql1 = `select * from user`
        db.query(sql1, (err, results) => {
            results.forEach(v => {
                if (v.password === null)
                {
                    db.query(sql, [dataInfo.title, dataInfo.content, v.user_id, dataInfo.time, '0', dataInfo.admin, dataInfo.limit], (err, results1) => {
                        console.log('插入面向全体的公告', results1);
                    })
                }
            })
            res.send({
                status: 0,
                message: '新增公告成功！',
                data: null
            })
        })

    } else if (dataInfo.limit === '0')
    {
        sql = `insert into notice(title, content,user_id,time,is_read, admin, limitt) values(?,?,?,?,?,?,?)`
        db.query(sql, [dataInfo.title, dataInfo.content, dataInfo.user_id, dataInfo.time, '0', dataInfo.admin, dataInfo.limit], (err, results1) => {
            console.log('插入面向单一用户的公告', results1);
            res.send({
                status: 0,
                message: '新增公告成功！',
                data: null
            })
        })
    }
})
// 编辑公告
router.post('/edit/notice', (req, res) => {
    const dataInfo = req.body
    console.log('编辑公告', dataInfo);
    let sql = ``
    if (dataInfo.limit !== '0')
    {
        sql = `update notice set title=?, content=?,user_id=?,time=?,is_read=0, admin=?where limitt=?`
        let sql1 = `select * from user`
        db.query(sql1, (err, results) => {
            results.forEach(v => {
                if (v.password === null)
                {
                    db.query(sql, [dataInfo.title, dataInfo.content, v.user_id, dataInfo.time, dataInfo.admin, dataInfo.limit], (err, results1) => {
                        console.log('修改面向全体的公告', results1);
                    })
                }
            })
            res.send({
                status: 0,
                message: '修改公告成功！',
                data: null
            })
        })

    } else if (dataInfo.limit === '0')
    {
        sql = `update notice set title=?, content=?,user_id=?,time=?,is_read=0, admin=?, limitt=? where id = ?`
        db.query(sql, [dataInfo.title, dataInfo.content, dataInfo.user_id, dataInfo.time, dataInfo.admin, dataInfo.limit, dataInfo.id], (err, results1) => {
            console.log('修改面向单一用户的公告', results1);
            res.send({
                status: 0,
                message: '新增公告成功！',
                data: null
            })
        })
    }
})
// 删除公告
router.post('/delete/notice', (req, res) => {
    const dataInfo = req.body
    let sql = `delete from notice where id = ?`
    db.query(sql, dataInfo.id, (err, results) => {
        if (err) return res.cc(err)
        res.send({
            status: 0,
            message: '删除公告成功！',
            data: null
        })
    })
})
// 获取管理员用户
router.post('/get/adminUser', (req, res) => {
    const data = req.body
    console.log(data);
    let sql = ``
    let index = data.currentPage
    if (data.user_id == '')
    {
        sql = `select * from user where password is not NULL`
    } else
    {
        sql = `select * from user where password is not NULL and user_id = ?`
    }
    db.query(sql, data.user_id, (err, results) => {
        let totalNum = 0
        if (results.length)
        {
            totalNum = results.length
        }
        console.log(results);
        db.query(sql, data.user_id, (err, results) => {
            if (err) return res.cc(err)
            res.send({
                status: 0,
                message: '获取管理员用户成功！',
                data: {
                    totalNum,
                    results: results.slice((index - 1) * 12, index * 12)
                }
            })
        })
    })
})
// 获取普通用户(搜索)
router.post('/get/commonUser', (req, res) => {
    const data = req.body
    console.log(data);
    let sql = ``
    let index = data.currentPage
    if (data.user_id == '')
    {
        sql = `select * from user where password is NULL`
    } else
    {
        sql = `select * from user where password is NULL and user_id = ?`
    }
    db.query(sql, data.user_id, (err, results) => {
        let totalNum = 0
        if (results.length)
        {
            totalNum = results.length
        }
        console.log(results);
        db.query(sql, data.user_id, (err, results) => {
            if (err) return res.cc(err)
            res.send({
                status: 0,
                message: '获取普通用户成功！',
                data: {
                    totalNum,
                    results: results.slice((index - 1) * 12, index * 12)
                }
            })
        })
    })
})
// 新增管理员用户
router.post('/add/admin', (req, res) => {
    const dataInfo = req.body
    let sql = `insert into user(user_id, user_name, user_school, password, ban) values(?,?,?,?,?)`
    db.query(sql, [dataInfo.user_id, dataInfo.user_name, dataInfo.user_school, dataInfo.password, 0], (err, results) => {
        if (err) return res.cc(err)
        res.send({
            status: 0,
            message: '新增管理员成功！',
            data: null
        })
    })
})
// 编辑管理员用户
router.post('/edit/admin', (req, res) => {
    const dataInfo = req.body
    let sql = `update user set user_id=?, user_name=?, user_school=?, password=? where uid=?`
    db.query(sql, [dataInfo.user_id, dataInfo.user_name, dataInfo.user_school, dataInfo.password, dataInfo.uid], (err, results) => {
        if (err) return res.cc(err)
        res.send({
            status: 0,
            message: '编辑管理员成功！',
            data: null
        })
    })
})
// 删除管理员用户
router.post('/delete/admin', (req, res) => {
    const dataInfo = req.body
    let sql = `delete from user where uid = ?`
    db.query(sql, dataInfo.uid, (err, results) => {
        if (err) return res.cc(err)
        res.send({
            status: 0,
            message: '删除用户成功！',
            data: null
        })
    })
})
// 普通用户封禁或者解禁
router.post('/ban', (req, res) => {
    const dataInfo = req.body
    let sql = `update user set ban=? where user_id=?`
    db.query(sql, [dataInfo.ban, dataInfo.user_id], (err, results) => {
        if (err) return res.cc(err)
        res.send({
            status: 0,
            message: '删除公告成功！',
            data: null
        })
    })
})
// 查询举报
router.post('/get/report', (req, res) => {
    const dataInfo = req.body
    console.log(dataInfo);
    let index = dataInfo.currentPage
    let type = dataInfo.type
    let content = dataInfo.content
    let sql = ``
    let base = `select r.id as id, c.commodity_id as commodity_id, 	c.title as title, c.content as content,  r.content as reason, c.classify as classify, r.user_id as be_report_id, r.my_id as report_id, report from report r left join commodity c on r.commodity_id = c.commodity_id `
    if (type === 'report')
    {
        if(content === '已审核') {
            content = '1'
        } else {
            content = '0'
        }
        sql = base + `where r.report = ?`
    } else if (type === 'be_report_id')
    {
        sql = base + `where r.user_id = ?`
    } else if (type === 'report_id')
    {
        sql = base + `where r.my_id = ?`
    } else
    {
        sql = base
    }
    db.query(sql, content, (err, results) => {
        if (err) return res.cc(err)
        let totalNum = results.length
        db.query(sql, content, (err, results) => {
            if (err) return res.cc(err)
            res.send({
                status: 0,
                message: '查询举报成功！',
                data: {
                    results: results.slice((index - 1) * 12, index * 12),
                    totalNum
                }
            })
        })
    })
})
// 修改审核状态
router.post('/edit/report', (req, res) => {
    const dataInfo = req.body
    let sql = `update report set report = '1' where id =?`
    db.query(sql, dataInfo.id, (err, results) => {
        if (err) return res.cc(err)
        res.send({
            status: 0,
            message: '审核举报成功！',
            data: null
        })
    })
})
module.exports = router