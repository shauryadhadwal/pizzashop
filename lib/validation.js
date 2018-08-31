// Container for all validation methods
const valid = {};

valid.phone = (value) => {
    return typeof (value) == 'string' && value.trim().length == 13 ? value.trim() : false;
}

valid.password = (value) => {
    return typeof (value) == 'string' && value.trim().length > 0 ? value.trim() : false;
}

valid.email = (value) => {
    return typeof (value) == 'string' && value.trim().length > 0 ? value.trim() : false;
}

valid.address = (value) => {
    return typeof (value) == 'string' && value.trim().length > 0 ? value.trim() : false;
}

valid.firstName = (value) => {
    return typeof (value) == 'string' && value.trim().length > 0 ? value.trim() : false;
}

valid.lastName = (value) => {
    return typeof (value) == 'string' && value.trim().length > 0 ? value.trim() : false;
}

valid.orderId = (value) => {
    return typeof (value) == 'string' && value.trim().length == 10 ? value.trim() : false;
}

valid.token = (value) => {
    return typeof (value) == 'string' ? value.trim() : false;
}

valid.card = (object) => {
    const date = new Date;

    return typeof (object) == 'object' &&
        typeof (parseInt(object.number, 10)) == 'number' &&
        typeof (parseInt(object.cvc, 10)) == 'number' &&
        typeof (parseInt(object.exp_month, 10)) == 'number' &&
        typeof (parseInt(object.exp_year, 10)) == 'number' &&
        object.number.trim().length > 14 &&
        object.number.trim().length < 16 &&
        parseInt(object.exp_year, 10) >= date.getFullYear() &&
        parseInt(object.exp_year, 10) < 2099 &&
        parseInt(object.exp_month, 10) >= (date.getMonth() + 1) &&
        parseInt(object.exp_month, 10) <= 12 &&
        object.cvc.trim().length == 3 ? object : false;
}

module.exports = valid;