---
title: Tell it like it is, underrated HTTP status codes.
date: 2014-06-25 13:04 UTC
category: http
tags:
---

When you're looking at a HTTP response one of the most important pieces of information is the status code. It gives the client a clear indication of how the request was received and whether there is any further action required.

With HTTP 1.1 there are 5 groups of status codes.

* 1** Information
* 2** Success
* 3** Redirection
* 4** Client Error
* 5** Server Error

We all know about the run of the mill 200, 404 and 500 status codes but there are in fact plenty more.

Let's take a look at some of the more underused yet powerful status codes. Today we'll take a look at the success codes.

## 202 Accepted

202 status code is for when your request has been accepted by the service however it has not finished the process that was kicked off.

This is especially useful when talking to internal services with an SOA where you have placed something into a queue.

## 204 No Content

This is your when your server has heard you fine and well but it's just not going to give you an answer.

But when does it make sense for the request to be successful but no content to be returned? A classic example of this is when you delete a resource, the request is successful as the service has deleted the resource but it makes no sense to return the deleted resource in the response body.

## 206 Partial Content

Did you know that you can specify a range directly within the http header when making a request for resources? The 206 status code is for when you're only returning a range of results.

Ideal for use with paginated results.

## 200 != "Magic status code for all responses that don't blow up in an error"

There is wide variety of status codes for successful responses each of which give vital information to the client (both human and machine).

In the same way you wouldn't use a :-) emoticon to represent every emotion you shouldn't use 200 status code for all response that didn't blow up.

"Oh no you've failed your exams :-)"
