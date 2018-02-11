// REQUIRE D3 AND BRITECHARTS
var britecharts = britecharts;
var d3 = d3;
var miniToolTip = miniToolTip;
var colors = colors;

// SET UP HANDLEBARS
Handlebars.templates = Handlebars.templates || {};
var templates = document.querySelectorAll('template');
Array.prototype.slice.call(templates).forEach(function(tmpl) {
    Handlebars.templates[tmpl.id] = Handlebars.compile(tmpl.innerHTML.replace(/{{&gt;/g, '{{>'));
});

// SPOTIFY IMPLICIT GRANT AUTH ===========================================================================
const hash = window.location.hash.substring(1).split('&').reduce(function(initial, item) {
    if (item) {
        var parts = item.split('=');
        initial[parts[0]] = decodeURIComponent(parts[1]);
    }
    return initial;
}, {});
window.location.hash = '';

// Set token
let access_token = hash.access_token;

const authEndpoint = 'https://accounts.spotify.com/authorize';

// my app's client ID, redirect URI and desired scopes
const clientId = '477fce2d987341da9f370b68cad9e026';
const redirectUri = 'http://spotify-api-charts.herokuapp.com/callback';
const scopes = ['user-top-read', 'playlist-read-private', 'user-library-read'];

// If there is no token, redirect to Spotify authorization
if (!access_token) {
    window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}&response_type=token&show_dialog=true`;
}
// END SETUP ===========================================================================

// FIRST THING'S FIRST -- GET USER INFO. ===========================================================================
$(document).ready(function() {
    $.ajax({
        url: "https://api.spotify.com/v1/me",
        type: "GET",
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
        },
        success: function(data) {
            // Once I get the user info, set up the template and run everything
            document.body.innerHTML = Handlebars.templates.main({name: data.display_name});

            // startApp is everything
            startApp();
        }
    });
});

// START APP ===========================================================================
function startApp() {

    // show and hide audio definitions
    $('.showDefinitions').on('click', function() {
        $('.definitions').fadeIn('fast');
    });

    $('.hideDefinitions').on('click', function() {
        $('.definitions').hide();
    });

    // Navigation
    $('#enter').on('click', function() {
        $('#intro').hide();
        $('#topArtists').fadeIn('fast');
    });

    $('#next1').on('click', function() {
        $('#topArtists').hide();
        $('#myFaves').fadeIn('fast');
        $('.definitions').hide();
        $('.showDefinitions').hide();
    });

    $('#back1').on('click', function() {
        $('#intro').fadeIn('fast');
        $('#topArtists').hide();
        $('.definitions').hide();

    });

    $('#next3').on('click', function() {
        $('#myFaves').hide();
        $('#trackSearch').fadeIn('fast');
        $('.definitions').hide();
        $('.showDefinitions').hide();
    });

    $('#back3').on('click', function() {
        $('#myFaves').hide();
        $('#topArtists').fadeIn('fast');
        $('.definitions').hide();

    });

    $('#next4').on('click', function() {
        $('#trackSearch').hide();
        $('#end').fadeIn('fast');
        $('.definitions').hide();
    });

    $('#back4').on('click', function() {
        $('#trackSearch').hide();
        $('#myFaves').fadeIn('fast');
        $('.definitions').hide();
    });

    $('#restart').on('click', function() {
        $('#end').hide();
        $('#intro').fadeIn('fast');
    });


    // USER TOP ARTISTS LONG TERM ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    $('#enter').on('click', function() {
        console.log("calling d3 chart");
        $.ajax({
            url: "https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=50",
            type: "GET",
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
            },
            success: function(data) {
                var preMyJSON = JSON.stringify(data.items);
                var myJSON = JSON.parse(preMyJSON);
                console.log("calling d3 chart");
                var chart = bubbleChart(myJSON).width(400).height(400);
                d3.select('#bubbleChart').data(myJSON).call(chart);
            }
        });
    });

    // USER TOP ARTISTS SHORT TERM ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    $('#getTopArtistsShort').on('click', function() {
        $.ajax({
            url: "https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=50",
            type: "GET",
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
            },
            success: function(data) {
                console.log("User top artists short term", data.items);

                // chart goes here

                data.items.map(function(artist) {
                    let item = $('<li>' + artist.name + '</li>');
                    item.appendTo($('#top-artists-short'));
                });
            }
        });
    });

    // SEARCH INDIV TRACK ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    $('form').submit(function(e) {

        let input = $('input').val();
        $('#clickedTrack').hide(200);
        $('#searchedTrack').empty();
        $('#error').empty();
        $('#indivAudioFeaturesChart').empty();

        if (input == '') {
            console.log("can't be empty");
            $('#error').append("Input can't be empty.");
        }
        let resultIDs = [];
        e.preventDefault();
        $('#results').empty();

        // ajax request to search for all songs with the same name
        $.ajax({
            url: "https://api.spotify.com/v1/search?",
            type: "GET",
            limit: 10,
            data: {
                query: input,
                type: 'track'
            },
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
            },
            success: function(data, id) {
                $('#error').empty();
                if (data.tracks.items.length == 0) {
                    console.log("no results");
                    $('#error').append("No Results. Try again!");
                }
                // display search results
                data.tracks.items.forEach(function(track, index) {
                    resultIDs.push(track.id);
                    let newEl = $('<li onClick="trackFeatures(&apos;' + track.id + '&apos;)"></li>').text(track.name + '   |   ' + track.artists[0].name);

                    $('#results').append(newEl);
                });
            }
        });
    });

    // USER TOP TRACKS Long TERM ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    $("#getFaveAudioFeatures").on('click', function() {
        $('#recentFaveFeatures').css("background-color", 'rgb(255, 255, 255)');
        $('#getFaveAudioFeatures').css("background-color", '#A2FBD0');
        $('.showDefinitions').fadeIn('fast');
        $('.recent').hide();
        $('.longterm').fadeIn('fast');
        $.ajax({
            url: "https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=50",
            type: "GET",
            dataType: "json",
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
            },
            success: function(data) {
                // data to array
                var ids = data.items.map(function(track) {
                    return track.id;
                });

                // array to string
                var idString = ids.join();

                //call other function to do other ajax req
                getAudioFeatures(idString);
            }
        });

        function getAudioFeatures(idString) {
            $.ajax({
                url: "https://api.spotify.com/v1/audio-features?",
                type: "GET",
                data: {
                    ids: idString
                },
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
                },
                success: function(data) {
                    var totals = {
                        energy: 0,
                        danceability: 0,
                        liveness: 0,
                        acousticness: 0,
                        valence: 0,
                        tempo: 0,
                        duration_ms: 0,
                        speechiness: 0
                    };

                    data.audio_features.forEach(function(audioFeature) {
                        for (let prop in totals) {
                            totals[prop] += audioFeature[prop];
                        }
                    });

                    var averagesData = [
                        {
                            name: "energy",
                            description: "Energy is a measure from 0.0 to 1.0 and represents a perceptual measure of intensity and activity. Typically, energetic tracks feel fast, loud, and noisy. For example, death metal has high energy, while a Bach prelude scores low on the scale. Perceptual features contributing to this attribute include dynamic range, perceived loudness, timbre, onset rate, and general entropy.",
                            value: totals.energy / data.audio_features.length
                        }, {
                            name: "danceability",
                            description: "Danceability describes how suitable a track is for dancing based on a combination of musical elements including tempo, rhythm stability, beat strength, and overall regularity. A value of 0.0 is least danceable and 1.0 is most danceable.",
                            value: totals.danceability / data.audio_features.length
                        }, {
                            name: "liveness",
                            description: "Detects the presence of an audience in the recording. Higher liveness values represent an increased probability that the track was performed live. A value above 0.8 provides strong likelihood that the track is live.",
                            value: totals.liveness / data.audio_features.length
                        }, {
                            name: "acousticness",
                            description: "A confidence measure from 0.0 to 1.0 of whether the track is acoustic. 1.0 represents high confidence the track is acoustic.",
                            value: totals.acousticness / data.audio_features.length
                        }, {
                            name: "valence",
                            description: "A measure from 0.0 to 1.0 describing the musical positiveness conveyed by a track. Tracks with high valence sound more positive (e.g. happy, cheerful, euphoric), while tracks with low valence sound more negative (e.g. sad, depressed, angry).",
                            value: totals.valence / data.audio_features.length
                        }, {
                            name: "speechiness",
                            description: "Speechiness detects the presence of spoken words in a track. The more exclusively speech-like the recording (e.g. talk show, audio book, poetry), the closer to 1.0 the attribute value. Values above 0.66 describe tracks that are probably made entirely of spoken words. Values between 0.33 and 0.66 describe tracks that may contain both music and speech, either in sections or layered, including such cases as rap music. Values below 0.33 most likely represent music and other non-speech-like tracks.",
                            value: totals.speechiness / data.audio_features.length
                        }
                    ];

                    console.log('sending averages to chart: ', averagesData);
                    avgAudioFeaturesChart(averagesData);
                }
            });
        }
    });

    // USER TOP TRACKS short TERM ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    $("#recentFaveFeatures, #next1").click(function() {
        $('.longterm').hide();
        $('#recentFaveFeatures').css("background-color", '#A2FBD0');
        $('#getFaveAudioFeatures').css("background-color", 'rgb(255, 255, 255)');
        $('.recent').fadeIn('fast');
        $('.showDefinitions').fadeIn('fast');
        $.ajax({
            url: "https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=50",
            type: "GET",
            dataType: "json",
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
            },
            success: function(data) {

                // data to array
                var ids = data.items.map(function(track) {
                    return track.id;
                });

                // array to string
                var idString = ids.join();

                //call other function to do other ajax req
                getAudioFeatures(idString);
            }
        });

        function getAudioFeatures(idString) {
            $.ajax({
                url: "https://api.spotify.com/v1/audio-features?",
                type: "GET",
                data: {
                    ids: idString
                },
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
                },
                success: function(data) {
                    var totals = {
                        energy: 0,
                        danceability: 0,
                        liveness: 0,
                        // instrumentalness: 0,
                        valence: 0,
                        tempo: 0,
                        duration_ms: 0,
                        speechiness: 0
                    };

                    data.audio_features.forEach(function(audioFeature) {
                        for (let prop in totals) {
                            totals[prop] += audioFeature[prop];
                        }
                    });

                    var averagesData = [
                        {
                            name: "energy",
                            description: "Energy is a measure from 0.0 to 1.0 and represents a perceptual measure of intensity and activity. Typically, energetic tracks feel fast, loud, and noisy. For example, death metal has high energy, while a Bach prelude scores low on the scale. Perceptual features contributing to this attribute include dynamic range, perceived loudness, timbre, onset rate, and general entropy.",
                            value: totals.energy / data.audio_features.length
                        }, {
                            name: "danceability",
                            description: "Danceability describes how suitable a track is for dancing based on a combination of musical elements including tempo, rhythm stability, beat strength, and overall regularity. A value of 0.0 is least danceable and 1.0 is most danceable.",
                            value: totals.danceability / data.audio_features.length
                        }, {
                            name: "liveness",
                            description: "Detects the presence of an audience in the recording. Higher liveness values represent an increased probability that the track was performed live. A value above 0.8 provides strong likelihood that the track is live.",
                            value: totals.liveness / data.audio_features.length
                        }, {
                            name: "acousticness",
                            description: "A confidence measure from 0.0 to 1.0 of whether the track is acoustic. 1.0 represents high confidence the track is acoustic.",
                            value: totals.acousticness / data.audio_features.length
                        }, {
                            name: "valence",
                            description: "A measure from 0.0 to 1.0 describing the musical positiveness conveyed by a track. Tracks with high valence sound more positive (e.g. happy, cheerful, euphoric), while tracks with low valence sound more negative (e.g. sad, depressed, angry).",
                            value: totals.valence / data.audio_features.length
                        }, {
                            name: "speechiness",
                            description: "Speechiness detects the presence of spoken words in a track. The more exclusively speech-like the recording (e.g. talk show, audio book, poetry), the closer to 1.0 the attribute value. Values above 0.66 describe tracks that are probably made entirely of spoken words. Values between 0.33 and 0.66 describe tracks that may contain both music and speech, either in sections or layered, including such cases as rap music. Values below 0.33 most likely represent music and other non-speech-like tracks.",
                            value: totals.speechiness / data.audio_features.length
                        }
                    ];
                    console.log('sending averages to chart: ', averagesData);
                    avgAudioFeaturesChart(averagesData);
                }
            });
        }
    });

    // END OF STARTUP  =================================================
}

// EXTERNAL FUNCTIONS  =================================================

//bubbleChart
function bubbleChart() {

    var width = '400',
        height = 400,
        columnForColors = "name",
        columnForRadius = "popularity";

    function chart(selection) {
        var data = selection.enter().data();
        var div = selection,
            svg = div.selectAll('svg');
        svg.attr('width', width).attr('height', height);

        var tooltip = selection.append("div").style("position", "absolute").style("visibility", "hidden").style("text-decoration", "none").style("padding", "12px").style("background-color", "rgb(230, 230, 230)").style("border-radius", "4px").style("text-align", "left").style("font-family", "helvetica").style("width", "200px").style("line-height", "150%").text("");

        var simulation = d3.forceSimulation(data).force("charge", d3.forceManyBody().strength([-90])).force("x", d3.forceX()).force("y", d3.forceY()).on("tick", ticked);

        function ticked(e) {
            node.attr("cx", function(d) {
                return d.x * 1;
            }).attr("cy", function(d) {
                return d.y * 1;
            });
        }

        var scaleRadius = d3.scaleLinear().domain([
            d3.min(data, function(d) {
                return + d[columnForRadius];
            }),
            d3.max(data, function(d) {
                return + d[columnForRadius];
            })
        ]).range([10, 30]);

        var node = svg.selectAll("circle").data(data).enter().append("circle").attr('r', function(d) {
            return scaleRadius(d[columnForRadius]);
        }).style("fill", function() {
            return '#d53e4f';
        }).attr('transform', 'translate(' + [
            width / 2,
            height / 2
        ] + ')').on("mouseover", function(d) {
            tooltip.html(d[columnForColors] + "<br>" + "Followers: " + d.followers.total + "<br>" + "Popularity: " + d[columnForRadius]);
            return tooltip.style("visibility", "visible");
        }).on("mousemove", function() {
            return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
        }).on("mouseout", function() {
            return tooltip.style("visibility", "hidden");
        });
    }

    chart.width = function(value) {
        if (!arguments.length) {
            return width;
        }
        width = value;
        return chart;
    };

    chart.height = function(value) {
        if (!arguments.length) {
            return height;
        }
        height = value;
        return chart;
    };
    return chart;
}


// GET: audio features based on single track
function trackFeatures(id) {
    $('#results').empty();
    $.ajax({
        url: "https://api.spotify.com/v1/audio-features/" + id,
        type: "GET",
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
        },
        success: function(data) {
            var features = [
                {
                    name: "energy",
                    value: data.energy
                }, {
                    name: "danceability",
                    value: data.danceability
                }, {
                    name: "liveness",
                    value: data.liveness
                }, {
                    name: "acousticness",
                    value: data.acousticness
                }, {
                    name: "valence",
                    value: data.valence
                }, {
                    name: "speechiness",
                    value: data.speechiness
                }
            ];
            indivAudioFeaturesChart(features);
        }
    });

    $.ajax({
        url: "https://api.spotify.com/v1/tracks/" + id,
        type: "GET",
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
        },
        success: function(name) {
            console.log("TRACK INFO", name);
            $('#searchedTrack').empty();
            $('#clickedTrack').fadeIn('fast');
            $('#searchedTrack').append(name.name + ' | ' + name.artists[0].name);
        }
    });
}






// CHART: individual audio features
function indivAudioFeaturesChart(features) {
    $('.showDefinitions').fadeIn('fast');

    $('#indivAudioFeaturesChart').empty();

    var barChart = new britecharts.bar();
    var chartTooltip = new britecharts.miniTooltip();

    var chartContainer = d3.select('#indivAudioFeaturesChart');
    var containerWidth = chartContainer.node()
        ? chartContainer.node().getBoundingClientRect().width
        : false;

    barChart.width(containerWidth).height(300).isAnimated(true).horizontal(false).percentageAxisToMaxRatio(1.3).on('customMouseOver', chartTooltip.show).on('customMouseMove', chartTooltip.update).on('customMouseOut', chartTooltip.hide).colorSchema(["#d53e4f", "#fc8d59", "#3288bd", "#e6f598", "#99d594"]);

    chartContainer.datum(features).call(barChart);

    var tooltipContainer = chartContainer.select('.metadata-group'); // Do this only after chart is display, `.metadata-group` is a part of the chart's generated SVG
    tooltipContainer.datum([]).call(chartTooltip);
}

// CHART: averages of audio features for user's top tracks
function avgAudioFeaturesChart(averagesData) {

    $('#faveFeatures').empty();

    var barChart = new britecharts.bar();
    var chartTooltip = new britecharts.miniTooltip();

    var chartContainer = d3.select('#faveFeatures');
    var containerWidth = chartContainer.node()
        ? chartContainer.node().getBoundingClientRect().width
        : false;

    barChart.width(containerWidth).height(300).isAnimated(true).horizontal(false).percentageAxisToMaxRatio(1.3).on('customMouseOver', chartTooltip.show).on('customMouseMove', chartTooltip.update).on('customMouseOut', chartTooltip.hide).colorSchema(["#d53e4f", "#fc8d59", "#3288bd", "#e6f598", "#99d594"]);

    chartContainer.datum(averagesData).call(barChart);

    var tooltipContainer = chartContainer.select('.metadata-group'); // Do this only after chart is display, `.metadata-group` is a part of the chart's generated SVG
    tooltipContainer.datum([]).call(chartTooltip);
}
