const { PrismaClient } = require('@prisma/client')
    , prisma = new PrismaClient()
    , { successMessage, errorMessage, checkEmpty } = require('../../../middlewares/Functions');

module.exports = class SortieStock {
    // create
    async create({ body }, res) {
        try {
            checkEmpty(body)
            const { productId, dateOperation, ...data } = body;
            const row = await prisma.matierePremiere.update({
                where: { id: productId },
                data: {
                    kiloDisponible: { increment: data?.nombreKg },
                    EntreeStock: {
                        create: {
                            ...data,
                            dateOperation: !dateOperation ? new Date() :
                                new Date(dateOperation)
                        }
                    }
                }
            })
            successMessage(res, `Stock ${row?.designation} ravitaillé avec succès.`)
        } catch (error) {
            errorMessage(res, error)
        }
    }

    // get
    async get({ }, res) {
        try {
            const data = await prisma.entreeStock.findMany({
                where: { deleted: false },
                orderBy: { dateOperation: `desc` }
            });
            if (!data.length)
                throw `Aucune information...`;
            successMessage(res, `${data.length} resultat(s) trouvé(s)`, data)
        } catch (error) {
            errorMessage(res, error)
        }
    }

    // get By ID
    async getByID({ params }, res) {
        try {
            const data = await prisma.entreeStock.findUnique({
                where: { id: params.id }
            });
            if (!data)
                throw `Aucune information...`;
            successMessage(res, `Detail operation`, data)
        } catch (error) {
            errorMessage(res, error)
        }
    }

    // update
    async update({ params, body }, res) {
        try {
            checkEmpty(body)
            const
                { dateOperation, ...data } = body,
                entreeStock = await prisma.entreeStock.findUnique({
                    where: { id: params.id },
                    include: {
                        MatierePremiere: {
                            select: {
                                kiloDisponible: true
                            }
                        }
                    }
                });

            if (!entreeStock)
                throw `ID invalide...`;

            const kilo = (entreeStock?.MatierePremiere?.kiloDisponible - entreeStock?.nombreKg)
                + data?.nombreKg;
            await prisma.matierePremiere.update({
                where: { id: entreeStock?.matierePremiereId },
                data: {
                    kiloDisponible: { set: kilo },
                    EntreeStock: {
                        update: {
                            where: { id: entreeStock?.id },
                            data: {
                                ...data,
                                dateOperation: !dateOperation ? new Date() :
                                    new Date(dateOperation)
                            }
                        }
                    }
                }
            })
            successMessage(res, `Opération reussie...`)
        } catch (error) {
            errorMessage(res, error)
        }
    }

    // delete
    async delete({ params }, res) {
        try {
            const entreeStock = await prisma.entreeStock.findUnique({
                where: { id: params.id }
            });

            if (!entreeStock)
                throw `ID invalide...`;

            await prisma.matierePremiere.update({
                where: { id: entreeStock?.matierePremiereId },
                data: {
                    kiloDisponible: { decrement: entreeStock?.nombreKg },
                    EntreeStock: {
                        delete: { id: entreeStock?.id }
                    }
                }
            })
            successMessage(res, `Suppression avec succès.`)
        } catch (error) {
            errorMessage(res, error)
        }
    }
}
