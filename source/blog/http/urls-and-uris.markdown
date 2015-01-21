---
title: URLs and URIs
date: 2014-07-03 18:05 BST
category: http
header_img: http://placehold.it/1280x215
large_img: http://placehold.it/430x215
thumb_img: http://placehold.it/100x50
tags:
---

When understanding HTTP where better to start than the Universal Resource Identifier (URI).

A URI is used to identify a resource, it can be used by many different schemes of which HTTP is just one. 

## Wait, what's the difference between a URI and URL?

You'll often see the terms URI and URL banded around and they often appear to be used interchangeably, so what is the difference?

To clear things up let's look at what the IETF RFC3986 has to say :

> The term "Uniform Resource Locator" (URL) refers to the subset of URIs that, in addition to identifying a resource, provide a means of locating the resource by describing its primary access mechanism (e.g., its network "location").

In short a URL (Universal Resource Location) is a type of URI. Under the RFC3986 a URI could be either a URL or a URN (Universal Resource Name). 

As HTTP is an access mechanism for retrieving the resource over a network the URI will also always be a URL.

## Makeup of a URI

The syntax of a URI is scheme-specific however there is a general syntax defined which us used by HTTP.

The HTTP URI syntax specifies that a URI is made up of the following components:

**scheme**://**authority**/**path**?**query**#**fragment**

We'll explain what all those mean by looking a the following URL from the Stripe API: **https://api.stripe.com/v1/customers/cus_4LDY1Dv7HLNIGy**

**scheme** : The scheme/protocol to access the resource (https).
**authority** : Within the HTTP scheme, the authority shows who is responsible for defining the remainder of the URI (api.stripe.com).
**path** : Internal hierarchy location of the resource, defined by the authority (/v1/customers/cus_4LDY1Dv7HLNIGy).
query. Data to be passed to the server.
fragment. 

## Authority

In HTTP the authority tells you where on the network you can access the resource. It is made up of a number of components itself :

[ **userinfo** "@"] **host** [":" **port**]

**userinfo** : Optional details to identify the user. Used in basic authentication. If not used then the ampersand is omitted.
**host** : The server host, this can be either a domain name or an IP address. 
**port** : Optional port number, if port is not used then you don't include the colon.

## Http as a scheme doesn't mean we only use http as the protocol.

Take the URI https://api.stripe.com/v1/customers/cus_4LDY1Dv7HLNIGy , we know what the scheme is https and the host is api.stripe.com. With this information we should simply access the resource on the http protocol, right?

Actually probably not, you see URIs are primarily for identification and while most of the URI schemes are named after protocols, this doesn't mean that use of these URIs will result in access to the resource via the named protocol.

The access to a resource identified in a URI might be through gateways, proxies and domain name resolution services that are separate to the protocol associated to the scheme. In the above example if a user doesn't have api.stripe.com in their local cache then they might needs to use the DNS protocol as well as HTTP. 

So remember the resolution of some URIs may require the use of more than one protocol.

RFC6570 - IETF
