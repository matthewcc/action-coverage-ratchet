module.exports.readVersion = function (contents) {
    const match = contents.match(/millerknoll-digital\/action-coverage-ratchet@v(\d+\.\d+\.\d+)/);

    return match[1];
};

module.exports.writeVersion = function (contents, version) {
    return contents.replaceAll(/(millerknoll-digital\/action-coverage-ratchet@v)(\d+\.\d+\.\d+)/g, `$1${version}`);
};
