// Unit testing for websockets application

var chai = require('chai');
var expect = require('chai').expect;
var wsclient = require('websocket').client;
var rdb = require('rethinkdb');

chai.use(require('chai-http'));

var app = require('../src/server.js');

var connection = null;
var rdbconn = null;
var testws = null;

describe('', function () {

    this.timeout(3000);

    const newJob = {
        "JobTarget":{
            "PluginName": "advancer",
            "Location": "8.8.8.8",
            "Port": "80"
        },
        "JobCommand":{
            "CommandName": "TestJob",
            "Tooltip": "for testing jobs",
            "Inputs":[]
        },
        "Status": "Ready",
        "StartTime" : 0
    };

    before(function (done) {
        testws = new wsclient();
        rdb.connect( {host: 'localhost', port: 28015}, function(err, conn) {
            if (err) throw err;
            rdbconn = conn;
            rdb.db('Brain').tableList().run(rdbconn, function (err, result) {
                if (err) throw err;
                done();
            });
        });
    });

    after(function(done) {
        done();
    });

    /*it('should return index page', function () {
        return chai.request(app)
            .get('/')
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.html;
            })
    });*/

    it('should confirm Websockets connection', function (done) {
        testws.on('connect', function (conn) {
            if (conn.connected) {
                connection = conn;
                connection.once('message', function (message) {
                    expect(typeof(message.utf8Data)).to.equal('string');
                    expect(message.utf8Data).equal("Websocket connection established. Awaiting feed selection...");
                    done();
                });
            }
        });
        testws.connect('ws://localhost:3000/monitor');
    });

    it('should confirm Rethinkdb connection', function (done) {
        if (connection.connected) {
            connection.once('message', function (message) {
                expect(typeof(message.utf8Data)).to.equal('string');
                expect(message.utf8Data).equal("Waiting for changes in job statuses...");
                done();
            });
            connection.send('status');
        }
    });

    it('should not open feed on invalid parameter', function (done) {
        if (connection.connected) {
            const invalidSelection = "foo";
            connection.once('message', function (message) {
                expect(typeof(message.utf8Data)).to.equal('string');
                expect(message.utf8Data).equal("foo not a valid feed!");
                done();
            });
            connection.send(invalidSelection);
        }
    });

    it('should push job status updates to client', function (done) {
        if (connection.connected) {
            connection.once('message', function (message) {
                expect(typeof(JSON.parse(message.utf8Data))).to.equal('object');
                data = JSON.parse(message.utf8Data);
                expect(data.status).to.equal("Done");
                done();
            });
        }
        rdb.db('Brain').table('Jobs').insert(newJob)
        .run(rdbconn, function (err, result) {
            if (err) throw err;
            rdb.db('Brain').table('Jobs').get(result.generated_keys[0])
            .update({"Status": "Done"})
            .run(rdbconn, function (err, result) {
                if (err) throw err;
            });
        });
    });

})