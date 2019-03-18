import React from 'react/addons';
import metrics from '../utils/MetricsUtil';
import Router from 'react-router';
import util from '../utils/Util';
import electron from 'electron';
//+++
//Author:KumaNNN
//GitHub:https://github.com/KumaNNNProject/kitematic
import {shell} from 'electron';
//+++
const remote = electron.remote;

var Preferences = React.createClass({
  mixins: [Router.Navigation],
  getInitialState: function () {
    return {
      closeVMOnQuit: localStorage.getItem('settings.closeVMOnQuit') === 'true',
      useVM: localStorage.getItem('settings.useVM') === 'true',
      metricsEnabled: metrics.enabled(),
      terminalShell: localStorage.getItem('settings.terminalShell') || "sh",
      terminalPath: localStorage.getItem('settings.terminalPath') || "/usr/bin/xterm",
      startLinkedContainers: localStorage.getItem('settings.startLinkedContainers') === 'true'
    };
  },
  handleGoBackClick: function () {
    this.goBack();
    metrics.track('Went Back From Preferences');
  },
  handleChangeCloseVMOnQuit: function (e) {
    var checked = e.target.checked;
    this.setState({
      closeVMOnQuit: checked
    });
    localStorage.setItem('settings.closeVMOnQuit', checked);
    metrics.track('Toggled Close VM On Quit', {
      close: checked
    });
  },
  handleChangeUseVM: function (e) {
    var checked = e.target.checked;
    this.setState({
      useVM: checked
    });
    localStorage.setItem('settings.useVM', checked);
    util.isNative();
    metrics.track('Toggled VM or Native settting', {
      vm: checked
    });
  },
  handleChangeMetricsEnabled: function (e) {
    var checked = e.target.checked;
    this.setState({
      metricsEnabled: checked
    });
    metrics.setEnabled(checked);
    metrics.track('Toggled util/MetricsUtil', {
      enabled: checked
    });
  },
  handleChangeTerminalShell: function (e) {
    var value = e.target.value;
    this.setState({
      terminalShell: value
    });
    localStorage.setItem('settings.terminalShell', value);
  },
  handleChangeTerminalPath: function (e) {
    var value = e.target.value;
    this.setState({
      terminalPath: value
    });
    localStorage.setItem('settings.terminalPath', value);
  },
  handleChangeStartLinkedContainers: function (e) {
    var checked = e.target.checked;
    this.setState({
      startLinkedContainers: checked
    });
    localStorage.setItem('settings.startLinkedContainers', checked ? 'true' : 'false');
  },
  handleCnClick:function(){
	//+++ New Function 
	//+++ Author:KumaNNN
	//+++ GitHub:https://github.com/KumaNNNProject/kitematic
	var CNrepoUri = 'https://github.com/KumaNNNProject/kitematic'; 
	shell.openExternal(CNrepoUri);
  },
  render: function () {
    var vmSettings, vmShutdown, nativeSetting, linuxSettings;

    if (process.platform !== 'linux') {
      // We are on a Mac or Windows
      if (util.isNative() || (localStorage.getItem('settings.useVM') === 'true')) {
        nativeSetting = (
            <div className="option">
              <div className="option-name">
                <label htmlFor="useVM">使用VirtualBox替代本地的在下一次重启时</label>
              </div>
              <div className="option-value">
                <input id="useVM" type="checkbox" checked={this.state.useVM} onChange={this.handleChangeUseVM}/>
              </div>
            </div>
        );
      }
      if (!util.isNative()) {
        vmShutdown = (
            <div className="option">
              <div className="option-name">
                <label htmlFor="closeVMOnQuit">关闭Linux虚拟机在关闭Kitematic时</label>
              </div>
              <div className="option-value">
                <input id="closeVMOnQuit" type="checkbox" checked={this.state.closeVMOnQuit} onChange={this.handleChangeCloseVMOnQuit}/>
              </div>
            </div>
        );
      }

      vmSettings = (
          <div>
            <div className="title">虚拟机设置</div>
            {vmShutdown}
            {nativeSetting}
          </div>
      );
    }

    if (process.platform === "linux") {
      linuxSettings = (
        <div>
          <div className="option">
            <div className="option-name">
              <label htmlFor="terminalPath">终端路径</label>
            </div>
            <div className="option-value">
              <input id="terminalPath" type="text" value={this.state.terminalPath} onChange={this.handleChangeTerminalPath}/>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="preferences">
        <div className="preferences-content">
          <a onClick={this.handleGoBackClick}>返回</a>
          {vmSettings}
          <div className="title">应用程序设置</div>
          <div className="option">
            <div className="option-name">
              <label htmlFor="metricsEnabled">匿名报告使用情况分析</label>
            </div>
            <div className="option-value">
              <input id="metricsEnabled" type="checkbox" checked={this.state.metricsEnabled} onChange={this.handleChangeMetricsEnabled}/>
            </div>
          </div>
          <div className="option">
            <div className="option-name">
              <label htmlFor="terminalShell">执行命令的shell</label>
            </div>
            <div className="option-value">
              <select id="terminalShell" value={this.state.terminalShell} onChange={this.handleChangeTerminalShell}>
                <option value="sh">sh</option>
                <option value="bash">bash</option>
              </select>
            </div>
          </div>
          <div className="option">
            <div className="option-name">
              <label htmlFor="startLinkedContainers">启动时连接容器</label>
            </div>
            <div className="option-value">
              <input id="startLinkedContainers" type="checkbox" checked={this.state.startLinkedContainers} onChange={this.handleChangeStartLinkedContainers}/>
            </div>
          </div>
		  <br/>
		  <br/>
		  <div className="option">Kitematic：&nbsp;v0.17.7</div>
		  <div className="option">
			翻译：&nbsp;<div onClick={this.handleCnClick}><a>KumaNNN</a></div>
		  </div>		  
          {linuxSettings}
        </div>
      </div>
    );
  }
});

module.exports = Preferences;
