setTimeout(
  function () {
    var APP_NAME = 'upsell-bundles';
    //Some methods, copied from SpurShopify:
    var SpurShopifyGetUrl = function (r) {
      return 'undefined' != typeof Spurit.globalSnippet.urlPrefix && (
        r = Spurit.globalSnippet.urlPrefix + r
      ), r;
    };
    var SpurShopifyGetProduct = function (r, t) {
      jQuery.getJSON(SpurShopifyGetUrl('/products/' + r + '.js'), function (r) {'function' == typeof t ? t(r) : null;});
    };

    function getItemsFromGlobal (cartGlobal) {
      var items = [];
      cartGlobal.getItems().forEach(function (item) {
        items.push({
          id: item.id,
          key: item.key,
          product: {
            id: item.product_id,
            handle: item.handle,
            title: item.title,
            variants: [{
              id: item.id,
              title: item.title,
              available: true,
              price: item.price,
              inventory_quantity: item.quantity
            }]
          }
        });
      });

      return items;
    }

    var app = {
      config: {
        prefix: 'SUB'
      }
    };

    var loadScript = function (url, callback) {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      if (script.readyState) {
        script.onreadystatechange = function () {
          if (script.readyState === 'loaded' || script.readyState === 'complete') {
            script.onreadystatechange = null;
            callback();
          }
        };
      } else { // For any other browser.
        script.onload = function () {
          callback();
        };
      }
      script.src = url;
      document.getElementsByTagName('head')[0].appendChild(script);
    };

    app.init = function ($) {
      $('head').append('<link rel="stylesheet" href="' + SUBParams.appFolder + '/common.css" type="text/css" />');
      $('head').append(
        '<link rel="stylesheet" href="' + SUBParams.appFolder + '/store/' + SUBParams.id + '.css?' + Math.random() + '" type="text/css" />');
      $('body').append(
        '<img src="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/0.16.1/images/loader-large.gif" id="subLoader" style="display:none; position: fixed; top:50%; left:50%; z-index: 100;">');

      loadScript(SUBParams.appFolder + '/store/' + SUBParams.id + '.js?' + Math.random(), function () {
        if (SUBParams.app_id) {
          app.run($);
        } else {
          loadScript(SUBParams.appFolder + '/store/code/' + SUBParams.id + '.js?' + Math.random(), function () {
            app.run($);
          });
        }
      });
    };
    app.getPageType = function () {
      var url = window.location.toString();
      if (url.match(/\/products\//) !== null || url.match(/\/products_preview/) !== null) {
        return 'product';
      } else if (url.match(/\/cart/) !== null) {
        return 'cart';
      } else if (url.match(/\/collections\//) !== null) {
        return 'collection';
      }

      return '';
    };
    app.goToCart = function ($) {
      var url = '/cart';
      if (typeof (
        SUBCustom
      ) !== 'undefined') {
        if (typeof SUBCustom.ajaxCart !== 'undefined') {
          app.loader();
          return $(document).trigger('bundleAdded');
        }
        url = typeof SUBCustom.urlPrefix !== 'undefined' ? SUBCustom.urlPrefix + '/cart' : url;
      }
      window.location.href = url;
    };
    app.loader = function (show) {
      show = show || false;
      if (!app.loaderImage) {
        app.loaderImage = document.getElementById('subLoader');
      }
      if (app.loaderImage.style.display === 'none' && show) {
        app.loaderImage.style.display = 'block';
      } else {
        app.loaderImage.style.display = 'none';
      }
    };
    app.getAlternativeTemplateName = function () {
      return typeof SUBParams.productView !== 'undefined' ? SUBParams.productView : 'sub-json';
    };
    app.resizeImage = function (t, r) {
      try {
        if ('original' === r) return t;
        var e = t.match(/(.*\/[\w\-\_\.]+)\.(\w{2,4})/);
        return e[1] + '_' + r + '.' + e[2];
      } catch (o) {return t;}
    };
    app.run = function ($) {
      var cartGlobal = Spurit.global.cartPool.getAdapter(APP_NAME);
      SUBParams.items = getItemsFromGlobal(cartGlobal);

      var Config = (
        function (storeConfig) {
          var config = storeConfig;
          var self = {
            init: function () {
              config['bundle_container_class_name'] = 'sub-b-container';
              config['bundle_container'] = '#sub-bs-container';
              config['cart_form'] = this.hasCustom('cartForm') ? this.getCustom('cartForm') : 'form[action="/cart"]';
              config['cart_subtotal'] = this.get('cart_subtotal') ? this.get('cart_subtotal') : '.cart__subtotal';
              config['selector_prefix'] = this.hasCustom('selectorPrefix') ? this.getCustom('selectorPrefix') : '';
            },
            get: function (key, subset) {
              if (key && subset) {
                return config[subset][key];
              } else {
                return config[key];
              }
            },
            isEnabled: function (key) {
              return (
                this.get(key) == '1'
              );
            },
            setValue: function (key, value, subset) {
              subset = subset || false;
              if (key && subset) {
                return config[subset][key] = value;
              } else {
                return config[key] = value;
              }
            },
            getSelector: function (key, id) {
              var selector;
              if (config['selector_prefix']) {
                selector = config['selector_prefix'] + config[key];
              } else {
                selector = config[key];
              }

              id = id || '';
              selector = selector.replace(':id', id);
              return selector;
            },
            getBundlesByProductHandle: function (handle) {
              if (!config.bundles.length) {
                return [];
              }

              var bundles = [];
              for (var i = 0; i < config.bundles.length; i++) {
                var bundleData = config.bundles[i];
                if (bundleData.targets.length) {
                  for (var j = 0; j < bundleData.targets.length; j++) {
                    var target = bundleData.targets[j];
                    if (target.handle === handle) {
                      bundles.push(bundleData);
                    }
                  }
                }
              }

              return bundles;
            },
            getBundlesByProductHandles: function (handles) {
              var bundles = [];
              if (config.bundles.length && handles.length) {
                for (var i = 0; i < config.bundles.length; i++) {
                  var bundleFits = true;
                  var bundleData = config.bundles[i];
                  if (bundleData.targets.length) {
                    for (var j = 0; j < bundleData.targets.length; j++) {
                      var targetData = bundleData.targets[j];
                      if (handles.indexOf(targetData.handle) === -1) {
                        bundleFits = false;
                        break;
                      }
                    }
                  }
                  if (bundleFits) {
                    bundles.push(bundleData);
                  }
                }
              }
              return bundles;
            },
            getBundlesByPids: function(products) {
              let bundles = [];

              if (config.bundles.length && products.length) {
                config.bundles.forEach(function(bundle) {
                  let bundleFits = true;

                  if (bundle.targets.length) {
                    for (let i = 0; i < bundle.targets.length; i++) {
                      if (!self.isProductExistOnCart(bundle.targets[i], products)) {
                        bundleFits = false;
                        break;
                      }
                    }
                  }

                  if (bundleFits) {
                    bundles.push(bundle);
                  }
                });
              }
              return bundles;
            },
            isProductExistOnCart: function(bundleProduct, cartProducts) {
              let product = cartProducts.filter(function(product) {
                return product.pid === parseInt(bundleProduct.pid) &&
                    product.qty >= parseInt(bundleProduct.qty);
              });

              return !!product;
            },
            hasCustom: function (key) {
              return (
                typeof (
                  SUBCustom
                ) !== 'undefined' && typeof (
                  SUBCustom[key]
                ) !== 'undefined'
              );
            },
            getCustom: function (key) {
              return (
                typeof (
                  SUBCustom
                ) !== 'undefined' && typeof (
                  SUBCustom[key]
                ) !== 'undefined'
              ) ? SUBCustom[key] : undefined;
            }
          };
          self.init();
          return self;
        }
      )(SUBConfig);

      var Product = function (product) {
        if (product === undefined) {
          throw new Error('There is no product on the page');
        }

        if (!product.variants && product.product) {
          product = product.product;
        }

        var that = this;

        this.variants = [];
        product.variants.forEach(function (item) {
          var v = new Variant(item);
          that.variants.push(v);
        });
        this.getVariant = function (id) {
          for (var i = 0; i < this.variants.length; i++) {
            var variant = this.variants[i];
            if (variant.getId() == id)
              return variant;
          }
          return null;
        };
        this.getImageSrc = function () {
          if (typeof product.images[0] !== 'undefined' && product.images[0]) {
            return product.images[0];
          } else {
            return 'https://cdn-spurit.com/shopify-apps/upsell-bundles/no-image-thumb.gif';
          }
        };
        this.getVariants = function () { return this.variants; };
        this.getId = function () { return product.id; };
        this.getTitle = function () { return product.title; };
        this.getHandle = function () { return product.handle; };
        this.getDefaultVariant = function () { return product.defaultVariant; };
      };

      var Variant = function (variantData) {
        this.data = variantData;
        this.getId = function () { return this.data.id; };
        this.getTitle = function () { return this.data.title; };
        this.getPrice = function () { return this.data.price; };
        this.getCompareAtPrice = function () { return this.data.compare_at_price; };
        this.isAvailable = function () { return this.data.available; };
      };

      var Cart = (
        function () {
          return {
            getProducts: function (handles, callback, viewName) {
              var products = [];
              var askedProducts = 0;
              for (var i = 0; i < handles.length; i++) {
                var handle = handles[i];
                if (viewName) {
                  $.get('/products/' + handle + '?view=' + viewName, function (data) {
                    products.push(JSON.parse(data));
                    if (++askedProducts == handles.length) callback(products);
                  });
                } else {
                  SpurShopifyGetProduct(handle, function (data) {
                    products.push(data);
                    if (++askedProducts == handles.length) callback(products);
                  });
                }
              }
            },
            post: function (url, data, callback) {
              $.ajax({
                type: 'POST',
                url: url,
                cache: false,
                dataType: 'json',
                data: data
              }).done(function (data) {
                if (callback !== undefined) callback(data);
              }).fail(function (err) {
                try {
                  var desc = JSON.parse(err.responseText).description;
                  if (desc.length) {
                    app.loader(false);
                    alert(desc);
                  }
                } catch (e) {}
              });
            }
          };
        }
      )();

      var Target = function (data) {
        this.product = undefined;
        this.activeVariant = undefined;
        this.qty = data.qty !== undefined ? data.qty : 1;
        this.data = data;
        this.getId = function () { return this.data.id; };
        this.getType = function () { return this.data.type; };
        this.getTitle = function () {
          //add custom title support
          return this.getProduct().getTitle();
        };
        this.getImageSrc = function () {
          //add custom image support
          return this.getProduct().getImageSrc();
        };
        this.getHref = function () {
          if (this.getType() === 'collection') {
            return '/collections/' + this.getHandle();
          } else {
            return '/products/' + this.getHandle();
          }
        };
        this.getHandle = function () { return this.data.handle; };
        this.getProduct = function () {
          if (typeof this.product == 'undefined') {
            throw new Error('Empty target product');
          }
          return this.product;
        };
        this.setProduct = function (product, activeVariantId) {
          activeVariantId = activeVariantId || false;
          this.product = product;

          if (activeVariantId) {
            this.setActiveVariantId(activeVariantId);
          } else {
            var variants = this.product.getVariants();
            for (var i = 0; i < variants.length; i++) {
              var variant = variants[i];
              if (variant.isAvailable() && !this.activeVariant) {
                this.activeVariant = variant;
              }
            }
          }
          if (!this.getActiveVariantId())
            throw new Error('No available variants for the product ' + this.getProduct().getHandle());
        };
        this.getActiveVariantId = function () {
          return this.activeVariant.getId();
        };
        this.setActiveVariantId = function (vid) {
          this.activeVariant = this.getProduct().getVariant(vid);
        };
        this.getVariants = function () { return this.getProduct().getVariants(); };
        this.getVariantOptions = function () {
          return this.getVariants().map(function (v) {
            return {
              value: v.getId(),
              title: v.getTitle()
            };
          });
        };
        this.getPrice = function () {
          return this.activeVariant.getPrice() * this.getQty();
        };
        this.getCompareAtPrice = function () {
          return this.activeVariant.getCompareAtPrice() * this.getQty();
        };
        this.getQty = function () { return this.qty; };
      };

      var Bundle = function (data) {
        if (!data.targets.length) {
          throw new Error('Targets list is empty');
        }

        this.data = data;

        this.targets = [];
        this.qty = 1;
        var self = this;

        for (var i = 0; i < data.targets.length; i++) {
          var target = new Target(data.targets[i]);
          this.targets.push(target);
        }

        this.getData = function () {
          return this.data;
        };
        this.getTargets = function () { return this.targets; };
        this.getTarget = function (tid) {
          for (var i = 0; i < this.targets.length; i++) {
            var target = this.targets[i];
            if (target.getId() == tid) return target;
          }
          return null;
        };
        this.getTargetHandles = function () {
          var targets = this.getTargets();
          var handles = [];
          for (var i = 0; i < targets.length; i++) {
            var target = targets[i];
            var handle = target.getHandle();
            if (handles.indexOf(handle) === -1) {
              handles.push(handle);//we should optimize reducing current product
            }
          }
          return handles;
        };
        this.setProducts = function (products) {
          var targets = this.getTargets();
          for (var i = 0; i < targets.length; i++) {
            var target = targets[i];
            for (var j = 0; j < products.length; j++) {
              var product = products[j];
              if (product.getHandle() === target.getHandle()) {
                target.setProduct(product, product.getDefaultVariant());
              }
            }
          }
        };
        this.getTitle = function () { return this.data.title; };
        this.getDescription = function () { return this.data.description; };
        this.getButtonText = function () { return this.data.button_text; };
        this.getAmount = function () {
          var amount = 0;
          this.getTargets().forEach(function (t) {
            amount += t.getPrice() * self.getQty();
          });
          return amount;
        };
        this.isFixedDiscount = function () {
          return (
            this.data.discount_type === 'fixed'
          );
        };
        this.getDiscount = function () {
          return this.isFixedDiscount() ?
            Spurit.global.prices.convertFromShopCurrencyToCart(this.data.discount_amount) * 100 :
            this.data.discount_amount;
        };
        this.getTotalDiscount = function () {
          if (this.isFixedDiscount()) {
            return this.getDiscount() * this.getQty();
          } else {
            return parseInt(this.getAmount() * this.getDiscount());
          }
        };
        this.getTargetDiscount = function (price) {
          var percents;
          var discountAmount = this.getDiscount();

          if (this.isFixedDiscount()) {
            percents = discountAmount / this.getAmount();
          } else {
            percents = discountAmount;
          }

          return price * percents;
        };
        this.getTargetDiscountedPrice = function (price) {
          return price - this.getTargetDiscount(price);
        };
        this.getId = function () { return data.id; };
        this.setQty = function (qty) {
          this.qty = qty || 1;
        };
        this.getQty = function () { return this.qty; };
        this.getMap = function (multipleQty) {
          var qty = (
            typeof multipleQty !== 'undefined'
          ) ? this.getQty() : 1;
          var map = { id: this.getId(), targets: [] };
          this.getTargets().forEach(function (target) {
            map.targets.push({
              tid: target.getId(),
              vid: target.getActiveVariantId(),
              pid: target.getProduct().getId(),
              qty: target.getQty() * qty
            });
          });
          return map;
        };
      };

      var Session = (
        function (storeHash, token) {
          var cartToken = token;
          if (!cartToken || cartToken.length < 20) {
            cartToken = cartGlobal.getToken();
          }

          var getDiscountsKey = function () {
            return storeHash + cartToken;
          };
          var getBundlesKey = function () {
            return 'sub' + cartToken;
          };
          return {
            getDiscount: function () {
              return sessionStorage.getItem(getDiscountsKey());
            },
            addBundleId: function (id) {
              sessionStorage.setItem(getBundlesKey(), id);
            },
            getBundleIds: function () {
              var val = sessionStorage.getItem(getBundlesKey());
              if (val && val.length) {
                return val.split(',');
              }

              return [];
            }
          };
        }
      )(SUBParams.id, Spurit.globalSnippet.cart.token);

      var BaseApp = function (product) {
        if (product.id == undefined) {
          throw new Error('Product object does not exist');
        }

        var self = this;
        this.product = new Product(product);
        this.addToCartButton, this.bundleContainer = undefined;
        this.bundles = {};

        this.onInitialized = function () {
          if (!this.bundleContainer.length || !Object.keys(this.bundles).length) {
            return;
          }

          this.bundleContainer.show();
          this.bundleContainer.find('select.sub-t-vid').on('change', function () {
            var bid = $(this).parents('.' + Config.get('bundle_container_class_name')).attr('data-bid');
            if (!bid || typeof self.bundles[bid] === 'undefined') {
              return;
            }

            var bundle = self.bundles[bid];
            var target = bundle.getTarget($(this).attr('data-sub-tid'));
            if (!target) {
              return;
            }

            target.setActiveVariantId($(this).val());
            var parent = $(this).parent();
            var targetPrice = target.getPrice() / 100;
            var discountedTargetPrice = bundle.getTargetDiscountedPrice(targetPrice);
            var oldPrice = parent.find('.sub-t-cprice span');
            var newPrice = parent.find('.sub-t-price span');
            if (discountedTargetPrice < targetPrice) {
              if (oldPrice.length) {
                oldPrice.html(Spurit.global.prices.money.format(targetPrice));
              }
              if (newPrice.length) {
                newPrice.html(Spurit.global.prices.money.format(discountedTargetPrice));
                //todo recalculate discount for other variants
              }
            } else if (newPrice.length) {
              newPrice.html(Spurit.global.prices.money.format(targetPrice));
            }
          });
          this.bundleContainer.find('.sub-b-submit').on('click', function (e) {
            if (!$(this).hasClass('add-btn')) {
              e.preventDefault();
              var bid = $(this).parents('.' + Config.get('bundle_container_class_name')).attr('data-bid');
              if (bid && typeof self.bundles[bid] !== 'undefined') {
                self.processBundle(self.bundles[bid]);
              }
            }
          });
        };
        this.init = function () {
          this.getBundles(this.product.getHandle(), function (bundles) {
            if (!bundles.length) {
              return;
            }
            //recursive calls to find the first available bundle
            var i = 0;
            var recall = function () {
              if (i < bundles.length) {
                self.initBundle(bundles, i++, recall);
              } else {
                self.onInitialized();
              }
            };
            self.initBundle(bundles, i++, recall);
          });
        };
        this.initBundle = function (bundles, i, callback) {
          try {
            var bundle = new Bundle(bundles[i]);
            Cart.getProducts(bundle.getTargetHandles(), function (productsDataArr) {
              try {
                var products = productsDataArr.map(function (val) {
                  return new Product(val);
                });
                bundle.setProducts(products);

                self.addBundleToPage(bundle, i);
                self.bundles[bundle.getId()] = bundle;
              } catch (e) {
                // console.log(e); //for debug
              }
              callback();
            }, app.getAlternativeTemplateName());
          } catch (e) {
            callback(e);
          }
        };
        this.getBundles = function (handle, callback) {
          var bundles = Config.getBundlesByProductHandle(handle);
          //add logic for collection-based bundles if product based bundle was not found
          callback(bundles);
        };
        this.addBundleToPage = function (bundle, index) {
          if (!this.bundleContainer.length) {
            this.bundleContainer = $('<div id="sub-bs-container" style="display:none"></div>');
            this.addToCartButton.after(this.bundleContainer);
          }
          this.bundleContainer = this.addBundleContent(bundle, this.bundleContainer, index);
        };
        this.addBundleContent = function (bundle, globalContainer, index) {
          // Bundle HTML
          var container = $('<div class="' + Config.get('bundle_container_class_name') + '" data-bid="' + bundle.getId() + '"></div>');
          var targets = bundle.getTargets();
          if (!targets.length) throw new Error('Empty target list');
          var sel;
          $('<div class="sub-b-title">' + bundle.getTitle() + '</div>').appendTo(container);
          $('<div class="sub-b-description">' + bundle.getDescription() + '</div>').appendTo(container);
          var targetsContainer = $('<div class="sub-b-targets"></div>');
          targetsContainer.addClass('sub-t-count-' + (targets.length + 1));
          var totalPrice = 0;
          var totalPriceDiscount = 0;
          var totalCompareAtPrice = 0;
          var addText = window.upsellBundles.translation.add;

          for (var i = 0; i < targets.length; i++) {
            var target = targets[i];
            var div = $('<div class="sub-t-container" data-product="' + target.getProduct().getId() + '"></div>');
            if (Config.isEnabled('show_image')) {
              var src = target.getImageSrc();
              if (Config.hasCustom('imageSize') && src.indexOf('no-image') === -1) {
                src = app.resizeImage(src, Config.getCustom('imageSize'));
              }
              $('<a href="' + target.getHref() + '"><img src="' + src + '" /></a>').appendTo(div);
            }
            var priceContainer = $('<div class=\'sub-price\'></div>').appendTo(div);
            var targetPrice = target.getPrice() / 100;
            var targetCompareAtPrice = target.getCompareAtPrice() / 100;
            var discountedTargetPrice = bundle.getTargetDiscountedPrice(targetPrice);
            if (discountedTargetPrice < targetPrice) {
              if (Config.isEnabled('show_old_price')) {
                totalPrice += targetPrice;
                /*priceContainer.append($('<span class="sub-t-cprice"><span>' +
                    Spurit.global.prices.money.format(targetPrice) +
                    '</span>&nbsp;</span>'));*/
              }
              if (Config.isEnabled('show_new_price')) {
                totalPriceDiscount += discountedTargetPrice;
                /*priceContainer.append($('<span class="sub-t-price"><span>' +
                    Spurit.global.prices.money.format(discountedTargetPrice) +
                    '</span></span>'));*/
              }
              totalCompareAtPrice += targetCompareAtPrice;
            } else {
              totalPrice += targetPrice;
              totalPriceDiscount += targetPrice;
              totalCompareAtPrice += targetCompareAtPrice;
              /*priceContainer.append($('<span class="sub-t-price"><span>' +
                  Spurit.global.prices.money.format(targetPrice) +
                  '</span></span>'));*/
            }
            if (Config.isEnabled('show_title')) {
              $('<a class="sub-t-title" href="' + target.getHref() + '">' + target.getTitle() + '</a>').appendTo(div);
            }
            var variantOptions = target.getVariantOptions();
            if (variantOptions.length > 1 && false) {
              sel = $('<select>');
              variantOptions.forEach(function (vo) {
                sel.append($('<option>').attr('value', vo.value).text(vo.title));
              });
            } else {
              sel = $('<input type="hidden" value="' + target.getActiveVariantId() + '">');
            }
            $('<a href="' + target.getHref() + '" class="sub-b-submit add-btn">' + addText + '</a>').appendTo(div);
            sel.attr('data-sub-tid', target.getId()).addClass('sub-t-vid').appendTo(div);
            if (target.getQty() > 1) {
              $('<div class="sub-qty">x ' + target.getQty() + '</div>').appendTo(div);
            }
            targetsContainer.append(div);
          }

          targetsContainer = this.changeAddButtons(targetsContainer, bundle);

          var submitWrapper = $('<div class="sub-t-container sub-t-total-container"><div class="sub-t-total"><div class="sub-t-total-regular">' + window.upsellBundles.translation.regular_price + ':<br/>' + Spurit.global.prices.money.format(totalCompareAtPrice) + '</div><div class="sub-t-total-package">' + window.upsellBundles.translation.package_price + ':<br/>' + Spurit.global.prices.money.format(totalPriceDiscount) + '</div><div data-total="' + Spurit.global.prices.money.format(totalPrice) + '"></div></div></div>');
          //var submitWrapper = $('<div class="sub-t-container"><button class="sub-b-submit">' + bundle.getButtonText() + '</button></div>');
          targetsContainer.append(submitWrapper);
          targetsContainer.appendTo(container);
          if (index === 0) {
            $('<h2 class="section-title">' + window.upsellBundles.translation.title + '</h2>').appendTo(globalContainer);
          }
          container.appendTo(globalContainer);

          function checkBundleSize (globalContainer, submitWrapper) {
            //	SUBP-37: Fix for thin containers;

            var ONE_BUNDLEITEM_WIDTH_PX = 150;
            var THIN_WRAPPER_CLASSNAME = 'sub-t-horizontal-view';

            var diff = ONE_BUNDLEITEM_WIDTH_PX * (targets.length) - $(globalContainer)[0].offsetWidth;
            var submitTextWidth = submitWrapper.find('.sub-t-total').html().length / (targets.length + 1) * ONE_BUNDLEITEM_WIDTH_PX / 2 + 8;

            if (!$('.' + THIN_WRAPPER_CLASSNAME).length) {
              if (diff < 0 && diff * (-1) < submitTextWidth) {
                diff += $(submitWrapper)[0].offsetWidth;
              }
            } else {
              if (diff * (-1) < submitTextWidth) {
                diff += submitTextWidth;
              }
            }

            if (diff > 0) {
              container.addClass(THIN_WRAPPER_CLASSNAME);
            } else {
              container.removeClass(THIN_WRAPPER_CLASSNAME);
            }
          }

          $(globalContainer).show(0, function () {
            checkBundleSize(globalContainer, submitWrapper);
            $(globalContainer).hide(0);
          });
          window.onresize = function () {
            checkBundleSize.call(this, globalContainer, submitWrapper);
          };

          return globalContainer;
        };

        this.changeAddButtons = function (container, bundle) {
          var addItems = window.upsellBundles.addedItems;
          var addedText = window.upsellBundles.translation.added;
          if (addItems.products.length > 0) {
            // NO BUNDLES IN CART, ONLY SEPARATE PRODUCTS
            bundle.getTargets().forEach(item => {
              var id = item.getProduct().getId().toString();
              if (addItems.products.includes(id)) {
                container.find('.sub-t-container[data-product="' + id + '"]').find('.add-btn').text(addedText).addClass('added');
              }
            });
          }
          if (Object.keys(addItems.bundles).length > 0) {
            // HAS BUNDLES IN CART
            if (Object.keys(addItems.bundles).includes(bundle.getId())) {
              // SET ADDED BUTTON TO ALL CLOSED BUNDLES IN CART
              bundle.getTargets().forEach(item => {
                var id = item.getProduct().getId();
                container.find('.sub-t-container[data-product="' + id + '"]').find('.add-btn').text(addedText).addClass('added');
              });
            } else {
              // SET ADDED BUTTON TO ALL LARGER BUNDLES THAN ALREADY CLOSED BUNDLES IN CART
              Object.entries(addItems.bundles).forEach(([_, item]) => {
                if (bundle.getTargets().length > item.targets.length) {
                  addText = 'Added';
                  const currentIds = bundle.getTargets().map(currentItem => parseInt(currentItem.getProduct().getId()));
                  const bundleIds = item.targets.map(bundleItem => parseInt(bundleItem.pid));
                  const intersectedIds = currentIds.filter(currentId => bundleIds.includes(currentId));
                  if (intersectedIds.length === bundleIds.length) {
                    bundleIds.forEach(id => {
                      container.find('.sub-t-container[data-product="' + id + '"]').find('.add-btn').text(addedText).addClass('added');
                    });
                  }
                }
              });
            }
          }

          return container;
        };

        this.processBundle = function (bundle) {
          app.loader(true);

          var lineItems = bundle.getTargets().map(function (target) {
            return {
              id: target.getActiveVariantId(),
              quantity: target.getQty(),
              properties: {}
            };
          });

          cartGlobal.addItems(lineItems, function () {
            Session.addBundleId(bundle.getId());
            app.goToCart($);
          });
        };

        this.getSelector = function (selector) {
          return Config.getSelector(selector);
        };

        this.run = function () {
          this.bundleContainer = $(self.getSelector('bundle_container')).first();
          if (this.bundleContainer.length) {
            this.bundleContainer.html('');
            this.init();

            return;
          }

          this.addToCartButton = $(self.getSelector('addtocart_selector')).first();
          if (this.addToCartButton.length) {
            this.init();

            return;
          }

          setTimeout(function () {
            self.addToCartButton = $(self.getSelector('addtocart_selector')).first();
            if (!self.addToCartButton.length) {
              throw new Error('Add to cart button or custom container were not detected');
            }
            self.init();
          }, 2000);
        };
      };

      var ProductApp = function (product, params) {
        BaseApp.apply(this, arguments);
        this.run();
      };

      var QuickViewApp = function (product, params) {
        BaseApp.apply(this, arguments);
        this.run();
      };

      var BundlesRegistry = (
        function () {
          return {
            getBundles: function (lineItems, bundlesData, historicalIds) {
              if (!bundlesData.length || !lineItems.length) {
                return [];
              }

              var self = this;
              var otherVariantsMap, bundleCopies;
              var bundles = [];

              for (var i = 0; i < bundlesData.length; i++) {
                try {
                  otherVariantsMap = {};//tid => [item,item,...]
                  var bundleData = bundlesData[i];
                  var bundle = new Bundle(bundleData);
                  var targets = bundle.getTargets();
                  targets.forEach(function (target) {
                    var targetLineItems = self.getLineItemsForTarget(target, lineItems);
                    var firstLineItem = targetLineItems.shift();
                    target.setProduct(new Product(firstLineItem));
                    if (targetLineItems.length) {//if the target is represented in multiple line items (different variants of the same product)
                      otherVariantsMap[target.getId()] = targetLineItems;
                    } else if (firstLineItem.quantity > 1) {
                      otherVariantsMap[target.getId()] = [firstLineItem];
                    }
                  });
                  bundles.push(bundle);
                  bundleCopies = this.getBundleVariations(bundle, otherVariantsMap);
                  bundleCopies.forEach(function (item) {
                    bundles.push(item);
                  });
                } catch (e) {
                  // console.log(e); //for debug
                }
              }

              if (bundles.length) {
                bundles = this.sortByPreviouslyAdded(bundles, historicalIds);
                bundles = self.getActive(bundles, lineItems);
              }

              return bundles;
            },
            sortByPreviouslyAdded: function (bundles, addedBundleIds) {
              if (bundles.length && addedBundleIds.length) {
                var previousBundles = [];
                var newBundles = [];
                bundles.forEach(function (bundle) {
                  if (addedBundleIds.indexOf(bundle.getId()) === -1) {
                    newBundles.push(bundle);
                  } else {
                    previousBundles.push(bundle);
                  }
                });
                bundles = previousBundles.concat(newBundles);
              }
              return bundles;
            },
            getBundleVariations: function (bundle, targetIdLineItemsMap) {
              if (!Object.keys(targetIdLineItemsMap).length) {
                return [];
              }

              function getObjValues (obj) {
                var vs = [];
                for (var k in obj) {
                  if (obj.hasOwnProperty(k)) {
                    vs.push(obj[k]);
                  }
                }
                return vs;
              }

              var copies = [];
              var copiesCount = getObjValues(targetIdLineItemsMap).reduce(function (prev, items) {
                return Math.min(prev, items.length);
              }, 1000);

              for (var i = 0; i < copiesCount; i++) {
                var bundleCopy = new Bundle(bundle.getData());
                var targets = bundleCopy.getTargets();
                targets.forEach(function (t) {
                  var product = new Product(targetIdLineItemsMap[t.getId()][i]);
                  t.setProduct(product, product.getVariants()[0].getId());
                });
                copies.push(bundleCopy);
              }

              return copies;
            },
            getLineItemsForTarget: function (target, lineItems) {
              var handle = target.getHandle();
              return lineItems.filter(function (item) {
                return handle === item.product.handle;
              });
            },
            getTotalDiscount: function (bundles) {
              return bundles.map(function (bundle) {
                return bundle.getTotalDiscount();
              }).reduce(function (a, b) {
                return a + b;
              }, 0);
            },
            getActive: function (bundles, items) {
              var map = this.getItemsMap(items);
              return bundles.filter(function (bundle) {
                var qty = map.getAvailableBundleQty(bundle.getMap());
                bundle.setQty(qty);
                return qty > 0;
              });
            },
            serialize: function (bundles) {
              var maps = bundles.map(function (bundle) {
                return bundle.getMap(true);
              });
              return JSON.stringify(maps);
            },
            getItemsMap: function (items) {
              var map = {};
              items.forEach(function (item) {
                map[item.id] = item.quantity;
              });
              return {
                map: map,
                getAvailableBundleQty: function (bundleMap) {
                  if (!Object.keys(this.map).length) {
                    return 0;
                  }

                  var self = this;
                  var min = 100;

                  bundleMap.targets.forEach(function (t) {
                    if (self.map.hasOwnProperty(t.vid)) {
                      var cartQty = self.map[t.vid];
                      if (cartQty >= t.qty) {
                        min = Math.min(min, Math.floor(cartQty / t.qty));
                      } else {
                        min = 0;
                      }
                    } else {
                      min = 0;
                    }
                  });

                  if (min) {
                    bundleMap.targets.forEach(function (t) {
                      self.map[t.vid] -= t.qty * min;
                    });
                  }

                  return min;
                }
              };
            }
          };
        }
      )();

      var CartCore = function (CartAdapter) {
        this.init = function () {
          CartAdapter.init();
        };
        this.update = function (items) {};
        this.init();
      };

      var CartPageAdapter = function (items) {
        var self = this;
        var form = $(Config.getSelector('cart_form')).first();
        this.init = function () {
          if (!form.length) {
            throw new Error('Cart page form was not found');
          }
          setTimeout(function () {
            if (typeof self.onReady === 'function') {
              self.getItems(function (items) {
                self.onReady(items);
              });
            }
          }, 500);
        };
        this.getItems = function (callback) {
          var items = getItemsFromGlobal(cartGlobal).map(function (item) {
            item.quantity = self.getQtyByKey(item.key);
            return item;
          });

          callback(items);
        };

        this.getQtyByKey = function (key) {
          var items = cartGlobal.getItems();
          var needle = null;
          items.forEach(function (item) {
            if (item.key === key) {
              needle = item;
            }
          });
          return needle ? needle.quantity : 0;
        };
      };

      var AjaxCartAdapter = function (params) {
        var self = this;
        this.items = [];
        this.params = {
          itemQtySelector: 'form#cart #updates_:id',
          formSelector: 'form#cart',
          checkoutBtnSelector: 'form#cart input[type=submit]',
          subtotalSelector: 'form#cart .mm-counter .money'
        };
        this.params = $.extend(this.params, params);
        var form = $(this.params.formSelector).first();
        this.init = function () {
          if (!form.length) {
            throw new Error('Ajax cart form was not found');
          }
          this.getItems(function (items) {
            if (typeof self.onReady === 'function') {
              self.onReady(items);
            }
          });
        };

        this.getQtyByKey = function (key) {
          var items = cartGlobal.getItems();
          var needle = null;
          items.forEach(function (item) {
            if (item.key === key) {
              needle = item;
            }
          });
          return needle ? needle.quantity : 0;
        };
        this.getItems = function (callback) {
          var cartItemsById = {};
          cartGlobal.getItems().forEach(function (cartItem) {
            cartItemsById[cartItem.id] = cartItem;
          });

          self.items = getItemsFromGlobal(cartGlobal).map(function (item) {
            var cartItem = cartItemsById[item.id];
            item.quantity = cartItem ? self.getQtyByKey(cartItem.id) : 0;

            return item;
          });

          callback(self.items);
        };
      };

      var JsGlobalIntegration = function (CartAdapter) {
        this.cache = [];

        this.setDiscounts = function () {
          var self = this;
          if (app.getPageType() === 'cart' || app.getPageType() === 'product') {
            Spurit.global.selectors.add(Config.getSelector('cart_subtotal'), 'cart_subtotal');
          }

          var callback = function (next) {
            CartAdapter.getItems(function (items) {
              var activeBundles = self.getActiveBundles(items);
              if (activeBundles.length) {
                Spurit.global.checkout.setTags(Config.get('order_tag_name'), APP_NAME);
              }
            });

            self.removeAppDiscounts();
            self.cache = [];
            updateDiscounts();
            next();
          };
          Spurit.global.checkout.onCheckout(callback);

          function updateDiscounts () {
            CartAdapter.getItems(function (items) {
              // create cache key
              var cacheKey = JSON.stringify(items.map(function (item) {
                var result = {};
                result[item.key] = item.quantity;
                return result;
              }));

              // get from cache or new
              var appDiscount = {};
              if (self.cache[cacheKey]) {
                appDiscount = self.cache[cacheKey];
              } else {
                appDiscount = self.getAppDiscount(items);

                if (appDiscount.hasOwnProperty('discount')) {
                  delete appDiscount['discount'];
                }
              }
              self.cache[cacheKey] = appDiscount;

              // if discount is zero remove all discounts by APP_NAME
              if (!appDiscount.length) {
                self.removeAppDiscounts();
              } else {
                let data = self.getDiscountData(appDiscount, items);

                self.setFixedDiscount(data.fixedDiscount);
                self.setPercentDiscount(data.percentageItems);
              }
            });
          }

          this.removeAppDiscounts = function () {
            cartGlobal.removeDiscount();
            cartGlobal.getItems().forEach(function (cartItem) {
              if (cartItem.getDiscounts().find(function (discount) {return discount.appName === APP_NAME;})) {
                cartItem.removeDiscount(APP_NAME);
              }
            });
          };

          this.setPercentDiscount = function(percentageItems) {
            let cartItems = cartGlobal.getItems();

            percentageItems.forEach(function(percentItem) {
              let cartItem = cartItems.find(function(item) {
                return item.key === percentItem.key;
              });

              if (cartItem) {
                cartItem.addFixedDiscount(parseFloat((percentItem.discount / cartItem.quantity).toFixed(2)), APP_NAME);
              }
            });
          };

          updateDiscounts();
        };

        this.getDiscountData = function(appDiscount, cartItems) {
          let self = this,
              fixedDiscount = 0,
              percentageItems = [];
          appDiscount.forEach(function(bundle) {
            if (bundle.discount_type === 'fixed') {
              fixedDiscount += parseFloat(bundle.discount_amount) * bundle.qty;
            } else {
              for (let bundleQty = bundle.qty; bundleQty > 0; bundleQty--) {
                bundle.targets.forEach(function(target) {
                  let targetQty = parseInt(target.qty);

                  while (targetQty > 0) {
                    let
                        discount = 0,
                        itemIndex = cartItems.findIndex(function(item) {
                          return item.product.id === parseInt(target.pid) && item.quantity > 0;
                        }),
                        item = percentageItems.find(function(elem) {
                          return elem.key === cartItems[itemIndex].key;
                        }),
                        qtyDiff = cartItems[itemIndex].quantity - targetQty;

                    if (qtyDiff < 0) {
                      discount += self.getItemPrice(cartItems[itemIndex]) * cartItems[itemIndex].quantity * parseFloat(bundle.discount_amount);
                      targetQty -= cartItems[itemIndex].quantity;
                      cartItems[itemIndex].quantity = 0;
                    } else {
                      discount += self.getItemPrice(cartItems[itemIndex]) * targetQty * parseFloat(bundle.discount_amount);
                      cartItems[itemIndex].quantity -= targetQty;
                      targetQty = 0;
                    }

                    if (item) {
                      item.discount += discount;
                    } else {
                      percentageItems.push({
                        key: cartItems[itemIndex].key,
                        discount: discount,
                      });
                    }
                  }
                });
              }
            }
          });

          return {fixedDiscount: fixedDiscount, percentageItems: percentageItems};
        };
        this.setFixedDiscount = function (fixedDiscount) {
          if (fixedDiscount) {
            cartGlobal.addFixedDiscount(fixedDiscount);
          } else {
            cartGlobal.removeDiscount();
          }
        };
        this.getActiveBundles = function (items) {
          var bundlesData = Config.getBundlesByProductHandles(this.getHandles(items));
          return BundlesRegistry.getBundles(items, bundlesData, Session.getBundleIds());
        };
        this.getAppDiscount = function(cartItems) {
          let cartBundles = Config.getBundlesByPids(this.getProductsData(cartItems));
          let bestBundlesDiscount = this.getTheBestBundlesDiscount(cartItems, cartBundles);
          this.setAddedInfo(cartItems, cartBundles, bestBundlesDiscount);
          return bestBundlesDiscount;
        }

        this.getTheBestBundlesDiscount = function(cartItems, cartBundles) {
          let bestBundle = [],
              combinations = this.getCombinations(this.copyValue(cartItems), this.copyValue(cartBundles)),
              parsedCombinations = this.parseCombinations(combinations),
              combinationsDiscount = this.calculateCombinationsDiscount(parsedCombinations, cartItems);

          if (combinationsDiscount.length) {
            bestBundle = combinationsDiscount.reduce(function(prev, current) {
              return (prev.discount > current.discount) ? prev : current
            });
          }

          return bestBundle;
        };

        this.copyValue = function(value) {
          return JSON.parse(JSON.stringify(value));
        }

        this.getMaxBundleQuantity = function(cartItems, bundle) {
          let self = this,
              isMaxReached = false,
              maxQty = 0;

          while (!isMaxReached) {
            let isBundleFit = true;

            bundle.targets.every(function(target) {
              let
                  targetQty = parseInt(target.qty),
                  itemsCount = self.getTargetVariantsCount(self.copyValue(cartItems), target);

              if (itemsCount < targetQty) {
                isMaxReached = true;
                isBundleFit = false;
                return false;
              } else {
                while (targetQty > 0) {
                  let
                      itemIndex = cartItems.findIndex(function(item) {
                        return item.product.id === parseInt(target.pid) && item.quantity > 0;
                      }),
                      qtyDiff = cartItems[itemIndex].quantity - targetQty;

                  if (qtyDiff < 0) {
                    targetQty -= cartItems[itemIndex].quantity;
                    cartItems[itemIndex].quantity = 0;
                  } else {
                    cartItems[itemIndex].quantity -= targetQty;
                    targetQty = 0;
                  }
                }
              }

              return true;
            });

            if (isBundleFit) {
              maxQty++;
            }
          }

          return maxQty;
        }

        this.getTargetVariantsCount = function(cartItems, target) {
          return cartItems.reduce(function(prev, current) {
            return (current.product.id === parseInt(target.pid))
                ? prev + current.quantity
                : prev;
          }, 0);
        }

        this.removeBundleFromCart = function(cartItems, bundle, bundleQty) {
          const removeDone = [];
          bundle.targets.forEach(function(target) {
            cartItems = cartItems.map(function(item) {
              if (item.product.id === parseInt(target.pid) && !removeDone.includes(item.product.id)) {
                removeDone.push(item.product.id);
                item.quantity -= parseInt(target.qty) * bundleQty;
              }
              return item;
            });
          });

          return cartItems;
        }

        this.cartQuantityCheck = function(cart) {
          let result = true;
          cart.forEach(item => {
            if(item.quantity < 0) result = false;
          })

          return result;
        }

        this.getCombinations = function(cartItems, bundles) {
          let self = this,
              results = [];

          bundles.forEach(function(bundleCurrent, bundleIndex, bundlesArr) {
            let matches = [],
                maxQty = self.getMaxBundleQuantity(self.copyValue(cartItems), bundleCurrent);

            for (let bundleQty = maxQty; bundleQty > 0; bundleQty--) {
              let cartNext = self.copyValue(cartItems),
                  singleMatch = [self.copyValue(bundleCurrent)],
                  bundlesNext = self.copyValue(bundlesArr);

              cartNext = self.removeBundleFromCart(self.copyValue(cartItems), bundleCurrent, bundleQty);
              singleMatch[0]['qty'] = bundleQty;
              bundlesNext.splice(bundleIndex, bundleIndex + 1);

              if (bundlesNext.length > 0 && self.cartQuantityCheck(cartNext)) {
                let resultNext = self.getCombinations(cartNext, bundlesNext);

                if (resultNext.length) {
                  resultNext.forEach(function(result) {
                    if (Array.isArray(result)) {
                      result.forEach(function(item) {
                        matches.push([singleMatch, item]);
                      });
                    } else {
                      matches.push(result);
                    }
                  });
                } else {
                  matches.push(singleMatch);
                }
              } else {
                matches.push(singleMatch);
              }
            }

            if (matches.length) {
              results.push(matches);
            }
          });

          return results;
        };

        this.getProductsData = function(items) {
          return items.map(function(item) {
            return {
              'pid': parseInt(item.product.id),
              'qty': item.quantity
            };
          });
        };

        this.parseCombinations = function(combinations) {
          let result = [];

          combinations.forEach(function(baseBundle) {
            baseBundle.forEach(function(combination) {
              if (Array.isArray(combination)) {
                result.push(combination.flat(Infinity));
              } else {
                result.push(result);
              }
            });
          });

          return result;
        }

        this.calculateCombinationsDiscount = function(parsedCombinations, cartItems) {
          let self = this;

          return parsedCombinations.map(function(combination) {
            combination['discount'] = self.calculateDiscount(combination, cartItems);
            return combination;
          });
        }

        this.calculateDiscount = function(combination, cartItems) {
          let discount = 0,
              self = this;

          combination.forEach(function(bundle) {
            let currentCartItems = self.copyValue(cartItems);

            if (bundle.discount_type === 'fixed') {
              discount += parseFloat(bundle.discount_amount) * bundle.qty;
            } else {
              for (let bundleQty = bundle.qty; bundleQty > 0; bundleQty--) {
                bundle.targets.forEach(function(target) {
                  let targetQty = parseInt(target.qty);

                  while (targetQty > 0) {
                    let
                        itemIndex = currentCartItems.findIndex(function(item) {
                          return item.product.id === parseInt(target.pid) && item.quantity > 0;
                        }),
                        qtyDiff = currentCartItems[itemIndex].quantity - targetQty;

                    if (qtyDiff < 0) {
                      discount += self.getItemPrice(currentCartItems[itemIndex]) * currentCartItems[itemIndex].quantity * parseFloat(bundle.discount_amount);
                      targetQty -= currentCartItems[itemIndex].quantity;
                      currentCartItems[itemIndex].quantity = 0;
                    } else {
                      discount += self.getItemPrice(currentCartItems[itemIndex]) * targetQty * parseFloat(bundle.discount_amount);
                      currentCartItems[itemIndex].quantity -= targetQty;
                      targetQty = 0;
                    }
                  }
                });
              }
            }
          });

          return discount;
        }

        this.getItemPrice = function(searchItem) {
          return cartGlobal.getItems().find(function(item) {
            return item.id === parseInt(searchItem.id);
          }).getVisiblePrice();
        }

        this.getHandles = function (items) {
          return items.map(function (item) {
            return item.product.handle;
          }).filter(function (handle, i, arr) {
            return arr.indexOf(handle) == i;
          });
        };

        // SET ADDED INFO
        this.setAddedInfo = function (items, cartBundles, bestBundles) {
          var tpmProducts = {};
          var bundles = {};
          items.forEach(item => {
            tpmProducts[item.product.id] = parseInt(item.quantity);
          });
          if (cartBundles.length > 0) {
            bestBundles.forEach((item, index) => {
              if(index !== 'discount') {
                bundles[item.id] = cartBundles.find(cartItem => cartItem.id === item.id);
                bundles[item.id].targets.forEach(currentItem => {
                  tpmProducts[currentItem.pid] -= item.qty;
                });
              }
            });
          }
          window.upsellBundles.addedItems.products = Object.keys(tpmProducts).filter(id => {
            return tpmProducts[id] > 0;
          });
          window.upsellBundles.addedItems.bundles = bundles;
        };
      };

      window.subApp = {};//public api
      if (app.getPageType() === 'product' && !Config.hasCustom('manualStart')) {
        new ProductApp(SUBParams.product);
      } else if (app.getPageType() === 'cart' && document.location.search.indexOf('sign=upsell-bundles') === -1) {
        new ProductApp(SUBParams.product);
        new CartCore(new CartPageAdapter(SUBParams.items));
      }
      subApp.run = function (product, params) {
        params = params || {};
        params.type = typeof params.type === 'undefined' ? 'product' : params.type;
        if (params.type === 'quickView') {
          new QuickViewApp(product, params);
        } else {
          new ProductApp(product, params);
        }
        return this;
      };
      subApp.quickView = function (product) {
        subApp.run(product, { type: 'quickView' });
      };
      subApp.setConfigValue = function (key, value) {
        Config.setValue(key, value);
        return this;
      };
      subApp.ajaxCart = function (params) {
        if (typeof this._ajaxCart === 'undefined') {
          this._ajaxCart = new CartCore(new AjaxCartAdapter(params));
        } else {
          this._ajaxCart.update();
        }
      };
      subApp.ajaxCartGeneric = function (adapter) {
        if (typeof this._ajaxCart === 'undefined') {
          this._ajaxCart = new CartCore(adapter);
        } else {
          this._ajaxCart.update();
        }
      };

      var integration = new JsGlobalIntegration(new CartPageAdapter(SUBParams.items));
      integration.setDiscounts();

      //selector picker
      if (document.location.search.indexOf('sign=upsell-bundles') !== -1) {
        loadScript('https://cdn-spurit.com/all-apps/selector-picker-4.x.js', function () {
          if (typeof (
            SUBParams.items
          ) !== 'undefined') {
            var getParams = window.location.search.replace('?', '').split('&').reduce(
              function (p, e) {
                var a = e.split('=');
                p[decodeURIComponent(a[0])] = decodeURIComponent(a[1]);
                return p;
              },
              {}
            );
            if (typeof (
              getParams.vid
            ) !== 'undefined' && !SUBParams.items.length) {
              Cart.post('/cart/clear.js?' + 'quantity=1&id=' + getParams.vid, {}, function () {
                Cart.post('/cart/add.js?' + 'quantity=1&id=' + getParams.vid, {}, function () {
                  document.location.reload();
                });
              });
            }
          }
        });
      }
    };

    if ((
      typeof (
        SUBCustom
      ) !== 'undefined' && typeof (
        SUBCustom.urlPrefix
      ) !== 'undefined'
    )) {
      Spurit.globalSnippet.urlPrefix = SUBCustom.urlPrefix;
    }

    var globalScriptPath = SUBParams.appFolder.indexOf('test') !== -1 ?
      'https://cdn-spurit.com/all-apps-testing/spurit.global-2.x.min.js' :
      'https://cdn-spurit.com/all-apps/spurit.global-2.x.min.js';
    loadScript(globalScriptPath, function () {
      Spurit.global.onReady(
        [
          'cart',
          'selectors',
          'checkout',
          'prices'
        ],
        function () {
          if (typeof jQuery === 'undefined') {
            loadScript('//ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js', function () {
              app.init(jQuery);
            });
          } else {
            app.init(jQuery);
          }
        }, {
          checkout: {
            hash: SUBParams.id,
            app_id: SUBParams.app_id,
            app_name: APP_NAME
          }
        }
      );
    });

  },
  0);