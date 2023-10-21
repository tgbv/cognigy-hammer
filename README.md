# cognigy-hammer

An extension development suite for <a href="https://www.cognigy.com/" target="_blank">CognigyAI</a>. Not affiliated with Cognigy or its subsidiaries.

Project seeks to eliminate the need of managing nodes dependencies and establish a standard for better development of <a href="https://github.com/Cognigy/Extensions" target="_blank">CognigyAI extensions</a>.

## Live examples

<img src="https://raw.githubusercontent.com/tgbv/cognigy-hammer/main/demos/create-extension.demo.gif">
<img src="https://raw.githubusercontent.com/tgbv/cognigy-hammer/main/demos/create-node.demo.gif">
<img src="https://raw.githubusercontent.com/tgbv/cognigy-hammer/main/demos/delete-node.demo.gif">

## Prerequisites:

- UNIX based OS
- GIT
- Node >= 18
- NPM >= 9

## Setup

```bash
npm i -g cognigy-hammer
```

## Features

- CLI to easily create new project, nodes, connections.
- Nodes types and hierarchy are injected automatically based on directory structure.
- Connections and Nodes are imported automatically.
- Helper function for setting the next node.

## CLI commands

The following commands should be available after installing the package globally. If they are not, you may need to use `npm exec` / `npx`
```bash
ch.create-project   # create a new extension project scaffold
ch.create-node      # create a new node in an extension project
ch.delete-node      # delete a node from an extension project
ch.create-connection # create a new connection in an extension project
```

## Standard

### Directory structure

- Nodes are stored in `./src/nodes`
- Connections are stored in `./src/connections`
- Assets used at runtime are stored in `./src/assets`

Each node can have N children nodes. The former are stored in a directory located at the same tree level as the parent.
```bash
src
├── assets
│   └── extension-map.js
├── connections
│   └── dbs
│       ├── Mongo.ts
│       └── MySQL.ts
└── nodes
    ├── Parent
    │   ├── Child1.ts
    │   ├── Child2
    │   │   └── Child3.ts
    │   └── Child2.ts
    └── Parent.ts
```

### Node rules

- One parent node can have N child nodes.
- One parent node must not share its children nodes with other parent nodes. While CognigyAI chart supports this variant and other mixed ones, a custom implementation and/or directory scheme is required from development side for it, which is not in the scope of this package.

<img src="https://raw.githubusercontent.com/tgbv/cognigy-hammer/main/diagrams//nodes.drawio.png">

<i>In above example, Parent1 and Parent2 cannot share the same Child2.</i>
