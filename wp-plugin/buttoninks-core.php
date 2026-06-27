<?php
/**
 * Plugin Name: ButtonInks Core
 * Description: Headless core functionality for ButtonInks Next.js integration.
 *              Registers all custom product meta fields and exposes them via REST API.
 * Version: 2.1.0
 * Author: Avario Digitals
 */

if (!defined('ABSPATH')) exit;

class ButtonInks_Core {

    public function __construct() {
        add_action('rest_api_init',              [$this, 'register_endpoints']);
        add_action('init',                       [$this, 'register_product_meta']);
        add_action('init',                       [$this, 'register_design_template_cpt']);
        add_action('add_meta_boxes',             [$this, 'add_product_meta_boxes']);
        add_action('add_meta_boxes',             [$this, 'add_design_template_meta_box']);
        add_action('woocommerce_process_product_meta', [$this, 'save_product_meta']);
        add_action('save_post_bi_design_template',     [$this, 'save_design_template_meta']);
        add_filter('woocommerce_rest_prepare_product_object', [$this, 'append_acf_to_rest'], 10, 3);
    }

    // =========================================================================
    // 1. REGISTER ALL CUSTOM PRODUCT META FIELDS
    // =========================================================================

    public function register_product_meta() {

        $fields = [
            // Customisation flags — stored as '1'/'0' strings
            '_bi_enable_designer'    => 'string',
            '_bi_enable_upload'      => 'string',
            '_bi_buy_as_is'          => 'string',

            // Delivery speed
            '_bi_enable_regular'     => 'string',
            '_bi_enable_urgent'      => 'string',
            '_bi_urgent_extra_cost'  => 'string',
            '_bi_regular_days'       => 'string',
            '_bi_urgent_days'        => 'string',

            // Bulk pricing
            '_bi_enable_bulk'        => 'string',
            '_bi_bulk_base_price'    => 'string',
            '_bi_bulk_tiers'         => 'string',  // JSON string

            // Artwork notes
            '_bi_print_notes'        => 'string',

            // Downloadable templates — JSON string
            '_bi_download_templates' => 'string',
        ];

        foreach ($fields as $key => $type) {
            register_post_meta('product', $key, [
                'type'          => $type,
                'single'        => true,
                'show_in_rest'  => true,
                'auth_callback' => function() { return current_user_can('edit_posts'); },
            ]);
        }
    }

    // =========================================================================
    // 2. META BOX
    // =========================================================================

    public function add_product_meta_boxes() {
        add_meta_box(
            'buttoninks_product_settings',
            'ButtonInks Product Settings by Avario Digitals',
            [$this, 'render_meta_box'],
            'product', 'normal', 'high'
        );
    }

    public function render_meta_box($post) {
        wp_nonce_field('buttoninks_save_meta', 'buttoninks_nonce');

        $enable_designer    = get_post_meta($post->ID, '_bi_enable_designer',    true);
        $enable_upload      = get_post_meta($post->ID, '_bi_enable_upload',      true);
        $buy_as_is          = get_post_meta($post->ID, '_bi_buy_as_is',          true);

        $enable_regular     = get_post_meta($post->ID, '_bi_enable_regular',     true);
        $enable_urgent      = get_post_meta($post->ID, '_bi_enable_urgent',      true);
        $urgent_cost        = get_post_meta($post->ID, '_bi_urgent_extra_cost',  true) ?: '15';
        $regular_days       = get_post_meta($post->ID, '_bi_regular_days',       true) ?: '3-5';
        $urgent_days        = get_post_meta($post->ID, '_bi_urgent_days',        true) ?: '1-2';

        $enable_bulk        = get_post_meta($post->ID, '_bi_enable_bulk',        true);
        $bulk_base          = get_post_meta($post->ID, '_bi_bulk_base_price',    true);
        $bulk_tiers_raw     = get_post_meta($post->ID, '_bi_bulk_tiers',         true) ?: '[]';
        $bulk_tiers         = json_decode($bulk_tiers_raw, true) ?: [];

        $print_notes        = get_post_meta($post->ID, '_bi_print_notes',        true);
        $dl_templates_raw   = get_post_meta($post->ID, '_bi_download_templates', true) ?: '[]';
        $dl_templates       = json_decode($dl_templates_raw, true) ?: [];

        // Ensure we always have 3 tier rows in the UI
        while (count($bulk_tiers) < 3) {
            $bulk_tiers[] = ['min_qty' => '', 'pct' => ''];
        }
        ?>

        <style>
            #buttoninks_product_settings .bi-wrap      { padding:4px 0 8px; }
            #buttoninks_product_settings .bi-section   { border-top:1px solid #dcdcde; padding:18px 0 4px; }
            #buttoninks_product_settings .bi-section:first-child { border-top:none; padding-top:4px; }
            #buttoninks_product_settings .bi-label     { display:block; font-weight:600; font-size:12px;
                                                         text-transform:uppercase; letter-spacing:.04em;
                                                         color:#1d2327; margin-bottom:10px; }
            #buttoninks_product_settings .bi-option    { display:flex; align-items:flex-start; gap:10px; margin-bottom:10px; }
            #buttoninks_product_settings .bi-option input[type=checkbox] { margin-top:2px; flex-shrink:0; }
            #buttoninks_product_settings .bi-option-text span  { display:block; font-size:13px; font-weight:600; color:#1d2327; line-height:1.4; }
            #buttoninks_product_settings .bi-option-text small { display:block; font-size:11px; color:#646970; margin-top:1px; }
            #buttoninks_product_settings .bi-badge     { display:inline-block; padding:1px 7px; border-radius:3px;
                                                         font-size:10px; font-weight:700; margin-left:6px;
                                                         vertical-align:middle; text-transform:uppercase; letter-spacing:.04em; }
            #buttoninks_product_settings .bi-badge-green  { background:#edfaef; color:#1a7c34; border:1px solid #c3e6cb; }
            #buttoninks_product_settings .bi-badge-blue   { background:#eef3fa; color:#2271b1; border:1px solid #b8d4ef; }
            #buttoninks_product_settings .bi-badge-amber  { background:#fcf7e8; color:#7a5200; border:1px solid #f2d675; }
            #buttoninks_product_settings .bi-badge-red    { background:#fce8e8; color:#a00; border:1px solid #f5c6c6; }
            #buttoninks_product_settings input[type=text],
            #buttoninks_product_settings input[type=number] { font-size:13px; }
            #buttoninks_product_settings textarea       { width:100%; min-height:60px; font-family:Consolas,monospace;
                                                          font-size:12px; resize:vertical; }
            #buttoninks_product_settings .bi-indent     { margin-left:28px; margin-top:8px; padding:12px 14px;
                                                          background:#f6f7f7; border:1px solid #e2e4e7; border-radius:4px; }
            #buttoninks_product_settings .bi-row        { display:flex; align-items:center; gap:8px; margin-bottom:8px; flex-wrap:wrap; }
            #buttoninks_product_settings .bi-row label  { font-size:12px; color:#1d2327; font-weight:600; min-width:80px; }
            #buttoninks_product_settings .bi-row input  { width:80px; }
            #buttoninks_product_settings .bi-tier-row   { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:6px; align-items:center; }
            #buttoninks_product_settings .bi-tier-row label { font-size:11px; color:#646970; }
            #buttoninks_product_settings .bi-tier-row input { width:100%; }
            #buttoninks_product_settings .bi-tpl-row   { display:flex; align-items:center; gap:8px; margin-bottom:8px; flex-wrap:wrap; }
            #buttoninks_product_settings .bi-tpl-row select { font-size:12px; }
            #buttoninks_product_settings .bi-checklist { margin:16px 0 0; padding:12px 14px;
                                                         background:#f6f7f7; border:1px solid #dcdcde; border-left:3px solid #2271b1; }
            #buttoninks_product_settings .bi-checklist p  { margin:0 0 6px; font-size:11px; font-weight:700;
                                                             text-transform:uppercase; letter-spacing:.05em; color:#2271b1; }
            #buttoninks_product_settings .bi-checklist ol { margin:0; padding-left:16px; }
            #buttoninks_product_settings .bi-checklist li { font-size:12px; color:#1d2327; line-height:2; }
            #buttoninks_product_settings .bi-note      { font-size:11px; color:#646970; margin:5px 0 0; }
            .bi-hidden { display:none !important; }
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

            <!-- NOTE: Colors are now controlled by WooCommerce Attributes (Color attribute on the product) -->
            <div class="bi-section">
                <span class="bi-label">Available Colors</span>
                <p class="bi-note" style="color:#2271b1;font-size:12px;">
                    ℹ️ Colors are now managed via the <strong>Attributes</strong> tab — add a &ldquo;Color&rdquo; attribute there.
                    The frontend will automatically display swatches based on those values.
                </p>
            </div>

            <!-- SECTION: Delivery Speed Options -->
            <div class="bi-section">
                <span class="bi-label">Delivery Speed Options</span>
                <p class="bi-note">Enable the speed options available for this product. Defaults are shown — only change if this product is different.</p>

                <div class="bi-option" style="margin-top:10px;">
                    <input type="checkbox" name="_bi_enable_regular" value="1" id="bi_regular"
                           <?php checked($enable_regular, '1'); ?> onchange="biToggle('bi_regular_opts',this.checked)" />
                    <div class="bi-option-text">
                        <label for="bi_regular">
                            <span>Standard / Regular <em class="bi-badge bi-badge-green">Free</em></span>
                            <small>Default: 3–5 business days, no extra cost.</small>
                        </label>
                    </div>
                </div>
                <div id="bi_regular_opts" class="bi-indent <?php echo ($enable_regular === '1') ? '' : 'bi-hidden'; ?>">
                    <div class="bi-row">
                        <label>Delivery days</label>
                        <input type="text" name="_bi_regular_days" value="<?php echo esc_attr($regular_days); ?>" placeholder="3-5" style="width:70px;" />
                        <span class="bi-note" style="margin:0;">business days</span>
                    </div>
                </div>

                <div class="bi-option" style="margin-top:8px;">
                    <input type="checkbox" name="_bi_enable_urgent" value="1" id="bi_urgent"
                           <?php checked($enable_urgent, '1'); ?> onchange="biToggle('bi_urgent_opts',this.checked)" />
                    <div class="bi-option-text">
                        <label for="bi_urgent">
                            <span>Urgent / Express <em class="bi-badge bi-badge-red">Paid</em></span>
                            <small>Default: 1–2 business days, +$15.</small>
                        </label>
                    </div>
                </div>
                <div id="bi_urgent_opts" class="bi-indent <?php echo ($enable_urgent === '1') ? '' : 'bi-hidden'; ?>">
                    <div class="bi-row">
                        <label>Extra cost ($)</label>
                        <input type="number" name="_bi_urgent_extra_cost" value="<?php echo esc_attr($urgent_cost); ?>" placeholder="15" min="0" step="0.01" />
                    </div>
                    <div class="bi-row">
                        <label>Delivery days</label>
                        <input type="text" name="_bi_urgent_days" value="<?php echo esc_attr($urgent_days); ?>" placeholder="1-2" style="width:70px;" />
                        <span class="bi-note" style="margin:0;">business days</span>
                    </div>
                </div>
            </div>

            <!-- SECTION: Bulk Pricing -->
            <div class="bi-section">
                <span class="bi-label">Bulk Pricing</span>

                <div class="bi-option">
                    <input type="checkbox" name="_bi_enable_bulk" value="1" id="bi_bulk"
                           <?php checked($enable_bulk, '1'); ?> onchange="biToggle('bi_bulk_opts',this.checked)" />
                    <div class="bi-option-text">
                        <label for="bi_bulk">
                            <span>Enable Bulk / Quantity Discounts</span>
                            <small>Show tiered pricing based on quantity ordered.</small>
                        </label>
                    </div>
                </div>

                <div id="bi_bulk_opts" class="bi-indent <?php echo ($enable_bulk === '1') ? '' : 'bi-hidden'; ?>">
                    <div class="bi-row" style="margin-bottom:12px;">
                        <label>Base price ($)</label>
                        <input type="number" name="_bi_bulk_base_price" id="bi_bulk_base"
                               value="<?php echo esc_attr($bulk_base); ?>" placeholder="e.g. 20.00" min="0" step="0.01" />
                        <span class="bi-note" style="margin:0;">Used to calculate tier prices</span>
                    </div>

                    <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#1d2327;margin:0 0 8px;">
                        Discount Tiers — enter % off at each quantity break
                    </p>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 12px;margin-bottom:6px;">
                        <span style="font-size:11px;font-weight:700;color:#646970;">Min Qty</span>
                        <span style="font-size:11px;font-weight:700;color:#646970;">Discount %</span>
                    </div>
                    <?php foreach ($bulk_tiers as $i => $tier): ?>
                    <div class="bi-tier-row">
                        <input type="number" name="_bi_bulk_tier_qty[]"
                               value="<?php echo esc_attr($tier['min_qty'] ?? ''); ?>"
                               placeholder="e.g. 12" min="1" step="1" />
                        <input type="number" name="_bi_bulk_tier_pct[]"
                               value="<?php echo esc_attr($tier['pct'] ?? ''); ?>"
                               placeholder="e.g. 10" min="0" max="100" step="0.5" />
                    </div>
                    <?php endforeach; ?>
                    <p class="bi-note">
                        Example: Qty 12 at 10% off a $20 base → <strong>$18.00</strong> per unit.
                        Leave empty rows blank — they will be ignored.
                    </p>
                </div>
            </div>

            <!-- SECTION: Artwork Notes -->
            <div class="bi-section">
                <span class="bi-label">Artwork Notes</span>
                <textarea name="_bi_print_notes"
                          placeholder="e.g. Minimum 300 DPI. Bleed: 0.125 inches. Safe zone: 0.25 inches."><?php
                    echo esc_textarea($print_notes);
                ?></textarea>
                <p class="bi-note">Shown to the customer on the product page. Keep it short and clear.</p>
            </div>

            <!-- SECTION: Downloadable Templates -->
            <div class="bi-section">
                <span class="bi-label">Downloadable Print Templates</span>
                <p class="bi-note" style="margin-bottom:10px;">
                    Upload template files so customers can download them before submitting their artwork.
                    Pick the format — the frontend button will show the correct icon (PDF / AI).
                </p>

                <div id="bi_tpl_list">
                <?php if (empty($dl_templates)): ?>
                    <p id="bi_tpl_empty" style="font-size:12px;color:#646970;margin:0 0 8px;">No templates added yet.</p>
                <?php else: ?>
                    <p id="bi_tpl_empty" style="font-size:12px;color:#646970;margin:0 0 8px;display:none;"></p>
                <?php endif; ?>

                <?php foreach ($dl_templates as $i => $tpl): ?>
                    <div class="bi-tpl-row" data-index="<?php echo $i; ?>">
                        <select name="_bi_tpl_format[]" style="width:80px;">
                            <?php foreach (['PDF','AI','PSD','EPS','PNG','SVG'] as $fmt): ?>
                                <option value="<?php echo $fmt; ?>" <?php selected($tpl['label'], $fmt); ?>><?php echo $fmt; ?></option>
                            <?php endforeach; ?>
                        </select>
                        <input type="url" name="_bi_tpl_url[]" value="<?php echo esc_attr($tpl['url']); ?>"
                               placeholder="https://..." style="flex:1;min-width:200px;" />
                        <button type="button" class="button bi-upload-tpl" data-index="<?php echo $i; ?>">📁 Browse Media</button>
                        <button type="button" class="button bi-remove-tpl" onclick="biRemoveTpl(this)" style="color:#a00;">✕ Remove</button>
                    </div>
                <?php endforeach; ?>
                </div>

                <button type="button" class="button button-secondary" onclick="biAddTpl()" style="margin-top:8px;">
                    + Add Template File
                </button>
            </div>

            <!-- CHECKLIST -->
            <div class="bi-checklist">
                <p>Before publishing — make sure you have:</p>
                <ol>
                    <li>Ticked the correct Customisation Option above</li>
                    <li>Added Colors via the <strong>Attributes</strong> tab (Color attribute)</li>
                    <li>Added sizes in the <strong>Attributes</strong> tab: S, M, L, XL, XXL, 3XL</li>
                    <li>Enabled the delivery speed options that apply to this product</li>
                    <li>Set the price to match the reference site</li>
                    <li>Selected the correct <strong>Category</strong> in the right panel</li>
                    <li>Uploaded at least one product image</li>
                    <li>Uploaded downloadable templates if applicable</li>
                </ol>
            </div>

        </div>

        <script>
        // Toggle show/hide for indent sections
        function biToggle(id, show) {
            document.getElementById(id).classList.toggle('bi-hidden', !show);
        }

        // Template rows — add / remove
        var biTplIndex = <?php echo count($dl_templates); ?>;

        function biAddTpl() {
            var list = document.getElementById('bi_tpl_list');
            var empty = document.getElementById('bi_tpl_empty');
            if (empty) empty.style.display = 'none';

            var formats = ['PDF','AI','PSD','EPS','PNG','SVG'];
            var opts = formats.map(f => '<option value="'+f+'">'+f+'</option>').join('');

            var row = document.createElement('div');
            row.className = 'bi-tpl-row';
            row.setAttribute('data-index', biTplIndex);
            row.innerHTML = '<select name="_bi_tpl_format[]" style="width:80px;">'+opts+'</select>'
                + '<input type="url" name="_bi_tpl_url[]" placeholder="https://..." style="flex:1;min-width:200px;" />'
                + '<button type="button" class="button bi-upload-tpl" data-index="'+biTplIndex+'">📁 Browse Media</button>'
                + '<button type="button" class="button bi-remove-tpl" onclick="biRemoveTpl(this)" style="color:#a00;">✕ Remove</button>';
            list.appendChild(row);
            biTplIndex++;
            biBindMediaBtn(row.querySelector('.bi-upload-tpl'));
        }

        function biRemoveTpl(btn) {
            var row = btn.closest('.bi-tpl-row');
            if (row) row.remove();
            var remaining = document.querySelectorAll('.bi-tpl-row');
            var empty = document.getElementById('bi_tpl_empty');
            if (empty) empty.style.display = remaining.length === 0 ? '' : 'none';
        }

        // WP Media Uploader integration
        function biBindMediaBtn(btn) {
            btn.addEventListener('click', function() {
                var row   = btn.closest('.bi-tpl-row');
                var input = row.querySelector('input[name="_bi_tpl_url[]"]');
                var frame = wp.media({
                    title: 'Select Template File',
                    button: { text: 'Use this file' },
                    multiple: false
                });
                frame.on('select', function() {
                    var att = frame.state().get('selection').first().toJSON();
                    input.value = att.url;
                });
                frame.open();
            });
        }

        // Bind existing media buttons on page load
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('.bi-upload-tpl').forEach(biBindMediaBtn);
        });
        </script>
        <?php
    }

    // =========================================================================
    // 3. SAVE META
    // =========================================================================

    public function save_product_meta($post_id) {

        if (!isset($_POST['buttoninks_nonce']) ||
            !wp_verify_nonce($_POST['buttoninks_nonce'], 'buttoninks_save_meta')) {
            return;
        }
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
        if (!current_user_can('edit_post', $post_id)) return;

        // Checkboxes
        $checkboxes = [
            '_bi_enable_designer', '_bi_enable_upload', '_bi_buy_as_is',
            '_bi_enable_regular',  '_bi_enable_urgent', '_bi_enable_bulk',
        ];
        foreach ($checkboxes as $key) {
            update_post_meta($post_id, $key, isset($_POST[$key]) ? '1' : '0');
        }

        // Delivery speed plain fields
        foreach (['_bi_urgent_extra_cost', '_bi_regular_days', '_bi_urgent_days'] as $key) {
            if (isset($_POST[$key])) {
                update_post_meta($post_id, $key, sanitize_text_field(wp_unslash($_POST[$key])));
            }
        }

        // Bulk pricing — base price
        $bulk_base_price = '';
        if (isset($_POST['_bi_bulk_base_price'])) {
            $bulk_base_price = sanitize_text_field(wp_unslash($_POST['_bi_bulk_base_price']));
            update_post_meta($post_id, '_bi_bulk_base_price', $bulk_base_price);
        }

        // Bulk pricing — tiers: build JSON from parallel arrays
        // Only process tiers when bulk is enabled
        $tiers = [];
        if (isset($_POST['_bi_enable_bulk'])) {
            $tier_qtys  = isset($_POST['_bi_bulk_tier_qty']) ? (array) $_POST['_bi_bulk_tier_qty'] : [];
            $tier_pcts  = isset($_POST['_bi_bulk_tier_pct']) ? (array) $_POST['_bi_bulk_tier_pct'] : [];
            $base_price = floatval($bulk_base_price);

            if ($base_price > 0) {
                foreach ($tier_qtys as $i => $qty) {
                    $qty = intval($qty);
                    $pct = floatval($tier_pcts[$i] ?? 0);
                    if ($qty > 0 && $pct > 0) {
                        $discount_price = round($base_price * (1 - $pct / 100), 2);
                        $tiers[] = [
                            'min_qty'        => $qty,
                            'pct'            => $pct,
                            'discount_price' => number_format($discount_price, 2, '.', ''),
                        ];
                    }
                }
            }
            // Sort ascending by min_qty
            usort($tiers, function($a, $b) { return $a['min_qty'] - $b['min_qty']; });
        }
        update_post_meta($post_id, '_bi_bulk_tiers', wp_json_encode($tiers));

        // Artwork notes
        if (isset($_POST['_bi_print_notes'])) {
            update_post_meta($post_id, '_bi_print_notes',
                sanitize_textarea_field(wp_unslash($_POST['_bi_print_notes'])));
        }

        // Downloadable templates — build JSON from parallel url/format arrays
        $allowed_formats = ['PDF', 'AI', 'PSD', 'EPS', 'PNG', 'SVG'];
        $tpl_urls    = isset($_POST['_bi_tpl_url'])    ? (array) $_POST['_bi_tpl_url']    : [];
        $tpl_formats = isset($_POST['_bi_tpl_format']) ? (array) $_POST['_bi_tpl_format'] : [];
        $templates   = [];
        foreach ($tpl_urls as $i => $url) {
            $url    = esc_url_raw(trim(wp_unslash($url)));
            $label  = sanitize_text_field($tpl_formats[$i] ?? 'PDF');
            $label  = in_array(strtoupper($label), $allowed_formats, true) ? strtoupper($label) : 'PDF';
            if (!empty($url) && strlen($url) > 10) {
                $templates[] = ['url' => $url, 'label' => $label];
            }
        }
        update_post_meta($post_id, '_bi_download_templates', wp_json_encode($templates));
    }

    // =========================================================================
    // 4. APPEND TO REST API RESPONSE
    // =========================================================================

    public function append_acf_to_rest($response, $product, $request) {

        $id = $product->get_id();

        // Delivery speed — build production_options from checkbox fields
        $production_options = [];
        if (get_post_meta($id, '_bi_enable_regular', true) === '1') {
            $production_options[] = [
                'type'          => 'regular',
                'extra_cost'    => '0',
                'delivery_days' => get_post_meta($id, '_bi_regular_days', true) ?: '3-5',
            ];
        }
        if (get_post_meta($id, '_bi_enable_urgent', true) === '1') {
            $production_options[] = [
                'type'          => 'urgent',
                'extra_cost'    => get_post_meta($id, '_bi_urgent_extra_cost', true) ?: '15',
                'delivery_days' => get_post_meta($id, '_bi_urgent_days', true) ?: '1-2',
            ];
        }

        // Bulk pricing — expose tiers with discount_price already calculated
        $bulk_pricing = [];
        if (get_post_meta($id, '_bi_enable_bulk', true) === '1') {
            $raw = get_post_meta($id, '_bi_bulk_tiers', true);
            if ($raw) {
                $decoded = json_decode($raw, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $bulk_pricing = $decoded;
                }
            }
        }

        // Downloadable templates
        $dl_templates = [];
        $tpl_raw = get_post_meta($id, '_bi_download_templates', true);
        if ($tpl_raw) {
            $decoded = json_decode($tpl_raw, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $dl_templates = $decoded;
            }
        }

        $response->data['acf'] = [
            'enable_designer'      => get_post_meta($id, '_bi_enable_designer', true) === '1',
            'enable_upload'        => get_post_meta($id, '_bi_enable_upload',   true) === '1',
            'buy_as_is'            => get_post_meta($id, '_bi_buy_as_is',       true) === '1',
            'available_colors'     => [],  // Deprecated — use WC Color attribute
            'production_options'   => $production_options,
            'bulk_pricing'         => $bulk_pricing,
            'print_notes'          => get_post_meta($id, '_bi_print_notes', true) ?: '',
            'download_templates'   => $dl_templates,
        ];

        return $response;
    }

    // =========================================================================
    // 6. DESIGN TEMPLATES — Custom Post Type + REST Endpoint
    // =========================================================================

    /**
     * Register the bi_design_template custom post type.
     * Admin goes to WP Admin → Design Templates → Add New
     */
    public function register_design_template_cpt() {
        register_post_type('bi_design_template', [
            'labels' => [
                'name'               => 'Design Templates',
                'singular_name'      => 'Design Template',
                'add_new'            => 'Add New Template',
                'add_new_item'       => 'Add New Design Template',
                'edit_item'          => 'Edit Design Template',
                'new_item'           => 'New Design Template',
                'view_item'          => 'View Design Template',
                'search_items'       => 'Search Design Templates',
                'not_found'          => 'No design templates found',
                'not_found_in_trash' => 'No design templates in trash',
                'menu_name'          => 'Design Templates',
            ],
            'public'              => false,
            'show_ui'             => true,
            'show_in_menu'        => true,
            'menu_icon'           => 'dashicons-art',
            'supports'            => ['title', 'thumbnail'],
            'show_in_rest'        => false, // We expose via custom endpoint
            'rewrite'             => false,
        ]);
    }

    /**
     * Meta box for the Design Template CPT
     */
    public function add_design_template_meta_box() {
        add_meta_box(
            'bi_design_template_fields',
            'Template Settings',
            [$this, 'render_design_template_meta_box'],
            'bi_design_template',
            'normal',
            'high'
        );
    }

    public function render_design_template_meta_box($post) {
        wp_nonce_field('bi_design_template_save', 'bi_dt_nonce');

        $category    = get_post_meta($post->ID, '_bi_dt_category',    true) ?: 'apparel';
        $tags        = get_post_meta($post->ID, '_bi_dt_tags',         true) ?: '';
        $elements    = get_post_meta($post->ID, '_bi_dt_elements',     true) ?: '';

        $categories  = ['apparel', 'mug', 'corporate', 'sticker', 'banner', 'business-card', 'poster', 'other'];
        ?>
        <style>
            #bi_design_template_fields .bi-dt-wrap { padding: 8px 0; }
            #bi_design_template_fields .bi-dt-row  { margin-bottom: 16px; }
            #bi_design_template_fields .bi-dt-row label { display: block; font-weight: 600; font-size: 12px;
                text-transform: uppercase; letter-spacing: .04em; color: #1d2327; margin-bottom: 6px; }
            #bi_design_template_fields select,
            #bi_design_template_fields input[type=text] { font-size: 13px; width: 100%; max-width: 400px; }
            #bi_design_template_fields textarea { width: 100%; font-family: Consolas, monospace;
                font-size: 12px; resize: vertical; min-height: 180px; }
            #bi_design_template_fields .bi-dt-note { font-size: 11px; color: #646970; margin: 4px 0 0; }
            #bi_design_template_fields .bi-dt-thumbnail-note {
                padding: 10px 14px; background: #eef3fa; border-left: 3px solid #2271b1;
                font-size: 12px; color: #2271b1; margin-top: 8px;
            }
        </style>

        <div class="bi-dt-wrap">

            <div class="bi-dt-row">
                <label for="bi_dt_category">Category</label>
                <select name="_bi_dt_category" id="bi_dt_category">
                    <?php foreach ($categories as $cat): ?>
                        <option value="<?php echo esc_attr($cat); ?>" <?php selected($category, $cat); ?>>
                            <?php echo esc_html(ucfirst(str_replace('-', ' ', $cat))); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
                <p class="bi-dt-note">Used to filter templates in the Design Studio.</p>
            </div>

            <div class="bi-dt-row">
                <label for="bi_dt_tags">Style Tags <span style="font-weight:400;text-transform:none;">(comma separated)</span></label>
                <input type="text" name="_bi_dt_tags" id="bi_dt_tags"
                       value="<?php echo esc_attr($tags); ?>"
                       placeholder="e.g. Modern, Minimalist, Bold" />
                <p class="bi-dt-note">Shown as chips on the template card. Example: Modern, Minimalist</p>
            </div>

            <div class="bi-dt-row">
                <label for="bi_dt_elements">Canvas Elements (JSON)</label>
                <textarea name="_bi_dt_elements" id="bi_dt_elements"
                          placeholder='[{"type":"text","content":"BRAND NAME","x":80,"y":250,"width":440,"height":90,"rotation":0,"opacity":1,"color":"#064E3B","fontFamily":"Outfit","fontSize":56,"fontWeight":"900","textAlign":"center"}]'
                ><?php echo esc_textarea($elements); ?></textarea>
                <p class="bi-dt-note">
                    JSON array of canvas elements. Each element needs: <code>type</code> (text/image),
                    <code>content</code>, <code>x</code>, <code>y</code>, <code>width</code>, <code>height</code>,
                    <code>rotation</code>, <code>opacity</code>, and for text: <code>color</code>,
                    <code>fontFamily</code>, <code>fontSize</code>, <code>fontWeight</code>, <code>textAlign</code>.
                </p>
            </div>

            <div class="bi-dt-thumbnail-note">
                ℹ️ <strong>Preview Thumbnail:</strong> Set the <strong>Featured Image</strong> (right column) —
                this is the thumbnail shown in the Design Studio template picker. Recommended size: 600×480px.
            </div>

        </div>
        <?php
    }

    public function save_design_template_meta($post_id) {
        if (!isset($_POST['bi_dt_nonce']) ||
            !wp_verify_nonce($_POST['bi_dt_nonce'], 'bi_design_template_save')) {
            return;
        }
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
        if (!current_user_can('edit_post', $post_id)) return;

        if (isset($_POST['_bi_dt_category'])) {
            update_post_meta($post_id, '_bi_dt_category',
                sanitize_text_field(wp_unslash($_POST['_bi_dt_category'])));
        }

        if (isset($_POST['_bi_dt_tags'])) {
            update_post_meta($post_id, '_bi_dt_tags',
                sanitize_text_field(wp_unslash($_POST['_bi_dt_tags'])));
        }

        if (isset($_POST['_bi_dt_elements'])) {
            $raw = wp_unslash($_POST['_bi_dt_elements']);
            // Validate it's parseable JSON before saving
            $decoded = json_decode($raw, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                update_post_meta($post_id, '_bi_dt_elements', wp_json_encode($decoded));
            } else {
                // Store raw anyway so admin doesn't lose their work — frontend will skip invalid entries
                update_post_meta($post_id, '_bi_dt_elements', sanitize_textarea_field($raw));
            }
        }
    }

    /**
     * REST endpoint: GET /wp-json/buttoninks/v1/design-templates
     * Returns all published design templates with thumbnail URL, category, tags, and elements.
     */
    private function get_design_templates_endpoint($request) {
        $category = sanitize_text_field($request->get_param('category') ?? 'all');

        $args = [
            'post_type'      => 'bi_design_template',
            'post_status'    => 'publish',
            'posts_per_page' => 100,
            'orderby'        => 'menu_order date',
            'order'          => 'ASC',
        ];

        if ($category !== 'all') {
            $args['meta_query'] = [[
                'key'     => '_bi_dt_category',
                'value'   => $category,
                'compare' => '=',
            ]];
        }

        $posts     = get_posts($args);
        $templates = [];

        foreach ($posts as $post) {
            $elements_raw = get_post_meta($post->ID, '_bi_dt_elements', true);
            $elements     = [];
            if ($elements_raw) {
                $decoded = json_decode($elements_raw, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $elements = $decoded;
                }
            }

            // Only include templates with valid elements
            if (empty($elements)) continue;

            $tags_raw   = get_post_meta($post->ID, '_bi_dt_tags', true) ?: '';
            $tags       = array_filter(array_map('trim', explode(',', $tags_raw)));

            $thumbnail  = '';
            if (has_post_thumbnail($post->ID)) {
                $thumbnail = get_the_post_thumbnail_url($post->ID, 'medium') ?: '';
            }

            $templates[] = [
                'id'        => 'wp-' . $post->ID,
                'name'      => get_the_title($post),
                'category'  => get_post_meta($post->ID, '_bi_dt_category', true) ?: 'other',
                'thumbnail' => $thumbnail,
                'tags'      => array_values($tags),
                'elements'  => $elements,
            ];
        }

        return new WP_REST_Response([
            'templates' => $templates,
            'total'     => count($templates),
        ], 200);
    }

    // =========================================================================
    // 5. REST ENDPOINTS (Registration + Wishlist + Design Templates)
    // =========================================================================

    public function register_endpoints() {

        register_rest_route('buttoninks/v1', '/register', [
            'methods'             => 'POST',
            'callback'            => [$this, 'register_user'],
            'permission_callback' => '__return_true',
        ]);

        // Design Templates — public read endpoint
        register_rest_route('buttoninks/v1', '/design-templates', [
            'methods'             => 'GET',
            'callback'            => [$this, 'get_design_templates_endpoint'],
            'permission_callback' => '__return_true',
            'args'                => [
                'category' => [
                    'default'           => 'all',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
            ],
        ]);

        register_rest_route('buttoninks/v1', '/wishlist', [
            'methods'             => 'GET',
            'callback'            => [$this, 'get_wishlist'],
            'permission_callback' => [$this, 'is_user_logged_in'],
        ]);

        register_rest_route('buttoninks/v1', '/wishlist/add', [
            'methods'             => 'POST',
            'callback'            => [$this, 'add_to_wishlist'],
            'permission_callback' => [$this, 'is_user_logged_in'],
        ]);

        register_rest_route('buttoninks/v1', '/wishlist/remove', [
            'methods'             => 'POST',
            'callback'            => [$this, 'remove_from_wishlist'],
            'permission_callback' => [$this, 'is_user_logged_in'],
        ]);

        // ── Saved Designs ──────────────────────────────────────────────────
        // GET  /buttoninks/v1/designs          — list saved designs for current user
        // POST /buttoninks/v1/designs          — create a new saved design
        // GET  /buttoninks/v1/designs/{id}     — fetch one design
        // PUT  /buttoninks/v1/designs/{id}     — update (overwrite) a design
        // DELETE /buttoninks/v1/designs/{id}   — delete a design

        register_rest_route('buttoninks/v1', '/designs', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'list_saved_designs'],
                'permission_callback' => [$this, 'is_user_logged_in'],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'create_saved_design'],
                'permission_callback' => [$this, 'is_user_logged_in'],
                'args'                => [
                    'name'       => [ 'required' => false, 'sanitize_callback' => 'sanitize_text_field' ],
                    'product_id' => [ 'required' => false, 'sanitize_callback' => 'absint' ],
                    'elements'   => [ 'required' => true ],
                ],
            ],
        ]);

        register_rest_route('buttoninks/v1', '/designs/(?P<id>\d+)', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_saved_design'],
                'permission_callback' => [$this, 'is_user_logged_in'],
                'args'                => [ 'id' => [ 'validate_callback' => 'is_numeric' ] ],
            ],
            [
                'methods'             => 'PUT',
                'callback'            => [$this, 'update_saved_design'],
                'permission_callback' => [$this, 'is_user_logged_in'],
                'args'                => [ 'id' => [ 'validate_callback' => 'is_numeric' ] ],
            ],
            [
                'methods'             => 'DELETE',
                'callback'            => [$this, 'delete_saved_design'],
                'permission_callback' => [$this, 'is_user_logged_in'],
                'args'                => [ 'id' => [ 'validate_callback' => 'is_numeric' ] ],
            ],
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

        if (empty($email) || empty($password) || empty($username))
            return new WP_Error('missing_fields', 'Required fields are missing', ['status' => 400]);
        if (email_exists($email))
            return new WP_Error('email_exists', 'Email already registered', ['status' => 400]);
        if (username_exists($username))
            return new WP_Error('user_exists', 'Username already taken', ['status' => 400]);

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

    // =========================================================================
    // SAVED DESIGNS — stored as a custom post type per user
    // Each design is a 'bi_saved_design' post with the user as author.
    // =========================================================================

    private function ensure_saved_design_cpt() {
        if ( post_type_exists('bi_saved_design') ) return;
        register_post_type('bi_saved_design', [
            'public'       => false,
            'show_ui'      => false,
            'show_in_rest' => false,
            'supports'     => ['title', 'author'],
            'labels'       => [ 'name' => 'Saved Designs' ],
        ]);
    }

    /** GET /buttoninks/v1/designs — list all saved designs for the current user */
    public function list_saved_designs($request) {
        $this->ensure_saved_design_cpt();
        $user_id = get_current_user_id();

        $posts = get_posts([
            'post_type'      => 'bi_saved_design',
            'author'         => $user_id,
            'posts_per_page' => 50,
            'post_status'    => 'publish',
            'orderby'        => 'modified',
            'order'          => 'DESC',
        ]);

        $designs = array_map(function($post) {
            return [
                'id'         => $post->ID,
                'name'       => $post->post_title,
                'product_id' => (int) get_post_meta($post->ID, '_bi_product_id', true),
                'elements'   => json_decode(get_post_meta($post->ID, '_bi_elements', true) ?: '[]', true),
                'updated_at' => $post->post_modified,
            ];
        }, $posts);

        return rest_ensure_response($designs);
    }

    /** POST /buttoninks/v1/designs — create a new saved design */
    public function create_saved_design($request) {
        $this->ensure_saved_design_cpt();
        $user_id = get_current_user_id();
        $params  = $request->get_json_params();

        $name       = sanitize_text_field($params['name'] ?? 'My Design');
        $product_id = absint($params['product_id'] ?? 0);
        $elements   = $params['elements'] ?? [];

        if ( empty($elements) || !is_array($elements) ) {
            return new WP_Error('missing_elements', 'elements array is required', ['status' => 400]);
        }

        $post_id = wp_insert_post([
            'post_type'   => 'bi_saved_design',
            'post_title'  => $name,
            'post_status' => 'publish',
            'post_author' => $user_id,
        ]);

        if ( is_wp_error($post_id) ) return $post_id;

        update_post_meta($post_id, '_bi_product_id', $product_id);
        update_post_meta($post_id, '_bi_elements',   wp_json_encode($elements));

        return rest_ensure_response([
            'success'    => true,
            'id'         => $post_id,
            'name'       => $name,
            'product_id' => $product_id,
            'elements'   => $elements,
            'updated_at' => current_time('mysql'),
        ]);
    }

    /** GET /buttoninks/v1/designs/{id} — fetch one design (must belong to current user) */
    public function get_saved_design($request) {
        $this->ensure_saved_design_cpt();
        $post = get_post( (int) $request['id'] );

        if ( !$post || $post->post_type !== 'bi_saved_design' ) {
            return new WP_Error('not_found', 'Design not found', ['status' => 404]);
        }
        if ( (int) $post->post_author !== get_current_user_id() ) {
            return new WP_Error('forbidden', 'Access denied', ['status' => 403]);
        }

        return rest_ensure_response([
            'id'         => $post->ID,
            'name'       => $post->post_title,
            'product_id' => (int) get_post_meta($post->ID, '_bi_product_id', true),
            'elements'   => json_decode(get_post_meta($post->ID, '_bi_elements', true) ?: '[]', true),
            'updated_at' => $post->post_modified,
        ]);
    }

    /** PUT /buttoninks/v1/designs/{id} — overwrite an existing design */
    public function update_saved_design($request) {
        $this->ensure_saved_design_cpt();
        $user_id = get_current_user_id();
        $post    = get_post( (int) $request['id'] );

        if ( !$post || $post->post_type !== 'bi_saved_design' ) {
            return new WP_Error('not_found', 'Design not found', ['status' => 404]);
        }
        if ( (int) $post->post_author !== $user_id ) {
            return new WP_Error('forbidden', 'Access denied', ['status' => 403]);
        }

        $params     = $request->get_json_params();
        $name       = isset($params['name'])       ? sanitize_text_field($params['name']) : $post->post_title;
        $product_id = isset($params['product_id']) ? absint($params['product_id'])        : (int) get_post_meta($post->ID, '_bi_product_id', true);
        $elements   = $params['elements'] ?? null;

        wp_update_post(['ID' => $post->ID, 'post_title' => $name]);
        update_post_meta($post->ID, '_bi_product_id', $product_id);

        if ( $elements !== null && is_array($elements) ) {
            update_post_meta($post->ID, '_bi_elements', wp_json_encode($elements));
        }

        return rest_ensure_response([
            'success'    => true,
            'id'         => $post->ID,
            'name'       => $name,
            'product_id' => $product_id,
            'updated_at' => current_time('mysql'),
        ]);
    }

    /** DELETE /buttoninks/v1/designs/{id} — permanently delete a design */
    public function delete_saved_design($request) {
        $this->ensure_saved_design_cpt();
        $post = get_post( (int) $request['id'] );

        if ( !$post || $post->post_type !== 'bi_saved_design' ) {
            return new WP_Error('not_found', 'Design not found', ['status' => 404]);
        }
        if ( (int) $post->post_author !== get_current_user_id() ) {
            return new WP_Error('forbidden', 'Access denied', ['status' => 403]);
        }

        wp_delete_post($post->ID, true);
        return rest_ensure_response(['success' => true]);
    }
}

new ButtonInks_Core();
