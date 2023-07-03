const
    { PrismaClient } = require('@prisma/client')
    , jwt = require("jsonwebtoken")
    , prisma = new PrismaClient();

module.exports.errorMessage = (res, message) => {
    res.status(500).json({
        state: false,
        message: message,
    });
};

module.exports.successMessage = (res, message, data) => {
    res.status(200).json({
        state: true,
        message: message,
        data: data
    });
};

module.exports.checkEmpty = (object) => {
    for (const i in object) {
        if (!object[i]) {
            throw `Veillez remplir le Champ ${i}...`;
        }
    }
};

module.exports.checkNumber = (object) => {
    for (const i in object) {
        if (object[i] < 0 || typeof object[i] == 'string') {
            throw `La valeur du Champ ${i} est invalide...`;
        }
    }
};

module.exports.GenerateUsername = async () => {
    try {
        const data = await prisma.users.findMany();
        return `@@@user0${++data.length}`;
    } catch (error) {
        console.log(error)
    }
};

module.exports.GenerateToken = (data) => {
    return jwt.sign(
        { data },
        process.env.SECRET_TOKEN,
        { expiresIn: `24h` }
    );
};

module.exports.DecodedToken = (token) => {
    return jwt.decode(token).data;
};

module.exports.VerifyToken = ({ headers }, res, next) => {
    try {
        if (!jwt.verify(headers.authorization, process.env.SECRET_TOKEN).data)
            throw `Erreur token`;
        next();
    } catch (error) {
        this.errorMessage(res, error.message)
    }
};

module.exports.GetMois = (date) => {
    return new Intl
        .DateTimeFormat(`fr-FR`, { month: `long`, year: `numeric` })
        .format(new Date(date))
};

