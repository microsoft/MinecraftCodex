# Codex for Minecraft NPCs

This prototype uses GPT-3 Codex to power a Non-Player Character (NPC) in Minecraft. Through the discipline of "prompt engineering" (see section below), we show the model how to use the Minecraft SimulatedPlayer API to write code to navigate the world, mine, craft and even carry on conversation.

![Minecraft Codex gif](minecraft-codex.gif)

## Requirements

Please read the readme carefully to make sure you get the right bits. This repo works with very specific versions of Minecraft, Minecraft dedicated server, and Node, and requires setup commands to be called in specific order.

- An [OpenAI account](https://openai.com/api/)

  - [OpenAI API Key](https://beta.openai.com/account/api-keys).
  - [OpenAI Organization Id](https://beta.openai.com/account/org-settings). If you have multiple organizations, please update your [default organization](https://beta.openai.com/account/api-keys) to the one that has access to codex models before getting the organization Id.
  - [OpenAI Model Id](https://beta.openai.com/docs/models/codex-series-private-beta). The name of the Codex model you're using. This repository was primarily tested using `code-davinci-002`. See [here](#what-openai-models-are-available-to-me) for checking available models.

- You need to be an owner of Minecraft, or have PC GamePass, in order to use Minecraft or Minecraft Preview.
  - This sample uses a separate Dedicated Server and a Minecraft client app. For more information on Minecraft Bedrock Edition, Dedicated Server and how you can use scripting with them, see [this article](https://docs.microsoft.com/minecraft/creator/documents/scriptingservers).
  - This build uses the latest Minecraft version (version 1.19.0 or higher). You will need a version of Minecraft Dedicated Server, downloadable from https://www.minecraft.net/en-us/download/server/bedrock, and Minecraft client version 1.19.0 or higher, which the below links will help you to gather.
  - Note that Minecraft has both main and "Preview" versions of Minecraft: Bedrock Edition. You can now use the main Minecraft editions to use this sample; you no longer need to use the Minecraft Preview app with this sample in particular.
  - You can access Minecraft from the MS Store here to make sure you have access: `https://www.microsoft.com/store/productId/9PGW18NPBZV5`
  - Download the Xbox app from Microsoft Store, and sign in with your consumer MSA account (same thing as your Xbox account if you have one) `https://www.microsoft.com/store/productId/9MV0B5HZVK9Z`
  - Open the Xbox App to install Minecraft `(https://www.microsoft.com/store/productId/9P5X4QVLC2XR)`.
    - LTS 16.15 version of [Node.JS]`(https://nodejs.org/en/)`
    - [Visual Studio Code](https://code.visualstudio.com/)
    - OPTIONAL: Clear chat texture pack to make it easier to see the bot actions without the dim screen of chat. Download from here and follow install directions: `https://mcpedl.com/clear-chat-tranparent-chat/`

## Setup

1. Clone the repo wherever you like: `git clone https://github.com/microsoft/MinecraftCodex.git`. The project is setup to work with your local Minecraft install.
1. Open the folder you placed the repo in locally in VSCode
1. You will get a recommendations to install Minecraft extensions to enable debugging, you want to accept those
1. Open Terminal in VSCode in the code directory, and run `npm install` to pull down the package dependencies.
1. Under the scripts folder, create a file called `vars.ts` with the following key value pairs:
   ```
   export let OPENAI_API_KEY = "<YOUR_KEY_HERE>";
   export let OPENAI_ORGANIZATION_ID = "<YOUR_ORG_ID_HERE>";
   export let OPENAI_MODEL_ID = "<YOUR_CODEX_MODEL_NAME_HERE>";
   export let DEBUG = false;
   ```
1. Place your OpenAI API key between the quotes, and save the file.

## Install Minecraft Bedrock Edition Dedicated Server

1. Download and unzip the Minecraft Bedrock Dedicated Server to a location on your hard drive.
1. In the Minecraft Codex code directory, open `gulpfile.js` and update the `dedicatedServerPath` variable to the folder where your dedicated server is located. Note: it must end with a '\\' character
1. You will likely need to disable PowerShell signing requirements for the session. In the VSCode Terminal type: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` You will need to do this every time you open a new terminal, or restart VSCode. It only works on the current process, so nowhere else should this take effect.
1. Run these three commandsin the VSCode terminal, which should be in the repo folder.
   `gulp updateconfig`
   `gulp updateserver`
   `gulp updateworld`
1. Those commands will:

   - Add additional configuration files that enable this module to make net requests on Dedicated Server.
   - Update server configuration properties (`server.properties`)
   - Reset the Minecraft Dedicated Server to the default world for the Codex World.

1. The first time you run Bedrock Dedicated Server, you may see a prompt within Windows to enable ports on your firewall for public and/or private networks.
   Within the pop up Firewall prompt in Windows that you may receive, you will want to potentially enable Bedrock Server port access on your Private networks.
   Alternately, ensure at least ports 19132 and 19133 are open to Bedrock Dedicated Server via your Firewall tools.
1. Ensure that local Minecraft local clients can connect to your locally-hosted server - to do this, you need to enable 'loopback' connections for Minecraft UWP.

   To enable loopback for Minecraft on Windows, run:

   ```dotnetcli
   npm run enablemcloopback
   ```

   To enable loopback for Minecraft Preview on Windows, run:

   ```dotnetcli
   npm run enablemcpreviewloopback
   ```

1. To run the game server with proper configs and defaults, you need to use `gulp serve` from your code directory, typically from the VSCode terminal.
1. Run the dedicated server from it's directory once to get it up and running. After it has completed loading (you will see the message "Debugger Listening" on the console), type in the following command to ensure you have full access to controls in game.
   `op <your username>`

## Building and Deploying

1. To have it continuously re-build as you make changes, run `gulp watch`. This will stop the server and restart it with your latest code regularly.
1. The deployment step automatically moves the compiled code to a Minecraft Behavior Pack folder within your Dedicated Server.

## Connecting to the Dedicated Server

1. Open your Minecraft client and click Play. Select "Servers".
   The first time you play, you will need to add a server:
1. Scroll all the way down on the left side to and select Add Server
1. Type a name for the server ("local") and use a Server Address of 127.0.0.1 if you are running Dedicated Server on the same machine.
1. Select the server, and select Join Server.

1. Open the chat (click 't') and type `/gametest run codex:codex` to spawn the Non-Player Character, along with a test structure from the BehaviorPack. When loading your world in the future, you can push the button on the command block that appears in the test structure to start the codex code running

## Debugging

Use the following steps to debug:

1. Make sure you have the Minecraft Bedrock Edition Debugger installed within Visual Studio Code, or this won't work properly, make sure it is version 0.2.0 or later
2. Running `gulp serve` in your code folder will start the server running, and then you can run the debugger from VSCode which will automatically connect to the server.
3. You can set breakpoints in the TypeScript files directly. NOTE: The code in CodexBot is not hitting breakpoints correctly, this is a known error and being looked at.

## Interacting with the NPC

Now that you've spawned the NPC into the game, you can have a multi-turn conversation with it!

1. Click 't' to open the chat and send messages to the NPC. If you interact conversationally (e.g. "What are you up to?" or "What's the meaning of life?), the NPC should respond with natural language. If given a command (e.g. "look at me", "move forward a bit", etc.) the NPC should respond with code and evaluate it.
1. The NPC is able to carry-on multi-turn conversations, carrying context across conversation turns. Example:

```
Player: What's your favorite Minecraft resource'
NPC: bot.chat("I love oak logs!")
Player: "Why's that?
NPC: bot.chat("Because they're so versatile!")
```

**Note**: The NPC isn't perfect, and sometimes the conversation can get stuck or begin repeating itself. Type "reset" to reset the conversational experience.

## How it Works - Prompt Engineering

The Codex model being used in this sample has never seen the SimulatedPlayer API we're asking it to use (it's a new API that wasn't in its training set). In order to get the model to use the SimulatedPlayer API, we need to engineer prompts that give the model examples of the kinds of commands it will receive and the kind of code it should write. From just a few Natual Language to Code examples, we can use the model to generate new code from new commands.

We coax the correct code and natural language out of Codex through a discipline called prompt engineering. Large Language Models like GPT-3 and Codex are trained to guess the next word in a sentence, or more generally, the next token in a sequence. They can do this continuously to genereate whole sentences, paragraphs, lines of code and functions. To coax very specific code out of the models, it's best to give prompts that convey our intent and give examples of what we're looking for.

Please note: The NPC capabilities are limited to abilities in the capabilities of the SimulatedPlayer API, along with some extra capabilities we gave it. It can walk, chat with you, walk around, look at you, follow you, mine blocks, and craft items (etc.) It can't currently use visual cues about the world around it or handle capabilities outside of the API spec. You can code new behaviors yourself and alter the prompts to enable the bot to do what you would like, and we encourage you to do so!

In the `codexPrompt` folder, you'll find the prompts used to give the model examples. You'll notice that the prompts have some general context, and are modelled as a series of comments (natural language) and code:

```js
//Minecraft bot commands, using the SimulatedPlayer library. When the comment is conversational, the bot will respond as a helpful minecraft bot. Otherwise, it will do as asked.

// Look at me
bot.lookAtEntity();

// Do that continuously
state.lookingInterval = setInterval(bot.lookAtEntity, 50);

// Stop!
state.clearInterval(state.lookingInterval);

// What's your name?
bot.chat("My name is " + bot.username);
```

These interactions serve as examples to the model of what the SimulatedPlayer API looks like, and also to suggest the kind of code that Codex should write. When a player calls the model with another command (e.g. "How are you?"), we append that command onto the prompt as another comment, and ask the model to generate the next chunk of code:

```js
... examples
// What's your name?
bot.chat("My name is " + bot.username);

// How are you?
```

Given the examples above, it will correctly guess that the code it writes should use the `bot.chat` API, to answer something like `bot.chat("I'm doing just fine!")`.

As interactions (NL -> Code) continue, we continue appending them onto the prompt to maintain context on future turns. This allows Codex to resolve pronouns and understand past context when asked to do something new (e.g. know that "that" is looking at a player when they say "stop doing that").

## How it Works - Evaluating Code

Prompt engineering allows Codex to frequently produce novel code - the next step is to run that code. This is done by evaluating it. In languages like Python and JavaScript (which don't require code to be compiled), it's possible to directly evaluate a string of code using an eval function (e.g. `eval(codeString)`). Somewhat counterintuitively, the code evaluation in this sample isn't happening from the bot's side, but rather from the game - see the `evaluateCode` function in `scripts/CodexGame` to see how we use `eval` to evaluate the code we get back from the model.

## How it Works - API Design

This sample gives Codex the prompts to use the [SimulatedPlayer API](https://docs.microsoft.com/en-us/minecraft/creator/scriptapi/mojang-gametest/simulatedplayer) and our extensions of the API when it generates code. Our extensions of the API give Codex several more capabilities to enable the NPC to handle more behaviors. We did this to enable higher-level code generation, giving the NPC the primitives it needs to accomplish more complex behaviors. As an example, you wouldn't want a model to use primitive movement functions (move left, move right, etc.) to navigate from point A to point B - this might require the model to write hundreds of lines of code. Instead, you may consider authoring a function that abstracts this kind of navigation away (e.g. `bot.extendedNavTo(position)`) that the model can then invoke.

Also important in designing an API is having consistent naming conventions and limiting the namespaces in which the model is expected to write code. Like a developer, the model will more effectively used a well-abstacted, consistently named API. We have added our own APIs as fronts to SimulatedPlayer in order to enable this consistency.

## Extending NPC Capabilities

You can extend the abilities of this NPC by building your own prompts, adding more examples of the kinds of code you expect the model to write. If you want to implement entirely new behaviors (e.g. attacking mobs), you may need to extend the API with new functions (e.g. a function called `attackEntity(entity)`).

## A Note on Fine Tuning

This example shows how we can enable Codex to generate a specific API's code by example, through prompt engineering. Prompt engineering is often a good place to start when assessing a Large Language Model's ability to generate language and code. Prompt engineering has limits though - prompts can only be so large, model performance worsens as more concepts are introduced, and larger prompts take longer to process and use more compute resources.

To improve a Large Language model's ability to understand a specific domain, you can fine tune a model - effectively re-training it with a corpus of code, example interactions, documentation and other context. In the case of the Minecraft bot, we could significantly improve the bot's abilities by fine-tuning a model with the entire SimulatedPlayer API documentation, examples of interactions between players and the NPC, information about Minecraft, and more.

## Important Info on the GameTest APIs

GameTest is a beta API from the Minecraft team, and is subject to change with updates. We will work to keep this repo up to date with new releases. The documentation is currently being written, so there are a few things to be aware of, as noted in the next section.

## Important Tips

- If you edit the manifest.json file, ignore any warnings it gives you about the existing file
- Also, if you edit the manifest.json file, do not change the first two entries in dependencies, these are required
- If there is an error in your test being registered, (like you didn't import GameTest), you won't get any notification of what is wrong
- So make sure you can verify your entry point is working before you do a lot of crazy work (like I did). The best way to do this is to type the following into the console:

`/gametest run [your class]::[yourtestname]`

If you don't see the console trying to autocomplete to your test, then you have a problem with your entry point.

## Code Structure

1. main.ts is where the code pack is registered and we pass in the tickMain function to run every game tick (20 times per second)
2. tickMain calls into an instance of CodexGame, which handles the game logic, creates the CodexBot, and manages state logic for the bot
3. CodexGame is also where we call `eval()` to run the generated code.
4. CodexBot is a wrapper around the SimulatedPlayer class from Minecraft, which handles the bot's logic
5. Crafting class is a static class that manages a database of recipes and will remove items from the bot and return to it the item if it can craft the item. It's not a true "crafting" function so you can alter it to not remove items from the bot, or to give the bot exactly what it needs to craft, or even just give the bot the item you want it to have directly.
6. The prompt class manages the text input to Codex that informs it of how we expect input to be delivered. In this case, we are using the .\prompts\combinedPrompts.ts file.
7. TimedQueue is a class to manage promise chaining with wait functions to create complex behaviors
8. The GameTest APIs can be viewed in the node_modules/@types folder. They are mojang-gametest, mojang-minecraft and mojang-net. mojang-net is included with the source depot and copied into the node_modules folder. The others are npm packages.
9. The .vscode json files include info on which code modules we are importing from Minecraft, and request download of the required extensions for VSCode
10. The actions taken by gulp are managed by the gulpfile.js file. It transpiles the Typescript to Javascript, and copies the files to the correct locations.
11. All functions that are act on or are part of SimulatedPlayer are relative to a zero point of where the GameTest structure manifests. You will see code in CodexBot that ensures positions are updated correctly.
12. The location you read out of SimulatedPlayer is a world location, and is NOT relative to anything
13. There are two location types: BlockLocation and Location. You will find yourself having to convert back and forth dependin on the types the functions are requesting
14. Properties of most GameTest objects can be queried through getComponent() and passing in a string value. You can enumerate the components through getComponents() on the same object.

## FAQ

### What OpenAI models are available to me?

You might have access to different [OpenAI models](https://beta.openai.com/docs/api-reference/models) per OpenAI organization. To check what engines are available to you, one can query the [List models API](https://beta.openai.com/docs/api-reference/models/list) for available engines. See the following commands:

- Shell
  ```
  curl https://api.openai.com/v1/models \
    -H 'Authorization: Bearer YOUR_API_KEY' \
    -H 'OpenAI-Organization: YOUR_ORG_ID'
  ```
