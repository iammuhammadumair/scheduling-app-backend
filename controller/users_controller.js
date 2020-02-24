const db = require('../models');
const Helper = require('../config/helper');
var crypto = require('crypto')
const users = db.users
const posts = db.posts;
const sequelize = require('sequelize');
var path = require('path');
var uuid = require('uuid');

module.exports = {
  adduser: async function (req, res) {

    if (req.session && req.session.auth == true) {
        res.render('admin/adduser', { sessiondata: req.session, msg: req.flash('msg'),  title: 'User'});
    } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }
  },
  createuser: async function (req, res) {
    if (req.session && req.session.auth == true) {
         image_name="";
         
        const count = await users.count({
                     where : {
                       email : req.body.email
                     }
               });
              if(count > 0) {
                req.flash('msg', 'Email already Exist');
                res.redirect('/admin/adduser');
                return;
              }
              if (req.files && req.files.image) {
              
                let image = req.files.image;
                var extension = path.extname(image.name);
                var fileimage = uuid() + extension;
                image.mv(process.cwd() + '/public/images/users/' + fileimage, function (err) {
                if(err)
                    return res.status(500).send(err);
                });
               image_name = fileimage;
            }
       
        var auth_create = crypto.randomBytes(20).toString('hex');
        const adduser= await users.create({
          username: req.body.name, 
          profileImage: image_name, 
           email: req.body.email, 
           password:req.body.password,
              country:req.body.country, 
              dob:req.body.dob, 
              gender:req.body.gender, 
              //countryCode:req.body.country_code,
              lat: req.body.lat, 
              lng: req.body.lng,
              auth_key:auth_create
       });
       //console.log(adduser, 'yioiutr===='); return
      if(adduser){
       req.flash('msg', 'User Successfully Added');
      res.redirect('/admin/userslist');
      }
      else{
       console.log(error)
      }
      } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }

  },
  userslist : async function (req, res) {
     if (req.session && req.session.auth == true) {
      var users_data =  await users.findAll({
          attributes:['id','username','profileImage','email','status','country','gender',[sequelize.literal('(SELECT count(userId) FROM posts WHERE users.id = posts.userId)'), 'totalposts']],  
          order: [
            ['id', 'DESC'],
        ],  
       });
     // console.log(users_data); return false
       users_data = users_data.map(value => 
        {
            return value.toJSON();
        });
        var data =  await users.findAll({
          attributes:['country']
       });
       //console.log(data); return false
       res.render('admin/userslist', { sessiondata: req.session,response:users_data,data, msg: req.flash('msg'),  title: 'User'});
    } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }
  },
  users_statuschange: async function (req, res) {
    if (req.session && req.session.auth == true) {
      let update = await users.update({
                status:req.body.status
            },
           {
            where: {
                  id: req.body.id,
            }
      });
      res.json(1);
     } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }
  },
  delete_user: async function (req, res) {
    if (req.session && req.session.auth == true) {
      const dlt = await users.destroy({
              where: {
                id: req.body.id
              }
            });
      res.json(1);
     } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }
  },
  viewuser: async function (req, res) {
    if (req.session && req.session.auth == true) {
        var users_data = await users.findOne({
          where: {
            id: req.query.id
          },
        });
       
        res.render('admin/edituser',
          {
            users_data: users_data,
            msg: req.flash('msg'),
            sessiondata: req.session,
            title: 'User'
          });
     } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }
  },
   update_user: async function (req, res) {
    if (req.session && req.session.auth == true) {
         image_name=req.body.hiddenimage;
         id=req.body.id;
        if (req.files && req.files.image) {
              
              let image = req.files.image;
              var extension = path.extname(image.name);
              var fileimage = uuid() + extension;
              image.mv(process.cwd() + '/public/images/users/' + fileimage, function (err) {
              if(err)
                  return res.status(500).send(err);
              });
             image_name = fileimage;
          }
          const count = await users.count({
            where : {
              email : req.body.email
            }
      });
     if(count > 0) {
       req.flash('msg', 'Email already Exist');
       res.redirect('/admin/update_user');
       return;
     }
      const update_users= await users.update({
              username: req.body.name, 
              profileImage: image_name, 
              email: req.body.email, 
              country:req.body.country, 
              dob:req.body.dob, 
              gender:req.body.gender,
              lat: req.body.lat, 
              lng: req.body.lng
            },
            {
            where: {
               id: req.body.id
            }

       });
      req.flash('msg', 'User Successfully Updated');
      res.redirect('/admin/userslist');
      } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }

  },
}