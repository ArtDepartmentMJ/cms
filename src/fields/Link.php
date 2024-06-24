<?php
/**
 * @link https://craftcms.com/
 * @copyright Copyright (c) Pixel & Tonic, Inc.
 * @license https://craftcms.github.io/license/
 */

namespace craft\fields;

use Craft;
use craft\base\ElementInterface;
use craft\base\Event;
use craft\base\Field;
use craft\base\InlineEditableFieldInterface;
use craft\events\RegisterComponentTypesEvent;
use craft\fields\conditions\TextFieldConditionRule;
use craft\fields\data\LinkData;
use craft\fields\linktypes\BaseLinkType;
use craft\fields\linktypes\BaseTextLinkType;
use craft\fields\linktypes\Category;
use craft\fields\linktypes\Email as EmailType;
use craft\fields\linktypes\Entry;
use craft\fields\linktypes\Telephone;
use craft\fields\linktypes\Url as UrlType;
use craft\helpers\Cp;
use craft\helpers\Html;
use craft\validators\ArrayValidator;
use craft\validators\StringValidator;
use yii\base\InvalidArgumentException;
use yii\db\Schema;

/**
 * Link represents a Link field.
 *
 * @author Pixel & Tonic, Inc. <support@pixelandtonic.com>
 * @since 5.3.0
 */
class Link extends Field implements InlineEditableFieldInterface
{
    /**
     * @event DefineLinkOptionsEvent The event that is triggered when registering the link types for Link fields.
     * @see types()
     */
    public const EVENT_REGISTER_LINK_TYPES = 'registerLinkTypes';

    /** @deprecated in 5.3.0 */
    public const TYPE_URL = 'url';
    /** @deprecated in 5.3.0 */
    public const TYPE_TEL = 'tel';
    /** @deprecated in 5.3.0 */
    public const TYPE_EMAIL = 'email';

    /**
     * @inheritdoc
     */
    public static function displayName(): string
    {
        return Craft::t('app', 'Link');
    }

    /**
     * @inheritdoc
     */
    public static function icon(): string
    {
        return 'link';
    }

    /**
     * @inheritdoc
     */
    public static function phpType(): string
    {
        return 'string|null';
    }

    /**
     * @inheritdoc
     */
    public static function dbType(): string
    {
        return Schema::TYPE_STRING;
    }

    /**
     * @return array<string,BaseLinkType|string>
     * @phpstan-return array<string,class-string<BaseLinkType>>
     */
    private static function types(): array
    {
        if (!isset(self::$_types)) {
            /** @var array<BaseLinkType|string> $types */
            /** @phpstan-var class-string<BaseLinkType>[] $types */
            $types = [
                Category::class,
                EmailType::class,
                Entry::class,
                Telephone::class,
            ];

            // Fire a registerLinkTypes event
            if (Event::hasHandlers(self::class, self::EVENT_REGISTER_LINK_TYPES)) {
                $event = new RegisterComponentTypesEvent([
                    'types' => $types,
                ]);
                Event::trigger(self::class, self::EVENT_REGISTER_LINK_TYPES, $event);
                $types = $event->types;
            }

            // URL *has* to be there
            $types[] = UrlType::class;

            self::$_types = array_combine(
                array_map(fn(string $type) => $type::id(), $types),
                $types,
            );
        }

        return self::$_types;
    }

    private static function resolveType(string $value): string
    {
        foreach (self::types() as $id => $type) {
            if ($id !== 'url' && $type::supports($value)) {
                return $id;
            }
        }

        return 'url';
    }

    private static array $_types;

    /**
     * @var string[] Allowed link types
     */
    public array $types = [
        'entry',
        'url',
    ];

    /**
     * @var int The maximum length (in bytes) the field can hold
     */
    public int $maxLength = 255;

    /**
     * @inheritdoc
     */
    public function __construct($config = [])
    {
        if (array_key_exists('placeholder', $config)) {
            unset($config['placeholder']);
        }

        parent::__construct($config);
    }

    /**
     * @inheritdoc
     */
    public function fields(): array
    {
        $fields = parent::fields();
        unset($fields['placeholder']);
        return $fields;
    }

    /**
     * @inheritdoc
     */
    protected function defineRules(): array
    {
        $rules = parent::defineRules();
        $rules[] = [['types'], ArrayValidator::class];
        $rules[] = [['types', 'maxLength'], 'required'];
        $rules[] = [['maxLength'], 'number', 'integerOnly' => true, 'min' => 10];
        return $rules;
    }

    /**
     * @inheritdoc
     */
    public function getSettingsHtml(): ?string
    {
        $linkTypeOptions = array_map(fn(string $type) => [
            'label' => $type::label(),
            'value' => $type::id(),
        ], self::types());

        // Sort them by label, with URL at the top
        $urlOption = $linkTypeOptions['url'];
        unset($linkTypeOptions['url']);
        usort($linkTypeOptions, fn(array $a, array $b) => $a['label'] <=> $b['label']);
        $linkTypeOptions = [$urlOption, ...$linkTypeOptions];

        return
            Cp::checkboxSelectFieldHtml([
                'label' => Craft::t('app', 'Allowed Link Types'),
                'id' => 'types',
                'name' => 'types',
                'options' => $linkTypeOptions,
                'values' => $this->types,
                'required' => true,
            ]) .
            Cp::textFieldHtml([
                'label' => Craft::t('app', 'Max Length'),
                'instructions' => Craft::t('app', 'The maximum length (in bytes) the field can hold.'),
                'id' => 'maxLength',
                'name' => 'maxLength',
                'type' => 'number',
                'min' => '10',
                'step' => '10',
                'value' => $this->maxLength,
                'errors' => $this->getErrors('maxLength'),
                'data' => ['error-key' => 'maxLength'],
            ]);
    }

    /**
     * @inheritdoc
     */
    public function normalizeValue(mixed $value, ?ElementInterface $element): mixed
    {
        if ($value instanceof LinkData) {
            return $value;
        }

        $types = self::types();

        if (is_array($value)) {
            $typeId = $value['type'] ?? 'url';
            $value = trim($value[$typeId]['value'] ?? '');

            if (!isset($types[$typeId])) {
                throw new InvalidArgumentException("Invalid link type: $typeId");
            }

            if (!$value) {
                return null;
            }

            $type = $types[$typeId];
            $value = $type::normalize(str_replace(' ', '+', $value));
        } else {
            if (!$value) {
                return null;
            }

            $typeId = self::resolveType($value);
            $type = $types[$typeId];
        }

        return new LinkData($value, $type);
    }

    /**
     * @inheritdoc
     */
    public function useFieldset(): bool
    {
        return count($this->types) > 1;
    }

    /**
     * @inheritdoc
     */
    protected function inputHtml(mixed $value, ?ElementInterface $element, bool $inline): string
    {
        $types = self::types();
        /** @var LinkData|null $value */
        /** @var BaseLinkType|string|null $type */
        /** @phpstan-var class-string<BaseLinkType>|null $type */
        $type = $types[$value?->type];
        $valueTypeId = $type ? $type::id() : 'url';
        $allowedTypeIds = in_array($valueTypeId, $this->types) ? $this->types : array_merge($this->types, [$valueTypeId]);
        $allowedTypeIds = array_filter($allowedTypeIds, fn(string $typeId) => isset($types[$typeId]));
        $id = $this->getInputId();

        $view = Craft::$app->getView();

        if (!$value) {
            // Override the initial value being set to null by CustomField::inputHtml()
            $view->setInitialDeltaValue($this->handle, [
                'type' => $valueTypeId,
                'value' => '',
            ]);
        }

        $typeInputName = "$this->handle[type]";

        if (count($allowedTypeIds) === 1) {
            $innerHtml = Html::hiddenInput($typeInputName, $valueTypeId);
            $hasSelect = false;
        } else {
            $namespacedId = $view->namespaceInputId($id);
            $js = <<<JS
$('#$namespacedId-type').on('change', e => {
  const type = $('#$namespacedId-type').val();
  $('#$namespacedId')
    .attr('type', type)
    .attr('inputmode', type);
});
JS;
            $view->registerJs($js);

            $innerHtml = Cp::selectHtml([
                'id' => "$id-type",
                'describedBy' => $this->describedBy,
                'name' => $typeInputName,
                'options' => array_map(fn(string $typeId) => [
                    'label' => $types[$typeId]::label(),
                    'value' => $types[$typeId]::id(),
                ], $allowedTypeIds),
                'value' => $valueTypeId,
                'inputAttributes' => [
                    'aria' => [
                        'label' => Craft::t('app', 'URL type'),
                    ],
                ],
                'toggle' => true,
                'targetPrefix' => "$id-",
            ]);

            $hasSelect = true;
        }

        foreach ($allowedTypeIds as $typeId) {
            $containerId = "$id-$typeId";
            $nsContainerId = $view->namespaceInputId($containerId);
            $selected = $typeId === $valueTypeId;
            $typeValue = $selected ? $value?->serialize() : null;
            $isTextLink = is_subclass_of($types[$typeId], BaseTextLinkType::class);
            $innerHtml .=
                Html::beginTag('div', [
                    'id' => $containerId,
                    'class' => array_keys(array_filter([
                        'flex-grow' => true,
                        'hidden' => !$selected,
                        'text-link' => $isTextLink,
                    ])),
                ]) .
                $view->namespaceInputs(
                    fn() => $types[$typeId]::inputHtml($this, $typeValue, $nsContainerId),
                    "$this->handle[$typeId]",
                ) .
                Html::endTag('div');
        }

        return
            Html::beginTag('div', [
                'id' => $id,
                'class' => array_keys(array_filter([
                    'link-input' => true,
                    'has-link-type-select' => $hasSelect,
                ])),
            ]) .
            Html::tag('div', $innerHtml, [
                'class' => ['flex', 'flex-nowrap'],
            ]) .
            Html::endTag('div');
    }

    /**
     * @inheritdoc
     */
    public function getElementValidationRules(): array
    {
        return [
            [
                function(ElementInterface $element) {
                    /** @var LinkData $value */
                    $value = $element->getFieldValue($this->handle);
                    $types = self::types();
                    /** @var BaseLinkType|string $type */
                    /** @phpstan-var class-string<BaseLinkType> $type */
                    $type = $types[$value->type];
                    $error = null;
                    if (!$type::validate($value->serialize(), $error)) {
                        /** @var string|null $error */
                        $element->addError("field:$this->handle", $error ?? Craft::t('yii', '{attribute} is invalid.', [
                            'attribute' => $this->getUiLabel(),
                        ]));
                        return;
                    }

                    $stringValidator = new StringValidator(['max' => $this->maxLength]);
                    if (!$stringValidator->validate($value->serialize(), $error)) {
                        $element->addError("field:$this->handle", $error);
                    }
                },
            ],
        ];
    }

    /**
     * @inheritdoc
     */
    public function getElementConditionRuleType(): array|string|null
    {
        return TextFieldConditionRule::class;
    }

    /**
     * @inheritdoc
     */
    public function getPreviewHtml(mixed $value, ElementInterface $element): string
    {
        /** @var LinkData|null $value */
        if (!$value) {
            return '';
        }
        $value = Html::encode((string)$value);
        return "<a href=\"$value\" target=\"_blank\">$value</a>";
    }
}
