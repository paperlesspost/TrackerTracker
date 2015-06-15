var TT = TT || {};
TT.Init = (function () {

  var pub = {};

  pub.firstRun = true;

  /* Information regarding Stories and Iterations :

     ================================================================

     Stories from Pivotal will be in one of the following states:
       accepted
       delivered
       finished
       rejected
       started
       planned
       unscheduled => Stories in Icebox will have this state.
       unstarted

     ================================================================

     Iterations are normalized via the TT JavaScript. This means that
     the current iteration, if defined, is set to 0, with additional
     interations starting at 1 and increasing. In other words:

     current_iteration === undefined
     ==> Story is in the Icebox (no iteration defined).
     current_iteration === 0
     ==> Story is in Current (iteration in Pivotal).
     current_iteration !== 0
     ==> Story is in a future iteration (not current).
  */

  pub.preloadColumns = function () {
    // Story is in Current and has not been started.
    TT.Model.Column.add({
      name: 'Unstarted',
      active: false,
      filter: function (story) {
        return story.current_iteration === 0 && (
          story.current_state === 'unstarted' || story.current_state === 'planned');
      },
      onDragIn: function (story) {
        return { current_state: 'unstarted' };
      }
    });

    // Story is in Current and has been started.
    TT.Model.Column.add({
      name: 'In Dev',
      active: true,
      filter: function (story) {
        return story.current_iteration === 0 && story.current_state === 'started';
      },
      onDragIn: function (story) {
        return {
          current_state: 'started',
          owned_by: story.owned_by || TT.Utils.getUsername(),
          estimate: story.estimate || '0'
        };
      }
    });

    // Story is in Current, finished, and needs code review.
    TT.Model.Column.add({
      name: 'Needs Code Review',
      active: true,
      filter: function (story) {
        return story.current_iteration === 0 &&
               story.current_state === 'finished' &&
               TT.Model.Story.hasTag(story, 'needs code review');
      },
      onDragIn: function (story) {
        return {
          current_state: 'finished',
          labels: TT.Model.Story.addTag(story, 'needs code review').labels,
          owned_by: story.owned_by || TT.Utils.getUsername(),
          estimate: story.estimate || '0'
        };
      },
      onDragOut: function (story) {
        return { labels: TT.Model.Story.removeTag(story, 'needs code review').labels };
      }
    });

    // Story is in Current, delivered, and needs design signoff.
    TT.Model.Column.add({
      name: 'Stakeholder Review',
      active: true,
      filter: function (story) {
        return story.current_iteration === 0 &&
               story.current_state === 'delivered' &&
               TT.Model.Story.hasTag(story, 'stakeholder review');
      },
      onDragIn: function (story) {
        return {
          current_state: 'delivered',
          labels: TT.Model.Story.addTag(story, 'stakeholder review').labels,
          owned_by: story.owned_by || TT.Utils.getUsername(),
          estimate: story.estimate || '0'
        };
      },
      onDragOut: function (story) {
        return { labels: TT.Model.Story.removeTag(story, 'stakeholder review').labels };
      }
    });

    // Story is in Current, delivered, and ready for QA.
    TT.Model.Column.add({
      name: 'Ready for QA',
      active: true,
      filter: function (story) {
        return story.current_iteration === 0 &&
               story.current_state === 'delivered' &&
               TT.Model.Story.hasTag(story, 'ready for qa');
      },
      onDragIn: function (story) {
        return {
          current_state: 'delivered',
          labels: TT.Model.Story.addTag(story, 'ready for qa').labels,
          owned_by: story.owned_by || TT.Utils.getUsername(),
          estimate: story.estimate || '0'
        };
      },
      onDragOut: function (story) {
        return { labels: TT.Model.Story.removeTag(story, 'ready for qa').labels };
      }
    });

    // Story is in Current, delivered, and in QA.
    TT.Model.Column.add({
      name: 'In QA',
      active: true,
      filter: function (story) {
        return story.current_iteration === 0 &&
               story.current_state === 'delivered' &&
               TT.Model.Story.hasTag(story, 'in qa');
      },
      onDragIn: function (story) {
        return {
          current_state: 'delivered',
          labels: TT.Model.Story.addTag(story, 'in qa').labels,
          owned_by: story.owned_by || TT.Utils.getUsername(),
          estimate: story.estimate || '0'
        };
      },
      onDragOut: function (story) {
        return { labels: TT.Model.Story.removeTag(story, 'in qa').labels };
      }
    });

    TT.Model.Column.add({
      name: 'Rejected',
      active: false,
      filter: function (story) {
        return story.current_state === 'rejected';
      },
      onDragIn: function (story) {
        return {
          current_state: 'rejected',
          owned_by: story.owned_by || TT.Utils.getUsername(),
          estimate: story.estimate || '0'
        };
      }
    });

    // This column will be used to capture stories left in odd states.
    TT.Model.Column.add({
      name: 'Needs Triage',
      active: false,
      filter: function (story) {
        // Stories have been kicked off staging (e.g. soul)
        // that were previously in one of the QA states.
        var qa_triage = story.current_iteration === 0 &&
                        story.current_state === 'finished' && (
                          TT.Model.Story.hasTag(story, 'ready for qa') ||
                          TT.Model.Story.hasTag(story, 'in qa')
                        );

        return qa_triage;
      }
    });

    // Story is in ready for Production.
    TT.Model.Column.add({
      name: 'Ready for Prod',
      active: true,
      filter: function (story) {
        return story.current_iteration === 0 &&
               story.current_state === 'delivered' &&
               TT.Model.Story.hasTag(story, 'ready for prod');
      },
      onDragIn: function (story) {
        return {
          current_state: 'delivered',
          labels: TT.Model.Story.addTag(story, 'ready for prod').labels,
          owned_by: story.owned_by || TT.Utils.getUsername(),
          estimate: story.estimate || '0'
        };
      },
      onDragOut: function (story) {
        return { labels: TT.Model.Story.removeTag(story, 'ready for prod').labels };
      }
    });

    TT.Model.Column.add({
      name: 'Accepted',
      active: false,
      filter: function (story) {
        return story.current_state === 'accepted';
      },
      onDragIn: function (story) {
        return {
          current_state: 'accepted',
          owned_by: story.owned_by || TT.Utils.getUsername(),
          estimate: story.estimate || '0'
        };
      }
    });

    /*
    Currently unused but potentially useful column additions:

    TT.Model.Column.add({
      name: 'Labels',
      active: false,
      sortable: false,
      template: function () {
        var labels = TT.Utils.sortByProperty(TT.Model.Label.find({ active: true }), 'name');
        return TT.View.render('epics', { labels: labels });
      },
      afterTemplateRender: function () {
        $('.epic').each(function () {
          var w = $(this).data('stories') + $(this).data('points');
          $(this).width(w * 2);
        });
      }
    });

    TT.Model.Column.add({
      name: 'Icebox',
      active: false,
      template: function () {
        return TT.View.render('emptyIcebox');
      },
      filter: function (story) {
        return story.current_state === 'unscheduled';
      },
      onDragIn: function (story) {
        return { current_state: 'unscheduled' };
      },
      onDragOut: function (story) {
        return { current_state: 'unstarted' };
      }
    });

    // Story is in the Pivotal Backlog.
    TT.Model.Column.add({
      name: 'Backlog',
      active: false,
      filter: function (story) {
        return story.current_iteration !== 0 && story.current_state === 'unstarted';
      }
    });

    TT.Model.Column.add({
      name: 'Current',
      active: false,
      filter: function (story) {
        return story.current_iteration === 0;
      }
    });

    TT.Model.Column.add({
      name: 'Delivered',
      active: true,
      filter: function (story) {
        return story.current_state === 'delivered';
      },
      onDragIn: function (story) {
        return {
          current_state: 'delivered',
          owned_by: story.owned_by || TT.Utils.getUsername(),
          estimate: story.estimate || '0'
        };
      }
    });
    */
  };

  pub.preloadFilters = function () {
    if (TT.Model.Filter.isEmpty({ name: 'Owned by Me' })) {
      TT.Model.Filter.add({
        name: 'Owned by Me',
        type: 'user',
        active: false,
        sticky: true,
        pure: true,
        fn: function (story) {
          return story.owned_by === $.cookie('pivotalUsername') ||
            TT.Model.Story.hasTag(story, '[pair=' + $.cookie('pivotalUsername').toLowerCase() + ']');
        }
      });
    } else {
      TT.Model.Filter.update({ name: 'Owned by Me' }, {
        fn: function (story) {
          return story.owned_by === $.cookie('pivotalUsername') ||
            TT.Model.Story.hasTag(story, '[pair=' + $.cookie('pivotalUsername').toLowerCase() + ']');
        }
      });
    }

    if (TT.Model.Filter.isEmpty({ name: 'Requested by Me' })) {
      TT.Model.Filter.add({
        name: 'Requested by Me',
        type: 'user',
        active: false,
        sticky: true,
        pure: true,
        fn: function (story) {
          return story.requested_by === $.cookie('pivotalUsername');
        }
      });
    }

    if (TT.Model.Filter.isEmpty({ name: 'QAed by Me' })) {
      TT.Model.Filter.add({
        name: 'QAed by Me',
        type: 'user',
        active: false,
        sticky: true,
        pure: true,
        fn: function (story) {
          return TT.Model.Story.hasTag(story, '[qa=' + $.cookie('pivotalUsername').toLowerCase() + ']');
        }
      });
    } else {
      TT.Model.Filter.update({ name: 'QAed by Me' }, {
        fn: function (story) {
          return TT.Model.Story.hasTag(story, '[qa=' + $.cookie('pivotalUsername').toLowerCase() + ']');
        }
      });
    }

    if (TT.Model.Filter.isEmpty({ name: 'Current Iteration' })) {
      TT.Model.Filter.add({
        name: 'Current Iteration',
        type: 'iteration',
        active: false,
        sticky: true,
        pure: true,
        fn: function (story) {
          return story.current_iteration === 0;
        }
      });
    }

    if (TT.Model.Filter.isEmpty({ name: 'Next Iteration' })) {
      TT.Model.Filter.add({
        name: 'Next Iteration',
        type: 'iteration',
        active: false,
        sticky: true,
        pure: true,
        fn: function (story) {
          return story.current_iteration === 1;
        }
      });
    }

    if (TT.Model.Filter.isEmpty({ name: 'Updated Recently' })) {
      TT.Model.Filter.add({
        name: 'Updated Recently',
        type: 'time',
        active: false,
        sticky: true,
        pure: true,
        fn: function (story) {
          var three_days = 1000 * 60 * 60 * 24 * 3;
          var updated = new Date(story.updated_at).getTime();
          return updated > (new Date().getTime() - three_days);
        }
      });
    }
  };

  pub.restoreFilters = function () {
    var filters = TT.Model.Filter.clientLoad();

    $.each(filters, function (index, filter) {
      if (filter.pure) {
        filter.fn = eval(filter.fn);
        TT.Model.Filter.add(filter);
      } else {
        if (filter.type === 'user') {
          filter.fn = function (story) {
            return story.owned_by === filter.name || story.requested_by === filter.name ||
              TT.Model.Story.hasTag(story, '[pair=' + name.toLowerCase() + ']') ||
              TT.Model.Story.hasTag(story, '[qa=' + name.toLowerCase() + ']');
          };
          TT.Model.Filter.add(filter);
        } else if (filter.type === 'tag') {
          filter.fn = function (story) {
            return TT.Model.Story.hasTag(story, filter.name);
          };
          TT.Model.Filter.add(filter);
        } else if (filter.type === 'search') {
          filter.active = false;
          var terms = TT.Search.parseSearchQuery(filter.name);
          filter.fn = function (story) {
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
          };
          TT.Model.Filter.add(filter);
          $('.filter[data-filter-id="' + filter.id + '"]').click(function () {
            TT.Search.requestMatchingStories(filter.name);
            $(this).unbind('click');
          });
        }
      }
    });
  };

  pub.setLayout = function () {
    var defaultLayout = [];
    TT.Model.Column.each(function (index, column) {
      defaultLayout[defaultLayout.length] = {
        name: column.name,
        active: column.active
      };
    });
    var savedLayout = TT.Model.Layout.clientLoad();

    // Reset when columns are updated. Check for:
    // (1) Unequal length of column layout.
    // (2) Whether any fields changed via JSON representation.
    if ((savedLayout && savedLayout.length !== defaultLayout.length) ||
         JSON.stringify(defaultLayout) !== JSON.stringify(savedLayout)) {
      savedLayout = defaultLayout;
    }

    TT.Model.Layout.replace(savedLayout ? savedLayout : defaultLayout);

    TT.Model.Layout.each(function (index, column) {
      TT.Model.Column.update({ name: column.name }, { active: column.active });
    });
  };

  pub.setInactiveProjects = function () {
    var projectList = TT.Utils.localStorage('projectList');

    if (projectList) {
      $('#projects .project').addClass('inactive');
      $.each(JSON.parse(projectList), function (index, id) {
        $('#project-' + id).removeClass('inactive');
      });
    }
  };

  pub.setDisabledProjects = function () {
    var projectList = TT.Utils.localStorage('projectDisabledList');

    $('#projects .project').removeClass('disabled');
    if (projectList) {
      $.each(JSON.parse(projectList), function (index, id) {
        $('#project-' + id).addClass('disabled');
      });
    }
  };

  pub.requestProjectsAndIterations = function (forceRefresh) {
    function useProjectData(projects) {
      TT.Ajax.end();
      pub.addProjects(projects);
      TT.View.drawProjectList(projects);
      pub.setInactiveProjects();
      pub.setDisabledProjects();
      pub.requestAllIterations();
      pub.requestIceboxSample();
    }

    TT.Ajax.start();
    var projects = TT.Utils.localStorage('projects');

    // Temporary backwards compatibility:
    if (projects && JSON.parse(projects).project) {
      forceRefresh = true;
    }

    if (projects && forceRefresh !== true) {
      useProjectData(JSON.parse(projects));
    } else {
      $.ajax({
        url: '/projects',
        success: function (projects) {
          projects = pub.reconcileProjectOrder(projects);
          TT.Utils.localStorage('projects', projects);
          useProjectData(projects);
        }
      });
    }
  };

  pub.requestIceboxSample = function () {
    TT.Search.requestMatchingStories('state:unscheduled', { limit: 50, showProgress: false });
  };

  pub.requestAllIterations = function () {
    TT.Model.Project.each(function (index, project) {
      if ($('#project-' + project.id).hasClass('disabled')) {
        return;
      }

      TT.Ajax.start();
      $.ajax({
        url: '/iterations',
        data: { projectID: project.id },
        success: function (iterations) {
          if (iterations) {
            pub.addIterations(project, iterations);
            TT.View.drawStories();
          } else {
            var note = 'Invalid response from the server. Did you enter the right token?';
            TT.View.message(note, { type: 'error' });
          }
          TT.Ajax.end();
        }
      });
    });
    TT.View.updateColumnDimensions();
  };

  pub.addProjects = function (projects) {
    $.each(projects, function (index, project) {
      TT.Model.Project.overwrite(project);
      if (project.memberships && project.memberships.membership) {
        var memberships = TT.Utils.normalizePivotalArray(project.memberships.membership);
        $.each(memberships, function (index, membership) {
          TT.Model.User.overwrite(membership, 'name');
        });
      }
      if (TT.Utils.isString(project.labels)) {
        $.each(project.labels.split(','), function (index, label) {
          TT.Model.Label.overwrite({ name: label }, 'name');
        });
      }
    });
  };

  pub.addIterations = function (project, iterations) {
    // This assumes first iteration is always current.
    var normalized_iteration = 0;
    $.each(iterations, function (index, iteration) {
      TT.Model.Iteration.overwrite({
        project_name: project.name,
        id: project.id + '.' + iteration.id,
        number: iteration.number,
        team_strength: iteration.team_strength,
        start: iteration.start,
        finish: iteration.finish
      });
      if (iteration.stories && iteration.stories.story) {
        var stories = TT.Utils.normalizePivotalArray(iteration.stories.story);
        $.each(stories, function (index, story) {
          story.current_iteration = normalized_iteration;
          TT.Model.Story.overwrite(story);
        });
      }
      normalized_iteration++;
    });
  };

  pub.reconcileProjectOrder = function (projects) {
    var existing = TT.Utils.localStorage('projects');
    if (!existing) {
      return projects;
    }
    existing = JSON.parse(existing);

    // Temporary backwards compatibility
    existing = existing.project ? existing.project : existing;

    return TT.Utils.reconcileArrayOrder('id', existing, projects);
  };

  pub.setUpdateInterval = function () {
    setInterval(function () {
      if ($.cookie('pivotalToken')) {
        pub.requestProjectsAndIterations(true);
      }
    }, 1000 * 60 * 5);
  };

  pub.initMarked = function () {
    if (window.marked) {
      window.marked.setOptions({
        breaks: true,
        gfm: true,
        pedantic: false,
        tables: false
      });
    }
  };

  pub.moduleInit = function () {
    $.each(TT, function (moduleName, module) {
      if (moduleName !== 'Init' && TT.Utils.isObject(module) &&
        TT.Utils.isFunction(module.init)) {
        module.init();
      }
    });
  };

  pub.resetUI = function () {
    $('#filters .filter').remove();
    $('#projects .projects').remove();

    TT.Workspace.preload();

    pub.preloadColumns();
    pub.restoreFilters();
    pub.preloadFilters();
    pub.setLayout();

    TT.View.drawColumns();
    TT.View.drawColumnListNav();
    TT.View.updateColumnDimensions();
  };

  pub.workspaceRefresh = function () {
    TT.Model.Column.flush();
    TT.Model.Filter.flush();
    TT.Model.Layout.flush();

    pub.resetUI();

    var projects = TT.Utils.localStorage('projects') || {};
    TT.View.drawProjectList(JSON.parse(projects));
    pub.setInactiveProjects();
    pub.setDisabledProjects();

    TT.View.drawStories();
  };

  pub.init = function () {
    if (pub.firstRun) {
      TT.View.drawPageLayout();
    } else {
      $.each(TT.Model, function (index, model) {
        if (model.flush) {
          model.flush();
        }
      });
    }

    pub.resetUI();

    if (pub.firstRun) {
      $(window).resize(TT.View.updateColumnDimensions);
      pub.moduleInit();
      pub.setUpdateInterval();
      pub.initMarked();
      if (TT.Utils.localStorage('fullscreen') === 'true') {
        TT.UI.toggleFullscreen();
      }
    }

    if ($.cookie('pivotalToken')) {
      pub.requestProjectsAndIterations();
    } else {
      TT.View.drawAccountSettingsForm();
    }

    pub.firstRun = false;
  };

  return pub;
}());

// bind init to jQuery on DOM Ready

if (TT.autoStart !== false) {
  $(TT.Init.init);
}
