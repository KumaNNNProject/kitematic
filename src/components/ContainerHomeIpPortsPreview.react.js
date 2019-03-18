import _ from 'underscore';
import React from 'react/addons';

var ContainerHomeIpPortsPreview = React.createClass({
  handleClickPortSettings: function () {
    this.props.handleClickPortSettings();
  },

  render: function () {
    var ports = _.map(_.pairs(this.props.ports), pair => {
      var key = pair[0];
      var val = pair[1];
      return (
          <tr key={key}>
            <td>{key + '/' + val.portType}</td>
            <td>{val.url}</td>
          </tr>
      );
    });

    return (
      <div className="web-preview wrapper">
        <div className="widget">
          <div className="top-bar">
            <div className="text">IP & 端口</div>
            <div className="action" onClick={this.handleClickPortSettings}>
              <span className="icon icon-preferences"></span>
            </div>
          </div>
          <p>您可以访问这个容器使用下面的IP地址和端口:</p>
          <table className="table">
            <thead>
              <tr>
                <th>DOCKER 端口</th>
                <th>访问 URL</th>
              </tr>
            </thead>
            <tbody>
              {ports}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
});

module.exports = ContainerHomeIpPortsPreview;
