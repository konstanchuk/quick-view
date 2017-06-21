<?php

/**
 * Quick View Extension for Magento 2
 *
 * @author     Volodymyr Konstanchuk http://konstanchuk.com
 * @copyright  Copyright (c) 2017 The authors
 * @license    http://www.opensource.org/licenses/mit-license.html  MIT License
 */

namespace Konstanchuk\QuickView\Plugin;

use Magento\Framework\App\ResponseInterface;
use Magento\Framework\View\Result\Page as ResultPage;
use Magento\Framework\Controller\Result\RawFactory as ResultRawFactory;
use Konstanchuk\QuickView\Helper\Data as Helper;


class ProductView
{
    /** @var  ResponseInterface */
    protected $_response;

    /** @var  Helper */
    protected $_helper;

    /** @var ResultRawFactory */
    protected $_resultRawFactory;

    public function __construct(
        ResponseInterface $response,
        Helper $helper,
        ResultRawFactory $resultRawFactory
    )
    {
        $this->_response = $response;
        $this->_helper = $helper;
        $this->_resultRawFactory = $resultRawFactory;
    }

    public function afterExecute($subject, $result)
    {
        if ($result instanceof ResultPage
            && $this->_response->getStatusCode() == 200
            && $this->_helper->isEnabled()
            && $this->_helper->quickViewPopupIsActive()
        ) {
            $layout = $result->getLayout();
            $html = '';
            $blocks = ['product.info.main', 'product.info.media', 'product.info.details'];
            //$blocks = $layout->getChildNames('content');
            foreach ($blocks as $child) {
                $html .= $layout->renderElement($child);
            }
            $resultRaw = $this->_resultRawFactory->create();
            $resultRaw->setContents($html);
            return $resultRaw;
        }
        return $result;
    }
}