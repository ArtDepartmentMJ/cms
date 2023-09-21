/** global: Craft */

/**
 * Embedded element index class
 */
Craft.EmbeddedElementIndex = Garnish.Base.extend(
  {
    $container: null,
    elementType: null,
    elementIndex: null,
    $createBtn: null,

    init: function (container, elementType, settings) {
      this.$container = $(container);
      this.elementType = elementType;
      this.setSettings(settings, Craft.EmbeddedElementIndex.defaults);

      // Is this already a nested element manager?
      if (this.$container.data('nestedElementManager')) {
        console.warn(
          'Double-instantiating a nested element manager on an element'
        );
        this.$container.data('nestedElementManager').destroy();
      }

      this.$container.data('nestedElementManager', this);

      this.elementIndex = Craft.createElementIndex(
        this.elementType,
        this.$container,
        Object.assign(
          {
            context: 'embedded-index',
          },
          this.settings.indexSettings,
          {
            canDuplicateElements: ($selectedItems) => {
              return this.canCreate($selectedItems.length);
            },
            canDeleteElements: ($selectedItems) => {
              return this.canDelete($selectedItems.length);
            },
            onBeforeUpdateElements: this.onBeforeUpdateElements.bind(this),
            onCountResults: this.onCountResults.bind(this),
          }
        )
      );

      if (this.settings.canCreate) {
        this.$createBtn = Craft.ui
          .createButton({
            label: this.settings.createButtonLabel,
            spinner: true,
          })
          .addClass('add icon disabled')
          .appendTo(this.elementIndex.$toolbar);

        if (Array.isArray(this.settings.createAttributes)) {
          const createMenuId = `menu-${Math.floor(Math.random() * 1000000)}`;
          const $menu = $('<div/>', {
            id: createMenuId,
            class: 'menu menu--disclosure',
          }).insertAfter(this.$createBtn);
          const $ul = $('<ul/>').appendTo($menu);
          for (let type of this.settings.createAttributes) {
            const $li = $('<li/>').appendTo($ul);
            const $a = $('<a/>', {
              href: '#',
              type: 'button',
              role: 'button',
              text: type.label,
            }).appendTo($li);
            this.addListener($a, 'activate', (ev) => {
              ev.preventDefault();
              this.createElement(type.attributes);
            });
          }
          this.$createBtn
            .attr('aria-controls', createMenuId)
            .attr('data-disclosure-trigger', 'true')
            .addClass('menubtn')
            .disclosureMenu();
        } else {
          this.addListener(this.$createBtn, 'activate', (ev) => {
            ev.preventDefault();
            this.createElement(this.settings.createAttributes);
          });
        }
      }
    },

    onBeforeUpdateElements: function () {
      if (this.$createBtn) {
        this.$createBtn.addClass('disabled');
      }
    },

    onCountResults: function () {
      if (this.$createBtn && this.canCreate()) {
        this.$createBtn.removeClass('disabled');
      }
    },

    canCreate(num) {
      if (!this.settings.maxElements) {
        return true;
      }

      return (
        !this.elementIndex.isIndexBusy &&
        this.elementIndex.totalUnfilteredResults + (num || 1) <=
          this.settings.maxElements
      );
    },

    canDelete(num) {
      if (!this.settings.minElements) {
        return true;
      }

      return (
        !this.elementIndex.isIndexBusy &&
        this.elementIndex.totalUnfilteredResults - (num || 1) >=
          this.settings.minElements
      );
    },

    createElement: function (attributes) {
      this.$createBtn.addClass('loading');

      Craft.sendActionRequest('POST', 'elements/create', {
        data: Object.assign(
          {
            elementType: this.elementType,
          },
          this.settings.baseCreateAttributes,
          attributes
        ),
      })
        .then(({data}) => {
          const slideout = Craft.createElementEditor(this.elementType, {
            siteId: data.element.siteId,
            elementId: data.element.id,
            draftId: data.element.draftId,
            params: {
              fresh: 1,
            },
          });
          slideout.on('submit', () => {
            this.elementIndex.clearSearch();
            this.elementIndex.updateElements();
          });
        })
        .catch(({response}) => {
          Craft.cp.displayError((response.data && response.data.error) || null);
        })
        .finally(() => {
          this.$createBtn.removeClass('loading');
        });
    },

    destroy: function () {
      this.$container.removeData('nestedElementManager');
      this.base();
    },
  },
  {
    ownerId: null,
    defaults: {
      indexSettings: {},
      canCreate: false,
      minElements: null,
      maxElements: null,
      createButtonLabel: Craft.t('app', 'Create'),
      baseCreateAttributes: null,
      createAttributes: null,
    },
  }
);