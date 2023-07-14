const { PrismaClient } = require('@prisma/client')
    , prisma = new PrismaClient()
    , { successMessage, errorMessage, checkEmpty } = require('../../../middlewares/Functions');

module.exports = class Fournisseur {
    // create
    async create({ body }, res) {
        try {
            const { nomComplet } = body;
            checkEmpty({ nomComplet })
            await prisma.fournisseur.create({
                data: body
            });
            successMessage(res, `Fournisseur ajouté avec succès`)
        } catch (error) {
            errorMessage(res, error)
        }
    }

    // get
    async get({ }, res) {
        try {
            const data = await prisma.fournisseur.findMany({
                where: { deleted: false },
                orderBy: { nomComplet: `asc` }
            });
            if (!data.length)
                throw `Aucune information...`;
            successMessage(res, `${data.length} Fournisseur(s) trouvé(s)`, data)
        } catch (error) {
            errorMessage(res, error)
        }
    }

    // get By ID
    async getByID({ params }, res) {
        try {
            const data = await prisma.fournisseur.findUnique({
                where: { id: params.id }
            });
            if (!data)
                throw `Aucune information...`;
            successMessage(res, `Detail ${data?.nomComplet}`, data)
        } catch (error) {
            errorMessage(res, error)
        }
    }

    // update
    async update({ params, body }, res) {
        try {
            const { nomComplet } = body;
            checkEmpty({ nomComplet })
            await prisma.fournisseur.update({
                where: { id: params.id },
                data: body
            });
            successMessage(res, `Fournisseur modifié avec succès.`)
        } catch (error) {
            errorMessage(res, error)
        }
    }

    // delete
    async delete({ params }, res) {
        try {
            await prisma.fournisseur.update({
                where: { id: params.id },
                data: { deleted: true }
            });
            successMessage(res, `Fournisseur supprimé avec succès.`)
        } catch (error) {
            errorMessage(res, error)
        }
    }
}
