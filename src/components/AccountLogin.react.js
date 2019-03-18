import _ from 'underscore';
import React from 'react/addons';
import Router from 'react-router';
import validator from 'validator';
import accountActions from '../actions/AccountActions';
import metrics from '../utils/MetricsUtil';
import {shell} from 'electron';

module.exports = React.createClass({
  mixins: [Router.Navigation, React.addons.LinkedStateMixin],

  getInitialState: function () {
    return {
      username: '',
      password: '',
      errors: {}
    };
  },

  componentDidMount: function () {
    React.findDOMNode(this.refs.usernameInput).focus();
  },

  componentWillReceiveProps: function (nextProps) {
    this.setState({errors: nextProps.errors});
  },

  validate: function () {
    let errors = {};

    if (validator.isEmail(this.state.username)) {
      errors.username = '必须是有效的用户名(不是电子邮件)';
    } else if (!validator.isLowercase(this.state.username) || !validator.isAlphanumeric(this.state.username) || !validator.isLength(this.state.username, 4, 30)) {
      errors.username = '必须是4-30个小写字母或数字';
    }

    if (!validator.isLength(this.state.password, 5)) {
      errors.password = '必须至少有5个字符长';
    }

    return errors;
  },

  handleBlur: function () {
    this.setState({errors: _.omit(this.validate(), (val, key) => !this.state[key].length)});
  },

  handleLogin: function () {
    let errors = this.validate();
    this.setState({errors});

    if (_.isEmpty(errors)) {
      accountActions.login(this.state.username, this.state.password);
      metrics.track('Clicked Log In');
    }
  },

  handleClickSignup: function () {
    if (!this.props.loading) {
      this.replaceWith('signup');
      metrics.track('Switched to Sign Up');
    }
  },

  handleClickForgotPassword: function () {
    shell.openExternal('https://hub.docker.com/reset-password/');
  },

  render: function () {
    let loading = this.props.loading ? <div className="spinner la-ball-clip-rotate la-dark"><div></div></div> : null;
    return (
      <form className="form-connect">
        <input ref="usernameInput"maxLength="30" name="username" placeholder="用户名" type="text" disabled={this.props.loading} valueLink={this.linkState('username')} onBlur={this.handleBlur}/>
        <p className="error-message">{this.state.errors.username}</p>
        <input ref="passwordInput" name="password" placeholder="密码" type="password" disabled={this.props.loading} valueLink={this.linkState('password')} onBlur={this.handleBlur}/>
        <p className="error-message">{this.state.errors.password}</p>
        <a className="link" onClick={this.handleClickForgotPassword}>忘记你的密码了吗?</a>
        <p className="error-message">{this.state.errors.detail}</p>
        <div className="submit">
          {loading}
          <button className="btn btn-action" disabled={this.props.loading} onClick={this.handleLogin} type="submit">登录</button>
        </div>
        <br/>
        <div className="extra">还没有一个帐户了吗?<a disabled={this.state.loading} onClick={this.handleClickSignup}>注册</a></div>
      </form>
    );
  }
});
