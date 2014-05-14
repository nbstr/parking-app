var express = require('express');
var router = express.Router();

var $models = {
	user:['username', 'email']
};
var $http = {
	filter:function (type, data){
		var model = $models[type],
			post_data = {};
		for(var element in model){
			if(data[model[element]] != undefined){
				post_data[model[element]] = data[model[element]];
			}
	    }
	    return post_data;
	}
};

// POST :: alert controller
router.post('report', function(req, res) {
    req.io.sockets.emit('alert:controller', req.body);
    res.json({
        error:false
    });
});

// GET :: get a list of all users
router.get('', function(req, res) {
    res.render('index', { title: 'Parking API' });
    // var db = req.db;
    // db.collection('userlist').find().toArray(function (error, items) {
    //     res.json(items);
    // });
});

// GET :: get one user
router.get('/:id', function(req, res) {
    var db = req.db;
    var id = req.params.id;
    db.collection('userlist').findById(id, function (error, items) {
        res.json(items);
    });
});

// POST :: add a new user
router.post('', function(req, res) {

    var db = req.db;
    var data = $http.filter('user', req.body);

    db.collection('userlist').insert(data, function(error, result){
        res.send(data);
    });
});

// PUT :: edit a user
router.put('/:id', function(req, res) {

    var db = req.db;
    var id = req.params.id;
    var data = $http.filter('user', req.body);

    db.collection('userlist').updateById(id, {$set:data}, function(err, result) {
	    res.send({error:err, result:result});
	});
});

// DELETE :: delete a user by id
router.delete('/:id', function(req, res) {
    var db = req.db;
    var userToDelete = req.params.id;
    db.collection('userlist').removeById(userToDelete, function(error, result) {
        res.send((result === 1) ? { msg: 'success', result:result } : { msg:'error: ' + error });
    });
});


module.exports = router;
