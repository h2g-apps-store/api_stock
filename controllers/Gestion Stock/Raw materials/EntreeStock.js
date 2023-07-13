const { PrismaClient } = require('@prisma/client')
    , prisma = new PrismaClient()
    , { successMessage, errorMessage, checkEmpty } = require('../../../middlewares/Functions');

module.exports = class EntreeStock {
    // create
    async create({ body }, res) {
        try {
            checkEmpty(body)
            const { products, dateOperation, fournisseurId } = body;

            if (products && !products?.length)
                throw `Veuillez ajouter au moins un produit...`;

            // Check produits
            const productList = [];
            products.map((product, i) => {
                checkEmpty(product)
                const doublon = products.filter(x => x?.productId == product?.productId).length;
                if (doublon > 1)
                    throw `Le produit de la ligne ${++i} est repris ${doublon} fois.`;
                productList.push({
                    dateOperation: !dateOperation ? new Date() :
                        new Date(dateOperation),
                    fournisseurId: fournisseurId,
                    matierePremiereId: product?.productId,
                    prixAchatByKg: product?.prixAchatByKg,
                    nombreKg: product?.nombreKg
                })
            });

            // Save data
            productList.map(async data => {
                const { matierePremiereId, ...infos } = data;
                await prisma.matierePremiere.update({
                    where: { id: matierePremiereId },
                    data: {
                        kiloDisponible: { increment: data?.nombreKg },
                        EntreeStock: {
                            createMany: {
                                data: infos
                            }
                        }
                    }
                })
            });
            successMessage(res, `${productList.length} ligne(s) affectée(s) avec succès.`)
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
