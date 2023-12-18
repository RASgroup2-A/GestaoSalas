const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const horarioSchema = new mongoose.Schema({
    dataHoraInicio: String,
    dataHoraFim: String
})

const salaSchema = new mongoose.Schema({
    _id: ObjectId,
    edificio: String,
    numSala: String,
    piso: String,
    capacidade: Number,
    ocupacao: [horarioSchema] //! MENCIONAR ESTA ALTERAÇÃO NO RELATÓRIO
}, { collection: 'salas' })

module.exports = mongoose.model('sala', salaSchema)
