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
use Magento\Framework\Module\Manager as ModuleManager;
use Konstanchuk\QuickView\Helper\Data as Helper;


class QuickViewPopup extends Template
{
    /** @var ModuleManager */
    protected $_moduleManager;

    /** @var Helper */
    protected $_helper;

    public function __construct(
        Template\Context $context,
        ModuleManager $moduleManager,
        Helper $helper,
        array $data = []
    )
    {
        parent::__construct($context, $data);
        $this->_moduleManager = $moduleManager;
        $this->_helper = $helper;
    }

    public function getPageParams()
    {
        /** @var \Magento\Catalog\Block\Product\ProductList\Toolbar $toolbar */
        $toolbar = $this->getLayout()->getBlock('product_list_toolbar');
        if ($toolbar && $toolbar->getCollection()) {
            return [
                'current_page' => $toolbar->getCurrentPage(),
                'last_page' => $toolbar->getLastPageNum(),
            ];
        } else {
            return [];
        }
    }

    /* please, use Konstanchuk_InfinityScroll */
    public function getInfinityScrollParams()
    {
        $params = [
            'active' => false,
        ];
        try {
            if ($this->_moduleManager->isEnabled('Konstanchuk_InfinityScroll')) {
                $objectManager = \Magento\Framework\App\ObjectManager::getInstance();
                /** @var \Konstanchuk\InfinityScroll\Helper\Data $infinityScrollHelper */
                $infinityScrollHelper = $objectManager->get('Konstanchuk\InfinityScroll\Helper\Data');
                if ($infinityScrollHelper) {
                    $params = [
                        'active' => $infinityScrollHelper->isEnabled(),
                        'loading_type' => $infinityScrollHelper->getLoadingType(),
                    ];
                }
            }
        } catch (\Exception $e) {}
        return $params;
    }

    public function getHelper()
    {
        return $this->_helper;
    }

    public function toHtml()
    {
        if ($this->_helper->isEnabledForCurrentCategory()) {
            return parent::toHtml();
        }
        return '';
    }
}