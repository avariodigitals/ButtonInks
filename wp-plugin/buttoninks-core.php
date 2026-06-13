<?php
/**
 * Plugin Name: ButtonInks Core
 * Description: Headless core functionality for ButtonInks Next.js integration.
 * Version: 1.0.0
 * Author: Avario Digitals
 */

if (!defined('ABSPATH')) exit;

class ButtonInks_Core {

    public function __construct() {
        add_action('rest_api_init', [$this, 'register_endpoints']);
        add_action('wp_login', [$this, 'handle_login_redirect'], 10, 2);
    }

    public function register_endpoints() {
        // 1. User Registration
        register_rest_route('buttoninks/v1', '/register', [
            'methods' => 'POST',
            'callback' => [$this, 'register_user'],
            'permission_callback' => '__return_true',
        ]);

        // 2. Wishlist Endpoints (Protected by JWT)
        register_rest_route('buttoninks/v1', '/wishlist', [
            'methods' => 'GET',
            'callback' => [$this, 'get_wishlist'],
            'permission_callback' => [$this, 'is_user_logged_in'],
        ]);

        register_rest_route('buttoninks/v1', '/wishlist/add', [
            'methods' => 'POST',
            'callback' => [$this, 'add_to_wishlist'],
            'permission_callback' => [$this, 'is_user_logged_in'],
        ]);

        register_rest_route('buttoninks/v1', '/wishlist/remove', [
            'methods' => 'POST',
            'callback' => [$this, 'remove_from_wishlist'],
            'permission_callback' => [$this, 'is_user_logged_in'],
        ]);
    }

    public function is_user_logged_in() {
        return get_current_user_id() !== 0;
    }

    public function register_user($request) {
        $params = $request->get_json_params();
        $email = sanitize_email($params['email']);
        $username = sanitize_user($params['username']);
        $password = $params['password'];

        if (empty($email) || empty($password) || empty($username)) {
            return new WP_Error('missing_fields', 'Required fields are missing', ['status' => 400]);
        }

        if (email_exists($email)) {
            return new WP_Error('email_exists', 'Email already registered', ['status' => 400]);
        }

        if (username_exists($username)) {
            return new WP_Error('user_exists', 'Username already taken', ['status' => 400]);
        }

        $user_id = wp_create_user($username, $password, $email);

        if (is_wp_error($user_id)) {
            return $user_id;
        }

        // Set role as customer (WooCommerce)
        $user = new WP_User($user_id);
        $user->set_role('customer');

        return [
            'success' => true,
            'message' => 'Registration successful',
            'user_id' => $user_id
        ];
    }

    public function get_wishlist($request) {
        $user_id = get_current_user_id();
        $wishlist = get_user_meta($user_id, '_buttoninks_wishlist', true);
        return !empty($wishlist) ? $wishlist : [];
    }

    public function add_to_wishlist($request) {
        $user_id = get_current_user_id();
        $params = $request->get_json_params();
        $product_id = intval($params['product_id']);

        $wishlist = get_user_meta($user_id, '_buttoninks_wishlist', true);
        if (!$wishlist) $wishlist = [];

        if (!in_array($product_id, $wishlist)) {
            $wishlist[] = $product_id;
            update_user_meta($user_id, '_buttoninks_wishlist', $wishlist);
        }

        return ['success' => true, 'wishlist' => $wishlist];
    }

    public function remove_from_wishlist($request) {
        $user_id = get_current_user_id();
        $params = $request->get_json_params();
        $product_id = intval($params['product_id']);

        $wishlist = get_user_meta($user_id, '_buttoninks_wishlist', true);
        if (!$wishlist) $wishlist = [];

        if (($key = array_search($product_id, $wishlist)) !== false) {
            unset($wishlist[$key]);
            update_user_meta($user_id, '_buttoninks_wishlist', array_values($wishlist));
        }

        return ['success' => true, 'wishlist' => $wishlist];
    }
}

new ButtonInks_Core();
