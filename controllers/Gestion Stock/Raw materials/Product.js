const { PrismaClient } = require('@prisma/client')
    , prisma = new PrismaClient()
    , { successMessage, errorMessage, checkEmpty } = require('../../../middlewares/Functions');

module.exports = class Product {
    // create
    async create({ body }, res) {
        try {
            checkEmpty(body)
            await prisma.matierePremiere.create({
                data: { designation: body?.designation?.toUpperCase() }
            });
            successMessage(res, `Produit ajouté avec succès`)
        } catch (error) {
            errorMessage(res, error)
        }
    }

    // get
    async get({ }, res) {
        try {
            const data = await prisma.matierePremiere.findMany({
                where: { deleted: false },
                orderBy: { designation: `asc` }
            });
            if (!data.length)
                throw `Aucune information...`;
            successMessage(res, `${data.length} produit(s) trouvé(s)`, data)
        } catch (error) {
            errorMessage(res, error)
        }
    }

    // get By ID
    async getByID({ params }, res) {
        try {
            const data = await prisma.matierePremiere.findUnique({
                where: { id: params.id }
            });
            if (!data)
                throw `Aucune information...`;
            successMessage(res, `Detail ${data?.designation}`, data)
        } catch (error) {
            errorMessage(res, error)
        }
    }

    // update
    async update({ params, body }, res) {
        try {
            checkEmpty(body)
            await prisma.matierePremiere.update({
                where: { id: params.id },
                data: { designation: body?.designation?.toUpperCase() }
            });
            successMessage(res, `Produit modifié avec succès.`)
        } catch (error) {
            errorMessage(res, error)
        }
    }

    // delete
    async delete({ params }, res) {
        try {
            await prisma.matierePremiere.update({
                where: { id: params.id },
                data: { deleted: true }
            });
            successMessage(res, `Produit supprimé avec succès.`)
        } catch (error) {
            errorMessage(res, error)
        }
    }
}
