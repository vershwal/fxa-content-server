/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A variant of the FxSync broker that communicates with the
 * browser via WebChannels. Each command is prefixed with `fxaccounts:`
 */

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const { ACCOUNT_UPDATES_WEBCHANNEL_ID } = require('lib/constants');
  const FxSyncAuthenticationBroker = require('./fx-sync');
  const WebChannel = require('lib/channels/web');

  const proto = FxSyncAuthenticationBroker.prototype;

  module.exports = FxSyncAuthenticationBroker.extend({
    type: 'fx-sync-web-channel',

    defaultCapabilities: _.extend({}, proto.defaultCapabilities, {
      sendChangePasswordNotice: false
    }),

    commands: {
      BROWSER_STATUS: 'fxaccounts:fxa_status',
      CAN_LINK_ACCOUNT: 'fxaccounts:can_link_account',
      CHANGE_PASSWORD: null,
      DELETE_ACCOUNT: 'fxaccounts:delete_account',
      LOADED: 'fxaccounts:loaded',
      LOGIN: 'fxaccounts:login'
      /*
      SYNC_PREFERENCES: 'fxaccounts:sync_preferences' // Removed in issue #4250
      */
    },

    createChannel () {
      const channel = new WebChannel(ACCOUNT_UPDATES_WEBCHANNEL_ID);
      channel.initialize({
        window: this.window
      });

      return channel;
    }
  });
});
