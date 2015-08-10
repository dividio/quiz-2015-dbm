var models = require('../model/models.js');

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