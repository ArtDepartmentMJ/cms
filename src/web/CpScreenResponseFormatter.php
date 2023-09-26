<?php
/**
 * @link https://craftcms.com/
 * @copyright Copyright (c) Pixel & Tonic, Inc.
 * @license https://craftcms.github.io/license/
 */

namespace craft\web;

use Craft;
use craft\helpers\Html;
use craft\helpers\StringHelper;
use craft\helpers\UrlHelper;
use yii\base\Component;
use yii\base\InvalidConfigException;
use yii\web\BadRequestHttpException;
use yii\web\JsonResponseFormatter;
use yii\web\Response as YiiResponse;
use yii\web\ResponseFormatterInterface;

/**
 * Control panel screen response formatter.
 *
 * @author Pixel & Tonic, Inc. <support@pixelandtonic.com>
 * @since 4.0.0
 */
class CpScreenResponseFormatter extends Component implements ResponseFormatterInterface
{
    public const FORMAT = 'cp-screen';

    /**
     * @inheritdoc
     * @throws InvalidConfigException
     */
    public function format($response)
    {
        /** @var CpScreenResponseBehavior|null $behavior */
        $behavior = $response->getBehavior(CpScreenResponseBehavior::NAME);

        if (!$behavior) {
            throw new InvalidConfigException('CpScreenResponseFormatter can only be used on responses with a CpScreenResponseBehavior.');
        }

        $request = Craft::$app->getRequest();

        if ($request->getAcceptsJson()) {
            $this->_formatJson($request, $response, $behavior);
        } else {
            $this->_formatTemplate($response, $behavior);
        }
    }

    private function _formatJson(\yii\web\Request $request, YiiResponse $response, CpScreenResponseBehavior $behavior): void
    {
        $response->format = Response::FORMAT_JSON;

        $namespace = StringHelper::randomString(10);
        $view = Craft::$app->getView();

        if ($behavior->prepareScreen) {
            $containerId = $request->getHeaders()->get('X-Craft-Container-Id');
            if (!$containerId) {
                throw new BadRequestHttpException('Request missing the X-Craft-Container-Id header.');
            }
            $view->setNamespace($namespace);
            call_user_func($behavior->prepareScreen, $response, $containerId);
            $view->setNamespace(null);
        }

        $notice = $behavior->noticeHtml ? $view->namespaceInputs($behavior->noticeHtml, $namespace) : null;

        $tabs = count($behavior->tabs) > 1 ? $view->namespaceInputs(fn() => $view->renderTemplate('_includes/tabs.twig', [
            'tabs' => $behavior->tabs,
        ], View::TEMPLATE_MODE_CP), $namespace) : null;

        $content = $view->namespaceInputs(function() use ($behavior) {
            $components = [];
            if ($behavior->contentHtml) {
                $components[] = is_callable($behavior->contentHtml) ? call_user_func($behavior->contentHtml) : $behavior->contentHtml;
            }
            if ($behavior->action) {
                $components[] = Html::actionInput($behavior->action, [
                    'class' => 'action-input',
                ]);
            }
            return implode("\n", $components);
        }, $namespace);

        $sidebar = $behavior->metaSidebarHtml ? $view->namespaceInputs($behavior->metaSidebarHtml, $namespace) : null;
        
        $additionalMenu = $view->namespaceInputs(fn() => $view->renderTemplate('_layouts/components/additional-menu.twig', [
            'additionalMenuComponents' => is_callable($behavior->additionalMenuComponents) ? call_user_func($behavior->additionalMenuComponents) : $behavior->additionalMenuComponents,
            'fullPage' => false,
        ], View::TEMPLATE_MODE_CP), $namespace);

        $errorSummary = $behavior->errorSummary ? $view->namespaceInputs($behavior->errorSummary, $namespace) : null;

        $response->data = [
            'editUrl' => $behavior->editUrl,
            'namespace' => $namespace,
            'title' => $behavior->title,
            'notice' => $notice,
            'tabs' => $tabs,
            'bodyClass' => $behavior->slideoutBodyClass,
            'formAttributes' => $behavior->formAttributes,
            'action' => $behavior->action,
            'submitButtonLabel' => $behavior->submitButtonLabel,
            'additionalMenu' => $additionalMenu,
            'content' => $content,
            'sidebar' => $sidebar,
            'errorSummary' => $errorSummary,
            'headHtml' => $view->getHeadHtml(),
            'bodyHtml' => $view->getBodyHtml(),
            'deltaNames' => $view->getDeltaNames(),
            'initialDeltaValues' => $view->getInitialDeltaValues(),
            'data' => $response->data,
        ];

        (new JsonResponseFormatter())->format($response);
    }

    private function _formatTemplate(YiiResponse $response, CpScreenResponseBehavior $behavior): void
    {
        $response->format = Response::FORMAT_HTML;

        if ($behavior->prepareScreen) {
            call_user_func($behavior->prepareScreen, $response, 'main-form');
        }

        $crumbs = is_callable($behavior->crumbs) ? call_user_func($behavior->crumbs) : $behavior->crumbs;
        $contextMenu = is_callable($behavior->contextMenuHtml) ? call_user_func($behavior->contextMenuHtml) : $behavior->contextMenuHtml;
        $addlButtons = is_callable($behavior->additionalButtonsHtml) ? call_user_func($behavior->additionalButtonsHtml) : $behavior->additionalButtonsHtml;
        $altActions = is_callable($behavior->altActions) ? call_user_func($behavior->altActions) : $behavior->altActions;
        $addlMenuComponents = is_callable($behavior->additionalMenuComponents) ? call_user_func($behavior->additionalMenuComponents) : $behavior->additionalMenuComponents;
        $notice = is_callable($behavior->noticeHtml) ? call_user_func($behavior->noticeHtml) : $behavior->noticeHtml;
        $content = is_callable($behavior->contentHtml) ? call_user_func($behavior->contentHtml) : ($behavior->contentHtml ?? '');
        $sidebar = is_callable($behavior->metaSidebarHtml) ? call_user_func($behavior->metaSidebarHtml) : $behavior->metaSidebarHtml;
        $pageSidebar = is_callable($behavior->pageSidebarHtml) ? call_user_func($behavior->pageSidebarHtml) : $behavior->pageSidebarHtml;
        $errorSummary = is_callable($behavior->errorSummary) ? call_user_func($behavior->errorSummary) : $behavior->errorSummary;

        if ($behavior->action) {
            $content .= Html::actionInput($behavior->action, [
                'class' => 'action-input',
            ]);
            if ($behavior->redirectUrl) {
                $content .= Html::redirectInput($behavior->redirectUrl);
            }
        }

        $security = Craft::$app->getSecurity();
        $response->attachBehavior(TemplateResponseBehavior::NAME, [
            'class' => TemplateResponseBehavior::class,
            'template' => '_layouts/cp',
            'variables' => [
                'docTitle' => $behavior->docTitle ?? strip_tags($behavior->title ?? ''),
                'title' => $behavior->title,
                'selectedSubnavItem' => $behavior->selectedSubnavItem,
                'crumbs' => array_map(function(array $crumb): array {
                    $crumb['url'] = UrlHelper::cpUrl($crumb['url'] ?? '');
                    return $crumb;
                }, $crumbs ?? []),
                'contextMenu' => $contextMenu,
                'submitButtonLabel' => $behavior->submitButtonLabel,
                'additionalButtons' => $addlButtons,
                'additionalMenuComponents' => array_map(function(array $component) use ($security): array {
                    if (isset($component['options']['redirect'])) {
                        $component['options']['redirect'] = $security->hashData($component['options']['redirect']);
                    }
                    if (isset($component['data']['redirect'])) {
                        $component['data']['redirect'] = $security->hashData($component['data']['redirect']);
                    }
                    return $component;
                }, $addlMenuComponents ?? []),
                'tabs' => $behavior->tabs,
                'fullPageForm' => (bool)$behavior->action,
                'mainAttributes' => $behavior->mainAttributes,
                'mainFormAttributes' => $behavior->formAttributes,
                'formActions' => array_map(function(array $action) use ($security): array {
                    if (isset($action['redirect'])) {
                        $action['redirect'] = $security->hashData($action['redirect']);
                    }
                    return $action;
                }, $altActions ?? []),
                'saveShortcutRedirect' => $behavior->saveShortcutRedirectUrl,
                'contentNotice' => $notice,
                'content' => $content,
                'details' => $sidebar,
                'sidebar' => $pageSidebar,
                'errorSummary' => $errorSummary,
            ],
            'templateMode' => View::TEMPLATE_MODE_CP,
        ]);

        (new TemplateResponseFormatter())->format($response);
    }
}
