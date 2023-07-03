const
    { PrismaClient } = require('@prisma/client')
    , {
        checkEmpty,
        GenerateToken,
        GenerateUsername,
        errorMessage,
        successMessage
    } = require('../../../middlewares/Functions')
    , { hashSync, genSaltSync, compareSync } = require('bcrypt')
    , { generate } = require('generate-password')
    , prisma = new PrismaClient();

module.exports = class Auth {
    // login
    async login({ body }, res) {
        try {
            checkEmpty(body)
            const user = await prisma.users.findUnique({
                where: { username: body.username }
            });
            if (!user)
                throw `Le compte utilisateur ${body.username} introuvable...`;
            if (!compareSync(body.password, user.password))
                throw `Mot de passe incorrect...`;
            if (!user.active)
                throw `Accès intérdit au système...`;
            const { deleted, updatedAt, createdAt, connected, username, password, phone, ...data } = user;
            successMessage(res, `Connexion Etablie...`, {
                ...data,
                token: GenerateToken(data)
            })
        } catch (error) {
            errorMessage(res, error)
        }
    }

    // Create
    async create({ body }, res) {
        try {
            checkEmpty(body)
            const username = await GenerateUsername(),
                pwd = `2298`;
            // ,pwd = generate({ numbers: true, length: 15, strict: true })
            await prisma.users.create({
                data: {
                    ...body,
                    username: username.toLocaleLowerCase(),
                    password: hashSync(pwd, genSaltSync(10))
                }
            });
            // sendMail(body.email, `Compte utilisateur BITEYELO APP`, `### Nom utilisateur : ${username} et ### Mot de passe : ${pwd}`)
            successMessage(res, `Utilisateur créé avec succès`, {
                username: username,
                password: pwd
            })
        } catch (error) {
            errorMessage(res, error)
        }
    }

    // Get
    async get({ }, res) {
        try {
            const data = await (await prisma.users.findMany({
                where: { deleted: false }
            })).map(user => {
                const { deleted, password, ...data } = user;
                return data
            });
            if (!data.length) throw `Aucune information...`;
            successMessage(res, `${data.length} utilisateur(s) trouvé(s)`, data)
        } catch (error) {
            errorMessage(res, error)
        }
    }

    // Get by ID
    async getByID({ params }, res) {
        try {
            const { deleted, password, ...data } = await prisma.users.findUnique({ where: { id: params.id } });
            if (!data)
                throw `Aucune informatiom...`;
            successMessage(res, `Infos user ${data.fullname}`, data)
        } catch (error) {
            errorMessage(res, error)
        }
    }

    // Update
    async update({ params, body }, res) {
        try {
            await prisma.users.update({
                where: { id: params.id },
                data: body
            });
            successMessage(res, `Modification effectuée avec succès...`)
        } catch (error) {
            errorMessage(res, error)
        }
    }

    // Update password user
    async updatePassword({ params, body }, res) {
        try {
            await checkEmpty(body)
            const user = await prisma.users.findUnique({
                where: { id: params.id }
            });
            if (!user)
                throw `L'utilisateur n'existe pas...`;
            if (!compareSync(body.oldPassword, user.password))
                throw `Echec de l'opération car l'ancien mot de passe est incorrect...`;
            await prisma.users.update({
                where: { id: params.id },
                data: { password: hashSync(body.newPassword, genSaltSync(10)) }
            });
            successMessage(res, `Mot de passe modifié avec succès...`)
        } catch (error) {
            errorMessage(res, error)
        }
    }

    // Reset password 
    async resetPassword({ params }, res) {
        try {
            const user = await prisma.users.findUnique({ where: { id: params.id } });
            if (!user)
                throw `L'utilisateur n'existe pas...`;
            const pwd = generate({ numbers: true, length: 15, strict: true });
            await prisma.users.update({
                where: { id: user.id },
                data: { password: hashSync(pwd, genSaltSync(10)) },
            });
            successMessage(res, `Mot de passe utilisateur réinitialisé avec succès`, {
                newPassword: pwd
            });
        } catch (error) {
            errorMessage(res, error)
        }
    }

    // Toggle user 
    async toggle({ params }, res) {
        try {
            const user = await prisma.users.findUnique({ where: { id: params.id } });
            if (!user)
                throw `L'utilisateur n'existe pas...`;
            await prisma.users.update({
                where: { id: user.id },
                data: { active: !user.active }
            });
            successMessage(res, `L'utilisateur ${user.fullname} ${user.active ? 'desactivé' : 'activé'} avec succès...`)
        } catch (error) {
            errorMessage(res, error)
        }
    }

    // Delete
    async delete({ params }, res) {
        try {
            const user = await prisma.users.findUnique({ where: { id: params.id } });
            if (!user)
                throw `L'utilisateur n'existe pas...`;
            await prisma.users.update({
                where: { id: user.id },
                data: { deleted: true }
            });
            successMessage(res, `Utilisateur ${user.fullname} supprimé avec succès...`)
        } catch (error) {
            errorMessage(res, error)
        }
    }
}