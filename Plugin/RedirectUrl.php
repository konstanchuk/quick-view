<?php

/**
 * Quick View Extension for Magento 2
 *
 * @author     Volodymyr Konstanchuk http://konstanchuk.com
 * @copyright  Copyright (c) 2017 The authors
 * @license    http://www.opensource.org/licenses/mit-license.html  MIT License
 */

namespace Konstanchuk\QuickView\Plugin;

use Konstanchuk\QuickView\Helper\Data as Helper;


class RedirectUrl
{
    /** @var  Helper */
    protected $_helper;

    public function __construct(Helper $helper)
    {
        $this->_helper = $helper;
    }

    public function afterGetRedirectUrl($subject, $result)
    {
        if ($this->_helper->isEnabled()) {
            return $this->_helper->removeQuickViewFromUrl($result);
        } else {
            return $result;
        }
    }
}