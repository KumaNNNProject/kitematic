import _ from 'underscore';
import React from 'react/addons';
import Router from 'react-router';
import validator from 'validator';
import accountActions from '../actions/AccountActions';
import metrics from '../utils/MetricsUtil';

module.exports = React.createClass({
  mixins: [Router.Navigation, React.addons.LinkedStateMixin],

  getInitialState: function () {
    return {
      username: '',
      password: '',
      email: '',
      subscribe: true,
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
    if (!validator.isLowercase(this.state.username) || !validator.isAlphanumeric(this.state.username) || !validator.isLength(this.state.username, 4, 30)) {
      errors.username = '必须是4-30个小写字母或数字';
    }

    if (!validator.isLength(this.state.password, 5)) {
      errors.password = '必须至少有5个字符长';
    }

    if (!validator.isEmail(this.state.email)) {
      errors.email = '必须是有效的电子邮件地址';
    }
    return errors;
  },

  handleBlur: function () {
    this.setState({errors: _.omit(this.validate(), (val, key) => !this.state[key].length)});
  },

  handleSignUp: function () {
    let errors = this.validate();
    this.setState({errors});

    if (_.isEmpty(errors)) {
      accountActions.signup(this.state.username, this.state.password, this.state.email, this.state.subscribe);
      metrics.track('Clicked Sign Up');
    }
  },

  handleClickLogin: function () {
    if (!this.props.loading) {
      this.replaceWith('login');
      metrics.track('Switched to Log In');
    }
  },

  render: function () {
    let loading = this.props.loading ? <div className="spinner la-ball-clip-rotate la-dark"><div></div></div> : null;
    return (
      <form className="form-connect" onSubmit={this.handleSignUp}>
        <input ref="usernameInput" maxLength="30" name="username" placeholder="用户名" type="text" disabled={this.props.loading} valueLink={this.linkState('username')} onBlur={this.handleBlur}/>
        <p className="error-message">{this.state.errors.username}</p>
        <input ref="emailInput" name="email" placeholder="邮箱" type="text" valueLink={this.linkState('email')} disabled={this.props.loading} onBlur={this.handleBlur}/>
        <p className="error-message">{this.state.errors.email}</p>
        <input ref="passwordInput" name="password" placeholder="密码" type="password" valueLink={this.linkState('password')} disabled={this.props.loading} onBlur={this.handleBlur}/>
        <p className="error-message">{this.state.errors.password}</p>
        <div className="checkbox">
        <label>
          <input type="checkbox" disabled={this.props.loading} checkedLink={this.linkState('subscribe')}/> 订阅Docker通讯.
        </label>
        </div>
        <p className="error-message">{this.state.errors.detail}</p>
        <div className="submit">
          {loading}
          <button className="btn btn-action" disabled={this.props.loading} type="submit">注册</button>
        </div>
        <br/>
        <div className="extra">已经有账户了? <a disabled={this.state.loading} onClick={this.handleClickLogin}>登录</a></div>
      </form>
    );
  }
});
