/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, TestHelpers, FunctionalHelpers) {
  const config = intern.config;
  const SIGNIN_URL = config.fxaContentRoot + 'signin?context=fx_desktop_v4&service=sync&forceAboutAccounts=true';
  const SETTINGS_URL = config.fxaContentRoot + 'settings?context=fx_desktop_v4&service=sync';

  var email;
  const PASSWORD = '12345678';

  const SELECTOR_CONFIRM_SIGNIN_HEADER = '#fxa-confirm-signin-header';
  const SELECTOR_EMAIL_INPUT = 'input[type=email]';
  const SELECTOR_PASSWORD_INPUT = 'input[type=password]';
  const SELECTOR_SETTINGS_HEADER = '#fxa-settings-header';
  const SELECTOR_SIGNIN_HEADER = '#fxa-signin-header';

  const clearBrowserState = FunctionalHelpers.clearBrowserState;
  const createUser = FunctionalHelpers.createUser;
  const fillOutSignIn = FunctionalHelpers.fillOutSignIn;
  const openPage = FunctionalHelpers.openPage;
  const respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;
  const testElementExists = FunctionalHelpers.testElementExists;
  const testElementValueEquals = FunctionalHelpers.testElementValueEquals;
  const testIsBrowserNotified = FunctionalHelpers.testIsBrowserNotified;
  const thenify = FunctionalHelpers.thenify;

  var userData;

  const openSignInPage = thenify(function (signedInUser) {
    return this.parent
      .then(openPage(SIGNIN_URL, SELECTOR_SIGNIN_HEADER, {
        afterOpen() {
          return this.parent
            .then(respondToWebChannelMessage('fxaccounts:fxa_status', { signedInUser: signedInUser }))
            .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true }));
        }
      }));
  });

  const openSettingsPage = thenify(function (signedInUser, readySelector) {
    return this.parent
      .then(openPage(SETTINGS_URL, readySelector, {
        afterOpen() {
          return this.parent
            .then(respondToWebChannelMessage('fxaccounts:fxa_status', { signedInUser: signedInUser }));
        }
      }));
  });

  registerSuite({
    name: 'Firefox Desktop Sync v4 settings',

    beforeEach: function () {
      email = TestHelpers.createEmail('sync{id}');

      return this.remote
        .then(clearBrowserState({ force: true }))
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then((_userData) => {
          userData = _userData;
        });
    },

    'browser has stored user data, FxA does not': function () {
      return this.remote
        .then(openSettingsPage(userData, SELECTOR_SETTINGS_HEADER))
        .then(testIsBrowserNotified('fxaccounts:fxa_status'));
    },

    'FxA has stored user data, browser does not': function () {
      return this.remote
        .then(openSignInPage(null))

        // sign in to seed localStorage
        .then(fillOutSignIn(email, PASSWORD))
        .then(testElementExists(SELECTOR_CONFIRM_SIGNIN_HEADER))

        // The browser says no user is signed in, info in localStorage
        // was removed, user must sign in again.
        .then(openSettingsPage(null, SELECTOR_SIGNIN_HEADER))

        .then(testElementValueEquals(SELECTOR_EMAIL_INPUT, ''))
        .then(testElementValueEquals(SELECTOR_PASSWORD_INPUT, ''));
    }
  });
});
