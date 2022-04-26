---
# DO NOT TOUCH — This file was automatically generated. See https://github.com/Mojang/MinecraftScriptingApiDocsGenerator to modify descriptions, examples, etc.
author: jakeshirley
ms.author: jashir
ms.prod: gaming
title: mojang-net.Response Class
description: Contents of the mojang-net.Response class.
---
# Response Class
>[!IMPORTANT]
>These APIs are experimental as part of GameTest Framework. As with all experiments, you may see changes in functionality in updated Minecraft versions. Check the Minecraft Changelog for details on any changes to GameTest Framework APIs. Where possible, this documentation reflects the latest updates to APIs in Minecraft beta versions.

Main object that contains result information from a request.

## Properties
### **body**
`read-only body: any | string;`

Body content of the HTTP response.

Type: *any* | *string*


### **headers**
`read-only headers: Header[];`

A collection of HTTP response headers returned from the request.

Type: [*Header*](Header.md)[]


### **request**
`read-only request: Request;`

Information that was used to formulate the HTTP response that this object represents.

Type: [*Request*](Request.md)


### **status**
`read-only status: number;`

HTTP response code for the request. For example, 404 represents resource not found, and 500 represents an internal server error.

Type: *number*


