const Users = require('../models/users')
const express = require('express')
const fs = require('fs')
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const e = require('express')
exports.login_hrd = (req, res, next) => {
    // console.log(req.body.email)
    Users.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(404).json({
                    message: "HRD not found, user dosn't exist"
                })
            } else {
                bcrypt.compare(req.body.password, user[0].password, (error, respon) => {
                    if (error) {
                        throw new Error("Something error !")
                    }
                    if (respon) {
                        var token = jwt.sign({
                            email: user[0].email,
                            userId: user[0]._id
                        }, process.env.JWT_KEY, {
                            expiresIn: "1h"
                        })
                        var refresh_token = jwt.sign({
                            email: user[0].email,
                            userId: user[0]._id
                        }, process.env.JWT_REFRESH, {
                            expiresIn: "4h"
                        })
                        let tempUser = {
                            _id: user[0]._id,
                            name: user[0].name,
                            email: user[0].email,
                            email_pribadi: user[0].email_pribadi,
                            no_telepon: user[0].no_telepon,
                            profile: user[0].profile,
                            role: user[0].role
                        }
                        return res.status(200).json({
                            message: "Auth succesful",
                            user: tempUser,
                            token: token,
                            refresh_token: refresh_token
                        })
                    } else {
                        return res.status(401).json({
                            message: "Password not match"
                        })
                    }
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
}
exports.refresh_token = (req, res, next) => {
    const decode = jwt.decode(req.headers.authorization.split(" ")[1])
    const email = decode.email
    const userId = decode.userId
    var token = jwt.sign({
        email: email,
        userId: userId
    }, process.env.JWT_KEY, {
        expiresIn: "1h"
    })
    res.status(200).json({
        new_token: token
    })
}
exports.add_new_hrd = (req, res, next) => {
    Users.find({ email: req.body.email })
        .exec()
        .then((result) => {
            if (result.length) {
                unlinkAsync(req.file.path)
                return res.status(409).json({
                    message: "HRD Already exist in db",
                })
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        })
                    } else {
                        const hrd = new Users({
                            _id: mongoose.Types.ObjectId(),
                            name: req.body.name,
                            password: hash,
                            email: req.body.email,
                            email_pribadi: req.body.email_pribadi,
                            no_telepon: req.body.no_telepon,
                            profile: req.file.path,
                        })

                        hrd.save()
                            .then(result => {
                                res.status(200).json({
                                    message: "Added new HRD Successfully!",
                                    createdHRD: result,
                                    require: {
                                        type: "GET",
                                        url: '',
                                    }
                                })
                            })
                            .catch(err => {
                                res.status(500).json({
                                    error: err
                                })
                            })
                    }
                })
            }
        })
}
exports.update_profile_by_email = (req, res, next) => {
    Users.findOneAndUpdate({ email: req.body.email }, { profile: req.file.path })
        .exec()
        .then(result => {
            if (result !== null) {
                unlinkAsync(result.profile)
                res.status(200).json({
                    message: "Success to update profile"
                })
            } else {
                unlinkAsync(req.file.path)
                res.status(404).json({
                    message: "No users found!"
                })
            }
        })
        .catch(err => {
            unlinkAsync(req.file.path)
            res.status(500).json({
                message: "Internal server error !"
            })
        })
}
exports.get_all_hrd = (req, res, next) => {
    Users.find()
        .select('_id name email email_pribadi no_telepon profile role')
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Succes to get data",
                data: result
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })

}
exports.get_hrd_by_id = (req, res, next) => {
    const id = req.params.hrdId
    Users.findById({ _id: id })
        .select("_id name email email_pribadi no_telepon profile")
        .exec()
        .then(result => {
            res.status(200).json({
                HRD: result
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
}
exports.delete_hrd_by_id = (req, res, next) => {
    const id = req.params.hrdId
    Users.find({ _id: id }).exec()
        .then(result => {
            if (result.length > 0) {
                fs.unlinkSync(result[0].profile)
                Users.deleteOne({ _id: id }).exec()
                    .then(result => {
                        if (result.deletedCount > 0) {
                            return res.status(200).json({
                                msg: result
                            })
                        }
                        return res.status(404).json({
                            msg: "Data not Found!"
                        })
                    })
                    .catch(err => {
                        return res.status(404).json({
                            msg: "Data not found!"
                        })
                    })
            }
            return res.status(404).json({
                msg: "Data not Found!"
            })
        })
        .catch(err => {
            return res.status(404).json({
                msg: "Data not Found!"
            })
        })
}
exports.update_users_by_email = (req, res, next) => {
    const email = req.body.email
    const email_pribadi = req.body.email_pribadi
    const name = req.body.name
    const no_telepon = req.body.no_telepon
    Users.updateOne({ email: email }, { name: name, email_pribadi: email_pribadi, no_telepon: no_telepon })
        .exec()
        .then(result => {
            if (result.n > 0) {
                res.status(200).json({
                    message: "Success to update!"
                })
            } else {
                res.status(404).json({
                    message: "No updates were made"
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                msg: err
            })
        })
}