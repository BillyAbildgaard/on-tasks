// Copyright 2016, EMC, Inc.
/* jshint node:true */

'use strict';

describe("Job.Alert.Node.Discovered", function () {
    var waterline = {};
    var eventsProtocol = {};
    var NodeAlertJob;
    var uuid;

    before(function () {
        helper.setupInjector([
            helper.require('/spec/mocks/logger.js'),
            helper.requireGlob('/lib/services/*.js'),
            helper.require('/lib/jobs/base-job.js'),
            helper.require('/lib/jobs/node-discovered-alert-job.js'),
        ]);

        waterline = helper.injector.get('Services.Waterline');
        eventsProtocol = helper.injector.get('Protocol.Events');
        NodeAlertJob = helper.injector.get('Job.Alert.Node.Discovered');
        uuid = helper.injector.get('uuid');

        waterline.nodes = { needByIdentifier: function(){} };
        eventsProtocol.publishNodeEvent = function(){};
    });

    beforeEach(function() {
        this.sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
        this.sandbox.restore();
    });

    describe("node-discovered-alert", function() {
        var job;

        before(function() {
        });

        beforeEach(function() {
            job = new NodeAlertJob({}, { target: 'bc7dab7e8fb7d6abf8e7d6ab' }, uuid.v4());
        });

        it("should _run() pass without additional data", function() {
            this.sandbox.stub(waterline.nodes, 'needByIdentifier').resolves({ type: 'compute' });
            this.sandbox.stub(eventsProtocol, 'publishNodeEvent').resolves();

            return job._run()
            .then(function () {
                expect(waterline.nodes.needByIdentifier).to.have.been.calledOnce;
                expect(eventsProtocol.publishNodeEvent).to.have.been.calledOnce;
                expect(eventsProtocol.publishNodeEvent).to.have.been.calledWith(
                    { type: 'compute' },
                    'discovered'
                );
            });
        });

        it("should _run() pass with additional data", function() {
            this.sandbox.stub(waterline.nodes, 'needByIdentifier').resolves({ type: 'compute' });
            this.sandbox.stub(eventsProtocol, 'publishNodeEvent').resolves();

            job.context.data = {"something": "passed in"};

            return job._run()
            .then(function () {
                expect(waterline.nodes.needByIdentifier).to.have.been.calledOnce;
                expect(eventsProtocol.publishNodeEvent).to.have.been.calledOnce;
                expect(eventsProtocol.publishNodeEvent).to.have.been.calledWith(
                    { type: 'compute' },
                    'discovered',
                    job.context.data
                );
            });
        });

        it("should _run() assert error could be handled", function() {
            this.sandbox.stub(waterline.nodes, 'needByIdentifier').resolves({});
            return job._run()
            .then(function () {
                expect(waterline.nodes.needByIdentifier).to.have.been.calledOnce;
                expect(job._deferred).to.be.rejected;
            });
        });
    });
});
