# The Splunk MusicDashboard Demo

## Introduction

To demonstrate the capabilities of the Splunk App Framework, we've created this demo app as an example. If you're more interested in how to build applications like this, please read `blogpost.md`, which is essentially a tutorial about how to build this app.

## Setup

To view this example, make sure you have the Splunk App Framework installed. See how to do this at its [GitHub repo](https://github.com/splunk/splunk-appframework).

Once you're setup, drop the `musicdashboard` folder into /splunk-appframework/server/apps/. Then run `./appfx deploy musicdashboard`. Restart your Splunk instance, and then navigate to http://localhost:3000/appfx/musicdashboard to ensure it's installed. 

If you want step4 to work properly, you'll need to grab an API key from the [LastFM API](http://www.last.fm/api/intro). Once you have it, open `templates/step4.html` and insert your API key into the line of code directly after the comment line `// TODO add your API key here`.


