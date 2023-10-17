<?php
/**
 * @link https://craftcms.com/
 * @copyright Copyright (c) Pixel & Tonic, Inc.
 * @license https://craftcms.github.io/license/
 */

namespace craft\services;

use Craft;
use craft\auth\passkeys\type\WebAuthn;
use craft\auth\twofa\type\GoogleAuthenticator;
use craft\auth\twofa\type\RecoveryCodes;
use craft\base\auth\BaseAuthType;
use craft\elements\User;
use craft\events\Auth2faTypeEvent;
use yii\base\Component;
use yii\base\Exception;

/**
 * Auth service.
 * An instance of the Auth service is globally accessible in Craft via [[\craft\base\ApplicationTrait::getAuth()|`Craft::$app->auth`]].
 *
 * @author Pixel & Tonic, Inc. <support@pixelandtonic.com>
 * @since 5.0
 */
class Auth extends Component
{
    public const EVENT_REGISTER_2FA_TYPES = 'register2faTypes';

    /**
     * @var string the session key used to store the id of the user we're logging in.
     */
    protected const AUTH_USER_SESSION_KEY = 'craft.auth.user';

    /**
     * @var BaseAuthType|null 2FA Type instance in use
     */
    private ?BaseAuthType $_2faType = null;

    /**
     * @var array $_2faTypes all available 2FA types
     */
    private array $_2faTypes = [];


//    public function mfaEnabled(User $user): bool
//    {
//        return $user->has2fa && $this->_getStoredSecret($user->id) !== null;
//    }

    /**
     * Store the user id and duration in session while we proceed to the 2FA step of logging them in
     *
     * @param User $user
     * @param int $duration
     * @return void
     * @throws \craft\errors\MissingComponentException
     */
    public function storeDataFor2faLogin(User $user, int $duration): void
    {
        Craft::$app->getSession()->set(self::AUTH_USER_SESSION_KEY, [$user->id, $duration]);
    }

    /**
     * Get user and duration data from session
     *
     * @return array|null
     * @throws Exception
     * @throws \craft\errors\MissingComponentException
     */
    public function get2faDataFromSession(): ?array
    {
        $data = Craft::$app->getSession()->get(self::AUTH_USER_SESSION_KEY);

        if ($data === null) {
            return null;
        }

        if (is_array($data)) {
            [$userId, $duration] = $data;
            $user = User::findOne(['id' => $userId]);

            if ($user === null) {
                throw new Exception(Craft::t('app', 'Something went wrong. Please start again.'));
            }

            return compact('user', 'duration');
        }

        return null;
    }

    /**
     * Get the user we're logging in via 2FA from session
     *
     * @return User|null
     * @throws Exception
     * @throws \craft\errors\MissingComponentException
     */
    public function get2faUserFromSession(): ?User
    {
        $data = $this->get2faDataFromSession();

        return $data['user'] ?? null;
    }

    /**
     * Remove user's data from session
     *
     * @return void
     * @throws \craft\errors\MissingComponentException
     */
    public function remove2faDataFromSession(): void
    {
        Craft::$app->getSession()->remove(self::AUTH_USER_SESSION_KEY);
    }

    /**
     * Get html of the form for the 2FA step
     *
     * @return string
     */
    public function getInputHtml(): string
    {
        $user = $this->getUserForAuth();

        if ($user === null) {
            return '';
        }

        $this->_2faType = $user->getDefault2faType();

        return $this->_2faType->getInputHtml();
    }

    /**
     * Verify 2FA step
     *
     * @param array $auth2faFields
     * @param string $currentMethod
     * @return bool
     */
    public function verify(array $auth2faFields, string $currentMethod): bool
    {
        $user = $this->getUserForAuth();

        if ($user === null) {
            return false;
        }

        if (empty($currentMethod)) {
            throw new Exception('2FA method not specified.');
        }

        $auth2faType = new $currentMethod();

        if (!($auth2faType instanceof BaseAuthType)) {
            throw new Exception('2FA Type needs to be an instance of ' . BaseAuthType::class);
        }

        $this->_2faType = new $auth2faType();

        return $this->_2faType->verify($auth2faFields);
    }

    /**
     * Returns a list of all available 2FA types except the one passed in as current
     *
     * @param ?string $currentMethod
     * @return array
     */
    public function getAlternative2faTypes(?string $currentMethod = null): array
    {
        return array_filter($this->getAll2faTypes(), function($type) use ($currentMethod) {
            return $type !== $currentMethod;
        }, ARRAY_FILTER_USE_KEY);
    }

    /**
     * Returns a list of all available 2FA types
     *
     * @param bool $withConfig
     * @return array
     */
    public function getAll2faTypes(bool $withConfig = false): array
    {
        if (!empty($this->_2faTypes)) {
            $types = $this->_2faTypes;
        } else {
            $types = [
                GoogleAuthenticator::class => [
                    'name' => GoogleAuthenticator::displayName(),
                    'description' => GoogleAuthenticator::getDescription(),
                    'config' => [
                        'requiresSetup' => GoogleAuthenticator::$requiresSetup,
                    ],
                ],
                RecoveryCodes::class => [
                    'name' => RecoveryCodes::displayName(),
                    'description' => RecoveryCodes::getDescription(),
                    'config' => [
                        'requiresSetup' => RecoveryCodes::$requiresSetup,
                    ],
                ],
            ];
        }

        $event = new Auth2faTypeEvent([
            'types' => $types,
        ]);

        $this->trigger(self::EVENT_REGISTER_2FA_TYPES, $event);

        $this->_2faTypes = $event->types;

        if (!$withConfig) {
            foreach ($event->types as $key => $types) {
                /** @phpstan-ignore-next-line */
                unset($event->types[$key]['config']);
            }
        }

        return $event->types;
    }

    /**
     * Returns a list of all available passkeys types
     *
     * @param bool $withConfig
     * @return array[]
     */
    public function getAllPasskeysTypes(bool $withConfig = false): array
    {
        $types = [
            WebAuthn::class => [
                'name' => WebAuthn::displayName(),
                'description' => WebAuthn::getDescription(),
                'config' => [
                    'requiresSetup' => WebAuthn::$requiresSetup,
                ],
            ],
        ];

        if (!$withConfig) {
            foreach ($types as $key => $type) {
                unset($types[$key]['config']);
            }
        }

        return $types;
    }

    /**
     * Get user for 2FA or passkeys login.
     * First try to get the logged in user (used e.g. when changing a setup).
     * Then try to get one from the session.
     *
     * @return User|null
     * @throws \Throwable
     * @throws \craft\errors\MissingComponentException
     * @throws \yii\base\Exception
     */
    public function getUserForAuth(): ?User
    {
        // first let's check if user is logged in; if yes, this is run via a setup action from their profile
        $user = Craft::$app->getUser()->getIdentity();

        if ($user === null) {
            // then try to get data from session
            $user = Craft::$app->getAuth()->get2faUserFromSession();
        }

        return $user;
    }
}
