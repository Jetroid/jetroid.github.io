---
layout: post
title: "Woocommerce Discontinued Products"
date: 2019-12-12 09:44:58 +0000
summary: "...and other custom stock statuses."
categories:
 - "Tutorials"
 - "Wordpress"
---

**Whilst developing the new [Frequency Central website](https://frequencycentral.co.uk/), I found that we wanted to include a 'product lifecycle' to our WooCommerce products, distinct from the default stock handling that WooCommerce provides natively, as we wanted to distinguish out of stock products from discontinued products, and not yet released products from products that were on backorder. This is a quick guide that you can use to do that, intended for programmers or confident WooCommerce administrators.**

Frequency Central produces hardware products aimed at consumers. We often have technical documents that we want to keep online when we discontinue a product. I needed a way to keep pages online but prevent customers from purchasing them. This is what I came up with.

![Customers cannot buy this product, and are notified of a replacement product. Technical documents are still available.]({{ site.url }}/assets/images/content/lifecycle-fc.png)
*Customers cannot buy this product, and are notified of a replacement product. Technical documents are still available.*

I'll be walking you through step by step on what to do to achieve something similar. This guide intended for people comfortable with editing a themes' `functions.php` file.

Just want the code? [Skip to the TLDR](#bringing-it-all-together-tldr).

# Table of Contents
{: .no_toc}

- TOC
{:toc}

# Introduction

WooCommerce developers [seem reluctant to support features in this category,](https://github.com/woocommerce/woocommerce/pull/10080). but there are many reasons why you'd want to have a custom stock status / product lifecycle for your products.

* You don't want to delete the page for discontinued products, because you may have important technical documents that you want to keep available, and you don't want to damage your SEO or confuse your customers.
* You don't want to list a discontinued product as 'Out of Stock' as it gives a false impression that it may be available again one day. Instead you'd prefer to recommend an alternative replacement product line that may lead to a conversion.
* You want to be able to display forthcoming products to build a 'buzz' before they are released.

For this tutorial, I will be creating the following statuses:

* **Discontinued**, for products that we're not selling anymore and don't intend to. We'll include an (optional) 'Replaced By' field where we can list 'successor' products that the customer might be interested in instead.

* **For Sale**, for all products that we are actively selling.

* **Forthcoming**, for products that aren't for sale yet but will be available soon. We'll also include an (optional) date field we can use to automatically convert the product to 'For Sale' on a specific date/time.

# Create the fields

I'm using [Advanced Custom Fields](https://www.advancedcustomfields.com/) for this tutorial, as it's a superb plugin that does a lot of the heavy lifting for us. Not sponsored, it's just my favourite wordpress plugin!

I've exported my configuration [here](/assets/product-lifestyle-acf.json) for you to use. You can import this directly with Advanced Custom Fields. From the Wordpress Admin area, go to Custom Fields > Tools > Import Field Groups and select the file.

You should then be able to edit any product and see a menu like this:

![Advanced Custom Fields Menu where Produce Lifecycle is selectable]({{ site.url }}/assets/images/content/lifecycle-acf-menu.png)


<hr />

In case the import functionality stops working at some point in the future, here is a brief summary of the fields needed:

* <small>A radio button field with the name 'product_status', that returns the Value. Has the following values:</small>

```
forsale : For Sale
discontinued : Discontinued
forthcoming : Forthcoming
```

* <small>A 'Post Object' field with the name 'replaced_with', (filtered by 'Product' post type), that allows you to select multiple values, and returns the Post ID. This field has the conditional logic that it should only show when 'product_status' has the value of 'Discontinued'.</small>

* <small>A 'Date Time Picker' field with the name 'available_from', with the custom return format `F j, Y`. The field has the conditional logic that it should only show when 'product_status' has the value of 'Forthcoming'.</small>


<hr />

# Functions.php

For the rest of the tutorial, we will be editing your theme's `functions.php` file. If you're using a theme designed by someone else, [ensure you're working with a child theme first](https://docs.woocommerce.com/document/set-up-and-use-a-child-theme/). Always backup your `functions.php` file before changing anything, and only edit it if you feel confident that you know what you are doing, as it is a very important file that can break your whole website if mistreated.

# Helper Functions

First, we'll create three helper functions that we can use to make sense of the data returned from Advanced Custom Fields. These functions will allow us to check if a product is released (`For Sale` and `Forthcoming [after release date]`), `Discontinued`, or `Forthcoming [before release date]`. These functions are fairly simple and should be easy to understand.

```php
function is_released($id) {
	$status = get_field('product_status', $id);

	// We consider null to mean for sale too,
	// as products where we haven't made a selection yet will have a null status
	if (is_null($status) || $status === "forsale") {
		return True;
	} else if ($status === "forthcoming") {
		/* A product can also be released if it was forthcoming
		with an 'available from' date that has already happened */
		$release_date = strtotime(get_field('available_from', $id));

		// For a 'forthcoming' to actually be released,
		// it must have a release date, and that release date has already happened.
		return $release_date && time() > $release_date;
	}
	return False;
}

function is_forthcoming($id) {
	$status = get_field('product_status', $id);
	if ($status === "forthcoming") {
		$release_date = strtotime(get_field('available_from', $id));

		// To be forthcoming, either no release date was set, or the date has not happened yet.
		return !$release_date || time() < $release_date;
	}
	return False;
}

function is_discontinued($id) {
	$status = get_field('product_status', $id);
	return $status === "discontinued";
}
```

# Preventing Purchase

Next, we want to prevent customers from purchasing products that aren't available. We'll be hiding the actual buy buttons later, but it's important to do this too because it will remove the discontinued products from the cart, and prevent purchase by going to specific links (rather than through our interface).

WooCommerce provides two filters, [woocommerce_is_purchasable](http://hookr.io/filters/woocommerce_is_purchasable/) and [woocommerce_variation_is_purchasable](http://hookr.io/filters/woocommerce_variation_is_purchasable/), that thankfully does everything we need here. If we return `False` in these functions, the product cannot be purchased and is automatically removed from customer carts where appropriate.

Thanks to our helper functions, calling these filters is incredibly straightforward:

```php
/* Prevent purchase of products that are not considered released */
add_filter('woocommerce_is_purchasable', 'lifecycle_woocommerce_is_purchasable', 10, 2);
function lifecycle_woocommerce_is_purchasable($is_purchasable, $product) {
	return $is_purchasable && is_released($product->get_id());
}

add_filter('woocommerce_variation_is_purchasable', 'lifecycle_woocommerce_variation_is_purchasable', 10, 2);
function lifecycle_woocommerce_variation_is_purchasable($is_purchasable, $product) {
	# ACF information for variation products is in the base (parent) product.
	return $is_purchasable && is_released($product->get_parent_id());
}
```

Once done, trying to add the discontinued products to the cart has this effect:

![Discontinued and forthcoming products can no longer be purchased.]({{ site.url }}/assets/images/content/lifecycle-unavailable.png)
*Discontinued and forthcoming products can no longer be purchased.*

This change also has the effect of changing the appearance of the buttons on the archive page of the site. (Shown here is the 'Twenty Twenty' theme, which just has a 'Select Options' button for variable products. It's likely that will have to edit the archive template for your theme, but I won't - and can't - cover that. I'd look into overriding the [woocommerce_after_shop_loop_item](http://hookr.io/actions/woocommerce_after_shop_loop_item/) action in the same way I override `woocommerce_single_product_summary` in the next section.)

![The product archive list also changes.]({{ site.url }}/assets/images/content/lifecycle-readmore.png)
*The product archive list also changes.*

# Notifying Customers

Finally, we want to let the customer know that a given product is forthcoming or has been discontinued, and tell them when forthcoming products will be available, and which products replace discontinued products.

We'll display this as a simple span on the 'single product' page, like this:

![Discontinued product notification.]({{ site.url }}/assets/images/content/lifecycle-discontinued.png)
*Discontinued product notification.*

![Forthcoming product notification.]({{ site.url }}/assets/images/content/lifecycle-forthcoming.png)
*Forthcoming product notification.*

```
/* Remove the add to cart buttons... We add it back later when needed */
remove_action( 'woocommerce_single_product_summary', 'woocommerce_template_single_add_to_cart', 30 );

/* Replace the add to cart buttons with our custom text */
add_filter( 'woocommerce_single_product_summary', 'lifecycle_single_add_to_cart', 30 );
/* Helper functions to generate the discontinued replacement products list: */
function id_to_link($product_id){
    $product = wc_get_product( $product_id );
    return '<a href="'. get_permalink( $product_id ) .'">' . $product->get_title() . '</a>';
}
function lifecycle_single_add_to_cart() {
	global $product;
	$id = $product->get_id();
	$status = get_field('product_status', $id);

	if ( is_released($id) ) {
		/* Product is released, so use the default add to cart buttons */
		woocommerce_template_single_add_to_cart();
	} else if ( is_discontinued($id) ) {

		// Replaced with is an array containing the ids of replacement products
		$replaced_with = get_field('replaced_with', $id);
	    if($replaced_with) {

	        // Turn the array of id's of replacement products into an array of links
	        $titles_as_links = array_map(function ($product_id) {return id_to_link($product_id);}, $replaced_with);

	        // We want to join the array to follow the rules of sentences, like this:
	        // item 1, item 2, and item 3
	        // ... rather than just item 1, item 2, item 3, like regular implode would.
	        if ( count($titles_as_links) < 3 ) {
	        	$sentence = implode (" and ", $titles_as_links);
	        } else {
	        	$last = array_pop($titles_as_links);
	        	$sentence = implode(", ", $titles_as_links);
	        	$sentence .= ", and " . $last;
	        }

	        // Echo it
	        echo '<span class="discontinued">This product has been discontinued. It has been replaced by ' . $sentence . '.</span>';
	    } else {
	        echo '<span class="discontinued">This product has been discontinued.</span>';
	    }
	} else {
		// Product is forthcoming
		// Release date here depends on ACF return value for available_from being set
		// appropriately to display nicely.
		$release_date = get_field('available_from', $id);
		if ($release_date !== "") {
			echo '<span class="forthcoming">This product is forthcoming and will be available from ' . $release_date . '</span>';
		} else {
			echo '<span class="forthcoming">This product is forthcoming and will be available soon!</span>';
		}
	}
}
```

<hr />


This code is complicated, so I'll do my best to break it down step by step below to explain what I'm doing. **If you don't care about how it works, the above code is all you need and the tutorial is over.**

First, we want to stop showing the add to cart buttons, and replace it with a call to our own function that just displays them instead. We'll add the add to cart buttons back later if it turns out the product is released. Effectively, the snippet of code below has no effect.

```php
remove_action( 'woocommerce_single_product_summary', 'woocommerce_template_single_add_to_cart', 30 );
add_filter( 'woocommerce_single_product_summary', 'lifecycle_single_add_to_cart', 30 );
function lifecycle_single_add_to_cart() {
	woocommerce_template_single_add_to_cart();
}
```

<hr />

Now instead of simply showing the add the cart buttons all the time, we only want to show them if the product is released. This piece of code essentially just removes the add to cart buttons when the product is not released, and replaces it with a simple `span` that says if the product is forthcoming or discontinued.

```
remove_action( 'woocommerce_single_product_summary', 'woocommerce_template_single_add_to_cart', 30 );
add_filter( 'woocommerce_single_product_summary', 'lifecycle_single_add_to_cart', 30 );
/* Helper functions to generate the discontinued replacement products list: */
function id_to_link($product_id){
    $product = wc_get_product( $product_id );
    return '<a href="'. get_permalink( $product_id ) .'">' . $product->get_title() . '</a>';
}
function lifecycle_single_add_to_cart() {
	global $product;
	$id = $product->get_id();
	$status = get_field('product_status', $id);

	if ( is_released($id) ) {
		/* Product is released, so use the default add to cart buttons */
		woocommerce_template_single_add_to_cart();
	} else if ( is_discontinued($id) ) {
	    echo '<span class="discontinued">This product has been discontinued.</span>';
	} else {
		echo '<span class="forthcoming">This product is forthcoming and will be available soon!</span>';
	}
}
```

<hr />

Finally, we add the code to add information like "This product has been replaced by Product X, Product Y, and Product Z", and "This product will be available on January 1st, 2020".

```php
remove_action( 'woocommerce_single_product_summary', 'woocommerce_template_single_add_to_cart', 30 );
add_filter( 'woocommerce_single_product_summary', 'lifecycle_single_add_to_cart', 30 );
/* Helper functions to generate the discontinued replacement products list: */
function id_to_link($product_id){
    $product = wc_get_product( $product_id );
    return '<a href="'. get_permalink( $product_id ) .'">' . $product->get_title() . '</a>';
}
function lifecycle_single_add_to_cart() {
	global $product;
	$id = $product->get_id();
	$status = get_field('product_status', $id);

	if ( is_released($id) ) {
		/* Product is released, so use the default add to cart buttons */
		woocommerce_template_single_add_to_cart();
	} else if ( is_discontinued($id) ) {

		// Replaced with is an array containing the ids of replacement products
		$replaced_with = get_field('replaced_with', $id);
	    if($replaced_with) {

	        // Turn the array of id's of replacement products into an array of links
	        $titles_as_links = array_map(function ($product_id) {return id_to_link($product_id);}, $replaced_with);

	        // We want to join the array to follow the rules of sentences, like this:
	        // item 1, item 2, and item 3
	        // ... rather than just item 1, item 2, item 3, like regular implode would.
	        if ( count($titles_as_links) < 3 ) {
	        	$sentence = implode (" and ", $titles_as_links);
	        } else {
	        	$last = array_pop($titles_as_links);
	        	$sentence = implode(", ", $titles_as_links);
	        	$sentence .= ", and " . $last;
	        }

	        // Echo it
	        echo '<span class="discontinued">This product has been discontinued. It has been replaced by ' . $sentence . '.</span>';
	    } else {
	        echo '<span class="discontinued">This product has been discontinued.</span>';
	    }
	} else {
		// Product is forthcoming
		// Release date here depends on ACF return value for available_from being set
		// appropriately to display nicely.
		$release_date = get_field('available_from', $id);
		if ($release_date !== "") {
			echo '<span class="forthcoming">This product is forthcoming and will be available from ' . $release_date . '</span>';
		} else {
			echo '<span class="forthcoming">This product is forthcoming and will be available soon!</span>';
		}
	}
}
```

...and we're back to where we were! And with this, we're done.

# Bringing it all together (TL:DR)

AKA, this is the "Too Long, Didn't Read section". I always skip to this section. :upside_down_face:

The full code for your `functions.php` file is [here](https://gist.github.com/Jetroid/ff0c7936a80bb006ba009a7c2ec9e83d) (and below), and the [Advanced Custom Fields](https://www.advancedcustomfields.com/) import data is [here](/assets/product-lifestyle-acf.json).

Full code follows:

```php
function is_released($id) {
	$status = get_field('product_status', $id);

	// We consider null to be for sale, as this indicates an old product
	// where we haven't made a selection yet
	if (is_null($status) || $status === "forsale") {
		return True;
	} else if ($status === "forthcoming") {
		/* A product can also be released if it was forthcoming
		with an 'available from' date that has passed */
		$release_date = strtotime(get_field('available_from', $id));
		// Check that a release date was set, and that the date has passed.
		return $release_date && time() > $release_date;
	}
	return False;
}
function is_forthcoming($id) {
	$status = get_field('product_status', $id);
	if ($status === "forthcoming") {
		$release_date = strtotime(get_field('available_from', $id));
		// Either no release date was set, or the date has not passed.
		return !$release_date || time() < $release_date;
	}
	return False;
}
function is_discontinued($id) {
	$status = get_field('product_status', $id);
	return $status === "discontinued";
}

/* Prevent purchase of products that have not been released */
add_filter('woocommerce_is_purchasable', 'lifecycle_woocommerce_is_purchasable', 10, 2);
function lifecycle_woocommerce_is_purchasable($is_purchasable, $product) {
	return $is_purchasable && is_released($product->get_id());
}

add_filter('woocommerce_variation_is_purchasable', 'lifecycle_woocommerce_variation_is_purchasable', 10, 2);
function lifecycle_woocommerce_variation_is_purchasable($is_purchasable, $product) {
	return $is_purchasable && is_released($product->get_parent_id());
}

/* Remove the add to cart buttons... We add it back later when needed */
remove_action( 'woocommerce_single_product_summary', 'woocommerce_template_single_add_to_cart', 30 );

/* Replace the add to cart buttons with our custom text */
add_filter( 'woocommerce_single_product_summary', 'lifecycle_single_add_to_cart', 30 );
/* Helper functions to generate the discontinued replacement products list: */
function id_to_link($product_id){
    $product = wc_get_product( $product_id );
    return '<a href="'. get_permalink( $product_id ) .'">' . $product->get_title() . '</a>';
}
function lifecycle_single_add_to_cart() {
	global $product;
	$id = $product->get_id();
	$status = get_field('product_status', $id);

	if ( is_released($id) ) {
		/* Product is released, so use the default add to cart buttons */
		woocommerce_template_single_add_to_cart();
	} else if ( is_discontinued($id) ) {

		// Replaced with is an array containing the ids of replacement products
		$replaced_with = get_field('replaced_with', $id);
	    if($replaced_with) {

	        // Turn the array of id's of replacement products into an array of links
	        $titles_as_links = array_map(function ($product_id) {return id_to_link($product_id);}, $replaced_with);

	        // We want to join the array to follow the rules of sentences, like this:
	        // item 1, item 2, and item 3
	        // ... rather than just item 1, item 2, item 3, like regular implode would.
	        if ( count($titles_as_links) < 3 ) {
	        	$sentence = implode (" and ", $titles_as_links);
	        } else {
	        	$last = array_pop($titles_as_links);
	        	$sentence = implode(", ", $titles_as_links);
	        	$sentence .= ", and " . $last;
	        }

	        // Echo it
	        echo '<span class="discontinued">This product has been discontinued. It has been replaced by ' . $sentence . '.</span>';
	    } else {
	        echo '<span class="discontinued">This product has been discontinued.</span>';
	    }
	} else {
		// Product is forthcoming
		// Release date here depends on ACF return value for available_from being set
		// appropriately to display nicely.
		$release_date = get_field('available_from', $id);
		if ($release_date !== "") {
			echo '<span class="forthcoming">This product is forthcoming and will be available from ' . $release_date . '</span>';
		} else {
			echo '<span class="forthcoming">This product is forthcoming and will be available soon!</span>';
		}
	}
}
```

