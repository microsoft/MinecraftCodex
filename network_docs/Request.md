---
# DO NOT TOUCH — This file was automatically generated. See https://github.com/Mojang/MinecraftScriptingApiDocsGenerator to modify descriptions, examples, etc.
author: jakeshirley
ms.author: jashir
ms.prod: gaming
title: mojang-net.Request Class
description: Contents of the mojang-net.Request class.
---
# Request Class
>[!IMPORTANT]
>These APIs are experimental as part of GameTest Framework. As with all experiments, you may see changes in functionality in updated Minecraft versions. Check the Minecraft Changelog for details on any changes to GameTest Framework APIs. Where possible, this documentation reflects the latest updates to APIs in Minecraft beta versions.

Main object for structuring a request.

## Properties
### **body**
`body: any | string;`

Content of the body of the HTTP request.

Type: *any* | *string*


### **headers**
`headers: Header[];`

A collection of HTTP headers to add to the outbound request.

Type: [*Header*](Header.md)[]


### **method**
`method: RequestMethod;`

HTTP method (e.g., GET or PUT or PATCH) to use for making the request.

Type: [*RequestMethod*](RequestMethod.md)


### **timeout**
`timeout: number;`

Amount of time, in milliseconds, before the request times out and is abandoned.

Type: *number*


### **uri**
`uri: string;`

The HTTP resource to access.

Type: *string*



## Methods
- [constructor](#constructor)
  
### **constructor**
`
new Request(headers: Header[], uri: string, body: any | string, timeout: number, method: RequestMethod)
`

#### **Parameters**
- **headers**: [*Header*](Header.md)[]
- **uri**: *string*
- **body**: *any* | *string*
- **timeout**: *number*
- **method**: [*RequestMethod*](RequestMethod.md)

#### **Returns** [*Request*](Request.md)


