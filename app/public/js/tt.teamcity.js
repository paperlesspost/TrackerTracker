var TT = TT || {};
TT.TeamCity = (function () {

  var pub = {};
  var COOKIES = ['teamcityHostname', 'teamcityUsername', 'teamcityPassword'];

  pub.isConfigured = function () {
    var configured = true;
    $.each(COOKIES, function (index, name) {
      if (!$.cookie(name)) {
        configured = false;
      }
    });

    return configured;
  };

  pub.getHighestNumber = function (numbers) {
    return Math.max.apply(Math, numbers);
  };

  pub.openSettings = function () {
    TT.Dialog.open(TT.View.render('teamcitySettings'));
    $.each(COOKIES, function (index, name) {
      $('#' + name).val($.cookie(name));
    });
  };

  pub.saveSettings = function () {
    $.each(COOKIES, function (index, name) {
      $.cookie(name, $('#' + name).val(), { expires: 365 });
    });
    TT.Dialog.close();

    return false;
  };

  pub.getBuildStatus = function (story) {
    TT.Ajax.get('/getTeamcityBuildStatus', {
      data: {
        storyID: story.id
      },
      callback: function (html) {
        story.buildStatus = '<span class="teamcity-not-found">Build not found</span>';

        if (html) {
          html = $(html);

          // Highest number tends to be merged builds, so favoring TC order.
          // var buildNumber = pub.getHighestNumber(html
          //  .find('tr.searchItem .buildNumber a.resultsLink').text().split('#'));
          var buildNumber = html.find('tr.searchItem .buildNumber a.resultsLink')
            .first().text().replace('#', '');
          var successful = html.find('tr.searchItem a.resultsLink:contains(' + buildNumber + ')')
            .closest('.statusText').text().indexOf('failed') === -1;
          var linkClass = successful ? 'teamcity-successful' : 'teamcity-failed';
          var url = $.cookie('teamcityHostname') +
            '/searchResults.html?query=' + buildNumber;

          if (buildNumber) {
            story.buildStatus = '<a href="' + url + '" target="_blank" class="' +
              linkClass + ' external">#' + buildNumber + '</a>';
          }
        }

        TT.View.redrawStory(story);
      }
    });
  };

  pub.beforeStoryDetailsRender = function (event, story) {
    if (!story.buildStatus && pub.isConfigured()) {
      story.buildStatus = '<span class="teamcity-loading">Loading...</span>';
      pub.getBuildStatus(story);
    }
  };

  pub.init = function () {
    TT.Event.bind('beforeStoryDetailsRender', pub.beforeStoryDetailsRender);
  };

  return pub;

}());
