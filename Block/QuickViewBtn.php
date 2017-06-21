<?php

/**
 * Quick View Extension for Magento 2
 *
 * @author     Volodymyr Konstanchuk http://konstanchuk.com
 * @copyright  Copyright (c) 2017 The authors
 * @license    http://www.opensource.org/licenses/mit-license.html  MIT License
 */

namespace Konstanchuk\QuickView\Block;

use Magento\Framework\View\Element\Template;
use Magento\Catalog\Model\Product;
use Konstanchuk\QuickView\Helper\Data as Helper;


class QuickViewBtn extends Template
{
    /** @var Helper */
    protected $_helper;

    /** @var Product */
    protected $_product = null;

    public function __construct(
        Template\Context $context,
        Helper $helper,
        array $data = []
    )
    {
        parent::__construct($context, $data);
        $this->_helper = $helper;
    }

    public function setProduct(Product $product)
    {
        $this->_product = $product;
        return $this;
    }

    public function getProduct()
    {
        return $this->_product;
    }

    public function toHtml()
    {
        if ($this->_helper->isEnabledForCurrentCategory()) {
            return parent::toHtml();
        }
        return '';
    }
}