function isValidAge(age) {
    const num = parseInt(age);
    return !isNaN(num) && num >= 18 && num <= 100;
}

function isValidBio(bio) {
    return bio && bio.length > 0 && bio.length <= 500;
}

module.exports = {
    isValidAge,
    isValidBio
};
