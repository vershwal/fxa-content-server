/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const Environment = require('lib/environment');
  const sinon = require('sinon');
  const WindowMock = require('../../mocks/window');

  describe('lib/environment', () => {
    var environment;
    var windowMock;

    beforeEach(() => {
      windowMock = new WindowMock();
      environment = new Environment(windowMock);
    });

    describe('hasTouchEvents', () => {
      it('return `true` if the UA supports touch events', () => {
        windowMock.ontouchstart = true;
        windowMock.DocumentTouch = windowMock.document;

        assert.isTrue(environment.hasTouchEvents());
      });

      it('returns `false` if the UA does not support touch events', () => {
        assert.isFalse(environment.hasTouchEvents());
      });
    });

    describe('hasPasswordRevealer', () => {
      it('returns `true` if the UA has its own password revealer (IE >= 10)', () => {
        windowMock.document.documentMode = 10;

        assert.isTrue(environment.hasPasswordRevealer());
      });

      it('returns `false` if UA has no password revealer', () => {
        assert.isFalse(environment.hasPasswordRevealer());
      });
    });

    describe('hasGetUserMedia', () => {
      beforeEach(() => {
        windowMock.navigator.mediaDevices = null;
        delete windowMock.navigator.mediaDevices;

        windowMock.navigator.getUserMedia = null;
        delete windowMock.navigator.getUserMedia;
      });


      it('returns `true` if UA supports mediaDevices', () => {
        windowMock.navigator.mediaDevices = {
          getUserMedia: sinon.spy()
        };

        assert.isTrue(environment.hasGetUserMedia());
      });

      it('returns `true` if UA supports getUserMedia', () => {
        windowMock.navigator.getUserMedia = sinon.spy();

        assert.isTrue(environment.hasGetUserMedia());
      });

      it('returns `true` if UA supports webkitGetUserMedia', () => {
        windowMock.navigator.webkitGetUserMedia = sinon.spy();

        assert.isTrue(environment.hasGetUserMedia());
      });

      it('returns `true` if UA supports mozGetUserMedia', () => {
        windowMock.navigator.mozGetUserMedia = sinon.spy();

        assert.isTrue(environment.hasGetUserMedia());
      });

      it('returns `true` if UA supports msGetUserMedia', () => {
        windowMock.navigator.msGetUserMedia = sinon.spy();

        assert.isTrue(environment.hasGetUserMedia());
      });

      it('returns false otw', () => {
        assert.isFalse(environment.hasGetUserMedia());
      });
    });

    describe('isFramed', () => {
      it('returns `true` if window is iframed', () => {
        windowMock.top = new WindowMock();

        assert.isTrue(environment.isFramed());
      });

      it('returns `false` if window is not iframed', () => {
        assert.isFalse(environment.isFramed());
      });

      it('returns `false` if the window\'s name is `remote`', () => {
        // `name=remote` is used by `about:accounts` by Fx Desktop. Do not
        // consider this framed.
        windowMock.top = new WindowMock();
        windowMock.name = 'remote';
        assert.isFalse(environment.isFramed());
      });

      it('returns `false` if the window\'s name is `payflow`', () => {
        // `name=payflow` is used by Marketplace on Fx for Android during
        // the Reset PIN flow. Do not consider this framed.
        windowMock.top = new WindowMock();
        windowMock.name = 'payflow';
        assert.isFalse(environment.isFramed());
      });
    });

    describe('isAboutAccounts', () => {
      it('returns `true` if `remote` framed', () => {
        windowMock.top = new WindowMock();
        windowMock.name = 'remote';
        assert.isTrue(environment.isAboutAccounts());
      });

      it('returns `false` if name is not remote', () => {
        windowMock.top = new WindowMock();
        windowMock.name = undefined;
        assert.isFalse(environment.isAboutAccounts());

        windowMock.name = '';
        assert.isFalse(environment.isAboutAccounts());
      });

      it('returns `true` if query param used', () => {
        windowMock.top = new WindowMock();
        windowMock.name = undefined;
        windowMock.location.search = '?service=sync&forceAboutAccounts=true';
        assert.isTrue(environment.isAboutAccounts());
      });
    });

    describe('isFunctionalTests', () => {
      it('returns `true` if UA string contains `FxaTester`, `false` otw', () => {
        windowMock.navigator.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:52.0) Gecko/20100101 Firefox/52.0';
        assert.isFalse(environment.isFunctionalTests());

        windowMock.navigator.userAgent = 'Mozilla / 5.0(Macintosh; Intel Mac OS X 10.10; rv: 40.0) Gecko/ 20100101 Firefox/ 40.0 FxATester/ 1.0';
        assert.isTrue(environment.isFunctionalTests());
      });
    });

    describe('isFxiOS', () => {
      it('returns `true` if on Fx for iOS', () => {
        windowMock.navigator.userAgent = 'FxiOS/1.0';

        assert.isTrue(environment.isFxiOS());
      });

      it('returns `false` if not on Fx for iOS', () => {
        windowMock.navigator.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:40.0) Gecko/20100101 Firefox/40.0';

        assert.isFalse(environment.isFxiOS());
      });
    });

    describe('hasSendBeacon', () => {
      it('returns `true` if sendBeacon function exists', () => {
        windowMock.navigator.sendBeacon = () => {};
        assert.isTrue(environment.hasSendBeacon());
      });

      it('returns `false` if sendBeacon is undefined', () => {
        windowMock.navigator.sendBeacon = undefined;
        assert.isFalse(environment.hasSendBeacon());
      });
    });
  });
});

