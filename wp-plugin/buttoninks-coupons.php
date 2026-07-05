<?php
/**
 * Plugin Name: ButtonInks Coupon Manager
 * Description: Manages promotional coupons and free shipping configuration for ButtonInks.
 *              Ensures PRINT15 (15% first-order discount) and $75 free shipping are always active.
 * Version:     1.0.0
 * Author:      ButtonInks
 * Requires at least: 5.8
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) exit;

class ButtonInks_Coupon_Manager {

    // ── Coupon config ─────────────────────────────────────────────────────────
    const COUPONS = [
        [
            'code'                 => 'PRINT15',
            'discount_type'        => 'percent',
            'amount'               => '15',
            'individual_use'       => true,
            'usage_limit_per_user' => 1,
            'usage_limit'          => null,   // unlimited total uses
            'free_shipping'        => false,
            'description'          => '15% off your first order. One use per customer.',
        ],
    ];

    // ── Free shipping config ──────────────────────────────────────────────────
    const FREE_SHIPPING_MIN = 75;

    public function __construct() {
        // Ensure coupons exist on every plugin activation and on init (idempotent)
        register_activation_hook( __FILE__, [ $this, 'setup' ] );
        add_action( 'init', [ $this, 'setup' ] );

        // REST endpoints for the Next.js front-end
        add_action( 'rest_api_init', [ $this, 'register_endpoints' ] );
    }

    // ── Setup: create coupons + shipping if missing ───────────────────────────

    public function setup() {
        if ( ! class_exists( 'WooCommerce' ) ) return;

        $this->ensure_coupons();
        $this->ensure_free_shipping();
    }

    /**
     * Create each configured coupon if it doesn't already exist.
     * Idempotent — safe to call multiple times.
     */
    private function ensure_coupons() {
        foreach ( self::COUPONS as $cfg ) {
            $existing = $this->get_coupon_id( $cfg['code'] );

            if ( $existing ) {
                // Coupon exists — make sure it's still published and settings match
                $this->update_coupon( $existing, $cfg );
                continue;
            }

            // Create fresh coupon
            $coupon = new WC_Coupon();
            $coupon->set_code( $cfg['code'] );
            $coupon->set_discount_type( $cfg['discount_type'] );
            $coupon->set_amount( (float) $cfg['amount'] );
            $coupon->set_individual_use( $cfg['individual_use'] );
            $coupon->set_usage_limit_per_user( $cfg['usage_limit_per_user'] );
            if ( $cfg['usage_limit'] !== null ) {
                $coupon->set_usage_limit( $cfg['usage_limit'] );
            }
            $coupon->set_free_shipping( $cfg['free_shipping'] );
            $coupon->set_description( $cfg['description'] );
            $coupon->save();
        }
    }

    /**
     * Update an existing coupon to match current config.
     */
    private function update_coupon( int $coupon_id, array $cfg ) {
        $coupon = new WC_Coupon( $coupon_id );
        $coupon->set_discount_type( $cfg['discount_type'] );
        $coupon->set_amount( (float) $cfg['amount'] );
        $coupon->set_individual_use( $cfg['individual_use'] );
        $coupon->set_usage_limit_per_user( $cfg['usage_limit_per_user'] );
        $coupon->set_free_shipping( $cfg['free_shipping'] );
        $coupon->set_description( $cfg['description'] );
        $coupon->save();
    }

    /**
     * Return the post ID of a coupon by code, or 0 if not found.
     */
    private function get_coupon_id( string $code ): int {
        $ids = get_posts([
            'post_type'      => 'shop_coupon',
            'post_status'    => 'publish',
            'posts_per_page' => 1,
            'title'          => strtolower( $code ),
            'fields'         => 'ids',
        ]);
        return ! empty( $ids ) ? (int) $ids[0] : 0;
    }

    /**
     * Ensure a US shipping zone exists with Free Shipping requiring $75 minimum.
     * Uses direct DB writes via WC_Shipping_Zone because the REST API has a
     * known bug updating shipping method settings.
     */
    private function ensure_free_shipping() {
        if ( ! class_exists( 'WC_Shipping_Zone' ) ) return;

        // Find or create "United States" zone
        $zone    = null;
        $zones   = WC_Shipping_Zones::get_zones();

        foreach ( $zones as $z ) {
            if ( strtolower( $z['zone_name'] ) === 'united states' ) {
                $zone = new WC_Shipping_Zone( $z['zone_id'] );
                break;
            }
        }

        if ( ! $zone ) {
            $zone = new WC_Shipping_Zone();
            $zone->set_zone_name( 'United States' );
            $zone->set_zone_order( 1 );
            $zone->add_location( 'US', 'country' );
            $zone->save();
        }

        // Check if free_shipping method already configured
        $methods = $zone->get_shipping_methods( false );
        $found   = false;

        foreach ( $methods as $method ) {
            if ( $method->id === 'free_shipping' ) {
                // Update min amount setting in DB directly
                $this->set_free_shipping_min( $zone->get_id(), $method->instance_id );
                $found = true;
                break;
            }
        }

        if ( ! $found ) {
            $instance_id = $zone->add_shipping_method( 'free_shipping' );
            if ( $instance_id ) {
                $this->set_free_shipping_min( $zone->get_id(), $instance_id );
            }
        }
    }

    /**
     * Write free shipping method settings directly to the options table.
     * Bypasses the buggy REST API update path.
     */
    private function set_free_shipping_min( int $zone_id, int $instance_id ) {
        $option_key = 'woocommerce_free_shipping_' . $instance_id . '_settings';
        $settings   = get_option( $option_key, [] );

        $settings['requires']   = 'min_amount';
        $settings['min_amount'] = (string) self::FREE_SHIPPING_MIN;
        $settings['enabled']    = 'yes';

        update_option( $option_key, $settings );
    }

    // ── REST endpoints ────────────────────────────────────────────────────────

    public function register_endpoints() {
        // GET /buttoninks/v1/coupons — return current coupon status
        register_rest_route( 'buttoninks/v1', '/coupons', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'api_get_coupons' ],
            'permission_callback' => '__return_true',
        ]);

        // GET /buttoninks/v1/validate-coupon?code=PRINT15 — validate a coupon
        register_rest_route( 'buttoninks/v1', '/validate-coupon', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'api_validate_coupon' ],
            'permission_callback' => '__return_true',
            'args'                => [
                'code' => [ 'required' => true, 'type' => 'string' ],
            ],
        ]);

        // POST /buttoninks/v1/sync-coupons — force re-create/update all coupons (admin only)
        register_rest_route( 'buttoninks/v1', '/sync-coupons', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'api_sync_coupons' ],
            'permission_callback' => function() {
                return current_user_can( 'manage_woocommerce' );
            },
        ]);
    }

    /** Return all configured coupons with their live WC status */
    public function api_get_coupons( WP_REST_Request $request ) {
        $result = [];

        foreach ( self::COUPONS as $cfg ) {
            $id      = $this->get_coupon_id( $cfg['code'] );
            $coupon  = $id ? new WC_Coupon( $id ) : null;

            $result[] = [
                'code'          => $cfg['code'],
                'exists'        => $id > 0,
                'discount_type' => $cfg['discount_type'],
                'amount'        => $cfg['amount'],
                'description'   => $cfg['description'],
                'usage_count'   => $coupon ? $coupon->get_usage_count() : 0,
                'individual_use'=> $cfg['individual_use'],
                'limit_per_user'=> $cfg['usage_limit_per_user'],
            ];
        }

        return rest_ensure_response([
            'coupons'          => $result,
            'free_shipping_min'=> self::FREE_SHIPPING_MIN,
        ]);
    }

    /** Validate a coupon code — returns whether it's valid for the current user */
    public function api_validate_coupon( WP_REST_Request $request ) {
        $code   = sanitize_text_field( strtolower( $request->get_param('code') ) );
        $id     = $this->get_coupon_id( $code );

        if ( ! $id ) {
            return new WP_Error( 'invalid_coupon', 'Coupon not found', [ 'status' => 404 ] );
        }

        $coupon = new WC_Coupon( $id );

        // Check if coupon is still valid (not expired, not exhausted)
        $valid   = true;
        $message = 'Coupon is valid';

        $expiry = $coupon->get_date_expires();
        if ( $expiry && $expiry->getTimestamp() < time() ) {
            $valid   = false;
            $message = 'Coupon has expired';
        }

        $limit = $coupon->get_usage_limit();
        if ( $limit && $coupon->get_usage_count() >= $limit ) {
            $valid   = false;
            $message = 'Coupon usage limit reached';
        }

        return rest_ensure_response([
            'code'          => $code,
            'valid'         => $valid,
            'message'       => $message,
            'discount_type' => $coupon->get_discount_type(),
            'amount'        => $coupon->get_amount(),
        ]);
    }

    /** Force re-sync all coupons and shipping (admin only) */
    public function api_sync_coupons( WP_REST_Request $request ) {
        $this->ensure_coupons();
        $this->ensure_free_shipping();

        return rest_ensure_response([
            'success' => true,
            'message' => 'Coupons and free shipping configuration synced.',
        ]);
    }
}

new ButtonInks_Coupon_Manager();
