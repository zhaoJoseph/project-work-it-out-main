const { createSession, getSessionPeriod } = require("../services/session-service");

module.exports = {
    async createSession({body}, res) {
        const result = await createSession(body.id, body.session);
        if(result.type ===  "Error") return res.status(result.statusCode).json({ message : result.message});
        res.status(200).json(result.data);
    },

    async getSessionsPeriod({params, query}, res) {
        const result = await getSessionPeriod(query.startDate, query.endDate, params.id);
        if(result.type ===  "Error") return res.status(result.statusCode).json({ message : result.message});
        res.status(200).json(result.data);
    }
}