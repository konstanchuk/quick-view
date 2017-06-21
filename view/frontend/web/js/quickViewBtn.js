/**
 * Quick View Extension for Magento 2
 *
 * @author     Volodymyr Konstanchuk http://konstanchuk.com
 * @copyright  Copyright (c) 2017 The authors
 * @license    http://www.opensource.org/licenses/mit-license.html  MIT License
 */
define(
    [
        'jquery',
        'uiRegistry'
    ],
    function ($, register) {
        'use strict';

        return function (config, element) {
            $(element).on('click', function (e) {
                var popup = register.get('quick_view_popup');
                if (popup) {
                    popup.show(this);
                } else {
                    console.log($.mage.__('popup is not already loaded'));
                }
                return false;
            });
        };
    }
);