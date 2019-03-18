import _ from 'underscore';
import $ from 'jquery';
import React from 'react/addons';
import ContainerProgress from './ContainerProgress.react';
import ContainerHomePreview from './ContainerHomePreview.react';
import ContainerHomeLogs from './ContainerHomeLogs.react';
import ContainerHomeFolders from './ContainerHomeFolders.react';
import {shell} from 'electron';

var ContainerHome = React.createClass({
  contextTypes: {
    router: React.PropTypes.func
  },

  componentDidMount: function () {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
  },

  componentWillUnmount: function () {
    window.removeEventListener('resize', this.handleResize);
  },

  componentDidUpdate: function () {
    this.handleResize();
  },

  handleResize: function () {
    $('.full .wrapper').height(window.innerHeight - 132);
    $('.left .wrapper').height(window.innerHeight - 132);
    $('.right .wrapper').height(window.innerHeight / 2 - 55);
  },

  handleErrorClick: function () {
    // Display wiki for proxy: https://github.com/docker/kitematic/wiki/Common-Proxy-Issues-&-Fixes
    shell.openExternal('https://github.com/kitematic/kitematic/issues/new');
  },

  showWeb: function () {
    return _.keys(this.props.ports).length > 0;
  },

  showFolders: function () {
    return this.props.container.Mounts && this.props.container.Mounts.length > 0 && this.props.container.State.Running;
  },

  render: function () {
    if (!this.props.container) {
      return '';
    }

    let body;
    if (this.props.container.Error) {
      let error = this.props.container.Error.message;
      if (!error) {
        error = this.props.container.Error;
      } else {
        if (error.indexOf('ETIMEDOUT') !== -1) {
          error = '超时错误 - 尝试重启你的虚拟机通过运行: \n"docker-machine restart default" 在一个终端';
        }
        if (error.indexOf('ECONNREFUSED') !== -1) {
          error = '你的虚拟机启动并运行了吗？检查"Docker PS"是否在终端中工作.';
        }
      }
      body = (
        <div className="details-progress error">
          <h2>我们很抱歉,好像有个错误:</h2>
          {error.split('\n').map(i => {
            return <p className="error-message">{i}</p>;
          })}
          <p>如果此错误无效，请在我们的GitHub上提交报告.</p>
          <a className="btn btn-action" onClick={this.handleErrorClick}>文件票证(File Ticket)</a>
        </div>
      );
    } else if (this.props.container && this.props.container.State.Downloading) {
      if (this.props.container.Progress) {
        let values = [];
        let sum = 0.0;

        for (let i = 0; i < this.props.container.Progress.amount; i++) {
          values.push(Math.round(this.props.container.Progress.progress[i].value));
          sum += this.props.container.Progress.progress[i].value;
        }

        sum = sum / this.props.container.Progress.amount;
        if (isNaN(sum)) {
          sum = 0;
        }

        let total = (Math.round(sum * 100) / 100).toFixed(2);

        body = (
          <div className="details-progress">
            <h2>{total >= 100 ? '正在创建容器' : '正在下载镜像'}</h2>
            <h2>{total}%</h2>
            <div className="container-progress-wrapper">
              <ContainerProgress pBar1={values[0]} pBar2={values[1]} pBar3={values[2]} pBar4={values[3]}/>
            </div>
          </div>
        );

      } else if (this.props.container.State.Waiting) {
        body = (
          <div className="details-progress">
            <h2>正在等待另一个下载</h2>
            <div className="spinner la-ball-clip-rotate la-lg la-dark"><div></div></div>
          </div>
        );
      } else {
        body = (
          <div className="details-progress">
            <h2>连接到Docker Hub</h2>
            <div className="spinner la-ball-clip-rotate la-lg la-dark"><div></div></div>
          </div>
        );
      }
    } else {
      var logWidget = (
        <ContainerHomeLogs container={this.props.container}/>
      );
      var webWidget;
      if (this.showWeb()) {
        webWidget = (
          <ContainerHomePreview ports={this.props.ports} defaultPort={this.props.defaultPort} />
        );
      }
      var folderWidget;
      if (this.showFolders()) {
        folderWidget = (
          <ContainerHomeFolders container={this.props.container} />
        );
      }
      if (logWidget && !webWidget && !folderWidget) {
        body = (
          <div className="details-panel home">
            <div className="content">
              <div className="full">
                {logWidget}
              </div>
            </div>
          </div>
        );
      } else {
        body = (
          <div className="details-panel home">
            <div className="content">
              <div className="left">
                {logWidget}
              </div>
              <div className="right">
                {webWidget}
                {folderWidget}
              </div>
            </div>
          </div>
        );
      }
    }
    return body;
  }
});

module.exports = ContainerHome;
