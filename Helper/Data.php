<?php

/**
 * Quick View Extension for Magento 2
 *
 * @author     Volodymyr Konstanchuk http://konstanchuk.com
 * @copyright  Copyright (c) 2017 The authors
 * @license    http://www.opensource.org/licenses/mit-license.html  MIT License
 */

namespace Konstanchuk\QuickView\Helper;

use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\App\Helper\Context;
use Magento\Framework\Registry;


class Data extends AbstractHelper
{
    const XML_PATH_ACTIVE = 'catalog/konstanchuk_quick_view/active';
    const XML_PATH_PREV_NEXT_ACTIVE = 'catalog/konstanchuk_quick_view/prev_next_active';
    const XML_PATH_INCLUDE_CATEGORIES = 'catalog/konstanchuk_quick_view/include_categories';
    const XML_PATH_EXCLUDE_CATEGORIES = 'catalog/konstanchuk_quick_view/exclude_categories';

    const QUICK_VIEW_PARAM_NAME = 'quick_view';

    /** @var Registry  */
    protected $_registry;

    protected $_isEnabledForCurrentCategory = null;

    public function __construct(Context $context, Registry $registry)
    {
        parent::__construct($context);
        $this->_registry = $registry;
    }

    public function isActivePrevNext()
    {
        return $this->scopeConfig->getValue(static::XML_PATH_PREV_NEXT_ACTIVE);
    }

    public function isEnabled()
    {
        return $this->scopeConfig->getValue(static::XML_PATH_ACTIVE);
    }

    public function getIncludeCategoryIds()
    {
        return array_filter(array_map('intval', explode(',', $this->scopeConfig->getValue(static::XML_PATH_INCLUDE_CATEGORIES))));
    }

    public function getExcludeCategoryIds()
    {
        return array_filter(array_map('intval', explode(',', $this->scopeConfig->getValue(static::XML_PATH_EXCLUDE_CATEGORIES))));
    }

    public function isEnabledForCurrentCategory()
    {
        if (!is_null($this->_isEnabledForCurrentCategory)) {
            return $this->_isEnabledForCurrentCategory;
        }
        $category = $this->_registry->registry('current_category');
        if ($this->isEnabled() && $category && $category->getId()) {
            $includeCategories = $this->getIncludeCategoryIds();
            $excludeCategories = $this->getExcludeCategoryIds();
            if (count($excludeCategories) && in_array($category->getId(), $excludeCategories)) {
                return $this->_isEnabledForCurrentCategory = false;
            }
            if (count($includeCategories)) {
                return $this->_isEnabledForCurrentCategory = in_array($category->getId(), $includeCategories);
            }
            return $this->_isEnabledForCurrentCategory = true;
        }
        return $this->_isEnabledForCurrentCategory = false;
    }

    public function quickViewPopupIsActive()
    {
        return $this->_getRequest()->getParam(self::QUICK_VIEW_PARAM_NAME, false);
    }

    public function removeQuickViewFromUrl($url)
    {
        $parsedUrl = parse_url($url);
        if (!isset($parsedUrl['query'])) {
            return $url;
        }
        $queryParams = array();
        parse_str($parsedUrl['query'], $queryParams);
        if (isset($queryParams[self::QUICK_VIEW_PARAM_NAME])) {
            unset($queryParams[self::QUICK_VIEW_PARAM_NAME]);
            if (isset($queryParams['_'])) {
                unset($queryParams['_']);
            }
            if (count($queryParams)) {
                $parsedUrl['query'] = http_build_query($queryParams);
            } else {
                unset($parsedUrl['query']);
            }
            return $this->unparseUrl($parsedUrl);
        }
        return $url;
    }

    public function unparseUrl($parsedUrl)
    {
        $scheme = isset($parsedUrl['scheme']) ? $parsedUrl['scheme'] . '://' : '';
        $host = isset($parsedUrl['host']) ? $parsedUrl['host'] : '';
        $port = isset($parsedUrl['port']) ? ':' . $parsedUrl['port'] : '';
        $user = isset($parsedUrl['user']) ? $parsedUrl['user'] : '';
        $pass = isset($parsedUrl['pass']) ? ':' . $parsedUrl['pass'] : '';
        $pass = ($user || $pass) ? "$pass@" : '';
        $path = isset($parsedUrl['path']) ? $parsedUrl['path'] : '';
        $query = isset($parsedUrl['query']) ? '?' . $parsedUrl['query'] : '';
        $fragment = isset($parsedUrl['fragment']) ? '#' . $parsedUrl['fragment'] : '';
        return "$scheme$user$pass$host$port$path$query$fragment";
    }
}