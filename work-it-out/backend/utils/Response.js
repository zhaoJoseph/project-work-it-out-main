module.exports = class Response {
    constructor(type, statusCode, message, data) {
        this.type = type;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
    };
}
