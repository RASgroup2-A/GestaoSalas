const Salas = require("../Models/Salas")
const ObjectId = require("mongoose").Types.ObjectId

module.exports.addSala = async (sala) => {
    if (!('ocupacao' in sala)) { //> caso não tenha o campo ocupacao
        sala.ocupacao = []
    }
    return await Salas.collection.insertOne(sala)
}

module.exports.addSalas = async (salas) => {
    for (let i = 0; i < salas.length; i++) {
        if (!('ocupacao' in salas[i])) { //> caso não tenha o campo ocupacao
            salas[i].ocupacao = []
        }
    }
    return await Salas.collection.insertMany(salas)
}

module.exports.alocarSala = async (idSala, dataHora, duracao) => {
    let data = new Date(dataHora);
    data.setMinutes(data.getMinutes() + duracao); //> Assume-se a "duracao" em MINUTOS
    let horaInicio = dataHora
    let horaFim = data.toISOString().replace('T', ' ').slice(0, 16)

    let horario = {
        dataHoraInicio: horaInicio,
        dataHoraFim: horaFim
    }
    return await Salas.updateOne({ _id: new ObjectId(idSala) }, {
        $push: {
            ocupacao: horario
        }
    })
}

module.exports.alocarSalas = async (alocacoes) => {
    try {
        let count = 0
        for(let i = 0; i < alocacoes.length; i++, count++) {
            let alocacao = alocacoes[i]
            let {idSala, dataHora, duracao} = alocacao
            await this.alocarSala(idSala, dataHora, duracao)
        }
        return {msg: `${count} salas alocadas`}
    } catch (err) {
        throw err
    }
}

module.exports.getSalas = async () => {
    try {
        const salas = await Salas.find();
        return salas;
    } catch (error) {
        throw new Error('Erro ao obter todas as salas: ' + error.message);
    }
}

module.exports.getSalasDisponiveis = async (alunos, dataHora, duracao) => {
    let data = new Date(dataHora);
    data.setMinutes(data.getMinutes() + duracao); //> Assume-se a "duracao" em MINUTOS
    let horaInicio = dataHora
    let horaFim = data.toISOString().replace('T', ' ').slice(0, 19)
    //> Obtém as salas onde essa prova pode ser realizada
    let salasDisponiveis = await Salas.aggregate(
        [
            {
                $match: {
                    'ocupacao': {
                        $not: {
                            $elemMatch: {
                                $and: [
                                    { 'dataHoraInicio': { $lt: horaFim } },
                                    { 'dataHoraFim': { $gt: horaInicio } },
                                ]
                            }
                        }
                    }
                }
            },
            { $project: { _id: 1, edificio: 1, numSala: 1, piso: 1, capacidade: 1 } },
            { $sort: { capacidade: -1 } }
        ]
    )
    //> Aloca os alunos às salas disponíveis
    for (let i = 0; i < salasDisponiveis.length && alunos.length > 0; i++) {
        let sala = salasDisponiveis[i]
        let capacidade = sala.capacidade
        sala.alunos = alunos.slice(0, capacidade)
        alunos = alunos.slice(capacidade)
    }

    salasDisponiveis = salasDisponiveis.filter(sala => 'alunos' in sala) //> Fica apenas com as salas que possuem alunos alocados
    //> Caso em que a calendarização não é possível dado que não há capacidade para alocar todos os alunos em salas
    if (alunos.length > 0) {
        return []
    }

    return salasDisponiveis
}

module.exports.removeSala = async (idSala) => {
    return await Salas.collection.deleteOne({ _id: idSala});
}