const apiKeys = new Map();
apiKeys.set('123456789', {
    id: 1,
    name: 'app1',
    secret: 'secret1'
});
apiKeys.set('987654321', {
    id: 2,
    name: 'app2',
    secret: 'secret2'
});
module.exports = (keyId, done) => {
    if (!apiKeys.has(keyId)) {
        return done(new Error('Unknown api key'))
    }
    const clientApp = apiKeys.get(keyId);
    done(null, clientApp.secret, {
        id: clientApp.id,
        name: clientApp.name
    });
}