const { PrismaClient } = require('@prisma/client')
    , { user } = require('../bin/Data/Infos')
    , { hashSync, genSaltSync } = require('bcrypt')
    , { GenerateUsername } = require('../middlewares/Functions')
    , prisma = new PrismaClient();

module.exports.Check_API = async () => {
    try {
        await prisma.$connect();
        await GenerateUserSysteme()
        console.log(`Connexion à la Base de Données Reussie...`);
    } catch (error) {
        console.error(error)
    }
};

// Generate default user
async function GenerateUserSysteme() {
    const userData = await prisma.users.findFirst({
        where: { deleted: false }
    });
    if (!userData) {
        const username = await GenerateUsername();
        await prisma.users.create({
            data: {
                ...user,
                username: username,
                password: hashSync(`2298`, genSaltSync(10))
            }
        });
        console.log(`Utilisateur généré avec succès...`);
    }
};

