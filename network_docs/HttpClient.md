---
# DO NOT TOUCH — This file was automatically generated. See https://github.com/Mojang/MinecraftScriptingApiDocsGenerator to modify descriptions, examples, etc.
author: jakeshirley
ms.author: jashir
ms.prod: gaming
title: mojang-net.HttpClient Class
description: Contents of the mojang-net.HttpClient class.
---
# HttpClient Class
>[!IMPORTANT]
>These APIs are experimental as part of GameTest Framework. As with all experiments, you may see changes in functionality in updated Minecraft versions. Check the Minecraft Changelog for details on any changes to GameTest Framework APIs. Where possible, this documentation reflects the latest updates to APIs in Minecraft beta versions.

## Methods
- [cancelAll](#cancelall)
- [get](#get)
- [request](#request)
- [testOnly_fulfilRequest](#testonly_fulfilrequest)
- [testOnly_getRequests](#testonly_getrequests)
- [testOnly_rejectRequest](#testonly_rejectrequest)
  
### **cancelAll**
`
cancelAll(reason: string): void
`

Cancels all pending requests.
#### **Parameters**
- **reason**: *string*



### **get**
`
get(uri: string): Promise<Response>
`

Performs a simple HTTP get request.
#### **Parameters**
- **uri**: *string*
  
  URL to make an HTTP Request to.

#### **Returns** Promise&lt;[*Response*](Response.md)&gt; - An awaitable promise that contains the HTTP response.


### **request**
`
request(config: Request): Promise<Response>
`

Performs an HTTP request.
#### **Parameters**
- **config**: [*Request*](Request.md)
  
  Contains an HTTP Request object with configuration data on the HTTP request.

#### **Returns** Promise&lt;[*Response*](Response.md)&gt; - An awaitable promise that contains the HTTP response.


### **testOnly_fulfilRequest**
`
testOnly_fulfilRequest(requestId: number, headers: Header[], body: any | string, status: number): void
`

#### **Parameters**
- **requestId**: *number*
- **headers**: [*Header*](Header.md)[]
- **body**: *any* | *string*
- **status**: *number*



### **testOnly_getRequests**
`
testOnly_getRequests(): number[]
`


#### **Returns** *number*[]


### **testOnly_rejectRequest**
`
testOnly_rejectRequest(requestId: number, reason: string): void
`

#### **Parameters**
- **requestId**: *number*
- **reason**: *string*



