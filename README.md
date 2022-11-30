<p align="center">
  <a href="https://toodoo.io">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./static/toodoo-logo.svg">
      <img src="./static/toodoo-logo.svg" height="128">
    </picture>
    <h1 align="center">TOODOO</h1>
  </a>
</p>

Toodoo is a CLI tool that automatically syncs TODO and FIXME comments from your code with Trello.

# Features

- all `@TODO` and `@FIXME` comments will be synced with trello
- when the comment is removed fro code, it's associate card will be moved to your `done` list
- `@username` mentions will be linked to trellow board menbers (feautre needs fixing)

# Getting Started

## 1. intall toodoo in your project

---

```
npm i toodoo
```

or

```
yarn add toodoo
```

## 2. setup trello

---

you will need to create a private powerup and authorize it to access your workspace.

Please follow these stepts:

- go to https://trello.com/power-ups/admin
- create a new powerup, and name it `toodoo`
- select your workspace
- please ignore the ifrae connector url
- once created, `generate a new API key`
- copy your `api key` (you will need it later)
- next to your API key, in the interface you will see instructions about how to generate a `token` manually
- generate and copy your `token`

## 3. add your `api key` and `token` to your config

---

### using the CLI:

Run the cli config helper

```
toodoo setup
```

Once `toodoo` is connected to Trello, you will be asked to select a board, and 3 lists:

- `pending list`: list that hold your backlog
- `in progress list`: list that holds your tickets that are being worked on
- `done list`: list that holds your completed tickets

At the end of the run, a config file named `toodoo.config.json` will be created at the root of your project.

!!! PLEASE ADD THIS TO YOUR `.gitignore` !!!

### via .env

Add these values to your .env file or your CI's evironmental variables:

```
TOODOO_PM_TOOL=trello
TOODOO_CI=false
TOODOO_TRELLO_KEY=xxxx
TOODOO_TRELLO_TOKEN=xxxxxx
TOODOO_TRELLO_PENDING_LIST_ID=123456
TOODOO_TRELLO_INPROGRESS_LIST_ID=123456
TOODOO_TRELLO_DONE_LIST_ID=123456
```

# Running locally

```
toodoo
```

this will locate all the `@TODO` and `@FIXME` comments and convert them to trello cards.

You can specify a glob expression to filter:

```
toodoo '{,!(node_modules)/**/}*.{js,ts,jsx,tsx,css}'
```

you can add this to your `package.json`:

```
  scripts: {
    ...
    "toodoo": "toodoo '{,!(node_modules)/**/}*.{js,ts,jsx,tsx,css}'"
    ...
  }
```

# Running in CI environments

`toodoo` can be run in CI environments such as Gitlab CI and Github Actions. As you are using your private apikey and tokens, it is adivable not to have the commitd to your git repo, so you will need to use the environmental variables for config:

```
TOODOO_PM_TOOL=trello
TOODOO_CI=true
TOODOO_TRELLO_KEY=xxxx
TOODOO_TRELLO_TOKEN=xxxxxx
TOODOO_TRELLO_PENDING_LIST_ID=123456
TOODOO_TRELLO_INPROGRESS_LIST_ID=123456
TOODOO_TRELLO_DONE_LIST_ID=123456
```

# Other commands

### Get config as env

```
toodoo config env
```

### List all todos:

```
toodoo list
```

### Interract with trello:

```
toodoo trello
```

### Display Trello info:

```
toodoo trello info
```

# Dev roadmap:

- check and ask to add the config file to `.gitignore` if preset
- add option to run only when a specifc git branch is active (eg: only run on `development`)
- investigate if integration from trello to git bould be possible & advisable (this would cover scenarios such as: auto-removal of commit is advisable when card is moved to done list, or changing the @username mentions when a members of a card are changed in trello)
- Add a public Trello board with examples from `toodoo` code
- Add support for other PM tools

# Credits

this was inspired by [ves](https://github.com/vesln)'s work on the [todo](https://github.com/vesln/todo) npm package, which is partially using. Thanks :)
