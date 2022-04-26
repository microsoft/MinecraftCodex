---
# DO NOT TOUCH — This file was automatically generated. See https://github.com/Mojang/MinecraftScriptingApiDocsGenerator to modify descriptions, examples, etc.
author: jakeshirley
ms.author: jashir
ms.prod: gaming
title: mojang-net.Header Class
description: Contents of the mojang-net.Header class.
---
# Header Class
>[!IMPORTANT]
>These APIs are experimental as part of GameTest Framework. As with all experiments, you may see changes in functionality in updated Minecraft versions. Check the Minecraft Changelog for details on any changes to GameTest Framework APIs. Where possible, this documentation reflects the latest updates to APIs in Minecraft beta versions.

Represents an HTTP header - a key/value pair of meta-information about a request.

## Properties
### **key**
`key: string;`

Key of the HTTP header.

Type: *string*


### **value**
`value: string;`

Value of the HTTP header.

Type: *string*



## Methods
- [constructor](#constructor)
  
### **constructor**
`
new Header(key: string, value: string)
`

#### **Parameters**
- **key**: *string*
- **value**: *string*

#### **Returns** [*Header*](Header.md)


