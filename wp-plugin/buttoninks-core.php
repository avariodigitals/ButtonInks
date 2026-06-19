<?php
/**
 * Plugin Name: ButtonInks Core
 * Description: Headless core functionality for ButtonInks Next.js integration.
 *              Registers all custom product meta fields and exposes them via REST API.
 * Version: 2.0.0
 * Author: Avario Digitals
 */

if (!defined('ABSPATH')) exit;

class ButtonInks_Core {

    public function __construct() {
        add_action('rest_api_init',              [$this, 'register_endpoints']);
        add_action('init',                       [$this, 'register_product_meta']);
        add_action('add_meta_boxes',             [$this, 'add_product_meta_boxes']);
        add_action('woocommerce_process_product_meta', [$this, 'save_product_meta']);
        add_filter('woocommerce_rest_prepare_product_object', [$this, 'append_acf_to_rest'], 10, 3);
    }

    // =========================================================================
    // 1. REGISTER ALL CUSTOM PRODUCT META FIELDS
    // =========================================================================

    public function register_product_meta() {

        $fields = [

            // ── Product Type Flags ─────────────────────────────────────────
            '_bi_enable_designer'   => 'boolean', // Design Your Own
            '_bi_enable_upload'     => 'boolean', // Upload Design
            '_bi_buy_as_is'         => 'boolean', // Buy As Is (no customisation)

            // ── Available Colors (comma-separated list) ────────────────────
            '_bi_available_colors'  => 'string',  // e.g. "Black,Navy,White,Red"

            // ── Production Options (JSON) ──────────────────────────────────
            // [{"type":"regular","extra_cost":"0","delivery_days":"3-5"},
            //  {"type":"urgent","extra_cost":"15","delivery_days":"1-2"}]
            '_bi_production_options' => 'string',

            // ── Bulk Pricing Tiers (JSON) ──────────────────────────────────
            // [{"min_qty":12,"discount_price":"18.00"},
            //  {"min_qty":50,"discount_price":"15.00"}]
            '_bi_bulk_pricing'      => 'string',

            // ── Print / Artwork Notes shown on product page ────────────────
            '_bi_print_notes'       => 'string',
        ];

        foreach ($fields as $key => $type) {
            register_post_meta('product', $key, [
                'type'         => $type,
                'single'       => true,
                'show_in_rest' => true,
                'auth_callback' => function() { return current_user_can('edit_posts'); },
            ]);
        }
    }

    // =========================================================================
    // 2. META BOX — shown on the product edit screen in WP Admin
    // =========================================================================

    public function add_product_meta_boxes() {
        add_meta_box(
            'buttoninks_product_settings',
            'ButtonInks Product Settings by Avario Digitals',
            [$this, 'render_meta_box'],
            'product',
            'normal',
            'high'
        );
    }

    public function render_meta_box($post) {

        wp_nonce_field('buttoninks_save_meta', 'buttoninks_nonce');

        $enable_designer    = get_post_meta($post->ID, '_bi_enable_designer',    true);
        $enable_upload      = get_post_meta($post->ID, '_bi_enable_upload',      true);
        $buy_as_is          = get_post_meta($post->ID, '_bi_buy_as_is',          true);
        $colors             = get_post_meta($post->ID, '_bi_available_colors',   true);
        $production_options = get_post_meta($post->ID, '_bi_production_options', true);
        $bulk_pricing       = get_post_meta($post->ID, '_bi_bulk_pricing',       true);
        $print_notes        = get_post_meta($post->ID, '_bi_print_notes',        true);

        $production_placeholder = '[{"type":"regular","extra_cost":"0","delivery_days":"3-5"},{"type":"urgent","extra_cost":"15","delivery_days":"1-2"}]';
        $bulk_placeholder       = '[{"min_qty":12,"discount_price":"18.00"},{"min_qty":50,"discount_price":"15.00"},{"min_qty":100,"discount_price":"13.00"}]';

        $color_map = [
            'black'        => '#111827', 'navy'         => '#1e3a5f',
            'white'        => '#f9fafb', 'red'          => '#dc2626',
            'forest green' => '#166534', 'royal blue'   => '#1d4ed8',
            'grey'         => '#6b7280', 'gray'         => '#6b7280',
            'maroon'       => '#7f1d1d', 'orange'       => '#ea580c',
            'purple'       => '#7e22ce', 'yellow'       => '#ca8a04',
            'pink'         => '#db2777', 'light blue'   => '#bfdbfe',
            'heather grey' => '#d1d5db', 'ash'          => '#9ca3af',
            'cardinal'     => '#9f1239', 'sport grey'   => '#e5e7eb',
            'dark heather' => '#4b5563', 'sapphire'     => '#1d4ed8',
            'irish green'  => '#15803d', 'charcoal'     => '#374151',
            'gold'         => '#b45309', 'light pink'   => '#fbcfe8',
            'sand'         => '#d6c9a0', 'mint'         => '#6ee7b7',
        ];
        ?>

        <style>
            /* Scoped to our meta box only */
            #buttoninks_product_settings .bi-wrap       { padding: 4px 0 8px; }
            #buttoninks_product_settings .bi-section    { border-top: 1px solid #dcdcde; padding: 18px 0 4px; }
            #buttoninks_product_settings .bi-section:first-child { border-top: none; padding-top: 4px; }
            #buttoninks_product_settings .bi-label      { display: block; font-weight: 600; font-size: 12px;
                                                          text-transform: uppercase; letter-spacing: .04em;
                                                          color: #1d2327; margin-bottom: 10px; }
            #buttoninks_product_settings .bi-option     { display: flex; align-items: flex-start; gap: 10px;
                                                          margin-bottom: 10px; }
            #buttoninks_product_settings .bi-option input[type=checkbox] { margin-top: 2px; flex-shrink: 0; }
            #buttoninks_product_settings .bi-option-text span   { display: block; font-size: 13px; font-weight: 600;
                                                                   color: #1d2327; line-height: 1.4; }
            #buttoninks_product_settings .bi-option-text small  { display: block; font-size: 11px; color: #646970;
                                                                   margin-top: 1px; }
            #buttoninks_product_settings .bi-badge      { display: inline-block; padding: 1px 7px; border-radius: 3px;
                                                          font-size: 10px; font-weight: 700; margin-left: 6px;
                                                          vertical-align: middle; text-transform: uppercase;
                                                          letter-spacing: .04em; }
            #buttoninks_product_settings .bi-badge-green { background: #edfaef; color: #1a7c34; border: 1px solid #c3e6cb; }
            #buttoninks_product_settings .bi-badge-blue  { background: #eef3fa; color: #2271b1; border: 1px solid #b8d4ef; }
            #buttoninks_product_settings .bi-badge-amber { background: #fcf7e8; color: #7a5200; border: 1px solid #f2d675; }
            #buttoninks_product_settings input[type=text],
            #buttoninks_product_settings textarea        { width: 100%; font-size: 13px; }
            #buttoninks_product_settings textarea        { min-height: 72px; font-family: Consolas, monospace;
                                                           font-size: 12px; resize: vertical; }
            #buttoninks_product_settings .bi-swatches    { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 8px; }
            #buttoninks_product_settings .bi-swatch      { width: 22px; height: 22px; border-radius: 50%;
                                                           border: 2px solid rgba(0,0,0,.12); cursor: default; }
            #buttoninks_product_settings .bi-checklist   { margin: 16px 0 0; padding: 12px 14px;
                                                           background: #f6f7f7; border: 1px solid #dcdcde;
                                                           border-left: 3px solid #2271b1; }
            #buttoninks_product_settings .bi-checklist p { margin: 0 0 6px; font-size: 11px; font-weight: 700;
                                                           text-transform: uppercase; letter-spacing: .05em;
                                                           color: #2271b1; }
            #buttoninks_product_settings .bi-checklist ol { margin: 0; padding-left: 16px; }
            #buttoninks_product_settings .bi-checklist li { font-size: 12px; color: #1d2327; line-height: 2; }
        </style>

        <div class="bi-wrap">

            <!-- SECTION: Customisation Options -->
            <div class="bi-section">
                <span class="bi-label">Customisation Options</span>

                <div class="bi-option">
                    <input type="checkbox" name="_bi_enable_designer" value="1" id="bi_designer"
                           <?php checked($enable_designer, '1'); ?> />
                    <div class="bi-option-text">
                        <label for="bi_designer">
                            <span>Design Your Own <em class="bi-badge bi-badge-green">Designer</em></span>
                            <small>Customer builds the design using the online tool.</small>
                        </label>
                    </div>
                </div>

                <div class="bi-option">
                    <input type="checkbox" name="_bi_enable_upload" value="1" id="bi_upload"
                           <?php checked($enable_upload, '1'); ?> />
                    <div class="bi-option-text">
                        <label for="bi_upload">
                            <span>Upload Design <em class="bi-badge bi-badge-blue">Upload</em></span>
                            <small>Customer sends their own file (PDF, PNG, AI, etc).</small>
                        </label>
                    </div>
                </div>

                <div class="bi-option">
                    <input type="checkbox" name="_bi_buy_as_is" value="1" id="bi_buyasis"
                           <?php checked($buy_as_is, '1'); ?> />
                    <div class="bi-option-text">
                        <label for="bi_buyasis">
                            <span>Buy As Is <em class="bi-badge bi-badge-amber">Retail</em></span>
                            <small>No customisation. Customer adds to cart and checks out.</small>
                        </label>
                    </div>
                </div>
            </div>

            <!-- SECTION: Colors -->
            <div class="bi-section">
                <span class="bi-label">Available Colors</span>
                <input type="text" name="_bi_available_colors"
                       value="<?php echo esc_attr($colors); ?>"
                       placeholder="e.g. Black, Navy, White, Red, Forest Green" />
                <p style="margin:5px 0 0;font-size:11px;color:#646970;">
                    Separate each color with a comma. Match the colors listed on the reference site.
                </p>
                <?php if ($colors): ?>
                    <div class="bi-swatches">
                        <?php foreach (explode(',', $colors) as $c):
                            $c   = trim(strtolower($c));
                            $hex = $color_map[$c] ?? '#e5e7eb';
                        ?>
                            <div class="bi-swatch" style="background:<?php echo esc_attr($hex); ?>"
                                 title="<?php echo esc_attr(ucwords($c)); ?>"></div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>

            <!-- SECTION: Delivery Speed -->
            <div class="bi-section">
                <span class="bi-label">Delivery Speed Options</span>
                <textarea name="_bi_production_options"
                          placeholder="<?php echo esc_attr($production_placeholder); ?>"><?php
                    echo esc_textarea($production_options);
                ?></textarea>
                <p style="margin:5px 0 0;font-size:11px;color:#646970;">
                    Leave blank to use the defaults (Standard 3-5 days / Urgent 1-2 days +$15).
                    Only edit if this product has different delivery times.
                </p>
            </div>

            <!-- SECTION: Bulk Pricing -->
            <div class="bi-section">
                <span class="bi-label">Bulk Pricing</span>
                <textarea name="_bi_bulk_pricing"
                          placeholder="<?php echo esc_attr($bulk_placeholder); ?>"><?php
                    echo esc_textarea($bulk_pricing);
                ?></textarea>
                <p style="margin:5px 0 0;font-size:11px;color:#646970;">
                    Leave blank if this product has no quantity discounts.
                    Each line sets a minimum quantity and the price per unit at that quantity.
                </p>
            </div>

            <!-- SECTION: Artwork Notes -->
            <div class="bi-section">
                <span class="bi-label">Artwork Notes</span>
                <textarea name="_bi_print_notes"
                          placeholder="e.g. Minimum 300 DPI. Bleed: 0.125 inches. Safe zone: 0.25 inches."><?php
                    echo esc_textarea($print_notes);
                ?></textarea>
                <p style="margin:5px 0 0;font-size:11px;color:#646970;">
                    Shown to the customer on the product page. Keep it short and clear.
                </p>
            </div>

            <!-- CHECKLIST -->
            <div class="bi-checklist">
                <p>Before publishing — make sure you have:</p>
                <ol>
                    <li>Ticked the correct Customisation Option above</li>
                    <li>Added the colors that match the reference site</li>
                    <li>Added sizes in the <strong>Attributes</strong> tab: S, M, L, XL, XXL, 3XL</li>
                    <li>Set the price to match the reference site</li>
                    <li>Selected the correct <strong>Category</strong> (parent and child) in the right panel</li>
                    <li>Uploaded at least one product image</li>
                </ol>
            </div>

        </div><?php
    }

    // =========================================================================
    // 3. SAVE META WHEN PRODUCT IS PUBLISHED / UPDATED
    // =========================================================================

    public function save_product_meta($post_id) {

        if (!isset($_POST['buttoninks_nonce']) ||
            !wp_verify_nonce($_POST['buttoninks_nonce'], 'buttoninks_save_meta')) {
            return;
        }

        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
        if (!current_user_can('edit_post', $post_id)) return;

        // Checkboxes — save '1' or '0'
        $checkboxes = ['_bi_enable_designer', '_bi_enable_upload', '_bi_buy_as_is'];
        foreach ($checkboxes as $key) {
            update_post_meta($post_id, $key, isset($_POST[$key]) ? '1' : '0');
        }

        // Text / JSON fields
        $text_fields = ['_bi_available_colors', '_bi_production_options', '_bi_bulk_pricing', '_bi_print_notes'];
        foreach ($text_fields as $key) {
            if (isset($_POST[$key])) {
                update_post_meta($post_id, $key, sanitize_textarea_field(wp_unslash($_POST[$key])));
            }
        }
    }

    // =========================================================================
    // 4. APPEND FIELDS TO WOOCOMMERCE REST API RESPONSE
    //    → This is what the Next.js frontend reads as product.acf
    // =========================================================================

    public function append_acf_to_rest($response, $product, $request) {

        $id = $product->get_id();

        $colors_raw         = get_post_meta($id, '_bi_available_colors',   true);
        $production_raw     = get_post_meta($id, '_bi_production_options', true);
        $bulk_raw           = get_post_meta($id, '_bi_bulk_pricing',       true);

        // Parse colors into array
        $colors = [];
        if ($colors_raw) {
            $colors = array_map('trim', explode(',', $colors_raw));
        }

        // Parse JSON fields safely
        $production_options = [];
        if ($production_raw) {
            $decoded = json_decode($production_raw, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $production_options = $decoded;
            }
        }

        $bulk_pricing = [];
        if ($bulk_raw) {
            $decoded = json_decode($bulk_raw, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $bulk_pricing = $decoded;
            }
        }

        // Attach as acf object (matches WPProduct interface in wordpress.ts)
        $response->data['acf'] = [
            'enable_designer'    => get_post_meta($id, '_bi_enable_designer', true) === '1',
            'enable_upload'      => get_post_meta($id, '_bi_enable_upload',   true) === '1',
            'buy_as_is'          => get_post_meta($id, '_bi_buy_as_is',       true) === '1',
            'available_colors'   => $colors,
            'production_options' => $production_options,
            'bulk_pricing'       => $bulk_pricing,
            'print_notes'        => get_post_meta($id, '_bi_print_notes', true) ?: '',
        ];

        return $response;
    }

    // =========================================================================
    // 5. CUSTOM REST ENDPOINTS (Registration, Wishlist)
    // =========================================================================

    public function register_endpoints() {

        // User Registration
        register_rest_route('buttoninks/v1', '/register', [
            'methods'             => 'POST',
            'callback'            => [$this, 'register_user'],
            'permission_callback' => '__return_true',
        ]);

        // Wishlist — GET
        register_rest_route('buttoninks/v1', '/wishlist', [
            'methods'             => 'GET',
            'callback'            => [$this, 'get_wishlist'],
            'permission_callback' => [$this, 'is_user_logged_in'],
        ]);

        // Wishlist — ADD
        register_rest_route('buttoninks/v1', '/wishlist/add', [
            'methods'             => 'POST',
            'callback'            => [$this, 'add_to_wishlist'],
            'permission_callback' => [$this, 'is_user_logged_in'],
        ]);

        // Wishlist — REMOVE
        register_rest_route('buttoninks/v1', '/wishlist/remove', [
            'methods'             => 'POST',
            'callback'            => [$this, 'remove_from_wishlist'],
            'permission_callback' => [$this, 'is_user_logged_in'],
        ]);
    }

    public function is_user_logged_in() {
        return get_current_user_id() !== 0;
    }

    public function register_user($request) {
        $params   = $request->get_json_params();
        $email    = sanitize_email($params['email']);
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
        if (is_wp_error($user_id)) return $user_id;

        $user = new WP_User($user_id);
        $user->set_role('customer');

        return ['success' => true, 'message' => 'Registration successful', 'user_id' => $user_id];
    }

    public function get_wishlist($request) {
        $wishlist = get_user_meta(get_current_user_id(), '_buttoninks_wishlist', true);
        return !empty($wishlist) ? $wishlist : [];
    }

    public function add_to_wishlist($request) {
        $user_id    = get_current_user_id();
        $product_id = intval($request->get_json_params()['product_id']);
        $wishlist   = get_user_meta($user_id, '_buttoninks_wishlist', true) ?: [];

        if (!in_array($product_id, $wishlist)) {
            $wishlist[] = $product_id;
            update_user_meta($user_id, '_buttoninks_wishlist', $wishlist);
        }
        return ['success' => true, 'wishlist' => $wishlist];
    }

    public function remove_from_wishlist($request) {
        $user_id    = get_current_user_id();
        $product_id = intval($request->get_json_params()['product_id']);
        $wishlist   = get_user_meta($user_id, '_buttoninks_wishlist', true) ?: [];
        $key        = array_search($product_id, $wishlist);

        if ($key !== false) {
            unset($wishlist[$key]);
            update_user_meta($user_id, '_buttoninks_wishlist', array_values($wishlist));
        }
        return ['success' => true, 'wishlist' => $wishlist];
    }
}

new ButtonInks_Core();
