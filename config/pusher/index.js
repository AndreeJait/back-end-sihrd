const Pusher = require('pusher')
module.exports = pusher = new Pusher({
    appId: "1209125",
    key: "bf6ca9c87652961b0414",
    secret: "10805cd802c124966315",
    cluster: "ap1",
    useTLS: true
});