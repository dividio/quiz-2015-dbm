var models = require('../model/models.js');

// Autoload :id de comentarios
exports.load = function(req, res, next, commentId) {
    models.Comment.find({
        where: {id: Number(commentId)}
    }).then(function(comment){
        if (comment) {
            req.comment = comment;
            next();
        } else {
            next(new Error('No existe commentId=' + commentId));
        }
    }).catch(function(error) {
        next(error);
    });
};

// GET /quizes/:quizId/comments/new
exports.new = function(req, res) {
    res.render('comments/new.ejs', {quizid: req.params.quizId, errors: []});
};

// POST /quizes/:quizId/comments
exports.create = function(req, res) {
    var comment = models.Comment.build(
        { texto: req.body.comment.texto,
          QuizId: req.params.quizId
        }
    );
    
    var errors = comment.validate();
    try {
        if (errors) {
            //se convierte en [] con la propiedad message por compatibilida con layout
            var i=0; var errores=new Array();
            for (var prop in errors) errores[i++]={message: errors[prop]}; 
            res.render('comments/new.ejs', 
                       {comment: comment, 
                        quizId: req.params.quizId, 
                        errors: errores});
        } else {
            // guarda en BD el campo texto de comment
            comment.save()
                .then(function() {
                    res.redirect('/quizes/'+req.params.quizId);
                });
        };
    } catch(error) {
        next(error);
    };
};

// PUT /quizes/:quizId/comments/;commentId/publish
exports.publish = function(req, res) {
    req.comment.publicado = true;
    
    req.comment.save( {fields: ["publicado"]})
    .then( function() {
        res.redirect('/quizes/' + req.params.quizId);
    })
    .catch( function(error) {
        next(error);
    });
};