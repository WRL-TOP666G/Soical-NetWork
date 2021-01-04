const User=require("../../database_models/user_model");
const shortid=require("shortid");
const fs =require("fs");
const UserStatus = require("../../database_models/user_status_model");




exports.register = function(plugin, options, next){
    plugin.route([
        {
            method: "GET",
            path: "/user_profile",
            config: {
                auth: "simple-cookie-strategy",
                handler: function(request,reply){
                    console.log(request.payload)

                }
            }
        },
        {
            method: "POST",
            path: "/user_profile/edit",
            config: {
                auth: "simple-cookie-strategy",
                handler: function(request,reply){
                    User.findOne({"email": request.auth.credentials.user}, function(err,user){
                        user.name=request.payload.name;
                        user.user_profile[0].location=request.payload.location;
                        user.user_profile[0].description=request.payload.description;
                        user.user_profile[0].interests=request.payload.interests;
                        user.save(function(err){
                            if(err){
                                reply().code(400);
                            }
                            else{
                                reply();
                            }
                        })
                    })
                }
            }
        },
        {
            method: "POST",
            path: "/profile_pic/upload",
            config:{
                auth: "simple-cookie-strategy",
                handler: function(request, reply){
                    console.log("image_data", request.payload.image_data);
                    var user_profile_image="user_" +request.auth.credentials.member_id + "_" + shortid.generate() + "." + request.payload.image_type;
                    fs.writeFile("user_profile_images/" + user_profile_image, new Buffer(request.payload.image_data,"base64"), function(err){
                        if(!err){
                            User.findOne({"email": request.auth.credentials.user},function(err,user){
                                user.user_profile[0].profile_pic=user_profile_image;
                                user.save(function(err){
                                    if(err){
                                        reply(err)
                                    }
                                    else{
                                        UserStatus.update({"user_email": request.authj.credentials.user}, {"profile_pic": user_profile_image},function(err,result){
                                            reply(user_profile_image);
                                        });
                                    }
                                })
                            })
                        }
                    })
                }
            }
        }
    ])
    next();
}

exports.register.attributes={
    pkg: require("./package.json")
}