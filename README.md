# TrackerTracker

Multi-project Scrum UI for [Pivotal Tracker](http://www.pivotaltracker.com).

![Screenshot](http://i.imgur.com/6QEyWXm.png)

## Features

* Simultaneously view and manage stories across multiple projects
* Scrum-like UI displays one column per story state, including "In QA" and "Passed QA"
* Search across all projects simultaneously
* Quickly drill down using any combination of projects, labels, users, and searches
* All labels for all projects are visible and have epic-like mini progress charts
* Columns can be rearranged
* Labels, searches, column order, selected projects all survive browser restart
* Enter your Pivotal API token and user name and off you go
* Most actions are supported: update story descriptions, add notes, drag them to different columns to update their status and priority
* Write your own custom columns and filters in a couple lines of JS
* Assign QAs and pairs to stories
* TeamCity integration: view build status in story detail view
* Forecasting charts

![Screenshot](http://i.imgur.com/FK00z8H.png)

* Wallboard mode, to mimic a wall of post-it notes
* Workspaces let you quickly switch between sets of projects, filters, and columns. Use numbers 1-9 to switch between workspaces 1-9 in one keypress.
* Special labels that change story appearance (blocked, orange, yellow, green, blue)

## Who Is This For?

Companies like [a particular technology startup](http://www.intentmedia.com/) that use Pivotal Tracker and have multiple small projects going at once, but no good way to visualize and track progress across them all.

## Project Status

This is beta software, use at your own risk. If you have any issues or feature requests, we would love to know, please [open an issue](http://github.com/intentmedia/TrackerTracker/issues). Contributions and pull requests are also very welcome.

## Demo

A demo install is up and running at [http://trackertracker.glomerate.com](http://trackertracker.glomerate.com). API tokens are not logged by the server. The only thing exposed in the server logs are project IDs, which are useless without proper access to them.

## Server Installation

### Two Minute Heroku Install

Assuming you have a verified [Heroku account](http://www.heroku.com/) and [Heroku toolbelt](https://toolbelt.herokuapp.com/) installed:

```sh
git clone git@github.com:intentmedia/TrackerTracker.git
cd TrackerTracker
heroku apps:create [optional app name]
heroku addons:add rediscloud
git push heroku [local branch:]master
```

### Ubuntu Server Install (Tested on 12.04)

```sh
# Need this to get the most recent version of node/npm - maybe not needed on 12.10
add-apt-repository ppa:richarvey/nodejs
aptitude update
aptitude install build-essential git-core nodejs npm redis-server
npm -g install grunt-cli forever
git clone git@github.com:intentmedia/TrackerTracker.git
cd TrackerTracker
npm install
grunt
forever start --watch -l ~/forever.log -o ~/out.log -e ~/err.log app/app.js
```

## OS X Developer Installation

1. Install **Homebrew**: [http://mxcl.github.com/homebrew/](http://mxcl.github.com/homebrew/)
2. Install **Redis**: `brew install redis`
3. Install **NodeJS**: [http://nodejs.org/](http://nodejs.org/)
4. Install **Grunt-CLI**: `npm -g install grunt-cli`
5. Install **Karma**: `npm -g install karma`
6. Install **TrackerTracker**: `git clone git@github.com:intentmedia/TrackerTracker.git`
7. Install **NPM packages**: `cd TrackerTracker && npm install`

#### Running the app

In terminal window #1, start redis:

```sh
redis-server
```

In terminal window #2, run grunt once to bundle your static files, and then start node:

```sh
grunt
node app/app
```

#### Running the Jasmine test suite once

```sh
karma start --single-run --browsers Safari
```

Single-run benchmarks (includes starting Karma, capturing the browser, running the tests, and killing processes):

- PhantomJS 1.8.1: 12.3 seconds
- Firefox 17: 4.1 seconds
- Chrome 26: 3.4 seconds
- Safari 6: 2.9 seconds

#### Development Workflow

You should have Grunt and Karma running in the background while coding. If you're not, you're missing out on instant lint/test feedback and a headache-free build process. Here's how to do that:

In terminal window #1, have Karma auto-run on file changes:

```sh
karma start
```

In terminal window #2, have Grunt auto-run (jshint, concat, hogan compile) on file changes:

```sh
grunt watch
```

## Browser Support

TrackerTracker has been tested and built for Chrome, Safari, and Firefox. It seems fine in IE 9, but broken in IE 10. (Progress!) All basic interactions work on iPad. Fluid's localStorage implementation doesn't survive a restart, so for now Fluid should be considered unsupported.

## Contributors

* Andrew Childs ([@andrewchilds](http://twitter.com/andrewchilds))
* Adrian Cretu-Barbul ([@adriancb](http://twitter.com/adriancb))
* Kurt Schrader ([@kurt](http://twitter.com/kurt))
* John Whitfield ([@jkwhitfield](http://twitter.com/jkwhitfield))
* James Cartledge ([jcartledge](https://github.com/jcartledge))

## License

MIT License. &copy; 2013 Andrew Childs
