var TT = TT || {};
TT.Search = (function () {

  var pub = {};

  pub.parseSearchQuery = function (term) {
    return term.split(' ').map(function (term) {
      return (term.indexOf(':') !== -1 ? term.split(':')[1] : term).replace(/\'\"/g, '');
    });
  };

  pub.addSearchTag = function (term) {
    var terms = pub.parseSearchQuery(term);

    TT.Model.Filter.add({
      name: term,
      type: 'search',
      fn: function (story) {
        if (terms.length === 0) {
          return true;
        }
        var text = JSON.stringify(story).toLowerCase();
        var match = true;
        $.each(terms, function (i, term) {
          if (text.indexOf(term) === -1) {
            match = false;
          }
        });

        return match;
      }
    });
    TT.View.drawStories();
  };

  pub.includeDone = function () {
    return $('#includeDone').is(':checked');
  };

  pub.requestMatchingStories = function (term, options) {
    var defaults = {
      limit: 500,
      offset: 0,
      showProgress: true
    };

    options = $.extend(defaults, options);
    if (pub.includeDone()) {
      term += ' includedone:true';
    }

    var projectCount = TT.Model.Project.length();
    var projectsSearched = 0;
    var storiesFound = 0;

    if (options.showProgress) {
      var html = TT.View.render('searchProgress', {
        percentCompleted: 0,
        projectCount: projectCount,
        projectsSearched: projectsSearched,
        storiesFound: storiesFound,
        term: term
      });
      var message = TT.View.message(html, { timeout: false, type: 'search' });
    }

    TT.Model.Project.each(function (index, project) {
      if ($('#project-' + project.id).hasClass('disabled')) {
        return false;
      }

      TT.Ajax.start();
      $.ajax({
        url: '/stories',
        data: {
          projectID: project.id,
          filter: term,
          limit: options.limit,
          offset: options.offset
        },
        success: function (stories) {
          projectsSearched++;
          stories = TT.Utils.normalizePivotalArray(stories.story);
          if (stories) {
            $.each(stories, function (index, story) {
              story.id = parseInt(story.id, 10);
              TT.Model.Story.overwrite(story);
            });
            TT.View.drawStories();
            storiesFound += stories.length;
          }
          TT.Ajax.end();
          var html = TT.View.render('searchProgress', {
            percentCompleted: (projectsSearched / projectCount) * 100,
            projectCount: projectCount,
            projectsSearched: projectsSearched,
            storiesFound: storiesFound,
            term: term
          });
          if (options.showProgress) {
            message.find('.text').html(html);
            if (projectsSearched === projectCount) {
              setTimeout(function () {
                message.fadeOut(250, function () { message.remove(); });
              }, 1000);
            }
          }
        }
      });
    });
  };

  pub.submitSearch = function () {
    var search = $('#search input');
    var term = $.trim(search.val().toLowerCase());
    if (term) {
      pub.addSearchTag(term);
      pub.requestMatchingStories(term);
    }
    search.val('');
  };

  pub.init = function () {
    var timeout;
    $('#search input').keyup(function (e) {
      if (TT.Utils.keyPressed(e, 'ENTER')) {
        pub.submitSearch();
      }
    });
  };

  return pub;

}());
