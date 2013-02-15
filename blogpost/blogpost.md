# Unleashing the Power of the Splunk App Framework

As mentioned in previous posts, the recently released Splunk App Framework allows developers to draw from the power of modern web programming to create new and exciting applications built on Splunk. I'm really excited about all the new abilities the framework provides, and I think it will help usher in some really awesome Splunk Apps.

When I first got my hands on the framework, I wanted to show off how quickly and easily a web developer, such as myself, could use standard web technologies to make a simple yet compelling dashboard for Splunk. 

Let's get started!

## Setup
If you haven't already, you'll first need to grab the Splunk Application Framework from GitHub. To get yourself setup, get over to [the Splunk App Framework GitHub repo](https://github.com/splunk/splunk-appframework) and follow the instructions on that page.

Once you've gotten the framework setup, type

    ./appfx createapp musicdashboard 
    ./appfx run

**NOTE**: For all the examples in this post, we use the Chrome browser, since we will eventually be using some features only supported by that browser. When following along, use Chrome for the best experience.

Navigate to server/apps/musicdashboard and update the first string in your `__init__.py` to something friendly, like "Music dashboard!"

Then, navigate to localhost:3000/appfx/ and observe that the musicdashboard app has been created.

Now we'll need some demo data. Grab the CSV file located [here](http://github.com/splunk/splunk-demo-musicdashboard/splunkd/lookups/musicdata.csv) TODO verify link. and drop it in the server/apps/music-dashboard/splunkd/lookups folder.

TODO point to github repo of this example, linked somewhere
TODO images before each section

## Step 0: Basic Dashboard
![Basic dashboard](step0.png)

Before we dive into the more advanced features of the Splunk App Framework, let's build a basic dashboard, very reminiscent of a dashboard you might find in existing Splunk Apps found on Splunkbase.

First, navigate to the server/apps/music-dashboard folder. Open up home.html, which was placed there are part of the `createapp` setup. Let's make a few dashboard panels using our demo data from the setup portion. We'll make the following dashboards:

* A chart showing the artists most searched for
* A result table showing the songs most downloaded
* A chart showing the artists most downloaded

Something to note is that the Splunk App Framework comes pre-canned with [Bootstrap styles](http://twitter.github.com/bootstrap/), so some of the layout patterns you'll see below are in that vein.

Let's add some CSS to the CSS block of our HTML template file:

	
	{% block css %}
	    <link rel="stylesheet" type="text/css" href="{{STATIC_URL}}{{app_name}}/custom.css" />

	    <style>        
	        .container {
	            margin-top: 30px;
	        }
	     
	        .panel {
	            background-color: #fff;
	            border: 1px solid #ccc;
	            border-radius: 4px;
	            box-shadow: 0px 1px 1px rgba(0,0,0,0.08);
	            overflow: hidden;
	            margin: 0 0 20px 0;
	            height: 548px;
	        }
	        .panel-head {
	            padding-top: 10px;
	            padding-left: 20px;
	            padding-right: 20px;
	        }
	        .panel-body {
	            clear: both;
	            padding-top: 10px;
	            padding-left: 20px;
	            padding-bottom: 20px;
	            padding-right: 20px;
	            height: 400px;
	        }

	    </style>
	{% endblock css %}

Now we'll add some charts that we'll use to display data. The layout structure here uses the custom CSS we've just defined plus Bootstrap styles:

	{% block content %}

	<div class="container">
	    <div class="row">
	        <div class="span6">
	            <div class="panel">
	                <div class="panel-head">
	                    <h4>Top Artist Searches</h4>
	                </div>
	                <div class="panel-body">
	                    {% chart id="chart-top-artist-searches" contextid="search-top-artist-searches" type="bar" %}
	                </div>
	            </div>
	        </div>
	        <div class="span6">
	            <div class="panel">
	                <div class="panel-head">
	                    <h4>Top Song Downloads</h4>
	                </div>
	                <div class="panel-body">
	                    <div class="pull-right">
	                        {% paginator id="paginator-top-song-downloads" %}
	                    </div>

	                    {% resulttable id="table-top-song-downloads" contextid="search-top-song-downloads" paginator="paginator-top-song-downloads" %}
	                </div>
	            </div>
	        </div>
	    </div>

	    <div class="row">
	        <div class="span12">
	            <div class="panel">
	                <div class="panel-head">
	                    <h4>Top Artist Downloads</h4>
	                </div>
	                <div class="panel-body">
	                    {% chart id="chart-top-artist-downloads" contextid="search-top-artist-downloads" type="column" %}
	                </div>
	            </div>
	        </div>
	    </div>

	</div>

	{% endblock content%}

As you can see, it's very simple and standard to add charting UI, using Django templates, to your page with a nice dashboard layout. You'll notice that all of these charts take as an option a `contextid`, which points to a search context. We'll define those right now. Immediately after the `{% endblock content %}` line, add the following code:

	{% block contexts %}
	    {% search id="search-top-artist-searches" 
	        search='| inputlookup musicdata.csv | search bc_uri=/browse/search/* | top search_terms | fields - percent | rex field=search_terms mode=sed "s/\+/ /g"'
	        cache=True
	    %}

	    {% search id="search-top-song-downloads" 
	        search="| inputlookup musicdata.csv | search bc_uri=/sync/addtolibrary* | stats count by track_name | sort count desc | table track_name count"
	        cache=True
	    %}

	    {% search id="search-top-artist-downloads" 
	    	search="| inputlookup musicdata.csv | search bc_uri=/sync/addtolibrary* | timechart useother=f usenull=f span=20s count by artist_name"
	        cache=True
	    %}

	{% endblock contexts %}

Finally, let's use the Splunk App Framework's JavaScript API to add some advanced options to one of our charts. Make your `{% block js %}` look like this:

	{% block js %}    
	    <script>
	        AppFx.on('start', function() {
	            AppFx.Components.getInstance('chart-top-artist-downloads').settings.set({
	                'chart.nullValueMode': 'zero',
	                'chart.stackMode': 'stacked100',
	                'layout.splitSeries': 'false',
	                'legend.placement': 'right'
	            });
	        });
	    </script>
	{% endblock js %}

All right, now let's open up http://localhost:3000/appfx/musicdashboard and take a look!

## Step 1: JQueryUI Accordions
![Accordions](step1.png)

Awesome, so by now we've gotten our basic dashboard setup, so we know we can use the framework to make Splunk dashboards. But I wouldn't be writing this post if I didn't want to show you some of the really cool features we've enabled.

So, let's say that you've decided our dashboard looks too cluttered. It would, for instance, be great if we could collapse the "Top Artist Searches" and "Top Song Downloads" into one container, and place the "Top Artists Downloads" chart to the left, achieving just one row of charts. As a web developer, you are aware that there are many open-source UI widgets available from the web. A popular widget library is [JQuery UI](http://jqueryui.com/). On that site, in particular, an [accordion widget](http://api.jqueryui.com/accordion) is described. We'll choose this widget to help us out with our cluttered layout.

In navigating to the documentation for the accordion widget, we see [this section](http://api.jqueryui.com/accordion/#entry-examples), describing how to integrate the widget into web pages. Let's use this example to modify our code a bit.

Using the instructions on that page, let's update our layout code, starting with the CSS codeblock. Add this reference, which JQuery UI depends on:

	<link rel="stylesheet" href="http://code.jquery.com/ui/1.10.0/themes/base/jquery-ui.css">

Also, the layout of the panels inside the accordion needs to be changed slightly, so let's add this within our `<style>` tag:

	.panel.accordion {
    	margin-bottom:0px;
        height: 430px;
    }

Now let's rework our `content` block so that we have just one `<div class="row" />` and the column chart appears before the other charts. Simple layout updates get us this:

	{% block content %}

	<div class="container">
	    <div class="row">

	       <!-- Moved up -->
	       <div class="span6">
	            <div class="panel">
	                <div class="panel-head">
	                    <h4>Top Artist Downloads</h4>
	                </div>
	                <div class="panel-body">
	                    {% chart id="chart-top-artist-downloads" contextid="search-top-artist-downloads" type="column" %}
	                </div>
	            </div>
	        </div>

	        <div class="span6">
	            <div id="accordion">
	                <h3>Top Artist Searches</h3>
	                <div class="panel accordion">
	                    <div class="panel-body">
	                        {% chart id="chart-top-artist-searches" contextid="search-top-artist-searches" type="bar" %}
	                    </div>
	                </div>
	                
	                <h3>Top Song Downloads</h3>
	                <div class="panel accordion">
	                    <div class="panel-body">
	                        <div class="pull-right">
	                            {% paginator id="paginator-top-song-downloads" %}
	                        </div>

	                        {% resulttable id="table-top-song-downloads" contextid="search-top-song-downloads" paginator="paginator-top-song-downloads" %}
	                    </div>
	                </div>
	            </div>
	        </div>

	        
	    </div>
	</div>

	{% endblock content%}

Just like the JQuery UI documentation instructed, we've wrapped our charts in a single `div` with `id="accordion"`. To get the full functionality, we simply need to add a reference to the JQuery UI Accordion in our `{% block js %}` section:

	<script src="http://code.jquery.com/ui/1.10.0/jquery-ui.js"></script>

**NOTE:** There is no need to include JQuery itself. The Splunk App Framework already has it included.

And just before the line of code `AppFx.on('start', ...);` let's add this JavaScript:

	$('#accordion').accordion();

Just as the documentation describes.  Reload the page and see how easy it was to integrate that accordion!


## Step 2: D3
![D3](step2.png)

Now that our UI is no longer as cluttered, we've freed up some screen real estate for perhaps another dashboard panel. This time, we don't want to use any of the built-in Splunk charts to display our data, but instead we decide that a chart from the [D3 gallery](https://github.com/mbostock/d3/wiki/Gallery) might help us best to gain insight into our data. (As a side note, if you haven't before, peruse the D3 gallery. It's fun!)

For this example, we'll choose the [Sankey diagram](http://bost.ocks.org/mike/sankey/) to help us visualize which artists' songs are downloaded to which mobile devices.

After reading the documentation for the Sankey diagram we see that it is modular, but the code is a little nasty. I've created a helper library to abstract away some of the complexity. Grab [sankey-helper.js](http://github.com/splunk/splunk-demo-musicdashboard/musicdashboard/static/musicdashboard/sankey-helper.js) and drop it in /server/apps/musicdashboard/static/musicdashboard/. 

Let's also drop some styles in our `style` tag to make the chart nice once it renders:

	#chart {
      height: 500px;
    }

    .node rect {
      cursor: move;
      fill-opacity: .9;
      shape-rendering: crispEdges;
    }

    .node text {
      pointer-events: none;
      text-shadow: 0 1px 0 #fff;
    }

    .link {
      fill: none;
      stroke: #000;
      stroke-opacity: .2;
    }

    .link:hover {
      stroke-opacity: .5;
    }

OK, now for the good stuff. Let's include this D3 component on the page. To start, we'll provision some layout for the chart. Let's make a new row in our container div. Add this code just before the container div's closing tag:

	<div class="row">
        <div class="span12">
           <div class="panel">
                <div class="panel-head">
                    <h4>Artists Downloaded to Devices</h4>
                </div>
                <div class="panel-body">
                    <p id="chart"></p>
                </div>
            </div>
        </div>
    </div>

Specifically, notice the `<p id="chart"></p>` tag. Now that we have our layout in place, let add the search that will drive the data for the chart. To our `{% block contexts %}`, add this search:

	{% search id="sankey-search"
        search='| inputlookup musicdata.csv | stats count by artist_name, eventtype | where (eventtype="ua-mobile-android" OR eventtype="ua-mobile-ipad" OR eventtype="ua-mobile-blackberry" OR eventtype="ua-mobile-iphone" OR eventtype="ua-mobile-ipod")'
        autostart=False
        cache=True
    %}

Let's wire up the JavaScript. Add some more reference script tags in the `{% block js %}`:

	<script src="http://d3js.org/d3.v2.min.js?2.9.1"></script>
    <script src="http://bost.ocks.org/mike/sankey/sankey.js"></script>
    <script src="{{STATIC_URL}}{{app_name}}/sankey-helper.js"></script>

And now for the code. First, we'll bind to a data context on the search, the make it run. Once it gets data back, we will format it properly for the Sankey diagram. Finally, we will render the diagram. Notice that in the code below, we did not have to make a custom Splunk App Framework component for this diagram to work. Everything is wired up using typical web programming patterns. When we're done, our inline script tag will look like this:

	<script>
        $('#accordion').accordion();


        AppFx.on('start', function() {
            AppFx.Components.getInstance('chart-top-artist-downloads').settings.set({
                'chart.nullValueMode': 'zero',
                'chart.stackMode': 'stacked100',
                'layout.splitSeries': 'false',
                'legend.placement': 'bottom'
            });

            var sankeyHelper = window.MusicDashboard.SankeyHelper;
            var _ = require('underscore');

            var setup = sankeyHelper.setupSankey();
            var context = AppFx.Components.getInstance('sankey-search');

            var datasource = context.data('results', {
                output_mode: 'json_rows',
                count: 0 // get all results
            });
            
            var onDataChanged = function(results) {
                if (!datasource.hasData()) {
                    return;
                }

                // Format Splunk data for Sankey
                var collection = results.collection().toJSON();
                var nodesList = _.uniq(_.pluck(collection, "artist_name").concat(_.pluck(collection, "eventtype")));
                var links = _.map(collection, function(item) {
                    return {
                        source: nodesList.indexOf(item.artist_name),
                        target: nodesList.indexOf(item.eventtype),
                        value: parseInt(item.count)
                    }
                });
                var nodes = _.map(nodesList, function(node) { return { name: node } }); 
                

                // Put data into Sankey diagram
                sankeyHelper.renderSankey(nodes, links, setup.svg, setup.sankey, setup.path);

            };

            datasource.on('data', onDataChanged);

            context.startSearch();

        });
    </script>

And that's it! No black magic!



## Step 3: Interactivity
![Interactivity](step3.png)

After having our Sankey diagram in place, it's great to see the relationships in our data, but what if we're also interested in what Splunk events are specifically driving the output for this chart? With just a few more lines of code we can wire up the Sankey diagram to an existing Splunk widget. When you click on a link between an artist and a mobile device, now you'll be able to see which events were responsible for the magnitude of that link.

First, we'll add a little bit of CSS to ensure the link that we click on will stay highlighted. Also, we'll add a little helper CSS to make the built-in Splunk event results table scrollable. In our `style` tag, then, add:

	.link:hover {
    	stroke-opacity: .5;
    }

    .scrollable {
    	overflow-y: auto;
    }
        

In terms of layout, we'll just add another row with the Splunk `eventtable` widget after the one containing the Sankey diagram:

	<div class="row">
        <div class="span12">
            <div class="panel scrollable">
                <div class="panel-head">
                    <h4>Results for Artists Downloaded to Devices</h4>
                </div>
                <div class="panel-body">
                    {% resulttable id="interactive-eventtable" contextid="interactive-search" %}
                </div>
            </div>
        </div>
    </div>

We'll also need a search context to help us grab the data to drive the output for this `eventtable`. Add this to the `{% block contexts %}`:

	{% search id="interactive-search"
        search="| inputlookup musicdata.csv | search artist_name=\"$artist_name$\" eventtype=\"$eventtype$\""
        autostart=False
        cache=False
        preview=True
    %}

(Notice how we can easily parameterize the `search` attribute using `$...$` tokens. Check out the JavaScript later for the token replacements.)

Now all we need to do is wire these two UI widgets together using some straighforward JavaScript. After the we render the Sankey diagram in this line of code:

	// Put data into Sankey diagram
    sankeyHelper.renderSankey(nodes, links, setup.svg, setup.sankey, setup.path);

Let's add:

	// Interactivity
    var interactiveSearch = AppFx.Components.getInstance('interactive-search');
    sankeyHelper.getLink().on('click', function(clickedLink) {
    	// Highlight the link that was clicked
        sankeyHelper.getLink().classed("my-selected", false);
        d3.select(this).classed("my-selected", true);
        
        // Token replacements on the search context
        interactiveSearch.query.set('artist_name', clickedLink.source.name);
        interactiveSearch.query.set('eventtype', clickedLink.target.name);
        
        // Kick off the search, so our eventtable can render the result set
        interactiveSearch.startSearch();
    });

Again, with these few lines of targeted layout and data-binding code, we can achieve interactivity, even between components from two different libraries (built-in Splunk and D3). 


## Step 4: Images!
![Images!](step4.png)

OK, so we've done some really cool stuff visualizing data generated from our Splunk instance, but what if we want to take it a step further? Since the Splunk App Framework allows us to use standard web technologies, let's use the data we get back from Splunk to get more detailed data from an external web service and visualize it directly in our Splunk application.

To start, notice how one of our charts shows us the top artists that users search for. We should actually *show* them this data. As it turns out, there's a web service that lets us give it names of artists, and in return, we get the images for those artists. Check it out: it's the [LastFM API](http://www.last.fm/api/intro). To take this demo a step further, we'll need a developer API key in order to make requests to this service. Go ahead and provision one for yourself via the instructions on that site. Once you've done that, we can continue!

Harnessed with the power of this API key, we can tie our Splunk data to the LastFM API, using standard REST calls from the browser client. After following the LastFM API documentation, and with some prior knowledge of [JQuery.get](http://api.jquery.com/jQuery.get/), we can add some JavaScript code to tie it all together.

Immediately after the line of code `context.startSearch();`, let's add this logic:

	// Get the search context containing artists' names
 	var searchDownloadsContext = AppFx.Components.getInstance('search-top-artist-searches');
    var searchDownloadsDataSource = searchDownloadsContext.data('results', {
        output_mode: 'json_rows',
        count: 0
    });

    // Wait for artists' names to be available
    searchDownloadsDataSource.on('data', function(results) {
        if (!searchDownloadsDataSource.hasData()) {
            return;
        }

        // TODO add your API key here
        var apiKey = '';
        if (!apiKey) { alert('Missing LastFM API key. Please grab one and modify your JavaScript code to include it.'); return; }

        // Get list of artists' names
        var artists = _.map(results.collection().toJSON(), function(item) { return {name: item.search_terms}; });
        var normalize = function(s) {
            return $.trim(s).toLowerCase();
        };

        // Begin asynchronous fetching of all artists' images from LastFM
        var countdown = artists.length;
        for (var i = 0; i < artists.length; i++) {
            $.get(
                'http://ws.audioscrobbler.com/2.0/',
                {
                    'method': 'artist.getInfo',
                    'api_key': apiKey,
                    'artist': artists[i].name,
                    'format': 'json'
                },
                function(data) {
                    var artist = _.find(artists, function(a) { return normalize(a.name) === normalize(data.artist.name); });
                    artist.img = _.find(data.artist.image, function(img) { return img.size === 'mega'; })['#text'];

                    if (--countdown === 0) {
                    	// All artists' images have been fetched, render the UI

                    	// TODO UI CODE
                    }
                }
            );
        }
    });

Notice again how very little of the above code is Splunk-related. Almost all of it is code that could be used in any web app to get data from a third party web service.

If you were to open up the debugger, you'd see that eventually we end up with an array, `artists`, containing artist names and image URLs. Let's come up with a cool way to visualize these images. 

After a bit more research, we might find this nice slider widget: [Joe Lambert's Flux](http://www.joelambert.co.uk/flux/). Let's just plug this in. First, add this near our other `script` tags:
	
	<script src="http://www.joelambert.co.uk/flux/js/flux.min.js?v=20111012"></script>

We'll add a container for Flux to bind to. To do this, let's update our first row of panels to take up less horizontal space and add the new container. Here's the final result:

	<div class="row">
       <div class="span4">
            <div class="panel">
                <div class="panel-head">
                    <h4>Top Artist Downloads</h4>
                </div>
                <div class="panel-body">
                    {% chart id="chart-top-artist-downloads" contextid="search-top-artist-downloads" type="column" %}
                </div>
            </div>
        </div>

        <div class="span4">
            <div id="accordion">
                <h3>Top Artist Searches</h3>
                <div class="panel accordion">
                    <div class="panel-body less-padding">
                        {% resulttable id="chart-top-artist-searches" contextid="search-top-artist-searches" %}
                    </div>
                </div>
                
                <h3>Top Song Downloads</h3>
                <div class="panel accordion">
                    <div class="panel-body">
                        <div class="pull-right">
                            {% paginator id="paginator-top-song-downloads" %}
                        </div>

                        {% resulttable id="table-top-song-downloads" contextid="search-top-song-downloads" paginator="paginator-top-song-downloads" %}
                    </div>
                </div>
            </div>
        </div>

        <div class="span4">
            <div class="panel slider-panel">
                <div id="slider"></div>
            </div>
        </div>
        
    </div>

Specifically, notice that we've added a `div` with `id="slider"` for the Flux container. Additionally, we've changed `chart-top-artist-searches` to a `resulttable`, which will look better with the shorter width.  Also, let's add this CSS style:

	.panel.slider-panel {
        overflow:visible;
        background-color: initial;
        border: none;
        box-shadow: none;
        max-height: 400px;
        max-width: 300px;            

    }

Then, we can replace our `// TODO UI CODE` comment with:

	var $slideShow = $('#slider');
	$slideShow.empty();
	_.each(artists, function(artist) {
	    var $el = $('<img src="' + artist.img + '" title="' + artist.name + '" class="artist-image" />');
	    $slideShow.append($el);
	});

	$slideShow.show();
	new flux.slider('#slider', {
	    pagination: false,
	    captions: true
	});

Now, navigate to your page, wait a moment, and lo! images!

## No limits
Hopefully I've given you a good introduction to the new features allowed by the Splunk App Framework. As I've said, I'm really excited to see what developers can build using the new capabilities we've unveiled. Happy coding!
