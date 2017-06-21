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
        'uiComponent',
        'ko',
        'underscore',
        'uiRegistry',
        'Magento_Ui/js/modal/modal',
        'loader'
    ],
    function ($, Component, ko, _, register, modal, loader) {
        'use strict';
        return Component.extend({
            defaults: {
                'popup_id': '#quickViewPopup',
                'page_param_name': 'p',
                'quick_view_param_name': 'quick_view'
            },
            _productsHtml: [],
            productHtml: ko.observable(),
            activePrevBtn: ko.observable(false),
            activeNextBtn: ko.observable(false),
            quickBtnClass: '.quick-view-btn',
            _activeBtn: null,
            _popupIsOpen: false,
            pageParams: false,
            canShowPrevProductText: ko.observable(false),
            canShowNextProductText: ko.observable(false),
            canShowNextPageText: ko.observable(false),
            canShowPrevPageText: ko.observable(false),
            fullProductUrl: ko.observable('#'),
            visible: ko.observable(false),
            _quickViewBtns: null,
            initialize: function () {
                this._super();
                register.set('quick_view_popup', this);
                this._openPopupFromLocalStorage();
            },
            _getQuickViewBtns: function () {
                if (!this._quickViewBtns) {
                    this._quickViewBtns = $(this.quickBtnClass);
                }
                return this._quickViewBtns;
            },
            _getPrevProductBtn: function () {
                if (!this._activeBtn) {
                    throw new Error($.mage.__('active button is not set'));
                }
                var allBtns = this._getQuickViewBtns(),
                    currentIdx = allBtns.index(this._activeBtn);
                if (currentIdx == 0) {
                    return false;
                } else {
                    return $(allBtns.get(currentIdx - 1));
                }
            },
            _getNextProductBtn: function () {
                if (!this._activeBtn) {
                    throw new Error($.mage.__('active button is not set'));
                }
                var allBtns = this._getQuickViewBtns(),
                    currentIdx = allBtns.index(this._activeBtn);
                if (currentIdx == allBtns.length - 1) {
                    return false;
                } else {
                    return $(allBtns.get(currentIdx + 1));
                }
            },
            _canShowPrevBtn: function () {
                if (!this.prev_next_active) {
                    return false;
                }
                if (this.infinity_scroll_params.active) {
                    return this._getPrevProductBtn();
                } else {
                    return this._getPrevProductBtn()
                        || this.page_params.current_page != 1;
                }
            },
            _canShowNextBtn: function () {
                if (!this.prev_next_active) {
                    return false;
                }
                if (this.infinity_scroll_params.active) {
                    return this._getNextProductBtn()
                        || (window.infinityScrollPageNumber ?
                            (window.infinityScrollPageNumber != this.page_params.last_page) :
                            (this.page_params.current_page != this.page_params.last_page));
                } else {
                    return this._getNextProductBtn()
                        || this.page_params.current_page != this.page_params.last_page;
                }
            },
            showPrevProduct: function () {
                var prevBtn = this._getPrevProductBtn();
                if (prevBtn) {
                    this.show(prevBtn);
                } else {
                    if (this.infinity_scroll_params.active) {
                        // first page
                    } else {
                        this._changePage(this.page_params.current_page - 1);
                    }
                }
            },
            showNextProduct: function () {
                var self = this,
                    nextBtn = self._getNextProductBtn();
                if (nextBtn) {
                    self.show(nextBtn);
                } else {
                    if (self.page_params.current_page != self.page_params.last_page) {
                        if (self.infinity_scroll_params.active) {
                            self.page_params.current_page++;
                            // Konstanchuk_InfinityScroll trigger
                            var countBtns = self._getQuickViewBtns().length,
                                afterLoadFunc = function () {
                                    $(document).off('infinity-scroll-finish-show-products', afterLoadFunc);
                                    if (window.infinityScrollPageNumber) {
                                        self.page_params.current_page = window.infinityScrollPageNumber;
                                    }
                                    self._quickViewBtns = null;
                                    if (countBtns != self._getQuickViewBtns().length) {
                                        self.showNextProduct();
                                    }
                                };
                            $(document).on('infinity-scroll-finish-show-products', afterLoadFunc)
                                .trigger('infinity-scroll-start-show-products');
                        } else {
                            self._changePage(self.page_params.current_page + 1);
                        }
                    } else {
                        //last page
                    }
                }
            },
            _changePage: function (page) {
                var params = {}, newUrl;
                params[this.page_param_name] = page <= 1 ? null : page;
                newUrl = this._setParamsToUrl(params);
                try {
                    if (window.localStorage && !this.infinity_scroll_params.active) {
                        var localStorageParam = newUrl + ':' + (this.page_params.current_page > page ? 'last' : 'first');
                        window.localStorage.setItem('quick_view_popup', localStorageParam);
                    }
                } catch (e) {
                    console.error(e);
                }
                window.location = newUrl;
            },
            _openPopupFromLocalStorage: function () {
                try {
                    if (!window.localStorage) {
                        return;
                    }
                    var localStorageParam = window.localStorage.getItem('quick_view_popup');
                    if (!localStorageParam) {
                        return;
                    }
                    window.localStorage.removeItem('quick_view_popup');
                    // check current url in localstorage
                    var temp = window.location.href;
                    if (!this.infinity_scroll_params.active
                        && this.prev_next_active
                        && localStorageParam.substr(0, temp.length) === temp) {
                        temp = 'last';
                        if (localStorageParam.substr(temp.length * -1) === temp) {
                            this.show(this._getQuickViewBtns().last());
                        } else {
                            this.show(this._getQuickViewBtns().first());
                        }
                    }
                } catch (e) {
                    console.error(e);
                }
            },
            _loadProduct: function (productId, productUrl, callback) {
                var self = this;
                if (_.has(self._productsHtml, productId)) {
                    callback(self._productsHtml[productId]);
                } else {
                    var params = {};
                    params[self.quick_view_param_name] = 1;
                    $.ajax({
                        method: 'GET',
                        data: params,
                        url: productUrl,
                        cache: true,
                        dataType: 'html'
                    }).done(function (data) {
                        self._productsHtml[productId] = data;
                        callback(data);
                    });
                }
            },
            _showHidePrevNextBtns: function () {
                var canShowPrevBtn = this._canShowPrevBtn(),
                    canShowNextBtn = this._canShowNextBtn();
                this.activePrevBtn(canShowPrevBtn);
                this.activeNextBtn(canShowNextBtn);
                if (canShowPrevBtn) {
                    if (this.infinity_scroll_params.active || this._getPrevProductBtn()) {
                        this.canShowPrevProductText(true);
                        this.canShowPrevPageText(false);
                    } else {
                        this.canShowPrevProductText(false);
                        this.canShowPrevPageText(true);
                    }
                } else {
                    this.canShowPrevProductText(false);
                    this.canShowPrevPageText(false);
                }
                if (canShowNextBtn) {
                    if (this.infinity_scroll_params.active || this._getNextProductBtn()) {
                        this.canShowNextProductText(true);
                        this.canShowNextPageText(false);
                    } else {
                        this.canShowNextProductText(false);
                        this.canShowNextPageText(true);
                    }
                } else {
                    this.canShowNextProductText(false);
                    this.canShowNextPageText(false);
                }
            },
            _prevNextArrowPosition: function () {
                var windowHeight = $(window).height(),
                    elem = $('.quick-view-window'),
                    scrollTop = elem.scrollTop(),
                    arrows = $('.quick-view-arrow'),
                    wrapTop = parseInt(elem.find('.modal-inner-wrap').css('margin-top')),
                    arrowHeight = parseInt(arrows.css('height'));
                arrows.css({
                    'top': (windowHeight / 2 + scrollTop - wrapTop - arrowHeight / 2) + 'px'
                });
            },
            _setParamsToUrl: function (params, url) {
                if (!url) {
                    url = window.location;
                }
                var parser = document.createElement('a');
                parser.href = url;
                var uri = parser.search;
                $.each(params, function (key, value) {
                    key = encodeURI(key);
                    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i"),
                        separator = uri.indexOf('?') !== -1 ? "&" : "?";
                    if (uri.match(re)) {
                        if (value !== null && value !== undefined) {
                            uri = uri.replace(re, '$1' + key + '=' + encodeURI(value) + '$2');
                        } else {
                            uri = uri.replace(re, '$1');
                        }
                    } else {
                        if (value !== null && value !== undefined) {
                            uri += separator + key + '=' + encodeURI(value);
                        }
                    }
                    if (uri.length) {
                        var lastCharacter = uri.slice(-1);
                        if (lastCharacter == '?' || lastCharacter == '&') {
                            uri = uri.slice(0, -1);
                        }
                    }
                });
                parser.search = uri;
                return parser;
            },
            // element is quick view button
            show: function (element) {
                this.visible(true);
                $('[data-container="body"]').trigger('processStart');
                var self = this,
                    btn = $(element),
                    productId = btn.data('product-id'),
                    productUrl = btn.data('product-url');

                self._loadProduct(productId, productUrl, function (data) {
                    self.productHtml(data);
                    self._activeBtn = element;
                    self._showHidePrevNextBtns();
                    $('#maincontent').trigger('contentUpdated');
                    $('[data-container="body"]').trigger('processStop');
                    self.fullProductUrl(productUrl);
                    if (self.popupIsOpen) {
                        self._prevNextArrowPosition();
                    } else {
                        self.popupIsOpen = true;
                        modal({
                            type: 'popup',
                            modalClass: 'quick-view-window',
                            autoOpen: true,
                            responsive: true,
                            clickableOverlay: false,
                            title: null,
                            buttons: [],
                            closed: function () {
                                //$('.quick-view-window').off('scroll.quickviewarrow');
                                self._activeBtn = null;
                                self.popupIsOpen = false;
                                self.visible(false);
                            },
                            opened: function () {
                                self._prevNextArrowPosition();
                                $('.quick-view-window').on('scroll.quickviewarrow', self._prevNextArrowPosition);
                            }
                        }, self.popup_id);
                    }
                });
            }
        });
    }
);