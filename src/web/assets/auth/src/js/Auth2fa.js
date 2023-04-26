import {browserSupportsWebAuthn} from '@simplewebauthn/browser';

(function ($) {
  /** global: Craft */
  /** global: Garnish */
  Craft.Auth2fa = Garnish.Base.extend(
    {
      $mfaLoginFormContainer: null,
      $mfaSetupFormContainer: null,
      $alternativeMfaLink: null,
      $alternativeMfaTypesContainer: null,
      $viewSetupBtns: null,
      $errors: null,

      $slideout: null,
      $removeSetupButton: null,
      $closeButton: null,
      $verifyButton: null,

      init: function (settings) {
        this.$mfaLoginFormContainer = $('#mfa-form');
        this.$mfaSetupFormContainer = $('#mfa-setup');
        this.$alternativeMfaLink = $('#alternative-mfa');
        this.$alternativeMfaTypesContainer = $('#alternative-mfa-types');
        this.$viewSetupBtns = this.$mfaSetupFormContainer.find(
          'button.mfa-view-setup'
        );

        this.setSettings(settings, Craft.Auth2fa.defaults);

        this.addListener(
          this.$alternativeMfaLink,
          'click',
          'onAlternativeMfaTypeClick'
        );
        this.addListener(this.$viewSetupBtns, 'click', 'onViewSetupBtnClick');
      },

      showMfaForm: function (auth2faForm, $loginDiv) {
        this.$mfaLoginFormContainer.html('').append(auth2faForm);
        $loginDiv.addClass('mfa');
        $('#login-form-buttons').hide();
        const $submitBtn = this.$mfaLoginFormContainer.find('.submit');
        this.$errors = $('#login-errors');

        this.onSubmitResponse($submitBtn);
      },

      getCurrentMfaType: function ($container) {
        let currentMethod = $container.attr('data-2fa-type');

        if (currentMethod === undefined) {
          currentMethod = null;
        }

        return currentMethod;
      },

      onViewSetupBtnClick: function (ev) {
        const $button = $(ev.currentTarget);
        $button.disable();
        ev.preventDefault();

        const data = {
          selectedMethod: this.getCurrentMfaType($button),
        };

        Craft.sendActionRequest('POST', this.settings.setupSlideoutHtml, {data})
          .then((response) => {
            this.slideout = new Craft.Slideout(response.data.html);

            this.$errors = this.slideout.$container.find('.so-notice');
            this.$closeButton = this.slideout.$container.find('button.close');

            // initialise webauthn
            if (
              data.selectedMethod === 'craft\\mfa\\type\\WebAuthn' &&
              browserSupportsWebAuthn()
            ) {
              new Craft.WebAuthnSetup(this.slideout);
            }

            this.$verifyButton = this.slideout.$container.find('#mfa-verify');
            this.$removeSetupButton =
              this.slideout.$container.find('#mfa-remove-setup');

            this.addListener(this.$removeSetupButton, 'click', 'onRemoveSetup');
            this.addListener(this.$closeButton, 'click', 'onClickClose');
            this.addListener(this.$verifyButton, 'click', 'onVerify');
            this.addListener(this.slideout.$container, 'keypress', (ev) => {
              if (ev.keyCode === Garnish.RETURN_KEY) {
                this.$verifyButton.trigger('click');
              }
            });

            this.slideout.on('close', (ev) => {
              this.$removeSetupButton = null;
              this.slideout = null;
              $button.enable();
            });
          })
          .catch(({response}) => {
            // Add the error message
            Craft.cp.displayError(response.data.message);
            $button.enable();
          });
      },

      onClickClose: function (ev) {
        this.slideout.close();
      },

      onRemoveSetup: function (ev) {
        ev.preventDefault();

        let currentMethod = this.getCurrentMfaType(
          this.slideout.$container.find('#setup-form-2fa')
        );

        if (currentMethod === undefined) {
          currentMethod = null;
        }

        let data = {
          currentMethod: currentMethod,
        };

        const confirmed = confirm(
          Craft.t('app', 'Are you sure you want to delete this setup?')
        );

        if (confirmed) {
          Craft.sendActionRequest('POST', this.settings.removeSetup, {data})
            .then((response) => {
              $(ev.currentTarget).remove();
              Craft.cp.displayNotice(Craft.t('app', 'MFA setup removed.'));
            })
            .catch((e) => {
              Craft.cp.displayError(e.response.data.message);
            })
            .finally(() => {
              this.slideout.close();
            });
        }
      },

      onVerify: function (ev) {
        ev.preventDefault();

        const $submitBtn = this.slideout.$container.find('#mfa-verify');

        $submitBtn.addClass('loading');

        let data = {
          auth2faFields: {},
          currentMethod: null,
        };

        data.auth2faFields = this._getMfaFields(this.slideout.$container);
        data.currentMethod = this._getCurrentMethodInput(
          this.slideout.$container
        );

        Craft.sendActionRequest('POST', this.settings.saveSetup, {data})
          .then((response) => {
            this.onSubmitResponse($submitBtn);
            Craft.cp.displayNotice(Craft.t('app', 'MFA settings saved.'));
            this.slideout.close();
          })
          .catch(({response}) => {
            this.onSubmitResponse($submitBtn);

            // Add the error message
            this.showError(response.data.message);
            Craft.cp.displayError(response.data.message);
          });
      },

      onSubmitResponse: function ($submitBtn) {
        $submitBtn.removeClass('loading');
      },

      showError: function (error, $errorsContainer = null) {
        this.clearErrors();

        $('<p class="error" style="display: none;">' + error + '</p>')
          .appendTo($errorsContainer !== null ? $errorsContainer : this.$errors)
          .velocity('fadeIn');
      },

      clearErrors: function ($errorsContainer = null) {
        if ($errorsContainer !== null) {
          $errorsContainer.empty();
        } else {
          this.$errors.empty();
        }
      },

      onAlternativeMfaTypeClick: function (event) {
        // get current authenticator class via data-2fa-type
        let currentMethod = this.getCurrentMfaType(
          this.$mfaLoginFormContainer.find('#verifyContainer')
        );
        if (currentMethod === null) {
          this.$alternativeMfaLink.hide();
          this.showError(
            Craft.t('app', 'No alternative MFA methods available.')
          );
        }

        let data = {
          currentMethod: currentMethod,
        };

        // get available MFA methods, minus the one that's being shown
        this.getAlternativeMfaTypes(data);
      },

      getAlternativeMfaTypes: function (data) {
        Craft.sendActionRequest(
          'POST',
          this.settings.fetchAlternativeMfaTypes,
          {
            data,
          }
        )
          .then((response) => {
            if (response.data.alternativeTypes !== undefined) {
              this.showAlternativeMfaTypes(response.data.alternativeTypes);
            }
          })
          .catch(({response}) => {
            this.showError(response.data.message);
          });
      },

      showAlternativeMfaTypes: function (data) {
        let alternativeTypes = Object.entries(data).map(([key, value]) => ({
          key,
          value,
        }));
        if (alternativeTypes.length > 0) {
          alternativeTypes.forEach((type) => {
            this.$alternativeMfaTypesContainer.append(
              '<li><button ' +
                'class="alternative-mfa-type" ' +
                'type="button" ' +
                'value="' +
                type.key +
                '">' +
                type.value.name +
                '</button></li>'
            );
          });
        }

        // list them by name
        this.$alternativeMfaLink
          .hide()
          .after(this.$alternativeMfaTypesContainer);

        // clicking on a method name swaps the form fields
        this.addListener(
          $('.alternative-mfa-type'),
          'click',
          'onSelectAlternativeMfaType'
        );
      },

      onSelectAlternativeMfaType: function (event) {
        const data = {
          selectedMethod: $(event.currentTarget).attr('value'),
        };

        Craft.sendActionRequest('POST', this.settings.loadAlternativeMfaType, {
          data,
        })
          .then((response) => {
            if (response.data.auth2faForm !== undefined) {
              this.$mfaLoginFormContainer
                .html('')
                .append(response.data.auth2faForm);
              this.$alternativeMfaTypesContainer.html('');
              this.$alternativeMfaLink.show();
              this.onSubmitResponse();
            }
          })
          .catch(({response}) => {
            //this.showError(response.data.message);
          });
      },

      _getMfaFields: function ($container) {
        let auth2faFields = {};

        $container
          .find('input[name^="auth2faFields[')
          .each(function (index, element) {
            let name = $(element).attr('id');
            auth2faFields[name] = $(element).val();
          });

        return auth2faFields;
      },

      _getCurrentMethodInput: function ($container) {
        return $container.find('input[name="currentMethod"').val();
      },
    },
    {
      defaults: {
        fetchAlternativeMfaTypes: 'auth/fetch-alternative-2fa-types',
        loadAlternativeMfaType: 'auth/load-alternative-2fa-type',
        setupSlideoutHtml: 'auth/setup-slideout-html',
        saveSetup: 'auth/save-setup',
        removeSetup: 'auth/remove-setup',
      },
    }
  );
})(jQuery);
