/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {
  'use strict';

  const { assert } = require('chai');
  const FxDesktopV4AuthenticationBroker = require('models/auth_brokers/fx-desktop-v4');
  const p = require('lib/promise');
  const sinon = require('sinon');
  const WindowMock = require('../../../mocks/window');

  describe('models/auth_brokers/fx-desktop-v4', () => {
    let broker;
    let windowMock;

    beforeEach(() => {
      windowMock = new WindowMock();

      broker = new FxDesktopV4AuthenticationBroker({
        window: windowMock
      });
    });

    describe('capabilities', () => {
      it('has the `allowUidChange` capability', () => {
        assert.isTrue(broker.hasCapability('browserStatus'));
        assert.isTrue(broker.getCapability('browserStatus'));
      });
    });

    describe('fetch', () => {
      it('fetches user data from the browser', () => {
        const user = {
          getSignedInAccount: () => null,
          removeAccount: sinon.spy()
        };

        sinon.stub(broker, 'request', () => {
          return p({
            signedInUser: null
          });
        });

        return broker.fetch(user)
          .then(() => {
            assert.isTrue(broker.request.calledOnce);
            assert.isTrue(broker.request.calledWith('fxaccounts:fxa_status'));
          });
      });
    });
  });
});
