import React from 'react/addons';
import Router from 'react-router';
import Radial from './Radial.react.js';
import RetinaImage from 'react-retina-image';
import Header from './Header.react';
import util from '../utils/Util';
import metrics from '../utils/MetricsUtil';
import setupStore from '../stores/SetupStore';
import setupActions from '../actions/SetupActions';
import {shell} from 'electron';


var Setup = React.createClass({
  mixins: [Router.Navigation],

  getInitialState: function () {
    return setupStore.getState();
  },

  componentDidMount: function () {
    setupStore.listen(this.update);
  },

  componentWillUnmount: function () {
    setupStore.unlisten(this.update);
  },

  update: function () {
    this.setState(setupStore.getState());
  },

  handleErrorRetry: function () {
    setupActions.retry(false);
  },

  handleUseVbox: function () {
    setupActions.useVbox();
  },

  handleErrorRemoveRetry: function () {
    console.log('正在删除虚拟机并重试...' );
    setupActions.retry(true);
  },

  handleResetSettings: function () {
    metrics.track('Settings reset', {
      from: 'setup'
    });
    localStorage.removeItem('settings.useVM');
    setupActions.retry(false);
  },

  handleToolBox: function () {
    metrics.track('Getting toolbox', {
      from: 'setup'
    });
    shell.openExternal('https://www.docker.com/docker-toolbox');
  },

  handleLinuxDockerInstall: function () {
    metrics.track('Opening Linux Docker installation instructions', {
      from: 'setup'
    });
    shell.openExternal('http://docs.docker.com/linux/started/');
  },

  renderContents: function () {
    return (
      <div className="contents">
        <RetinaImage src="boot2docker.png" checkIfRetinaImgExists={false}/>
        <div className="detail">
          <Radial progress={Math.round(this.state.progress)} thick={true} gray={true}/>
        </div>
      </div>
    );
  },

  renderProgress: function () {
    let title = '开启Docker虚拟机';
    let descr = '运行Docker容器在你的计算机，Kitematic正在启动一个Linux虚拟机。这可能需要一分钟…';
    if (util.isNative()) {
      title = '检查 Docker';
      descr = '运行Docker容器在你的计算机，Kitematic正在检查 Docker 连接';
    }
    return (
      <div className="setup">
        <Header hideLogin={true}/>
        <div className="setup-content">
          <div className="image">
            {this.renderContents()}
          </div>
          <div className="desc">
            <div className="content">
              <h1>{title}</h1>
              <p>{descr}</p>
            </div>
          </div>
        </div>
      </div>
    );
  },

  renderError: function () {
    let deleteVmAndRetry;

    if (util.isLinux()) {
      if (!this.state.started) {
        deleteVmAndRetry = (
          <button className="btn btn-action" onClick={this.handleLinuxDockerInstall}>安装 Docker</button>
        );
      }
    } else if (util.isNative()) {
      deleteVmAndRetry = (
        <button className="btn btn-action" onClick={this.handleUseVbox}>使用 VirtualBox</button>
      );
    } else if (this.state.started) {
      deleteVmAndRetry = (
        <button className="btn btn-action" onClick={this.handleErrorRemoveRetry}>删除虚拟机(VM) &amp; 重试设置</button>
      );
    } else {
      deleteVmAndRetry = (
        <button className="btn btn-action" onClick={this.handleToolBox}>获取工具箱(Toolbox)</button>
      );
    }
    let usualError = (
      <div className="content">
        <h4>设置错误</h4>
        <h1>我们很抱歉!</h1>
        <p>Kitematic似乎发生了意外错误:</p>
        <p className="error">{this.state.error.message || this.state.error}</p>
        <p className="setup-actions">
          <button className="btn btn-action" onClick={this.handleErrorRetry}>重试设置</button>
          {{deleteVmAndRetry}}
        </p>
      </div>
    );
    if (util.isNative()) {
      if (util.isLinux()) {
        usualError = (
          <div className="content">
            <h1>设置初始化</h1>
            <p>我们找不到本地设置 - 单击重试按钮再次检查。</p>
            <p className="setup-actions">
              <button className="btn btn-action" onClick={this.handleErrorRetry}>重试设置</button>
            </p>
          </div>
        );
      } else {
        usualError = (
          <div className="content">
            <h1>设置初始化</h1>
            <p>我们找不到本地设置 - 单击VirtualBox按钮使用VirtualBox代替或重试按钮再次检查。</p>
            <p className="setup-actions">
              <button className="btn btn-action" onClick={this.handleErrorRetry}>重试设置</button>
              {{deleteVmAndRetry}}
            </p>
          </div>
        );
      }
    }
    return (
      <div className="setup">
        <Header hideLogin={true}/>
        <div className="setup-content">
          <div className="image">
            <div className="contents">
              <RetinaImage src="install-error.png" checkIfRetinaImgExists={false}/>
              <div className="detail">
               <a className="btn btn-danger small" onClick={this.handleResetSettings}>重置</a> 
              </div>
            </div>
          </div>
          <div className="desc">
            {usualError}
          </div>
        </div>
      </div>
    );
  },

  render: function () {
    if (this.state.error) {
      return this.renderError();
    } else {
      return this.renderProgress();
    }
  }
});

module.exports = Setup;
