/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A variant of the FxSync broker that speaks "v4" of the protocol.
 *
 * v4 enables the `browserStatus` check to query the browser for
 * the currently signed in user.
 */

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const FxDesktopV3AuthenticationBroker = require('./fx-desktop-v3');

  var proto = FxDesktopV3AuthenticationBroker.prototype;

  module.exports = FxDesktopV3AuthenticationBroker.extend({
    defaultCapabilities: _.extend({}, proto.defaultCapabilities, {
      browserStatus: true
    }),

    type: 'fx-desktop-v4'
  });
});
