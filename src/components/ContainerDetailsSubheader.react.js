import _ from 'underscore';
import React from 'react';
import {shell} from 'electron';
import metrics from '../utils/MetricsUtil';
import ContainerUtil from '../utils/ContainerUtil';
import classNames from 'classnames';
import containerActions from '../actions/ContainerActions';
import dockerMachineUtil from '../utils/DockerMachineUtil';

var ContainerDetailsSubheader = React.createClass({
  contextTypes: {
    router: React.PropTypes.func
  },
  disableRun: function () {
    if (!this.props.container) {
      return true;
    }
    return (!this.props.container.State.Running || !this.props.defaultPort || this.props.container.State.Updating);
  },
  disableRestart: function () {
    if (!this.props.container) {
      return true;
    }
    return (this.props.container.State.Stopping || this.props.container.State.Downloading || this.props.container.State.Restarting || this.props.container.State.Updating);
  },
  disableStop: function () {
    if (!this.props.container) {
      return true;
    }
    return (this.props.container.State.Stopping || this.props.container.State.Downloading || this.props.container.State.ExitCode || !this.props.container.State.Running || this.props.container.State.Updating);
  },
  disableStart: function () {
    if (!this.props.container) {
      return true;
    }
    return (this.props.container.State.Downloading || this.props.container.State.Running || this.props.container.State.Updating);
  },
  disableTerminal: function () {
    if (!this.props.container) {
      return true;
    }
    return (this.props.container.State.Stopping || !this.props.container.State.Running || this.props.container.State.Updating);
  },
  disableTab: function () {
    if (!this.props.container) {
      return false;
    }
    return (this.props.container.State.Downloading);
  },
  showHome: function () {
    if (!this.disableTab()) {
      metrics.track('查看主页', {
        from: 'header'
      });
      this.context.router.transitionTo('containerHome', {name: this.context.router.getCurrentParams().name});
    }
  },
  showSettings: function () {
    if (!this.disableTab()) {
      metrics.track('查看设置');
      this.context.router.transitionTo('containerSettings', {name: this.context.router.getCurrentParams().name});
    }
  },
  handleRun: function () {
    if (this.props.defaultPort && !this.disableRun()) {
      metrics.track('在浏览器中打开', {
        from: 'header'
      });
      shell.openExternal(this.props.ports[this.props.defaultPort].url);
    }
  },
  handleRestart: function () {
    if (!this.disableRestart()) {
      metrics.track('已重启容器');
      containerActions.restart(this.props.container.Name);
    }
  },
  handleStop: function () {
    if (!this.disableStop()) {
      metrics.track('已停止容器');
      containerActions.stop(this.props.container.Name);
    }
  },
  handleStart: function () {
    if (!this.disableStart()) {
      metrics.track('已启动容器');
      containerActions.start(this.props.container.Name);
    }
  },
  handleDocs: function () {
    let repoUri = 'https://hub.docker.com/r/';
    let imageName = this.props.container.Config.Image.split(':')[0];
    if (imageName.indexOf('/') === -1) {
      repoUri = repoUri + 'library/' + imageName;
    } else {
      repoUri = repoUri + imageName;
    }
    shell.openExternal(repoUri);
  },
  handleTerminal: function () {
    if (!this.disableTerminal()) {
      metrics.track('终端已进入容器');
      var container = this.props.container;
      var shell = ContainerUtil.env(container).reduce((envs, env) => {
        envs[env[0]] = env[1];
        return envs;
      }, {}).SHELL;

      if(!shell) {
        shell = localStorage.getItem('settings.terminalShell') || 'sh';
      }
      dockerMachineUtil.dockerTerminal(`docker exec -it ${this.props.container.Name} ${shell}`);
    }
  },
  render: function () {
    var restartActionClass = classNames({
      action: true,
      disabled: this.disableRestart()
    });
    var stopActionClass = classNames({
      action: true,
      disabled: this.disableStop()
    });
    var startActionClass = classNames({
      action: true,
      disabled: this.disableStart()
    });
    var terminalActionClass = classNames({
      action: true,
      disabled: this.disableTerminal()
    });
    var docsActionClass = classNames({
      action: true,
      disabled: false
    });

    var currentRoutes = _.map(this.context.router.getCurrentRoutes(), r => r.name);
    var currentRoute = _.last(currentRoutes);

    var tabHomeClasses = classNames({
      'details-tab': true,
      'active': currentRoute === 'containerHome',
      disabled: this.disableTab()
    });
    var tabSettingsClasses = classNames({
      'details-tab': true,
      'active': currentRoutes && (currentRoutes.indexOf('containerSettings') >= 0),
      disabled: this.disableTab()
    });
    var startStopToggle;
    if (this.disableStop()) {
      startStopToggle = (
        <div className={startActionClass}>
          <div className="action-icon start" onClick={this.handleStart}><span className="icon icon-start"></span></div>
          <div className="btn-label">启动</div>
        </div>
      );
    } else {
      startStopToggle = (
        <div className={stopActionClass}>
          <div className="action-icon stop" onClick={this.handleStop}><span className="icon icon-stop"></span></div>
          <div className="btn-label">停止</div>
        </div>
      );
    }

    return (
      <div className="details-subheader">
        <div className="details-header-actions">
          {startStopToggle}
          <div className={restartActionClass}>
            <div className="action-icon" onClick={this.handleRestart}><span className="icon icon-restart"></span></div>
            <div className="btn-label">重启</div>
          </div>
          <div className={terminalActionClass}>
            <div className="action-icon" onClick={this.handleTerminal}><span className="icon icon-docker-exec"></span></div>
            <div className="btn-label">执行</div>
          </div>
          <div className={docsActionClass}>
            <div className="action-icon" onClick={this.handleDocs}><span className="icon icon-open-external"></span></div>
            <div className="btn-label">文档</div>
          </div>
        </div>
        <div className="details-subheader-tabs">
          <span className={tabHomeClasses} onClick={this.showHome}>主页</span>
          <span className={tabSettingsClasses} onClick={this.showSettings}>设置</span>
        </div>
      </div>
    );
  }
});

module.exports = ContainerDetailsSubheader;
