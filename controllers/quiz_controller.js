var models = require('../model/models.js');

// Autoload - factoriza el codigo si ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
    models.Quiz.find({
        where: { id: Number(quizId) },
        include: [{ model: models.Comment }]
    }).then(
        function(quiz) {
            if(quiz) {
                req.quiz = quiz;
                next();
            } else {
                next(new Error('No existe quizId=' + quizId));
            };
        })
        .catch(function(error) { next(error);});
};

// GET /quizes
exports.index = function(req, res) {
    var search = req.query.search;
    console.log('Search 1: ' + search);
    var irIndex = function(quizes) {
        res.render('quizes/index.ejs', {quizes: quizes, errors: []});
    };
    var verError = function(error) { next(error);};
    if (search) {
        search = '%' + search.replace(' ', '%') + '%';
        console.log('Search 2: ' + search);
        
        models.Quiz.findAll({where: ["pregunta like ?", search]})
            .then(irIndex)
            .catch(verError);
    } else {
        models.Quiz.findAll()
            .then(irIndex)
            .catch(verError);
    }
    
};

// GET /quizes/:id
exports.show = function(req, res) {
    res.render('quizes/show', {quiz: req.quiz, errors: []});
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
    var resultado = 'Incorrecto';
    if (req.query.respuesta === req.quiz.respuesta) {
        resultado = 'Correcto';
    }
    res.render('quizes/answer', { quiz: req.quiz, 
                                  respuesta: resultado, 
                                  errors: []});
};

// GET /quizes/new
exports.new = function(req, res) {
    var quiz = models.Quiz.build( // crea objeto quiz
        {pregunta : "Pregunta", respuesta: "Respuesta", tema: "otro"}
    );
    res.render('quizes/new', {quiz: quiz, errors: []});
};

// POST /quizes/create
exports.create = function(req, res) {
    var quiz = models.Quiz.build( req.body.quiz );
    
    // Validamos el quiz antes de guardar
    var errors = quiz.validate();
    if (errors) {
        //se convierte en [] con la propiedad message por compatibilida con layout
        var i=0; var errores=new Array();
        for (var prop in errors) errores[i++]={message: errors[prop]}; 
        res.render('quizes/new', {quiz: quiz, errors: errores});
    } else {
        // guarda en BD los campos pregunta y respuesta de quiz
        quiz.save({fields: ["pregunta", "respuesta", "tema"]})
            .then(function() {
                res.redirect('/quizes');
            });
    };
    
    
    
};

exports.edit = function(req, res) {
    var quiz = req.quiz;
    res.render('quizes/edit', {quiz: quiz, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res) {
    req.quiz.pregunta = req.body.quiz.pregunta;
    req.quiz.respuesta = req.body.quiz.respuesta;
    req.quiz.tema = req.body.quiz.tema;
    
    var errors = req.quiz.validate();
    if (errors) {
        //se convierte en [] con la propiedad message por compatibilida con layout
        var i=0; var errores=new Array();
        for (var prop in errors) errores[i++]={message: errors[prop]}; 
        res.render('quizes/edit', {quiz: req.quiz, errors: errores});
    } else {
        req.quiz.save({fields: ["pregunta", "respuesta", "tema"]})
        .then(function() {
            res.redirect('/quizes');
        });
    }
};

// DELETE /quizes/:id
exports.destroy = function(req, res) {
    req.quiz.destroy().then( function() {
        res.redirect('/quizes');
    }).catch(function(error) {next(error);});
};