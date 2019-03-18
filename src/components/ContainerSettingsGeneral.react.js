import _ from 'underscore';
import React from 'react/addons';
import metrics from '../utils/MetricsUtil';
import electron, { clipboard } from 'electron';
const remote = electron.remote;
const dialog = remote.dialog;
import ContainerUtil from '../utils/ContainerUtil';
import containerActions from '../actions/ContainerActions';
import util from '../utils/Util';

var ContainerSettingsGeneral = React.createClass({
  mixins: [React.addons.LinkedStateMixin],

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState: function () {
    let env = ContainerUtil.env(this.props.container) || [];
    env.push(['', '']);

    env = _.map(env, e => {
      return [util.randomId(), e[0], e[1]];
    });

    return {
      slugName: null,
      nameError: null,
      copiedId: false,
      env: env
    };
  },

  handleNameChange: function (e) {
    var name = e.target.value;
    if (name === this.state.slugName) {
      return;
    }

    name = name.replace(/^\s+|\s+$/g, ''); // Trim
    name = name.toLowerCase();
    // Remove Accents
    let from = "àáäâèéëêìíïîòóöôùúüûñç·/,:;";
    let to   = "aaaaeeeeiiiioooouuuunc-----";
    for (var i=0, l=from.length ; i<l ; i++) {
      name = name.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }
    name = name.replace(/[^a-z0-9-_.\s]/g, '') // Remove invalid chars
      .replace(/\s+/g, '-') // Collapse whitespace and replace by -
      .replace(/-+/g, '-')  // Collapse dashes
      .replace(/_+/g, '_'); // Collapse underscores

    this.setState({
      slugName: name
    });
  },

  handleNameOnKeyUp: function (e) {
    if (e.keyCode === 13 && this.state.slugName) {
      this.handleSaveContainerName();
    }
  },

  handleCopyContainerId: function() {
    clipboard.writeText(this.props.container.Id);
    this.setState({ 
      copiedId: true
    });

    var _this = this;
    setTimeout(function() {
      _this.setState({ 
        copiedId: false
      });
    }, 5000);
  },

  handleSaveContainerName: function () {
    var newName = this.state.slugName;
    if (newName === this.props.container.Name) {
      return;
    }

    this.setState({
      slugName: null
    });

    if (this.props.containers[newName]) {
      this.setState({
        nameError: '已存在具有此名称的容器.'
      });
      return;
    }

    containerActions.rename(this.props.container.Name, newName);
    this.context.router.transitionTo('containerSettingsGeneral', {name: newName});
    metrics.track('更改的容器名称');
  },

  handleSaveEnvVars: function () {
    metrics.track('保存的环境变量');
    let list = [];
    _.each(this.state.env, kvp => {
      let [, key, value] = kvp;
      if ((key && key.length) || (value && value.length)) {
        list.push(key + '=' + value);
      }
    });
    containerActions.update(this.props.container.Name, {Env: list});
  },

  handleChangeEnvKey: function (index, event) {
    let env = _.map(this.state.env, _.clone);
    env[index][1] = event.target.value;
    this.setState({
      env: env
    });
  },

  handleChangeEnvVal: function (index, event) {
    let env = _.map(this.state.env, _.clone);
    env[index][2] = event.target.value;
    this.setState({
      env: env
    });
  },

  handleAddEnvVar: function () {
    let env = _.map(this.state.env, _.clone);
    env.push([util.randomId(), '', '']);
    this.setState({
      env: env
    });
    metrics.track('添加了挂起的环境变量');
  },

  handleRemoveEnvVar: function (index) {
    let env = _.map(this.state.env, _.clone);
    env.splice(index, 1);

    if (env.length === 0) {
      env.push([util.randomId(), '', '']);
    }

    this.setState({
      env: env
    });

    metrics.track('删除的环境变量');
  },

  handleDeleteContainer: function () {
    dialog.showMessageBox({
      message: '确定要删除此容器吗?',
      buttons: ['删除', '取消']
    }, index => {
      if (index === 0) {
        metrics.track('已删除容器', {
          from: 'settings',
          type: 'existing'
        });
        containerActions.destroy(this.props.container.Name);
      }
    });
  },

  render: function () {
    if (!this.props.container) {
      return false;
    }

    var clipboardStatus;
    var willBeRenamedAs;
    var btnSaveName = (
      <a className="btn btn-action" onClick={this.handleSaveContainerName} disabled="disabled">保存</a>
    );
    if (this.state.slugName) {
      willBeRenamedAs = (
        <p>将重命名为: <strong>{this.state.slugName}</strong></p>
      );
      btnSaveName = (
        <a className="btn btn-action" onClick={this.handleSaveContainerName}>保存</a>
      );
    } else if (this.state.nameError) {
      willBeRenamedAs = (
        <p><strong>{this.state.nameError}</strong></p>
      );
    }

    if (this.state.copiedId) {
      clipboardStatus = (
        <p className="fadeOut"><strong>已复制到剪贴板</strong></p>
      );
    }

    let containerInfo = (
      <div className="settings-section">
        <h3>容器信息</h3>
        <div className="container-info-row">
          <div className="label-id">ID</div>
          <input type="text" className="line disabled" defaultValue={this.props.container.Id} disabled></input>
          <a className="btn btn-action btn-copy" onClick={this.handleCopyContainerId}>复制</a>
          {clipboardStatus}
        </div>
        <div className="container-info-row">
          <div className="label-name">名称</div>
          <input id="input-container-name" type="text" className="line" placeholder="容器名称" defaultValue={this.props.container.Name} onChange={this.handleNameChange} onKeyUp={this.handleNameOnKeyUp}></input>
          {btnSaveName}
          {willBeRenamedAs}
        </div>
      </div>
    );

    let vars = _.map(this.state.env, (kvp, index) => {
      let [id, key, val] = kvp;
      let icon;
      if (index === this.state.env.length - 1) {
        icon = <a onClick={this.handleAddEnvVar} className="only-icon btn btn-positive small"><span className="icon icon-add"></span></a>;
      } else {
        icon = <a onClick={this.handleRemoveEnvVar.bind(this, index)} className="only-icon btn btn-action small"><span className="icon icon-delete"></span></a>;
      }

      return (
        <div key={id} className="keyval-row">
          <input type="text" className="key line" defaultValue={key} onChange={this.handleChangeEnvKey.bind(this, index)}></input>
          <input type="text" className="val line" defaultValue={val} onChange={this.handleChangeEnvVal.bind(this, index)}></input>
          {icon}
        </div>
      );
    });

    return (
      <div className="settings-panel">
        {containerInfo}
        <div className="settings-section">
          <h3>环境变量</h3>
          <div className="env-vars-labels">
            <div className="label-key">键(KEY)</div>
            <div className="label-val">值(VALUE)</div>
          </div>
          <div className="env-vars">
            {vars}
          </div>
          <a className="btn btn-action" disabled={this.props.container.State.Updating} onClick={this.handleSaveEnvVars}>保存</a>
        </div>
        <div className="settings-section">
          <h3>删除容器</h3>
          <a className="btn btn-action" onClick={this.handleDeleteContainer}>删除容器</a>
        </div>
      </div>
    );
  }
});

module.exports = ContainerSettingsGeneral;
