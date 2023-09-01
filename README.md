# Sanity Project Management for Raycast

Interact with your Sanity.io projects

_This extension is currently under development and is not published yet._

## Usage

This extension leverages the same authentication as your Sanity CLI. To log in on your computer, run the following in your command line interface (requires you to have [Node.js installed][node-js]):

```sh
npx sanity login
```

You can access this extension by typing “sanity” in the Raycast panel.

The configuration file where Sanity CLI stores your token is by default located at _~/.config/sanity/config.json_.

## Features

As of now, there is only one top-level feature called “Your projects”. Under individual projects, you will find functionality via Raycast's “Action panel" (invoke it with `cmd + K`) and by drilling down the different selections. For individual projects, you currently have the following features:

- Copy project ID action
- Open the project on sanity.io/manage
- Open the deployed Sanity Studio (as set in the project preferences)
- View project members
  - Copy email action
- View project datasets
  - Copy dataset name action
- View CORS origins
  - Add new CORS origin
  - Delete CORS origin
  - Copy CORS origin URL action
  - Open CORS origin URL in a browser action

[raycast-store]: https://www.raycast.com/store
[node-js]: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
