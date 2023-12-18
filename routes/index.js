var express = require('express');
const SalasController = require('../Controllers/Salas');
var router = express.Router();

/**
 * >Rota para adicionar uma ou mais salas ao sistema
 */
router.post('/salas', function (req, res, next) {
    let salas = req.body;
    if (Array.isArray(salas)) { //> várias salas
        SalasController.addSalas(salas)
            .then((result) => {
                res.jsonp(result)
            }).catch((err) => {
                res.status(500).jsonp({ msg: err.message })
            });
    } else { //> uma sala
        SalasController.addSala(salas)
            .then((result) => {
                res.jsonp(result)
            }).catch((err) => {
                res.status(500).jsonp({ msg: err.message })
            });
    }
});

/**
 * >Rota para retornar as salas disponíveis tendo em conta os alunos, data+hora de preferência e duração da prova
 */
router.post('/salas/calendarizacao', function (req, res, next) {
    let dados = req.body; //> alunos, data+hora de preferência e duração da prova
    SalasController.getSalasDisponiveis(dados.alunos, dados.dataHora, dados.duracao)
        .then((result) => {
            res.jsonp(result)
        }).catch((err) => {
            res.status(500).jsonp({ msg: err.message })
        });
})

/**
 * >Rota para alocar uma sala num certo intervalo de tempo. 
 */
router.post('/salas/:idSala/alocar', function (req, res, next) {
    let dados = req.body;
    
})

module.exports = router;
