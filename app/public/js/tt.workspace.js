var TT = TT || {};
TT.Workspace = (function () {

  var pub = {};

  pub.DEFAULT_NAME = 'Custom Workspace';

  pub.WORKSPACE_KEYS = [
    'Filter',
    'Layout',
    'projectList'
  ];

  pub.openDropdown = function () {
    if ($('#autocomplete .save-new-workspace').length > 0) {
      TT.Autocomplete.close();

      return false;
    }

    var items = [{ name: TT.View.render('saveNewWorkspace'), value: 'New' }];

    TT.Model.Workspace.each(function (index, workspace) {
      items[items.length] = {
        name: TT.View.render('loadWorkspace', { name: workspace.name }),
        value: workspace.name
      };
    });

    TT.Autocomplete.open({
      customTopOffset: 4,
      items: items,
      target: this,
      css: { width: 260 },
      maxHeight: $(window).height() - 60,
      noActive: true,
      onApply: function (value) {
        pub.loadWorkspace(value);
      }
    });

    var currentWorkspace = pub.getCurrentWorkspace();
    var active = $('#autocomplete .item').filter(function () {
      return $(this).data('value') === currentWorkspace || $(this).text() === currentWorkspace;
    });
    if (active.length) {
      TT.Autocomplete.setActive(active);
    }

    return false;
  };

  pub.saveWorkspace = function (name) {
    if (!TT.Utils.isString(name)) {
      name = $.trim($('#new-workspace-name').val());
    }
    var workspace = { name: name };

    $.each(pub.WORKSPACE_KEYS, function (index, key) {
      workspace[key] = TT.Utils.localStorage(key);
    });

    TT.Model.Workspace.overwrite(workspace, 'name');
    TT.Model.Workspace.clientSave();
    pub.setCurrentWorkspace(name);
    TT.View.message('Workspace <strong>' + name + '</strong> saved.', 'success');
    TT.Autocomplete.close();

    return false;
  };

  pub.loadWorkspace = function (name) {
    var workspace = TT.Model.Workspace.get({ name: name });

    if (workspace) {
      $.each(pub.WORKSPACE_KEYS, function (index, key) {
        TT.Utils.localStorage(key, workspace[key]);
      });
      pub.setCurrentWorkspace(name);
      TT.Init.workspaceRefresh();
      TT.View.message('Workspace <strong>' + name + '</strong> loaded.', 'success');
    } else {
      TT.View.message('Workspace <strong>' + name + '</strong> not found.', 'error');
    }
  };

  pub.deleteWorkspace = function () {
    var name = $.trim($(this).parent().text());
    TT.Model.Workspace.remove({ name: name });
    TT.Model.Workspace.clientSave();
    TT.View.message('Workspace <strong>' + name + '</strong> removed.', 'success');
    TT.Autocomplete.close();

    if (name === pub.getCurrentWorkspace()) {
      pub.setCurrentWorkspace(pub.DEFAULT_NAME);
    }

    return false;
  };

  pub.setCurrentWorkspace = function (name) {
    TT.Utils.localStorage('CurrentWorkspace', name);
    $('#workspace-dropdown').text(name);
  };

  pub.getCurrentWorkspace = function () {
    return TT.Utils.localStorage('CurrentWorkspace') || pub.DEFAULT_NAME;
  };

  pub.preload = function () {
    TT.Model.Workspace = TT.Model.Model('Workspace');
    var workspaces = TT.Model.Workspace.clientLoad();

    if (workspaces) {
      TT.Model.Workspace.replace(workspaces);
    } else {
      pub.saveWorkspace(pub.DEFAULT_NAME);
    }

    $('#workspace-dropdown').text(pub.getCurrentWorkspace());
  };

  pub.init = function () {
    $(window).bind('keyup', function (e) {
      if (e && (e.which >= 49 && e.which <= 57)) {
        var id = e.which - 49;
        var workspace = TT.Model.Workspace.get()[id];
        if (workspace && workspace.name) {
          pub.loadWorkspace(workspace.name);
        }
      }
    });
  };

  return pub;

}());
