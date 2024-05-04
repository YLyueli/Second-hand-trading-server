const express = require('express')
const router = express.Router()
const db = require('../db/index')
const jwt = require('jsonwebtoken')
const config = require('../config')

// 商品详情
router.post('/goods_detail', (req, res) => {
    console.log('11111111', req.body);
    const goodInfo = req.body
    const sql = "select * from commodity left join user on user.user_id = commodity.user_id where commodity.commodity_id = ?"
    db.query(sql, parseInt(goodInfo.commodity_id), (err, results) => {
        console.log(results);
        res.send({
            status: 0,
            message: '获取商品信息成功！',
            data: results
        })
    })


})

// 获取商品列表
router.get('/goods_list/:page', (req, res) => {
    let page = parseInt(req.params.page)
    let start = 0
    if (page != 1)
    {
        start = (page - 1) * 10
    }
    const sql = "select * from commodity left join user on commodity.user_id = user.user_id where sell = 0 order by time desc limit ?,?"
    db.query("select * from commodity left join user on commodity.user_id = user.user_id order by time desc", (err, results) => {
        console.log(results.length);
        const totalPages = Math.ceil(results.length / 10)
        console.log(totalPages);
        db.query(sql, [start, 10], (err, results1) => {
            console.log(results1);
            res.send({
                status: 0,
                message: '获取商品信息成功！',
                data: results1,
                totalPages: totalPages
            })
        })
    })

})

// 搜索商品
router.post('/goods_list/search/:page', (req, res) => {
    console.log(req.body);
    const search = '%' + req.body.search + '%'
    let page = parseInt(req.params.page)
    let start = 0
    if (page != 1)
    {
        start = (page - 1) * 10
    }
    const sql = "select * from commodity left join user on commodity.user_id = user.user_id where (title like ? and sell = 0 ) or (commodity.classify = ? and sell = 0) order by wants desc, time desc limit ?,?"
    db.query("select * from commodity left join user on commodity.user_id = user.user_id where (title like ? and sell = 0 ) or (commodity.classify = ? and sell = 0) order by wants desc, time desc", [search, req.body.search], (err, results) => {
        const totalPages = Math.ceil(results.length / 10)
        db.query(sql, [search, req.body.search, start, 10], (err, results1) => {
            console.log(results1);
            res.send({
                status: 0,
                message: '获取商品信息成功！',
                data: results1,
                totalPages: totalPages
            })
        })
    })

})

// 分类查看商品
router.post('/goods_list/classify/:page', (req, res) => {
    let sql = ""
    let search = ""
    let page = parseInt(req.params.page)
    let start = 0
    console.log(req.body);
    if (page != 1)
    {
        start = (page - 1) * 10
    }
    var totalPages = 0
    if (req.body.type)
    {
        search = req.body.type
    }
    console.log(search);
    if (search == '1')
    {
        sql = "select * from commodity left join user on commodity.user_id = user.user_id where user.user_school = ? and sell = 0 order by wants desc, time desc limit ?,?"
        search = req.body.school
        db.query("select * from commodity left join user on commodity.user_id = user.user_id where user.user_school = ? and sell = 0 order by wants desc, time desc", search, (err, results) => {
            var totalPages = Math.ceil(results.length / 10)
            db.query(sql, [search, start, 10], (err, results1) => {
                console.log(results1);
                res.send({
                    status: 0,
                    message: '获取商品信息成功！',
                    data: results1,
                    totalPages: totalPages
                })
            })
        })
    } else
    {
        sql = "select * from commodity left join user on commodity.user_id = user.user_id where classify = ? and sell = 0 order by wants desc, time desc limit ?,?"
        search = req.body.classify
        db.query("select * from commodity left join user on commodity.user_id = user.user_id where classify = ? and sell = 0 order by wants desc, time desc", search, (err, results) => {
            console.log("获取分类", results.length);
            totalPages = Math.ceil(results.length / 10)
            db.query(sql, [search, start, 10], (err, results1) => {
                console.log(results1);
                res.send({
                    status: 0,
                    message: '获取商品信息成功！',
                    data: results1,
                    totalPages: totalPages
                })
            })
        })
    }
})

// 登录
router.post('/login', (req, res) => {
    console.log(req);
    const userInfo = req.body
    const tokenStr = jwt.sign(userInfo, config.jwtSecretKey, { expiresIn: config.expiresIn })
    const token = 'Bearer ' + tokenStr
    const sql1 = 'select * from user where user_id=?'
    db.query(sql1, userInfo.user_id, (err, results) => {
        console.log('111', results);
        if (err) return res.cc(err)
        if (results.length === 0 || results === [])
        {
            console.log('查询');
            const sql = 'insert into user (user_id, user_name, user_img) values (?,?,?)'
            db.query(sql, [userInfo.user_id, userInfo.user_name, userInfo.user_img], (err, results) => {
                console.log('123', results);
                if (err) return res.cc(err)
                res.send({
                    status: 0,
                    message: '登录成功！',
                    data: {
                        token: token,
                        school: null
                    },
                })
            })
        } else
        {
            if (results[0].ban === 0)
            {
                res.send({
                    status: 0,
                    message: '登录成功！',
                    data: {
                        token: token,
                        school: results[0].user_school
                    },
                })
            } else
            {
                res.send({
                    status: 2,
                    message: '用户已被封禁',
                    data: null
                })
            }


        }



    })

})
// 管理员登录
router.post('/admin/login', (req, res) => {
    const data = req.body
    console.log('管理员登录信息：', data);
    const tokenStr = jwt.sign(data, config.jwtSecretKey, { expiresIn: config.expiresIn })
    const token = 'Bearer ' + tokenStr
    const sql = `select * from user where user_id=? and password=?`
    db.query(sql, [data.user_id, data.password], (err, results) => {
        console.log(results);
        if (err) return res.cc(err)
        if(results.length === 0) {
            res.send({
                status: 401,
                message: '登录失败，请检查账号密码是否正确',
                data: null
            })
        } else {

            res.send({
                status: 0,
                message: '登陆成功',
                data: {
                    token,
                    userInfo: results[0]
                }
            })
        }
    })
})
module.exports = router
