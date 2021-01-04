const User=require("../../database_models/user_model");

exports.register=function(plugin, options, next){
    plugin.route([
        {
            method: "GET",
            path: "/friends",
            config:{
                //..
                auth: "simple-cookie-strategy",
                handler: function(request, reply){
                    User.find({"email": {$ne: request.auth.credentials.user}}, function(err,users){
                        reply.view("friends", {user_friends: users});
                    });

                }
            }
        },
        {
            method: "POST",
            path: "/friend_request",
            config:{
                //..
                auth: "simple-cookie-strategy",
                handler: function(request, reply){
                    User.find({"email": request.auth.credentials.user}, function(err,sending_user){//..
                        User.find({"member_id": request.payload.friend_member_id}, function(err, potential_friend){//..
                            potential_friend[0].update({$push: {"friend_requests": {"member_id": sending_user[0].member_id}, 
                            "friend_name": sending_user[0].name, "profile_pic": sending_user[0].user_profile[0].profile_pic}})
                            reply();
                        });
                    })

                }
            }

        },
        {
            method: "POST",
            path: "/accept_friend_request",
            config:{
                auth: "simple-cookie-strategy",
                handler: function(request, reply){
                    User.find({"email": request.auth.credentials.user},function(err, user){
                        User.find({"member_id": request.payload.member_id},function(err, acceptd_friend_user){
                            user[0].update({$push: {"friends": {"member_id": accepted_friend_user[0].member_id, "friend_name":accepted_friend_user[0].name, "profile_pic": accepted_friend_user[0].user_profile[0].profile_pic}}, $pull:{"friend_requests": {member_id: request.payload.member_id}}},
                                function(err){
                                    accepted_friend_user[0].update({$push: {"friends": {"member_id": user[0].member_id, "friend_name":user[0].name, "profile_pic": user[0].user_profile[0].profile_pic}} },
                                        function(err){
                                            reply();

                                        })

                                }
                            )
                        });
                    });
                }
            }

        },
        {
            method: "GET",
            path: "/user_profile/{member_id}",
            config:{
                auth: "simple-cookie-strategy",
                handler: function(request,reply){
                    User.find({"email": request.auth.credentials.user}, function(err,user){
                        var all_user_friends = user[0].friends;
                        var request_profile_member_id=request.params.member_id;
                        all_user_friends.forEach(function(friend){
                            if(friend.member_id==request_profile_member_id){
                                User.findOne({"member_id": friend.member_id}, function(err,visiting_friend){
                                    reply.view("user_profile_visit", {user: visiting_friend});
                                });
                            }
                        })
                    });
                }
            }
        }
    ]);
    next();
}

exports.register.attributes={
    pkg: require("./package.json")
}