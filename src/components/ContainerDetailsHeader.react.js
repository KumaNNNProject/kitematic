import React from 'react/addons';

var ContainerDetailsHeader = React.createClass({
  render: function () {
    var state;
    if (!this.props.container) {
      return false;
    }

    if (this.props.container.State.Updating) {
      state = <span className="status downloading">更新中</span>;
    } else if (this.props.container.State.Stopping) {
      state = <span className="status running">停止中</span>;
    } else if (this.props.container.State.Paused) {
      state = <span className="status paused">已暂停</span>;
    } else if (this.props.container.State.Restarting) {
      state = <span className="status restarting">重启中</span>;
    } else if (this.props.container.State.Running && !this.props.container.State.ExitCode) {
      state = <span className="status running">运行中</span>;
    } else if (this.props.container.State.Starting) {
      state = <span className="status running">启动中</span>;
    } else if (this.props.container.State.Downloading) {
      state = <span className="status downloading">下载中</span>;
    } else {
      state = <span className="status stopped">已停止</span>;
    }
    return (
      <div className="header-section">
        <div className="text">
          {this.props.container.Name}{state}
        </div>
      </div>
    );
  }
});

module.exports = ContainerDetailsHeader;
