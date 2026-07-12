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
        add_action('admin_menu',                 [$this, 'register_admin_pages']);
        add_action('admin_enqueue_scripts',      [$this, 'enqueue_admin_media']);
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

            // Production options (formerly "Delivery speed")
            '_bi_enable_regular'     => 'string',
            '_bi_enable_urgent'      => 'string',
            '_bi_urgent_extra_cost'  => 'string',
            '_bi_regular_days'       => 'string',
            '_bi_urgent_days'        => 'string',

            // Print Style / Decoration method
            '_bi_print_style'        => 'string',

            // Product type specifics
            '_bi_product_type'       => 'string',  // 'clothing' | 'paper' | 'stationery' | ''

            // Clothing / Apparel
            '_bi_clothing_specs'     => 'string',  // JSON

            // Paper Printing
            '_bi_paper_specs'        => 'string',  // JSON

            // Stationery / Banners
            '_bi_stationery_specs'   => 'string',  // JSON

            // Bulk pricing
            '_bi_enable_bulk'        => 'string',
            '_bi_bulk_base_price'    => 'string',
            '_bi_bulk_tiers'         => 'string',  // JSON string

            // Artwork notes
            '_bi_print_notes'        => 'string',

            // Downloadable templates — JSON string
            '_bi_download_templates' => 'string',

            // Design / personalisation fee (flat, per unit)
            '_bi_design_fee'         => 'string',
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

        // Print style & product type specifics
        $print_style          = get_post_meta($post->ID, '_bi_print_style',       true) ?: '';
        $product_type         = get_post_meta($post->ID, '_bi_product_type',      true) ?: '';

        $clothing_specs_raw   = get_post_meta($post->ID, '_bi_clothing_specs',    true) ?: '{}';
        $clothing_specs       = json_decode($clothing_specs_raw, true) ?: [];

        $paper_specs_raw      = get_post_meta($post->ID, '_bi_paper_specs',       true) ?: '{}';
        $paper_specs          = json_decode($paper_specs_raw, true) ?: [];

        $stationery_specs_raw = get_post_meta($post->ID, '_bi_stationery_specs',  true) ?: '{}';
        $stationery_specs     = json_decode($stationery_specs_raw, true) ?: [];
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


            <!-- SECTION: Print Style / Decoration Method -->
            <div class="bi-section">
                <span class="bi-label">Print Style / Decoration Method</span>
                <p class="bi-note" style="margin-bottom:10px;">Select how this product is decorated or printed.</p>
                <select name="_bi_print_style" style="min-width:260px;font-size:13px;">
                    <option value="">-- Select print style --</option>
                    <?php
                    $print_styles = [
                        'embroidery'      => 'Embroidery',
                        'heat_transfer'   => 'Heat Transfer',
                        'dtg'             => 'Direct-to-Garment (DTG)',
                        'screen_printing' => 'Screen Printing',
                        'pad_printing'    => 'Pad Printing',
                        'digital_inkjet'  => 'Digital Inkjet',
                        'laser_engraving' => 'Laser Engraving',
                        'digital_print'   => 'Digital Print',
                        'offset_print'    => 'Offset Printing',
                        'uv_print'        => 'UV Printing',
                    ];
                    foreach ($print_styles as $val => $lbl): ?>
                        <option value="<?php echo esc_attr($val); ?>" <?php selected($print_style, $val); ?>><?php echo esc_html($lbl); ?></option>
                    <?php endforeach; ?>
                </select>
            </div>

            <!-- SECTION: Product Type Specifics -->
            <div class="bi-section">
                <span class="bi-label">Product Type Specifics</span>
                <p class="bi-note" style="margin-bottom:10px;">Select the product type to reveal its specific options.</p>
                <div class="bi-row" style="margin-bottom:14px;">
                    <label style="min-width:100px;">Product Type</label>
                    <select name="_bi_product_type" id="bi_product_type" style="font-size:13px;" onchange="biShowProductType(this.value)">
                        <option value="">-- Select type --</option>
                        <option value="clothing"   <?php selected($product_type,'clothing'); ?>>Clothing / Apparel</option>
                        <option value="paper"      <?php selected($product_type,'paper'); ?>>Paper Printing</option>
                        <option value="stationery" <?php selected($product_type,'stationery'); ?>>Stationery / Banners / Pens</option>
                    </select>
                </div>

                <!-- Clothing / Apparel -->
                <div id="bi_type_clothing" class="bi-indent <?php echo ($product_type==='clothing')?'':'bi-hidden'; ?>">
                    <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#1d2327;margin:0 0 10px;">Clothing / Apparel Options</p>
                    <?php
                    $fabric_types=array('100% Cotton','Cotton/Poly Blend','Performance Poly','Tri-Blend','Fleece','Dri-FIT / Moisture Wicking');
                    $garment_fits=array('Regular Fit','Slim Fit','Relaxed Fit','Oversized','Ladies Fit','Youth');
                    ?>
                    <div class="bi-row">
                        <label style="min-width:110px;">Fabric Type</label>
                        <select name="_bi_clothing_fabric" style="font-size:12px;min-width:200px;">
                            <option value="">-- Select fabric --</option>
                            <?php foreach($fabric_types as $f): ?><option value="<?php echo esc_attr($f); ?>" <?php selected($clothing_specs['fabric']??'',$f); ?>><?php echo esc_html($f); ?></option><?php endforeach; ?>
                        </select>
                    </div>
                    <div class="bi-row">
                        <label style="min-width:110px;">Garment Fit</label>
                        <select name="_bi_clothing_fit" style="font-size:12px;min-width:200px;">
                            <option value="">-- Select fit --</option>
                            <?php foreach($garment_fits as $f): ?><option value="<?php echo esc_attr($f); ?>" <?php selected($clothing_specs['fit']??'',$f); ?>><?php echo esc_html($f); ?></option><?php endforeach; ?>
                        </select>
                    </div>
                    <div class="bi-row">
                        <label style="min-width:110px;">Gender</label>
                        <select name="_bi_clothing_gender" style="font-size:12px;min-width:160px;">
                            <option value="">-- Select --</option>
                            <?php foreach(array('Unisex',"Men's","Women's",'Youth','Kids') as $g): ?><option value="<?php echo esc_attr($g); ?>" <?php selected($clothing_specs['gender']??'',$g); ?>><?php echo esc_html($g); ?></option><?php endforeach; ?>
                        </select>
                    </div>
                    <p class="bi-note">Sizes (S, M, L, XL...) are set via the WooCommerce Attributes tab.</p>
                </div>

                <!-- Paper Printing -->
                <div id="bi_type_paper" class="bi-indent <?php echo ($product_type==='paper')?'':'bi-hidden'; ?>">
                    <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#1d2327;margin:0 0 10px;">Paper Printing Options</p>
                    <?php
                    $paper_stocks=array('Standard (100gsm)','Premium (170gsm)','Glossy','Matte','Silk','Uncoated','Kraft');
                    $paper_corners=array('Square','Rounded');
                    $orientations=array('Vertical (Portrait)','Horizontal (Landscape)','Both');
                    $thicknesses=array('Standard','Premium / Thick');
                    ?>
                    <div class="bi-row"><label style="min-width:120px;">Paper Stock</label><select name="_bi_paper_stock" style="font-size:12px;min-width:200px;"><option value="">-- Select --</option><?php foreach($paper_stocks as $s): ?><option value="<?php echo esc_attr($s); ?>" <?php selected($paper_specs['stock']??'',$s); ?>><?php echo esc_html($s); ?></option><?php endforeach; ?></select></div>
                    <div class="bi-row"><label style="min-width:120px;">Corner Style</label><select name="_bi_paper_corners" style="font-size:12px;min-width:160px;"><option value="">-- Select --</option><?php foreach($paper_corners as $c): ?><option value="<?php echo esc_attr($c); ?>" <?php selected($paper_specs['corners']??'',$c); ?>><?php echo esc_html($c); ?></option><?php endforeach; ?></select></div>
                    <div class="bi-row"><label style="min-width:120px;">Orientation</label><select name="_bi_paper_orientation" style="font-size:12px;min-width:200px;"><option value="">-- Select --</option><?php foreach($orientations as $o): ?><option value="<?php echo esc_attr($o); ?>" <?php selected($paper_specs['orientation']??'',$o); ?>><?php echo esc_html($o); ?></option><?php endforeach; ?></select></div>
                    <div class="bi-row"><label style="min-width:120px;">Paper Thickness</label><select name="_bi_paper_thickness" style="font-size:12px;min-width:200px;"><option value="">-- Select --</option><?php foreach($thicknesses as $t): ?><option value="<?php echo esc_attr($t); ?>" <?php selected($paper_specs['thickness']??'',$t); ?>><?php echo esc_html($t); ?></option><?php endforeach; ?></select></div>
                    <div class="bi-row"><label style="min-width:120px;">Perforated</label><select name="_bi_paper_perforated" style="font-size:12px;min-width:120px;"><option value="">-- Select --</option><option value="no" <?php selected($paper_specs['perforated']??'','no'); ?>>No</option><option value="yes" <?php selected($paper_specs['perforated']??'','yes'); ?>>Yes</option></select></div>
                </div>

                <!-- Stationery / Banners / Pens -->
                <div id="bi_type_stationery" class="bi-indent <?php echo ($product_type==='stationery')?'':'bi-hidden'; ?>">
                    <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#1d2327;margin:0 0 10px;">Stationery / Banner / Pen Options</p>
                    <?php
                    $pen_materials=array('ABS Plastic','Aluminium','Brass','Metal','Stainless Steel');
                    $banner_materials=array('Vinyl','Polyester Fabric','PVC-Free Vinyl');
                    $subtypes=array('pen'=>'Pen / Pencil','banner'=>'Banner','notebook'=>'Notebook','folder'=>'Folder','other'=>'Other');
                    $cur_subtype=$stationery_specs['subtype']??'';
                    ?>
                    <div class="bi-row">
                        <label style="min-width:120px;">Item Subtype</label>
                        <select name="_bi_stationery_subtype" id="bi_stn_subtype" style="font-size:12px;min-width:180px;" onchange="biToggleStationeryMaterial(this.value)">
                            <option value="">-- Select --</option>
                            <?php foreach($subtypes as $val=>$lbl): ?><option value="<?php echo esc_attr($val); ?>" <?php selected($cur_subtype,$val); ?>><?php echo esc_html($lbl); ?></option><?php endforeach; ?>
                        </select>
                    </div>
                    <div id="bi_stn_pen_mat" class="<?php echo ($cur_subtype==='pen'||$cur_subtype==='')?'':'bi-hidden'; ?>" style="margin-top:8px;">
                        <div class="bi-row"><label style="min-width:120px;">Pen Material</label><select name="_bi_stationery_pen_material" style="font-size:12px;min-width:200px;"><option value="">-- Select --</option><?php foreach($pen_materials as $m): ?><option value="<?php echo esc_attr($m); ?>" <?php selected($stationery_specs['pen_material']??'',$m); ?>><?php echo esc_html($m); ?></option><?php endforeach; ?></select></div>
                    </div>
                    <div id="bi_stn_ban_mat" class="<?php echo ($cur_subtype==='banner')?'':'bi-hidden'; ?>" style="margin-top:8px;">
                        <div class="bi-row"><label style="min-width:120px;">Banner Material</label><select name="_bi_stationery_banner_material" style="font-size:12px;min-width:200px;"><option value="">-- Select --</option><?php foreach($banner_materials as $m): ?><option value="<?php echo esc_attr($m); ?>" <?php selected($stationery_specs['banner_material']??'',$m); ?>><?php echo esc_html($m); ?></option><?php endforeach; ?></select></div>
                    </div>
                </div>
            </div>
            <!-- SECTION: Production Options (renamed from Delivery Speed) -->
            <div class="bi-section">
                <span class="bi-label">Production Options</span>
                <p class="bi-note">Select the production turnaround times available for this product. This is about production speed — not shipping.</p>

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
                        <label>Production days</label>
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
                        <label>Production days</label>
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

            <!-- SECTION: Design / Personalisation Fee -->
            <div class="bi-section">
                <span class="bi-label">Design &amp; Personalisation Fee</span>
                <div class="bi-row">
                    <label>Fee per unit ($)</label>
                    <input type="number" name="_bi_design_fee"
                           value="<?php echo esc_attr(get_post_meta($post->ID, '_bi_design_fee', true) ?: '0'); ?>"
                           placeholder="0.00" min="0" step="0.01" style="width:100px;" />
                </div>
                <p class="bi-note">Added to the base product price on the design review page. Set to 0 for no extra charge.</p>
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

        // Show/hide product type panels
        function biShowProductType(val) {
            ['clothing','paper','stationery'].forEach(function(t) {
                var el = document.getElementById('bi_type_' + t);
                if (el) el.classList.toggle('bi-hidden', val !== t);
            });
        }

        // Toggle stationery material sub-panels
        function biToggleStationeryMaterial(val) {
            var pen = document.getElementById('bi_stn_pen_mat');
            var ban = document.getElementById('bi_stn_ban_mat');
            if (pen) pen.classList.toggle('bi-hidden', val !== 'pen' && val !== '');
            if (ban) ban.classList.toggle('bi-hidden', val !== 'banner');
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

        // Print style
        if (isset($_POST['_bi_print_style'])) {
            update_post_meta($post_id, '_bi_print_style', sanitize_text_field(wp_unslash($_POST['_bi_print_style'])));
        }

        // Product type
        if (isset($_POST['_bi_product_type'])) {
            update_post_meta($post_id, '_bi_product_type', sanitize_text_field(wp_unslash($_POST['_bi_product_type'])));
        }

        // Clothing specs
        $clothing_specs_save = [
            'fabric' => sanitize_text_field(wp_unslash($_POST['_bi_clothing_fabric'] ?? '')),
            'fit'    => sanitize_text_field(wp_unslash($_POST['_bi_clothing_fit']    ?? '')),
            'gender' => sanitize_text_field(wp_unslash($_POST['_bi_clothing_gender'] ?? '')),
        ];
        update_post_meta($post_id, '_bi_clothing_specs', wp_json_encode($clothing_specs_save));

        // Paper specs
        $paper_specs_save = [
            'stock'       => sanitize_text_field(wp_unslash($_POST['_bi_paper_stock']       ?? '')),
            'corners'     => sanitize_text_field(wp_unslash($_POST['_bi_paper_corners']     ?? '')),
            'orientation' => sanitize_text_field(wp_unslash($_POST['_bi_paper_orientation'] ?? '')),
            'thickness'   => sanitize_text_field(wp_unslash($_POST['_bi_paper_thickness']   ?? '')),
            'perforated'  => sanitize_text_field(wp_unslash($_POST['_bi_paper_perforated']  ?? '')),
        ];
        update_post_meta($post_id, '_bi_paper_specs', wp_json_encode($paper_specs_save));

        // Stationery specs
        $stationery_specs_save = [
            'subtype'         => sanitize_text_field(wp_unslash($_POST['_bi_stationery_subtype']          ?? '')),
            'pen_material'    => sanitize_text_field(wp_unslash($_POST['_bi_stationery_pen_material']     ?? '')),
            'banner_material' => sanitize_text_field(wp_unslash($_POST['_bi_stationery_banner_material']  ?? '')),
        ];
        update_post_meta($post_id, '_bi_stationery_specs', wp_json_encode($stationery_specs_save));

        // Artwork notes
        if (isset($_POST['_bi_print_notes'])) {
            update_post_meta($post_id, '_bi_print_notes',
                sanitize_textarea_field(wp_unslash($_POST['_bi_print_notes'])));
        }

        // Design fee
        if (isset($_POST['_bi_design_fee'])) {
            update_post_meta($post_id, '_bi_design_fee',
                sanitize_text_field(wp_unslash($_POST['_bi_design_fee'])));
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

        // Print style & clothing/paper/stationery specs
        $print_style        = get_post_meta($id, '_bi_print_style',   true) ?: '';
        $product_type       = get_post_meta($id, '_bi_product_type',  true) ?: '';

        $clothing_specs_raw = get_post_meta($id, '_bi_clothing_specs', true) ?: '{}';
        $clothing_specs     = json_decode($clothing_specs_raw, true) ?: [];

        $paper_specs_raw    = get_post_meta($id, '_bi_paper_specs', true) ?: '{}';
        $paper_specs        = json_decode($paper_specs_raw, true) ?: [];

        $stationery_raw     = get_post_meta($id, '_bi_stationery_specs', true) ?: '{}';
        $stationery_specs   = json_decode($stationery_raw, true) ?: [];

        $response->data['acf'] = [
            'enable_designer'      => get_post_meta($id, '_bi_enable_designer', true) === '1',
            'enable_upload'        => get_post_meta($id, '_bi_enable_upload',   true) === '1',
            'buy_as_is'            => get_post_meta($id, '_bi_buy_as_is',       true) === '1',
            'available_colors'     => [],  // Deprecated — use WC Color attribute
            'print_style'          => $print_style,
            'product_type'         => $product_type,
            'clothing_specs'       => [
                'fabric' => $clothing_specs['fabric'] ?? '',
                'fit'    => $clothing_specs['fit']    ?? '',
                'gender' => $clothing_specs['gender'] ?? '',
            ],
            'paper_specs'          => $paper_specs,
            'stationery_specs'     => $stationery_specs,
            'production_options'   => $production_options,
            'bulk_pricing'         => $bulk_pricing,
            'print_notes'          => get_post_meta($id, '_bi_print_notes', true) ?: '',
            'download_templates'   => $dl_templates,
            'design_fee'           => (float) (get_post_meta($id, '_bi_design_fee', true) ?: '0'),
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
            'show_in_menu'        => 'buttoninks-settings',
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

        // ── Contact / Enquiry email ───────────────────────────────────────────
        register_rest_route('buttoninks/v1', '/contact', [
            'methods'             => 'POST',
            'callback'            => [$this, 'handle_contact_form'],
            'permission_callback' => '__return_true',
        ]);

        // ── Promotional Banners ───────────────────────────────────────────────
        register_rest_route('buttoninks/v1', '/promo-banners', [
            'methods'             => 'GET',
            'callback'            => [$this, 'get_promo_banners'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route('buttoninks/v1', '/promo-banners', [
            'methods'             => 'POST',
            'callback'            => [$this, 'save_promo_banners'],
            'permission_callback' => function() { return current_user_can('manage_options'); },
        ]);

        register_rest_route('buttoninks/v1', '/announcement', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_announcement'],
                'permission_callback' => '__return_true',
            ],
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'save_announcement'],
                'permission_callback' => function() { return current_user_can('manage_options'); },
            ],
        ]);
    }

    // ── Announcement Bar ─────────────────────────────────────────────────────

    public function get_announcement(): WP_REST_Response {
        $stored = get_option('bi_announcement_text', '');
        if ( ! $stored ) {
            $stored = 'Free shipping on orders over $75 · Use code PRINT15 for 15% off your first order';
        }
        return rest_ensure_response( ['text' => $stored] );
    }

    public function save_announcement( WP_REST_Request $request ): WP_REST_Response {
        $params = $request->get_json_params();
        $text   = sanitize_text_field($params['text'] ?? '');
        update_option('bi_announcement_text', $text);
        return rest_ensure_response(['success' => true, 'text' => $text]);
    }

    // ── Promotional Banners ───────────────────────────────────────────────────

    private function get_default_banners(): array {
        return [
            [
                'id'    => 1,
                'url'   => 'https://central.buttoninks.com/wp-content/uploads/2026/07/Apparel.png',
                'link'  => '/categories?category=apparel',
                'alt'   => 'Apparel Collection',
            ],
            [
                'id'    => 2,
                'url'   => 'https://central.buttoninks.com/wp-content/uploads/2026/07/Vehicle.png',
                'link'  => '/categories?category=vehicle-branding',
                'alt'   => 'Vehicle Branding',
            ],
        ];
    }

    public function get_promo_banners(): WP_REST_Response {
        $stored = get_option('bi_promo_banners', '');
        if ( $stored ) {
            $decoded = json_decode( $stored, true );
            if ( is_array($decoded) && count($decoded) > 0 ) {
                return rest_ensure_response( $decoded );
            }
        }
        return rest_ensure_response( $this->get_default_banners() );
    }

    public function save_promo_banners( WP_REST_Request $request ): WP_REST_Response {
        $banners = $request->get_json_params();
        if ( ! is_array($banners) ) {
            return new WP_Error('invalid_data', 'Banners must be an array.', ['status' => 400]);
        }
        $sanitized = array_map(function($b) {
            return [
                'id'   => absint($b['id'] ?? 0),
                'url'  => esc_url_raw($b['url'] ?? ''),
                'link' => sanitize_text_field($b['link'] ?? '/'),
                'alt'  => sanitize_text_field($b['alt'] ?? ''),
            ];
        }, $banners);
        update_option('bi_promo_banners', wp_json_encode($sanitized));
        return rest_ensure_response(['success' => true, 'banners' => $sanitized]);
    }

    public function handle_contact_form( WP_REST_Request $request ) {
        $params = $request->get_json_params();

        $type    = sanitize_text_field( $params['type']    ?? '' ); // 'corporate' | 'design'
        $name    = sanitize_text_field( $params['name']    ?? '' );
        $email   = sanitize_email(      $params['email']   ?? '' );
        $phone   = sanitize_text_field( $params['phone']   ?? '' );
        $company = sanitize_text_field( $params['company'] ?? '' );
        $message = sanitize_textarea_field( $params['message'] ?? '' );

        if ( empty($name) || empty($email) || empty($message) ) {
            return new WP_Error( 'missing_fields', 'Name, email, and message are required.', ['status' => 400] );
        }
        if ( ! is_email( $email ) ) {
            return new WP_Error( 'invalid_email', 'Please provide a valid email address.', ['status' => 400] );
        }

        $to      = 'sales@buttoninks.com';
        $subject = $type === 'design'
            ? "[Design Request] New enquiry from {$name}"
            : "[Corporate Sales] New enquiry from {$name}";

        $body  = "Type: " . ( $type === 'design' ? 'Graphics Design Request' : 'Corporate Sales' ) . "\n\n";
        $body .= "Name:    {$name}\n";
        $body .= "Email:   {$email}\n";
        if ( $phone )   $body .= "Phone:   {$phone}\n";
        if ( $company ) $body .= "Company: {$company}\n";
        $body .= "\nMessage:\n{$message}\n";

        $headers = [
            'Content-Type: text/plain; charset=UTF-8',
            "Reply-To: {$name} <{$email}>",
        ];

        $sent = wp_mail( $to, $subject, $body, $headers );

        if ( ! $sent ) {
            return new WP_Error( 'mail_failed', 'Failed to send email. Please try again.', ['status' => 500] );
        }

        return rest_ensure_response( ['success' => true, 'message' => 'Your enquiry has been sent. We\'ll be in touch soon!'] );
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

    // =========================================================================
    // ADMIN: Promotional Banners Settings Page
    // =========================================================================

    public function enqueue_admin_media( string $hook ): void {
        // Only load on our settings page
        if ( $hook !== 'toplevel_page_buttoninks-settings' ) return;
        wp_enqueue_media();
    }

    public function register_admin_pages(): void {
        add_menu_page(
            'ButtonInks Settings',
            'ButtonInks',
            'manage_options',
            'buttoninks-settings',
            [$this, 'render_promo_banners_page'],
            'dashicons-art',
            58
        );
        add_submenu_page(
            'buttoninks-settings',
            'Promotional Banners',
            'Promo Banners',
            'manage_options',
            'buttoninks-settings',
            [$this, 'render_promo_banners_page']
        );
        // Note: Design Templates submenu is added automatically via show_in_menu on the CPT
    }

    public function render_promo_banners_page(): void {
        if ( ! current_user_can('manage_options') ) return;

        $saved   = get_option('bi_promo_banners', '');
        $banners = $saved ? json_decode($saved, true) : $this->get_default_banners();
        if ( ! is_array($banners) ) $banners = $this->get_default_banners();

        $msg = '';
        if ( isset($_POST['bi_save_banners']) && check_admin_referer('bi_save_banners_nonce') ) {
            // Save announcement first
            if ( isset($_POST['bi_announcement_text']) ) {
                update_option('bi_announcement_text', sanitize_text_field($_POST['bi_announcement_text']));
            }

            $new_banners = [];
            $urls  = array_map('esc_url_raw',          $_POST['banner_url']   ?? []);
            $links = array_map('sanitize_text_field',  $_POST['banner_link']  ?? []);
            $alts  = array_map('sanitize_text_field',  $_POST['banner_alt']   ?? []);
            foreach ( $urls as $i => $url ) {
                if ( empty($url) ) continue;
                $new_banners[] = [
                    'id'   => $i + 1,
                    'url'  => $url,
                    'link' => $links[$i] ?? '/',
                    'alt'  => $alts[$i]  ?? '',
                ];
            }
            if ( ! empty($new_banners) ) {
                update_option('bi_promo_banners', wp_json_encode($new_banners));
                $banners = $new_banners;
                $msg = '<div class="notice notice-success is-dismissible"><p>Banners saved successfully.</p></div>';
            }
        }
        ?>
        <div class="wrap">
            <h1 style="display:flex;align-items:center;gap:10px;">
                <span class="dashicons dashicons-art" style="font-size:28px;margin-top:2px;"></span>
                ButtonInks — Settings
            </h1>
            <?php echo $msg; ?>

            <form method="post" style="max-width:860px;">
                <?php wp_nonce_field('bi_save_banners_nonce'); ?>

                <!-- SECTION: Announcement Bar -->
                <div style="background:#fff; border:1px solid #ccd0d4; padding:20px; margin-bottom:30px; border-radius:4px;">
                    <h2 style="margin-top:0; border-bottom:1px solid #eee; padding-bottom:10px;">Top Announcement Bar</h2>
                    <p style="color:#666; margin-bottom:15px;">This text is shown at the very top of every page. Keep it short for the best look.</p>
                    <input type="text" name="bi_announcement_text"
                           value="<?php echo esc_attr(get_option('bi_announcement_text', 'Free shipping on orders over $75 · Use code PRINT15 for 15% off your first order')); ?>"
                           style="width:100%; font-size:14px; padding:10px;"
                           placeholder="Enter announcement text..." />
                </div>

                <h2 style="margin-bottom:10px;">Promotional Banners</h2>
                <p style="color:#666;max-width:700px;margin-bottom:20px;">
                    Manage the promotional banners shown in the popup on the storefront homepage.
                    Click <strong>Choose Image</strong> to pick from your Media Library, or paste a URL directly.
                    Click <strong>Remove</strong> to delete a banner row. Leave URL blank to skip that slot.
                </p>
                <table class="widefat fixed" cellspacing="0" id="bi_banners_table">
                    <thead>
                        <tr>
                            <th style="width:36px;">#</th>
                            <th>Image <small>(click Choose to pick from Media Library)</small></th>
                            <th style="width:200px;">Link (relative URL)</th>
                            <th style="width:160px;">Alt Text</th>
                            <th style="width:64px;">Preview</th>
                            <th style="width:72px;">Remove</th>
                        </tr>
                    </thead>
                    <tbody id="bi_banner_rows">
                        <?php
                        while ( count($banners) < 5 ) $banners[] = ['id'=>count($banners)+1,'url'=>'','link'=>'/','alt'=>''];
                        foreach ( $banners as $i => $b ): ?>
                        <tr id="bi_row_<?php echo $i; ?>">
                            <td style="vertical-align:middle;"><?php echo $i + 1; ?></td>
                            <td style="vertical-align:middle;">
                                <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
                                    <input type="text" name="banner_url[]"
                                        id="bi_url_<?php echo $i; ?>"
                                        value="<?php echo esc_attr($b['url']); ?>"
                                        placeholder="https://..."
                                        style="flex:1;min-width:160px;"
                                        oninput="biPreview(this, <?php echo $i; ?>)" />
                                    <button type="button"
                                        class="button"
                                        onclick="biOpenMedia(<?php echo $i; ?>)"
                                        style="white-space:nowrap;">
                                        📁 Choose Image
                                    </button>
                                </div>
                            </td>
                            <td style="vertical-align:middle;">
                                <input type="text" name="banner_link[]"
                                    value="<?php echo esc_attr($b['link']); ?>"
                                    placeholder="/categories"
                                    style="width:100%;" />
                            </td>
                            <td style="vertical-align:middle;">
                                <input type="text" name="banner_alt[]"
                                    value="<?php echo esc_attr($b['alt']); ?>"
                                    placeholder="Description"
                                    style="width:100%;" />
                            </td>
                            <td style="vertical-align:middle;text-align:center;">
                                <img id="bi_preview_<?php echo $i; ?>"
                                    src="<?php echo esc_url($b['url']); ?>"
                                    style="max-width:54px;max-height:38px;object-fit:cover;border-radius:4px;border:1px solid #ddd;<?php echo empty($b['url']) ? 'display:none;' : ''; ?>" />
                            </td>
                            <td style="vertical-align:middle;text-align:center;">
                                <button type="button" class="button button-small" style="color:#a00;"
                                    onclick="biClearRow(<?php echo $i; ?>)">✕ Remove</button>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
                <p style="margin-top:16px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                    <input type="submit" name="bi_save_banners" value="💾 Save Banners" class="button button-primary button-large" />
                    <button type="button" onclick="biAddRow()" class="button button-large" style="background:#2271b1;color:#fff;border-color:#2271b1;">
                        ＋ Add Banner
                    </button>
                    <span style="color:#888;font-size:12px;">Changes go live immediately after saving.</span>
                </p>
            </form>
        </div>

        <script>
        var biRowCount = <?php echo count($banners); ?>;

        // Live preview when URL typed manually
        function biPreview(input, idx) {
            var img = document.getElementById('bi_preview_' + idx);
            if (!img) return;
            if (input.value) { img.src = input.value; img.style.display = 'inline-block'; }
            else { img.src = ''; img.style.display = 'none'; }
        }

        // Remove entire row from DOM
        function biClearRow(idx) {
            var row = document.getElementById('bi_row_' + idx);
            if (row) row.parentNode.removeChild(row);
        }

        // Add a new empty banner row
        function biAddRow() {
            var idx  = biRowCount++;
            var tbody = document.getElementById('bi_banner_rows');
            var tr   = document.createElement('tr');
            tr.id    = 'bi_row_' + idx;
            tr.innerHTML =
                '<td style="vertical-align:middle;">' + (tbody.rows.length + 1) + '</td>' +
                '<td style="vertical-align:middle;">' +
                '  <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">' +
                '    <input type="text" name="banner_url[]" id="bi_url_' + idx + '" value="" placeholder="https://..." style="flex:1;min-width:160px;" oninput="biPreview(this,' + idx + ')" />' +
                '    <button type="button" class="button" onclick="biOpenMedia(' + idx + ')" style="white-space:nowrap;">📁 Choose Image</button>' +
                '  </div>' +
                '</td>' +
                '<td style="vertical-align:middle;"><input type="text" name="banner_link[]" value="/" placeholder="/categories" style="width:100%;" /></td>' +
                '<td style="vertical-align:middle;"><input type="text" name="banner_alt[]" value="" placeholder="Description" style="width:100%;" /></td>' +
                '<td style="vertical-align:middle;text-align:center;"><img id="bi_preview_' + idx + '" src="" style="max-width:54px;max-height:38px;object-fit:cover;border-radius:4px;border:1px solid #ddd;display:none;" /></td>' +
                '<td style="vertical-align:middle;text-align:center;"><button type="button" class="button button-small" style="color:#a00;" onclick="biClearRow(' + idx + ')">✕ Remove</button></td>';
            tbody.appendChild(tr);
        }

        // Open WP Media Library picker
        function biOpenMedia(idx) {
            if (typeof wp === 'undefined' || !wp.media) {
                alert('Media library not available. Please paste the URL manually.');
                return;
            }
            var frame = wp.media({
                title:    'Select Promotional Banner Image',
                button:   { text: 'Use this image' },
                multiple: false,
                library:  { type: 'image' },
            });
            frame.on('select', function() {
                var attachment = frame.state().get('selection').first().toJSON();
                var urlInput   = document.getElementById('bi_url_' + idx);
                if (urlInput) {
                    urlInput.value = attachment.url;
                    biPreview(urlInput, idx);
                }
            });
            frame.open();
        }
        </script>
        <?php
    }
}

new ButtonInks_Core();
